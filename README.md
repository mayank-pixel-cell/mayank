# Arc Tracker — Standalone Native Desktop, Android & iOS Application

Converted from `pro22.html` to a standalone, 100% offline-first native application for **Desktop (Windows/macOS)**, **Android**, and **iOS (iPhone/iPad)** using **Tauri 2.0** and **Vite**.

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
- **Offline Favicons & Apple Touch Icons:** Cached inside `/public/assets/favicons/` and `/public/icons/` (including 180x180, 152x152, 128x128 retina icons).

### 3. Upgraded Storage Engine (`src/storage.js`)

Replaced basic browser `localStorage` with a **Dual-Layer High-Durability Engine**:

- **Tauri Plugin Store (`@tauri-apps/plugin-store`):** Direct file-backed persistence (`arc_tracker_store.bin`) in native desktop and mobile environments.
- **Transactional IndexedDB Engine (`arc_tracker_db`):** Protects habit streaks and telemetry from aggressive mobile OS cache purges (both Android and iOS WebKit).
- **In-Memory Synchronous Cache:** Zero-latency reads with transparent background write-through so all existing synchronous functions execute without race conditions.
- **Automatic Migration:** Automatically imports existing user habits and settings from `localStorage` upon first launch.

### 4. iOS & Mobile Ergonomics

- **Apple Safe Area Insets:** Dynamic Island, notch, and iOS Home indicator bar padding (`env(safe-area-inset-top)` / `env(safe-area-inset-bottom)`).
- **Smooth Momentum Touch:** `-webkit-overflow-scrolling: touch` and `touch-action: manipulation` for zero-lag gesture response.
- **Form Auto-Zoom Prevention:** Automatic input sizing adjustments preventing Safari viewport jumps.
- **Standalone Web Clip / PWA Support:** Runs full-screen without Safari browser address bars or toolbars.

### 5. Automated Multi-Device Screen Time Engine (`src/screentime.js`)

- **Continuous Background Tracking:** Operates continuously even when the app is **minimized** or when using other applications (powered by an unthrottled background Web Worker).
- **Closed-App Session Reconciliation:** Automatically detects and reconciles device screen time elapsed while the app was closed during the day.
- **Hardware Idle & Sleep Watchdog:** Automatically pauses when the device is locked, lid is closed, or inactive for > 60 seconds, preventing deep sleep hours from inflating statistics.
- **Desktop System Uptime Bridge:** Interfaces with native OS hardware timers (`GetTickCount64` on Windows / boot-time on macOS) via Tauri 2.0 to sync true device powered-on time.
- **Android Usage Access:** Supports system-wide screen time monitoring across all third-party Android apps (`PACKAGE_USAGE_STATS`).
- **Interactive Screen Time Hub:** Real-time animated ticker, 7-day rolling trend chart, hardware telemetry status, and daily active vs idle breakdown.
- **Persistent Synchronization:** Automatically records daily usage in IndexedDB and Tauri store (`arc_screentime_YYYY-MM-DD`).

### 6. Application Configuration (`src-tauri/tauri.conf.json`)

- **Product Name:** `Arc Tracker`
- **Identifier:** `com.arctracker.app`
- **Default Desktop Dimensions:** `1280x800` (min: `800x600`, resizable, centered)
- **Tauri 2.0 Permissions:** Configured in `src-tauri/capabilities/default.json` (`core:default`, `store:default`).
- **Mobile Targets:** Android SDK 24+ and iOS 14.0+.

---

## 📱 iOS Accessibility Options

### Option A: Instant Zero-Install Web App (iPhone & iPad)

Because Arc Tracker is 100% offline-ready with local fonts and IndexedDB storage:

1. Host the `dist/` directory or run `npm run dev -- --host` on your local Wi-Fi.
2. Open the URL in Safari on your iPhone or iPad.
3. Tap the **Share** button (box with an arrow pointing up) at the bottom.
4. Scroll down and tap **"Add to Home Screen"**.
5. Tap **Add** in the top-right corner.
6. The app appears on your iOS home screen with the custom app icon and launches full-screen without Safari toolbars, working 100% offline!

### Option B: Native iOS Application via GitHub Actions (No Mac Needed Locally)

Because compiling native iOS `.ipa` and Xcode projects requires Apple Xcode (which only runs on macOS), our GitHub Actions CI/CD automatically handles this in the cloud:

1. Push your changes to GitHub or trigger the workflow under **Actions ➔ Build and Release Arc Tracker**.
2. The `build-ios` job runs on GitHub's **`macos-latest`** runner with Xcode pre-installed.
3. It initializes the Tauri iOS project, compiles the native targets, and packages:
   - `Arc-Tracker-iOS-XcodeProject.tar.gz` (Complete Xcode project ready to open on any Mac or deploy via Xcode / TestFlight)
   - Built `.app` / `.ipa` bundles.
4. Download the artifacts directly from the workflow run or GitHub Releases!

### Option C: Local iOS Development on macOS

If you or a collaborator have a Mac with Xcode:

```bash
# 1. Ensure Rust iOS targets are installed
rustup target add aarch64-apple-ios aarch64-apple-ios-sim

# 2. Run the automated iOS build script
chmod +x scripts/build-ios.sh
./scripts/build-ios.sh

# Or run Tauri iOS commands directly:
npm run tauri:ios:init
npm run tauri:ios:dev
npm run tauri:ios:build

# Open the project in Xcode:
open "src-tauri/gen/apple/Arc Tracker.xcodeproj"
```

---

## 📦 Desktop & Android Delivery

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

# Build Android release APK (.apk) for sideloading
powershell -ExecutionPolicy Bypass -File scripts/build-android.ps1 -Target apk

# Build Android App Bundle (.aab) for Google Play Store upload
powershell -ExecutionPolicy Bypass -File scripts/build-android.ps1 -Target aab
```

### Automated Multi-Platform Releases (GitHub Actions)

A pre-configured CI/CD workflow is included at `.github/workflows/build-and-release.yml`:

1. Push this repository to GitHub.
2. The workflow automatically runs 3 jobs in parallel:
   - **Windows Runner:** Generates `Arc Tracker.exe` (NSIS installer and standalone).
   - **macOS Runner (Desktop & iOS):** Generates `Arc Tracker.dmg` (Universal binary for Intel & Apple Silicon) and builds the **iOS Xcode project & bundle**.
   - **Android Runner:** Sets up Java 17, Android SDK & NDK, and outputs both:
     - `Arc-Tracker-release-signed.apk` (For testing and direct sideloading)
     - `Arc-Tracker-GooglePlay.aab` (Signed Android App Bundle ready to upload directly to Google Play Console).
3. All binaries are uploaded as downloadable artifacts in GitHub Actions and attached to GitHub Releases.

---

## 🏪 Google Play Store Deployment Checklist

1. **Google Play Console Account:** Register at [play.google.com/console](https://play.google.com/console) ($25 one-time fee).
2. **Upload Bundle:** Use `Arc-Tracker-GooglePlay.aab` generated by GitHub Actions or `scripts/build-android.ps1 -Target aab`.
3. **App Icon:** Ready at `/public/icons/icon.png` (512x512 PNG).
4. **Data Safety Form:** Select "No user data is collected or shared" (Arc Tracker is 100% offline and air-gapped).
5. **Privacy Policy:** Ready in `PRIVACY_POLICY.md` (host on GitHub Pages or any public URL).
6. **Closed Testing:** For personal developer accounts created after Nov 2023, run closed testing with 20 testers for 14 days before applying for full production release.
