# Arc Tracker (`com.arctracker.app`) — Multi-User Architecture & Production Launch Specification

**Target Executor:** Autonomous Coding Agent (Antigravity / Gemini 3.8 Flash)  
**Workspace Root:** `c:\Users\vruti\OneDrive\Desktop\mayank\mayank`  
**Prerequisite Status:** Phases 1–4 Completed (Tailwind PostCSS pipeline active, `index.html` de-monolithized to 46 lines, Rust `os_tracker.rs` and 4-tier `storage.js` implemented).  
**Current Mission (Phases 5–7):** Upgrade Arc Tracker into a **Multi-User Operating System** with strict per-user data isolation and make the application **100% Launch-Ready** across Windows Desktop, Web/PWA, and Mobile.

---

## 0. ARCHITECTURAL INVARIANTS FOR MULTI-USER & LAUNCH READINESS

1. **Zero Data Loss Migration for Existing User (`usr_primary`):**
   On first boot of the Multi-User engine, all existing un-namespaced data in `localStorage`, IndexedDB (`ArcTrackerDB`), and Tauri Store (`arc_tracker_store.bin`) must be automatically migrated into the default primary operative account (`id: "usr_primary"`). Zero habits, streaks, XP, or screen time logs may be lost.
2. **Strict Per-User Partition Isolation:**
   Every user profile (`usr_primary`, `usr_...`) must have $100\%$ isolated state for:
   - Habits, daily check-ins, and streak counters (`arc_tracker_state`)
   - Daily reflections (`whatHappenedText`)
   - Screen time quotas, app usage, and blocklists (`arc_app_usage_*`, `arc_tracked_apps_catalog`, `arc_screentime_history_v2`)
   - Security PIN lock & 2FA secrets (`arc_sec_pin_hash`, `arc_sec_pin_salt`, `arc_sec_2fa_*`)
   - Theme, audio, and accessibility settings (`app_settings`, `arc_black_white_mode`, `arc_liquid_glass_enabled`, `arc_custom_background_v1`)
   - Operative identity and Google Sync (`arc_user_profile`, `arc_google_user`)
3. **Arc Gold Dual-User License Enforcement ($N \le 2$):**
   Unlimited free profiles can be created on a device, while Arc Gold VIP perks (120Hz ProMotion, Focus Strict Mode, Black & White Mode, Liquid Glass UI, Custom Wallpapers) automatically bind to the $\le 2$ authorized user slots (`MAX_AUTHORIZED_USERS = 2`) in `ArcGold`.
4. **Guaranteed Desktop & Web Launchability:**
   The app must launch cleanly via `npm run launch` or `.\launch-arc.ps1` whether running as a compiled Tauri binary or in Native Desktop App Mode (automatically bypassing Windows 11 Smart App Control `os error 4551` and OneDrive file-locking).

---

## PHASE 5: MULTI-USER OPERATIVE ENGINE & ISOLATED STORAGE VAULTS

### 5.1 Architectural Design: Partition-Swapped Scoped Storage

Because the 15 extracted modules in `src/modules/` perform direct calls to `localStorage.getItem(key)` and `ArcStorage.getItem(key)`, rewriting hundreds of call sites is error-prone. Instead, implement **Partition-Swapped Scoped Storage**:

1. **Global Registry Keys (Never Partition-Swapped):**
   - `__arc_users_registry_v1`: JSON array of all registered `OperativeAccount` metadata objects on the device.
   - `__arc_active_user_id`: String ID of the currently active operative (defaults to `"usr_primary"`).
   - `__arc_show_picker_on_launch`: Boolean (`"true"` / `"false"`) controlling whether the "Who's Locking In?" operative selector modal appears on startup when $>1$ user exists.
   - `arc_gold_membership` & `arc_gold_applied_promo`: Device-level VIP license state (which tracks up to $2$ `authorizedUsers` by user ID).
2. **Per-User Scoped Keys (`u:${userId}:${key}`):**
   - Inside `ArcStorage` (IndexedDB `ArcTrackerDB`, Tauri Store `arc_tracker_store.bin`, and Rust `arc_state_snapshot_${userId}.json`), all user-specific keys are stored under the prefix `u:${activeUserId}:${key}`.
   - Inside `window.localStorage`, the active user's keys are mirrored unprefixed while that user is active, and backed up into `u:${userId}:${key}` on every write.
   - When switching from `User A` to `User B`:
     1. All current unprefixed user keys in `localStorage` and `ArcStorage.memCache` are flushed to `u:${UserA}:${key}` and saved to Rust (`atomic_flush_state` with `userId: UserA`).
     2. All unprefixed user keys in `localStorage` are cleared (preserving global registry keys).
     3. All `u:${UserB}:${key}` entries are hydrated into `localStorage` and `ArcStorage.memCache`.
     4. `__arc_active_user_id` is updated to `UserB`, and the app re-initializes cleanly.

