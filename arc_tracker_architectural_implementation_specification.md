# Arc Tracker (`com.arctracker.app`) — Principal Architectural Refactoring & Implementation Specification

**Target Executor:** Autonomous Coding Agent (Antigravity / Gemini 3.8 Flash)  
**Workspace Root:** `c:\Users\vruti\OneDrive\Desktop\mayank\mayank`  
**Core Stack:** Tauri 2.0 (Rust 2021 Edition), Vite 5, Tailwind CSS 3.4 (PostCSS CLI), Vanilla ES2022 Modules  
**Target Platforms:** Windows 10/11 (`x86_64-pc-windows-msvc`), macOS (`aarch64-apple-darwin` / `x86_64-apple-darwin`), Android (`minSdkVersion 26`), iOS 15.0+ WebKit/PWA  

---

## 0. EXECUTIVE ARCHITECTURAL INVARIANTS & SAFETY GUARANTEES

Before executing any file creation or modification, the coding agent must enforce these four non-negotiable architectural invariants:

1. **Zero Data Loss & Storage Key Continuity:**
   All existing data stored in `arc_tracker_store.bin` (Tauri Plugin Store), IndexedDB (`ArcTrackerDB`), and `localStorage` must remain $100\%$ compatible. The following canonical keys must never be renamed or invalidated:
   - `arc_tracker_state` (Core habits, `dailyHabits`, `dailyFocus`, `streak`, `timer`, `laptop`, `gam`, `vision`, `settings`)
   - `arc_schema_version` (Current value: `"2"`)
   - `whatHappenedText` (Daily reflection journal text)
   - `synced_screenTimeData` (Historical domain/site usage array)
   - `app_settings` (SettingsApp configuration object)
   - `arc_tracked_apps_catalog`, `arc_app_usage_${YYYY-MM-DD}`, `arc_youtube_channel_filter`, `arc_website_filter`, `arc_app_accessibility_perm`, `arc_app_strict_mode`
   - `arc_cross_device_screentime`, `arc_screentime_history_v2`, `arc_phone_link_status`
   - `arc_gold_membership`, `arc_gold_applied_promo`, `arc_black_white_mode`, `arc_liquid_glass_enabled`, `arc_custom_background_v1`
   - `arc_sec_pin_hash`, `arc_sec_pin_salt`, `arc_sec_2fa_enabled`, `arc_sec_2fa_method`, `arc_sec_2fa_secret`, `arc_sec_2fa_backup_codes`
   - `arc_user_profile`, `arc_google_user`, `arc_notifications_v1`, `arc_secrets_found`, `arc_vault`

2. **DOM ID & Global Handler Preservation:**
   The legacy inline scripts and existing `src/*.js` modules rely on direct DOM queries (`document.getElementById`, `document.querySelector`) and inline HTML event attributes (`onclick="switchTab('tracker')"`, `onchange="toggleHabit('1')"`, etc.).
   - During de-monolithization, all HTML templates extracted into `src/views/` and `src/components/` **must be synchronously mounted into `<div id="app-shell"></div>` prior to executing the module bootstrap sequence** so that every DOM node exists before any script queries it.
   - All global functions invoked by inline HTML attributes (`window.switchTab`, `window.playSfx`, `window.toggleHabit`, `window.ArcAppTracker`, `window.ArcSecurity`, etc.) must remain bound to `window`.

3. **Hardware Gatekeeper & Smoothness Compliance:**
   Devices with $< 2\text{ GB}$ RAM or missing WebGL 2.0 must still trigger the `ArcHardwareGatekeeper` diagnostic barrier, and Tier 1 lower-end devices ($2\text{ GB} - 4\text{ GB}$ RAM or $\le 4$ CPU cores) must respect particle/audio suspension rules.

4. **Strict Content Security Policy (CSP) Airgap:**
   All assets, styles, fonts, and icons must be bundled locally. No runtime CDN scripts (`https://cdn.tailwindcss.com`) are permitted.

---

## PHASE 1: REPLACEMENT OF RUNTIME TAILWIND JIT WITH PRE-COMPILED CSS PIPELINE

### 1.1 Objective
Eliminate `assets/tailwind.js` ($407\text{ KB}$ browser runtime JIT compiler that observes every DOM mutation) and extract all $12$ inline `<style>` blocks from `index.html` into a structured, build-time Vite + PostCSS + Tailwind CSS pipeline. This reduces initial main-thread blocking time by $> 400\text{ ms}$ and cuts memory overhead during high-frequency DOM updates.

### 1.2 File Operations Overview
- **Modify:** `package.json`
- **Create:** `tailwind.config.js`
- **Create:** `postcss.config.js`
- **Modify:** `vite.config.js`
- **Create:** `src/styles/main.css`
- **Create:** `src/styles/calendar-grades.css`
- **Create:** `src/styles/animations-panels.css`
- **Create:** `src/styles/themes-light-mode.css`
- **Create:** `src/styles/screentime-cyber.css`
- **Create:** `src/styles/pro13-settings-ax.css`
- **Create:** `src/styles/rpg-overhaul.css`
- **Create:** `src/styles/liquid-glass.css`
- **Create:** `src/styles/bw-monochrome.css`
- **Remove (after verification):** `assets/tailwind.js` reference from `index.html`

### 1.3 Step-by-Step Implementation Instructions

#### Step 1.3.1: Update `package.json`
Add `tailwindcss`, `postcss`, and `autoprefixer` to `devDependencies`.

```json
{
  "name": "arc-tracker",
  "private": true,
  "version": "2.6.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "tauri": "tauri"
  },
  "dependencies": {
    "@tauri-apps/api": "^2.2.0",
    "@tauri-apps/plugin-store": "^2.2.0",
    "qrcode-generator": "^2.0.4"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.2.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "vite": "^5.4.11"
  }
}
```

#### Step 1.3.2: Create `postcss.config.js`
Create `c:\Users\vruti\OneDrive\Desktop\mayank\mayank\postcss.config.js`:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

#### Step 1.3.3: Create `tailwind.config.js`
Port the exact inline `tailwind.config` from `index.html` (lines 43–91) into `c:\Users\vruti\OneDrive\Desktop\mayank\mayank\tailwind.config.js` and scan all HTML and JS files in `src/`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./terms-and-conditions.html",
    "./privacy-policy.html",
    "./src/**/*.{js,ts,jsx,tsx,html}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      },
      colors: {
        winter: {
          900: "#060913",
          800: "#0D1322",
          700: "#151D33",
          600: "#1E294B",
          accent: "#00F0FF",
          teal: "#14B8A6",
          purple: "#8B5CF6",
          gold: "#F59E0B"
        }
      },
      animation: {
        "pulse-glow": "pulseGlow 2s infinite ease-in-out",
        "spin-slow": "spin 12s linear infinite",
        "bounce-short": "bounceShort 0.4s ease-in-out",
        "float": "float 4s infinite ease-in-out",
        "shine": "shine 2.5s infinite linear",
        "slide-in": "slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "zoom-in": "zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards"
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", filter: "drop-shadow(0 0 8px rgba(0,240,255,0.4))" },
          "50%": { opacity: "0.9", filter: "drop-shadow(0 0 18px rgba(0,240,255,0.8))" }
        },
        bounceShort: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.06)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" }
        },
        shine: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(20px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateX(0) scale(1)" }
        },
        zoomIn: {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        }
      }
    }
  },
  plugins: []
};
```

#### Step 1.3.4: Extract Inline `<style>` Blocks into Modular CSS Files
Extract every `<style>` block from `index.html` into `src/styles/` in the exact cascade order they appear in `index.html` so CSS specificity is $100\%$ identical:

| Source `<style>` in `index.html` | Line Range (`pro22.html` ref) | Target CSS Module File | Key Selectors Contained |
| :--- | :--- | :--- | :--- |
| Primary `<style>` + `#hr-gpu` | Lines `94–717` | `src/styles/calendar-grades.css` | `.bg-noise`, `.glass-card`, `.habit-checkbox`, `.calendar-grade-s/a/b/c/f/none`, `#summer-showcase-overlay`, `.spider-web-card-container`, `.retro-arcade-mode`, `.god-mode-active`, `#hb-t`, `#hb-v` |
| `<style id="arc-smooth-panel-animations">` | Lines `720–911` | `src/styles/animations-panels.css` | `#arc-hud-card`, `#arc-notifications-drawer`, `.arc-fluid-accordion`, `details.faq-item`, `#pp12-drawer`, `.pp-modal` |
| `<style id="pp12-css">` (Part 1: Light Mode & Core PP12) | Lines `3826–4393` | `src/styles/themes-light-mode.css` | `html[data-mode=light]`, `html[data-mode=night]`, `html.pp-themed`, `#pp12-fx`, `#pp12-drawer`, `.pp-modal`, `.tab-view-enter`, `#arc-ambient-cursor-glow`, `.fa-x-twitter` |
| `<style id="pp12-css">` (Part 2: Screen Time Cyber & Widgets) | Lines `4394–4823` | `src/styles/screentime-cyber.css` | `.st-cyber-ambient`, `.st-radar-dial`, `.st-synapse-stream`, `.st-equalizer`, `.st-progress-track`, `.phone-widget-card`, `.arc-phone-frame`, `.arc-gold-glow-pulse` |
| `#p13-css`, `#polish-css`, `#settings-css`, `#sa-css`, `#ax-css`, `#p20-css` | Lines `7152–7199`, `7523–7817`, `7886–7946`, `8141–8156`, `8306–8327`, `8505–8519` | `src/styles/pro13-settings-ax.css` | `.p13-hm`, `.pq0`–`.pq5`, `.grand-achievement-card`, `.ee-badge-card`, safe-area media queries, `body.arc-discretion-mode`, `@media print`, `.sx-row`, `.sx-sw`, `#sa-burst`, `#ax-bar`, `.ax-hc`, `.ax-rm` |
| `<style id="rpg-summer-overhaul-css">` + Mobile Perm styles | Lines `8622–8698`, `11801–11834` | `src/styles/rpg-overhaul.css` | `.rpg-glow-cyan`, `.rpg-floating-combat-text`, `.rpg-screen-shake`, `.rpg-task-pulse`, `.rpg-boss-hit`, `.kb-card`, `#arc-mobile-permissions-modal` |
| `<style id="arc-liquid-glass-css">` | Lines `8716–9012` | `src/styles/liquid-glass.css` | `html.arc-liquid-glass` dark/light glass surfaces, 3D tilt, `.arc-lg-switch` |
| `<style id="arc-bw-master-css">` | Lines `9014–9520` | `src/styles/bw-monochrome.css` | `html.arc-bw-mode` universal high-contrast black & white overrides |

