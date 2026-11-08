/* ==========================================================================
           3. DATA MANAGEMENT, CONSTANTS & RESILIENT STORAGE
           ========================================================================== */
        const SCHEMA_VERSION = 2;

        let screenTimeData = [
            {"url":"support.google.com","favicon":"https://support.google.com/favicon.png","summaryTime":39,"counter":4,"days":[{"counter":4,"date":"9/20/2026","summary":39}]},
            {"url":"chromewebstore.google.com","favicon":"./assets/favicons/chrome-webstore.png","summaryTime":797,"counter":43,"days":[{"counter":11,"date":"9/20/2026","summary":468},{"counter":26,"date":"9/27/2026","summary":292},{"counter":5,"date":"10/1/2026","summary":29},{"counter":1,"date":"10/2/2026","summary":8}]},
            {"url":"www.pw.live","favicon":"./assets/favicons/pw.ico","summaryTime":86313,"counter":940,"days":[{"counter":117,"date":"9/20/2026","summary":16809},{"counter":82,"date":"9/21/2026","summary":10672},{"counter":41,"date":"9/22/2026","summary":4679},{"counter":86,"date":"9/23/2026","summary":7099},{"counter":46,"date":"9/24/2026","summary":3926},{"counter":196,"date":"9/25/2026","summary":16206},{"counter":21,"date":"9/26/2026","summary":1098},{"counter":62,"date":"9/27/2026","summary":3862},{"counter":56,"date":"9/28/2026","summary":6477},{"counter":37,"date":"9/29/2026","summary":1856},{"counter":12,"date":"9/30/2026","summary":229},{"counter":22,"date":"10/1/2026","summary":713},{"counter":127,"date":"10/2/2026","summary":9947},{"counter":19,"date":"10/3/2026","summary":1368},{"counter":16,"date":"10/4/2026","summary":1372}]},
            {"url":"www.chess.com","favicon":"./assets/favicons/chess.ico","summaryTime":8341,"counter":21,"days":[{"counter":6,"date":"9/20/2026","summary":1912},{"counter":1,"date":"9/21/2026","summary":13},{"counter":4,"date":"10/1/2026","summary":1622},{"counter":10,"date":"10/3/2026","summary":4794}]},
            {"url":"www.google.com","favicon":"./assets/favicons/google.ico","summaryTime":3000,"counter":111,"days":[{"counter":4,"date":"9/20/2026","summary":51},{"counter":1,"date":"9/21/2026","summary":30},{"counter":3,"date":"9/22/2026","summary":40},{"counter":15,"date":"9/23/2026","summary":249},{"counter":1,"date":"10/1/2026","summary":442},{"counter":1,"date":"10/2/2026","summary":140}]},
            {"url":"www.youtube.com","favicon":"./assets/favicons/youtube.ico","summaryTime":60176,"counter":374,"days":[{"counter":13,"date":"9/20/2026","summary":2709},{"counter":28,"date":"9/21/2026","summary":4990},{"counter":67,"date":"10/1/2026","summary":8667},{"counter":49,"date":"10/2/2026","summary":5155},{"counter":10,"date":"10/3/2026","summary":1868},{"counter":9,"date":"10/4/2026","summary":1930}]},
            {"url":"gemini.google.com","favicon":"./assets/favicons/gemini.png","summaryTime":8629,"counter":214,"days":[{"counter":25,"date":"9/29/2026","summary":2179},{"counter":65,"date":"9/30/2026","summary":2709},{"counter":19,"date":"10/1/2026","summary":815},{"counter":90,"date":"10/2/2026","summary":2543},{"counter":15,"date":"10/4/2026","summary":383}]}
        ];

        const CATEGORIES = {
            'Physical': { color: '#00F0FF', icon: 'fa-solid fa-dumbbell', desc: 'Body composition & strength' },
            'Mindset': { color: '#8B5CF6', icon: 'fa-solid fa-brain', desc: 'Mental toughness & reading' },
            'Productivity': { color: '#14B8A6', icon: 'fa-solid fa-bolt', desc: 'Execution & deep work' },
            'Discipline': { color: '#F59E0B', icon: 'fa-solid fa-shield-halved', desc: 'Sleep schedule & diet' }
        };

        const WINTER_ARC_QUOTES = [
            { quote: "Quiet discipline in the cold dark yields results that speak loudly in the light.", author: "Marcus Aurelius" },
            { quote: "We must all suffer from one of two pains: the pain of discipline or the pain of regret.", author: "Jim Rohn" },
            { quote: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
            { quote: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" }
        ];

        const SUMMER_ARC_QUOTES = [
            { quote: "The work put in during winter shines brightest under the summer sun.", author: "Miyamoto Musashi" },
            { quote: "Excellence is not an event, it is a permanent habit.", author: "Aristotle" },
            { quote: "Sunlight reveals what was forged in the shadows.", author: "Seneca" }
        ];

        const DEFAULT_HABITS = [
            { id: '1', name: 'Workout or 10k Steps', category: 'Physical', weight: 2, completed: false },
            { id: '2', name: 'Clean Eating', category: 'Physical', weight: 2, completed: false },
            { id: '3', name: 'Sleep/Wake Schedule (7-8 hrs)', category: 'Discipline', weight: 3, completed: false },
            { id: '4', name: 'Read 10+ Pages Non-Fiction', category: 'Mindset', weight: 1, completed: false },
            { id: '5', name: '2 Hours Deep Focus Lock-In', category: 'Productivity', weight: 3, completed: false },
            { id: '6', name: 'Zero Mindless Social Media Scrolling', category: 'Discipline', weight: 2, completed: false }
        ];

        let currentQuoteIndex = 0;
        let calendarCurrentDate = new Date();
        let selectedCalendarDateStr = null;

        let state = {
            currentArc: 'winter',
            habits: [],
            activeTab: 'tracker',
            streak: 3,
            dailyHabits: {},
            dailyFocus: {},
            laptop: { isAutoPaused: false, isRunning: true, totalSeconds: 0, interval: null },
            timer: { totalFocusSeconds: 0 }
        };
        window.state = state;

        /* Durable Offline Storage Wrapper: Tauri Plugin-Store + IndexedDB + LocalStorage */
        function getDurableStore() {
            return window.ArcStorage || window.localStorage;
        }

        function lsGetRaw(key) {
            try {
                const store = getDurableStore();
                return store.getItem(key);
            } catch (e) {
                return null;
            }
        }

        function getLocalStorageItem(key, fallback = null) {
            let raw = null;
            try {
                const store = getDurableStore();
                raw = store.getItem(key);
                return raw ? JSON.parse(raw) : fallback;
            } catch (e) {
                console.warn(`[ArcStorage] Error reading ${key}:`, e);
                if (raw && e instanceof SyntaxError) {
                    try {
                        const store = getDurableStore();
                        store.setItem(key + '__corrupt_backup', raw);
                        store.removeItem(key);
                    } catch (_) {}
                }
                return fallback;
            }
        }

        function setLocalStorageItem(key, value) {
            let json;
            try { json = JSON.stringify(value); } catch (e) { console.warn(`[ArcStorage] Error serializing ${key}:`, e); return false; }
            try {
                const store = getDurableStore();
                store.setItem(key, json);
                // Also mirror to native localStorage if available
                if (window.ArcStorage && window.__nativeLocalStorage) {
                    try { window.__nativeLocalStorage.setItem(key, json); } catch (_) {}
                }
                return true;
            } catch (e) {
                console.warn(`[ArcStorage] Error writing ${key}:`, e);
                try {
                    const store = getDurableStore();
                    store.removeItem('pp12_revisions');
                    store.setItem(key, json);
                    return true;
                } catch (e2) {}
                return false;
            }
        }

        function verifyDataSchema() {
            try {
                const storedVer = localStorage.getItem('arc_schema_version');
                if (!storedVer || parseInt(storedVer) < SCHEMA_VERSION) {
                    localStorage.setItem('arc_schema_version', SCHEMA_VERSION.toString());
                }
            } catch (e) {
                console.warn('Schema check warning:', e);
            }
        }

        function saveToLocalStorage() {
            setLocalStorageItem('arc_tracker_state', state);
            if (window.ArcGoogleSync && typeof window.ArcGoogleSync.triggerAutoSync === 'function') {
                window.ArcGoogleSync.triggerAutoSync();
            }
            if (window.ArcServerSync && typeof window.ArcServerSync.scheduleDebouncedSync === 'function') {
                window.ArcServerSync.scheduleDebouncedSync(1500);
            }
            if (window.ArcStorage && typeof window.ArcStorage.scheduleAutoSync === 'function') {
                window.ArcStorage.scheduleAutoSync();
            }
        }

        /* Debouncing wrapper for Reflection textarea */
        let saveTextDebounceTimer = null;
        function saveWhatHappenedText() {
            clearTimeout(saveTextDebounceTimer);
            saveTextDebounceTimer = setTimeout(() => {
                const el = document.getElementById('whatHappened');
                if (!el) return;
                const text = el.value;
                try {
                    localStorage.setItem('whatHappenedText', text);
                } catch (e) {
                    console.warn('Quota error on reflection log save', e);
                }
                const displayEl = document.getElementById('displayWhatHappened');
                if (displayEl) displayEl.textContent = text || "Nothing recorded yet.";
            }, 300);
        }

        /* ppro20: live date. dayOverride (1-based) lets Settings jump to any day of the arc. */
        let dayOverride = null;
        try { const o = parseInt(localStorage.getItem('arc_day_override'), 10); if (o > 0) dayOverride = o; } catch (e) {}

        if (typeof window !== 'undefined') {
            window.CATEGORIES = CATEGORIES;
            window.DEFAULT_HABITS = DEFAULT_HABITS;
            window.WINTER_ARC_QUOTES = WINTER_ARC_QUOTES;
            window.SUMMER_ARC_QUOTES = SUMMER_ARC_QUOTES;
            window.state = state;
            try {
                Object.defineProperty(window, 'dayOverride', {
                    get() { return dayOverride; },
                    set(v) { dayOverride = v; },
                    configurable: true
                });
                Object.defineProperty(window, 'calendarCurrentDate', {
                    get() { return calendarCurrentDate; },
                    set(v) { calendarCurrentDate = v; },
                    configurable: true
                });
                Object.defineProperty(window, 'selectedCalendarDateStr', {
                    get() { return selectedCalendarDateStr; },
                    set(v) { selectedCalendarDateStr = v; },
                    configurable: true
                });
            } catch (e) {}
        }

        function getArcWindow() {

            const mk = v => { const d = new Date(v + 'T00:00:00'); return isNaN(d) ? null : d; };
            let c = null; try { c = window.SettingsApp && SettingsApp.get && SettingsApp.get().arc; } catch (_) {}
            let s = c && mk(c.start), e = c && mk(c.end);
            if (!s || !e || e < s) { s = new Date(2026, 9, 1); e = new Date(2026, 11, 31); c = null; }
            const stock = !c || (c.start === '2026-10-01' && c.end === '2026-12-31');
            if (state.currentArc === 'summer' && stock) { s = new Date(e.getFullYear() + 1, 3, 1); e = new Date(s.getFullYear(), 3, 92); }
            return { start: s, end: e, total: Math.round((e - s) / 864e5) + 1 };
        }

        function getEffectiveToday() {
            if (dayOverride) { const w = getArcWindow(); return new Date(w.start.getFullYear(), w.start.getMonth(), w.start.getDate() + dayOverride - 1); }
            const d = new Date(); d.setHours(0, 0, 0, 0); return d;
        }

        function getTodayKey() {
            return formatDateKey(getEffectiveToday());
        }

        function getYesterdayKey() {
            const d = new Date(getEffectiveToday());
            d.setDate(d.getDate() - 1);
            return formatDateKey(d);
        }

        function getTodayFocusSeconds() {
            const todayKey = getTodayKey();
            let secs = 0;
            if (state && state.dailyFocus && state.dailyFocus[todayKey]) {
                secs += Number(state.dailyFocus[todayKey]) || 0;
            }
            if (state && Array.isArray(state.screenTimeLogs)) {
                const logSecs = state.screenTimeLogs
                    .filter(x => x && x.date === todayKey && x.type === 'focus')
                    .reduce((acc, cur) => acc + (Number(cur.seconds) || 0), 0);
                secs = Math.max(secs, logSecs);
            }
            return secs;
        }

        function updateDynamicDayCounter() {
            const w = getArcWindow(), t = getEffectiveToday();
            const day = Math.round((t - w.start) / 864e5) + 1;
            const el = document.getElementById('stat-current-day');
            if (el) el.textContent = day < 1 ? 'Starts in ' + (1 - day) + 'd' : day > w.total ? 'Done \u00B7 ' + w.total + 'd' : 'Day ' + day + ' / ' + w.total;
            const lab = document.getElementById('stat-arc-timeline-label');
            if (lab) lab.textContent = t.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }) + (dayOverride ? ' \u00B7 manual' : '');
            const bar = document.getElementById('stat-arc-progress-bar');
            if (bar) bar.style.width = Math.round(Math.min(Math.max(day, 0), w.total) / w.total * 100) + '%';
            let tw = 0, cw = 0;
            state.habits.forEach(h => { tw += h.weight; if (h.completed) cw += h.weight; });
            const pct = tw ? Math.round(cw / tw * 100) : 0;
            const pe = document.getElementById('stat-today-completion'), pb = document.getElementById('stat-today-progress-bar');
            if (pe) pe.textContent = pct + '%';
            if (pb) pb.style.width = pct + '%';

            const streakEl = document.getElementById('stat-streak');
            if (streakEl) streakEl.textContent = `${state.streak || 0} ${state.streak === 1 ? 'Day' : 'Days'}`;

            // Calculate overall arc index across all recorded days + today
            let allDaysSum = 0, allDaysCount = 0;
            const dh = state.dailyHabits || {};
            const todayKey = getTodayKey();
            const dateKeys = new Set([...Object.keys(dh), todayKey]);
            dateKeys.forEach(k => {
                let dTotal = 0, dComp = 0;
                const dData = dh[k];
                (state.habits || []).forEach(h => {
                    dTotal += h.weight;
                    const isDone = (k === todayKey) ? h.completed : (dData && dData[h.id]);
                    if (isDone) dComp += h.weight;
                });
                if (dTotal > 0) {
                    allDaysSum += (dComp / dTotal) * 100;
                    allDaysCount++;
                }
            });
            const avgOverallPct = allDaysCount > 0 ? (allDaysSum / allDaysCount).toFixed(1) : (pct).toFixed(1);
            const overallScoreEl = document.getElementById('stat-overall-score');
            if (overallScoreEl) overallScoreEl.textContent = `${avgOverallPct}%`;

            const banner = document.getElementById('arc-completion-banner');
            if (banner) {
                if (day >= w.total) {
                    banner.classList.remove('hidden');
                    const badge = document.getElementById('banner-badge');
                    const isSummer = state.currentArc === 'summer';
                    if (badge) badge.textContent = isSummer ? '🏆 SUMMER ARC COMPLETED' : '🏆 WINTER ARC COMPLETED';
                } else {
                    banner.classList.add('hidden');
                }
            }

            const dc = document.getElementById('p20-day');
            if (window.renderDayControl && !(dc && dc.contains(document.activeElement))) renderDayControl();
            return day;
        }

        /* Re-hydrates the "today" flags when the active day changes; never deletes logged history. */
        function syncDayState() {
            const key = getTodayKey(), prev = lsGetRaw('arc_last_day_key') || '2026-10-04';
            if (prev === key) return false;
            state.habits.forEach(h => {
                if (h.completed) { const log = state.dailyHabits[prev] || (state.dailyHabits[prev] = {}); if (log[h.id] === undefined) log[h.id] = true; }
            });
            const cur = state.dailyHabits[key] || {};
            state.habits.forEach(h => { h.completed = !!cur[h.id]; });
            try { localStorage.setItem('arc_last_day_key', key); } catch (e) {}
            saveToLocalStorage();
            return true;
        }

        function formatDateKey(d) {
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }

