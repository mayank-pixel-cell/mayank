import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const srcHtmlPath = path.join(rootDir, 'pro22.html');
const destHtmlPath = path.join(rootDir, 'index.html');

let html = fs.readFileSync(srcHtmlPath, 'utf8');

console.log('--- Converting pro22.html to standalone offline index.html ---');

// 0. Airgap Content Security Policy for offline bundle with Google Cloud Sync
html = html.replace(
  /<meta http-equiv="Content-Security-Policy"[^>]*>/i,
  '<meta http-equiv="Content-Security-Policy" content="default-src \'self\' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com https://fonts.googleapis.com https://fonts.gstatic.com; script-src \'self\' \'unsafe-inline\' https://accounts.google.com https://apis.google.com; style-src \'self\' \'unsafe-inline\' https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src \'self\' data: https://cdnjs.cloudflare.com https://fonts.gstatic.com; img-src \'self\' data: blob: https://lh3.googleusercontent.com https://*.googleusercontent.com; connect-src \'self\' https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com https://identitytoolkit.googleapis.com https://content.googleapis.com; frame-src \'self\' https://accounts.google.com; media-src \'self\' data:; object-src \'none\'; form-action \'none\'; base-uri \'self\';">'
);

// 0b. Add Web App Manifest and Apple iOS Web Clip meta tags
const iosPwaMeta = `    <link rel="manifest" href="./manifest.json">
    <!-- iOS Safari & Web Clip App Support -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Arc Tracker">
    <meta name="format-detection" content="telephone=no">
    <meta name="mobile-web-app-capable" content="yes">
    <link rel="apple-touch-icon" href="./icons/128x128@2x.png">`;

if (!html.includes('apple-mobile-web-app-capable')) {
  html = html.replace(/(<title>[^<]*<\/title>)/i, `$1\n${iosPwaMeta}`);
}

// 0c. Add iOS Safe Area and WebKit responsiveness styles
const iosSafeStyles = `
        /* iOS Safe Area & WebKit Touch Optimizations */
        :root {
            --sat: env(safe-area-inset-top, 0px);
            --sar: env(safe-area-inset-right, 0px);
            --sab: env(safe-area-inset-bottom, 0px);
            --sal: env(safe-area-inset-left, 0px);
        }
        body {
            padding-left: env(safe-area-inset-left, 0px);
            padding-right: env(safe-area-inset-right, 0px);
            -webkit-touch-callout: none;
            -webkit-text-size-adjust: 100%;
            text-size-adjust: 100%;
            touch-action: manipulation;
        }
        header.sticky {
            padding-top: max(0.625rem, calc(0.625rem + env(safe-area-inset-top, 0px))) !important;
        }
        @supports (-webkit-touch-callout: none) {
            input, select, textarea {
                font-size: max(16px, 1rem);
            }
        }
`;

if (!html.includes('/* iOS Safe Area & WebKit Touch Optimizations */')) {
  html = html.replace('<style>', `<style>${iosSafeStyles}`);
}

// 1. Replace Tailwind CDN
html = html.replace(
  '<script src="https://cdn.tailwindcss.com"></script>',
  '<script src="./assets/tailwind.js"></script>'
);

// 2. Replace FontAwesome CDN
html = html.replace(
  '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">',
  '<link rel="stylesheet" href="./assets/fontawesome/css/all.min.css">'
);

// 3. Replace Inter Font CDN
if (html.includes('<script type="module" src="./src/main.js"></script>')) {
  html = html.replace(
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">',
    '<link rel="stylesheet" href="./assets/fonts/inter.css">'
  );
} else {
  html = html.replace(
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">',
    '<link rel="stylesheet" href="./assets/fonts/inter.css">\n    <script type="module" src="./src/main.js"></script>'
  );
}

// 4. Replace external mock favicons with local copies
html = html.replaceAll('https://ssl.gstatic.com/chrome/webstore/images/icon_48px.png', './assets/favicons/chrome-webstore.png');
html = html.replaceAll('https://www.pw.live/study-v2/pw.ico', './assets/favicons/pw.ico');
html = html.replaceAll('https://www.chess.com/bundles/web/favicons/favicon.46041f2d.ico', './assets/favicons/chess.ico');
html = html.replaceAll('https://www.gstatic.com/images/branding/searchlogo/ico/favicon.ico', './assets/favicons/google.ico');
html = html.replaceAll('https://www.youtube.com/s/desktop/e6aecce7/img/favicon.ico', './assets/favicons/youtube.ico');
html = html.replaceAll('https://www.gstatic.com/lamda/images/gemini_sparkle_4g_512_lt_f94943af3be039176192d.png', './assets/favicons/gemini.png');

