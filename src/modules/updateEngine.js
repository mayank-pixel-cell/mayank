/**
 * Arc Tracker - Real-Time Update Detection & Automatic Notification Engine
 * 
 * Features:
 * 1. Automatic GitHub Releases query engine (mayank-pixel-cell/mayank)
 * 2. Semver version comparison engine
 * 3. Immediate update modal prompt upon opening the app
 * 4. Persistent top update announcement banner with 1-click install
 * 5. OS desktop/mobile system tray notifications + In-app notification center sync
 * 6. Cross-platform asset resolver (Windows .exe/.msi, Android .apk, macOS .dmg)
 * 7. Interactive simulation tool for testing update flows
 */

const APP_VERSION = '2.6.0';
const REPO_OWNER = 'mayank-pixel-cell';
const REPO_NAME = 'mayank';
const GITHUB_LATEST_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;
const GITHUB_RELEASES_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases`;
const REPO_RELEASES_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases`;

const STORAGE_KEY_LATEST_UPDATE = 'arc_latest_update_info';
const STORAGE_KEY_NOTIFIED_VER = 'arc_update_last_notified_version';
const STORAGE_KEY_REMIND_LATER = 'arc_update_remind_later_until';

export class ArcUpdateEngine {
  constructor() {
    this.currentVersion = APP_VERSION;
    this.latestUpdate = null;
    this.isChecking = false;
    this.checkIntervalId = null;
    this._initialized = false;
  }

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
      console.warn('[ArcUpdateEngine] Storage write error:', e);
    }
  }

  /**
   * Parse semantic version string (e.g., 'v2.6.1' or '2.6.0-beta') into comparable numbers
   */
  parseSemver(versionStr) {
    if (!versionStr) return [0, 0, 0];
    const cleaned = String(versionStr).replace(/^v/i, '').trim();
    const [numPart] = cleaned.split(/[-+]/);
    const parts = numPart.split('.').map(p => parseInt(p, 10) || 0);
    while (parts.length < 3) parts.push(0);
    return parts;
  }

  /**
   * Returns true if remoteVersion is strictly greater than localVersion
   */
  isNewerVersion(remoteVersion, localVersion = this.currentVersion) {
    const [rMaj, rMin, rPat] = this.parseSemver(remoteVersion);
    const [lMaj, lMin, lPat] = this.parseSemver(localVersion);

    if (rMaj !== lMaj) return rMaj > lMaj;
    if (rMin !== lMin) return rMin > lMin;
    return rPat > lPat;
  }

  /**
   * Detects the client's current platform and selects the optimal downloadable release asset
   */
  detectPlatformAsset(assets = [], htmlUrl = REPO_RELEASES_URL) {
    const ua = (typeof navigator !== 'undefined' ? navigator.userAgent : '').toLowerCase();
    const isWindows = ua.includes('windows') || ua.includes('win32');
    const isAndroid = ua.includes('android');
    const isMac = ua.includes('macintosh') || ua.includes('mac os');

    let bestAsset = null;
    let platformLabel = 'Universal Web / Archive';
    let btnLabel = 'Download Update';

    if (isWindows) {
      platformLabel = 'Windows 64-bit (Native Installer)';
      btnLabel = 'Download for Windows (.exe / .msi)';
      // Prefer .exe or .msi
      bestAsset = assets.find(a => a.name.endsWith('.exe')) ||
                  assets.find(a => a.name.endsWith('.msi'));
    } else if (isAndroid) {
      platformLabel = 'Android APK (Signed Universal Release)';
      btnLabel = 'Download Android APK (.apk)';
      bestAsset = assets.find(a => a.name.endsWith('.apk')) ||
                  assets.find(a => a.name.endsWith('.aab'));
    } else if (isMac) {
      platformLabel = 'Apple macOS (Apple Silicon & Intel)';
      btnLabel = 'Download for macOS (.dmg)';
      bestAsset = assets.find(a => a.name.endsWith('.dmg')) ||
                  assets.find(a => a.name.endsWith('.app.tar.gz'));
    }

    // Fallback asset if platform specific asset not matched
    if (!bestAsset && assets.length > 0) {
      bestAsset = assets[0];
    }

    return {
      downloadUrl: bestAsset ? bestAsset.browser_download_url : htmlUrl,
      assetName: bestAsset ? bestAsset.name : 'Arc-Tracker-Release',
      sizeBytes: bestAsset ? bestAsset.size : null,
      platformLabel,
      btnLabel
    };
  }

  /**
   * Parse markdown body or return standard feature highlights
   */
  parseChangelog(bodyText) {
    if (!bodyText || typeof bodyText !== 'string' || bodyText.trim().length === 0) {
      return [
        'Real-time update notification engine & system tray integration',
        'Enhanced zero-input screen time tracking on laptops and phones',
        'Instant habit cloud sync with local-first security airgap',
        'Performance speedups and memory optimizations'
      ];
    }

    const lines = bodyText.split(/\r?\n/);
    const bullets = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      // Match markdown list items: - item, * item, 1. item
      if (/^[-*•]\s+/.test(line)) {
        bullets.push(line.replace(/^[-*•]\s+/, ''));
      } else if (/^\d+\.\s+/.test(line)) {
        bullets.push(line.replace(/^\d+\.\s+/, ''));
      } else if (line.startsWith('#') || line.length < 3) {
        // Skip header lines
        continue;
      } else if (bullets.length < 5 && line.length > 8) {
        bullets.push(line);
      }
      if (bullets.length >= 8) break;
    }

    return bullets.length > 0 ? bullets : [
      'Discipline tracking engine performance improvements',
      'Stability bug fixes and multi-device telemetry synchronization',
      'Instant update detection pipeline'
    ];
  }

  /**
   * Initializes the update engine, hydrates state, and schedules listeners
   */
  init() {
    if (this._initialized) return;
    this._initialized = true;

    console.log(`[ArcUpdateEngine] Initialized. Current installed version: v${this.currentVersion}`);

    // Load cached update info
    const cached = this.getStorageItem(STORAGE_KEY_LATEST_UPDATE, null);
    if (cached && this.isNewerVersion(cached.version, this.currentVersion)) {
      this.latestUpdate = cached;
      this.renderTopBanner(cached);
    }

    // Attach listeners
    this._bindEvents();

    // 15-minute background check interval
    if (this.checkIntervalId) clearInterval(this.checkIntervalId);
    this.checkIntervalId = setInterval(() => {
      this.checkForUpdates({ silent: true });
    }, 15 * 60 * 1000);

    // Initial startup check
    this.checkOnStartup();
  }

  /**
   * Runs upon opening the app: queries for updates and presents the update modal
   */
  async checkOnStartup() {
    try {
      // 1. If we already know of a pending update from cached storage
      const cached = this.getStorageItem(STORAGE_KEY_LATEST_UPDATE, null);
      if (cached && this.isNewerVersion(cached.version, this.currentVersion)) {
        this.latestUpdate = cached;
        this.renderTopBanner(cached);

        // Ensure in-app notification center has this pending update registered
        if (window.ArcNotifications && Array.isArray(window.ArcNotifications.notifications)) {
          const exists = window.ArcNotifications.notifications.some(n => n.id === `update-v${cached.version}`);
          if (!exists) {
            window.ArcNotifications.notify({
              id: `update-v${cached.version}`,
              title: `🚀 Update Available: Arc Tracker v${cached.version}`,
              message: cached.name || `A new update with performance improvements and features is ready to download.`,
              type: 'update',
              category: 'New Release',
              icon: 'fa-solid fa-rocket',
              version: cached.version,
              features: cached.features,
              downloadUrl: cached.downloadUrl,
              releaseUrl: cached.htmlUrl,
              silent: true
            });
          }
        }

        // Check if user clicked "remind later" within last 3 hours
        const remindUntil = this.getStorageItem(STORAGE_KEY_REMIND_LATER, 0);
        const shouldSuppressModal = Date.now() < remindUntil;

        if (!shouldSuppressModal) {
          // Delay briefly to allow DOM mount and smooth entrance
          setTimeout(() => {
            this.showUpdateModal(cached);
          }, 800);
        }
      }

      // 2. Query live release from GitHub
      await this.checkForUpdates({ isStartup: true, silent: true });
    } catch (e) {
      console.warn('[ArcUpdateEngine] Startup update check notice:', e);
    }
  }

  /**
   * Query GitHub Releases for the latest version
   */
  async checkForUpdates({ manual = false, isStartup = false, silent = false } = {}) {
    if (this.isChecking) return;
    this.isChecking = true;

    // Visual feedback for check buttons
    const checkBtns = document.querySelectorAll('.arc-check-updates-btn');
    checkBtns.forEach(btn => {
      const icon = btn.querySelector('i');
      if (icon) icon.classList.add('fa-spin');
    });

    if (manual && typeof window.showToast === 'function') {
      window.showToast('🔍 Checking GitHub for new Arc Tracker updates...');
    }

    try {
      let releaseData = null;

      // 1. Fetch latest release
      try {
        const res = await fetch(`${GITHUB_LATEST_API}?t=${Date.now()}`, {
          headers: { 'Accept': 'application/vnd.github.v3+json' },
          cache: 'no-store'
        });

        if (res.ok) {
          releaseData = await res.json();
        } else if (res.status === 404) {
          // Fallback to releases list
          const listRes = await fetch(`${GITHUB_RELEASES_API}?per_page=1&t=${Date.now()}`, {
            headers: { 'Accept': 'application/vnd.github.v3+json' },
            cache: 'no-store'
          });
          if (listRes.ok) {
            const list = await listRes.json();
            if (Array.isArray(list) && list.length > 0) {
              releaseData = list[0];
            }
          }
        }
      } catch (netErr) {
        console.warn('[ArcUpdateEngine] GitHub Releases network query:', netErr);
      }

      if (!releaseData || !releaseData.tag_name) {
        if (manual && typeof window.showToast === 'function') {
          window.showToast(`✅ Arc Tracker is up to date (v${this.currentVersion}).`);
        }
        return;
      }

      const remoteTag = releaseData.tag_name;
      const remoteVersion = remoteTag.replace(/^v/i, '').trim();
      const isNew = this.isNewerVersion(remoteVersion, this.currentVersion);

      if (isNew) {
        const platformAsset = this.detectPlatformAsset(releaseData.assets || [], releaseData.html_url);
        const features = this.parseChangelog(releaseData.body);

        const updatePayload = {
          version: remoteVersion,
          tag: remoteTag,
          name: releaseData.name || `Arc Tracker v${remoteVersion}`,
          body: releaseData.body || '',
          features,
          publishedAt: releaseData.published_at || new Date().toISOString(),
          htmlUrl: releaseData.html_url || REPO_RELEASES_URL,
          downloadUrl: platformAsset.downloadUrl,
          assetName: platformAsset.assetName,
          platformLabel: platformAsset.platformLabel,
          btnLabel: platformAsset.btnLabel
        };

        this.latestUpdate = updatePayload;
        this.setStorageItem(STORAGE_KEY_LATEST_UPDATE, updatePayload);

        this.handleNewUpdateFound(updatePayload, { manual, isStartup });
      } else {
        // Check if there is an active pending update already stored
        const cached = this.getStorageItem(STORAGE_KEY_LATEST_UPDATE, null);
        if (!cached || !this.isNewerVersion(cached.version, this.currentVersion)) {
          this.latestUpdate = null;
          this.dismissBanner();
          if (manual && typeof window.showToast === 'function') {
            window.showToast(`✅ Arc Tracker is up to date (v${this.currentVersion}).`);
          }
        } else {
          // Keep showing pending update until installed
          this.latestUpdate = cached;
          this.renderTopBanner(cached);
          if (manual) {
            this.showUpdateModal(cached);
          }
        }
      }
    } catch (err) {
      console.warn('[ArcUpdateEngine] Check for updates failed:', err);
      if (manual && typeof window.showToast === 'function') {
        window.showToast('Could not reach update server. Please check your internet connection.');
      }
    } finally {
      this.isChecking = false;
      checkBtns.forEach(btn => {
        const icon = btn.querySelector('i');
        if (icon) icon.classList.remove('fa-spin');
      });
    }
  }

  /**
   * Dispatches alerts (Modal, Notification Center, OS Push, Toast, Top Banner, Sound)
   */
  handleNewUpdateFound(update, { manual = false, isStartup = false } = {}) {
    console.log(`[ArcUpdateEngine] 🚀 New update found: v${update.version} (current: v${this.currentVersion})`);

    // 1. Show Top Banner
    this.renderTopBanner(update);

    // 2. Dispatch notifications if this version has not yet been notified
    const lastNotified = this.getStorageItem(STORAGE_KEY_NOTIFIED_VER, '');
    const isFirstTimeSeeingVersion = lastNotified !== update.version;

    if (isFirstTimeSeeingVersion) {
      this.setStorageItem(STORAGE_KEY_NOTIFIED_VER, update.version);

      // In-App Notification Center
      if (window.ArcNotifications && typeof window.ArcNotifications.notify === 'function') {
        window.ArcNotifications.notify({
          id: `update-v${update.version}`,
          title: `🚀 Update Available: Arc Tracker v${update.version}`,
          message: update.name || `A new update with performance improvements and features is ready to download.`,
          type: 'update',
          category: 'New Release',
          icon: 'fa-solid fa-rocket',
          version: update.version,
          features: update.features,
          downloadUrl: update.downloadUrl,
          releaseUrl: update.htmlUrl
        });
      }

      // In-App Toast
      if (typeof window.showToast === 'function') {
        window.showToast(`🚀 New Update Available (v${update.version}) — Tap to update!`);
      }

      // Audio Sound Effect
      try {
        if (typeof window.playSfx === 'function') {
          window.playSfx('check');
        }
      } catch (_) {}

      // OS System Notification
      this.sendOsPushNotification(
        `🚀 Arc Tracker Update Available (v${update.version})`,
        `A new version is ready to install. Click to view what's new and update now!`
      );
    }

    // 3. Prompt Update Modal upon Opening the App or on Manual Check
    if (manual) {
      this.showUpdateModal(update);
    } else if (isStartup) {
      const remindUntil = this.getStorageItem(STORAGE_KEY_REMIND_LATER, 0);
      const isPostponed = Date.now() < remindUntil;
      if (!isPostponed) {
        setTimeout(() => {
          this.showUpdateModal(update);
        }, 800);
      }
    }
  }

  /**
   * System OS Notification Tray integration
   */
  sendOsPushNotification(title, body) {
    if (typeof Notification === 'undefined') return;

    if (Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: './icons/128x128.png',
          badge: './icons/32x32.png',
          tag: 'arc-tracker-update-notification'
        });

        notif.onclick = () => {
          try {
            window.focus();
            this.showUpdateModal();
          } catch (_) {}
        };
      } catch (e) {
        console.warn('[ArcUpdateEngine] OS Push notification trigger:', e);
      }
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.sendOsPushNotification(title, body);
        }
      });
    }
  }

  /**
   * Displays the Update Modal with rich release highlights
   */
  showUpdateModal(updateData = null) {
    const update = updateData || this.latestUpdate || {
      version: '2.7.0',
      name: 'Arc Tracker v2.7.0',
      features: [
        'Automatic update detection & startup notification prompt',
        'Enhanced zero-lag ProMotion 120Hz display optimizations',
        'Discipline strict lockout shields & cross-device habit sync'
      ],
      publishedAt: new Date().toISOString(),
      downloadUrl: REPO_RELEASES_URL,
      btnLabel: 'Download & Install Update'
    };

    const modal = document.getElementById('arc-update-modal');
    if (!modal) {
      console.warn('[ArcUpdateEngine] #arc-update-modal not found in DOM.');
      return;
    }

    // Populate Version Elements
    const curVerEl = document.getElementById('arc-update-cur-ver');
    const newVerEl = document.getElementById('arc-update-new-ver');
    const releaseNameEl = document.getElementById('arc-update-release-name');
    const dateBadgeEl = document.getElementById('arc-update-badge-date');
    const platformHintEl = document.getElementById('arc-update-platform-hint');
    const btnLabelEl = document.getElementById('arc-update-btn-label');
    const changelogBox = document.getElementById('arc-update-changelog-box');

    if (curVerEl) curVerEl.textContent = `v${this.currentVersion}`;
    if (newVerEl) newVerEl.textContent = `v${update.version}`;
    if (releaseNameEl) releaseNameEl.textContent = update.name || `Arc Tracker v${update.version}`;

    if (dateBadgeEl && update.publishedAt) {
      const d = new Date(update.publishedAt);
      dateBadgeEl.textContent = isNaN(d.getTime()) ? 'Recently' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    if (platformHintEl) {
      const platformInfo = this.detectPlatformAsset([], update.htmlUrl);
      platformHintEl.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400 text-[10px]"></i><span>${update.platformLabel || platformInfo.platformLabel} ready.</span>`;
    }

    if (btnLabelEl) {
      btnLabelEl.textContent = update.btnLabel || 'Download & Install Update';
    }

    // Populate Changelog Highlights
    if (changelogBox) {
      const features = Array.isArray(update.features) && update.features.length > 0
        ? update.features
        : this.parseChangelog(update.body);

      changelogBox.innerHTML = features.map(item => `
        <div class="flex items-start gap-2">
            <span class="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[9px] shrink-0 mt-0.5 border border-cyan-500/40">
                <i class="fa-solid fa-check"></i>
            </span>
            <span class="leading-relaxed text-[11px] sm:text-xs">${item}</span>
        </div>
      `).join('');
    }

    // Open Modal
    modal.classList.add('open');

    try {
      if (typeof window.playSfx === 'function') {
        window.playSfx('modalOpen');
      }
    } catch (_) {}
  }

  /**
   * Closes the Update Modal
   */
  closeUpdateModal() {
    const modal = document.getElementById('arc-update-modal');
    if (modal) {
      modal.classList.remove('open');
    }
  }

  /**
   * Snoozes the startup update popup for 3 hours
   */
  remindLater() {
    this.closeUpdateModal();
    const threeHoursFromNow = Date.now() + (3 * 60 * 60 * 1000);
    this.setStorageItem(STORAGE_KEY_REMIND_LATER, threeHoursFromNow);

    if (typeof window.showToast === 'function') {
      window.showToast('⏰ Update reminder snoozed. You can update anytime from the banner or notifications tab.');
    }
  }

  /**
   * Opens the download package in browser
   */
  downloadUpdate() {
    const url = this.latestUpdate?.downloadUrl || REPO_RELEASES_URL;
    if (typeof window.showToast === 'function') {
      window.showToast(`🚀 Opening download for Arc Tracker v${this.latestUpdate?.version || 'latest'}...`);
    }

    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (_) {
      window.location.href = url;
    }

    this.closeUpdateModal();
  }

  /**
   * Opens the full GitHub release page
   */
  openReleaseNotes() {
    const url = this.latestUpdate?.htmlUrl || REPO_RELEASES_URL;
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (_) {
      window.location.href = url;
    }
  }

  /**
   * Reveals top sticky banner
   */
  renderTopBanner(update) {
    const banner = document.getElementById('arc-update-top-banner');
    const verEl = document.getElementById('arc-banner-new-ver');
    if (!banner) return;

    if (verEl && update?.version) {
      verEl.textContent = `v${update.version}`;
    }
    banner.classList.remove('hidden');
  }

  /**
   * Dismisses top banner for the session
   */
  dismissBanner() {
    const banner = document.getElementById('arc-update-top-banner');
    if (banner) {
      banner.classList.add('hidden');
    }
  }

  /**
   * Shows update modal from notification ID
   */
  showUpdateModalById(notifId) {
    if (window.ArcNotifications && Array.isArray(window.ArcNotifications.notifications)) {
      const found = window.ArcNotifications.notifications.find(n => n.id === notifId);
      if (found) {
        this.showUpdateModal({
          version: found.version || '2.7.0',
          name: found.title,
          features: found.features || [],
          publishedAt: found.timestamp ? new Date(found.timestamp).toISOString() : new Date().toISOString(),
          downloadUrl: found.downloadUrl || REPO_RELEASES_URL,
          htmlUrl: found.releaseUrl || REPO_RELEASES_URL
        });
        return;
      }
    }
    this.showUpdateModal();
  }

  /**
   * Developer / User Simulation Tool to test update alerts and modal
   */
  simulateUpdate(version = '2.7.0') {
    const mockUpdate = {
      version,
      tag: `v${version}`,
      name: `🚀 Arc Tracker v${version} Mega Update`,
      body: `### What's New in v${version}\n- Real-time automatic update alert engine\n- Instant update modal popup on app launch\n- System OS push notification tray sync\n- Multi-platform APK, MSI, and DMG releases\n- ProMotion 120Hz smooth scrolling optimizations`,
      features: [
        'Real-time automatic update notification engine',
        'Instant update modal prompt upon opening the app',
        'System OS desktop & mobile notification tray alerts',
        'Multi-platform installer support (Windows, Android, macOS)',
        '120Hz ProMotion zero-lag display engine optimizations'
      ],
      publishedAt: new Date().toISOString(),
      htmlUrl: REPO_RELEASES_URL,
      downloadUrl: REPO_RELEASES_URL,
      platformLabel: 'Windows / Android / macOS',
      btnLabel: 'Download & Install v' + version
    };

    this.latestUpdate = mockUpdate;
    this.setStorageItem(STORAGE_KEY_LATEST_UPDATE, mockUpdate);

    // Clear remind later debounce to force modal
    this.setStorageItem(STORAGE_KEY_REMIND_LATER, 0);
    // Clear last notified version to trigger full alert experience
    this.setStorageItem(STORAGE_KEY_NOTIFIED_VER, '');

    // Trigger full notification and modal experience
    this.handleNewUpdateFound(mockUpdate, { manual: true, isStartup: false });
  }

  _bindEvents() {
    // 1. Keyboard shortcut: Escape closes update modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('arc-update-modal');
        if (modal && modal.classList.contains('open')) {
          this.closeUpdateModal();
        }
      }
    });

    // 2. Light dismiss on outside click
    document.addEventListener('pointerdown', (e) => {
      const modal = document.getElementById('arc-update-modal');
      if (modal && modal.classList.contains('open')) {
        const card = modal.querySelector('> div');
        if (card && !card.contains(e.target)) {
          this.closeUpdateModal();
        }
      }
    });

    // 3. Online event: check for updates when internet connection is restored
    window.addEventListener('online', () => {
      console.log('[ArcUpdateEngine] Network restored. Checking for updates...');
      this.checkForUpdates({ silent: true });
    });

    // 4. Window focus: check in background when user switches back to window
    window.addEventListener('focus', () => {
      this.checkForUpdates({ silent: true });
    });
  }
}

// Instantiate and expose globally
export const arcUpdateEngine = new ArcUpdateEngine();

if (typeof window !== 'undefined') {
  window.ArcUpdateEngine = arcUpdateEngine;
}
