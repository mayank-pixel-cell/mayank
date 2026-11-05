export function renderShowcaseEasterModals() {
  return `<div id="matrix-rain-overlay" class="fixed inset-0 z-[100] hidden bg-black/95 select-none backdrop-blur-sm transition-opacity duration-300 flex flex-col items-center justify-between p-4 sm:p-8">
        <canvas id="matrix-canvas" class="absolute inset-0 w-full h-full pointer-events-none"></canvas>
        <div class="relative z-10 w-full max-w-2xl mx-auto flex items-center justify-between bg-black/75 border border-emerald-500/50 rounded-2xl px-4 py-2.5 backdrop-blur-md shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <div class="flex items-center gap-2.5 text-emerald-400 font-mono text-xs sm:text-sm">
                <i class="fa-solid fa-terminal animate-pulse"></i>
                <span class="font-bold tracking-wider">[ MATRIX ARCHITECT PROTOCOL v26 ]</span>
            </div>
            <button role="button" onclick="toggleMatrixRain(false)" class="px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-bold transition flex items-center gap-1.5 focus:outline-none">
                <span>Exit (ESC)</span>
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
        <div class="relative z-10 text-center space-y-2 pointer-events-none max-w-lg bg-black/80 p-4 sm:p-6 rounded-3xl border border-emerald-500/30 backdrop-blur-md shadow-2xl">
            <p class="text-xs sm:text-sm font-mono text-emerald-300 tracking-wide animate-pulse">"There is no spoon... only daily discipline in the dark."</p>
            <p class="text-[10px] font-mono text-emerald-500/80">Type 'exit' or press ESC to return to reality.</p>
        </div>
        <div class="relative z-10 text-[10px] font-mono text-emerald-600">ARC OPERATIVE KERNEL 0x7F · ALL HABITS MONITORED</div>
    </div>

    <!-- CREATE SQUAD MODAL -->
    <div id="arc-create-squad-modal" class="fixed inset-0 z-50 hidden bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 transition-opacity duration-200" role="dialog" aria-modal="true" aria-label="Create Operative Squad">
        <div class="w-full max-w-md bg-slate-950/98 border-2 border-amber-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center text-xs">
                        <i class="fa-solid fa-shield-halved"></i>
                    </div>
                    <div>
                        <h3 class="font-black text-sm text-white">Create Operative Squad</h3>
                        <p class="text-[10px] text-slate-400">Found a new discipline unit &amp; recruit operatives</p>
                    </div>
                </div>
                <button type="button" onclick="ArcLeaderboardGroups.closeCreateSquadModal()" class="text-slate-400 hover:text-white text-xs p-1 rounded-lg hover:bg-slate-900 transition">✕</button>
            </div>

            <form onsubmit="ArcLeaderboardGroups.handleCreateSquad(event)" class="space-y-3">
                <div>
                    <label class="block text-[11px] font-bold text-slate-300 mb-1">Squad Name</label>
                    <input id="new-squad-name" type="text" required maxlength="32" placeholder="e.g. Shadow Monks Syndicate" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none placeholder:text-slate-600">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-slate-300 mb-1">Squad Motto / Covenant</label>
                    <input id="new-squad-motto" type="text" required maxlength="64" placeholder="e.g. Silence and absolute discipline in the dark." class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none placeholder:text-slate-600">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-slate-300 mb-1">Core Focus Pillar</label>
                    <select id="new-squad-category" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none">
                        <option value="All Pillars">All Pillars (Holistic Discipline)</option>
                        <option value="Physical">Physical (Fitness &amp; Strength)</option>
                        <option value="Mindset">Mindset (Mental Clarity &amp; Reading)</option>
                        <option value="Productivity">Productivity (Deep Work &amp; Focus)</option>
                        <option value="Discipline">Discipline (Dopamine Shield &amp; Sleep)</option>
                    </select>
                </div>
                <div class="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
                    <i class="fa-solid fa-infinity text-xs"></i>
                    <span><strong>Unlimited Capacity:</strong> Groups have no member limit. Unlimited operatives can join.</span>
                </div>
                <div class="pt-2 flex items-center justify-end gap-2">
                    <button type="button" onclick="ArcLeaderboardGroups.closeCreateSquadModal()" class="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition">Cancel</button>
                    <button type="submit" class="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black transition shadow-sm">Create &amp; Lead</button>
                </div>
            </form>
        </div>
    </div>

    <!-- EASTER EGG 2: CYBERDECK MINI-TERMINAL HUD MODAL -->
    <div id="cyberdeck-terminal-modal" class="fixed inset-0 z-[95] hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 transition-opacity duration-200">
        <div class="w-full max-w-2xl bg-slate-950/95 border-2 border-cyan-500/60 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.35)] flex flex-col max-h-[85vh]">
            <!-- Terminal Titlebar -->
            <div class="bg-slate-900/90 px-4 py-3 border-b border-cyan-500/30 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
                    <span class="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                    <span class="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                    <span class="ml-2 font-mono text-xs font-bold text-cyan-400 tracking-wide">[ ARC CYBERDECK v2026 // RESTRICTED TERMINAL ]</span>
                </div>
                <button role="button" onclick="toggleCyberdeckTerminal(false)" class="text-slate-400 hover:text-white transition text-sm p-1" aria-label="Close Terminal" title="Close Terminal"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <!-- Terminal Output Log -->
            <div id="cyberdeck-output" class="p-4 overflow-y-auto flex-1 font-mono text-xs sm:text-sm text-emerald-400 space-y-1 bg-black/90 min-h-[260px] max-h-[420px] select-text">
                <div class="text-cyan-400 font-bold">========================================================</div>
                <div class="text-cyan-300 font-black">ARC DISCIPLINE TELEMETRY TERMINAL [SECURITY LEVEL: S]</div>
                <div class="text-slate-400 text-xs">Connected to Local Habit Database. Type <span class="text-amber-400 font-bold">'help'</span> for authorized command codes.</div>
                <div class="text-cyan-400 font-bold">========================================================</div>
            </div>
            <!-- Terminal Input Prompt -->
            <div class="bg-slate-900/95 px-4 py-3 border-t border-cyan-500/30 flex items-center gap-2">
                <span class="font-mono text-cyan-400 font-bold text-sm">arc:user&gt;</span>
                <input type="text" id="cyberdeck-input" placeholder="Type a command (e.g., 'help', 'spider', 'matrix')..." autocomplete="off" spellcheck="false" class="flex-1 bg-transparent border-none outline-none font-mono text-xs sm:text-sm text-cyan-200 placeholder:text-slate-600 focus:ring-0">
                <button role="button" onclick="executeCyberdeckCommand()" class="px-3 py-1 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition">EXEC</button>
            </div>
        </div>
    </div>

    <!-- EASTER EGG 3: SACRED GEOMETRY MANDALA OVERLAY (7-CLICK LOGO SECRET) -->
    <div id="mandala-easter-egg-modal" class="fixed inset-0 z-[90] hidden bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 transition-all duration-500" onclick="closeMandalaEasterEgg()">
        <div class="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center pointer-events-none">
            <!-- Outer Mandala Rings -->
            <div class="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/60 shadow-[0_0_40px_rgba(0,240,255,0.6)] mandala-ring-1"></div>
            <div class="absolute inset-4 rounded-full border border-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.5)] mandala-ring-2"></div>
            <div class="absolute inset-10 rounded-full border-2 border-dotted border-purple-400/60 shadow-[0_0_30px_rgba(168,85,247,0.5)] mandala-ring-3"></div>
            <div class="absolute inset-16 rounded-full border border-emerald-400/60 mandala-ring-4"></div>
            <!-- Sacred Geometry Center Core -->
            <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-600 to-amber-500 flex flex-col items-center justify-center text-white shadow-[0_0_60px_rgba(0,240,255,0.9)] animate-pulse">
                <i class="fa-solid fa-infinity text-2xl sm:text-3xl"></i>
                <span class="text-[9px] font-black uppercase tracking-widest mt-1">THE SEAL</span>
            </div>
        </div>
        <div class="text-center mt-6 space-y-2 max-w-md bg-slate-950/80 p-5 rounded-2xl border border-cyan-500/40 backdrop-blur-md shadow-2xl pointer-events-auto">
            <h3 class="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-300 to-purple-400">THE ARCHITECT'S SEAL UNLOCKED</h3>
            <p class="text-xs text-slate-300">You discovered the hidden resonance of the Arc. 7 sacred keystones have harmonized.</p>
            <button role="button" onclick="closeMandalaEasterEgg()" class="mt-3 px-4 py-1.5 rounded-xl bg-cyan-500 text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg hover:bg-cyan-400">Seal Accepted</button>
        </div>
    </div>

    <!-- ARC TRANSITION CONFIRMATION MODAL -->
    <div id="arc-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" class="fixed inset-0 z-50 hidden bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <div class="glass-card max-w-md w-full rounded-3xl p-5 sm:p-6 space-y-4 border border-slate-700 relative animate-bounce-short">
            <button role="button" onclick="closeArcModal(); playSfx('modalClose')" class="absolute top-4 right-4 text-slate-400 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" aria-label="Close Modal"><i class="fa-solid fa-xmark text-lg"></i></button>
            <div class="text-center space-y-2">
                <div id="modal-arc-icon-box" class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-xl border border-amber-500/30">
                    <i id="modal-arc-icon" class="fa-solid fa-sun"></i>
                </div>
                <h3 id="modal-title" class="text-lg sm:text-xl font-extrabold text-white">Transition to Summer Arc</h3>
                <p id="modal-desc" class="text-xs text-slate-300 leading-relaxed">
                    Ready to bring your gains into the sun? Transitioning launches your personal <strong>Summer Arc Showcase Presentation</strong>, displaying your top productive days, pie charts, daily reflections, and habits!
                </p>
            </div>

            <div class="space-y-2 text-xs bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-slate-300">
                <div class="flex items-center justify-between"><span class="flex items-center gap-1.5"><i class="fa-solid fa-check text-emerald-400"></i> Preserves Focus & Screen Time</span><strong id="modal-stat-time" class="text-white">0h 0m</strong></div>
                <div class="flex items-center justify-between"><span class="flex items-center gap-1.5"><i class="fa-solid fa-check text-emerald-400"></i> Maintains Custom Habits</span><strong id="modal-stat-habits" class="text-white">0 Rules</strong></div>
                <div class="flex items-center justify-between"><span class="flex items-center gap-1.5"><i class="fa-solid fa-check text-emerald-400"></i> Carries Lock-In Streak</span><strong id="modal-stat-streak" class="text-white">0 Days</strong></div>
            </div>

            <div class="flex gap-2">
                <button role="button" onclick="confirmAndLaunchSummerShowcase()" id="btn-confirm-arc-transition" class="flex-1 py-2.5 sm:py-3 rounded-xl bg-amber-500 active:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                    Launch Showcase & Transition
                </button>
                <button role="button" onclick="closeArcModal(); playSfx('modalClose')" class="px-4 py-2.5 sm:py-3 rounded-xl bg-slate-800 active:bg-slate-700 text-slate-300 font-bold text-xs transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                    Cancel
                </button>
            </div>
        </div>
    </div>

    <!-- SUMMER ARC SHOWCASE FULL-SCREEN OVERLAY (WITH PIE CHARTS, TOP PRODUCTIVE DAY & REFLECTIONS) -->
    <div id="summer-showcase-overlay" role="dialog" aria-modal="true" aria-labelledby="showcase-step-label" class="fixed inset-0 hidden flex flex-col justify-between p-4 sm:p-8 transition-all duration-300 overflow-y-auto">
        <!-- Showcase Top Navigation Bar -->
        <div class="max-w-3xl mx-auto w-full flex items-center justify-between pt-2 pb-4">
            <div class="flex items-center space-x-2">
                <span class="w-3 h-3 rounded-full bg-amber-400 animate-ping"></span>
                <span class="text-xs sm:text-sm font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                    <i class="fa-solid fa-sun text-amber-400"></i> Summer Arc Effort Showcase
                </span>
            </div>

            <div class="flex items-center space-x-3">
                <button role="button" id="btn-showcase-autoplay" onclick="toggleShowcaseAutoplay()" class="px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                    <i id="showcase-autoplay-icon" class="fa-solid fa-play text-xs"></i>
                    <span id="showcase-autoplay-text">Auto Play</span>
                </button>
                <button role="button" onclick="closeSummerShowcase()" class="p-1.5 text-slate-400 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" aria-label="Close Showcase Overlay">
                    <i class="fa-solid fa-xmark text-xl"></i>
                </button>
            </div>
        </div>

        <!-- Showcase Slide Indicator Progress Bar -->
        <div class="max-w-3xl mx-auto w-full space-y-1">
            <div class="flex justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <span id="showcase-step-label">Effort 1 of 8</span>
                <span id="showcase-pct-label">0% Complete</span>
            </div>
            <div class="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                <div id="showcase-top-progress-bar" class="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-300 transition-all duration-300 w-0"></div>
            </div>
        </div>

        <!-- Showcase Main Interactive Slide Container -->
        <div class="max-w-2xl mx-auto w-full my-auto py-6 relative">
            <!-- Animated solar elements: rotating solar flares, corona shimmer and pulsing golden radial gradients -->
            <div class="showcase-solar-backdrop pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-visible" aria-hidden="true">
                <div class="solar-pulse-core"></div>
                <div class="solar-flare-corona"></div>
                <div class="solar-flare-counter"></div>
                <div class="solar-orbital-ring"></div>
            </div>

            <div id="showcase-slide-card" class="glass-card rounded-3xl p-6 sm:p-10 border-2 border-amber-500/60 glow-amber text-center space-y-6 showcase-card-slide relative overflow-hidden">
                <!-- Slide content rendered dynamically via JavaScript -->
            </div>
        </div>

        <!-- Showcase Bottom Controls -->
        <div class="max-w-3xl mx-auto w-full flex items-center justify-between pb-2">
            <button role="button" id="btn-showcase-prev" onclick="prevShowcaseSlide()" class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                <i class="fa-solid fa-arrow-left"></i> Previous
            </button>

            <!-- Dots visual indicator -->
            <div id="showcase-dots-container" class="flex items-center space-x-1.5 max-w-[180px] overflow-x-auto px-2"></div>

            <button role="button" id="btn-showcase-next" onclick="nextShowcaseSlide()" class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                <span>Next</span> <i class="fa-solid fa-arrow-right"></i>
            </button>
        </div>
    </div>`;
}
