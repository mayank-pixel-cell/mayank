import { arcStorage } from './storage.js';
import { arcHardware } from './hardware.js';
import { arcScreenTime } from './screentime.js';
import { arcAppTracker } from './apptracker.js';
import { arcNotifications } from './notifications.js';
import { arcFaq } from './faq.js';
import { arcTermsOnboarding } from './terms.js';

// Auto-initialize robust offline storage, hardware profiler, screen time, app blocker, notification, FAQ and terms onboarding engine
(async function bootstrap() {
  try {
    // 0. Hardware profiler & compatibility gatekeeper (blocks incompatible devices, optimizes low-end)
    arcHardware.init();
    console.log('[Arc Tracker] Hardware gatekeeper & smoothness profiler online.');

    await arcStorage.init();
    console.log('[Arc Tracker] High-durability storage active & ready.');
    window.dispatchEvent(new CustomEvent('arc-storage-ready'));

    // Initialize Terms & Conditions / First-Time Onboarding Gate
    arcTermsOnboarding.init();
    console.log('[Arc Tracker] Terms & Conditions onboarding gate online.');

    // Initialize Real-Time Notifications & Update Detector
    await arcNotifications.init();
    console.log('[Arc Tracker] Notifications & Update Detection engine online.');

    // Initialize Additional Settings FAQ & Help Center
    arcFaq.init();
    console.log('[Arc Tracker] Additional Settings FAQ engine online.');

    // Automatically initialize zero-input screen time engine
    await arcScreenTime.init();
    console.log('[Arc Tracker] Automatic screen time engine online.');

    // Initialize App Screen Time tracking & lockout shield engine
    await arcAppTracker.init();
    console.log('[Arc Tracker] App Screen Time & Blocker Shield engine online.');

    // 6. Register High-Durability Service Worker for 100% Offline Chrome Support
    initOfflineServiceWorker();
  } catch (err) {
    console.error('[Arc Tracker] Bootstrap error:', err);
  }
})();

/**
 * Service Worker Registration & Airgapped Offline Chrome Lifecycle
 */
function initOfflineServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('[Arc Tracker] Service Worker API not supported in this environment.');
    return;
  }

  // Only register over http:// or https:// (Service Workers cannot register on file:// protocol)
  if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') {
    console.log('[Arc Tracker] Running from local filesystem protocol; Service Worker requires HTTP/HTTPS.');
    return;
  }

  const registerSW = () => {
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.log('[Arc Tracker] Service Worker online & active for Chrome offline operation. Scope:', registration.scope);

        // Check for updates periodically
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[Arc Tracker] Service Worker update available in background.');
                if (typeof window.showToast === 'function') {
                  window.showToast('🚀 Offline version updated in background.');
                }
              }
            });
          }
        });
      })
      .catch((err) => {
        console.warn('[Arc Tracker] Service Worker registration skipped or failed:', err);
      });
  };

  if (document.readyState === 'complete') {
    registerSW();
  } else {
    window.addEventListener('load', registerSW);
  }

  // Network Offline / Online State Handlers
  const updateNetworkStatus = (explicitState = null) => {
    const isOnline = (typeof explicitState === 'boolean') ? explicitState : navigator.onLine;
    const indicator = document.getElementById('arc-offline-indicator');
    const profileDot = document.getElementById('header-profile-status-dot');

    if (!isOnline) {
      console.log('[Arc Tracker] Offline Mode engaged: Zero network dependency, full local cache & storage active.');
      if (indicator) indicator.classList.remove('hidden');
      if (profileDot) {
        profileDot.className = 'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-slate-950 shadow-sm';
        profileDot.title = 'Offline (Local Storage)';
      }
      if (typeof window.showToast === 'function') {
        window.showToast('⚡ Offline Mode Active • Full local tracking & storage engaged.');
      }
    } else {
      console.log('[Arc Tracker] Online connection detected.');
      if (indicator) indicator.classList.add('hidden');
      if (profileDot) {
        profileDot.className = 'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-sm';
        profileDot.title = 'Connected';
      }
    }
  };

  window.addEventListener('offline', () => updateNetworkStatus(false));
  window.addEventListener('online', () => updateNetworkStatus(true));

  // Initial check on page load
  if (!navigator.onLine) {
    updateNetworkStatus();
  }
}

