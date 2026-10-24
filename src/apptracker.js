/**
 * Arc Tracker — Universal Automated App Screen Time & App Blocker Engine
 * Tracks active screen time per individual app and enforces user-defined daily limits.
 * Prompts for Accessibility & Usage Access permissions.
 * Hard-blocks apps from opening when daily time limit is exceeded.
 */

import { arcStorage } from './storage.js';

export const DEFAULT_TRACKED_APPS = [
  {
    id: 'youtube',
    name: 'YouTube',
    category: 'Entertainment',
    icon: 'fa-brands fa-youtube',
    color: '#FF0000',
    colorClass: 'text-red-500',
    bgClass: 'bg-red-500/10',
    borderClass: 'border-red-500/30',
    matchPatterns: ['youtube.com', 'youtu.be', 'youtube'],
    dailyLimitSecs: 45 * 60, // 45 mins
    blockEnabled: true,
    isCustom: false
  },
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'Social Media',
    icon: 'fa-brands fa-instagram',
    color: '#E1306C',
    colorClass: 'text-pink-500',
    bgClass: 'bg-pink-500/10',
    borderClass: 'border-pink-500/30',
    matchPatterns: ['instagram.com', 'instagram'],
    dailyLimitSecs: 30 * 60, // 30 mins
    blockEnabled: true,
    isCustom: false
  },
  {
    id: 'twitter',
    name: 'X / Twitter',
    category: 'Social Media',
    icon: 'fa-brands fa-x-twitter',
    color: '#FFFFFF',
    colorClass: 'text-slate-200',
    bgClass: 'bg-slate-700/20',
    borderClass: 'border-slate-500/30',
    matchPatterns: ['x.com', 'twitter.com', 'twitter'],
    dailyLimitSecs: 30 * 60, // 30 mins
    blockEnabled: true,
    isCustom: false
  },
  {
    id: 'reddit',
    name: 'Reddit',
    category: 'Social Media',
    icon: 'fa-brands fa-reddit-alien',
    color: '#FF4500',
    colorClass: 'text-orange-500',
    bgClass: 'bg-orange-500/10',
    borderClass: 'border-orange-500/30',
    matchPatterns: ['reddit.com', 'reddit'],
    dailyLimitSecs: 30 * 60, // 30 mins
    blockEnabled: true,
    isCustom: false
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    category: 'Social Media',
    icon: 'fa-brands fa-tiktok',
    color: '#00F2FE',
    colorClass: 'text-cyan-400',
    bgClass: 'bg-cyan-500/10',
    borderClass: 'border-cyan-500/30',
    matchPatterns: ['tiktok.com', 'tiktok'],
    dailyLimitSecs: 20 * 60, // 20 mins
    blockEnabled: true,
    isCustom: false
  },
  {
    id: 'netflix',
    name: 'Netflix',
    category: 'Entertainment',
    icon: 'fa-solid fa-film',
    color: '#E50914',
    colorClass: 'text-red-600',
    bgClass: 'bg-red-600/10',
    borderClass: 'border-red-600/30',
    matchPatterns: ['netflix.com', 'netflix'],
    dailyLimitSecs: 60 * 60, // 1 hour
    blockEnabled: true,
    isCustom: false
  },
  {
    id: 'discord',
    name: 'Discord',
    category: 'Messaging',
    icon: 'fa-brands fa-discord',
    color: '#5865F2',
    colorClass: 'text-indigo-400',
    bgClass: 'bg-indigo-500/10',
    borderClass: 'border-indigo-500/30',
    matchPatterns: ['discord.com', 'discord.exe', 'discord'],
    dailyLimitSecs: 60 * 60, // 1 hour
    blockEnabled: true,
    isCustom: false
  },
  {
    id: 'chrome',
    name: 'Browser / Surfing',
    category: 'Browsing',
    icon: 'fa-brands fa-chrome',
    color: '#00F0FF',
    colorClass: 'text-cyan-400',
    bgClass: 'bg-cyan-500/10',
    borderClass: 'border-cyan-500/30',
    matchPatterns: ['chrome.exe', 'msedge.exe', 'safari', 'firefox.exe'],
    dailyLimitSecs: 90 * 60, // 1.5 hours
    blockEnabled: false,
    isCustom: false
  },
  {
    id: 'gaming',
    name: 'Steam / Gaming',
    category: 'Gaming',
    icon: 'fa-solid fa-gamepad',
    color: '#A855F7',
    colorClass: 'text-purple-400',
    bgClass: 'bg-purple-500/10',
    borderClass: 'border-purple-500/30',
    matchPatterns: ['steam.exe', 'epicgames.exe', 'game'],
    dailyLimitSecs: 45 * 60, // 45 mins
    blockEnabled: true,
    isCustom: false
  },
  {
    id: 'vscode',
    name: 'VS Code / Coding',
    category: 'Productivity',
    icon: 'fa-solid fa-code',
    color: '#38BDF8',
    colorClass: 'text-blue-400',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/30',
    matchPatterns: ['code.exe', 'devenv.exe', 'vscode'],
    dailyLimitSecs: 240 * 60, // 4 hours
    blockEnabled: false,
    isCustom: false
  }
];

class ArcAppTrackerEngine {
  constructor() {
    this.apps = [];
    this.todayKey = this.getTodayDateString();
    this.usageData = {}; // { [appId]: secondsSpent }
    this.activeAppId = null;
    this.activeAppSecondsInSession = 0;
    this.isTracking = true;
    this.strictMode = false;
    this.permissionState = 'prompt'; // 'prompt' | 'granted' | 'denied'
    this.activeFilter = 'all';
    this.searchQuery = '';
    this.audioCtx = null;
    this.heartbeatTimer = null;
    this.saveTimer = null;
    this.blockedAppShieldId = null;
  }

  getTodayDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async init() {
    this.todayKey = this.getTodayDateString();
    await this.loadTrackedApps();
    await this.loadTodayUsage();
    await this.loadSettings();

    // Start 1-second precision tick for active app
    this.startHeartbeat();

    // Attach listeners for visibility
    this.setupListeners();

    // Auto-inject UI overlays into DOM (Blocker Shield, Permission Modal, Limit Picker, Add App)
    this.injectBlockerShieldModal();
    this.injectAccessibilityModal();
    this.injectLimitConfigModal();
    this.injectAddCustomAppModal();

    console.log('[ArcAppTracker] Automated App Screen Time & Blocker Engine initialized.');
  }

