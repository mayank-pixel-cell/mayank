/**
 * ArcStorage — High-Durability 4-Tier Transactional Multi-User Storage Engine
 * Tier 1: Synchronous In-Memory Map (0ms read/write latency for UI)
 * Tier 2: Native browser localStorage mirror (partition-swapped per operative)
 * Tier 3: Transactional IndexedDB (ArcTrackerDB -> kv_store)
 * Tier 4: Tauri Plugin Store (arc_tracker_store.bin) + Rust Atomic Snapshot (arc_state_snapshot_${userId}.json)
 */

const DB_NAME = "ArcTrackerDB";
const DB_VERSION = 2;
const STORE_NAME = "kv_store";
const TAURI_STORE_FILE = "arc_tracker_store.bin";
const WRITE_SEQ_KEY = "__arc_write_seq";

const GLOBAL_SHARED_KEYS = new Set([
  "__arc_users_registry_v1",
  "__arc_active_user_id",
  "__arc_show_picker_on_launch",
  "__arc_multiuser_migrated_v1",
  "arc_gold_membership",
  "arc_gold_applied_promo",
  "arc_hardware_profile"
]);

class ArcDurableStorage {
  constructor() {
    this.memCache = new Map();
    this.idb = null;
    this.tauriStore = null;
    this.isInitialized = false;
    this.flushTimer = null;
    this.dirtyKeys = new Set();
    this.nativeLocalStorage = typeof window !== "undefined" ? window.localStorage : null;
    if (typeof window !== "undefined") {
      window.__nativeLocalStorage = this.nativeLocalStorage;
    }
  }

  getActiveUserId() {
    if (this.memCache.has("__arc_active_user_id")) {
      return this.memCache.get("__arc_active_user_id") || "usr_primary";
    }
    if (this.nativeLocalStorage) {
      try {
        return this.nativeLocalStorage.getItem("__arc_active_user_id") || "usr_primary";
      } catch (_) {}
    }
    return "usr_primary";
  }

  _scopedKey(key, userId = null) {
    if (!key || GLOBAL_SHARED_KEYS.has(key) || key.startsWith("u:")) {
      return key;
    }
    const uid = userId || this.getActiveUserId();
    return `u:${uid}:${key}`;
  }

  async init() {
    if (this.isInitialized) return;

    // 1. Open IndexedDB and read all persisted keys
    try {
      this.idb = await this._openIndexedDB();
      const idbEntries = await this._readAllIndexedDB();
      for (const [k, v] of idbEntries.entries()) {
        if (v !== null && v !== undefined) {
          this.memCache.set(k, typeof v === "string" ? v : JSON.stringify(v));
        }
      }
    } catch (e) {
      console.warn("[ArcStorage] IndexedDB init warning:", e);
    }

    // 2. Load Tauri Plugin Store if available
    if (typeof window !== "undefined" && window.__TAURI_INTERNALS__) {
      try {
        const { load } = await import("@tauri-apps/plugin-store");
        this.tauriStore = await load(TAURI_STORE_FILE, { autoSave: false });
        const entries = await this.tauriStore.entries();
        if (Array.isArray(entries)) {
          for (const [k, v] of entries) {
            if (v !== null && v !== undefined) {
              this.memCache.set(k, typeof v === "string" ? v : JSON.stringify(v));
            }
          }
        }
      } catch (e) {
        console.warn("[ArcStorage] TauriStore warning:", e);
      }
    }

    // 3. Perform one-time migration of legacy single-user localStorage into u:usr_primary:*
    this._migrateLegacySingleUserIfNeeded();

    // 4. Load Rust atomic snapshot for active user if available
    const activeUid = this.getActiveUserId();
    if (typeof window !== "undefined" && window.__TAURI_INTERNALS__) {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const snapshotRaw = await invoke("load_atomic_snapshot", { userId: activeUid });
        if (snapshotRaw) {
          const parsed = JSON.parse(snapshotRaw);
          if (parsed && typeof parsed === "object") {
            for (const [k, v] of Object.entries(parsed)) {
              if (v !== null && v !== undefined) {
                this.memCache.set(k, typeof v === "string" ? v : JSON.stringify(v));
              }
            }
          }
        }
      } catch (e) {
        console.warn("[ArcStorage] Rust atomic snapshot load warning:", e);
      }

      try {
        const { listen } = await import("@tauri-apps/api/event");
        await listen("arc://flush-before-exit", () => {
          this.flushNow();
        });
      } catch (_) {}
    }