### 5.2 File Operations Overview

- **Modify:** `src-tauri/src/lib.rs` (Add `user_id` parameter to `atomic_flush_state` and `load_atomic_snapshot`)
- **Modify:** `src/storage.js` (Add user-partitioned storage and `switchUserPartition(newUserId)`)
- **Create:** `src/components/multiUserModal.js` (UI for "Who's Locking In?" launch screen, Profile Switcher, Add New Operative, and Delete Profile)
- **Create:** `src/modules/multiUserEngine.js` (`window.ArcMultiUser` controller)
- **Modify:** `src/components/headerNav.js` (Add fast "Switch User" badge/button next to `#header-profile-pill`)
- **Modify:** `src/shell.js` & `src/main.js` (Mount `multiUserModal.js` and initialize `ArcMultiUser`)

---

### 5.3 Step-by-Step Implementation Instructions

#### Step 5.3.1: Update `src-tauri/src/lib.rs` for Per-User Atomic Snapshots

Update `snapshot_file_path`, `atomic_flush_state`, and `load_atomic_snapshot` in `c:\Users\vruti\OneDrive\Desktop\mayank\mayank\src-tauri\src\lib.rs` so each user gets an isolated atomic snapshot file (`arc_state_snapshot_${user_id}.json`), while remaining backward-compatible if `user_id` is omitted:

```rust
fn sanitize_user_id(user_id: Option<&str>) -> String {
    let raw = user_id.unwrap_or("usr_primary").trim();
    if raw.is_empty() {
        return "usr_primary".to_string();
    }
    raw.chars()
        .map(|c| if c.is_ascii_alphanumeric() || c == '_' || c == '-' { c } else { '_' })
        .collect()
}

fn snapshot_file_path(app: &AppHandle, user_id: Option<&str>) -> Result<PathBuf, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app_data_dir: {}", e))?;
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir)
            .map_err(|e| format!("Failed to create app_data_dir: {}", e))?;
    }
    let clean_uid = sanitize_user_id(user_id);
    if clean_uid == "usr_primary" {
        // Backward-compatible primary filename
        Ok(app_dir.join("arc_state_snapshot.json"))
    } else {
        Ok(app_dir.join(format!("arc_state_snapshot_{}.json", clean_uid)))
    }
}

#[tauri::command]
pub fn atomic_flush_state(
    app: AppHandle,
    flush_lock: State<'_, AtomicFlushLock>,
    payload_json: String,
    user_id: Option<String>,
) -> Result<bool, String> {
    let _guard = flush_lock
        .0
        .lock()
        .map_err(|_| "AtomicFlushLock poisoned".to_string())?;

    let _: serde_json::Value = serde_json::from_str(&payload_json)
        .map_err(|e| format!("Invalid JSON in atomic_flush_state: {}", e))?;

    let final_path = snapshot_file_path(&app, user_id.as_deref())?;
    let tmp_path = final_path.with_extension("json.tmp");

    fs::write(&tmp_path, payload_json.as_bytes())
        .map_err(|e| format!("Failed to write temp snapshot: {}", e))?;
    fs::rename(&tmp_path, &final_path)
        .map_err(|e| format!("Failed to atomically rename snapshot: {}", e))?;

    Ok(true)
}

#[tauri::command]
pub fn load_atomic_snapshot(
    app: AppHandle,
    user_id: Option<String>,
) -> Result<Option<String>, String> {
    let path = snapshot_file_path(&app, user_id.as_deref())?;
    if !path.exists() {
        return Ok(None);
    }
    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read atomic snapshot: {}", e))?;
    Ok(Some(content))
}
```

#### Step 5.3.2: Upgrade `src/storage.js` for Multi-User Partitioning

Update `c:\Users\vruti\OneDrive\Desktop\mayank\mayank\src\storage.js` so `ArcDurableStorage` namespaces all user keys by `activeUserId` and supports atomic partition switching:

```javascript
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
}
export default arcStorage;
```

---

#### Step 5.3.3: Create `src/components/multiUserModal.js`

Create `c:\Users\vruti\OneDrive\Desktop\mayank\mayank\src\components\multiUserModal.js` to provide the **Multi-Operative Switcher & Launch Screen Modal** (`#arc-multiuser-modal`):

