# Terms and Conditions & User Agreement

**Effective Date:** November 7, 2026 (Protocol v2026.2)  
**Application:** Arc Tracker (Web, Chrome Desktop PWA, Android, Windows Desktop & iOS)  
**Developer:** Mayank / Arc Tracker Team  

---

## Operative Covenant

By installing, registering, signing up, or initializing Arc Tracker, you agree to be bound by these Terms and Conditions. Arc Tracker is an airgapped, high-accountability discipline operating system designed for self-mastery, screen time moderation, and daily habit execution.

---

### 01. First-Time Registration & Operative Identity
- **Account Setup:** You choose a call sign (Display Name), a unique handle (e.g. `@operative`), and an optional lock-in motto. All identity configuration is persisted strictly on your local device hardware.
- **Voluntary Commitment:** Participation in the Winter Arc, Summer Arc, and custom focus protocols is voluntary and intended exclusively for personal productivity and self-discipline.
- **Hardware Authority:** You confirm that you have the right and legal authorization to install and operate Arc Tracker on your personal hardware.

---

### 02. Local Data Sovereignty & Zero Exfiltration Covenant
- **Zero Data Exfiltration:** 100% of your habit completions, daily check-ins, journal reflections, streaks, and screen time records reside strictly within your local hardware storage (LocalStorage, IndexedDB, and Tauri Plugin Store).
- **No Behavioral Telemetry:** We do not sell, rent, monetize, or transmit your behavioral patterns to external telemetry brokers, ad networks, or third-party servers.
- **Outbound Network Firewall:** The application incorporates an active client-side outbound firewall designed to intercept unauthorized network egress, guaranteeing a true air-gapped operating environment.

---

### 03. Multi-User Account Governance & Shared Terminals
- **Isolated Storage Partitions:** Each operative profile on the device operates within an isolated scoped storage partition (`u:${userId}:*`). Habits, logs, reflections, and security credentials of one user are inaccessible to other profiles.
- **Shared Terminal Responsibility:** If you use Arc Tracker on a shared family, school, or workplace computer, you are solely responsible for setting an App Security PIN, locking your profile, and properly switching accounts.
- **Arc Gold Dual-Profile Allocation:** Arc Gold VIP membership binds to up to two (2) authorized operative profiles per device installation (`MAX_AUTHORIZED_USERS = 2`).

---

### 04. Focus Mode & Application Lockout Authorization
- **Process & Window Monitoring Authorization:** By starting a Focus Session or enabling Strict Focus Mode, you explicitly authorize Arc Tracker to inspect foreground window titles, process handles, and active browser tabs strictly in volatile RAM to detect distraction applications.
- **Lockout Enforcement:** During active focus sprints, distracting applications and filtered URLs will be actively shielded, blocked, or minimized according to your user-configured blocklist.
- **Strict Mode & Emergency Cooldowns:** Strict Mode enforces a mandatory cooldown penalty to deter impulsive procrastination. You accept full responsibility for configuring your blocklists and acknowledge that critical communication tools should remain allowlisted.

---

### 05. Optional Cloud Sync & End-to-End Encryption
- **Opt-In Cloud Sync:** Optional synchronization via Google Drive AppData folder or private peer server is disabled by default and requires explicit user activation.
- **Client-Side Zero-Knowledge Encryption:** Sync payloads are encrypted client-side using W3C WebCrypto (PBKDF2 SHA-256 and AES-GCM 256-bit) before leaving your hardware. Neither Google, cloud servers, nor the Arc Tracker team hold decryption keys.
- **Sole Key Custody:** You are the sole custodian of your encryption password and recovery keys. Lost passphrases cannot be recovered by any third party.

---

### 06. Leaderboards, Custom Groups & Fair Execution
- **Fair Play Covenant:** Progression (XP, levels, streak counts, and milestone badges) represents honest, daily execution. Falsifying completion through automated bot scripts, clock-tampering, or malicious payload manipulation violates this agreement.
- **Operative Pseudonymity & Conduct:** Group interactions and leaderboards display your public operative handle (e.g. `@operative`) and motto. You agree not to select defamatory, obscene, hateful, or harassing handles or mottos.
- **No Sensitive Data Broadcast:** Only aggregate XP, streaks, and level ranks are shared with peers. Your private habit details, reflective notes, and application screen time are NEVER shared.

---

### 07. Arc Gold VIP & Premium Features
- **Gold VIP Benefits:** Gold members receive exclusive access to 4K widescreen (16:9) and mobile (9:16) wallpapers, custom avatar lining rings, Black & White Monochrome mode, 120Hz ProMotion UI responsiveness, and advanced telemetry exports.
- **Local Persistence:** Gold licenses and trial statuses are stored securely on your local device. Always maintain an exported backup before clearing browser data or re-formatting drives.
- **No Hidden Recurring Charges:** Arc Tracker does not employ deceptive auto-renewals, unexpected credit card charges, or subscription traps.

---

### 08. Security PIN, Two-Factor Authentication & Backups
- **Passcode & PIN Security:** If you configure an App Security PIN or Two-Factor Authentication (2FA), you are responsible for maintaining knowledge of your PIN and safely recording your offline emergency backup recovery codes.
- **Anti-Spy Safeguards:** The terminal provides randomized PIN keypad layouts and automated 45-second clipboard wipes to mitigate shoulder-surfing and credential theft.
- **Client-Side Encrypted Backups (`.arcenc`):** Backup files exported from the app are encrypted using AES-256. If you lose your password, data cannot be reconstructed by any third party.

---

### 09. Intellectual Property, Ownership & Limited License
- **Proprietary Assets:** All software code, visual styling, animations, soundscapes, 4K wallpapers, badges, and protocol specifications are the exclusive intellectual property of Arc Tracker and its developer.
- **Limited Personal License:** You are granted a personal, non-exclusive, revocable, non-transferable license to install and run Arc Tracker solely for personal productivity purposes.
- **User Content Ownership:** You retain 100% full, exclusive ownership of all habit descriptions, reflections, personal notes, and goal data created within the application.

---

### 10. Medical, Psychological & Wellness Disclaimer
Arc Tracker is an executive function, habit formation, and personal productivity tool. It is **NOT** a medical device, psychiatric intervention, clinical addiction treatment tool, or medical diagnostic system. Arc Tracker does not provide medical, psychiatric, or psychological advice. Always consult qualified healthcare professionals regarding physical, psychological, or medical concerns.

---

### 11. Disclaimer of Warranties & Limitation of Liability
Arc Tracker is provided "AS IS" and "AS AVAILABLE" without warranties of any kind. Arc Tracker and its developers disclaim all warranties of merchantability, fitness for a particular purpose, and non-infringement. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages.

---

### 12. Account Termination & Permanent Data Erasure
You may terminate this agreement at any time by executing a Factory Reset or Cryptographic Shred:
- Selecting *Factory Reset* or the *Cryptographic Secure Shredder* in *Settings &rarr; System & Data* immediately overwrites and destroys all local databases, PINs, and records.
- Because no data is held on remote servers, local deletion results in immediate, irreversible, and total destruction of all user records.

---

### 13. Amendments, Governing Law & Inquiries
We reserve the right to refine these Terms & Conditions to reflect platform updates, OS compliance, and security enhancements. Any modifications will be announced via the internal Notification Center.

For questions regarding these Terms or the Privacy Policy, access the in-app FAQ center or submit an issue at our official repository:  
<https://github.com/mayank-pixel-cell/mayank/issues>
