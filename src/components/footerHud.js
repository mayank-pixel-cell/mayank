export function renderFooterHud() {
  return `<!-- SMARTPHONE BOTTOM NAVIGATION BAR -->
    <!-- SMARTPHONE BOTTOM NAVIGATION BAR (ADAPTS ACROSS ALL ANDROID MODELS: 320px to 440px+) -->
    <nav role="tablist" aria-label="Mobile Bottom Navigation" class="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-slate-800/90 bg-slate-950/95 backdrop-blur-xl px-1 sm:px-2.5 pt-1 pb-[max(0.5rem,calc(0.35rem+env(safe-area-inset-bottom,0px))] flex items-center justify-between gap-0.5 sm:gap-1 shadow-2xl select-none">
        <button id="mobile-tab-tracker" role="tab" aria-selected="true" aria-controls="view-tracker" onclick="switchTab('tracker')" class="flex-1 min-w-0 py-1 px-0.5 sm:px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-200 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)] font-bold active:scale-95 select-none touch-manipulation min-h-[46px]">
            <div class="relative flex items-center justify-center">
                <i class="fa-solid fa-list-check text-sm sm:text-base"></i>
                <span class="mobile-active-dot absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,1)]"></span>
            </div>
            <span class="text-[8.5px] sm:text-[9.5px] tracking-tight mt-0.5 truncate w-full text-center">Tracker</span>
        </button>
        <button id="mobile-tab-screentime" role="tab" aria-selected="false" aria-controls="view-screentime" onclick="switchTab('screentime')" class="flex-1 min-w-0 py-1 px-0.5 sm:px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-200 text-slate-400 hover:text-slate-200 border border-transparent font-medium active:scale-95 select-none touch-manipulation min-h-[46px]">
            <div class="relative flex items-center justify-center">
                <i class="fa-solid fa-hourglass-half text-sm sm:text-base"></i>
                <span class="mobile-active-dot hidden absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,1)]"></span>
            </div>
            <span class="text-[8.5px] sm:text-[9.5px] tracking-tight mt-0.5 truncate w-full text-center"><span class="sm:hidden">Screen</span><span class="hidden sm:inline">Screen Time</span></span>
        </button>
        <button id="mobile-tab-rules" role="tab" aria-selected="false" aria-controls="view-rules" onclick="switchTab('rules')" class="flex-1 min-w-0 py-1 px-0.5 sm:px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-200 text-slate-400 hover:text-slate-200 border border-transparent font-medium active:scale-95 select-none touch-manipulation min-h-[46px]">
            <div class="relative flex items-center justify-center">
                <i class="fa-solid fa-shield-halved text-sm sm:text-base"></i>
                <span class="mobile-active-dot hidden absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,1)]"></span>
            </div>
            <span class="text-[8.5px] sm:text-[9.5px] tracking-tight mt-0.5 truncate w-full text-center">Rules</span>
        </button>
        <button id="mobile-tab-progression" role="tab" aria-selected="false" aria-controls="view-progression" onclick="switchTab('progression')" class="flex-1 min-w-0 py-1 px-0.5 sm:px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-200 text-slate-400 hover:text-slate-200 border border-transparent font-medium active:scale-95 select-none touch-manipulation min-h-[46px]">
            <div class="relative flex items-center justify-center">
                <i class="fa-solid fa-crown text-sm sm:text-base"></i>
                <span class="mobile-active-dot hidden absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_6px_rgba(234,179,8,1)]"></span>
            </div>
            <span class="text-[8.5px] sm:text-[9.5px] tracking-tight mt-0.5 truncate w-full text-center"><span class="sm:hidden">Level</span><span class="hidden sm:inline">Level/KB</span></span>
        </button>
        <button id="mobile-tab-results" role="tab" aria-selected="false" aria-controls="view-results" onclick="switchTab('results')" class="flex-1 min-w-0 py-1 px-0.5 sm:px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-200 text-slate-400 hover:text-slate-200 border border-transparent font-medium active:scale-95 select-none touch-manipulation min-h-[46px]">
            <div class="relative flex items-center justify-center">
                <i class="fa-solid fa-diagram-project text-sm sm:text-base"></i>
                <span class="mobile-active-dot hidden absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,1)]"></span>
            </div>
            <span class="text-[8.5px] sm:text-[9.5px] tracking-tight mt-0.5 truncate w-full text-center">Results</span>
        </button>
        <button id="mobile-tab-settings" aria-label="Settings &amp; Controls" role="tab" aria-selected="false" aria-controls="view-settings" onclick="switchTab('settings')" class="flex-1 min-w-0 py-1 px-0.5 sm:px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-200 text-slate-400 hover:text-slate-200 border border-transparent font-medium active:scale-95 select-none touch-manipulation min-h-[46px]">
            <div class="relative flex items-center justify-center">
                <i class="fa-solid fa-gear text-sm sm:text-base"></i>
                <span class="mobile-active-dot hidden absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-pink-400 shadow-[0_0_6px_rgba(236,72,153,1)]"></span>
            </div>
            <span class="text-[8.5px] sm:text-[9.5px] tracking-tight mt-0.5 truncate w-full text-center">Settings</span>
        </button>
    </nav>

    <footer class="glass-card border-t border-slate-800/80 py-3 px-4 text-center text-[10px] sm:text-xs text-slate-500 relative">
        <p id="footer-text">Winter Arc Lock-In Tracker • October 1 to December 31 • Transform in silence. • <a href="./privacy-policy.html" target="_blank" rel="noopener" class="text-slate-400 hover:text-cyan-400 underline transition">Privacy Policy</a></p>
        <!-- HIDDEN QUANTUM MICRO-NODE GLYPH (1 of 7 Easter Eggs) -->
        <div id="arc-quantum-dot" role="button" tabindex="0" onclick="toggleCyberdeckTerminal(true)" title="[⌘ CLASSIFIED TELEMETRY ACCESS]" class="absolute right-3.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400/30 hover:bg-cyan-400 active:scale-125 transition-all duration-300 cursor-pointer shadow-[0_0_8px_rgba(0,240,255,0.4)] hover:shadow-[0_0_16px_rgba(0,240,255,1)] opacity-40 hover:opacity-100 animate-pulse"></div>
    </footer>

    <!-- PERMANENT FLOATING LIVE SCREEN TIME HUD PILL -->
    <div id="arc-screentime-hud" class="hidden md:block fixed md:bottom-6 left-3 sm:left-6 z-40 select-none transition-all duration-300">
        <!-- Floating Pill Trigger -->
        <div id="arc-hud-pill" onclick="ArcScreenTimeNotifier.toggleHudCard()" class="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/95 border border-cyan-500/40 hover:border-cyan-400 text-white shadow-2xl backdrop-blur-xl transition hover:scale-105 active:scale-95 group touch-manipulation">
            <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span class="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider group-hover:text-cyan-300 flex items-center gap-1">
                <i class="fa-solid fa-clock text-cyan-400"></i>
                <span class="hidden sm:inline">SCREEN TIME:</span>
            </span>
            <span id="arc-hud-timer" class="font-mono font-black text-xs sm:text-sm text-cyan-300 tracking-wider">00h 00m 00s</span>
            <i id="arc-hud-caret" class="fa-solid fa-chevron-up text-[10px] text-slate-400 transition-transform"></i>
        </div>

        <!-- Expandable Quick Control Popup -->
        <div id="arc-hud-card" class="hidden absolute bottom-11 left-0 max-w-[calc(100vw-1.5rem)] w-72 sm:w-80 p-4 rounded-2xl bg-slate-950/95 border border-cyan-500/30 shadow-2xl backdrop-blur-2xl space-y-3 mb-2">
            <div class="flex items-center justify-between pb-2 border-b border-slate-800">
                <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs">
                        <i class="fa-solid fa-hourglass-half"></i>
                    </div>
                    <span class="font-extrabold text-xs text-white">Live Screen Time Monitor</span>
                </div>
                <button type="button" onclick="ArcScreenTimeNotifier.toggleHudCard(false)" class="text-slate-400 hover:text-white text-xs p-1">✕</button>
            </div>

            <div class="space-y-1.5 text-xs font-mono">
                <div class="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span class="text-slate-400 flex items-center gap-1.5"><i class="fa-solid fa-laptop text-cyan-400"></i> Laptop / PC</span>
                    <strong id="arc-hud-pc-time" class="text-white">00h 00m</strong>
                </div>
                <div class="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span class="text-slate-400 flex items-center gap-1.5"><i class="fa-solid fa-mobile-screen text-purple-400"></i> Mobile Tracker</span>
                    <strong id="arc-hud-mob-time" class="text-white">00h 00m</strong>
                </div>
                <div class="flex items-center justify-between p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
                    <span class="text-cyan-300 flex items-center gap-1.5 font-bold"><i class="fa-solid fa-shield-halved"></i> Dopamine Shield</span>
                    <strong id="arc-hud-shield-score" class="text-emerald-400">100%</strong>
                </div>
            </div>

            <div class="flex gap-2 pt-1">
                <button type="button" onclick="toggleLaptopTracker()" class="flex-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition">
                    <i class="fa-solid fa-pause"></i>
                    <span id="arc-hud-pause-btn">Pause</span>
                </button>
                <button type="button" onclick="switchTab('screentime'); ArcScreenTimeNotifier.toggleHudCard(false)" class="flex-1 py-1.5 px-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition shadow-sm">
                    <i class="fa-solid fa-chart-pie"></i>
                    <span>Matrix View</span>
                </button>
            </div>

            <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span class="text-slate-400">OS Notification Tray:</span>
                <button type="button" onclick="ArcScreenTimeNotifier.toggle()" class="text-cyan-400 hover:text-cyan-300 font-semibold underline" id="arc-hud-notif-link">
                    Enable
                </button>
            </div>
        </div>
    </div>


    <!-- EXPANDABLE NOTIFICATIONS & UPDATES FLYOUT DRAWER (Anchored to Header Bell Icon) -->
    <div id="arc-notifications-drawer" class="hidden fixed top-16 right-3 sm:right-6 md:right-8 max-w-[calc(100vw-1.5rem)] w-84 sm:w-96 p-4 rounded-2xl bg-slate-950/98 border border-cyan-500/40 shadow-[0_16px_50px_rgba(0,0,0,0.85),0_0_35px_rgba(0,240,255,0.25)] backdrop-blur-2xl space-y-3 z-50 select-text" role="region" aria-label="Notifications Center">
        <!-- Drawer Header -->
        <div class="flex items-center justify-between pb-2 border-b border-slate-800">
            <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs">
                    <i class="fa-solid fa-bell"></i>
                </div>
                <span class="font-extrabold text-xs text-white">Notifications &amp; Updates</span>
                <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">v2.6.0</span>
            </div>
            <div class="flex items-center gap-1.5">
                <button type="button" onclick="ArcNotifications.checkForUpdates(true)" class="arc-check-updates-btn text-slate-400 hover:text-cyan-300 text-xs p-1 rounded-lg hover:bg-slate-900 transition" title="Check for updates">
                    <i class="fa-solid fa-arrows-rotate"></i>
                </button>
                <button type="button" onclick="ArcNotifications.toggleDrawer(false)" class="text-slate-400 hover:text-white text-xs p-1 rounded-lg hover:bg-slate-900 transition" title="Close (Esc)">✕</button>
            </div>
        </div>

        <!-- Quick OS Push Status & Fast Actions -->
        <div class="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px]">
            <div class="flex items-center gap-1.5 font-mono" id="arc-notif-os-status">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span class="text-slate-300">Push Alerts</span>
            </div>
            <button type="button" id="arc-notif-os-btn" onclick="ArcNotifications.toggleOsNotifications()" class="text-cyan-400 hover:text-cyan-300 font-semibold underline">
                Enable
            </button>
        </div>

        <!-- Filter Pills: All, Releases, System, Unread -->
        <div class="flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-[10px] font-bold">
            <button type="button" onclick="ArcNotifications.setFilter('all')" id="drawer-filter-all" class="flex-1 py-1 px-1.5 rounded-lg text-center transition bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                All (<span id="drawer-count-all">0</span>)
            </button>
            <button type="button" onclick="ArcNotifications.setFilter('update')" id="drawer-filter-update" class="flex-1 py-1 px-1.5 rounded-lg text-center text-slate-400 hover:text-slate-200 transition font-medium">
                Releases (<span id="drawer-count-update">0</span>)
            </button>
            <button type="button" onclick="ArcNotifications.setFilter('system')" id="drawer-filter-system" class="flex-1 py-1 px-1.5 rounded-lg text-center text-slate-400 hover:text-slate-200 transition font-medium">
                System (<span id="drawer-count-system">0</span>)
            </button>
            <button type="button" onclick="ArcNotifications.setFilter('unread')" id="drawer-filter-unread" class="flex-1 py-1 px-1.5 rounded-lg text-center text-slate-400 hover:text-slate-200 transition font-medium">
                Unread (<span id="drawer-count-unread">0</span>)
            </button>
        </div>

        <!-- Action Buttons: Check Updates & Test Alert -->
        <div class="flex gap-2">
            <button type="button" onclick="ArcNotifications.checkForUpdates(true)" class="arc-check-updates-btn flex-1 py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition">
                <i class="fa-solid fa-arrows-rotate text-[10px]"></i>
                <span>Check Updates</span>
            </button>
            <button type="button" onclick="ArcNotifications.testUpdateNotification()" class="flex-1 py-1.5 px-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition shadow-sm">
                <i class="fa-solid fa-bolt text-[10px]"></i>
                <span>Test Alert</span>
            </button>
        </div>

        <!-- Drawer Notifications Scroll Feed -->
        <div id="arc-notif-drawer-list" class="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scroll">
            <!-- Dynamically generated items -->
        </div>

        <!-- Drawer Footer -->
        <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <button type="button" onclick="ArcNotifications.clearRead()" class="text-slate-400 hover:text-slate-200 flex items-center gap-1">
                <i class="fa-regular fa-trash-can text-[10px]"></i>
                <span>Clear Read</span>
            </button>
            <button type="button" onclick="ArcNotifications.markAllAsRead()" class="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1">
                <i class="fa-solid fa-check-double text-[10px]"></i>
                <span>Mark All Read</span>
            </button>
        </div>
    </div>

    <!-- TOAST NOTIFICATION -->
    <div id="toast" class="fixed bottom-24 sm:bottom-20 right-4 sm:right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none glass-card px-3.5 py-2.5 rounded-xl border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-2 shadow-2xl max-w-[90vw]">
        <i class="fa-solid fa-circle-check text-cyan-400" id="toast-icon"></i>
        <span id="toast-message">Notification message</span>
    </div>

    <!-- EASTER EGG 1: MATRIX DIGITAL RAIN FULLSCREEN OVERLAY -->`;
}
