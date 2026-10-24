/**
 * Arc Tracker — Universal Automated App Screen Time & App Blocker Engine
 * Tracks active screen time per individual app and enforces user-defined daily limits.
 * Prompts for Accessibility & Usage Access permissions.
 * Hard-blocks apps from opening when daily time limit is exceeded.
 * Blocks distracting apps during Focus Time & Pomodoro sessions with custom configuration.
 * Filters and blocks distracting YouTube channels while allowing educational/productive ones.
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
    blockInFocus: true,
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
    blockInFocus: true,
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
    blockInFocus: true,
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
    blockInFocus: true,
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
    blockInFocus: true,
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
    blockInFocus: true,
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
    blockInFocus: true,
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
    blockInFocus: true,
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
    blockInFocus: false,
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
    blockInFocus: false,
    isCustom: false
  }
];

export const DEFAULT_BLOCKED_YOUTUBE_CHANNELS = [
  { handle: '@MrBeast', name: 'MrBeast', reason: 'High sensory distraction' },
  { handle: '@Sidemen', name: 'Sidemen', reason: 'Entertainment / Challenges' },
  { handle: '@IShowSpeed', name: 'IShowSpeed', reason: 'Streaming / Noise' },
  { handle: '@PewDiePie', name: 'PewDiePie', reason: 'Gaming / Entertainment' },
  { handle: '@LoganPaul', name: 'Logan Paul', reason: 'Entertainment / Vlogs' },
  { handle: '@TSeries', name: 'T-Series', reason: 'Music videos / Distraction' },
  { handle: '@DudePerfect', name: 'Dude Perfect', reason: 'Entertainment / Tricks' },
  { handle: 'Shorts', name: 'YouTube Shorts Feed', reason: 'Infinite scrolling short-form loop' }
];

export const DEFAULT_ALLOWED_YOUTUBE_CHANNELS = [
  { handle: '@freecodecamp', name: 'freeCodeCamp.org', category: 'Programming' },
  { handle: '@hubermanlab', name: 'Andrew Huberman', category: 'Neuroscience & Health' },
  { handle: '@lexfridman', name: 'Lex Fridman', category: 'Deep Conversations & AI' },
  { handle: '@3blue1brown', name: '3Blue1Brown', category: 'Mathematics & Science' },
  { handle: '@fireship', name: 'Fireship', category: 'High-Velocity Tech' },
  { handle: '@veritasium', name: 'Veritasium', category: 'Science Education' },
  { handle: '@mitocw', name: 'MIT OpenCourseWare', category: 'Academic Lectures' }
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

    // Focus & Pomodoro Blocking
    this.focusSessionActive = false;
    this.focusSessionSecondsLeft = 25 * 60; // 25 mins default
    this.focusInterval = null;

    // YouTube Channel Filter
    this.youtubeFilter = {
      enabled: true,
      blockShorts: true,
      blockedChannels: JSON.parse(JSON.stringify(DEFAULT_BLOCKED_YOUTUBE_CHANNELS))
    };
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
    await this.loadYouTubeFilter();

    // Start 1-second precision tick for active app and focus countdown
    this.startHeartbeat();

    // Attach listeners for visibility
    this.setupListeners();

    console.log('[ArcAppTracker] Automated App Screen Time & Blocker Engine initialized.');
  }

  async loadTrackedApps() {
    try {
      const stored = await arcStorage.getItem('arc_tracked_apps_catalog');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
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

  async loadYouTubeFilter() {
    try {
      const stored = await arcStorage.getItem('arc_youtube_channel_filter');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          this.youtubeFilter = { ...this.youtubeFilter, ...parsed };
        }
      }
    } catch (e) {
      console.warn('[ArcAppTracker] Error loading YouTube filter:', e);
    }
  }

  async saveYouTubeFilter() {
    try {
      await arcStorage.setItem('arc_youtube_channel_filter', JSON.stringify(this.youtubeFilter));
    } catch (e) {
      console.warn('[ArcAppTracker] Error saving YouTube filter:', e);
    }
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
      this.closeBlockerShield();
      if (typeof window !== 'undefined' && typeof window.renderScreenTimeView === 'function') {
        window.renderScreenTimeView();
      }
      console.log('[ArcAppTracker] Midnight rollover: Daily app limits reset.');
    }
  }

  isFocusActive() {
    // Check if PP12 Pomodoro is actively running in work mode
    if (typeof window !== 'undefined' && typeof window.F !== 'undefined' && window.F) {
      if (window.F.run && window.F.mode === 'work') return true;
    }
    return this.focusSessionActive;
  }

  getFocusTimeRemainingFormatted() {
    if (typeof window !== 'undefined' && typeof window.F !== 'undefined' && window.F && window.F.left !== undefined) {
      const mins = Math.floor(window.F.left / 60);
      const secs = window.F.left % 60;
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    const mins = Math.floor(this.focusSessionSecondsLeft / 60);
    const secs = this.focusSessionSecondsLeft % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  tick() {
    this.checkMidnightRollover();

    // Decrement internal focus session if running
    if (this.focusSessionActive && this.focusSessionSecondsLeft > 0) {
      this.focusSessionSecondsLeft--;
      if (this.focusSessionSecondsLeft <= 0) {
        this.stopFocusSession(true);
      }
    }

    if (!this.isTracking) return;

    // If an app is active in foreground
    if (this.activeAppId) {
      const app = this.getApp(this.activeAppId);
      if (app) {
        // Check if Focus Mode became active and this app is blocked in focus
        if (this.isFocusActive() && app.blockInFocus) {
          this.triggerFocusBlock(app.id);
          return;
        }

        // Increment app usage
        this.usageData[this.activeAppId] = (this.usageData[this.activeAppId] || 0) + 1;
        this.activeAppSecondsInSession++;

        const used = this.usageData[this.activeAppId];
        const limit = app.dailyLimitSecs;

        // Check if daily limit reached
        if (app.blockEnabled && used >= limit) {
          this.triggerAppBlock(app.id);
          return;
        }
      }
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
    if (!app) return false;

    // Check Focus / Pomodoro block
    if (this.isFocusActive() && app.blockInFocus) {
      return true;
    }

    // Check Daily limit block
    if (app.blockEnabled) {
      const used = this.getAppUsage(appId);
      if (used >= app.dailyLimitSecs) return true;
    }

    return false;
  }

  /**
   * Set active app for foreground tracking
   */
  setActiveApp(appId) {
    const app = this.getApp(appId);
    if (!app) return false;

    // 1. Check if Focus Mode is running and app is blocked in focus
    if (this.isFocusActive() && app.blockInFocus) {
      this.triggerFocusBlock(appId);
      return false;
    }

    // 2. Check if daily quota is reached
    if (app.blockEnabled && this.getAppUsage(appId) >= app.dailyLimitSecs) {
      this.triggerAppBlock(appId);
      return false;
    }

    this.activeAppId = appId;
    this.activeAppSecondsInSession = 0;
    this.playAudio('click');

    if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
      window.showToast(`Tracking active on ${app.name}`);
    }

    if (typeof window !== 'undefined' && typeof window.renderScreenTimeView === 'function') {
      window.renderScreenTimeView();
    }
    return true;
  }

  pauseActiveApp() {
    this.activeAppId = null;
    this.activeAppSecondsInSession = 0;
    if (typeof window !== 'undefined' && typeof window.renderScreenTimeView === 'function') {
      window.renderScreenTimeView();
    }
  }

  /**
   * Trigger app block when daily limit is reached
   */
  triggerAppBlock(appId) {
    const app = this.getApp(appId);
    if (!app) return;

    if (this.activeAppId === appId) {
      this.activeAppId = null;
    }

    this.playAudio('alarm');

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(`⛔ App Blocked: ${app.name}`, {
          body: `Daily limit of ${this.formatDuration(app.dailyLimitSecs)} reached. Access has been locked for today.`,
          icon: './icons/128x128.png'
        });
      } catch (_) {}
    }

    if (typeof window !== 'undefined' && typeof window.showBlockerShield === 'function') {
      window.showBlockerShield(appId);
    }
    if (typeof window !== 'undefined' && typeof window.renderScreenTimeView === 'function') {
      window.renderScreenTimeView();
    }
  }

  /**
   * Trigger focus block when launched during active Pomodoro / Focus session
   */
  triggerFocusBlock(appId) {
    const app = this.getApp(appId);
    if (!app) return;

    if (this.activeAppId === appId) {
      this.activeAppId = null;
    }

    this.playAudio('alarm');

    if (typeof window !== 'undefined' && typeof window.showFocusBlockerShield === 'function') {
      window.showFocusBlockerShield(appId);
    } else if (typeof window !== 'undefined' && typeof window.showBlockerShield === 'function') {
      window.showBlockerShield(appId);
    }

    if (typeof window !== 'undefined' && typeof window.renderScreenTimeView === 'function') {
      window.renderScreenTimeView();
    }
  }

  /**
   * Focus Mode & Pomodoro Controls
   */
  startFocusSession(minutes = 25) {
    this.focusSessionActive = true;
    this.focusSessionSecondsLeft = minutes * 60;

    // Also trigger global PP12 Pomodoro if available
    if (typeof window !== 'undefined' && typeof window.fstart === 'function') {
      try { window.fstart(); } catch (_) {}
    }

    this.playAudio('success');
    if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
      window.showToast(`Focus session started (${minutes}m). Distracting apps blocked!`);
    }

    if (typeof window !== 'undefined' && typeof window.renderScreenTimeView === 'function') {
      window.renderScreenTimeView();
    }
  }

  stopFocusSession(completed = false) {
    this.focusSessionActive = false;

    if (typeof window !== 'undefined' && typeof window.fpause === 'function') {
      try { window.fpause(); } catch (_) {}
    }

    if (completed) {
      this.playAudio('success');
      if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
        window.showToast("Focus session completed! Great discipline.");
      }
    } else {
      this.playAudio('click');
      if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
        window.showToast("Focus session stopped.");
      }
    }

    if (typeof window !== 'undefined' && typeof window.renderScreenTimeView === 'function') {
      window.renderScreenTimeView();
    }
  }

  toggleAppFocusBlock(appId) {
    const app = this.getApp(appId);
    if (!app) return;

    app.blockInFocus = !app.blockInFocus;
    this.saveTrackedApps();
    this.playAudio('click');

    if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
      window.showToast(`${app.name} is now ${app.blockInFocus ? 'BLOCKED' : 'ALLOWED'} during focus.`);
    }

    if (typeof window !== 'undefined' && typeof window.renderScreenTimeView === 'function') {
      window.renderScreenTimeView();
    }
  }

  setAllAppsFocusBlock(block) {
    this.apps.forEach(app => {
      if (block === 'distractions') {
        app.blockInFocus = (app.category === 'Social Media' || app.category === 'Entertainment' || app.category === 'Gaming' || app.category === 'Messaging');
      } else {
        app.blockInFocus = Boolean(block);
      }
    });
    this.saveTrackedApps();
    this.playAudio('click');

    if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
      window.showToast("Focus blocklist settings updated.");
    }

    if (typeof window !== 'undefined' && typeof window.renderScreenTimeView === 'function') {
      window.renderScreenTimeView();
    }
  }

  /**
   * YouTube Channel Filter Methods
   */
  isYouTubeChannelBlocked(channelInput) {
    if (!this.youtubeFilter.enabled) return false;
    if (!channelInput) return false;

    const query = channelInput.trim().toLowerCase();

    // Check Shorts
    if (this.youtubeFilter.blockShorts && (query === 'shorts' || query.includes('/shorts') || query.includes('short'))) {
      return { blocked: true, channel: 'YouTube Shorts', reason: 'Short-form distraction loop' };
    }

    for (const b of this.youtubeFilter.blockedChannels) {
      const h = b.handle.toLowerCase().replace('@', '');
      const n = b.name.toLowerCase();
      const qClean = query.replace('@', '');

      if (qClean === h || query.includes(h) || query.includes(n) || n.includes(qClean)) {
        return { blocked: true, channel: b.name || b.handle, reason: b.reason || 'Distracting channel' };
      }
    }

    return false;
  }

  addBlockedYouTubeChannel(handle, name, reason) {
    if (!handle) return;
    const cleanHandle = handle.startsWith('@') ? handle : '@' + handle;
    const existing = this.youtubeFilter.blockedChannels.find(c => c.handle.toLowerCase() === cleanHandle.toLowerCase());
    if (existing) {
      if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
        window.showToast(`${cleanHandle} is already in the blocklist.`);
      }
      return;
    }

    this.youtubeFilter.blockedChannels.push({
      handle: cleanHandle,
      name: name || cleanHandle,
      reason: reason || 'Distracting creator'
    });

    this.saveYouTubeFilter();
    this.playAudio('success');

    if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
      window.showToast(`Blocked channel ${cleanHandle} on YouTube.`);
    }

    if (typeof window !== 'undefined' && typeof window.renderYouTubeFilterList === 'function') {
      window.renderYouTubeFilterList();
    }
  }

  removeBlockedYouTubeChannel(handle) {
    this.youtubeFilter.blockedChannels = this.youtubeFilter.blockedChannels.filter(c => c.handle.toLowerCase() !== handle.toLowerCase());
    this.saveYouTubeFilter();
    this.playAudio('click');

    if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
      window.showToast(`Removed ${handle} from YouTube blocklist.`);
    }

    if (typeof window !== 'undefined' && typeof window.renderYouTubeFilterList === 'function') {
      window.renderYouTubeFilterList();
    }
  }

  toggleYouTubeShortsBlock() {
    this.youtubeFilter.blockShorts = !this.youtubeFilter.blockShorts;
    this.saveYouTubeFilter();
    this.playAudio('click');

    if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
      window.showToast(this.youtubeFilter.blockShorts ? "YouTube Shorts Feed BLOCKED." : "YouTube Shorts allowed.");
    }
  }

  toggleYouTubeFilterEnabled() {
    this.youtubeFilter.enabled = !this.youtubeFilter.enabled;
    this.saveYouTubeFilter();
    this.playAudio('click');

    if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
      window.showToast(this.youtubeFilter.enabled ? "YouTube Channel Filter ACTIVE." : "YouTube Channel Filter paused.");
    }
  }

  /**
   * Audio Synthesizer
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
      }
    } catch (_) {}
  }

  formatDuration(totalSecs) {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  }
}

export const arcAppTracker = new ArcAppTrackerEngine();

if (typeof window !== 'undefined') {
  window.ArcAppTracker = arcAppTracker;
  window.startFocusSession = (mins) => arcAppTracker.startFocusSession(mins);
  window.stopFocusSession = (completed) => arcAppTracker.stopFocusSession(completed);
  window.toggleAppFocusBlock = (appId) => arcAppTracker.toggleAppFocusBlock(appId);
  window.setAllAppsFocusBlock = (type) => arcAppTracker.setAllAppsFocusBlock(type);
  window.toggleYouTubeFilterEnabled = () => arcAppTracker.toggleYouTubeFilterEnabled();
  window.toggleYouTubeShortsBlock = () => arcAppTracker.toggleYouTubeShortsBlock();
  window.removeBlockedYouTubeChannel = (h) => arcAppTracker.removeBlockedYouTubeChannel(h);
}