```javascript
export function renderMultiUserModal() {
  return `
    <!-- MULTI-USER OPERATIVE SWITCHER & LAUNCH SELECTOR MODAL -->
    <div id="arc-multiuser-modal" class="pp-modal z-[145]" role="dialog" aria-modal="true" aria-label="Select or Switch Operative Profile" onclick="if(event.target===this)ArcMultiUser.closeSwitcherModal()">
      <div class="pp-box max-w-xl w-full p-5 sm:p-7 rounded-3xl bg-slate-950/98 border-2 border-cyan-500/50 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_40px_rgba(0,240,255,0.2)] space-y-5 backdrop-blur-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-slate-950 flex items-center justify-center font-black text-lg shadow-lg shadow-cyan-500/25">
              <i class="fa-solid fa-users text-white"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base sm:text-lg font-black text-white tracking-wide">Who's Locking In?</h3>
                <span id="arc-multiuser-count-badge" class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">1 Operative</span>
              </div>
              <p class="text-xs text-slate-400">Each operative has an isolated habit vault, streak, XP level, and PIN lock.</p>
            </div>
          </div>
          <button type="button" onclick="ArcMultiUser.closeSwitcherModal()" class="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white grid place-items-center transition" aria-label="Close User Switcher">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Operatives Grid -->
        <div id="arc-multiuser-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[46vh] overflow-y-auto pr-1 custom-scroll">
          <!-- Populated dynamically by ArcMultiUser.renderModal() -->
        </div>

        <!-- Create New Operative Form (Collapsible) -->
        <div id="arc-multiuser-create-form" class="hidden p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-user-plus"></i> New Operative Profile
            </span>
            <button type="button" onclick="ArcMultiUser.toggleCreateForm(false)" class="text-xs text-slate-400 hover:text-white">Cancel</button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label for="mu-new-name" class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Display Name</label>
              <input id="mu-new-name" type="text" maxlength="28" placeholder="e.g. Alex Rivera" class="pp-in w-full text-xs font-semibold focus:border-cyan-400">
            </div>
            <div>
              <label for="mu-new-handle" class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Handle (@)</label>
              <input id="mu-new-handle" type="text" maxlength="20" placeholder="alex_arc" class="pp-in w-full text-xs font-mono focus:border-cyan-400">
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label for="mu-new-arc" class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Starting Season</label>
              <select id="mu-new-arc" class="pp-in w-full text-xs">
                <option value="winter">❄️ Winter Arc (Oct - Dec)</option>
                <option value="summer">☀️ Summer Arc (Apr - Jul)</option>
              </select>
            </div>
            <div>
              <label for="mu-new-pin" class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Optional Security PIN</label>
              <input id="mu-new-pin" type="password" maxlength="32" placeholder="Leave blank for none" class="pp-in w-full text-xs font-mono focus:border-cyan-400">
            </div>
          </div>
          <p id="mu-create-err" class="text-xs text-rose-400 font-mono min-h-[1rem]"></p>
          <button type="button" onclick="ArcMultiUser.createNewOperative()" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition active:scale-95">
            <i class="fa-solid fa-bolt mr-1"></i> Create &amp; Switch to Operative
          </button>
        </div>

        <!-- Footer Controls -->
        <div class="pt-3 border-t border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <label class="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
            <input type="checkbox" id="mu-show-on-launch-chk" onchange="ArcMultiUser.setShowPickerOnLaunch(this.checked)" class="accent-cyan-400 rounded w-4 h-4">
            <span class="text-[11px]">Ask "Who's Locking In?" on app launch when multiple users exist</span>
          </label>
          <div class="flex items-center gap-2 shrink-0">
            <button type="button" id="btn-mu-open-create" onclick="ArcMultiUser.toggleCreateForm(true)" class="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-extrabold text-xs flex items-center gap-1.5 transition active:scale-95">
              <i class="fa-solid fa-user-plus"></i>
              <span>Add Operative</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
```

---

#### Step 5.3.4: Create `src/modules/multiUserEngine.js`

Create `c:\Users\vruti\OneDrive\Desktop\mayank\mayank\src\modules\multiUserEngine.js` to manage the user registry, profile creation, isolated state initialization, and instant partition switching:

```javascript
const REGISTRY_KEY = "__arc_users_registry_v1";
const ACTIVE_USER_KEY = "__arc_active_user_id";
const LAUNCH_PICKER_KEY = "__arc_show_picker_on_launch";

const AVATAR_GRADIENTS = [
  "from-cyan-500 to-indigo-600",
  "from-amber-500 to-orange-600",
  "from-purple-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-red-600",
  "from-blue-500 to-violet-600"
];

class ArcMultiUserEngine {
  constructor() {
    this.registry = [];
  }

  getRegistry() {
    try {
      const store = window.ArcStorage || window.localStorage;
      const raw = store.getItem(REGISTRY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.registry = parsed;
          return this.registry;
        }
      }
    } catch (_) {}

    // Seed primary user from existing profile
    let existingProfile = { displayName: "Operative", username: "operative", title: "Shadow Initiate" };
    try {
      const rawProf = localStorage.getItem("arc_user_profile");
      if (rawProf) existingProfile = Object.assign(existingProfile, JSON.parse(rawProf));
    } catch (_) {}

    const primary = {
      id: "usr_primary",
      displayName: existingProfile.displayName || "Operative",
      username: (existingProfile.username || "operative").replace(/^@+/, ""),
      title: existingProfile.title || "Shadow Initiate",
      avatar: (existingProfile.displayName || "O").charAt(0).toUpperCase(),
      gradient: AVATAR_GRADIENTS[0],
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      isPrimary: true
    };

