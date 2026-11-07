import { supabase } from "./supabaseClient.js";

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
  "arc_hardware_profile",
  "arc_unique_user_id",
  "arc_user_id",
  "arc_device_id"
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

    // 6. Ensure persistent unique user ID exists
    try {
      getOrCreateUserId();
    } catch (_) {}

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

    // Trigger debounced auto-sync to Supabase when screentime or tracker state is saved
    if (
      key &&
      (key.includes("screentime") ||
       key.includes("tracker_state") ||
       key === "arc_tracker_state" ||
       key.startsWith("arc_screentime"))
    ) {
      if (typeof scheduleAutoSync === "function") {
        scheduleAutoSync();
      }
    }
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

  getOrCreateUserId() {
    return getOrCreateUserId();
  }

  getCurrentStats() {
    return getCurrentStats();
  }

  scheduleAutoSync(delayMs) {
    return scheduleAutoSync(delayMs);
  }

  triggerStartupSync() {
    return triggerStartupSync();
  }
}

/**
 * Resolves or auto-generates a persistent unique device/user identifier.
 * Checks if a unique user identifier or profile name exists in local storage.
 * If not, generates a persistent unique ID (e.g., 'user_' + crypto.randomUUID())
 * and saves it locally so every installation is counted as 1 unique user.
 *
 * @returns {string} The persistent unique user ID
 */
export function getOrCreateUserId() {
  const storage = typeof window !== "undefined" && window.localStorage
    ? window.localStorage
    : (typeof localStorage !== "undefined" ? localStorage : null);

  if (!storage) {
    let fallbackUuid;
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      fallbackUuid = crypto.randomUUID();
    } else if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      fallbackUuid = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    } else {
      fallbackUuid = Date.now().toString(36) + "0000";
    }
    return `user_${fallbackUuid}`;
  }

  try {
    // 1. Check if unique user ID already exists in local storage
    const storedId = storage.getItem("arc_unique_user_id") || storage.getItem("arc_user_id");
    if (storedId && storedId.trim()) {
      return storedId.trim();
    }

    // 2. Check if a profile exists with a customized email, username, or profile name
    const rawProfile = storage.getItem("arc_user_profile");
    if (rawProfile) {
      try {
        const prof = JSON.parse(rawProfile);
        if (prof.email && typeof prof.email === "string" && prof.email.trim() && prof.email !== "operative@winterarc.local") {
          const cleanEmail = prof.email.trim();
          storage.setItem("arc_unique_user_id", cleanEmail);
          storage.setItem("arc_user_id", cleanEmail);
          return cleanEmail;
        }
        const profileName = prof.username || prof.displayName || prof.name || prof.user;
        if (profileName && typeof profileName === "string" && profileName.trim() && !["Operative", "operative"].includes(profileName.trim())) {
          const sanitized = profileName.trim().replace(/^@+/, "").replace(/[^a-zA-Z0-9_.-]/g, "_");
          const candidateId = `user_${sanitized}`;
          storage.setItem("arc_unique_user_id", candidateId);
          storage.setItem("arc_user_id", candidateId);
          return candidateId;
        }
      } catch (_) {}
    }

    const simpleProfileName = storage.getItem("profile_name") || storage.getItem("arc_profile_name") || storage.getItem("username");
    if (simpleProfileName && typeof simpleProfileName === "string" && simpleProfileName.trim() && !["Operative", "operative"].includes(simpleProfileName.trim())) {
      const sanitized = simpleProfileName.trim().replace(/^@+/, "").replace(/[^a-zA-Z0-9_.-]/g, "_");
      const candidateId = `user_${sanitized}`;
      storage.setItem("arc_unique_user_id", candidateId);
      storage.setItem("arc_user_id", candidateId);
      return candidateId;
    }

    const opUid = storage.getItem("arc_operative_uid");
    if (opUid && typeof opUid === "string" && opUid.trim() && !opUid.startsWith("op_fallback_")) {
      storage.setItem("arc_unique_user_id", opUid.trim());
      storage.setItem("arc_user_id", opUid.trim());
      return opUid.trim();
    }

    // 3. Otherwise generate a persistent unique ID ('user_' + crypto.randomUUID())
    let uuid;
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      uuid = crypto.randomUUID();
    } else if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      const buf = new Uint8Array(16);
      crypto.getRandomValues(buf);
      buf[6] = (buf[6] & 0x0f) | 0x40; // RFC4122 v4
      buf[8] = (buf[8] & 0x3f) | 0x80; // RFC4122 variant
      const hex = Array.from(buf, b => b.toString(16).padStart(2, '0')).join('');
      uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
    } else {
      uuid = "00000000-0000-4000-8000-000000000000";
    }

    const newId = `user_${uuid}`;
    storage.setItem("arc_unique_user_id", newId);
    storage.setItem("arc_user_id", newId);
    return newId;
  } catch (err) {
    console.warn("[ArcStorage] Error resolving unique user ID:", err);
    return `user_${Date.now()}`;
  }
}

/**
 * Captures a consolidated snapshot of the user's current habits, streak,
 * screentime, and device stats for cloud backup.
 *
 * @returns {object} Current user stats
 */
