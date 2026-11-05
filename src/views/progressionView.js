export function renderProgressionView() {
  return `<section id="view-progression" class="hidden space-y-6 tab-view-enter pb-24 md:pb-8">
            <!-- Header Banner -->
            <div class="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-l-amber-400 shadow-xl">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-mono font-bold uppercase tracking-widest">
                            MASTER HUB
                        </span>
                        <span class="text-[10px] text-slate-400 font-mono">Leveling • Experience • Codex</span>
                    </div>
                    <h2 class="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                        <i class="fa-solid fa-crown text-amber-400"></i> Ascension &amp; Knowledge Base
                    </h2>
                    <p class="text-xs text-slate-300 max-w-xl">
                        Monitor your character class, level progression, and attribute development, or explore scientific protocols and arc strategy guides.
                    </p>
                </div>
                
                <!-- Sub-tab switcher -->
                <div class="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 self-stretch sm:self-auto shadow-inner" role="tablist" aria-label="Ascension Subtabs">
                    <button type="button" id="subtab-btn-rpg" role="tab" aria-selected="true" onclick="switchProgressionSubtab('rpg')" class="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                        <i class="fa-solid fa-shield-halved"></i>
                        <span>Character &amp; Combat</span>
                    </button>
                    <button type="button" id="subtab-btn-kb" role="tab" aria-selected="false" onclick="switchProgressionSubtab('kb')" class="flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                        <i class="fa-solid fa-book-bookmark"></i>
                        <span>Knowledge Base (KB)</span>
                    </button>
                </div>
            </div>

            <!-- SUB-TAB 1: CHARACTER & COMBAT MASTERY -->
            <div id="progression-subtab-rpg" class="space-y-6">
                <div id="progression-rpg-container" class="space-y-6"></div>
            </div>

            <!-- SUB-TAB 2: KNOWLEDGE BASE & CODEX -->
            <div id="progression-subtab-kb" class="hidden space-y-6">
                <div id="progression-kb-container" class="space-y-6"></div>
            </div>
        </section>`;
}
