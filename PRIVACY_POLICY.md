# Privacy Policy for Arc Tracker

**Last updated:** October 26, 2026

**Arc Tracker** ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains our practices regarding data collection, storage, security, and usage when you use the Arc Tracker mobile and desktop applications.

---

## 1. Zero Data Collection & Offline-First Design

Arc Tracker is built from the ground up as a **100% offline-first, air-gapped application**:

- **No Personal Identifiable Information (PII):** We do not collect, request, or store your name, email address, phone number, or any personally identifiable information on remote servers.
- **No Telemetry or Tracking:** We do not include third-party tracking SDKs, analytics frameworks (e.g., Google Analytics, Firebase), advertising beacons, or telemetry services.
- **No Remote Servers:** The application operates strictly locally on your device and does not transmit your habits, goals, journal entries, screen time records, or progress telemetry over the internet.
- **Zero-Exfiltration Network Firewall:** The application incorporates an active client-side outbound firewall designed to intercept and prevent any unauthorized background network egress, guaranteeing a true air-gapped operating environment.

---

## 2. On-Device Data Storage & Cryptographic Security

All habit tracking progress, customizable metrics, journal entries, and streak records are stored **exclusively on your local device**:

- **Local Storage Engines:** Data is persisted using hardware-accelerated local databases (Tauri Plugin Store, browser IndexedDB, and localStorage).
- **Client-Side Cryptography:** Protected with client-side WebCrypto PBKDF2 (100,000 rounds SHA-256) and AES-GCM 256-bit encryption at rest.
- **Airgap Guarantee:** Your data never leaves your device unless you explicitly use the in-app "Export Data" or "AES-256 Encrypted Backup (.arcenc)" feature to create a manual backup file that you control.

---

## 3. Two-Step Verification (2FA) & Authentication Privacy

Arc Tracker includes an optional Two-Step Verification (2FA) layer to protect your local terminal:

- **Offline Authenticator App (TOTP):** Compatible with Google Authenticator, Microsoft Authenticator, and standard RFC 6238 TOTP apps. The secret key is generated using cryptographic random values (CSPRNG) strictly on your device and is never transmitted to any cloud or third-party server.
- **Phone Number / SMS Mode:** When configured, phone numbers are utilized strictly on-device for local verification logic. Arc Tracker does not connect to external SMS gateways, telecom providers, or cloud servers to transmit your phone number.
- **Emergency Backup Codes:** Five (5) one-time backup recovery codes are generated and hashed locally on-device. They are never synced to any remote database.
- **Complete Revocation:** You can remove or disable Two-Step Verification at any time with a single click, which instantly wipes all authentication secrets and hashes from your local storage.
- **Anti-Spy Keypad & Clipboard Shield:** The security interface supports randomized PIN digit positions (defeating shoulder surfing) and features an automated 45-second clipboard wipe timer for sensitive codes.

---

## 4. Subscriptions, Trials & Aesthetic Customization

- **Arc Gold & VIP Features:** Arc Tracker features local subscription tier simulation (including a 30-day free trial) and visual customization options (such as custom avatar outer lining rings and theme palettes).
- **Zero Financial Data Collection:** Subscription states, trial countdowns, and aesthetic preferences are managed entirely on-device. Arc Tracker does not collect, process, or store credit card numbers, billing addresses, or bank details.

---

## 5. Data Leak Prevention (DLP) & Physical Privacy

- **Discretion / Camouflage Mode (`Alt + S`):** Allows users to obscure habit titles and reflective journal entries with dynamic CSS filters to protect privacy in public or shared work environments.
- **Hardcopy Print & Screengrab Redaction Shield:** Automatically enforces blank redaction overlays when printing or exporting pages to prevent unauthorized physical hardcopy or PDF leaks.
- **Cryptographic Secure 3-Pass Shredder:** When performing data erasure, Arc Tracker overwrites storage sectors with CSPRNG noise across three passes to prevent physical forensic reconstruction.

---

## 6. Device Permissions & Usage Details

Arc Tracker requests no intrusive device permissions:

- **No Camera Access**
- **No GPS or Precise Location Access**
- **No Contacts or Address Book Access**
- **No Microphone Access**
- **App & Screen Time Monitoring (Optional):** When activated by the user on Android or Desktop, system usage statistics (`PACKAGE_USAGE_STATS` or local OS window hooks) are inspected strictly in temporary device memory to calculate local app usage quotas and enforce lockout barriers. This data is never logged to external servers.

---

## 7. Account Deletion & Right to Erasure

In compliance with Apple App Store Guideline 5.1.1(v), Google Play User Data policies, and GDPR Right to Erasure:

- **Instant Local Wipe:** You can permanently erase all tracked habits, logs, passwords, security keys, and screen time records at any time via *Settings &rarr; System & Data &rarr; Factory Reset (Erase Everything)* or the *Cryptographic Secure Shredder*.
- **Zero Remote Retention:** Because no data is stored on remote servers, deleting local data or uninstalling the application results in immediate, complete, and irrevocable destruction of all user data.

---

## 8. Children’s Privacy (COPPA & GDPR-K Compliance)

Because Arc Tracker does not collect, transmit, or monetize any personal information from any user, it complies fully with the Children’s Online Privacy Protection Act (COPPA) and GDPR-K. We do not knowingly collect personal information from children under the age of 13.

---

## 9. Third-Party Services & Advertising

- Arc Tracker contains **zero third-party advertisements**.
- Arc Tracker does not sell, trade, rent, or share user data with data brokers, ad networks, or external analytics firms.

---

## 10. Platform Compliance

| Platform | Compliance Standard |
| :--- | :--- |
| **Apple App Store** | Complies with App Store Guidelines 5.1.1 & 5.1.2 (Data Not Collected) |
| **Google Play Store** | Complies with Google Play Data Safety & Target SDK Zero-Collection Policies |
| **Microsoft Store** | Complies with Microsoft Store App Policies on Privacy & Data Protection |
| **Airgap Security Standard** | 100% Offline-First Architecture & Client-Side Encryption |

---

## 11. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. Any changes will be published directly in the repository and in the application's documentation with an updated revision date.

---

## 12. Contact Us

If you have questions, feedback, or security inquiries regarding this Privacy Policy, please contact:

- **Developer:** Mayank / Arc Tracker Team
- **GitHub Repository:** <https://github.com/mayank-pixel-cell/mayank>
- **Issues & Inquiries:** <https://github.com/mayank-pixel-cell/mayank/issues>
