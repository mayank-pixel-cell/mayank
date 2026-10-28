/**
 * Arc Tracker - Real-Time Notification & Update Detection System
 * Provides:
 * 1. Corner floating notifications tab with real-time unread badge & animation
 * 2. Automated update detection pipeline whenever new app releases land
 * 3. Browser & OS system notification tray integration
 * 4. Rich interactive Notification Center drawer and full-page updates hub
 */

const NOTIF_STORAGE_KEY = 'arc_notifications_v1';
const SEEN_UPDATES_KEY = 'arc_seen_update_ids';
const ADDED_NOTIFIED_KEY = 'arc_notifications_added_notified';
const OS_NOTIF_KEY = 'arc_notif_os_enabled';
const APP_VERSION = '2.6.0';

// Official Arc Tracker Releases & Updates Catalog
const OFFICIAL_UPDATES = [
  {
    id: 'update-v2.6.0-notif-system',
    version: '2.6.0',
    title: '🚀 v2.6.0 Update: Real-Time Notifications Tab & Update Alert System',
    message: 'Added corner notifications tab, instant update detection engine, desktop header alerts, and native OS notification integration.',
    type: 'update',
    category: 'Major Release',
    date: '2026-10-28',
    icon: 'fa-solid fa-rocket',
    features: [
      'Dedicated corner notifications tab with dynamic glowing badge',
      'Instant alert delivery whenever a new app update arrives',
      'Browser and OS system tray notification alerts',
      'Interactive Notification Center drawer with category filters',
      'Full update history timeline and update scanner'
    ]
  },
  {
    id: 'update-v2.5.0-promotion',
    version: '2.5.0',
    title: '⚡ v2.5.0 Update: 120Hz ProMotion Engine & Device Profiler',
    message: 'Hardware gatekeeper and smoothness profiler online with zero-lag high refresh rate optimizations.',
    type: 'update',
    category: 'Performance',
    date: '2026-10-20',
    icon: 'fa-solid fa-bolt',
    features: [
      'ProMotion 120Hz smooth scrolling optimizations',
      'Adaptive rendering for low-power and high-end hardware',
      'Zero layout shift frame timing engine'
    ]
  },
  {
    id: 'update-v2.4.0-shield',
    version: '2.4.0',
    title: '🛡️ v2.4.0 Update: Dopamine Lockout Shield & Cloud Account Sync',
    message: 'Integrated zero-input screen time engine, application blocker shield, and Google Account telemetry sync.',
    type: 'update',
    category: 'Security',
    date: '2026-10-15',
    icon: 'fa-solid fa-shield-halved',
    features: [
      'Cross-device account sync with end-to-end local airgap',
      'Application screen time limits and strict lockout shield',
      'Hardware profiler gatekeeper'
    ]
  }
];

class ArcNotificationEngine {
  constructor() {
    this.notifications = [];
    this.activeFilter = 'all'; // 'all' | 'update' | 'system' | 'unread'
    this.isDrawerOpen = false;
    this.checkIntervalId = null;
    this.isChecking = false;
  }

  // Retrieve durable storage wrapper or localStorage
  getStorage() {
    try {
      if (typeof window !== 'undefined' && window.ArcStorage) {
        return window.ArcStorage;
      }
      return window.localStorage;
    } catch (_) {
      return null;
    }
  }