    this.registry = [primary];
    this.saveRegistry();
    return this.registry;
  }

  saveRegistry() {
    try {
      const json = JSON.stringify(this.registry);
      if (window.ArcStorage) window.ArcStorage.setItem(REGISTRY_KEY, json);
      localStorage.setItem(REGISTRY_KEY, json);
    } catch (e) {
      console.warn("[ArcMultiUser] Failed to save registry:", e);
    }
  }

  getActiveUserId() {
    if (window.ArcStorage && typeof window.ArcStorage.getActiveUserId === "function") {
      return window.ArcStorage.getActiveUserId();
    }
    return localStorage.getItem(ACTIVE_USER_KEY) || "usr_primary";
  }

  getActiveUser() {
    const reg = this.getRegistry();
    const uid = this.getActiveUserId();
    return reg.find((u) => u.id === uid) || reg[0];
  }

  syncActiveUserSummary() {
    const reg = this.getRegistry();
    const uid = this.getActiveUserId();
    const entry = reg.find((u) => u.id === uid);
    if (!entry) return;

    try {
      const profRaw = localStorage.getItem("arc_user_profile");
      if (profRaw) {
        const p = JSON.parse(profRaw);
        if (p.displayName) entry.displayName = p.displayName;
        if (p.username) entry.username = p.username.replace(/^@+/, "");
        if (p.title) entry.title = p.title;
        entry.avatar = (entry.displayName || "O").charAt(0).toUpperCase();
      }
      if (window.state) {
        entry.streak = Number(window.state.streak) || 0;
        entry.level = Number(window.state.level) || 1;
        entry.currentArc = window.state.currentArc || "winter";
      }
      entry.hasPin = !!localStorage.getItem("arc_sec_pin_hash");
      entry.lastActiveAt = Date.now();
      this.saveRegistry();
    } catch (_) {}
  }

  isShowPickerOnLaunch() {
    const raw = localStorage.getItem(LAUNCH_PICKER_KEY);
    return raw === null ? true : raw === "true";
  }

  setShowPickerOnLaunch(enabled) {
    const val = enabled ? "true" : "false";
    localStorage.setItem(LAUNCH_PICKER_KEY, val);
    if (window.ArcStorage) window.ArcStorage.setItem(LAUNCH_PICKER_KEY, val);
  }

  openSwitcherModal() {
    this.syncActiveUserSummary();
    this.renderModal();
    const modal = document.getElementById("arc-multiuser-modal");
    if (!modal) return;
    modal.style.display = "flex";
    void modal.offsetWidth;
    modal.classList.add("open");
    if (typeof window.playSfx === "function") window.playSfx("modalOpen");
  }

  closeSwitcherModal() {
    const modal = document.getElementById("arc-multiuser-modal");
    if (!modal) return;
    modal.classList.remove("open");
    setTimeout(() => {
      if (!modal.classList.contains("open")) modal.style.display = "none";
    }, 320);
    if (typeof window.playSfx === "function") window.playSfx("modalClose");
  }

  toggleCreateForm(show) {
    const form = document.getElementById("arc-multiuser-create-form");
    const btn = document.getElementById("btn-mu-open-create");
    const err = document.getElementById("mu-create-err");
    if (err) err.textContent = "";
    if (form) form.classList.toggle("hidden", !show);
    if (btn) btn.classList.toggle("hidden", !!show);
    if (show) {
      const nameIn = document.getElementById("mu-new-name");
      if (nameIn) {
        nameIn.value = "";
        setTimeout(() => nameIn.focus(), 80);
      }
      const handleIn = document.getElementById("mu-new-handle");
      if (handleIn) handleIn.value = "";
      const pinIn = document.getElementById("mu-new-pin");
      if (pinIn) pinIn.value = "";
    }
  }

  async createNewOperative() {
    const nameIn = document.getElementById("mu-new-name");
    const handleIn = document.getElementById("mu-new-handle");
    const arcIn = document.getElementById("mu-new-arc");
    const pinIn = document.getElementById("mu-new-pin");
    const err = document.getElementById("mu-create-err");
    if (err) err.textContent = "";

    const displayName = (nameIn ? nameIn.value : "").trim();
    let username = (handleIn ? handleIn.value : "").trim().toLowerCase().replace(/^@+/, "");
    const startingArc = (arcIn ? arcIn.value : "winter") || "winter";
    const rawPin = (pinIn ? pinIn.value : "").trim();

    if (!displayName || displayName.length < 2) {
      if (err) err.textContent = "Display name must be at least 2 characters.";
      return;
    }
    if (!username) {
      username = displayName.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 16) || "operative";
    }
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      if (err) err.textContent = "Handle must be 3–20 letters, numbers, or underscores.";
      return;
    }
    if (rawPin && rawPin.length < 4) {
      if (err) err.textContent = "Optional Security PIN must be at least 4 characters.";
      return;
    }

    const reg = this.getRegistry();
    if (reg.some((u) => u.username.toLowerCase() === username)) {
      if (err) err.textContent = `Handle @${username} is already taken on this device.`;
      return;
    }

    const newUserId = "usr_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6);
    const gradient = AVATAR_GRADIENTS[reg.length % AVATAR_GRADIENTS.length];

    const newOperative = {
      id: newUserId,
      displayName,
      username,
      title: "Shadow Initiate",
      avatar: displayName.charAt(0).toUpperCase(),
      gradient,
      streak: 0,
      level: 1,
      currentArc: startingArc,
      hasPin: !!rawPin,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      isPrimary: false
    };

    reg.push(newOperative);
    this.saveRegistry();

    // Seed initial profile and state into the new user's partition
    const initialProfile = {
      displayName,
      username,
      title: "Shadow Initiate",
      motto: "Transform in Silence.",
      email: `${username}@winterarc.local`,
      avatar: newOperative.avatar,
      pfpRingStyle: "gold",
      pfpRingColor: "#F59E0B",
      isCustomized: true,
      updatedAt: new Date().toISOString()
    };

    const initialHabits = typeof window.DEFAULT_HABITS !== "undefined"
      ? JSON.parse(JSON.stringify(window.DEFAULT_HABITS))
      : [
          { id: "1", name: "Workout or 10k Steps", category: "Physical", weight: 2, completed: false },
          { id: "2", name: "Clean Eating", category: "Physical", weight: 2, completed: false },
          { id: "3", name: "Sleep/Wake Schedule (7-8 hrs)", category: "Discipline", weight: 3, completed: false },
          { id: "4", name: "Read 10+ Pages Non-Fiction", category: "Mindset", weight: 1, completed: false },
          { id: "5", name: "2 Hours Deep Focus Lock-In", category: "Productivity", weight: 3, completed: false },
          { id: "6", name: "Zero Mindless Social Media Scrolling", category: "Discipline", weight: 2, completed: false }
        ];

    const initialState = {
      currentArc: startingArc,
      habits: initialHabits,
      activeTab: "tracker",
      streak: 0,
      level: 1,
      xp: 0,
      dailyHabits: {},
      dailyFocus: {},
      laptop: { isAutoPaused: false, isRunning: true, totalSeconds: 0, interval: null },
      timer: { totalFocusSeconds: 0 }
    };

    if (window.ArcStorage) {
      window.ArcStorage.memCache.set(`u:${newUserId}:arc_user_profile`, JSON.stringify(initialProfile));
      window.ArcStorage.memCache.set(`u:${newUserId}:arc_tracker_state`, JSON.stringify(initialState));
      window.ArcStorage.memCache.set(`u:${newUserId}:arc_terms_accepted_v1`, JSON.stringify({ accepted: true, version: "2026.1", timestamp: Date.now() }));
      window.ArcStorage.dirtyKeys.add(`u:${newUserId}:arc_user_profile`);
      window.ArcStorage.dirtyKeys.add(`u:${newUserId}:arc_tracker_state`);
      window.ArcStorage.dirtyKeys.add(`u:${newUserId}:arc_terms_accepted_v1`);
    }

    // Switch to the new user partition and optionally set PIN
    await this.switchUser(newUserId, rawPin);
  }

  async switchUser(targetUserId, initialPinToSet = null) {
    if (!targetUserId) return;
    this.syncActiveUserSummary();

    if (window.ArcStorage && typeof window.ArcStorage.switchUserPartition === "function") {
      await window.ArcStorage.switchUserPartition(targetUserId);
    } else {
      localStorage.setItem(ACTIVE_USER_KEY, targetUserId);
    }

    if (initialPinToSet && window.ArcSecurity && typeof window.ArcSecurity.setPin === "function") {
      try {
        await window.ArcSecurity.setPin(initialPinToSet);
      } catch (_) {}
    }

    // Perform clean reload so all singleton timers, Web Audio nodes, and state caches reset for the new operative
    sessionStorage.setItem("__arc_just_switched_user", targetUserId);
    window.location.reload();
  }

  async deleteOperative(userId, event) {
    if (event) event.stopPropagation();
    const reg = this.getRegistry();
    const target = reg.find((u) => u.id === userId);
    if (!target) return;

    if (target.isPrimary || reg.length <= 1) {
      if (typeof window.showToast === "function") {
        window.showToast("⚠️ The primary operative account cannot be deleted.");
      }
      return;
    }

    const ok = confirm(
      `Delete operative profile "${target.displayName} (@${target.username})"?\n\nAll habits, streaks, reflections, and screen time logs for this operative will be permanently erased.`
    );
    if (!ok) return;

    this.registry = reg.filter((u) => u.id !== userId);
    this.saveRegistry();

    if (window.ArcStorage && typeof window.ArcStorage.purgeUserPartition === "function") {
      await window.ArcStorage.purgeUserPartition(userId);
    }

    if (this.getActiveUserId() === userId) {
      await this.switchUser("usr_primary");
    } else {
      this.renderModal();
      this.updateHeaderBadge();
      if (typeof window.showToast === "function") {
        window.showToast(`🗑️ Deleted operative profile @${target.username}`);
      }
    }
  }

  renderModal() {
    const grid = document.getElementById("arc-multiuser-grid");
    const countBadge = document.getElementById("arc-multiuser-count-badge");
    const chk = document.getElementById("mu-show-on-launch-chk");
    if (!grid) return;

    const reg = this.getRegistry();
    const activeId = this.getActiveUserId();

    if (countBadge) {
      countBadge.textContent = `${reg.length} ${reg.length === 1 ? "Operative" : "Operatives"}`;
    }
    if (chk) {
      chk.checked = this.isShowPickerOnLaunch();
    }

    grid.innerHTML = reg
      .map((u) => {
        const isCurrent = u.id === activeId;
        const arcBadge =
          u.currentArc === "summer"
            ? '<span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">☀️ Summer</span>'
            : '<span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">❄️ Winter</span>';

        return `
          <div role="button" tabindex="0" onclick="ArcMultiUser.handleCardClick('${u.id}')" class="p-3.5 rounded-2xl border ${
            isCurrent
              ? "border-cyan-400 bg-cyan-950/30 shadow-[0_0_20px_rgba(0,240,255,0.2)]"
              : "border-slate-800 bg-slate-900/75 hover:border-slate-600"
          } flex items-center justify-between gap-3 cursor-pointer transition group">
            <div class="flex items-center gap-3 min-w-0">
              <div class="relative w-11 h-11 rounded-full bg-gradient-to-tr ${
                u.gradient || "from-cyan-500 to-indigo-600"
              } text-white font-black text-base grid place-items-center shrink-0 shadow-md border border-white/20">
                ${u.avatar || "O"}
                ${
                  isCurrent
                    ? '<span class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950" title="Active"></span>'
                    : ""
                }
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="font-extrabold text-xs sm:text-sm text-white truncate">${u.displayName}</span>
                  ${
                    isCurrent
                      ? '<span class="text-[8px] font-mono font-black px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">ACTIVE</span>'
                      : ""
                  }
                  ${u.hasPin ? '<i class="fa-solid fa-lock text-[10px] text-amber-400" title="PIN Protected"></i>' : ""}
                </div>
                <div class="text-[11px] font-mono text-cyan-400 truncate">@${u.username}</div>
                <div class="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-400">
                  <span>Lv.${u.level || 1}</span>
                  <span>•</span>
                  <span>🔥 ${u.streak || 0}d</span>
                  ${arcBadge}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              ${
                !u.isPrimary
                  ? `<button type="button" onclick="ArcMultiUser.deleteOperative('${u.id}', event)" class="w-7 h-7 rounded-lg bg-slate-950 hover:bg-rose-950 text-slate-500 hover:text-rose-400 grid place-items-center transition border border-slate-800" title="Delete Operative">
                      <i class="fa-solid fa-trash-can text-[11px]"></i>
                    </button>`
                  : ""
              }
            </div>
          </div>
        `;
      })
      .join("");
  }

  handleCardClick(userId) {
    if (userId === this.getActiveUserId()) {
      this.closeSwitcherModal();
      return;
    }
    this.switchUser(userId);
  }

  updateHeaderBadge() {
    const reg = this.getRegistry();
    const active = this.getActiveUser();
    const switcherBtn = document.getElementById("btn-header-switch-user");
    const switcherLabel = document.getElementById("header-switch-user-label");
    if (switcherBtn && active) {
      switcherBtn.title = `Active Operative: ${active.displayName} (@${active.username}) • Click to Switch or Add User (${reg.length} profiles)`;
    }
    if (switcherLabel && active) {
      switcherLabel.textContent = `@${active.username}`;
    }
  }

  init() {
    this.syncActiveUserSummary();
    this.updateHeaderBadge();

    // Hook into ArcProfile.saveProfile so profile edits sync into MultiUser registry
    if (window.ArcProfile && typeof window.ArcProfile.saveProfile === "function") {
      const origSave = window.ArcProfile.saveProfile;
      window.ArcProfile.saveProfile = (...args) => {
        const res = origSave.apply(window.ArcProfile, args);
        this.syncActiveUserSummary();
        this.updateHeaderBadge();
        return res;
      };
    }

    const justSwitched = sessionStorage.getItem("__arc_just_switched_user");
    if (justSwitched) {
      sessionStorage.removeItem("__arc_just_switched_user");
      const active = this.getActiveUser();
      if (active && typeof window.showToast === "function") {
        setTimeout(() => {
          window.showToast(`👤 Switched to Operative: ${active.displayName} (@${active.username})`);
        }, 450);
      }
      return;
    }

    // Show "Who's Locking In?" picker on launch if >1 user exists and enabled
    if (
      this.getRegistry().length > 1 &&
      this.isShowPickerOnLaunch() &&
      !sessionStorage.getItem("__arc_launch_picker_shown")
    ) {
      sessionStorage.setItem("__arc_launch_picker_shown", "true");
      setTimeout(() => this.openSwitcherModal(), 350);
    }
  }
}