Create `c:\Users\vruti\OneDrive\Desktop\mayank\mayank\src\styles\main.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import "./calendar-grades.css";
@import "./animations-panels.css";
@import "./themes-light-mode.css";
@import "./screentime-cyber.css";
@import "./pro13-settings-ax.css";
@import "./rpg-overhaul.css";
@import "./liquid-glass.css";
@import "./bw-monochrome.css";
```

#### Step 1.3.5: Update `vite.config.js`
Configure Vite 5 for multi-page HTML inputs (`index.html`, `terms-and-conditions.html`, `privacy-policy.html`), deterministic chunk splitting, and Tauri port `1420`:

```javascript
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "./",
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"]
    }
  },
  envPrefix: ["VITE_", "TAURI_ENV_*"],
  build: {
    target: process.env.TAURI_ENV_PLATFORM === "windows" ? "chrome105" : "safari15",
    minify: !process.env.TAURI_ENV_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html")
      },
      output: {
        manualChunks: {
          "vendor-tauri": ["@tauri-apps/api", "@tauri-apps/plugin-store"],
          "arc-views": [
            "./src/views/trackerView.js",
            "./src/views/rulesView.js",
            "./src/views/resultsView.js",
            "./src/views/progressionView.js",
            "./src/views/settingsView.js",
            "./src/views/screentimeView.js",
            "./src/views/notificationsView.js"
          ]
        }
      }
    }
  }
});
```

---

## PHASE 2: DE-MONOLITHIZATION OF `index.html` INTO MODULAR ES COMPONENTS & VIEWS

### 2.1 Objective
Reduce `index.html` from $34,365$ lines ($1.92\text{ MB}$) to a lean $< 120$-line application shell by extracting all HTML view sections, modal trees, and inline `<script>` blocks into modular ES files under `src/views/`, `src/components/`, and `src/modules/`.

### 2.2 Architectural Mounting Strategy (Zero Broken Selectors)
Because existing scripts query DOM IDs immediately upon initialization (e.g., `document.getElementById('habits-container')`, `document.getElementById('sx-root')`, `document.getElementById('pp12-drawer')`), **we must not use asynchronous lazy-loading for the core DOM skeleton on startup**. Instead:
1. `src/shell.js` synchronously assembles and injects the HTML strings from `src/components/*` and `src/views/*` into `#app-shell` before any logic module (`initApp`, `PP12`, `Pro13`, `SettingsApp`, etc.) runs.
2. This reduces `index.html` to $< 5\text{ KB}$, enables Vite tree-shaking and code-splitting, and guarantees that $100\%$ of existing `getElementById` and `querySelector` calls succeed synchronously.

### 2.3 Exact Component & Script Extraction Mapping Table

#### A. HTML View & Component Extraction Map (`index.html` / `pro22.html` $\rightarrow$ `src/views/` & `src/components/`)

| Source Section in `index.html` (`pro22.html` lines) | Target Module File Path | Exported Function Signature | Key DOM IDs Preserved Inside Module |
| :--- | :--- | :--- | :--- |
| Background layers + `<header class="arc-safe-header">` (`914–1006`) | `src/components/headerNav.js` | `export function renderHeaderNav(): string` | `#arc-custom-bg`, `#fx-canvas`, `#bg-glow-container`, `#arc-logo-icon`, `#arc-main-title`, `#tab-tracker`..`#tab-settings`, `#btn-header-notifications`, `#header-profile-pill`, `#btn-header-bw`, `#btn-header-discretion`, `#btn-share-tracker`, `#btn-audio-toggle` |
| `#arc-completion-banner` + `<section id="view-tracker">` (`1010–1252`) | `src/views/trackerView.js` | `export function renderTrackerView(): string` | `#arc-completion-banner`, `#view-tracker`, `#quote-card-container`, `#stat-current-day`, `#stat-today-completion`, `#card-stat-streak`, `#stat-overall-score`, `#tracker-calendar-days-grid`, `#habits-container`, `#whatHappened`, `#laptop-timer-display`, `#custom-habit-name`, `#home-store-rating-section` |
| `<section id="view-rules">` (`1255–1311`) | `src/views/rulesView.js` | `export function renderRulesView(): string` | `#view-rules`, `#blueprint-title`, `#p20-habit-manager`, `#p20-hm`, `#rules-streak-freeze-card`, `#rules-freeze-toggle`, `#rules-pillar-grid` |
| `<section id="view-results">` (`1314–1661`) | `src/views/resultsView.js` | `export function renderResultsView(): string` | `#view-results`, `#res-total-focus-time`, `#res-laptop-time`, `#res-grand-total-time`, `#displayWhatHappened`, `#displayTopWebsites`, `#spider-web-card-container`, `#pie-chart-svg`, `#pie-center-hub`, `#category-legend-list`, `#arc-leaderboard-groups-section`, `#calendar-days-grid`, `#matrix-days-grid` |
| `<section id="view-progression">` (`1662–1699`) | `src/views/progressionView.js` | `export function renderProgressionView(): string` | `#view-progression`, `#subtab-btn-rpg`, `#subtab-btn-kb`, `#progression-subtab-rpg`, `#progression-rpg-container`, `#progression-subtab-kb`, `#progression-kb-container` |
| `<section id="view-settings">` (`1702–2079`) | `src/views/settingsView.js` | `export function renderSettingsView(): string` | `#view-settings`, `#settings-view-subtabs`, `#settings-theme-arc-card`, `#settings-liquid-glass-card`, `#settings-custom-bg-card`, `#settings-autostart-card`, `#settings-screentime-notif-card`, `#p20-settings`, `#sx-root`, `#settings-additional-faq-card`, `#settings-about-founder-card`, `#settings-terms-legal-card`, `#settings-gold-card` |
| `<section id="view-screentime">` (`2082–2555`) | `src/views/screentimeView.js` | `export function renderScreentimeView(): string` | `#view-screentime`, `#st-radar-shield-score`, `#st-kpi-total-time`, `#st-cross-device-ecosystem`, `#st-historical-analytics-card`, `#st-phone-widgets-section`, `#st-focus-controller-card`, `#st-permission-banner`, `#st-app-launcher-pills`, `#st-apps-grid` |
| Screen Time & Blocker Modals (`2558–3162`) | `src/components/blockerModals.js` | `export function renderBlockerModals(): string` | `#arc-app-blocker-overlay`, `#arc-accessibility-modal`, `#arc-limit-config-modal`, `#arc-add-app-modal`, `#arc-focus-blocker-overlay`, `#arc-youtube-blocker-overlay`, `#arc-focus-blocklist-modal`, `#arc-strict-lockout-modal`, `#arc-gold-strict-upgrade-modal`, `#arc-gold-bw-upgrade-modal`, `#arc-youtube-filter-modal`, `#arc-website-blocker-overlay`, `#arc-website-filter-modal` |
| `<section id="view-notifications">` (`3165–3265`) | `src/views/notificationsView.js` | `export function renderNotificationsView(): string` | `#view-notifications`, `#filter-count-unread`, `#arc-notif-full-list` |
| Mobile Bottom Nav + Footer + HUD + Notif Drawer + Toast (`3269–3452`) | `src/components/footerHud.js` | `export function renderFooterHud(): string` | `#mobile-tab-tracker`..`#mobile-tab-settings`, `#footer-text`, `#arc-quantum-dot`, `#arc-screentime-hud`, `#arc-hud-card`, `#arc-notifications-drawer`, `#toast` |
| Easter Eggs, Showcase & Squad Modals (`3455–3665`) | `src/components/showcaseEasterModals.js` | `export function renderShowcaseEasterModals(): string` | `#matrix-rain-overlay`, `#arc-create-squad-modal`, `#cyberdeck-terminal-modal`, `#mandala-easter-egg-modal`, `#arc-modal`, `#summer-showcase-overlay` |
| PP12 Drawer, Security, Pairing, Last Month, Compare, Profile, RPG & Mobile Perm Modals (`4825–5821`, `9522–9641`, `11836–12115`) | `src/components/systemModals.js` | `export function renderSystemModals(): string` | `#pp12-live`, `#pp12-fx`, `#pp12-back`, `#pp12-drawer`, `#pp12-hud`, `#pp-keys`, `#pp-imp`, `#pp-rst`, `#pp-sec-quarantine`, `#arc-phone-linking-modal`, `#arc-confirm-pairing-modal`, `#arc-disconnect-warning-modal`, `#arc-screentime-share-modal`, `#arc-last-month-modal`, `#arc-cross-device-comparison-modal`, `#arc-store-rating-modal`, `#pp-sec-enc-exp`, `#pp-sec-enc-imp`, `#pp-sec-2fa-modal`, `#pp-sec-pin-modal`, `#arc-pin-overlay`, `#arc-privacy-shield`, `#pp-sec-shredder-modal`, `#arc-forgot-modal`, `#arc-terms-signup-modal`, `#arc-terms-reader-modal`, `#arc-profile-setup-modal`, `#arc-share-modal`, `#arc-unlock-loader`, `#arc-autostart-modal`, `#arc-autostart-prompt-modal`, `#arc-phone-simulator-modal`, `#rpg-levelup-overlay`, `#rpg-victory-cert-modal`, `#arc-mobile-permissions-modal`, `#arc-perm-pip-widget` |