// 5. Upgrade storage wrapper functions
// Target lsGetRaw, getLocalStorageItem, setLocalStorageItem
const oldStorageSection = `        /* Safe localStorage wrapper functions with try-catch & schema checks */
        function lsGetRaw(key) {
            try { return localStorage.getItem(key); } catch (e) { return null; }
        }

        function getLocalStorageItem(key, fallback = null) {
            let raw = null;
            try {
                raw = localStorage.getItem(key);
                return raw ? JSON.parse(raw) : fallback;
            } catch (e) {
                console.warn(\`Error reading \${key} from localStorage:\`, e);
                // Corrupted JSON: keep a copy for manual recovery, clear the bad key, boot with defaults
                if (raw && e instanceof SyntaxError) {
                    try { localStorage.setItem(key + '__corrupt_backup', raw); localStorage.removeItem(key); } catch (_) {}
                }
                return fallback;
            }
        }

        function setLocalStorageItem(key, value) {
            let json;
            try { json = JSON.stringify(value); } catch (e) { console.warn(\`Error serializing \${key}:\`, e); return false; }
            try {
                localStorage.setItem(key, json);
                return true;
            } catch (e) {
                console.warn(\`Error writing \${key} to localStorage:\`, e);
                const quota = e && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22 || e.code === 1014);
                if (quota) {
                    try { localStorage.removeItem('pp12_revisions'); localStorage.setItem(key, json); return true; } catch (e2) {}
                    const now = Date.now();
                    if (!setLocalStorageItem._t || now - setLocalStorageItem._t > 15000) {
                        setLocalStorageItem._t = now;
                        try { if (typeof showToast === 'function') showToast('Storage full - export a backup to keep your data'); } catch (e3) {}
                    }
                }
                return false;
            }
        }`;

const upgradedStorageSection = `        /* Durable Offline Storage Wrapper: Tauri Plugin-Store + IndexedDB + LocalStorage */
        function getDurableStore() {
            return window.ArcStorage || window.localStorage;
        }

        function lsGetRaw(key) {
            try {
                const store = getDurableStore();
                return store.getItem(key);
            } catch (e) {
                return null;
            }
        }

        function getLocalStorageItem(key, fallback = null) {
            let raw = null;
            try {
                const store = getDurableStore();
                raw = store.getItem(key);
                return raw ? JSON.parse(raw) : fallback;
            } catch (e) {
                console.warn(\`[ArcStorage] Error reading \${key}:\`, e);
                if (raw && e instanceof SyntaxError) {
                    try {
                        const store = getDurableStore();
                        store.setItem(key + '__corrupt_backup', raw);
                        store.removeItem(key);
                    } catch (_) {}
                }
                return fallback;
            }
        }

        function setLocalStorageItem(key, value) {
            let json;
            try { json = JSON.stringify(value); } catch (e) { console.warn(\`[ArcStorage] Error serializing \${key}:\`, e); return false; }
            try {
                const store = getDurableStore();
                store.setItem(key, json);
                // Also mirror to native localStorage if available
                if (window.ArcStorage && window.__nativeLocalStorage) {
                    try { window.__nativeLocalStorage.setItem(key, json); } catch (_) {}
                }
                return true;
            } catch (e) {
                console.warn(\`[ArcStorage] Error writing \${key}:\`, e);
                try {
                    const store = getDurableStore();
                    store.removeItem('pp12_revisions');
                    store.setItem(key, json);
                    return true;
                } catch (e2) {}
                return false;
            }
        }`;

if (html.includes(oldStorageSection)) {
  html = html.replace(oldStorageSection, upgradedStorageSection);
  console.log('Successfully upgraded storage functions to durable hybrid engine!');
} else {
  console.warn('Exact storage block not matched; applying targeted replacements...');
  html = html.replace('function lsGetRaw(key) {\n            try { return localStorage.getItem(key);', 'function lsGetRaw(key) {\n            try { return (window.ArcStorage ? window.ArcStorage.getItem(key) : null) ?? localStorage.getItem(key);');
}

// Strip invalid C1 control characters (0x80 - 0x9F) that trigger parse5 control-character-in-input-stream errors
html = html.replace(/[\u0080-\u009F]/g, '');

// 6. Screen Time tab is permanently available in desktop and mobile navigation
// Header controls (Light Mode & Arc Switcher) relocated to Settings view to keep header clean & spacious.

