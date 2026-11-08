export function renderResultsView() {
  return `<section id="view-results" class="hidden space-y-6 sm:space-y-8 tab-view-enter pb-32 md:pb-24">
            <div class="glass-card rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-l-4 border-l-cyan-400">
                <div class="space-y-1 text-center md:text-left">
                    <span class="text-[10px] sm:text-xs font-bold text-cyan-400 tracking-wider uppercase">Analytics Breakdown</span>
                    <h2 class="text-xl sm:text-2xl font-black text-white">Arc Mastery & Pillar Web Analysis</h2>
                    <p class="text-xs text-slate-400 max-w-xl">
                        Your performance mapped across a multi-axis radar matrix. Observe real-time progress across all discipline pillars.
                    </p>
                </div>
                <div class="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center">
                    <button role="button" onclick="openArcModal(); playSfx('modalOpen')" class="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-amber-500/20 active:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition hover:bg-amber-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                        <i class="fa-solid fa-sun text-amber-400"></i> Transition Arc
                    </button>
                </div>
            </div>

            <!-- ANALYTICS CARDS -->
            <div class="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                <div class="glass-card glass-card-hover rounded-2xl p-3.5 sm:p-5 border-l-4 border-l-cyan-400 flex items-center justify-between">
                    <div>
                        <span class="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Total Focus</span>
                        <div class="text-base sm:text-xl font-black text-white mt-0.5" id="res-total-focus-time">0h 0m</div>
                        <span class="text-[9px] sm:text-[11px] text-cyan-400 font-mono mt-0.5 block truncate" id="res-focus-seconds-detail">0 logged sec</span>
                    </div>
                    <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-sm sm:text-lg">
                        <i class="fa-solid fa-stopwatch"></i>
                    </div>
                </div>

                <div class="glass-card glass-card-hover rounded-2xl p-3.5 sm:p-5 border-l-4 border-l-blue-400 flex items-center justify-between">
                    <div>
                        <span class="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Screen Time</span>
                        <div class="text-base sm:text-xl font-black text-white mt-0.5" id="res-laptop-time">0h 0m</div>
                        <span class="text-[9px] sm:text-[11px] text-blue-400 font-mono mt-0.5 block truncate" id="res-laptop-seconds-detail">0 logged sec</span>
                    </div>
                    <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-sm sm:text-lg">
                        <i class="fa-solid fa-laptop"></i>
                    </div>
                </div>

                <div class="glass-card glass-card-hover rounded-2xl p-3.5 sm:p-5 border-l-4 border-l-amber-400 flex items-center justify-between bg-amber-500/5 col-span-2 sm:col-span-1">
                    <div>
                        <span class="text-[10px] sm:text-xs font-bold text-amber-300 uppercase tracking-wider">Grand Total Time</span>
                        <div class="text-base sm:text-xl font-black text-amber-300 mt-0.5" id="res-grand-total-time">0h 0m</div>
                        <span class="text-[9px] sm:text-[11px] text-amber-400/80 font-mono mt-0.5 block truncate" id="res-grand-total-detail">Combined Spent</span>
                    </div>
                    <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-sm sm:text-lg">
                        <i class="fa-solid fa-hourglass-end"></i>
                    </div>
                </div>

                <div class="glass-card glass-card-hover rounded-2xl p-3.5 sm:p-5 border-l-4 border-l-purple-400 flex items-center justify-between">
                    <div>
                        <span class="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Habits Done</span>
                        <div class="text-base sm:text-xl font-black text-white mt-0.5" id="res-completed-habits-count">0 / 0</div>
                        <span class="text-[9px] sm:text-[11px] text-purple-300 font-mono mt-0.5 block truncate" id="res-completed-habits-pct">0% Progress</span>
                    </div>
                    <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 text-sm sm:text-lg">
                        <i class="fa-solid fa-circle-check"></i>
                    </div>
                </div>

                <div class="glass-card glass-card-hover rounded-2xl p-3.5 sm:p-5 border-l-4 border-l-emerald-400 flex items-center justify-between">
                    <div>
                        <span class="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Status</span>
                        <div class="text-sm sm:text-lg font-extrabold text-white mt-0.5" id="res-session-status">Active</div>
                        <span class="text-[9px] sm:text-[11px] text-emerald-400 font-mono mt-0.5 block truncate" id="res-last-start-time">Auto-tracking</span>
                    </div>
                    <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm sm:text-lg">
                        <i class="fa-solid fa-bolt"></i>
                    </div>
                </div>
            </div>

            <!-- REFLECTION LOG & TOP VISITED SITES SUMMARY -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div class="glass-card glass-card-hover rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-2.5 border-t-2 border-t-cyan-400">
                    <h4 class="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <i class="fa-solid fa-book-open text-cyan-400"></i> What Happened Today
                    </h4>
                    <p id="displayWhatHappened" class="text-xs text-slate-200 leading-relaxed bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 min-h-[80px]">
                        Nothing recorded yet.
                    </p>
                </div>

                <div class="glass-card glass-card-hover rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-2.5 border-t-2 border-t-blue-400">
                    <div class="flex items-center justify-between">
                        <h4 class="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <i class="fa-solid fa-globe text-blue-400"></i> Top Visited Websites
                        </h4>
                        <span id="displayTotalScreenTime" class="text-xs font-mono font-bold text-blue-400">0m</span>
                    </div>
                    <ul id="displayTopWebsites" class="space-y-2 text-xs text-slate-300"></ul>
                </div>
            </div>

            <!-- SPIDER WEB RADAR MATRIX & BREAKDOWN -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div id="spider-web-card-container" class="md:col-span-7 lg:col-span-7 glass-card spider-web-card-container rounded-2xl sm:rounded-3xl p-4 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden group">
                    <!-- Ambient Radial Halo Behind Spider Web -->
                    <div class="spider-ambient-halo absolute inset-0 m-auto w-[85%] h-[85%] rounded-full pointer-events-none -z-0"></div>

                    <div class="w-full flex justify-between items-center mb-2 z-10">
                        <h3 class="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                            <i class="fa-solid fa-diagram-project text-cyan-400"></i> Pillar Spider Web
                        </h3>
                        <div class="flex items-center gap-2">
                            <button type="button" id="spider-radar-toggle-btn" onclick="triggerSpiderPulseEffect(); playSfx('radarPing');" title="Trigger Laser Pulse Shockwave" class="text-[10px] px-2.5 py-1 rounded-full bg-cyan-500/10 hover:bg-cyan-500/25 active:scale-95 text-cyan-400 font-mono border border-cyan-500/25 transition flex items-center gap-1.5 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                                <i class="fa-solid fa-satellite-dish text-[9px] animate-pulse"></i> Radar Matrix
                            </button>
                        </div>
                    </div>

                    <div class="relative w-full max-w-[320px] sm:max-w-[480px] aspect-square my-2 flex items-center justify-center z-10">
                        <svg id="pie-chart-svg" viewBox="-1.25 -1.25 2.5 2.5" class="w-full h-full drop-shadow-[0_0_15px_rgba(0,0,0,0.6)] transition-all duration-300"></svg>

                        <!-- High-Tech Interactive Center Core Hub -->
                        <div id="pie-center-hub" role="button" tabindex="0" onclick="handleCenterHubClick(event)" title="Arc Score Core · Click to Pulse · Triple-Click to Overclock" class="spider-center-hub absolute inset-0 m-auto w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-slate-950/95 border border-slate-800 backdrop-blur-md flex flex-col items-center justify-center cursor-pointer shadow-2xl z-20 select-none group/hub transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                            <!-- Rotating orbital dashed rings -->
                            <div class="spider-hub-orbit-ring absolute -inset-2 rounded-full border border-dashed border-cyan-400/35 pointer-events-none"></div>
                            <div class="spider-hub-orbit-counter absolute -inset-3.5 rounded-full border border-dotted border-purple-400/30 pointer-events-none"></div>
                            <!-- Internal shining sweep line -->
                            <div class="spider-hub-glass-shine"></div>

                            <span class="text-[8px] sm:text-[9px] uppercase font-bold tracking-widest text-slate-400 z-10 group-hover/hub:text-cyan-300 transition-colors">Arc Score</span>
                            <span id="pie-center-score" class="text-xl sm:text-2xl font-black text-cyan-400 z-10 transition-colors drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">0%</span>
                            <span id="pie-center-grade" class="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 mt-0.5 z-10 border border-cyan-500/30">GRADE S</span>
                        </div>
                    </div>

                    <div id="pie-hover-details" class="mt-2 w-full bg-slate-900/60 rounded-xl p-2.5 border border-slate-800 text-center text-xs text-slate-300 z-10 transition-all">
                        Tap any spider web vertex to inspect category contribution.
                    </div>
                </div>

                <div class="md:col-span-5 lg:col-span-5 space-y-4">
                    <div class="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3">
                        <h3 class="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                            <i class="fa-solid fa-layer-group text-purple-400"></i> Category Breakdown
                        </h3>
                        <div id="category-legend-list" class="space-y-2.5"></div>
                    </div>

                    <div class="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-2.5 border-t-2 border-t-purple-500">
                        <h4 class="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Lock-In Assessment</h4>
                        <div class="flex items-center justify-between">
                            <div class="text-base sm:text-lg font-bold text-white" id="assessment-status">Locked In & Focused</div>
                            <div class="text-xl sm:text-2xl" id="assessment-badge">❄️</div>
                        </div>
                        <p class="text-xs text-slate-400 leading-relaxed" id="assessment-feedback">
                            Your completion rate reflects strong discipline. Maintain daily consistency to lock in maximum results before December 31.
                        </p>
                    </div>

                    <!-- LEADERBOARD & GROUPS SECTION (BELOW REIGNITE DISCIPLINE) -->
                    <div id="arc-leaderboard-groups-section" class="glass-card rounded-2xl sm:rounded-3xl p-3 sm:p-4 space-y-3 border-t-2 border-t-amber-400 glow-amber relative overflow-hidden transition-all duration-300">
                        <!-- Top Header & Navigation -->
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800/80">
                            <div class="flex items-center gap-2">
                                <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 to-yellow-400/30 text-amber-300 border border-amber-400/40 grid place-items-center text-xs sm:text-sm shadow-inner shrink-0">
                                    <i class="fa-solid fa-trophy"></i>
                                </div>
                                <div>
                                    <div class="flex items-center gap-1.5">
                                        <h3 class="text-xs sm:text-sm font-black text-white uppercase tracking-wider">Leaderboard &amp; Groups</h3>
                                        <span id="lb-lock-pill" class="text-[9px] font-mono font-black px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-300 border-amber-500/30 flex items-center gap-1">
                                            <i class="fa-solid fa-lock text-[8px]"></i>
                                            <span>LVL 10</span>
                                        </span>
                                    </div>
                                    <p class="text-[10px] text-slate-400 leading-tight">Ranked Ladders &amp; Unlimited Squads</p>
                                </div>
                            </div>

                            <!-- Controls: Switcher & Compact Toggle -->
                            <div class="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
                                <div class="flex items-center gap-0.5 p-0.5 bg-slate-900/90 rounded-lg border border-slate-800 text-[10px] sm:text-[11px] font-bold">
                                    <button type="button" id="tab-btn-leaderboard" onclick="ArcLeaderboardGroups.switchView('leaderboard')" class="px-2.5 py-1 rounded-md text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 font-black shadow-sm flex items-center gap-1.5 transition active:scale-95">
                                        <i class="fa-solid fa-trophy text-[10px]"></i>
                                        <span>Leaderboard</span>
                                    </button>
                                    <button type="button" id="tab-btn-groups" onclick="ArcLeaderboardGroups.switchView('groups')" class="px-2.5 py-1 rounded-md text-slate-400 hover:text-slate-200 transition flex items-center gap-1.5 active:scale-95">
                                        <i class="fa-solid fa-user-group text-[10px]"></i>
                                        <span>Groups</span>
                                    </button>
                                </div>

                                <button type="button" id="btn-lb-compact-toggle" onclick="ArcLeaderboardGroups.toggleCompact()" class="px-2 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-400/40 text-slate-300 hover:text-amber-300 text-[10px] font-bold flex items-center gap-1 transition active:scale-95" title="Toggle Compact / Expanded View">
                                    <i id="lb-compact-icon" class="fa-solid fa-up-right-and-down-left-from-center text-[9px]"></i>
                                    <span id="lb-compact-label">Expand</span>
                                </button>
                            </div>
                        </div>

                        <!-- SUB-VIEW 1: LEADERBOARD VIEW -->
                        <div id="lb-view-container" class="space-y-2.5">
                            <!-- Locked State Container (Shown if Level < 10) -->
                            <div id="lb-locked-container">
                                <!-- Rendered dynamically based on isCompacted state -->
                            </div>

                            <!-- Unlocked State Container (Shown if Level >= 10) -->
                            <div id="lb-unlocked-container" class="hidden space-y-2.5">
                                <!-- Level 10 Milestone Note Banner -->
                                <div id="lb-unlocked-note-banner" class="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-yellow-400/10 to-emerald-500/15 border border-amber-400/35 text-amber-300 text-[11px] font-bold flex items-center justify-between gap-2 shadow-sm animate-fade-in">
                                    <div class="flex items-center gap-1.5 min-w-0">
                                        <i class="fa-solid fa-trophy text-amber-400 text-xs shrink-0"></i>
                                        <span class="truncate"><strong>Note:</strong> Leaderboards are now unlocked!</span>
                                    </div>
                                    <span class="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 font-black">Level 10+</span>
                                </div>

                                <!-- Three Category Switcher Tabs: Regional, Country, Global -->
                                <div class="flex items-center gap-1 p-1 bg-slate-950/90 rounded-xl border border-slate-800 text-[11px] font-bold">
                                    <button type="button" onclick="ArcLeaderboardGroups.setCategory('regional')" id="btn-lb-cat-regional" class="flex-1 py-1 px-2 rounded-lg text-center transition flex items-center justify-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-sm">
                                        <i class="fa-solid fa-location-dot text-[10px]"></i>
                                        <span>Regional</span>
                                    </button>
                                    <button type="button" onclick="ArcLeaderboardGroups.setCategory('country')" id="btn-lb-cat-country" class="flex-1 py-1 px-2 rounded-lg text-center text-slate-400 hover:text-slate-200 transition flex items-center justify-center gap-1 font-semibold">
                                        <i class="fa-solid fa-flag text-[10px]"></i>
                                        <span>Country</span>
                                    </button>
                                    <button type="button" onclick="ArcLeaderboardGroups.setCategory('global')" id="btn-lb-cat-global" class="flex-1 py-1 px-2 rounded-lg text-center text-slate-400 hover:text-slate-200 transition flex items-center justify-center gap-1 font-semibold">
                                        <i class="fa-solid fa-globe text-[10px]"></i>
                                        <span>Global</span>
                                    </button>
                                </div>

                                <!-- Scope Banner & User Standing (Streamlined) -->
                                <div class="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px]">
                                    <div class="flex items-center gap-1.5 truncate">
                                        <span id="lb-scope-icon" class="text-amber-400 text-xs"><i class="fa-solid fa-location-dot"></i></span>
                                        <span id="lb-scope-title" class="font-bold text-slate-200 truncate">Regional Sector</span>
                                    </div>
                                    <span id="lb-scope-count" class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shrink-0">1,240 Operatives</span>
                                </div>

                                <!-- User's Current Standing Callout Card -->
                                <div class="p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900/90 to-purple-950/40 border border-cyan-500/40 flex items-center justify-between shadow-sm">
                                    <div class="flex items-center gap-2">
                                        <div class="relative shrink-0">
                                            <div id="lb-user-avatar" class="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-bold grid place-items-center text-xs">O</div>
                                            <span class="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-950"></span>
                                        </div>
                                        <div class="min-w-0">
                                            <div class="flex items-center gap-1.5">
                                                <span id="lb-user-handle" class="font-extrabold text-xs text-white truncate">@operative</span>
                                                <span class="text-[8px] font-mono px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shrink-0">YOU</span>
                                            </div>
                                            <div class="text-[9px] text-slate-400 font-mono truncate" id="lb-user-stats">Level 1 • 15% Score • 0d Streak</div>
                                        </div>
                                    </div>
                                    <div class="text-right shrink-0">
                                        <div class="text-xs font-mono font-black text-amber-400" id="lb-user-rank-display">#7 Regional</div>
                                        <span class="text-[9px] text-emerald-400 font-semibold" id="lb-user-percentile">Top 1%</span>
                                    </div>
                                </div>

                                <!-- Rankings Ladder Table / List -->
                                <div id="lb-rankings-list" class="space-y-1 overflow-y-auto pr-1 custom-scroll">
                                    <!-- Populated dynamically by ArcLeaderboardGroups.render() -->
                                </div>

                                <!-- Compact Expand / Collapse Footer Action -->
                                <div id="lb-ladder-footer-action">
                                    <!-- Populated dynamically -->
                                </div>
                            </div>
                        </div>

                        <!-- SUB-VIEW 2: GROUPS / SQUADS VIEW -->
                        <div id="groups-view-container" class="hidden space-y-2.5">
                            <!-- Squads Intro & Create Button -->
                            <div class="flex items-center justify-between gap-2">
                                <div>
                                    <div class="flex items-center gap-1.5">
                                        <h4 class="text-xs font-bold text-slate-200 uppercase tracking-wider">Accountability Squads</h4>
                                        <span class="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">Unlimited</span>
                                    </div>
                                    <p class="text-[10px] text-slate-400 leading-tight">No member limit • Join or create any squad</p>
                                </div>
                                <button type="button" onclick="ArcLeaderboardGroups.openCreateSquadModal()" class="px-2.5 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition active:scale-95 shadow-sm shrink-0">
                                    <i class="fa-solid fa-plus text-[9px]"></i>
                                    <span>Create Squad</span>
                                </button>
                            </div>

                            <!-- User's Active Squad Status Banner -->
                            <div id="groups-active-banner" class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 text-xs">
                                <!-- Populated dynamically -->
                            </div>

                            <!-- Recommended Squads List -->
                            <div id="groups-squads-list" class="space-y-1.5 overflow-y-auto pr-1 custom-scroll">
                                <!-- Populated dynamically -->
                            </div>

                            <!-- Groups Compact Expand / Collapse Footer Action -->
                            <div id="groups-footer-action">
                                <!-- Populated dynamically -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <!-- CONSISTENCY MATRIX -->
            <div class="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3">
                <div class="flex items-center justify-between">
                    <h3 class="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <i class="fa-solid fa-clock-rotate-left text-amber-400"></i> 7-Day Consistency Matrix
                    </h3>
                    <span class="text-[10px] sm:text-xs text-slate-400">Synced History</span>
                </div>
                <div id="matrix-days-grid" class="grid grid-cols-7 gap-1.5 sm:gap-2 text-center"></div>
            </div>
        </section>`;
}