#### B. Inline JavaScript Extraction Map (`index.html` $\rightarrow$ `src/modules/`)

| Source `<script>` Block in `index.html` | Line Range (`pro22.html` ref) | Target ES Module File Path | Global Bindings Preserved on `window` |
| :--- | :--- | :--- | :--- |
| Main Script Part 1: Audio & FX Canvas | Lines `1692–2280` | `src/modules/audioFxEngine.js` | `initAudio`, `sfxOut`, `__setSfxVol`, `toggleAudioMute`, `playSfx`, `playGradeSfx`, `playKeypadNote`, `createClickRipple`, `fxParticles`, `initFxCanvas`, `triggerConfettiBurst`, `triggerGradeParticleBurst`, `__fxStart`, `__fxStop` |
| Main Script Part 2: Core State, Calendar, Habits, Spider Web & Showcase | Lines `2281–3042` | `src/modules/coreTrackerEngine.js` | `state`, `CATEGORIES`, `WINTER_ARC_QUOTES`, `SUMMER_ARC_QUOTES`, `DEFAULT_HABITS`, `screenTimeData`, `getDurableStore`, `lsGetRaw`, `getLocalStorageItem`, `setLocalStorageItem`, `saveToLocalStorage`, `saveWhatHappenedText`, `getArcWindow`, `getEffectiveToday`, `getTodayKey`, `getTodayFocusSeconds`, `updateDynamicDayCounter`, `syncDayState`, `formatDateKey`, `formatDuration`, `getGradeInfo`, `showToast`, `getTopProductiveDay`, `generatePieChartSVG`, `handleBackupFileSync`, `renderScreenTime`, `updateDailyQuote`, `refreshDailyQuote`, `openArcModal`, `closeArcModal`, `confirmAndLaunchSummerShowcase`, `buildShowcaseSlides`, `renderShowcaseSlide`, `nextShowcaseSlide`, `prevShowcaseSlide`, `toggleShowcaseAutoplay`, `closeSummerShowcase`, `applyArcTheme`, `ARC_TAB_THEMES`, `switchTab`, `filterSettingsView`, `toggleFounderPanel`, `renderHabits`, `toggleHabit`, `toggleHabitForDate`, `addCustomHabit`, `deleteHabit`, `resetTodayHabits`, `updateRulesFreezeUI`, `toggleStreakFreezeFromRules`, `renderRulesBlueprint`, `renderCalendar`, `changeCalendarMonth`, `stepCalendarDay`, `selectCalendarDate`, `renderCalendarDayDetail`, `renderMatrix`, `renderSpiderWeb`, `showCategoryDetail`, `triggerPieChartAnimation`, `toggleLaptopTracker`, `startLaptopTimer`, `initApp` |
| Main Script Part 3: App Tracker & Screen Time UI | Lines `3043–3645` | `src/apptracker.js` (Consolidate) | `appTrackerState`, `initAppTracker`, `renderScreenTimeView`, `updateCrossDeviceScreenTimeUI`, `ArcAppTracker`, `isFocusStrictModeActive`, `toggleFocusStrictMode`, `getDopamineShieldData` |
| Main Script Part 4: Hardware Gatekeeper | Lines `3646–3823` | `src/hardware.js` (Consolidate) | `ArcHardwareGatekeeper` |
| `<script id="arc-two-factor-js">` | Lines `5823–6255` | `src/modules/twoFactorAuth.js` | `ArcTwoFactor` |
| `<script id="arc-security-js">` | Lines `6257–7026` | `src/modules/securityEcosystem.js` | `ArcSecurity`, `ArcProfile`, `ArcShare`, `ArcAutoStart`, `ArcScreenTimeNotifier`, `ArcPhoneWidgets`, `ArcGold`, `ArcBlackWhiteMode`, `ArcLiquidGlass`, `ArcStoreRating`, `ArcCustomBackground`, `ArcScreenTimeStore` |
| `<script id="pp12-js">` | Lines `7028–7150` | `src/modules/pp12Engine.js` | `PP12`, `A`, `R`, `__audioBands`, `ensureAudioGraph`, `logFocus`, `setAppTheme`, `setAppMode`, `setAppTransition`, `toggleLightDarkMode`, `toggleCelestialAudio`, `setCelestialVolume` |
| `<script id="p13-js">` | Lines `7200–7520` | `src/modules/pro13Engine.js` | `EE_BADGES`, `GRAND_EE_BADGE`, `switchBadgeFilter`, `openP13Modal`, `openM`, `bdHtml`, `getBadgeStats`, `openBadgeModal`, `rXP`, `calc`, `allP13` |
| `<script id="polish-js">` | Lines `7818–7885` | `src/modules/polishA11y.js` | Auto-commit listeners, showcase touch swipe, A11y `MutationObserver` |
| `<script id="settings-js">` | Lines `7947–8140` | `src/modules/settingsEngine.js` | `SettingsApp`, `getQuotePool`, `__sfzMemo`, `__sfzReset`, `__sfzDay`, `__sfzGap` |
| `<script id="sa-js">` | Lines `8157–8305` | `src/modules/summerArcVault.js` | `archiveCurrentArc`, `SummerArc` |
| `<script id="ax-js">` + `<script id="hb-audio">` + `<script id="p20-js">` | Lines `8328–8619` | `src/modules/axHeavenlyP20.js` | `HeavenlyBodies`, `__getHbBands`, `renderDayControl`, `renderHabitManager`, `p20`, `setDayOverride`, `clearDayOverride`, `openHabitManager` |
| `<script id="rpg-summer-overhaul-js">` | Lines `9642–10485` | `src/modules/rpgKnowledgeEngine.js` | `getPlayerClass`, `playCustomRpgSfx`, `spawnFloatingCombatText`, `displayHabitCelebrationBanner`, `triggerHabitCelebration`, `calculateUserXP`, `triggerLevelUpCelebration`, `closeLevelUpModal`, `testLevelUpCelebration`, `switchProgressionSubtab`, `renderProgressionTab`, `renderKnowledgeBase`, `handleKbSearch`, `filterKbCategory`, `strikeArcBoss`, `claimDailyQuest`, `exportArcMarkdownReport`, `toggleGameSetting`, `updateRpgLevelUI` |
| `<script id="arc-easter-eggs-and-secrets">` | Lines `10488–10955` | `src/modules/easterEggsEngine.js` | `unlockEasterEgg`, `triggerSpiderPulseEffect`, `handleCenterHubClick`, `handleSpiderNodeClick`, `handleLogoIconClick`, `closeMandalaEasterEgg`, `handleStreakCardClick`, `toggleMatrixRain`, `toggleCyberdeckTerminal`, `executeCyberdeckCommand`, `ArcSecrets`, `cheat`, `arc` |
| `<script id="arc-google-sync-js">` | Lines `10958–11650` | `src/modules/googleSyncComparison.js` | `ArcGoogleSync`, `ArcCrossDeviceComparison` |
| `<script id="arc-bundle-notifications-faq-founder">` | Lines `11652–11798` | `src/notifications.js`, `src/faq.js`, `src/founder.js`, `src/modules/leaderboardGroups.js` | `ArcNotifications`, `ArcLeaderboardGroups`, `ArcFaq`, `ArcAboutFounder` |
| `<script id="arc-mobile-permissions-engine">` | Lines `12117–12185` | `src/modules/mobilePermissions.js` | `ArcMobilePermissions` |

