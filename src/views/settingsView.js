export function renderSettingsView() {
  return `<section id="view-settings" class="hidden pb-32 md:pb-24" aria-label="Settings &amp; Controls">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                        <i class="fa-solid fa-gear text-base"></i>
                    </div>
                    <div>
                        <h2 class="text-base sm:text-lg font-black text-white">Settings &amp; Controls</h2>
                        <p class="text-[11px] text-slate-400">Configure day cycle, audio/visual theme engines, and cloud sync</p>
                    </div>
                </div>

                <!-- SETTINGS CATEGORY TABS -->
                <div id="settings-view-subtabs" class="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs shrink-0 self-start sm:self-auto overflow-x-auto max-w-full scrollbar-none">
                    <button type="button" id="settings-subtab-all" onclick="filterSettingsView('all')" class="shrink-0 px-3 py-1.5 rounded-lg font-bold bg-cyan-500 text-black shadow-sm transition">
                        <i class="fa-solid fa-sliders mr-1"></i> All Settings
                    </button>
                    <button type="button" id="settings-subtab-habits" onclick="filterSettingsView('habits')" class="shrink-0 px-3 py-1.5 rounded-lg font-medium text-slate-400 hover:text-white transition">
                        <i class="fa-solid fa-calendar-day mr-1"></i> Day &amp; Preferences
                    </button>
                    <button type="button" id="settings-subtab-account" onclick="filterSettingsView('account')" class="shrink-0 px-3 py-1.5 rounded-lg font-medium text-slate-400 hover:text-white transition">
                        <i class="fa-solid fa-user-shield mr-1"></i> Accounts &amp; Sync
                    </button>
                    <button type="button" id="settings-subtab-faq" onclick="filterSettingsView('faq')" class="shrink-0 px-3 py-1.5 rounded-lg font-medium text-slate-400 hover:text-cyan-300 transition">
                        <i class="fa-solid fa-circle-question mr-1"></i> FAQ &amp; Help
                    </button>
                    <button type="button" id="settings-subtab-founder" onclick="filterSettingsView('founder')" class="shrink-0 px-3 py-1.5 rounded-lg font-medium text-slate-400 hover:text-purple-300 transition">
                        <i class="fa-solid fa-user-tie mr-1"></i> About Founder
                    </button>
                </div>
            </div>
            <!-- INLINE DOCKED ASK SETTINGS / NATURAL LANGUAGE COMMAND BAR -->
            <div id="ax-bar-dock" class="mb-4"></div>

            <!-- APPEARANCE & ARC SEASON CONTROLS (RELOCATED FROM HEADER TO FREE UP SPACE) -->
            <div id="settings-theme-arc-card" class="glass-card rounded-2xl p-4 sm:p-5 border-l-4 border-l-amber-400 bg-slate-900/80 mb-4 shadow-xl relative overflow-hidden transition-all duration-300">
                <div class="flex items-center justify-between gap-3 cursor-pointer select-none" tabindex="0" onclick="event.stopPropagation(); ArcSettingsAccordion.toggle('settings-theme-arc-card')" onkeydown="ArcSettingsAccordion.handleKeyDown(event, 'settings-theme-arc-card')">
                    <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div class="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                            <i class="fa-solid fa-palette text-sm"></i>
                        </div>
                        <div class="min-w-0 flex items-center gap-2 flex-wrap">
                            <h3 class="text-sm sm:text-base font-extrabold text-white truncate">Display Mode &amp; Active Season</h3>
                            <span class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
                                <i class="fa-solid fa-palette text-[9px]"></i> THEME &amp; ARC
                            </span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <button type="button" class="settings-arrow-btn p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white border border-slate-700/80 text-xs flex items-center justify-center transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400" aria-label="Toggle Display Mode &amp; Active Season card" aria-expanded="false" onclick="ArcSettingsAccordion.toggle('settings-theme-arc-card')" onkeydown="ArcSettingsAccordion.handleKeyDown(event, 'settings-theme-arc-card')">
                            <i class="settings-chevron-icon fa-solid fa-chevron-down text-xs transition-transform duration-300"></i>
                        </button>
                    </div>
                </div>
                <div class="arc-fluid-accordion hidden pt-3 border-t border-slate-800/80">
                    <div class="space-y-3">
                        <p class="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                            Toggle between Light Mode and Dark Mode interface styles, or transition between Winter Arc and Summer Arc seasons.
                        </p>
                        <div class="flex items-center gap-2.5 flex-wrap pt-1">
                            <button role="button" id="header-mode-toggle-btn" onclick="toggleLightDarkMode()" onmouseenter="playSfx('hover')" class="px-4 py-2.5 rounded-xl bg-slate-800 active:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center transition hover:border-cyan-400 hover:text-cyan-300 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" aria-label="Toggle Light/Dark Display Mode" title="Toggle Light/Dark Display Mode">
                                <i id="header-mode-toggle-icon" class="fa-solid fa-sun text-amber-400 mr-2 text-sm"></i>
                                <span id="header-mode-toggle-label">Light Mode</span>
                            </button>
                            <button role="button" onclick="openArcModal(); playSfx('modalOpen')" onmouseenter="playSfx('hover')" class="px-4 py-2.5 rounded-xl bg-amber-500/20 active:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center transition hover:bg-amber-500/30 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" aria-label="Switch Arc">
                                <i id="header-arc-switch-icon" class="fa-solid fa-snowflake text-cyan-400 mr-2 text-sm"></i>
                                <span id="arc-switch-btn-text">Switch to Winter Arc</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- HARDWARE PROFILER & SMOOTHNESS ENGINE -->
            <div id="settings-hardware-profiler-card" class="glass-card rounded-2xl p-4 sm:p-5 border-l-4 border-l-cyan-400 bg-slate-900/80 mb-4 shadow-xl relative overflow-hidden transition-all duration-300" tabindex="0" onkeydown="window.ArcSettingsAccordion && window.ArcSettingsAccordion.handleKeyDown(event, 'settings-hardware-profiler-card')">
                <div class="flex items-center justify-between gap-3 select-none cursor-pointer" onclick="window.ArcSettingsAccordion && window.ArcSettingsAccordion.toggle('settings-hardware-profiler-card')">
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                            <i class="fa-solid fa-microchip text-base"></i>
                        </div>
                        <div class="min-w-0 flex items-center gap-2 flex-wrap">
                            <h3 class="text-sm sm:text-base font-extrabold text-white truncate">Hardware Profiler &amp; Smoothness Engine</h3>
                            <span class="text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                                60 FPS Cap
                            </span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <button type="button" class="settings-arrow-btn p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition" aria-label="Expand settings card" aria-expanded="false" onclick="event.stopPropagation(); window.ArcSettingsAccordion && window.ArcSettingsAccordion.toggle('settings-hardware-profiler-card')">
                            <i class="fa-solid fa-chevron-down text-xs transition-transform duration-300 settings-chevron-icon"></i>
                        </button>
                    </div>
                </div>
                <div class="arc-fluid-accordion hidden pt-3 border-t border-slate-800/80 mt-3"></div>
            </div>

            <!-- LIQUID GLASS UI & FLUID SPRING ANIMATIONS (ARC GOLD EXCLUSIVE) -->
            <div id="settings-liquid-glass-card" class="glass-card rounded-2xl p-4 sm:p-5 border-l-4 border-l-cyan-400 bg-slate-900/80 mb-4 shadow-xl relative overflow-hidden transition-all duration-300">
                <div class="flex items-center justify-between gap-3 cursor-pointer select-none" tabindex="0" onclick="event.stopPropagation(); ArcSettingsAccordion.toggle('settings-liquid-glass-card')" onkeydown="ArcSettingsAccordion.handleKeyDown(event, 'settings-liquid-glass-card')">
                    <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div class="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0">
                            <i class="fa-solid fa-wand-magic-sparkles text-sm"></i>
                        </div>
                        <div class="min-w-0 flex items-center gap-2 flex-wrap">
                            <h3 class="text-sm sm:text-base font-extrabold text-white truncate">Liquid Glass UI &amp; Animations</h3>
                            <span class="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono font-bold uppercase tracking-wider shrink-0">iOS MOTION</span>
                            <span class="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/30 text-amber-300 border border-amber-400/50 text-[9px] font-mono font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                                <i class="fa-solid fa-crown text-[9px] text-amber-400"></i> GOLD
                            </span>
                            <span id="liquid-glass-status-pill" class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 shrink-0">DISABLED</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <button type="button" class="settings-arrow-btn p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white border border-slate-700/80 text-xs flex items-center justify-center transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" aria-label="Toggle Liquid Glass UI &amp; Animations card" aria-expanded="false" onclick="ArcSettingsAccordion.toggle('settings-liquid-glass-card')" onkeydown="ArcSettingsAccordion.handleKeyDown(event, 'settings-liquid-glass-card')">
                            <i class="settings-chevron-icon fa-solid fa-chevron-down text-xs transition-transform duration-300"></i>
                        </button>
                    </div>
                </div>
                <div class="arc-fluid-accordion hidden pt-3 border-t border-slate-800/80">
                    <div class="space-y-3">
                        <p class="text-[11px] sm:text-xs text-slate-300 leading-relaxed max-w-2xl">
                            Enable iOS-style translucent liquid glass surfaces, refractive highlights, and fluid spring animations.
                        </p>
                        <div class="flex items-center gap-2.5 flex-wrap pt-1" id="liquid-glass-ctrl-wrap">
                            <!-- Dynamic toggle or locked prompt rendered by ArcLiquidGlass.updateUI() -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- CUSTOM BACKGROUND WALLPAPER (ARC GOLD EXCLUSIVE) -->
                        <!-- CUSTOM BACKGROUND WALLPAPER (ARC GOLD EXCLUSIVE) -->
            <div id="settings-custom-bg-card" class="glass-card rounded-2xl p-4 sm:p-5 border-l-4 border-l-amber-500 bg-slate-900/80 mb-4 shadow-xl relative overflow-hidden transition-all duration-300" tabindex="0" onkeydown="window.ArcSettingsAccordion && window.ArcSettingsAccordion.handleKeyDown(event, 'settings-custom-bg-card')">
                <div class="flex items-center justify-between gap-3 select-none cursor-pointer" onclick="window.ArcSettingsAccordion ? window.ArcSettingsAccordion.toggle('settings-custom-bg-card') : (window.ArcCustomBackground && window.ArcCustomBackground.toggleBox ? window.ArcCustomBackground.toggleBox() : null)">
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 flex items-center justify-center shrink-0">
                            <i class="fa-solid fa-image text-base"></i>
                        </div>
                        <div class="min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <h3 class="text-sm sm:text-base font-extrabold text-white tracking-wide truncate">Custom &amp; 4K Wallpapers</h3>
                                <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                    <i class="fa-solid fa-crown text-[9px]"></i> Arc Gold Perk
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <button type="button" class="settings-arrow-btn p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition" aria-label="Expand settings card" aria-expanded="false" onclick="event.stopPropagation(); window.ArcSettingsAccordion ? window.ArcSettingsAccordion.toggle('settings-custom-bg-card') : (window.ArcCustomBackground && window.ArcCustomBackground.toggleBox ? window.ArcCustomBackground.toggleBox() : null)">
                            <i class="fa-solid fa-chevron-down text-xs transition-transform duration-300 settings-chevron-icon"></i>
                        </button>
                    </div>
                </div>
                <div class="arc-fluid-accordion hidden pt-3 border-t border-slate-800/80 mt-3"></div>
            </div>

            <!-- AUTO-START ON DEVICE BOOT SETTINGS CARD -->
            <div id="settings-autostart-card" class="glass-card rounded-2xl p-4 sm:p-5 border-l-4 border-l-cyan-400 bg-slate-900/80 mb-4 shadow-xl relative overflow-hidden transition-all duration-300">
                <div class="flex items-center justify-between gap-3 cursor-pointer select-none" tabindex="0" onclick="event.stopPropagation(); ArcSettingsAccordion.toggle('settings-autostart-card')" onkeydown="ArcSettingsAccordion.handleKeyDown(event, 'settings-autostart-card')">
                    <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div class="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0">
                            <i class="fa-solid fa-power-off text-sm"></i>
                        </div>
                        <div class="min-w-0 flex items-center gap-2 flex-wrap">
                            <h3 class="text-sm sm:text-base font-extrabold text-white truncate">Launch When Device Turns On (Auto-Start)</h3>
                            <span class="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono font-bold uppercase tracking-wider shrink-0">STARTUP</span>
                            <span id="autostart-status-pill" class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 shrink-0">DISABLED</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <button type="button" class="settings-arrow-btn p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white border border-slate-700/80 text-xs flex items-center justify-center transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" aria-label="Toggle Auto-Start card" aria-expanded="false" onclick="ArcSettingsAccordion.toggle('settings-autostart-card')" onkeydown="ArcSettingsAccordion.handleKeyDown(event, 'settings-autostart-card')">
                            <i class="settings-chevron-icon fa-solid fa-chevron-down text-xs transition-transform duration-300"></i>
                        </button>
                    </div>
                </div>
                <div class="arc-fluid-accordion hidden pt-3 border-t border-slate-800/80">
                    <div class="space-y-3">
                        <p class="text-[11px] sm:text-xs text-slate-300 leading-relaxed max-w-2xl">
                            Automatically launch Arc Tracker whenever your PC, Mac, or phone turns on so screen time tracking and habit sentinel run continuously without missing a beat.
                        </p>
                        <div class="flex items-center gap-2.5 flex-wrap pt-1">
                            <button role="button" id="btn-toggle-autostart" data-active="false" onclick="ArcAutoStart.toggle()" class="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-cyan-500/20">
                                <i class="fa-solid fa-power-off"></i>
                                <span id="btn-toggle-autostart-text">Turn On Auto-Start</span>
                            </button>
                            <button role="button" onclick="ArcAutoStart.openModal()" class="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95">
                                <i class="fa-solid fa-circle-info text-cyan-400"></i>
                                <span>Setup Guide</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- PERMANENT SCREEN TIME NOTIFICATION CARD -->
            <div id="settings-screentime-notif-card" class="glass-card rounded-2xl p-4 sm:p-5 border-l-4 border-l-purple-400 bg-slate-900/80 mb-4 shadow-xl relative overflow-hidden transition-all duration-300">
                <div class="flex items-center justify-between gap-3 cursor-pointer select-none" tabindex="0" onclick="event.stopPropagation(); ArcSettingsAccordion.toggle('settings-screentime-notif-card')" onkeydown="ArcSettingsAccordion.handleKeyDown(event, 'settings-screentime-notif-card')">
                    <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div class="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                            <i class="fa-solid fa-bell text-sm"></i>
                        </div>
                        <div class="min-w-0 flex items-center gap-2 flex-wrap">
                            <h3 class="text-sm sm:text-base font-extrabold text-white truncate">Permanent Screen Time Notification</h3>
                            <span class="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-mono font-bold uppercase tracking-wider shrink-0">SYSTEM TRAY</span>
                            <span id="screentime-notif-status-pill" class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 shrink-0">DISABLED</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <button type="button" class="settings-arrow-btn p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white border border-slate-700/80 text-xs flex items-center justify-center transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400" aria-label="Toggle Permanent Notification card" aria-expanded="false" onclick="ArcSettingsAccordion.toggle('settings-screentime-notif-card')" onkeydown="ArcSettingsAccordion.handleKeyDown(event, 'settings-screentime-notif-card')">
                            <i class="settings-chevron-icon fa-solid fa-chevron-down text-xs transition-transform duration-300"></i>
                        </button>
                    </div>
                </div>
                <div class="arc-fluid-accordion hidden pt-3 border-t border-slate-800/80">
                    <div class="space-y-3">
                        <p class="text-[11px] sm:text-xs text-slate-300 leading-relaxed max-w-2xl">
                            Pins a live, silent notification in your device's notification center, status bar, and lock screen displaying your total screen time and dopamine shield score at a glance.
                        </p>
                        <div class="flex items-center gap-2.5 flex-wrap pt-1">
                            <button role="button" id="btn-toggle-perm-notif" onclick="ArcScreenTimeNotifier.toggle()" class="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-purple-600/20">
                                <i class="fa-solid fa-bell"></i>
                                <span id="btn-toggle-perm-notif-text">Enable Permanent Notification</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div id="p20-settings" class="grid grid-cols-1 gap-4 mb-4"></div>
            <div id="sx-root" class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start"></div>

            <!-- ADDITIONAL SETTINGS & FREQUENTLY ASKED QUESTIONS (FAQ) (Compact by Default) -->
            <section id="settings-additional-faq-card" class="glass-card rounded-2xl p-4 sm:p-5 border-l-4 border-l-cyan-400 bg-slate-900/90 mb-4 shadow-xl relative overflow-hidden transition-all duration-300" aria-label="Additional Settings &amp; Frequently Asked Questions">
                <!-- COMPACT HEADER BAR (Strict Arrow-Button & Arrow-Key Trigger Only) -->
                <div class="flex items-center justify-between gap-3 select-none cursor-pointer" tabindex="0" onclick="event.stopPropagation(); ArcSettingsAccordion.toggle('settings-additional-faq-card')" onkeydown="ArcSettingsAccordion.handleKeyDown(event, 'settings-additional-faq-card')">
                    <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div class="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm shrink-0">
                            <i class="fa-solid fa-circle-question text-base"></i>
                        </div>
                        <div class="min-w-0 flex items-center gap-2 flex-wrap">
                            <h3 class="text-sm sm:text-base font-extrabold text-white truncate">Frequently Asked Questions (FAQ)</h3>
                            <span class="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm shrink-0">
                                <i class="fa-solid fa-book-open text-[9px] text-cyan-300"></i> KNOWLEDGE BASE
                            </span>
                            <span id="faq-results-count" class="text-[9px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 shrink-0">10 questions</span>
                        </div>
                    </div>

                    <div class="flex items-center gap-2 shrink-0">
                        <button id="faq-section-toggle-btn" type="button" class="settings-arrow-btn px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 hover:text-white border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer" aria-expanded="false" aria-label="Toggle FAQs" onclick="ArcSettingsAccordion.toggle('settings-additional-faq-card')" onkeydown="ArcSettingsAccordion.handleKeyDown(event, 'settings-additional-faq-card')">
                            <span>View FAQs</span>
                            <i id="faq-chevron-icon" class="settings-chevron-icon fa-solid fa-chevron-down text-[10px] transition-transform duration-300"></i>
                        </button>
                    </div>
                </div>

                <!-- EXPANDABLE DETAILS CONTENT (HIDDEN BY DEFAULT TO INCREASE SPACE) -->
                <div id="faq-expandable-content" class="arc-fluid-accordion hidden pt-3 border-t border-slate-800/80"><div class="space-y-4">
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                        <p class="text-[11px] sm:text-xs text-slate-300 leading-relaxed max-w-2xl">
                            Everything you need to know about habit scoring, offline airgap security, dopamine blocker rules, streak freezes, and update notifications.
                        </p>
                        <div class="flex items-center gap-2 shrink-0">
                            <button type="button" onclick="ArcFaq.toggleAll(true)" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm">
                                <i class="fa-solid fa-angles-down text-[10px]"></i>
                                <span>Expand All</span>
                            </button>
                            <button type="button" onclick="ArcFaq.toggleAll(false)" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-sm">
                                <i class="fa-solid fa-angles-up text-[10px]"></i>
                                <span>Collapse All</span>
                            </button>
                        </div>
                    </div>

                    <!-- FAQ SEARCH & CATEGORY FILTERS -->
                    <div class="space-y-3">
                        <div class="relative">
                            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                            <input type="search" id="faq-search-input" oninput="ArcFaq.filterSearch(this.value)" placeholder="Search any question (e.g., streak freeze, notifications, screen time, backup, airgap)..." class="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-cyan-400 text-white placeholder-slate-500 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition" aria-label="Search frequently asked questions">
                            <button type="button" onclick="document.getElementById('faq-search-input').value = ''; ArcFaq.filterSearch('')" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs" title="Clear search">✕</button>
                        </div>

                        <!-- Filter Chips -->
                        <div class="flex items-center gap-1.5 flex-wrap">
                            <button type="button" onclick="ArcFaq.setCategory('all')" data-faq-cat="all" class="faq-category-pill px-3 py-1.5 rounded-xl text-xs font-bold transition bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm">
                                All Questions
                            </button>
                            <button type="button" onclick="ArcFaq.setCategory('updates')" data-faq-cat="updates" class="faq-category-pill px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
                                <i class="fa-solid fa-bell mr-1 text-cyan-400"></i> Updates &amp; Alerts
                            </button>
                            <button type="button" onclick="ArcFaq.setCategory('habits')" data-faq-cat="habits" class="faq-category-pill px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
                                <i class="fa-solid fa-fire mr-1 text-amber-400"></i> Habits &amp; Streaks
                            </button>
                            <button type="button" onclick="ArcFaq.setCategory('screentime')" data-faq-cat="screentime" class="faq-category-pill px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
                                <i class="fa-solid fa-hourglass-half mr-1 text-purple-400"></i> Screen Time &amp; Shield
                            </button>
                            <button type="button" onclick="ArcFaq.setCategory('security')" data-faq-cat="security" class="faq-category-pill px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
                                <i class="fa-solid fa-shield-halved mr-1 text-emerald-400"></i> Security &amp; Airgap
                            </button>
                            <button type="button" onclick="ArcFaq.setCategory('rpg')" data-faq-cat="rpg" class="faq-category-pill px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
                                <i class="fa-solid fa-crown mr-1 text-yellow-400"></i> RPG &amp; XP
                            </button>
                            <button type="button" onclick="ArcFaq.setCategory('visuals')" data-faq-cat="visuals" class="faq-category-pill px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition">
                                <i class="fa-solid fa-sliders mr-1 text-pink-400"></i> Audio &amp; Visuals
                            </button>
                        </div>
                    </div>

                    <!-- ACCORDION QUESTIONS LIST (Mutually Exclusive <details name="arc-faq">) -->
                    <div id="faq-accordion-container" class="space-y-2.5 pt-1">
                        <!-- Populated dynamically by ArcFaq.render() -->
                    </div>
                </div></div>
            </section>

            <!-- ABOUT THE FOUNDER SECTION (Compact by Default) -->
            <section id="settings-about-founder-card" class="glass-card rounded-2xl p-4 sm:p-5 border-l-4 border-l-purple-400 bg-slate-900/90 mb-4 shadow-xl relative overflow-hidden transition-all duration-300" aria-label="About the Founder">
                <!-- COMPACT HEADER BAR (Strict Arrow-Button & Arrow-Key Trigger Only) -->
                <div class="flex items-center justify-between gap-3 select-none cursor-pointer" tabindex="0" onclick="event.stopPropagation(); ArcSettingsAccordion.toggle('settings-about-founder-card')" onkeydown="ArcSettingsAccordion.handleKeyDown(event, 'settings-about-founder-card')">
                    <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-800 flex items-center justify-center text-white shadow-sm shrink-0 border border-purple-400/30">
                            <i class="fa-solid fa-user-astronaut text-base"></i>
                        </div>
                        <div class="min-w-0 flex items-center gap-2 flex-wrap">
                            <h3 class="text-sm sm:text-base font-extrabold text-white truncate">About the Founder</h3>
                            <span class="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm shrink-0">
                                <i class="fa-solid fa-crown text-[9px] text-purple-300"></i> LEADERSHIP
                            </span>
                            <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm shrink-0">
                                <i class="fa-solid fa-gem text-[9px] text-emerald-300"></i> 100% FREE MANIFESTO
                            </span>
                        </div>
                    </div>

                    <div class="flex items-center gap-2 shrink-0">
                        <button id="founder-toggle-btn" type="button" class="settings-arrow-btn px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer" aria-expanded="false" aria-label="Toggle Founder Story" onclick="ArcSettingsAccordion.toggle('settings-about-founder-card')" onkeydown="ArcSettingsAccordion.handleKeyDown(event, 'settings-about-founder-card')">
                            <span>Read Story</span>
                            <i id="founder-chevron-icon" class="settings-chevron-icon fa-solid fa-chevron-down text-[10px] transition-transform duration-300"></i>
                        </button>
                    </div>
                </div>

                <!-- EXPANDABLE DETAILS CONTENT (HIDDEN BY DEFAULT) -->
                <div id="founder-expandable-content" class="arc-fluid-accordion hidden pt-3 border-t border-slate-800/80"><div class="space-y-6">
                    <!-- SECTION 1: HOW THE JOURNEY STARTED -->
                    <div class="space-y-3">
                        <div class="flex items-center gap-2.5 text-purple-300 font-extrabold text-xs sm:text-sm tracking-wide uppercase font-mono">
                            <span class="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 text-xs shrink-0">
                                <i class="fa-solid fa-fire-flame-curved"></i>
                            </span>
                            <span>1. The Genesis: How the Journey Started</span>
                        </div>

                        <div class="bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-slate-800/90 space-y-3.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                            <p>
                                In late 2024, amidst the continuous hum of digital notifications and algorithmic feeds, I noticed something alarming in myself and everyone around me: <strong class="text-white">smartphones had ceased to be productivity tools and had quietly become dopamine casinos.</strong> Behavioral loops carefully tuned by tech giants were bleeding 4 to 8 hours a day from our lives, fracturing our capacity for deep, quiet concentration, and replacing real-world mastery with empty digital highs.
                            </p>
                            <p>
                                When I committed to undertaking the <strong class="text-purple-300">Winter Arc</strong>—a 90-day seasonal crucible of radical discipline, rigorous workouts, cold focus, and silent self-reinvention—I searched for a software system to anchor my daily execution. What I found was unacceptable:
                            </p>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                                <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                                    <i class="fa-solid fa-xmark text-rose-400 mt-0.5 shrink-0"></i>
                                    <span><strong>Predatory Subscriptions:</strong> $10–$15 monthly paywalls just to check a basic daily habit box.</span>
                                </div>
                                <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                                    <i class="fa-solid fa-xmark text-rose-400 mt-0.5 shrink-0"></i>
                                    <span><strong>Invasive Surveillance:</strong> Mandatory cloud accounts harvesting personal routines and screen time vulnerabilities.</span>
                                </div>
                                <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                                    <i class="fa-solid fa-xmark text-rose-400 mt-0.5 shrink-0"></i>
                                    <span><strong>Fragile Online Apps:</strong> Cluttered interfaces that broke without internet and rewarded superficial vanity streaks.</span>
                                </div>
                            </div>
                            <p>
                                At 2:00 AM on a freezing night, frustrated with bloated apps that took more attention than they saved, I opened a clean code editor and began engineering <strong class="text-white">Arc Tracker</strong>. The thesis was uncompromising: an ironclad, local-first discipline operating system built to protect your attention as fiercely as armor protects a soldier—completely offline, zero data tracking, and brutally honest about where your time goes.
                            </p>

                            <!-- FOUNDER QUOTE CALLOUT -->
                            <div class="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 text-purple-200 text-xs sm:text-sm italic font-medium flex items-center gap-3.5 shadow-inner">
                                <i class="fa-solid fa-quote-left text-purple-400 text-xl shrink-0 opacity-80"></i>
                                <span>"When you master your attention, you master your destiny. A person who commands their daily rituals in silence cannot be conquered by algorithms."</span>
                            </div>
                        </div>
                    </div>

                    <!-- SECTION 2: GOALS & VISION -->
                    <div class="space-y-3">
                        <div class="flex items-center gap-2.5 text-cyan-300 font-extrabold text-xs sm:text-sm tracking-wide uppercase font-mono">
                            <span class="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-xs shrink-0">
                                <i class="fa-solid fa-bullseye"></i>
                            </span>
                            <span>2. Goals &amp; Core Vision</span>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                            <div class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-2 flex flex-col justify-between">
                                <div class="space-y-2">
                                    <div class="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-sm">
                                        <i class="fa-solid fa-hourglass-start"></i>
                                    </div>
                                    <h4 class="text-xs sm:text-sm font-extrabold text-white">Reclaim 10,000,000 Hours</h4>
                                    <p class="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                                        Our singular metric of success is not daily active app impressions—it is how many millions of wasted hours users steal back from doomscrolling feeds to invest into their physical health, craft, businesses, and families.
                                    </p>
                                </div>
                                <span class="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1 pt-1">
                                    <i class="fa-solid fa-arrow-trend-up"></i> Tangible Impact
                                </span>
                            </div>

                            <div class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-2 flex flex-col justify-between">
                                <div class="space-y-2">
                                    <div class="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-sm">
                                        <i class="fa-solid fa-shield-halved"></i>
                                    </div>
                                    <h4 class="text-xs sm:text-sm font-extrabold text-white">Absolute Data Sovereignty</h4>
                                    <p class="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                                        Your discipline vulnerabilities, screen time logs, and personal reflections belong exclusively to you. Arc Tracker is engineered with an airgapped privacy model: zero telemetry, zero analytics tracking, and instant raw JSON data control.
                                    </p>
                                </div>
                                <span class="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1 pt-1">
                                    <i class="fa-solid fa-lock"></i> Zero Surveillance
                                </span>
                            </div>

                            <div class="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-2 flex flex-col justify-between">
                                <div class="space-y-2">
                                    <div class="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-sm">
                                        <i class="fa-solid fa-crown"></i>
                                    </div>
                                    <h4 class="text-xs sm:text-sm font-extrabold text-white">Elevating Human Willpower</h4>
                                    <p class="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                                        Motivation is an emotion that fades; systems are cold structures that endure. Our vision is to combine neuroscience-backed habit architecture with tactile RPG progression to make daily discipline visceral, engaging, and permanent.
                                    </p>
                                </div>
                                <span class="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1 pt-1">
                                    <i class="fa-solid fa-wand-magic-sparkles"></i> Habit Architecture
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- SECTION 3: WHY THE APP IS 100% FREE -->
                    <div class="space-y-3">
                        <div class="flex items-center gap-2.5 text-emerald-300 font-extrabold text-xs sm:text-sm tracking-wide uppercase font-mono">
                            <span class="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-xs shrink-0">
                                <i class="fa-solid fa-hand-holding-heart"></i>
                            </span>
                            <span>3. The Free Manifesto: Why Arc Tracker Is 100% Free Forever</span>
                        </div>

                        <div class="bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-slate-800/90 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                            <div class="space-y-3">
                                <div class="flex items-start gap-3">
                                    <div class="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xs shrink-0 mt-0.5">
                                        <i class="fa-solid fa-check"></i>
                                    </div>
                                    <div>
                                        <h5 class="text-xs sm:text-sm font-bold text-white">Self-Discipline Is a Human Right, Not a Luxury Subscription</h5>
                                        <p class="text-[11px] sm:text-xs text-slate-300 mt-1 leading-relaxed">
                                            When someone is struggling with phone addiction, feeling stagnant, or attempting to rebuild their self-respect from the ashes, the absolute last thing they need is a $12.99/month paywall blocking their ability to track their habits. Self-mastery tools should be universal weapons available to anyone with the heart to put in the work.
                                        </p>
                                    </div>
                                </div>

                                <div class="flex items-start gap-3">
                                    <div class="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xs shrink-0 mt-0.5">
                                        <i class="fa-solid fa-microchip"></i>
                                    </div>
                                    <div>
                                        <h5 class="text-xs sm:text-sm font-bold text-white">Zero Cloud Overhead by Architectural Design</h5>
                                        <p class="text-[11px] sm:text-xs text-slate-300 mt-1 leading-relaxed">
                                            Arc Tracker was deliberately designed as a 100% offline-first, client-side application. Your device's browser, IndexedDB storage engine, and local Web Workers do all the computing. Because we do not run multimillion-dollar centralized surveillance server farms tracking your daily check-ins, our server overhead is virtually zero—which means we never have a reason to bill you.
                                        </p>
                                    </div>
                                </div>

                                <div class="flex items-start gap-3">
                                    <div class="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xs shrink-0 mt-0.5">
                                        <i class="fa-solid fa-ban"></i>
                                    </div>
                                    <div>
                                        <h5 class="text-xs sm:text-sm font-bold text-white">Zero Venture Capital • Zero Advertising • Zero Compromises</h5>
                                        <p class="text-[11px] sm:text-xs text-slate-300 mt-1 leading-relaxed">
                                            There is no board of venture capital investors demanding monthly growth targets or user attention monetization. There are no advertising SDKs selling your habits to third-party ad brokers. Arc Tracker is an independent labor of conviction created to serve your focus and sharpen your mind.
                                        </p>
                                    </div>
                                </div>

                                <div class="flex items-start gap-3">
                                    <div class="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xs shrink-0 mt-0.5">
                                        <i class="fa-solid fa-crown"></i>
                                    </div>
                                    <div>
                                        <h5 class="text-xs sm:text-sm font-bold text-amber-300">What is Arc Gold VIP? (Voluntary Patronage, Never Feature-Gating)</h5>
                                        <p class="text-[11px] sm:text-xs text-slate-300 mt-1 leading-relaxed">
                                            To support ongoing development and engineering, Arc Gold exists solely as an optional VIP patronage tier for supporters who appreciate aesthetic luxuries—such as exclusive 4K 16:9 laptop wallpapers and generative ambient audio drones. Every core productivity feature, habit tracker, rule engine, screen time matrix, and dopamine blocker is—and will always remain—100% free for everyone.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- SECTION 4: THE FOUNDER'S PLEDGE & SIGNATURE -->
                    <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-950/60 to-indigo-950/40 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div class="flex items-center gap-3.5">
                            <div class="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-purple-300 text-xl shrink-0 shadow-inner">
                                <i class="fa-solid fa-signature"></i>
                            </div>
                            <div>
                                <h4 class="text-xs sm:text-sm font-black text-white">Mayank • Founder &amp; Architect</h4>
                                <p class="text-[11px] text-purple-300 font-mono mt-0.5">
                                    "Transform in silence. Let your daily habits and undeniable results speak for you."
                                </p>
                            </div>
                        </div>

                        <div class="flex items-center gap-2 shrink-0">
                            <button type="button" onclick="ArcSettingsAccordion.toggle('settings-about-founder-card', false)" class="px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-sm">
                                <i class="fa-solid fa-chevron-up text-xs text-purple-400"></i>
                                <span>Collapse Story</span>
                            </button>
                        </div>
                    </div>
                </div></div>
            </section>

            <!-- TERMS & CONDITIONS & LEGAL AGREEMENT CARD -->
            <section id="settings-terms-legal-card" class="glass-card rounded-2xl p-4 sm:p-5 border-l-4 border-l-cyan-400 bg-slate-900/90 mb-6 shadow-xl relative overflow-hidden transition-all duration-300" aria-label="Terms and Conditions and Legal Agreement">
                <div class="flex items-center justify-between gap-3 select-none cursor-pointer" tabindex="0" onclick="event.stopPropagation(); ArcSettingsAccordion.toggle('settings-terms-legal-card')" onkeydown="ArcSettingsAccordion.handleKeyDown(event, 'settings-terms-legal-card')">
                    <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div class="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0">
                            <i class="fa-solid fa-scale-balanced text-sm"></i>
                        </div>
                        <div class="min-w-0 flex items-center gap-2 flex-wrap">
                            <h3 class="text-sm sm:text-base font-extrabold text-white truncate">Terms &amp; Conditions &amp; Agreement</h3>
                            <span class="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono font-bold uppercase tracking-wider shrink-0">LEGAL</span>
                            <span id="settings-terms-status-pill" class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold uppercase shrink-0">
                                ✓ TERMS ACCEPTED
                            </span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <button type="button" class="settings-arrow-btn p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white border border-slate-700/80 text-xs flex items-center justify-center transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" aria-label="Toggle Terms &amp; Conditions card" aria-expanded="false" onclick="ArcSettingsAccordion.toggle('settings-terms-legal-card')" onkeydown="ArcSettingsAccordion.handleKeyDown(event, 'settings-terms-legal-card')">
                            <i class="settings-chevron-icon fa-solid fa-chevron-down text-xs transition-transform duration-300"></i>
                        </button>
                    </div>
                </div>

                <div class="arc-fluid-accordion hidden pt-3 border-t border-slate-800/80">
                    <div class="space-y-3">
                        <p class="text-xs text-slate-300 leading-relaxed">
                            Arc Tracker is governed by the Covenant of Self-Discipline and Local Data Sovereignty (Protocol v2026.2). Review the complete terms, privacy protections, and focus lockout authorizations below.
                        </p>
                        <div class="flex flex-wrap items-center gap-2.5 pt-1">
                            <button type="button" onclick="ArcTermsOnboarding.openTermsReader()" class="py-2 px-3.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-2 transition active:scale-95 shadow-sm">
                                <i class="fa-solid fa-file-contract"></i>
                                <span>Read Terms &amp; Conditions</span>
                            </button>
                            <a href="./terms-and-conditions.html" target="_blank" rel="noopener noreferrer" class="py-2 px-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition">
                                <i class="fa-solid fa-arrow-up-right-from-square text-cyan-400"></i>
                                <span>Standalone Terms Page</span>
                            </a>
                            <a href="./privacy-policy.html" target="_blank" rel="noopener noreferrer" class="py-2 px-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition">
                                <i class="fa-solid fa-shield-halved text-emerald-400"></i>
                                <span>Privacy Policy</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
            <!-- ARC GOLD MEMBERSHIP & 120HZ PROMOTION SECTION (AT THE BOTTOM OF SETTINGS) -->
            <div id="settings-gold-card" class="mt-6 mb-8 transition-all duration-500"></div>
        </section>`;
}
