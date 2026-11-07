export function renderBlockerModals() {
  return `<div id="arc-app-blocker-overlay" class="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl hidden items-center justify-center p-4 overflow-y-auto">
            <div class="relative w-full max-w-lg bg-gradient-to-b from-slate-950 via-slate-900 to-black border-2 border-rose-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(244,63,94,0.35)] space-y-6 text-center animate-zoom-in my-auto">
                <!-- PULSING LOCK ICON -->
                <div class="relative mx-auto w-20 h-20 rounded-3xl bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
                    <span class="absolute inset-0 rounded-3xl border border-rose-400 animate-ping opacity-30"></span>
                    <i id="blocker-app-icon" class="fa-solid fa-lock text-3xl sm:text-4xl text-rose-500"></i>
                </div>

                <div class="space-y-1.5">
                    <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-mono font-black uppercase tracking-widest">
                        <span class="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                        DAILY APP LIMIT EXCEEDED
                    </div>
                    <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        <span id="blocker-app-name">Application</span> is Blocked
                    </h2>
                    <p class="text-xs sm:text-sm text-slate-300">
                        You have used your allocated daily time limit. Arc Tracker has blocked this application to safeguard your discipline.
                    </p>
                </div>

                <!-- STATS BREAKDOWN -->
                <div class="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <div>
                        <span class="text-[10px] uppercase font-bold text-slate-400 block">Total Used Today</span>
                        <div id="blocker-time-used" class="text-lg font-black font-mono text-rose-400">0m 00s</div>
                    </div>
                    <div>
                        <span class="text-[10px] uppercase font-bold text-slate-400 block">Daily Limit Chosen</span>
                        <div id="blocker-time-limit" class="text-lg font-black font-mono text-slate-200">0m 00s</div>
                    </div>
                </div>

                <!-- RESET TIMER -->
                <div class="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/20 space-y-1">
                    <span class="text-[10px] font-bold text-rose-300 uppercase tracking-wider block">Automatic Lockout Resets In:</span>
                    <div id="blocker-reset-countdown" class="text-2xl sm:text-3xl font-black font-mono text-rose-400">00h 00m 00s</div>
                    <span class="text-[9px] text-slate-400 block">Unlocks automatically at midnight (00:00:00)</span>
                </div>

                <!-- MOTIVATIONAL QUOTE -->
                <blockquote class="text-xs italic text-slate-400 border-l-2 border-rose-500/40 pl-3 text-left">
                    "Discipline is choosing between what you want now and what you want most. Stay locked in."
                </blockquote>

                <!-- ANTI-IMPULSE EMERGENCY EXTENSION -->
                <div id="blocker-challenge-box" class="space-y-2 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left">
                    <label class="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                        <span>Emergency 5-Minute Extension</span>
                        <span class="text-[9px] text-rose-400 font-mono">Requires Pledge</span>
                    </label>
                    <p class="text-[10px] text-slate-400">To prevent impulsive overrides, type <strong class="text-rose-400 font-mono">UNBREAKABLE</strong> below:</p>
                    <div class="flex gap-2">
                        <input type="text" id="blocker-challenge-input" placeholder="Type UNBREAKABLE" class="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-rose-400 flex-1">
                        <button role="button" onclick="submitEmergencyExtension()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/40 font-bold text-xs transition">
                            Override
                        </button>
                    </div>
                    <div id="blocker-challenge-error" class="text-[10px] text-rose-400 font-semibold hidden"></div>
                </div>

                <!-- RETURN TO ARC TRACKER -->
                <button role="button" onclick="closeBlockerShield(); switchTab('tracker');" class="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-black font-black text-sm uppercase tracking-wider transition shadow-lg shadow-cyan-500/25 hover:scale-[1.02]">
                    Return to Focus Dashboard
                </button>
            </div>
        </div>

        <!-- ACCESSIBILITY PERMISSIONS MODAL -->
        <div id="arc-accessibility-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden items-center justify-center p-4 overflow-y-auto">
            <div class="relative w-full max-w-xl bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-zoom-in my-auto">
                <div class="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 text-lg">
                            <i class="fa-solid fa-universal-access"></i>
                        </div>
                        <div>
                            <h3 class="text-base sm:text-lg font-black text-white">Accessibility &amp; App Tracking Permissions</h3>
                            <p class="text-xs text-slate-400">Enables automated active window telemetry and lockout shield</p>
                        </div>
                    </div>
                    <button role="button" onclick="closeAccessibilityModal()" aria-label="Close Accessibility Modal" title="Close Accessibility Modal" class="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div class="space-y-3 text-xs text-slate-300">
                    <div class="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 space-y-1.5">
                        <h4 class="font-bold text-white flex items-center gap-1.5">
                            <i class="fa-solid fa-lock text-cyan-400"></i> Why is this permission required?
                        </h4>
                        <p class="text-slate-300 text-[11px] leading-relaxed">
                            Operating systems isolate applications for privacy. To accurately track how many minutes you spend inside specific applications (like YouTube, Instagram, Games, or Browsers) and block them when your limit is reached, Arc Tracker requests local on-device Accessibility &amp; Usage Access.
                        </p>
                        <div class="text-[10px] text-cyan-300 font-mono pt-1">
                            ✓ 100% Offline &amp; Private • Zero cloud telemetry • Data never leaves your device
                        </div>
                    </div>

                    <div class="space-y-2">
                        <h4 class="font-bold text-white uppercase text-[11px] tracking-wider">Device Instructions:</h4>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                                <span class="font-bold text-cyan-300 flex items-center gap-1">
                                    <i class="fa-brands fa-android"></i> Android Phones / Tablets
                                </span>
                                <p class="text-slate-400 text-[10px]">Enable Accessibility Service &amp; Usage Access in Settings so Arc Tracker can monitor other apps.</p>
                                <div class="flex gap-1.5 pt-1">
                                    <button role="button" onclick="openAndroidAccessibilitySettings()" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold">
                                        Accessibility
                                    </button>
                                    <button role="button" onclick="openAndroidUsageSettings()" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold">
                                        Usage Access
                                    </button>
                                </div>
                            </div>

                            <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                                <span class="font-bold text-cyan-300 flex items-center gap-1">
                                    <i class="fa-brands fa-windows"></i> Windows &amp; Laptops
                                </span>
                                <p class="text-slate-400 text-[10px]">Permit Background Window Monitoring &amp; Notifications so Arc Tracker can enforce boundaries.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <button role="button" onclick="closeAccessibilityModal()" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition">
                        Cancel
                    </button>
                    <button role="button" onclick="confirmAccessibilityGranted()" class="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20">
                        Grant &amp; Confirm Permission
                    </button>
                </div>
            </div>
        </div>

        <!-- APP LIMIT PICKER MODAL -->
        <div id="arc-limit-config-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden items-center justify-center p-4 overflow-y-auto">
            <div class="relative w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-5 animate-zoom-in my-auto">
                <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 id="limit-modal-title" class="text-base font-black text-white">Set Daily App Limit</h3>
                    <button role="button" onclick="closeLimitModal()" aria-label="Close Limit Modal" title="Close Limit Modal" class="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div class="space-y-4">
                    <!-- QUICK PRESET BUTTONS -->
                    <div class="space-y-1.5">
                        <label class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Presets</label>
                        <div class="grid grid-cols-4 gap-2 text-xs font-semibold">
                            <button role="button" onclick="setPresetLimit(15)" class="py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-black transition">15m</button>
                            <button role="button" onclick="setPresetLimit(30)" class="py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-black transition">30m</button>
                            <button role="button" onclick="setPresetLimit(45)" class="py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-black transition">45m</button>
                            <button role="button" onclick="setPresetLimit(60)" class="py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-black transition">1h</button>
                            <button role="button" onclick="setPresetLimit(90)" class="py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-black transition">1.5h</button>
                            <button role="button" onclick="setPresetLimit(120)" class="py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-black transition">2h</button>
                            <button role="button" onclick="setPresetLimit(180)" class="py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-black transition">3h</button>
                            <button role="button" onclick="setPresetLimit(240)" class="py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-black transition">4h</button>
                        </div>
                    </div>

                    <!-- CUSTOM MINUTES INPUT -->
                    <div class="space-y-1.5">
                        <label for="limit-modal-mins-input" class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Custom Limit (Minutes)</label>
                        <div class="flex items-center gap-2">
                            <input type="number" id="limit-modal-mins-input" min="1" max="1440" value="30" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm font-mono text-cyan-400 font-bold focus:outline-none focus:border-cyan-400">
                            <span class="text-xs text-slate-400 font-bold">Minutes</span>
                        </div>
                    </div>

                    <!-- HARD BLOCK TOGGLE -->
                    <div class="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div>
                            <span class="text-xs font-bold text-white block">Enforce Hard Lockout</span>
                            <span class="text-[10px] text-slate-400 block">Blocks app when limit is reached</span>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="limit-modal-block-toggle" aria-label="Enforce Hard Lockout" title="Enforce Hard Lockout" checked class="sr-only peer">
                            <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                        </label>
                    </div>
                </div>

                <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button role="button" onclick="closeLimitModal()" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition">
                        Cancel
                    </button>
                    <button role="button" onclick="saveAppLimitFromModal()" class="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition shadow-md shadow-cyan-500/20">
                        Save Limit
                    </button>
                </div>
            </div>
        </div>

        <!-- ADD CUSTOM APP MODAL -->
        <div id="arc-add-app-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden items-center justify-center p-4 overflow-y-auto">
            <div class="relative w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4 animate-zoom-in my-auto">
                <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 class="text-base font-black text-white">Add Custom App to Track</h3>
                    <button role="button" onclick="closeAddCustomAppModal()" aria-label="Close Add Custom App Modal" title="Close Add Custom App Modal" class="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div class="space-y-3 text-xs">
                    <div class="space-y-1">
                        <label for="add-app-name" class="font-bold text-slate-300">App Name</label>
                        <input type="text" id="add-app-name" placeholder="e.g. Minecraft, Telegram, Roblox, Spotify" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400">
                    </div>

                    <div class="grid grid-cols-2 gap-2">
                        <div class="space-y-1">
                            <label for="add-app-category" class="font-bold text-slate-300">Category</label>
                            <select id="add-app-category" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-300 focus:outline-none focus:border-cyan-400">
                                <option value="Social Media">Social Media</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Gaming">Gaming</option>
                                <option value="Productivity">Productivity</option>
                                <option value="Messaging">Messaging</option>
                                <option value="Browsing">Browsing</option>
                            </select>
                        </div>

                        <div class="space-y-1">
                            <label for="add-app-limit" class="font-bold text-slate-300">Daily Limit (Mins)</label>
                            <input type="number" id="add-app-limit" value="30" min="1" max="1440" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-cyan-400 font-mono font-bold focus:outline-none focus:border-cyan-400">
                        </div>
                    </div>

                    <div class="space-y-1">
                        <label for="add-app-proc" class="font-bold text-slate-300">Process Name or Domain (Optional)</label>
                        <input type="text" id="add-app-proc" placeholder="e.g. spotify.exe or telegram.org" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-cyan-400">
                    </div>
                </div>

                <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button role="button" onclick="closeAddCustomAppModal()" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition">
                        Cancel
                    </button>
                    <button role="button" onclick="saveCustomApp()" class="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition shadow-md shadow-cyan-500/20">
                        Add App
                    </button>
                </div>
            </div>
        </div>
    
        <!-- FOCUS / POMODORO LOCKOUT SHIELD OVERLAY -->
        <div id="arc-focus-blocker-overlay" class="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl hidden items-center justify-center p-4 overflow-y-auto">
            <div class="relative w-full max-w-lg bg-gradient-to-b from-slate-950 via-purple-950/60 to-black border-2 border-purple-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(168,85,247,0.35)] space-y-6 text-center animate-zoom-in my-auto">
                <div class="relative mx-auto w-20 h-20 rounded-3xl bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <span class="absolute inset-0 rounded-3xl border border-purple-400 animate-ping opacity-30"></span>
                    <i id="focus-blocker-app-icon" class="fa-solid fa-moon text-3xl sm:text-4xl text-purple-400"></i>
                </div>

                <div class="space-y-1.5">
                    <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-black uppercase tracking-widest">
                        <span class="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping"></span>
                        FOCUS &amp; POMODORO SESSION ACTIVE
                    </div>
                    <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        <span id="focus-blocker-app-name">Application</span> is Blocked
                    </h2>
                    <p class="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        This application is locked to preserve your deep work sprint. Distractions are forbidden until your Focus timer expires.
                    </p>
                </div>

                <!-- FOCUS TIMER STATUS -->
                <div class="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-1">
                    <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Focus Time Remaining</span>
                    <div id="focus-blocker-time-left" class="text-2xl sm:text-3xl font-black font-mono text-purple-300">25:00</div>
                    <span class="text-[10px] text-purple-400/80 font-medium block">Stay in the zone. Finish the sprint first.</span>
                </div>

                <!-- ACTIONS -->
                <div class="space-y-2 pt-1">
                    <button role="button" onclick="closeFocusBlockerShield(); switchTab('tracker');" class="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-sm uppercase tracking-wider transition shadow-lg shadow-purple-500/25 hover:scale-[1.02]">
                        <i class="fa-solid fa-arrow-left mr-1.5"></i> Return to Focus Session
                    </button>
                </div>
            </div>
        </div>

        <!-- YOUTUBE DISTRACTION FILTER SHIELD OVERLAY -->
        <div id="arc-youtube-blocker-overlay" class="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl hidden items-center justify-center p-4 overflow-y-auto">
            <div class="relative w-full max-w-lg bg-gradient-to-b from-slate-950 via-red-950/60 to-black border-2 border-red-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(239,68,68,0.35)] space-y-6 text-center animate-zoom-in my-auto">
                <div class="relative mx-auto w-20 h-20 rounded-3xl bg-red-500/20 border-2 border-red-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                    <span class="absolute inset-0 rounded-3xl border border-red-400 animate-ping opacity-30"></span>
                    <i class="fa-brands fa-youtube text-3xl sm:text-4xl text-red-500"></i>
                </div>

                <div class="space-y-1.5">
                    <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-mono font-black uppercase tracking-widest">
                        <span class="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                        DISTRACTING CHANNEL RESTRICTED
                    </div>
                    <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        <span id="yt-blocker-channel-name">Channel</span> is Blocked
                    </h2>
                    <p class="text-xs sm:text-sm text-slate-300 leading-relaxed" id="yt-blocker-reason-text">
                        This creator is classified as high-dopamine distraction. Educational tutorials and technical lectures remain fully accessible.
                    </p>
                </div>

                <!-- RECOMMENDED ALTERNATIVES -->
                <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2">
                    <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Approved High-Leverage Creators:</span>
                    <div class="flex flex-wrap gap-1.5 text-[11px] font-mono">
                        <span class="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">@freecodecamp</span>
                        <span class="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">@hubermanlab</span>
                        <span class="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">@3blue1brown</span>
                        <span class="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">@fireship</span>
                    </div>
                </div>

                <!-- ACTIONS -->
                <div class="space-y-2 pt-1">
                    <button role="button" onclick="closeYouTubeBlockerShield(); switchTab('tracker');" class="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-black text-sm uppercase tracking-wider transition shadow-lg shadow-red-500/25 hover:scale-[1.02]">
                        <i class="fa-solid fa-arrow-left mr-1.5"></i> Return to Focus Session
                    </button>
                </div>
            </div>
        </div>

        <!-- FOCUS APP BLOCKLIST CUSTOMIZER MODAL -->
        <div id="arc-focus-blocklist-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden items-center justify-center p-4 overflow-y-auto">
            <div class="relative w-full max-w-xl bg-slate-900 border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-zoom-in my-auto">
                <div class="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400 text-lg">
                            <i class="fa-solid fa-moon"></i>
                        </div>
                        <div>
                            <h3 class="text-base sm:text-lg font-black text-white">Focus &amp; Pomodoro Blocklist</h3>
                            <p class="text-xs text-slate-400">Choose which apps are blocked when Focus Mode or Pomodoro is active</p>
                        </div>
                    </div>
                    <button role="button" onclick="closeFocusBlocklistModal()" aria-label="Close Focus Blocklist Modal" title="Close Focus Blocklist Modal" class="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <!-- PRESETS -->
                <div class="space-y-1.5">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Presets</span>
                    <div class="grid grid-cols-3 gap-2 text-xs font-semibold">
                        <button role="button" onclick="setAllAppsFocusBlock('distractions')" class="py-2 px-2.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:bg-purple-900/60 transition text-center truncate">
                            <i class="fa-solid fa-shield-cat mr-1"></i> Block Distractions
                        </button>
                        <button role="button" onclick="setAllAppsFocusBlock(true)" class="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-center truncate">
                            Block All Apps
                        </button>
                        <button role="button" onclick="setAllAppsFocusBlock(false)" class="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-center truncate">
                            Allow All Apps
                        </button>
                    </div>
                </div>

                <!-- APP TOGGLE LIST -->
                <div class="space-y-1.5">
                    <div class="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Installed Applications</span>
                        <span>Focus Lockout</span>
                    </div>
                    <div id="focus-modal-app-list" class="max-h-64 overflow-y-auto space-y-2 pr-1 no-scrollbar">
                        <!-- Populated dynamically -->
                    </div>
                </div>

                <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <span class="text-[11px] text-slate-400">Changes save automatically</span>
                    <button role="button" onclick="closeFocusBlocklistModal()" class="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-purple-600/20">
                        Done
                    </button>
                </div>
            </div>
        </div>

        <!-- ARC GOLD FOCUS STRICT MODE LOCKOUT MODAL -->
        <div id="arc-strict-lockout-modal" class="fixed inset-0 z-[120] bg-black/90 backdrop-blur-xl hidden items-center justify-center p-4 overflow-y-auto">
            <div id="arc-strict-lockout-card" class="relative w-full max-w-lg bg-gradient-to-b from-slate-950 via-amber-950/30 to-slate-950 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_90px_rgba(245,158,11,0.4)] space-y-6 text-center animate-zoom-in my-auto">
                <!-- Glowing Gold Lock with Pulse Ring -->
                <div class="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500/20 via-yellow-500/30 to-amber-600/20 border-2 border-amber-400 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.45)]">
                    <span class="absolute inset-0 rounded-3xl border border-amber-400 animate-ping opacity-40"></span>
                    <i class="fa-solid fa-lock text-3xl sm:text-4xl text-amber-300"></i>
                </div>

                <div class="space-y-2">
                    <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50 text-[10px] font-mono font-black uppercase tracking-widest shadow-sm">
                        <i class="fa-solid fa-crown text-[9px] text-amber-400"></i>
                        ARC GOLD STRICT MODE • LOCKED
                    </div>
                    <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        Early Exit Is Forbidden
                    </h2>
                    <p class="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                        This focus sprint is protected by <span class="text-amber-300 font-bold">Arc Gold Strict Mode</span>. To build unbreakable discipline and eliminate procrastination, sessions cannot be cancelled or stopped early.
                    </p>
                </div>

                <!-- LIVE COUNTDOWN DISPLAY -->
                <div class="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-1 shadow-inner">
                    <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider block font-mono">Time Remaining In Focus Sprint</span>
                    <div id="strict-lockout-time-left" class="text-3xl sm:text-4xl font-black font-mono text-cyan-300 tracking-tight drop-shadow animate-pulse">24:55</div>
                    <span id="strict-lockout-finish-time" class="text-[11px] text-amber-400/90 font-medium block">Stay in the zone · Timer must reach 00:00</span>
                </div>

                <!-- MOTIVATIONAL QUOTE -->
                <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 italic flex items-center justify-center gap-2">
                    <i class="fa-solid fa-gem text-amber-400 shrink-0"></i>
                    <span>"Discipline is choosing between what you want now and what you want most."</span>
                </div>

                <!-- ACTION BUTTON -->
                <div class="pt-1">
                    <button role="button" onclick="closeStrictModeLockoutModal(); playSfx('click')" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition shadow-lg shadow-amber-500/30 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                        <i class="fa-solid fa-fire text-slate-950"></i> I Understand · Stay Locked In
                    </button>
                </div>
            </div>
        </div>

                <!-- ARC GOLD STRICT MODE MODAL (ALIGNED WITH 100% FREE MANIFESTO) -->
        <div id="arc-gold-strict-upgrade-modal" class="fixed inset-0 z-[120] bg-black/90 backdrop-blur-xl hidden items-center justify-center p-4 overflow-y-auto">
            <div class="relative w-full max-w-lg bg-gradient-to-b from-slate-950 via-slate-900 to-black border-2 border-amber-500/70 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(245,158,11,0.3)] space-y-6 text-center animate-zoom-in my-auto">
                <!-- Glowing Shield Icon -->
                <div class="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400/20 via-yellow-500/30 to-amber-600/20 border-2 border-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <span class="absolute inset-0 rounded-3xl border border-amber-400 animate-ping opacity-30"></span>
                    <i class="fa-solid fa-shield-halved text-3xl sm:text-4xl text-amber-300"></i>
                </div>

                <div class="space-y-2">
                    <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 text-[10px] font-mono font-black uppercase tracking-widest">
                        🛡️ 100% FREE MANIFESTO • DISCIPLINE FOR ALL
                    </div>
                    <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        Focus Strict Mode (100% Free Forever)
                    </h2>
                    <p class="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                        In accordance with our <span class="text-emerald-400 font-bold">100% Free Manifesto</span>, self-discipline is a human right, never a luxury subscription. Strict Mode locks your focus sessions so you cannot give up or exit early when temptation strikes—completely free for every warrior.
                    </p>
                </div>

                <!-- FEATURES HIGHLIGHT -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left text-xs">
                    <div class="p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 flex items-start gap-2.5">
                        <i class="fa-solid fa-lock text-amber-400 mt-0.5 shrink-0"></i>
                        <div>
                            <div class="font-bold text-white">Unbreakable Focus</div>
                            <div class="text-[10px] text-slate-400">Zero early exits or pauses permitted (100% Free)</div>
                        </div>
                    </div>
                    <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                        <i class="fa-solid fa-hand-holding-heart text-emerald-400 mt-0.5 shrink-0"></i>
                        <div>
                            <div class="font-bold text-white">Never Paywalled</div>
                            <div class="text-[10px] text-slate-400">Zero subscriptions or hidden paywalls</div>
                        </div>
                    </div>
                    <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                        <i class="fa-solid fa-bolt-lightning text-cyan-400 mt-0.5 shrink-0"></i>
                        <div>
                            <div class="font-bold text-white">Ironclad Commitment</div>
                            <div class="text-[10px] text-slate-400">Enforces deep focus until countdown hits 00:00</div>
                        </div>
                    </div>
                    <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                        <i class="fa-solid fa-crown text-yellow-400 mt-0.5 shrink-0"></i>
                        <div>
                            <div class="font-bold text-white">Voluntary VIP Patronage</div>
                            <div class="text-[10px] text-slate-400">Arc Gold is optional aesthetic support only</div>
                        </div>
                    </div>
                </div>

                <!-- ACTION BUTTONS -->
                <div class="space-y-2 pt-2">
                    <button role="button" onclick="closeGoldStrictModal(); if(window.toggleFocusStrictMode){window.toggleFocusStrictMode();} if(typeof showToast==='function') showToast('🛡️ Focus Strict Mode configured (100% Free)!'); playSfx('achievement')" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                        <i class="fa-solid fa-lock text-slate-950"></i> Enable Focus Strict Mode (100% Free)
                    </button>
                    <button role="button" onclick="closeGoldStrictModal(); if(window.ArcGold){window.ArcGold.scrollToGoldCard();} playSfx('click')" class="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-bold transition flex items-center justify-center gap-2">
                        <i class="fa-solid fa-crown text-amber-400"></i> Optional: Support via Arc Gold VIP Patronage
                    </button>
                    <button role="button" onclick="closeGoldStrictModal(); playSfx('modalClose')" class="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
                    <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                        <i class="fa-solid fa-bolt-lightning text-cyan-400 mt-0.5 shrink-0"></i>
                        <div>
                            <div class="font-bold text-white">ProMotion 120Hz</div>
                            <div class="text-[10px] text-slate-400">Uncapped ultra-smooth animations</div>
                        </div>
                    </div>
                    <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                        <i class="fa-solid fa-image text-purple-400 mt-0.5 shrink-0"></i>
                        <div>
                            <div class="font-bold text-white">Custom Wallpaper</div>
                            <div class="text-[10px] text-slate-400">Personalize with high-res photos</div>
                        </div>
                    </div>
                    <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                        <i class="fa-solid fa-crown text-yellow-400 mt-0.5 shrink-0"></i>
                        <div>
                            <div class="font-bold text-white">VIP Crown Badge</div>
                            <div class="text-[10px] text-slate-400">Golden aura in header &amp; profile</div>
                        </div>
                    </div>
                </div>

                <!-- ACTION BUTTONS -->
                <div class="space-y-2 pt-2">
                    <button role="button" onclick="closeGoldStrictModal(); if(window.ArcGold){window.ArcGold.scrollToGoldCard();} playSfx('click')" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition shadow-lg shadow-amber-500/25 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                        <i class="fa-solid fa-crown text-slate-950"></i> Upgrade To Arc Gold (from ₹1/day)
                    </button>
                    <button role="button" onclick="closeGoldStrictModal(); playSfx('modalClose')" class="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition">
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>

                <!-- ARC GOLD BLACK & WHITE MODE MODAL (ALIGNED WITH 100% FREE MANIFESTO) -->
        <div id="arc-gold-bw-upgrade-modal" class="fixed inset-0 z-[120] bg-black/90 backdrop-blur-xl hidden items-center justify-center p-4 overflow-y-auto">
            <div class="relative w-full max-w-lg bg-gradient-to-b from-slate-950 via-slate-900 to-black border-2 border-zinc-500/70 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(255,255,255,0.15)] space-y-6 text-center animate-zoom-in my-auto">
                <!-- Glowing B&W Icon -->
                <div class="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-white/20 via-zinc-500/30 to-black/40 border-2 border-zinc-300 flex items-center justify-center shadow-lg shadow-white/10">
                    <span class="absolute inset-0 rounded-3xl border border-zinc-400 animate-ping opacity-20"></span>
                    <i class="fa-solid fa-circle-half-stroke text-3xl sm:text-4xl text-white"></i>
                </div>

                <div class="space-y-2">
                    <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 text-[10px] font-mono font-black uppercase tracking-widest">
                        🧠 100% FREE MANIFESTO • DOPAMINE DETOX
                    </div>
                    <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        Black &amp; White Mode (100% Free Forever)
                    </h2>
                    <p class="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                        In accordance with our <span class="text-emerald-400 font-bold">100% Free Manifesto</span>, visual detox tools are never locked behind paywalls. Black &amp; White Mode strips 100% of interface colors to eliminate hyper-stimulating cues and deliver deep monochrome focus—free for all users.
                    </p>
                </div>

                <!-- FEATURES HIGHLIGHT -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left text-xs">
                    <div class="p-3 rounded-xl bg-slate-950/80 border border-zinc-700/60 flex items-start gap-2.5">
                        <i class="fa-solid fa-droplet-slash text-zinc-300 mt-0.5 shrink-0"></i>
                        <div>
                            <div class="font-bold text-white">100% Color Stripping</div>
                            <div class="text-[10px] text-slate-400">Pure monochrome black, gray &amp; white (100% Free)</div>
                        </div>
                    </div>
                    <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                        <i class="fa-solid fa-brain text-cyan-400 mt-0.5 shrink-0"></i>
                        <div>
                            <div class="font-bold text-white">Dopamine Detox</div>
                            <div class="text-[10px] text-slate-400">Eliminates hyper-stimulating interface hues</div>
                        </div>
                    </div>
                    <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                        <i class="fa-solid fa-keyboard text-purple-400 mt-0.5 shrink-0"></i>
                        <div>
                            <div class="font-bold text-white">Instant Hotkey (Alt+B)</div>
                            <div class="text-[10px] text-slate-400">Quick-switch between color and B&amp;W anytime</div>
                        </div>
                    </div>
                    <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                        <i class="fa-solid fa-crown text-amber-400 mt-0.5 shrink-0"></i>
                        <div>
                            <div class="font-bold text-white">Voluntary VIP Patronage</div>
                            <div class="text-[10px] text-slate-400">Arc Gold is optional aesthetic support only</div>
                        </div>
                    </div>
                </div>

                <!-- ACTION BUTTONS -->
                <div class="space-y-2 pt-1">
                    <button role="button" onclick="if(window.ArcBlackWhiteMode){ArcBlackWhiteMode.toggle(); ArcBlackWhiteMode.closeUpgradeModal();}else{closeUpgradeModal();} if(typeof showToast==='function') showToast('⚡ Black & White Mode toggled (100% Free)!'); playSfx('zenChime')" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-zinc-100 via-slate-200 to-zinc-300 hover:from-white hover:to-zinc-200 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition shadow-lg shadow-white/20 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                        <i class="fa-solid fa-circle-half-stroke text-slate-950"></i> Toggle Black &amp; White Mode (100% Free)
                    </button>
                    <button role="button" onclick="if(window.ArcBlackWhiteMode)ArcBlackWhiteMode.closeUpgradeModal(); switchTab('settings'); if(window.ArcGold)window.ArcGold.scrollToGoldCard(); playSfx('click')" class="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-bold transition flex items-center justify-center gap-2">
                        <i class="fa-solid fa-crown text-amber-400"></i> Optional: Support via Arc Gold VIP Patronage
                    </button>
                    <button role="button" onclick="if(window.ArcBlackWhiteMode)ArcBlackWhiteMode.closeUpgradeModal(); playSfx('modalClose')" class="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
                    <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                        <i class="fa-solid fa-brain text-cyan-400 mt-0.5 shrink-0"></i>
                        <div>
                            <div class="font-bold text-white">Dopamine Detox</div>
                            <div class="text-[10px] text-slate-400">Eliminates hyper-stimulating interface hues</div>
                        </div>
                    </div>
                    <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                        <i class="fa-solid fa-keyboard text-purple-400 mt-0.5 shrink-0"></i>
                        <div>
                            <div class="font-bold text-white">Instant Hotkey (Alt+B)</div>
                            <div class="text-[10px] text-slate-400">Quick-switch between color and B&amp;W</div>
                        </div>
                    </div>
                    <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                        <i class="fa-solid fa-crown text-amber-400 mt-0.5 shrink-0"></i>
                        <div>
                            <div class="font-bold text-white">Full Arc Gold Suite</div>
                            <div class="text-[10px] text-slate-400">Strict Mode, 120Hz &amp; dual-user license</div>
                        </div>
                    </div>
                </div>

                <!-- ACTION BUTTONS -->
                <div class="space-y-2 pt-1">
                    <button role="button" onclick="if(window.ArcBlackWhiteMode)ArcBlackWhiteMode.closeUpgradeModal(); switchTab('settings'); if(window.ArcGold)window.ArcGold.scrollToGoldCard(); playSfx('click')" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition shadow-lg shadow-amber-500/30 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                        <i class="fa-solid fa-crown text-slate-950"></i> Upgrade to Arc Gold (From ₹1/day)
                    </button>
                    <button role="button" onclick="if(window.ArcBlackWhiteMode)ArcBlackWhiteMode.closeUpgradeModal(); playSfx('modalClose')" class="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition">
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>

        <!-- YOUTUBE CHANNEL FILTER MODAL -->
        <div id="arc-youtube-filter-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden items-center justify-center p-4 overflow-y-auto">
            <div class="relative w-full max-w-xl bg-slate-900 border border-red-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-zoom-in my-auto">
                <div class="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-400/40 flex items-center justify-center text-red-500 text-lg">
                            <i class="fa-brands fa-youtube"></i>
                        </div>
                        <div>
                            <h3 class="text-base sm:text-lg font-black text-white">YouTube Distraction Filter</h3>
                            <p class="text-xs text-slate-400">Block clickbait &amp; entertainment while allowing educational tutorials</p>
                        </div>
                    </div>
                    <button role="button" onclick="closeYouTubeFilterModal()" aria-label="Close YouTube Filter Modal" title="Close YouTube Filter Modal" class="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <!-- CONTROLS: MASTER TOGGLE & SHORTS BLOCK -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                            <span class="text-xs font-bold text-white block">Channel Filter</span>
                            <span class="text-[10px] text-slate-400 block">Restricts selected channels</span>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="yt-filter-master-toggle" onchange="toggleYouTubeFilterEnabled()" aria-label="Enable YouTube Channel Filter" title="Enable YouTube Channel Filter" checked class="sr-only peer">
                            <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                    </div>

                    <div class="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                            <span class="text-xs font-bold text-white block">Block Shorts Feed</span>
                            <span class="text-[10px] text-slate-400 block">Stops infinite video loop</span>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="yt-filter-shorts-toggle" onchange="toggleYouTubeShortsBlock()" aria-label="Block YouTube Shorts Feed" title="Block YouTube Shorts Feed" checked class="sr-only peer">
                            <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                    </div>
                </div>

                <!-- ADD CHANNEL FORM -->
                <div class="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Add Channel to Block</span>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <input type="text" id="yt-add-channel-input" placeholder="Channel Handle or Name (e.g. @MrBeast, Sidemen)" class="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500">
                        <input type="text" id="yt-add-reason-input" placeholder="Reason (e.g. Vlogs / Gaming)" class="sm:w-40 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500">
                        <button role="button" onclick="submitAddBlockedChannel()" class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider transition shrink-0 shadow-md shadow-red-600/20">
                            + Block
                        </button>
                    </div>
                </div>

                <!-- BLOCKED CHANNELS LIST -->
                <div class="space-y-1.5">
                    <div class="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Restricted YouTube Creators (<span id="yt-blocked-count-badge">8</span>)</span>
                        <span class="text-red-400">Blocked</span>
                    </div>
                    <div id="yt-modal-blocked-list" class="max-h-44 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
                        <!-- Populated dynamically -->
                    </div>
                </div>

                <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <span class="text-[11px] text-slate-400">Educational creators remain open</span>
                    <button role="button" onclick="closeYouTubeFilterModal()" class="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-red-600/20">
                        Close
                    </button>
                </div>
            </div>
        </div>


        <!-- CHROME & BROWSER WEBSITE BLOCKER OVERLAY -->
        <div id="arc-website-blocker-overlay" class="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl hidden items-center justify-center p-4 overflow-y-auto">
            <div class="relative w-full max-w-lg bg-gradient-to-b from-slate-950 via-cyan-950/60 to-black border-2 border-cyan-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(6,182,212,0.35)] space-y-6 text-center animate-zoom-in my-auto">
                <div class="relative mx-auto w-20 h-20 rounded-3xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <span class="absolute inset-0 rounded-3xl border border-cyan-400 animate-ping opacity-30"></span>
                    <i class="fa-brands fa-chrome text-3xl sm:text-4xl text-cyan-400"></i>
                </div>

                <div class="space-y-1.5">
                    <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-mono font-black uppercase tracking-widest">
                        <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                        WEBSITE RESTRICTED IN BROWSER
                    </div>
                    <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        <span id="web-blocker-domain-name">youtube.com</span> is Blocked
                    </h2>
                    <p class="text-xs sm:text-sm text-slate-300 leading-relaxed" id="web-blocker-reason-text">
                        This website is restricted inside Chrome during active Focus / Pomodoro sprints to prevent browsing rabbit holes.
                    </p>
                </div>

                <!-- FOCUS TIMER STATUS -->
                <div class="p-3.5 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-1">
                    <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Focus Time Remaining</span>
                    <div id="web-blocker-time-left" class="text-2xl sm:text-3xl font-black font-mono text-cyan-300">25:00</div>
                    <span class="text-[10px] text-cyan-400/80 font-medium block">Stay in the zone. Finish the sprint first.</span>
                </div>

                <!-- RECOMMENDED PRODUCTIVE WEBSITES -->
                <div class="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2">
                    <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Permitted Work &amp; Research Sites:</span>
                    <div class="flex flex-wrap gap-1.5 text-[11px] font-mono">
                        <span class="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">github.com</span>
                        <span class="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">stackoverflow.com</span>
                        <span class="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">developer.mozilla.org</span>
                        <span class="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">leetcode.com</span>
                        <span class="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">notion.so</span>
                    </div>
                </div>

                <!-- ACTIONS -->
                <div class="space-y-2 pt-1">
                    <button role="button" onclick="closeWebsiteBlockerShield(); switchTab('tracker');" class="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black text-sm uppercase tracking-wider transition shadow-lg shadow-cyan-500/25 hover:scale-[1.02]">
                        <i class="fa-solid fa-arrow-left mr-1.5"></i> Return to Focus Session
                    </button>
                </div>
            </div>
        </div>

        <!-- CHROME & BROWSER WEBSITE FILTER MODAL -->
        <div id="arc-website-filter-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden items-center justify-center p-4 overflow-y-auto">
            <div class="relative w-full max-w-xl bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-zoom-in my-auto">
                <div class="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 text-lg">
                            <i class="fa-brands fa-chrome"></i>
                        </div>
                        <div>
                            <h3 class="text-base sm:text-lg font-black text-white">Chrome &amp; Browser Website Filter</h3>
                            <p class="text-xs text-slate-400">Block distracting websites (YouTube, Instagram, Hotstar, etc.) inside Chrome during Focus</p>
                        </div>
                    </div>
                    <button role="button" onclick="closeWebsiteFilterModal()" aria-label="Close Website Filter Modal" title="Close Website Filter Modal" class="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <!-- MASTER TOGGLE & QUICK STATS -->
                <div class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                        <span class="text-xs font-bold text-white block">Website Filter during Focus</span>
                        <span class="text-[10px] text-slate-400 block">Restricts selected websites in Chrome when Focus/Pomodoro is active</span>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" id="web-filter-master-toggle" onchange="toggleWebsiteFilterEnabled()" aria-label="Enable Website Filter during Focus" title="Enable Website Filter during Focus" checked class="sr-only peer">
                        <div class="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                </div>

                <!-- ADD WEBSITE FORM -->
                <div class="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Add Distracting Website</span>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <input type="text" id="web-add-domain-input" placeholder="Domain or URL (e.g. cricbuzz.com, hotstar.com)" class="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono">
                        <input type="text" id="web-add-reason-input" placeholder="Reason (e.g. Cricket / Social)" class="sm:w-40 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400">
                        <button role="button" onclick="submitAddBlockedWebsite()" class="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition shrink-0 shadow-md shadow-cyan-500/20">
                            + Block
                        </button>
                    </div>
                </div>

                <!-- BLOCKED WEBSITES LIST -->
                <div class="space-y-1.5">
                    <div class="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Restricted Websites (<span id="web-blocked-count-badge">13</span>)</span>
                        <span class="text-cyan-400">Blocked in Chrome</span>
                    </div>
                    <div id="web-modal-blocked-list" class="max-h-44 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
                        <!-- Populated dynamically -->
                    </div>
                </div>

                <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <span class="text-[11px] text-slate-400">GitHub, StackOverflow &amp; Docs remain accessible</span>
                    <button role="button" onclick="closeWebsiteFilterModal()" class="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/20">
                        Close
                    </button>
                </div>
            </div>
        </div>


        <!-- VIEW 7: NOTIFICATIONS & SYSTEM UPDATES HUB -->`;
}