const arcMultiUser = new ArcMultiUserEngine();
if (typeof window !== "undefined") {
  window.ArcMultiUser = arcMultiUser;
}
export default arcMultiUser;
```

---

#### Step 5.3.5: Add Multi-User Switcher Button in `src/components/headerNav.js`

In `c:\Users\vruti\OneDrive\Desktop\mayank\mayank\src\components\headerNav.js`, right next to `#header-profile-pill`, add the Multi-Operative Switcher button `#btn-header-switch-user`:

```html
<!-- Multi-User Operative Switcher Button -->
<button type="button" id="btn-header-switch-user" onclick="if(window.ArcMultiUser)ArcMultiUser.openSwitcherModal()" class="w-9 h-9 sm:w-auto px-0 sm:px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 shrink-0" title="Switch or Add Operative Profile">
    <i class="fa-solid fa-users text-xs text-cyan-400"></i>
    <span id="header-switch-user-label" class="hidden lg:inline font-mono text-[11px]">@operative</span>
</button>
```

And in `src/shell.js`:
- Import `{ renderMultiUserModal } from "./components/multiUserModal.js"` and include `renderMultiUserModal()` inside `mountAppShell()`.

And in `src/main.js`:
- Import `"./modules/multiUserEngine.js"` and invoke `if (window.ArcMultiUser) window.ArcMultiUser.init();` right after `window.initApp()`.