// Early global bindings for cross-module compatibility
if (typeof window !== 'undefined') {
  window.getArcWindow = getArcWindow;
  window.getEffectiveToday = getEffectiveToday;
  window.getTodayKey = getTodayKey;
  window.getYesterdayKey = getYesterdayKey;
  window.getTodayFocusSeconds = getTodayFocusSeconds;
  window.updateDynamicDayCounter = updateDynamicDayCounter;
  window.syncDayState = syncDayState;
  window.formatDateKey = formatDateKey;
  window.formatDuration = formatDuration;
  window.getGradeInfo = getGradeInfo;
  window.showToast = showToast;
  window.saveToLocalStorage = saveToLocalStorage;
  window.saveWhatHappenedText = saveWhatHappenedText;
  window.getLocalStorageItem = getLocalStorageItem;
  window.setLocalStorageItem = setLocalStorageItem;
  window.lsGetRaw = lsGetRaw;
  window.getDurableStore = getDurableStore;
  window.renderHabits = renderHabits;
  window.toggleHabit = toggleHabit;
  window.toggleHabitForDate = toggleHabitForDate;
  window.addCustomHabit = addCustomHabit;
  window.deleteHabit = deleteHabit;
  window.resetTodayHabits = resetTodayHabits;
  window.renderRulesBlueprint = renderRulesBlueprint;
  window.updateRulesFreezeUI = updateRulesFreezeUI;
  window.toggleStreakFreezeFromRules = toggleStreakFreezeFromRules;
  window.renderCalendar = renderCalendar;
  window.changeCalendarMonth = changeCalendarMonth;
  window.stepCalendarDay = stepCalendarDay;
  window.selectCalendarDate = selectCalendarDate;
  window.renderCalendarDayDetail = renderCalendarDayDetail;
  window.renderMatrix = renderMatrix;
  window.renderSpiderWeb = renderSpiderWeb;
  window.showCategoryDetail = showCategoryDetail;
  window.toggleLaptopTracker = toggleLaptopTracker;
  window.startLaptopTimer = startLaptopTimer;
  window.getTopProductiveDay = getTopProductiveDay;
  window.updateDailyQuote = updateDailyQuote;
  window.refreshDailyQuote = refreshDailyQuote;
  window.openArcModal = openArcModal;
  window.closeArcModal = closeArcModal;
  window.confirmAndLaunchSummerShowcase = confirmAndLaunchSummerShowcase;
  window.nextShowcaseSlide = nextShowcaseSlide;
  window.prevShowcaseSlide = prevShowcaseSlide;
  window.toggleShowcaseAutoplay = toggleShowcaseAutoplay;
  window.closeSummerShowcase = closeSummerShowcase;
  window.applyArcTheme = applyArcTheme;
  window.filterSettingsView = filterSettingsView;
  window.toggleFounderPanel = toggleFounderPanel;
  window.switchTab = switchTab;
  window.renderScreenTime = renderScreenTime;
  window.renderScreenTimeView = renderScreenTime;
}


        function formatDuration(totalSecs) {
            const h = Math.floor(totalSecs / 3600);
            const m = Math.floor((totalSecs % 3600) / 60);
            const s = totalSecs % 60;
            return h > 0 ? `${h}h ${m}m ${s}s` : (m > 0 ? `${m}m ${s}s` : `${s}s`);
        }

        function getGradeInfo(pct, hasHistory) {
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

        function showToast(message) {
            const toast = document.getElementById('toast');
            const msgEl = document.getElementById('toast-message');
            if (toast && msgEl) {
                msgEl.innerText = message;
                toast.classList.remove('translate-y-20', 'opacity-0');
                toast.classList.add('translate-y-0', 'opacity-100');
                setTimeout(() => {
                    toast.classList.remove('translate-y-0', 'opacity-100');
                    toast.classList.add('translate-y-20', 'opacity-0');
                }, 3000);
            }
        }

        function getTopProductiveDay() {
            const dayTotals = {};
            screenTimeData.forEach(site => {
                if (site.days) {
                    site.days.forEach(d => {
                        dayTotals[d.date] = (dayTotals[d.date] || 0) + d.summary;
                    });
                }
            });

            let topDateStr = "10/2/2026";
            let maxSecs = 0;
            for (const [date, secs] of Object.entries(dayTotals)) {
                if (secs > maxSecs) {
                    maxSecs = secs;
                    topDateStr = date;
                }
            }

            const parts = topDateStr.split('/');
            let dateObj = new Date();
            if (parts.length === 3) {
                dateObj = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
            }
            const dateDisplay = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

            return {
                dateStr: topDateStr,
                dateDisplay: dateDisplay,
                totalSecs: maxSecs,
                formattedTime: formatDuration(maxSecs)
            };
        }

        function generatePieChartSVG(slices, radius = 40) {
            let cumulativePercent = 0;
            let svgPaths = '';

            function getCoordinatesForPercent(percent) {
                const x = 50 + radius * Math.cos(2 * Math.PI * percent - Math.PI / 2);
                const y = 50 + radius * Math.sin(2 * Math.PI * percent - Math.PI / 2);
                return [x, y];
            }

            slices.forEach(slice => {
                if (slice.percentage <= 0) return;
                const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
                cumulativePercent += slice.percentage / 100;
                const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                const largeArcFlag = slice.percentage > 50 ? 1 : 0;
                const pathData = [
                    `M 50 50`,
                    `L ${startX} ${startY}`,
                    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                    `Z`
                ].join(' ');
                svgPaths += `<path d="${pathData}" fill="${slice.color}" opacity="0.9" class="transition-all duration-300 hover:opacity-100"><title>${slice.label}: ${Math.round(slice.percentage)}%</title></path>`;
            });

            return `<svg viewBox="0 0 100 100" class="w-36 h-36 sm:w-48 sm:h-48 drop-shadow-xl my-auto">${svgPaths}</svg>`;
        }

        function handleBackupFileSync(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                if (file.name.endsWith('.arcenc') || (typeof e.target.result === 'string' && e.target.result.includes('ARC_ENCRYPTED_V1'))) {
                    if (window.ArcSecurity) {
                        window.ArcSecurity.setPendingEncrypted(e.target.result, file.name);
                        window.ArcSecurity.openEncImportModal();
                        return;
                    }
                }
                if (window.ArcSecurity) {
                    const sc = window.ArcSecurity.scanPayload(e.target.result, file.name);
                    if (!sc.safe) {
                        window.ArcSecurity.openQuarantine(sc, e.target.result, file.name);
                        return;
                    }
                }
                try {
                    let importedData = JSON.parse(e.target.result);
                    if (window.ArcSecurity) importedData = window.ArcSecurity.sanitizeObject(importedData);
                    if (Array.isArray(importedData)) {
                        screenTimeData = mergeBackupDatasets(screenTimeData, importedData);
                        setLocalStorageItem('synced_screenTimeData', screenTimeData);
                        renderScreenTime();
                        showToast("Synced tracking data (Antivirus Verified)!");
                    } else if (importedData.habits || importedData.dailyHabits) {
                        if (importedData.habits) state.habits = importedData.habits;
                        if (importedData.dailyHabits) state.dailyHabits = importedData.dailyHabits;
                        saveToLocalStorage();
                        initApp();
                        showToast("Restored backup state (Antivirus Verified)!");
                    }
                } catch (err) {
                    showToast("Error parsing JSON backup file!");
                }
            };
            reader.readAsText(file);
        }

        function mergeBackupDatasets(base, incoming) {
            const map = new Map();
            base.forEach(item => map.set(item.url, JSON.parse(JSON.stringify(item))));

            incoming.forEach(item => {
                if (map.has(item.url)) {
                    const curr = map.get(item.url);
                    curr.summaryTime += item.summaryTime;
                    curr.counter += item.counter;

                    const dayMap = new Map();
                    (curr.days || []).forEach(d => dayMap.set(d.date, d));
                    (item.days || []).forEach(d => {
                        if (dayMap.has(d.date)) {
                            const existingDay = dayMap.get(d.date);
                            existingDay.summary += d.summary;
                            existingDay.counter += d.counter;
                        } else {
                            dayMap.set(d.date, { ...d });
                        }
                    });
                    curr.days = Array.from(dayMap.values());
                } else {
                    map.set(item.url, JSON.parse(JSON.stringify(item)));
                }
            });

            return Array.from(map.values());
        }

        function renderScreenTime() {
            let totalTimeSec = 0;
            screenTimeData.forEach(item => totalTimeSec += item.summaryTime);

            const topSites = [...screenTimeData]
                .sort((a, b) => b.summaryTime - a.summaryTime)
                .slice(0, 5);

            const totalScreenTimeEl = document.getElementById('displayTotalScreenTime');
            if (totalScreenTimeEl) totalScreenTimeEl.textContent = formatDuration(totalTimeSec);

            const defaultFavicon = "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%2300F0FF%22%3E%3Ccircle cx=%2212%22 cy=%2212%22 r=%2210%22/%3E%3C/svg%3E";
            const listElem = document.getElementById('displayTopWebsites');
            if (listElem) {
                listElem.innerHTML = topSites.map(site => `
                    <li class="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                        <div class="flex items-center gap-2 truncate max-w-[180px] sm:max-w-[220px]">
                            <img src="${site.favicon || defaultFavicon}" class="w-3.5 h-3.5 rounded" onerror="this.onerror=null; this.src='${defaultFavicon}'">
                            <span class="font-medium text-slate-200 truncate text-[11px] sm:text-xs">${site.url}</span>
                        </div>
                        <span class="font-mono text-blue-400 font-bold text-[11px] sm:text-xs">${formatDuration(site.summaryTime)}</span>
                    </li>
                `).join('');
            }

            const resLaptop = document.getElementById('res-laptop-time');
            const resLaptopSec = document.getElementById('res-laptop-seconds-detail');
            const resFocus = document.getElementById('res-total-focus-time');
            const resFocusSec = document.getElementById('res-focus-seconds-detail');
            const resGrand = document.getElementById('res-grand-total-time');
            const resGrandDetail = document.getElementById('res-grand-total-detail');

            // Factor in cross-device mobile screen time if present
            let mobileSecs = 0;
            if (state.deviceScreenTime && state.deviceScreenTime.mobile && state.deviceScreenTime.mobile.seconds) {
                mobileSecs = Number(state.deviceScreenTime.mobile.seconds) || 0;
            } else {
                try {
                    const devRaw = localStorage.getItem('arc_cross_device_screentime');
                    if (devRaw) {
                        const parsed = JSON.parse(devRaw);
                        if (parsed && parsed.mobile && parsed.mobile.seconds) mobileSecs = Number(parsed.mobile.seconds) || 0;
                    }
                } catch(_) {}
            }

            const focusSecs = state.timer.totalFocusSeconds || 0;
            const laptopSecs = state.laptop.totalSeconds + totalTimeSec;
            const combinedScreenSecs = laptopSecs + mobileSecs;
            const grandTotalSecs = focusSecs + combinedScreenSecs;

            if (resLaptop) {
                resLaptop.innerText = mobileSecs > 0 ? formatDuration(combinedScreenSecs) : formatDuration(laptopSecs);
            }
            if (resLaptopSec) {
                resLaptopSec.innerText = mobileSecs > 0 
                    ? `PC: ${formatDuration(laptopSecs)} + Mobile: ${formatDuration(mobileSecs)}` 
                    : `${laptopSecs} logged sec`;
            }
            if (resFocus) resFocus.innerText = formatDuration(focusSecs);
            if (resFocusSec) resFocusSec.innerText = `${focusSecs} logged sec`;
            if (resGrand) resGrand.innerText = formatDuration(grandTotalSecs);
            if (resGrandDetail) {
                resGrandDetail.innerText = mobileSecs > 0
                    ? `Focus: ${formatDuration(focusSecs)} + Combined Screen: ${formatDuration(combinedScreenSecs)}`
                    : `Focus: ${formatDuration(focusSecs)} + Screen: ${formatDuration(laptopSecs)}`;
            }

            const bannerTotal = document.getElementById('arc-end-total-time');
            const bannerFocus = document.getElementById('arc-end-focus-time');
            const bannerLaptop = document.getElementById('arc-end-laptop-time');
            if (bannerTotal) bannerTotal.innerText = formatDuration(grandTotalSecs);
            if (bannerFocus) bannerFocus.innerText = formatDuration(focusSecs);
            if (bannerLaptop) bannerLaptop.innerText = formatDuration(combinedScreenSecs);

            const sideMob = document.getElementById('sidebar-mobile-time');
            const sideComb = document.getElementById('sidebar-combined-time');
            if (sideMob) sideMob.textContent = formatDurationShort ? formatDurationShort(mobileSecs) : `${Math.floor(mobileSecs/60)}m`;
            if (sideComb) sideComb.textContent = formatDurationShort ? formatDurationShort(combinedScreenSecs) : `${Math.floor(combinedScreenSecs/60)}m`;

            const resHabitsCount = document.getElementById('res-completed-habits-count');
            const resHabitsPct = document.getElementById('res-completed-habits-pct');
            const resSessionStatus = document.getElementById('res-session-status');
            const resSessionDesc = document.getElementById('res-last-start-time');

            let totalHabitWeight = 0, compHabitWeight = 0, totalCount = (state.habits || []).length, compCount = 0;
            (state.habits || []).forEach(h => {
                totalHabitWeight += h.weight;
                if (h.completed) { compHabitWeight += h.weight; compCount++; }
            });
            const habitPct = totalHabitWeight > 0 ? Math.round((compHabitWeight / totalHabitWeight) * 100) : 0;
            if (resHabitsCount) resHabitsCount.innerText = `${compCount} / ${totalCount}`;
            if (resHabitsPct) resHabitsPct.innerText = `${habitPct}% Progress`;
            if (resSessionStatus) resSessionStatus.innerText = state.laptop.isRunning ? 'Active' : 'Paused';
            if (resSessionDesc) resSessionDesc.innerText = state.laptop.isRunning ? 'Auto-tracking' : 'Manual Paused';
        }

        function updateDailyQuote(overrideIndex = null) {
            const quoteTextEl = document.getElementById('daily-quote-text');
            const quoteAuthorEl = document.getElementById('daily-quote-author');
            if (!quoteTextEl || !quoteAuthorEl) return;

            const quoteList = window.getQuotePool ? getQuotePool() : (state.currentArc === 'summer' ? SUMMER_ARC_QUOTES : WINTER_ARC_QUOTES);
            const selected = quoteList[overrideIndex !== null ? overrideIndex : currentQuoteIndex % quoteList.length];
            quoteTextEl.innerText = `"${selected.quote}"`;
            quoteAuthorEl.innerText = `— ${selected.author}`;
        }

        function refreshDailyQuote() {
            playSfx('click');
            const quoteList = window.getQuotePool ? getQuotePool() : (state.currentArc === 'summer' ? SUMMER_ARC_QUOTES : WINTER_ARC_QUOTES);
            currentQuoteIndex = (currentQuoteIndex + 1) % quoteList.length;
            updateDailyQuote(currentQuoteIndex);
            showToast("Quote updated!");
        }

        function openArcModal() {
            const modal = document.getElementById('arc-modal');
            const timeEl = document.getElementById('modal-stat-time');
            const habitsEl = document.getElementById('modal-stat-habits');
            const streakEl = document.getElementById('modal-stat-streak');

            if (timeEl) timeEl.innerText = formatDuration(state.timer.totalFocusSeconds + state.laptop.totalSeconds);
            if (habitsEl) habitsEl.innerText = `${state.habits.length} Rules`;
            if (streakEl) streakEl.innerText = `${state.streak} Days`;

            if (modal) modal.classList.remove('hidden');
        }

        function closeArcModal() {
            const modal = document.getElementById('arc-modal');
            if (modal) modal.classList.add('hidden');
        }

        /* ==========================================================================
           4. SHOWCASE ENGINE & SLIDE RENDERING MODULE
           ========================================================================== */
        let showcaseSlides = [];
        let currentShowcaseIndex = 0;
        let showcaseAutoplayInterval = null;

        function confirmAndLaunchSummerShowcase() {
            closeArcModal();
            state.currentArc = 'summer';
            saveToLocalStorage();
            applyArcTheme();
            updateDailyQuote();
            renderSpiderWeb();
            
            // Seamless Heavenly Bodies audio integration: trigger solar celestial ambient soundscape
            try {
                if (window.HeavenlyBodies && typeof window.HeavenlyBodies.enable === 'function') {
                    if (!window.ArcHardwareGatekeeper || !window.ArcHardwareGatekeeper.isCelestialAudioDisabled()) {
                        window.HeavenlyBodies.enable('Sun');
                    } else {
                        console.log('[HeavenlyBodies] Solar ambient sound suppressed on lower-end hardware to ensure smoothness.');
                    }
                }
            } catch (err) {
                console.warn('HeavenlyBodies trigger notice:', err);
            }

            buildShowcaseSlides();
            currentShowcaseIndex = 0;
            
            const overlay = document.getElementById('summer-showcase-overlay');
            if (overlay) {
                overlay.classList.remove('hidden');
                playSfx('fanfare');
                triggerConfettiBurst();
                renderShowcaseSlide();
            }
        }

        function buildShowcaseSlides() {
            showcaseSlides = [];

            let totalTimeSec = 0;
            screenTimeData.forEach(item => totalTimeSec += item.summaryTime);

            let totalW = 0, compW = 0;
            state.habits.forEach(h => {
                totalW += h.weight;
                if (h.completed) compW += h.weight;
            });

            const topDay = getTopProductiveDay();
            const reflectionText = lsGetRaw('whatHappenedText') || "Pushed limits daily, locked in, and achieved transformation goals.";

            const catWeights = { Physical: 0, Mindset: 0, Productivity: 0, Discipline: 0 };
            let totalCatWeight = 0;
            state.habits.forEach(h => {
                catWeights[h.category] = (catWeights[h.category] || 0) + h.weight;
                totalCatWeight += h.weight;
            });
            const catSlices = Object.keys(catWeights).map(cat => ({
                label: cat,
                percentage: totalCatWeight > 0 ? (catWeights[cat] / totalCatWeight) * 100 : 25,
                color: CATEGORIES[cat]?.color || '#00F0FF'
            }));

            const webColors = ['#00F0FF', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981'];
            const topWebSites = [...screenTimeData].sort((a, b) => b.summaryTime - a.summaryTime).slice(0, 4);
            const webSlices = topWebSites.map((w, idx) => ({
                label: w.url,
                percentage: totalTimeSec > 0 ? (w.summaryTime / totalTimeSec) * 100 : 25,
                color: webColors[idx % webColors.length]
            }));

            // Slide 1: Welcome & Summary Splash
            showcaseSlides.push({
                type: 'intro',
                title: 'Summer Arc Unlocked',
                subtitle: 'Reflecting on your transformation journey...',
                badge: 'SOLAR TRANSITION',
                icon: 'fa-solid fa-sun text-amber-400 text-5xl animate-spin-slow',
                bodyHtml: `
                    <div class="space-y-3 py-2">
                        <p class="text-sm text-slate-200">You are stepping into the sun! Here is your complete transformation showcase displaying your top productive day, pie charts, reflection log, and core habits.</p>
                        <div class="inline-block px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-sm uppercase tracking-wider">
                            ${state.streak} Day Momentum Streak Intact
                        </div>
                    </div>
                `
            });

            // Slide 2: TOP MOST PRODUCTIVE DAY
            showcaseSlides.push({
                type: 'topDay',
                title: '🏆 Top Most Productive Day',
                subtitle: 'Your highest logged focus & execution day in the Arc',
                badge: 'PEAK PERFORMANCE',
                icon: 'fa-solid fa-trophy text-amber-400 text-4xl animate-bounce-short',
                bodyHtml: `
                    <div class="bg-gradient-to-br from-amber-950/60 via-slate-900 to-indigo-950/60 p-5 rounded-3xl border-2 border-amber-500/60 space-y-3 shadow-2xl">
                        <div class="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest">${topDay.dateDisplay}</div>
                        <div class="text-3xl sm:text-4xl font-black text-amber-300 font-mono">${topDay.formattedTime}</div>
                        <p class="text-xs text-slate-300">Peak single-day focus & digital execution recorded. You maintained unbroken momentum on this date.</p>
                        <div class="flex items-center justify-center gap-2 pt-1">
                            <span class="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-mono font-bold">Grade S Execution</span>
                            <span class="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-mono font-bold">100% Lock-In</span>
                        </div>
                    </div>
                `
            });

            // Slide 3: VISUAL PIE CHARTS BREAKDOWN
            showcaseSlides.push({
                type: 'pieCharts',
                title: '📊 Interactive Arc Pie Charts',
                subtitle: 'Visual distribution of your pillars and digital time',
                badge: 'ANALYTICS MATRIX',
                icon: 'fa-solid fa-chart-pie text-cyan-400 text-4xl',
                bodyHtml: `
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center py-2">
                        <div class="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 flex flex-col items-center">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pillar Distribution</span>
                            ${generatePieChartSVG(catSlices, 38)}
                            <div class="flex flex-wrap justify-center gap-1.5 mt-2 text-[9px]">
                                ${catSlices.map(s => `<span class="px-1.5 py-0.5 rounded font-mono font-bold" style="background:${s.color}25; color:${s.color}">${s.label}: ${Math.round(s.percentage)}%</span>`).join('')}
                            </div>
                        </div>

                        <div class="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 flex flex-col items-center">
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Top Screen Activity</span>
                            ${generatePieChartSVG(webSlices, 38)}
                            <div class="flex flex-wrap justify-center gap-1.5 mt-2 text-[9px]">
                                ${webSlices.map(s => `<span class="px-1.5 py-0.5 rounded font-mono font-bold truncate max-w-[110px]" style="background:${s.color}25; color:${s.color}">${s.label.replace('www.','')}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                `
            });

            // Slide 4: DAILY REFLECTION LOG SHOWCASE
            showcaseSlides.push({
                type: 'reflection',
                title: '✍️ Daily Reflection Log',
                subtitle: 'Your personal thoughts, wins, and journal highlights',
                badge: 'REFLECTION JOURNAL',
                icon: 'fa-solid fa-book-open text-purple-400 text-4xl',
                bodyHtml: `
                    <div class="bg-slate-900/90 p-5 rounded-3xl border border-purple-500/40 text-left space-y-3 shadow-xl">
                        <div class="flex items-center justify-between text-[10px] font-mono text-purple-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                            <span>Logged Reflection</span>
                            <span>October 2026</span>
                        </div>
                        <p class="text-xs sm:text-sm text-slate-200 italic leading-relaxed">
                            "${reflectionText}"
                        </p>
                        <div class="pt-2 flex items-center justify-between border-t border-slate-800/80 text-[10px] text-slate-400">
                            <span>Mindset Tagged: <strong class="text-purple-300">Marcus Aurelius</strong></span>
                            <span class="text-emerald-400 font-bold">✓ Saved in Database</span>
                        </div>
                    </div>
                `
            });

            // Slide 5..N: INDIVIDUAL HABITS
            state.habits.forEach((habit, idx) => {
                const catInfo = CATEGORIES[habit.category] || { color: '#00F0FF', icon: 'fa-solid fa-star' };
                const isDone = habit.completed;

                showcaseSlides.push({
                    type: 'habit',
                    title: `Habit #${idx + 1}: ${habit.name}`,
                    subtitle: `Category: ${habit.category} • Priority Weight: ${habit.weight}x`,
                    badge: `PILLAR: ${habit.category.toUpperCase()}`,
                    icon: `${catInfo.icon} text-4xl`,
                    iconColor: catInfo.color,
                    bodyHtml: `
                        <div class="space-y-4 py-2">
                            <div class="p-4 rounded-2xl border ${isDone ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200' : 'bg-slate-900/80 border-slate-800 text-slate-300'} flex flex-col items-center justify-center space-y-2">
                                <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style="background:${catInfo.color}20; color:${catInfo.color}">
                                    <i class="${catInfo.icon}"></i>
                                </div>
                                <h4 class="text-base sm:text-lg font-black text-white">${habit.name}</h4>
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${isDone ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'}">
                                        ${isDone ? '✓ Completed Today' : '⏳ Pending / Logged in System'}
                                    </span>
                                    <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                                        Weight: ${habit.weight}x
                                    </span>
                                </div>
                            </div>
                        </div>
                    `
                });
            });

            // Final Slide: Summer Arc Oath
            showcaseSlides.push({
                type: 'outro',
                title: '☀️ Ready for the Summer Arc',
                subtitle: 'Carry forward your momentum and forge ahead',
                badge: 'NEW HORIZON',
                icon: 'fa-solid fa-fire text-amber-500 text-5xl animate-pulse',
                bodyHtml: `
                    <div class="space-y-4 py-2">
                        <p class="text-sm text-slate-200">You have analyzed your progress and reflected on your efforts. Keep pushing forward into the new season with unwavering discipline.</p>
                        <div class="pt-2">
                            <button role="button" onclick="closeSummerShowcase()" class="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm uppercase tracking-wider transition shadow-xl shadow-amber-500/30 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                                Enter Summer Arc Mode
                            </button>
                        </div>
                    </div>
                `
            });
        }

        function renderShowcaseSlide() {
            if (showcaseSlides.length === 0) return;
            currentShowcaseIndex = Math.max(0, Math.min(currentShowcaseIndex, showcaseSlides.length - 1));
            const slide = showcaseSlides[currentShowcaseIndex];
            const card = document.getElementById('showcase-slide-card');
            const stepLabel = document.getElementById('showcase-step-label');
            const pctLabel = document.getElementById('showcase-pct-label');
            const topBar = document.getElementById('showcase-top-progress-bar');

            const pct = Math.round(((currentShowcaseIndex + 1) / showcaseSlides.length) * 100);

            if (stepLabel) stepLabel.textContent = `Effort ${currentShowcaseIndex + 1} of ${showcaseSlides.length}`;
            if (pctLabel) pctLabel.textContent = `${pct}% Complete`;
            if (topBar) topBar.style.width = `${pct}%`;

            if (card) {
                card.classList.remove('showcase-card-slide');
                void card.offsetWidth; // Force reflow to retrigger 3D cinematic animation
                card.classList.add('showcase-card-slide');
                card.innerHTML = `
                    <div class="space-y-3">
                        <div class="inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold tracking-widest uppercase">
                            ${slide.badge || 'ARC SHOWCASE'}
                        </div>
                        <div class="my-2">
                            <i class="${slide.icon}" ${slide.iconColor ? `style="color:${slide.iconColor}"` : ''}></i>
                        </div>
                        <h3 class="text-xl sm:text-2xl font-black text-white">${slide.title}</h3>
                        <p class="text-xs text-slate-300">${slide.subtitle}</p>
                    </div>
                    ${slide.bodyHtml}
                `;
            }

            renderShowcaseDots();
        }

        function renderShowcaseDots() {
            const container = document.getElementById('showcase-dots-container');
            if (!container) return;
            container.innerHTML = showcaseSlides.map((_, idx) => `
                <button role="button" onclick="goToShowcaseSlide(${idx}); playSfx('click')" aria-label="Go to slide ${idx + 1}" class="w-2.5 h-2.5 rounded-full transition-all ${idx === currentShowcaseIndex ? 'bg-amber-400 w-6' : 'bg-slate-700 hover:bg-slate-500'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"></button>
            `).join('');
        }

        function goToShowcaseSlide(idx) {
            currentShowcaseIndex = Math.max(0, Math.min(Number(idx) || 0, showcaseSlides.length - 1));
            renderShowcaseSlide();
        }

        function nextShowcaseSlide() {
            playSfx('slideNext');
            if (currentShowcaseIndex < showcaseSlides.length - 1) {
                currentShowcaseIndex++;
                renderShowcaseSlide();
            } else {
                closeSummerShowcase();
            }
        }

        function prevShowcaseSlide() {
            playSfx('click');
            if (currentShowcaseIndex > 0) {
                currentShowcaseIndex--;
                renderShowcaseSlide();
            }
        }

        function toggleShowcaseAutoplay() {
            playSfx('click');
            const icon = document.getElementById('showcase-autoplay-icon');
            const text = document.getElementById('showcase-autoplay-text');

            if (showcaseAutoplayInterval) {
                clearInterval(showcaseAutoplayInterval);
                showcaseAutoplayInterval = null;
                if (icon) icon.className = 'fa-solid fa-play text-xs';
                if (text) text.textContent = 'Auto Play';
                showToast("Autoplay Paused");
            } else {
                showcaseAutoplayInterval = setInterval(() => {
                    if (currentShowcaseIndex < showcaseSlides.length - 1) {
                        currentShowcaseIndex++;
                        renderShowcaseSlide();
                    } else {
                        clearInterval(showcaseAutoplayInterval);
                        showcaseAutoplayInterval = null;
                        if (icon) icon.className = 'fa-solid fa-play text-xs';
                        if (text) text.textContent = 'Auto Play';
                    }
                }, 3000);
                if (icon) icon.className = 'fa-solid fa-pause text-xs';
                if (text) text.textContent = 'Pause';
                showToast("Autoplay Started");
            }
        }

        function closeSummerShowcase() {
            if (showcaseAutoplayInterval) {
                clearInterval(showcaseAutoplayInterval);
                showcaseAutoplayInterval = null;
            }
            const overlay = document.getElementById('summer-showcase-overlay');
            if (overlay) overlay.classList.add('hidden');
        }

        /* ==========================================================================
           5. HABIT STATE, CALENDAR & UI CONTROLLER
           ========================================================================== */
        function applyArcTheme() {
            const isSummer = state.currentArc === 'summer';
            const body = document.body;
            const logoIcon = document.getElementById('arc-logo-icon');
            const iconSymbol = document.getElementById('arc-icon-symbol');
            const mainTitle = document.getElementById('arc-main-title');
            const yearBadge = document.getElementById('arc-year-badge');
            const subtitle = document.getElementById('arc-subtitle');
            const footerText = document.getElementById('footer-text');
            const switchBtnText = document.getElementById('arc-switch-btn-text');
            const switchIcon = document.getElementById('header-arc-switch-icon');

            const isBw = (window.ArcBlackWhiteMode && window.ArcBlackWhiteMode.isEnabled()) || document.documentElement.classList.contains('arc-bw-mode');
            const isLight = document.documentElement.getAttribute('data-mode') === 'light';

            if (isBw) {
                body.style.backgroundColor = isLight ? '#ffffff' : '#000000';
            } else if (isSummer) {
                body.style.backgroundColor = '#0F0B03';
                if (logoIcon) logoIcon.className = "w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-black font-black text-lg sm:text-xl shadow-lg shadow-amber-500/30 active:scale-95 transition-transform duration-200 cursor-pointer";
                if (iconSymbol) iconSymbol.className = "fa-solid fa-sun text-white";
                if (mainTitle) mainTitle.innerHTML = `SUMMER ARC <span id="arc-year-badge" class="text-[9px] sm:text-xs px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 ml-1 font-semibold">2026</span>`;
                if (subtitle) subtitle.textContent = "Apr 1 - Jul 1 • Shine in the Light";
                if (footerText) footerText.textContent = "Summer Arc Tracker • April 1 to July 1 • Radiate discipline.";
                if (switchBtnText) switchBtnText.textContent = "Switch to Winter Arc";
                if (switchIcon) switchIcon.className = "fa-solid fa-snowflake text-cyan-400";
            } else {
                body.style.backgroundColor = '#060913';
                if (logoIcon) logoIcon.className = "w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-black font-black text-lg sm:text-xl shadow-lg shadow-cyan-500/30 active:scale-95 transition-transform duration-200 cursor-pointer";
                if (iconSymbol) iconSymbol.className = "fa-solid fa-snowflake text-white";
                if (mainTitle) mainTitle.innerHTML = `WINTER ARC <span id="arc-year-badge" class="text-[9px] sm:text-xs px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 ml-1 font-semibold">2026</span>`;
                if (subtitle) subtitle.textContent = "Oct 1 - Dec 31 • Transform in Silence";
                if (footerText) footerText.textContent = "Winter Arc Lock-In Tracker • October 1 to December 31 • Transform in silence.";
                if (switchBtnText) switchBtnText.textContent = "Start Summer Arc";
                if (switchIcon) switchIcon.className = "fa-solid fa-sun text-amber-400";
            }
        }

        window.ARC_TAB_THEMES = {
            tracker: {
                active: "px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/30",
                inactive: "px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 flex items-center space-x-1.5",
                iconActive: "fa-solid fa-list-check text-slate-950",
                iconInactive: "fa-solid fa-list-check text-emerald-400",
                mobileActive: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)] font-bold",
                mobileInactive: "text-slate-400 hover:text-slate-200 border border-transparent font-medium"
            },
            screentime: {
                active: "px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 flex items-center space-x-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md shadow-purple-500/30",
                inactive: "px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-purple-300 hover:bg-purple-500/10 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 flex items-center space-x-1.5",
                iconActive: "fa-solid fa-hourglass-half text-white",
                iconInactive: "fa-solid fa-hourglass-half text-purple-400",
                mobileActive: "bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.25)] font-bold",
                mobileInactive: "text-slate-400 hover:text-slate-200 border border-transparent font-medium"
            },
            rules: {
                active: "px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-orange-400 text-slate-950 shadow-md shadow-amber-500/30",
                inactive: "px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 flex items-center space-x-1.5",
                iconActive: "fa-solid fa-shield-halved text-slate-950",
                iconInactive: "fa-solid fa-shield-halved text-amber-400",
                mobileActive: "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.25)] font-bold",
                mobileInactive: "text-slate-400 hover:text-slate-200 border border-transparent font-medium"
            },
            progression: {
                active: "px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 flex items-center space-x-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 shadow-md shadow-yellow-500/30",
                inactive: "px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-yellow-300 hover:bg-yellow-500/10 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 flex items-center space-x-1.5",
                iconActive: "fa-solid fa-crown text-slate-950",
                iconInactive: "fa-solid fa-crown text-yellow-400",
                mobileActive: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 shadow-[0_0_12px_rgba(234,179,8,0.25)] font-bold",
                mobileInactive: "text-slate-400 hover:text-slate-200 border border-transparent font-medium"
            },
            results: {
                active: "px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 flex items-center space-x-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/30",
                inactive: "px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 flex items-center space-x-1.5",
                iconActive: "fa-solid fa-diagram-project text-slate-950",
                iconInactive: "fa-solid fa-diagram-project text-cyan-400",
                mobileActive: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.25)] font-bold",
                mobileInactive: "text-slate-400 hover:text-slate-200 border border-transparent font-medium"
            },
            settings: {
                active: "px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 flex items-center space-x-1.5 bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-md shadow-pink-500/30",
                inactive: "px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-pink-300 hover:bg-pink-500/10 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 flex items-center space-x-1.5",
                iconActive: "fa-solid fa-gear text-white",
                iconInactive: "fa-solid fa-gear text-pink-400",
                mobileActive: "bg-pink-500/15 text-pink-300 border border-pink-500/30 shadow-[0_0_12px_rgba(236,72,153,0.25)] font-bold",
                mobileInactive: "text-slate-400 hover:text-slate-200 border border-transparent font-medium"
            },
            notifications: {
                active: "px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 flex items-center space-x-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/30",
                inactive: "px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 flex items-center space-x-1.5",
                iconActive: "fa-solid fa-bell text-slate-950",
                iconInactive: "fa-solid fa-bell text-cyan-400",
                mobileActive: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.25)] font-bold",
                mobileInactive: "text-slate-400 hover:text-slate-200 border border-transparent font-medium"
            }
        };

        function switchTab(tabName) {
            // Strictly Mobile Only: Block tab switching if mandatory permissions are missing
            if (window.ArcMobilePermissions && typeof window.ArcMobilePermissions.isMobile === 'function' && window.ArcMobilePermissions.isMobile()) {
                if (typeof window.ArcMobilePermissions.areAllPermissionsGranted === 'function' && !window.ArcMobilePermissions.areAllPermissionsGranted()) {
                    window.ArcMobilePermissions.openModal();
                    window.ArcMobilePermissions.showMissingPermissionAlert('Some functions won’t work: You must grant all required permissions before opening other tabs.');
                    return;
                }
            }

            if (tabName === 'notifications') {
                if (window.ArcNotifications) {
                    window.ArcNotifications.toggleDrawer(true);
                }
                return;
            }

            playSfx('tab');
            state.activeTab = tabName;

            ['tracker', 'rules', 'results', 'progression', 'settings', 'screentime', 'notifications'].forEach(t => {
                const view = document.getElementById(`view-${t}`);
                const desktopTab = document.getElementById(`tab-${t}`);
                const mobileTab = document.getElementById(`mobile-tab-${t}`);
                const theme = window.ARC_TAB_THEMES && window.ARC_TAB_THEMES[t];

                if (view) {
                    const isTarget = (t === tabName);
                    view.classList.toggle('hidden', !isTarget);
                    if (isTarget) {
                        view.classList.remove('tab-view-enter');
                        void view.offsetWidth;
                        view.classList.add('tab-view-enter');
                    }
                }

                if (desktopTab && theme) {
                    const isTarget = (t === tabName);
                    desktopTab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
                    desktopTab.className = isTarget ? theme.active : theme.inactive;
                    const icon = desktopTab.querySelector('i');
                    if (icon) icon.className = isTarget ? theme.iconActive : theme.iconInactive;
                }

                if (mobileTab && theme) {
                    const isTarget = (t === tabName);
                    mobileTab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
                    mobileTab.className = `flex-1 min-w-0 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-200 active:scale-95 select-none touch-manipulation ${isTarget ? theme.mobileActive : theme.mobileInactive}`;
                    const dot = mobileTab.querySelector('.mobile-active-dot');
                    if (dot) {
                        dot.style.display = isTarget ? '' : 'none';
                    }
                }
            });

            if (tabName === 'screentime') {
                if (typeof renderScreenTimeView === 'function') {
                    renderScreenTimeView();
                } else if (window.ArcAppTracker && typeof window.ArcAppTracker.renderScreenTimeView === 'function') {
                    window.ArcAppTracker.renderScreenTimeView();
                }
            }
            if (tabName === 'notifications' && window.ArcNotifications) {
                window.ArcNotifications.renderUi();
            }

            if (tabName === 'results') {
                renderSpiderWeb();
                renderScreenTime();
                if (window.ArcLeaderboardGroups && typeof window.ArcLeaderboardGroups.render === 'function') {
                    window.ArcLeaderboardGroups.render();
                }
                if (window.ArcHabitAnalytics && typeof window.ArcHabitAnalytics.refresh === 'function') {
                    window.ArcHabitAnalytics.refresh();
                }
            }
            if (tabName === 'rules') {
                renderRulesBlueprint();
                if (window.renderHabitManager) renderHabitManager(true);
            }
            if (window.SettingsApp) SettingsApp.onTab(tabName);
            const bgQuote = document.getElementById('arc-custom-bg-quote');
            if (bgQuote) {
                if (tabName === 'tracker') {
                    const quoteText = document.getElementById('arc-custom-bg-quote-text');
                    if (quoteText && quoteText.textContent && quoteText.textContent.trim()) {
                        bgQuote.classList.remove('hidden');
                        requestAnimationFrame(() => {
                            bgQuote.classList.remove('opacity-0');
                            bgQuote.classList.add('opacity-100');
                        });
                    }
                } else {
                    bgQuote.classList.add('opacity-0');
                    bgQuote.classList.add('hidden');
                }
            }

            if (tabName === 'settings') {
                if (window.renderHabitManager) renderHabitManager(true);
                if (window.ArcGoogleSync && typeof window.ArcGoogleSync.renderUi === 'function') window.ArcGoogleSync.renderUi();
                if (window.ArcCustomBackground && typeof window.ArcCustomBackground.renderCard === 'function') window.ArcCustomBackground.renderCard();
                if (window.ArcLiquidGlass && typeof window.ArcLiquidGlass.updateUI === 'function') window.ArcLiquidGlass.updateUI();
            }
        }

        function filterSettingsView(category) {
            playSfx('click');
            const subtabs = ['all', 'habits', 'account', 'faq', 'founder'].map(id => document.getElementById('settings-subtab-' + id)).filter(Boolean);
            subtabs.forEach(b => {
                b.className = "shrink-0 px-3 py-1.5 rounded-lg font-medium text-slate-400 hover:text-white transition";
            });
            const activeBtn = document.getElementById('settings-subtab-' + category);
            if (activeBtn) activeBtn.className = "shrink-0 px-3 py-1.5 rounded-lg font-bold bg-cyan-500 text-black shadow-sm transition";

            const p20Account = document.getElementById('p20-google-account');
            const p20ServerSync = document.getElementById('p20-server-sync');
            const p20Day = document.getElementById('p20-day');
            const sxRoot = document.getElementById('sx-root');
            const axRoot = document.getElementById('ax-root');
            const axBar = document.getElementById('ax-bar') || document.getElementById('ax-bar-dock');
            const themeArcCard = document.getElementById('settings-theme-arc-card');
            const hwCard = document.getElementById('settings-hardware-profiler-card');
            const liquidGlassCard = document.getElementById('settings-liquid-glass-card');
            const customBgCard = document.getElementById('settings-custom-bg-card');
            const autoStartCard = document.getElementById('settings-autostart-card');
            const screenNotifCard = document.getElementById('settings-screentime-notif-card');
            const faqCard = document.getElementById('settings-additional-faq-card');
            const founderCard = document.getElementById('settings-about-founder-card');
            const goldCard = document.getElementById('settings-gold-card');
            const termsCard = document.getElementById('settings-terms-legal-card');

            const allCards = [
                themeArcCard, hwCard, liquidGlassCard, customBgCard, autoStartCard,
                screenNotifCard, p20Account, p20ServerSync, p20Day, sxRoot, axRoot,
                faqCard, founderCard, goldCard, termsCard
            ];

            if (category === 'all') {
                allCards.forEach(c => { if (c) c.style.display = ''; });
                if (axBar) axBar.style.display = '';
            } else if (category === 'habits') {
                allCards.forEach(c => { if (c) c.style.display = 'none'; });
                if (themeArcCard) themeArcCard.style.display = '';
                if (hwCard) hwCard.style.display = '';
                if (liquidGlassCard) liquidGlassCard.style.display = '';
                if (customBgCard) customBgCard.style.display = '';
                if (autoStartCard) autoStartCard.style.display = '';
                if (screenNotifCard) screenNotifCard.style.display = '';
                if (p20Day) p20Day.style.display = '';
                if (sxRoot) sxRoot.style.display = '';
                if (axRoot) axRoot.style.display = '';
                if (goldCard) goldCard.style.display = '';
                if (axBar) axBar.style.display = '';
            } else if (category === 'account') {
                allCards.forEach(c => { if (c) c.style.display = 'none'; });
                if (p20Account) p20Account.style.display = '';
                if (p20ServerSync) p20ServerSync.style.display = '';
                if (axBar) axBar.style.display = 'none';
                if (window.ArcGoogleSync && typeof window.ArcGoogleSync.renderUi === 'function') {
                    window.ArcGoogleSync.renderUi();
                }
            } else if (category === 'faq') {
                allCards.forEach(c => { if (c) c.style.display = 'none'; });
                if (axBar) axBar.style.display = 'none';
                if (faqCard) {
                    faqCard.style.display = '';
                    faqCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    if (window.ArcSettingsAccordion && typeof window.ArcSettingsAccordion.toggle === 'function') {
                        window.ArcSettingsAccordion.toggle('settings-additional-faq-card', true);
                    } else if (window.ArcFaq && typeof window.ArcFaq.toggleSection === 'function') {
                        window.ArcFaq.toggleSection(true);
                    }
                }
                if (window.ArcFaq && typeof window.ArcFaq.render === 'function') window.ArcFaq.render();
            } else if (category === 'founder') {
                allCards.forEach(c => { if (c) c.style.display = 'none'; });
                if (axBar) axBar.style.display = 'none';
                if (founderCard) {
                    founderCard.style.display = '';
                    founderCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    if (window.ArcSettingsAccordion && typeof window.ArcSettingsAccordion.toggle === 'function') {
                        window.ArcSettingsAccordion.toggle('settings-about-founder-card', true);
                    } else if (window.ArcAboutFounder && typeof window.ArcAboutFounder.toggle === 'function') {
                        window.ArcAboutFounder.toggle(true);
                    } else if (typeof toggleFounderPanel === 'function') {
                        toggleFounderPanel(true);
                    }
                }
            }
        }window.filterSettingsView = filterSettingsView;

        function toggleFounderPanel(forceState) {
            if (window.ArcAboutFounder && typeof window.ArcAboutFounder.toggle === 'function') {
                return window.ArcAboutFounder.toggle(forceState);
            }
            const content = document.getElementById('founder-expandable-content');
            const toggleBtn = document.getElementById('founder-toggle-btn');
            const chevron = document.getElementById('founder-chevron-icon');
            const summaryText = document.getElementById('founder-summary-hint');
            if (!content) return;
            const willExpand = (typeof forceState === 'boolean') ? forceState : !content.classList.contains('expanded');
            if (willExpand) {
                content.classList.remove('hidden');
                void content.offsetWidth;
                content.classList.add('expanded');
                if (toggleBtn) {
                    toggleBtn.innerHTML = '<span>Collapse Story</span> <i class="fa-solid fa-chevron-up text-[10px]"></i>';
                }
                if (chevron) chevron.className = 'fa-solid fa-chevron-up text-[10px]';
                if (summaryText) summaryText.textContent = 'How the journey started • Goals & uncompromised vision • Why Arc Tracker is 100% free • Tap to collapse';
            } else {
                content.classList.remove('expanded');
                setTimeout(() => {
                    if (!content.classList.contains('expanded')) content.classList.add('hidden');
                }, 440);
                if (toggleBtn) {
                    toggleBtn.innerHTML = '<span>Read Story</span> <i class="fa-solid fa-chevron-down text-[10px]"></i>';
                }
                if (chevron) chevron.className = 'fa-solid fa-chevron-down text-[10px]';
                if (summaryText) summaryText.textContent = 'How the journey started • Goals & uncompromised vision • Why Arc Tracker is 100% free • Tap to expand';
            }
            if (window.ArcAboutFounder) window.ArcAboutFounder.isExpanded = willExpand;
        }
        window.toggleFounderPanel = toggleFounderPanel;

        function renderHabits() {
            const container = document.getElementById('habits-container');
            if (!container) return;

            let totalW = 0, compW = 0;

            container.innerHTML = state.habits.map(habit => {
                totalW += habit.weight;
                if (habit.completed) compW += habit.weight;

                const catInfo = CATEGORIES[habit.category] || { color: '#00F0FF', icon: 'fa-solid fa-star' };

                return `
                    <div class="glass-card glass-card-hover rounded-2xl p-3 sm:p-4 habit-row flex items-center justify-between gap-3 transition-all duration-300 ease-out hover:scale-[1.01] active:scale-[0.99] hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(0,240,255,0.25)] ${habit.completed ? 'border-l-4 border-l-emerald-400 bg-emerald-950/20' : 'border-l-4 border-l-slate-700'}">
                        <div class="flex items-center space-x-3 flex-1 min-w-0">
                            <input type="checkbox" id="habit-check-${habit.id}" ${habit.completed ? 'checked' : ''} onchange="toggleHabit('${habit.id}')" aria-label="${habit.name}" class="habit-checkbox w-6 h-6 rounded-lg border-2 border-slate-600 bg-slate-900 cursor-pointer shrink-0 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                            <label for="habit-check-${habit.id}" class="cursor-pointer flex-1 min-w-0 select-none py-1">
                                <div class="arc-sensitive-name text-xs sm:text-sm font-bold truncate ${habit.completed ? 'line-through text-slate-400' : 'text-white'}">${habit.name}</div>
                                <div class="flex items-center gap-2 mt-0.5">
                                    <span class="arc-sensitive-val text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded shrink-0" style="background:${catInfo.color}20; color:${catInfo.color}">${habit.category}</span>
                                    <span class="text-[9px] font-mono text-slate-400 shrink-0">${habit.weight}x Priority</span>
                                </div>
                            </label>
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                            <button type="button" onclick="ArcHabitAnalytics.openDrawer('${habit.id}'); event.stopPropagation();" title="Inspect Habit Heatmap & Graphs" class="w-8 h-8 rounded-xl bg-slate-800/90 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400/60 text-slate-300 hover:text-cyan-300 grid place-items-center transition active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400">
                                <i class="fa-solid fa-chart-line text-xs"></i>
                            </button>
                            <button role="button" onclick="deleteHabit('${habit.id}')" class="text-slate-500 hover:text-rose-400 p-2.5 sm:p-2 -mr-1 transition text-xs shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px] touch-manipulation rounded-xl active:bg-rose-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" aria-label="Delete ${habit.name}">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            const pct = totalW > 0 ? Math.round((compW / totalW) * 100) : 0;
            const completionEl = document.getElementById('stat-today-completion');
            const progressBar = document.getElementById('stat-today-progress-bar');
            if (completionEl) completionEl.textContent = `${pct}%`;
            if (progressBar) progressBar.style.width = `${pct}%`;

            renderCalendar();
            renderMatrix();
            renderSpiderWeb();
            updateDynamicDayCounter();
            if (window.renderHabitManager) renderHabitManager();
            if (window.ArcHabitAnalytics && typeof window.ArcHabitAnalytics.refresh === 'function') {
                window.ArcHabitAnalytics.refresh();
            }
        }

        function toggleHabit(id) {
            const habit = state.habits.find(h => h.id === id);
            if (!habit) return;

            habit.completed = !habit.completed;
            playSfx(habit.completed ? 'check' : 'uncheck');

            const today = getTodayKey();
            if (!state.dailyHabits[today]) state.dailyHabits[today] = {};
            state.habits.forEach(h => {
                if (state.dailyHabits[today][h.id] === undefined) {
                    state.dailyHabits[today][h.id] = (h.id === id ? habit.completed : !!h.completed);
                }
            });
            state.dailyHabits[today][id] = habit.completed;
            state.habitTimestamps = state.habitTimestamps || {};
            state.habitTimestamps[`${today}:${id}`] = Date.now();

            saveToLocalStorage();
            renderHabits();
            if (typeof renderCalendarDayDetail === 'function' && selectedCalendarDateStr === today) {
                renderCalendarDayDetail(today);
            }
        }

        /* Grace window: only Today and Yesterday can be edited. Historical dates older than yesterday are immutable. */
        function toggleHabitForDate(dateKey, id) {
            const todayKey = getTodayKey();
            const yesterdayKey = getYesterdayKey();
            if (dateKey > todayKey) {
                if (typeof showToast === 'function') showToast("Future dates are locked.");
                return;
            }
            if (dateKey < yesterdayKey) {
                if (typeof showToast === 'function') showToast("Locked History: Habit records older than yesterday cannot be modified.");
                return;
            }
            if (dateKey === todayKey) return toggleHabit(id);
            const h = state.habits.find(x => x.id === id);
            if (!h) return;
            const day = state.dailyHabits[dateKey] || (state.dailyHabits[dateKey] = {});
            day[id] = !day[id];
            state.habitTimestamps = state.habitTimestamps || {};
            state.habitTimestamps[`${dateKey}:${id}`] = Date.now();
            playSfx(day[id] ? 'check' : 'uncheck');
            saveToLocalStorage();
            renderHabits();
            renderCalendar();
            if (typeof renderCalendarDayDetail === 'function') {
                renderCalendarDayDetail(dateKey);
            }
        }

        function addCustomHabit() {
            const nameEl = document.getElementById('custom-habit-name');
            const catEl = document.getElementById('custom-habit-category');
            const weightEl = document.getElementById('custom-habit-weight');

            if (!nameEl || !nameEl.value.trim()) {
                showToast("Please enter a habit name!");
                return;
            }

            const newHabit = {
                id: Date.now().toString(),
                name: nameEl.value.trim(),
                category: catEl.value,
                weight: parseInt(weightEl.value) || 1,
                completed: false
            };

            state.habits.push(newHabit);
            nameEl.value = '';
            playSfx('click');
            saveToLocalStorage();
            renderHabits();
            renderRulesBlueprint();
            if (window.renderHabitManager) renderHabitManager(true);
            showToast("Added new habit to ruleset!");
        }

        function deleteHabit(id) {
            state.habits = state.habits.filter(h => h.id !== id);
            playSfx('click');
            saveToLocalStorage();
            renderHabits();
            renderRulesBlueprint();
            if (window.renderHabitManager) renderHabitManager(true);
            showToast("Habit removed.");
        }

        function resetTodayHabits() {
            playSfx('click');
            const now = Date.now();
            const today = getTodayKey();
            state.dailyHabits[today] = state.dailyHabits[today] || {};
            state.habitTimestamps = state.habitTimestamps || {};
            state.habits.forEach(h => {
                h.completed = false;
                state.dailyHabits[today][h.id] = false;
                state.habitTimestamps[`${today}:${h.id}`] = now;
            });
            saveToLocalStorage();
            renderHabits();
            renderCalendar();
            if (typeof renderCalendarDayDetail === 'function' && selectedCalendarDateStr === today) {
                renderCalendarDayDetail(today);
            }
            showToast("Today's progress reset.");
        }

        
// --- RULES TAB STREAK FREEZE HELPERS ---
function updateRulesFreezeUI() {
    let freezeOn = false;
    if (window.SettingsApp && typeof window.SettingsApp.get === 'function') {
        const cfg = window.SettingsApp.get();
        freezeOn = !!(cfg && cfg.freeze && cfg.freeze.on);
    }
    const toggle = document.getElementById('rules-freeze-toggle');
    const badge = document.getElementById('rules-freeze-badge');
    const status = document.getElementById('rules-freeze-status');

    if (toggle) toggle.checked = freezeOn;

    if (badge) {
        badge.textContent = freezeOn ? 'ACTIVE' : 'OFF';
        badge.className = freezeOn
            ? 'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            : 'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700';
    }

    if (status) {
        const memo = window.__sfzMemo || {};
        const ym = (new Date()).toISOString().slice(0, 7);
        const usedDate = memo[ym];
        if (!freezeOn) {
            status.textContent = 'Off. A missed day resets your streak to 0.';
            status.className = 'text-[11px] font-mono text-slate-400';
        } else if (usedDate) {
            status.textContent = 'Free miss used on ' + usedDate + ' this month.';
            status.className = 'text-[11px] font-mono text-amber-400';
        } else {
            status.textContent = '1 free miss available this month.';
            status.className = 'text-[11px] font-mono text-emerald-400';
        }
    }
}

function toggleStreakFreezeFromRules(checked) {
    if (window.SettingsApp && typeof window.SettingsApp.get === 'function') {
        const cfg = window.SettingsApp.get();
        if (cfg && cfg.freeze) {
            cfg.freeze.on = checked;
            if (typeof window.SettingsApp.save === 'function') window.SettingsApp.save();
        }
    }
    const sxToggle = document.getElementById('sx-fz');
    if (sxToggle) sxToggle.checked = checked;

    if (typeof refreshApp === 'function') refreshApp();
    else if (typeof window.renderHabits === 'function') window.renderHabits();

    updateRulesFreezeUI();

    if (window.playSfx) window.playSfx(checked ? 'click' : 'uncheck');
    if (typeof showToast === 'function') {
        showToast(checked ? '❄️ Streak Freeze enabled: 1 free miss allowed per month!' : 'Streak Freeze turned off.');
    }
}

        function renderRulesBlueprint() {
            updateRulesFreezeUI();
            const grid = document.getElementById('rules-pillar-grid');
            if (!grid) return;

            const categorized = {};
            Object.keys(CATEGORIES).forEach(c => categorized[c] = []);
            state.habits.forEach(h => {
                if (categorized[h.category]) categorized[h.category].push(h);
            });

            grid.innerHTML = Object.keys(CATEGORIES).map(cat => {
                const info = CATEGORIES[cat];
                const list = categorized[cat];

                return `
                    <div class="glass-card glass-card-hover rounded-2xl p-4 sm:p-5 border-t-4" style="border-top-color: ${info.color}">
                        <div class="flex items-center justify-between mb-3">
                            <h3 class="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                                <i class="${info.icon}" style="color:${info.color}"></i> ${cat} Pillar
                            </h3>
                            <span class="text-[10px] font-mono px-2 py-0.5 rounded" style="background:${info.color}20; color:${info.color}">${list.length} Rules</span>
                        </div>
                        <p class="text-xs text-slate-400 mb-3">${info.desc}</p>
                        <ul class="space-y-2">
                            ${list.length > 0 ? list.map(item => `
                                <li class="text-xs text-slate-200 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                                    <span>${item.name}</span>
                                    <span class="text-[10px] font-mono font-bold text-slate-400">${item.weight}x Priority</span>
                                </li>
                            `).join('') : `<li class="text-xs text-slate-500 italic">No custom rules added yet.</li>`}
                        </ul>
                    </div>
                `;
            }).join('');
        }

        function renderCalendar() {
            const monthYearTracker = document.getElementById('tracker-calendar-month-year');
            const gridTracker = document.getElementById('tracker-calendar-days-grid');

            if (!monthYearTracker || !gridTracker) return;

            const year = calendarCurrentDate.getFullYear();
            const month = calendarCurrentDate.getMonth();
            const monthName = calendarCurrentDate.toLocaleString('default', { month: 'long' });

            monthYearTracker.textContent = `${monthName} ${year}`;
            const headerTitle = document.getElementById('tracker-calendar-header-title');
            if (headerTitle) {
                headerTitle.textContent = `${monthName} ${year} Lock-In Calendar`;
            }

            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            let daysHtml = '';
            for (let i = 0; i < firstDay; i++) {
                daysHtml += `<div></div>`;
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isToday = dateKey === getTodayKey();
                const isSelected = (dateKey === selectedCalendarDateStr);

                let dayCompPct = 0;
                let totalW = 0, compW = 0;

                if (state.dailyHabits[dateKey]) {
                    state.habits.forEach(h => {
                        totalW += h.weight;
                        if (state.dailyHabits[dateKey][h.id]) compW += h.weight;
                    });
                    dayCompPct = totalW > 0 ? Math.round((compW / totalW) * 100) : 0;
                } else if (isToday) {
                    state.habits.forEach(h => {
                        totalW += h.weight;
                        if (h.completed) compW += h.weight;
                    });
                    dayCompPct = totalW > 0 ? Math.round((compW / totalW) * 100) : 0;
                }

                const gradeInfo = getGradeInfo(dayCompPct, state.dailyHabits[dateKey] || isToday);

                daysHtml += `
                    <button role="button" onclick="selectCalendarDate('${dateKey}', event)" data-date="${dateKey}" data-grade="${gradeInfo.grade}" class="calendar-day-card relative overflow-hidden transition-all duration-300 ease-out hover:scale-[1.04] active:scale-95 p-1.5 sm:p-2 rounded-xl border flex flex-col items-center justify-between ${gradeInfo.bgClasses} ${isToday ? 'pulse-today-ring' : ''} ${isSelected ? 'calendar-day-selected' : ''} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" title="Day ${day}: Rank ${gradeInfo.grade} (${dayCompPct}%)">
                        ${gradeInfo.glintHtml || ''}
                        <span class="text-[10px] font-bold z-10 select-none">${day}</span>
                        <span class="grade-letter text-[9px] font-mono font-black z-10 select-none ${gradeInfo.textClass}">${gradeInfo.grade}</span>
                    </button>
                `;
            }

            gridTracker.innerHTML = daysHtml;

            if (!selectedCalendarDateStr) selectedCalendarDateStr = getTodayKey();
            renderCalendarDayDetail(selectedCalendarDateStr);
        }

        function changeCalendarMonth(delta) {
            calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + delta);
            renderCalendar();
        }

        function stepCalendarDay(delta) {
            const calYear = calendarCurrentDate.getFullYear();
            const calMonth = calendarCurrentDate.getMonth();

            let targetDate;
            if (selectedCalendarDateStr) {
                const parts = selectedCalendarDateStr.split('-').map(Number);
                const selYear = parts[0];
                const selMonth = parts[1] - 1;
                const selDay = parts[2];

                // If currently selected date is in the viewed month, step by delta from it
                if (selYear === calYear && selMonth === calMonth) {
                    targetDate = new Date(selYear, selMonth, selDay + delta);
                } else {
                    // If looking at a different month than currently selected, start from that month's edge
                    if (delta > 0) {
                        targetDate = new Date(calYear, calMonth, 1);
                    } else {
                        targetDate = new Date(calYear, calMonth + 1, 0);
                    }
                }
            } else {
                const t = (typeof getEffectiveToday === 'function') ? getEffectiveToday() : new Date();
                targetDate = new Date(t.getFullYear(), t.getMonth(), t.getDate() + delta);
            }

            const nextDateKey = formatDateKey(targetDate);

            // If stepping changes the month, update calendarCurrentDate and re-render grid
            if (targetDate.getFullYear() !== calendarCurrentDate.getFullYear() || targetDate.getMonth() !== calendarCurrentDate.getMonth()) {
                calendarCurrentDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
                renderCalendar();
            }

            // Select the new calendar date
            selectCalendarDate(nextDateKey);

            // Move focus to the visible selected day button for keyboard accessibility
            const dayCards = document.querySelectorAll(`.calendar-day-card[data-date="${nextDateKey}"]`);
            for (const c of dayCards) {
                if (c.offsetParent !== null) {
                    try { c.focus({ preventScroll: true }); } catch (e) {}
                    break;
                }
            }
        }
        window.stepCalendarDay = stepCalendarDay;

        // Global arrow key navigation to switch days on the calendar
        window.addEventListener('keydown', function(e) {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            if (e.ctrlKey || e.metaKey || e.altKey) return;

            // Ignore when typing in inputs, textareas, selects, or editable elements
            const t = e.target;
            if (t) {
                if (t.isContentEditable) return;
                const tag = (t.tagName || '').toUpperCase();
                if (tag === 'TEXTAREA' || tag === 'SELECT') return;
                if (tag === 'INPUT') {
                    const inputType = (t.type || 'text').toLowerCase();
                    if (!['checkbox', 'radio', 'button', 'submit', 'reset'].includes(inputType)) {
                        return;
                    }
                }
            }

            // Ignore if any modal, overlay, drawer, or terminal is open
            if (document.querySelector('.pp-modal.open')) return;
            const overlays = [
                'pp12-drawer',
                'arc-pin-overlay',
                'summer-showcase-overlay',
                'arc-modal',
                'rpg-victory-cert-modal',
                'sa-vault',
                'matrix-rain-overlay',
                'cyberdeck-terminal-modal',
                'mandala-easter-egg-modal'
            ];
            for (const id of overlays) {
                const el = document.getElementById(id);
                if (el && (!el.classList.contains('hidden') || el.classList.contains('open'))) {
                    if (id === 'pp12-drawer' && !el.classList.contains('open')) continue;
                    return;
                }
            }

            // Only switch calendar day if user is on a tab where the calendar is relevant
            if (window.state && window.state.activeTab && window.state.activeTab !== 'tracker' && window.state.activeTab !== 'results') {
                return;
            }

            // Prevent default arrow navigation (horizontal scrolling) and step calendar day
            e.preventDefault();
            stepCalendarDay(e.key === 'ArrowLeft' ? -1 : 1);
        });

        function selectCalendarDate(dateKey, evt) {
            selectedCalendarDateStr = dateKey;

            // Calculate day completion and grade
            const isToday = (dateKey === getTodayKey());
            let totalW = 0, compW = 0;
            const habitData = state.dailyHabits[dateKey] || {};
            state.habits.forEach(h => {
                totalW += h.weight;
                if (isToday ? h.completed : habitData[h.id]) compW += h.weight;
            });
            const pct = totalW > 0 ? Math.round((compW / totalW) * 100) : 0;
            const hasHistory = !!state.dailyHabits[dateKey] || isToday;
            const gradeInfo = getGradeInfo(pct, hasHistory);
            const grade = gradeInfo.grade;

            // Play tiered Web Audio soundscape
            playGradeSfx(grade);

            // Locate clicked calendar day card to center particle burst
            let targetEl = null;
            if (evt && evt.currentTarget) {
                targetEl = evt.currentTarget;
            } else {
                const dayCards = document.querySelectorAll(`.calendar-day-card[data-date="${dateKey}"]`);
                for (const c of dayCards) {
                    if (c.offsetParent !== null) {
                        targetEl = c;
                        break;
                    }
                }
                if (!targetEl && dayCards.length > 0) targetEl = dayCards[0];
            }

            let cx = window.innerWidth / 2;
            let cy = window.innerHeight / 2;
            if (targetEl && targetEl.offsetParent !== null) {
                const rect = targetEl.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    cx = rect.left + rect.width / 2;
                    cy = rect.top + rect.height / 2;
                }
            }

            // Trigger card impact pulse / shockwave on all matching date cards
            const allDayCards = document.querySelectorAll(`.calendar-day-card[data-date="${dateKey}"]`);
            allDayCards.forEach(c => {
                c.classList.remove('calendar-shockwave-active');
                void c.offsetWidth;
                c.classList.add('calendar-shockwave-active');
            });

            // Tiered particle bursts & floating combat banners
            if (grade === 'S') {
                triggerGradeParticleBurst(cx, cy, 'S');
                if (window.spawnFloatingCombatText) {
                    spawnFloatingCombatText('✨ RANK S: GOD TIER DISCIPLINE! ✨', Math.max(16, cx - 110), Math.max(24, cy - 35), true);
                }
            } else if (grade === 'A') {
                triggerGradeParticleBurst(cx, cy, 'A');
                if (window.spawnFloatingCombatText) {
                    spawnFloatingCombatText('⭐ RANK A: EXCELLENT LOCK-IN! ⭐', Math.max(16, cx - 95), Math.max(24, cy - 30), false);
                }
            } else if (grade === 'B') {
                triggerGradeParticleBurst(cx, cy, 'B');
                if (window.spawnFloatingCombatText) {
                    spawnFloatingCombatText('◆ RANK B: SOLID PROGRESS! ◆', Math.max(16, cx - 80), Math.max(24, cy - 25), false);
                }
            }

            // Update detail panel
            renderCalendarDayDetail(dateKey);

            // Update selected ring on all calendar cards
            document.querySelectorAll('.calendar-day-card').forEach(c => {
                if (c.getAttribute('data-date') === dateKey) {
                    c.classList.add('calendar-day-selected');
                } else {
                    c.classList.remove('calendar-day-selected');
                }
            });
        }

        function renderCalendarDayDetail(dateKey) {
            const parts = dateKey.split('-');
            const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            const dateTitle = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

            const prefix = 'tracker-calendar';
            const titleEl = document.getElementById(`${prefix}-selected-date-title`);
            const pctEl = document.getElementById(`${prefix}-selected-pct`);
            const barEl = document.getElementById(`${prefix}-selected-bar`);
            const container = document.getElementById(`${prefix}-selected-habits-container`) || document.getElementById('calendar-selected-habits-container');

            if (titleEl) titleEl.textContent = dateTitle;

            const todayKey = getTodayKey();
            const yesterdayKey = getYesterdayKey();
            const isFuture = dateKey > todayKey;
            const isLockedHistory = dateKey < yesterdayKey;
            const isEditable = !isFuture && !isLockedHistory;

            let totalW = 0, compW = 0;
            const habitData = state.dailyHabits[dateKey] || {};

            state.habits.forEach(h => {
                totalW += h.weight;
                if (dateKey === todayKey ? h.completed : habitData[h.id]) compW += h.weight;
            });

            const pct = totalW > 0 ? Math.round((compW / totalW) * 100) : 0;
            const hasHistory = !!state.dailyHabits[dateKey] || dateKey === todayKey;
            const gradeInfo = getGradeInfo(pct, hasHistory);

            if (pctEl) {
                pctEl.innerHTML = `${pct}% <span class="ml-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-black ${gradeInfo.badgeClass}">RANK ${gradeInfo.grade}</span>`;
            }
            if (barEl) {
                barEl.style.width = `${pct}%`;
                barEl.className = `h-full transition-all duration-300 ${
                    gradeInfo.grade === 'S' ? 'animate-shimmer-s shadow-[0_0_12px_rgba(16,185,129,0.8)]' :
                    gradeInfo.grade === 'A' ? 'animate-shimmer shadow-[0_0_8px_rgba(6,182,212,0.6)]' :
                    gradeInfo.grade === 'B' ? 'bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.4)]' :
                    gradeInfo.grade === 'C' ? 'bg-amber-500' :
                    gradeInfo.grade === 'F' ? 'bg-rose-500' : 'bg-slate-700'
                }`;
            }

            if (container) {
                container.innerHTML = state.habits.map(h => {
                    const isDone = dateKey === todayKey ? h.completed : habitData[h.id];
                    let actionHtml = '';
                    let rowClick = '';

                    if (isLockedHistory) {
                        rowClick = `onclick="if(typeof showToast==='function')showToast('Locked History: Habit records older than yesterday cannot be modified.');"`;
                        actionHtml = `
                            <button type="button" role="checkbox" aria-checked="${!!isDone}" disabled aria-disabled="true" title="Locked History: Habit records older than yesterday cannot be modified" class="flex-1 text-left flex items-center justify-between gap-2 min-w-0 opacity-70 cursor-not-allowed focus:outline-none">
                                <span class="flex items-center gap-2 min-w-0">
                                    <i class="fa-solid ${isDone ? 'fa-square-check text-emerald-400' : 'fa-square text-slate-600'} text-sm"></i>
                                    <span class="truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-300'}">${h.name}</span>
                                </span>
                                <div class="flex items-center gap-1.5 shrink-0">
                                    <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1">
                                        <i class="fa-solid fa-lock text-[8px]"></i> Locked History
                                    </span>
                                    <span class="text-[10px] font-bold ${isDone ? 'text-emerald-400' : 'text-slate-500'}">${isDone ? 'Done' : 'Missed'}</span>
                                </div>
                            </button>
                        `;
                    } else if (isFuture) {
                        rowClick = `onclick="if(typeof showToast==='function')showToast('Future dates are locked.');"`;
                        actionHtml = `
                            <button type="button" role="checkbox" aria-checked="${!!isDone}" disabled aria-disabled="true" title="Future days are locked" class="flex-1 text-left flex items-center justify-between gap-2 min-w-0 opacity-50 cursor-not-allowed focus:outline-none">
                                <span class="flex items-center gap-2 min-w-0">
                                    <i class="fa-solid fa-square text-slate-700 text-sm"></i>
                                    <span class="truncate text-slate-400">${h.name}</span>
                                </span>
                                <div class="flex items-center gap-1.5 shrink-0">
                                    <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700 inline-flex items-center gap-1">
                                        <i class="fa-solid fa-lock text-[8px]"></i> Locked
                                    </span>
                                    <span class="text-[10px] font-bold text-slate-500">Upcoming</span>
                                </div>
                            </button>
                        `;
                    } else {
                        // Today or Yesterday: Editable Grace Window
                        actionHtml = `
                            <button type="button" role="checkbox" aria-checked="${!!isDone}" onclick="toggleHabitForDate('${dateKey}','${h.id}')" class="flex-1 text-left flex items-center justify-between gap-2 min-w-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400">
                                <span class="flex items-center gap-2 min-w-0">
                                    <i class="fa-solid ${isDone ? 'fa-square-check text-emerald-400' : 'fa-square text-slate-600'} text-sm"></i>
                                    <span class="truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-200'}">${h.name}</span>
                                </span>
                                <div class="flex items-center gap-1.5 shrink-0">
                                    ${dateKey === yesterdayKey ? '<span class="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">Grace Day</span>' : ''}
                                    <span class="text-[10px] font-bold ${isDone ? 'text-emerald-400' : 'text-slate-500'}">${isDone ? 'Done' : 'Pending'}</span>
                                </div>
                            </button>
                        `;
                    }

                    return `
                        <div ${rowClick} class="habit-row w-full flex items-center justify-between gap-1.5 p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs transition-all duration-300 ease-out hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(0,240,255,0.25)]">
                            ${actionHtml}
                            <button type="button" onclick="ArcHabitAnalytics.openDrawer('${h.id}'); event.stopPropagation();" title="Inspect Habit Heatmap & Graphs" class="w-7 h-7 rounded-lg bg-slate-800/90 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400/60 text-slate-300 hover:text-cyan-300 grid place-items-center transition active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400">
                                <i class="fa-solid fa-chart-line text-[10px]"></i>
                            </button>
                        </div>
                    `;
                }).join('') + `<button type="button" onclick="openHabitManager()" class="w-full mt-1 p-2 rounded-xl border border-dashed border-slate-700 text-[11px] font-semibold text-cyan-300 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(0,240,255,0.25)]"><i class="fa-solid fa-pen-to-square mr-1"></i>Edit habit list</button>`;
            }
        }

        function renderMatrix() {
            const grid = document.getElementById('matrix-days-grid');
            if (!grid) return;

            const today = getEffectiveToday();
            let html = '';

            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                const dateKey = formatDateKey(d);
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

                let totalW = 0, compW = 0;
                const habitData = state.dailyHabits[dateKey] || {};

                state.habits.forEach(h => {
                    totalW += h.weight;
                    if (dateKey === getTodayKey() ? h.completed : habitData[h.id]) compW += h.weight;
                });

                const pct = totalW > 0 ? Math.round((compW / totalW) * 100) : 0;
                const gradeInfo = getGradeInfo(pct, state.dailyHabits[dateKey] || dateKey === getTodayKey());

                html += `
                    <div class="relative overflow-hidden ${gradeInfo.bgClasses} rounded-2xl p-2 flex flex-col items-center justify-between space-y-1 transition-all duration-300 hover:scale-[1.03]">
                        ${gradeInfo.glintHtml || ''}
                        <span class="text-[10px] text-slate-300 font-bold uppercase z-10 select-none">${dayName}</span>
                        <span class="grade-letter text-xs font-mono font-black z-10 select-none ${gradeInfo.textClass}">${gradeInfo.grade}</span>
                        <span class="text-[9px] font-mono text-slate-300 z-10 select-none">${pct}%</span>
                    </div>
                `;
            }

            grid.innerHTML = html;
        }

        function renderSpiderWeb() {
            const svg = document.getElementById('pie-chart-svg');
            const centerScore = document.getElementById('pie-center-score');
            const centerGrade = document.getElementById('pie-center-grade');
            const legendList = document.getElementById('category-legend-list');

            if (!svg) return;

            let totalW = 0, compW = 0;
            const catStats = { Physical: { total: 0, comp: 0 }, Mindset: { total: 0, comp: 0 }, Productivity: { total: 0, comp: 0 }, Discipline: { total: 0, comp: 0 } };

            state.habits.forEach(h => {
                totalW += h.weight;
                if (h.completed) compW += h.weight;

                if (catStats[h.category]) {
                    catStats[h.category].total += h.weight;
                    if (h.completed) catStats[h.category].comp += h.weight;
                }
            });

            const overallPct = totalW > 0 ? Math.round((compW / totalW) * 100) : 0;
            const overallGrade = getGradeInfo(overallPct, true).grade;

            if (centerScore) centerScore.textContent = `${overallPct}%`;
            if (centerGrade) centerGrade.textContent = `GRADE ${overallGrade}`;

            // Draw SVG Radar Matrix / Spider Web
            const categories = Object.keys(CATEGORIES);
            const totalAxes = categories.length;
            const radius = 0.85;

            const isSummerArc = state.currentArc === 'summer';
            const isLightMode = document.documentElement.getAttribute('data-mode') === 'light';
            const isBw = (window.ArcBlackWhiteMode && window.ArcBlackWhiteMode.isEnabled()) || document.documentElement.classList.contains('arc-bw-mode');
            const primaryColor = isBw ? (isLightMode ? '#000000' : '#ffffff') : (isSummerArc ? (isLightMode ? '#d97706' : '#F59E0B') : (isLightMode ? '#0284c7' : '#00F0FF'));
            const secondaryColor = isBw ? (isLightMode ? '#000000' : '#ffffff') : (isSummerArc ? (isLightMode ? '#dc2626' : '#EF4444') : (isLightMode ? '#7c3aed' : '#8B5CF6'));

            let webPaths = `
            <defs>
                <filter id="spider-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="0.03" result="blur1" />
                    <feGaussianBlur in="SourceGraphic" stdDeviation="0.07" result="blur2" />
                    <feMerge>
                        <feMergeNode in="blur2" />
                        <feMergeNode in="blur1" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <filter id="spider-sparkle-filter" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="0.045" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <linearGradient id="spider-polygon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.45" />
                    <stop offset="60%" stop-color="${secondaryColor}" stop-opacity="0.28" />
                    <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0.12" />
                </linearGradient>
                <linearGradient id="spider-shimmer-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.25" />
                    <stop offset="48%" stop-color="#FFFFFF" stop-opacity="0.95" />
                    <stop offset="52%" stop-color="${primaryColor}" stop-opacity="0.9" />
                    <stop offset="100%" stop-color="${secondaryColor}" stop-opacity="0.25" />
                </linearGradient>
                <radialGradient id="spider-radar-beam-grad" cx="0%" cy="0%" r="100%">
                    <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.32" />
                    <stop offset="70%" stop-color="${primaryColor}" stop-opacity="0.08" />
                    <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0" />
                </radialGradient>
            </defs>
            `;

            // Background concentric grids with animated shining rings
            [0.25, 0.5, 0.75, 1.0].forEach((level, lIdx) => {
                let points = [];
                for (let i = 0; i < totalAxes; i++) {
                    const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
                    const x = Math.cos(angle) * (radius * level);
                    const y = Math.sin(angle) * (radius * level);
                    points.push(`${x},${y}`);
                }
                const isOuter = level === 1.0;
                const strokeColor = isOuter ? (isSummerArc ? 'rgba(245, 158, 11, 0.55)' : 'rgba(0, 240, 255, 0.55)') : 'rgba(255, 255, 255, 0.09)';
                const strokeWidth = isOuter ? 0.022 : 0.012;
                const extraClass = isOuter ? 'spider-web-outer-rim' : `spider-web-grid spider-web-grid-${lIdx}`;
                webPaths += `<polygon points="${points.join(' ')}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" class="${extraClass}" />`;
            });

            // Spokes with luminous glow & photon pulses
            for (let i = 0; i < totalAxes; i++) {
                const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                webPaths += `<line x1="0" y1="0" x2="${x}" y2="${y}" stroke="rgba(255,255,255,0.14)" stroke-width="0.015" class="spider-spoke" />`;
                webPaths += `<circle cx="0" cy="0" r="0.018" fill="${primaryColor}" class="spider-photon-pulse">
                    <animateMotion path="M 0 0 L ${x} ${y}" dur="3.4s" repeatCount="indefinite" begin="${i * 0.7}s" />
                </circle>`;
            }

            // Rotating tactical radar scanner beam
            webPaths += `
            <g class="spider-radar-beam-group">
                <line x1="0" y1="0" x2="0" y2="${-radius}" stroke="${primaryColor}" stroke-width="0.02" filter="url(#spider-sparkle-filter)" class="spider-radar-beam-line" />
                <path d="M 0 0 L 0 ${-radius} A ${radius} ${radius} 0 0 1 ${radius * 0.38} ${-radius * 0.92} Z" fill="url(#spider-radar-beam-grad)" class="spider-radar-beam-cone" />
            </g>
            `;

            // Data Polygon
            let dataPoints = [];
            categories.forEach((cat, idx) => {
                const stat = catStats[cat];
                const pct = stat.total > 0 ? stat.comp / stat.total : 0;
                const angle = (Math.PI * 2 / totalAxes) * idx - Math.PI / 2;
                const x = Math.cos(angle) * (radius * pct);
                const y = Math.sin(angle) * (radius * pct);
                dataPoints.push(`${x},${y}`);
            });

            if (dataPoints.length > 0) {
                // Base glowing polygon
                webPaths += `<polygon points="${dataPoints.join(' ')}" fill="url(#spider-polygon-grad)" stroke="${primaryColor}" stroke-width="0.032" filter="url(#spider-glow-filter)" class="spider-data-polygon" />`;
                // Shining perimeter stroke overlay
                webPaths += `<polygon points="${dataPoints.join(' ')}" fill="none" stroke="url(#spider-shimmer-stroke)" stroke-width="0.038" class="spider-polygon-shine" />`;
            }

            // Nodes (Vertices)
            categories.forEach((cat, idx) => {
                const stat = catStats[cat];
                const pct = stat.total > 0 ? stat.comp / stat.total : 0;
                const angle = (Math.PI * 2 / totalAxes) * idx - Math.PI / 2;
                const x = Math.cos(angle) * (radius * pct);
                const y = Math.sin(angle) * (radius * pct);
                const catColor = isBw ? (isLightMode ? '#000000' : '#ffffff') : (CATEGORIES[cat] ? CATEGORIES[cat].color : primaryColor);

                // Outer beacon pulsing ring
                webPaths += `<circle cx="${x}" cy="${y}" r="0.075" fill="none" stroke="${catColor}" stroke-width="0.012" class="spider-beacon-pulse spider-beacon-${cat.toLowerCase()}" style="animation-delay: ${idx * 0.55}s;" />`;

                // Core interactive vertex
                webPaths += `<circle role="button" tabindex="0" cx="${x}" cy="${y}" r="0.046" fill="${catColor}" filter="url(#spider-sparkle-filter)" class="spider-node spider-node-${cat.toLowerCase()} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" onclick="handleSpiderNodeClick('${cat}', ${Math.round(pct * 100)}, event)" onmouseenter="showCategoryDetail('${cat}', ${Math.round(pct * 100)})" />`;

                // Star glint spark at center of vertex
                webPaths += `<circle cx="${x}" cy="${y}" r="0.016" fill="#FFFFFF" class="spider-node-glint" />`;

                // Axis label tag at outer perimeter
                const labelRadius = radius + 0.17;
                const lx = Math.cos(angle) * labelRadius;
                const ly = Math.sin(angle) * labelRadius;
                const textAnchor = Math.abs(lx) < 0.05 ? "middle" : (lx > 0 ? "start" : "end");
                webPaths += `<text x="${lx}" y="${ly + 0.03}" text-anchor="${textAnchor}" fill="${catColor}" font-size="0.075" font-weight="700" font-family="'Inter', sans-serif" class="select-none opacity-90 hover:opacity-100 transition">${cat} <tspan fill="${isLightMode ? '#475569' : '#94A3B8'}" font-size="0.06" font-weight="500">${Math.round(pct * 100)}%</tspan></text>`;
            });

            svg.innerHTML = webPaths;

            // Update Lock-In Assessment Panel
            const assessStatus = document.getElementById('assessment-status');
            const assessBadge = document.getElementById('assessment-badge');
            const assessFeedback = document.getElementById('assessment-feedback');
            const isSummer = state.currentArc === 'summer';
            if (assessStatus && assessBadge && assessFeedback) {
                if (overallPct >= 85) {
                    assessStatus.textContent = isSummer ? 'Radiating Dominance' : 'Locked In & Focused';
                    assessBadge.textContent = isSummer ? '☀️' : '❄️';
                    assessFeedback.textContent = isSummer 
                        ? 'Peak execution achieved. Your discipline shines brightly under the summer sun.'
                        : 'Your completion rate reflects strong discipline. Maintain daily consistency to lock in maximum results before winter ends.';
                } else if (overallPct >= 50) {
                    assessStatus.textContent = isSummer ? 'Building Solar Power' : 'Building Momentum';
                    assessBadge.textContent = isSummer ? '⚡' : '🧊';
                    assessFeedback.textContent = isSummer
                        ? 'Good pace! Push harder to forge habits that withstand any test in the light.'
                        : 'Good progress, but stay vigilant. Consistency in the cold dark separates the good from the great.';
                } else {
                    assessStatus.textContent = isSummer ? 'Ignite the Fire' : 'Reignite Discipline';
                    assessBadge.textContent = isSummer ? '🔥' : '⏳';
                    assessFeedback.textContent = isSummer
                        ? 'Step up and bring your potential into the sunlight. Recommit to your core non-negotiables.'
                        : 'Time to lock in. Eliminate distractions and complete your daily pillars before the day ends.';
                }
            }

            // Render Category Legend List
            if (legendList) {
                legendList.innerHTML = categories.map(cat => {
                    const info = CATEGORIES[cat];
                    const stat = catStats[cat];
                    const pct = stat.total > 0 ? Math.round((stat.comp / stat.total) * 100) : 0;
                    return `
                        <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                            <div class="flex items-center gap-2">
                                <span class="w-3 h-3 rounded-full" style="background:${isBw ? (isLightMode ? '#000000' : '#ffffff') : info.color}"></span>
                                <span class="text-xs font-bold text-slate-200">${cat}</span>
                            </div>
                            <span class="text-xs font-mono font-bold text-white">${pct}%</span>
                        </div>
                    `;
                }).join('');
            }
        }

        function showCategoryDetail(cat, pct) {
            const details = document.getElementById('pie-hover-details');
            if (details) {
                const info = CATEGORIES[cat] || {};
                details.innerHTML = `<span class="font-bold" style="color:${info.color || '#00F0FF'}">${cat} Pillar:</span> ${pct}% execution score • ${info.desc || ''}`;
            }
            showToast(`${cat}: ${pct}% execution`);
        };

        function toggleLaptopTracker() {
            playSfx('click');
            state.laptop.isRunning = !state.laptop.isRunning;
            const btn = document.getElementById('btn-toggle-laptop');
            const badge = document.getElementById('laptop-status-badge');

            if (state.laptop.isRunning) {
                if (btn) btn.innerHTML = `<i class="fa-solid fa-pause mr-1"></i> Pause Tracker`;
                if (badge) {
                    badge.textContent = "AUTO-TRACKING";
                    badge.className = "text-[9px] sm:text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono animate-pulse";
                }
                showToast("Laptop tracker active.");
            } else {
                if (btn) btn.innerHTML = `<i class="fa-solid fa-play mr-1"></i> Resume Tracker`;
                if (badge) {
                    badge.textContent = "PAUSED";
                    badge.className = "text-[9px] sm:text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono";
                }
                showToast("Laptop tracker paused.");
            }
            renderScreenTime();
        }

        function startLaptopTracker() {
            if (state.laptop.interval) clearInterval(state.laptop.interval);
            state.laptop.interval = setInterval(() => {
                if (document.visibilityState === 'visible' && !state.laptop.isAutoPaused && state.laptop.isRunning !== false) {
                    state.laptop.totalSeconds = (state.laptop.totalSeconds || 0) + 1;
                    const secs = state.laptop.totalSeconds;
                    const formatted = formatDuration(secs);

                    // 1. Tracker view display
                    const display = document.getElementById('laptop-timer-display');
                    if (display) display.textContent = formatted;

                    // 2. Bottom HUD total timer & PC time
                    const hudTimer = document.getElementById('arc-hud-timer');
                    if (hudTimer) hudTimer.textContent = formatted;
                    const pcEl = document.getElementById('arc-hud-pc-time');
                    if (pcEl) {
                        const h = Math.floor(secs / 3600);
                        const m = Math.floor((secs % 3600) / 60);
                        pcEl.textContent = String(h).padStart(2, '0') + 'h ' + String(m).padStart(2, '0') + 'm';
                    }

                    // 3. Screen Time view desktop card
                    const deskEl = document.getElementById('st-desktop-time-val');
                    if (deskEl) deskEl.textContent = formatted;

                    // 4. Combined time (Desktop + Mobile phone)
                    const combEl = document.getElementById('st-combined-time-val');
                    if (combEl) {
                        let phoneSecs = 0;
                        try {
                            if (window.ArcScreenTimeStore && typeof window.ArcScreenTimeStore.getTodayTotalSecs === 'function') {
                                phoneSecs = window.ArcScreenTimeStore.getTodayTotalSecs() || 0;
                            }
                        } catch(e) {}
                        combEl.textContent = formatDuration(secs + phoneSecs);
                    }

                    // 5. Screen time notifier tick
                    if (window.ArcScreenTimeNotifier && typeof window.ArcScreenTimeNotifier.tick === 'function') {
                        window.ArcScreenTimeNotifier.tick(secs);
                    }

                    // 6. Persist to localStorage
                    if (typeof saveToLocalStorage === 'function') {
                        saveToLocalStorage();
                    } else {
                        try {
                            localStorage.setItem('arc_winter_arc_tracker_v3_state', JSON.stringify(state));
                        } catch(e) {}
                    }
                }
            }, 1000);
        }
        function startLaptopTimer() {
            startLaptopTracker();
        }
        window.startLaptopTracker = startLaptopTracker;
        window.startLaptopTimer = startLaptopTimer;

        /* ==========================================================================
           6. INITIALIZATION ENTRY POINT
           ========================================================================== */
        
        /* ==========================================================================
           7. AUTOMATED APP SCREEN TIME, FOCUS BLOCKLIST, YOUTUBE & CHROME WEBSITE FILTER
           Self-contained, 100% offline, zero-CORS browser compatible
           ========================================================================== */
        const DEFAULT_TRACKED_APPS = [
            { id: 'youtube', name: 'YouTube', category: 'Entertainment', icon: 'fa-brands fa-youtube', colorClass: 'text-red-500', bgClass: 'bg-red-500/10', borderClass: 'border-red-500/30', dailyLimitSecs: 45 * 60, blockEnabled: true, blockInFocus: true },
            { id: 'instagram', name: 'Instagram', category: 'Social Media', icon: 'fa-brands fa-instagram', colorClass: 'text-pink-500', bgClass: 'bg-pink-500/10', borderClass: 'border-pink-500/30', dailyLimitSecs: 30 * 60, blockEnabled: true, blockInFocus: true },
            { id: 'twitter', name: 'X / Twitter', category: 'Social Media', icon: 'fa-brands fa-x-twitter', colorClass: 'text-slate-200', bgClass: 'bg-slate-700/20', borderClass: 'border-slate-500/30', dailyLimitSecs: 30 * 60, blockEnabled: true, blockInFocus: true },
            { id: 'reddit', name: 'Reddit', category: 'Social Media', icon: 'fa-brands fa-reddit-alien', colorClass: 'text-orange-500', bgClass: 'bg-orange-500/10', borderClass: 'border-orange-500/30', dailyLimitSecs: 30 * 60, blockEnabled: true, blockInFocus: true },
            { id: 'tiktok', name: 'TikTok', category: 'Social Media', icon: 'fa-brands fa-tiktok', colorClass: 'text-cyan-400', bgClass: 'bg-cyan-500/10', borderClass: 'border-cyan-500/30', dailyLimitSecs: 20 * 60, blockEnabled: true, blockInFocus: true },
            { id: 'netflix', name: 'Netflix', category: 'Entertainment', icon: 'fa-solid fa-film', colorClass: 'text-red-600', bgClass: 'bg-red-600/10', borderClass: 'border-red-600/30', dailyLimitSecs: 60 * 60, blockEnabled: true, blockInFocus: true },
            { id: 'discord', name: 'Discord', category: 'Messaging', icon: 'fa-brands fa-discord', colorClass: 'text-indigo-400', bgClass: 'bg-indigo-500/10', borderClass: 'border-indigo-500/30', dailyLimitSecs: 60 * 60, blockEnabled: true, blockInFocus: true },
            { id: 'gaming', name: 'Steam / Gaming', category: 'Gaming', icon: 'fa-solid fa-gamepad', colorClass: 'text-purple-400', bgClass: 'bg-purple-500/10', borderClass: 'border-purple-500/30', dailyLimitSecs: 45 * 60, blockEnabled: true, blockInFocus: true },
            { id: 'chrome', name: 'Browser / Surfing', category: 'Browsing', icon: 'fa-brands fa-chrome', colorClass: 'text-cyan-400', bgClass: 'bg-cyan-500/10', borderClass: 'border-cyan-500/30', dailyLimitSecs: 90 * 60, blockEnabled: false, blockInFocus: false },
            { id: 'vscode', name: 'VS Code / Coding', category: 'Productivity', icon: 'fa-solid fa-code', colorClass: 'text-blue-400', bgClass: 'bg-blue-500/10', borderClass: 'border-blue-500/30', dailyLimitSecs: 240 * 60, blockEnabled: false, blockInFocus: false }
        ];

        const DEFAULT_BLOCKED_YOUTUBE_CHANNELS = [
            // Global High-Distraction Channels
            { handle: '@MrBeast', name: 'MrBeast', country: 'Global', reason: 'High sensory distraction & challenges' },
            { handle: '@Sidemen', name: 'Sidemen', country: 'Global', reason: 'Entertainment & challenges' },
            { handle: '@IShowSpeed', name: 'IShowSpeed', country: 'Global', reason: 'Streaming & high noise' },
            { handle: '@PewDiePie', name: 'PewDiePie', country: 'Global', reason: 'Gaming & entertainment' },
            { handle: '@LoganPaul', name: 'Logan Paul', country: 'Global', reason: 'Entertainment & vlogs' },
            { handle: '@TSeries', name: 'T-Series', country: 'India', reason: 'Music videos & trailers distraction' },
            { handle: '@DudePerfect', name: 'Dude Perfect', country: 'Global', reason: 'Trick shots & entertainment' },
            { handle: 'Shorts', name: 'YouTube Shorts Feed', country: 'Global', reason: 'Infinite scrolling short-form loop' },

            // India High-Distraction Entertainment, Roasts, Vlogs & Gaming
            { handle: '@CarryMinati', name: 'CarryMinati (Ajey Nagar)', country: 'India', reason: 'Roasts, gaming & comedy distraction' },
            { handle: '@TotalGaming', name: 'Total Gaming (Ajjubhai)', country: 'India', reason: 'High-volume Free Fire & gaming streams' },
            { handle: '@TechnoGamerzOfficial', name: 'Techno Gamerz (Ujjwal)', country: 'India', reason: 'GTA & marathon gaming streams' },
            { handle: '@ashishchanchlanivines', name: 'Ashish Chanchlani', country: 'India', reason: 'Comedy skits & entertainment' },
            { handle: '@BBKiVines', name: 'BB Ki Vines (Bhuvan Bam)', country: 'India', reason: 'Comedy skits & web entertainment' },
            { handle: '@Round2hell', name: 'Round2hell', country: 'India', reason: 'High-energy comedy skits' },
            { handle: '@triggeredinsaan', name: 'Triggered Insaan (Nischay)', country: 'India', reason: 'Reaction videos, roasts & memes' },
            { handle: '@souravjoshivlogs7028', name: 'Sourav Joshi Vlogs', country: 'India', reason: 'Daily high-frequency vlog binges' },
            { handle: '@Mythpat', name: 'Mythpat (Mithilesh)', country: 'India', reason: 'Gaming & comedy entertainment' },
            { handle: '@HarshBeniwal', name: 'Harsh Beniwal', country: 'India', reason: 'Comedy sketches & drama' },
            { handle: '@ElvishYadavVlogs', name: 'Elvish Yadav', country: 'India', reason: 'Vlogs, lifestyle & drama' },
            { handle: '@TanmayBhatYT', name: 'Tanmay Bhat', country: 'India', reason: 'Meme reviews & reaction streams' }
        ];

        const DEFAULT_ALLOWED_YOUTUBE_CHANNELS = [
            // India Premier Educational & Technical Channels
            { handle: '@chaiaurcode', name: 'Chai aur Code (Hitesh Choudhary)', country: 'India', category: 'Software Engineering & JavaScript' },
            { handle: '@CodeWithHarry', name: 'CodeWithHarry (Haris Khan)', country: 'India', category: 'Python, C++, Web Development' },
            { handle: '@ApnaCollegeOfficial', name: 'Apna College (Shradha Khapra)', country: 'India', category: 'DSA, Java, Web Development' },
            { handle: '@PhysicsWallah', name: 'Physics Wallah (Alakh Pandey)', country: 'India', category: 'Physics, Science & Academics' },
            { handle: '@KhanGSRecentre', name: 'Khan GS Research Centre (Khan Sir)', country: 'India', category: 'General Science, Geopolitics & UPSC' },
            { handle: '@ThinkSchool', name: 'Think School (Parth Verma)', country: 'India', category: 'Business Case Studies & Strategy' },
            { handle: '@mohak_mangal', name: 'Soch by Mohak Mangal', country: 'India', category: 'Indian Policy, Economics & Analysis' },
            { handle: '@NitishRajput', name: 'Nitish Rajput', country: 'India', category: 'Investigative Research & Current Affairs' },
            { handle: '@GateSmashers', name: 'Gate Smashers (Varun Singla)', country: 'India', category: 'Computer Science Core, OS & GATE' },
            { handle: '@lovebabbar', name: 'Love Babbar (CodeHelp)', country: 'India', category: 'DSA in C++, System Design & Placement' },
            { handle: '@takeUforward', name: 'take U forward (Striver)', country: 'India', category: 'SDE Sheet, Algorithms & LeetCode' },
            { handle: '@NPTELIITM', name: 'NPTEL India (IIT Lectures)', country: 'India', category: 'Premier Indian University Lectures' },
            { handle: '@GeekyShows', name: 'Geeky Shows', country: 'India', category: 'Core Programming & Web Frameworks' },

            // Global Premier Educational Channels
            { handle: '@freecodecamp', name: 'freeCodeCamp.org', country: 'Global', category: 'Full-Stack Software Engineering' },
            { handle: '@hubermanlab', name: 'Andrew Huberman', country: 'Global', category: 'Neuroscience & Deep Focus' },
            { handle: '@lexfridman', name: 'Lex Fridman', country: 'Global', category: 'Deep Conversations, AI & Robotics' },
            { handle: '@3blue1brown', name: '3Blue1Brown (Grant Sanderson)', country: 'Global', category: 'Mathematics & Neural Networks' },
            { handle: '@fireship', name: 'Fireship (Jeff Delaney)', country: 'Global', category: 'High-Velocity Tech & Code in 100s' },
            { handle: '@veritasium', name: 'Veritasium (Derek Muller)', country: 'Global', category: 'Physics & Scientific Reasoning' },
            { handle: '@mitocw', name: 'MIT OpenCourseWare', country: 'Global', category: 'Undergraduate & Graduate Lectures' }
        ];

        const DEFAULT_BLOCKED_WEBSITES = [
            { domain: 'youtube.com', name: 'YouTube', category: 'Video / Streaming', reason: 'Infinite autoplay & video rabbit holes' },
            { domain: 'instagram.com', name: 'Instagram', category: 'Social Media', reason: 'Reels doomscrolling & endless stories' },
            { domain: 'reddit.com', name: 'Reddit', category: 'Social Media', reason: 'Meme rabbit holes & infinite comment threads' },
            { domain: 'x.com', name: 'X / Twitter', category: 'Social Media', reason: 'Timeline arguments & continuous refreshing' },
            { domain: 'twitter.com', name: 'Twitter', category: 'Social Media', reason: 'Social feed distraction' },
            { domain: 'facebook.com', name: 'Facebook', category: 'Social Media', reason: 'Social feed & marketplace distraction' },
            { domain: 'netflix.com', name: 'Netflix', category: 'Streaming', reason: 'Binge-watching shows & movies during work' },
            { domain: 'hotstar.com', name: 'JioCinema / Disney+ Hotstar', category: 'Streaming & Cricket', reason: 'Cricket livestreams & movies' },
            { domain: 'primevideo.com', name: 'Amazon Prime Video', category: 'Streaming', reason: 'Entertainment movies & drama series' },
            { domain: 'twitch.tv', name: 'Twitch', category: 'Live Streaming', reason: 'Gaming livestreams & chat distraction' },
            { domain: 'cricbuzz.com', name: 'Cricbuzz', category: 'Live Scores', reason: 'Compulsive cricket score-checking' },
            { domain: 'quora.com', name: 'Quora', category: 'Forums', reason: 'Unfocused reading rabbit holes' },
            { domain: 'tiktok.com', name: 'TikTok', category: 'Short Video', reason: 'Short-form dopamine loop' }
        ];

        const DEFAULT_ALLOWED_WEBSITES = [
            { domain: 'github.com', name: 'GitHub', category: 'Developer Repositories' },
            { domain: 'stackoverflow.com', name: 'Stack Overflow', category: 'Programming Q&A' },
            { domain: 'google.com', name: 'Google Search', category: 'Academic & Technical Research' },
            { domain: 'notion.so', name: 'Notion', category: 'Workspace & Notes' },
            { domain: 'leetcode.com', name: 'LeetCode', category: 'Algorithm Practice' },
            { domain: 'geeksforgeeks.org', name: 'GeeksforGeeks', category: 'Computer Science Documentation' },
            { domain: 'wikipedia.org', name: 'Wikipedia', category: 'Factual Reference' },
            { domain: 'developer.mozilla.org', name: 'MDN Web Docs', category: 'Web Documentation' },
            { domain: 'chatgpt.com', name: 'ChatGPT', category: 'AI Coding Assistant' }
        ];

        function initApp() {
            window.ArcHardwareGatekeeper.init();
            verifyDataSchema();

            let savedState = getLocalStorageItem('arc_tracker_state');
            if (savedState && (typeof savedState !== 'object' || Array.isArray(savedState) || (savedState.habits !== undefined && !Array.isArray(savedState.habits)))) {
                try { localStorage.setItem('arc_tracker_state__corrupt_backup', JSON.stringify(savedState)); } catch (e) {}
                savedState = null; // unusable shape: start from defaults instead of crashing later
            }
            if (savedState) {
                state = { ...state, ...savedState };
            }
            state.dailyFocus = state.dailyFocus || {};
            // If legacy mock 14400 was present from template seed without real sessions, reset to 0
            if (state.timer && state.timer.totalFocusSeconds === 14400 && (!state.screenTimeLogs || state.screenTimeLogs.length <= 1)) {
                state.timer.totalFocusSeconds = 0;
            }
            if (state.settings) {
                if (state.settings.particleDensity === 'off') state.settings.particleDensity = 'medium';
                if (state.settings.audioReactiveParticles === false) state.settings.audioReactiveParticles = true;
                if (state.settings.snowflakeParticles === false) state.settings.snowflakeParticles = true;
            }
            window.state = state;

            let savedScreenTime = getLocalStorageItem('synced_screenTimeData');
            if (Array.isArray(savedScreenTime) && savedScreenTime.length > 0) {
                screenTimeData = savedScreenTime;
            }

            if (!Array.isArray(state.habits) || state.habits.length === 0) {
                state.habits = JSON.parse(JSON.stringify(DEFAULT_HABITS));
            }
            /* Migration: retire Hydration / Sunlight habits; tolerate absent legacy fields */
            {
                const retired = /sunlight|hydrat|^(drink\s+)?(\d+\s*l\s+)?water(\s+intake)?$/i;
                state.habits = state.habits.filter(h => h && !retired.test(String(h.name || '').trim()));
                state.habits.forEach(h => { h.name = String(h.name || '').replace(/\s*&\s*3L Water|3L Water\s*&\s*/i, '').trim() || 'Clean Eating'; });
                if (!state.habits.length) state.habits = JSON.parse(JSON.stringify(DEFAULT_HABITS));
            }

            const savedReflection = lsGetRaw('whatHappenedText');
            const reflectionTextarea = document.getElementById('whatHappened');
            if (reflectionTextarea && savedReflection) {
                reflectionTextarea.value = savedReflection;
                const displayEl = document.getElementById('displayWhatHappened');
                if (displayEl) displayEl.textContent = savedReflection;
            }

            applyArcTheme();
            updateDailyQuote();
            syncDayState();
            { const t = getEffectiveToday(); calendarCurrentDate = new Date(t.getFullYear(), t.getMonth(), 1); selectedCalendarDateStr = getTodayKey(); }
            renderHabits();
            renderRulesBlueprint();
            renderScreenTime();
            startLaptopTimer();
            if (typeof initFxCanvas === 'function') initFxCanvas(); else if (window.initFxCanvas) window.initFxCanvas();
            if (typeof initAppTracker === 'function') initAppTracker(); else if (window.initAppTracker) window.initAppTracker();
            if (window.ArcNotifications) window.ArcNotifications.renderUi();
            if (window.ArcLeaderboardGroups) window.ArcLeaderboardGroups.init();
            if (window.ArcFaq) window.ArcFaq.init();
        }

        if (typeof window !== 'undefined') {
          window.initApp = initApp;
          window.state = state;
          window.CATEGORIES = CATEGORIES;
          window.WINTER_ARC_QUOTES = WINTER_ARC_QUOTES;
          window.SUMMER_ARC_QUOTES = SUMMER_ARC_QUOTES;
          window.DEFAULT_HABITS = DEFAULT_HABITS;
          window.screenTimeData = screenTimeData;
          window.switchTab = switchTab;
          window.renderHabits = renderHabits;
          window.toggleHabit = toggleHabit;
          window.toggleHabitForDate = toggleHabitForDate;
          window.addCustomHabit = addCustomHabit;
          window.deleteHabit = deleteHabit;
          window.resetTodayHabits = resetTodayHabits;
          window.renderRulesBlueprint = renderRulesBlueprint;
          window.updateRulesFreezeUI = updateRulesFreezeUI;
          window.toggleStreakFreezeFromRules = toggleStreakFreezeFromRules;
          window.renderCalendar = renderCalendar;
          window.changeCalendarMonth = changeCalendarMonth;
          window.stepCalendarDay = stepCalendarDay;
          window.selectCalendarDate = selectCalendarDate;
          window.renderCalendarDayDetail = renderCalendarDayDetail;
          window.renderMatrix = renderMatrix;
          window.renderSpiderWeb = renderSpiderWeb;
          window.showCategoryDetail = showCategoryDetail;
          window.toggleLaptopTracker = toggleLaptopTracker;
          window.startLaptopTimer = startLaptopTimer;
          window.saveWhatHappenedText = saveWhatHappenedText;
          window.formatDuration = formatDuration;
          window.getGradeInfo = getGradeInfo;
          window.showToast = showToast;
          window.getTopProductiveDay = getTopProductiveDay;
          window.updateDailyQuote = updateDailyQuote;
          window.refreshDailyQuote = refreshDailyQuote;
          window.openArcModal = openArcModal;
          window.closeArcModal = closeArcModal;
          window.confirmAndLaunchSummerShowcase = confirmAndLaunchSummerShowcase;
          window.nextShowcaseSlide = nextShowcaseSlide;
          window.prevShowcaseSlide = prevShowcaseSlide;
          window.toggleShowcaseAutoplay = toggleShowcaseAutoplay;
          window.closeSummerShowcase = closeSummerShowcase;
          window.applyArcTheme = applyArcTheme;
          window.filterSettingsView = filterSettingsView;
          window.toggleFounderPanel = toggleFounderPanel;
          window.saveToLocalStorage = saveToLocalStorage;
          window.getLocalStorageItem = getLocalStorageItem;
          window.setLocalStorageItem = setLocalStorageItem;
          window.lsGetRaw = lsGetRaw;
          window.getTodayKey = getTodayKey;
          window.getYesterdayKey = getYesterdayKey;
          window.getEffectiveToday = getEffectiveToday;
          window.renderScreenTime = renderScreenTime;
        }

        document.addEventListener('DOMContentLoaded', initApp);
