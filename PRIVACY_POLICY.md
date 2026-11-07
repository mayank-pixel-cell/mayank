# Privacy Policy for Arc Tracker

**Last updated:** November 7, 2026 (Protocol v2026.2)  
**Application:** Arc Tracker (Desktop, Android, Windows & iOS)  
**Developer:** Mayank / Arc Tracker Team  

---

## Executive Summary

Arc Tracker ("we", "our", or "us") is committed to absolute personal privacy and data sovereignty. Arc Tracker is built from the ground up as a **100% offline-first, client-side encrypted application**. We do not collect, transmit, sell, or monetize your habits, screen time, personal reflections, or identity metrics. Everything you do stays exclusively on your own device.

---

## 1. Zero Personal Data Collection & Airgap Architecture

Arc Tracker does not require accounts, remote registration, or cloud sign-in to use its core features:

- **No Personal Identifiable Information (PII):** We do not collect, request, harvest, or store your name, email address, phone number, or physical location on remote servers.
- **No Telemetry or Tracking Frameworks:** We do not include third-party tracking SDKs, analytics frameworks (such as Google Analytics, Firebase Tracking), advertising beacons, Adjust, AppsFlyer, or telemetry services.
- **No Remote Servers:** The application operates strictly locally on your hardware and does not transmit your habits, goals, journal entries, screen time records, or progress telemetry over the internet.
- **Zero-Exfiltration Network Firewall:** The application incorporates an active client-side outbound firewall designed to intercept and prevent any unauthorized background network egress, guaranteeing a true air-gapped operating environment.
- **Full Offline Functionality:** Arc Tracker functions completely in Airplane Mode without active internet access. Data never leaves your device unless you manually export a backup.

---

## 2. On-Device Storage & Cryptographic Security

All habit tracking progress, customizable metrics, journal entries, and streak records are stored **exclusively on your local device**:

- **Native Storage Engines:** Data is persisted using hardware-accelerated local databases (Tauri Plugin Store, browser IndexedDB, and localStorage).
- **Client-Side Cryptography:** Protected with client-side WebCrypto PBKDF2 (100,000 rounds SHA-256) and AES-GCM 256-bit encryption at rest.
- **Encrypted Backup Vaults (`.arcenc`):** When you export an encrypted backup, data is encrypted on-device with AES-256 using your private password. Because of our zero-knowledge design, no one—including the developers—can decrypt or recover these backups without your key.

---

## 3. Multi-User Profile Privacy & Partition Isolation

Arc Tracker supports multiple operative profiles on a single device with strict per-user separation:

- **Partition-Swapped Scoped Storage:** All habits, streaks, reflections, screen time records, and security credentials are stored under unique isolated partitions (`u:${userId}:*`).
- **Zero Cross-User Leakage:** One operative profile cannot view, modify, or infer another user's habits, journal entries, or screen time history on the same hardware.
- **Clean RAM Flushes:** Switching profiles automatically flushes in-memory cache and re-initializes volatile state to prevent shoulder-surfing and cross-session memory retention.

---

## 4. Optional Cloud Sync & Server Sync Engine (Zero-Knowledge)

Arc Tracker provides optional cross-device synchronization for users who explicitly choose to enable it:

- **Strictly Opt-In:** Cloud synchronization is disabled by default. Core functionality never requires connecting an online account.
- **Google Drive AppData / Private Peer Sync:** When enabled, sync payloads are encrypted client-side with user-held encryption keys before leaving your device.
- **Zero-Knowledge Architecture:** Cloud hosts, intermediate sync servers, Google, and the Arc Tracker developers have zero access to the plaintext contents or decryption keys of your sync payloads.
- **Instant Revocation:** You can disconnect cloud synchronization or purge remote sync state at any time with a single click.

---

## 5. Two-Step Verification (2FA) & Authentication Privacy

Arc Tracker includes an optional Two-Step Verification (2FA) layer to protect your local terminal:

- **Offline Authenticator App (TOTP):** Compatible with Google Authenticator, Microsoft Authenticator, and standard RFC 6238 TOTP apps. The secret key is generated using cryptographic random values (CSPRNG) strictly on your device and is never transmitted to any cloud or third-party server.
- **Phone Number / SMS Mode:** When configured, phone numbers are utilized strictly on-device for local verification logic. Arc Tracker does not connect to external SMS gateways, telecom providers, or cloud servers to transmit your phone number.
- **Emergency Backup Codes:** Five (5) one-time backup recovery codes are generated and hashed locally on-device. They are never synced to any remote database.
- **Anti-Spy Keypad & Clipboard Shield:** The security interface supports randomized PIN digit positions (defeating shoulder surfing) and features an automated 45-second clipboard wipe timer for sensitive codes.
- **Complete Revocation:** You can remove or disable Two-Step Verification at any time with a single click, which instantly wipes all authentication secrets and hashes from your local storage.

---

## 6. Screen Time, OS Window Tracking & Device Permissions