### 2.4 Exact Implementation of `src/shell.js` and Refactored `index.html`

#### Step 2.4.1: Create `src/shell.js`
Create `c:\Users\vruti\OneDrive\Desktop\mayank\mayank\src\shell.js`:

```javascript
import { renderHeaderNav } from "./components/headerNav.js";
import { renderTrackerView } from "./views/trackerView.js";
import { renderRulesView } from "./views/rulesView.js";
import { renderResultsView } from "./views/resultsView.js";
import { renderProgressionView } from "./views/progressionView.js";
import { renderSettingsView } from "./views/settingsView.js";
import { renderScreentimeView } from "./views/screentimeView.js";
import { renderBlockerModals } from "./components/blockerModals.js";
import { renderNotificationsView } from "./views/notificationsView.js";
import { renderFooterHud } from "./components/footerHud.js";
import { renderShowcaseEasterModals } from "./components/showcaseEasterModals.js";
import { renderSystemModals } from "./components/systemModals.js";

/**
 * Synchronously mounts the complete DOM structure into #app-shell before any
 * legacy or modular script executes querySelector / getElementById.
 */
export function mountAppShell() {
  const shell = document.getElementById("app-shell");
  if (!shell || shell.dataset.mounted === "true") return;

  shell.innerHTML = [
    renderHeaderNav(),
    `<main class="relative z-10 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex-grow">`,
    renderTrackerView(),
    renderRulesView(),
    renderResultsView(),
    renderProgressionView(),
    renderSettingsView(),
    renderScreentimeView(),
    renderBlockerModals(),
    renderNotificationsView(),
    `</main>`,
    renderFooterHud(),
    renderShowcaseEasterModals(),
    renderSystemModals()
  ].join("\n");

  shell.dataset.mounted = "true";
}
```

#### Step 2.4.2: Replace Monolithic `index.html` with Clean Shell
Replace `c:\Users\vruti\OneDrive\Desktop\mayank\mayank\index.html` with the clean shell below (after all view/component/module files in Section 2.3 are created):

```html
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <meta name="text-scale" content="scale">
    <meta name="theme-color" content="#060913" media="(prefers-color-scheme: dark)">
    <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
    <meta name="color-scheme" content="dark light">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="application-name" content="Arc Tracker">
    <title>Winter &amp; Summer Arc Interactive Mobile Tracker 2026</title>
    <link rel="manifest" href="./manifest.json">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Arc Tracker">
    <meta name="format-detection" content="telephone=no">
    <link rel="apple-touch-icon" href="./icons/128x128@2x.png">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self' https://cdnjs.cloudflare.com https://fonts.googleapis.com https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' data: https://cdnjs.cloudflare.com https://fonts.gstatic.com; img-src 'self' data: blob: https://lh3.googleusercontent.com https://*.googleusercontent.com; connect-src 'self' ipc: http://ipc.localhost https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com https://identitytoolkit.googleapis.com https://content.googleapis.com; frame-src 'self' https://accounts.google.com; media-src 'self' data:; object-src 'none'; form-action 'none'; base-uri 'self';">
    <meta name="referrer" content="no-referrer">

    <!-- Offline QR Code Generator & Local Fonts/Icons -->
    <script src="./assets/qrcode.min.js"></script>
    <link rel="stylesheet" href="./assets/fontawesome/css/all.min.css">
    <link rel="stylesheet" href="./assets/fonts/inter.css">

    <!-- Early anti-FOUC check for Black & White Mode -->
    <script>
        (function() {
            try {
                if (localStorage.getItem('arc_black_white_mode') === 'true') {
                    document.documentElement.classList.add('arc-bw-mode');
                }
            } catch (e) {}
        })();
    </script>

    <!-- Primary Modular Entry Point -->
    <script type="module" src="./src/main.js"></script>
    <!-- Google Identity Services for Optional Cross-Device Account Syncing -->
    <script src="https://accounts.google.com/gsi/client" async defer></script>
</head>
<body class="min-h-[100dvh] flex flex-col justify-between selection:bg-cyan-500 selection:text-black pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
    <div id="app-shell" class="contents"></div>
</body>
</html>
```

#### Step 2.4.3: Update `src/main.js` Bootstrap Sequence
Update `c:\Users\vruti\OneDrive\Desktop\mayank\mayank\src\main.js` so that:
1. `src/styles/main.css` is imported first.
2. `mountAppShell()` executes synchronously before any module queries the DOM.
3. `ArcStorage.init()` hydrates the memory cache from Tauri Store / IndexedDB / Atomic Snapshot before `initApp()` runs.
4. All extracted modules initialize in their deterministic dependency order.

```javascript
import "./styles/main.css";
import { mountAppShell } from "./shell.js";

// 1. Mount DOM synchronously so all IDs exist immediately
mountAppShell();

// 2. Import core storage & hardware gatekeeper
import "./storage.js";
import "./hardware.js";

// 3. Import core & feature modules (they bind global handlers and wait for init/DOMContentLoaded)
import "./modules/audioFxEngine.js";
import "./modules/coreTrackerEngine.js";
import "./apptracker.js";
import "./screentime.js";
import "./terms.js";
import "./notifications.js";
import "./faq.js";
import "./founder.js";
import "./modules/leaderboardGroups.js";
import "./modules/twoFactorAuth.js";
import "./modules/securityEcosystem.js";
import "./modules/pp12Engine.js";
import "./modules/pro13Engine.js";
import "./modules/polishA11y.js";
import "./modules/settingsEngine.js";
import "./modules/summerArcVault.js";
import "./modules/axHeavenlyP20.js";
import "./modules/rpgKnowledgeEngine.js";
import "./modules/easterEggsEngine.js";
import "./modules/googleSyncComparison.js";
import "./modules/mobilePermissions.js";

async function bootstrapArcTracker() {
  try {
    if (window.ArcStorage && typeof window.ArcStorage.init === "function") {
      await window.ArcStorage.init();
    }
    if (typeof window.initApp === "function") {
      window.initApp();
    }
  } catch (err) {
    console.error("[ArcMain] Bootstrap error:", err);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapArcTracker, { once: true });
} else {
  bootstrapArcTracker();
}
```

---

## PHASE 3: TRUE NATIVE OS PROCESS & FOREGROUND WINDOW TRACKING IN RUST

### 3.1 Objective
Replace browser-only heuristics in `src/apptracker.js` with true OS-level foreground window and process monitoring in Rust (`src-tauri`).
- On **Windows 10/11**, use Win32 APIs (`GetForegroundWindow`, `GetWindowThreadProcessId`, `OpenProcess`, `QueryFullProcessImageNameW`, `GetWindowTextW`, `GetLastInputInfo`) via the `windows-sys` crate.
- On **macOS**, query the frontmost application and window title via `osascript` / System Events or CoreGraphics non-blocking subprocesses.
- On **Android / iOS**, return a clean platform telemetry struct so mobile webview/accessibility bridges remain $100\%$ compatible.
- Run a lightweight, non-blocking background Rust polling loop ($1000\text{ ms}$ tick) that emits Tauri events (`"arc://active-window-changed"` and `"arc://os-idle-state"`) and exposes Tauri commands to bring the Arc Tracker window to the foreground (`AlwaysOnTop` + focus) when a blocked app, YouTube channel, or website is detected.

### 3.2 File Operations Overview
- **Modify:** `src-tauri/Cargo.toml`
- **Create:** `src-tauri/src/os_tracker.rs`
- **Modify:** `src-tauri/src/lib.rs`
- **Modify:** `src-tauri/capabilities/default.json`
- **Modify:** `src/apptracker.js`
- **Modify:** `src/screentime.js`

### 3.3 Exact Rust Data Contracts & Implementations

