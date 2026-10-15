/**
 * Arc Tracker - High-Durability Storage Engine
 * Combines Tauri 2.0 @tauri-apps/plugin-store with a transactional IndexedDB persistent engine
 * and an in-memory synchronous cache with transparent write-through.
 * Protects user tracking data from aggressive mobile OS cache purges.
 */

const DB_NAME = 'arc_tracker_db';
const DB_VERSION = 1;
const STORE_NAME = 'kv_store';
const TAURI_STORE_FILENAME = 'arc_tracker_store.bin';

class ArcStorageEngine {
  constructor() {
    this.memoryCache = new Map();
    this.db = null;
    this.tauriStore = null;
    this.isTauri = false;
    this.readyPromise = null;
    this._persistQueue = new Map();
    this._persistTimer = null;
  }

  async init() {
    if (this.readyPromise) return this.readyPromise;

    this.readyPromise = (async () => {
      // 1. Check if running inside Tauri 2.0 environment
      if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
        try {
          const { Store } = await import('@tauri-apps/plugin-store');
          this.tauriStore = await Store.load(TAURI_STORE_FILENAME);
          this.isTauri = true;
          console.log('[ArcStorage] Tauri 2.0 Plugin Store initialized:', TAURI_STORE_FILENAME);
        } catch (err) {
          console.warn('[ArcStorage] Tauri Store initialization notice (falling back to IndexedDB):', err.message);
        }
      }

      // 2. Initialize IndexedDB database
      await this._initIndexedDB();

      // 3. Hydrate in-memory cache:
      // Priority 1: Tauri Store (if available)
      // Priority 2: IndexedDB
      // Priority 3: Legacy browser localStorage (one-time automatic migration)
      let hydratedCount = 0;

      if (this.isTauri && this.tauriStore) {
        try {
          const entries = await this.tauriStore.entries();
          for (const [k, v] of entries) {
            this.memoryCache.set(k, typeof v === 'string' ? v : JSON.stringify(v));
            hydratedCount++;
          }
          console.log(`[ArcStorage] Hydrated ${hydratedCount} entries from Tauri Store.`);
        } catch (e) {
          console.warn('[ArcStorage] Error reading Tauri store entries:', e);
        }
      }

      if (hydratedCount === 0) {
        // Hydrate from IndexedDB
        try {
          const idbEntries = await this._getAllFromIndexedDB();
          for (const [k, v] of idbEntries) {
            this.memoryCache.set(k, v);
            hydratedCount++;
          }
          console.log(`[ArcStorage] Hydrated ${hydratedCount} entries from IndexedDB.`);
        } catch (e) {
          console.warn('[ArcStorage] Error reading IndexedDB entries:', e);
        }
      }

      // If both were empty, check existing browser localStorage for seamless migration!
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const lsLen = window.localStorage.length;
          let migrated = 0;
          for (let i = 0; i < lsLen; i++) {
            const key = window.localStorage.key(i);
            if (key && !this.memoryCache.has(key)) {
              const val = window.localStorage.getItem(key);
              if (val !== null) {
                this.memoryCache.set(key, val);
                this._queuePersist(key, val);
                migrated++;
              }
            }
          }
          if (migrated > 0) {
            console.log(`[ArcStorage] Successfully migrated ${migrated} legacy items to durable storage!`);
          }
        } catch (e) {
          console.warn('[ArcStorage] Error migrating legacy localStorage:', e);
        }
      }

      // 4. Install transparent proxy / shim over window.localStorage
      this._installProxy();