  async loadTrackedApps() {
    try {
      const stored = await arcStorage.getItem('arc_tracked_apps_catalog');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge defaults with stored custom apps and customized limits
          const map = new Map();
          DEFAULT_TRACKED_APPS.forEach(app => map.set(app.id, { ...app }));
          parsed.forEach(storedApp => {
            if (map.has(storedApp.id)) {
              map.set(storedApp.id, { ...map.get(storedApp.id), ...storedApp });
            } else {
              map.set(storedApp.id, storedApp);
            }
          });
          this.apps = Array.from(map.values());
          return;
        }
      }
    } catch (e) {
      console.warn('[ArcAppTracker] Error loading stored apps:', e);
    }
    this.apps = JSON.parse(JSON.stringify(DEFAULT_TRACKED_APPS));
  }

  async saveTrackedApps() {
    try {
      await arcStorage.setItem('arc_tracked_apps_catalog', JSON.stringify(this.apps));
    } catch (e) {
      console.warn('[ArcAppTracker] Error saving apps catalog:', e);
    }
  }

  async loadTodayUsage() {
    try {
      this.todayKey = this.getTodayDateString();
      const storageKey = `arc_app_usage_${this.todayKey}`;
      const stored = await arcStorage.getItem(storageKey);
      if (stored) {
        this.usageData = JSON.parse(stored);
      } else {
        this.usageData = {};
      }
    } catch (e) {
      this.usageData = {};
    }
  }

  async saveTodayUsage() {
    try {
      const storageKey = `arc_app_usage_${this.todayKey}`;
      await arcStorage.setItem(storageKey, JSON.stringify(this.usageData));
    } catch (e) {
      console.warn('[ArcAppTracker] Error saving usage:', e);
    }
  }

  async loadSettings() {
    try {
      const perm = await arcStorage.getItem('arc_app_accessibility_perm');
      if (perm) this.permissionState = perm;

      const strict = await arcStorage.getItem('arc_app_strict_mode');
      if (strict !== null) this.strictMode = strict === 'true' || strict === true;
    } catch (_) {}
  }

  setupListeners() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.saveTodayUsage();
        } else {
          this.checkMidnightRollover();
        }
      });
    }

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('beforeunload', () => {
        this.saveTodayUsage();
      });
    }
  }

  startHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => {
      this.tick();
    }, 1000);

    if (this.saveTimer) clearInterval(this.saveTimer);
    this.saveTimer = setInterval(() => {
      this.saveTodayUsage();
    }, 5000);
  }

  checkMidnightRollover() {
    const current = this.getTodayDateString();
    if (current !== this.todayKey) {
      this.saveTodayUsage();
      this.todayKey = current;
      this.usageData = {};
      this.activeAppSecondsInSession = 0;
      // Close blocker if it was open
      this.closeBlockerShield();
      this.renderScreenTimeView();
      console.log('[ArcAppTracker] Midnight rollover: Daily app limits reset.');
    }
  }

  tick() {
    this.checkMidnightRollover();

    if (!this.isTracking) return;

    // If an app is currently selected as active foreground app
    if (this.activeAppId) {
      const app = this.getApp(this.activeAppId);
      if (app) {
        // Increment app usage
        this.usageData[this.activeAppId] = (this.usageData[this.activeAppId] || 0) + 1;
        this.activeAppSecondsInSession++;

        const used = this.usageData[this.activeAppId];
        const limit = app.dailyLimitSecs;

        // Check if limit is reached
        if (app.blockEnabled && used >= limit) {
          this.triggerAppBlock(app.id);
          return;
        }

        // Live update active app DOM display if open
        this.updateActiveTickerDom();
      }
    }

    // Update blocker countdown if modal is currently open
    if (this.blockedAppShieldId) {
      this.updateBlockerCountdownDom();
    }
  }

  getApp(appId) {
    return this.apps.find(a => a.id === appId) || null;
  }

  getAppUsage(appId) {
    return this.usageData[appId] || 0;
  }

  isAppBlocked(appId) {
    const app = this.getApp(appId);
    if (!app || !app.blockEnabled) return false;
    const used = this.getAppUsage(appId);
    return used >= app.dailyLimitSecs;
  }

  /**
   * Set active app for foreground tracking
   */
  setActiveApp(appId) {
    const app = this.getApp(appId);
    if (!app) return false;

    // Check if the app is already blocked by daily limit!
    if (this.isAppBlocked(appId)) {
      this.triggerAppBlock(appId);
      return false;
    }

    this.activeAppId = appId;
    this.activeAppSecondsInSession = 0;
    this.playAudio('click');

    if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
      window.showToast(`Tracking active on ${app.name}`);
    }

    this.renderScreenTimeView();
    return true;
  }

  pauseActiveApp() {
    this.activeAppId = null;
    this.activeAppSecondsInSession = 0;
    this.renderScreenTimeView();
  }

  /**
   * Trigger app block when daily limit is reached
   */
  triggerAppBlock(appId) {
    const app = this.getApp(appId);
    if (!app) return;

    // Stop tracking session on this app
    if (this.activeAppId === appId) {
      this.activeAppId = null;
    }

    // Play loud electronic lockout alarm
    this.playAudio('alarm');

    // Trigger Desktop Notification if permitted
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(`⛔ App Blocked: ${app.name}`, {
          body: `Daily limit of ${this.formatDuration(app.dailyLimitSecs)} reached. Access has been locked for the rest of today.`,
          icon: './icons/128x128.png'
        });
      } catch (_) {}
    }

    // Display the unavoidable Blocker Shield Overlay!
    this.showBlockerShield(appId);

    // Refresh UI
    this.renderScreenTimeView();
  }

  /**
   * Show Fullscreen Blocker Shield
   */
  showBlockerShield(appId) {
    const app = this.getApp(appId);
    if (!app) return;

    this.blockedAppShieldId = appId;
    const modal = document.getElementById('arc-app-blocker-overlay');
    if (!modal) return;

    const used = this.getAppUsage(appId);
    const limit = app.dailyLimitSecs;

    const appNameEl = document.getElementById('blocker-app-name');
    const appIconEl = document.getElementById('blocker-app-icon');
    const timeUsedEl = document.getElementById('blocker-time-used');
    const timeLimitEl = document.getElementById('blocker-time-limit');
    const challengeInput = document.getElementById('blocker-challenge-input');
    const challengeBox = document.getElementById('blocker-challenge-box');
    const challengeError = document.getElementById('blocker-challenge-error');

    if (appNameEl) appNameEl.textContent = app.name;
    if (appIconEl) {
      appIconEl.className = `${app.icon} text-3xl sm:text-4xl text-rose-500`;
    }
    if (timeUsedEl) timeUsedEl.textContent = this.formatDuration(used);
    if (timeLimitEl) timeLimitEl.textContent = this.formatDuration(limit);
    if (challengeInput) challengeInput.value = '';
    if (challengeError) challengeError.classList.add('hidden');

    if (challengeBox) {
      if (this.strictMode) {
        challengeBox.innerHTML = `
          <div class="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs text-center font-bold">
            <i class="fa-solid fa-lock mr-1.5"></i> Strict Mode Active — No Emergency Extensions Permitted Today.
          </div>
        `;
      }
    }

    this.updateBlockerCountdownDom();

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeBlockerShield() {
    this.blockedAppShieldId = null;
    const modal = document.getElementById('arc-app-blocker-overlay');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  updateBlockerCountdownDom() {
    const countdownEl = document.getElementById('blocker-reset-countdown');
    if (!countdownEl) return;

    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diffSecs = Math.max(0, Math.floor((midnight - now) / 1000));

    const hrs = Math.floor(diffSecs / 3600);
    const mins = Math.floor((diffSecs % 3600) / 60);
    const secs = diffSecs % 60;

    countdownEl.textContent = `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
  }

  /**
   * Emergency Unlock with Anti-Impulse Challenge
   */
  submitEmergencyExtension() {
    if (this.strictMode) {
      alert("Strict Mode is turned on. Emergency extensions are disabled to protect your discipline.");
      return;
    }

    const input = document.getElementById('blocker-challenge-input');
    const errorEl = document.getElementById('blocker-challenge-error');
    if (!input || !this.blockedAppShieldId) return;

    const val = input.value.trim().toUpperCase();
    if (val !== 'UNBREAKABLE') {
      if (errorEl) {
        errorEl.textContent = 'Phrase incorrect. You must type UNBREAKABLE in all caps.';
        errorEl.classList.remove('hidden');
      }
      this.playAudio('error');
      return;
    }

    // Grant 5 extra minutes (300 seconds)
    const app = this.getApp(this.blockedAppShieldId);
    if (app) {
      app.dailyLimitSecs += 300;
      this.saveTrackedApps();
    }

    this.closeBlockerShield();
    this.playAudio('success');

    if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
      window.showToast("+5 Minutes Emergency Extension granted. Use wisely.");
    }

    this.renderScreenTimeView();
  }

  /**
   * Accessibility Permission Handling
   */
  async requestAccessibilityPermission() {
    const modal = document.getElementById('arc-accessibility-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    // Auto-request browser notifications & idle detection if applicable
    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
      try {
        await Notification.requestPermission();
      } catch (_) {}
    }

    if (typeof window !== 'undefined' && 'IdleDetector' in window) {
      try {
        await IdleDetector.requestPermission();
      } catch (_) {}
    }
  }

  closeAccessibilityModal() {
    const modal = document.getElementById('arc-accessibility-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  confirmAccessibilityGranted() {
    this.permissionState = 'granted';
    arcStorage.setItem('arc_app_accessibility_perm', 'granted');
    this.playAudio('success');
    this.closeAccessibilityModal();

    if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
      window.showToast("Accessibility & Screen Time Tracking permissions enabled!");
    }

    this.renderScreenTimeView();
  }

  openAndroidAccessibilitySettings() {
    if (/Android/i.test(navigator.userAgent)) {
      window.location.href = "intent:#Intent;action=android.settings.ACCESSIBILITY_SETTINGS;end";
    } else {
      alert("Android Accessibility Settings:\n\n1. Open Settings ➔ Accessibility.\n2. Enable Arc Tracker Service.\n3. Return here to confirm.");
    }
  }

  openAndroidUsageSettings() {
    if (/Android/i.test(navigator.userAgent)) {
      window.location.href = "intent:#Intent;action=android.settings.USAGE_ACCESS_SETTINGS;end";
    } else {
      alert("Android Usage Access Settings:\n\n1. Open Settings ➔ Apps ➔ Special App Access ➔ Usage Access.\n2. Enable Arc Tracker.\n3. Return here to confirm.");
    }
  }

  /**
   * Modal: App Limit Customizer
   */
  openLimitModal(appId) {
    const app = this.getApp(appId);
    if (!app) return;

    const modal = document.getElementById('arc-limit-config-modal');
    if (!modal) return;

    modal.dataset.appId = appId;
    const titleEl = document.getElementById('limit-modal-title');
    const inputEl = document.getElementById('limit-modal-mins-input');
    const toggleEl = document.getElementById('limit-modal-block-toggle');

    if (titleEl) titleEl.textContent = `Set Daily Limit for ${app.name}`;
    if (inputEl) inputEl.value = Math.round(app.dailyLimitSecs / 60);
    if (toggleEl) toggleEl.checked = app.blockEnabled;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeLimitModal() {
    const modal = document.getElementById('arc-limit-config-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  setPresetLimit(minutes) {
    const inputEl = document.getElementById('limit-modal-mins-input');
    if (inputEl) inputEl.value = minutes;
  }

  saveAppLimitFromModal() {
    const modal = document.getElementById('arc-limit-config-modal');
    if (!modal || !modal.dataset.appId) return;

    const appId = modal.dataset.appId;
    const app = this.getApp(appId);
    if (!app) return;

    const inputEl = document.getElementById('limit-modal-mins-input');
    const toggleEl = document.getElementById('limit-modal-block-toggle');

    const mins = parseInt(inputEl?.value || '30', 10);
    if (isNaN(mins) || mins < 1) {
      alert("Please enter a valid time limit in minutes (at least 1 minute).");
      return;
    }

    app.dailyLimitSecs = mins * 60;
    app.blockEnabled = toggleEl ? toggleEl.checked : true;

    this.saveTrackedApps();
    this.closeLimitModal();
    this.playAudio('click');

    if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
      window.showToast(`Daily limit for ${app.name} set to ${this.formatDuration(app.dailyLimitSecs)}.`);
    }

    // Check if this newly saved limit immediately triggers blocking
    if (app.blockEnabled && this.getAppUsage(appId) >= app.dailyLimitSecs) {
      this.triggerAppBlock(appId);
    } else {
      this.renderScreenTimeView();
    }
  }

  /**
   * Modal: Add Custom App
   */
  openAddCustomAppModal() {
    const modal = document.getElementById('arc-add-app-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeAddCustomAppModal() {
    const modal = document.getElementById('arc-add-app-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  saveCustomApp() {
    const nameInput = document.getElementById('add-app-name');
    const catInput = document.getElementById('add-app-category');
    const limitInput = document.getElementById('add-app-limit');
    const procInput = document.getElementById('add-app-proc');

    const name = nameInput?.value.trim();
    if (!name) {
      alert("Please enter an application name.");
      return;
    }

    const category = catInput?.value || 'Productivity';
    const mins = parseInt(limitInput?.value || '30', 10);
    const proc = procInput?.value.trim() || name.toLowerCase();

    const id = 'custom_' + Date.now();
    const newApp = {
      id,
      name,
      category,
      icon: 'fa-solid fa-shapes',
      color: '#00F0FF',
      colorClass: 'text-cyan-400',
      bgClass: 'bg-cyan-500/10',
      borderClass: 'border-cyan-500/30',
      matchPatterns: [proc.toLowerCase(), name.toLowerCase()],
      dailyLimitSecs: Math.max(1, mins) * 60,
      blockEnabled: true,
      isCustom: true
    };

    this.apps.unshift(newApp);
    this.saveTrackedApps();
    this.closeAddCustomAppModal();
    this.playAudio('success');

    if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
      window.showToast(`Custom app "${name}" added to screen time tracker!`);
    }

    this.renderScreenTimeView();
  }

  deleteCustomApp(appId) {
    if (!confirm("Are you sure you want to stop tracking this app?")) return;
    this.apps = this.apps.filter(a => a.id !== appId);
    delete this.usageData[appId];
    this.saveTrackedApps();
    this.saveTodayUsage();
    this.renderScreenTimeView();
  }

  /**
   * Testing Utility: simulate adding usage (e.g. +10m) to easily verify blocker
   */
  simulateAddUsage(appId, seconds = 600) {
    const app = this.getApp(appId);
    if (!app) return;

    this.usageData[appId] = (this.usageData[appId] || 0) + seconds;
    this.saveTodayUsage();
    this.playAudio('click');

    if (app.blockEnabled && this.usageData[appId] >= app.dailyLimitSecs) {
      this.triggerAppBlock(appId);
    } else {
      if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
        window.showToast(`Added ${this.formatDuration(seconds)} testing time to ${app.name}`);
      }
      this.renderScreenTimeView();
    }
  }

  resetAppUsage(appId) {
    const app = this.getApp(appId);
    if (!app) return;
    this.usageData[appId] = 0;
    this.saveTodayUsage();
    if (this.blockedAppShieldId === appId) {
      this.closeBlockerShield();
    }
    this.renderScreenTimeView();
    if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
      window.showToast(`Reset today's usage for ${app.name}.`);
    }
  }

  toggleStrictMode() {
    this.strictMode = !this.strictMode;
    arcStorage.setItem('arc_app_strict_mode', String(this.strictMode));
    this.playAudio('click');
    this.renderScreenTimeView();
    if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
      window.showToast(this.strictMode ? "Strict Mode Enabled (Emergency extensions disabled)." : "Strict Mode Disabled.");
    }
  }

  /**
   * Audio Synthesizer (Zero CDN dependency, 100% offline Web Audio)
   */
  playAudio(type) {
    try {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        if (AudioCtxClass) this.audioCtx = new AudioCtxClass();
      }
      if (!this.audioCtx || this.audioCtx.state === 'suspended') {
        this.audioCtx?.resume();
      }
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;

      if (type === 'alarm') {
        // Harsh two-tone security alarm buzz
        [0, 0.12, 0.24, 0.36].forEach(offset => {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(offset % 0.24 === 0 ? 880 : 440, now + offset);
          gain.gain.setValueAtTime(0.2, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.1);
        });
      } else if (type === 'success') {
        // High-tech ascending success chime
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + (i * 0.08));
          gain.gain.setValueAtTime(0.15, now + (i * 0.08));
          gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.08) + 0.2);
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(now + (i * 0.08));
          osc.stop(now + (i * 0.08) + 0.22);
        });
      } else if (type === 'click') {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'error') {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch (_) {}
  }

  formatDuration(totalSecs) {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  }

  formatDurationShort(totalSecs) {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  }

  /**
   * Main Render Function for `#view-screentime`
   */
  renderScreenTimeView() {
    const view = document.getElementById('view-screentime');
    if (!view) return;

    let totalUsageSecs = 0;
    let blockedCount = 0;
    let totalLimitsSecs = 0;

    this.apps.forEach(app => {
      const used = this.getAppUsage(app.id);
      totalUsageSecs += used;
      totalLimitsSecs += app.dailyLimitSecs;
      if (this.isAppBlocked(app.id)) blockedCount++;
    });

    const isPermGranted = this.permissionState === 'granted';

    // Filter apps
    let filteredApps = this.apps.filter(app => {
      if (this.activeFilter === 'social') return app.category === 'Social Media' || app.category === 'Messaging';
      if (this.activeFilter === 'entertainment') return app.category === 'Entertainment';
      if (this.activeFilter === 'productivity') return app.category === 'Productivity' || app.category === 'Browsing';
      if (this.activeFilter === 'gaming') return app.category === 'Gaming';
      if (this.activeFilter === 'blocked') return this.isAppBlocked(app.id);
      return true;
    });

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filteredApps = filteredApps.filter(app => app.name.toLowerCase().includes(q) || app.category.toLowerCase().includes(q));
    }

    const activeApp = this.activeAppId ? this.getApp(this.activeAppId) : null;

    view.innerHTML = `
      <!-- TOP HERO BANNER & STATS -->
      <div class="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-l-4 border-l-cyan-400 relative overflow-hidden space-y-4 shadow-xl">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                LIVE SCREEN TIME MATRIX
              </span>
              <span class="px-2 py-0.5 rounded-full ${isPermGranted ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'} border text-[10px] font-mono font-semibold">
                <i class="fa-solid ${isPermGranted ? 'fa-check' : 'fa-triangle-exclamation'} mr-1"></i>
                ${isPermGranted ? 'Accessibility Active' : 'Accessibility Setup Needed'}
              </span>
            </div>
            <h2 class="text-xl sm:text-3xl font-black text-white flex items-center gap-2">
              <i class="fa-solid fa-hourglass-half text-cyan-400"></i> App Screen Time &amp; Lockout Shield
            </h2>
            <p class="text-xs sm:text-sm text-slate-300">
              Automatic per-application usage tracking with strict lockout barriers. Reclaim your focus during the Winter Arc.
            </p>
          </div>

          <div class="flex items-center gap-2 flex-wrap self-stretch sm:self-auto">
            <button role="button" onclick="window.ArcAppTracker.requestAccessibilityPermission()" class="px-3 py-2 rounded-xl bg-slate-800 active:bg-slate-700 hover:border-cyan-400 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
              <i class="fa-solid fa-universal-access text-cyan-400"></i> Permissions
            </button>
            <button role="button" onclick="window.ArcAppTracker.toggleStrictMode()" class="px-3 py-2 rounded-xl ${this.strictMode ? 'bg-rose-500 text-white' : 'bg-slate-800 border border-slate-700 text-slate-300'} text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
              <i class="fa-solid fa-shield-halved"></i> ${this.strictMode ? 'Strict: ON' : 'Strict Mode'}
            </button>
            <button role="button" onclick="window.ArcAppTracker.openAddCustomAppModal()" class="px-3.5 py-2 rounded-xl bg-cyan-500 active:bg-cyan-400 text-black text-xs font-extrabold uppercase tracking-wider transition shadow-lg shadow-cyan-500/20 hover:scale-105 flex items-center gap-1.5">
              <i class="fa-solid fa-plus"></i> Add App
            </button>
          </div>
        </div>

        <!-- 4 OVERVIEW KPI CARDS -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div class="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today's App Screen Time</span>
            <div class="text-xl sm:text-2xl font-black font-mono text-cyan-400 mt-0.5" id="st-kpi-total-time">${this.formatDuration(totalUsageSecs)}</div>
            <span class="text-[9px] text-slate-500 block">Total active monitored time</span>
          </div>

          <div class="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Apps Tracked</span>
            <div class="text-xl sm:text-2xl font-black font-mono text-white mt-0.5">${this.apps.length} Apps</div>
            <span class="text-[9px] text-slate-500 block">${this.apps.filter(a => a.blockEnabled).length} have limits enforced</span>
          </div>

          <div class="bg-slate-950/70 p-3.5 rounded-xl border ${blockedCount > 0 ? 'border-rose-500/40 bg-rose-950/20' : 'border-slate-800'}">
            <span class="text-[10px] font-bold ${blockedCount > 0 ? 'text-rose-400' : 'text-slate-400'} uppercase tracking-wider block">Apps Blocked Today</span>
            <div class="text-xl sm:text-2xl font-black font-mono ${blockedCount > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'} mt-0.5">${blockedCount} Locked</div>
            <span class="text-[9px] text-slate-500 block">${blockedCount > 0 ? 'Limit exceeded • Access locked' : 'All apps within quota'}</span>
          </div>

          <div class="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lockout Shield Status</span>
            <div class="text-sm sm:text-base font-extrabold ${this.strictMode ? 'text-rose-400' : 'text-cyan-300'} mt-1 flex items-center gap-1.5">
              <i class="fa-solid fa-lock text-xs"></i> ${this.strictMode ? 'Zero Tolerance' : 'Active With Override'}
            </div>
            <span class="text-[9px] text-slate-500 block">Reset at midnight (00:00)</span>
          </div>
        </div>
      </div>

      <!-- ACCESSIBILITY PERMISSION NOTICE BANNER -->
      ${!isPermGranted ? `
        <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div class="flex items-start space-x-3">
            <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-base shrink-0 mt-0.5">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            <div>
              <h4 class="text-xs sm:text-sm font-bold text-white">Accessibility &amp; App Tracking Permissions Recommended</h4>
              <p class="text-[11px] sm:text-xs text-amber-200/80">
                Granting accessibility enables automatic active window monitoring across apps and triggers the lockout shield the moment an app's daily quota expires.
              </p>
            </div>
          </div>
          <button role="button" onclick="window.ArcAppTracker.requestAccessibilityPermission()" class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition shrink-0 shadow-md">
            Enable Permissions
          </button>
        </div>
      ` : ''}

      <!-- ACTIVE APP FOCUS TRACKER & QUICK LAUNCH BAR -->
      <div class="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 class="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <i class="fa-solid fa-crosshairs text-cyan-400"></i> Active App Live Monitor
            </h3>
            <p class="text-[11px] text-slate-400">Select an application below to track time on it or simulate running it. If a blocked app is chosen, the Lockout Shield triggers instantly.</p>
          </div>

          ${activeApp ? `
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span> Tracking: ${activeApp.name}
              </span>
              <button role="button" onclick="window.ArcAppTracker.pauseActiveApp()" class="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition">
                <i class="fa-solid fa-pause mr-1"></i> Pause
              </button>
            </div>
          ` : `
            <span class="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 font-mono text-xs flex items-center gap-1.5 self-start sm:self-auto">
              <span class="w-2 h-2 rounded-full bg-slate-500"></span> System Idle / Standby
            </span>
          `}
        </div>

        <div class="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          ${this.apps.map(app => {
            const isBlocked = this.isAppBlocked(app.id);
            const isCurrent = this.activeAppId === app.id;
            return `
              <button role="button" onclick="window.ArcAppTracker.setActiveApp('${app.id}')" class="px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 shrink-0 transition ${isCurrent ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/30' : (isBlocked ? 'bg-rose-950/40 text-rose-300 border-rose-500/40 hover:bg-rose-900/40' : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700')}">
                <i class="${app.icon}"></i>
                <span>${app.name}</span>
                ${isBlocked ? '<i class="fa-solid fa-lock text-[10px] text-rose-400"></i>' : ''}
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- TRACKED APPS DIRECTORY & LIMITS -->
      <div class="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-800 space-y-4">
        <!-- FILTER & SEARCH BAR -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <!-- CATEGORY TABS -->
          <div class="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 overflow-x-auto text-xs font-semibold">
            ${[
              { id: 'all', label: 'All Apps' },
              { id: 'social', label: 'Social' },
              { id: 'entertainment', label: 'Entertainment' },
              { id: 'productivity', label: 'Productivity' },
              { id: 'gaming', label: 'Gaming' },
              { id: 'blocked', label: `Blocked (${blockedCount})` }
            ].map(tab => `
              <button role="button" onclick="window.ArcAppTracker.setFilter('${tab.id}')" class="px-3 py-1.5 rounded-lg transition shrink-0 ${this.activeFilter === tab.id ? 'bg-cyan-500 text-black font-bold shadow-sm' : 'text-slate-400 hover:text-white'}">
                ${tab.label}
              </button>
            `).join('')}
          </div>

          <!-- SEARCH INPUT -->
          <div class="relative w-full sm:w-64">
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
            <input type="text" placeholder="Search applications..." value="${this.searchQuery}" oninput="window.ArcAppTracker.setSearch(this.value)" class="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition">
          </div>
        </div>

        <!-- APP CARDS GRID -->
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
          ${filteredApps.map(app => {
            const used = this.getAppUsage(app.id);
            const limit = app.dailyLimitSecs;
            const pct = Math.min(100, Math.round((used / limit) * 100));
            const isBlocked = this.isAppBlocked(app.id);
            const isNearLimit = pct >= 80 && !isBlocked;
            const isActive = this.activeAppId === app.id;

            let barColor = 'bg-cyan-400';
            if (isBlocked) barColor = 'bg-rose-500 shadow-md shadow-rose-500/50';
            else if (isNearLimit) barColor = 'bg-amber-400';

            return `
              <div class="bg-slate-950/80 rounded-2xl p-4 border ${isBlocked ? 'border-rose-500/60 shadow-lg shadow-rose-950/40' : (isActive ? 'border-cyan-400/80 shadow-lg shadow-cyan-950/40' : 'border-slate-800/90')} space-y-3 relative overflow-hidden transition-all duration-200 hover:border-slate-700">
                ${isBlocked ? `
                  <div class="absolute top-0 right-0 bg-rose-600 text-white font-mono text-[9px] font-black uppercase tracking-widest px-3 py-0.5 rounded-bl-xl shadow-md flex items-center gap-1">
                    <i class="fa-solid fa-lock text-[8px]"></i> BLOCKED
                  </div>
                ` : (isActive ? `
                  <div class="absolute top-0 right-0 bg-cyan-500 text-black font-mono text-[9px] font-black uppercase tracking-widest px-3 py-0.5 rounded-bl-xl shadow-md flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-black animate-ping"></span> ACTIVE
                  </div>
                ` : '')}

                <!-- APP HEADER -->
                <div class="flex items-center space-x-3">
                  <div class="w-11 h-11 rounded-2xl ${app.bgClass} border ${app.borderClass} flex items-center justify-center text-xl shrink-0 shadow-md">
                    <i class="${app.icon} ${app.colorClass}"></i>
                  </div>
                  <div class="truncate flex-1">
                    <h4 class="text-sm font-bold text-white truncate flex items-center gap-1.5">
                      <span>${app.name}</span>
                      ${app.isCustom ? '<span class="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">Custom</span>' : ''}
                    </h4>
                    <span class="text-[10px] text-slate-400 font-medium">${app.category}</span>
                  </div>
                </div>

                <!-- USAGE VS LIMIT PROGRESS BAR -->
                <div class="space-y-1.5">
                  <div class="flex justify-between items-center text-xs">
                    <span class="font-mono font-bold text-white">${this.formatDuration(used)}</span>
                    <span class="text-slate-400 text-[11px] font-mono">Limit: <strong class="text-slate-200">${this.formatDuration(limit)}</strong></span>
                  </div>

                  <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800/80">
                    <div class="h-full rounded-full transition-all duration-300 ${barColor}" style="width: ${pct}%"></div>
                  </div>

                  <div class="flex justify-between items-center text-[10px] font-mono">
                    <span class="${isBlocked ? 'text-rose-400 font-bold' : (isNearLimit ? 'text-amber-400 font-semibold' : 'text-slate-400')}">
                      ${isBlocked ? '100% QUOTA EXHAUSTED' : (isNearLimit ? `${pct}% • Quota warning` : `${pct}% consumed`)}
                    </span>
                    <span class="text-slate-500">
                      ${app.blockEnabled ? '<i class="fa-solid fa-shield text-cyan-400"></i> Shield Enabled' : 'Monitoring only'}
                    </span>
                  </div>
                </div>

                <!-- ACTION BUTTONS -->
                <div class="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900">
                  <button role="button" onclick="window.ArcAppTracker.openLimitModal('${app.id}')" class="py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition flex items-center justify-center gap-1">
                    <i class="fa-solid fa-sliders text-cyan-400 text-[11px]"></i> Limit
                  </button>

                  ${isBlocked ? `
                    <button role="button" onclick="window.ArcAppTracker.showBlockerShield('${app.id}')" class="py-1.5 px-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center justify-center gap-1 shadow-md shadow-rose-600/30">
                      <i class="fa-solid fa-lock text-[11px]"></i> Locked
                    </button>
                  ` : (isActive ? `
                    <button role="button" onclick="window.ArcAppTracker.pauseActiveApp()" class="py-1.5 px-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center justify-center gap-1">
                      <i class="fa-solid fa-pause text-[11px]"></i> In Use
                    </button>
                  ` : `
                    <button role="button" onclick="window.ArcAppTracker.setActiveApp('${app.id}')" class="py-1.5 px-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition flex items-center justify-center gap-1">
                      <i class="fa-solid fa-play text-[11px]"></i> Launch
                    </button>
                  `)}
                </div>

                <!-- EXTRA QUICK CONTROLS (TEST +10M & RESET) -->
                <div class="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                  <button role="button" onclick="window.ArcAppTracker.simulateAddUsage('${app.id}', 600)" title="Add 10 mins testing usage" class="hover:text-cyan-400 transition font-mono flex items-center gap-1">
                    <i class="fa-solid fa-forward-step"></i> +10m Test
                  </button>
                  <div class="flex items-center gap-2">
                    <button role="button" onclick="window.ArcAppTracker.resetAppUsage('${app.id}')" title="Reset today's time" class="hover:text-amber-400 transition">
                      <i class="fa-solid fa-rotate-left"></i> Reset
                    </button>
                    ${app.isCustom ? `
                      <button role="button" onclick="window.ArcAppTracker.deleteCustomApp('${app.id}')" title="Delete custom app" class="hover:text-rose-400 transition">
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    ` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  setFilter(filterId) {
    this.activeFilter = filterId;
    this.renderScreenTimeView();
  }

  setSearch(q) {
    this.searchQuery = q;
    this.renderScreenTimeView();
  }

  updateActiveTickerDom() {
    const kpiEl = document.getElementById('st-kpi-total-time');
    if (kpiEl) {
      let total = 0;
      Object.values(this.usageData).forEach(v => total += (v || 0));
      kpiEl.textContent = this.formatDuration(total);
    }
  }

  /**
   * Inject Fullscreen Blocker Shield Modal
   */
  injectBlockerShieldModal() {
    if (document.getElementById('arc-app-blocker-overlay')) return;

    const div = document.createElement('div');
    div.id = 'arc-app-blocker-overlay';
    div.className = "fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl hidden items-center justify-center p-4 overflow-y-auto";
    div.innerHTML = `
      <div class="relative w-full max-w-lg bg-gradient-to-b from-slate-950 via-slate-900 to-black border-2 border-rose-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(244,63,94,0.35)] space-y-6 text-center animate-zoom-in my-auto">
        <!-- PULSING LOCK ICON -->
        <div class="relative mx-auto w-20 h-20 rounded-3xl bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
          <span class="absolute inset-0 rounded-3xl border border-rose-400 animate-ping opacity-30"></span>
          <i id="blocker-app-icon" class="fa-solid fa-lock text-3xl sm:text-4xl text-rose-500"></i>
        </div>

        <div class="space-y-1.5">
          <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-mono font-black uppercase tracking-widest">
            <span class="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
            DAILY APP LIMIT EXCEEDED
          </div>
          <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
            <span id="blocker-app-name">Application</span> is Blocked
          </h2>
          <p class="text-xs sm:text-sm text-slate-300">
            You have used your allocated daily time limit. Arc Tracker has blocked this application to safeguard your discipline.
          </p>
        </div>

        <!-- STATS BREAKDOWN -->
        <div class="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
          <div>
            <span class="text-[10px] uppercase font-bold text-slate-400 block">Total Used Today</span>
            <div id="blocker-time-used" class="text-lg font-black font-mono text-rose-400">0m 00s</div>
          </div>
          <div>
            <span class="text-[10px] uppercase font-bold text-slate-400 block">Daily Limit Chosen</span>
            <div id="blocker-time-limit" class="text-lg font-black font-mono text-slate-200">0m 00s</div>
          </div>
        </div>

        <!-- RESET TIMER -->
        <div class="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/20 space-y-1">
          <span class="text-[10px] font-bold text-rose-300 uppercase tracking-wider block">Automatic Lockout Resets In:</span>
          <div id="blocker-reset-countdown" class="text-2xl sm:text-3xl font-black font-mono text-rose-400">00h 00m 00s</div>
          <span class="text-[9px] text-slate-400 block">Unlocks automatically at midnight (00:00:00)</span>
        </div>

        <!-- MOTIVATIONAL QUOTE -->
        <blockquote class="text-xs italic text-slate-400 border-l-2 border-rose-500/40 pl-3 text-left">
          "Discipline is choosing between what you want now and what you want most. Stay locked in."
        </blockquote>

        <!-- ANTI-IMPULSE EMERGENCY EXTENSION -->
        <div id="blocker-challenge-box" class="space-y-2 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left">
          <label class="text-[11px] font-bold text-slate-300 flex items-center justify-between">
            <span>Emergency 5-Minute Extension</span>
            <span class="text-[9px] text-rose-400 font-mono">Requires Pledge</span>
          </label>
          <p class="text-[10px] text-slate-400">To prevent impulsive overrides, type <strong class="text-rose-400 font-mono">UNBREAKABLE</strong> below:</p>
          <div class="flex gap-2">
            <input type="text" id="blocker-challenge-input" placeholder="Type UNBREAKABLE" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-rose-400 flex-1">
            <button role="button" onclick="window.ArcAppTracker.submitEmergencyExtension()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/40 font-bold text-xs transition">
              Override
            </button>
          </div>
          <div id="blocker-challenge-error" class="text-[10px] text-rose-400 font-semibold hidden"></div>
        </div>

        <!-- RETURN TO ARC TRACKER -->
        <button role="button" onclick="window.ArcAppTracker.closeBlockerShield(); if (window.switchTab) window.switchTab('tracker');" class="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-black text-sm uppercase tracking-wider transition shadow-lg shadow-cyan-500/25 hover:scale-[1.02]">
          Return to Focus Dashboard
        </button>
      </div>
    `;

    document.body.appendChild(div);
  }

  /**
   * Inject Accessibility Permission Modal
   */
  injectAccessibilityModal() {
    if (document.getElementById('arc-accessibility-modal')) return;

    const div = document.createElement('div');
    div.id = 'arc-accessibility-modal';
    div.className = "fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden items-center justify-center p-4 overflow-y-auto";
    div.innerHTML = `
      <div class="relative w-full max-w-xl bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-zoom-in my-auto">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 text-lg">
              <i class="fa-solid fa-universal-access"></i>
            </div>
            <div>
              <h3 class="text-base sm:text-lg font-black text-white">Accessibility &amp; App Tracking Permissions</h3>
              <p class="text-xs text-slate-400">Enables automated active window telemetry and lockout shield</p>
            </div>
          </div>
          <button role="button" onclick="window.ArcAppTracker.closeAccessibilityModal()" class="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="space-y-3 text-xs text-slate-300">
          <div class="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 space-y-1.5">
            <h4 class="font-bold text-white flex items-center gap-1.5">
              <i class="fa-solid fa-lock text-cyan-400"></i> Why is this permission required?
            </h4>
            <p class="text-slate-300 text-[11px] leading-relaxed">
              Operating systems isolate applications for privacy. To accurately track how many minutes you spend inside specific applications (like YouTube, Instagram, Games, or Browsers) and block them when your limit is reached, Arc Tracker requests local on-device Accessibility &amp; Usage Access.
            </p>
            <div class="text-[10px] text-cyan-300 font-mono pt-1">
              ✓ 100% Offline &amp; Private • Zero cloud telemetry • Data never leaves your device
            </div>
          </div>

          <div class="space-y-2">
            <h4 class="font-bold text-white uppercase text-[11px] tracking-wider">Device Instructions:</h4>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span class="font-bold text-cyan-300 flex items-center gap-1">
                  <i class="fa-brands fa-android"></i> Android Phones / Tablets
                </span>
                <p class="text-slate-400 text-[10px]">Enable Accessibility Service &amp; Usage Access in Settings so Arc Tracker can monitor other apps.</p>
                <div class="flex gap-1.5 pt-1">
                  <button role="button" onclick="window.ArcAppTracker.openAndroidAccessibilitySettings()" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold">
                    Accessibility
                  </button>
                  <button role="button" onclick="window.ArcAppTracker.openAndroidUsageSettings()" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold">
                    Usage Access
                  </button>
                </div>
              </div>

              <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span class="font-bold text-cyan-300 flex items-center gap-1">
                  <i class="fa-brands fa-windows"></i> Windows &amp; Laptops
                </span>
                <p class="text-slate-400 text-[10px]">Permit Background Window Monitoring &amp; Notifications so Arc Tracker can enforce boundaries.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
          <button role="button" onclick="window.ArcAppTracker.closeAccessibilityModal()" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition">
            Cancel
          </button>
          <button role="button" onclick="window.ArcAppTracker.confirmAccessibilityGranted()" class="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20">
            Grant &amp; Confirm Permission
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(div);
  }

  /**
   * Inject Limit Configuration Modal
   */
  injectLimitConfigModal() {
    if (document.getElementById('arc-limit-config-modal')) return;

    const div = document.createElement('div');
    div.id = 'arc-limit-config-modal';
    div.className = "fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden items-center justify-center p-4 overflow-y-auto";
    div.innerHTML = `
      <div class="relative w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-5 animate-zoom-in my-auto">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 id="limit-modal-title" class="text-base font-black text-white">Set Daily App Limit</h3>
          <button role="button" onclick="window.ArcAppTracker.closeLimitModal()" class="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="space-y-4">
          <!-- QUICK PRESET BUTTONS -->
          <div class="space-y-1.5">
            <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Presets</label>
            <div class="grid grid-cols-4 gap-2 text-xs font-semibold">
              <button role="button" onclick="window.ArcAppTracker.setPresetLimit(15)" class="py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-black transition">15m</button>
              <button role="button" onclick="window.ArcAppTracker.setPresetLimit(30)" class="py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-black transition">30m</button>
              <button role="button" onclick="window.ArcAppTracker.setPresetLimit(45)" class="py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-black transition">45m</button>
              <button role="button" onclick="window.ArcAppTracker.setPresetLimit(60)" class="py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-black transition">1 hour</button>
              <button role="button" onclick="window.ArcAppTracker.setPresetLimit(90)" class="py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-black transition">1.5h</button>
              <button role="button" onclick="window.ArcAppTracker.setPresetLimit(120)" class="py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-black transition">2 hours</button>
              <button role="button" onclick="window.ArcAppTracker.setPresetLimit(180)" class="py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-black transition">3 hours</button>
              <button role="button" onclick="window.ArcAppTracker.setPresetLimit(240)" class="py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-black transition">4 hours</button>
            </div>
          </div>

          <!-- CUSTOM MINUTES INPUT -->
          <div class="space-y-1.5">
            <label for="limit-modal-mins-input" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Custom Limit (Minutes)</label>
            <div class="flex items-center gap-2">
              <input type="number" id="limit-modal-mins-input" min="1" max="1440" value="30" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm font-mono text-cyan-400 font-bold focus:outline-none focus:border-cyan-400">
              <span class="text-xs text-slate-400 font-bold">Minutes</span>
            </div>
          </div>

          <!-- HARD BLOCK TOGGLE -->
          <div class="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <span class="text-xs font-bold text-white block">Enforce Hard Lockout</span>
              <span class="text-[10px] text-slate-400 block">Blocks app when limit is reached</span>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="limit-modal-block-toggle" checked class="sr-only peer">
              <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button role="button" onclick="window.ArcAppTracker.closeLimitModal()" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition">
            Cancel
          </button>
          <button role="button" onclick="window.ArcAppTracker.saveAppLimitFromModal()" class="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition shadow-md shadow-cyan-500/20">
            Save Limit
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(div);
  }

  /**
   * Inject Add Custom App Modal
   */
  injectAddCustomAppModal() {
    if (document.getElementById('arc-add-app-modal')) return;

    const div = document.createElement('div');
    div.id = 'arc-add-app-modal';
    div.className = "fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden items-center justify-center p-4 overflow-y-auto";
    div.innerHTML = `
      <div class="relative w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4 animate-zoom-in my-auto">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-base font-black text-white">Add Custom App to Track</h3>
          <button role="button" onclick="window.ArcAppTracker.closeAddCustomAppModal()" class="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div class="space-y-1">
            <label for="add-app-name" class="font-bold text-slate-300">App Name</label>
            <input type="text" id="add-app-name" placeholder="e.g. Minecraft, Telegram, Roblox, Spotify" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400">
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="space-y-1">
              <label for="add-app-category" class="font-bold text-slate-300">Category</label>
              <select id="add-app-category" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-300 focus:outline-none focus:border-cyan-400">
                <option value="Social Media">Social Media</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Gaming">Gaming</option>
                <option value="Productivity">Productivity</option>
                <option value="Messaging">Messaging</option>
                <option value="Browsing">Browsing</option>
              </select>
            </div>

            <div class="space-y-1">
              <label for="add-app-limit" class="font-bold text-slate-300">Daily Limit (Mins)</label>
              <input type="number" id="add-app-limit" value="30" min="1" max="1440" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-400 font-mono font-bold focus:outline-none focus:border-cyan-400">
            </div>
          </div>

          <div class="space-y-1">
            <label for="add-app-proc" class="font-bold text-slate-300">Process Name or Domain (Optional)</label>
            <input type="text" id="add-app-proc" placeholder="e.g. spotify.exe or telegram.org" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-cyan-400">
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button role="button" onclick="window.ArcAppTracker.closeAddCustomAppModal()" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition">
            Cancel
          </button>
          <button role="button" onclick="window.ArcAppTracker.saveCustomApp()" class="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition shadow-md shadow-cyan-500/20">
            Add App
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(div);
  }
}

export const arcAppTracker = new ArcAppTrackerEngine();

if (typeof window !== 'undefined') {
  window.ArcAppTracker = arcAppTracker;
}