#### Step 3.3.1: Update `src-tauri/Cargo.toml`
Update `c:\Users\vruti\OneDrive\Desktop\mayank\mayank\src-tauri\Cargo.toml` to include `tokio` (for async background tasks) and platform-specific `windows-sys` features (`Win32_UI_WindowsAndMessaging`, `Win32_System_Threading`, `Win32_UI_Input_KeyboardAndMouse`, `Win32_Foundation`, `Win32_System_SystemInformation`):

```toml
[package]
name = "arc-tracker"
version = "2.6.0"
description = "Arc Tracker - Winter & Summer Arc Discipline Operating System"
authors = ["Mayank"]
edition = "2021"

[lib]
name = "arc_tracker_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-store = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tokio = { version = "1", features = ["rt", "rt-multi-thread", "time", "sync", "macros"] }

[target.'cfg(target_os = "windows")'.dependencies]
windows-sys = { version = "0.59", features = [
    "Win32_Foundation",
    "Win32_UI_WindowsAndMessaging",
    "Win32_System_Threading",
    "Win32_System_SystemInformation",
    "Win32_UI_Input_KeyboardAndMouse"
] }
```

#### Step 3.3.2: Create `src-tauri/src/os_tracker.rs`
Create `c:\Users\vruti\OneDrive\Desktop\mayank\mayank\src-tauri\src\os_tracker.rs` with full Win32 and macOS implementations:

```rust
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Emitter, Manager};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ActiveWindowTelemetry {
    pub process_id: u32,
    pub process_name: String,
    pub executable_path: String,
    pub window_title: String,
    pub idle_seconds: u64,
    pub timestamp_ms: u64,
    pub platform: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OsMonitorConfig {
    pub enabled: bool,
    pub poll_interval_ms: u64,
    pub focus_mode_active: bool,
    pub strict_mode_active: bool,
    pub blocked_processes: Vec<String>,
    pub blocked_title_keywords: Vec<String>,
}

impl Default for OsMonitorConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            poll_interval_ms: 1000,
            focus_mode_active: false,
            strict_mode_active: false,
            blocked_processes: Vec::new(),
            blocked_title_keywords: Vec::new(),
        }
    }
}

pub struct OsTrackerState {
    pub config: Mutex<OsMonitorConfig>,
    pub last_window: Mutex<Option<ActiveWindowTelemetry>>,
}

impl Default for OsTrackerState {
    fn default() -> Self {
        Self {
            config: Mutex::new(OsMonitorConfig::default()),
            last_window: Mutex::new(None),
        }
    }
}

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or(Duration::from_secs(0))
        .as_millis() as u64
}

#[cfg(target_os = "windows")]
pub fn query_os_active_window() -> ActiveWindowTelemetry {
    use windows_sys::Win32::Foundation::{CloseHandle, FALSE, HWND, MAX_PATH};
    use windows_sys::Win32::System::SystemInformation::GetTickCount64;
    use windows_sys::Win32::System::Threading::{
        OpenProcess, QueryFullProcessImageNameW, PROCESS_QUERY_LIMITED_INFORMATION,
    };
    use windows_sys::Win32::UI::Input::KeyboardAndMouse::{GetLastInputInfo, LASTINPUTINFO};
    use windows_sys::Win32::UI::WindowsAndMessaging::{
        GetForegroundWindow, GetWindowTextLengthW, GetWindowTextW, GetWindowThreadProcessId,
    };

    unsafe {
        let hwnd: HWND = GetForegroundWindow();
        let mut pid: u32 = 0;
        let mut window_title = String::new();
        let mut executable_path = String::new();
        let mut process_name = String::new();

        if !hwnd.is_null() {
            GetWindowThreadProcessId(hwnd, &mut pid);

            let title_len = GetWindowTextLengthW(hwnd);
            if title_len > 0 {
                let mut buf: Vec<u16> = vec![0; (title_len + 1) as usize];
                let copied = GetWindowTextW(hwnd, buf.as_mut_ptr(), title_len + 1);
                if copied > 0 {
                    window_title = String::from_utf16_lossy(&buf[..copied as usize]);
                }
            }

            if pid > 0 {
                let h_proc = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, FALSE, pid);
                if !h_proc.is_null() {
                    let mut path_buf: Vec<u16> = vec![0; MAX_PATH as usize * 4];
                    let mut size: u32 = path_buf.len() as u32;
                    let ok = QueryFullProcessImageNameW(h_proc, 0, path_buf.as_mut_ptr(), &mut size);
                    if ok != 0 && size > 0 {
                        executable_path = String::from_utf16_lossy(&path_buf[..size as usize]);
                        if let Some(fname) = executable_path.rsplit(&['\\', '/'][..]).next() {
                            process_name = fname.to_lowercase();
                        }
                    }
                    CloseHandle(h_proc);
                }
            }
        }

        // Calculate OS-level user idle seconds via GetLastInputInfo
        let mut lii = LASTINPUTINFO {
            cbSize: std::mem::size_of::<LASTINPUTINFO>() as u32,
            dwTime: 0,
        };
        let idle_seconds = if GetLastInputInfo(&mut lii) != 0 {
            let tick_now = GetTickCount64();
            let last_tick = lii.dwTime as u64;
            let current_tick_32 = (tick_now & 0xFFFF_FFFF) as u64;
            let elapsed_ms = if current_tick_32 >= last_tick {
                current_tick_32 - last_tick
            } else {
                (0x1_0000_0000 - last_tick) + current_tick_32
            };
            elapsed_ms / 1000
        } else {
            0
        };

        ActiveWindowTelemetry {
            process_id: pid,
            process_name,
            executable_path,
            window_title,
            idle_seconds,
            timestamp_ms: now_ms(),
            platform: "windows".to_string(),
        }
    }
}

#[cfg(target_os = "macos")]
pub fn query_os_active_window() -> ActiveWindowTelemetry {
    use std::process::Command;

    let script = r#"
        tell application "System Events"
            set frontApp to first application process whose frontmost is true
            set appName to name of frontApp
            set winTitle to ""
            try
                set winTitle to name of front window of frontApp
            end try
            return appName & "|||" & winTitle
        end tell
    "#;

    let mut process_name = String::new();
    let mut window_title = String::new();

    if let Ok(output) = Command::new("osascript").arg("-e").arg(script).output() {
        if output.status.success() {
            let raw = String::from_utf8_lossy(&output.stdout).trim().to_string();
            let mut parts = raw.splitn(2, "|||");
            process_name = parts.next().unwrap_or("").to_lowercase();
            window_title = parts.next().unwrap_or("").to_string();
        }
    }

    ActiveWindowTelemetry {
        process_id: 0,
        process_name: process_name.clone(),
        executable_path: process_name,
        window_title,
        idle_seconds: 0,
        timestamp_ms: now_ms(),
        platform: "macos".to_string(),
    }
}

#[cfg(not(any(target_os = "windows", target_os = "macos")))]
pub fn query_os_active_window() -> ActiveWindowTelemetry {
    ActiveWindowTelemetry {
        process_id: 0,
        process_name: String::new(),
        executable_path: String::new(),
        window_title: String::new(),
        idle_seconds: 0,
        timestamp_ms: now_ms(),
        platform: std::env::consts::OS.to_string(),
    }
}

/// Starts the non-blocking background OS window monitor task.
pub fn spawn_os_window_monitor(app_handle: AppHandle, tracker_state: Arc<OsTrackerState>) {
    tauri::async_runtime::spawn(async move {
        let mut interval = tokio::time::interval(Duration::from_millis(1000));
        loop {
            interval.tick().await;

            let cfg = {
                match tracker_state.config.lock() {
                    Ok(guard) => guard.clone(),
                    Err(_) => continue,
                }
            };

            if !cfg.enabled {
                continue;
            }

            let telemetry = tokio::task::spawn_blocking(query_os_active_window)
                .await
                .unwrap_or_else(|_| query_os_active_window());

            // Ignore self if Arc Tracker is the foreground window
            let is_self = telemetry.process_name.contains("arc-tracker")
                || telemetry.process_name.contains("arctracker")
                || telemetry.window_title.contains("Winter & Summer Arc");

            // Emit telemetry update to frontend
            let _ = app_handle.emit("arc://active-window-changed", &telemetry);

            if !is_self && !telemetry.process_name.is_empty() {
                let proc_lower = telemetry.process_name.to_lowercase();
                let title_lower = telemetry.window_title.to_lowercase();

                let proc_blocked = cfg
                    .blocked_processes
                    .iter()
                    .any(|bp| !bp.is_empty() && proc_lower.contains(&bp.to_lowercase()));

                let title_blocked = cfg
                    .blocked_title_keywords
                    .iter()
                    .any(|kw| !kw.is_empty() && title_lower.contains(&kw.to_lowercase()));

                if proc_blocked || title_blocked {
                    let _ = app_handle.emit("arc://os-lockout-triggered", &telemetry);
                    #[cfg(desktop)]
                    if let Some(win) = app_handle.get_webview_window("main") {
                        let _ = win.unminimize();
                        let _ = win.show();
                        let _ = win.set_always_on_top(true);
                        let _ = win.set_focus();
                    }
                }
            }

            if let Ok(mut last) = tracker_state.last_window.lock() {
                *last = Some(telemetry);
            }
        }
    });
}
```

