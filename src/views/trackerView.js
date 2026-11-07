export function renderTrackerView() {
  const now = new Date();
  const currentMonthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const currentSelectedDay = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return `<!-- WINTER ARC FINISHED BANNER -->
        <div id="arc-completion-banner" class="hidden glass-card rounded-2xl p-4 sm:p-6 border-2 border-cyan-400 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 space-y-4 mb-4 sm:mb-6 shadow-2xl relative overflow-hidden transition-all duration-300">
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span id="banner-badge" class="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400 text-[10px] sm:text-xs font-black uppercase tracking-widest animate-pulse">
                            🏆 WINTER ARC COMPLETED
                        </span>
                        <span id="banner-day-count" class="text-[10px] text-slate-400 font-mono">92 / 92 Days Finished</span>
                    </div>
                    <h2 class="text-lg sm:text-2xl font-black text-white">Arc Final Time & Performance Summary</h2>
                    <p class="text-xs text-slate-300">Congratulations on pushing through the arc. Here is your grand total time invested:</p>
                </div>

                <div class="flex items-center gap-3">
                    <button role="button" onclick="switchTab('results')" class="px-4 py-2 rounded-xl bg-cyan-500 active:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/30 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                        View Full Breakdown
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div class="bg-slate-950/80 p-3.5 rounded-xl border border-cyan-500/30">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Grand Total Time Invested</span>
                    <div id="arc-end-total-time" class="text-xl sm:text-2xl font-black text-cyan-400 font-mono mt-0.5">0h 0m</div>
                    <span class="text-[9px] text-slate-400 mt-0.5 block">Combined Focus + Screen Time</span>
                </div>
                <div class="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Focus Time Logged</span>
                    <div id="arc-end-focus-time" class="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">0h 0m</div>
                    <span class="text-[9px] text-cyan-400 mt-0.5 block">Pomodoro Focus Hours</span>
                </div>
                <div class="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Laptop Screen Time</span>
                    <div id="arc-end-laptop-time" class="text-lg sm:text-xl font-bold text-white font-mono mt-0.5">0h 0m</div>
                    <span class="text-[9px] text-blue-400 mt-0.5 block">Active Laptop Work</span>
                </div>
            </div>
        </div>

        <!-- VIEW 1: DAILY TRACKER VIEW -->
        <section id="view-tracker" class="space-y-4 sm:space-y-6 tab-view-enter pb-24 md:pb-8">
            <!-- DAILY MINDSET QUOTE -->
            <div id="quote-card-container" class="glass-card glass-card-hover rounded-2xl p-4 sm:p-5 border-l-4 border-l-cyan-400 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all duration-300">
                <div class="space-y-1 max-w-3xl">
                    <div class="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-cyan-400 tracking-wider uppercase" id="quote-header-title">
                        <i class="fa-solid fa-quote-left text-xs"></i>
                        <span>Daily Lock-In Mindset</span>
                        <span id="quote-day-tag" class="px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[9px] font-mono border border-cyan-500/20">Daily Mindset</span>
                    </div>
                    <blockquote id="daily-quote-text" class="text-xs sm:text-base font-semibold text-slate-100 italic leading-snug transition-all duration-300">
                        "Quiet discipline in the cold dark yields results that speak loudly in the light."
                    </blockquote>
                    <p id="daily-quote-author" class="text-[11px] sm:text-xs text-slate-400 font-medium">— Marcus Aurelius</p>
                </div>
                <button role="button" onclick="refreshDailyQuote()" onmouseenter="playSfx('hover')" title="Cycle Quote" class="self-end sm:self-center px-2.5 py-1.5 rounded-xl bg-slate-900 active:bg-slate-800 text-slate-300 active:text-cyan-400 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm hover:border-cyan-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                    <i class="fa-solid fa-arrows-rotate text-xs"></i>
                    <span>Next</span>
                </button>
            </div>

            <!-- STATS OVERVIEW CARDS -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div class="glass-card glass-card-hover rounded-2xl p-3.5 sm:p-5 border-l-4 border-l-cyan-400 transition-transform duration-200">
                    <div class="flex justify-between items-center text-slate-400 mb-1 text-[10px] sm:text-xs uppercase tracking-wider font-semibold">
                        <span>Current Day</span>
                        <i class="fa-solid fa-calendar-day text-cyan-400"></i>
                    </div>
                    <div class="text-lg sm:text-2xl font-black text-white" id="stat-current-day">Day – / 92</div>
                    <div class="text-[10px] sm:text-xs text-cyan-400 font-mono mt-0.5 sm:mt-1 font-semibold truncate" id="stat-arc-timeline-label">Today</div>
                    <div class="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden" aria-hidden="true"><div id="stat-arc-progress-bar" class="h-full w-0 bg-cyan-400 transition-all duration-500"></div></div>
                </div>

                <div class="glass-card glass-card-hover rounded-2xl p-3.5 sm:p-5 border-l-4 border-l-emerald-400 transition-transform duration-200">
                    <div class="flex justify-between items-center text-slate-400 mb-1 text-[10px] sm:text-xs uppercase tracking-wider font-semibold">
                        <span>Today Execution</span>
                        <i class="fa-solid fa-bolt text-emerald-400"></i>
                    </div>
                    <div class="text-lg sm:text-2xl font-black text-white" id="stat-today-completion">0%</div>
                    <div class="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 sm:mt-2 overflow-hidden">
                        <div id="stat-today-progress-bar" class="animate-shimmer h-full w-0 transition-all duration-500"></div>
                    </div>
                </div>

                <div id="card-stat-streak" role="button" tabindex="0" onclick="handleStreakCardClick(event)" title="Lock-In Streak · Click to Surge Momentum" class="glass-card glass-card-hover rounded-2xl p-3.5 sm:p-5 border-l-4 border-l-purple-400 transition-transform duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400">
                    <div class="flex justify-between items-center text-slate-400 mb-1 text-[10px] sm:text-xs uppercase tracking-wider font-semibold">
                        <span>Lock-In Streak</span>
                        <i id="streak-fire-icon" class="fa-solid fa-fire text-purple-400 animate-pulse transition-transform duration-300"></i>
                    </div>
                    <div class="text-lg sm:text-2xl font-black text-white" id="stat-streak">3 Days</div>
                    <div class="text-[10px] sm:text-xs text-purple-300/80 mt-0.5 truncate">Momentum unbroken</div>
                </div>

                <div class="glass-card glass-card-hover rounded-2xl p-3.5 sm:p-5 border-l-4 border-l-amber-400 transition-transform duration-200">
                    <div class="flex justify-between items-center text-slate-400 mb-1 text-[10px] sm:text-xs uppercase tracking-wider font-semibold">
                        <span>Overall Arc Index</span>
                        <i class="fa-solid fa-trophy text-amber-400"></i>
                    </div>
                    <div class="text-lg sm:text-2xl font-black text-white" id="stat-overall-score">0.0%</div>
                    <div class="text-[10px] sm:text-xs text-amber-300/80 mt-0.5 truncate">Weighted Average</div>
                </div>
            </div>

            <!-- PROMINENT OCTOBER 2026 CALENDAR DIRECTLY ON DAILY TRACKER TAB -->
            <div class="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3 sm:space-y-4 border-2 border-cyan-400/60 glow-cyan transition-all duration-300">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h3 class="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                            <i class="fa-solid fa-calendar-days text-cyan-400 text-base sm:text-lg"></i> <span id="tracker-calendar-header-title">${currentMonthYear} Lock-In Calendar</span>
                        </h3>
                        <p class="text-[11px] sm:text-xs text-slate-300">Tap any day or press <kbd class="px-1.5 py-0.5 text-[9px] font-mono bg-slate-800 border border-slate-700 rounded text-cyan-400 font-bold">◀</kbd> <kbd class="px-1.5 py-0.5 text-[9px] font-mono bg-slate-800 border border-slate-700 rounded text-cyan-400 font-bold">▶</kbd> to switch days</p>
                    </div>
                    <div class="flex items-center justify-between sm:justify-start gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800 self-start sm:self-auto w-full sm:w-auto">
                        <button role="button" onclick="changeCalendarMonth(-1); playSfx('slideNext')" class="px-2.5 py-1 rounded-lg bg-slate-800 active:bg-slate-700 text-xs text-slate-300 transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" aria-label="Previous Month"><i class="fa-solid fa-chevron-left"></i></button>
                        <span id="tracker-calendar-month-year" class="text-xs font-mono font-bold text-cyan-400 flex-1 text-center min-w-[100px]">${currentMonthYear}</span>
                        <button role="button" onclick="changeCalendarMonth(1); playSfx('slideNext')" class="px-2.5 py-1 rounded-lg bg-slate-800 active:bg-slate-700 text-xs text-slate-300 transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" aria-label="Next Month"><i class="fa-solid fa-chevron-right"></i></button>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start pt-1">
                    <div class="md:col-span-7 lg:col-span-8 space-y-2">
                        <div class="grid grid-cols-7 gap-1 text-center font-bold text-[10px] sm:text-[11px] text-slate-400 pb-1 uppercase tracking-wider">
                            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                        </div>
                        <div id="tracker-calendar-days-grid" class="grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-xs"></div>
                    </div>

                    <div class="md:col-span-5 lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 space-y-2.5">
                        <div class="flex items-center justify-between">
                            <span class="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Selected Day Details</span>
                            <div class="flex items-center gap-1">
                                <button type="button" onclick="stepCalendarDay(-1); playSfx('slideNext')" title="Previous Day (Left Arrow)" aria-label="Previous Day" class="px-1.5 py-0.5 rounded bg-slate-800 active:bg-slate-700 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 text-[10px] transition border border-slate-700/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"><i class="fa-solid fa-chevron-left"></i></button>
                                <button type="button" onclick="stepCalendarDay(1); playSfx('slideNext')" title="Next Day (Right Arrow)" aria-label="Next Day" class="px-1.5 py-0.5 rounded bg-slate-800 active:bg-slate-700 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 text-[10px] transition border border-slate-700/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"><i class="fa-solid fa-chevron-right"></i></button>
                                <span class="text-[9px] sm:text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 ml-1">Daily Log</span>
                            </div>
                        </div>
                        <div id="tracker-calendar-selected-date-title" class="text-xs sm:text-sm font-extrabold text-white">${currentSelectedDay}</div>
                        
                        <div class="space-y-1">
                            <div class="flex justify-between items-center text-xs">
                                <span class="text-slate-400">Completion Score:</span>
                                <span id="tracker-calendar-selected-pct" class="font-bold text-cyan-400 text-xs sm:text-sm">0%</span>
                            </div>
                            <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div id="tracker-calendar-selected-bar" class="animate-shimmer h-full w-0 transition-all duration-300"></div>
                            </div>
                        </div>

                        <div class="pt-2 border-t border-slate-800 space-y-1.5">
                            <span class="text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-wider block">Quick Habit Check:</span>
                            <div id="tracker-calendar-selected-habits-container" class="space-y-1.5 max-h-40 sm:max-h-48 overflow-y-auto pr-1"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
                <!-- HABIT LIST & REFLECTION LOG -->
                <div class="md:col-span-7 lg:col-span-8 space-y-4">
                    <div class="flex items-center justify-between glass-card p-3.5 sm:p-4 rounded-2xl">
                        <div>
                            <h2 class="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                                <i class="fa-solid fa-list-check text-cyan-400" id="habits-header-icon"></i> Non-Negotiables
                            </h2>
                            <p class="text-[11px] sm:text-xs text-slate-400">Check off daily habits to update Arc execution</p>
                        </div>
                        <button role="button" onclick="resetTodayHabits()" onmouseenter="playSfx('hover')" class="px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 active:bg-slate-700 text-slate-300 transition border border-slate-700 flex items-center gap-1 shadow-sm hover:border-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                            <i class="fa-solid fa-rotate-left"></i> <span class="hidden sm:inline">Reset Today</span>
                        </button>
                    </div>

                    <div id="habits-container" class="space-y-3 sm:space-y-4"></div>

                    <!-- REFLECTION LOG -->
                    <div class="glass-card glass-card-hover rounded-2xl p-4 sm:p-5 space-y-2.5 border-l-4 border-l-cyan-400">
                        <div class="flex items-center justify-between">
                            <label for="whatHappened" class="font-bold text-xs sm:text-sm text-white flex items-center gap-2 cursor-pointer">
                                <i class="fa-solid fa-pen-to-square text-cyan-400"></i> Daily Reflection Log
                            </label>
                            <span class="text-[10px] sm:text-xs text-slate-400">What happened today?</span>
                        </div>
                        <textarea id="whatHappened" oninput="saveWhatHappenedText()" rows="3" placeholder="Write about your day, achievements, thoughts, or wins..." aria-label="Daily Reflection Log" class="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"></textarea>
                    </div>
                </div>

                <!-- SIDEBAR WIDGETS -->
                <div class="md:col-span-5 lg:col-span-4 space-y-4 sm:space-y-6">
                    <!-- SCREEN TIME TRACKER WIDGET (MULTI-PLATFORM) -->
                    <div class="glass-card glass-card-hover rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4 border-l-4 border-l-cyan-400 relative overflow-hidden">
                        <div class="flex items-center justify-between">
                            <h3 id="screen-time-widget-title" class="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                                <i id="screen-time-device-icon" class="fa-solid fa-laptop text-cyan-400"></i>
                                <span id="screen-time-device-label">Device Screen Time</span>
                            </h3>
                            <span class="text-[9px] sm:text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono animate-pulse flex items-center gap-1" id="laptop-status-badge">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> AUTO-TRACKING
                            </span>
                        </div>

                        <div class="text-center py-2 bg-slate-950/50 rounded-xl border border-slate-800/80">
                            <div class="text-2xl sm:text-4xl font-black font-mono tracking-wider bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent" id="laptop-timer-display">00h 00m 00s</div>
                            <p class="text-[10px] sm:text-xs text-slate-400 mt-1" id="laptop-status-desc">Auto-tracking on Phones, Macs &amp; Laptops • Zero input required</p>
                        </div>

                        <div class="grid grid-cols-2 gap-2">
                            <button role="button" id="btn-toggle-laptop" onclick="toggleLaptopTracker()" class="py-2 sm:py-2.5 rounded-xl bg-slate-800 active:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition border border-slate-700 shadow-sm hover:border-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                                <i class="fa-solid fa-pause mr-1"></i> Pause
                            </button>
                            <button role="button" onclick="switchTab('screentime'); playSfx('modalOpen')" class="py-2 sm:py-2.5 rounded-xl bg-cyan-500/20 active:bg-cyan-500/30 text-cyan-300 font-bold text-xs uppercase tracking-wider transition border border-cyan-500/40 shadow-sm hover:bg-cyan-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 flex items-center justify-center gap-1" title="App Screen Time, Usage Limits &amp; Blocker">
                                <i class="fa-solid fa-hourglass-half text-cyan-400"></i> App Limits
                            </button>
                        </div>

                        <!-- CROSS-DEVICE QUICK SYNC STRIP -->
                        <div id="cross-device-quick-pill" class="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px]">
                            <div class="bg-slate-950/60 p-2 rounded-lg border border-slate-800 flex items-center justify-between cursor-pointer hover:border-purple-500/40 transition" onclick="switchTab('screentime'); playSfx('click')" title="View Separately Made Mobile Screen Time Section">
                                <span class="text-purple-300 font-semibold flex items-center gap-1"><i class="fa-solid fa-mobile-screen"></i> Mobile:</span>
                                <span id="sidebar-mobile-time" class="font-mono font-bold text-white">0h 0m</span>
                            </div>
                            <div class="bg-slate-950/60 p-2 rounded-lg border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/40 transition" onclick="switchTab('screentime'); playSfx('click')" title="View Combined Screen Time Matrix">
                                <span class="text-cyan-300 font-semibold flex items-center gap-1"><i class="fa-solid fa-layer-group"></i> Combined:</span>
                                <span id="sidebar-combined-time" class="font-mono font-bold text-cyan-400">0h 0m</span>
                            </div>
                        </div>
                    </div>

                    <!-- CUSTOM HABIT CREATOR -->
                    <div class="glass-card glass-card-hover rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4">
                        <h3 class="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                            <i class="fa-solid fa-plus-circle text-purple-400"></i> Add Custom Habit
                        </h3>
                        <div class="space-y-2.5">
                            <label for="custom-habit-name" class="sr-only">Custom Habit Name</label>
                            <input type="text" id="custom-habit-name" placeholder="e.g. 5 AM Cold Shower" aria-label="Custom Habit Name" class="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 sm:py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                            <div class="grid grid-cols-2 gap-2">
                                <label for="custom-habit-category" class="sr-only">Category</label>
                                <select id="custom-habit-category" aria-label="Custom Habit Category" class="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                                    <option value="Physical">Physical</option>
                                    <option value="Mindset">Mindset</option>
                                    <option value="Productivity">Productivity</option>
                                    <option value="Discipline">Discipline</option>
                                </select>
                                <label for="custom-habit-weight" class="sr-only">Priority Weight</label>
                                <select id="custom-habit-weight" aria-label="Custom Habit Priority Weight" class="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                                    <option value="1">Normal (1x)</option>
                                    <option value="2">High Priority (2x)</option>
                                    <option value="3">Core Rule (3x)</option>
                                </select>
                            </div>
                            <button role="button" onclick="addCustomHabit()" onmouseenter="playSfx('hover')" class="w-full py-2.5 rounded-xl bg-purple-600 active:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-purple-600/20 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                                <i class="fa-solid fa-plus mr-1"></i> Add To Ruleset
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ============================================================== -->
            <!-- HOME PAGE BOTTOM: COMPACT STORE & RATING STRIP (SLIM)          -->
            <!-- Google Play · Apple App Store · Microsoft Store Windows        -->
            <!-- ============================================================== -->
            <div id="home-store-rating-section" class="glass-card rounded-2xl p-3 sm:p-4 border border-slate-800 bg-slate-900/60 transition-all duration-300 mt-4 sm:mt-6">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs shrink-0">
                            <i class="fa-solid fa-cloud-arrow-down"></i>
                        </div>
                        <div class="min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="text-xs sm:text-sm font-bold text-white tracking-wide">Having fun?</span>
                                <span class="text-xs text-slate-300 hidden sm:inline">Rate or download Arc Tracker</span>
                                <span class="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase">
                                    Multi-Platform
                                </span>
                            </div>
                            <p class="text-[11px] text-slate-400 mt-0.5 truncate">
                                Available on Google Play, App Store &amp; Microsoft Store
                            </p>
                        </div>
                    </div>

                    <!-- 3 COMPACT STORE BUTTONS (NO FAKE RATINGS) -->
                    <div class="flex items-center gap-2 flex-wrap shrink-0 w-full sm:w-auto">
                        <!-- Google Play (Coming Soon / GitHub Releases) -->
                        <a href="https://github.com/mayank-pixel-cell/mayank/releases" target="_blank" rel="noopener noreferrer" onclick="if(window.showToast) window.showToast('Google Play Store listing coming soon! Check GitHub Releases for early builds.'); if(window.playSfx) playSfx('click');" class="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-slate-950/70 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-emerald-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm whitespace-nowrap" title="Google Play Store (Coming Soon - View GitHub Releases)">
                            <i class="fa-brands fa-google-play text-emerald-400 text-xs"></i>
                            <span>Google Play</span>
                            <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">Soon</span>
                        </a>

                        <!-- App Store (Coming Soon / GitHub Releases) -->
                        <a href="https://github.com/mayank-pixel-cell/mayank/releases" target="_blank" rel="noopener noreferrer" onclick="if(window.showToast) window.showToast('Apple App Store listing coming soon! Check GitHub Releases for early builds.'); if(window.playSfx) playSfx('click');" class="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-slate-950/70 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-sky-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm whitespace-nowrap" title="Apple App Store (Coming Soon - View GitHub Releases)">
                            <i class="fa-brands fa-apple text-sky-400 text-sm"></i>
                            <span>App Store</span>
                            <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 font-bold">Soon</span>
                        </a>

                        <!-- Microsoft Store -->
                        <button type="button" onclick="ArcStoreRating.openStore('microsoft_store')" class="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm whitespace-nowrap" title="Microsoft Store for Windows">
                            <i class="fa-brands fa-microsoft text-cyan-400 text-xs"></i>
                            <span>Microsoft Store</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>`;
}
