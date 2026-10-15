import { arcStorage } from './storage.js';

// Auto-initialize robust offline storage at application startup
(async function bootstrap() {
  try {
    await arcStorage.init();
    console.log('[Arc Tracker] High-durability storage active & ready.');
    window.dispatchEvent(new CustomEvent('arc-storage-ready'));
  } catch (err) {
    console.error('[Arc Tracker] Storage initialization error:', err);
  }
})();