#### Step 3.3.3: Update `src-tauri/src/lib.rs` (Complete Implementation)
Update `c:\Users\vruti\OneDrive\Desktop\mayank\mayank\src-tauri\src\lib.rs` to expose:
1. `get_device_telemetry` (existing command — preserved $100\%$)
2. `get_system_uptime_seconds` (existing command — preserved $100\%$)
3. `get_active_window_info` (new async command returning `ActiveWindowTelemetry`)
4. `set_os_monitor_config` (new command allowing `src/apptracker.js` to sync blocked process names and keywords)
5. `enforce_window_shield` (new command to bring the Tauri window to the front or release `always_on_top`)
6. `atomic_flush_state` & `load_atomic_snapshot` (Phase 4 high-durability atomic persistence commands)

```rust
pub mod os_tracker;

use os_tracker::{
    query_os_active_window, spawn_os_window_monitor, ActiveWindowTelemetry, OsMonitorConfig,
    OsTrackerState,
};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager, RunEvent, State, WindowEvent};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeviceTelemetry {
    pub os: String,
    pub arch: String,
    pub family: String,
    pub uptime_seconds: u64,
    pub timestamp_ms: u64,
}

#[derive(Default)]
pub struct AtomicFlushLock(pub Mutex<()>);

#[tauri::command]
pub fn get_system_uptime_seconds() -> u64 {
    #[cfg(target_os = "windows")]
    unsafe {
        windows_sys::Win32::System::SystemInformation::GetTickCount64() / 1000
    }
    #[cfg(not(target_os = "windows"))]
    {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|d| d.as_secs())
            .unwrap_or(0)
    }
}

#[tauri::command]
pub fn get_device_telemetry() -> DeviceTelemetry {
    let now_ms = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0);

    DeviceTelemetry {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        family: std::env::consts::FAMILY.to_string(),
        uptime_seconds: get_system_uptime_seconds(),
        timestamp_ms: now_ms,
    }
}

#[tauri::command]
pub async fn get_active_window_info() -> Result<ActiveWindowTelemetry, String> {
    tokio::task::spawn_blocking(query_os_active_window)
        .await
        .map_err(|e| format!("Failed to query active window: {}", e))
}

#[tauri::command]
pub fn set_os_monitor_config(
    state: State<'_, Arc<OsTrackerState>>,
    config: OsMonitorConfig,
) -> Result<(), String> {
    let mut guard = state
        .config
        .lock()
        .map_err(|_| "Failed to lock OsTrackerState".to_string())?;
    *guard = config;
    Ok(())
}

#[tauri::command]
pub fn enforce_window_shield(app: AppHandle, lock_on_top: bool) -> Result<(), String> {
    #[cfg(desktop)]
    if let Some(window) = app.get_webview_window("main") {
        if lock_on_top {
            let _ = window.unminimize();
            let _ = window.show();
            let _ = window.set_always_on_top(true);
            let _ = window.set_focus();
        } else {
            let _ = window.set_always_on_top(false);
        }
    }
    #[cfg(not(desktop))]
    let _ = (app, lock_on_top);
    Ok(())
}

fn snapshot_file_path(app: &AppHandle) -> Result<PathBuf, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to resolve app_data_dir: {}", e))?;
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir)
            .map_err(|e| format!("Failed to create app_data_dir: {}", e))?;
    }
    Ok(app_dir.join("arc_state_snapshot.json"))
}

/// Atomically writes the consolidated key-value snapshot to a temp file and renames it over
/// `arc_state_snapshot.json` to guarantee zero corruption on sudden power loss or OS shutdown.
#[tauri::command]
pub fn atomic_flush_state(
    app: AppHandle,
    flush_lock: State<'_, AtomicFlushLock>,
    payload_json: String,
) -> Result<bool, String> {
    let _guard = flush_lock
        .0
        .lock()
        .map_err(|_| "AtomicFlushLock poisoned".to_string())?;

    // Validate JSON syntax before committing to disk
    let _: serde_json::Value = serde_json::from_str(&payload_json)
        .map_err(|e| format!("Invalid JSON in atomic_flush_state: {}", e))?;

    let final_path = snapshot_file_path(&app)?;
    let tmp_path = final_path.with_extension("json.tmp");

    fs::write(&tmp_path, payload_json.as_bytes())
        .map_err(|e| format!("Failed to write temp snapshot: {}", e))?;
    fs::rename(&tmp_path, &final_path)
        .map_err(|e| format!("Failed to atomically rename snapshot: {}", e))?;

    Ok(true)
}

#[tauri::command]
pub fn load_atomic_snapshot(app: AppHandle) -> Result<Option<String>, String> {
    let path = snapshot_file_path(&app)?;
    if !path.exists() {
        return Ok(None);
    }
    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read atomic snapshot: {}", e))?;
    Ok(Some(content))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let tracker_state = Arc::new(OsTrackerState::default());
    let tracker_state_for_setup = Arc::clone(&tracker_state);

    let app = tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .manage(tracker_state)
        .manage(AtomicFlushLock::default())
        .setup(move |app| {
            let handle = app.handle().clone();
            spawn_os_window_monitor(handle, tracker_state_for_setup);
            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { .. } = event {
                let _ = window.emit("arc://flush-before-exit", ());
            }
        })
        .invoke_handler(tauri::generate_handler![
            get_device_telemetry,
            get_system_uptime_seconds,
            get_active_window_info,
            set_os_monitor_config,
            enforce_window_shield,
            atomic_flush_state,
            load_atomic_snapshot
        ])
        .build(tauri::generate_context!())
        .expect("error while building Arc Tracker Tauri application");

    app.run(|app_handle, event| {
        if let RunEvent::ExitRequested { .. } = event {
            let _ = app_handle.emit("arc://flush-before-exit", ());
        }
    });
}
```

#### Step 3.3.4: Wire Native OS Window Telemetry into `src/apptracker.js`
Update `c:\Users\vruti\OneDrive\Desktop\mayank\mayank\src\apptracker.js` to map native OS processes and window titles to `appTrackerState.apps`, YouTube channels, and Chrome websites:

1. **Process-to-App Mapping Dictionary (`OS_PROCESS_MAP`):**
   ```javascript
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
   ```