    // 5. Hydrate active user's partition into native localStorage
    this._hydrateActiveUserToLocalStorage(activeUid);

    if (typeof window !== "undefined") {
      window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") this.flushNow();
      });
      window.addEventListener("pagehide", () => this.flushNow());
      window.addEventListener("beforeunload", () => this.flushNow());
    }

    this.isInitialized = true;
  }

  _migrateLegacySingleUserIfNeeded() {
    if (!this.nativeLocalStorage) return;
    const alreadyMigrated =
      this.memCache.get("__arc_multiuser_migrated_v1") === "true" ||
      this.nativeLocalStorage.getItem("__arc_multiuser_migrated_v1") === "true";

    if (alreadyMigrated) return;

    const uid = "usr_primary";
    for (let i = 0; i < this.nativeLocalStorage.length; i++) {
      const k = this.nativeLocalStorage.key(i);
      if (!k) continue;
      const v = this.nativeLocalStorage.getItem(k);
      if (v === null) continue;
      if (GLOBAL_SHARED_KEYS.has(k) || k.startsWith("u:")) {
        this.memCache.set(k, v);
        this.dirtyKeys.add(k);
      } else {
        const scoped = `u:${uid}:${k}`;
        if (!this.memCache.has(scoped)) {
          this.memCache.set(scoped, v);
          this.dirtyKeys.add(scoped);
        }
      }
    }

    // Also migrate any unprefixed keys already in memCache from IndexedDB/TauriStore
    for (const [k, v] of Array.from(this.memCache.entries())) {
      if (!GLOBAL_SHARED_KEYS.has(k) && !k.startsWith("u:")) {
        const scoped = `u:${uid}:${k}`;
        if (!this.memCache.has(scoped)) {
          this.memCache.set(scoped, v);
          this.dirtyKeys.add(scoped);
        }
      }
    }

    this.memCache.set("__arc_active_user_id", uid);
    this.memCache.set("__arc_multiuser_migrated_v1", "true");
    this.dirtyKeys.add("__arc_active_user_id");
    this.dirtyKeys.add("__arc_multiuser_migrated_v1");
    try {
      this.nativeLocalStorage.setItem("__arc_active_user_id", uid);
      this.nativeLocalStorage.setItem("__arc_multiuser_migrated_v1", "true");
    } catch (_) {}
  }

  /**
   * Captures all current unprefixed keys in native localStorage into the specified user's
   * scoped partition (`u:${userId}:${key}`).
   */
  captureLocalStorageToUser(userId) {
    if (!this.nativeLocalStorage || !userId) return;
    for (let i = 0; i < this.nativeLocalStorage.length; i++) {
      const k = this.nativeLocalStorage.key(i);
      if (!k || GLOBAL_SHARED_KEYS.has(k) || k.startsWith("u:")) continue;
      const val = this.nativeLocalStorage.getItem(k);
      if (val !== null) {
        const scoped = `u:${userId}:${k}`;
        this.memCache.set(scoped, val);
        this.dirtyKeys.add(scoped);
      }
    }
  }

  /**
   * Clears unprefixed user keys from native localStorage and populates them from `u:${userId}:*`.
   */
  _hydrateActiveUserToLocalStorage(userId) {
    if (!this.nativeLocalStorage || !userId) return;
    const keysToRemove = [];
    for (let i = 0; i < this.nativeLocalStorage.length; i++) {
      const k = this.nativeLocalStorage.key(i);
      if (k && !GLOBAL_SHARED_KEYS.has(k) && !k.startsWith("u:")) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => {
      try {
        this.nativeLocalStorage.removeItem(k);
      } catch (_) {}
    });

    const prefix = `u:${userId}:`;
    for (const [k, v] of this.memCache.entries()) {
      if (k.startsWith(prefix)) {
        const unprefixed = k.slice(prefix.length);
        try {
          this.nativeLocalStorage.setItem(unprefixed, v);
        } catch (_) {}
      } else if (GLOBAL_SHARED_KEYS.has(k)) {
        try {
          this.nativeLocalStorage.setItem(k, v);
        } catch (_) {}
      }
    }
  }

  /**
   * Atomically flushes current user's state, switches active user partition, and reloads state.
   */
  async switchUserPartition(targetUserId) {
    const currentUid = this.getActiveUserId();
    this.captureLocalStorageToUser(currentUid);
    await this.flushNow();

    this.memCache.set("__arc_active_user_id", targetUserId);
    this.dirtyKeys.add("__arc_active_user_id");
    if (this.nativeLocalStorage) {
      try {
        this.nativeLocalStorage.setItem("__arc_active_user_id", targetUserId);
      } catch (_) {}
    }

    this._hydrateActiveUserToLocalStorage(targetUserId);
    await this.flushNow();
  }

  /**
   * Deletes all scoped keys belonging to a specific userId.
   */
  async purgeUserPartition(targetUserId) {
    const prefix = `u:${targetUserId}:`;
    for (const k of Array.from(this.memCache.keys())) {
      if (k.startsWith(prefix)) {
        this.memCache.delete(k);
        this.dirtyKeys.add(k);
      }
    }
    await this.flushNow();
  }

  _bumpSeq() {
    const scopedSeqKey = this._scopedKey(WRITE_SEQ_KEY);
    const nextSeq = (parseInt(this.memCache.get(scopedSeqKey) || "0", 10) || 0) + 1;
    const seqStr = String(nextSeq);
    this.memCache.set(scopedSeqKey, seqStr);
    this.dirtyKeys.add(scopedSeqKey);
    if (this.nativeLocalStorage) {
      try {
        this.nativeLocalStorage.setItem(WRITE_SEQ_KEY, seqStr);
      } catch (_) {}
    }
  }

  getItem(key) {
    const scoped = this._scopedKey(key);
    if (this.memCache.has(scoped)) {
      return this.memCache.get(scoped);
    }
    if (this.nativeLocalStorage && !key.startsWith("u:")) {
      try {
        const val = this.nativeLocalStorage.getItem(key);
        if (val !== null) {
          this.memCache.set(scoped, val);
          return val;
        }
      } catch (_) {}
    }
    return null;
  }

  setItem(key, value) {
    const strVal = typeof value === "string" ? value : JSON.stringify(value);
    const scoped = this._scopedKey(key);
    this.memCache.set(scoped, strVal);
    this.dirtyKeys.add(scoped);
    this._bumpSeq();

    if (this.nativeLocalStorage && !key.startsWith("u:")) {
      try {
        this.nativeLocalStorage.setItem(key, strVal);
      } catch (e) {
        try {
          this.nativeLocalStorage.removeItem("pp12_revisions");
          this.nativeLocalStorage.setItem(key, strVal);
        } catch (_) {}
      }
    }

    this._scheduleFlush();
  }

  removeItem(key) {
    const scoped = this._scopedKey(key);
    this.memCache.delete(scoped);
    this.dirtyKeys.add(scoped);
    this._bumpSeq();
    if (this.nativeLocalStorage && !key.startsWith("u:")) {
      try {
        this.nativeLocalStorage.removeItem(key);
      } catch (_) {}
    }
    this._scheduleFlush();
  }

  clear() {
    const uid = this.getActiveUserId();
    const prefix = `u:${uid}:`;
    for (const k of Array.from(this.memCache.keys())) {
      if (k.startsWith(prefix)) {
        this.memCache.delete(k);
        this.dirtyKeys.add(k);
      }
    }
    if (this.nativeLocalStorage) {
      const toRemove = [];
      for (let i = 0; i < this.nativeLocalStorage.length; i++) {
        const k = this.nativeLocalStorage.key(i);
        if (k && !GLOBAL_SHARED_KEYS.has(k)) toRemove.push(k);
      }
      toRemove.forEach((k) => this.nativeLocalStorage.removeItem(k));
    }
    this.flushNow();
  }

  _scheduleFlush() {
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(() => {
      this.flushNow();
    }, 200);
  }

  async flushNow() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    const activeUid = this.getActiveUserId();
    this.captureLocalStorageToUser(activeUid);

    if (typeof window !== "undefined" && window.state && window.state.habits) {
      try {
        const serializedState = JSON.stringify(window.state);
        const scopedStateKey = this._scopedKey("arc_tracker_state", activeUid);
        this.memCache.set(scopedStateKey, serializedState);
        this.dirtyKeys.add(scopedStateKey);
        if (this.nativeLocalStorage) {
          this.nativeLocalStorage.setItem("arc_tracker_state", serializedState);
        }
      } catch (_) {}
    }

    const keysToFlush = Array.from(this.dirtyKeys);
    this.dirtyKeys.clear();

    if (this.idb && keysToFlush.length > 0) {
      try {
        const tx = this.idb.transaction([STORE_NAME], "readwrite");
        const store = tx.objectStore(STORE_NAME);
        for (const k of keysToFlush) {
          if (this.memCache.has(k)) {
            store.put(this.memCache.get(k), k);
          } else {
            store.delete(k);
          }
        }
      } catch (e) {
        console.warn("[ArcStorage] IndexedDB flush warning:", e);
      }
    }

    if (typeof window !== "undefined" && window.__TAURI_INTERNALS__) {
      if (this.tauriStore && keysToFlush.length > 0) {
        try {
          for (const k of keysToFlush) {
            if (this.memCache.has(k)) {
              await this.tauriStore.set(k, this.memCache.get(k));
            } else {
              await this.tauriStore.delete(k);
            }
          }
          await this.tauriStore.save();
        } catch (e) {
          console.warn("[ArcStorage] TauriStore save warning:", e);
        }
      }

      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const userPrefix = `u:${activeUid}:`;
        const userSnapshot = {};
        for (const [k, v] of this.memCache.entries()) {
          if (k.startsWith(userPrefix) || GLOBAL_SHARED_KEYS.has(k)) {
            userSnapshot[k] = v;
          }
        }
        await invoke("atomic_flush_state", {
          payloadJson: JSON.stringify(userSnapshot),
          userId: activeUid
        });
      } catch (e) {
        console.warn("[ArcStorage] Rust atomic_flush_state warning:", e);
      }
    }
  }

  _openIndexedDB() {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") return resolve(null);
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  _readAllIndexedDB() {
    return new Promise((resolve) => {
      if (!this.idb) return resolve(new Map());
      try {
        const tx = this.idb.transaction([STORE_NAME], "readonly");
        const store = tx.objectStore(STORE_NAME);
        const map = new Map();
        const cursorReq = store.openCursor();
        cursorReq.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            map.set(String(cursor.key), cursor.value);
            cursor.continue();
          } else {
            resolve(map);
          }
        };
        cursorReq.onerror = () => resolve(map);
      } catch (_) {
        resolve(new Map());
      }
    });
  }
}

const arcStorage = new ArcDurableStorage();
if (typeof window !== "undefined") {
  window.ArcStorage = arcStorage;
  window.arcStorage = arcStorage;
}
export { arcStorage, ArcDurableStorage };
export default arcStorage;