export function getCurrentStats() {
  const stats = {
    updated_at: new Date().toISOString()
  };

  // 1. Tracker state (habits, streak, xp, level, scores)
  if (typeof window !== "undefined" && window.state) {
    stats.state = window.state;
    stats.streak = window.state.streak || 0;
    stats.level = window.state.level || 1;
    stats.xp = window.state.xp || 0;
  } else if (typeof localStorage !== "undefined") {
    try {
      const rawState = localStorage.getItem("arc_tracker_state");
      if (rawState) stats.state = JSON.parse(rawState);
    } catch (_) {}
  }

  // 2. Screen time and cross-device usage stats
  if (typeof window !== "undefined" && window.ArcScreenTime) {
    stats.screenTime = {
      activeSeconds: window.ArcScreenTime.activeSeconds || 0,
      todayKey: window.ArcScreenTime.todayKey || "",
      deviceScreenTime: window.ArcScreenTime.deviceScreenTime || null,
      history: window.ArcScreenTime.history || null,
      platform: window.ArcScreenTime.platform || null
    };
  } else if (typeof localStorage !== "undefined") {
    try {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const activeSecs = localStorage.getItem(`arc_screentime_${today}`);
      const crossDevice = localStorage.getItem("arc_cross_device_screentime");
      const history = localStorage.getItem("arc_screentime_history");
      stats.screenTime = {
        activeSeconds: activeSecs ? Number(activeSecs) : 0,
        todayKey: today,
        deviceScreenTime: crossDevice ? JSON.parse(crossDevice) : null,
        history: history ? JSON.parse(history) : null
      };
    } catch (_) {}
  }

  // 3. User profile snapshot
  if (typeof localStorage !== "undefined") {
    try {
      const rawProf = localStorage.getItem("arc_user_profile");
      if (rawProf) stats.profile = JSON.parse(rawProf);
    } catch (_) {}
  }

  return stats;
}

let syncDebounceTimer = null;
let lastSyncTimestamp = 0;
let syncPendingSince = null;
const MIN_SYNC_INTERVAL_MS = 30000; // Minimum 30s interval between syncs (at most once every 30–60s)
const MAX_WAIT_INTERVAL_MS = 60000; // Maximum wait 60s
const BATCH_DEBOUNCE_MS = 3000;     // 3s batch debounce

/**
 * Schedules an automatic backup sync to Supabase. Debounces rapid saves
 * so it syncs at most once every 30–60 seconds while guaranteeing updates are saved.
 *
 * @param {number} [delayMs=3000]
 */
export function scheduleAutoSync(delayMs = BATCH_DEBOUNCE_MS) {
  const now = Date.now();
  if (!syncPendingSince) {
    syncPendingSince = now;
  }

  if (syncDebounceTimer) {
    clearTimeout(syncDebounceTimer);
    syncDebounceTimer = null;
  }

  const timeSinceLastSync = now - lastSyncTimestamp;
  const timePending = now - syncPendingSince;

  let wait = delayMs;
  if (timeSinceLastSync < MIN_SYNC_INTERVAL_MS) {
    wait = Math.max(wait, MIN_SYNC_INTERVAL_MS - timeSinceLastSync);
  }

  const maxRemaining = Math.max(0, MAX_WAIT_INTERVAL_MS - timePending);
  wait = Math.min(wait, maxRemaining);

  syncDebounceTimer = setTimeout(async () => {
    syncDebounceTimer = null;
    syncPendingSince = null;
    try {
      const userId = getOrCreateUserId();
      const currentStats = getCurrentStats();
      await syncUserData(userId, currentStats);
    } catch (e) {
      console.warn("[ArcStorage] Debounced auto-sync error:", e);
    }
  }, wait);
}

/**
 * Immediately triggers an initial startup sync to register active user and state.
 */
export async function triggerStartupSync() {
  try {
    const userId = getOrCreateUserId();
    const currentStats = getCurrentStats();
    return await syncUserData(userId, currentStats);
  } catch (err) {
    console.warn("[ArcStorage] Startup sync error:", err);
  }
}

/**
 * Upserts user habit and application data into Supabase cloud storage (user_data table).
 * Local storage operations remain completely unaffected and sovereign.
 * Specifies { onConflict: 'email' } so returning users update their existing row instead of making duplicate entries.
 *
 * @param {string} [userEmail]
 * @param {object|any} [appStats]
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */
export async function syncUserData(userEmail, appStats) {
  try {
    const userId = userEmail || getOrCreateUserId();
    const stats = (appStats !== undefined && appStats !== null) ? appStats : getCurrentStats();

    const { data, error } = await supabase
      .from('user_data')
      .upsert({
        email: userId,
        data: stats,
        last_active: new Date().toISOString()
      }, { onConflict: 'email' })
      .select();

    if (error) {
      console.error('[ArcStorage] Error syncing to Supabase:', error.message);
      return { success: false, error };
    }
    lastSyncTimestamp = Date.now();
    return { success: true, data };
  } catch (err) {
    console.error('[ArcStorage] Unexpected sync error:', err);
    return { success: false, error: err };
  }
}

const arcStorage = new ArcDurableStorage();
arcStorage.syncUserData = syncUserData;
arcStorage.getOrCreateUserId = getOrCreateUserId;
arcStorage.getCurrentStats = getCurrentStats;
arcStorage.scheduleAutoSync = scheduleAutoSync;
arcStorage.triggerStartupSync = triggerStartupSync;

if (typeof window !== "undefined") {
  window.ArcStorage = arcStorage;
  window.arcStorage = arcStorage;
  window.syncUserData = syncUserData;
  window.getOrCreateUserId = getOrCreateUserId;
  window.getCurrentStats = getCurrentStats;
  window.scheduleAutoSync = scheduleAutoSync;
  window.triggerStartupSync = triggerStartupSync;

  // Fallback auto-sync on page load if main bootstrap does not trigger
  const onReady = () => {
    setTimeout(() => {
      if (!lastSyncTimestamp) {
        triggerStartupSync();
      }
    }, 1500);
  };
  if (document.readyState === "complete" || document.readyState === "interactive") {
    onReady();
  } else {
    window.addEventListener("DOMContentLoaded", onReady, { once: true });
  }
}

export { arcStorage, ArcDurableStorage };
export default arcStorage;
