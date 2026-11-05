export function renderHeaderNav() {
  return `<!-- SUBTLE NOISE OVERLAY LAYER -->
    <div class="bg-noise"></div>

    <!-- CUSTOM BACKGROUND WALLPAPER LAYER (ARC GOLD EXCLUSIVE) -->
    <div id="arc-custom-bg" class="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-cover bg-center bg-no-repeat transition-all duration-500">
        <div id="arc-custom-bg-overlay" class="absolute inset-0 bg-slate-950/45 transition-colors duration-300"></div>
        <div id="arc-custom-bg-quote" class="absolute bottom-6 left-1/2 -translate-x-1/2 max-w-[92vw] pointer-events-none opacity-0 transition-all duration-500 hidden z-10">
            <div class="arc-sparkle-quote-pill px-3 py-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.7)] border-amber-400/40">
                <span class="arc-sparkle-star text-[10px]">✦</span>
                <span id="arc-custom-bg-quote-text" class="arc-sparkle-text text-[11px] sm:text-xs font-extrabold max-w-[80vw]"></span>
                <span class="arc-sparkle-star arc-sparkle-star-delay text-[10px]">✧</span>
            </div>
        </div>
    </div>

    <!-- FX CANVAS FOR PARTICLE SNOW / EMBERS & CONFETTI -->
    <canvas id="fx-canvas"></canvas>

    <div id="bg-glow-container" class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div id="bg-glow-1" class="absolute -top-32 -left-32 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl transition-colors duration-700 animate-pulse"></div>
        <div id="bg-glow-2" class="absolute top-1/2 -right-32 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl transition-colors duration-700 animate-pulse"></div>
    </div>

    <!-- HEADER (OPTIMIZED FOR MOBILE) -->
    <header class="arc-safe-header sticky top-0 z-40 glass-card border-b border-slate-800/80 px-3 py-2.5 sm:px-6 sm:py-3.5 transition-all duration-300">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <div class="flex items-center space-x-2.5">
                <div role="button" tabindex="0" aria-label="Arc logo icon" id="arc-logo-icon" onmouseenter="playSfx('hover')" class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-black font-black text-lg sm:text-xl shadow-lg shadow-cyan-500/30 active:scale-95 transition-transform duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" onclick="handleLogoIconClick(event)">
                    <i id="arc-icon-symbol" class="fa-solid fa-snowflake text-white"></i>
                </div>
                <div>
                    <h1 id="arc-main-title" class="font-black text-sm sm:text-lg tracking-wide bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent flex items-center">
                        WINTER ARC <span id="arc-year-badge" class="text-[9px] sm:text-xs px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 ml-1 font-semibold">2026</span>
                    </h1>
                    <p id="arc-subtitle" class="text-[10px] sm:text-xs text-slate-400 hidden sm:block">Oct 1 - Dec 31 • Transform in Silence</p>
                </div>
            </div>

            <!-- DESKTOP TOP NAV (PRIMARY NAVIGATION - ALWAYS VISIBLE, NEVER CUT OFF) -->
            <nav role="tablist" aria-label="Desktop Navigation" class="hidden md:flex items-center space-x-1.5 bg-slate-900/95 p-1 rounded-2xl border border-slate-800/90 shadow-inner shrink-0 backdrop-blur-md">
                <button id="tab-tracker" role="tab" aria-selected="true" aria-controls="view-tracker" onmouseenter="playSfx('hover')" onclick="switchTab('tracker')" class="px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
                    <i class="fa-solid fa-list-check text-slate-950"></i>
                    <span>Tracker</span>
                </button>
                <button id="tab-screentime" role="tab" aria-selected="false" aria-controls="view-screentime" onmouseenter="playSfx('hover')" onclick="switchTab('screentime')" class="px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-purple-300 hover:bg-purple-500/10 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 flex items-center space-x-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400">
                    <i class="fa-solid fa-hourglass-half text-purple-400"></i>
                    <span>Screen Time</span>
                </button>
                <button id="tab-rules" role="tab" aria-selected="false" aria-controls="view-rules" onmouseenter="playSfx('hover')" onclick="switchTab('rules')" class="px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 flex items-center space-x-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                    <i class="fa-solid fa-shield-halved text-amber-400"></i>
                    <span>Rules</span>
                </button>
                <button id="tab-progression" role="tab" aria-selected="false" aria-controls="view-progression" onmouseenter="playSfx('hover')" onclick="switchTab('progression')" class="px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-yellow-300 hover:bg-yellow-500/10 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 flex items-center space-x-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400">
                    <i class="fa-solid fa-crown text-yellow-400"></i>
                    <span>Level/KB</span>
                </button>
                <button id="tab-results" role="tab" aria-selected="false" aria-controls="view-results" onmouseenter="playSfx('hover')" onclick="switchTab('results')" class="px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 flex items-center space-x-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                    <i class="fa-solid fa-diagram-project text-cyan-400"></i>
                    <span>Results</span>
                </button>
                <button id="tab-settings" title="Settings &amp; Controls" role="tab" aria-selected="false" aria-controls="view-settings" onmouseenter="playSfx('hover')" onclick="switchTab('settings')" class="px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-pink-300 hover:bg-pink-500/10 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 flex items-center space-x-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400">
                    <i class="fa-solid fa-gear text-pink-400"></i>
                    <span>Settings</span>
                </button>
            </nav>

            <!-- ACTION BUTTONS -->
            <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <!-- Offline Status Pill (Revealed when network is disconnected) -->
                <div id="arc-offline-indicator" class="hidden px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold flex items-center gap-1.5 shadow-sm" title="Arc Tracker is running in 100% Offline Mode. All habits, screen time, and rank telemetry are persisted to local storage.">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    <span class="hidden sm:inline">OFFLINE MODE</span>
                    <span class="sm:hidden">OFFLINE</span>
                </div>

                <!-- Dedicated Notifications & System Updates Bell Icon -->
                <button type="button" id="btn-header-notifications" onclick="ArcNotifications.toggleDrawer(); if(window.playSfx)playSfx('click')" class="relative w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-400/60 text-slate-300 hover:text-cyan-300 grid place-items-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 shrink-0" title="Notifications &amp; System Updates (Press N)" aria-label="Notifications &amp; Updates" aria-expanded="false" aria-controls="arc-notifications-drawer">
                    <i id="arc-notif-bell-icon" class="fa-solid fa-bell text-sm transition-transform duration-200 group-hover:rotate-12"></i>
                    <!-- Dynamic Live Ping Dot -->
                    <span id="header-notif-ping" class="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500 border border-slate-950"></span>
                    </span>
                    <!-- Dynamic Unread Count Badge -->
                    <span id="header-notif-badge" class="hidden absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black font-mono text-[9px] flex items-center justify-center border border-slate-950 shadow-sm leading-none">1</span>
                </button>

                <!-- User Profile Capsule (Compact PFP Only) -->
                <div role="button" tabindex="0" id="header-profile-pill" onclick="ArcProfile.openSetupModal()" class="cursor-pointer relative p-0.5 rounded-full bg-slate-900 border-2 border-cyan-400/50 hover:border-cyan-300 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 shrink-0" title="Customize Operative Profile & Handle">
                    <div id="header-avatar-circle" class="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500/20 to-indigo-500/30 text-cyan-300 font-bold border border-cyan-400/40 grid place-items-center text-xs overflow-hidden shrink-0 shadow-inner">O</div>
                    <span id="header-profile-status-dot" class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-sm" title="Connected"></span>
                    <span id="header-profile-name" class="sr-only">Operative</span>
                    <span id="header-profile-user" class="sr-only">@operative</span>
                </div>


                <!-- Black & White Mode Toggle (Arc Gold VIP) -->
                <button role="button" id="btn-header-bw" onclick="if(window.ArcBlackWhiteMode)ArcBlackWhiteMode.toggle()" class="w-9 h-9 sm:w-auto px-0 sm:px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" title="Toggle Black & White Mode (Alt+B • Arc Gold VIP)">
                    <i id="header-bw-icon" class="fa-solid fa-circle-half-stroke text-xs"></i>
                    <span class="hidden xl:inline text-[11px]">B&amp;W</span>
                    <span class="hidden xl:inline text-[9px] font-black font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">GOLD</span>
                </button>

                <!-- Discretion / Stealth Mode Toggle (Anti-Snoop Panic Switch) -->
                <button role="button" id="btn-header-discretion" onclick="if(window.ArcSecurity)ArcSecurity.toggleDiscretionMode()" class="w-9 h-9 sm:w-auto px-0 sm:px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" title="Toggle Discretion / Stealth Mode (Alt+S)">
                    <i id="header-discretion-icon" class="fa-solid fa-eye-slash text-xs"></i>
                    <span class="hidden xl:inline text-[11px]">Stealth</span>
                </button>

                <!-- Share Tracker Button -->
                <button role="button" id="btn-share-tracker" onclick="ArcShare.openShareModal()" class="w-9 h-9 sm:w-auto px-0 sm:px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" title="Share your Arc Tracker progress">
                    <i class="fa-solid fa-share-nodes text-xs"></i>
                    <span class="hidden xl:inline">Share</span>
                </button>

                <span id="btn-audio-toggle" class="hidden" aria-hidden="true"><i id="audio-icon"></i></span>
            </div>
        </div>
    </header>`;
}
