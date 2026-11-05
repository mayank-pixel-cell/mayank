/**
 * Arc Tracker — Universal Automated App Screen Time & App Blocker Engine
 * Enhanced with Native OS Window & Process Tracking (Tauri 2.0 / Rust)
 */

import { arcStorage } from './storage.js';
        const DEFAULT_TRACKED_APPS = [
            { id: 'youtube', name: 'YouTube', category: 'Entertainment', icon: 'fa-brands fa-youtube', colorClass: 'text-red-500', bgClass: 'bg-red-500/10', borderClass: 'border-red-500/30', dailyLimitSecs: 45 * 60, blockEnabled: true, blockInFocus: true },
            { id: 'instagram', name: 'Instagram', category: 'Social Media', icon: 'fa-brands fa-instagram', colorClass: 'text-pink-500', bgClass: 'bg-pink-500/10', borderClass: 'border-pink-500/30', dailyLimitSecs: 30 * 60, blockEnabled: true, blockInFocus: true },
            { id: 'twitter', name: 'X / Twitter', category: 'Social Media', icon: 'fa-brands fa-x-twitter', colorClass: 'text-slate-200', bgClass: 'bg-slate-700/20', borderClass: 'border-slate-500/30', dailyLimitSecs: 30 * 60, blockEnabled: true, blockInFocus: true },
            { id: 'reddit', name: 'Reddit', category: 'Social Media', icon: 'fa-brands fa-reddit-alien', colorClass: 'text-orange-500', bgClass: 'bg-orange-500/10', borderClass: 'border-orange-500/30', dailyLimitSecs: 30 * 60, blockEnabled: true, blockInFocus: true },
            { id: 'tiktok', name: 'TikTok', category: 'Social Media', icon: 'fa-brands fa-tiktok', colorClass: 'text-cyan-400', bgClass: 'bg-cyan-500/10', borderClass: 'border-cyan-500/30', dailyLimitSecs: 20 * 60, blockEnabled: true, blockInFocus: true },
            { id: 'netflix', name: 'Netflix', category: 'Entertainment', icon: 'fa-solid fa-film', colorClass: 'text-red-600', bgClass: 'bg-red-600/10', borderClass: 'border-red-600/30', dailyLimitSecs: 60 * 60, blockEnabled: true, blockInFocus: true },
            { id: 'discord', name: 'Discord', category: 'Messaging', icon: 'fa-brands fa-discord', colorClass: 'text-indigo-400', bgClass: 'bg-indigo-500/10', borderClass: 'border-indigo-500/30', dailyLimitSecs: 60 * 60, blockEnabled: true, blockInFocus: true },
            { id: 'gaming', name: 'Steam / Gaming', category: 'Gaming', icon: 'fa-solid fa-gamepad', colorClass: 'text-purple-400', bgClass: 'bg-purple-500/10', borderClass: 'border-purple-500/30', dailyLimitSecs: 45 * 60, blockEnabled: true, blockInFocus: true },
            { id: 'chrome', name: 'Browser / Surfing', category: 'Browsing', icon: 'fa-brands fa-chrome', colorClass: 'text-cyan-400', bgClass: 'bg-cyan-500/10', borderClass: 'border-cyan-500/30', dailyLimitSecs: 90 * 60, blockEnabled: false, blockInFocus: false },
            { id: 'vscode', name: 'VS Code / Coding', category: 'Productivity', icon: 'fa-solid fa-code', colorClass: 'text-blue-400', bgClass: 'bg-blue-500/10', borderClass: 'border-blue-500/30', dailyLimitSecs: 240 * 60, blockEnabled: false, blockInFocus: false }
        ];

        const DEFAULT_BLOCKED_YOUTUBE_CHANNELS = [
            // Global High-Distraction Channels
            { handle: '@MrBeast', name: 'MrBeast', country: 'Global', reason: 'High sensory distraction & challenges' },
            { handle: '@Sidemen', name: 'Sidemen', country: 'Global', reason: 'Entertainment & challenges' },
            { handle: '@IShowSpeed', name: 'IShowSpeed', country: 'Global', reason: 'Streaming & high noise' },
            { handle: '@PewDiePie', name: 'PewDiePie', country: 'Global', reason: 'Gaming & entertainment' },
            { handle: '@LoganPaul', name: 'Logan Paul', country: 'Global', reason: 'Entertainment & vlogs' },
            { handle: '@TSeries', name: 'T-Series', country: 'India', reason: 'Music videos & trailers distraction' },
            { handle: '@DudePerfect', name: 'Dude Perfect', country: 'Global', reason: 'Trick shots & entertainment' },
            { handle: 'Shorts', name: 'YouTube Shorts Feed', country: 'Global', reason: 'Infinite scrolling short-form loop' },

            // India High-Distraction Entertainment, Roasts, Vlogs & Gaming
            { handle: '@CarryMinati', name: 'CarryMinati (Ajey Nagar)', country: 'India', reason: 'Roasts, gaming & comedy distraction' },
            { handle: '@TotalGaming', name: 'Total Gaming (Ajjubhai)', country: 'India', reason: 'High-volume Free Fire & gaming streams' },
            { handle: '@TechnoGamerzOfficial', name: 'Techno Gamerz (Ujjwal)', country: 'India', reason: 'GTA & marathon gaming streams' },
            { handle: '@ashishchanchlanivines', name: 'Ashish Chanchlani', country: 'India', reason: 'Comedy skits & entertainment' },
            { handle: '@BBKiVines', name: 'BB Ki Vines (Bhuvan Bam)', country: 'India', reason: 'Comedy skits & web entertainment' },
            { handle: '@Round2hell', name: 'Round2hell', country: 'India', reason: 'High-energy comedy skits' },
            { handle: '@triggeredinsaan', name: 'Triggered Insaan (Nischay)', country: 'India', reason: 'Reaction videos, roasts & memes' },
            { handle: '@souravjoshivlogs7028', name: 'Sourav Joshi Vlogs', country: 'India', reason: 'Daily high-frequency vlog binges' },
            { handle: '@Mythpat', name: 'Mythpat (Mithilesh)', country: 'India', reason: 'Gaming & comedy entertainment' },
            { handle: '@HarshBeniwal', name: 'Harsh Beniwal', country: 'India', reason: 'Comedy sketches & drama' },
            { handle: '@ElvishYadavVlogs', name: 'Elvish Yadav', country: 'India', reason: 'Vlogs, lifestyle & drama' },
            { handle: '@TanmayBhatYT', name: 'Tanmay Bhat', country: 'India', reason: 'Meme reviews & reaction streams' }
        ];

        const DEFAULT_ALLOWED_YOUTUBE_CHANNELS = [
            // India Premier Educational & Technical Channels
            { handle: '@chaiaurcode', name: 'Chai aur Code (Hitesh Choudhary)', country: 'India', category: 'Software Engineering & JavaScript' },
            { handle: '@CodeWithHarry', name: 'CodeWithHarry (Haris Khan)', country: 'India', category: 'Python, C++, Web Development' },
            { handle: '@ApnaCollegeOfficial', name: 'Apna College (Shradha Khapra)', country: 'India', category: 'DSA, Java, Web Development' },
            { handle: '@PhysicsWallah', name: 'Physics Wallah (Alakh Pandey)', country: 'India', category: 'Physics, Science & Academics' },
            { handle: '@KhanGSRecentre', name: 'Khan GS Research Centre (Khan Sir)', country: 'India', category: 'General Science, Geopolitics & UPSC' },
            { handle: '@ThinkSchool', name: 'Think School (Parth Verma)', country: 'India', category: 'Business Case Studies & Strategy' },
            { handle: '@mohak_mangal', name: 'Soch by Mohak Mangal', country: 'India', category: 'Indian Policy, Economics & Analysis' },
            { handle: '@NitishRajput', name: 'Nitish Rajput', country: 'India', category: 'Investigative Research & Current Affairs' },
            { handle: '@GateSmashers', name: 'Gate Smashers (Varun Singla)', country: 'India', category: 'Computer Science Core, OS & GATE' },
            { handle: '@lovebabbar', name: 'Love Babbar (CodeHelp)', country: 'India', category: 'DSA in C++, System Design & Placement' },
            { handle: '@takeUforward', name: 'take U forward (Striver)', country: 'India', category: 'SDE Sheet, Algorithms & LeetCode' },
            { handle: '@NPTELIITM', name: 'NPTEL India (IIT Lectures)', country: 'India', category: 'Premier Indian University Lectures' },
            { handle: '@GeekyShows', name: 'Geeky Shows', country: 'India', category: 'Core Programming & Web Frameworks' },

            // Global Premier Educational Channels
            { handle: '@freecodecamp', name: 'freeCodeCamp.org', country: 'Global', category: 'Full-Stack Software Engineering' },
            { handle: '@hubermanlab', name: 'Andrew Huberman', country: 'Global', category: 'Neuroscience & Deep Focus' },
            { handle: '@lexfridman', name: 'Lex Fridman', country: 'Global', category: 'Deep Conversations, AI & Robotics' },
            { handle: '@3blue1brown', name: '3Blue1Brown (Grant Sanderson)', country: 'Global', category: 'Mathematics & Neural Networks' },
            { handle: '@fireship', name: 'Fireship (Jeff Delaney)', country: 'Global', category: 'High-Velocity Tech & Code in 100s' },
            { handle: '@veritasium', name: 'Veritasium (Derek Muller)', country: 'Global', category: 'Physics & Scientific Reasoning' },
            { handle: '@mitocw', name: 'MIT OpenCourseWare', country: 'Global', category: 'Undergraduate & Graduate Lectures' }
        ];

        const DEFAULT_BLOCKED_WEBSITES = [
            { domain: 'youtube.com', name: 'YouTube', category: 'Video / Streaming', reason: 'Infinite autoplay & video rabbit holes' },
            { domain: 'instagram.com', name: 'Instagram', category: 'Social Media', reason: 'Reels doomscrolling & endless stories' },
            { domain: 'reddit.com', name: 'Reddit', category: 'Social Media', reason: 'Meme rabbit holes & infinite comment threads' },
            { domain: 'x.com', name: 'X / Twitter', category: 'Social Media', reason: 'Timeline arguments & continuous refreshing' },
            { domain: 'twitter.com', name: 'Twitter', category: 'Social Media', reason: 'Social feed distraction' },
            { domain: 'facebook.com', name: 'Facebook', category: 'Social Media', reason: 'Social feed & marketplace distraction' },
            { domain: 'netflix.com', name: 'Netflix', category: 'Streaming', reason: 'Binge-watching shows & movies during work' },
            { domain: 'hotstar.com', name: 'JioCinema / Disney+ Hotstar', category: 'Streaming & Cricket', reason: 'Cricket livestreams & movies' },
            { domain: 'primevideo.com', name: 'Amazon Prime Video', category: 'Streaming', reason: 'Entertainment movies & drama series' },
            { domain: 'twitch.tv', name: 'Twitch', category: 'Live Streaming', reason: 'Gaming livestreams & chat distraction' },
            { domain: 'cricbuzz.com', name: 'Cricbuzz', category: 'Live Scores', reason: 'Compulsive cricket score-checking' },
            { domain: 'quora.com', name: 'Quora', category: 'Forums', reason: 'Unfocused reading rabbit holes' },
            { domain: 'tiktok.com', name: 'TikTok', category: 'Short Video', reason: 'Short-form dopamine loop' }
        ];

        const DEFAULT_ALLOWED_WEBSITES = [
            { domain: 'github.com', name: 'GitHub', category: 'Developer Repositories' },
            { domain: 'stackoverflow.com', name: 'Stack Overflow', category: 'Programming Q&A' },
            { domain: 'google.com', name: 'Google Search', category: 'Academic & Technical Research' },
            { domain: 'notion.so', name: 'Notion', category: 'Workspace & Notes' },
            { domain: 'leetcode.com', name: 'LeetCode', category: 'Algorithm Practice' },
            { domain: 'geeksforgeeks.org', name: 'GeeksforGeeks', category: 'Computer Science Documentation' },
            { domain: 'wikipedia.org', name: 'Wikipedia', category: 'Factual Reference' },
            { domain: 'developer.mozilla.org', name: 'MDN Web Docs', category: 'Web Documentation' },
            { domain: 'chatgpt.com', name: 'ChatGPT', category: 'AI Coding Assistant' }
        ];

        let appTrackerState = {
            apps: [],
            usage: {},
            activeAppId: null,
            activeFilter: 'all',
            searchQuery: '',
            strictMode: false,
            permissionGranted: false,
            blockedShieldAppId: null,
            blockedFocusAppId: null,
            focusActive: false,
            focusSecondsLeft: 25 * 60,
            focusTotalSeconds: 25 * 60,
            youtubeFilter: {
                enabled: true,
                blockShorts: true,
                blockedChannels: JSON.parse(JSON.stringify(DEFAULT_BLOCKED_YOUTUBE_CHANNELS))
            },
            websiteFilter: {
                enabled: true,
                blockedWebsites: JSON.parse(JSON.stringify(DEFAULT_BLOCKED_WEBSITES))
            },
            timer: null
        };
        window.appTrackerState = appTrackerState;

        function initAppTracker() {
        initNativeOsBridge();

            try {
                // Load tracked apps catalog
                const savedApps = getLocalStorageItem('arc_tracked_apps_catalog');
                if (Array.isArray(savedApps) && savedApps.length > 0) {
                    const map = new Map();
                    DEFAULT_TRACKED_APPS.forEach(a => map.set(a.id, { ...a }));
                    savedApps.forEach(sa => {
                        if (map.has(sa.id)) map.set(sa.id, { ...map.get(sa.id), ...sa });
                        else map.set(sa.id, sa);
                    });
                    appTrackerState.apps = Array.from(map.values());
                } else {
                    appTrackerState.apps = JSON.parse(JSON.stringify(DEFAULT_TRACKED_APPS));
                }

                // Load YouTube filter config
                const savedYt = getLocalStorageItem('arc_youtube_channel_filter');
                if (savedYt && typeof savedYt === 'object') {
                    appTrackerState.youtubeFilter = { ...appTrackerState.youtubeFilter, ...savedYt };
                }

                // Load Website filter config
                const savedWeb = getLocalStorageItem('arc_website_filter');
                if (savedWeb && typeof savedWeb === 'object') {
                    appTrackerState.websiteFilter = { ...appTrackerState.websiteFilter, ...savedWeb };
                }

                // Load today's per-app usage
                const todayKey = getTodayKey();
                const savedUsage = getLocalStorageItem(`arc_app_usage_${todayKey}`);
                appTrackerState.usage = (savedUsage && typeof savedUsage === 'object') ? savedUsage : {};

                // Load permissions & strict mode
                appTrackerState.permissionGranted = lsGetRaw('arc_app_accessibility_perm') === 'granted';
                appTrackerState.strictMode = lsGetRaw('arc_app_strict_mode') === 'true';

                // Initial render
                renderScreenTimeView();

                // Start 1-second live ticker
                if (appTrackerState.timer) clearInterval(appTrackerState.timer);
                appTrackerState.timer = setInterval(tickAppTracker, 1000);

            } catch (err) {
                console.warn('[ArcAppTracker] Init error:', err);
            }
        }

        function saveAppTrackerData() {
            try {
                const todayKey = getTodayKey();
                setLocalStorageItem(`arc_app_usage_${todayKey}`, appTrackerState.usage);
                setLocalStorageItem('arc_tracked_apps_catalog', appTrackerState.apps);
                setLocalStorageItem('arc_youtube_channel_filter', appTrackerState.youtubeFilter);
                setLocalStorageItem('arc_website_filter', appTrackerState.websiteFilter);
                setLocalStorageItem('arc_app_accessibility_perm', appTrackerState.permissionGranted ? 'granted' : 'pending');
                setLocalStorageItem('arc_app_strict_mode', appTrackerState.strictMode ? 'true' : 'false');
            } catch (_) {}
        }

        function isFocusActive() {
            if (typeof window !== 'undefined' && window.F && window.F.run && window.F.mode === 'work') {
                return true;
            }
            return !!(appTrackerState && appTrackerState.focusActive);
        }

        function getFocusTimeRemainingFormatted() {
            if (typeof window !== 'undefined' && window.F && window.F.left !== undefined && window.F.run) {
                const mins = Math.floor(window.F.left / 60);
                const secs = window.F.left % 60;
                return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            }
            const secsLeft = appTrackerState && appTrackerState.focusSecondsLeft ? appTrackerState.focusSecondsLeft : 0;
            const mins = Math.floor(secsLeft / 60);
            const secs = secsLeft % 60;
            return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }

        function tickAppTracker() {
            // Check midnight rollover
            const todayKey = getTodayKey();
            if (!appTrackerState.usage || appTrackerState.currentDayKey !== todayKey) {
                appTrackerState.currentDayKey = todayKey;
            }

            // Decrement internal focus session if running
            if (appTrackerState.focusActive && appTrackerState.focusSecondsLeft > 0) {
                appTrackerState.focusSecondsLeft--;
                const today = getTodayKey();
                state.dailyFocus = state.dailyFocus || {};
                state.dailyFocus[today] = (state.dailyFocus[today] || 0) + 1;
                state.timer = state.timer || { totalFocusSeconds: 0 };
                state.timer.totalFocusSeconds = (state.timer.totalFocusSeconds || 0) + 1;
                if (appTrackerState.focusSecondsLeft <= 0) {
                    stopFocusSession(true);
                }
            }

            // Live update focus countdown elements
            const formatted = getFocusTimeRemainingFormatted();
            const focusTimeLeftEl = document.getElementById('focus-blocker-time-left');
            if (focusTimeLeftEl) focusTimeLeftEl.textContent = formatted;

            const webTimeLeftEl = document.getElementById('web-blocker-time-left');
            if (webTimeLeftEl) webTimeLeftEl.textContent = formatted;

            const focusBannerTimerEl = document.getElementById('st-focus-banner-timer');
            if (focusBannerTimerEl) focusBannerTimerEl.textContent = formatted;

            const strictTimeLeftEl = document.getElementById('strict-lockout-time-left');
            if (strictTimeLeftEl) strictTimeLeftEl.textContent = formatted;

            // If an app is active in foreground
            if (appTrackerState.activeAppId) {
                const appId = appTrackerState.activeAppId;
                const app = appTrackerState.apps.find(a => a.id === appId);
                if (app) {
                    // Check if Focus Mode became active and this app is blocked in focus
                    if (isFocusActive() && app.blockInFocus) {
                        triggerFocusBlock(appId);
                        return;
                    }

                    appTrackerState.usage[appId] = (appTrackerState.usage[appId] || 0) + 1;
                    const used = appTrackerState.usage[appId];

                    // Check if daily limit reached
                    if (app.blockEnabled && used >= app.dailyLimitSecs) {
                        triggerAppLockout(appId);
                        return;
                    }

                    // Live update active app timer in DOM
                    const activePill = document.getElementById(`st-active-counter-${appId}`);
                    if (activePill) activePill.textContent = formatDuration(used);

                    const totalTimeEl = document.getElementById('st-kpi-total-time');
                    if (totalTimeEl) {
                        let total = 0;
                        Object.values(appTrackerState.usage).forEach(v => total += (v || 0));
                        totalTimeEl.textContent = formatDuration(total);
                    }
                }
            }

            // Update blocker countdown if overlay is visible
            if (appTrackerState.blockedShieldAppId) {
                updateBlockerCountdown();
            }
        }

        function isAppBlocked(appId) {
            const app = appTrackerState.apps.find(a => a.id === appId);
            if (!app) return false;

            // Check Focus / Pomodoro block
            if (isFocusActive() && app.blockInFocus) {
                return true;
            }

            // Check Daily quota limit
            if (app.blockEnabled) {
                const used = appTrackerState.usage[appId] || 0;
                if (used >= app.dailyLimitSecs) return true;
            }

            return false;
        }

        function setActiveApp(appId, evt) {
            const app = appTrackerState.apps.find(a => a.id === appId);
            if (!app) return;

            // 1. Check if Focus is active and app is blocked in focus
            if (isFocusActive() && app.blockInFocus) {
                triggerFocusBlock(appId);
                return;
            }

            // 2. Check if daily limit is exhausted
            if (app.blockEnabled && (appTrackerState.usage[appId] || 0) >= app.dailyLimitSecs) {
                triggerAppLockout(appId);
                return;
            }

            // 3. Special notice for Chrome/Browser
            if (appId === 'chrome' && isFocusActive() && appTrackerState.websiteFilter.enabled) {
                showToast(`Chrome active: ${appTrackerState.websiteFilter.blockedWebsites.length} distracting websites (YouTube, Instagram, etc.) are blocked.`);
            } else {
                showToast(`Tracking active on ${app.name}`);
            }

            appTrackerState.activeAppId = appId;
            playSfx('quantumHum');

            // Interactive visual particle burst and floating combat feedback
            const clientX = evt && evt.clientX ? evt.clientX : window.innerWidth / 2;
            const clientY = evt && evt.clientY ? evt.clientY : window.innerHeight / 2;
            if (typeof triggerGradeParticleBurst === 'function') {
                triggerGradeParticleBurst(clientX, clientY, 'A');
            }
            if (typeof spawnFloatingCombatText === 'function') {
                spawnFloatingCombatText(`🚀 TRACKING: ${app.name.toUpperCase()}`, clientX, clientY);
            }

            renderScreenTimeView();
        }

        function pauseActiveApp() {
            appTrackerState.activeAppId = null;
            playSfx('click');
            renderScreenTimeView();
        }

        function triggerAppLockout(appId) {
            const app = appTrackerState.apps.find(a => a.id === appId);
            if (!app) return;

            if (appTrackerState.activeAppId === appId) {
                appTrackerState.activeAppId = null;
            }

            playBlockerAlarmSfx();
            showBlockerShield(appId);
            renderScreenTimeView();
        }

        function triggerFocusBlock(appId) {
            const app = appTrackerState.apps.find(a => a.id === appId);
            if (!app) return;

            if (appTrackerState.activeAppId === appId) {
                appTrackerState.activeAppId = null;
            }

            playBlockerAlarmSfx();
            showFocusBlockerShield(appId);
            renderScreenTimeView();
        }

        function showBlockerShield(appId) {
            const app = appTrackerState.apps.find(a => a.id === appId);
            if (!app) return;

            appTrackerState.blockedShieldAppId = appId;
            const overlay = document.getElementById('arc-app-blocker-overlay');
            if (!overlay) return;

            const used = appTrackerState.usage[appId] || 0;
            const limit = app.dailyLimitSecs;

            const nameEl = document.getElementById('blocker-app-name');
            const iconEl = document.getElementById('blocker-app-icon');
            const usedEl = document.getElementById('blocker-time-used');
            const limitEl = document.getElementById('blocker-time-limit');
            const challengeInput = document.getElementById('blocker-challenge-input');
            const challengeBox = document.getElementById('blocker-challenge-box');
            const errorEl = document.getElementById('blocker-challenge-error');

            if (nameEl) nameEl.textContent = app.name;
            if (iconEl) iconEl.className = `${app.icon} text-3xl sm:text-4xl text-rose-500`;
            if (usedEl) usedEl.textContent = formatDuration(used);
            if (limitEl) limitEl.textContent = formatDuration(limit);
            if (challengeInput) challengeInput.value = '';
            if (errorEl) errorEl.classList.add('hidden');

            if (challengeBox) {
                if (appTrackerState.strictMode) {
                    challengeBox.innerHTML = `<div class="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs text-center font-bold"><i class="fa-solid fa-lock mr-1.5"></i> Strict Mode Active — No Emergency Extensions Permitted Today.</div>`;
                }
            }

            updateBlockerCountdown();
            overlay.classList.remove('hidden');
            overlay.classList.add('flex');
        }

        function closeBlockerShield() {
            appTrackerState.blockedShieldAppId = null;
            const overlay = document.getElementById('arc-app-blocker-overlay');
            if (overlay) {
                overlay.classList.add('hidden');
                overlay.classList.remove('flex');
            }
        }

        function showFocusBlockerShield(appId) {
            const app = appTrackerState.apps.find(a => a.id === appId);
            if (!app) return;

            appTrackerState.blockedFocusAppId = appId;
            const overlay = document.getElementById('arc-focus-blocker-overlay');
            if (!overlay) return;

            const nameEl = document.getElementById('focus-blocker-app-name');
            const iconEl = document.getElementById('focus-blocker-app-icon');
            const timeEl = document.getElementById('focus-blocker-time-left');

            if (nameEl) nameEl.textContent = app.name;
            if (iconEl) iconEl.className = `${app.icon} text-3xl sm:text-4xl text-purple-400`;
            if (timeEl) timeEl.textContent = getFocusTimeRemainingFormatted();

            overlay.classList.remove('hidden');
            overlay.classList.add('flex');
        }

        function closeFocusBlockerShield() {
        releaseWindowShield();

            appTrackerState.blockedFocusAppId = null;
            const overlay = document.getElementById('arc-focus-blocker-overlay');
            if (overlay) {
                overlay.classList.add('hidden');
                overlay.classList.remove('flex');
            }
        }

        function showYouTubeBlockerShield(channelName, reason) {
            const overlay = document.getElementById('arc-youtube-blocker-overlay');
            if (!overlay) return;

            const nameEl = document.getElementById('yt-blocker-channel-name');
            const reasonEl = document.getElementById('yt-blocker-reason-text');

            if (nameEl) nameEl.textContent = channelName || 'Restricted Channel';
            if (reasonEl) reasonEl.textContent = reason ? `Restricted because: ${reason}. Educational tutorials remain fully accessible.` : 'This creator is classified as high-dopamine distraction. Educational tutorials and technical lectures remain fully accessible.';

            playBlockerAlarmSfx();
            overlay.classList.remove('hidden');
            overlay.classList.add('flex');
        }

        function closeYouTubeBlockerShield() {
        releaseWindowShield();

            const overlay = document.getElementById('arc-youtube-blocker-overlay');
            if (overlay) {
                overlay.classList.add('hidden');
                overlay.classList.remove('flex');
            }
        }

        function showWebsiteBlockerShield(domainName, reason) {
            const overlay = document.getElementById('arc-website-blocker-overlay');
            if (!overlay) return;

            const domainEl = document.getElementById('web-blocker-domain-name');
            const reasonEl = document.getElementById('web-blocker-reason-text');
            const timeEl = document.getElementById('web-blocker-time-left');

            if (domainEl) domainEl.textContent = domainName || 'Restricted Website';
            if (reasonEl) reasonEl.textContent = reason ? `Restricted because: ${reason}. Productive tools (GitHub, StackOverflow, Docs) remain accessible.` : 'Access to this site is locked during active Focus sprints to prevent browsing rabbit holes.';
            if (timeEl) timeEl.textContent = getFocusTimeRemainingFormatted();

            playBlockerAlarmSfx();
            overlay.classList.remove('hidden');
            overlay.classList.add('flex');
        }

        function closeWebsiteBlockerShield() {
        releaseWindowShield();

            const overlay = document.getElementById('arc-website-blocker-overlay');
            if (overlay) {
                overlay.classList.add('hidden');
                overlay.classList.remove('flex');
            }
        }

        function updateBlockerCountdown() {
            const el = document.getElementById('blocker-reset-countdown');
            if (!el) return;

            const now = new Date();
            const midnight = new Date(now);
            midnight.setHours(24, 0, 0, 0);
            const diffSecs = Math.max(0, Math.floor((midnight - now) / 1000));

            const hrs = Math.floor(diffSecs / 3600);
            const mins = Math.floor((diffSecs % 3600) / 60);
            const secs = diffSecs % 60;

            el.textContent = `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
        }

        function submitEmergencyExtension() {
            if (appTrackerState.strictMode) {
                alert("Strict Mode is turned on. Emergency extensions are disabled to protect your discipline.");
                return;
            }

            const input = document.getElementById('blocker-challenge-input');
            const errorEl = document.getElementById('blocker-challenge-error');
            if (!input || !appTrackerState.blockedShieldAppId) return;

            const val = input.value.trim().toUpperCase();
            if (val !== 'UNBREAKABLE') {
                if (errorEl) {
                    errorEl.textContent = 'Phrase incorrect. You must type UNBREAKABLE in all caps.';
                    errorEl.classList.remove('hidden');
                }
                playSfx('click');
                return;
            }

            // Grant 5 extra minutes (300 seconds)
            const app = appTrackerState.apps.find(a => a.id === appTrackerState.blockedShieldAppId);
            if (app) {
                app.dailyLimitSecs += 300;
                saveAppTrackerData();
            }

            closeBlockerShield();
            playSfx('fanfare');
            showToast("+5 Minutes Emergency Extension granted. Use wisely.");
            renderScreenTimeView();
        }

        /* Focus Mode Controls */
        function startFocusSession(minutes = 25) {
            appTrackerState.focusActive = true;
            appTrackerState.focusSecondsLeft = minutes * 60;
            appTrackerState.focusTotalSeconds = minutes * 60;

            // Trigger global PP12 Pomodoro if available
            if (typeof window !== 'undefined' && typeof window.fstart === 'function') {
                try { window.fstart(); } catch (_) {}
            }

            playSfx('fanfare');
            const strictNotice = isFocusStrictModeActive()
                ? " 🔒 Arc Gold Strict Mode ACTIVE: Early exit is disabled!"
                : "";
            showToast(`Focus session started (${minutes}m). Distracting apps & websites blocked!${strictNotice}`);
            renderScreenTimeView();
            updateStrictModeUI();
        }

        function stopFocusSession(completed = false) {
            if (!completed && isFocusStrictModeActive()) {
                triggerStrictModeLockoutNotice();
                return false;
            }

            const wasStrict = isFocusStrictModeActive();
            appTrackerState.focusActive = false;

            if (typeof window !== 'undefined' && typeof window.fpause === 'function') {
                try { window.fpause(true); } catch (_) {}
            }

            if (completed) {
                playSfx('fanfare');
                if (wasStrict) {
                    showToast("🏆 Strict Mode Focus session conquered! 100% discipline maintained.");
                } else {
                    showToast("Focus session completed! Great discipline.");
                }
                const today = getTodayKey();
                if (Array.isArray(state.screenTimeLogs)) {
                    state.screenTimeLogs.push({
                        date: today,
                        type: 'focus',
                        seconds: appTrackerState.focusTotalSeconds || 1500,
                        ts: Date.now(),
                        strictMode: wasStrict
                    });
                }
                saveToLocalStorage();
                try { if (typeof renderProgressionTab === 'function') renderProgressionTab(); } catch(_) {}
            } else {
                playSfx('click');
                showToast("Focus session stopped.");
                saveToLocalStorage();
            }

            closeFocusBlockerShield();
            closeWebsiteBlockerShield();
            closeStrictModeLockoutModal();
            renderScreenTimeView();
            updateStrictModeUI();
        }

        function toggleAppFocusBlock(appId) {
            const app = appTrackerState.apps.find(a => a.id === appId);
            if (!app) return;

            app.blockInFocus = !app.blockInFocus;
            saveAppTrackerData();
            playSfx('click');
            showToast(`${app.name} is now ${app.blockInFocus ? 'BLOCKED' : 'ALLOWED'} during Focus.`);
            renderScreenTimeView();
            renderFocusBlocklistModal();
        }

        function setAllAppsFocusBlock(type) {
            appTrackerState.apps.forEach(app => {
                if (type === 'distractions') {
                    app.blockInFocus = (app.category === 'Social Media' || app.category === 'Entertainment' || app.category === 'Gaming' || app.category === 'Messaging');
                } else {
                    app.blockInFocus = Boolean(type);
                }
            });
            saveAppTrackerData();
            playSfx('check');
            showToast("Focus blocklist updated.");
            renderScreenTimeView();
            renderFocusBlocklistModal();
        }

        function openFocusBlocklistModal() {
            renderFocusBlocklistModal();
            const modal = document.getElementById('arc-focus-blocklist-modal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        }

        function closeFocusBlocklistModal() {
            const modal = document.getElementById('arc-focus-blocklist-modal');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
            renderScreenTimeView();
        }

        function renderFocusBlocklistModal() {
            const listEl = document.getElementById('focus-modal-app-list');
            if (!listEl) return;

            listEl.innerHTML = appTrackerState.apps.map(app => {
                const isBlocked = Boolean(app.blockInFocus);
                return `
                    <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                        <div class="flex items-center space-x-2.5">
                            <div class="w-8 h-8 rounded-xl ${app.bgClass} border ${app.borderClass} flex items-center justify-center text-sm shrink-0">
                                <i class="${app.icon} ${app.colorClass}"></i>
                            </div>
                            <div>
                                <span class="text-xs font-bold text-white block">${app.name}</span>
                                <span class="text-[10px] text-slate-400">${app.category}</span>
                            </div>
                        </div>

                        <button role="button" onclick="toggleAppFocusBlock('${app.id}')" class="px-3 py-1 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 ${isBlocked ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 hover:bg-purple-600/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'}">
                            <i class="fa-solid ${isBlocked ? 'fa-lock text-purple-400' : 'fa-lock-open text-slate-500'} text-[11px]"></i>
                            <span>${isBlocked ? 'BLOCKED' : 'ALLOWED'}</span>
                        </button>
                    </div>
                `;
            }).join('');
        }

        /* YouTube Channel Filter Controls */
        function isYouTubeChannelBlocked(channelInput) {
            if (!appTrackerState.youtubeFilter.enabled || !channelInput) return false;
            const query = channelInput.trim().toLowerCase();

            // Check Shorts
            if (appTrackerState.youtubeFilter.blockShorts && (query === 'shorts' || query.includes('/shorts') || query.includes('short'))) {
                return { blocked: true, channel: 'YouTube Shorts', reason: 'Short-form distraction loop' };
            }

            for (const b of appTrackerState.youtubeFilter.blockedChannels) {
                const h = b.handle.toLowerCase().replace('@', '');
                const n = b.name.toLowerCase();
                const qClean = query.replace('@', '');

                if (qClean === h || query.includes(h) || query.includes(n) || n.includes(qClean)) {
                    return { blocked: true, channel: b.name || b.handle, reason: b.reason || 'Distracting channel' };
                }
            }

            return false;
        }

        function toggleYouTubeFilterEnabled() {
            appTrackerState.youtubeFilter.enabled = !appTrackerState.youtubeFilter.enabled;
            saveAppTrackerData();
            playSfx('click');
            showToast(appTrackerState.youtubeFilter.enabled ? "YouTube Channel Filter ACTIVE." : "YouTube Channel Filter paused.");
            renderScreenTimeView();
        }

        function toggleYouTubeShortsBlock() {
            appTrackerState.youtubeFilter.blockShorts = !appTrackerState.youtubeFilter.blockShorts;
            saveAppTrackerData();
            playSfx('click');
            showToast(appTrackerState.youtubeFilter.blockShorts ? "YouTube Shorts Feed BLOCKED." : "YouTube Shorts allowed.");
            renderScreenTimeView();
        }

        function submitAddBlockedChannel() {
            const input = document.getElementById('yt-add-channel-input');
            const reasonInput = document.getElementById('yt-add-reason-input');
            const val = input?.value.trim();
            if (!val) {
                alert("Please enter a channel name or @handle.");
                return;
            }

            const cleanHandle = val.startsWith('@') ? val : '@' + val;
            const existing = appTrackerState.youtubeFilter.blockedChannels.find(c => c.handle.toLowerCase() === cleanHandle.toLowerCase());
            if (existing) {
                alert(`${cleanHandle} is already in the blocked list.`);
                return;
            }

            const reason = reasonInput?.value.trim() || 'Entertainment / Distraction';
            appTrackerState.youtubeFilter.blockedChannels.push({
                handle: cleanHandle,
                name: val.replace('@', ''),
                country: 'Custom',
                reason
            });

            saveAppTrackerData();
            playSfx('fanfare');
            if (input) input.value = '';
            if (reasonInput) reasonInput.value = '';
            showToast(`Blocked ${cleanHandle} on YouTube.`);
            renderYouTubeFilterModal();
            renderScreenTimeView();
        }

        function removeBlockedYouTubeChannel(handle) {
            appTrackerState.youtubeFilter.blockedChannels = appTrackerState.youtubeFilter.blockedChannels.filter(c => c.handle.toLowerCase() !== handle.toLowerCase());
            saveAppTrackerData();
            playSfx('click');
            showToast(`Unblocked ${handle} on YouTube.`);
            renderYouTubeFilterModal();
            renderScreenTimeView();
        }

        function openYouTubeFilterModal() {
            renderYouTubeFilterModal();
            const modal = document.getElementById('arc-youtube-filter-modal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        }

        function closeYouTubeFilterModal() {
            const modal = document.getElementById('arc-youtube-filter-modal');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
            renderScreenTimeView();
        }

        function renderYouTubeFilterModal() {
            const masterToggle = document.getElementById('yt-filter-master-toggle');
            const shortsToggle = document.getElementById('yt-filter-shorts-toggle');
            const countBadge = document.getElementById('yt-blocked-count-badge');
            const listEl = document.getElementById('yt-modal-blocked-list');

            if (masterToggle) masterToggle.checked = appTrackerState.youtubeFilter.enabled;
            if (shortsToggle) shortsToggle.checked = appTrackerState.youtubeFilter.blockShorts;
            if (countBadge) countBadge.textContent = appTrackerState.youtubeFilter.blockedChannels.length;

            if (listEl) {
                listEl.innerHTML = appTrackerState.youtubeFilter.blockedChannels.map(item => {
                    const isIndia = item.country === 'India';
                    return `
                        <div class="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                            <div class="flex items-center space-x-2">
                                <div class="w-6 h-6 rounded-lg bg-red-500/20 text-red-500 flex items-center justify-center font-bold text-[10px]">
                                    <i class="fa-brands fa-youtube"></i>
                                </div>
                                <div>
                                    <div class="flex items-center gap-1.5 flex-wrap">
                                        <span class="font-bold text-white">${item.handle}</span>
                                        ${isIndia ? '<span class="text-[9px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300 font-mono">🇮🇳 India</span>' : '<span class="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">🌐 Global</span>'}
                                    </div>
                                    <span class="text-[10px] text-slate-400 block">${item.reason}</span>
                                </div>
                            </div>

                            <button role="button" onclick="removeBlockedYouTubeChannel('${item.handle}')" title="Unblock channel" aria-label="Unblock ${item.handle}" class="w-7 h-7 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 flex items-center justify-center transition border border-slate-800">
                                <i class="fa-solid fa-trash text-xs"></i>
                            </button>
                        </div>
                    `;
                }).join('');
            }
        }

        function runYouTubeChannelTest() {
            const input = document.getElementById('yt-test-channel-input');
            const feedback = document.getElementById('yt-test-feedback-box');
            const val = input?.value.trim();
            if (!val || !feedback) return;

            const check = isYouTubeChannelBlocked(val);
            feedback.classList.remove('hidden');

            if (check && check.blocked) {
                feedback.className = "text-[11px] font-mono text-rose-400 bg-rose-950/40 p-2 rounded-xl border border-rose-500/30 flex items-center justify-between";
                feedback.innerHTML = `
                    <span>⛔ <strong>${check.channel}</strong> is RESTRICTED (${check.reason})</span>
                    <button role="button" onclick="showYouTubeBlockerShield('${check.channel}', '${check.reason}')" class="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold">Simulate Block</button>
                `;
                showYouTubeBlockerShield(check.channel, check.reason);
            } else {
                feedback.className = "text-[11px] font-mono text-emerald-400 bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/30";
                feedback.innerHTML = `✓ <strong>${val}</strong> is ALLOWED. Educational/Permitted channel.`;
                playSfx('check');
            }
        }

        /* Chrome & Browser Website Filter Controls */
        function isWebsiteBlocked(urlOrDomain) {
            if (!appTrackerState.websiteFilter.enabled || !urlOrDomain) return false;
            let query = urlOrDomain.trim().toLowerCase();

            try {
                if (query.startsWith('http://') || query.startsWith('https://')) {
                    const parsed = new URL(query);
                    query = parsed.hostname.toLowerCase();
                }
            } catch (_) {}

            query = query.replace(/^www\./, '');

            for (const site of appTrackerState.websiteFilter.blockedWebsites) {
                const targetDomain = site.domain.toLowerCase().replace(/^www\./, '');
                if (query === targetDomain || query.endsWith('.' + targetDomain) || query.includes(targetDomain)) {
                    return {
                        blocked: true,
                        domain: site.domain,
                        name: site.name || site.domain,
                        reason: site.reason || 'Distracting website blocked during Focus Sprint'
                    };
                }
            }

            return false;
        }

        function toggleWebsiteFilterEnabled() {
            appTrackerState.websiteFilter.enabled = !appTrackerState.websiteFilter.enabled;
            saveAppTrackerData();
            playSfx('click');
            showToast(appTrackerState.websiteFilter.enabled ? "Chrome Website Filter ACTIVE." : "Chrome Website Filter paused.");
            renderScreenTimeView();
        }

        function addBlockedWebsite(domain, name, reason) {
            if (!domain) return;
            let clean = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
            const existing = appTrackerState.websiteFilter.blockedWebsites.find(w => w.domain.toLowerCase() === clean);
            if (existing) {
                if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
                    window.showToast(`${clean} is already in the website blocklist.`);
                }
                return;
            }

            appTrackerState.websiteFilter.blockedWebsites.push({
                domain: clean,
                name: name || clean,
                category: 'Custom Restricted',
                reason: reason || 'Distracting website'
            });

            saveAppTrackerData();
            if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
                showToast(`Blocked ${clean} in Chrome during focus.`);
            }
            renderWebsiteFilterModal();
            renderScreenTimeView();
        }

        function submitAddBlockedWebsite() {
            const input = document.getElementById('web-add-domain-input');
            const reasonInput = document.getElementById('web-add-reason-input');
            const val = input?.value.trim();
            if (!val) {
                alert("Please enter a domain or website URL (e.g. cricbuzz.com or hotstar.com).");
                return;
            }

            const reason = reasonInput?.value.trim() || 'Distracting website';
            addBlockedWebsite(val, val, reason);

            playSfx('fanfare');
            if (input) input.value = '';
            if (reasonInput) reasonInput.value = '';
        }

        function removeBlockedWebsite(domain) {
            appTrackerState.websiteFilter.blockedWebsites = appTrackerState.websiteFilter.blockedWebsites.filter(w => w.domain.toLowerCase() !== domain.toLowerCase());
            saveAppTrackerData();
            playSfx('click');
            showToast(`Unblocked ${domain} in browser.`);
            renderWebsiteFilterModal();
            renderScreenTimeView();
        }

        function openWebsiteFilterModal() {
            renderWebsiteFilterModal();
            const modal = document.getElementById('arc-website-filter-modal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        }

        function closeWebsiteFilterModal() {
            const modal = document.getElementById('arc-website-filter-modal');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
            renderScreenTimeView();
        }

        function renderWebsiteFilterModal() {
            const masterToggle = document.getElementById('web-filter-master-toggle');
            const countBadge = document.getElementById('web-blocked-count-badge');
            const listEl = document.getElementById('web-modal-blocked-list');

            if (masterToggle) masterToggle.checked = appTrackerState.websiteFilter.enabled;
            if (countBadge) countBadge.textContent = appTrackerState.websiteFilter.blockedWebsites.length;

            if (listEl) {
                listEl.innerHTML = appTrackerState.websiteFilter.blockedWebsites.map(site => {
                    return `
                        <div class="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                            <div class="flex items-center space-x-2">
                                <div class="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px]">
                                    <i class="fa-solid fa-globe"></i>
                                </div>
                                <div>
                                    <span class="font-bold text-white font-mono">${site.domain}</span>
                                    <span class="text-[10px] text-slate-400 block">${site.reason}</span>
                                </div>
                            </div>

                            <button role="button" onclick="removeBlockedWebsite('${site.domain}')" title="Unblock website" aria-label="Unblock ${site.domain}" class="w-7 h-7 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 flex items-center justify-center transition border border-slate-800">
                                <i class="fa-solid fa-trash text-xs"></i>
                            </button>
                        </div>
                    `;
                }).join('');
            }
        }

        function runWebsiteAccessTest() {
            const input = document.getElementById('web-test-domain-input');
            const feedback = document.getElementById('web-test-feedback-box');
            const val = input?.value.trim();
            if (!val || !feedback) return;

            const check = isWebsiteBlocked(val);
            feedback.classList.remove('hidden');

            if (check && check.blocked) {
                feedback.className = "text-[11px] font-mono text-cyan-400 bg-cyan-950/40 p-2 rounded-xl border border-cyan-500/30 flex items-center justify-between";
                feedback.innerHTML = `
                    <span>⛔ <strong>${check.domain}</strong> is RESTRICTED in Chrome (${check.reason})</span>
                    <button role="button" onclick="showWebsiteBlockerShield('${check.domain}', '${check.reason}')" class="px-2 py-0.5 rounded bg-cyan-500 text-black text-[10px] font-bold">Simulate Block</button>
                `;
                showWebsiteBlockerShield(check.domain, check.reason);
            } else {
                feedback.className = "text-[11px] font-mono text-emerald-400 bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/30";
                feedback.innerHTML = `✓ <strong>${val}</strong> is ALLOWED. Work/Research site permitted in Chrome.`;
                playSfx('check');
            }
        }

        function openAccessibilityModal() {
            const modal = document.getElementById('arc-accessibility-modal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        }

        function closeAccessibilityModal() {
            const modal = document.getElementById('arc-accessibility-modal');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        }

        function confirmAccessibilityGranted() {
            appTrackerState.permissionGranted = true;
            saveAppTrackerData();
            playSfx('fanfare');
            closeAccessibilityModal();
            showToast("Accessibility & Screen Time Tracking enabled!");
            renderScreenTimeView();
        }

        function openAndroidAccessibilitySettings() {
            if (/Android/i.test(navigator.userAgent)) {
                window.location.href = "intent:#Intent;action=android.settings.ACCESSIBILITY_SETTINGS;end";
            } else {
                alert("Android Accessibility Settings:\n\n1. Open Settings ➔ Accessibility.\n2. Enable Arc Tracker Service.\n3. Return here to confirm.");
            }
        }

        function openAndroidUsageSettings() {
            if (/Android/i.test(navigator.userAgent)) {
                window.location.href = "intent:#Intent;action=android.settings.USAGE_ACCESS_SETTINGS;end";
            } else {
                alert("Android Usage Access Settings:\n\n1. Open Settings ➔ Apps ➔ Special App Access ➔ Usage Access.\n2. Enable Arc Tracker.\n3. Return here to confirm.");
            }
        }

        function openLimitModal(appId) {
            const app = appTrackerState.apps.find(a => a.id === appId);
            if (!app) return;

            const modal = document.getElementById('arc-limit-config-modal');
            if (!modal) return;

            modal.dataset.appId = appId;
            const titleEl = document.getElementById('limit-modal-title');
            const inputEl = document.getElementById('limit-modal-mins-input');
            const toggleEl = document.getElementById('limit-modal-block-toggle');

            if (titleEl) titleEl.textContent = `Set Daily Limit for ${app.name}`;
            if (inputEl) inputEl.value = Math.round(app.dailyLimitSecs / 60);
            if (toggleEl) toggleEl.checked = app.blockEnabled;

            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeLimitModal() {
            const modal = document.getElementById('arc-limit-config-modal');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        }

        function setPresetLimit(mins) {
            const inputEl = document.getElementById('limit-modal-mins-input');
            if (inputEl) inputEl.value = mins;
        }

        function saveAppLimitFromModal() {
            const modal = document.getElementById('arc-limit-config-modal');
            if (!modal || !modal.dataset.appId) return;

            const appId = modal.dataset.appId;
            const app = appTrackerState.apps.find(a => a.id === appId);
            if (!app) return;

            const inputEl = document.getElementById('limit-modal-mins-input');
            const toggleEl = document.getElementById('limit-modal-block-toggle');

            const mins = parseInt(inputEl?.value || '30', 10);
            if (isNaN(mins) || mins < 1) {
                alert("Please enter a valid time limit in minutes (at least 1 minute).");
                return;
            }

            app.dailyLimitSecs = mins * 60;
            app.blockEnabled = toggleEl ? toggleEl.checked : true;

            saveAppTrackerData();
            closeLimitModal();
            playSfx('click');
            showToast(`Daily limit for ${app.name} set to ${formatDuration(app.dailyLimitSecs)}.`);

            if (app.blockEnabled && (appTrackerState.usage[appId] || 0) >= app.dailyLimitSecs) {
                triggerAppLockout(appId);
            } else {
                renderScreenTimeView();
            }
        }

        function openAddCustomAppModal() {
            const modal = document.getElementById('arc-add-app-modal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        }

        function closeAddCustomAppModal() {
            const modal = document.getElementById('arc-add-app-modal');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        }

        function saveCustomApp() {
            const nameInput = document.getElementById('add-app-name');
            const catInput = document.getElementById('add-app-category');
            const limitInput = document.getElementById('add-app-limit');

            const name = nameInput?.value.trim();
            if (!name) {
                alert("Please enter an application name.");
                return;
            }

            const category = catInput?.value || 'Productivity';
            const mins = parseInt(limitInput?.value || '30', 10);

            const id = 'custom_' + Date.now();
            const newApp = {
                id,
                name,
                category,
                icon: 'fa-solid fa-shapes',
                colorClass: 'text-cyan-400',
                bgClass: 'bg-cyan-500/10',
                borderClass: 'border-cyan-500/30',
                dailyLimitSecs: Math.max(1, mins) * 60,
                blockEnabled: true,
                blockInFocus: (category === 'Social Media' || category === 'Entertainment' || category === 'Gaming' || category === 'Messaging'),
                isCustom: true
            };

            appTrackerState.apps.unshift(newApp);
            saveAppTrackerData();
            closeAddCustomAppModal();
            playSfx('fanfare');
            showToast(`Custom app "${name}" added to screen time tracker!`);
            renderScreenTimeView();
        }

        function deleteCustomApp(appId) {
            if (!confirm("Are you sure you want to stop tracking this app?")) return;
            appTrackerState.apps = appTrackerState.apps.filter(a => a.id !== appId);
            delete appTrackerState.usage[appId];
            saveAppTrackerData();
            renderScreenTimeView();
        }

        function simulateAddUsage(appId, secs = 600) {
            const app = appTrackerState.apps.find(a => a.id === appId);
            if (!app) return;

            appTrackerState.usage[appId] = (appTrackerState.usage[appId] || 0) + secs;
            saveAppTrackerData();
            playSfx('click');

            if (app.blockEnabled && appTrackerState.usage[appId] >= app.dailyLimitSecs) {
                triggerAppLockout(appId);
            } else {
                showToast(`Added ${formatDuration(secs)} testing time to ${app.name}`);
                renderScreenTimeView();
            }
        }

        function resetAppUsage(appId) {
            const app = appTrackerState.apps.find(a => a.id === appId);
            if (!app) return;

            appTrackerState.usage[appId] = 0;
            saveAppTrackerData();
            if (appTrackerState.blockedShieldAppId === appId) {
                closeBlockerShield();
            }
            renderScreenTimeView();
            showToast(`Reset today's usage for ${app.name}.`);
        }

        function isFocusStrictModeActive() {
            const isGold = !!(window.ArcGold && typeof window.ArcGold.isGold === 'function' && window.ArcGold.isGold());
            if (!isGold) return false;
            const stateObj = (typeof appTrackerState !== 'undefined') ? appTrackerState : (window.appTrackerState || null);
            return !!(stateObj && stateObj.strictMode);
        }

        function handleFocusStrictModeToggle(e) {
            if (e) {
                try { e.preventDefault(); e.stopPropagation(); } catch (_) {}
            }
            toggleFocusStrictMode();
        }

        function toggleFocusStrictMode(explicitVal) {
            const isGold = !!(window.ArcGold && typeof window.ArcGold.isGold === 'function' && window.ArcGold.isGold());
            if (!isGold) {
                openGoldStrictModal();
                updateStrictModeUI();
                return false;
            }

            const active = (typeof isFocusActive === 'function') ? isFocusActive() : (window.appTrackerState && window.appTrackerState.focusActive);
            if (active && appTrackerState.strictMode) {
                triggerStrictModeLockoutNotice();
                updateStrictModeUI();
                return false;
            }

            if (typeof explicitVal === 'boolean') {
                appTrackerState.strictMode = explicitVal;
            } else {
                appTrackerState.strictMode = !appTrackerState.strictMode;
            }

            saveAppTrackerData();
            renderScreenTimeView();
            updateStrictModeUI();

            if (appTrackerState.strictMode) {
                playSfx('fanfare');
                showToast("👑 Arc Gold Strict Mode Armed: Next focus session cannot be ended early!");
            } else {
                playSfx('click');
                showToast("Strict Mode Disabled.");
            }
            return true;
        }

        function toggleStrictMode() {
            return toggleFocusStrictMode();
        }

        function openStrictModeLockoutModal() {
            const modal = document.getElementById('arc-strict-lockout-modal');
            if (!modal) return;
            const timeEl = document.getElementById('strict-lockout-time-left');
            if (timeEl && typeof getFocusTimeRemainingFormatted === 'function') {
                timeEl.textContent = getFocusTimeRemainingFormatted();
            }
            const finishEl = document.getElementById('strict-lockout-finish-time');
            if (finishEl) {
                let leftSecs = 1500;
                if (window.F && window.F.run && window.F.left !== undefined) {
                    leftSecs = window.F.left;
                } else if (window.appTrackerState && window.appTrackerState.focusSecondsLeft) {
                    leftSecs = window.appTrackerState.focusSecondsLeft;
                }
                const finishDate = new Date(Date.now() + leftSecs * 1000);
                const timeStr = finishDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                finishEl.textContent = `Sprint finishes at ${timeStr} · Timer must reach 00:00`;
            }
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            const card = document.getElementById('arc-strict-lockout-card');
            if (card) {
                card.classList.remove('arc-strict-shake');
                void card.offsetWidth;
                card.classList.add('arc-strict-shake');
            }
        }

        function closeStrictModeLockoutModal() {
            const modal = document.getElementById('arc-strict-lockout-modal');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        }

        function openGoldStrictModal() {
            const modal = document.getElementById('arc-gold-strict-upgrade-modal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
                playSfx('modalOpen');
            }
        }

        function closeGoldStrictModal() {
            const modal = document.getElementById('arc-gold-strict-upgrade-modal');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        }

        function triggerStrictModeLockoutNotice() {
            playSfx('strictDenied');
            openStrictModeLockoutModal();
            if (typeof showToast === 'function') {
                showToast('🔒 Early Exit Forbidden: Arc Gold Strict Mode is active! Complete your sprint.');
            }
        }

        function updateStrictModeUI() {
            const isGold = !!(window.ArcGold && typeof window.ArcGold.isGold === 'function' && window.ArcGold.isGold());
            const isStrictActive = isFocusStrictModeActive();
            const active = (typeof isFocusActive === 'function') ? isFocusActive() : (window.appTrackerState && window.appTrackerState.focusActive);

            const strictToggle = document.getElementById('phone-widget-strict-toggle');
            const strictDesc = document.getElementById('phone-widget-strict-desc');
            const strictContainer = document.getElementById('phone-widget-strict-container');

            if (strictToggle) {
                strictToggle.checked = !!(isGold && window.appTrackerState && window.appTrackerState.strictMode);
                strictToggle.disabled = (active && isStrictActive);
            }
            if (strictDesc) {
                if (active && isStrictActive) {
                    strictDesc.innerHTML = '<span class="text-amber-400 font-bold">🔒 LOCKED IN SPRINT (No exit)</span>';
                } else if (isStrictActive) {
                    strictDesc.innerHTML = '<span class="text-amber-300 font-medium">Armed · Cannot exit early</span>';
                } else if (!isGold) {
                    strictDesc.innerHTML = '<span class="text-amber-400/80">👑 Gold Exclusive · Tap to unlock</span>';
                } else {
                    strictDesc.textContent = 'Disables early exit until timer ends';
                }
            }
            if (strictContainer) {
                if (isStrictActive) {
                    strictContainer.className = 'p-2 sm:p-2.5 rounded-xl bg-amber-950/20 border-2 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] flex items-center justify-between gap-2 transition';
                } else {
                    strictContainer.className = 'p-2 sm:p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-amber-500/40 flex items-center justify-between gap-2 transition';
                }
            }

            const toolbarBtn = document.getElementById('st-strict-mode-btn');
            const toolbarText = document.getElementById('st-strict-btn-text');
            if (toolbarBtn && toolbarText) {
                if (isStrictActive) {
                    toolbarBtn.className = "px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/25 to-yellow-500/25 border-2 border-amber-400/70 text-amber-300 text-xs font-black transition flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.25)]";
                    toolbarText.innerHTML = '<i class="fa-solid fa-lock text-amber-400"></i> Strict Focus: ON <span class="text-[9px] bg-amber-500/30 px-1 rounded text-amber-200">GOLD</span>';
                } else {
                    toolbarBtn.className = "px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm";
                    toolbarText.innerHTML = '<i class="fa-solid fa-lock text-slate-400"></i> Strict Mode <span class="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded border border-amber-500/30 font-bold">GOLD</span>';
                }
            }

            const goldCardStrictToggle = document.getElementById('gold-toggle-strict-mode');
            if (goldCardStrictToggle) {
                goldCardStrictToggle.checked = !!(isGold && window.appTrackerState && window.appTrackerState.strictMode);
                goldCardStrictToggle.disabled = (active && isStrictActive) || !isGold;
            }
        }

        window.isFocusStrictModeActive = isFocusStrictModeActive;
        window.toggleFocusStrictMode = toggleFocusStrictMode;
        window.toggleStrictMode = toggleStrictMode;
        window.openStrictModeLockoutModal = openStrictModeLockoutModal;
        window.closeStrictModeLockoutModal = closeStrictModeLockoutModal;
        window.openGoldStrictModal = openGoldStrictModal;
        window.closeGoldStrictModal = closeGoldStrictModal;
        window.triggerStrictModeLockoutNotice = triggerStrictModeLockoutNotice;
        window.updateStrictModeUI = updateStrictModeUI;

        function setAppFilter(filterId) {
            appTrackerState.activeFilter = filterId;
            renderScreenTimeView();
        }

        function setAppSearch(q) {
            appTrackerState.searchQuery = q || '';
            renderScreenTimeView();
        }

        function playBlockerAlarmSfx() {
            try {
                initAudio();
                if (!audioCtx) return;
                const now = audioCtx.currentTime;
                [0, 0.12, 0.24, 0.36].forEach(offset => {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(offset % 0.24 === 0 ? 880 : 440, now + offset);
                    gain.gain.setValueAtTime(0.2, now + offset);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(now + offset);
                    osc.stop(now + offset + 0.1);
                });
            } catch (_) {}
        }

        function getDopamineShieldData() {
            let totalUsage = 0;
            let dailyBlockedCount = 0;
            let focusBlockedCount = 0;
            let nearLimitCount = 0;
            let totalApps = 0;

            if (typeof appTrackerState !== 'undefined' && Array.isArray(appTrackerState.apps)) {
                totalApps = appTrackerState.apps.length;
                appTrackerState.apps.forEach(app => {
                    const used = (appTrackerState.usage && appTrackerState.usage[app.id]) || 0;
                    totalUsage += used;
                    const limit = app.dailyLimitSecs || 1800;
                    const pct = Math.min(100, Math.round((used / limit) * 100));
                    if (app.blockEnabled && used >= limit) dailyBlockedCount++;
                    else if (pct >= 80 && !app.blockInFocus) nearLimitCount++;
                    if (app.blockInFocus) focusBlockedCount++;
                });
            }

            const shieldScore = Math.max(0, 100 - (dailyBlockedCount * 25) - (nearLimitCount * 8));
            return {
                totalUsage,
                dailyBlockedCount,
                focusBlockedCount,
                nearLimitCount,
                shieldScore,
                totalApps
            };
        }
        window.getDopamineShieldData = getDopamineShieldData;

        function renderScreenTimeView() {
            const view = document.getElementById('view-screentime');
            if (!view) return;

            const shieldData = getDopamineShieldData();
            const totalUsage = shieldData.totalUsage;
            const dailyBlockedCount = shieldData.dailyBlockedCount;
            const focusBlockedCount = shieldData.focusBlockedCount;
            const nearLimitCount = shieldData.nearLimitCount;
            const shieldScore = shieldData.shieldScore;

            const focusRunning = isFocusActive();
            const radarScoreEl = document.getElementById('st-radar-shield-score');
            if (radarScoreEl) {
                radarScoreEl.textContent = `${shieldScore}%`;
                if (shieldScore >= 80) {
                    radarScoreEl.className = "text-sm font-black font-mono tracking-tight text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]";
                } else if (shieldScore >= 50) {
                    radarScoreEl.className = "text-sm font-black font-mono tracking-tight text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]";
                } else {
                    radarScoreEl.className = "text-sm font-black font-mono tracking-tight text-rose-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse";
                }
            }

            // Update top KPIs
            const totalEl = document.getElementById('st-kpi-total-time');
            if (totalEl) totalEl.textContent = formatDuration(totalUsage);

            const countEl = document.getElementById('st-kpi-focus-count');
            if (countEl) countEl.textContent = `${focusBlockedCount} Apps`;

            const headerFocusCount = document.getElementById('st-header-focus-block-count');
            if (headerFocusCount) headerFocusCount.textContent = focusBlockedCount;

            const headerYtCount = document.getElementById('st-header-yt-filter-count');
            if (headerYtCount) headerYtCount.textContent = appTrackerState.youtubeFilter.blockedChannels.length;

            const headerWebCount = document.getElementById('st-header-web-filter-count');
            if (headerWebCount) headerWebCount.textContent = appTrackerState.websiteFilter.blockedWebsites.length;

            const ytStatusEl = document.getElementById('st-kpi-yt-status');
            if (ytStatusEl) {
                ytStatusEl.innerHTML = appTrackerState.youtubeFilter.enabled
                    ? `<i class="fa-brands fa-youtube"></i> Active (${appTrackerState.youtubeFilter.blockedChannels.length} YT / ${appTrackerState.websiteFilter.blockedWebsites.length} Web)`
                    : '<i class="fa-brands fa-youtube text-slate-500"></i> Filter Paused';
            }

            const blockedEl = document.getElementById('st-kpi-blocked-count');
            const blockedCard = document.getElementById('st-kpi-blocked-card');
            const blockedSub = document.getElementById('st-kpi-blocked-sub');
            if (blockedEl) {
                blockedEl.textContent = `${dailyBlockedCount} Locked`;
                if (dailyBlockedCount > 0) {
                    blockedEl.className = "text-xl sm:text-2xl font-black font-mono text-rose-400 animate-pulse mt-0.5";
                    if (blockedCard) blockedCard.className = "bg-slate-950/70 p-3.5 rounded-xl border border-rose-500/40 bg-rose-950/20";
                    if (blockedSub) blockedSub.textContent = "Limit exceeded • Access locked";
                } else {
                    blockedEl.className = "text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-0.5";
                    if (blockedCard) blockedCard.className = "bg-slate-950/70 p-3.5 rounded-xl border border-slate-800";
                    if (blockedSub) blockedSub.textContent = "All apps within quota";
                }
            }

            // Focus Controller Card dynamic state
            const focusCard = document.getElementById('st-focus-controller-card');
            const focusPill = document.getElementById('st-focus-status-pill');
            const focusDesc = document.getElementById('st-focus-desc-text');
            const focusActions = document.getElementById('st-focus-actions-container');
            const focusBadgeTop = document.getElementById('st-focus-badge-top');

            if (focusRunning) {
                const isStrict = isFocusStrictModeActive();
                if (focusCard) {
                    focusCard.className = isStrict
                        ? "glass-card rounded-2xl p-4 sm:p-5 border-2 border-amber-500/80 bg-amber-950/25 shadow-[0_0_35px_rgba(245,158,11,0.25)] space-y-3 transition-all duration-300"
                        : "glass-card rounded-2xl p-4 sm:p-5 border-2 border-purple-500/80 bg-purple-950/30 shadow-[0_0_30px_rgba(168,85,247,0.2)] space-y-3 transition-all duration-300";
                }
                if (focusPill) {
                    if (isStrict) {
                        focusPill.className = "px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm";
                        focusPill.innerHTML = '<i class="fa-solid fa-lock text-[9px] text-slate-950"></i> STRICT FOCUS ACTIVE';
                    } else {
                        focusPill.className = "px-2.5 py-0.5 rounded-full bg-purple-500 text-white font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse";
                        focusPill.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-white"></span> FOCUS ACTIVE';
                    }
                }
                if (focusDesc) {
                    const strictNoticeText = isStrict
                        ? '<span class="text-amber-300 font-bold block sm:inline sm:ml-2"><i class="fa-solid fa-lock text-amber-400"></i> Strict Mode Locked (No early exit)</span>'
                        : '';
                    focusDesc.innerHTML = `<span class="text-purple-300 font-bold"><i class="fa-solid fa-lock text-purple-400 mr-1"></i> ${focusBlockedCount} apps &amp; ${appTrackerState.websiteFilter.blockedWebsites.length} websites locked in Chrome.</span> <span id="st-focus-banner-timer" class="font-mono font-black text-white ml-1.5">${getFocusTimeRemainingFormatted()}</span> remaining in focus sprint.${strictNoticeText}`;
                }
                if (focusActions) {
                    if (isStrict) {
                        focusActions.innerHTML = `
                            <button role="button" onclick="stopFocusSession(false); playSfx('strictDenied')" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-950/80 via-rose-950/80 to-amber-950/80 hover:from-amber-900/80 hover:to-rose-900/80 text-amber-200 border-2 border-amber-500/60 font-black text-xs transition flex items-center gap-1.5 shadow-lg shadow-amber-500/15 cursor-pointer" title="Strict Mode: Early exit is forbidden">
                                <i class="fa-solid fa-lock text-amber-400 animate-pulse"></i> Locked Focus Sprint
                            </button>
                            <button role="button" onclick="openFocusBlocklistModal(); playSfx('modalOpen')" class="px-3 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800/60 text-purple-200 border border-purple-500/40 font-bold text-xs transition flex items-center gap-1">
                                <i class="fa-solid fa-sliders"></i> Blocklist (${focusBlockedCount})
                            </button>
                        `;
                    } else {
                        focusActions.innerHTML = `
                            <button role="button" onclick="stopFocusSession(false); playSfx('click')" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/40 font-bold text-xs transition flex items-center gap-1.5">
                                <i class="fa-solid fa-stop"></i> Stop Focus
                            </button>
                            <button role="button" onclick="openFocusBlocklistModal(); playSfx('modalOpen')" class="px-3 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800/60 text-purple-200 border border-purple-500/40 font-bold text-xs transition flex items-center gap-1">
                                <i class="fa-solid fa-sliders"></i> Blocklist (${focusBlockedCount})
                            </button>
                        `;
                    }
                }
                if (focusBadgeTop) {
                    if (isStrict) {
                        focusBadgeTop.className = "px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/50 text-[10px] font-mono font-bold flex items-center gap-1";
                        focusBadgeTop.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span> Strict Lockdown Active';
                    } else {
                        focusBadgeTop.className = "px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/50 text-[10px] font-mono font-bold flex items-center gap-1";
                        focusBadgeTop.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping"></span> Focus Lockdown Active';
                    }
                }
            } else {
                if (focusCard) {
                    focusCard.className = "glass-card rounded-2xl p-4 sm:p-5 border border-purple-500/30 bg-purple-950/15 space-y-3 transition-all duration-300";
                }
                if (focusPill) {
                    focusPill.className = "px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono font-bold";
                    focusPill.textContent = "IDLE";
                }
                if (focusDesc) {
                    focusDesc.textContent = "During active Focus sessions and Pomodoros, distracting apps and websites inside Chrome are immediately locked.";
                }
                if (focusActions) {
                    const strictBadgeSnippet = isFocusStrictModeActive()
                        ? `<span class="px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1 shadow-sm"><i class="fa-solid fa-lock text-amber-400"></i> Strict Mode Armed</span>`
                        : '';
                    focusActions.innerHTML = `
                        <button role="button" onclick="startFocusSession(25); playSfx('click')" class="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md shadow-purple-600/30 flex items-center gap-1.5">
                            <i class="fa-solid fa-play"></i> Start 25m Focus
                        </button>
                        <button role="button" onclick="startFocusSession(50); playSfx('click')" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 font-bold text-xs transition">
                            50m Block
                        </button>
                        <button role="button" onclick="openFocusBlocklistModal(); playSfx('modalOpen')" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold text-xs transition flex items-center gap-1">
                            <i class="fa-solid fa-sliders"></i> Customize Apps
                        </button>
                        ${strictBadgeSnippet}
                    `;
                }
                if (focusBadgeTop) {
                    focusBadgeTop.className = "px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-semibold flex items-center gap-1";
                    focusBadgeTop.innerHTML = '<i class="fa-solid fa-moon"></i> Focus Blocker Ready';
                }
            }

            // Permissions banner
            const permBanner = document.getElementById('st-permission-banner');
            const permBadgeTop = document.getElementById('st-perm-badge-top');
            if (appTrackerState.permissionGranted) {
                if (permBanner) permBanner.classList.add('hidden');
                if (permBadgeTop) {
                    permBadgeTop.className = "px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-semibold";
                    permBadgeTop.innerHTML = '<i class="fa-solid fa-check mr-1"></i> Accessibility Active';
                }
            } else {
                if (permBanner) permBanner.classList.remove('hidden');
                if (permBadgeTop) {
                    permBadgeTop.className = "px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-semibold";
                    permBadgeTop.innerHTML = '<i class="fa-solid fa-triangle-exclamation mr-1"></i> Accessibility Setup Available';
                }
            }

            // Filter Tabs styling
            const filterBtns = document.querySelectorAll('.st-filter-btn');
            filterBtns.forEach(btn => {
                const f = btn.getAttribute('data-filter');
                if (f === appTrackerState.activeFilter) {
                    btn.className = "st-filter-btn px-3 py-1.5 rounded-lg transition shrink-0 bg-cyan-500 text-black font-bold shadow-sm";
                } else {
                    btn.className = "st-filter-btn px-3 py-1.5 rounded-lg transition shrink-0 text-slate-400 hover:text-white";
                }
            });
            const blockedTab = document.getElementById('st-filter-blocked-tab');
            if (blockedTab) blockedTab.textContent = `Daily Blocked (${dailyBlockedCount})`;

            const focusTab = document.getElementById('st-filter-focus-tab');
            if (focusTab) focusTab.textContent = `Focus Blocked (${focusBlockedCount})`;

            // Active App Status Bar with Frequency Equalizer
            const activeStatusContainer = document.getElementById('st-active-app-status-container');
            const currentActiveApp = appTrackerState.apps.find(a => a.id === appTrackerState.activeAppId);
            if (activeStatusContainer) {
                if (currentActiveApp) {
                    activeStatusContainer.innerHTML = `
                        <div class="flex items-center gap-2 flex-wrap">
                            <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950/70 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                                <div class="st-equalizer" title="Live audio & telemetry frequency stream">
                                    <div class="st-eq-bar"></div>
                                    <div class="st-eq-bar"></div>
                                    <div class="st-eq-bar"></div>
                                    <div class="st-eq-bar"></div>
                                    <div class="st-eq-bar"></div>
                                </div>
                                <span class="font-mono text-xs text-cyan-300 flex items-center gap-1.5">
                                    <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                                    TRACKING: <strong class="text-white drop-shadow">${currentActiveApp.name}</strong>
                                </span>
                            </div>
                            <button role="button" onclick="pauseActiveApp()" class="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition flex items-center gap-1 shadow-sm active:scale-95">
                                <i class="fa-solid fa-pause text-amber-400"></i> Pause
                            </button>
                        </div>
                    `;
                } else {
                    activeStatusContainer.innerHTML = `
                        <span class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 font-mono text-xs flex items-center gap-2 shadow-inner">
                            <span class="w-2 h-2 rounded-full bg-slate-500 animate-pulse"></span> Standby / Standalone
                        </span>
                    `;
                }
            }

            // Quick App Launcher Pills
            const pillsContainer = document.getElementById('st-app-launcher-pills');
            if (pillsContainer) {
                pillsContainer.innerHTML = appTrackerState.apps.slice(0, 8).map(app => {
                    const isBlocked = isAppBlocked(app.id);
                    const isActive = appTrackerState.activeAppId === app.id;
                    return `
                        <button role="button" onclick="setActiveApp('${app.id}', event)" class="px-3 py-1.5 rounded-xl border text-xs font-semibold shrink-0 transition-all duration-200 flex items-center gap-1.5 active:scale-95 ${isActive ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] font-bold' : (isBlocked ? 'bg-rose-950/40 text-rose-300 border-rose-500/40 hover:bg-rose-900/40' : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white')}">
                            <i class="${app.icon} text-[11px] ${isActive ? 'text-black' : (isBlocked ? 'text-rose-400' : app.colorClass)}"></i>
                            <span>${app.name}</span>
                            ${isActive ? '<span class="w-1.5 h-1.5 rounded-full bg-black animate-ping ml-0.5"></span>' : (isBlocked ? '<i class="fa-solid fa-lock text-[9px] text-rose-400 ml-0.5"></i>' : '')}
                        </button>
                    `;
                }).join('');
            }

            // Filter & Search Apps for Grid
            let filteredApps = appTrackerState.apps;
            if (appTrackerState.activeFilter === 'social') {
                filteredApps = filteredApps.filter(a => a.category === 'Social Media');
            } else if (appTrackerState.activeFilter === 'entertainment') {
                filteredApps = filteredApps.filter(a => a.category === 'Entertainment');
            } else if (appTrackerState.activeFilter === 'productivity') {
                filteredApps = filteredApps.filter(a => a.category === 'Productivity');
            } else if (appTrackerState.activeFilter === 'gaming') {
                filteredApps = filteredApps.filter(a => a.category === 'Gaming');
            } else if (appTrackerState.activeFilter === 'blocked') {
                filteredApps = filteredApps.filter(a => (appTrackerState.usage[a.id] || 0) >= a.dailyLimitSecs && a.blockEnabled);
            } else if (appTrackerState.activeFilter === 'focus-blocked') {
                filteredApps = filteredApps.filter(a => a.blockInFocus);
            }

            if (appTrackerState.searchQuery) {
                const q = appTrackerState.searchQuery.toLowerCase();
                filteredApps = filteredApps.filter(a => a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));
            }

            // Render Apps Grid
            const gridEl = document.getElementById('st-apps-grid');
            if (gridEl) {
                if (filteredApps.length === 0) {
                    gridEl.innerHTML = `
                        <div class="col-span-full py-12 text-center text-slate-500 space-y-2">
                            <i class="fa-solid fa-magnifying-glass text-3xl opacity-40"></i>
                            <p class="text-sm">No applications match your current filter or search.</p>
                            <button role="button" onclick="setAppFilter('all')" class="text-xs text-cyan-400 font-bold hover:underline">Reset Filters</button>
                        </div>
                    `;
                } else {
                    gridEl.innerHTML = filteredApps.map(app => {
                        const used = appTrackerState.usage[app.id] || 0;
                        const limit = app.dailyLimitSecs;
                        const pct = Math.min(100, Math.round((used / limit) * 100));
                        const isDailyLocked = app.blockEnabled && used >= limit;
                        const isFocusLocked = focusRunning && app.blockInFocus;
                        const isBlocked = isDailyLocked || isFocusLocked;
                        const isNearLimit = pct >= 80 && !isBlocked;
                        const isActive = appTrackerState.activeAppId === app.id;

                        // Dynamic Category Aura Class
                        let categoryAuraClass = 'st-card-productivity';
                        if (app.category === 'Social Media') categoryAuraClass = 'st-card-social';
                        else if (app.category === 'Entertainment') categoryAuraClass = 'st-card-entertainment';
                        else if (app.category === 'Gaming') categoryAuraClass = 'st-card-gaming';

                        // Dynamic Card State Class
                        let cardStateClass = '';
                        if (isActive) cardStateClass = 'st-app-card-active';
                        else if (isDailyLocked) cardStateClass = 'st-app-card-locked';
                        else if (isNearLimit) cardStateClass = 'st-app-card-warning';

                        // Progress fill styling
                        let fillClass = 'st-progress-fill-normal';
                        if (isBlocked) fillClass = 'st-progress-fill-locked';
                        else if (isNearLimit) fillClass = 'st-progress-fill-warning';

                        return `
                            <div class="bg-slate-950/85 rounded-2xl p-4 sm:p-5 border ${isFocusLocked ? 'border-purple-500/70 shadow-lg shadow-purple-950/40' : (isDailyLocked ? 'border-rose-500/60 shadow-lg shadow-rose-950/40' : (isActive ? 'border-cyan-400/80 shadow-lg shadow-cyan-950/40' : 'border-slate-800/90'))} ${categoryAuraClass} ${cardStateClass} space-y-3.5 relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5">
                                ${isFocusLocked ? `
                                    <div class="absolute top-0 right-0 bg-purple-600 text-white font-mono text-[9px] font-black uppercase tracking-widest px-3 py-0.5 rounded-bl-xl shadow-md flex items-center gap-1">
                                        <i class="fa-solid fa-moon text-[8px]"></i> FOCUS BLOCKED
                                    </div>
                                ` : (isDailyLocked ? `
                                    <div class="absolute top-0 right-0 bg-rose-600 text-white font-mono text-[9px] font-black uppercase tracking-widest px-3 py-0.5 rounded-bl-xl shadow-md flex items-center gap-1">
                                        <i class="fa-solid fa-lock text-[8px]"></i> DAILY BLOCKED
                                    </div>
                                ` : (isActive ? `
                                    <div class="absolute top-0 right-0 bg-cyan-500 text-black font-mono text-[9px] font-black uppercase tracking-widest px-3 py-0.5 rounded-bl-xl shadow-md flex items-center gap-1 font-bold">
                                        <span class="w-1.5 h-1.5 rounded-full bg-black animate-ping"></span> ACTIVE
                                    </div>
                                ` : ''))}

                                <!-- APP HEADER -->
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center space-x-3">
                                        <div class="w-11 h-11 rounded-2xl ${app.bgClass} border ${app.borderClass} flex items-center justify-center text-xl shrink-0 shadow-md ${isActive ? 'ring-2 ring-cyan-400/60 ring-offset-2 ring-offset-slate-950' : ''}">
                                            <i class="${app.icon} ${app.colorClass}"></i>
                                        </div>
                                        <div class="truncate">
                                            <h4 class="text-sm font-bold text-white truncate flex items-center gap-1.5">
                                                <span>${app.name}</span>
                                                ${app.isCustom ? '<span class="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">Custom</span>' : ''}
                                            </h4>
                                            <span class="text-[10px] text-slate-400 font-medium">${app.category}</span>
                                        </div>
                                    </div>

                                    <!-- FOCUS BLOCK TOGGLE BUTTON -->
                                    <button role="button" onclick="toggleAppFocusBlock('${app.id}'); playSfx('click')" class="px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition flex items-center gap-1 ${app.blockInFocus ? 'bg-purple-600/25 text-purple-300 border border-purple-500/40 hover:bg-purple-600/40' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'}" title="Toggle whether this app is blocked during Focus / Pomodoro">
                                        <i class="fa-solid ${app.blockInFocus ? 'fa-moon text-purple-400' : 'fa-circle-check text-slate-500'} text-[10px]"></i>
                                        <span>${app.blockInFocus ? 'Focus: Block' : 'Focus: Allow'}</span>
                                    </button>
                                </div>

                                <!-- LIQUID STRIPED PROGRESS BAR WITH GLOWING SPARK HEAD -->
                                <div class="space-y-1.5 pt-0.5">
                                    <div class="flex justify-between items-center text-xs">
                                        <span class="font-mono font-bold text-white flex items-center gap-1.5" id="st-active-counter-${app.id}">
                                            ${isActive ? '<span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>' : ''}
                                            ${formatDuration(used)}
                                        </span>
                                        <span class="text-slate-400 text-[11px] font-mono">Daily Limit: <strong class="text-slate-200">${formatDuration(limit)}</strong></span>
                                    </div>

                                    <div class="st-progress-track">
                                        <div class="st-progress-fill ${fillClass}" style="width: ${pct}%">
                                            ${pct > 3 ? '<span class="st-spark-head"></span>' : ''}
                                        </div>
                                    </div>

                                    <div class="flex justify-between items-center text-[10px] font-mono pt-0.5">
                                        <span class="${isDailyLocked ? 'text-rose-400 font-bold' : (isNearLimit ? 'text-amber-400 font-semibold' : 'text-slate-400')}">
                                            ${isDailyLocked ? '100% DAILY LIMIT REACHED' : (isNearLimit ? `${pct}% • Quota warning` : `${pct}% consumed`)}
                                        </span>
                                        <span class="text-slate-500">
                                            ${app.blockEnabled ? '<i class="fa-solid fa-shield text-cyan-400"></i> Shield On' : 'Monitor only'}
                                        </span>
                                    </div>
                                </div>

                                ${app.id === 'youtube' ? `
                                    <!-- YOUTUBE SPECIFIC CHANNEL FILTER SHORTCUT BUTTON -->
                                    <button role="button" onclick="openYouTubeFilterModal(); playSfx('modalOpen')" class="w-full py-1.5 px-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/40 border border-red-500/40 text-red-300 text-xs font-bold transition flex items-center justify-between shadow-sm">
                                        <span class="flex items-center gap-1.5">
                                            <i class="fa-brands fa-youtube text-red-500"></i> Channel Distraction Filter
                                        </span>
                                        <span class="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 text-[10px] font-mono font-bold">
                                            ${appTrackerState.youtubeFilter.blockedChannels.length} Blocked
                                        </span>
                                    </button>
                                ` : ''}

                                ${app.id === 'chrome' ? `
                                    <!-- CHROME SPECIFIC WEBSITE FILTER SHORTCUT BUTTON -->
                                    <button role="button" onclick="openWebsiteFilterModal(); playSfx('modalOpen')" class="w-full py-1.5 px-2.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition flex items-center justify-between shadow-sm">
                                        <span class="flex items-center gap-1.5">
                                            <i class="fa-brands fa-chrome text-cyan-400"></i> Website Filter in Browser
                                        </span>
                                        <span class="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                                            ${appTrackerState.websiteFilter.blockedWebsites.length} Blocked
                                        </span>
                                    </button>
                                ` : ''}

                                <!-- ACTION BUTTONS -->
                                <div class="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900">
                                    <button role="button" onclick="openLimitModal('${app.id}'); playSfx('click')" class="py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition flex items-center justify-center gap-1 active:scale-95">
                                        <i class="fa-solid fa-sliders text-cyan-400 text-[11px]"></i> Limit
                                    </button>

                                    ${isFocusLocked ? `
                                        <button role="button" onclick="showFocusBlockerShield('${app.id}'); playSfx('modalOpen')" class="py-1.5 px-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center justify-center gap-1 shadow-md shadow-purple-600/30 active:scale-95">
                                            <i class="fa-solid fa-moon text-[11px]"></i> Focus Lock
                                        </button>
                                    ` : (isDailyLocked ? `
                                        <button role="button" onclick="showBlockerShield('${app.id}'); playSfx('modalOpen')" class="py-1.5 px-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center justify-center gap-1 shadow-md shadow-rose-600/30 active:scale-95">
                                            <i class="fa-solid fa-lock text-[11px]"></i> Locked
                                        </button>
                                    ` : (isActive ? `
                                        <button role="button" onclick="pauseActiveApp()" class="py-1.5 px-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm active:scale-95">
                                            <i class="fa-solid fa-pause text-[11px]"></i> In Use
                                        </button>
                                    ` : `
                                        <button role="button" onclick="setActiveApp('${app.id}', event)" class="py-1.5 px-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm active:scale-95">
                                            <i class="fa-solid fa-play text-[11px]"></i> Launch
                                        </button>
                                    `))}
                                </div>

                                <!-- EXTRA QUICK CONTROLS (TEST +10M & RESET) -->
                                <div class="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                                    <button role="button" onclick="simulateAddUsage('${app.id}', 600)" title="Add 10 mins testing usage" class="hover:text-cyan-400 transition font-mono flex items-center gap-1">
                                        <i class="fa-solid fa-forward-step"></i> +10m Test
                                    </button>
                                    <div class="flex items-center gap-2">
                                        <button role="button" onclick="resetAppUsage('${app.id}')" title="Reset today's time" class="hover:text-amber-400 transition">
                                            <i class="fa-solid fa-rotate-left"></i> Reset
                                        </button>
                                        ${app.isCustom ? `
                                            <button role="button" onclick="deleteCustomApp('${app.id}')" title="Delete custom app" class="hover:text-rose-400 transition">
                                                <i class="fa-solid fa-trash"></i>
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            }

            // Synchronize and update cross-device screen time matrix (Desktop, Separately Made Mobile, and Combined)
            updateCrossDeviceScreenTimeUI();
            updateStrictModeUI();
        }

        /* ==========================================================================
           CROSS-DEVICE LINKED SCREEN TIME LOGIC (DESKTOP + MOBILE)
           ========================================================================== */
        function formatDurationShort(totalSecs) {
            const h = Math.floor(totalSecs / 3600);
            const m = Math.floor((totalSecs % 3600) / 60);
            if (h > 0) return `${h}h ${m}m`;
            return `${m}m`;
        }

        function updateCrossDeviceScreenTimeUI() {
            const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            
            // 1. Get current linked account
            const user = (window.ArcGoogleSync && typeof window.ArcGoogleSync.getUser === 'function') 
                ? window.ArcGoogleSync.getUser() 
                : (function(){ try { return JSON.parse(localStorage.getItem('arc_google_user')); } catch(e){ return null; } })();

            // 2. Retrieve persistent cross-device dataset
            let deviceData = null;
            try {
                const raw = localStorage.getItem('arc_cross_device_screentime');
                if (raw) deviceData = JSON.parse(raw);
            } catch(e) {}
            
            const todayKey = (typeof getTodayKey === 'function') ? getTodayKey() : new Date().toISOString().split('T')[0];

            if (!deviceData || typeof deviceData !== 'object') {
                deviceData = (window.state && window.state.deviceScreenTime) ? window.state.deviceScreenTime : {
                    desktop: { seconds: 0, deviceName: 'Desktop PC', lastUpdated: 0, todayKey: todayKey },
                    mobile: { seconds: 0, deviceName: 'Mobile Tracker', lastUpdated: 0, todayKey: todayKey }
                };
            }
            
            // 3. Obtain local device active screen time
            let currentLocalSecs = 0;
            if (window.ArcScreenTime && typeof window.ArcScreenTime.activeSeconds === 'number') {
                currentLocalSecs = window.ArcScreenTime.activeSeconds;
            } else if (window.state && window.state.laptop && typeof window.state.laptop.totalSeconds === 'number') {
                currentLocalSecs = window.state.laptop.totalSeconds;
            }

            if (isMobileDevice) {
                deviceData.mobile = deviceData.mobile || {};
                deviceData.mobile.seconds = Math.max(Number(deviceData.mobile.seconds) || 0, currentLocalSecs);
                deviceData.mobile.deviceName = '📱 ' + (/Android/i.test(navigator.userAgent) ? 'Android Mobile App Tracker' : 'iOS Mobile App Tracker');
                deviceData.mobile.lastUpdated = Date.now();
                deviceData.mobile.todayKey = todayKey;
            } else {
                deviceData.desktop = deviceData.desktop || {};
                deviceData.desktop.seconds = Math.max(Number(deviceData.desktop.seconds) || 0, currentLocalSecs);
                deviceData.desktop.deviceName = '💻 ' + (/Mac/i.test(navigator.userAgent) ? 'macOS Workstation' : 'Windows PC / Desktop');
                deviceData.desktop.lastUpdated = Date.now();
                deviceData.desktop.todayKey = todayKey;
            }

            const desktopSecs = Number(deviceData.desktop?.seconds) || 0;
            const mobileSecs = Number(deviceData.mobile?.seconds) || 0;
            const combinedSecs = desktopSecs + mobileSecs;

            // 4. Update Desktop Counter
            const deskEl = document.getElementById('st-desktop-time-val');
            if (deskEl) deskEl.textContent = formatDuration(desktopSecs);

            const deskNameEl = document.getElementById('st-desktop-device-name');
            if (deskNameEl) {
                deskNameEl.textContent = deviceData.desktop?.deviceName || '💻 Desktop PC / Workstation';
            }

            // 5. Update Mobile Counter (Separately Made Section)
            const mobEl = document.getElementById('st-mobile-time-val');
            if (mobEl) mobEl.textContent = formatDuration(mobileSecs);

            const mobNameEl = document.getElementById('st-mobile-device-name');
            if (mobNameEl) {
                mobNameEl.textContent = deviceData.mobile?.deviceName || '📱 Mobile App Tracker';
            }

            const mobStatusEl = document.getElementById('st-mobile-sync-status');
            if (mobStatusEl) {
                if (!user) {
                    mobStatusEl.innerHTML = `<span class="text-amber-300 font-semibold"><i class="fa-solid fa-link-slash mr-1"></i>Link Google account to sync mobile</span>`;
                } else if (mobileSecs > 0) {
                    const timeAgo = (window.ArcGoogleSync && typeof window.ArcGoogleSync.formatTimeAgo === 'function')
                        ? window.ArcGoogleSync.formatTimeAgo(deviceData.mobile?.lastUpdated)
                        : (deviceData.mobile?.lastUpdated ? 'Live Synced' : 'Synced via Account');
                    mobStatusEl.innerHTML = `<span class="text-emerald-400 font-bold flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Synced via Account (${timeAgo})</span>`;
                } else {
                    mobStatusEl.innerHTML = `<span class="text-slate-400"><i class="fa-solid fa-cloud-arrow-down mr-1"></i>Awaiting mobile check-in • Tap 'Simulate Mobile Data' to test</span>`;
                }
            }

            // 6. Update Combined Counter (Both Devices Combined)
            const combEl = document.getElementById('st-combined-time-val');
            if (combEl) combEl.textContent = formatDuration(combinedSecs);

            // 7. Update Proportional Dual-Device Ratio Bar
            const deskBar = document.getElementById('st-combined-bar-desktop');
            const mobBar = document.getElementById('st-combined-bar-mobile');
            const deskPctLabel = document.getElementById('st-combined-desktop-pct');
            const mobPctLabel = document.getElementById('st-combined-mobile-pct');
            const splitPill = document.getElementById('st-combined-split-pill');

            let deskPct = 50;
            let mobPct = 50;
            if (combinedSecs > 0) {
                deskPct = Math.round((desktopSecs / combinedSecs) * 100);
                mobPct = 100 - deskPct;
            }

            if (deskBar) deskBar.style.width = `${deskPct}%`;
            if (mobBar) mobBar.style.width = `${mobPct}%`;
            if (deskPctLabel) deskPctLabel.innerHTML = `<i class="fa-solid fa-laptop text-cyan-400 mr-1"></i> Desktop ${deskPct}% (${formatDurationShort(desktopSecs)})`;
            if (mobPctLabel) mobPctLabel.innerHTML = `<i class="fa-solid fa-mobile-screen text-purple-400 mr-1"></i> Mobile ${mobPct}% (${formatDurationShort(mobileSecs)})`;
            if (splitPill) {
                splitPill.textContent = `💻 Desktop: ${formatDurationShort(desktopSecs)} (${deskPct}%) • 📱 Mobile: ${formatDurationShort(mobileSecs)} (${mobPct}%)`;
            }

            // 8. Update Account Status Pill in Header
            const acctPill = document.getElementById('st-cross-device-account-pill');
            if (acctPill) {
                if (user) {
                    acctPill.innerHTML = `
                        <div class="flex items-center gap-2">
                            ${user.picture ? `<img src="${user.picture}" class="w-5 h-5 rounded-full border border-cyan-400">` : `<div class="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[10px] flex items-center justify-center">${(user.name||'G').charAt(0).toUpperCase()}</div>`}
                            <span class="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-[200px]" title="${user.email}">${user.email}</span>
                            <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono font-bold">LINKED</span>
                        </div>
                    `;
                } else {
                    acctPill.innerHTML = `
                        <div class="flex items-center gap-2">
                            <span class="text-[11px] text-amber-300 font-medium"><i class="fa-solid fa-triangle-exclamation mr-1"></i>Not Linked</span>
                            <button role="button" onclick="if(window.ArcGoogleSync){ArcGoogleSync.loginWithGoogle();}else{alert('Google sync ready');}; playSfx('click')" class="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] uppercase tracking-wider transition">
                                Link Account
                            </button>
                            <button role="button" onclick="if(window.ArcGoogleSync){ArcGoogleSync.loginDemoAccount();}else{alert('Demo sync ready');}; playSfx('click')" class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-[10px] transition" title="1-Click Demo Account">
                                Demo
                            </button>
                        </div>
                    `;
                }
            }

            // 9. Update Sidebar Screen Time Widget Quick Indicators
            const sideMob = document.getElementById('sidebar-mobile-time');
            const sideComb = document.getElementById('sidebar-combined-time');
            if (sideMob) sideMob.textContent = formatDurationShort(mobileSecs);
            if (sideComb) sideComb.textContent = formatDurationShort(combinedSecs);

            // 9b. Update live HUD and permanent notification
            if (window.ArcScreenTimeNotifier && typeof window.ArcScreenTimeNotifier.syncTimes === 'function') {
                window.ArcScreenTimeNotifier.syncTimes(desktopSecs, mobileSecs, combinedSecs);
            }

            // 9b-2. Sync with ArcScreenTimeStore
            if (window.ArcScreenTimeStore && typeof window.ArcScreenTimeStore.saveCurrentDay === 'function') {
                window.ArcScreenTimeStore.saveCurrentDay(desktopSecs, mobileSecs);
            }

            // 9c. Update Phone Application Widgets
            if (window.ArcPhoneWidgets && typeof window.ArcPhoneWidgets.updateWidgets === 'function') {
                window.ArcPhoneWidgets.updateWidgets();
            }

            // 10. Persist to storage & state
            window.state = window.state || {};
            window.state.deviceScreenTime = deviceData;
            try {
                localStorage.setItem('arc_cross_device_screentime', JSON.stringify(deviceData));
                if (typeof setLocalStorageItem === 'function') {
                    setLocalStorageItem('arc_cross_device_screentime', deviceData);
                }
            } catch(e) {}
        }

        function simulateMobileTime(extraMins = 225) {
            if (window.ArcGoogleSync && typeof window.ArcGoogleSync.simulateMobileTrackerSync === 'function') {
                window.ArcGoogleSync.simulateMobileTrackerSync(extraMins);
            } else {
                const today = (typeof getTodayKey === 'function') ? getTodayKey() : new Date().toISOString().split('T')[0];
                const simulatedSecs = Math.max(60, Number(extraMins || 225) * 60);
                window.state = window.state || {};
                window.state.deviceScreenTime = window.state.deviceScreenTime || {};
                window.state.deviceScreenTime.mobile = {
                    seconds: simulatedSecs,
                    deviceName: '📱 Pixel 9 Pro (Android Mobile Tracker)',
                    lastUpdated: Date.now(),
                    todayKey: today,
                    isLinked: true
                };
                try {
                    localStorage.setItem('arc_cross_device_screentime', JSON.stringify(window.state.deviceScreenTime));
                } catch(e) {}
                updateCrossDeviceScreenTimeUI();
                renderScreenTime();
                if (typeof playSfx === 'function') playSfx('fanfare');
                if (typeof triggerGradeParticleBurst === 'function') {
                    triggerGradeParticleBurst(window.innerWidth / 2, window.innerHeight / 2, 'S');
                }
                if (typeof spawnFloatingCombatText === 'function') {
                    spawnFloatingCombatText(`📱 SYNCED: +${formatDuration(simulatedSecs)} MOBILE TRACKER`, window.innerWidth / 2 - 100, window.innerHeight / 2);
                }
                if (typeof showToast === 'function') {
                    showToast(`📱 Mobile Screen Time simulated: ${formatDuration(simulatedSecs)}`);
                }
            }
        }

        function promptSetMobileTime() {
            const entered = prompt("Enter Mobile App Tracker screen time in minutes:\n(e.g., 225 for 3h 45m)", "225");
            if (entered !== null) {
                const num = parseInt(entered, 10);
                if (!isNaN(num) && num >= 0) {
                    simulateMobileTime(num);
                }
            }
        }

        // Expose to window for global access
        window.ArcAppTracker = {
            init: initAppTracker,
            renderScreenTimeView,
            updateCrossDeviceScreenTimeUI,
            simulateMobileTime,
            promptSetMobileTime,
            setActiveApp,
            pauseActiveApp,
            isAppBlocked,
            isFocusActive,
            startFocusSession,
            stopFocusSession,
            toggleAppFocusBlock,
            setAllAppsFocusBlock,
            openFocusBlocklistModal,
            closeFocusBlocklistModal,
            isYouTubeChannelBlocked,
            toggleYouTubeFilterEnabled,
            toggleYouTubeShortsBlock,
            openYouTubeFilterModal,
            closeYouTubeFilterModal,
            submitAddBlockedChannel,
            removeBlockedYouTubeChannel,
            runYouTubeChannelTest,
            isWebsiteBlocked,
            toggleWebsiteFilterEnabled,
            submitAddBlockedWebsite,
            addBlockedWebsite,
            removeBlockedWebsite,
            openWebsiteFilterModal,
            closeWebsiteFilterModal,
            runWebsiteAccessTest,
            showWebsiteBlockerShield,
            closeWebsiteBlockerShield,
            showFocusBlockerShield,
            closeFocusBlockerShield,
            showYouTubeBlockerShield,
            closeYouTubeBlockerShield,
            showBlockerShield,
            closeBlockerShield,
            submitEmergencyExtension,
            openAccessibilityModal,
            closeAccessibilityModal,
            confirmAccessibilityGranted,
            openLimitModal,
            closeLimitModal,
            setPresetLimit,
            saveAppLimitFromModal,
            openAddCustomAppModal,
            closeAddCustomAppModal,
            saveCustomApp,
            deleteCustomApp,
            simulateAddUsage,
            resetAppUsage,
            toggleStrictMode,
            setFilter: setAppFilter,
            setSearch: setAppSearch
        };

        

// ============================================================================
// PHASE 3: TRUE NATIVE OS PROCESS & FOREGROUND WINDOW TRACKING IN RUST
// ============================================================================

export const OS_PROCESS_MAP = {
  "youtube": ["youtube.com", "youtube"],
  "instagram": ["instagram.com", "instagram"],
  "twitter": ["x.com", "twitter.com", "twitter"],
  "reddit": ["reddit.com", "reddit"],
  "tiktok": ["tiktok.com", "tiktok"],
  "netflix": ["netflix.com", "netflix"],
  "discord": ["discord.exe", "discord", "discordptb.exe", "discordcanary.exe"],
  "gaming": ["steam.exe", "steamwebhelper.exe", "epicgameslauncher.exe", "riotclientservices.exe", "minecraft.exe", "robloxplayerbeta.exe", "cs2.exe", "valorant.exe"],
  "chrome": ["chrome.exe", "msedge.exe", "brave.exe", "firefox.exe", "opera.exe", "arc.exe", "safari"],
  "vscode": ["code.exe", "code - insiders.exe", "cursor.exe", "devenv.exe", "idea64.exe", "pycharm64.exe", "wezterm-gui.exe", "windowsterminal.exe"]
};

export async function syncMonitorConfigToRust() {
  if (typeof window === "undefined" || !window.__TAURI_INTERNALS__) return;
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const focusRunning = typeof isFocusActive === "function" ? isFocusActive() : false;
    const blockedProcesses = [];
    const blockedKeywords = [];

    if (Array.isArray(appTrackerState.apps)) {
      appTrackerState.apps.forEach(app => {
        const used = (appTrackerState.usage && appTrackerState.usage[app.id]) || 0;
        const isQuotaExceeded = app.blockEnabled && used >= app.dailyLimitSecs;
        const isFocusLocked = focusRunning && app.blockInFocus;
        if (isQuotaExceeded || isFocusLocked) {
          const procs = OS_PROCESS_MAP[app.id] || (app.proc ? [app.proc] : []);
          procs.forEach(p => blockedProcesses.push(p));
        }
      });
    }

    if (focusRunning && appTrackerState.websiteFilter && appTrackerState.websiteFilter.enabled) {
      (appTrackerState.websiteFilter.blockedWebsites || []).forEach(site => {
        if (site && site.domain) {
          blockedKeywords.push(site.domain.replace(/^www./, "").split(".")[0]);
        }
      });
    }

    if (appTrackerState.youtubeFilter && appTrackerState.youtubeFilter.enabled) {
      (appTrackerState.youtubeFilter.blockedChannels || []).forEach(ch => {
        if (ch && ch.name) blockedKeywords.push(ch.name.toLowerCase());
        if (ch && ch.handle) blockedKeywords.push(ch.handle.toLowerCase().replace("@", ""));
      });
    }

    await invoke("set_os_monitor_config", {
      config: {
        enabled: true,
        pollIntervalMs: 1000,
        focusModeActive: focusRunning,
        strictModeActive: typeof isFocusStrictModeActive === "function" ? isFocusStrictModeActive() : false,
        blockedProcesses,
        blockedTitleKeywords: blockedKeywords
      }
    });
  } catch (err) {
    console.warn("[ArcAppTracker] Rust config sync skipped:", err);
  }
}

export async function initNativeOsBridge() {
  if (typeof window === "undefined" || !window.__TAURI_INTERNALS__) return;
  try {
    const { listen } = await import("@tauri-apps/api/event");
    const { invoke } = await import("@tauri-apps/api/core");

    await syncMonitorConfigToRust();

    await listen("arc://active-window-changed", (event) => {
      const tel = event.payload;
      if (!tel || tel.idleSeconds > 120) return; // Pause app quota counting if user is idle > 2 mins

      const proc = (tel.processName || "").toLowerCase();
      const title = (tel.windowTitle || "").toLowerCase();
      if (!proc || proc.includes("arc-tracker") || proc.includes("arctracker") || title.includes("winter & summer arc")) {
        return;
      }

      // 1. Check browser window titles for YouTube channels or blocked websites
      const isBrowser = (OS_PROCESS_MAP.chrome || []).some(b => proc.includes(b));
      if (isBrowser) {
        if (title.includes("youtube")) {
          const ytCheck = typeof isYouTubeChannelBlocked === "function" ? isYouTubeChannelBlocked(title) : null;
          if (ytCheck && ytCheck.blocked) {
            invoke("enforce_window_shield", { lockOnTop: true }).catch(() => {});
            if (typeof showYouTubeBlockerShield === "function") {
              showYouTubeBlockerShield(ytCheck.channel, ytCheck.reason);
            }
            return;
          }
          appTrackerState.activeAppId = "youtube";
          return;
        }

        if (typeof isFocusActive === "function" && isFocusActive() && appTrackerState.websiteFilter && appTrackerState.websiteFilter.enabled) {
          const webCheck = typeof isWebsiteBlocked === "function" ? isWebsiteBlocked(title) : null;
          if (webCheck && webCheck.blocked) {
            invoke("enforce_window_shield", { lockOnTop: true }).catch(() => {});
            if (typeof showWebsiteBlockerShield === "function") {
              showWebsiteBlockerShield(webCheck.domain, webCheck.reason);
            }
            return;
          }
        }
      }

      // 2. Match custom or default tracked apps by process name or window title
      if (Array.isArray(appTrackerState.apps)) {
        for (const app of appTrackerState.apps) {
          const candidates = OS_PROCESS_MAP[app.id] || (app.proc ? [app.proc.toLowerCase()] : []);
          const matched = candidates.some(c => proc.includes(c) || title.includes(c));
          if (matched) {
            if (typeof isFocusActive === "function" && isFocusActive() && app.blockInFocus) {
              invoke("enforce_window_shield", { lockOnTop: true }).catch(() => {});
              if (typeof triggerFocusBlock === "function") triggerFocusBlock(app.id);
              return;
            }
            if (app.blockEnabled && ((appTrackerState.usage && appTrackerState.usage[app.id]) || 0) >= app.dailyLimitSecs) {
              invoke("enforce_window_shield", { lockOnTop: true }).catch(() => {});
              if (typeof triggerAppLockout === "function") triggerAppLockout(app.id);
              return;
            }
            appTrackerState.activeAppId = app.id;
            return;
          }
        }
      }
    });
  } catch (err) {
    console.warn("[ArcAppTracker] Native OS bridge fallback to web mode:", err);
  }
}

// Hook shield release
export function releaseWindowShield() {
  if (typeof window !== "undefined" && window.__TAURI_INTERNALS__) {
    import("@tauri-apps/api/core").then(({ invoke }) => {
      invoke("enforce_window_shield", { lockOnTop: false }).catch(() => {});
    }).catch(() => {});
  }
}

const ArcAppTracker = window.ArcAppTracker;

export {
  DEFAULT_TRACKED_APPS,
  appTrackerState,
  initAppTracker,
  renderScreenTimeView,
  ArcAppTracker
};
export const arcAppTracker = ArcAppTracker;
export default ArcAppTracker;
