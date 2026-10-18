import { arcStorage } from './storage.js';
import { arcScreenTime } from './screentime.js';

// Auto-initialize robust offline storage & automatic screen time tracking
(async function bootstrap() {
  try {
    await arcStorage.init();
    console.log('[Arc Tracker] High-durability storage active & ready.');
    window.dispatchEvent(new CustomEvent('arc-storage-ready'));

    // Automatically initialize zero-input screen time engine
    await arcScreenTime.init();
    console.log('[Arc Tracker] Automatic screen time engine online.');
  } catch (err) {
    console.error('[Arc Tracker] Bootstrap error:', err);
  }
})();