---

## PHASE 6: OFFLINE SERVICE WORKER (`sw.js`) & MANIFEST PRODUCTION HARDENING

### 6.1 Objective

1. In `index.html` line 11, change `<link rel="manifest" href="/manifest.json">` to `<link rel="manifest" href="./manifest.json">` so relative asset paths resolve identically across Vite dev, Vite preview, and Tauri custom protocols (`tauri://localhost` / `http://tauri.localhost`).
2. Update `sw.js` so it no longer references the removed `./assets/tailwind.js` file (which would cause `cache.addAll` to reject during Service Worker installation) and instead caches the local fonts, icons, and Vite production assets dynamically.

### 6.2 Exact Implementation of `sw.js`

Replace `c:\Users\vruti\OneDrive\Desktop\mayank\mayank\sw.js` with:

```javascript
const CACHE_NAME = "arc-tracker-v2.6.0-multiuser";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/qrcode.min.js",
  "./assets/fontawesome/css/all.min.css",
  "./assets/fonts/inter.css"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(CORE_ASSETS.map((url) => cache.add(url)));
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
```

---

## PHASE 7: UNIVERSAL DESKTOP & MOBILE LAUNCH PIPELINE (`launch-arc.ps1` & `package.json`)

### 7.1 Objective

Ensure the user can launch Arc Tracker immediately with a single command (`npm run launch` or `.\launch-arc.ps1`), regardless of OneDrive directory locks or Windows 11 Smart App Control (`VerifiedAndReputablePolicyState: 1`).