      return true;
    })();

    return this.readyPromise;
  }

  _initIndexedDB() {
    return new Promise((resolve) => {
      if (typeof indexedDB === 'undefined') {
        console.warn('[ArcStorage] indexedDB is not available.');
        return resolve(null);
      }

      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };
      req.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };
      req.onerror = (e) => {
        console.warn('[ArcStorage] IndexedDB open error:', e.target.error);
        resolve(null);
      };
    });
  }

  _getAllFromIndexedDB() {
    return new Promise((resolve) => {
      if (!this.db) return resolve([]);
      try {
        const tx = this.db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result || []).map(item => [item.key, item.value]);
          resolve(list);
        };
        req.onerror = () => resolve([]);
      } catch (err) {
        resolve([]);
      }
    });
  }

  _queuePersist(key, value) {
    this._persistQueue.set(key, value);
    if (!this._persistTimer) {
      this._persistTimer = setTimeout(() => this._flushPersist(), 100);
    }
  }

  async _flushPersist() {
    this._persistTimer = null;
    const batch = Array.from(this._persistQueue.entries());
    this._persistQueue.clear();

    if (batch.length === 0) return;

    // Persist to IndexedDB
    if (this.db) {
      try {
        const tx = this.db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        for (const [k, v] of batch) {
          if (v === null) {
            store.delete(k);
          } else {
            store.put({ key: k, value: v, updatedAt: Date.now() });
          }
        }
      } catch (e) {
        console.warn('[ArcStorage] IndexedDB persist error:', e);
      }
    }

    // Persist to Tauri Store
    if (this.isTauri && this.tauriStore) {
      try {
        for (const [k, v] of batch) {
          if (v === null) {
            await this.tauriStore.delete(k);
          } else {
            await this.tauriStore.set(k, v);
          }
        }
        await this.tauriStore.save();
      } catch (e) {
        console.warn('[ArcStorage] Tauri store persist error:', e);
      }
    }
  }

  // --- Synchronous API compatible with LocalStorage ---

  getItem(key) {
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }
    // Fallback check to native localStorage
    try {
      return window.__nativeLocalStorage?.getItem(key) ?? null;
    } catch (_) {
      return null;
    }
  }

  setItem(key, value) {
    const strVal = String(value);
    this.memoryCache.set(key, strVal);
    this._queuePersist(key, strVal);

    // Keep native localStorage in sync as well
    try {
      window.__nativeLocalStorage?.setItem(key, strVal);
    } catch (_) {}
  }

  removeItem(key) {
    this.memoryCache.delete(key);
    this._queuePersist(key, null);
    try {
      window.__nativeLocalStorage?.removeItem(key);
    } catch (_) {}
  }

  clear() {
    this.memoryCache.clear();
    // Clear IndexedDB
    if (this.db) {
      try {
        const tx = this.db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).clear();
      } catch (_) {}
    }
    // Clear Tauri Store
    if (this.isTauri && this.tauriStore) {
      this.tauriStore.clear().then(() => this.tauriStore.save()).catch(() => {});
    }
    try {
      window.__nativeLocalStorage?.clear();
    } catch (_) {}
  }

  key(index) {
    const keys = Array.from(this.memoryCache.keys());
    return keys[index] ?? null;
  }

  get length() {
    return this.memoryCache.size;
  }

  _installProxy() {
    try {
      if (typeof window !== 'undefined') {
        if (!window.__nativeLocalStorage) {
          window.__nativeLocalStorage = window.localStorage;
        }

        const self = this;
        const storageProxy = {
          getItem: (k) => self.getItem(k),
          setItem: (k, v) => self.setItem(k, v),
          removeItem: (k) => self.removeItem(k),
          clear: () => self.clear(),
          key: (i) => self.key(i),
          get length() { return self.length; }
        };

        // Wrap as a dynamic Proxy so bracket indexing (localStorage['key']) works too!
        const proxyHandler = {
          get(target, prop) {
            if (prop in storageProxy) {
              return typeof storageProxy[prop] === 'function' ? storageProxy[prop].bind(storageProxy) : storageProxy[prop];
            }
            return self.getItem(prop);
          },
          set(target, prop, value) {
            self.setItem(prop, value);
            return true;
          },
          deleteProperty(target, prop) {
            self.removeItem(prop);
            return true;
          }
        };

        window.ArcStorage = self;
        window.durableStorage = new Proxy(storageProxy, proxyHandler);
      }
    } catch (e) {
      console.warn('[ArcStorage] Proxy install notice:', e);
    }
  }
}

export const arcStorage = new ArcStorageEngine();
export default arcStorage;