  getStorageItem(key, fallback = null) {
    try {
      const store = this.getStorage();
      if (!store) return fallback;
      const raw = store.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  setStorageItem(key, value) {
    try {
      const store = this.getStorage();
      if (!store) return;
      store.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('[ArcNotifications] Storage write error:', e);
    }
  }

  isOsNotificationsEnabled() {
    const val = this.getStorageItem(OS_NOTIF_KEY, null);
    if (val === null) return true; // default to true
    return !!val;
  }

  async requestOsPermission() {
    if (typeof Notification === 'undefined') {
      if (typeof window.showToast === 'function') {
        window.showToast('System notifications are not supported in this browser.');
      }
      return false;
    }

    if (Notification.permission === 'granted') {
      this.setStorageItem(OS_NOTIF_KEY, true);
      this.renderUi();
      return true;
    }

    try {
      const res = await Notification.requestPermission();
      const granted = res === 'granted';
      this.setStorageItem(OS_NOTIF_KEY, granted);
      if (granted && typeof window.showToast === 'function') {
        window.showToast('🔔 System push notifications granted!');
      }
      this.renderUi();
      return granted;
    } catch (_) {
      return false;
    }
  }

  async toggleOsNotifications() {
    const current = this.isOsNotificationsEnabled();
    if (!current) {
      const granted = await this.requestOsPermission();
      if (!granted && typeof window.showToast === 'function') {
        window.showToast('Please enable notifications in your browser/OS settings.');
      }
    } else {
      this.setStorageItem(OS_NOTIF_KEY, false);
      if (typeof window.showToast === 'function') {
        window.showToast('System push notifications disabled.');
      }
      this.renderUi();
    }
  }

  // Initialize engine
  async init() {
    console.log('[ArcNotifications] Initializing Notification Center...');

    // 1. Hydrate notifications
    const saved = this.getStorageItem(NOTIF_STORAGE_KEY, null);
    if (Array.isArray(saved) && saved.length > 0) {
      this.notifications = saved;
    } else {
      this.notifications = [];
    }

    // 2. Check if the initial "Notification of notifications being added" has been sent
    const alreadyNotifiedAdded = !!this.getStorageItem(ADDED_NOTIFIED_KEY, false);
    if (!alreadyNotifiedAdded) {
      this._dispatchNotificationsAddedAnnouncement();
    }

    // 3. Ingest official updates if not already present
    this._syncOfficialUpdates();

    // 4. Attach UI and window listeners
    this._bindEvents();

    // 5. Initial render
    this.renderUi();

    // 6. Setup recurring background update checks (every 10 minutes)
    if (this.checkIntervalId) clearInterval(this.checkIntervalId);
    this.checkIntervalId = setInterval(() => {
      this.checkForUpdates(false);
    }, 10 * 60 * 1000);

    console.log(`[ArcNotifications] Online. Loaded ${this.notifications.length} notifications (${this.getUnreadCount()} unread).`);
  }

  // Dispatches the mandatory announcement that the notifications tab has been added
  _dispatchNotificationsAddedAnnouncement() {
    const notifItem = {
      id: 'notif-feature-notifications-added',
      version: APP_VERSION,
      title: '🔔 Notifications Tab Activated',
      message: 'The new Notifications Tab has been added at the corner of your screen! You will now automatically receive instant alerts whenever a new update, patch, or feature arrives.',
      type: 'update',
      category: 'New Feature',
      icon: 'fa-solid fa-bell',
      timestamp: Date.now(),
      read: false,
      features: [
        'Dedicated corner notifications tab with dynamic unread counter badge',
        'Automatic update detection whenever a new update or patch is released',
        'System OS notification tray alerts & crystal chime audio',
        'Quick flyout Notification Center drawer & full-screen Updates Hub'
      ]
    };

    // Prepend to notifications list
    this.notifications.unshift(notifItem);
    this.save();
    this.setStorageItem(ADDED_NOTIFIED_KEY, true);

    // Trigger immediate in-app toast alert
    setTimeout(() => {
      if (typeof window.showToast === 'function') {
        window.showToast('🔔 Notifications Tab Added — You will now receive alerts for all new updates!');
      }
      this._playNotificationSound();
      this._sendOsPush(notifItem.title, notifItem.message);
    }, 500);
  }

  // Synchronizes official update catalog with user notification list
  _syncOfficialUpdates() {
    const seenIds = new Set(this.getStorageItem(SEEN_UPDATES_KEY, []));
    let hasNew = false;

    OFFICIAL_UPDATES.forEach(up => {
      const exists = this.notifications.some(n => n.id === up.id);
      if (!exists) {
        const isAlreadySeen = seenIds.has(up.id);
        this.notifications.push({
          id: up.id,
          version: up.version,
          title: up.title,
          message: up.message,
          type: up.type || 'update',
          category: up.category || 'Release',
          icon: up.icon || 'fa-solid fa-rocket',
          timestamp: up.date ? new Date(up.date).getTime() : Date.now(),
          read: isAlreadySeen,
          features: up.features || []
        });
        hasNew = true;
      }
      seenIds.add(up.id);
    });

    if (hasNew) {
      // Sort newest first
      this.notifications.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      this.save();
      this.setStorageItem(SEEN_UPDATES_KEY, Array.from(seenIds));
    }
  }

  save() {
    this.setStorageItem(NOTIF_STORAGE_KEY, this.notifications);
  }

  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  // Dispatch a new notification
  notify({
    title,
    message,
    type = 'update',
    category = 'Update',
    icon = 'fa-solid fa-bell',
    features = [],
    version = APP_VERSION,
    silent = false
  }) {
    const notif = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      version,
      title: title || 'New Notification',
      message: message || '',
      type,
      category,
      icon,
      timestamp: Date.now(),
      read: false,
      features
    };

    this.notifications.unshift(notif);
    this.save();
    this.renderUi();

    if (!silent) {
      // 1. Toast
      if (typeof window.showToast === 'function') {
        window.showToast(notif.title);
      }
      // 2. Sound
      this._playNotificationSound();
      // 3. OS Push Notification
      this._sendOsPush(notif.title, notif.message);
      // 4. Animate corner bell
      this._triggerBellAnimation();
    }

    return notif;
  }

  // Specialized API for update announcements
  notifyUpdate({ title, message, version = APP_VERSION, features = [] }) {
    return this.notify({
      title: title || `🚀 New Update Available (v${version})`,
      message: message || 'A new update with performance improvements and features is now available.',
      type: 'update',
      category: 'Update Release',
      icon: 'fa-solid fa-rocket',
      features,
      version
    });
  }

  _playNotificationSound() {
    try {
      if (typeof window.playSfx === 'function') {
        window.playSfx('check');
      }
    } catch (_) {}
  }

  _sendOsPush(title, body) {
    if (!this.isOsNotificationsEnabled()) return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

    try {
      new Notification(title, {
        body: body || 'Arc Tracker notification',
        icon: './icons/128x128.png',
        badge: './icons/32x32.png',
        tag: 'arc-tracker-update-' + Date.now()
      });
    } catch (e) {
      console.warn('[ArcNotifications] OS Push error:', e);
    }
  }

  _triggerBellAnimation() {
    const bellIcon = document.getElementById('arc-notif-bell-icon');
    if (bellIcon) {
      bellIcon.classList.add('animate-bell-ring');
      setTimeout(() => {
        bellIcon.classList.remove('animate-bell-ring');
      }, 4000);
    }
  }

  // Mark single notification as read
  markAsRead(id) {
    const target = this.notifications.find(n => n.id === id);
    if (target && !target.read) {
      target.read = true;
      this.save();
      this.renderUi();
    }
  }

  // Mark all notifications as read
  markAllAsRead() {
    let changed = false;
    this.notifications.forEach(n => {
      if (!n.read) {
        n.read = true;
        changed = true;
      }
    });
    if (changed) {
      this.save();
      this.renderUi();
      if (typeof window.showToast === 'function') {
        window.showToast('✅ All notifications marked as read.');
      }
    }
  }

  // Clear read notifications
  clearRead() {
    const beforeCount = this.notifications.length;
    this.notifications = this.notifications.filter(n => !n.read);
    if (this.notifications.length !== beforeCount) {
      this.save();
      this.renderUi();
      if (typeof window.showToast === 'function') {
        window.showToast('🗑️ Cleared read notifications.');
      }
    }
  }

  // Check for updates (can be called manually or in background)
  async checkForUpdates(manual = false) {
    if (this.isChecking) return;
    this.isChecking = true;

    // Visual feedback on check buttons
    const checkBtns = document.querySelectorAll('.arc-check-updates-btn');
    checkBtns.forEach(btn => {
      const icon = btn.querySelector('i');
      if (icon) icon.classList.add('fa-spin');
    });

    if (manual && typeof window.showToast === 'function') {
      window.showToast('🔍 Checking for updates...');
    }

    try {
      // Simulate real network/manifest check
      let manifestUpdated = false;
      try {
        const res = await fetch('./manifest.json?t=' + Date.now(), { cache: 'no-store' });
        if (res.ok) {
          const manifest = await res.json();
          // Verify version or timestamp
          if (manifest.version && manifest.version !== APP_VERSION) {
            manifestUpdated = true;
          }
        }
      } catch (_) {
        // Fallback for airgap/offline mode
      }

      await new Promise(r => setTimeout(r, 600));

      if (manifestUpdated) {
        this.notifyUpdate({
          title: '🎉 New App Update Available!',
          message: 'A newer version of Arc Tracker is ready to load.',
          version: '2.6.1'
        });
      } else if (manual) {
        if (typeof window.showToast === 'function') {
          window.showToast(`✅ Arc Tracker is up to date (v${APP_VERSION}).`);
        }
      }
    } catch (err) {
      console.warn('[ArcNotifications] Update check notice:', err);
    } finally {
      this.isChecking = false;
      checkBtns.forEach(btn => {
        const icon = btn.querySelector('i');
        if (icon) icon.classList.remove('fa-spin');
      });
      this.renderUi();
    }
  }

  // Test notification trigger for demonstration & user testing
  testUpdateNotification() {
    const testNum = Math.floor(Math.random() * 90) + 10;
    this.notifyUpdate({
      title: `⚡ Live Update #${testNum}: Performance Patch Released`,
      message: 'Real-time telemetry sync, zero-latency habit validation, and battery-saver optimizers enabled.',
      version: APP_VERSION,
      features: [
        'Instant background data synchronization verified',
        'Tactile audio chime and push notification tested'
      ]
    });
  }

  setFilter(filter) {
    this.activeFilter = filter;
    this.renderUi();
  }

  toggleDrawer(forceState) {
    const drawer = document.getElementById('arc-notifications-drawer');
    const pill = document.getElementById('arc-notifications-pill');
    const caret = document.getElementById('arc-notif-caret');
    if (!drawer) return;

    if (typeof forceState === 'boolean') {
      this.isDrawerOpen = forceState;
    } else {
      this.isDrawerOpen = !this.isDrawerOpen;
    }

    if (this.isDrawerOpen) {
      drawer.classList.remove('hidden');
      if (caret) caret.style.transform = 'rotate(180deg)';
      if (pill) pill.setAttribute('aria-expanded', 'true');
      if (typeof window.playSfx === 'function') window.playSfx('hover');
    } else {
      drawer.classList.add('hidden');
      if (caret) caret.style.transform = 'rotate(0deg)';
      if (pill) pill.setAttribute('aria-expanded', 'false');
    }
  }

  // Format relative timestamp
  formatTime(ts) {
    if (!ts) return 'Recently';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // Render all UI components (corner tab, header badge, nav badge, drawer, full view)
  renderUi() {
    const unreadCount = this.getUnreadCount();

    // 1. Update Corner Floating Tab Badge & Ping Dot
    const countBadge = document.getElementById('arc-notif-count-badge');
    const pingDot = document.getElementById('arc-notif-ping');
    if (countBadge) {
      countBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
      countBadge.style.display = unreadCount > 0 ? 'inline-flex' : 'none';
    }
    if (pingDot) {
      pingDot.style.display = unreadCount > 0 ? 'inline-flex' : 'none';
    }

    // 2. Update Header Button Badge
    const headerBadge = document.getElementById('header-notif-badge');
    if (headerBadge) {
      headerBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
      headerBadge.classList.toggle('hidden', unreadCount === 0);
    }

    // 3. Update Desktop Nav Tab Badge
    const navBadge = document.getElementById('nav-notif-badge');
    if (navBadge) {
      navBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
      navBadge.classList.toggle('hidden', unreadCount === 0);
    }

    // 4. Update Filter Tabs counts
    const allCount = this.notifications.length;
    const updateCount = this.notifications.filter(n => n.type === 'update').length;
    const systemCount = this.notifications.filter(n => n.type !== 'update').length;

    const countEls = {
      'filter-count-all': allCount,
      'filter-count-update': updateCount,
      'filter-count-system': systemCount,
      'filter-count-unread': unreadCount
    };
    for (const [id, val] of Object.entries(countEls)) {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    }

    // 5. Update OS Push Status Banner
    const osStatus = document.getElementById('arc-notif-os-status');
    const osBtn = document.getElementById('arc-notif-os-btn');
    if (osStatus && osBtn) {
      const enabled = this.isOsNotificationsEnabled();
      const granted = typeof Notification !== 'undefined' && Notification.permission === 'granted';
      if (granted && enabled) {
        osStatus.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400"></span><span class="text-emerald-300">OS Tray Alerts Active</span>';
        osBtn.textContent = 'Disable';
        osBtn.className = 'text-[11px] text-slate-400 hover:text-slate-200 underline';
      } else {
        osStatus.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400"></span><span class="text-amber-300">OS Push Alerts Off</span>';
        osBtn.textContent = 'Enable Push';
        osBtn.className = 'text-[11px] font-bold text-cyan-400 hover:text-cyan-300 underline';
      }
    }

    // 6. Filter notifications
    const filtered = this.notifications.filter(n => {
      if (this.activeFilter === 'update') return n.type === 'update';
      if (this.activeFilter === 'system') return n.type !== 'update';
      if (this.activeFilter === 'unread') return !n.read;
      return true;
    });

    // 7. Render Drawer List
    const drawerList = document.getElementById('arc-notif-drawer-list');
    if (drawerList) {
      drawerList.innerHTML = this._generateListHtml(filtered, true);
    }

    // 8. Render Full View List
    const fullList = document.getElementById('arc-notif-full-list');
    if (fullList) {
      fullList.innerHTML = this._generateListHtml(filtered, false);
    }
  }

  _generateListHtml(items, isCompact = false) {
    if (!items || items.length === 0) {
      return `
        <div class="text-center py-8 px-4 space-y-2">
          <div class="w-10 h-10 mx-auto rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-sm border border-cyan-500/20">
            <i class="fa-solid fa-check"></i>
          </div>
          <div class="text-xs font-bold text-slate-300">All caught up!</div>
          <p class="text-[11px] text-slate-400 max-w-xs mx-auto">You will automatically receive alerts whenever a new update or patch lands.</p>
        </div>
      `;
    }

    return items.map(n => {
      const isUnread = !n.read;
      const isUpdate = n.type === 'update';
      const badgeStyle = isUpdate
        ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
        : 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      const borderStyle = isUnread
        ? 'border-cyan-400/50 bg-slate-900/90 shadow-[0_0_15px_rgba(0,240,255,0.08)]'
        : 'border-slate-800/80 bg-slate-950/60 opacity-85';

      const featuresHtml = (n.features && n.features.length > 0 && !isCompact)
        ? `<ul class="mt-2 space-y-1 text-[11px] text-slate-400">
            ${n.features.map(f => `<li class="flex items-start gap-1.5"><i class="fa-solid fa-check text-cyan-400 text-[10px] mt-0.5"></i><span>${f}</span></li>`).join('')}
           </ul>`
        : '';

      return `
        <div class="p-3 rounded-xl border ${borderStyle} transition-all duration-200 hover:border-cyan-400/60 group relative select-text" data-notif-id="${n.id}">
          <div class="flex items-start justify-between gap-2.5">
            <div class="flex items-start gap-2.5 min-w-0">
              <div class="w-7 h-7 rounded-lg ${isUpdate ? 'bg-cyan-500/20 text-cyan-300' : 'bg-purple-500/20 text-purple-300'} flex items-center justify-center text-xs shrink-0 mt-0.5">
                <i class="${n.icon || 'fa-solid fa-bell'}"></i>
              </div>
              <div class="min-w-0 space-y-1">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${badgeStyle} uppercase">${n.category || 'Update'}</span>
                  ${n.version ? `<span class="text-[9px] font-mono text-slate-400">v${n.version}</span>` : ''}
                  <span class="text-[10px] text-slate-400 font-mono">• ${this.formatTime(n.timestamp)}</span>
                  ${isUnread ? '<span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" title="Unread"></span>' : ''}
                </div>
                <h4 class="text-xs font-bold ${isUnread ? 'text-white' : 'text-slate-300'} leading-snug break-words">${n.title}</h4>
                <p class="text-[11px] text-slate-400 leading-relaxed">${n.message}</p>
                ${featuresHtml}
              </div>
            </div>
            <div class="flex flex-col items-end gap-1 shrink-0">
              ${isUnread ? `
                <button type="button" onclick="ArcNotifications.markAsRead('${n.id}')" class="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800 transition" title="Mark as read">
                  Mark read
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  _bindEvents() {
    // 1. Keyboard shortcut 'N' to toggle Notifications
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isDrawerOpen) {
          this.toggleDrawer(false);
        }
      } else if ((e.key === 'n' || e.key === 'N') && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        if (!e.ctrlKey && !e.altKey && !e.metaKey) {
          e.preventDefault();
          this.toggleDrawer();
        }
      }
    });

    // 2. Light dismiss on outside click
    document.addEventListener('pointerdown', (e) => {
      if (!this.isDrawerOpen) return;
      const drawer = document.getElementById('arc-notifications-drawer');
      const pill = document.getElementById('arc-notifications-pill');
      const headerBtn = document.getElementById('btn-header-notifications');
      if (drawer && !drawer.contains(e.target) && (!pill || !pill.contains(e.target)) && (!headerBtn || !headerBtn.contains(e.target))) {
        this.toggleDrawer(false);
      }
    });

    // 3. Listen to external / remote update events
    window.addEventListener('arc-new-update', (e) => {
      if (e.detail) {
        this.notifyUpdate(e.detail);
      }
    });

    // 4. Window focus check
    window.addEventListener('focus', () => {
      this.checkForUpdates(false);
    });
  }
}

// Instantiate and expose globally
export const arcNotifications = new ArcNotificationEngine();

if (typeof window !== 'undefined') {
  window.ArcNotifications = arcNotifications;
}
