# Arc Tracker — Standalone Native Desktop & Mobile Application

Converted from `pro22.html` to a standalone, 100% offline-first native application for **Desktop (Windows/macOS)** and **Android** using **Tauri 2.0** and **Vite**.

---

## 🚀 Architecture & Upgrades

### 1. Workspace Scaffolding

- Initialized with **Tauri 2.0** + **Vite** + **Vanilla JavaScript**.
- Fast HMR development server (`npm run dev`) and production bundler (`npm run build`).

### 2. 100% Offline Asset Localization

All external CDN dependencies have been downloaded and embedded locally inside `/public/assets/`:

- **Tailwind CSS Engine:** `/public/assets/tailwind.js`
- **FontAwesome 6.4.0 Icons & Webfonts:** `/public/assets/fontawesome/css/all.min.css` and `/public/assets/fontawesome/webfonts/` (solid, regular, brands, v4compatibility woff2 & ttf).
- **Inter Typography:** `/public/assets/fonts/inter.css` with local woff2 font files embedded.
- **Offline Favicons:** Cached inside `/public/assets/favicons/`.

### 3. Upgraded Storage Engine (`src/storage.js`)

Replaced basic browser `localStorage` with a **Dual-Layer High-Durability Engine**:

- **Tauri Plugin Store (`@tauri-apps/plugin-store`):** Direct file-backed persistence (`arc_tracker_store.bin`) in native desktop and Android environments.
- **Transactional IndexedDB Engine (`arc_tracker_db`):** Protects habit streaks and telemetry from aggressive mobile OS cache purges.
- **In-Memory Synchronous Cache:** Zero-latency reads with transparent background write-through so all existing synchronous functions (`state`, `getLocalStorageItem`, `saveToLocalStorage`) execute without race conditions.
- **Automatic Migration:** Automatically imports existing user habits and settings from `localStorage` upon first launch.

### 4. Security, Antivirus & Airgap Protection (`src/security.js`)

Equipped with zero-trust local security protections:

- **WebCrypto AES-256-GCM Encryption:** Secures user telemetry, journal entries, and streak records at rest.
- **Strict Airgap Content Security Policy (CSP):** `connect-src 'none'`, `form-action 'none'`, and `object-src 'none'` block external data exfiltration and tracking pixels.
- **Heuristic Antivirus & Memory Monitor:** Scans DOM injections, detects suspicious script execution, and prevents prototype poisoning.

### 5. Application Configuration (`src-tauri/tauri.conf.json`)

- **Product Name:** `Arc Tracker`
- **Identifier:** `com.arctracker.app`
- **Default Desktop Dimensions:** `1280x800` (min: `800x600`, resizable, centered)
- **Tauri 2.0 Permissions:** Configured in `src-tauri/capabilities/default.json` (`core:default`, `store:default`).
- **Android Targets:** Configured with SDK level 24+ (target 34).

---

## 📦 Build & Delivery Instructions

### Quick Launch on Desktop Right Now

Double-click `Launch-ArcTracker.bat` to launch the offline production build in a standalone `1280x800` app window.

### Local Development

```bash
# Start local Vite development server
npm run dev

# Run Tauri desktop dev mode
npm run tauri dev
```

### Local Production Builds

```bash
# Build desktop binary (.exe on Windows, .dmg on macOS)
npm run tauri build
# Or run:
powershell -ExecutionPolicy Bypass -File scripts/build-desktop.ps1

# Build Android release APK (.apk)
powershell -ExecutionPolicy Bypass -File scripts/build-android.ps1
```

### Automated Multi-Platform Releases (GitHub Actions)

A pre-configured CI/CD workflow is included at `.github/workflows/build-and-release.yml`:

1. Push this repository to GitHub.
2. The workflow automatically runs in parallel:
   - **Windows Runner:** Generates `Arc Tracker.exe` (NSIS installer and standalone).
   - **macOS Runner:** Generates `Arc Tracker.dmg` (Universal binary for Intel & Apple Silicon).
   - **Android Runner:** Sets up Java 17, Android SDK & NDK, and outputs signed `Arc-Tracker-release-signed.apk`.
3. All binaries are uploaded as downloadable artifacts in GitHub Actions and attached to GitHub Releases.