### 7.2 File Operations Overview

- **Create:** `src-tauri/.cargo/config.toml`
- **Create:** `launch-arc.ps1`
- **Modify:** `build-desktop.ps1`
- **Modify:** `package.json`

### 7.3 Step-by-Step Implementation Instructions

#### Step 7.3.1: Create `src-tauri/.cargo/config.toml`

Create `c:\Users\vruti\OneDrive\Desktop\mayank\mayank\src-tauri\.cargo\config.toml` to permanently route Cargo build artifacts outside OneDrive:

```toml
[build]
target-dir = "C:/Users/vruti/.cargo_target/arc_tracker"
```

#### Step 7.3.2: Create `launch-arc.ps1` (1-Click Production Launcher)

Create `c:\Users\vruti\OneDrive\Desktop\mayank\mayank\launch-arc.ps1` so the user can launch Arc Tracker in either Native Tauri mode or Native Edge/Chrome Frameless App Window mode (`--app=http://localhost:1420`) with zero friction:

```powershell
param(
    [ValidateSet("auto", "desktop-web", "tauri-dev", "tauri-build")]
    [string]$Mode = "auto"
)

$ErrorActionPreference = "Continue"
$WorkspaceRoot = $PSScriptRoot
Set-Location $WorkspaceRoot

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "   ARC TRACKER 2026 - MULTI-USER LAUNCHER (v2.6.0)       " -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# 1. Configure Rust Cargo Target Directory outside OneDrive
$env:CARGO_TARGET_DIR = "C:\Users\vruti\.cargo_target\arc_tracker"

# 2. Build Pre-Compiled Tailwind + Vite Production Bundle
Write-Host "[1/3] Compiling Vite + Tailwind Production Bundle..." -ForegroundColor Yellow
& npm.cmd run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Frontend build failed." -ForegroundColor Red
    exit 1
}

# 3. Check if pre-built Tauri executable exists
$TauriExe = Join-Path $env:CARGO_TARGET_DIR "release\arc-tracker.exe"
if ((Test-Path $TauriExe) -and ($Mode -eq "auto")) {
    Write-Host "[2/3] Launching Native Rust Tauri Executable..." -ForegroundColor Green
    Start-Process -FilePath $TauriExe
    exit 0
}

# 4. If Tauri Dev was explicitly requested, test Smart App Control status first
if ($Mode -eq "tauri-dev" -or $Mode -eq "tauri-build") {
    $sacState = (Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\CI\Policy" -Name "VerifiedAndReputablePolicyState" -ErrorAction SilentlyContinue).VerifiedAndReputablePolicyState
    if ($sacState -eq 1) {
        Write-Host "[NOTICE] Windows 11 Smart App Control is active (State=1) and blocks unsigned Cargo build scripts." -ForegroundColor Yellow
        Write-Host "         Falling back to Native Frameless Desktop App Mode..." -ForegroundColor Cyan
        $Mode = "desktop-web"
    } else {
        if ($Mode -eq "tauri-dev") {
            & npm.cmd run tauri dev
            exit $LASTEXITCODE
        } else {
            & npm.cmd run tauri build
            exit $LASTEXITCODE
        }
    }
}

# 5. Launch Production Server + Native Frameless Desktop Window (Edge/Chrome --app mode)
Write-Host "[2/3] Starting Arc Tracker Local Production Server on http://localhost:1420 ..." -ForegroundColor Green
$ServerJob = Start-Process -FilePath "npm.cmd" -ArgumentList "run", "preview", "--", "--port", "1420", "--strictPort", "--host" -PassThru -WindowStyle Hidden

Start-Sleep -Seconds 2

$EdgePaths = @(
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "${env:ProgramFiles}\Microsoft\Edge\Application\msedge.exe"
)
$ChromePaths = @(
    "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
)

$AppBrowser = ($EdgePaths + $ChromePaths) | Where-Object { Test-Path $_ } | Select-Object -First 1

if ($AppBrowser) {
    Write-Host "[3/3] Opening Arc Tracker Native Desktop Window..." -ForegroundColor Cyan
    Start-Process -FilePath $AppBrowser -ArgumentList "--app=http://localhost:1420", "--window-size=1280,820"
} else {
    Write-Host "[3/3] Opening Arc Tracker in default browser..." -ForegroundColor Cyan
    Start-Process "http://localhost:1420"
}

Write-Host ""
Write-Host "Arc Tracker is running! Press Ctrl+C in this terminal when you are done to stop the background server." -ForegroundColor Green
Wait-Process -Id $ServerJob.Id
```