2. **Tauri Event Listener & Sync Bridge (`initNativeOsBridge` in `src/apptracker.js`):**
   Add `initNativeOsBridge()` inside `initAppTracker()`:
   ```javascript
   async function syncMonitorConfigToRust() {
     if (!window.__TAURI_INTERNALS__) return;
     try {
       const { invoke } = await import("@tauri-apps/api/core");
       const focusRunning = isFocusActive();
       const blockedProcesses = [];
       const blockedKeywords = [];

       appTrackerState.apps.forEach(app => {
         const used = appTrackerState.usage[app.id] || 0;
         const isQuotaExceeded = app.blockEnabled && used >= app.dailyLimitSecs;
         const isFocusLocked = focusRunning && app.blockInFocus;
         if (isQuotaExceeded || isFocusLocked) {
           const procs = OS_PROCESS_MAP[app.id] || (app.proc ? [app.proc] : []);
           procs.forEach(p => blockedProcesses.push(p));
         }
       });

       if (focusRunning && appTrackerState.websiteFilter?.enabled) {
         (appTrackerState.websiteFilter.blockedWebsites || []).forEach(site => {
           blockedKeywords.push(site.domain.replace(/^www\./, "").split(".")[0]);
         });
       }

       if (appTrackerState.youtubeFilter?.enabled) {
         (appTrackerState.youtubeFilter.blockedChannels || []).forEach(ch => {
           blockedKeywords.push(ch.name.toLowerCase());
           blockedKeywords.push(ch.handle.toLowerCase().replace("@", ""));
         });
       }

       await invoke("set_os_monitor_config", {
         config: {
           enabled: true,
           pollIntervalMs: 1000,
           focusModeActive: focusRunning,
           strictModeActive: isFocusStrictModeActive(),
           blockedProcesses,
           blockedTitleKeywords: blockedKeywords
         }
       });
     } catch (err) {
       console.warn("[ArcAppTracker] Rust config sync skipped:", err);
     }
   }

   async function initNativeOsBridge() {
     if (!window.__TAURI_INTERNALS__) return;
     try {
       const { listen } = await import("@tauri-apps/api/event");
       const { invoke } = await import("@tauri-apps/api/core");

       await syncMonitorConfigToRust();

       await listen("arc://active-window-changed", (event) => {
         const tel = event.payload;
         if (!tel || tel.idleSeconds > 120) return; // Pause app quota counting if user is idle > 2 mins

         const proc = (tel.processName || "").toLowerCase();
         const title = (tel.windowTitle || "").toLowerCase();
         if (!proc || proc.includes("arc-tracker") || title.includes("winter & summer arc")) {
           return;
         }

         // 1. Check browser window titles for YouTube channels or blocked websites
         const isBrowser = OS_PROCESS_MAP.chrome.some(b => proc.includes(b));
         if (isBrowser) {
           if (title.includes("youtube")) {
             const ytCheck = isYouTubeChannelBlocked(title);
             if (ytCheck && ytCheck.blocked) {
               invoke("enforce_window_shield", { lockOnTop: true }).catch(() => {});
               showYouTubeBlockerShield(ytCheck.channel, ytCheck.reason);
               return;
             }
             appTrackerState.activeAppId = "youtube";
             return;
           }

           if (isFocusActive() && appTrackerState.websiteFilter?.enabled) {
             const webCheck = isWebsiteBlocked(title);
             if (webCheck && webCheck.blocked) {
               invoke("enforce_window_shield", { lockOnTop: true }).catch(() => {});
               showWebsiteBlockerShield(webCheck.domain, webCheck.reason);
               return;
             }
           }
         }

         // 2. Match custom or default tracked apps by process name or window title
         for (const app of appTrackerState.apps) {
           const candidates = OS_PROCESS_MAP[app.id] || (app.proc ? [app.proc.toLowerCase()] : []);
           const matched = candidates.some(c => proc.includes(c) || title.includes(c));
           if (matched) {
             if (isFocusActive() && app.blockInFocus) {
               invoke("enforce_window_shield", { lockOnTop: true }).catch(() => {});
               triggerFocusBlock(app.id);
               return;
             }
             if (app.blockEnabled && (appTrackerState.usage[app.id] || 0) >= app.dailyLimitSecs) {
               invoke("enforce_window_shield", { lockOnTop: true }).catch(() => {});
               triggerAppLockout(app.id);
               return;
             }
             appTrackerState.activeAppId = app.id;
             return;
           }
         }
       });
     } catch (err) {
       console.warn("[ArcAppTracker] Native OS bridge fallback to web mode:", err);
     }
   }
   ```
    Also hook `closeBlockerShield()`, `closeFocusBlockerShield()`, `closeYouTubeBlockerShield()`, and `closeWebsiteBlockerShield()` to invoke `enforce_window_shield({ lockOnTop: false })` when the user returns to the Focus Dashboard.

---

## PHASE 4: HIGH-DURABILITY STATE CONSOLIDATION & ATOMIC FLUSH ENGINE

### 4.1 Objective
Eliminate race conditions and potential data loss between the in-memory `Map` cache, `localStorage`, IndexedDB, and Tauri Plugin Store (`arc_tracker_store.bin`). Ensure an atomic disk flush occurs on:
1. Every state mutation (debounced $250\text{ ms}$ for normal typing, immediate for habit toggles and focus sessions).
2. `document.visibilitychange` (`hidden`), `window.pagehide`, and `window.beforeunload`.
3. Tauri native `WindowEvent::CloseRequested` and `RunEvent::ExitRequested` via `"arc://flush-before-exit"`.

### 4.2 File Operations Overview
- **Modify:** `src/storage.js`
- **Modify:** `src-tauri/capabilities/default.json`

### 4.3 Exact Implementation of `src/storage.js`

Update `c:\Users\vruti\OneDrive\Desktop\mayank\mayank\src\storage.js` to implement the 4-tier High-Durability Storage Engine with monotonic write-versioning (`__arc_write_seq`) and Rust atomic snapshot fallback:

```javascript
/**
 * ArcStorage — High-Durability 4-Tier Transactional Storage Engine
 * Tier 1: Synchronous In-Memory Map (0ms read/write latency for UI)
 * Tier 2: Native browser localStorage mirror
 * Tier 3: Transactional IndexedDB (ArcTrackerDB -> kv_store)
 * Tier 4: Tauri Plugin Store (arc_tracker_store.bin) + Rust Atomic Snapshot (arc_state_snapshot.json)
 */

const DB_NAME = "ArcTrackerDB";
const DB_VERSION = 2;
const STORE_NAME = "kv_store";
const TAURI_STORE_FILE = "arc_tracker_store.bin";
const WRITE_SEQ_KEY = "__arc_write_seq";

class ArcDurableStorage {
  constructor() {
    this.memCache = new Map();
    this.idb = null;
    this.tauriStore = null;
    this.isInitialized = false;
    this.flushTimer = null;
    this.dirtyKeys = new Set();
    this.nativeLocalStorage = typeof window !== "undefined" ? window.localStorage : null;
    if (typeof window !== "undefined") {
      window.__nativeLocalStorage = this.nativeLocalStorage;
    }
  }

  async init() {
    if (this.isInitialized) return;

    // 1. Seed from native localStorage first (synchronous baseline)
    if (this.nativeLocalStorage) {
      try {
        for (let i = 0; i < this.nativeLocalStorage.length; i++) {
          const k = this.nativeLocalStorage.key(i);
          if (k) {
            const v = this.nativeLocalStorage.getItem(k);
            if (v !== null) this.memCache.set(k, v);
          }
        }
      } catch (e) {
        console.warn("[ArcStorage] localStorage seed warning:", e);
      }
    }

    // 2. Open IndexedDB and reconcile newer keys
    try {
      this.idb = await this._openIndexedDB();
      const idbEntries = await this._readAllIndexedDB();
      this._reconcileIncomingMap(idbEntries, "IndexedDB");
    } catch (e) {
      console.warn("[ArcStorage] IndexedDB init warning:", e);
    }

    // 3. Connect Tauri Plugin Store + Rust Atomic Snapshot if running in Tauri
    if (typeof window !== "undefined" && window.__TAURI_INTERNALS__) {
      try {
        const { load } = await import("@tauri-apps/plugin-store");
        this.tauriStore = await load(TAURI_STORE_FILE, { autoSave: false });
        const entries = await this.tauriStore.entries();
        if (Array.isArray(entries) && entries.length > 0) {
          const tauriMap = new Map();
          for (const [k, v] of entries) {
            tauriMap.set(k, typeof v === "string" ? v : JSON.stringify(v));
          }
          this._reconcileIncomingMap(tauriMap, "TauriStore");
        }
      } catch (e) {
        console.warn("[ArcStorage] Tauri Plugin Store warning:", e);
      }

      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const snapshotRaw = await invoke("load_atomic_snapshot");
        if (snapshotRaw) {
          const parsed = JSON.parse(snapshotRaw);
          if (parsed && typeof parsed === "object") {
            const snapMap = new Map(Object.entries(parsed));
            this._reconcileIncomingMap(snapMap, "RustAtomicSnapshot");
          }
        }
      } catch (e) {
        console.warn("[ArcStorage] Rust atomic snapshot load warning:", e);
      }

      // Listen for Rust OS exit / window close event to force immediate atomic flush
      try {
        const { listen } = await import("@tauri-apps/api/event");
        await listen("arc://flush-before-exit", () => {
          this.flushNow();
        });
      } catch (_) {}
    }

    // 4. Mirror reconciled state back to native localStorage so direct localStorage.getItem() callers see identical state
    this._syncMemoryToLocalStorage();

    // 5. Bind lifecycle durability hooks
    if (typeof window !== "undefined") {
      window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") this.flushNow();
      });
      window.addEventListener("pagehide", () => this.flushNow());
      window.addEventListener("beforeunload", () => this.flushNow());
    }

    this.isInitialized = true;
  }

  _reconcileIncomingMap(incomingMap, sourceName) {
    if (!incomingMap || incomingMap.size === 0) return;
    const currentSeq = parseInt(this.memCache.get(WRITE_SEQ_KEY) || "0", 10);
    const incomingSeq = parseInt(incomingMap.get(WRITE_SEQ_KEY) || "0", 10);

    // If incoming store has a higher sequence or memCache is missing core state, adopt incoming keys
    const shouldOverwrite = incomingSeq >= currentSeq || !this.memCache.has("arc_tracker_state");
    for (const [k, v] of incomingMap.entries()) {
      if (v === null || v === undefined) continue;
      const strVal = typeof v === "string" ? v : JSON.stringify(v);
      if (shouldOverwrite || !this.memCache.has(k)) {
        this.memCache.set(k, strVal);
      }
    }
    console.log(`[ArcStorage] Reconciled ${incomingMap.size} keys from ${sourceName} (seq ${incomingSeq}).`);
  }

  _syncMemoryToLocalStorage() {
    if (!this.nativeLocalStorage) return;
    for (const [k, v] of this.memCache.entries()) {
      try {
        this.nativeLocalStorage.setItem(k, v);
      } catch (_) {}
    }
  }

  _bumpSeq() {
    const nextSeq = (parseInt(this.memCache.get(WRITE_SEQ_KEY) || "0", 10) || 0) + 1;
    const seqStr = String(nextSeq);
    this.memCache.set(WRITE_SEQ_KEY, seqStr);
    this.dirtyKeys.add(WRITE_SEQ_KEY);
    if (this.nativeLocalStorage) {
      try { this.nativeLocalStorage.setItem(WRITE_SEQ_KEY, seqStr); } catch (_) {}
    }
  }

  getItem(key) {
    if (this.memCache.has(key)) {
      return this.memCache.get(key);
    }
    if (this.nativeLocalStorage) {
      try {
        const val = this.nativeLocalStorage.getItem(key);
        if (val !== null) {
          this.memCache.set(key, val);
          return val;
        }
      } catch (_) {}
    }
    return null;
  }

  setItem(key, value) {
    const strVal = typeof value === "string" ? value : JSON.stringify(value);
    this.memCache.set(key, strVal);
    this.dirtyKeys.add(key);
    this._bumpSeq();

    if (this.nativeLocalStorage) {
      try {
        this.nativeLocalStorage.setItem(key, strVal);
      } catch (e) {
        try {
          this.nativeLocalStorage.removeItem("pp12_revisions");
          this.nativeLocalStorage.setItem(key, strVal);
        } catch (_) {}
      }
    }

    this._scheduleFlush();
  }

  removeItem(key) {
    this.memCache.delete(key);
    this.dirtyKeys.add(key);
    this._bumpSeq();
    if (this.nativeLocalStorage) {
      try { this.nativeLocalStorage.removeItem(key); } catch (_) {}
    }
    this._scheduleFlush();
  }

  clear() {
    this.memCache.clear();
    this.dirtyKeys.clear();
    if (this.nativeLocalStorage) {
      try { this.nativeLocalStorage.clear(); } catch (_) {}
    }
    this.flushNow(true);
  }

  _scheduleFlush() {
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(() => {
      this.flushNow();
    }, 200);
  }

  async flushNow(isClear = false) {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    // Ensure latest global window.state is serialized into memCache before flushing
    if (!isClear && typeof window !== "undefined" && window.state && window.state.habits) {
      try {
        const serializedState = JSON.stringify(window.state);
        this.memCache.set("arc_tracker_state", serializedState);
        this.dirtyKeys.add("arc_tracker_state");
        if (this.nativeLocalStorage) {
          this.nativeLocalStorage.setItem("arc_tracker_state", serializedState);
        }
      } catch (_) {}
    }

    const keysToFlush = Array.from(this.dirtyKeys);
    this.dirtyKeys.clear();

    // 1. Flush to IndexedDB transactionally
    if (this.idb) {
      try {
        const tx = this.idb.transaction([STORE_NAME], "readwrite");
        const store = tx.objectStore(STORE_NAME);
        if (isClear) {
          store.clear();
        } else {
          for (const k of keysToFlush) {
            if (this.memCache.has(k)) {
              store.put(this.memCache.get(k), k);
            } else {
              store.delete(k);
            }
          }
        }
      } catch (e) {
        console.warn("[ArcStorage] IndexedDB flush warning:", e);
      }
    }

    // 2. Flush to Tauri Plugin Store & Rust Atomic Snapshot
    if (typeof window !== "undefined" && window.__TAURI_INTERNALS__) {
      if (this.tauriStore) {
        try {
          if (isClear) {
            await this.tauriStore.clear();
          } else {
            for (const k of keysToFlush) {
              if (this.memCache.has(k)) {
                await this.tauriStore.set(k, this.memCache.get(k));
              } else {
                await this.tauriStore.delete(k);
              }
            }
          }
          await this.tauriStore.save();
        } catch (e) {
          console.warn("[ArcStorage] TauriStore save warning:", e);
        }
      }

      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const fullObject = Object.fromEntries(this.memCache.entries());
        await invoke("atomic_flush_state", {
          payloadJson: JSON.stringify(fullObject)
        });
      } catch (e) {
        console.warn("[ArcStorage] Rust atomic_flush_state warning:", e);
      }
    }
  }

  _openIndexedDB() {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") return resolve(null);
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  _readAllIndexedDB() {
    return new Promise((resolve) => {
      if (!this.idb) return resolve(new Map());
      try {
        const tx = this.idb.transaction([STORE_NAME], "readonly");
        const store = tx.objectStore(STORE_NAME);
        const map = new Map();
        const cursorReq = store.openCursor();
        cursorReq.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            map.set(String(cursor.key), cursor.value);
            cursor.continue();
          } else {
            resolve(map);
          }
        };
        cursorReq.onerror = () => resolve(map);
      } catch (_) {
        resolve(new Map());
      }
    });
  }
}

const arcStorage = new ArcDurableStorage();
if (typeof window !== "undefined") {
  window.ArcStorage = arcStorage;
}
export default arcStorage;
```

