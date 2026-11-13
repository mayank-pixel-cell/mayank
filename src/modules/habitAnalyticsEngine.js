/**
 * ============================================================================
 * ARC TRACKER — PER-HABIT DEEP ANALYTICS & VELOCITY ENGINE
 * Module: ArcHabitAnalytics
 *
 * Provides a unified dual-surface deep-analytics engine:
 * Surface A: Slide-Over Quick-Inspect Drawer (#arc-habit-analytics-drawer)
 * Surface B: Full Embedded Section in Results Tab (#habit-deep-analytics-panel)
 * ============================================================================
 */

(function(global) {
  'use strict';

  // Local helper shortcuts
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const pad = n => String(n).padStart(2, '0');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');

  const getTodayKey = () => (typeof global.getTodayKey === 'function' ? global.getTodayKey() : new Date().toISOString().split('T')[0]);
  const getEffectiveToday = () => (typeof global.getEffectiveToday === 'function' ? global.getEffectiveToday() : new Date());
  const formatDateKey = d => (typeof global.formatDateKey === 'function' ? global.formatDateKey(d) : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
  const getArcWindow = () => (typeof global.getArcWindow === 'function' ? global.getArcWindow() : { start: new Date(2026, 9, 1), end: new Date(2026, 11, 31), total: 92 });

  const CATEGORIES = global.CATEGORIES || {
    'Physical': { color: '#00F0FF', icon: 'fa-solid fa-dumbbell', desc: 'Body composition & strength' },
    'Mindset': { color: '#8B5CF6', icon: 'fa-solid fa-brain', desc: 'Mental toughness & reading' },
    'Productivity': { color: '#14B8A6', icon: 'fa-solid fa-bolt', desc: 'Execution & deep work' },
    'Discipline': { color: '#F59E0B', icon: 'fa-solid fa-shield-halved', desc: 'Sleep schedule & diet' }
  };

  // Internal module state
  const state = {
    selectedHabitId: null,
    viewMode: 'matrix', // 'matrix' | 'calendar'
    calendarMonth: null, // Date object for calendar mode
    hoveredDateKey: null,
    drawerOpen: false,
    initialized: false
  };

  /**
   * Safe getter for current habit list
   */
  function getHabitsList() {
    const list = (global.state && Array.isArray(global.state.habits) && global.state.habits.length)
      ? global.state.habits
      : (global.DEFAULT_HABITS || []);
    return list;
  }

  function getActiveHabit() {
    const habits = getHabitsList();
    if (!habits.length) return null;
    let found = habits.find(h => String(h.id) === String(state.selectedHabitId));
    if (!found) {
      found = habits[0];
      state.selectedHabitId = found.id;
    }
    return found;
  }

  /**
   * Determine exact completion status of a habit on a date key
   * Returns: 'completed' | 'missed' | 'frozen' | 'future' | 'prior'
   */
  function getHabitStatus(habitId, dateKey) {
    const todayKey = getTodayKey();
    const arcWin = getArcWindow();
    const arcStartKey = formatDateKey(arcWin.start);
    const arcEndKey = formatDateKey(arcWin.end);

    if (dateKey < arcStartKey) return 'prior';
    if (dateKey > todayKey) return 'future';

    const dailyHabits = (global.state && global.state.dailyHabits) || {};
    const dayData = dailyHabits[dateKey];
    const isToday = (dateKey === todayKey);

    let isDone = false;
    if (isToday) {
      if (dayData && dayData[habitId] !== undefined) {
        isDone = !!dayData[habitId];
      } else {
        const habits = getHabitsList();
        const cur = habits.find(h => String(h.id) === String(habitId));
        isDone = !!(cur && cur.completed);
      }
    } else {
      isDone = !!(dayData && dayData[habitId]);
    }

    if (isDone) return 'completed';

    // Check if protected by Streak Freeze
    const isFrozen = !!(global.__sfzDay && global.__sfzDay(dateKey));
    if (isFrozen) return 'frozen';

    return 'missed';
  }

  /**
   * Compute comprehensive analytics payload for a habit
   */
  function computeAnalytics(habitId) {
    const habit = getHabitsList().find(h => String(h.id) === String(habitId)) || getActiveHabit();
    if (!habit) return null;

    const today = getEffectiveToday();
    const todayKey = getTodayKey();
    const arcWin = getArcWindow();

    // 1. Elapsed arc days (from arc start to today)
    const elapsedDays = [];
    const cur = new Date(arcWin.start);
    cur.setHours(0, 0, 0, 0);
    const todayMid = new Date(today);
    todayMid.setHours(0, 0, 0, 0);

    while (cur <= todayMid) {
      const k = formatDateKey(cur);
      const st = getHabitStatus(habit.id, k);
      elapsedDays.push({
        date: new Date(cur),
        dateKey: k,
        status: st,
        dayOfWeek: cur.getDay() // 0=Sun, 6=Sat
      });
      cur.setDate(cur.getDate() + 1);
    }

    // KPI Counters
    let completedCount = 0;
    let missedCount = 0;
    let frozenCount = 0;

    elapsedDays.forEach(d => {
      if (d.status === 'completed') completedCount++;
      else if (d.status === 'frozen') frozenCount++;
      else if (d.status === 'missed') missedCount++;
    });

    const totalElapsed = elapsedDays.length;
    const completionRate = totalElapsed > 0 ? Math.round((completedCount / totalElapsed) * 100) : 0;

    // 2. Streaks
    let curStreak = 0;
    // Check backwards from today or yesterday
    let checkDate = new Date(todayMid);
    const todayStatus = getHabitStatus(habit.id, todayKey);

    if (todayStatus === 'completed') {
      curStreak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
      while (checkDate >= arcWin.start) {
        const k = formatDateKey(checkDate);
        const st = getHabitStatus(habit.id, k);
        if (st === 'completed' || st === 'frozen') {
          curStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    } else {
      // Check from yesterday
      checkDate.setDate(checkDate.getDate() - 1);
      while (checkDate >= arcWin.start) {
        const k = formatDateKey(checkDate);
        const st = getHabitStatus(habit.id, k);
        if (st === 'completed' || st === 'frozen') {
          curStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Best Streak
    let bestStreak = 0;
    let run = 0;
    elapsedDays.forEach(d => {
      if (d.status === 'completed' || d.status === 'frozen') {
        run++;
        if (run > bestStreak) bestStreak = run;
      } else {
        run = 0;
      }
    });

    // 3. Day of week breakdown (0=Sun .. 6=Sat)
    const dayNamesShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayStats = Array.from({ length: 7 }, (_, i) => ({
      index: i,
      short: dayNamesShort[i],
      full: dayNamesFull[i],
      total: 0,
      completed: 0,
      missed: 0,
      frozen: 0
    }));

    elapsedDays.forEach(d => {
      const idx = d.dayOfWeek;
      dayStats[idx].total++;
      if (d.status === 'completed') dayStats[idx].completed++;
      else if (d.status === 'missed') dayStats[idx].missed++;
      else if (d.status === 'frozen') dayStats[idx].frozen++;
    });

    dayStats.forEach(ds => {
      ds.pct = ds.total > 0 ? Math.round((ds.completed / ds.total) * 100) : 0;
      ds.missRate = ds.total > 0 ? Math.round((ds.missed / ds.total) * 100) : 0;
    });

    // Determine Weakest Day
    let weakest = null;
    let highestMiss = 0;
    dayStats.forEach(ds => {
      if (ds.missed > 0 && ds.missRate > highestMiss) {
        highestMiss = ds.missRate;
        weakest = ds;
      }
    });

    // 4. Monthly Calculations: Last Month vs This Month (Actual + Estimated)
    const curYear = today.getFullYear();
    const curMonth = today.getMonth(); // 0..11

    // Last Month
    const lmDate = new Date(curYear, curMonth - 1, 1);
    const lmYear = lmDate.getFullYear();
    const lmMonth = lmDate.getMonth();
    const daysInLastMonth = new Date(lmYear, lmMonth + 1, 0).getDate();
    let lastMonthCount = 0;

    for (let d = 1; d <= daysInLastMonth; d++) {
      const k = `${lmYear}-${pad(lmMonth + 1)}-${pad(d)}`;
      if (getHabitStatus(habit.id, k) === 'completed') {
        lastMonthCount++;
      }
    }
    const lastMonthPct = Math.round((lastMonthCount / daysInLastMonth) * 100);
    const lastMonthName = lmDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // This Month
    const daysInCurrentMonth = new Date(curYear, curMonth + 1, 0).getDate();
    const elapsedDaysInCurrentMonth = today.getDate();
    let completedThisMonthSoFar = 0;

    for (let d = 1; d <= elapsedDaysInCurrentMonth; d++) {
      const k = `${curYear}-${pad(curMonth + 1)}-${pad(d)}`;
      if (getHabitStatus(habit.id, k) === 'completed') {
        completedThisMonthSoFar++;
      }
    }
    const thisMonthSoFarPct = Math.round((completedThisMonthSoFar / elapsedDaysInCurrentMonth) * 100);
    const thisMonthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Velocity Projection
    const estThisMonth = Math.min(
      daysInCurrentMonth,
      Math.round((completedThisMonthSoFar / Math.max(1, elapsedDaysInCurrentMonth)) * daysInCurrentMonth)
    );
    const estThisMonthPct = Math.round((estThisMonth / daysInCurrentMonth) * 100);
    const paceDelta = estThisMonth - lastMonthCount;

    // 5. Weekly Calculations (Last 8 Weeks)
    const weeks = [];
    const monOffset = (today.getDay() + 6) % 7; // Mon=0, Sun=6
    const thisMonday = new Date(today);
    thisMonday.setDate(today.getDate() - monOffset);
    thisMonday.setHours(0, 0, 0, 0);

    let totalCompletedInWeeks = 0;

    for (let w = 7; w >= 0; w--) {
      const wStart = new Date(thisMonday);
      wStart.setDate(thisMonday.getDate() - (w * 7));
      const wEnd = new Date(wStart);
      wEnd.setDate(wStart.getDate() + 6);

      let wCompleted = 0;
      let wElapsed = 0;

      for (let dayOff = 0; dayOff < 7; dayOff++) {
        const dayCheck = new Date(wStart);
        dayCheck.setDate(wStart.getDate() + dayOff);
        const k = formatDateKey(dayCheck);
        if (k <= todayKey && dayCheck >= arcWin.start) {
          wElapsed++;
          if (getHabitStatus(habit.id, k) === 'completed') {
            wCompleted++;
          }
        }
      }

      totalCompletedInWeeks += wCompleted;

      let tier = 'C';
      if (wCompleted === 7) tier = 'S';
      else if (wCompleted >= 5) tier = 'A';
      else if (wCompleted >= 3) tier = 'C';
      else tier = 'F';

      weeks.push({
        weekNum: 8 - w,
        label: w === 0 ? 'This Wk' : w === 1 ? 'Last Wk' : `W${8 - w}`,
        dateRange: `${wStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${wEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        completed: wCompleted,
        elapsed: wElapsed,
        total: 7,
        tier: tier,
        isCurrent: (w === 0),
        isLast: (w === 1)
      });
    }

    const weeklyAvg = (totalCompletedInWeeks / 8).toFixed(1);

    return {
      habit,
      elapsedDays,
      totalElapsed,
      completedCount,
      missedCount,
      frozenCount,
      completionRate,
      curStreak,
      bestStreak,
      weakest,
      dayStats,
      monthly: {
        lastMonthName,
        lastMonthCount,
        daysInLastMonth,
        lastMonthPct,
        thisMonthName,
        completedThisMonthSoFar,
        elapsedDaysInCurrentMonth,
        thisMonthSoFarPct,
        daysInCurrentMonth,
        estThisMonth,
        estThisMonthPct,
        paceDelta
      },
      weekly: {
        weeks,
        weeklyAvg,
        thisWeek: weeks[weeks.length - 1],
        lastWeek: weeks[weeks.length - 2]
      }
    };
  }

  // ==========================================================================
  // RENDERING ENGINE: HTML GENERATION
  // ==========================================================================

  /**
   * Render Top Habit Switcher & 4 KPI Summary Cards
   */
  function renderHeaderAndKPIs(data, isDrawer) {
    const habit = data.habit;
    const habits = getHabitsList();
    const cat = CATEGORIES[habit.category] || { color: '#00F0FF', icon: 'fa-solid fa-star' };
    const hasBackup = !!(global.state && global.state.__dailyHabits_backup) || !!localStorage.getItem('arc_daily_habits_backup');

    return `
      <!-- TOP CONTROL RIBBON & TITLE -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 border shadow-lg" style="background:${cat.color}18; border-color:${cat.color}50; color:${cat.color}">
            <i class="${cat.icon} text-base sm:text-lg"></i>
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-sm sm:text-base font-black text-white truncate">${esc(habit.name)}</h3>
              <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0" style="background:${cat.color}20; color:${cat.color}; border:1px solid ${cat.color}40">${esc(habit.category)}</span>
              <span class="text-[9px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 shrink-0">${habit.weight || 1}x Priority</span>
            </div>
            <p class="text-[10px] sm:text-[11px] text-slate-400 truncate">Deep-Dive Analytics • Cadence &amp; Velocity Engine</p>
          </div>
        </div>

        <!-- Utility Buttons: Prev/Next & Simulator -->
        <div class="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
          <div class="flex items-center bg-slate-950/90 rounded-xl border border-slate-800 p-0.5">
            <button type="button" onclick="ArcHabitAnalytics.prevHabit()" title="Previous Habit" class="w-7 h-7 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-slate-800 flex items-center justify-center text-xs transition active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400">
              <i class="fa-solid fa-chevron-left text-[10px]"></i>
            </button>
            <button type="button" onclick="ArcHabitAnalytics.nextHabit()" title="Next Habit" class="w-7 h-7 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-slate-800 flex items-center justify-center text-xs transition active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400">
              <i class="fa-solid fa-chevron-right text-[10px]"></i>
            </button>
          </div>

          ${hasBackup ? `
            <button type="button" onclick="ArcHabitAnalytics.restoreTelemetry()" title="Revert to your real history" class="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center gap-1 transition active:scale-95">
              <i class="fa-solid fa-rotate-left text-[9px]"></i>
              <span>Restore My Data</span>
            </button>
          ` : ''}

          ${isDrawer ? `
            <button type="button" onclick="ArcHabitAnalytics.closeDrawer()" aria-label="Close Drawer" class="w-7 h-7 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800 flex items-center justify-center text-xs transition active:scale-95">
              <i class="fa-solid fa-xmark"></i>
            </button>
          ` : ''}
        </div>
      </div>

      <!-- HORIZONTALLY SCROLLABLE HABIT SELECTOR STRIP -->
      <div class="space-y-1.5">
        <div class="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none no-scrollbar" role="tablist" aria-label="Habit Selector">
          ${habits.map(h => {
            const isSel = String(h.id) === String(habit.id);
            const c = CATEGORIES[h.category] || { color: '#00F0FF', icon: 'fa-solid fa-star' };
            return `
              <button type="button" role="tab" aria-selected="${isSel}" onclick="ArcHabitAnalytics.selectHabit('${h.id}')" class="shrink-0 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border transition active:scale-95 ${
                isSel
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/25 font-black'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
              }">
                <i class="${c.icon} ${isSel ? 'text-slate-950' : ''}" style="${isSel ? '' : `color:${c.color}`}"></i>
                <span class="max-w-[120px] sm:max-w-[160px] truncate">${esc(h.name)}</span>
                <span class="text-[9px] font-mono px-1 py-0.2 rounded ${isSel ? 'bg-black/20 text-black' : 'bg-slate-800 text-slate-400'}">${h.weight || 1}x</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 4 PER-HABIT KPI MINI-CARDS -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <!-- 1. Completion Rate -->
        <div class="glass-card rounded-2xl p-3 border-l-4 border-l-emerald-400 flex flex-col justify-between">
          <span class="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completion Rate</span>
          <div class="text-lg sm:text-2xl font-black text-white mt-0.5">${data.completionRate}%</div>
          <div class="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1.5 border border-slate-800">
            <div class="h-full bg-emerald-400 animate-shimmer transition-all duration-500" style="width:${data.completionRate}%"></div>
          </div>
        </div>

        <!-- 2. Completed vs Missed -->
        <div class="glass-card rounded-2xl p-3 border-l-4 border-l-cyan-400 flex flex-col justify-between">
          <span class="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed vs Missed</span>
          <div class="text-base sm:text-xl font-black text-cyan-300 mt-0.5 flex items-baseline gap-1">
            <span>${data.completedCount}</span>
            <span class="text-xs text-slate-400 font-normal">Done</span>
            <span class="text-slate-600">•</span>
            <span class="text-rose-400">${data.missedCount}</span>
            <span class="text-xs text-slate-400 font-normal">Missed</span>
          </div>
          <span class="text-[9px] font-mono text-slate-400 mt-1">${data.totalElapsed} arc days elapsed</span>
        </div>

        <!-- 3. Habit Streak -->
        <div class="glass-card rounded-2xl p-3 border-l-4 border-l-purple-400 flex flex-col justify-between">
          <span class="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Habit Streak</span>
          <div class="text-lg sm:text-2xl font-black text-white mt-0.5 flex items-center gap-1.5">
            <span>${data.curStreak} ${data.curStreak === 1 ? 'Day' : 'Days'}</span>
            <i class="fa-solid fa-fire text-amber-400 text-xs sm:text-sm animate-pulse"></i>
          </div>
          <span class="text-[9px] font-mono text-purple-300/80 mt-1">Best: ${data.bestStreak} ${data.bestStreak === 1 ? 'Day' : 'Days'}</span>
        </div>

        <!-- 4. Weakest Day -->
        <div class="glass-card rounded-2xl p-3 border-l-4 border-l-amber-400 flex flex-col justify-between">
          <span class="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weakest Day</span>
          <div class="text-sm sm:text-base font-extrabold ${data.weakest ? 'text-amber-300' : 'text-emerald-400'} mt-0.5 truncate">
            ${data.weakest ? `${data.weakest.full}s` : 'Flawless 🏆'}
          </div>
          <span class="text-[9px] font-mono text-slate-400 mt-1 truncate">
            ${data.weakest ? `${data.weakest.missRate}% historical miss` : '0 missed days'}
          </span>
        </div>
      </div>
    `;
  }

  /**
   * Render Completed vs. Missed Heatmap (Dual Layout Toggle)
   */
  function renderHeatmapSection(data) {
    const habit = data.habit;
    const mode = state.viewMode;
    const today = getEffectiveToday();
    const todayKey = getTodayKey();
    const arcWin = getArcWindow();

    // Default hovered date readout to today if null
    const readoutKey = state.hoveredDateKey || todayKey;
    const readoutParts = readoutKey.split('-');
    const readoutObj = new Date(parseInt(readoutParts[0]), parseInt(readoutParts[1]) - 1, parseInt(readoutParts[2]));
    const readoutLabel = readoutObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    const readoutStatus = getHabitStatus(habit.id, readoutKey);

    let statusPill = '';
    if (readoutStatus === 'completed') {
      statusPill = `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"><i class="fa-solid fa-check mr-1"></i>COMPLETED</span>`;
    } else if (readoutStatus === 'missed') {
      statusPill = `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40"><i class="fa-solid fa-xmark mr-1"></i>MISSED</span>`;
    } else if (readoutStatus === 'frozen') {
      statusPill = `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">❄️ STREAK FROZEN</span>`;
    } else if (readoutStatus === 'future') {
      statusPill = `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-slate-400 border border-slate-700">LOCKED (FUTURE)</span>`;
    } else {
      statusPill = `<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-slate-500 border border-slate-700">PRIOR TO ARC</span>`;
    }

    let gridHtml = '';

    if (mode === 'matrix') {
      // 92-Day Matrix Layout (GitHub-style 7 rows x weeks)
      // Start aligned to Monday of the arc start week
      const startMon = new Date(arcWin.start);
      const startDayOffset = (startMon.getDay() + 6) % 7; // Mon=0
      startMon.setDate(startMon.getDate() - startDayOffset);
      startMon.setHours(0, 0, 0, 0);

      // Compute total weeks needed to cover the arc window
      const endSun = new Date(arcWin.end);
      const endDayOffset = (7 - ((endSun.getDay() + 6) % 7) - 1);
      endSun.setDate(endSun.getDate() + endDayOffset);
      endSun.setHours(0, 0, 0, 0);

      const totalWeeks = Math.max(13, Math.ceil((endSun - startMon) / (7 * 864e5)));

      // Build 7 rows (Day 0 = Mon, Day 6 = Sun)
      const dayLabels = ['M', '', 'W', '', 'F', '', 'S'];
      gridHtml = `
        <div class="overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          <div class="flex gap-2 min-w-[580px]">
            <!-- Day Row Labels -->
            <div class="flex flex-col justify-between py-1 text-[9px] font-mono font-bold text-slate-500 shrink-0 w-3 select-none">
              ${dayLabels.map(l => `<span>${l}</span>`).join('')}
            </div>

            <!-- Matrix Cells (7 rows × totalWeeks columns) -->
            <div class="ha-matrix-grid flex-1" style="grid-template-columns: repeat(${totalWeeks}, minmax(14px, 1fr));">
              ${Array.from({ length: totalWeeks }).map((_, wIdx) => {
                let colCells = '';
                for (let rIdx = 0; rIdx < 7; rIdx++) {
                  const cellDate = new Date(startMon);
                  cellDate.setDate(startMon.getDate() + (wIdx * 7) + rIdx);
                  const k = formatDateKey(cellDate);
                  const st = getHabitStatus(habit.id, k);
                  const isToday = (k === todayKey);
                  const yesterdayKey = (typeof global.getYesterdayKey === 'function') ? global.getYesterdayKey() : (() => {
                    const d = new Date(today);
                    d.setDate(d.getDate() - 1);
                    return formatDateKey(d);
                  })();
                  const isLockedHistory = (k < yesterdayKey);
                  const isFuture = (k > todayKey) || (st === 'future');

                  let cellClass = 'ha-cell';
                  let symbol = '';

                  if (st === 'completed') {
                    cellClass += ' ha-done';
                    symbol = '<i class="fa-solid fa-check text-[7px]"></i>';
                  } else if (st === 'frozen') {
                    cellClass += ' ha-frozen';
                    symbol = '<span class="text-[8px] leading-none">❄️</span>';
                  } else if (st === 'missed') {
                    cellClass += ' ha-missed';
                    symbol = '<i class="fa-solid fa-xmark text-[7px]"></i>';
                  } else if (isFuture) {
                    cellClass += ' ha-future';
                  } else {
                    cellClass += ' opacity-20 border border-slate-800 bg-slate-900/30';
                  }

                  if (isToday) cellClass += ' ha-today';
                  if (isLockedHistory) cellClass += ' ha-locked-history disabled:cursor-not-allowed opacity-75';

                  const cellTitle = isLockedHistory ? `${k}: LOCKED HISTORY (Read-only)` : (isFuture ? `${k}: LOCKED FUTURE` : `${k}: ${st.toUpperCase()} (Click to toggle)`);

                  colCells += `
                    <button type="button"
                      data-date="${k}"
                      data-locked-history="${isLockedHistory}"
                      onclick="if (${isLockedHistory}) { if (typeof global.showToast === 'function') global.showToast('Locked History: Habit records older than yesterday cannot be modified.'); return; } ArcHabitAnalytics.toggleDateCompletion('${habit.id}', '${k}')"
                      onmouseenter="ArcHabitAnalytics.setHoveredDate('${k}')"
                      class="${cellClass}"
                      ${(isFuture || isLockedHistory) ? 'disabled' : ''}
                      title="${cellTitle}"
                      aria-label="${k} ${st}">
                      ${symbol}
                    </button>
                  `;
                }
                return colCells;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    } else {
      // Monthly Calendar Grid Mode
      const calMonth = state.calendarMonth || new Date(today.getFullYear(), today.getMonth(), 1);
      const curYear = calMonth.getFullYear();
      const curMonth = calMonth.getMonth();
      const firstDay = new Date(curYear, curMonth, 1).getDay(); // 0=Sun
      const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
      const monthTitle = calMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      let calDays = '';
      for (let i = 0; i < firstDay; i++) {
        calDays += '<div class="aspect-square opacity-0 pointer-events-none"></div>';
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const k = `${curYear}-${pad(curMonth + 1)}-${pad(d)}`;
        const st = getHabitStatus(habit.id, k);
        const isToday = (k === todayKey);
        const yesterdayKey = (typeof global.getYesterdayKey === 'function') ? global.getYesterdayKey() : (() => {
          const dt = new Date(today);
          dt.setDate(dt.getDate() - 1);
          return formatDateKey(dt);
        })();
        const isLockedHistory = (k < yesterdayKey);
        const isFuture = (k > todayKey) || (st === 'future');

        let cellClass = 'aspect-square rounded-xl border p-1 flex flex-col justify-between items-center transition active:scale-95 text-xs';
        let badge = '';

        if (st === 'completed') {
          cellClass += ' bg-emerald-500/20 border-emerald-400/70 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.25)]';
          badge = '<i class="fa-solid fa-check text-[10px]"></i>';
        } else if (st === 'frozen') {
          cellClass += ' bg-cyan-500/20 border-cyan-400/60 text-cyan-200';
          badge = '<span class="text-[10px]">❄️</span>';
        } else if (st === 'missed') {
          cellClass += ' bg-rose-500/20 border-rose-500/70 text-rose-300 shadow-[0_0_6px_rgba(244,63,94,0.2)]';
          badge = '<i class="fa-solid fa-xmark text-[10px]"></i>';
        } else if (isFuture) {
          cellClass += ' bg-slate-900/40 border-slate-800 text-slate-600 opacity-40 pointer-events-none';
          badge = '<span class="text-[9px] text-slate-600">•</span>';
        } else {
          cellClass += ' bg-slate-950/40 border-slate-800/60 text-slate-600 opacity-30';
          badge = '<span class="text-[9px] text-slate-700">-</span>';
        }

        if (isToday) cellClass += ' ring-2 ring-white ring-offset-1 ring-offset-slate-950';
        if (isLockedHistory) cellClass += ' ha-locked-history opacity-75';

        const calTitle = isLockedHistory ? `${k}: LOCKED HISTORY (Read-only)` : (isFuture ? `${k}: LOCKED FUTURE` : `${k}: ${st.toUpperCase()}`);

        calDays += `
          <button type="button"
            onclick="if (${isLockedHistory}) { if (typeof global.showToast === 'function') global.showToast('Locked History: Habit records older than yesterday cannot be modified.'); return; } ArcHabitAnalytics.toggleDateCompletion('${habit.id}', '${k}')"
            onmouseenter="ArcHabitAnalytics.setHoveredDate('${k}')"
            class="${cellClass}"
            ${(isFuture || isLockedHistory) ? 'disabled' : ''}
            title="${calTitle}">
            <span class="text-[10px] font-mono font-bold">${d}</span>
            <div class="h-4 flex items-center justify-center">${badge}</div>
          </button>
        `;
      }

      gridHtml = `
        <div class="space-y-2">
          <!-- Calendar Sub-Header -->
          <div class="flex items-center justify-between bg-slate-950/80 p-2 rounded-xl border border-slate-800">
            <button type="button" onclick="ArcHabitAnalytics.changeMonth(-1)" class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs transition active:scale-95">
              <i class="fa-solid fa-chevron-left text-[10px]"></i>
            </button>
            <span class="text-xs font-mono font-bold text-cyan-400">${monthTitle}</span>
            <button type="button" onclick="ArcHabitAnalytics.changeMonth(1)" class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs transition active:scale-95">
              <i class="fa-solid fa-chevron-right text-[10px]"></i>
            </button>
          </div>

          <!-- Weekday Headers -->
          <div class="grid grid-cols-7 gap-1 text-center text-[10px] font-mono font-bold text-slate-400 py-1">
            <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
          </div>

          <!-- Days Grid -->
          <div class="grid grid-cols-7 gap-1 sm:gap-1.5">
            ${calDays}
          </div>
        </div>
      `;
    }

    return `
      <!-- COMPLETED VS. MISSED HEATMAP CARD -->
      <div class="glass-card rounded-2xl p-3.5 sm:p-5 space-y-3 border-t-2 border-t-emerald-400/80">
        <!-- Switcher Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 class="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <i class="fa-solid fa-border-all text-emerald-400"></i>
              Execution Heatmap (Completed vs. Missed)
            </h4>
            <p class="text-[10px] text-slate-400">Live inspection • Click any past or today square to toggle completion</p>
          </div>

          <!-- Mode Toggle Pill -->
          <div class="flex items-center bg-slate-950/90 rounded-xl border border-slate-800 p-0.5 self-start sm:self-auto text-[10px] font-bold">
            <button type="button" onclick="ArcHabitAnalytics.setViewMode('matrix')" class="px-2.5 py-1 rounded-lg transition active:scale-95 ${
              mode === 'matrix' ? 'bg-cyan-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'
            }">
              <i class="fa-solid fa-table-cells mr-1"></i>92-Day Matrix
            </button>
            <button type="button" onclick="ArcHabitAnalytics.setViewMode('calendar')" class="px-2.5 py-1 rounded-lg transition active:scale-95 ${
              mode === 'calendar' ? 'bg-cyan-500 text-slate-950 font-black shadow-sm' : 'text-slate-400 hover:text-white'
            }">
              <i class="fa-solid fa-calendar-days mr-1"></i>Monthly View
            </button>
          </div>
        </div>

        <!-- Heatmap Grid Body -->
        ${gridHtml}

        <!-- LIVE STATUS READOUT BAR & LEGEND -->
        <div class="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px]">
          <!-- Live Date Readout -->
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-slate-400 font-mono"><i class="fa-solid fa-crosshairs text-cyan-400 mr-1"></i>${readoutLabel}:</span>
            ${statusPill}
            <span class="text-[9px] text-slate-500 hidden sm:inline">(Click cell to toggle)</span>
          </div>

          <!-- Legend -->
          <div class="flex items-center gap-2 flex-wrap text-[9px] text-slate-400">
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-400"></span> Completed</span>
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded bg-rose-500/30 border border-rose-500"></span> Missed</span>
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded bg-cyan-500/30 border border-cyan-400"></span> Frozen</span>
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded ring-1 ring-white"></span> Today</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render Graph A (Monthly Frequency & Estimated Projection)
   */
  function renderGraphA(data) {
    const m = data.monthly;

    let deltaBadge = '';
    if (m.paceDelta > 0) {
      deltaBadge = `
        <div class="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-xs font-bold flex items-center gap-2">
          <i class="fa-solid fa-arrow-trend-up text-emerald-400 text-sm"></i>
          <span>▲ On pace for <b>+${m.paceDelta} more completions</b> than last month (${m.estThisMonth} vs ${m.lastMonthCount})! Excellent momentum!</span>
        </div>
      `;
    } else if (m.paceDelta === 0) {
      deltaBadge = `
        <div class="p-2 sm:p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] sm:text-xs font-bold flex items-center gap-2">
          <i class="fa-solid fa-equals text-cyan-400 text-sm"></i>
          <span>═ On pace to match last month exactly (<b>${m.estThisMonth} completions</b> projected).</span>
        </div>
      `;
    } else {
      deltaBadge = `
        <div class="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] sm:text-xs font-bold flex items-center gap-2">
          <i class="fa-solid fa-triangle-exclamation text-amber-400 text-sm"></i>
          <span>▼ Projected <b>${Math.abs(m.paceDelta)} fewer completions</b> than last month (${m.estThisMonth} vs ${m.lastMonthCount}) — lock in today to close the gap!</span>
        </div>
      `;
    }

    return `
      <!-- GRAPH A: MONTHLY FREQUENCY & ESTIMATED PROJECTION -->
      <div class="glass-card rounded-2xl p-4 sm:p-5 space-y-3.5 border-t-2 border-t-cyan-400 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 class="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <i class="fa-solid fa-chart-column text-cyan-400"></i>
              Monthly Cadence &amp; Velocity Projection
            </h4>
            <span class="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/25">Forecast</span>
          </div>

          <div class="space-y-3.5 mt-3">
            <!-- 1. Last Month (Actual Total) -->
            <div class="space-y-1">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-slate-300 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
                  ${esc(m.lastMonthName)} (Actual)
                </span>
                <span class="font-mono font-bold text-indigo-300">${m.lastMonthCount} / ${m.daysInLastMonth} times <span class="text-[10px] text-slate-400 font-normal">(${m.lastMonthPct}%)</span></span>
              </div>
              <div class="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500" style="width:${m.lastMonthPct}%"></div>
              </div>
            </div>

            <!-- 2. This Month (Completed So Far) -->
            <div class="space-y-1">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-slate-300 flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                  ${esc(m.thisMonthName)} (1st – Today)
                </span>
                <span class="font-mono font-bold text-emerald-300">${m.completedThisMonthSoFar} / ${m.elapsedDaysInCurrentMonth} times <span class="text-[10px] text-slate-400 font-normal">(${m.thisMonthSoFarPct}%)</span></span>
              </div>
              <div class="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-300 animate-shimmer transition-all duration-500" style="width:${Math.round((m.completedThisMonthSoFar / m.daysInCurrentMonth) * 100)}%"></div>
              </div>
            </div>

            <!-- 3. This Month (Estimated Full-Month Total) -->
            <div class="space-y-1">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold text-amber-300 flex items-center gap-1.5">
                  <i class="fa-solid fa-wand-magic-sparkles text-[10px]"></i>
                  ${esc(m.thisMonthName)} (Estimated Projection)
                </span>
                <span class="font-mono font-black text-amber-400">~${m.estThisMonth} / ${m.daysInCurrentMonth} times <span class="text-[10px] text-amber-300/80 font-normal">(${m.estThisMonthPct}%)</span></span>
              </div>
              <div class="w-full bg-slate-900 h-3.5 rounded-full overflow-hidden border border-slate-800 p-0.5 relative flex">
                <!-- Actual Segment -->
                <div class="h-full rounded-l-full bg-emerald-400 transition-all duration-500" style="width:${Math.round((m.completedThisMonthSoFar / m.daysInCurrentMonth) * 100)}%"></div>
                <!-- Projected Striped Segment -->
                <div class="h-full rounded-r-full ha-projected-stripe border-y border-r border-dashed border-amber-400 transition-all duration-500" style="width:${Math.max(0, Math.round(((m.estThisMonth - m.completedThisMonthSoFar) / m.daysInCurrentMonth) * 100))}%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pace Delta Callout -->
        <div class="mt-2">
          ${deltaBadge}
        </div>
      </div>
    `;
  }

  /**
   * Render Graph B (Weekly Consistency & Day-of-Week Breakdown)
   */
  function renderGraphB(data) {
    const wData = data.weekly;
    const dayStats = data.dayStats;

    return `
      <!-- GRAPH B: WEEKLY CONSISTENCY & DAY RELIABILITY -->
      <div class="glass-card rounded-2xl p-4 sm:p-5 space-y-3.5 border-t-2 border-t-purple-400 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 class="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <i class="fa-solid fa-chart-simple text-purple-400"></i>
              Weekly Consistency &amp; Day Reliability
            </h4>
            <span class="text-[9px] font-mono font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/25">Avg: ${wData.weeklyAvg} / 7d</span>
          </div>

          <!-- 8-Week Vertical Bar Chart -->
          <div class="mt-3 relative bg-slate-950/80 rounded-2xl border border-slate-800/80 p-3 pt-6 h-36 flex items-end justify-between gap-1 sm:gap-2">
            <!-- Target Line at 6+/wk (85.7%) -->
            <div class="absolute left-3 right-3 border-b border-dashed border-cyan-400/40 pointer-events-none z-0" style="bottom: 85.7%;">
              <span class="absolute right-0 -top-3.5 text-[8px] font-mono text-cyan-300">Target 6+/wk</span>
            </div>

            ${wData.weeks.map(w => {
              const hPct = Math.max(10, Math.round((w.completed / 7) * 100));
              let barGrad = 'from-cyan-600 to-cyan-400 border-cyan-400/80 text-cyan-200';
              if (w.completed === 7) barGrad = 'from-emerald-500 to-teal-300 border-emerald-400 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.4)]';
              else if (w.completed >= 5) barGrad = 'from-cyan-600 to-cyan-400 border-cyan-400/80 text-cyan-200';
              else if (w.completed >= 3) barGrad = 'from-amber-600 to-amber-400 border-amber-400/80 text-amber-200';
              else barGrad = 'from-rose-700 to-rose-500 border-rose-500/80 text-rose-200';

              return `
                <div class="flex-1 h-full flex flex-col justify-end items-center relative z-10 group" title="${w.label} (${w.dateRange}): ${w.completed}/7 completed">
                  <!-- Value Label -->
                  <span class="text-[9px] font-mono font-bold mb-1 ${w.completed === 7 ? 'text-emerald-300' : 'text-slate-300'}">
                    ${w.completed}/7
                  </span>

                  <!-- Bar -->
                  <div class="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t ${barGrad} border-t border-x transition-all duration-500 relative" style="height:${hPct}%">
                    ${w.completed === 7 ? '<div class="absolute inset-0 bg-white/20 animate-pulse rounded-t-lg"></div>' : ''}
                  </div>

                  <!-- Label -->
                  <span class="text-[9px] font-mono mt-1 ${w.isCurrent ? 'text-cyan-400 font-black' : 'text-slate-400'}">
                    ${w.label}
                  </span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Day of Week Reliability Mini-Graph (S M T W T F S) -->
        <div class="pt-2 border-t border-slate-800 space-y-1">
          <div class="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Weekday Reliability (Historical %)</span>
            <span class="text-cyan-400">Sun – Sat</span>
          </div>
          <div class="grid grid-cols-7 gap-1 sm:gap-1.5 pt-1">
            ${dayStats.map(ds => `
              <div class="flex flex-col items-center bg-slate-950/70 p-1.5 rounded-xl border border-slate-800/80 ${ds.pct >= 80 ? 'border-emerald-500/30' : ds.pct < 50 ? 'border-rose-500/30' : ''}">
                <span class="text-[9px] font-mono font-bold text-slate-400">${ds.short}</span>
                <div class="w-full bg-slate-900 h-1 rounded-full overflow-hidden my-1">
                  <div class="h-full ${ds.pct >= 80 ? 'bg-emerald-400' : ds.pct >= 50 ? 'bg-cyan-400' : 'bg-rose-400'}" style="width:${ds.pct}%"></div>
                </div>
                <span class="text-[9px] font-mono font-bold ${ds.pct >= 80 ? 'text-emerald-300' : ds.pct >= 50 ? 'text-slate-300' : 'text-rose-300'}">${ds.pct}%</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Main render orchestrator for a container
   */
  function renderContainer(containerId, isDrawer) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const data = computeAnalytics(state.selectedHabitId);
    if (!data) {
      el.innerHTML = '<div class="p-6 text-center text-xs text-slate-500">No habit selected or no habits available.</div>';
      return;
    }

    const headerHtml = renderHeaderAndKPIs(data, isDrawer);
    const heatmapHtml = renderHeatmapSection(data);
    const graphAHtml = renderGraphA(data);
    const graphBHtml = renderGraphB(data);

    if (isDrawer) {
      // Stacked graphs for slide-over drawer
      el.innerHTML = `
        <div class="space-y-4 sm:space-y-5">
          ${headerHtml}
          ${heatmapHtml}
          ${graphAHtml}
          ${graphBHtml}
        </div>
      `;
    } else {
      // Side-by-side graphs for embedded Results panel on larger screens
      el.innerHTML = `
        <div class="space-y-4 sm:space-y-5">
          ${headerHtml}
          ${heatmapHtml}
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            ${graphAHtml}
            ${graphBHtml}
          </div>
        </div>
      `;
    }
  }

  // ==========================================================================
  // PUBLIC CONTROLLER API
  // ==========================================================================

  const ArcHabitAnalytics = {
    get selectedHabitId() {
      return state.selectedHabitId;
    },
    set selectedHabitId(val) {
      state.selectedHabitId = val;
    },

    /**
     * Initialize DOM containers & global event listeners
     */
    init() {
      if (state.initialized) {
        this.refresh();
        return;
      }

      // 1. Ensure Drawer DOM exists in body
      if (!document.getElementById('arc-habit-analytics-drawer')) {
        const backdrop = document.createElement('div');
        backdrop.id = 'arc-habit-analytics-backdrop';
        backdrop.setAttribute('aria-hidden', 'true');
        backdrop.onclick = () => ArcHabitAnalytics.closeDrawer();
        document.body.appendChild(backdrop);

        const drawer = document.createElement('aside');
        drawer.id = 'arc-habit-analytics-drawer';
        drawer.className = 'w-full max-w-xl sm:max-w-2xl h-[100dvh] fixed top-0 right-0 z-[90] glass-card border-l border-cyan-500/40 overflow-y-auto p-4 sm:p-6 space-y-5 shadow-2xl backdrop-blur-xl';
        drawer.setAttribute('aria-label', 'Habit Analytics Drawer');
        drawer.setAttribute('role', 'dialog');
        drawer.setAttribute('aria-modal', 'true');
        document.body.appendChild(drawer);
      }

      // 2. Global Escape key listener
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && state.drawerOpen) {
          ArcHabitAnalytics.closeDrawer();
        }
      });

      // 3. Default active habit
      const habits = getHabitsList();
      if (habits.length && !state.selectedHabitId) {
        state.selectedHabitId = habits[0].id;
      }

      state.initialized = true;
      this.refresh();
    },

    /**
     * Surface A: Open Slide-Over Quick-Inspect Drawer
     */
    openDrawer(habitId) {
      this.init();
      if (habitId) state.selectedHabitId = habitId;
      else if (!state.selectedHabitId) {
        const habits = getHabitsList();
        if (habits.length) state.selectedHabitId = habits[0].id;
      }

      const backdrop = document.getElementById('arc-habit-analytics-backdrop');
      const drawer = document.getElementById('arc-habit-analytics-drawer');
      if (backdrop) backdrop.classList.add('open');
      if (drawer) drawer.classList.add('open');

      state.drawerOpen = true;
      if (typeof global.playSfx === 'function') global.playSfx('modalOpen');

      this.renderDrawer();
    },

    /**
     * Surface A: Close Slide-Over Quick-Inspect Drawer
     */
    closeDrawer() {
      const backdrop = document.getElementById('arc-habit-analytics-backdrop');
      const drawer = document.getElementById('arc-habit-analytics-drawer');
      if (backdrop) backdrop.classList.remove('open');
      if (drawer) drawer.classList.remove('open');

      state.drawerOpen = false;
      if (typeof global.playSfx === 'function') global.playSfx('modalClose');
    },

    /**
     * Expand in Results Tab
     */
    openInResultsTab(habitId) {
      if (habitId) state.selectedHabitId = habitId;
      this.closeDrawer();
      if (typeof global.switchTab === 'function') global.switchTab('results');
      setTimeout(() => {
        const panel = document.getElementById('habit-deep-analytics-panel');
        if (panel) {
          panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
      this.refresh();
    },

    /**
     * Select a habit by ID
     */
    selectHabit(habitId) {
      state.selectedHabitId = habitId;
      state.hoveredDateKey = null;
      if (typeof global.playSfx === 'function') global.playSfx('tab');
      this.refresh();
    },

    prevHabit() {
      const habits = getHabitsList();
      if (!habits.length) return;
      const idx = habits.findIndex(h => String(h.id) === String(state.selectedHabitId));
      const nextIdx = (idx - 1 + habits.length) % habits.length;
      this.selectHabit(habits[nextIdx].id);
    },

    nextHabit() {
      const habits = getHabitsList();
      if (!habits.length) return;
      const idx = habits.findIndex(h => String(h.id) === String(state.selectedHabitId));
      const nextIdx = (idx + 1) % habits.length;
      this.selectHabit(habits[nextIdx].id);
    },

    setViewMode(mode) {
      state.viewMode = mode;
      if (typeof global.playSfx === 'function') global.playSfx('tab');
      this.refresh();
    },

    changeMonth(delta) {
      const cur = state.calendarMonth || new Date(getEffectiveToday().getFullYear(), getEffectiveToday().getMonth(), 1);
      cur.setMonth(cur.getMonth() + delta);
      state.calendarMonth = new Date(cur);
      if (typeof global.playSfx === 'function') global.playSfx('slideNext');
      this.refresh();
    },

    setHoveredDate(dateKey) {
      state.hoveredDateKey = dateKey;
      const readoutParts = dateKey.split('-');
      const readoutObj = new Date(parseInt(readoutParts[0]), parseInt(readoutParts[1]) - 1, parseInt(readoutParts[2]));
      const readoutLabel = readoutObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
      const habit = getActiveHabit();
      if (!habit) return;

      const todayKey = getTodayKey();
      const yesterdayKey = (typeof global.getYesterdayKey === 'function') ? global.getYesterdayKey() : (() => {
        const d = new Date(getEffectiveToday());
        d.setDate(d.getDate() - 1);
        return formatDateKey(d);
      })();
      const isLockedHistory = (dateKey < yesterdayKey);
      const isFuture = (dateKey > todayKey);

      const st = getHabitStatus(habit.id, dateKey);
      let statusHtml = '';
      if (isLockedHistory) {
        statusHtml = '<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1"><i class="fa-solid fa-lock text-[8px]"></i> LOCKED HISTORY</span>';
      } else if (st === 'completed') {
        statusHtml = '<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"><i class="fa-solid fa-check mr-1"></i>COMPLETED</span>';
      } else if (st === 'missed') {
        statusHtml = '<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40"><i class="fa-solid fa-xmark mr-1"></i>MISSED</span>';
      } else if (st === 'frozen') {
        statusHtml = '<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">❄️ STREAK FROZEN</span>';
      } else if (st === 'future' || isFuture) {
        statusHtml = '<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-slate-400 border border-slate-700">LOCKED (FUTURE)</span>';
      } else {
        statusHtml = '<span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-slate-500 border border-slate-700">PRIOR TO ARC</span>';
      }

      const actionText = (isLockedHistory || isFuture) ? '<span class="text-[9px] text-amber-400/80 hidden sm:inline">(Locked: Read-only)</span>' : '<span class="text-[9px] text-slate-500 hidden sm:inline">(Click cell to toggle)</span>';

      // Update in DOM live readouts if available
      $$('.ha-live-readout').forEach(el => {
        el.innerHTML = `
          <span class="text-slate-400 font-mono"><i class="fa-solid fa-crosshairs text-cyan-400 mr-1"></i>${readoutLabel}:</span>
          ${statusHtml}
          ${actionText}
        `;
      });
    },

    /**
     * Interactive Cell Click-to-Toggle
     */
    toggleDateCompletion(habitId, dateKey) {
      const todayKey = getTodayKey();
      const yesterdayKey = (typeof global.getYesterdayKey === 'function') ? global.getYesterdayKey() : (() => {
        const d = new Date(getEffectiveToday());
        d.setDate(d.getDate() - 1);
        return formatDateKey(d);
      })();

      if (dateKey > todayKey) {
        if (typeof global.showToast === 'function') global.showToast("Future dates are locked.");
        return;
      }
      if (dateKey < yesterdayKey) {
        if (typeof global.showToast === 'function') global.showToast("Locked History: Habit records older than yesterday cannot be modified.");
        return;
      }

      const habits = getHabitsList();
      const habit = habits.find(h => String(h.id) === String(habitId));
      if (!habit) return;

      if (dateKey === todayKey) {
        if (typeof global.toggleHabit === 'function') {
          global.toggleHabit(habitId);
        } else {
          habit.completed = !habit.completed;
          if (!global.state.dailyHabits[todayKey]) global.state.dailyHabits[todayKey] = {};
          global.state.dailyHabits[todayKey][habitId] = habit.completed;
          if (typeof global.saveToLocalStorage === 'function') global.saveToLocalStorage();
        }
      } else {
        if (typeof global.toggleHabitForDate === 'function') {
          global.toggleHabitForDate(dateKey, habitId);
        } else {
          if (!global.state.dailyHabits) global.state.dailyHabits = {};
          const day = global.state.dailyHabits[dateKey] || (global.state.dailyHabits[dateKey] = {});
          day[habitId] = !day[habitId];
          if (typeof global.playSfx === 'function') global.playSfx(day[habitId] ? 'check' : 'uncheck');
          if (typeof global.saveToLocalStorage === 'function') global.saveToLocalStorage();
        }
      }

      this.refresh();
      if (typeof global.renderHabits === 'function') global.renderHabits();
      if (typeof global.renderCalendar === 'function') global.renderCalendar();
      if (typeof global.updateDynamicDayCounter === 'function') global.updateDynamicDayCounter();
    },

    /**
     * Simulate 60-Day Telemetry for Instant Rich Previews
     */
    simulateTelemetry() {
      if (!global.state) return;
      if (!global.state.__dailyHabits_backup) {
        global.state.__dailyHabits_backup = JSON.parse(JSON.stringify(global.state.dailyHabits || {}));
        try {
          localStorage.setItem('arc_daily_habits_backup', JSON.stringify(global.state.__dailyHabits_backup));
        } catch (e) {}
      }

      const today = getEffectiveToday();
      const dh = global.state.dailyHabits || (global.state.dailyHabits = {});
      const habits = getHabitsList();

      for (let i = 59; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const k = formatDateKey(d);
        if (!dh[k]) dh[k] = {};
        const dayOfWeek = d.getDay();
        const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

        habits.forEach((h, hIdx) => {
          let prob = isWeekend ? 0.68 : 0.84;
          if (dayOfWeek === 1 || dayOfWeek === 2) prob = 0.92;
          const seed = (d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate() * 7 + (hIdx + 1) * 13);
          const pseudoRand = ((seed * 9301 + 49297) % 233280) / 233280;
          dh[k][h.id] = (pseudoRand < prob);
        });
      }

      // Sync today
      const todayKey = getTodayKey();
      if (dh[todayKey]) {
        habits.forEach(h => {
          if (dh[todayKey][h.id] !== undefined) h.completed = !!dh[todayKey][h.id];
        });
      }

      if (typeof global.saveToLocalStorage === 'function') global.saveToLocalStorage();
      if (typeof global.playSfx === 'function') global.playSfx('badge');
      if (typeof global.showToast === 'function') global.showToast('⚡ Simulated 60-day telemetry generated! Click "Restore My Data" anytime.');

      this.refresh();
      if (typeof global.renderHabits === 'function') global.renderHabits();
      if (typeof global.renderCalendar === 'function') global.renderCalendar();
      if (typeof global.updateDynamicDayCounter === 'function') global.updateDynamicDayCounter();
    },

    /**
     * Restore Original Telemetry
     */
    restoreTelemetry() {
      if (!global.state) return;
      let backup = global.state.__dailyHabits_backup;
      if (!backup) {
        try {
          const raw = localStorage.getItem('arc_daily_habits_backup');
          if (raw) backup = JSON.parse(raw);
        } catch (e) {}
      }
      if (!backup) {
        if (typeof global.showToast === 'function') global.showToast('No backup telemetry found to restore.');
        return;
      }

      global.state.dailyHabits = backup;
      delete global.state.__dailyHabits_backup;
      try {
        localStorage.removeItem('arc_daily_habits_backup');
      } catch (e) {}

      // Sync today
      const todayKey = getTodayKey();
      const cur = global.state.dailyHabits[todayKey] || {};
      const habits = getHabitsList();
      habits.forEach(h => {
        h.completed = !!cur[h.id];
      });

      if (typeof global.saveToLocalStorage === 'function') global.saveToLocalStorage();
      if (typeof global.playSfx === 'function') global.playSfx('modalClose');
      if (typeof global.showToast === 'function') global.showToast('Original habit telemetry restored.');

      this.refresh();
      if (typeof global.renderHabits === 'function') global.renderHabits();
      if (typeof global.renderCalendar === 'function') global.renderCalendar();
      if (typeof global.updateDynamicDayCounter === 'function') global.updateDynamicDayCounter();
    },

    renderDrawer() {
      renderContainer('arc-habit-analytics-drawer', true);
    },

    renderResultsPanel() {
      renderContainer('habit-deep-analytics-panel', false);
    },

    refresh() {
      if (state.drawerOpen) {
        this.renderDrawer();
      }
      this.renderResultsPanel();
    }
  };

  // Expose to window / global
  global.ArcHabitAnalytics = ArcHabitAnalytics;

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ArcHabitAnalytics.init());
  } else {
    ArcHabitAnalytics.init();
  }

})(typeof window !== 'undefined' ? window : globalThis);
