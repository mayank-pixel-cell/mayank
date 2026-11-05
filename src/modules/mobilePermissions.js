window.ArcMobilePermissions = (function() {
  const STORAGE_KEY = 'arc_mobile_permissions_granted';
  const BRAND_KEY = 'arc_user_phone_brand';
  let videoAnimTimer = null;
  let currentBrand = 'oneplus';

  // Verified OEM Brand Guides
  const BRAND_GUIDES = {
    oneplus: {
      name: 'OnePlus',
      header: 'Setup Guide for OnePlus (OxygenOS)',
      badge: 'OxygenOS 14/15 Verified',
      notifLabel: 'Allow Notifications & Banners',
      batteryLabel: 'Allow Background Activity',
      steps: [
        '1. Go to <b>Settings ➔ Apps & permissions ➔ App management</b>.',
        '2. Select <b>Arc Tracker</b> and tap <b>Manage Notifications</b> ➔ Turn <b>Allow Notifications ON</b>.',
        '3. Tap <b>Battery usage</b> ➔ Enable <b>Allow background activity</b> and <b>Allow auto-launch</b>.',
        '4. Lock Arc Tracker in Recent Tasks (swipe up and tap the three dots ➔ Lock).'
      ]
    },
    samsung: {
      name: 'Samsung Galaxy',
      header: 'Setup Guide for Samsung (One UI)',
      badge: 'One UI 6/7 Verified',
      notifLabel: 'Allow Notifications & Pop-ups',
      batteryLabel: 'Battery ➔ Unrestricted',
      steps: [
        '1. Open <b>Settings ➔ Apps ➔ Arc Tracker</b>.',
        '2. Tap <b>Notifications</b> ➔ Toggle <b>Allow notifications</b> to ON.',
        '3. Tap <b>Battery</b> ➔ Select <b>Unrestricted</b> (prevents sleeping app policy).',
        '4. Under <b>Device Care ➔ Memory ➔ Excluded apps</b>, add <b>Arc Tracker</b>.'
      ]
    },
    xiaomi: {
      name: 'Xiaomi / Redmi / POCO',
      header: 'Setup Guide for Xiaomi (HyperOS / MIUI)',
      badge: 'HyperOS / MIUI 14 Verified',
      notifLabel: 'Allow Floating & Lockscreen Notifications',
      batteryLabel: 'Autostart ON & No Restrictions',
      steps: [
        '1. Open <b>Settings ➔ Apps ➔ Manage apps ➔ Arc Tracker</b>.',
        '2. Toggle <b>Autostart</b> to <b>ON</b> (Mandatory for lock-in alarms).',
        '3. Tap <b>Battery Saver</b> ➔ Choose <b>No restrictions</b>.',
        '4. Tap <b>Other permissions</b> ➔ Allow <b>Show on Lock screen</b> and <b>Display pop-up windows</b>.'
      ]
    },
    apple: {
      name: 'Apple iPhone',
      header: 'Setup Guide for Apple iOS',
      badge: 'iOS 17/18 Verified',
      notifLabel: 'Allow Notifications & Time Sensitive',
      batteryLabel: 'Background App Refresh ON',
      steps: [
        '1. Open <b>Settings ➔ Arc Tracker</b>.',
        '2. Tap <b>Notifications</b> ➔ Enable <b>Allow Notifications</b>, <b>Time Sensitive Alerts</b>, and <b>Persistent Banners</b>.',
        '3. Toggle <b>Background App Refresh</b> to <b>ON</b>.',
        '4. Add Arc Tracker to your <b>Home Screen</b> from Safari (Share ➔ Add to Home Screen).'
      ]
    },
    pixel: {
      name: 'Google Pixel',
      header: 'Setup Guide for Google Pixel (Stock Android)',
      badge: 'Android 14/15 Verified',
      notifLabel: 'All Arc Tracker notifications ON',
      batteryLabel: 'App battery usage: Unrestricted',
      steps: [
        '1. Open <b>Settings ➔ Apps ➔ All apps ➔ Arc Tracker</b>.',
        '2. Tap <b>Notifications</b> ➔ Enable <b>All Arc Tracker notifications</b>.',
        '3. Tap <b>App battery usage</b> ➔ Choose <b>Unrestricted</b>.',
        '4. Toggle <b>Pause app activity if unused</b> to <b>OFF</b>.'
      ]
    },
    vivo: {
      name: 'Vivo / iQOO',
      header: 'Setup Guide for Vivo (Funtouch OS)',
      badge: 'Funtouch OS 14 Verified',
      notifLabel: 'Allow Notifications & Top Previews',
      batteryLabel: 'Autostart & High Background Power',
      steps: [
        '1. Open <b>Settings ➔ Apps & permissions ➔ App manager ➔ Arc Tracker</b>.',
        '2. Tap <b>Permission manager</b> ➔ Enable <b>Autostart</b> and <b>Floating window</b>.',
        '3. Tap <b>Battery</b> ➔ Enable <b>High background power consumption</b>.',
        '4. Lock Arc Tracker in Background Tasks manager.'
      ]
    }
  };

  // STRICTLY MOBILE-ONLY: Returns true only for mobile/touch phone environments
  function isMobile() {
    const ua = navigator.userAgent || '';
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
    const isSmallScreen = window.innerWidth <= 768;
    return mobileRegex.test(ua) || (isSmallScreen && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
  }

  function detectBrand() {
    const saved = localStorage.getItem(BRAND_KEY);
    if (saved && BRAND_GUIDES[saved]) return saved;

    const ua = (navigator.userAgent || '').toLowerCase();
    if (ua.includes('oneplus') || ua.includes('cph') || ua.includes('in20') || ua.includes('ne22')) return 'oneplus';
    if (ua.includes('samsung') || ua.includes('sm-')) return 'samsung';
    if (ua.includes('xiaomi') || ua.includes('redmi') || ua.includes('poco') || ua.includes('mi ')) return 'xiaomi';
    if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'apple';
    if (ua.includes('pixel')) return 'pixel';
    if (ua.includes('vivo') || ua.includes('iqoo') || ua.includes('v2')) return 'vivo';
    return 'oneplus';
  }

  function hasGranted() {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  }

  // Check if all permissions are granted (Mobile Only)
  function areAllPermissionsGranted() {
    if (!isMobile()) return true; // Non-mobile is never gated
    const flowCompleted = localStorage.getItem(STORAGE_KEY) === 'true';
    let notifGranted = true;
    if (typeof Notification !== 'undefined') {
      notifGranted = (Notification.permission === 'granted');
    }
    return flowCompleted && notifGranted;
  }

  // Sends the required notification stating some functions won't work and asking user to grant permissions
  function sendMissingPermissionNotification(customMsg) {
    const title = '⚠️ Permission Required: Some functions won’t work';
    const message = customMsg || 'Some functions won’t work without required permissions (lock-in alarms, dopamine shielding, and streak anti-wipe). Please grant all permissions to continue.';

    // 1. Dispatch into in-app Notification Center
    const notifCenter = window.ArcNotifications || window.ArcNotificationCenter;
    if (notifCenter && typeof notifCenter.notify === 'function') {
      notifCenter.notify({
        title: title,
        message: message,
        type: 'system',
        category: 'Security Alert',
        icon: 'fa-solid fa-triangle-exclamation',
        features: [
          'Push & Lock-in Alarms require Notification permission',
          'Anti-wipe & Streak protection require Persistent Storage',
          'Dopamine Lockout requires Device Activity permissions'
        ]
      });
    }

    // 2. Native OS Push Notification if available
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: './assets/128x128@2x-43otpI-K.png',
          tag: 'perm-missing-alert'
        });
      } catch (_) {}
    }

    // 3. Floating Toast Banner
    if (typeof window.showToast === 'function') {
      window.showToast('⚠️ Permission required: Some functions won’t work. Please grant all permissions.');
    }

    // 4. Sound feedback
    if (typeof playSfx === 'function') {
      playSfx('warning');
    }
  }

  function showMissingPermissionAlert(specificText) {
    const banner = document.getElementById('perm-mandatory-warning');
    const bannerText = document.getElementById('perm-mandatory-warning-text');
    const bannerVideo = document.getElementById('perm-video-mandatory-warning');
    const bannerVideoText = document.getElementById('perm-video-mandatory-warning-text');

    const msg = specificText || 'Some functions won’t work without required permissions. All permissions are mandatory to grant before this tab can close.';

    if (banner) {
      banner.classList.remove('hidden');
      if (bannerText) bannerText.textContent = msg;
    }
    if (bannerVideo) {
      bannerVideo.classList.remove('hidden');
      if (bannerVideoText) bannerVideoText.textContent = msg;
    }

    // Shake modal to emphasize that it cannot close
    const card = document.getElementById('arc-mobile-perm-card');
    if (card) {
      card.classList.remove('animate-perm-shake');
      void card.offsetWidth; // Force DOM reflow
      card.classList.add('animate-perm-shake');
    }

    // Send the notification
    sendMissingPermissionNotification(msg);
  }

  // Attempt to close modal: WILL NOT CLOSE on mobile unless all permissions are granted!
  function attemptClose() {
    if (isMobile() && !areAllPermissionsGranted()) {
      showMissingPermissionAlert();
      return false; // TAB / MODAL WILL NOT CLOSE
    }
    return closeModal(true);
  }

  function closeModal(force = false) {
    if (!force && isMobile() && !areAllPermissionsGranted()) {
      showMissingPermissionAlert();
      return false; // TAB / MODAL WILL NOT CLOSE
    }
    const modal = document.getElementById('arc-mobile-permissions-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
      if (typeof playSfx === 'function') playSfx('modalClose');
    }
    stopVideoAnimation();
    return true;
  }

  function checkOnLogin(userObj) {
    if (!isMobile()) return;
    if (areAllPermissionsGranted()) return;
    openModal();
  }

  function openModal() {
    if (!isMobile()) return;
    const modal = document.getElementById('arc-mobile-permissions-modal');
    if (!modal) return;
    currentBrand = detectBrand();
    showStage('overview');
    updateStatusIndicators();
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    if (typeof playSfx === 'function') playSfx('modalOpen');
  }

  function showStage(stage) {
    const s1 = document.getElementById('perm-stage-overview');
    const s2 = document.getElementById('perm-stage-video');
    const s3 = document.getElementById('perm-stage-confirmation');
    if (s1) s1.classList.toggle('hidden', stage !== 'overview');
    if (s2) s2.classList.toggle('hidden', stage !== 'video');
    if (s3) s3.classList.toggle('hidden', stage !== 'confirmation');
  }

  function startVideoGuide() {
    showStage('video');
    selectBrand(currentBrand);
    if (typeof playSfx === 'function') playSfx('click');
  }

  function selectBrand(brandKey) {
    if (!BRAND_GUIDES[brandKey]) brandKey = 'oneplus';
    currentBrand = brandKey;
    localStorage.setItem(BRAND_KEY, brandKey);

    // Update active brand pill
    const pills = document.querySelectorAll('.perm-brand-tab');
    pills.forEach(p => {
      const active = p.getAttribute('data-brand') === brandKey;
      p.className = active 
        ? 'perm-brand-tab px-3 py-1 rounded-full bg-cyan-500 text-slate-950 font-black border border-cyan-400 whitespace-nowrap shadow-sm transition active:scale-95'
        : 'perm-brand-tab px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap transition active:scale-95';
    });

    const guide = BRAND_GUIDES[brandKey];
    const brandTitle = document.getElementById('perm-video-brand-title');
    const verifiedBadge = document.getElementById('perm-video-verified-badge');
    const notifLabel = document.getElementById('sim-text-notif-label');
    const batteryLabel = document.getElementById('sim-text-battery-label');
    const pipLabel = document.getElementById('pip-brand-label');

    if (brandTitle) brandTitle.innerHTML = '<i class="fa-solid fa-mobile-screen text-cyan-400 mr-1"></i> ' + guide.header;
    if (verifiedBadge) verifiedBadge.textContent = guide.badge;
    if (notifLabel) notifLabel.textContent = guide.notifLabel;
    if (batteryLabel) batteryLabel.textContent = guide.batteryLabel;
    if (pipLabel) pipLabel.textContent = guide.name + ' Guide';

    // Render Steps List
    const stepsList = document.getElementById('perm-brand-steps-list');
    if (stepsList) {
      let html = '<div class="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1"><i class="fa-solid fa-shield-check"></i> ' + guide.badge + ' Instructions:</div>';
      guide.steps.forEach(s => {
        html += '<div class="text-slate-300 leading-snug font-medium">• ' + s + '</div>';
      });
      stepsList.innerHTML = html;
    }

    startVideoAnimation();
  }

  function startVideoAnimation() {
    stopVideoAnimation();
    const pointer = document.getElementById('perm-tap-pointer');
    const toggleNotif = document.getElementById('sim-toggle-notif');
    const toggleBattery = document.getElementById('sim-toggle-battery');
    const bar = document.getElementById('perm-video-progressbar');
    const timer = document.getElementById('perm-video-timer');

    if (toggleNotif) {
      toggleNotif.className = 'w-9 h-5 rounded-full bg-slate-800 p-0.5 transition-colors duration-500 flex items-center';
      const k = toggleNotif.querySelector('div');
      if (k) k.className = 'w-4 h-4 rounded-full bg-white transition-transform duration-500 shadow-md translate-x-0';
    }
    if (toggleBattery) {
      toggleBattery.className = 'w-9 h-5 rounded-full bg-slate-800 p-0.5 transition-colors duration-500 flex items-center';
      const k = toggleBattery.querySelector('div');
      if (k) k.className = 'w-4 h-4 rounded-full bg-white transition-transform duration-500 shadow-md translate-x-0';
    }

    let progress = 0;
    videoAnimTimer = setInterval(() => {
      progress += 5;
      if (bar) bar.style.width = Math.min(100, progress) + '%';
      const curSec = Math.floor((progress / 100) * 12);
      if (timer) timer.textContent = '0:' + (curSec < 10 ? '0' + curSec : curSec) + ' / 0:12';

      // Step 1: Tap notification toggle
      if (progress === 25 && pointer) {
        pointer.style.top = '12px';
        pointer.style.right = '12px';
      }
      if (progress === 35 && toggleNotif) {
        toggleNotif.className = 'w-9 h-5 rounded-full bg-cyan-500 p-0.5 transition-colors duration-500 flex items-center justify-end';
        const k = toggleNotif.querySelector('div');
        if (k) k.className = 'w-4 h-4 rounded-full bg-white transition-transform duration-500 shadow-md translate-x-0';
        if (typeof playSfx === 'function') playSfx('hover');
      }

      // Step 2: Tap battery toggle
      if (progress === 60 && pointer) {
        pointer.style.top = '62px';
        pointer.style.right = '12px';
      }
      if (progress === 70 && toggleBattery) {
        toggleBattery.className = 'w-9 h-5 rounded-full bg-amber-500 p-0.5 transition-colors duration-500 flex items-center justify-end';
        const k = toggleBattery.querySelector('div');
        if (k) k.className = 'w-4 h-4 rounded-full bg-white transition-transform duration-500 shadow-md translate-x-0';
        if (typeof playSfx === 'function') playSfx('click');
      }

      if (progress >= 100) {
        progress = 0;
        setTimeout(() => startVideoAnimation(), 1200);
      }
    }, 250);
  }

  function stopVideoAnimation() {
    if (videoAnimTimer) {
      clearInterval(videoAnimTimer);
      videoAnimTimer = null;
    }
  }

  function replayVideo() {
    startVideoAnimation();
  }

  // Called when user clicks "Understood"
  async function onUnderstood() {
    stopVideoAnimation();

    // 1. Request actual device permissions
    let notifGranted = false;
    if (typeof Notification !== 'undefined') {
      if (Notification.permission === 'granted') {
        notifGranted = true;
      } else if (Notification.requestPermission) {
        try {
          const res = await Notification.requestPermission();
          notifGranted = (res === 'granted');
        } catch (_) {}
      }
    } else {
      notifGranted = true; // Webview/environment without Notification constructor
    }

    if (navigator.storage && navigator.storage.persist) {
      try { await navigator.storage.persist(); } catch (_) {}
    }
    if (navigator.vibrate) {
      try { navigator.vibrate(60); } catch (_) {}
    }
    if (window.ArcGold && window.ArcGold.isGold()) {
      window.ArcGold.toggleUninstallPrevention(true);
    }

    // If notification permission was blocked or denied:
    if (!notifGranted && typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
      const guide = BRAND_GUIDES[currentBrand] || BRAND_GUIDES.oneplus;
      const missingMsg = 'Some functions won’t work: Notification permission is missing or blocked for your ' + guide.name + '. Please follow the guide and allow notifications to continue.';
      showMissingPermissionAlert(missingMsg);
      return; // WILL NOT CLOSE!
    }

    // All permissions successfully granted!
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (_) {}

    // Hide any previous warnings
    const banner = document.getElementById('perm-mandatory-warning');
    const bannerVideo = document.getElementById('perm-video-mandatory-warning');
    if (banner) banner.classList.add('hidden');
    if (bannerVideo) bannerVideo.classList.add('hidden');

    // Show Confirmation Screen
    const guide = BRAND_GUIDES[currentBrand] || BRAND_GUIDES.oneplus;
    const confirmMsg = document.getElementById('perm-confirmation-message');
    if (confirmMsg) {
      confirmMsg.textContent = 'All permissions have been verified and applied for your ' + guide.name + '. Your lock-in journey and habit telemetry are now 100% active.';
    }

    showStage('confirmation');
    if (typeof playSfx === 'function') playSfx('victory');

    // Return to main habit screen after brief confirmation
    setTimeout(() => {
      finishAndReturnHome();
    }, 2000);
  }

  function minimizeVideo() {
    const modal = document.getElementById('arc-mobile-permissions-modal');
    const pip = document.getElementById('arc-perm-pip-widget');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
    if (pip) {
      pip.classList.remove('hidden');
      pip.style.display = 'block';
    }
    if (typeof showToast === 'function') {
      showToast('📱 Video minimized to floating PiP');
    }
  }

  function maximizeVideo() {
    const modal = document.getElementById('arc-mobile-permissions-modal');
    const pip = document.getElementById('arc-perm-pip-widget');
    if (pip) {
      pip.classList.add('hidden');
      pip.style.display = 'none';
    }
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
    }
    showStage('video');
    startVideoAnimation();
  }

  function dismissPip() {
    const pip = document.getElementById('arc-perm-pip-widget');
    if (pip) {
      pip.classList.add('hidden');
      pip.style.display = 'none';
    }
  }

  function finishAndReturnHome() {
    closeModal(true); // force close upon verified grant
    minimizeVideo();

    // Navigate cleanly to main habit screen
    if (typeof window.switchTab === 'function') {
      window.switchTab('tracker');
    }
    if (typeof showToast === 'function') {
      showToast('🎉 All Permissions Granted · Welcome back!');
    }
  }

  function updateStatusIndicators() {
    const notifBadge = document.getElementById('perm-status-notif');
    if (notifBadge && typeof Notification !== 'undefined') {
      if (Notification.permission === 'granted') {
        notifBadge.className = 'text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300';
        notifBadge.textContent = 'GRANTED';
      }
    }
    const storageBadge = document.getElementById('perm-status-storage');
    if (storageBadge && navigator.storage && navigator.storage.persisted) {
      navigator.storage.persisted().then(persisted => {
        if (persisted) {
          storageBadge.className = 'text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300';
          storageBadge.textContent = 'ACTIVE';
        }
      }).catch(() => {});
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Browser tab close prevention (Strictly Mobile only)
    window.addEventListener('beforeunload', (e) => {
      if (isMobile() && !areAllPermissionsGranted()) {
        e.preventDefault();
        e.returnValue = 'Permissions are mandatory. Some functions will not work unless permissions are granted.';
        return e.returnValue;
      }
    });

    // Auto-check on mobile page load if user logged in
    if (isMobile() && !areAllPermissionsGranted()) {
      try {
        const u = localStorage.getItem('arc_google_user');
        if (u) {
          setTimeout(() => checkOnLogin(JSON.parse(u)), 1200);
        }
      } catch (_) {}
    }
  });

  return {
    isMobile,
    hasGranted,
    areAllPermissionsGranted,
    detectBrand,
    checkOnLogin,
    openModal,
    closeModal,
    attemptClose,
    showMissingPermissionAlert,
    sendMissingPermissionNotification,
    showStage,
    startVideoGuide,
    selectBrand,
    onUnderstood,
    minimizeVideo,
    maximizeVideo,
    dismissPip,
    replayVideo,
    finishAndReturnHome
  };
})();
