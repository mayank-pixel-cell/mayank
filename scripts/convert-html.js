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

// 0. Airgap Content Security Policy for offline bundle
html = html.replace(
  /<meta http-equiv="Content-Security-Policy"[^>]*>/i,
  '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'; font-src \'self\' data:; img-src \'self\' data: blob:; connect-src \'none\'; media-src \'self\' data:; object-src \'none\'; form-action \'none\'; base-uri \'self\';">'
);

// 1. Replace Tailwind CDN
html = html.replace(
  '<script src="https://cdn.tailwindcss.com"></script>',
  '<script src="/assets/tailwind.js"></script>'
);

// 2. Replace FontAwesome CDN
html = html.replace(
  '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">',
  '<link rel="stylesheet" href="/assets/fontawesome/css/all.min.css">'
);

// 3. Replace Inter Font CDN
html = html.replace(
  '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">',
  '<link rel="stylesheet" href="/assets/fonts/inter.css">\n    <script type="module" src="/src/main.js"></script>'
);

// 4. Replace external mock favicons with local copies
html = html.replaceAll('https://ssl.gstatic.com/chrome/webstore/images/icon_48px.png', '/assets/favicons/chrome-webstore.png');
html = html.replaceAll('https://www.pw.live/study-v2/pw.ico', '/assets/favicons/pw.ico');
html = html.replaceAll('https://www.chess.com/bundles/web/favicons/favicon.46041f2d.ico', '/assets/favicons/chess.ico');
html = html.replaceAll('https://www.gstatic.com/images/branding/searchlogo/ico/favicon.ico', '/assets/favicons/google.ico');
html = html.replaceAll('https://www.youtube.com/s/desktop/e6aecce7/img/favicon.ico', '/assets/favicons/youtube.ico');
html = html.replaceAll('https://www.gstatic.com/lamda/images/gemini_sparkle_4g_512_lt_f94943af3be039176192d.png', '/assets/favicons/gemini.png');

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

fs.writeFileSync(destHtmlPath, html, 'utf8');
console.log(`Generated offline index.html (${html.length} bytes)!`);

