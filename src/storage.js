/**
 * ArcStorage — High-Durability 4-Tier Transactional Storage Engine
 * Tier 1: Synchronous In-Memory Map (0ms read/write latency for UI)
 * Tier 2: Native browser localStorage mirror
 * Tier 3: Transactional IndexedDB (ArcTrackerDB -> kv_store)
 * Tier 4: Tauri Plugin Store (arc_tracker_store.bin) + Rust Atomic Snapshot (arc_state_snapshot.json)
 */

const DB_NAME = "ArcTrackerDB";
const DB_VERSION = 2;
const STORE_NAME = "kv_store";
const TAURI_STORE_FILE = "arc_tracker_store.bin";
const WRITE_SEQ_KEY = "__arc_write_seq";

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

  async init() {
    if (this.isInitialized) return;

    // 1. Seed from native localStorage first (synchronous baseline)
    if (this.nativeLocalStorage) {
      try {
        for (let i = 0; i < this.nativeLocalStorage.length; i++) {
          const k = this.nativeLocalStorage.key(i);
          if (k) {
            const v = this.nativeLocalStorage.getItem(k);
            if (v !== null) this.memCache.set(k, v);
          }
        }
      } catch (e) {
        console.warn("[ArcStorage] localStorage seed warning:", e);
      }
    }

    // 2. Open IndexedDB and reconcile newer keys
    try {
      this.idb = await this._openIndexedDB();
      const idbEntries = await this._readAllIndexedDB();
      this._reconcileIncomingMap(idbEntries, "IndexedDB");
    } catch (e) {
      console.warn("[ArcStorage] IndexedDB init warning:", e);
    }

    // 3. Connect Tauri Plugin Store + Rust Atomic Snapshot if running in Tauri
    if (typeof window !== "undefined" && window.__TAURI_INTERNALS__) {
      try {
        const { load } = await import("@tauri-apps/plugin-store");
        this.tauriStore = await load(TAURI_STORE_FILE, { autoSave: false });
        const entries = await this.tauriStore.entries();
        if (Array.isArray(entries) && entries.length > 0) {
          const tauriMap = new Map();
          for (const [k, v] of entries) {
            tauriMap.set(k, typeof v === "string" ? v : JSON.stringify(v));
          }
          this._reconcileIncomingMap(tauriMap, "TauriStore");
        }
      } catch (e) {
        console.warn("[ArcStorage] Tauri Plugin Store warning:", e);
      }

      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const snapshotRaw = await invoke("load_atomic_snapshot");
        if (snapshotRaw) {
          const parsed = JSON.parse(snapshotRaw);
          if (parsed && typeof parsed === "object") {
            const snapMap = new Map(Object.entries(parsed));
            this._reconcileIncomingMap(snapMap, "RustAtomicSnapshot");
          }
        }
      } catch (e) {
        console.warn("[ArcStorage] Rust atomic snapshot load warning:", e);
      }

      // Listen for Rust OS exit / window close event to force immediate atomic flush
      try {
        const { listen } = await import("@tauri-apps/api/event");
        await listen("arc://flush-before-exit", () => {
          this.flushNow();
        });
      } catch (_) {}
    }

    // 4. Mirror reconciled state back to native localStorage so direct localStorage.getItem() callers see identical state
    this._syncMemoryToLocalStorage();

    // 5. Bind lifecycle durability hooks
    if (typeof window !== "undefined") {
      window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") this.flushNow();
      });
      window.addEventListener("pagehide", () => this.flushNow());
      window.addEventListener("beforeunload", () => this.flushNow());
    }

    this.isInitialized = true;
  }

  _reconcileIncomingMap(incomingMap, sourceName) {
    if (!incomingMap || incomingMap.size === 0) return;
    const currentSeq = parseInt(this.memCache.get(WRITE_SEQ_KEY) || "0", 10);
    const incomingSeq = parseInt(incomingMap.get(WRITE_SEQ_KEY) || "0", 10);

    // If incoming store has a higher sequence or memCache is missing core state, adopt incoming keys
    const shouldOverwrite = incomingSeq >= currentSeq || !this.memCache.has("arc_tracker_state");
    for (const [k, v] of incomingMap.entries()) {
      if (v === null || v === undefined) continue;
      const strVal = typeof v === "string" ? v : JSON.stringify(v);
      if (shouldOverwrite || !this.memCache.has(k)) {
        this.memCache.set(k, strVal);
      }
    }
    console.log(`[ArcStorage] Reconciled ${incomingMap.size} keys from ${sourceName} (seq ${incomingSeq}).`);
  }

  _syncMemoryToLocalStorage() {
    if (!this.nativeLocalStorage) return;
    for (const [k, v] of this.memCache.entries()) {
      try {
        this.nativeLocalStorage.setItem(k, v);
      } catch (_) {}
    }
  }

  _bumpSeq() {
    const nextSeq = (parseInt(this.memCache.get(WRITE_SEQ_KEY) || "0", 10) || 0) + 1;
    const seqStr = String(nextSeq);
    this.memCache.set(WRITE_SEQ_KEY, seqStr);
    this.dirtyKeys.add(WRITE_SEQ_KEY);
    if (this.nativeLocalStorage) {
      try { this.nativeLocalStorage.setItem(WRITE_SEQ_KEY, seqStr); } catch (_) {}
    }
  }

  getItem(key) {
    if (this.memCache.has(key)) {
      return this.memCache.get(key);
    }
    if (this.nativeLocalStorage) {
      try {
        const val = this.nativeLocalStorage.getItem(key);
        if (val !== null) {
          this.memCache.set(key, val);
          return val;
        }
      } catch (_) {}
    }
    return null;
  }

  setItem(key, value) {
    const strVal = typeof value === "string" ? value : JSON.stringify(value);
    this.memCache.set(key, strVal);
    this.dirtyKeys.add(key);
    this._bumpSeq();

    if (this.nativeLocalStorage) {
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
    this.memCache.delete(key);
    this.dirtyKeys.add(key);
    this._bumpSeq();
    if (this.nativeLocalStorage) {
      try { this.nativeLocalStorage.removeItem(key); } catch (_) {}
    }
    this._scheduleFlush();
  }

  clear() {
    this.memCache.clear();
    this.dirtyKeys.clear();
    if (this.nativeLocalStorage) {
      try { this.nativeLocalStorage.clear(); } catch (_) {}
    }
    this.flushNow(true);
  }

  _scheduleFlush() {
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(() => {
      this.flushNow();
    }, 200);
  }

  async flushNow(isClear = false) {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    // Ensure latest global window.state is serialized into memCache before flushing
    if (!isClear && typeof window !== "undefined" && window.state && window.state.habits) {
      try {
        const serializedState = JSON.stringify(window.state);
        this.memCache.set("arc_tracker_state", serializedState);
        this.dirtyKeys.add("arc_tracker_state");
        if (this.nativeLocalStorage) {
          this.nativeLocalStorage.setItem("arc_tracker_state", serializedState);
        }
      } catch (_) {}
    }

    const keysToFlush = Array.from(this.dirtyKeys);
    this.dirtyKeys.clear();

    // 1. Flush to IndexedDB transactionally
    if (this.idb) {
      try {
        const tx = this.idb.transaction([STORE_NAME], "readwrite");
        const store = tx.objectStore(STORE_NAME);
        if (isClear) {
          store.clear();
        } else {
          for (const k of keysToFlush) {
            if (this.memCache.has(k)) {
              store.put(this.memCache.get(k), k);
            } else {
              store.delete(k);
            }
          }
        }
      } catch (e) {
        console.warn("[ArcStorage] IndexedDB flush warning:", e);
      }
    }

    // 2. Flush to Tauri Plugin Store & Rust Atomic Snapshot
    if (typeof window !== "undefined" && window.__TAURI_INTERNALS__) {
      if (this.tauriStore) {
        try {
          if (isClear) {
            await this.tauriStore.clear();
          } else {
            for (const k of keysToFlush) {
              if (this.memCache.has(k)) {
                await this.tauriStore.set(k, this.memCache.get(k));
              } else {
                await this.tauriStore.delete(k);
              }
            }
          }
          await this.tauriStore.save();
        } catch (e) {
          console.warn("[ArcStorage] TauriStore save warning:", e);
        }
      }

      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const fullObject = Object.fromEntries(this.memCache.entries());
        await invoke("atomic_flush_state", {
          payloadJson: JSON.stringify(fullObject)
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
