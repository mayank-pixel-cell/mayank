import { arcStorage } from './storage.js';
import { arcHardware } from './hardware.js';
import { arcScreenTime } from './screentime.js';
import { arcAppTracker } from './apptracker.js';

// Auto-initialize robust offline storage, hardware profiler, screen time, and app blocker engine
(async function bootstrap() {
  try {
    // 0. Hardware profiler & compatibility gatekeeper (blocks incompatible devices, optimizes low-end)
    arcHardware.init();
    console.log('[Arc Tracker] Hardware gatekeeper & smoothness profiler online.');

    await arcStorage.init();
    console.log('[Arc Tracker] High-durability storage active & ready.');
    window.dispatchEvent(new CustomEvent('arc-storage-ready'));

    // Automatically initialize zero-input screen time engine
    await arcScreenTime.init();
    console.log('[Arc Tracker] Automatic screen time engine online.');

    // Initialize App Screen Time tracking & lockout shield engine
    await arcAppTracker.init();
    console.log('[Arc Tracker] App Screen Time & Blocker Shield engine online.');
  } catch (err) {
    console.error('[Arc Tracker] Bootstrap error:', err);
  }
})();

