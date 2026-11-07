/**
 * Arc Tracker - App Update Modal & Sticky Top Banner Component
 * Displays prominent update alerts upon app launch and on-demand
 */

export function renderUpdateModal() {
  return `<!-- APP UPDATE AVAILABLE MODAL -->
    <div id="arc-update-modal" class="pp-modal" role="dialog" aria-modal="true" aria-labelledby="arc-update-modal-title">
        <div class="relative w-full max-w-lg p-5 sm:p-6 rounded-2xl bg-slate-950/98 border border-cyan-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(0,240,255,0.2)] backdrop-blur-2xl space-y-4 text-left select-text max-h-[92vh] overflow-y-auto custom-scroll">
            <!-- Modal Header -->
            <div class="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-lg shadow-inner shrink-0">
                        <i class="fa-solid fa-rocket animate-pulse"></i>
                    </div>
                    <div class="min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400 text-[10px] font-black uppercase tracking-wider">
                                NEW UPDATE READY
                            </span>
                            <span id="arc-update-badge-date" class="text-[10px] font-mono text-slate-400">Just arrived</span>
                        </div>
                        <h3 id="arc-update-modal-title" class="text-base sm:text-lg font-black text-white mt-0.5 truncate">
                            New Update Available!
                        </h3>
                    </div>
                </div>
                <button type="button" onclick="ArcUpdateEngine.closeUpdateModal(); if(window.playSfx)playSfx('click')" class="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition text-sm shrink-0" title="Close (Esc)">
                    ✕
                </button>
            </div>

            <!-- Version Comparison Ribbon -->
            <div class="p-3 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/30 border border-slate-800/80 flex items-center justify-between gap-3">
                <div>
                    <div class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Current Version</div>
                    <div id="arc-update-cur-ver" class="font-mono text-xs font-bold text-slate-300 mt-0.5">v2.6.0</div>
                </div>
                <div class="flex items-center gap-1.5 text-cyan-400">
                    <i class="fa-solid fa-arrow-right text-xs"></i>
                </div>
                <div class="text-right">
                    <div class="text-[10px] uppercase tracking-wider text-cyan-400 font-bold">New Version</div>
                    <div id="arc-update-new-ver" class="font-mono text-sm font-black text-cyan-300 mt-0.5 animate-pulse">v2.7.0</div>
                </div>
            </div>

            <!-- Release Title & Platform Notice -->
            <div class="space-y-0.5">
                <h4 id="arc-update-release-name" class="text-xs sm:text-sm font-bold text-white leading-snug">Arc Tracker Release</h4>
                <p id="arc-update-platform-hint" class="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <i class="fa-solid fa-circle-check text-emerald-400 text-[10px]"></i>
                    <span>Optimized package ready for your system.</span>
                </p>
            </div>

            <!-- Changelog & Highlights -->
            <div class="space-y-1.5">
                <div class="flex items-center justify-between text-[11px] font-bold text-slate-300">
                    <span class="flex items-center gap-1.5">
                        <i class="fa-solid fa-sparkles text-amber-400"></i>
                        <span>What's New in This Release:</span>
                    </span>
                    <span class="text-[10px] text-slate-400 font-mono">Changelog</span>
                </div>
                <div id="arc-update-changelog-box" class="p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 max-h-44 overflow-y-auto space-y-1.5 text-xs text-slate-300 custom-scroll select-text font-sans">
                    <!-- Dynamic bullet items inserted by ArcUpdateEngine -->
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="pt-2 border-t border-slate-800 space-y-2">
                <button id="arc-update-download-btn" type="button" onclick="ArcUpdateEngine.downloadUpdate()" class="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-cyan-500/20 active:scale-95 transition flex items-center justify-center gap-2">
                    <i class="fa-solid fa-download"></i>
                    <span id="arc-update-btn-label">Download &amp; Install Update</span>
                </button>

                <div class="flex items-center gap-2">
                    <button type="button" onclick="ArcUpdateEngine.openReleaseNotes()" class="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition">
                        <i class="fa-brands fa-github text-xs"></i>
                        <span>View on GitHub</span>
                    </button>
                    <button type="button" onclick="ArcUpdateEngine.remindLater(); if(window.playSfx)playSfx('click')" class="py-2 px-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition">
                        Remind Later
                    </button>
                </div>
            </div>
        </div>
    </div>`;
}

export function renderUpdateTopBanner() {
  return `<!-- TOP STICKY APP UPDATE BANNER -->
    <div id="arc-update-top-banner" class="hidden relative z-30 bg-gradient-to-r from-cyan-950/95 via-slate-900/95 to-indigo-950/95 border-b border-cyan-500/30 px-3 py-2 text-xs text-white shadow-md backdrop-blur-md">
        <div class="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div class="flex items-center gap-2 min-w-0">
                <span class="flex h-2 w-2 relative shrink-0">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <p class="truncate text-[11px] sm:text-xs">
                    <span class="font-bold text-cyan-300">New Update Available!</span>
                    <span class="text-slate-300 hidden sm:inline"> Arc Tracker </span>
                    <span id="arc-banner-new-ver" class="font-mono font-bold text-white">v...</span>
                    <span class="text-slate-400 hidden md:inline"> is ready to install with fresh features &amp; optimizations.</span>
                </p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
                <button type="button" onclick="ArcUpdateEngine.showUpdateModal(); if(window.playSfx)playSfx('click')" class="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 font-bold text-[11px] transition flex items-center gap-1 shadow-sm">
                    <span>Update Now</span>
                    <i class="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
                <button type="button" onclick="ArcUpdateEngine.dismissBanner(); if(window.playSfx)playSfx('click')" class="text-slate-400 hover:text-white p-1 text-xs" title="Dismiss banner">
                    ✕
                </button>
            </div>
        </div>
    </div>`;
}