// 7. Upgrade Screen Time Widget to Universal Multi-Platform Design with Cross-Device Sync Strip
const oldWidget = `<!-- SCREEN TIME TRACKER WIDGET -->
                    <div class="glass-card glass-card-hover rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4 border-l-4 border-l-blue-400">
                        <div class="flex items-center justify-between">
                            <h3 class="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                                <i class="fa-solid fa-laptop text-blue-400"></i> Laptop Screen Time
                            </h3>
                            <span class="text-[9px] sm:text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono animate-pulse" id="laptop-status-badge">AUTO-TRACKING</span>
                        </div>

                        <div class="text-center py-1">
                            <div class="text-2xl sm:text-4xl font-black font-mono tracking-wider text-white" id="laptop-timer-display">00h 00m 00s</div>
                            <p class="text-[10px] sm:text-xs text-slate-400 mt-1" id="laptop-status-desc">Automatically tracking active session time in tab</p>
                        </div>

                        <div class="flex gap-2">
                            <button role="button" id="btn-toggle-laptop" onclick="toggleLaptopTracker()" class="w-full py-2 sm:py-2.5 rounded-xl bg-slate-800 active:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition border border-slate-700 shadow-sm hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                                <i class="fa-solid fa-pause mr-1"></i> Pause Tracker
                            </button>
                        </div>

                        <!-- CROSS-DEVICE QUICK SYNC STRIP -->
                        <div id="cross-device-quick-pill" class="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px]">
                            <div class="bg-slate-950/60 p-2 rounded-lg border border-slate-800 flex items-center justify-between cursor-pointer hover:border-purple-500/40 transition" onclick="switchTab('screentime'); playSfx('click')" title="View Separately Made Mobile Screen Time Section">
                                <span class="text-purple-300 font-semibold flex items-center gap-1"><i class="fa-solid fa-mobile-screen"></i> Mobile:</span>
                                <span id="sidebar-mobile-time" class="font-mono font-bold text-white">0h 0m</span>
                            </div>
                            <div class="bg-slate-950/60 p-2 rounded-lg border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/40 transition" onclick="switchTab('screentime'); playSfx('click')" title="View Combined Screen Time Matrix">
                                <span class="text-cyan-300 font-semibold flex items-center gap-1"><i class="fa-solid fa-layer-group"></i> Combined:</span>
                                <span id="sidebar-combined-time" class="font-mono font-bold text-cyan-400">0h 0m</span>
                            </div>
                        </div>
                    </div>`;

const upgradedWidget = `<!-- SCREEN TIME TRACKER WIDGET (MULTI-PLATFORM) -->
                    <div class="glass-card glass-card-hover rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4 border-l-4 border-l-cyan-400 relative overflow-hidden">
                        <div class="flex items-center justify-between">
                            <h3 id="screen-time-widget-title" class="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                                <i id="screen-time-device-icon" class="fa-solid fa-laptop text-cyan-400"></i>
                                <span id="screen-time-device-label">Device Screen Time</span>
                            </h3>
                            <span class="text-[9px] sm:text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono animate-pulse flex items-center gap-1" id="laptop-status-badge">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> AUTO-TRACKING
                            </span>
                        </div>

                        <div class="text-center py-2 bg-slate-950/50 rounded-xl border border-slate-800/80">
                            <div class="text-2xl sm:text-4xl font-black font-mono tracking-wider bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent" id="laptop-timer-display">00h 00m 00s</div>
                            <p class="text-[10px] sm:text-xs text-slate-400 mt-1" id="laptop-status-desc">Auto-tracking on Phones, Macs &amp; Laptops • Zero input required</p>
                        </div>

                        <div class="grid grid-cols-2 gap-2">
                            <button role="button" id="btn-toggle-laptop" onclick="toggleLaptopTracker()" class="py-2 sm:py-2.5 rounded-xl bg-slate-800 active:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition border border-slate-700 shadow-sm hover:border-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                                <i class="fa-solid fa-pause mr-1"></i> Pause
                            </button>
                            <button role="button" onclick="switchTab('screentime'); playSfx('modalOpen')" class="py-2 sm:py-2.5 rounded-xl bg-cyan-500/20 active:bg-cyan-500/30 text-cyan-300 font-bold text-xs uppercase tracking-wider transition border border-cyan-500/40 shadow-sm hover:bg-cyan-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 flex items-center justify-center gap-1" title="App Screen Time, Usage Limits &amp; Blocker">
                                <i class="fa-solid fa-hourglass-half text-cyan-400"></i> App Limits
                            </button>
                        </div>

                        <!-- CROSS-DEVICE QUICK SYNC STRIP -->
                        <div id="cross-device-quick-pill" class="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[10px]">
                            <div class="bg-slate-950/60 p-2 rounded-lg border border-slate-800 flex items-center justify-between cursor-pointer hover:border-purple-500/40 transition" onclick="switchTab('screentime'); playSfx('click')" title="View Separately Made Mobile Screen Time Section">
                                <span class="text-purple-300 font-semibold flex items-center gap-1"><i class="fa-solid fa-mobile-screen"></i> Mobile:</span>
                                <span id="sidebar-mobile-time" class="font-mono font-bold text-white">0h 0m</span>
                            </div>
                            <div class="bg-slate-950/60 p-2 rounded-lg border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/40 transition" onclick="switchTab('screentime'); playSfx('click')" title="View Combined Screen Time Matrix">
                                <span class="text-cyan-300 font-semibold flex items-center gap-1"><i class="fa-solid fa-layer-group"></i> Combined:</span>
                                <span id="sidebar-combined-time" class="font-mono font-bold text-cyan-400">0h 0m</span>
                            </div>
                        </div>
                    </div>`;

if (html.includes(oldWidget)) {
  html = html.replace(oldWidget, upgradedWidget);
  console.log('Successfully upgraded Screen Time widget to multi-platform architecture!');
}

fs.writeFileSync(destHtmlPath, html, 'utf8');
console.log(`Generated offline index.html (${html.length} bytes)!`);