#### Step 4.3.2: Update `src-tauri/capabilities/default.json`
Ensure `c:\Users\vruti\OneDrive\Desktop\mayank\mayank\src-tauri\capabilities\default.json` grants window management permissions (`core:window:allow-show`, `core:window:allow-unminimize`, `core:window:allow-set-focus`, `core:window:allow-set-always-on-top`) and event permissions (`core:event:default`):

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Default capabilities for Arc Tracker desktop and mobile",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "core:event:default",
    "core:window:default",
    "core:window:allow-show",
    "core:window:allow-unminimize",
    "core:window:allow-set-focus",
    "core:window:allow-set-always-on-top",
    "store:default"
  ]
}
```

---

## 5. VERIFICATION, TESTING & ROLLBACK PROTOCOL FOR THE CODING AGENT

After completing each phase, the autonomous coding agent must run the following verification commands in PowerShell (`c:\Users\vruti\OneDrive\Desktop\mayank\mayank`) and assert zero errors before proceeding to the next phase:

### Phase 1 Verification (Pre-Compiled Tailwind CSS & PostCSS)
```powershell
npm install
npx tailwindcss -i ./src/styles/main.css -o ./dist/test-tailwind.css
npm run build
```
- **Pass Criteria:**
  1. `npm run build` exits with code `0`.
  2. Generated CSS bundle in `dist/assets/*.css` is $< 180\text{ KB}$ (down from the $407\text{ KB}$ runtime `tailwind.js` script plus inline styles).
  3. All custom classes (`.glass-card`, `.calendar-grade-s`, `html[data-mode=light]`, `html.arc-liquid-glass`, `html.arc-bw-mode`) are present in the compiled stylesheet.

### Phase 2 Verification (De-Monolithization of `index.html`)
```powershell
npm run build
```
- **Pass Criteria:**
  1. `index.html` line count is $< 120$ lines (reduced from $34,365$ lines).
  2. Every view (`#view-tracker`, `#view-rules`, `#view-results`, `#view-progression`, `#view-settings`, `#view-screentime`, `#view-notifications`) and modal (`#pp12-drawer`, `#arc-pin-overlay`, `#summer-showcase-overlay`, `#arc-app-blocker-overlay`, etc.) mounts synchronously via `mountAppShell()`.
  3. Executing `document.querySelectorAll('[id]').length` in the browser console returns the exact same count of unique IDs as before refactoring, with zero `ReferenceError` or `TypeError: Cannot read properties of null` in DevTools console.

### Phase 3 Verification (Native Rust OS Window & Process Tracking)
```powershell
cd src-tauri
cargo check
cargo test
cd ..
```
- **Pass Criteria:**
  1. `cargo check` compiles `os_tracker.rs` and `lib.rs` with zero errors on the host OS.
  2. Invoking `window.__TAURI_INTERNALS__.invoke('get_active_window_info')` returns `{ processId, processName, executablePath, windowTitle, idleSeconds, timestampMs, platform }`.
  3. Starting a 25-minute Focus Session and switching to a blocked application or restricted YouTube channel triggers `"arc://os-lockout-triggered"`, restores and focuses the Arc Tracker window (`set_always_on_top(true)`), and displays `#arc-focus-blocker-overlay` or `#arc-youtube-blocker-overlay`.

### Phase 4 Verification (High-Durability Storage & Atomic Flush)
```powershell
npm run tauri build -- --debug
```
- **Pass Criteria:**
  1. Toggling a habit checkbox (`toggleHabit('1')`), modifying reflection text (`#whatHappened`), or incrementing screen time immediately increments `__arc_write_seq` and writes `arc_state_snapshot.json` inside the OS `app_data_dir` via atomic temp-file rename (`arc_state_snapshot.json.tmp` $\rightarrow$ `arc_state_snapshot.json`).
  2. Closing the window or refreshing the page preserves $100\%$ of habits, XP, streaks, custom wallpapers, security PIN hashes, and screen time counters.