Arc Tracker requests no intrusive device permissions:

- **Desktop Window Title Detection (Windows):** Active foreground window titles and process names are inspected strictly in volatile memory solely to calculate active focus duration and enforce user-configured app lockouts. No keystrokes, screen recordings, window contents, file paths, or browser URLs are recorded, logged to disk, or transmitted.
- **Mobile Screen Time (Android):** When enabled by the user, Arc Tracker requests the standard Android `PACKAGE_USAGE_STATS` system API solely to calculate app quotas and enforce focus barriers. This data never leaves the device.
- **Local System Notifications:** System notifications are used solely on-device to alert you when daily app limits expire or when a Pomodoro focus timer completes.
- **No Camera, Microphone, or GPS Access:** Arc Tracker never requests camera, microphone, contacts, or precise location permissions.

---

## 7. Data Leak Prevention (DLP) & Physical Privacy

- **Discretion / Camouflage Mode (`Alt + S`):** Allows users to obscure habit titles and reflective journal entries with dynamic CSS filters to protect privacy in public or shared work environments.
- **Privacy Shield (Anti-Snoop):** Automatically veils screen contents when switching tabs or when the window loses OS focus.
- **Hardcopy Print & Screengrab Redaction Shield:** Automatically enforces blank redaction overlays when printing or exporting pages to prevent unauthorized physical hardcopy or PDF leaks.
- **Cryptographic Secure 3-Pass Shredder:** When performing data erasure, Arc Tracker overwrites storage sectors with CSPRNG noise across three passes to prevent physical forensic reconstruction.

---

## 8. Leaderboard, Groups & Social Progression Privacy (Level 10+)

Arc Tracker features opt-in community leaderboards and custom groups unlocked at Level 10:

- **Operative Pseudonymity:** You participate under a self-chosen call sign and handle (e.g. `@operative`). Real names, emails, and device IDs are never revealed.
- **Progression-Only Broadcast:** Only aggregate XP, levels, and streak counters are shared with leaderboard peers. Your private daily habits, journal notes, and screen time details are NEVER shared.
- **Opt-In Participation:** Participation is completely optional and can be deactivated at any time.

---

## 9. Subscriptions, Arc Gold VIP & Financial Privacy

- **Arc Gold & VIP Features:** Arc Tracker features local subscription tier simulation (including a 30-day free trial) and visual customization options (such as 4K 16:9 wallpapers, mobile 9:16 wallpapers, custom avatar outer lining rings, Black & White Monochrome mode, and 120Hz ProMotion).
- **Zero Financial Data Collection:** Subscription states, trial countdowns, and aesthetic preferences are managed entirely on-device. Arc Tracker does not collect, process, or store credit card numbers, billing addresses, or bank details.
- **No Deceptive Auto-Renewals:** There are no recurring subscription traps or unexpected charges.

---

## 10. Account Deletion & Right to Erasure

In compliance with Apple App Store Guideline 5.1.1(v), Google Play User Data policies, and GDPR Right to Erasure:

- **Instant Local Wipe:** You can permanently erase all tracked habits, logs, passwords, security keys, and screen time records at any time via *Settings &rarr; System & Data &rarr; Factory Reset (Erase Everything)* or the *Cryptographic Secure Shredder*.
- **Zero Remote Retention:** Because no data is stored on remote servers, deleting local data or uninstalling the application results in immediate, complete, and irrevocable destruction of all user data.

---

## 11. Global Privacy Law Compliance (GDPR, CCPA/CPRA, COPPA)

- **GDPR (EEA & UK):** Full compliance with Data Minimization, Purpose Limitation, Right of Access, Right to Rectification, Right to Erasure, and Right to Data Portability. All data resides on your device under your exclusive control.
- **CCPA / CPRA (California):** Arc Tracker does not sell, rent, or share personal information with third parties. We do not engage in cross-context behavioral advertising.
- **COPPA & GDPR-K:** Arc Tracker does not collect personal information from children under 13 years of age.

---

## 12. App Store & Platform Compliance Grid

| Platform | Compliance Standard |
| :--- | :--- |
| **Apple App Store** | Complies with App Store Guidelines 5.1.1, 5.1.2 & 5.1.1(v) (Data Not Collected) |
| **Google Play Store** | Complies with Google Play Data Safety & Target SDK Zero-Collection Policies |
| **Microsoft Store** | Complies with Microsoft Store App Policies on Privacy & Data Protection |
| **Airgap Security Standard** | 100% Offline-First Architecture & Client-Side AES-256 Encryption |

---

## 13. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. Any changes will be published directly in the repository and in the application's documentation with an updated revision date.

---

## 14. Contact Us

If you have questions, feedback, or security inquiries regarding this Privacy Policy, please contact:

- **Developer:** Mayank / Arc Tracker Team
- **GitHub Repository:** <https://github.com/mayank-pixel-cell/mayank>
- **Issues & Inquiries:** <https://github.com/mayank-pixel-cell/mayank/issues>
