/**
 * Shared Global Registry & Resilient Compatibility Bridge
 * Ensures all core helpers exist on `window` and global scope immediately.
 */

// 1. Resilient localStorage accessors
export function lsGetRaw(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

export function getLocalStorageItem(key, defaultValue = null) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

export function setLocalStorageItem(key, value) {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    if (key && (key.includes('screentime') || key.includes('tracker_state')) && window.ArcStorage && typeof window.ArcStorage.scheduleAutoSync === 'function') {
      window.ArcStorage.scheduleAutoSync();
    }
  } catch (e) {}
}

export function saveToLocalStorage() {
  if (window.ArcStorage && typeof window.ArcStorage.saveToLocalStorage === 'function') {
    return window.ArcStorage.saveToLocalStorage();
  }
  try {
    if (window.state) {
      localStorage.setItem('arc_tracker_state', JSON.stringify(window.state));
    }
    if (window.ArcStorage && typeof window.ArcStorage.scheduleAutoSync === 'function') {
      window.ArcStorage.scheduleAutoSync();
    }
  } catch (e) {}
}

// 2. Date and Time Formatters
export function formatDateKey(d) {
  if (!d) d = new Date();
  if (typeof d === 'string') return d;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatDuration(totalSecs) {
  const s = Math.max(0, Math.floor(Number(totalSecs) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const remSec = s % 60;
  return h > 0 ? `${h}h ${m}m ${remSec}s` : (m > 0 ? `${m}m ${remSec}s` : `${remSec}s`);
}

export function formatDurationShort(totalSecs) {
  const s = Math.max(0, Math.floor(Number(totalSecs) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// 3. Arc Window & Day Calculations
export function getArcWindow() {
  const mk = v => { const d = new Date(v + 'T00:00:00'); return isNaN(d) ? null : d; };
  let c = null;
  try { c = window.SettingsApp && SettingsApp.get && SettingsApp.get().arc; } catch (_) {}
  let s = c && mk(c.start), e = c && mk(c.end);
  if (!s || !e || e < s) { s = new Date(2026, 9, 1); e = new Date(2026, 11, 31); c = null; }
  const stock = !c || (c.start === '2026-10-01' && c.end === '2026-12-31');
  const isSummer = (window.state && window.state.currentArc === 'summer');
  if (isSummer && stock) { s = new Date(e.getFullYear() + 1, 3, 1); e = new Date(s.getFullYear(), 3, 92); }
  return { start: s, end: e, total: Math.round((e - s) / 864e5) + 1 };
}

export function getEffectiveToday() {
  const dOverride = (typeof window !== 'undefined' && window.dayOverride !== undefined) ? window.dayOverride : null;
  if (dOverride) {
    const w = getArcWindow();
    return new Date(w.start.getFullYear(), w.start.getMonth(), w.start.getDate() + dOverride - 1);
  }
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getTodayKey() {
  return formatDateKey(getEffectiveToday());
}

// 4. Grading System
export function getGradeInfo(pct, hasHistory) {
  if (!hasHistory && (pct === 0 || isNaN(pct))) {
    return {
      grade: '-',
      bgClasses: 'calendar-grade-none bg-slate-900/60 border-slate-800/80 text-slate-400',
      badgeClass: 'bg-slate-800/80 text-slate-400 border border-slate-700/60',
      textClass: 'text-slate-500',
      barBgClass: 'bg-slate-600',
      cardClass: 'calendar-grade-none',
      glintHtml: ''
    };
  }
  if (pct >= 90) return {
    grade: 'S',
    bgClasses: 'calendar-grade-s text-emerald-100',
    badgeClass: 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/60 shadow-[0_0_12px_rgba(16,185,129,0.5)]',
    textClass: 'text-emerald-300 font-extrabold',
    barBgClass: 'bg-emerald-400',
    cardClass: 'calendar-grade-s',
    glintHtml: '<span class="grade-glint grade-glint-s" aria-hidden="true">✦</span>'
  };
  if (pct >= 75) return {
    grade: 'A',
    bgClasses: 'calendar-grade-a text-cyan-100',
    badgeClass: 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 shadow-[0_0_8px_rgba(6,182,212,0.4)]',
    textClass: 'text-cyan-300 font-extrabold',
    barBgClass: 'bg-cyan-400',
    cardClass: 'calendar-grade-a',
    glintHtml: '<span class="grade-glint grade-glint-a" aria-hidden="true">◆</span>'
  };
  if (pct >= 60) return {
    grade: 'B',
    bgClasses: 'calendar-grade-b text-purple-100',
    badgeClass: 'bg-purple-500/30 text-purple-300 border border-purple-400/50 shadow-[0_0_6px_rgba(168,85,247,0.3)]',
    textClass: 'text-purple-300 font-extrabold',
    barBgClass: 'bg-purple-400',
    cardClass: 'calendar-grade-b',
    glintHtml: ''
  };
  if (pct >= 40) return {
    grade: 'C',
    bgClasses: 'calendar-grade-c text-amber-200',
    badgeClass: 'bg-amber-500/30 text-amber-300 border border-amber-400/40',
    textClass: 'text-amber-400 font-extrabold',
    barBgClass: 'bg-amber-400',
    cardClass: 'calendar-grade-c',
    glintHtml: ''
  };
  return {
    grade: 'F',
    bgClasses: 'calendar-grade-f text-rose-200',
    badgeClass: 'bg-rose-500/30 text-rose-300 border border-rose-400/40',
    textClass: 'text-rose-400 font-extrabold',
    barBgClass: 'bg-rose-500',
    cardClass: 'calendar-grade-f',
    glintHtml: ''
  };
}

// 5. User Feedback & Audio
export function showToast(message) {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toast-message');
  if (toast && msgEl) {
    msgEl.innerText = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    clearTimeout(window.__toastTimeout);
    window.__toastTimeout = setTimeout(() => {
      toast.classList.add('translate-y-20', 'opacity-0');
    }, 2800);
  }
}

export function playSfx(type) {
  if (window.ArcAudio && typeof window.ArcAudio.playSfx === 'function') {
    return window.ArcAudio.playSfx(type);
  }
}

// 6. Fullscreen Controller
export function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  } catch (e) {}
}

if (typeof document !== 'undefined') {
  document.addEventListener('fullscreenchange', () => {
    const icon = document.getElementById('header-fullscreen-icon');
    if (icon) {
      if (document.fullscreenElement) {
        icon.className = 'fa-solid fa-compress text-xs';
      } else {
        icon.className = 'fa-solid fa-expand text-xs';
      }
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'F11') {
      e.preventDefault();
      toggleFullscreen();
    }
  });
}

// Expose all early on window
if (typeof window !== 'undefined') {
  window.lsGetRaw = lsGetRaw;
  window.getLocalStorageItem = getLocalStorageItem;
  window.setLocalStorageItem = setLocalStorageItem;
  window.saveToLocalStorage = saveToLocalStorage;
  window.formatDateKey = formatDateKey;
  window.formatDuration = formatDuration;
  window.formatDurationShort = formatDurationShort;
  window.getArcWindow = getArcWindow;
  window.getEffectiveToday = getEffectiveToday;
  window.getTodayKey = getTodayKey;
  window.getGradeInfo = getGradeInfo;
  window.showToast = showToast;
  window.playSfx = playSfx;
  window.toggleFullscreen = toggleFullscreen;
}