#### Step 7.3.3: Update `package.json` Scripts

Update the `"scripts"` section in `c:\Users\vruti\OneDrive\Desktop\mayank\mayank\package.json` to expose convenient launch commands:

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --port 1420 --strictPort",
    "launch": "powershell -ExecutionPolicy Bypass -File ./launch-arc.ps1",
    "launch:tauri": "powershell -ExecutionPolicy Bypass -File ./launch-arc.ps1 -Mode tauri-dev",
    "tauri": "tauri"
  },
```

---

## 8. VERIFICATION & ACCEPTANCE PROTOCOL FOR THE CODING AGENT

After implementing Phases 5, 6, and 7, execute the following verification steps and assert $100\%$ pass rate:

1. **Production Build Verification:**
   ```powershell
   npm.cmd run build
   ```
   - Assert exit code `0` and confirm `multiUserModal.js` and `multiUserEngine.js` are bundled cleanly into `dist/`.
2. **DOM ID & Multi-User Modal Verification:**
   - Verify `#arc-multiuser-modal`, `#arc-multiuser-grid`, `#btn-header-switch-user`, and `#mu-new-name` are present in the mounted DOM tree alongside all previously verified 739 static IDs (bringing total static IDs to $\ge 746$).
3. **Multi-User Partition Isolation Test (Automated Node/JSDOM or Browser Check):**
   - Verify that `ArcMultiUser.getRegistry()` initializes `usr_primary` with existing user data.
   - Verify that creating a second user (`usr_...`) isolates `u:usr_primary:arc_tracker_state` from `u:usr_...:arc_tracker_state` in `ArcStorage` so habits, streaks, XP, and PIN hashes never collide.
4. **Launch Verification:**
   - Verify `sw.js` contains zero references to `./assets/tailwind.js` and `index.html` uses `href="./manifest.json"`.