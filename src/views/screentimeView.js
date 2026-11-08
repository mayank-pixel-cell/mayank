export function renderScreentimeView() {
  return `<section id="view-screentime" class="space-y-4 sm:space-y-6 tab-view-enter hidden pb-32 md:pb-24">
            <!-- TOP HERO BANNER & STATS -->
            <div class="glass-card st-cyber-ambient rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-l-4 border-l-cyan-400 relative overflow-hidden space-y-4 shadow-xl">
                <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div class="flex items-center gap-4">
                        <!-- HOLOGRAPHIC DOPAMINE SHIELD RADAR GAUGE -->
                        <div class="st-radar-dial shrink-0 shadow-lg cursor-pointer" onclick="playSfx('quantumHum'); if(window.triggerGradeParticleBurst){const r=this.getBoundingClientRect(); triggerGradeParticleBurst(r.left+r.width/2, r.top+r.height/2, 'S');}" title="Focus Shield Integrity & Dopamine Hygiene Radar (Click to Scan)">
                            <div class="st-radar-ring-outer"></div>
                            <div class="st-radar-ring-inner"></div>
                            <div class="st-radar-crosshair"></div>
                            <div class="st-radar-sweep"></div>
                            <div class="st-radar-blip st-radar-blip-1"></div>
                            <div class="st-radar-blip st-radar-blip-2"></div>
                            <div class="st-radar-blip st-radar-blip-3"></div>
                            <!-- Center Digital Readout -->
                            <div class="relative z-10 flex flex-col items-center justify-center text-center select-none">
                                <i class="fa-solid fa-shield-halved text-cyan-400 text-xs mb-0.5 drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]"></i>
                                <span id="st-radar-shield-score" class="text-sm font-black font-mono tracking-tight text-white drop-shadow">100%</span>
                                <span class="text-[8px] font-mono text-cyan-300 font-bold uppercase tracking-tighter">SHIELD</span>
                            </div>
                        </div>

                        <div class="space-y-1">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                    <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                                    LIVE SCREEN TIME MATRIX
                                </span>
                                <span id="st-focus-badge-top" class="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-semibold flex items-center gap-1">
                                    <i class="fa-solid fa-moon"></i> Focus Blocker Ready
                                </span>
                                <span id="st-perm-badge-top" class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-semibold">
                                    <i class="fa-solid fa-triangle-exclamation mr-1"></i> Accessibility Setup Available
                                </span>
                            </div>
                            <h2 class="text-xl sm:text-3xl font-black text-white flex items-center gap-2">
                                <i class="fa-solid fa-hourglass-half text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]"></i> App Screen Time &amp; Lockout Shield
                            </h2>
                            <p class="text-xs sm:text-sm text-slate-300">
                                Automatic per-application usage tracking, Focus Mode app blocklists, and YouTube channel filtering.
                            </p>
                        </div>
                    </div>

                    <div class="flex items-center gap-2 flex-wrap self-stretch lg:self-auto">
                        <button role="button" onclick="openFocusBlocklistModal(); playSfx('modalOpen')" class="px-3 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 text-xs font-bold transition flex items-center gap-1.5 shadow-sm" title="Configure which apps are blocked during Focus and Pomodoro">
                            <i class="fa-solid fa-shield-halved text-purple-400"></i> Focus Blocklist (<span id="st-header-focus-block-count">8</span>)
                        </button>
                        <button role="button" onclick="openYouTubeFilterModal(); playSfx('modalOpen')" class="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-bold transition flex items-center gap-1.5 shadow-sm" title="Filter and block distracting YouTube channels (Indian & Global)">
                            <i class="fa-brands fa-youtube text-red-500"></i> YouTube Filter (<span id="st-header-yt-filter-count">20</span>)
                        </button>
                        <button role="button" onclick="openWebsiteFilterModal(); playSfx('modalOpen')" class="px-3 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition flex items-center gap-1.5 shadow-sm" title="Filter and block distracting websites in Chrome during Focus">
                            <i class="fa-brands fa-chrome text-cyan-400"></i> Website Filter (<span id="st-header-web-filter-count">13</span>)
                        </button>
                        <button role="button" onclick="openAccessibilityModal(); playSfx('modalOpen')" class="px-3 py-2 rounded-xl bg-slate-800 active:bg-slate-700 hover:border-cyan-400 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
                            <i class="fa-solid fa-universal-access text-cyan-400"></i> Permissions
                        </button>
                        <button role="button" id="st-strict-mode-btn" onclick="toggleFocusStrictMode(); playSfx('click')" class="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 shadow-sm" title="Focus Strict Mode: Prevents ending focus sessions early (Free for all users)">
                            <i class="fa-solid fa-lock text-amber-400"></i> <span id="st-strict-btn-text">Strict Mode <span class="text-[9px] bg-slate-700 text-emerald-300 px-1 rounded border border-slate-600 font-bold">FREE</span></span>
                        </button>
                        <button role="button" onclick="openAddCustomAppModal(); playSfx('modalOpen')" class="px-3.5 py-2 rounded-xl bg-cyan-500 active:bg-cyan-400 text-black text-xs font-extrabold uppercase tracking-wider transition shadow-lg shadow-cyan-500/20 hover:scale-105 flex items-center gap-1.5">
                            <i class="fa-solid fa-plus"></i> Add App
                        </button>
                        <button role="button" onclick="ArcScreenTimeStore.openShareModal(); playSfx('modalOpen')" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95 flex items-center gap-1.5">
                            <i class="fa-solid fa-share-nodes"></i> Share Screen Time
                        </button>
                        <button role="button" onclick="ArcScreenTimeStore.openPhoneLinkPage(); playSfx('modalOpen')" id="st-header-link-btn" class="px-3 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
                            <i class="fa-solid fa-mobile-screen"></i> <span id="st-header-link-btn-text">Link Phone</span>
                        </button>
                    </div>
                </div>

                <!-- 4 OVERVIEW KPI CARDS -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                    <div class="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all duration-200 relative overflow-hidden group shadow-sm">
                        <div class="absolute -top-6 -right-6 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl pointer-events-none"></div>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today's App Screen Time</span>
                        <div class="text-xl sm:text-2xl font-black font-mono text-cyan-400 mt-0.5" id="st-kpi-total-time">0m 00s</div>
                        <span class="text-[9px] text-slate-500 block">Total active monitored time</span>
                    </div>

                    <div class="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 hover:border-purple-500/40 transition-all duration-200 relative overflow-hidden group shadow-sm">
                        <div class="absolute -top-6 -right-6 w-16 h-16 bg-purple-500/10 rounded-full blur-xl pointer-events-none"></div>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Focus Blocklist</span>
                        <div class="text-xl sm:text-2xl font-black font-mono text-purple-400 mt-0.5" id="st-kpi-focus-count">8 Apps</div>
                        <span class="text-[9px] text-slate-500 block">Locked during Focus &amp; Pomodoro</span>
                    </div>

                    <div class="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition-all duration-200 relative overflow-hidden group shadow-sm" id="st-kpi-blocked-card">
                        <div class="absolute -top-6 -right-6 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Apps Blocked Today</span>
                        <div class="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-0.5" id="st-kpi-blocked-count">0 Locked</div>
                        <span class="text-[9px] text-slate-500 block" id="st-kpi-blocked-sub">All apps within quota</span>
                    </div>

                    <div class="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 hover:border-red-500/40 transition-all duration-200 relative overflow-hidden group shadow-sm">
                        <div class="absolute -top-6 -right-6 w-16 h-16 bg-red-500/10 rounded-full blur-xl pointer-events-none"></div>
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">YouTube Filter</span>
                        <div class="text-sm sm:text-base font-extrabold text-red-400 mt-1 flex items-center gap-1.5" id="st-kpi-yt-status">
                            <i class="fa-brands fa-youtube"></i> Active (Shorts Blocked)
                        </div>
                        <span class="text-[9px] text-slate-500 block">Restricts distracting channels</span>
                    </div>
                </div>
            </div>

            <!-- CROSS-DEVICE LINKED SCREEN TIME MATRIX (DESKTOP + MOBILE) -->
            <div id="st-cross-device-ecosystem" class="glass-card st-cyber-ambient rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-l-4 border-l-indigo-400 space-y-4 shadow-xl relative overflow-hidden transition-all duration-300">
                <!-- TOP HEADER & ACCOUNT STATUS BAR -->
                <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div class="space-y-1">
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <i class="fa-solid fa-link text-indigo-400"></i>
                                DUAL-DEVICE LINKED ECOSYSTEM
                            </span>
                            <span id="st-ecosystem-live-badge" class="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-mono font-semibold flex items-center gap-1 shadow-sm">
                                <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span> Live Unified Sync
                            </span>
                        </div>
                        <h3 class="text-lg sm:text-2xl font-black text-white flex items-center gap-2">
                            <i class="fa-solid fa-tower-broadcast text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]"></i> Linked Screen Time Tracker
                        </h3>
                        <p class="text-xs sm:text-sm text-slate-300">
                            Automatic screen time synchronization between your Mobile App Tracker and Desktop PC under your linked account.
                        </p>
                    </div>

                    <!-- ACCOUNT STATUS & CONTROLS -->
                    <div class="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
                        <div id="st-cross-device-account-pill" class="p-1 px-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 shadow-inner">
                            <span class="text-[11px] text-slate-400 font-mono"><i class="fa-solid fa-circle-notch animate-spin mr-1"></i>Checking account...</span>
                        </div>

                        <button role="button" onclick="ArcCrossDeviceComparison.openModal(); playSfx('modalOpen')" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition active:scale-95" title="Open Phone vs. Laptop App Comparison Dashboard">
                            <i class="fa-solid fa-code-compare text-cyan-300"></i> Compare Devices
                        </button>

                        <button role="button" onclick="ArcScreenTimeStore.openLastMonthModal(); playSfx('modalOpen')" class="px-3 py-2 rounded-xl bg-purple-950/70 hover:bg-purple-900/70 border border-purple-500/40 text-purple-200 text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95" title="View Last Month's Screen Time, Pie Chart & App Trends">
                            <i class="fa-solid fa-chart-pie text-purple-400"></i> Last Month
                        </button>
                        <button role="button" onclick="if(window.ArcGoogleSync){ArcGoogleSync.syncNow();}else{updateCrossDeviceScreenTimeUI();}; playSfx('quantumHum'); if(window.triggerGradeParticleBurst){const r=this.getBoundingClientRect(); triggerGradeParticleBurst(r.left+r.width/2, r.top+r.height/2, 'A');}" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95" title="Sync latest screen time across devices">
                            <i class="fa-solid fa-arrows-rotate text-cyan-400"></i> Sync Now
                        </button>
                    </div>
                </div>

                <!-- 3 KEY CARDS: DESKTOP + SEPARATELY MADE MOBILE SECTION + COMBINED SCREEN TIME -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 pt-1">
                    <!-- 1. DESKTOP SCREEN TIME CARD -->
                    <div class="st-synapse-stream bg-slate-950/80 rounded-2xl p-4 sm:p-5 border border-slate-800 hover:border-cyan-500/50 transition-all duration-200 space-y-3 relative overflow-hidden group shadow-lg">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <div class="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-base shadow-sm">
                                    <i class="fa-solid fa-laptop"></i>
                                </div>
                                <div>
                                    <h4 class="text-xs sm:text-sm font-bold text-white">Desktop Screen Time</h4>
                                    <span class="text-[10px] text-slate-400 block" id="st-desktop-device-name">💻 Desktop PC / Workstation</span>
                                </div>
                            </div>
                            <span class="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 text-[9px] font-mono font-bold uppercase tracking-wider">
                                THIS PC
                            </span>
                        </div>

                        <div class="py-1">
                            <div class="text-2xl sm:text-3xl font-black font-mono tracking-wider text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.3)]" id="st-desktop-time-val">00h 00m 00s</div>
                            <div class="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span id="st-desktop-status-sub">Active desktop session running</span>
                            </div>
                        </div>
                    </div>

                    <!-- 2. MOBILE SCREEN TIME CARD (SEPARATELY MADE SECTION) -->
                    <div id="st-mobile-separate-card" class="st-synapse-stream bg-gradient-to-b from-purple-950/30 via-slate-950/90 to-purple-950/20 rounded-2xl p-4 sm:p-5 border-2 border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.18)] hover:border-purple-400 transition-all duration-200 space-y-3 relative overflow-hidden group">
                        <div class="absolute top-0 right-0 bg-purple-600 text-white font-mono text-[9px] font-black uppercase tracking-widest px-3 py-0.5 rounded-bl-xl shadow-md flex items-center gap-1">
                            <i class="fa-solid fa-mobile-screen text-[8px]"></i> MOBILE SECTION
                        </div>

                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <div class="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 text-base shadow-sm">
                                    <i class="fa-solid fa-mobile-screen-button"></i>
                                </div>
                                <div>
                                    <h4 class="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                                        Mobile Screen Time
                                    </h4>
                                    <span class="text-[10px] text-purple-300/80 block truncate max-w-[170px]" id="st-mobile-device-name">📱 Mobile App Tracker</span>
                                </div>
                            </div>
                            <button type="button" onclick="ArcScreenTimeStore.openPhoneLinkPage(); playSfx('modalOpen')" id="st-mobile-card-gear" class="text-slate-400 hover:text-purple-300 text-xs transition" title="Phone Linking Options">
                                <i class="fa-solid fa-sliders"></i>
                            </button>
                        </div>

                        <!-- LINKED PHONE VIEW -->
                        <div id="st-mobile-linked-view" class="py-1">
                            <div class="text-2xl sm:text-3xl font-black font-mono tracking-wider text-purple-300 drop-shadow-[0_0_12px_rgba(168,85,247,0.3)]" id="st-mobile-time-val">00h 00m 00s</div>
                            <div class="flex items-center justify-between gap-1 text-[10px] mt-1">
                                <div class="flex items-center gap-1.5" id="st-mobile-sync-status">
                                    <span class="text-slate-400"><i class="fa-solid fa-cloud-arrow-down mr-1"></i>Waiting for mobile sync</span>
                                </div>
                                <button type="button" onclick="ArcScreenTimeStore.disconnectPhone(); playSfx('click')" class="text-[10px] text-slate-500 hover:text-rose-400 font-mono underline transition" title="Disconnect linked phone">
                                    Disconnect
                                </button>
                            </div>
                        </div>

                        <!-- UNLINKED NOTICE (SHOWN WHEN NO PHONE IS LINKED) -->
                        <div id="st-mobile-unlinked-box" class="hidden p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-center space-y-2">
                            <div class="text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5">
                                <i class="fa-solid fa-triangle-exclamation text-amber-400"></i> No phone is linked. Please link your phone
                            </div>
                            <p class="text-[10px] text-slate-400 leading-tight">
                                Link your Android or iOS device to sync phone screen time and unlock dual-device comparisons.
                            </p>
                            <button type="button" onclick="ArcScreenTimeStore.openPhoneLinkPage(); playSfx('modalOpen')" class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30 transition active:scale-95 mx-auto">
                                <i class="fa-solid fa-link text-cyan-300"></i> Link Phone
                            </button>
                        </div>
                    </div>

                    <!-- 3. COMBINED SCREEN TIME CARD (BOTH DEVICES COMBINED) -->
                    <div class="st-specular-sweep bg-gradient-to-br from-cyan-950/40 via-slate-900 to-indigo-950/40 rounded-2xl p-4 sm:p-5 border-2 border-cyan-400/80 shadow-[0_0_35px_rgba(6,182,212,0.25)] space-y-3 relative overflow-hidden">
                        <div class="absolute top-0 right-0 bg-cyan-500 text-black font-mono text-[9px] font-black uppercase tracking-widest px-3 py-0.5 rounded-bl-xl shadow-md flex items-center gap-1">
                            <i class="fa-solid fa-layer-group text-[8px]"></i> COMBINED TOTAL
                        </div>

                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <div class="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 text-base shadow-sm">
                                    <i class="fa-solid fa-layer-group"></i>
                                </div>
                                <div>
                                    <h4 class="text-xs sm:text-sm font-bold text-white">Combined Screen Time</h4>
                                    <span class="text-[10px] text-cyan-200/80 block">Desktop + Mobile Devices</span>
                                </div>
                            </div>
                        </div>

                        <div class="py-1">
                            <div class="text-2xl sm:text-3xl font-black font-mono tracking-wider bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]" id="st-combined-time-val">00h 00m 00s</div>
                            <div class="text-[10px] text-cyan-300/90 font-mono mt-1 truncate" id="st-combined-split-pill">
                                💻 Desktop: 0h 0m • 📱 Mobile: 0h 0m
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PROPORTIONAL SPLIT PROGRESS BAR (DESKTOP VS MOBILE) -->
                <div onclick="ArcCrossDeviceComparison.openModal(); playSfx('modalOpen')" class="bg-slate-950/70 p-3 sm:p-3.5 rounded-xl border border-slate-800 hover:border-indigo-500/60 transition cursor-pointer group space-y-2 shadow-md" title="Tap to compare app usage and screen time between Phone and Laptop">
                    <div class="flex items-center justify-between text-[11px] font-mono">
                        <span id="st-combined-desktop-pct" class="text-cyan-400 font-bold flex items-center gap-1">
                            <i class="fa-solid fa-laptop"></i> Desktop 50%
                        </span>
                        <span class="text-slate-400 text-[10px] font-sans group-hover:text-indigo-300 flex items-center gap-1.5 transition">
                            <i class="fa-solid fa-code-compare text-indigo-400"></i> TAP TO COMPARE APPS &rarr;
                        </span>
                        <span id="st-combined-mobile-pct" class="text-purple-400 font-bold flex items-center gap-1">
                            <i class="fa-solid fa-mobile-screen"></i> Mobile 50%
                        </span>
                    </div>

                    <div class="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden flex p-0.5 group-hover:ring-2 group-hover:ring-indigo-500/50 transition">
                        <div id="st-combined-bar-desktop" class="h-full rounded-l-full animate-shimmer-desktop transition-all duration-500 shadow-sm w-1/2"></div>
                        <div id="st-combined-bar-mobile" class="h-full rounded-r-full animate-shimmer-mobile transition-all duration-500 shadow-sm w-1/2"></div>
                    </div>
                </div>
            </div>

            <!-- ==========================================================================
                 SCREEN TIME HISTORICAL USAGE COMPARISONS & ANALYTICS DASHBOARD
                 Stores tracked screen time & compares Yesterday, Last Week, Monthly totals
                 ========================================================================== -->
            <div id="st-historical-analytics-card" class="glass-card st-cyber-ambient rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-l-4 border-l-cyan-400 space-y-5 shadow-xl relative overflow-hidden transition-all duration-300">
                <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <i class="fa-solid fa-chart-column text-cyan-400"></i> USAGE TELEMETRY &amp; COMPARISONS
                            </span>
                            <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-semibold flex items-center gap-1">
                                <i class="fa-solid fa-database"></i> Persistent Cloud Store
                            </span>
                        </div>
                        <h3 class="text-lg sm:text-2xl font-black text-white flex items-center gap-2 mt-1">
                            <i class="fa-solid fa-chart-line text-cyan-400"></i> Screen Time Usage Comparisons
                        </h3>
                        <p class="text-xs sm:text-sm text-slate-300">
                            Historical cross-device telemetry comparing Yesterday, Last Week, and Total Monthly duration.
                        </p>
                    </div>

                    <div class="flex items-center gap-2 flex-wrap">
                        <button type="button" onclick="ArcScreenTimeStore.openLastMonthModal(); playSfx('modalOpen')" class="px-3.5 py-2 rounded-xl bg-purple-950/70 hover:bg-purple-900/70 border border-purple-500/40 text-purple-200 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition active:scale-95">
                            <i class="fa-solid fa-chart-pie text-purple-400"></i> Last Month Breakdown
                        </button>
                        <button type="button" onclick="ArcScreenTimeStore.openShareModal(); playSfx('modalOpen')" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition active:scale-95">
                            <i class="fa-solid fa-share-nodes"></i> Share with Friends
                        </button>
                    </div>
                </div>

                <!-- 3 COMPARISON CARDS: YESTERDAY, LAST WEEK, TOTAL MONTHLY -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <!-- 1. YESTERDAY'S USAGE -->
                    <div class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-sm">
                                    <i class="fa-solid fa-clock-rotate-left"></i>
                                </div>
                                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300">Yesterday's Usage</h4>
                            </div>
                            <span id="st-comp-yesterday-delta" class="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                                -18m vs Today
                            </span>
                        </div>

                        <div class="space-y-1.5 pt-1">
                            <div class="flex items-center justify-between text-xs">
                                <span class="text-slate-400 flex items-center gap-1.5"><i class="fa-solid fa-laptop text-cyan-400 text-[11px]"></i> Laptop Usage</span>
                                <span class="font-mono font-bold text-white" id="st-comp-yesterday-laptop">2h 45m</span>
                            </div>
                            <div class="flex items-center justify-between text-xs">
                                <span class="text-slate-400 flex items-center gap-1.5"><i class="fa-solid fa-mobile-screen text-purple-400 text-[11px]"></i> Phone Usage</span>
                                <span class="font-mono font-bold text-white" id="st-comp-yesterday-phone">1h 10m</span>
                            </div>
                            <div class="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800 font-bold">
                                <span class="text-cyan-300">Combined Total</span>
                                <span class="font-mono text-cyan-400 text-sm" id="st-comp-yesterday-combined">3h 55m</span>
                            </div>
                        </div>
                    </div>

                    <!-- 2. LAST WEEK'S USAGE (7-DAY TOTAL & DAILY AVG) -->
                    <div class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-purple-500/40 transition-all space-y-3">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 text-sm">
                                    <i class="fa-solid fa-calendar-week"></i>
                                </div>
                                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300">Last Week's Usage</h4>
                            </div>
                            <span id="st-comp-week-sub4-badge" class="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                                7/7 Days &lt;4h
                            </span>
                        </div>

                        <div class="space-y-1.5 pt-1">
                            <div class="flex items-center justify-between text-xs">
                                <span class="text-slate-400 flex items-center gap-1.5"><i class="fa-solid fa-laptop text-cyan-400 text-[11px]"></i> Laptop Total</span>
                                <span class="font-mono font-bold text-white" id="st-comp-week-laptop">18h 30m</span>
                            </div>
                            <div class="flex items-center justify-between text-xs">
                                <span class="text-slate-400 flex items-center gap-1.5"><i class="fa-solid fa-mobile-screen text-purple-400 text-[11px]"></i> Phone Total</span>
                                <span class="font-mono font-bold text-white" id="st-comp-week-phone">8h 15m</span>
                            </div>
                            <div class="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800 font-bold">
                                <span class="text-purple-300">Combined 7-Day Total</span>
                                <span class="font-mono text-purple-300 text-sm" id="st-comp-week-combined">26h 45m</span>
                            </div>
                            <div class="text-[10px] font-mono text-slate-400 text-right" id="st-comp-week-avg">
                                Daily Average: 3h 49m / day
                            </div>
                        </div>
                    </div>

                    <!-- 3. TOTAL MONTHLY SCREEN TIME (SEPARATELY & COMBINED) -->
                    <div class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 transition-all space-y-3">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm">
                                    <i class="fa-solid fa-calendar-days"></i>
                                </div>
                                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-300">Total Monthly Time</h4>
                            </div>
                            <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                                30-Day Sum
                            </span>
                        </div>

                        <div class="space-y-1.5 pt-1">
                            <div class="flex items-center justify-between text-xs">
                                <span class="text-slate-400 flex items-center gap-1.5"><i class="fa-solid fa-laptop text-cyan-400 text-[11px]"></i> Laptop Monthly</span>
                                <span class="font-mono font-bold text-white" id="st-comp-month-laptop">74h 20m</span>
                            </div>
                            <div class="flex items-center justify-between text-xs">
                                <span class="text-slate-400 flex items-center gap-1.5"><i class="fa-solid fa-mobile-screen text-purple-400 text-[11px]"></i> Phone Monthly</span>
                                <span class="font-mono font-bold text-white" id="st-comp-month-phone">31h 45m</span>
                            </div>
                            <div class="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800 font-bold">
                                <span class="text-amber-300">Combined Monthly Total</span>
                                <span class="font-mono text-amber-300 text-sm" id="st-comp-month-combined">106h 05m</span>
                            </div>
                            <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden flex mt-1 border border-slate-800">
                                <div id="st-comp-month-bar-laptop" class="h-full bg-cyan-400 w-[70%]"></div>
                                <div id="st-comp-month-bar-phone" class="h-full bg-purple-400 w-[30%]"></div>
                            </div>
                            <button type="button" onclick="ArcScreenTimeStore.openLastMonthModal(); playSfx('modalOpen')" class="w-full mt-2 py-1.5 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition active:scale-95">
                                <i class="fa-solid fa-chart-pie text-amber-400"></i> View Last Month App Pie Chart &amp; Bar Graphs &rarr;
                            </button>
                        </div>
                    </div>
                </div>

                <!-- WEEKLY HIGHEST APP & SUB-4HR DISCIPLINE CHALLENGE -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
                    <!-- WEEKLY HIGHEST SCREEN TIME APP CARD -->
                    <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/30 border border-slate-800 space-y-3">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-base shadow-sm">
                                    <i class="fa-solid fa-trophy"></i>
                                </div>
                                <div>
                                    <h4 class="text-xs font-bold uppercase tracking-wider text-white">Highest Screen Time App This Week</h4>
                                    <span class="text-[10px] text-slate-400 block">Single highest consumption across all linked devices</span>
                                </div>
                            </div>
                            <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase">
                                #1 Weekly
                            </span>
                        </div>

                        <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-lg">
                                    <i class="fa-solid fa-code" id="st-weekly-top-app-icon"></i>
                                </div>
                                <div>
                                    <div class="text-sm font-black text-white" id="st-weekly-top-app-name">Visual Studio Code</div>
                                    <div class="text-[10px] text-slate-400" id="st-weekly-top-app-cat">Productive Focus (IDE) • 36% of weekly total</div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-base sm:text-lg font-black font-mono text-cyan-300" id="st-weekly-top-app-time">14h 25m</div>
                                <span class="text-[9px] font-mono text-emerald-400 font-bold">Top Focus Asset</span>
                            </div>
                        </div>

                        <!-- TOP 3 APPS MINI LEADERBOARD -->
                        <div class="space-y-2 pt-1 text-xs">
                            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Weekly Top Usage Leaderboard</div>
                            <div id="st-weekly-apps-leaderboard" class="space-y-1.5">
                                <!-- Populated dynamically by ArcScreenTimeStore -->
                            </div>
                        </div>
                    </div>

                    <!-- SUB-4 HOUR WEEKLY DISCIPLINE CHALLENGE & BADGE STATUS -->
                    <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/30 border border-slate-800 space-y-3 flex flex-col justify-between">
                        <div class="space-y-3">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <div class="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 text-base shadow-sm">
                                        <i class="fa-solid fa-shield-heart"></i>
                                    </div>
                                    <div>
                                        <h4 class="text-xs font-bold uppercase tracking-wider text-white">Sub-4hr Weekly Discipline Achievement</h4>
                                        <span class="text-[10px] text-slate-400 block">Stay below 4 hours combined every day for 7 days</span>
                                    </div>
                                </div>
                                <span id="st-sub4-badge-pill" class="text-[9px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase">
                                    ✓ ACHIEVED
                                </span>
                            </div>

                            <p class="text-xs text-slate-300 leading-relaxed">
                                Maintaining combined screen time below 4 hours for an entire week unlocks the prestigious <b class="text-purple-300">Digital Ascetic</b> achievement in your Milestones Badge Matrix!
                            </p>

                            <!-- 7-DAY SUB-4HR DOT MATRIX -->
                            <div class="space-y-1.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                                <div class="flex items-center justify-between text-[11px] font-mono">
                                    <span class="text-slate-400 font-bold">Past 7 Consecutive Days (&lt;4h goal):</span>
                                    <span id="st-sub4-counter-text" class="text-emerald-400 font-bold">7 / 7 Days Under 4h</span>
                                </div>
                                <div class="grid grid-cols-7 gap-1.5 pt-1" id="st-sub4-days-matrix">
                                    <!-- Populated dynamically -->
                                </div>
                            </div>
                        </div>

                        <div class="pt-2 flex items-center justify-between gap-2 flex-wrap">
                            <span class="text-[11px] text-slate-400 font-mono">
                                Achievement: <b class="text-white">Digital Ascetic</b>
                            </span>
                            <button type="button" onclick="switchTab('progression'); if(window.switchBadgeFilter)window.switchBadgeFilter('core'); playSfx('click')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5">
                                View in Badges Section <i class="fa-solid fa-arrow-right text-[10px]"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ==========================================================================
                 PHONE APPLICATION HOMESCREEN WIDGETS (SCREEN TIME USAGE & FOCUS CONTROLLER)
                 Modeled precisely after Android Homescreen Widgets as shown in user image
                 ========================================================================== -->
            <!-- ==========================================================================
                 INBUILT MOBILE & HOMESCREEN WIDGETS
                 ========================================================================== -->
            <div id="st-inbuilt-widgets-banner" class="glass-card rounded-2xl p-4 sm:p-5 border border-purple-500/25 bg-gradient-to-r from-purple-950/20 via-slate-900/60 to-indigo-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg transition-all duration-300">
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 text-lg shrink-0 mt-0.5 shadow-sm">
                        <i class="fa-solid fa-shapes"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 flex-wrap">
                            <h3 class="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                                Inbuilt Mobile &amp; Homescreen Widgets
                            </h3>
                            <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-semibold flex items-center gap-1 shadow-sm">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live Sync Active
                            </span>
                        </div>
                        <p class="text-xs text-slate-300 mt-0.5">
                            Real-time Screen Time Spent, 1-Click Focus Mode, and Daily Habit Check-In widgets for your phone homescreen.
                        </p>
                    </div>
                </div>

                <div class="flex items-center gap-2 flex-wrap">
                    <button role="button" onclick="ArcPhoneWidgets.openSimulator(); playSfx('modalOpen')" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/30 transition active:scale-95" title="Open Phone Homescreen & Interactive Inbuilt Widgets">
                        <i class="fa-solid fa-mobile-screen-button text-cyan-300"></i> Open Phone Widgets
                    </button>
                    <button role="button" onclick="ArcPhoneWidgets.refresh(); playSfx('click')" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5" title="Refresh widget telemetry">
                        <i class="fa-solid fa-arrows-rotate text-purple-400"></i> Refresh
                    </button>
                </div>
            </div>

            <!-- FOCUS & POMODORO LOCKOUT CONTROLLER BANNER -->
            <div id="st-focus-controller-card" class="glass-card rounded-2xl p-4 sm:p-5 border border-purple-500/30 bg-purple-950/15 space-y-3 transition-all duration-300">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 text-lg shrink-0 mt-0.5">
                            <i class="fa-solid fa-moon"></i>
                        </div>
                        <div>
                            <div class="flex items-center gap-2 flex-wrap">
                                <h3 class="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                                    Focus Mode &amp; Pomodoro App Blocker
                                </h3>
                                <span id="st-focus-status-pill" class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono font-bold">
                                    IDLE
                                </span>
                            </div>
                            <p class="text-xs text-slate-300 mt-0.5" id="st-focus-desc-text">
                                During active Focus sessions and Pomodoros, all chosen distracting apps and YouTube feeds are immediately locked.
                            </p>
                        </div>
                    </div>

                    <div class="flex items-center gap-2 flex-wrap" id="st-focus-actions-container">
                        <button role="button" onclick="startFocusSession(25); playSfx('click')" class="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md shadow-purple-600/30 flex items-center gap-1.5">
                            <i class="fa-solid fa-play"></i> Start 25m Focus
                        </button>
                        <button role="button" onclick="startFocusSession(50); playSfx('click')" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 font-bold text-xs transition">
                            50m Block
                        </button>
                        <button role="button" onclick="openFocusBlocklistModal(); playSfx('modalOpen')" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs transition flex items-center gap-1">
                            <i class="fa-solid fa-sliders"></i> Customize Apps
                        </button>
                    </div>
                </div>
            </div>

            <!-- ACCESSIBILITY PERMISSION NOTICE BANNER -->
            <div id="st-permission-banner" class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                <div class="flex items-start space-x-3">
                    <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-base shrink-0 mt-0.5">
                        <i class="fa-solid fa-shield-halved"></i>
                    </div>
                    <div>
                        <h4 class="text-xs sm:text-sm font-bold text-white">Accessibility &amp; App Tracking Permissions</h4>
                        <p class="text-[11px] sm:text-xs text-amber-200/80">
                            Granting accessibility enables active window monitoring across apps and triggers the lockout shield the moment an app's daily quota expires or during Focus time.
                        </p>
                    </div>
                </div>
                <button role="button" onclick="openAccessibilityModal(); playSfx('modalOpen')" class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition shrink-0 shadow-md">
                    Enable Permissions
                </button>
            </div>

            <!-- ACTIVE APP FOCUS TRACKER & QUICK LAUNCH BAR -->
            <div class="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h3 class="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                            <i class="fa-solid fa-crosshairs text-cyan-400"></i> Active App Live Monitor
                        </h3>
                    </div>

                    <div id="st-active-app-status-container" class="flex items-center gap-2">
                        <span class="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 font-mono text-xs flex items-center gap-1.5 self-start sm:self-auto">
                            <span class="w-2 h-2 rounded-full bg-slate-500"></span> Standby / Standalone
                        </span>
                    </div>
                </div>
            </div>

            <!-- TRACKED APPS DIRECTORY & LIMITS -->
            <div class="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-800 space-y-4">
                <!-- FILTER & SEARCH BAR -->
                <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <!-- CATEGORY TABS -->
                    <div id="st-category-tabs" class="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 overflow-x-auto text-xs font-semibold">
                        <button role="button" onclick="setAppFilter('all'); playSfx('click')" class="st-filter-btn px-3 py-1.5 rounded-lg transition shrink-0 bg-cyan-500 text-black font-bold shadow-sm" data-filter="all">All Apps</button>
                        <button role="button" onclick="setAppFilter('focus-blocked'); playSfx('click')" id="st-filter-focus-tab" class="st-filter-btn px-3 py-1.5 rounded-lg transition shrink-0 text-slate-400 hover:text-white" data-filter="focus-blocked">Focus Blocked</button>
                        <button role="button" onclick="setAppFilter('social'); playSfx('click')" class="st-filter-btn px-3 py-1.5 rounded-lg transition shrink-0 text-slate-400 hover:text-white" data-filter="social">Social</button>
                        <button role="button" onclick="setAppFilter('entertainment'); playSfx('click')" class="st-filter-btn px-3 py-1.5 rounded-lg transition shrink-0 text-slate-400 hover:text-white" data-filter="entertainment">Entertainment</button>
                        <button role="button" onclick="setAppFilter('productivity'); playSfx('click')" class="st-filter-btn px-3 py-1.5 rounded-lg transition shrink-0 text-slate-400 hover:text-white" data-filter="productivity">Productivity</button>
                        <button role="button" onclick="setAppFilter('gaming'); playSfx('click')" class="st-filter-btn px-3 py-1.5 rounded-lg transition shrink-0 text-slate-400 hover:text-white" data-filter="gaming">Gaming</button>
                        <button role="button" onclick="setAppFilter('blocked'); playSfx('click')" id="st-filter-blocked-tab" class="st-filter-btn px-3 py-1.5 rounded-lg transition shrink-0 text-slate-400 hover:text-white" data-filter="blocked">Daily Blocked (0)</button>
                    </div>

                    <!-- SEARCH INPUT -->
                    <div class="relative w-full sm:w-64">
                        <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                        <input type="text" id="st-app-search-input" placeholder="Search applications..." oninput="setAppSearch(this.value)" class="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition">
                    </div>
                </div>

                <!-- APP CARDS GRID -->
                <div id="st-apps-grid" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
                    <!-- Populated dynamically by renderScreenTimeView -->
                </div>
            </div>
        </section>`;
}
