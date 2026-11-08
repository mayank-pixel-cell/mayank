export function renderRulesView() {
  return `<section id="view-rules" class="hidden space-y-4 sm:space-y-6 tab-view-enter pb-32 md:pb-24">
            <div class="glass-card rounded-2xl p-4 sm:p-6">
                <h2 id="blueprint-title" class="text-lg sm:text-xl font-extrabold text-white mb-1 flex items-center gap-2">
                    <i class="fa-solid fa-shield-halved text-cyan-400"></i> Winter Arc Master Blueprint
                </h2>
                <p class="text-xs text-slate-400">Manage the pillars that define your transformation over these 90 days.</p>
            </div>

            <!-- EDIT HABIT LIST & CUSTOM HABIT CREATOR -->
            <section id="p20-habit-manager" class="glass-card rounded-2xl p-4 border-l-4 border-l-emerald-400" aria-label="Edit habit list">
                <h3 class="font-extrabold text-sm text-white flex items-center gap-2">
                    <i class="fa-solid fa-list-check text-emerald-400"></i> Edit habit list
                </h3>
                <p class="text-[11px] text-slate-400 mt-1 mb-3">Add, rename, reorder, reweight or delete at any time. Past check-ins are never erased; past scores use the current weights.</p>
                <div id="p20-hm" class="space-y-2"></div>
            </section>

            <!-- STREAK FREEZE RULE & MISSED DAY PROTECTION -->
            <section id="rules-streak-freeze-card" class="glass-card rounded-2xl p-4 sm:p-5 border-l-4 border-l-cyan-400 space-y-3" aria-label="Streak Freeze Rule">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-lg shrink-0 shadow-inner">
                            <i class="fa-solid fa-snowflake"></i>
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h3 class="font-extrabold text-sm sm:text-base text-white">Streak Freeze Rule</h3>
                                <span id="rules-freeze-badge" class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">OFF</span>
                            </div>
                            <p class="text-xs text-slate-300 mt-0.5">Protect your hard-earned streak against unexpected life events or rest days.</p>
                        </div>
                    </div>

                    <!-- Toggle Switch -->
                    <label class="flex items-center gap-2.5 cursor-pointer select-none bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800 hover:border-slate-700 transition active:scale-95 shadow-sm">
                        <span class="text-xs font-semibold text-slate-200">Free Miss Protection</span>
                        <input type="checkbox" id="rules-freeze-toggle" onchange="toggleStreakFreezeFromRules(this.checked)" class="accent-cyan-400 rounded w-4 h-4 cursor-pointer">
                    </label>
                </div>

                <!-- Status & Rule Explanation -->
                <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div class="flex items-center gap-2 text-slate-300">
                        <i class="fa-solid fa-shield-heart text-cyan-400"></i>
                        <span>Allowance: <b class="text-cyan-300">1 forgiven missed day</b> per calendar month.</span>
                    </div>
                    <div id="rules-freeze-status" class="text-[11px] font-mono text-slate-400">
                        Off. A missed day resets your streak to 0.
                    </div>
                </div>
            </section>

            <div id="rules-pillar-grid" class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"></div>
        </section>`;
}
