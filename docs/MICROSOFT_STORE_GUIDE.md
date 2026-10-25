# 🪟 Microsoft Store Publishing Guide for Arc Tracker

This guide details the complete, step-by-step process to publish **Arc Tracker** to the **Microsoft Store** for Windows 10 & Windows 11.

---

## 📋 Overview of the Two Methods

You have two supported ways to package and launch Arc Tracker on the Microsoft Store:

| Method | Recommended For | Complexity | Output Package |
| :--- | :--- | :--- | :--- |
| **Option A: PWABuilder (Recommended)** | Web & PWA apps; automatic asset & store packaging | ⭐ Fast & Easy (15 mins) | `.msixbundle` / `.zip` for Partner Center |
| **Option B: Tauri MSIX Package** | Native Windows desktop app compiled via Tauri v2 CLI | ⭐⭐ Intermediate | `.msix` / `.msi` native binary package |

Both options are officially certified and accepted by Microsoft.

---

## 🛠️ Step 1: Prerequisites & Developer Account

1. **Register for a Microsoft Partner Center Account**:
   - Visit [partner.microsoft.com/dashboard](https://partner.microsoft.com/dashboard).
   - Sign in with a Microsoft account and select **Windows & Xbox**.
   - Pay the one-time registration fee (~$19 USD for an individual account; free if you have the GitHub Student Developer Pack).
   - Complete identity verification.

2. **Public Privacy Policy URL (Required by Microsoft Store)**:
   - Microsoft requires a publicly accessible HTTPS privacy policy URL.
   - Arc Tracker already has a complete offline privacy policy in `docs/privacy-policy.html` and `PRIVACY_POLICY.md`.
   - If hosting on GitHub Pages, your URL is:
     ```
     https://mayank-pixel-cell.github.io/mayank/privacy-policy.html
     ```

---

## 🚀 Step 2: Package the Application

### Option A: Via PWABuilder (Official Microsoft PWA Tool)

PWABuilder is an open-source, Microsoft-backed service that wraps your PWA into an MSIX package ready for Partner Center.

1. **Deploy your web app** (e.g., to GitHub Pages, Cloudflare Pages, or Vercel).
2. Go to **[PWABuilder.com](https://www.pwabuilder.com)**.
3. Enter your live URL (e.g. `https://mayank-pixel-cell.github.io/mayank/`) and click **Start**.
4. PWABuilder will validate `manifest.json` (Arc Tracker's manifest already has all icons, `display: standalone`, and categories).
5. Click **Package for Stores** ➔ **Windows (Microsoft Store)**.
6. In the dialog, enter your **Partner Center Package Identity**:
   - Go to Partner Center ➔ Your App ➔ **Product Identity**.
   - Copy and paste:
     - **Package Name** (e.g., `ArcTracker.2026`)
     - **Publisher ID** (e.g., `CN=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`)
     - **Publisher Display Name** (e.g., `Your Name / Organization`)
7. Click **Generate**. PWABuilder will output a `.zip` containing your signed `.msixbundle` and store asset packages.

---

### Option B: Via Tauri 2.0 CLI (Native Desktop MSIX)

If you prefer publishing the standalone native Rust/C++ Windows binary:

1. In `src-tauri/tauri.conf.json`, ensure your bundle settings target Windows:
   ```json
   "bundle": {
     "active": true,
     "targets": ["msi", "nsis"],
     "publisher": "CN=YOUR-PUBLISHER-ID-FROM-PARTNER-CENTER",
     "category": "Productivity"
   }
   ```
2. Build the desktop production bundle:
   ```bash
   npm run build
   npx tauri build
   ```
3. The compiled `.msi` or `.exe` will be located under:
   ```
   src-tauri/target/release/bundle/
   ```
4. Note: Microsoft Store now accepts standard Win32 `.msi` and `.exe` installers directly via Partner Center without requiring MSIX conversion!

---

## 📝 Step 3: Create the App Submission in Partner Center

1. **Reserve Your App Name**:
   - In [Microsoft Partner Center](https://partner.microsoft.com/dashboard/apps/overview), click **New product** ➔ **MSIX or PWA app** (or **Win32 app** if using Tauri installer).
   - Enter `Arc Tracker` (or `Arc Tracker 2026`) and click **Reserve product name**.

2. **Pricing and Availability**:
   - **Price**: Free.
   - **Markets**: Worldwide (all selected by default).
   - **Discoverability**: Public.

3. **Properties & Category**:
   - **Primary Category**: `Productivity`.
   - **Subcategory**: `Personal productivity` / `Lifestyle`.
   - **Privacy Policy URL**: `https://mayank-pixel-cell.github.io/mayank/privacy-policy.html`
   - **Website / Support**: Your GitHub repository URL.

4. **Age Ratings (IARC)**:
   - Fill out the standard IARC questionnaire.
   - Since Arc Tracker is an offline habit tracker with no violence, adult themes, or user-generated content, it receives an **Everyone / PEGI 3** rating.

5. **Upload Packages**:
   - Drag and drop the `.msixbundle` from PWABuilder (or the Tauri `.msi` package).
   - Partner Center validates the package signature and capabilities.

6. **Store Listings & Visual Assets**:
   - **Description**: Add a description highlighting offline security, zero cloud telemetry, 120Hz ProMotion, and habit ranking (Rank S to F).
   - **Keywords**: `habit tracker`, `winter arc`, `summer arc`, `screen time`, `discipline`, `offline tracker`.
   - **Screenshots**: Upload at least 1–4 desktop screenshots (1920x1080 or 1366x768).
   - **App Logos**: Provided automatically by PWABuilder or from `src-tauri/icons/`.

---

## ⏳ Step 4: Submit for Certification

1. Review the submission checklist.
2. Click **Submit to the Store**.
3. **Certification Timeline**:
   - Microsoft conducts automated and manual security/compliance reviews.
   - Typical approval time: **24 to 48 hours**.

---

## 🔗 Step 5: Connecting the Store Link in Arc Tracker

Once approved, Microsoft gives you a **Product ID** (e.g., `9NXXXXXXXXXX`).
Users on Windows can open or install it directly using the protocol:
```
ms-windows-store://pdp/?productid=<Your-Product-Id>
```
Or via web URL:
```
https://apps.microsoft.com/detail/<Your-Product-Id>
```

This seamlessly connects with the **Microsoft Store** button already integrated at the bottom of the Arc Tracker home screen!
