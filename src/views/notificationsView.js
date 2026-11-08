export function renderNotificationsView() {
  return `<section id="view-notifications" class="hidden space-y-4 sm:space-y-6 tab-view-enter pb-32 md:pb-24" aria-label="Notifications & Updates Hub">
            <!-- HERO BANNER -->
            <div class="glass-card rounded-2xl p-4 sm:p-6 border-l-4 border-l-cyan-400 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/30 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300">
                <div class="space-y-1.5 max-w-2xl">
                    <div class="flex items-center gap-2">
                        <span class="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400 text-[10px] sm:text-xs font-black uppercase tracking-wider">
                            <i class="fa-solid fa-bell mr-1"></i> Notification Center
                        </span>
                        <span class="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">v2.6.0 Stable</span>
                    </div>
                    <h2 class="text-lg sm:text-2xl font-black text-white">System Updates & Live Alert Feed</h2>
                    <p class="text-xs text-slate-300">Stay informed on new features, system performance releases, dopamine lockouts, and sync telemetry.</p>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                    <button role="button" onclick="ArcNotifications.checkForUpdates(true)" class="arc-check-updates-btn px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm">
                        <i class="fa-solid fa-arrows-rotate text-xs"></i>
                        <span>Check for Updates</span>
                    </button>
                    <button role="button" onclick="if(window.ArcUpdateEngine)ArcUpdateEngine.simulateUpdate(); else ArcNotifications.simulateUpdate?.(); if(window.playSfx)playSfx('click')" class="px-3 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm" title="Simulate a new update arrival to test notifications, top banner, and the startup update modal">
                        <i class="fa-solid fa-vial text-xs"></i>
                        <span>Test Update Alert</span>
                    </button>
                    <button role="button" onclick="ArcNotifications.markAllAsRead()" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm" title="Mark all notifications as read">
                        <i class="fa-solid fa-check-double text-xs"></i>
                        <span>Mark All Read</span>
                    </button>
                </div>
            </div>

            <!-- STATS CARDS -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div class="glass-card glass-card-hover rounded-2xl p-3.5 sm:p-5 border-l-4 border-l-cyan-400">
                    <div class="text-slate-400 text-[10px] sm:text-xs uppercase tracking-wider font-semibold">Current Version</div>
                    <div class="text-lg sm:text-2xl font-black text-white font-mono mt-1">v2.6.0</div>
                    <div class="text-[10px] text-cyan-400 mt-0.5">Installed Engine</div>
                </div>
                <div class="glass-card glass-card-hover rounded-2xl p-3.5 sm:p-5 border-l-4 border-l-amber-400">
                    <div class="text-slate-400 text-[10px] sm:text-xs uppercase tracking-wider font-semibold">Unread Alerts</div>
                    <div id="filter-count-unread" class="text-lg sm:text-2xl font-black text-amber-300 font-mono mt-1">0</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">Requiring Attention</div>
                </div>
                <div class="glass-card glass-card-hover rounded-2xl p-3.5 sm:p-5 border-l-4 border-l-emerald-400">
                    <div class="text-slate-400 text-[10px] sm:text-xs uppercase tracking-wider font-semibold">Update Detection</div>
                    <div class="text-lg sm:text-2xl font-black text-emerald-400 font-mono mt-1">ACTIVE</div>
                    <div class="text-[10px] text-slate-400 mt-0.5">Live GitHub &amp; Startup Check</div>
                </div>
                <div class="glass-card glass-card-hover rounded-2xl p-3.5 sm:p-5 border-l-4 border-l-purple-400">
                    <div class="text-slate-400 text-[10px] sm:text-xs uppercase tracking-wider font-semibold">OS Push Alerts</div>
                    <div id="arc-notif-full-os-stat" class="text-xs sm:text-sm font-bold text-purple-300 font-mono mt-1 flex items-center gap-1.5">
                        <button type="button" onclick="ArcNotifications.toggleOsNotifications()" class="text-xs text-cyan-400 hover:underline">Toggle Tray Alerts</button>
                    </div>
                    <div class="text-[10px] text-slate-400 mt-0.5">System Tray Sync</div>
                </div>
            </div>

            <!-- FILTER BAR & FEED CONTAINER -->
            <div class="glass-card rounded-2xl p-4 sm:p-6 border border-slate-800 space-y-4">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <!-- Filters -->
                    <div class="flex items-center gap-1.5 flex-wrap">
                        <button type="button" onclick="ArcNotifications.setFilter('all')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm">
                            All (<span id="filter-count-all">0</span>)
                        </button>
                        <button type="button" onclick="ArcNotifications.setFilter('update')" class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
                            Releases (<span id="filter-count-update">0</span>)
                        </button>
                        <button type="button" onclick="ArcNotifications.setFilter('system')" class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
                            System (<span id="filter-count-system">0</span>)
                        </button>
                        <button type="button" onclick="ArcNotifications.setFilter('unread')" class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
                            Unread
                        </button>
                    </div>

                    <div class="flex items-center gap-2">
                        <button type="button" onclick="ArcNotifications.clearRead()" class="text-xs text-slate-400 hover:text-rose-400 transition flex items-center gap-1">
                            <i class="fa-solid fa-trash-can text-[11px]"></i>
                            <span>Clear Read</span>
                        </button>
                    </div>
                </div>

                <!-- NOTIFICATIONS LIST -->
                <div id="arc-notif-full-list" class="space-y-3">
                    <!-- Dynamic notification items populated by ArcNotifications.renderUi() -->
                </div>
            </div>
        </section>`;
}
