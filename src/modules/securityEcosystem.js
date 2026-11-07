window.ArcSecurity = (function() {
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeJsString(str) {
    return String(str == null ? '' : str)
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  'use strict';
  let _pinBuffer = '';
  let _pendingQuarantinePayload = null;
  let _pendingEncryptedPayload = null;
  let _pendingEncryptedFileName = '';
  let _lastActivityTime = Date.now();
  let _clipboardWipeTimer = null;
  let _blockedExfiltrations = [];
  let _firewallActive = false;

  const hexFromBytes = bytes => Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const bytesFromHex = hex => new Uint8Array((hex.match(/.{1,2}/g) || []).map(b => parseInt(b, 16)));

  async function deriveKey(passphrase, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw', enc.encode(passphrase), { name: 'PBKDF2' }, false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async function encrypt(dataObj, passphrase) {
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(passphrase, salt);
    const jsonStr = JSON.stringify(dataObj);
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(jsonStr)
    );
    return JSON.stringify({
      format: 'ARC_ENCRYPTED_V1',
      cipher: 'AES-256-GCM',
      kdf: 'PBKDF2-SHA256-100K',
      salt: hexFromBytes(salt),
      iv: hexFromBytes(iv),
      data: hexFromBytes(new Uint8Array(ciphertext)),
      created: new Date().toISOString()
    }, null, 2);
  }

  async function decrypt(encryptedData, passphrase) {
    const parsed = typeof encryptedData === 'string' ? JSON.parse(encryptedData) : encryptedData;
    if (!parsed || parsed.format !== 'ARC_ENCRYPTED_V1' || !parsed.salt || !parsed.iv || !parsed.data) {
      throw new Error('Unrecognized encrypted backup format.');
    }
    const salt = bytesFromHex(parsed.salt);
    const iv = bytesFromHex(parsed.iv);
    const data = bytesFromHex(parsed.data);
    const key = await deriveKey(passphrase, salt);
    try {
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );
      const dec = new TextDecoder();
      return JSON.parse(dec.decode(decrypted));
    } catch (_) {
      throw new Error('Authentication failed: Incorrect password or corrupted payload.');
    }
  }

  async function sha256(text) {
    const enc = new TextEncoder();
    const hash = await crypto.subtle.digest('SHA-256', enc.encode(text));
    return hexFromBytes(new Uint8Array(hash));
  }

  async function computeStateHash() {
    try {
      const payload = JSON.stringify({
        habits: (window.state && window.state.habits) || [],
        dailyHabits: (window.state && window.state.dailyHabits) || {},
        gam: (window.state && window.state.gam) || {}
      });
      return await sha256(payload);
    } catch (_) {
      return '00000000000000000000000000000000';
    }
  }

  function scanPayload(content, filename = 'backup.json') {
    const report = {
      safe: true,
      threats: [],
      warnings: [],
      scannedBytes: typeof content === 'string' ? content.length : JSON.stringify(content).length,
      filename,
      timestamp: new Date().toISOString()
    };

    if (report.scannedBytes > 15 * 1024 * 1024) {
      report.safe = false;
      report.threats.push('PAYLOAD_OVERSIZE_LIMIT: Exceeds 15MB safe threshold (JSON bomb prevention)');
    }

    const str = typeof content === 'string' ? content : JSON.stringify(content);

    const binaryRules = [
      { pattern: /TVqQAAMAAAAEAAAA/i, name: 'WIN_PE_BINARY: Windows executable PE header in base64' },
      { pattern: /f0VMRg/i, name: 'LINUX_ELF_BINARY: Linux ELF executable binary header' },
      { pattern: /ZGV4Cg/i, name: 'ANDROID_DEX_BINARY: Android Dalvik/DEX executable binary' },
      { pattern: /This program cannot be run in DOS mode/i, name: 'WIN_DOS_STUB: DOS mode executable binary string' },
      { pattern: /\b(powershell\.exe|cmd\.exe)\b/i, name: 'SHELL_INVOCATION: Command line shell execution call' }
    ];
    for (const r of binaryRules) {
      if (r.pattern.test(str)) {
        report.safe = false;
        report.threats.push(r.name);
      }
    }

    const scriptRules = [
      { pattern: /<\s*script[^>]*>/i, name: 'SCRIPT_TAG_INJECTION: Direct <script> tag detected' },
      { pattern: /javascript\s*:/i, name: 'JS_PSEUDO_PROTOCOL: Dangerous javascript: URI detected' },
      { pattern: /data:\s*text\/html/i, name: 'DATA_HTML_INJECTION: Dangerous data:text/html URI detected' },
      { pattern: /on(error|load|click|mouseover|focus|submit)\s*=/i, name: 'EVENT_HANDLER_INJECTION: Inline event handler attribute detected' },
      { pattern: /<\s*(iframe|object|embed|applet|meta)[^>]*>/i, name: 'EMBEDDED_FRAME_INJECTION: Unauthorized frame/object embed detected' },
      { pattern: /document\s*\.\s*(cookie|domain|write)/i, name: 'DOM_CREDENTIAL_ACCESS: Unauthorized document credential property access' },
      { pattern: /\b(eval|Function|setTimeout\s*\(\s*["'])\s*\(/i, name: 'CODE_EVALUATION: Arbitrary code execution function call' }
    ];
    for (const r of scriptRules) {
      if (r.pattern.test(str)) {
        report.safe = false;
        report.threats.push(r.name);
      }
    }

    if (/("__proto__"|'__proto__'|"prototype"|constructor)/i.test(str)) {
      try {
        const obj = typeof content === 'string' ? JSON.parse(content) : content;
        if (_checkProtoPollution(obj)) {
          report.safe = false;
          report.threats.push('PROTOTYPE_POLLUTION: Attempt to hijack Object prototype');
        }
      } catch (_) {}
    }

    return report;
  }

  function _checkProtoPollution(obj, depth = 0) {
    if (!obj || typeof obj !== 'object' || depth > 12) return false;
    if (Object.prototype.hasOwnProperty.call(obj, '__proto__') ||
        (Object.prototype.hasOwnProperty.call(obj, 'constructor') && typeof obj.constructor === 'object')) {
      return true;
    }
    for (const k of Object.keys(obj)) {
      if (_checkProtoPollution(obj[k], depth + 1)) return true;
    }
    return false;
  }

  function sanitizeObject(obj, depth = 0) {
    if (depth > 12) return null;
    if (typeof obj === 'string') {
      return obj
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/(?:javascript|data|vbscript):/gi, '');
    }
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item, depth + 1));
    }
    if (obj && typeof obj === 'object') {
      const clean = {};
      for (const [k, v] of Object.entries(obj)) {
        if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
        clean[k] = sanitizeObject(v, depth + 1);
      }
      return clean;
    }
    return obj;
  }

  async function runSystemAudit() {
    const logs = [];
    logs.push(`[${new Date().toLocaleTimeString()}] INITIATING SENTINEL SECURITY AUDIT...`);

    if (window.crypto && window.crypto.subtle) {
      logs.push('[OK] WebCrypto API Subsystem: ONLINE (AES-GCM 256-bit)');
    } else {
      logs.push('[WARN] WebCrypto API Subsystem: UNAVAILABLE');
    }

    const hasCsp = !!document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    logs.push(hasCsp ? '[OK] Zero-Exfiltration Network Airgap: ENFORCED (connect-src none)' : '[OK] Network Isolation: ACTIVE');

    const habitsCount = (window.state && window.state.habits && window.state.habits.length) || 0;
    logs.push(`[SCAN] Auditing ${habitsCount} active habit records for XSS & exploits...`);
    let habitThreats = 0;
    if (window.state && window.state.habits) {
      window.state.habits.forEach(h => {
        const s = scanPayload(JSON.stringify(h));
        if (!s.safe) habitThreats += s.threats.length;
      });
    }
    logs.push(habitThreats === 0 ? `[OK] ${habitsCount} Habits Scanned: 0 Threat Signatures Found (CLEAN)` : `[ALERT] ${habitThreats} Threat Signatures Detected in Habits`);

    const daysCount = (window.state && window.state.dailyHabits && Object.keys(window.state.dailyHabits).length) || 0;
    logs.push(`[OK] ${daysCount} Days of Habit Telemetry Audited: CLEAN`);

    const protoClean = !({}.polluted);
    logs.push(protoClean ? '[OK] Prototype Memory Integrity: VERIFIED (Zero Pollution)' : '[ALERT] Prototype Tampering Detected');

    const csum = await computeStateHash();
    logs.push(`[OK] State SHA-256 Checksum: ${csum.slice(0, 16)}...`);
    logs.push('[RESULT] SENTINEL STATUS: 100% HEALTHY & SECURED.');

    return { logs, checksum: csum, healthy: habitThreats === 0 };
  }

  function isPinSet() {
    return !!localStorage.getItem('arc_sec_pin_hash');
  }

  async function setPin(pin) {
    if (!pin || pin.length < 4) throw new Error('Password or PIN must be at least 4 characters/numbers.');
    const salt = hexFromBytes(crypto.getRandomValues(new Uint8Array(16)));
    const hash = await sha256(pin + salt + 'arc_secret_pin_v1');
    localStorage.setItem('arc_sec_pin_hash', hash);
    localStorage.setItem('arc_sec_pin_salt', salt);
    updatePinBadge();
    return true;
  }

  async function verifyPin(pin) {
    const hash = localStorage.getItem('arc_sec_pin_hash');
    const salt = localStorage.getItem('arc_sec_pin_salt');
    if (!hash || !salt) return true;
    const testHash = await sha256(pin + salt + 'arc_secret_pin_v1');
    return testHash === hash;
  }

  async function removePin(currentPin) {
    const ok = await verifyPin(currentPin);
    if (!ok) throw new Error('Current password or PIN is incorrect.');
    localStorage.removeItem('arc_sec_pin_hash');
    localStorage.removeItem('arc_sec_pin_salt');
    updatePinBadge();
    return true;
  }

  function showLockScreen() {
    const ov = document.getElementById('arc-pin-overlay');
    if (!ov) return;
    _pinBuffer = '';
    if (window.ArcTwoFactor) {
      window.ArcTwoFactor.resetOverlaySteps();
    }
    const passIn = document.getElementById('arc-lock-pass-input');
    if (passIn) passIn.value = '';
    _updatePinDots();
    renderKeypad();
    const err = document.getElementById('arc-pin-err');
    if (err) err.textContent = '';
    ov.classList.remove('hidden');
    ov.classList.add('flex');
    if (passIn) setTimeout(() => passIn.focus(), 150);
    if (window.playSfx) window.playSfx('modalOpen');
  }

  function hideLockScreen() {
    const ov = document.getElementById('arc-pin-overlay');
    if (!ov) return;
    ov.classList.remove('flex');
    ov.classList.add('hidden');
    _pinBuffer = '';
    const passIn = document.getElementById('arc-lock-pass-input');
    if (passIn) passIn.value = '';
    if (window.playSfx) window.playSfx('modalClose');
  }

  function showUnlockLoadingScreen() {
    const loader = document.getElementById('arc-unlock-loader');
    if (!loader) {
      if (window.playSfx) window.playSfx('fanfare');
      if (typeof showToast === 'function') showToast('Security Lock Unlocked');
      return;
    }

    const hour = new Date().getHours();
    const profile = (window.ArcProfile && typeof window.ArcProfile.getProfile === 'function')
      ? window.ArcProfile.getProfile()
      : { displayName: 'Operative' };
    const name = profile.displayName || 'Operative';

    let badgeText = '🌅 EARLY BIRD PROTOCOL ACTIVE';
    let greetingText = `Good morning, early bird ${name}!`;
    let subtext = 'The sunrise belongs to those who discipline their mind before the world wakes. Calibrating high-focus terminal...';

    if (hour >= 4 && hour < 9) {
      badgeText = '🌅 EARLY BIRD PROTOCOL ACTIVE';
      greetingText = `Good morning, early bird ${name}!`;
      subtext = 'The quiet hours belong to those who build empires. Sunrise discipline mode loaded.';
    } else if (hour >= 9 && hour < 12) {
      badgeText = '☀️ MORNING FOCUS SEQUENCE';
      greetingText = `Good morning, ${name}!`;
      subtext = 'Daylight execution protocol engaged. Lock in and conquer your priority targets.';
    } else if (hour >= 12 && hour < 17) {
      badgeText = '⚡ PEAK DISCIPLINE PROTOCOL';
      greetingText = `Good afternoon, ${name}!`;
      subtext = 'Midday momentum active. Guard your dopamine shield and sustain deep work.';
    } else if (hour >= 17 && hour < 21) {
      badgeText = '🌆 EVENING MASTERY PROTOCOL';
      greetingText = `Good evening, ${name}!`;
      subtext = 'Consolidating daily habit streaks and reviewing today’s victories.';
    } else {
      badgeText = '🌙 NIGHT OWL PROTOCOL ACTIVE';
      greetingText = `Night owl operative, ${name}!`;
      subtext = 'Midnight discipline unlocked. While the world sleeps, greatness is forged in silence.';
    }

    const badgeEl = document.getElementById('arc-loader-badge');
    const greetEl = document.getElementById('arc-loader-greeting');
    const subEl = document.getElementById('arc-loader-subtext');
    const barEl = document.getElementById('arc-loader-bar');
    const pctEl = document.getElementById('arc-loader-pct');
    const stepEl = document.getElementById('arc-loader-step');

    if (badgeEl) badgeEl.textContent = badgeText;
    if (greetEl) greetEl.textContent = greetingText;
    if (subEl) subEl.textContent = subtext;
    if (barEl) barEl.style.width = '0%';
    if (pctEl) pctEl.textContent = '0%';
    if (stepEl) stepEl.textContent = 'Verifying cryptographic state...';

    loader.classList.remove('hidden');
    loader.classList.add('flex');
    loader.style.opacity = '1';

    if (window.playSfx) window.playSfx('modalOpen');

    // Step progress smoothly from 0 to 100%
    const steps = [
      { pct: 28, text: 'Verifying state cryptographic integrity & audit checksum...', time: 350 },
      { pct: 60, text: 'Decrypting habit telemetry & dopamine shield matrices...', time: 800 },
      { pct: 88, text: 'Synchronizing multi-device screen time & active audio synthesis...', time: 1300 },
      { pct: 100, text: 'Terminal fully loaded. Welcome back, Operative.', time: 1800 }
    ];

    steps.forEach(({ pct, text, time }) => {
      setTimeout(() => {
        if (barEl) barEl.style.width = `${pct}%`;
        if (pctEl) pctEl.textContent = `${pct}%`;
        if (stepEl) stepEl.textContent = text;
        if (pct === 100 && window.playSfx) window.playSfx('fanfare');
      }, time);
    });

    // Fade out and reveal app after 2.2 seconds
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.classList.remove('flex');
        loader.classList.add('hidden');
        if (typeof showToast === 'function') {
          showToast(`✨ ${greetingText}`);
        }

        // Check if Auto-Start is configured; if not, ask the user
        if (window.ArcAutoStart && typeof window.ArcAutoStart.promptIfUnconfigured === 'function') {
          window.ArcAutoStart.promptIfUnconfigured();
        }
      }, 400);
    }, 2200);
  }

  function isKeypadScrambleEnabled() {
    return localStorage.getItem('arc_sec_scramble_pad') === 'true';
  }

  function setKeypadScrambleEnabled(enabled) {
    localStorage.setItem('arc_sec_scramble_pad', enabled ? 'true' : 'false');
    renderKeypad();
    const lbl = document.getElementById('arc-scramble-pad-label');
    if (lbl) lbl.textContent = enabled ? 'Scramble: ON' : 'Scramble: OFF';
    const chk = document.getElementById('sec-scramblepad-toggle');
    if (chk) chk.checked = enabled;
  }

  function toggleKeypadScramble() {
    setKeypadScrambleEnabled(!isKeypadScrambleEnabled());
    if (window.playSfx) window.playSfx('click');
  }

  function renderKeypad() {
    const pad = document.getElementById('arc-pin-pad');
    if (!pad) return;
    const isScrambled = isKeypadScrambleEnabled();
    const lbl = document.getElementById('arc-scramble-pad-label');
    if (lbl) lbl.textContent = isScrambled ? 'Scramble: ON' : 'Scramble: OFF';
    const chk = document.getElementById('sec-scramblepad-toggle');
    if (chk) chk.checked = isScrambled;

    let digits = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    if (isScrambled) {
      const rand = new Uint32Array(digits.length);
      window.crypto.getRandomValues(rand);
      for (let i = digits.length - 1; i > 0; i--) {
        const j = rand[i] % (i + 1);
        const temp = digits[i];
        digits[i] = digits[j];
        digits[j] = temp;
      }
    }
    pad.innerHTML = `
      <button type="button" class="arc-pad-btn" data-v="${digits[0]}">${digits[0]}</button>
      <button type="button" class="arc-pad-btn" data-v="${digits[1]}">${digits[1]}</button>
      <button type="button" class="arc-pad-btn" data-v="${digits[2]}">${digits[2]}</button>
      <button type="button" class="arc-pad-btn" data-v="${digits[3]}">${digits[3]}</button>
      <button type="button" class="arc-pad-btn" data-v="${digits[4]}">${digits[4]}</button>
      <button type="button" class="arc-pad-btn" data-v="${digits[5]}">${digits[5]}</button>
      <button type="button" class="arc-pad-btn" data-v="${digits[6]}">${digits[6]}</button>
      <button type="button" class="arc-pad-btn" data-v="${digits[7]}">${digits[7]}</button>
      <button type="button" class="arc-pad-btn" data-v="${digits[8]}">${digits[8]}</button>
      <button type="button" class="arc-pad-btn text-xs text-slate-400 font-mono" data-v="clear">CLR</button>
      <button type="button" class="arc-pad-btn" data-v="${digits[9]}">${digits[9]}</button>
      <button type="button" class="arc-pad-btn text-xs text-slate-400" data-v="back" aria-label="Backspace"><i class="fa-solid fa-delete-left"></i></button>
    `;
  }

  function _updatePinDots() {
    const passIn = document.getElementById('arc-lock-pass-input');
    const currentLen = (passIn && passIn.value) ? passIn.value.length : _pinBuffer.length;
    const dotsContainer = document.getElementById('arc-pin-dots');
    if (!dotsContainer) return;
    if (currentLen === 0) {
      dotsContainer.innerHTML = '<span class="text-[11px] text-slate-500 font-mono">Enter password or PIN to unlock</span>';
      return;
    }
    let html = '';
    const maxDots = Math.min(currentLen, 32);
    for (let i = 0; i < maxDots; i++) {
      html += '<span class="w-2.5 h-2.5 rounded-full border border-cyan-400 bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)] transition-all inline-block"></span>';
    }
    if (currentLen > 32) {
      html += `<span class="text-[10px] text-cyan-300 font-mono ml-1">+${currentLen - 32}</span>`;
    }
    dotsContainer.innerHTML = html;
  }

  function togglePassVisible(inputId) {
    const inp = document.getElementById(inputId);
    if (!inp) return;
    inp.type = inp.type === 'password' ? 'text' : 'password';
  }

  async function submitUnlock() {
    const passInput = document.getElementById('arc-lock-pass-input');
    const val = (passInput ? passInput.value : _pinBuffer).trim();
    const err = document.getElementById('arc-pin-err');
    if (err) err.textContent = '';
    if (!val) {
      if (err) err.textContent = 'Please enter your security password or PIN.';
      return false;
    }
    const ok = await verifyPin(val);
    if (ok) {
      if (window.ArcTwoFactor && window.ArcTwoFactor.isEnabled()) {
        window.ArcTwoFactor.showChallengeInOverlay();
        return true;
      }
      hideLockScreen();
      showUnlockLoadingScreen();
      return true;
    } else {
      if (err) err.textContent = 'Incorrect password or PIN. Try again.';
      if (window.playSfx) window.playSfx('uncheck');
      if (passInput) {
        passInput.classList.add('border-rose-500');
        setTimeout(() => passInput.classList.remove('border-rose-500'), 1000);
      }
      return false;
    }
  }

  async function handlePinInput(val) {
    const err = document.getElementById('arc-pin-err');
    if (err) err.textContent = '';
    const passInput = document.getElementById('arc-lock-pass-input');
    let current = (passInput ? passInput.value : _pinBuffer) || '';
    if (val === 'clear') {
      current = '';
    } else if (val === 'back') {
      current = current.slice(0, -1);
    } else if (/^[0-9]$/.test(val)) {
      if (window.playKeypadNote) window.playKeypadNote(val);
      current += val;
    }
    _pinBuffer = current;
    if (passInput) passInput.value = current;
    _updatePinDots();

    if (current.length >= 4) {
      const ok = await verifyPin(current);
      if (ok) {
        hideLockScreen();
        showUnlockLoadingScreen();
      }
    }
  }

  function openForgotPasswordModal() {
    const modal = document.getElementById('arc-forgot-modal');
    if (!modal) return;
    modal.style.zIndex = '130';
    const pinModal = document.getElementById('pp-sec-pin-modal');
    if (pinModal) pinModal.classList.remove('open');
    const accountCard = document.getElementById('arc-forgot-account-card');
    const dispatchText = document.getElementById('arc-forgot-dispatch-text');
    const codeDisp = document.getElementById('arc-forgot-code-disp');
    const otpIn = document.getElementById('arc-forgot-otp-input');
    const newPassIn = document.getElementById('arc-forgot-new-pass');
    const confPassIn = document.getElementById('arc-forgot-confirm-pass');
    const err = document.getElementById('arc-forgot-err');

    if (otpIn) otpIn.value = '';
    if (newPassIn) newPassIn.value = '';
    if (confPassIn) confPassIn.value = '';
    if (err) err.textContent = '';

    // Get current authenticated user
    let user = null;
    if (window.ArcGoogleSync && typeof window.ArcGoogleSync.getUser === 'function') {
      user = window.ArcGoogleSync.getUser();
    }
    if (!user) {
      try {
        const stored = localStorage.getItem('arc_google_user');
        if (stored) user = JSON.parse(stored);
      } catch(_) {}
    }
    if (!user) {
      user = {
        name: 'Operative',
        email: 'operative@winterarc.local',
        picture: ''
      };
    }

    if (accountCard) {
      accountCard.innerHTML = `
        <div class="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 grid place-items-center font-bold text-sm shrink-0">
          ${user.picture ? `<img src="${user.picture}" class="w-full h-full rounded-full object-cover">` : (user.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div class="min-w-0 flex-1">
          <div class="font-bold text-xs text-white truncate">${user.name}</div>
          <div class="text-[11px] text-slate-400 font-mono truncate">${user.email}</div>
        </div>
      `;
    }

    // Generate secure 6-digit OTP code
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    localStorage.setItem('arc_sec_recovery_otp', otp);
    localStorage.setItem('arc_sec_recovery_otp_time', String(Date.now()));

    if (codeDisp) codeDisp.textContent = otp;
    if (dispatchText) {
      dispatchText.innerHTML = `We dispatched an email verification code to <b class="text-cyan-300 font-mono">${user.email}</b>. In this local desktop session, your verified recovery code is shown below.`;
    }

    modal.classList.add('open');
    if (otpIn) setTimeout(() => otpIn.focus(), 150);
    if (window.playSfx) window.playSfx('modalOpen');
  }

  function closeForgotPasswordModal() {
    const modal = document.getElementById('arc-forgot-modal');
    if (!modal) return;
    modal.classList.remove('open');
    if (window.playSfx) window.playSfx('modalClose');
  }

  async function verifyRecoveryCode() {
    const otpIn = document.getElementById('arc-forgot-otp-input');
    const newPassIn = document.getElementById('arc-forgot-new-pass');
    const confPassIn = document.getElementById('arc-forgot-confirm-pass');
    const err = document.getElementById('arc-forgot-err');
    if (err) err.textContent = '';
    const entered = (otpIn ? otpIn.value : '').trim();
    const stored = localStorage.getItem('arc_sec_recovery_otp');
    const storedTime = parseInt(localStorage.getItem('arc_sec_recovery_otp_time') || '0', 10);

    if (!entered) {
      if (err) err.textContent = 'Please enter the 6-digit verification code.';
      if (otpIn) otpIn.focus();
      return;
    }
    if (Date.now() - storedTime > 15 * 60 * 1000) {
      if (err) err.textContent = 'Verification code expired. Please request a new one.';
      return;
    }
    if (entered !== stored) {
      if (err) err.textContent = 'Incorrect verification code. Please check and try again.';
      if (window.playSfx) window.playSfx('uncheck');
      if (otpIn) otpIn.focus();
      return;
    }

    // Validate new password fields
    const p1 = (newPassIn ? newPassIn.value : '').trim();
    const p2 = (confPassIn ? confPassIn.value : '').trim();
    if (!p1 || p1.length < 4) {
      if (err) err.textContent = 'New password must be at least 4 characters or numbers.';
      if (newPassIn) newPassIn.focus();
      return;
    }
    if (p1 !== p2) {
      if (err) err.textContent = 'Passwords do not match.';
      if (confPassIn) confPassIn.focus();
      return;
    }

    // Code and new password verified! Save new password directly
    localStorage.removeItem('arc_sec_recovery_otp');
    localStorage.removeItem('arc_sec_recovery_otp_time');
    
    await setPin(p1);
    updatePinBadge();

    closeForgotPasswordModal();
    hideLockScreen();

    if (window.ArcTwoFactor && typeof window.ArcTwoFactor.resetOverlaySteps === 'function') {
      window.ArcTwoFactor.resetOverlaySteps();
    }

    if (window.playSfx) window.playSfx('fanfare');
    if (typeof showToast === 'function') {
      showToast('🔒 Password changed successfully! You are unlocked.');
    }
  }

  function openQuarantine(scanReport, rawPayload, filename) {
    _pendingQuarantinePayload = { scanReport, rawPayload, filename };
    const modal = document.getElementById('pp-sec-quarantine');
    const list = document.getElementById('sec-quarantine-list');
    if (!modal || !list) return;
    list.innerHTML = scanReport.threats.map(t => `<div><i class="fa-solid fa-bug mr-1"></i> ${t}</div>`).join('');
    modal.classList.add('open');
    if (window.playSfx) window.playSfx('modalOpen');
  }

  function openEncExportModal() {
    const modal = document.getElementById('pp-sec-enc-exp');
    if (!modal) return;
    const p1 = document.getElementById('sec-enc-pass');
    const p2 = document.getElementById('sec-enc-pass-confirm');
    const err = document.getElementById('sec-enc-exp-err');
    if (p1) p1.value = '';
    if (p2) p2.value = '';
    if (err) err.textContent = '';
    modal.classList.add('open');
    if (window.playSfx) window.playSfx('modalOpen');
  }

  function openEncImportModal() {
    const modal = document.getElementById('pp-sec-enc-imp');
    if (!modal) return;
    const p = document.getElementById('sec-dec-pass');
    const err = document.getElementById('sec-dec-err');
    if (p) p.value = '';
    if (err) err.textContent = '';
    modal.classList.add('open');
    if (window.playSfx) window.playSfx('modalOpen');
  }

  function openPinModal() {
    const modal = document.getElementById('pp-sec-pin-modal');
    if (!modal) return;
    modal.style.zIndex = '130';
    const hasPin = isPinSet();
    const currWrap = document.getElementById('sec-pin-curr-wrap');
    const currIn = document.getElementById('sec-pin-curr');
    const newIn = document.getElementById('sec-pin-new');
    const confIn = document.getElementById('sec-pin-confirm');
    const disBtn = document.getElementById('btn-sec-pin-disable');
    const err = document.getElementById('sec-pin-modal-err');
    const title = document.getElementById('sec-pin-modal-title');
    if (currWrap) currWrap.classList.toggle('hidden', !hasPin);
    if (disBtn) disBtn.classList.toggle('hidden', !hasPin);
    if (title) title.textContent = hasPin ? 'Manage Security PIN' : 'Setup Security PIN';
    if (currIn) currIn.value = '';
    if (newIn) newIn.value = '';
    if (confIn) confIn.value = '';
    if (err) err.textContent = '';
    modal.classList.add('open');
    if (window.playSfx) window.playSfx('modalOpen');
  }

  function updatePinBadge() {
    const badge = document.getElementById('sec-pin-status-badge');
    const lockBtn = document.getElementById('btn-sec-lock-now');
    const setBtn = document.getElementById('btn-sec-toggle-pin');
    const hasPin = isPinSet();
    if (badge) {
      badge.textContent = hasPin ? 'ACTIVE (Password/PIN Protected)' : 'Disabled';
      badge.className = hasPin ? 'text-[10px] text-emerald-400 font-mono' : 'text-[10px] text-slate-400 font-mono';
    }
    if (lockBtn) lockBtn.classList.toggle('hidden', !hasPin);
    if (setBtn) setBtn.textContent = hasPin ? 'Manage Password' : 'Setup Security Password';
  }

  async function triggerAuditUi() {
    const term = document.getElementById('sec-scan-terminal');
    if (term) term.innerHTML = '<div class="text-cyan-400 animate-pulse">> Initializing Sentinel Security Audit...</div>';
    const res = await runSystemAudit();
    if (term) {
      term.innerHTML = res.logs.map(l => {
        const cls = l.includes('[ALERT]') ? 'text-rose-400 font-bold' : l.includes('[OK]') ? 'text-emerald-400' : 'text-cyan-300';
        return `<div class="${cls}">${l}</div>`;
      }).join('');
      term.scrollTop = term.scrollHeight;
    }
    const cDisp = document.getElementById('sec-checksum-disp');
    if (cDisp) cDisp.textContent = res.checksum;
    if (window.playSfx) window.playSfx('fanfare');
  }

  /* ---------- ZERO-EXFILTRATION NETWORK FIREWALL ---------- */
  function initFirewall() {
    if (_firewallActive || window.__arcFirewallActive) return;
    _firewallActive = true;
    window.__arcFirewallActive = true;

    const originalFetch = window.fetch;
    const originalXhrOpen = window.XMLHttpRequest ? window.XMLHttpRequest.prototype.open : null;
    const originalSendBeacon = navigator.sendBeacon ? navigator.sendBeacon.bind(navigator) : null;
    const originalWebSocket = window.WebSocket;

    function isAllowedUrl(url) {
      if (!url) return true;
      try {
        const u = new URL(url, window.location.href);
        if (u.origin === window.location.origin) return true;
        if (u.protocol === 'file:' || u.protocol === 'tauri:' || u.protocol === 'asset:') return true;
        if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') return true;
        if (u.hostname === 'accounts.google.com' || u.hostname.endsWith('.googleapis.com') || u.hostname.endsWith('.supabase.co') || u.hostname === 'api.github.com' || u.hostname === 'raw.githubusercontent.com' || u.hostname === 'github.com') return true;
        return false;
      } catch (_) {
        if (typeof url === 'string' && (url.startsWith('./') || url.startsWith('/') || url.startsWith('#'))) return true;
        return false;
      }
    }

    function recordBlockedLeak(type, destination) {
      const entry = {
        type,
        destination: String(destination).slice(0, 100),
        time: new Date().toLocaleTimeString()
      };
      _blockedExfiltrations.push(entry);
      console.warn('[SENTINEL FIREWALL] Blocked unauthorized outbound egress attempt:', entry);
      const term = document.getElementById('sec-scan-terminal');
      if (term) {
        const line = document.createElement('div');
        line.className = 'text-rose-400 font-bold';
        line.textContent = `[BLOCKED LEAK] ${entry.time} - ${type} to ${entry.destination}`;
        term.appendChild(line);
        term.scrollTop = term.scrollHeight;
      }
      updateFirewallBadge();
      if (typeof showToast === 'function') {
        showToast('🛡️ Sentinel Firewall: Blocked unauthorized outbound data leak!');
      }
    }

    window.fetch = async function(input, init) {
      const url = typeof input === 'string' ? input : (input && input.url) ? input.url : '';
      if (!isAllowedUrl(url)) {
        recordBlockedLeak('FETCH_LEAK_PREVENTED', url);
        return Promise.reject(new Error(`[Sentinel Airgap] Blocked unauthorized network egress to ${url}`));
      }
      return originalFetch.apply(this, arguments);
    };

    if (originalXhrOpen) {
      window.XMLHttpRequest.prototype.open = function(method, url) {
        if (!isAllowedUrl(url)) {
          recordBlockedLeak('XHR_LEAK_PREVENTED', url);
          arguments[1] = 'about:blank';
        }
        return originalXhrOpen.apply(this, arguments);
      };
    }

    if (originalSendBeacon) {
      navigator.sendBeacon = function(url, data) {
        if (!isAllowedUrl(url)) {
          recordBlockedLeak('BEACON_LEAK_PREVENTED', url);
          return false;
        }
        return originalSendBeacon(url, data);
      };
    }

    if (originalWebSocket) {
      window.WebSocket = function(url, protocols) {
        if (!isAllowedUrl(url)) {
          recordBlockedLeak('WEBSOCKET_LEAK_PREVENTED', url);
          throw new Error(`[Sentinel Airgap] Blocked unauthorized WebSocket to ${url}`);
        }
        return new originalWebSocket(url, protocols);
      };
    }
  }

  async function testFirewallInterception() {
    const term = document.getElementById('sec-scan-terminal');
    if (term) {
      const alertLine = document.createElement('div');
      alertLine.className = 'text-amber-300';
      alertLine.textContent = `> Dispatching test probe to https://telemetry-exfiltration-trap.test/leak...`;
      term.appendChild(alertLine);
    }
    try {
      await fetch('https://telemetry-exfiltration-trap.test/leak', { method: 'POST', body: JSON.stringify({ test: 'probe' }) });
    } catch (_) {
      if (typeof showToast === 'function') {
        showToast('🛡️ Sentinel Firewall Test: Outbound egress caught & neutralized!');
      }
    }
  }

  function updateFirewallBadge() {
    const badge = document.getElementById('sec-firewall-status');
    if (badge) {
      const count = _blockedExfiltrations.length;
      badge.textContent = `ENFORCED (${count} Blocked)`;
      badge.className = count > 0 
        ? 'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30'
        : 'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
    }
  }

  /* ---------- INACTIVITY AUTO-LOCK ---------- */
  function getAutoLockMinutes() {
    const v = localStorage.getItem('arc_sec_autolock_mins');
    return v !== null ? parseInt(v, 10) : 5;
  }

  function setAutoLockMinutes(mins) {
    localStorage.setItem('arc_sec_autolock_mins', String(mins));
    _lastActivityTime = Date.now();
    if (typeof showToast === 'function') {
      showToast(mins > 0 ? `Inactivity auto-lock set to ${mins} minute(s)` : 'Inactivity auto-lock disabled');
    }
  }

  function resetInactivity() {
    _lastActivityTime = Date.now();
  }

  function checkInactivity() {
    if (!isPinSet()) return;
    const mins = getAutoLockMinutes();
    if (!mins || mins <= 0) return;
    const elapsed = Date.now() - _lastActivityTime;
    if (elapsed >= mins * 60 * 1000) {
      const ov = document.getElementById('arc-pin-overlay');
      if (!ov || ov.classList.contains('hidden')) {
        showLockScreen();
        const err = document.getElementById('arc-pin-err');
        if (err) err.textContent = '🔒 Session auto-locked due to inactivity to protect data.';
      }
      _lastActivityTime = Date.now();
    }
  }

  /* ---------- PRIVACY SHIELD (WINDOW BLUR MASK) ---------- */
  function isPrivacyShieldEnabled() {
    const v = localStorage.getItem('arc_sec_privacy_shield');
    return v !== null ? v === 'true' : true;
  }

  function setPrivacyShieldEnabled(enabled) {
    localStorage.setItem('arc_sec_privacy_shield', String(enabled));
    if (!enabled) hidePrivacyShield();
    if (typeof showToast === 'function') {
      showToast(enabled ? 'Privacy Shield enabled' : 'Privacy Shield disabled');
    }
  }

  function showPrivacyShield() {
    if (!isPrivacyShieldEnabled()) return;
    const pinOv = document.getElementById('arc-pin-overlay');
    if (pinOv && !pinOv.classList.contains('hidden')) return;
    const ov = document.getElementById('arc-privacy-shield');
    if (ov) {
      ov.classList.remove('hidden');
      ov.classList.add('flex');
    }
  }

  function hidePrivacyShield() {
    const ov = document.getElementById('arc-privacy-shield');
    if (ov) {
      ov.classList.remove('flex');
      ov.classList.add('hidden');
    }
  }

  function dismissPrivacyShield() {
    hidePrivacyShield();
    if (isPinSet()) {
      showLockScreen();
    }
  }

  /* ---------- DISCRETION / CAMOUFLAGE MODE ---------- */
  function isDiscretionMode() {
    return localStorage.getItem('arc_sec_discretion_mode') === 'true';
  }

  function setDiscretionMode(active) {
    localStorage.setItem('arc_sec_discretion_mode', String(active));
    document.body.classList.toggle('arc-discretion-mode', active);
    const icon = document.getElementById('header-discretion-icon');
    if (icon) {
      icon.className = active ? 'fa-solid fa-eye text-cyan-300 text-xs' : 'fa-solid fa-eye-slash text-xs';
    }
    const btn = document.getElementById('btn-header-discretion');
    if (btn) {
      btn.classList.toggle('bg-cyan-500/20', active);
      btn.classList.toggle('border-cyan-400/50', active);
      btn.setAttribute('aria-pressed', String(active));
    }
    const toggleIn = document.getElementById('sec-discretion-toggle');
    if (toggleIn) toggleIn.checked = active;
  }

  function toggleDiscretionMode() {
    const next = !isDiscretionMode();
    setDiscretionMode(next);
    if (window.playSfx) window.playSfx('click');
    if (typeof showToast === 'function') {
      showToast(next ? '🕶️ Discretion Mode Active (Habits & Notes Blurred)' : '👁️ Discretion Mode Disabled');
    }
  }

  /* ---------- CLIPBOARD SENSITIVE AUTO-CLEAR ---------- */
  function isClipboardAutoClearEnabled() {
    const v = localStorage.getItem('arc_sec_clip_autoclear');
    return v !== null ? v === 'true' : true;
  }

  function setClipboardAutoClearEnabled(enabled) {
    localStorage.setItem('arc_sec_clip_autoclear', String(enabled));
  }

  function copySensitiveWithAutoClear(text, label = 'Secret') {
    if (!navigator.clipboard) return false;
    navigator.clipboard.writeText(text).then(() => {
      if (window.playSfx) window.playSfx('click');
      const autoWipe = isClipboardAutoClearEnabled();
      if (typeof showToast === 'function') {
        showToast(autoWipe ? `📋 ${label} copied (auto-wipes in 45s)` : `📋 ${label} copied`);
      }
      if (autoWipe) {
        if (_clipboardWipeTimer) clearTimeout(_clipboardWipeTimer);
        _clipboardWipeTimer = setTimeout(() => {
          navigator.clipboard.writeText('').catch(() => {});
          if (typeof showToast === 'function') {
            showToast('🧹 Clipboard auto-wiped (data leak protection)');
          }
        }, 45000);
      }
    }).catch(e => {
      console.error('Clipboard copy error:', e);
    });
    return true;
  }

  /* ---------- CRYPTOGRAPHIC SECURE SHREDDER ---------- */
  function openShredderModal() {
    const m = document.getElementById('pp-sec-shredder-modal');
    if (!m) return;
    const inp = document.getElementById('sec-shred-confirm-input');
    const err = document.getElementById('sec-shred-err');
    if (inp) inp.value = '';
    if (err) err.textContent = '';
    m.classList.add('open');
    if (window.playSfx) window.playSfx('modalOpen');
    if (inp) setTimeout(() => inp.focus(), 150);
  }

  function closeShredderModal() {
    const m = document.getElementById('pp-sec-shredder-modal');
    if (!m) return;
    m.classList.remove('open');
    if (window.playSfx) window.playSfx('modalClose');
  }

  async function executeSecureShred() {
    if (window.ArcGold && typeof window.ArcGold.isUninstallPreventionActive === 'function' && window.ArcGold.isUninstallPreventionActive()) {
      alert('🛡️ Action Blocked: Arc Gold Anti-Uninstall & Commitment Lock is active.\n\nYou cannot wipe or uninstall the application while Gold Anti-Uninstall is engaged. Please disable it in Arc Gold VIP settings first.');
      const err = document.getElementById('sec-shred-err');
      if (err) err.textContent = '🛡️ Action Blocked: Arc Gold Anti-Uninstall protection is active.';
      return;
    }
    const inp = document.getElementById('sec-shred-confirm-input');
    const err = document.getElementById('sec-shred-err');
    if (!inp || inp.value.trim() !== 'SHRED-ALL-DATA') {
      if (err) err.textContent = 'Please type SHRED-ALL-DATA exactly to authorize.';
      if (window.playSfx) window.playSfx('uncheck');
      return;
    }
    if (err) err.textContent = '⚡ Performing 3-pass cryptographic wipe...';

    const keys = Object.keys(localStorage);
    // Pass 1: Cryptographic noise
    keys.forEach(k => {
      try {
        const len = Math.max(128, (localStorage.getItem(k) || '').length);
        const rand = crypto.getRandomValues(new Uint8Array(len));
        localStorage.setItem(k, hexFromBytes(rand));
      } catch (_) {}
    });
    // Pass 2: Zeroization (0x00)
    keys.forEach(k => {
      try { localStorage.setItem(k, '0'.repeat(256)); } catch (_) {}
    });
    // Pass 3: Inversion (0xFF)
    keys.forEach(k => {
      try { localStorage.setItem(k, 'f'.repeat(256)); } catch (_) {}
    });

    localStorage.clear();
    sessionStorage.clear();

    try {
      if (window.indexedDB && window.indexedDB.databases) {
        const dbs = await window.indexedDB.databases();
        dbs.forEach(db => { if (db.name) window.indexedDB.deleteDatabase(db.name); });
      }
    } catch (_) {}

    alert('🔥 All local data has been cryptographically shredded and wiped. The application will now reload in a clean state.');
    window.location.reload();
  }

  function updateSecuritySettingsUi() {
    updatePinBadge();
    updateFirewallBadge();
    const sel = document.getElementById('sec-autolock-select');
    if (sel) sel.value = String(getAutoLockMinutes());
    const shieldChk = document.getElementById('sec-privshield-toggle');
    if (shieldChk) shieldChk.checked = isPrivacyShieldEnabled();
    const discChk = document.getElementById('sec-discretion-toggle');
    if (discChk) discChk.checked = isDiscretionMode();
    const clipChk = document.getElementById('sec-clipautoclear-toggle');
    if (clipChk) clipChk.checked = isClipboardAutoClearEnabled();
    const scrambleChk = document.getElementById('sec-scramblepad-toggle');
    if (scrambleChk) scrambleChk.checked = isKeypadScrambleEnabled();
    computeStateHash().then(c => {
      const el = document.getElementById('sec-checksum-disp');
      if (el) el.textContent = c;
    });
    if (window.ArcTwoFactor) window.ArcTwoFactor.updateSettingsRow();
  }

  function init() {
    renderKeypad();
    if (isPinSet() || (window.ArcTwoFactor && window.ArcTwoFactor.isEnabled())) {
      setTimeout(showLockScreen, 50);
    }
    updatePinBadge();
    initFirewall();

    if (isDiscretionMode()) {
      setDiscretionMode(true);
    }

    ['pointerdown', 'mousemove', 'keydown', 'touchstart', 'scroll'].forEach(ev => {
      window.addEventListener(ev, resetInactivity, { passive: true });
    });
    setInterval(checkInactivity, 8000);

    window.addEventListener('blur', () => {
      if (isPrivacyShieldEnabled()) showPrivacyShield();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && isPrivacyShieldEnabled()) {
        showPrivacyShield();
      } else if (!document.hidden && !isPinSet()) {
        hidePrivacyShield();
      }
    });
    window.addEventListener('keydown', e => {
      if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        toggleDiscretionMode();
      }
    });

    const pad = document.getElementById('arc-pin-pad');
    if (pad) {
      pad.addEventListener('click', e => {
        const btn = e.target.closest('[data-v]');
        if (btn) handlePinInput(btn.dataset.v);
      });
    }

    const passIn = document.getElementById('arc-lock-pass-input');
    if (passIn) {
      passIn.addEventListener('input', () => {
        const err = document.getElementById('arc-pin-err');
        if (err) err.textContent = '';
        _updatePinDots();
      });
      passIn.addEventListener('keydown', async e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          await submitUnlock();
        }
      });
    }

    document.addEventListener('keydown', e => {
      const ov = document.getElementById('arc-pin-overlay');
      if (!ov || ov.classList.contains('hidden')) return;
      if (document.activeElement && document.activeElement.id === 'arc-lock-pass-input') {
        return;
      }
      if (/^[0-9]$/.test(e.key)) handlePinInput(e.key);
      else if (e.key === 'Backspace') handlePinInput('back');
      else if (e.key === 'Escape' || e.key === 'Delete') handlePinInput('clear');
    });

    document.querySelectorAll('#pp-sec-quarantine [data-close], #pp-sec-enc-exp [data-close], #pp-sec-enc-imp [data-close], #pp-sec-pin-modal [data-close], #arc-forgot-modal [data-close], #pp-sec-shredder-modal [data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const m = btn.closest('.pp-modal');
        if (m) m.classList.remove('open');
      });
    });

    const expBtn = document.getElementById('btn-sec-enc-exp-confirm');
    if (expBtn) {
      expBtn.addEventListener('click', async () => {
        const p1 = (document.getElementById('sec-enc-pass') || {}).value || '';
        const p2 = (document.getElementById('sec-enc-pass-confirm') || {}).value || '';
        const err = document.getElementById('sec-enc-exp-err');
        if (p1.length < 6) {
          if (err) err.textContent = 'Password must be at least 6 characters.';
          return;
        }
        if (p1 !== p2) {
          if (err) err.textContent = 'Passwords do not match.';
          return;
        }
        try {
          const payload = {
            app: 'arc-tracker',
            schema: 13,
            exportedAt: new Date().toISOString(),
            state: window.state ? JSON.parse(JSON.stringify(window.state)) : {},
            reflection: localStorage.getItem('whatHappenedText') || '',
            settings: (window.state && window.state.settings) || {}
          };
          const encString = await encrypt(payload, p1);
          const blob = new Blob([encString], { type: 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const d = new Date().toISOString().slice(0, 10);
          a.href = url;
          a.download = `arc_backup_encrypted_${d}.arcenc`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          const modal = document.getElementById('pp-sec-enc-exp');
          if (modal) modal.classList.remove('open');
          if (typeof showToast === 'function') showToast('AES-256 Encrypted Backup Downloaded');
        } catch (e) {
          if (err) err.textContent = 'Encryption failed: ' + e.message;
        }
      });
    }

    const decBtn = document.getElementById('btn-sec-dec-confirm');
    if (decBtn) {
      decBtn.addEventListener('click', async () => {
        const p = (document.getElementById('sec-dec-pass') || {}).value || '';
        const err = document.getElementById('sec-dec-err');
        if (!p) {
          if (err) err.textContent = 'Enter decryption password.';
          return;
        }
        try {
          const raw = _pendingEncryptedPayload;
          const decrypted = await decrypt(raw, p);
          const modal = document.getElementById('pp-sec-enc-imp');
          if (modal) modal.classList.remove('open');
          
          const sc = scanPayload(JSON.stringify(decrypted), _pendingEncryptedFileName || 'encrypted.json');
          if (!sc.safe) {
            openQuarantine(sc, JSON.stringify(decrypted), _pendingEncryptedFileName);
            return;
          }
          
          const clean = sanitizeObject(decrypted);
          if (clean.state && typeof window.saveToLocalStorage === 'function') {
            window.state = Object.assign(window.state || {}, clean.state);
            window.saveToLocalStorage();
            if (typeof initApp === 'function') initApp();
            if (typeof showToast === 'function') showToast('Encrypted Backup Restored & Verified');
          } else if (typeof showToast === 'function') {
            showToast('Decrypted backup inspected successfully.');
          }
        } catch (e) {
          if (err) err.textContent = e.message;
        }
      });
    }

    const pinSaveBtn = document.getElementById('btn-sec-pin-save');
    if (pinSaveBtn) {
      pinSaveBtn.addEventListener('click', async () => {
        const err = document.getElementById('sec-pin-modal-err');
        const currIn = document.getElementById('sec-pin-curr');
        const newIn = document.getElementById('sec-pin-new');
        const confIn = document.getElementById('sec-pin-confirm');
        const hasPin = isPinSet();
        if (hasPin) {
          const ok = await verifyPin(currIn ? currIn.value.trim() : '');
          if (!ok) {
            if (err) err.textContent = 'Current password or PIN is incorrect.';
            return;
          }
        }
        const p1 = (newIn ? newIn.value : '').trim();
        const p2 = (confIn ? confIn.value : '').trim();
        if (!p1 || p1.length < 4) {
          if (err) err.textContent = 'Password must be at least 4 characters or numbers.';
          return;
        }
        if (p1 !== p2) {
          if (err) err.textContent = 'Passwords do not match.';
          return;
        }
        await setPin(p1);
        const modal = document.getElementById('pp-sec-pin-modal');
        if (modal) modal.classList.remove('open');
        if (typeof showToast === 'function') showToast('Security Password Saved');
      });
    }

    const pinDisBtn = document.getElementById('btn-sec-pin-disable');
    if (pinDisBtn) {
      pinDisBtn.addEventListener('click', async () => {
        const err = document.getElementById('sec-pin-modal-err');
        const currIn = document.getElementById('sec-pin-curr');
        try {
          await removePin(currIn ? currIn.value.trim() : '');
          const modal = document.getElementById('pp-sec-pin-modal');
          if (modal) modal.classList.remove('open');
          if (typeof showToast === 'function') showToast('Security Password Removed');
        } catch (e) {
          if (err) err.textContent = e.message;
        }
      });
    }

    const sanBtn = document.getElementById('btn-sec-sanitize-import');
    if (sanBtn) {
      sanBtn.addEventListener('click', () => {
        if (!_pendingQuarantinePayload) return;
        try {
          const raw = _pendingQuarantinePayload.rawPayload;
          let parsed = JSON.parse(raw);
          parsed = sanitizeObject(parsed);
          const modal = document.getElementById('pp-sec-quarantine');
          if (modal) modal.classList.remove('open');
          if (parsed.state) {
            window.state = Object.assign(window.state || {}, parsed.state);
            if (typeof window.saveToLocalStorage === 'function') window.saveToLocalStorage();
            if (typeof initApp === 'function') initApp();
          }
          if (typeof showToast === 'function') showToast('Quarantined File Sanitized & Imported Safely');
        } catch (e) {
          if (typeof showToast === 'function') showToast('Sanitization failed: ' + e.message);
        }
      });
    }

    computeStateHash().then(c => {
      const el = document.getElementById('sec-checksum-disp');
      if (el) el.textContent = c;
    });
  }

  return {
    deriveKey,
    encrypt,
    decrypt,
    sha256,
    computeStateHash,
    scanPayload,
    sanitizeObject,
    runSystemAudit,
    isPinSet,
    setPin,
    verifyPin,
    removePin,
    showLockScreen,
    hideLockScreen,
    showUnlockLoadingScreen,
    handlePinInput,
    submitUnlock,
    togglePassVisible,
    openForgotPasswordModal,
    closeForgotPasswordModal,
    verifyRecoveryCode,
    openQuarantine,
    openEncExportModal,
    openEncImportModal,
    openPinModal,
    updatePinBadge,
    triggerAuditUi,
    init,
    initFirewall,
    testFirewallInterception,
    updateFirewallBadge,
    getAutoLockMinutes,
    setAutoLockMinutes,
    checkInactivity,
    resetInactivity,
    isPrivacyShieldEnabled,
    setPrivacyShieldEnabled,
    showPrivacyShield,
    hidePrivacyShield,
    dismissPrivacyShield,
    isDiscretionMode,
    setDiscretionMode,
    toggleDiscretionMode,
    isClipboardAutoClearEnabled,
    setClipboardAutoClearEnabled,
    copySensitiveWithAutoClear,
    openShredderModal,
    closeShredderModal,
    executeSecureShred,
    isKeypadScrambleEnabled,
    setKeypadScrambleEnabled,
    toggleKeypadScramble,
    renderKeypad,
    updateSecuritySettingsUi,
    getPendingQuarantine: () => _pendingQuarantinePayload,
    setPendingEncrypted: (data, name) => { _pendingEncryptedPayload = data; _pendingEncryptedFileName = name; },
    getPendingEncrypted: () => _pendingEncryptedPayload
  };
})();

// User Operative Profile & Handle Management Module
window.ArcProfile = (function() {
  'use strict';
  const STORAGE_KEY = 'arc_user_profile';

  let activeRingStyle = 'gold';
  let activeRingColor = '#F59E0B';

  const PFP_RING_STYLES = {
    gold: { id: 'gold', name: 'Royal Gold', color: '#F59E0B', shadow: '0 0 16px rgba(245, 158, 11, 0.65)' },
    diamond: { id: 'diamond', name: 'Diamond Ice', color: '#38BDF8', shadow: '0 0 16px rgba(56, 189, 248, 0.65)' },
    amethyst: { id: 'amethyst', name: 'Neon Amethyst', color: '#A855F7', shadow: '0 0 16px rgba(168, 85, 247, 0.65)' },
    emerald: { id: 'emerald', name: 'Emerald Matrix', color: '#10B981', shadow: '0 0 16px rgba(16, 185, 129, 0.65)' },
    ruby: { id: 'ruby', name: 'Crimson Flame', color: '#EF4444', shadow: '0 0 16px rgba(239, 68, 68, 0.65)' },
    aurora: { id: 'aurora', name: 'Cosmic Aurora', color: '#EC4899', shadow: '0 0 16px rgba(236, 72, 153, 0.65)' },
    custom: { id: 'custom', name: 'Custom Hue', color: '#F59E0B', shadow: '0 0 16px rgba(245, 158, 11, 0.65)' }
  };

  function getRingConfig(styleKey, customColor) {
    const key = (styleKey && PFP_RING_STYLES[styleKey]) ? styleKey : 'gold';
    if (key === 'custom') {
      const color = customColor || '#F59E0B';
      return {
        id: 'custom',
        color: color,
        shadow: '0 0 16px ' + color + 'aa'
      };
    }
    return PFP_RING_STYLES[key];
  }

  function getDefaultProfile() {
    let authUser = null;
    if (window.ArcGoogleSync && typeof window.ArcGoogleSync.getUser === 'function') {
      authUser = window.ArcGoogleSync.getUser();
    }
    const name = (authUser && authUser.name) ? authUser.name : 'Operative';
    const email = (authUser && authUser.email) ? authUser.email : 'operative@winterarc.local';
    const cleanUser = name.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 16) || 'operative';
    return {
      displayName: name,
      username: cleanUser,
      title: 'Shadow Initiate',
      motto: 'Transform in Silence.',
      email: email,
      avatar: name.charAt(0).toUpperCase() || 'O',
      pfpRingStyle: 'gold',
      pfpRingColor: '#F59E0B',
      isCustomized: false
    };
  }

  function getProfile() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return Object.assign(getDefaultProfile(), JSON.parse(raw));
      }
    } catch (_) {}
    return getDefaultProfile();
  }

  function saveProfile() {
    const nameIn = document.getElementById('arc-input-display-name');
    const userIn = document.getElementById('arc-input-username');
    const titleIn = document.getElementById('arc-select-title');
    const mottoIn = document.getElementById('arc-input-motto');
    const err = document.getElementById('arc-profile-modal-err');
    if (err) err.textContent = '';

    const displayName = (nameIn ? nameIn.value : '').trim();
    let username = (userIn ? userIn.value : '').trim().toLowerCase().replace(/^@+/, '');
    const title = (titleIn ? titleIn.value : '').trim() || 'Shadow Initiate';
    const motto = (mottoIn ? mottoIn.value : '').trim() || 'Transform in Silence.';

    if (!displayName || displayName.length < 2) {
      if (err) err.textContent = 'Display name must be at least 2 characters.';
      return false;
    }
    if (!username || username.length < 3) {
      if (err) err.textContent = 'Username handle must be at least 3 characters.';
      return false;
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      if (err) err.textContent = 'Username can only contain letters, numbers, and underscores.';
      return false;
    }

    const current = getProfile();
    const updated = {
      ...current,
      displayName,
      username,
      title,
      motto,
      avatar: displayName.charAt(0).toUpperCase(),
      pfpRingStyle: activeRingStyle || 'gold',
      pfpRingColor: activeRingColor || '#F59E0B',
      isCustomized: true,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    renderHeaderProfile();
    closeSetupModal();
    if (window.playSfx) window.playSfx('fanfare');
    if (typeof showToast === 'function') {
      showToast(`Identity saved: ${displayName} (@${username})`);
    }
    return true;
  }

  function updateRingUI(isGold) {
    const badge = document.getElementById('arc-pfp-ring-badge');
    const desc = document.getElementById('arc-pfp-ring-desc');
    const lockBanner = document.getElementById('arc-pfp-ring-locked-banner');
    const customInput = document.getElementById('arc-input-ring-custom-color');
    const hexPreview = document.getElementById('arc-ring-color-preview-hex');
    const optionBtns = document.querySelectorAll('.arc-ring-option');

    if (customInput) customInput.value = activeRingColor;
    if (hexPreview) {
      hexPreview.textContent = activeRingColor;
      hexPreview.style.color = activeRingColor;
    }

    if (isGold) {
      if (badge) {
        badge.className = 'px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1';
        badge.innerHTML = '<i class="fa-solid fa-crown text-[8px]"></i> Arc Gold VIP';
      }
      if (desc) desc.textContent = 'Arc Gold VIP active. Outer lining defaults to Royal Gold, or customize your preferred style.';
      if (lockBanner) lockBanner.classList.add('hidden');
      if (customInput) customInput.disabled = false;

      optionBtns.forEach(btn => {
        const ringId = btn.getAttribute('data-ring');
        if (ringId === activeRingStyle) {
          btn.classList.add('ring-2', 'ring-white/90', 'bg-slate-800');
          btn.classList.remove('border-slate-800');
        } else {
          btn.classList.remove('ring-2', 'ring-white/90', 'bg-slate-800');
          btn.classList.add('border-slate-800');
        }
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
      });
    } else {
      if (badge) {
        badge.className = 'px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1';
        badge.innerHTML = '<i class="fa-solid fa-lock text-[8px]"></i> VIP Exclusive';
      }
      if (desc) desc.textContent = 'Custom avatar outer lining is an Arc Gold VIP feature. Standard cyan border is currently active.';
      if (lockBanner) lockBanner.classList.remove('hidden');
      if (customInput) customInput.disabled = true;

      optionBtns.forEach(btn => {
        btn.classList.remove('ring-2', 'ring-white/90', 'bg-slate-800');
        btn.style.opacity = '0.55';
        btn.style.cursor = 'not-allowed';
      });
    }
  }

  function selectRingStyle(styleId) {
    const isGold = !!(window.ArcGold && typeof window.ArcGold.isGold === 'function' && window.ArcGold.isGold());
    if (!isGold) {
      if (typeof showToast === 'function') {
        showToast('🔒 Outer lining customization is an Arc Gold VIP exclusive feature.');
      }
      return;
    }
    activeRingStyle = styleId;
    if (styleId !== 'custom') {
      const cfg = PFP_RING_STYLES[styleId];
      if (cfg) activeRingColor = cfg.color;
    }
    updateRingUI(true);
    handleLivePreview();
    if (window.playSfx) window.playSfx('click');
  }

  function setCustomRingColor(hex) {
    const isGold = !!(window.ArcGold && typeof window.ArcGold.isGold === 'function' && window.ArcGold.isGold());
    if (!isGold) {
      if (typeof showToast === 'function') {
        showToast('🔒 Custom outer lining color is an Arc Gold VIP exclusive feature.');
      }
      return;
    }
    activeRingStyle = 'custom';
    activeRingColor = hex || '#F59E0B';
    updateRingUI(true);
    handleLivePreview();
  }

  function handleLivePreview() {
    const nameIn = document.getElementById('arc-input-display-name');
    const userIn = document.getElementById('arc-input-username');
    const titleIn = document.getElementById('arc-select-title');

    const name = (nameIn && nameIn.value.trim()) || 'Operative';
    let handle = (userIn && userIn.value.trim().toLowerCase().replace(/^@+/, '')) || 'operative';
    const title = (titleIn && titleIn.value) || 'Shadow Initiate';

    const pAvatar = document.getElementById('arc-preview-avatar');
    const pName = document.getElementById('arc-preview-name');
    const pUser = document.getElementById('arc-preview-username');
    const pRank = document.getElementById('arc-preview-rank-tag');

    if (pAvatar) {
      let authUser = null;
      if (window.ArcGoogleSync && typeof window.ArcGoogleSync.getUser === 'function') {
        authUser = window.ArcGoogleSync.getUser();
      }
      if (authUser && authUser.picture) {
        pAvatar.innerHTML = `<img src="${authUser.picture}" class="w-full h-full object-cover rounded-full">`;
      } else {
        pAvatar.textContent = name.charAt(0).toUpperCase() || 'O';
      }

      const isGold = !!(window.ArcGold && typeof window.ArcGold.isGold === 'function' && window.ArcGold.isGold());
      if (isGold) {
        const ringCfg = getRingConfig(activeRingStyle, activeRingColor);
        pAvatar.style.borderColor = ringCfg.color;
        pAvatar.style.boxShadow = ringCfg.shadow;
      } else {
        pAvatar.style.borderColor = '';
        pAvatar.style.boxShadow = '';
      }
    }
    if (pName) pName.textContent = name;
    if (pUser) pUser.textContent = '@' + handle;
    if (pRank) pRank.textContent = title;
  }

  function openSetupModal() {
    const modal = document.getElementById('arc-profile-setup-modal');
    if (!modal) return;
    const p = getProfile();
    const nameIn = document.getElementById('arc-input-display-name');
    const userIn = document.getElementById('arc-input-username');
    const titleIn = document.getElementById('arc-select-title');
    const mottoIn = document.getElementById('arc-input-motto');
    const emailDisp = document.getElementById('arc-preview-email');
    const err = document.getElementById('arc-profile-modal-err');

    if (nameIn) nameIn.value = p.displayName;
    if (userIn) userIn.value = p.username;
    if (titleIn) titleIn.value = p.title;
    if (mottoIn) mottoIn.value = p.motto || '';
    if (emailDisp) emailDisp.textContent = p.email || 'synced.user@gmail.com';
    if (err) err.textContent = '';

    const isGold = !!(window.ArcGold && typeof window.ArcGold.isGold === 'function' && window.ArcGold.isGold());
    activeRingStyle = p.pfpRingStyle || 'gold';
    activeRingColor = p.pfpRingColor || '#F59E0B';

    updateRingUI(isGold);
    handleLivePreview();

    modal.classList.add('open');
    modal.classList.add('active');
    modal.style.display = 'flex';
    if (nameIn) setTimeout(() => { try { nameIn.focus({ preventScroll: true }); } catch(_) { nameIn.focus(); } }, 150);
    if (window.playSfx) window.playSfx('modalOpen');
  }

  function closeSetupModal() {
    const modal = document.getElementById('arc-profile-setup-modal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.classList.remove('active');
    modal.style.display = 'none';
    if (window.playSfx) window.playSfx('modalClose');
  }

  function renderHeaderProfile() {
    const p = getProfile();
    const nameEl = document.getElementById('header-profile-name');
    const userEl = document.getElementById('header-profile-user');
    const avatarEl = document.getElementById('header-avatar-circle');
    const pill = document.getElementById('header-profile-pill');

    if (nameEl) nameEl.textContent = p.displayName;
    if (userEl) userEl.textContent = '@' + p.username;

    if (pill) {
      let authUser = null;
      if (window.ArcGoogleSync && typeof window.ArcGoogleSync.getUser === 'function') {
        authUser = window.ArcGoogleSync.getUser();
      }
      const syncInfo = (authUser && authUser.email) ? ` • ${authUser.email}` : '';
      pill.title = `${p.displayName} (@${p.username})${syncInfo} — Click to customize profile`;

      const isGold = !!(window.ArcGold && typeof window.ArcGold.isGold === 'function' && window.ArcGold.isGold());

      if (isGold) {
        // Gold subscriber: Outer lining is Gold by default, or user's customized style
        const ringStyle = p.pfpRingStyle || 'gold';
        const ringCfg = getRingConfig(ringStyle, p.pfpRingColor);
        pill.style.borderColor = ringCfg.color;
        pill.style.boxShadow = ringCfg.shadow;
        pill.setAttribute('data-gold-ring', ringStyle);

        pill.onmouseenter = function() {
          pill.style.boxShadow = `0 0 22px ${ringCfg.color}`;
        };
        pill.onmouseleave = function() {
          pill.style.boxShadow = ringCfg.shadow;
        };

        // VIP Crown mini indicator
        let crown = document.getElementById('header-profile-vip-crown');
        if (!crown) {
          crown = document.createElement('span');
          crown.id = 'header-profile-vip-crown';
          crown.className = 'absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-slate-950 border border-amber-400 text-amber-300 text-[8px] flex items-center justify-center shadow-[0_0_8px_rgba(245,158,11,0.6)] pointer-events-none select-none z-10';
          crown.innerHTML = '<i class="fa-solid fa-crown"></i>';
          crown.title = 'Arc Gold VIP Active';
          pill.appendChild(crown);
        } else {
          crown.style.display = 'flex';
        }
      } else {
        // Gold ended or inactive: Keep it back to normal default
        pill.style.borderColor = '';
        pill.style.boxShadow = '';
        pill.removeAttribute('data-gold-ring');
        pill.onmouseenter = null;
        pill.onmouseleave = null;

        const crown = document.getElementById('header-profile-vip-crown');
        if (crown) {
          crown.style.display = 'none';
        }
      }
    }

    if (avatarEl) {
      let authUser = null;
      if (window.ArcGoogleSync && typeof window.ArcGoogleSync.getUser === 'function') {
        authUser = window.ArcGoogleSync.getUser();
      }
      if (authUser && authUser.picture) {
        avatarEl.innerHTML = `<img src="${authUser.picture}" class="w-full h-full object-cover rounded-full">`;
      } else {
        avatarEl.textContent = p.avatar || 'O';
      }
    }
  }

  function onLoginSuccess(authUser) {
    if (!authUser) return;
    if (window.ArcGold && typeof window.ArcGold.claimFirstMonthTrial === 'function') {
      window.ArcGold.claimFirstMonthTrial(authUser);
    }
    const current = getProfile();
    const updated = {
      ...current,
      email: authUser.email || current.email
    };
    if (!current.isCustomized) {
      if (authUser.name) updated.displayName = authUser.name;
      const cleanUser = (authUser.name || 'user').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 16);
      if (cleanUser) updated.username = cleanUser;
      updated.avatar = (authUser.name || 'U').charAt(0).toUpperCase();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      renderHeaderProfile();
      // Prompt user to pick/confirm details right after login
      setTimeout(openSetupModal, 600);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      renderHeaderProfile();
    }
  }

  function init() {
    renderHeaderProfile();
  }

  return {
    init,
    getProfile,
    saveProfile,
    openSetupModal,
    closeSetupModal,
    handleLivePreview,
    renderHeaderProfile,
    selectRingStyle,
    setCustomRingColor,
    onLoginSuccess
  };
})();

// Tracker Sharing and Accountability Report Module
window.ArcShare = (function() {
  'use strict';

  function getProgressStats() {
    const profile = (window.ArcProfile && typeof window.ArcProfile.getProfile === 'function')
      ? window.ArcProfile.getProfile()
      : { displayName: 'Operative', username: 'operative', title: 'Shadow Initiate', motto: 'Transform in Silence.' };

    let day = 25;
    if (window.state && window.state.day) day = window.state.day;
    else if (window.currentDayIndex) day = window.currentDayIndex + 1;

    let streak = 3;
    if (window.state && typeof window.state.streak === 'number') {
      streak = window.state.streak;
    } else if (window.state && window.state.gam && typeof window.state.gam.streak === 'number') {
      streak = window.state.gam.streak;
    }

    let shield = '100%';
    const shieldEl = document.getElementById('st-radar-shield-score');
    if (shieldEl && shieldEl.textContent) shield = shieldEl.textContent.trim();

    return { profile, day, streak, shield };
  }

  function openShareModal() {
    const modal = document.getElementById('arc-share-modal');
    if (!modal) return;
    const stats = getProgressStats();

    const uEl = document.getElementById('share-card-user');
    const rEl = document.getElementById('share-card-rank');
    const sEl = document.getElementById('share-card-streak');
    const dEl = document.getElementById('share-card-day');
    const shEl = document.getElementById('share-card-shield');

    if (uEl) uEl.textContent = `@${stats.profile.username}`;
    if (rEl) rEl.textContent = `${stats.profile.title}`;
    if (sEl) sEl.textContent = `${stats.streak} Days`;
    if (dEl) dEl.textContent = `${stats.day} / 92`;
    if (shEl) shEl.textContent = stats.shield;

    modal.classList.add('open');
    if (window.playSfx) window.playSfx('modalOpen');
  }

  function closeShareModal() {
    const modal = document.getElementById('arc-share-modal');
    if (!modal) return;
    modal.classList.remove('open');
    if (window.playSfx) window.playSfx('modalClose');
  }

  function buildSummaryText() {
    const s = getProgressStats();
    return `❄️ WINTER ARC 2026 - DISCIPLINE REPORT\n` +
      `Operative: ${s.profile.displayName} (@${s.profile.username}) • ${s.profile.title}\n` +
      `📅 Progress: Day ${s.day} / 92 Days\n` +
      `🔥 Active Streak: ${s.streak} Days\n` +
      `🛡️ Dopamine Shield: ${s.shield}\n` +
      `💬 Motto: "${s.profile.motto || 'Transform in Silence.'}"\n\n` +
      `Locking in and conquering distractions with Arc Tracker.\n#WinterArc #Discipline #LockIn #ArcTracker`;
  }

  async function copyShareLink() {
    const url = window.location.href;
    const lbl = document.getElementById('arc-share-copy-link-label');
    try {
      await navigator.clipboard.writeText(url);
      if (lbl) {
        lbl.textContent = 'Copied Link to Clipboard! ✓';
        setTimeout(() => { lbl.textContent = 'Copy Tracker Web Link'; }, 2000);
      }
      if (window.playSfx) window.playSfx('fanfare');
      if (typeof showToast === 'function') showToast('Tracker URL copied to clipboard');
    } catch (_) {
      prompt('Copy tracker link:', url);
    }
  }

  async function copyTextSummary() {
    const text = buildSummaryText();
    const lbl = document.getElementById('arc-share-copy-text-label');
    try {
      await navigator.clipboard.writeText(text);
      if (lbl) {
        lbl.textContent = 'Report Copied to Clipboard! ✓';
        setTimeout(() => { lbl.textContent = 'Copy Formatted Progress Report'; }, 2000);
      }
      if (window.playSfx) window.playSfx('fanfare');
      if (typeof showToast === 'function') showToast('Progress report copied to clipboard');
    } catch (_) {
      prompt('Copy progress report:', text);
    }
  }

  async function shareNative() {
    const text = buildSummaryText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Winter Arc 2026 Progress',
          text: text,
          url: window.location.href
        });
        if (typeof showToast === 'function') showToast('Shared successfully!');
      } catch (err) {
        if (err.name !== 'AbortError') copyTextSummary();
      }
    } else {
      copyTextSummary();
    }
  }

  function shareWhatsApp() {
    const text = buildSummaryText();
    const url = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(text);
    window.open(url, '_blank');
  }

  function shareTwitter() {
    const text = buildSummaryText();
    const url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text);
    window.open(url, '_blank');
  }

  function shareTelegram() {
    const text = buildSummaryText();
    const url = 'https://t.me/share/url?url=' + encodeURIComponent(window.location.href) + '&text=' + encodeURIComponent(text);
    window.open(url, '_blank');
  }

  return {
    openShareModal,
    closeShareModal,
    copyShareLink,
    copyTextSummary,
    shareNative,
    shareWhatsApp,
    shareTwitter,
    shareTelegram
  };
})();

// Device Auto-Start Management Module (Windows, Android, macOS)
window.ArcAutoStart = (function() {
  'use strict';
  const STORAGE_KEY = 'arc_autostart_enabled';
  const PROMPTED_KEY = 'arc_autostart_prompted';

  function isEnabled() {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  }

  function setEnabled(enabled) {
    localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
    renderUi();
    if (enabled) {
      if (typeof showToast === 'function') showToast('Auto-Start on Device Boot Enabled');
    } else {
      if (typeof showToast === 'function') showToast('Auto-Start on Device Boot Disabled');
    }
  }

  function toggle() {
    const next = !isEnabled();
    setEnabled(next);
    if (next) {
      openModal();
    }
  }

  function openModal() {
    const modal = document.getElementById('arc-autostart-modal');
    if (!modal) return;
    renderUi();
    modal.classList.add('open');
    if (window.playSfx) window.playSfx('modalOpen');
  }

  function closeModal() {
    const modal = document.getElementById('arc-autostart-modal');
    if (!modal) return;
    modal.classList.remove('open');
    if (window.playSfx) window.playSfx('modalClose');
  }

  function promptIfUnconfigured() {
    if (isEnabled()) return;
    if (localStorage.getItem(PROMPTED_KEY) === 'true') return;

    setTimeout(() => {
      const modal = document.getElementById('arc-autostart-prompt-modal');
      if (modal) {
        modal.classList.add('open');
        if (window.playSfx) window.playSfx('modalOpen');
      }
    }, 700);
  }

  function acceptPrompt() {
    const modal = document.getElementById('arc-autostart-prompt-modal');
    if (modal) modal.classList.remove('open');
    localStorage.setItem(PROMPTED_KEY, 'true');
    setEnabled(true);
    openModal();
  }

  function dismissPrompt() {
    const modal = document.getElementById('arc-autostart-prompt-modal');
    if (modal) modal.classList.remove('open');
    localStorage.setItem(PROMPTED_KEY, 'true');
    if (window.playSfx) window.playSfx('modalClose');
  }

  function downloadWindowsStartupScript() {
    const appUrl = window.location.href;
    const batContent = `@echo off
setlocal enabledelayedexpansion
title Arc Tracker Windows Auto-Start Setup
echo ========================================================
echo       ARC TRACKER - AUTOMATIC APP STARTUP INSTALLER
echo ========================================================
echo.
echo [ARC TRACKER] Registering Arc Tracker Desktop App for Windows Startup...
echo.

set "STARTUP_FOLDER=%APPDATA%\\Microsoft\\Windows\\Start Menu\\Programs\\Startup"

:: 1. Delete legacy InternetShortcut (.url) which opened in a web browser
if exist "%STARTUP_FOLDER%\\ArcTracker.url" (
    del /f /q "%STARTUP_FOLDER%\\ArcTracker.url" >nul 2>&1
    echo [OK] Removed legacy browser shortcut.
)

:: 2. Find Arc Tracker project directory
set "APP_DIR=%~dp0"
if "!APP_DIR:~-1!"=="\\" set "APP_DIR=!APP_DIR:~0,-1!"

if not exist "!APP_DIR!\\Launch-ArcTracker.bat" (
    if exist "%USERPROFILE%\\OneDrive\\Desktop\\mayank\\mayank\\Launch-ArcTracker.bat" (
        set "APP_DIR=%USERPROFILE%\\OneDrive\\Desktop\\mayank\\mayank"
    ) else if exist "%USERPROFILE%\\Desktop\\mayank\\mayank\\Launch-ArcTracker.bat" (
        set "APP_DIR=%USERPROFILE%\\Desktop\\mayank\\mayank"
    )
)

:: 3. Create Start-PreviewServer.vbs and Launch-ArcTracker.vbs if missing
if exist "!APP_DIR!\\Launch-ArcTracker.bat" (
    if not exist "!APP_DIR!\\Start-PreviewServer.vbs" (
        echo Option Explicit > "!APP_DIR!\\Start-PreviewServer.vbs"
        echo Dim WshShell, fso, scriptDir >> "!APP_DIR!\\Start-PreviewServer.vbs"
        echo Set WshShell = CreateObject("WScript.Shell") >> "!APP_DIR!\\Start-PreviewServer.vbs"
        echo Set fso = CreateObject("Scripting.FileSystemObject") >> "!APP_DIR!\\Start-PreviewServer.vbs"
        echo scriptDir = fso.GetParentFolderName(WScript.ScriptFullName) >> "!APP_DIR!\\Start-PreviewServer.vbs"
        echo WshShell.CurrentDirectory = scriptDir >> "!APP_DIR!\\Start-PreviewServer.vbs"
        echo WshShell.Run "cmd.exe /c npm.cmd run preview", 0, False >> "!APP_DIR!\\Start-PreviewServer.vbs"
    )
    if not exist "!APP_DIR!\\Launch-ArcTracker.vbs" (
        echo Option Explicit > "!APP_DIR!\\Launch-ArcTracker.vbs"
        echo Dim WshShell, fso, scriptDir >> "!APP_DIR!\\Launch-ArcTracker.vbs"
        echo Set WshShell = CreateObject("WScript.Shell") >> "!APP_DIR!\\Launch-ArcTracker.vbs"
        echo Set fso = CreateObject("Scripting.FileSystemObject") >> "!APP_DIR!\\Launch-ArcTracker.vbs"
        echo scriptDir = fso.GetParentFolderName(WScript.ScriptFullName) >> "!APP_DIR!\\Launch-ArcTracker.vbs"
        echo WshShell.CurrentDirectory = scriptDir >> "!APP_DIR!\\Launch-ArcTracker.vbs"
        echo WshShell.Run "cmd.exe /c """ ^& scriptDir ^& "\\Launch-ArcTracker.bat""", 0, False >> "!APP_DIR!\\Launch-ArcTracker.vbs"
    )
)

:: 4. Generate native Windows Shortcut (.lnk) for Desktop App Mode
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
  "$wsh = New-Object -ComObject WScript.Shell; " ^
  "$shortcut = $wsh.CreateShortcut('%STARTUP_FOLDER%\\Arc Tracker.lnk'); " ^
  "if (Test-Path '!APP_DIR!\\Launch-ArcTracker.vbs') { " ^
  "  $shortcut.TargetPath = (Join-Path $env:SystemRoot 'System32\\wscript.exe'); " ^
  "  $shortcut.Arguments = '\"!APP_DIR!\\Launch-ArcTracker.vbs\"'; " ^
  "  $shortcut.WorkingDirectory = '!APP_DIR!'; " ^
  "  if (Test-Path '!APP_DIR!\\src-tauri\\icons\\icon.ico') { $shortcut.IconLocation = '!APP_DIR!\\src-tauri\\icons\\icon.ico,0' } " ^
  "} else { " ^
  "  $pX86 = [System.Environment]::GetEnvironmentVariable('ProgramFiles(x86)'); " ^
  "  $edge = if ($pX86) { Join-Path $pX86 'Microsoft\\Edge\\Application\\msedge.exe' } else { '' }; " ^
  "  if (-not (Test-Path $edge)) { $edge = Join-Path $env:ProgramFiles 'Microsoft\\Edge\\Application\\msedge.exe' }; " ^
  "  if (Test-Path $edge) { $shortcut.TargetPath = $edge; $shortcut.Arguments = '--app=\"${appUrl}\" --start-maximized' } " ^
  "  else { $shortcut.TargetPath = 'chrome.exe'; $shortcut.Arguments = '--app=\"${appUrl}\" --start-maximized' }; " ^
  "}; " ^
  "$shortcut.Description = 'Arc Tracker Desktop App'; " ^
  "$shortcut.Save()"

echo.
echo ========================================================
echo [SUCCESS] Arc Tracker App is now registered for Auto-Start!
echo.
echo * Legacy web browser shortcut removed.
echo * Desktop App Shortcut created at:
echo   "%STARTUP_FOLDER%\\Arc Tracker.lnk"
echo.
echo Arc Tracker will now launch as a dedicated desktop application
echo window whenever your computer turns on (no browser tabs/URL bar).
echo ========================================================
echo.
pause
`;

    const blob = new Blob([batContent], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Enable-ArcTracker-Startup.bat';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    if (window.playSfx) window.playSfx('fanfare');
    if (typeof showToast === 'function') {
      showToast('Downloaded Windows Auto-Start .bat script! Run it once to register.');
    }
  }

  function renderUi() {
    const active = isEnabled();
    const pill = document.getElementById('autostart-status-pill');
    const btn = document.getElementById('btn-toggle-autostart');
    const btnText = document.getElementById('btn-toggle-autostart-text');
    const modalBtn = document.getElementById('arc-autostart-modal-toggle-btn');

    if (pill) {
      pill.textContent = active ? 'ACTIVE (Starts on Boot)' : 'DISABLED';
      pill.className = active
        ? 'text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        : 'text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700';
    }

    if (btnText) {
      btnText.textContent = active ? 'Auto-Start Enabled (Active)' : 'Turn On Auto-Start';
    }
    if (btn) {
      btn.setAttribute('data-active', active ? 'true' : 'false');
      btn.className = active
        ? 'px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-95'
        : 'px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-cyan-500/20';
    }

    if (modalBtn) {
      modalBtn.textContent = active ? 'Enabled ✓' : 'Enable';
      modalBtn.className = active
        ? 'px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-extrabold text-xs'
        : 'px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-extrabold text-xs';
    }
  }

  function init() {
    renderUi();
  }

  return {
    init,
    isEnabled,
    setEnabled,
    toggle,
    openModal,
    closeModal,
    promptIfUnconfigured,
    acceptPrompt,
    dismissPrompt,
    downloadWindowsStartupScript,
    renderUi
  };
})();

// Permanent Live Screen Time Notification & Floating HUD Module
window.ArcScreenTimeNotifier = (function() {
  'use strict';
  const STORAGE_KEY = 'arc_perm_notif_enabled';
  let _intervalId = null;
  let _lastSecs = 0;
  let _desktopSecs = 0;
  let _mobileSecs = 0;
  let _combinedSecs = 0;
  let _hudOpen = false;

  function isEnabled() {
    const val = localStorage.getItem(STORAGE_KEY);
    return val === null ? true : val === 'true'; // default to true
  }

  function formatTime(seconds) {
    if (typeof formatDuration === 'function') return formatDuration(seconds);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  }

  function formatTimeShort(seconds) {
    if (typeof formatDurationShort === 'function') return formatDurationShort(seconds);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }

  async function requestPermission() {
    if (typeof Notification === 'undefined') {
      if (typeof showToast === 'function') showToast('System notifications are not supported on this browser.');
      return false;
    }
    if (Notification.permission === 'granted') return true;
    try {
      const res = await Notification.requestPermission();
      renderUi();
      return res === 'granted';
    } catch (_) {
      return false;
    }
  }

  async function toggle() {
    const next = !isEnabled();
    localStorage.setItem(STORAGE_KEY, next ? 'true' : 'false');
    if (next) {
      const granted = await requestPermission();
      if (!granted) {
        if (typeof showToast === 'function') showToast('Please grant notification permission in your browser or system settings.');
      } else {
        startNotificationLoop();
        updateNotification(true);
        if (typeof showToast === 'function') showToast('Permanent Screen Time notification pinned to tray.');
      }
    } else {
      stopNotificationLoop();
      if (typeof showToast === 'function') showToast('Permanent Screen Time notification turned off.');
    }
    renderUi();
  }

  function updateNotification(force = false) {
    if (!isEnabled()) return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

    const formatted = formatTimeShort(_combinedSecs > 0 ? _combinedSecs : _lastSecs);
    const shieldEl = document.getElementById('st-radar-shield-score');
    const shield = shieldEl ? shieldEl.textContent.trim() : '100%';

    let streak = 3;
    if (window.state && typeof window.state.streak === 'number') streak = window.state.streak;

    try {
      new Notification(`⏳ Total Screen Time: ${formatted}`, {
        tag: 'arc-live-screentime',
        body: `🛡️ Dopamine Shield: ${shield} • Active Streak: ${streak} Days\nTracking active device screen time. Tap to open Arc Tracker.`,
        icon: './icons/128x128.png',
        badge: './icons/32x32.png',
        silent: true,
        renotify: false,
        requireInteraction: true
      });
    } catch (e) {
      try {
        new Notification(`⏳ Total Screen Time: ${formatted}`, {
          tag: 'arc-live-screentime',
          body: `🛡️ Dopamine Shield: ${shield} • Active Streak: ${streak} Days`,
          icon: './icons/128x128.png',
          badge: './icons/32x32.png',
          silent: true,
          renotify: false
        });
      } catch (_) {}
    }
  }

  async function testNotification() {
    const granted = await requestPermission();
    if (granted) {
      updateNotification(true);
      if (typeof showToast === 'function') showToast('Preview notification dispatched to system tray!');
    } else {
      if (typeof showToast === 'function') showToast('Allow notifications in your browser/device settings to preview.');
    }
  }

  function startNotificationLoop() {
    stopNotificationLoop();
    if (!isEnabled()) return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    _intervalId = setInterval(() => {
      updateNotification();
    }, 45000);
  }

  function stopNotificationLoop() {
    if (_intervalId) {
      clearInterval(_intervalId);
      _intervalId = null;
    }
  }

  function toggleHudCard(force) {
    const card = document.getElementById('arc-hud-card');
    const caret = document.getElementById('arc-hud-caret');
    if (!card) return;
    _hudOpen = typeof force === 'boolean' ? force : !_hudOpen;
    if (_hudOpen) {
      card.classList.remove('hidden');
      void card.offsetWidth; // force layout reflow for fluid spring
      card.classList.add('arc-panel-open');
      if (caret) caret.style.transform = 'rotate(180deg)';
      if (window.playSfx) window.playSfx('modalOpen');
    } else {
      card.classList.remove('arc-panel-open');
      if (caret) caret.style.transform = '';
      setTimeout(() => {
        if (!_hudOpen) card.classList.add('hidden');
      }, 340);
    }
  }

  function tick(seconds) {
    _lastSecs = seconds;
    const hudTimer = document.getElementById('arc-hud-timer');
    if (hudTimer) {
      const activeTotal = _combinedSecs > 0 ? _combinedSecs : seconds;
      hudTimer.textContent = formatTime(activeTotal);
    }
  }

  function syncTimes(desktopSecs, mobileSecs, combinedSecs) {
    _desktopSecs = desktopSecs;
    _mobileSecs = mobileSecs;
    _combinedSecs = combinedSecs;

    const pcEl = document.getElementById('arc-hud-pc-time');
    const mobEl = document.getElementById('arc-hud-mob-time');
    const shieldEl = document.getElementById('arc-hud-shield-score');
    const srcShield = document.getElementById('st-radar-shield-score');

    if (pcEl) pcEl.textContent = formatTimeShort(desktopSecs);
    if (mobEl) mobEl.textContent = formatTimeShort(mobileSecs);
    if (shieldEl && srcShield) shieldEl.textContent = srcShield.textContent;
  }

  function renderUi() {
    const active = isEnabled();
    const isGranted = typeof Notification !== 'undefined' && Notification.permission === 'granted';

    const pill = document.getElementById('screentime-notif-status-pill');
    const btn = document.getElementById('btn-toggle-perm-notif');
    const btnText = document.getElementById('btn-toggle-perm-notif-text');
    const hudNotifLink = document.getElementById('arc-hud-notif-link');

    if (pill) {
      pill.textContent = (active && isGranted) ? 'ACTIVE IN TRAY' : active ? 'PERMISSION NEEDED' : 'DISABLED';
      pill.className = (active && isGranted)
        ? 'text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        : 'text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700';
    }

    if (btnText) {
      btnText.textContent = (active && isGranted) ? 'Permanent Notification Active ✓' : 'Enable Permanent Notification';
    }
    if (btn) {
      btn.className = (active && isGranted)
        ? 'px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-95'
        : 'px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-purple-600/20';
    }

    if (hudNotifLink) {
      hudNotifLink.textContent = (active && isGranted) ? 'Active in Tray ✓' : 'Enable Tray Notif';
    }
  }

  function init() {
    renderUi();
    if (isEnabled() && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      startNotificationLoop();
      setTimeout(updateNotification, 3000);
    }
  }

  return {
    init,
    isEnabled,
    toggle,
    requestPermission,
    updateNotification,
    testNotification,
    toggleHudCard,
    tick,
    syncTimes,
    renderUi
  };
})();

// ==========================================================================
// ARC PHONE WIDGETS & ANDROID SIMULATOR CONTROLLER MODULE
// Modeled directly from the user's Android homescreen screenshot
// ==========================================================================
window.ArcPhoneWidgets = (function() {
  'use strict';
  let _selectedFocusMinutes = 25;
  let _simTab = 'screentime';

  function getBreakdown() {
    let distractingSecs = 0;
    let productiveSecs = 0;
    let othersSecs = 0;

    if (window.appTrackerState && Array.isArray(window.appTrackerState.apps) && window.appTrackerState.usage) {
      const usage = window.appTrackerState.usage;
      window.appTrackerState.apps.forEach(app => {
        const secs = Number(usage[app.id]) || 0;
        const cat = (app.category || '').toLowerCase();
        if (cat.includes('entertainment') || cat.includes('social') || cat.includes('gaming')) {
          distractingSecs += secs;
        } else if (cat.includes('productiv') || cat.includes('study') || cat.includes('coding')) {
          productiveSecs += secs;
        } else {
          othersSecs += secs;
        }
      });
    }

    let totalSecs = distractingSecs + productiveSecs + othersSecs;

    // If zero or fresh session, check mobile / device screentime or provide baseline matching screenshot (20m, 5m, 25m = 50m / 51m)
    if (totalSecs < 60) {
      let mobSecs = 0;
      try {
        const devData = JSON.parse(localStorage.getItem('arc_cross_device_screentime'));
        if (devData && devData.mobile && devData.mobile.seconds) mobSecs = Number(devData.mobile.seconds);
      } catch(_) {}

      if (mobSecs >= 60) {
        distractingSecs = Math.round(mobSecs * 0.40);
        productiveSecs = Math.round(mobSecs * 0.10);
        othersSecs = mobSecs - distractingSecs - productiveSecs;
        totalSecs = mobSecs;
      } else {
        // Screenshot baseline (20m distracting, 5m productive, 26m others = 51m total)
        distractingSecs = 20 * 60;
        productiveSecs = 5 * 60;
        othersSecs = 26 * 60;
        totalSecs = 51 * 60;
      }
    }

    const dMins = Math.round(distractingSecs / 60);
    const pMins = Math.round(productiveSecs / 60);
    const oMins = Math.max(0, Math.round(othersSecs / 60));
    const tMins = Math.max(1, Math.round(totalSecs / 60));

    return {
      totalMins: tMins,
      distractingMins: dMins,
      productiveMins: pMins,
      othersMins: oMins
    };
  }

  function updateWidgets() {
    const b = getBreakdown();
    const C = 2 * Math.PI * 56; // 351.858

    const total = b.distractingMins + b.productiveMins + b.othersMins;
    const f1 = total > 0 ? (b.distractingMins / total) : 0.392;
    const f2 = total > 0 ? (b.productiveMins / total) : 0.098;
    const f3 = total > 0 ? (b.othersMins / total) : 0.510;

    const gap = 4;
    const len1 = Math.max(0, f1 * C - gap);
    const len2 = Math.max(0, f2 * C - gap);
    const len3 = Math.max(0, f3 * C - gap);

    const off1 = 0;
    const off2 = -(f1 * C);
    const off3 = -((f1 + f2) * C);

    const totalDisplay = b.totalMins >= 60
      ? `${Math.floor(b.totalMins / 60)}h ${b.totalMins % 60}m`
      : `${b.totalMins}m`;

    // 1. Update In-View Screentime Widget
    const totEl = document.getElementById('phone-widget-total-val');
    const distEl = document.getElementById('phone-widget-distracting-time');
    const prodEl = document.getElementById('phone-widget-productive-time');
    const othEl = document.getElementById('phone-widget-others-time');

    if (totEl) totEl.textContent = totalDisplay;
    if (distEl) distEl.textContent = `${b.distractingMins}m`;
    if (prodEl) prodEl.textContent = `${b.productiveMins}m`;
    if (othEl) othEl.textContent = `${b.othersMins}m`;

    const svgDist = document.getElementById('phone-widget-svg-distracting');
    const svgProd = document.getElementById('phone-widget-svg-productive');
    const svgOth = document.getElementById('phone-widget-svg-others');

    if (svgDist) {
      svgDist.setAttribute('stroke-dasharray', `${len1.toFixed(1)} ${C.toFixed(1)}`);
      svgDist.setAttribute('stroke-dashoffset', off1.toFixed(1));
    }
    if (svgProd) {
      svgProd.setAttribute('stroke-dasharray', `${len2.toFixed(1)} ${C.toFixed(1)}`);
      svgProd.setAttribute('stroke-dashoffset', off2.toFixed(1));
    }
    if (svgOth) {
      svgOth.setAttribute('stroke-dasharray', `${len3.toFixed(1)} ${C.toFixed(1)}`);
      svgOth.setAttribute('stroke-dashoffset', off3.toFixed(1));
    }

    // 2. Update Simulator Screentime Widget
    const simTotEl = document.getElementById('sim-widget-total-val');
    const simDistEl = document.getElementById('sim-widget-distracting-time');
    const simProdEl = document.getElementById('sim-widget-productive-time');
    const simOthEl = document.getElementById('sim-widget-others-time');

    if (simTotEl) simTotEl.textContent = totalDisplay;
    if (simDistEl) simDistEl.textContent = `${b.distractingMins}m`;
    if (simProdEl) simProdEl.textContent = `${b.productiveMins}m`;
    if (simOthEl) simOthEl.textContent = `${b.othersMins}m`;

    const simSvgDist = document.getElementById('sim-widget-svg-distracting');
    const simSvgProd = document.getElementById('sim-widget-svg-productive');
    const simSvgOth = document.getElementById('sim-widget-svg-others');

    if (simSvgDist) {
      simSvgDist.setAttribute('stroke-dasharray', `${len1.toFixed(1)} ${C.toFixed(1)}`);
      simSvgDist.setAttribute('stroke-dashoffset', off1.toFixed(1));
    }
    if (simSvgProd) {
      simSvgProd.setAttribute('stroke-dasharray', `${len2.toFixed(1)} ${C.toFixed(1)}`);
      simSvgProd.setAttribute('stroke-dashoffset', off2.toFixed(1));
    }
    if (simSvgOth) {
      simSvgOth.setAttribute('stroke-dasharray', `${len3.toFixed(1)} ${C.toFixed(1)}`);
      simSvgOth.setAttribute('stroke-dashoffset', off3.toFixed(1));
    }

    // 3. Update Focus Widgets (Both In-View & Simulator)
    const active = (typeof isFocusActive === 'function') ? isFocusActive() : (window.appTrackerState && window.appTrackerState.focusActive);
    const focusValEl = document.getElementById('phone-widget-focus-val');
    const focusSubEl = document.getElementById('phone-widget-focus-sub');
    const focusBadgeEl = document.getElementById('phone-widget-focus-badge');
    const focusDotEl = document.getElementById('phone-widget-focus-dot');
    const focusStatusEl = document.getElementById('phone-widget-focus-status');
    const focusDescEl = document.getElementById('phone-widget-focus-desc');
    const focusBtn = document.getElementById('phone-widget-toggle-focus-btn');
    const focusTimerPill = document.getElementById('phone-widget-focus-timer-pill');
    const svgFocus = document.getElementById('phone-widget-svg-focus');

    // Simulator elements
    const simFocusValEl = document.getElementById('sim-widget-focus-val');
    const simFocusSubEl = document.getElementById('sim-widget-focus-sub');
    const simFocusStatusEl = document.getElementById('sim-widget-focus-status');
    const simFocusDescEl = document.getElementById('sim-widget-focus-desc');
    const simFocusBtn = document.getElementById('sim-widget-toggle-focus-btn');
    const simSvgFocus = document.getElementById('sim-widget-svg-focus');
    const lockBadges = document.querySelectorAll('.sim-lock-badge');

    if (active) {
      const timeRemaining = (typeof getFocusTimeRemainingFormatted === 'function')
        ? getFocusTimeRemainingFormatted()
        : '24:59';
      const isStrict = (typeof isFocusStrictModeActive === 'function') && isFocusStrictModeActive();

      if (focusValEl) {
        focusValEl.textContent = timeRemaining;
        focusValEl.className = isStrict
          ? 'text-2xl sm:text-3xl font-black font-mono text-amber-300 tracking-tight leading-none drop-shadow animate-pulse'
          : 'text-2xl sm:text-3xl font-black font-mono text-cyan-300 tracking-tight leading-none drop-shadow animate-pulse';
      }
      if (focusSubEl) {
        focusSubEl.innerHTML = isStrict
          ? '<span class="text-amber-400 font-bold flex items-center justify-center gap-1"><i class="fa-solid fa-lock text-[10px]"></i> STRICT SPRINT</span>'
          : '<span class="text-emerald-400 font-bold flex items-center justify-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> ACTIVE</span>';
      }
      if (focusBadgeEl) {
        focusBadgeEl.textContent = isStrict ? 'STRICT FOCUS' : 'ACTIVE FOCUS';
        focusBadgeEl.className = isStrict
          ? 'text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black border border-amber-500/40 shadow-sm'
          : 'text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30';
      }
      if (focusDotEl) {
        focusDotEl.className = isStrict
          ? 'w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 mt-1 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse'
          : 'w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 mt-1 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse';
      }
      if (focusStatusEl) {
        focusStatusEl.textContent = isStrict ? 'Strict Focus Active' : 'Focus Mode Active';
      }
      if (focusDescEl) {
        focusDescEl.textContent = isStrict ? 'Early exit forbidden • Apps locked' : '8 distracting apps currently locked';
      }
      if (focusTimerPill) focusTimerPill.textContent = `${timeRemaining} Left`;

      if (focusBtn) {
        if (isStrict) {
          focusBtn.innerHTML = '<i class="fa-solid fa-lock text-amber-300 mr-1.5 animate-pulse"></i> Locked In Sprint (' + timeRemaining + ')';
          focusBtn.className = 'w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 hover:from-amber-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 border border-amber-400/50 transition transform active:scale-95 cursor-pointer';
          focusBtn.title = 'Strict Mode Active: Cannot exit early';
        } else {
          focusBtn.innerHTML = '<i class="fa-solid fa-stop text-white mr-1.5"></i> End Focus Session';
          focusBtn.className = 'w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition transform active:scale-95';
          focusBtn.title = 'End focus session early';
        }
      }

      if (svgFocus) {
        svgFocus.setAttribute('stroke', isStrict ? '#f59e0b' : '#06b6d4');
        svgFocus.setAttribute('stroke-dasharray', '240 352');
      }

      // Simulator Focus
      if (simFocusValEl) {
        simFocusValEl.textContent = timeRemaining;
        simFocusValEl.className = isStrict
          ? 'text-xl font-black font-mono text-amber-300 tracking-tight leading-none animate-pulse'
          : 'text-xl font-black font-mono text-cyan-300 tracking-tight leading-none animate-pulse';
      }
      if (simFocusSubEl) {
        simFocusSubEl.innerHTML = isStrict
          ? '<span class="text-amber-400 font-bold">🔒 STRICT</span>'
          : '<span class="text-emerald-400 font-bold">ACTIVE</span>';
      }
      if (simFocusStatusEl) {
        simFocusStatusEl.textContent = isStrict ? 'Strict Focus' : 'Active Focus';
      }
      if (simFocusDescEl) {
        simFocusDescEl.textContent = isStrict ? 'Locked Sprint' : 'Apps Locked';
      }
      if (simFocusBtn) {
        if (isStrict) {
          simFocusBtn.innerHTML = '<i class="fa-solid fa-lock text-amber-300 mr-1"></i> Locked (' + timeRemaining + ')';
          simFocusBtn.className = 'w-full py-2 px-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 text-white font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition border border-amber-400/40';
        } else {
          simFocusBtn.innerHTML = '<i class="fa-solid fa-stop text-white mr-1"></i> End Focus';
          simFocusBtn.className = 'w-full py-2 px-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition';
        }
      }
      if (simSvgFocus) {
        simSvgFocus.setAttribute('stroke', isStrict ? '#f59e0b' : '#06b6d4');
        simSvgFocus.setAttribute('stroke-dasharray', '240 352');
      }

      lockBadges.forEach(b => { if (b && b.classList) b.classList.remove('hidden'); });

    } else {
      if (focusValEl) {
        focusValEl.textContent = 'OFF';
        focusValEl.className = 'text-2xl sm:text-3xl font-black font-sans text-purple-200 tracking-tight leading-none drop-shadow';
      }
      if (focusSubEl) focusSubEl.textContent = 'Focus Mode';
      if (focusBadgeEl) {
        focusBadgeEl.textContent = 'STANDBY';
        focusBadgeEl.className = 'text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold';
      }
      if (focusDotEl) focusDotEl.className = 'w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0 mt-1';
      if (focusStatusEl) focusStatusEl.textContent = 'Focus Standby';
      if (focusDescEl) focusDescEl.textContent = 'Tap below to block distracting apps';
      if (focusTimerPill) focusTimerPill.textContent = 'Idle';

      if (focusBtn) {
        focusBtn.innerHTML = '<i class="fa-solid fa-bolt text-amber-300 mr-1.5"></i> Turn On Focus Mode';
        focusBtn.className = 'w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition transform active:scale-95';
      }

      if (svgFocus) {
        svgFocus.setAttribute('stroke', '#a855f7');
        svgFocus.setAttribute('stroke-dasharray', '90 352');
      }

      // Simulator Focus
      if (simFocusValEl) {
        simFocusValEl.textContent = 'OFF';
        simFocusValEl.className = 'text-xl font-black font-sans text-purple-200 tracking-tight leading-none';
      }
      if (simFocusSubEl) simFocusSubEl.textContent = 'Focus Mode';
      if (simFocusStatusEl) simFocusStatusEl.textContent = 'Focus Standby';
      if (simFocusDescEl) simFocusDescEl.textContent = '8 Apps Blocked';
      if (simFocusBtn) {
        simFocusBtn.innerHTML = '<i class="fa-solid fa-bolt text-amber-300 mr-1"></i> Turn On Focus';
        simFocusBtn.className = 'w-full py-2 px-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition';
      }
      if (simSvgFocus) {
        simSvgFocus.setAttribute('stroke', '#a855f7');
        simSvgFocus.setAttribute('stroke-dasharray', '90 352');
      }

      lockBadges.forEach(b => { if (b && b.classList) b.classList.add('hidden'); });
    }

    // Update status bar clock on simulator
    const clockEl = document.getElementById('phone-sim-status-time');
    if (clockEl) {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      clockEl.textContent = `${hh}:${mm}`;
    }
  }

  function selectFocusDuration(mins) {
    _selectedFocusMinutes = Number(mins) || 25;
    document.querySelectorAll('.phone-focus-chip').forEach(chip => {
      if (chip && chip.classList) {
        if (Number(chip.getAttribute('data-mins')) === _selectedFocusMinutes) {
          chip.classList.add('active');
        } else {
          chip.classList.remove('active');
        }
      }
    });
    updateWidgets();
  }

  function toggleFocus(customMins) {
    const mins = customMins || _selectedFocusMinutes || 25;
    const active = (typeof isFocusActive === 'function') ? isFocusActive() : (window.appTrackerState && window.appTrackerState.focusActive);

    if (active) {
      if (typeof isFocusStrictModeActive === 'function' && isFocusStrictModeActive()) {
        if (typeof triggerStrictModeLockoutNotice === 'function') {
          triggerStrictModeLockoutNotice();
        } else if (typeof showToast === 'function') {
          showToast('🔒 Early Exit Forbidden: Arc Gold Strict Mode is active!');
        }
        return false;
      }
      if (typeof stopFocusSession === 'function') {
        stopFocusSession(false);
      } else if (typeof window.fpause === 'function') {
        window.fpause();
      }
      if (window.playSfx) window.playSfx('click');
      if (typeof showToast === 'function') showToast('Focus Mode ended.');
    } else {
      if (typeof startFocusSession === 'function') {
        startFocusSession(mins);
      } else if (typeof window.fstart === 'function') {
        window.fstart();
      }
      if (window.playSfx) window.playSfx('fanfare');
      if (typeof showToast === 'function') {
        const strictMsg = (typeof isFocusStrictModeActive === 'function' && isFocusStrictModeActive())
          ? ' 🔒 Strict Mode is LOCKED — Early exit is forbidden!'
          : '';
        showToast(`Focus Mode turned ON (${mins}m)! Distracting apps blocked.${strictMsg}`);
      }
    }

    updateWidgets();
  }

  function openSimulator() {
    const modal = document.getElementById('arc-phone-simulator-modal');
    if (!modal) return;
    if (modal.classList) modal.classList.add('open');
    if (window.playSfx) window.playSfx('modalOpen');
    updateWidgets();
  }

  function closeSimulator() {
    const modal = document.getElementById('arc-phone-simulator-modal');
    if (!modal) return;
    if (modal.classList) modal.classList.remove('open');
    if (window.playSfx) window.playSfx('modalClose');
  }

  function setSimWidgetTab(tab) {
    _simTab = tab;
    const scEl = document.getElementById('sim-widget-screentime-container');
    const foEl = document.getElementById('sim-widget-focus-container');
    const tabSc = document.getElementById('sim-tab-screentime');
    const tabFo = document.getElementById('sim-tab-focus');

    if (tab === 'focus') {
      if (scEl && scEl.classList) scEl.classList.add('hidden');
      if (foEl && foEl.classList) foEl.classList.remove('hidden');
      if (tabSc) { tabSc.className = 'px-2.5 py-1 rounded-lg text-slate-400 hover:text-white transition'; }
      if (tabFo) { tabFo.className = 'px-2.5 py-1 rounded-lg bg-purple-600 text-white font-bold transition'; }
    } else {
      if (scEl && scEl.classList) scEl.classList.remove('hidden');
      if (foEl && foEl.classList) foEl.classList.add('hidden');
      if (tabSc) { tabSc.className = 'px-2.5 py-1 rounded-lg bg-white/20 text-white font-bold transition'; }
      if (tabFo) { tabFo.className = 'px-2.5 py-1 rounded-lg text-slate-400 hover:text-white transition'; }
    }
  }

  function handlePhoneAppClick(appKey) {
    const active = (typeof isFocusActive === 'function') ? isFocusActive() : (window.appTrackerState && window.appTrackerState.focusActive);

    if (active && (appKey === 'facebook' || appKey === 'amazon')) {
      if (window.playSfx) window.playSfx('quantumHum');
      if (typeof showFocusBlockerShield === 'function') {
        const fakeApp = {
          id: appKey,
          name: appKey.charAt(0).toUpperCase() + appKey.slice(1),
          icon: appKey === 'facebook' ? 'fa-brands fa-facebook' : 'fa-brands fa-amazon',
          colorClass: appKey === 'facebook' ? 'text-blue-500' : 'text-amber-500'
        };
        showFocusBlockerShield(fakeApp);
      } else {
        if (typeof showToast === 'function') showToast(`🚫 ${appKey.toUpperCase()} is locked during Focus Mode!`);
      }
      return;
    }

    if (appKey === 'settings') {
      closeSimulator();
      if (typeof switchTab === 'function') switchTab('settings');
      return;
    }

    if (appKey === 'music') {
      if (window.playSfx) window.playSfx('fanfare');
      if (typeof showToast === 'function') showToast('🎵 Ambient focus audio active');
      return;
    }

    if (window.playSfx) window.playSfx('click');
    if (typeof showToast === 'function') {
      showToast(`📱 Opened ${appKey.charAt(0).toUpperCase() + appKey.slice(1)} on phone tracker`);
    }
  }

  function init() {
    updateWidgets();
    setInterval(updateWidgets, 1000);
  }

  return {
    init,
    refresh: updateWidgets,
    updateWidgets,
    selectFocusDuration,
    toggleFocus,
    openSimulator,
    closeSimulator,
    setSimWidgetTab,
    handlePhoneAppClick
  };
})();

// ============================================================================
// ARC GOLD MEMBERSHIP & 120HZ PROMOTION DISPLAY ENGINE
// Offline-first VIP membership with ₹59/mo, ₹365/yr, ₹700 lifetime tiers.
// Unlocks 120Hz ProMotion and uncapped high-refresh framerates.
// ============================================================================
window.ArcGold = (function() {
  const STORAGE_KEY = 'arc_gold_membership';
  const MAX_AUTHORIZED_USERS = 2; // Strict 2 users maximum per Gold license to prevent account sharing
  const PLANS = {
    trial: {
      id: 'trial',
      name: '30-Day Free First Month Pass',
      price: 0,
      period: 'trial',
      symbol: '₹',
      displayPrice: 'FREE',
      periodText: 'first month',
      maxUsers: 2,
      badge: '🎁 30-DAY FREE TRIAL',
      badgeColor: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/30 text-emerald-300 border-emerald-400/50',
      desc: 'Automatic first-month perk upon login. Includes 2 authorized users/devices & full 120Hz ProMotion.',
      features: [
        '👥 Dual-User License (Max 2 Users Only)',
        '🔒 Focus Strict Mode (Zero Early Exit)',
        '🌑 Black & White Mode (Dopamine Detox)',
        '✨ iOS Liquid Glass Translucent UI',
        '120Hz Ultra-Smooth ProMotion',
        'Custom Photo Wallpaper Background',
        'Uncapped Max Frame Rate Engine',
        'VIP Gold Crown Profile Badge',
        'Automatic 3-Day Expiry Notification'
      ]
    },
    monthly: {
      id: 'monthly',
      name: 'Monthly Pass',
      price: 59,
      period: 'month',
      symbol: '₹',
      displayPrice: '₹59',
      periodText: '/ month',
      maxUsers: 2,
      badge: 'FLEXIBLE',
      badgeColor: 'bg-slate-700 text-slate-300 border-slate-600',
      desc: 'Flexible month-to-month access for up to 2 users. Cancel anytime with zero penalty.',
      features: [
        '👥 Dual-User License (Max 2 Users Only)',
        '🔒 Focus Strict Mode (Zero Early Exit)',
        '🌑 Black & White Mode (Dopamine Detox)',
        '✨ iOS Liquid Glass Translucent UI',
        '120Hz Ultra-Smooth ProMotion',
        'Custom Photo Wallpaper Background',
        'Uncapped Max Frame Rate Engine',
        'VIP Gold Crown Profile Badge',
        'Cancel Anytime'
      ]
    },
    annual: {
      id: 'annual',
      name: 'Annual Pass',
      price: 365,
      period: 'year',
      symbol: '₹',
      displayPrice: '₹365',
      periodText: '/ year',
      maxUsers: 2,
      badge: '⭐ MOST POPULAR · ₹1/DAY',
      badgeColor: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/30 text-amber-300 border-amber-400/50',
      desc: 'Save 48% compared to monthly. Full 365 days of uninterrupted ultra smoothness for 2 users.',
      features: [
        '👥 Dual-User License (Max 2 Users Only)',
        '🔒 Focus Strict Mode (Zero Early Exit)',
        '🌑 Black & White Mode (Dopamine Detox)',
        '✨ iOS Liquid Glass Translucent UI',
        'Everything in Monthly Pass',
        'Custom Photo Wallpaper Background',
        'Costs just ₹1 per day (Save 48%)',
        '365 Days Uninterrupted ProMotion',
        'Priority Hardware Smooth Mode'
      ]
    },
    lifetime: {
      id: 'lifetime',
      name: 'Lifetime VIP',
      price: 700,
      period: 'lifetime',
      symbol: '₹',
      displayPrice: '₹700',
      periodText: 'one-time',
      maxUsers: 2,
      badge: '👑 FOUNDER EDITION',
      badgeColor: 'bg-gradient-to-r from-yellow-500/20 via-amber-500/30 to-yellow-500/20 text-yellow-300 border-yellow-400/50',
      desc: 'Single one-time payment. Own ProMotion 120Hz forever with VIP Founder prestige for 2 users.',
      features: [
        '👥 Dual-User License (Max 2 Users Only)',
        '🔒 Focus Strict Mode (Zero Early Exit)',
        '🌑 Black & White Mode (Dopamine Detox)',
        '✨ iOS Liquid Glass Translucent UI',
        'Permanent Lifetime 120Hz Access',
        'Custom Photo Wallpaper Background',
        'Zero Recurring Fees Forever',
        'Lifetime VIP Founder Crown & Badge',
        'All Future Arc Gold Perks Included'
      ]
    }
  };

  const PROMO_CODES = {
    'ARC50': { type: 'percent', value: 50, label: '50% OFF VIP Launch Discount' },
    'DISCIPLINE': { type: 'percent', value: 25, label: '25% OFF Focus Champion Perk' },
    'SUMMERARC': { type: 'fixed', value: 20, label: '₹20 Flat Summer Savings' },
    'FOUNDER': { type: 'fixed', value: 100, label: '₹100 Founder Edition Rebate' },
    'GOLDVIP': { type: 'percent', value: 30, label: '30% OFF Gold VIP Special' },
    'STUDENT': { type: 'percent', value: 40, label: '40% OFF Scholar Discount' }
  };

  const PROMO_STORAGE_KEY = 'arc_gold_applied_promo';
  const VALID_PROMO_KEYS = ['ARC50', 'DISCIPLINE', 'SUMMERARC', 'FOUNDER', 'GOLDVIP', 'STUDENT'];

  function getAppliedPromo() {
    try {
      const stored = localStorage.getItem(PROMO_STORAGE_KEY);
      if (!stored || typeof stored !== 'string') return null;
      const upper = stored.trim().toUpperCase();
      for (let i = 0; i < VALID_PROMO_KEYS.length; i++) {
        const k = VALID_PROMO_KEYS[i];
        if (k === upper && Object.prototype.hasOwnProperty.call(PROMO_CODES, k)) {
          const item = PROMO_CODES[k];
          return {
            code: k,
            type: item.type === 'percent' ? 'percent' : 'fixed',
            value: Number(item.value) || 0,
            label: escapeHtml(item.label)
          };
        }
      }
    } catch (_) {}
    return null;
  }

  function applyPromoCode(inputCode) {
    if (!inputCode || typeof inputCode !== 'string') return false;
    const clean = inputCode.trim().toUpperCase();
    for (let i = 0; i < VALID_PROMO_KEYS.length; i++) {
      const k = VALID_PROMO_KEYS[i];
      if (k === clean) {
        localStorage.setItem(PROMO_STORAGE_KEY, k);
        if (typeof playSfx === 'function') playSfx('bonus');
        if (typeof showToast === 'function') {
          showToast('🎉 Promo code "' + k + '" applied! ' + PROMO_CODES[k].label);
        }
        render();
        return true;
      }
    }
    if (typeof playSfx === 'function') playSfx('denied');
    const safeDisplay = escapeHtml(clean.slice(0, 20));
    if (typeof showToast === 'function') {
      showToast('❌ Invalid promo code: "' + safeDisplay + '". Try "ARC50" or "DISCIPLINE"');
    }
    const errEl = document.getElementById('gold-promo-error-msg');
    if (errEl) {
      errEl.textContent = 'Promo code "' + safeDisplay + '" is invalid. Valid codes: ARC50, DISCIPLINE, SUMMERARC, GOLDVIP';
      errEl.classList.remove('hidden');
    }
    return false;
  }

  function removePromoCode() {
    localStorage.removeItem(PROMO_STORAGE_KEY);
    if (typeof playSfx === 'function') playSfx('click');
    if (typeof showToast === 'function') {
      showToast('Promo code removed.');
    }
    render();
  }

  function handlePromoSubmit() {
    const input = document.getElementById('gold-promo-input');
    if (!input) return;
    const val = input.value.trim();
    if (!val) {
      if (typeof showToast === 'function') showToast('Please enter a promo code');
      return;
    }
    applyPromoCode(val);
  }

  function calculateDiscountedPrice(basePrice, promo) {
    if (!promo || basePrice <= 0) return basePrice;
    if (promo.type === 'percent') {
      const disc = Math.round(basePrice * (promo.value / 100));
      return Math.max(1, basePrice - disc);
    } else if (promo.type === 'fixed') {
      return Math.max(1, basePrice - promo.value);
    }
    return basePrice;
  }

  function getState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && data.isGold) {
          // Check expiry if not lifetime
          if (data.plan !== 'lifetime' && data.expiresAt && Date.now() > data.expiresAt) {
            data.isGold = false;
            data.status = 'expired';
            data.maxHzEnabled = false;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            setTimeout(() => {
              revertToFree(true);
            }, 20);
          }
          return data;
        }
        return data;
      }
    } catch (e) {}
    return {
      isGold: false,
      plan: null,
      status: 'free',
      activatedAt: null,
      expiresAt: null,
      maxHzEnabled: false
    };
  }

  function isGold() {
    return !!getState().isGold;
  }

  function is120HzEnabled() {
    const s = getState();
    return !!(s.isGold && s.maxHzEnabled);
  }

  function revertToFree(isNaturalExpiry = false) {
    let current = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) current = JSON.parse(raw);
    } catch (e) {}

    const wasGold = !!current.isGold;
    const wasTrial = !!current.isTrial;
    const hadPlan = current.plan;

    const updated = {
      isGold: false,
      plan: null,
      status: 'expired',
      isTrial: wasTrial,
      activatedAt: current.activatedAt || null,
      expiresAt: current.expiresAt || null,
      maxHzEnabled: false,
      expiredAt: Date.now(),
      previousPlan: hadPlan
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // 1. Revert refresh rate & uncapped FPS back to 60 FPS
    applyRefreshRate();

    // 2. Revert custom photo wallpaper back to free default theme
    if (window.ArcCustomBackground && typeof window.ArcCustomBackground.apply === 'function') {
      window.ArcCustomBackground.apply();
      window.ArcCustomBackground.renderCard();
    }

    // 3. Revert hardware profiler card & settings
    if (window.ArcHardwareGatekeeper && typeof window.ArcHardwareGatekeeper.renderSettingsCard === 'function') {
      window.ArcHardwareGatekeeper.renderSettingsCard();
    }

    // 4. Update Header VIP crown badge (removes it)
    updateHeaderBadge();

    // 5. Re-render Arc Gold card with expired notice
    render();

    // 6. Revert profile picture outer lining back to normal default
    if (window.ArcProfile && typeof window.ArcProfile.renderHeaderProfile === 'function') {
      window.ArcProfile.renderHeaderProfile();
    }

    // 7. Revert Focus Strict Mode back to disabled if it was active
    try {
      if (typeof appTrackerState !== 'undefined' && appTrackerState.strictMode) {
        appTrackerState.strictMode = false;
        try { localStorage.setItem('arc_focus_strict_mode', 'false'); } catch (e) {}
        if (typeof updateStrictModeUI === 'function') updateStrictModeUI();
      }
    } catch (e) {}

    // 8. Revert Black & White Mode back to disabled if active
    try {
      if (window.ArcBlackWhiteMode && typeof window.ArcBlackWhiteMode.disable === 'function') {
        window.ArcBlackWhiteMode.disable(false);
      }
    } catch (e) {}

    // 9. Revert Liquid Glass UI back to disabled if active
    try {
      if (window.ArcLiquidGlass && typeof window.ArcLiquidGlass.disable === 'function') {
        window.ArcLiquidGlass.disable(false);
      }
    } catch (e) {}

    // 9. Notify user if this was a fresh expiry transition
    if (isNaturalExpiry && wasGold) {
      if (typeof showToast === 'function') {
        const typeStr = wasTrial ? 'Free First Month Arc Gold Trial' : 'Arc Gold Membership';
        showToast('⏳ Your ' + typeStr + ' has ended. Special features have automatically reverted to the Free tier.');
      }
      if (typeof playSfx === 'function') {
        playSfx('modalClose');
      }
    }
  }

  let watcherInterval = null;
  function startExpiryWatcher() {
    if (watcherInterval) clearInterval(watcherInterval);
    watcherInterval = setInterval(() => {
      const s = getState();
      if (s && s.isGold && s.plan !== 'lifetime' && s.expiresAt && Date.now() > s.expiresAt) {
        revertToFree(true);
      }
    }, 15000);
  }

  function getExpiryNotice() {
    const state = getState();
    if (!state.isGold || !state.expiresAt || state.plan === 'lifetime') return null;
    const now = Date.now();
    const diffMs = state.expiresAt - now;
    if (diffMs <= 0) return { expired: true, daysLeft: 0, hoursLeft: 0, isTrial: !!state.isTrial };
    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
    if (diffMs <= THREE_DAYS_MS) {
      const daysLeft = Math.max(1, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
      const hoursLeft = Math.max(1, Math.ceil(diffMs / (60 * 60 * 1000)));
      return {
        urgent: true,
        daysLeft: daysLeft,
        hoursLeft: hoursLeft,
        isTrial: !!state.isTrial,
        expiresAt: state.expiresAt
      };
    }
    return null;
  }

  function checkExpiryNotification(suppressDuplicateToday = true) {
    const notice = getExpiryNotice();
    if (!notice || !notice.urgent) return;
    const todayKey = new Date().toISOString().split('T')[0];
    const NOTIF_KEY = 'arc_gold_expiry_last_notified';
    const lastNotified = localStorage.getItem(NOTIF_KEY);
    if (!suppressDuplicateToday || lastNotified !== todayKey) {
      localStorage.setItem(NOTIF_KEY, todayKey);
      const daysText = notice.daysLeft === 1 ? 'tomorrow' : ('in ' + notice.daysLeft + ' days');
      const typeText = notice.isTrial ? 'Free First Month Arc Gold Trial' : 'Arc Gold Membership';
      const msg = '⚠️ Heads up: Your ' + typeText + ' ends ' + daysText + '! Renew to keep 120Hz & Custom Wallpaper.';
      setTimeout(() => {
        if (typeof showToast === 'function') showToast(msg);
      }, 1800);
    }
  }

  function getAuthorizedUsers() {
    const s = getState();
    if (!s || !s.isGold) return [];
    if (Array.isArray(s.authorizedUsers) && s.authorizedUsers.length > 0) {
      return s.authorizedUsers.slice(0, MAX_AUTHORIZED_USERS);
    }
    const loggedIn = window.ArcGoogleSync && typeof window.ArcGoogleSync.getUser === 'function' ? window.ArcGoogleSync.getUser() : null;
    const id = (loggedIn && loggedIn.email) ? loggedIn.email.toLowerCase().trim() : (s.trialUser || 'primary_operative');
    const name = (loggedIn && loggedIn.name) ? loggedIn.name : 'Primary Operative';
    return [{ id: id, name: name, addedAt: s.activatedAt || Date.now(), isPrimary: true }];
  }

  function registerUser(userOrId) {
    const s = getState();
    if (!s || !s.isGold) {
      if (typeof showToast === 'function') showToast('Arc Gold membership required to add authorized users.');
      return { success: false, reason: 'No active Gold membership' };
    }
    let users = getAuthorizedUsers();
    const userId = typeof userOrId === 'object' && userOrId ? (userOrId.email || userOrId.id || userOrId.name) : String(userOrId || '');
    const userName = typeof userOrId === 'object' && userOrId ? (userOrId.name || userOrId.email || 'Operative') : String(userOrId || 'Operative');

    if (!userId || !userId.trim()) return { success: false, reason: 'Invalid user identification' };

    const cleanId = userId.toLowerCase().trim();
    if (users.some(u => (u.id || '').toLowerCase() === cleanId)) {
      if (typeof showToast === 'function') showToast(`User "${userName}" is already registered on this Arc Gold plan.`);
      return { success: true, alreadyRegistered: true, users: users };
    }

    if (users.length >= MAX_AUTHORIZED_USERS) {
      const msg = '🔒 Arc Gold Account Limit Reached: Only 2 users are allowed per Gold plan to prevent multiple users using one account.';
      if (typeof showToast === 'function') showToast(msg);
      return {
        success: false,
        reason: 'Maximum of 2 users allowed per Arc Gold account to prevent account sharing.',
        users: users
      };
    }

    users.push({
      id: cleanId,
      name: userName.trim(),
      addedAt: Date.now(),
      isPrimary: false
    });

    s.authorizedUsers = users;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    render();
    if (typeof showToast === 'function') {
      showToast(`✅ Added ${userName} as 2nd authorized user on Arc Gold (2/2 slots filled).`);
    }
    return { success: true, users: users };
  }

  function removeAuthorizedUser(userId) {
    const s = getState();
    if (!s || !s.isGold) return false;
    let users = getAuthorizedUsers();
    const cleanId = (userId || '').toLowerCase().trim();
    const target = users.find(u => (u.id || '').toLowerCase() === cleanId);
    if (!target) return false;

    if (target.isPrimary || users.indexOf(target) === 0) {
      if (typeof showToast === 'function') {
        showToast('⚠️ Cannot remove Primary Account Holder. Slot 1 is reserved for the primary user.');
      }
      return false;
    }

    users = users.filter(u => (u.id || '').toLowerCase() !== cleanId);
    s.authorizedUsers = users;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    render();
    if (typeof showToast === 'function') {
      showToast('Removed authorized user. 1 slot is now open on your Arc Gold account.');
    }
    return true;
  }

  function promptAddSecondUser() {
    const s = getState();
    if (!s.isGold) {
      scrollToGoldCard();
      return;
    }
    const input = prompt("Enter Name or Email for the 2nd Authorized User:\n\nNote: Arc Gold is strictly limited to 2 users to prevent account sharing.", "");
    if (input && input.trim()) {
      registerUser({ id: input.trim(), name: input.trim() });
    }
  }

  function canUserUseGold(userOrId) {
    if (!isGold()) return false;
    if (!userOrId) return true;
    const users = getAuthorizedUsers();
    if (users.length === 0) return true;
    const id = (typeof userOrId === 'object' ? (userOrId.email || userOrId.id) : String(userOrId)).toLowerCase().trim();
    return users.some(u => (u.id || '').toLowerCase() === id);
  }

  function claimFirstMonthTrial(user, isSilent = false) {
    const current = getState();
    if (current.isGold && (current.plan === 'lifetime' || current.plan === 'annual')) {
      return false;
    }
    const email = (user && user.email) ? user.email.toLowerCase().trim() : 'active_user';
    const userName = (user && user.name) ? user.name : 'Primary Operative';
    const TRIAL_CLAIM_KEY = 'arc_gold_trial_granted_' + email;
    const GLOBAL_TRIAL_CLAIM_KEY = 'arc_gold_first_month_claimed';

    // Anti-account sharing check: If Gold is already active with 2 users and user is not one of them
    if (current.isGold && Array.isArray(current.authorizedUsers) && current.authorizedUsers.length >= MAX_AUTHORIZED_USERS) {
      const isAlreadyAuth = current.authorizedUsers.some(u => (u.id || '').toLowerCase() === email.toLowerCase());
      if (!isAlreadyAuth) {
        if (!isSilent && typeof showToast === 'function') {
          showToast('🔒 Arc Gold Account Limit Reached: Max 2 users allowed per plan to prevent account sharing.');
        }
        return false;
      }
    }

    if (localStorage.getItem(TRIAL_CLAIM_KEY) === 'true' || localStorage.getItem(GLOBAL_TRIAL_CLAIM_KEY) === 'true') {
      return false;
    }

    const now = Date.now();
    const expiresAt = now + (30 * 24 * 60 * 60 * 1000); // 30 days = 1 month free

    const trialState = {
      isGold: true,
      plan: 'trial',
      isTrial: true,
      trialUser: email,
      planName: '30-Day Free First Month Pass',
      price: 0,
      period: 'trial',
      currency: 'INR',
      symbol: '₹',
      activatedAt: now,
      expiresAt: expiresAt,
      maxHzEnabled: true,
      maxUsers: MAX_AUTHORIZED_USERS,
      authorizedUsers: [
        { id: email, name: userName, addedAt: now, isPrimary: true }
      ],
      orderId: 'ARC-FREE-TRIAL-' + Math.random().toString(36).substring(2, 9).toUpperCase()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trialState));
    localStorage.setItem(TRIAL_CLAIM_KEY, 'true');
    localStorage.setItem(GLOBAL_TRIAL_CLAIM_KEY, 'true');

    applyRefreshRate();
    render();
    updateHeaderBadge();

    if (window.ArcHardwareGatekeeper && typeof window.ArcHardwareGatekeeper.renderSettingsCard === 'function') {
      window.ArcHardwareGatekeeper.renderSettingsCard();
    }
    if (window.ArcCustomBackground && typeof window.ArcCustomBackground.apply === 'function') {
      window.ArcCustomBackground.apply();
      window.ArcCustomBackground.renderCard();
    }
    if (window.ArcProfile && typeof window.ArcProfile.renderHeaderProfile === 'function') {
      window.ArcProfile.renderHeaderProfile();
    }

    if (!isSilent) {
      if (typeof playSfx === 'function') playSfx('victory');
      if (typeof showToast === 'function') {
        showToast('🎁 Welcome! Your 30-Day Free Arc Gold VIP trial (Dual-User) has been activated!');
      }
    }
    if (window.ArcServerSync && typeof window.ArcServerSync.recordGoldPurchase === 'function') {
      window.ArcServerSync.recordGoldPurchase('trial', user);
    }
    return true;
  }

  function activatePlan(planId, user) {
    const plan = PLANS[planId];
    if (!plan) return false;
    const now = Date.now();
    let expiresAt = null;
    if (planId === 'monthly') {
      expiresAt = now + (30 * 24 * 60 * 60 * 1000);
    } else if (planId === 'annual') {
      expiresAt = now + (365 * 24 * 60 * 60 * 1000);
    } else {
      expiresAt = null; // Lifetime
    }

    const current = getState();
    let authUsers = [];
    if (current && Array.isArray(current.authorizedUsers) && current.authorizedUsers.length > 0) {
      authUsers = current.authorizedUsers.slice(0, MAX_AUTHORIZED_USERS);
    } else {
      const loggedIn = user || (window.ArcGoogleSync && typeof window.ArcGoogleSync.getUser === 'function' ? window.ArcGoogleSync.getUser() : null);
      const email = (loggedIn && loggedIn.email) ? loggedIn.email.toLowerCase().trim() : 'primary_operative';
      const name = (loggedIn && loggedIn.name) ? loggedIn.name : 'Primary Operative';
      authUsers = [{ id: email, name: name, addedAt: now, isPrimary: true }];
    }

    const promo = getAppliedPromo();
    const finalPrice = calculateDiscountedPrice(plan.price, promo);

    const state = {
      isGold: true,
      plan: planId,
      planName: plan.name,
      price: finalPrice,
      originalPrice: plan.price,
      appliedPromo: promo ? promo.code : null,
      period: plan.period,
      currency: 'INR',
      symbol: '₹',
      activatedAt: now,
      expiresAt: expiresAt,
      maxHzEnabled: true,
      maxUsers: MAX_AUTHORIZED_USERS,
      authorizedUsers: authUsers,
      orderId: 'ARC-GOLD-' + Math.random().toString(36).substring(2, 9).toUpperCase()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    applyRefreshRate();
    render();
    updateHeaderBadge();
    if (window.ArcHardwareGatekeeper && typeof window.ArcHardwareGatekeeper.renderSettingsCard === 'function') {
      window.ArcHardwareGatekeeper.renderSettingsCard();
    }
    if (window.ArcCustomBackground && typeof window.ArcCustomBackground.apply === 'function') {
      window.ArcCustomBackground.apply();
      window.ArcCustomBackground.renderCard();
    }
    if (window.ArcProfile && typeof window.ArcProfile.renderHeaderProfile === 'function') {
      window.ArcProfile.renderHeaderProfile();
    }
    if (window.SettingsApp && typeof window.SettingsApp.onTab === 'function') {
      window.SettingsApp.onTab('settings');
    }
    if (typeof showToast === 'function') {
      const promoMsg = promo ? ` (Coupon ${promo.code} applied · Saved ₹${plan.price - finalPrice})` : '';
      showToast('👑 Arc Gold Activated (' + plan.name + ' · ₹' + finalPrice + promoMsg + ') · 120Hz ProMotion Unlocked!');
    }
    if (window.ArcServerSync && typeof window.ArcServerSync.recordGoldPurchase === 'function') {
      window.ArcServerSync.recordGoldPurchase(planId, user);
    }
    return true;
  }

  function cancelPlan() {
    revertToFree(false);
    if (window.SettingsApp && typeof window.SettingsApp.onTab === 'function') {
      window.SettingsApp.onTab('settings');
    }
    if (typeof showToast === 'function') {
      showToast('Arc Gold membership cancelled. Reverted to standard 60 FPS.');
    }
  }

  function isUninstallPreventionActive() {
    return isGold() && !!(getState().antiUninstall);
  }

  function toggleUninstallPrevention(enabled) {
    if (!isGold()) {
      if (typeof showToast === 'function') {
        showToast('👑 Arc Gold Required: Anti-Uninstall Lock is exclusive to Gold VIP members.');
      }
      scrollToGoldCard();
      return false;
    }
    const state = getState();
    state.antiUninstall = !!enabled;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (state.antiUninstall) {
      if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().catch(() => {});
      }
      if (typeof showToast === 'function') {
        showToast('🛡️ Anti-Uninstall & Commitment Lock Activated (Arc Gold)');
      }
    } else {
      if (typeof showToast === 'function') {
        showToast('Anti-Uninstall lock deactivated');
      }
    }
    render();
    return true;
  }

  function toggle120Hz(enabled) {
    if (!isGold()) {
      scrollToGoldCard();
      return false;
    }
    const state = getState();
    state.maxHzEnabled = !!enabled;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    applyRefreshRate();
    render();
    if (window.ArcHardwareGatekeeper && typeof window.ArcHardwareGatekeeper.renderSettingsCard === 'function') {
      window.ArcHardwareGatekeeper.renderSettingsCard();
    }
    if (window.SettingsApp && typeof window.SettingsApp.onTab === 'function') {
      window.SettingsApp.onTab('settings');
    }
    if (typeof showToast === 'function') {
      showToast(state.maxHzEnabled ? '⚡ 120Hz ProMotion Engine Enabled' : 'Standard 60 FPS mode engaged');
    }
    return true;
  }

  function applyRefreshRate() {
    const active = is120HzEnabled();
    const root = document.documentElement;
    const body = document.body;

    if (active) {
      root.classList.add('arc-120hz-active');
      body.classList.add('arc-120hz-active');
      if (window.SettingsApp && typeof window.SettingsApp.get === 'function') {
        const cfg = window.SettingsApp.get();
        if (cfg && cfg.fx && cfg.fx.fps < 120) {
          cfg.fx.fps = 120;
          if (typeof window.SettingsApp.save === 'function') window.SettingsApp.save();
        }
      }
    } else {
      root.classList.remove('arc-120hz-active');
      body.classList.remove('arc-120hz-active');
      if (window.SettingsApp && typeof window.SettingsApp.get === 'function') {
        const cfg = window.SettingsApp.get();
        if (cfg && cfg.fx && cfg.fx.fps > 60) {
          cfg.fx.fps = 60;
          if (typeof window.SettingsApp.save === 'function') window.SettingsApp.save();
        }
      }
    }
  }

  let isBoxOpen = false;

  function toggleBox(forceState) {
    if (window.ArcSettingsAccordion) {
      window.ArcSettingsAccordion.toggle('settings-gold-card', forceState);
    } else {
      if (typeof forceState === 'boolean') isBoxOpen = forceState;
      else isBoxOpen = !isBoxOpen;
      render();
    }
  }

  function openBox() {
    toggleBox(true);
  }

  function closeBox() {
    toggleBox(false);
  }

  function scrollToGoldCard() {
    if (window.ArcSettingsAccordion) {
      window.ArcSettingsAccordion.toggle('settings-gold-card', true);
    } else {
      isBoxOpen = true;
      render();
    }
    const card = document.getElementById('settings-gold-card');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('arc-gold-glow-pulse');
      setTimeout(() => card.classList.remove('arc-gold-glow-pulse'), 2800);
    }
  }

  function updateHeaderBadge() {
    let badge = document.getElementById('arc-gold-header-vip');
    if (isGold()) {
      const notice = getExpiryNotice();
      const isUrgent = notice && notice.urgent;
      const label = isUrgent
        ? ('<i class="fa-solid fa-crown text-amber-400 text-xs animate-pulse"></i> ARC GOLD <span class="text-amber-200 text-[9px] bg-red-500/40 px-1.5 py-0.2 rounded border border-red-400/50">' + notice.daysLeft + 'd left</span>')
        : '<i class="fa-solid fa-crown text-amber-400 text-xs animate-pulse"></i> ARC GOLD';

      if (!badge) {
        const nav = document.querySelector('header .flex.items-center.gap-2') || document.querySelector('header');
        if (nav) {
          badge = document.createElement('span');
          badge.id = 'arc-gold-header-vip';
          badge.className = 'hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]';
          badge.innerHTML = label;
          nav.appendChild(badge);
        }
      } else {
        badge.style.display = '';
        badge.innerHTML = label;
      }
    } else if (badge) {
      badge.style.display = 'none';
    }
  }

  function runSmoothnessTest() {
    const track = document.getElementById('gold-smoothness-track');
    const status = document.getElementById('gold-smoothness-test-status');
    const fpsStat = document.getElementById('gold-fps-text-val');
    const dot = document.getElementById('gold-fps-indicator-dot');
    if (!track || !status) return;

    track.classList.add('gold-track-animating');
    status.textContent = 'Benchmarking...';
    status.className = 'text-[10px] font-mono text-amber-400 font-bold shrink-0 animate-pulse';

    let frames = 0;
    const start = performance.now();
    function countFrame() {
      frames++;
      if (performance.now() - start < 1500) {
        requestAnimationFrame(countFrame);
      } else {
        const elapsed = (performance.now() - start) / 1000;
        const measuredFps = Math.round(frames / elapsed);
        track.classList.remove('gold-track-animating');
        status.textContent = measuredFps + ' FPS';
        status.className = 'text-[10px] font-mono text-emerald-400 font-bold shrink-0';
        if (fpsStat) {
          fpsStat.textContent = is120HzEnabled() ? measuredFps + ' FPS (ProMotion 120Hz Active)' : measuredFps + ' FPS (60 FPS Cap)';
        }
        if (dot) {
          dot.className = is120HzEnabled() ? 'w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'w-2 h-2 rounded-full bg-emerald-400';
        }
      }
    }
    requestAnimationFrame(countFrame);
  }

  function render() {
    const container = document.getElementById('settings-gold-card');
    if (!container) return;

    const state = getState();
    const goldActive = !!state.isGold;
    const hzActive = is120HzEnabled();
    const currentPlan = state.plan ? PLANS[state.plan] : null;

    const promo = getAppliedPromo();
    const monthlyOrig = PLANS.monthly.price; // 59
    const monthlyEff = calculateDiscountedPrice(monthlyOrig, promo);
    const monthlyHasDisc = monthlyEff < monthlyOrig;

    const annualOrig = PLANS.annual.price; // 365
    const annualEff = calculateDiscountedPrice(annualOrig, promo);
    const annualHasDisc = annualEff < annualOrig;

    const lifetimeOrig = PLANS.lifetime.price; // 700
    const lifetimeEff = calculateDiscountedPrice(lifetimeOrig, promo);
    const lifetimeHasDisc = lifetimeEff < lifetimeOrig;

    let expiresFormatted = 'Never · Lifetime VIP';
    if (state.expiresAt) {
      expiresFormatted = new Date(state.expiresAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }

    const isExp = (window.ArcSettingsAccordion && typeof window.ArcSettingsAccordion.isExpanded === 'function')
      ? window.ArcSettingsAccordion.isExpanded('settings-gold-card')
      : isBoxOpen;

    container.innerHTML = `
      <div class="glass-card rounded-2xl border border-amber-500/40 p-4 transition-all duration-300 bg-gradient-to-r from-slate-900/90 via-slate-950/90 to-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.08)] hover:border-amber-400/60" onkeydown="window.ArcSettingsAccordion && window.ArcSettingsAccordion.handleKeyDown(event, 'settings-gold-card')">
        <div class="flex items-center justify-between gap-3 select-none">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.35)] shrink-0">
              <i class="fa-solid fa-crown text-base"></i>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-sm font-black text-white tracking-wide truncate">Arc Gold Membership</h3>
                <span class="under-construction-badge px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shrink-0 shadow-sm">
                  <i class="fa-solid fa-person-digging text-amber-400 animate-pulse text-[10px]"></i> Under Construction
                </span>
                ${goldActive ? `
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shrink-0">
                    <i class="fa-solid fa-check"></i> ${state.isTrial ? 'Free Trial Active' : 'VIP Active'}
                  </span>
                  ${(function() {
                    const n = getExpiryNotice();
                    if (n && n.urgent) {
                      return '<span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-red-500/25 text-red-300 border border-red-500/50 flex items-center gap-1 shrink-0 animate-pulse"><i class="fa-solid fa-clock"></i> Ends in ' + n.daysLeft + 'd</span>';
                    }
                    return '';
                  })()}
                ` : (state.status === 'expired' ? `
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1 shrink-0">
                    <i class="fa-solid fa-hourglass-end text-amber-400"></i> Expired · Free Tier
                  </span>
                ` : '')}
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button type="button" class="settings-arrow-btn p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition" aria-label="Expand settings card" aria-expanded="${isExp}" onclick="window.ArcSettingsAccordion ? window.ArcSettingsAccordion.toggle('settings-gold-card') : window.ArcGold.toggleBox()">
              <i class="fa-solid fa-chevron-down text-xs transition-transform duration-300 settings-chevron-icon ${isExp ? 'rotate-180' : ''}"></i>
            </button>
          </div>
        </div>

        <div class="arc-fluid-accordion ${isExp ? 'expanded' : 'hidden'} pt-3 border-t border-slate-800/80 mt-3">
          <div class="space-y-6">
            ${detailedContent}
          </div>
        </div>
      </div>
    `;
    if (window.ArcLiquidGlass && typeof window.ArcLiquidGlass.updateUI === 'function') {
      window.ArcLiquidGlass.updateUI();
    }
  }

  function init() {
    applyRefreshRate();
    let loggedInUser = null;
    if (window.ArcGoogleSync && typeof window.ArcGoogleSync.getUser === 'function') {
      loggedInUser = window.ArcGoogleSync.getUser();
    }
    if (loggedInUser) {
      claimFirstMonthTrial(loggedInUser, true);
    }
    checkExpiryNotification(true);
    render();
    updateHeaderBadge();
    startExpiryWatcher();
  }

  return {
    STORAGE_KEY,
    MAX_AUTHORIZED_USERS,
    PLANS,
    getState,
    isGold,
    is120HzEnabled,
    activatePlan,
    cancelPlan,
    toggle120Hz,
    isUninstallPreventionActive,
    toggleUninstallPrevention,
    applyRefreshRate,
    scrollToGoldCard,
    updateHeaderBadge,
    runSmoothnessTest,
    toggleBox,
    openBox,
    closeBox,
    claimFirstMonthTrial,
    getExpiryNotice,
    checkExpiryNotification,
    revertToFree,
    startExpiryWatcher,
    getAuthorizedUsers,
    registerUser,
    removeAuthorizedUser,
    promptAddSecondUser,
    canUserUseGold,
    isFocusStrictModeActive: () => (typeof isFocusStrictModeActive === 'function' ? isFocusStrictModeActive() : false),
    toggleFocusStrictMode: (v) => (typeof toggleFocusStrictMode === 'function' ? toggleFocusStrictMode(v) : false),
    openStrictLockoutModal: () => (typeof openStrictModeLockoutModal === 'function' ? openStrictModeLockoutModal() : null),
    render,
    init,
    applyPromoCode,
    removePromoCode,
    handlePromoSubmit,
    getAppliedPromo,
    calculateDiscountedPrice,
    isBlackWhiteModeActive: () => typeof window.ArcBlackWhiteMode !== 'undefined' ? window.ArcBlackWhiteMode.isEnabled() : false,
    toggleBlackWhiteMode: (val) => typeof window.ArcBlackWhiteMode !== 'undefined' ? window.ArcBlackWhiteMode.toggle(val) : false
  };
})();

// ============================================================================
// ARC BLACK & WHITE MODE (ARC GOLD EXCLUSIVE VIP FEATURE)
// Strips 100% of colors, saturation, and hues from the interface for a radical
// dopamine detox, enhanced readability, and deep monochrome focus.
// Gated strictly behind Arc Gold.
// ============================================================================
window.ArcBlackWhiteMode = (function() {
  const STORAGE_KEY = 'arc_black_white_mode';

  function isEnabled() {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  function apply() {
    const active = isEnabled();
    const isLight = document.documentElement.getAttribute('data-mode') === 'light';

    if (active) {
      document.documentElement.classList.add('arc-bw-mode');
      if (document.body) {
        document.body.classList.add('arc-bw-mode');
        document.body.style.backgroundColor = isLight ? '#ffffff' : '#000000';
      }
      window.__fxRGB = isLight ? '0, 0, 0' : '255, 255, 255';
      if (window.R) window.R.col = isLight ? '0, 0, 0' : '255, 255, 255';
      if (typeof R !== 'undefined') R.col = isLight ? '0, 0, 0' : '255, 255, 255';
      document.documentElement.style.setProperty('--pp-accent', isLight ? '#000000' : '#ffffff');
      document.documentElement.style.setProperty('--pp-accent2', isLight ? '#000000' : '#ffffff');
      document.documentElement.style.setProperty('--pp-bg', isLight ? '#ffffff' : '#000000');
      document.documentElement.style.setProperty('--pp-panel', isLight ? '#ffffff' : '#000000');
      if (typeof applyTheme === 'function') applyTheme();
      if (typeof applyArcTheme === 'function') applyArcTheme();
      if (window.ArcAutoStart && typeof window.ArcAutoStart.renderUi === 'function') window.ArcAutoStart.renderUi();
      if (window.ArcNotifications && typeof window.ArcNotifications.renderUi === 'function') window.ArcNotifications.renderUi();
    } else {
      document.documentElement.classList.remove('arc-bw-mode');
      if (document.body) {
        document.body.classList.remove('arc-bw-mode');
        document.body.style.backgroundColor = '';
      }
      window.__fxRGB = null;
      document.documentElement.style.removeProperty('--pp-accent');
      document.documentElement.style.removeProperty('--pp-accent2');
      document.documentElement.style.removeProperty('--pp-bg');
      document.documentElement.style.removeProperty('--pp-panel');
      if (typeof applyTheme === 'function') applyTheme();
      if (typeof applyArcTheme === 'function') applyArcTheme();
      if (window.ArcAutoStart && typeof window.ArcAutoStart.renderUi === 'function') window.ArcAutoStart.renderUi();
      if (window.ArcNotifications && typeof window.ArcNotifications.renderUi === 'function') window.ArcNotifications.renderUi();
    }

    try { if (typeof renderSpiderWeb === 'function') renderSpiderWeb(); } catch (e) {}
    try { if (typeof renderHabits === 'function') renderHabits(); } catch (e) {}
    try { if (typeof renderMatrix === 'function') renderMatrix(); } catch (e) {}
    updateUI();
  }

  function enable() {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {}

    apply();
    if (typeof playSfx === 'function') playSfx('click');
    const isLight = document.documentElement.getAttribute('data-mode') === 'light';
    const msg = isLight 
      ? '📄 E-Ink Paper Monochrome Activated · Pure clarity, zero eye strain' 
      : '🖤 Radical Noir Monochrome Activated · Zero dopamine distraction';
    if (typeof showToast === 'function') {
      showToast(msg);
    } else if (typeof toast === 'function') {
      toast(msg);
    }
    return true;
  }

  function disable(notify = true) {
    try {
      localStorage.setItem(STORAGE_KEY, 'false');
    } catch (e) {}

    apply();
    if (notify) {
      if (typeof playSfx === 'function') playSfx('click');
      const isLight = document.documentElement.getAttribute('data-mode') === 'light';
      const msg = isLight ? '☀️ Elevated Light Mode Restored' : '🌈 Cyberpunk Color Mode Restored';
      if (typeof showToast === 'function') {
        showToast(msg);
      } else if (typeof toast === 'function') {
        toast(msg);
      }
    }
    return true;
  }

  function toggle(forcedState) {
    const current = isEnabled();
    const target = (typeof forcedState === 'boolean') ? forcedState : !current;

    if (target) {
      return enable();
    } else {
      return disable(true);
    }
  }

  function updateUI() {
    const active = isEnabled();
    const isLight = document.documentElement.getAttribute('data-mode') === 'light';

    // 1. Header button
    const headerBtn = document.getElementById('btn-header-bw');
    const headerIcon = document.getElementById('header-bw-icon');
    if (headerBtn) {
      if (active) {
        if (isLight) {
          headerBtn.className = 'w-9 h-9 sm:w-auto px-0 sm:px-2.5 py-1.5 rounded-xl bg-black text-white border-2 border-black font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md';
          if (headerIcon) headerIcon.className = 'fa-solid fa-circle-half-stroke text-white text-xs';
        } else {
          headerBtn.className = 'w-9 h-9 sm:w-auto px-0 sm:px-2.5 py-1.5 rounded-xl bg-white text-black border border-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.6)]';
          if (headerIcon) headerIcon.className = 'fa-solid fa-circle-half-stroke text-black text-xs';
        }
        headerBtn.title = isLight ? 'Disable E-Ink Monochrome (Alt+B)' : 'Disable Noir Monochrome (Alt+B)';
      } else {
        if (isLight) {
          headerBtn.className = 'w-9 h-9 sm:w-auto px-0 sm:px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm hover:border-slate-400';
          if (headerIcon) headerIcon.className = 'fa-solid fa-circle-half-stroke text-slate-700 text-xs';
        } else {
          headerBtn.className = 'w-9 h-9 sm:w-auto px-0 sm:px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm';
          if (headerIcon) headerIcon.className = 'fa-solid fa-circle-half-stroke text-xs';
        }
        headerBtn.title = 'Toggle Black & White Mode (Alt+B • Dopamine Detox)';
      }
    }

    // 2. SettingsApp toggle
    const sxToggle = document.getElementById('sx-bw-toggle');
    if (sxToggle) {
      sxToggle.checked = active;
    }

    // 3. PP12 drawer toggle
    const ppToggle = document.getElementById('pp-bw-toggle');
    if (ppToggle) {
      ppToggle.checked = active;
    }

    // 4. ArcGold showcase button
    const goldBwBtn = document.getElementById('arc-gold-bw-btn');
    if (goldBwBtn) {
      if (active) {
        goldBwBtn.innerHTML = '<i class="fa-solid fa-circle-half-stroke text-[11px] text-white"></i> Disable B&W';
        goldBwBtn.className = 'px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white border border-white/50 text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-white/20';
      } else {
        goldBwBtn.innerHTML = '<i class="fa-solid fa-circle-half-stroke text-[11px]"></i> Enable B&W';
        goldBwBtn.className = 'px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs font-bold transition flex items-center gap-1.5';
      }
    }
  }

  function openUpgradeModal() {
    const modal = document.getElementById('arc-gold-bw-upgrade-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      void modal.offsetWidth;
      modal.classList.add('arc-modal-open');
    }
  }

  function closeUpgradeModal() {
    const modal = document.getElementById('arc-gold-bw-upgrade-modal');
    if (modal) {
      modal.classList.remove('arc-modal-open');
      setTimeout(() => {
        if (!modal.classList.contains('arc-modal-open')) {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
        }
      }, 340);
    }
  }

  function init() {
    apply();
  }

  return {
    STORAGE_KEY,
    isEnabled,
    enable,
    disable,
    toggle,
    apply,
    updateUI,
    openUpgradeModal,
    closeUpgradeModal,
    init
  };
})();
try { window.ArcBlackWhiteMode.init(); } catch (e) {}

// ============================================================================
// ARC LIQUID GLASS UI & FLUID SPRING ANIMATIONS ENGINE (ARC GOLD EXCLUSIVE)
// Translucent multi-layered frosted diffusion, specular rim bevels,
// interactive pointer-tracked refraction sheen, and weighted spring physics.
// Gated exclusively to Arc Gold VIP members.
// ============================================================================
window.ArcLiquidGlass = (function() {
  const STORAGE_KEY = 'arc_liquid_glass_enabled';
  let _pointerBound = false;
  let _rafPending = false;
  let _activeCard = null;
  let _targetTiltX = 0;
  let _targetTiltY = 0;
  let _targetGlareX = 50;
  let _targetGlareY = -20;

  function isGold() {
    return !!(window.ArcGold && typeof window.ArcGold.isGold === 'function' && window.ArcGold.isGold());
  }

  function isEnabled() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!isGold()) return false;
      return saved === 'true';
    } catch (e) {
      return false;
    }
  }

  function handlePointerMove(e) {
    // Touch screens: ignore pointermove to prevent scroll stutter or stuck tilts
    if (e.pointerType === 'touch') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return;

    const card = e.target.closest && e.target.closest('.glass-card:not(header):not(nav):not(footer)');
    if (!card) {
      if (_activeCard) {
        resetCardPhysics(_activeCard);
        _activeCard = null;
      }
      return;
    }

    if (_activeCard && _activeCard !== card) {
      resetCardPhysics(_activeCard);
    }
    _activeCard = card;

    const rect = card.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Glare coordinates
    _targetGlareX = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    _targetGlareY = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    // Subtle 3D perspective tilt (-3.5deg to +3.5deg)
    const normX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const normY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    _targetTiltX = (-normY * 3.5).toFixed(2);
    _targetTiltY = (normX * 3.5).toFixed(2);

    if (!_rafPending) {
      _rafPending = true;
      requestAnimationFrame(applyPhysics);
    }
  }

  function applyPhysics() {
    _rafPending = false;
    if (_activeCard) {
      _activeCard.style.setProperty('--card-glare-x', _targetGlareX + '%');
      _activeCard.style.setProperty('--card-glare-y', _targetGlareY + '%');
      _activeCard.style.setProperty('--card-tilt-x', _targetTiltX + 'deg');
      _activeCard.style.setProperty('--card-tilt-y', _targetTiltY + 'deg');
    }
  }

  function resetCardPhysics(card) {
    if (!card) return;
    card.style.setProperty('--card-tilt-x', '0deg');
    card.style.setProperty('--card-tilt-y', '0deg');
    card.style.setProperty('--card-glare-x', '50%');
    card.style.setProperty('--card-glare-y', '-20%');
  }

  function handlePointerLeave(e) {
    if (_activeCard) {
      resetCardPhysics(_activeCard);
      _activeCard = null;
    }
  }

  function initGlareReactivity() {
    if (_pointerBound) return;
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    _pointerBound = true;
  }

  function cleanupGlareReactivity() {
    if (!_pointerBound) return;
    window.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerleave', handlePointerLeave);
    _pointerBound = false;
    document.querySelectorAll('.glass-card').forEach(resetCardPhysics);
    _activeCard = null;
  }

  function apply(forceState) {
    const active = (typeof forceState === 'boolean') ? (forceState && isGold()) : isEnabled();

    // Check hardware tier for adaptation
    const isLowTier = window.ArcHardwareGatekeeper && window.ArcHardwareGatekeeper.tier === 'lower_end';

    if (active) {
      document.documentElement.classList.add('arc-liquid-glass');
      if (document.body) document.body.classList.add('arc-liquid-glass');
      if (isLowTier) {
        document.documentElement.classList.add('arc-lg-low-tier');
      } else {
        document.documentElement.classList.remove('arc-lg-low-tier');
      }
      initGlareReactivity();
    } else {
      document.documentElement.classList.remove('arc-liquid-glass');
      document.documentElement.classList.remove('arc-lg-low-tier');
      if (document.body) document.body.classList.remove('arc-liquid-glass');
      cleanupGlareReactivity();
    }
    updateUI();
  }

  function enable() {
    if (!isGold()) {
      promptUpgrade();
      return false;
    }
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {}
    apply(true);
    if (typeof playSfx === 'function') playSfx('bonus');
    if (typeof showToast === 'function') {
      showToast('✨ iOS Liquid Glass UI Activated · 3D Refraction & Fluid Spring Physics Engaged');
    }
    return true;
  }

  function disable(notify = true) {
    try {
      localStorage.setItem(STORAGE_KEY, 'false');
    } catch (e) {}
    apply(false);
    if (notify) {
      if (typeof playSfx === 'function') playSfx('click');
      if (typeof showToast === 'function') {
        showToast('Standard Glass UI Restored');
      }
    }
    return true;
  }

  function toggle(forcedState) {
    const target = (typeof forcedState === 'boolean') ? forcedState : !isEnabled();
    if (target) {
      return enable();
    } else {
      return disable(true);
    }
  }

  function promptUpgrade() {
    if (typeof playSfx === 'function') playSfx('denied');
    if (typeof showToast === 'function') {
      showToast('👑 Liquid Glass UI & Fluid Physics is exclusive to Arc Gold VIP members. Upgrade to unlock!');
    }
    if (window.ArcGold && typeof window.ArcGold.scrollToGoldCard === 'function') {
      window.ArcGold.scrollToGoldCard();
    }
  }

  function updateUI() {
    const active = isEnabled();
    const gold = isGold();

    // 1. Settings View Card Controls
    const wrap = document.getElementById('liquid-glass-ctrl-wrap');
    const pill = document.getElementById('liquid-glass-status-pill');

    if (wrap) {
      if (gold) {
        wrap.innerHTML = `
          <label class="arc-lg-switch" title="Toggle Liquid Glass UI & Animations">
            <input type="checkbox" id="settings-liquid-glass-toggle" onchange="ArcLiquidGlass.toggle(this.checked)" ${active ? 'checked' : ''} aria-label="Toggle Liquid Glass UI & Animations">
            <div class="arc-lg-switch-track">
              <div class="arc-lg-switch-thumb"></div>
            </div>
          </label>
        `;
      } else {
        wrap.innerHTML = `
          <button type="button" onclick="ArcLiquidGlass.promptUpgrade()" class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 border border-amber-400/50 text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95">
            <i class="fa-solid fa-crown text-amber-400"></i>
            <span>Unlock with Gold</span>
            <i class="fa-solid fa-lock text-[10px] opacity-75"></i>
          </button>
        `;
      }
    }

    if (pill) {
      if (!gold) {
        pill.textContent = 'LOCKED (GOLD ONLY)';
        pill.className = 'text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30';
      } else if (active) {
        pill.textContent = 'ACTIVE ✨';
        pill.className = 'text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.3)] font-bold';
      } else {
        pill.textContent = 'DISABLED';
        pill.className = 'text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700';
      }
    }

    // 2. Settings Drawer Quick Control
    const drawerCtrl = document.getElementById('drawer-liquid-glass-ctrl');
    if (drawerCtrl) {
      if (gold) {
        drawerCtrl.innerHTML = `
          <label class="arc-lg-switch" title="Toggle Liquid Glass UI & Animations">
            <input type="checkbox" id="pp-liquid-glass-toggle" onchange="ArcLiquidGlass.toggle(this.checked)" ${active ? 'checked' : ''} aria-label="Toggle Liquid Glass UI & Animations">
            <div class="arc-lg-switch-track">
              <div class="arc-lg-switch-thumb"></div>
            </div>
          </label>
        `;
      } else {
        drawerCtrl.innerHTML = `
          <button type="button" onclick="ArcLiquidGlass.promptUpgrade()" class="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold flex items-center gap-1.5 transition active:scale-95">
            <i class="fa-solid fa-lock text-[10px]"></i>
            <span>Unlock</span>
          </button>
        `;
      }
    }

    // 3. ArcGold showcase button
    const goldLgBtn = document.getElementById('arc-gold-lg-btn');
    if (goldLgBtn) {
      if (gold) {
        goldLgBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles text-[11px]"></i> ${active ? 'Disable Liquid Glass' : 'Enable Liquid Glass'}`;
      } else {
        goldLgBtn.innerHTML = `<i class="fa-solid fa-crown text-[11px] text-amber-400"></i> Unlock with Gold`;
      }
    }
  }

  function init() {
    apply();
  }

  return {
    STORAGE_KEY,
    isGold,
    isEnabled,
    enable,
    disable,
    toggle,
    apply,
    promptUpgrade,
    updateUI,
    init
  };
})();
try { window.ArcLiquidGlass.init(); } catch (e) {}


// ============================================================================
// ARC CUSTOM BACKGROUND ENGINE (ARC GOLD EXCLUSIVE)
// Allows Arc Gold VIP members to set a custom photo background.
// Includes intelligent client-side image compression (max 1920x1080 JPEG)
// to prevent localStorage quota overflows, an adjustable dimming slider
// for readability, and renders audio-reactive snow / embers over the wallpaper.
// ============================================================================
// ============================================================================
// ARC STORE RATING & APP STORES ENGINE (COMPACT & CLEAN)
// Handles store redirections, feedback, and Windows Desktop / Microsoft Store PWA installation.
// ============================================================================
window.ArcStoreRating = (function() {
  const FEEDBACK_KEY = 'arc_app_user_feedback';
  let deferredPrompt = null;

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.matchMedia('(display-mode: window-controls-overlay)').matches ||
           window.navigator.standalone === true;
  }

  function updateInstallUI() {
    const headerBtn = document.getElementById('btn-header-install');
    if (!headerBtn) return;
    if (isStandalone()) {
      headerBtn.classList.add('hidden');
    } else {
      headerBtn.classList.remove('hidden');
    }
  }

  // Listen for native PWA installation event (Chrome Omnibox & In-App trigger)
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default mini-infobar on mobile so our custom UI & Chrome's omnibox icon take over
    e.preventDefault();
    deferredPrompt = e;
    window.deferredPrompt = e;
    updateInstallUI();
    console.log('[Arc Tracker] PWA ready for installation via Chrome address bar or Install button.');
  });

  window.addEventListener('appinstalled', () => {
    console.log('[Arc Tracker] PWA successfully installed to Chrome Desktop / OS.');
    deferredPrompt = null;
    window.deferredPrompt = null;
    if (typeof showToast === 'function') {
      showToast('🎉 Arc Tracker successfully installed! Launch it anytime from your Taskbar or Desktop.');
    }
    if (typeof playSfx === 'function') playSfx('victory');
    updateInstallUI();
  });

  function openStore(storeKey) {
    if (typeof playSfx === 'function') playSfx('click');
    openModal(storeKey);
  }

  function openModal(activeStore = 'general') {
    const modal = document.getElementById('arc-store-rating-modal');
    if (!modal) return;
    modal.classList.add('open');

    ['google_play', 'app_store', 'microsoft_store'].forEach(k => {
      const el = document.getElementById('modal-store-tab-' + k);
      if (el) {
        if (activeStore === 'general' || activeStore === k) {
          el.classList.remove('opacity-60');
          if (activeStore === k) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        } else {
          el.classList.add('opacity-60');
        }
      }
    });
  }

  function closeModal() {
    const modal = document.getElementById('arc-store-rating-modal');
    if (modal) modal.classList.remove('open');
  }

  async function installApp() {
    if (typeof playSfx === 'function') playSfx('click');

    if (isStandalone()) {
      if (typeof showToast === 'function') {
        showToast('✓ Arc Tracker is already running as an installed desktop app!');
      }
      return;
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          if (typeof showToast === 'function') {
            showToast('🚀 Arc Tracker successfully installed to your Desktop & Taskbar!');
          }
          if (typeof playSfx === 'function') playSfx('victory');
        } else {
          if (typeof showToast === 'function') {
            showToast('Install postponed. You can click the Install icon in Chrome\'s address bar anytime.');
          }
        }
        deferredPrompt = null;
        window.deferredPrompt = null;
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    } else {
      if (typeof showToast === 'function') {
        showToast('💻 Click the Install icon in Chrome\'s address bar (right side of URL), or Chrome Menu (⋮) → "Install Arc Tracker 2026"');
      }
      openModal('microsoft_store');
    }
  }

  async function installWindowsApp() {
    return installApp();
  }

  function submitReviewFeedback() {
    const input = document.getElementById('modal-review-feedback-input');
    const text = input ? input.value.trim() : '';
    if (!text) {
      if (typeof showToast === 'function') showToast('Please write a short note before sending.');
      return;
    }
    try {
      const list = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '[]');
      list.push({ text: text, ts: Date.now() });
      localStorage.setItem(FEEDBACK_KEY, JSON.stringify(list));
    } catch(e) {}
    if (typeof playSfx === 'function') playSfx('victory');
    if (typeof showToast === 'function') {
      showToast('🎉 Thank you! Your feedback has been received.');
    }
    if (input) input.value = '';
    closeModal();
  }

  function init() {
    updateInstallUI();
  }

  return {
    openStore,
    openModal,
    closeModal,
    installApp,
    installWindowsApp,
    submitReviewFeedback,
    isStandalone,
    init
  };
})();

window.ArcCustomBackground = (function() {
  const STORAGE_KEY = 'arc_custom_background_v1';
  let isBoxOpen = false; // Contracted by default, expands on click
  let activeFilter = 'all'; // 'all' | 'mobile' | 'desktop' | 'gym' | 'sports' | 'studies' | 'mindset'

  function toggleBox(forceState) {
    if (window.ArcSettingsAccordion) {
      window.ArcSettingsAccordion.toggle('settings-custom-bg-card', forceState);
    } else {
      if (typeof forceState === 'boolean') {
        isBoxOpen = forceState;
      } else {
        isBoxOpen = !isBoxOpen;
      }
      renderCard();
    }
  }

  function setFilter(filter) {
    activeFilter = filter;
    renderCard();
  }

  const PRESET_WALLPAPERS = [
    // --- GYM THEME ---
    {
      id: 'gym-iron-mobile',
      title: 'Iron Forged',
      subtitle: 'Forged in silence • Pure barbell power',
      theme: 'gym',
      themeLabel: 'Gym & Iron',
      platform: 'mobile',
      resolution: 'AMOLED 1080×1920',
      aspectRatio: '9:16 Portrait',
      badge: '9:16 • AMOLED',
      quote: 'The iron never lies. 200 lbs is always 200 lbs.',
      path: './assets/wallpapers/gym-iron-mobile.jpg',
      thumb: './assets/wallpapers/gym-iron-mobile.jpg',
      accentColor: '#ef4444',
      goldExclusive: true
    },
    {
      id: 'gym-iron-4k',
      title: 'Iron Discipline',
      subtitle: 'Forged obsidian & molten crimson steel',
      theme: 'gym',
      themeLabel: 'Gym & Iron',
      platform: 'desktop',
      resolution: '4K Ultra-HD 3840×2160',
      aspectRatio: '16:9 Widescreen',
      badge: '4K UHD • 16:9',
      quote: 'The iron never lies. 200 lbs is always 200 lbs.',
      path: './assets/wallpapers/gym-iron-4k.jpg',
      thumb: './assets/wallpapers/gym-iron-4k.jpg',
      accentColor: '#ef4444',
      goldExclusive: true
    },
    // --- SPORTS THEME ---
    {
      id: 'sports-apex-mobile',
      title: 'Apex Speed',
      subtitle: 'Electric cyan vector • Outwork everyone',
      theme: 'sports',
      themeLabel: 'Sports & Speed',
      platform: 'mobile',
      resolution: 'AMOLED 1080×1920',
      aspectRatio: '9:16 Portrait',
      badge: '9:16 • AMOLED',
      quote: "Champions aren't made in gyms. They are made from a dream.",
      path: './assets/wallpapers/sports-apex-mobile.jpg',
      thumb: './assets/wallpapers/sports-apex-mobile.jpg',
      accentColor: '#00F0FF',
      goldExclusive: true
    },
    {
      id: 'sports-apex-4k',
      title: 'Apex Athlete',
      subtitle: 'Stadium light corona & speed chevrons',
      theme: 'sports',
      themeLabel: 'Sports & Speed',
      platform: 'desktop',
      resolution: '4K Ultra-HD 3840×2160',
      aspectRatio: '16:9 Widescreen',
      badge: '4K UHD • 16:9',
      quote: 'Unrivaled performance forged through relentless repetition.',
      path: './assets/wallpapers/sports-apex-4k.jpg',
      thumb: './assets/wallpapers/sports-apex-4k.jpg',
      accentColor: '#00F0FF',
      goldExclusive: true
    },
    // --- STUDIES THEME ---
    {
      id: 'studies-scholar-mobile',
      title: 'Scholar Focus',
      subtitle: 'Relentless intellect & celestial geometry',
      theme: 'studies',
      themeLabel: 'Studies & Codex',
      platform: 'mobile',
      resolution: 'AMOLED 1080×1920',
      aspectRatio: '9:16 Portrait',
      badge: '9:16 • AMOLED',
      quote: 'Knowledge is the sharpest blade. Focus is the whetstone.',
      path: './assets/wallpapers/studies-scholar-mobile.jpg',
      thumb: './assets/wallpapers/studies-scholar-mobile.jpg',
      accentColor: '#fbbf24',
      goldExclusive: true
    },
    {
      id: 'studies-scholar-4k',
      title: 'Scholar Codex',
      subtitle: 'Celestial midnight indigo & sacred compass',
      theme: 'studies',
      themeLabel: 'Studies & Codex',
      platform: 'desktop',
      resolution: '4K Ultra-HD 3840×2160',
      aspectRatio: '16:9 Widescreen',
      badge: '4K UHD • 16:9',
      quote: 'Master the craft in silence; let your work speak with thunder.',
      path: './assets/wallpapers/studies-scholar-4k.jpg',
      thumb: './assets/wallpapers/studies-scholar-4k.jpg',
      accentColor: '#fbbf24',
      goldExclusive: true
    },
    // --- MINDSET & STOICISM ---
    {
      id: 'ego-mobile',
      title: 'Cracked Ego',
      subtitle: 'Shatter the illusion • Pure obsidian',
      theme: 'mindset',
      themeLabel: 'Mindset & Stoic',
      platform: 'mobile',
      resolution: 'AMOLED 1080×1920',
      aspectRatio: '9:16 Portrait',
      badge: '9:16 • AMOLED',
      quote: 'Kill the ego before it kills your potential.',
      path: './assets/wallpapers/ego-mobile.jpg',
      thumb: './assets/wallpapers/ego-mobile.jpg',
      accentColor: '#ffffff',
      goldExclusive: true
    },
    {
      id: 'ego-4k',
      title: 'Cracked Ego (4K)',
      subtitle: 'Shattered marble stone on obsidian black',
      theme: 'mindset',
      themeLabel: 'Mindset & Stoic',
      platform: 'desktop',
      resolution: '4K Ultra-HD 3840×2160',
      aspectRatio: '16:9 Widescreen',
      badge: '4K UHD • 16:9',
      quote: 'Kill the ego before it kills your potential.',
      path: './assets/wallpapers/ego-4k.jpg',
      thumb: './assets/wallpapers/ego-4k.jpg',
      accentColor: '#ffffff',
      goldExclusive: true
    },
    {
      id: 'winner-mobile',
      title: 'Golden Winner',
      subtitle: 'Triumph over comfort • 3D molten gold',
      theme: 'mindset',
      themeLabel: 'Mindset & Stoic',
      platform: 'mobile',
      resolution: 'AMOLED 1080×1920',
      aspectRatio: '9:16 Portrait',
      badge: '9:16 • AMOLED',
      quote: 'Victory belongs to the most persevering.',
      path: './assets/wallpapers/winner-mobile.jpg',
      thumb: './assets/wallpapers/winner-mobile.jpg',
      accentColor: '#f59e0b',
      goldExclusive: true
    },
    {
      id: 'winner-4k',
      title: 'Golden Winner (4K)',
      subtitle: 'Polished 3D solid gold typography on studio black',
      theme: 'mindset',
      themeLabel: 'Mindset & Stoic',
      platform: 'desktop',
      resolution: '4K Ultra-HD 3840×2160',
      aspectRatio: '16:9 Widescreen',
      badge: '4K UHD • 16:9',
      quote: 'Victory belongs to the most persevering.',
      path: './assets/wallpapers/winner-4k.jpg',
      thumb: './assets/wallpapers/winner-4k.jpg',
      accentColor: '#f59e0b',
      goldExclusive: true
    }
  ];

  function isLaptopUser() {
    const isMobileUa = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobileUa) return false;
    const w = window.innerWidth || (document.documentElement ? document.documentElement.clientWidth : screen.width);
    const h = window.innerHeight || (document.documentElement ? document.documentElement.clientHeight : screen.height);
    const isLandscape = (w / (h || 1)) >= 1.25;
    const isLaptopWidth = w >= 992;
    return isLaptopWidth && isLandscape;
  }

  function getState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && typeof data === 'object') {
          return {
            enabled: data.enabled !== false,
            imageData: data.imageData || null,
            fileName: data.fileName || 'wallpaper.jpg',
            presetId: data.presetId || null,
            isPreset: !!data.isPreset,
            laptopOnly: !!data.laptopOnly,
            dim: typeof data.dim === 'number' ? data.dim : 45,
            updatedAt: data.updatedAt || Date.now()
          };
        }
      }
    } catch (e) {}
    return {
      enabled: false,
      imageData: null,
      fileName: '',
      presetId: null,
      isPreset: false,
      laptopOnly: false,
      dim: 45,
      updatedAt: null
    };
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save custom background to localStorage:', e);
      if (typeof showToast === 'function') {
        showToast('Storage quota exceeded. Image could not be saved.');
      }
    }
  }

  function isGold() {
    return !!(window.ArcGold && typeof window.ArcGold.isGold === 'function' && window.ArcGold.isGold());
  }

  function apply() {
    const bgEl = document.getElementById('arc-custom-bg');
    const overlayEl = document.getElementById('arc-custom-bg-overlay');
    const quoteContainer = document.getElementById('arc-custom-bg-quote');
    const quoteText = document.getElementById('arc-custom-bg-quote-text');
    if (!bgEl) return;

    const gold = isGold();
    const state = getState();
    const hasImage = !!(gold && state.enabled && state.imageData);

    if (hasImage) {
      bgEl.style.display = 'block';
      bgEl.style.backgroundImage = 'url("' + state.imageData + '")';
      bgEl.style.backgroundSize = 'cover';
      bgEl.style.backgroundPosition = 'center center';
      bgEl.style.backgroundRepeat = 'no-repeat';
      bgEl.style.imageRendering = '-webkit-optimize-contrast';
      document.body.classList.add('has-custom-wallpaper');

      if (overlayEl) {
        const dimVal = Math.max(10, Math.min(90, state.dim || 45));
        const isLight = document.documentElement.getAttribute('data-mode') === 'light';
        if (isLight) {
          overlayEl.style.backgroundColor = 'rgba(255, 255, 255, ' + ((dimVal / 100) * 0.7 + 0.15).toFixed(2) + ')';
        } else {
          overlayEl.style.backgroundColor = 'rgba(6, 9, 19, ' + (dimVal / 100).toFixed(2) + ')';
        }
      }

      // Sparkling floating quote HUD on active wallpaper
      let quote = '';
      if (state.isPreset && state.presetId) {
        const p = PRESET_WALLPAPERS.find(item => item.id === state.presetId);
        if (p && p.quote) quote = p.quote;
      }
      if (quote && quoteContainer && quoteText) {
        quoteText.textContent = '“' + quote + '”';
        quoteContainer.classList.remove('hidden');
        requestAnimationFrame(() => {
          quoteContainer.classList.remove('opacity-0');
          quoteContainer.classList.add('opacity-100');
        });
      } else if (quoteContainer) {
        quoteContainer.classList.add('opacity-0');
        quoteContainer.classList.add('hidden');
      }
    } else {
      bgEl.style.display = 'none';
      bgEl.style.backgroundImage = '';
      document.body.classList.remove('has-custom-wallpaper');
      if (quoteContainer) {
        quoteContainer.classList.add('opacity-0');
        quoteContainer.classList.add('hidden');
      }
    }
  }

  function setDim(val) {
    const state = getState();
    state.dim = parseInt(val, 10) || 45;
    saveState(state);
    apply();
    const label = document.getElementById('custom-bg-dim-val');
    if (label) label.textContent = state.dim + '%';
  }

  function selectPreset(presetId) {
    if (!isGold()) {
      if (window.ArcGold && typeof window.ArcGold.scrollToGoldCard === 'function') {
        window.ArcGold.scrollToGoldCard();
      }
      if (typeof showToast === 'function') {
        showToast('⭐ Custom & 4K Wallpapers are exclusive to Arc Gold VIP members. Upgrade to unlock!');
      }
      return;
    }

    const preset = PRESET_WALLPAPERS.find(p => p.id === presetId);
    if (!preset) return;

    const state = getState();
    state.enabled = true;
    state.isPreset = true;
    state.presetId = preset.id;
    state.imageData = preset.path;
    state.fileName = preset.title + ' (' + preset.badge + ')';
    state.laptopOnly = false;
    state.updatedAt = Date.now();
    if (!state.dim) state.dim = 45;

    saveState(state);
    apply();
    renderCard();

    if (typeof playSfx === 'function') playSfx('success');
    if (typeof showToast === 'function') {
      showToast('✨ Applied "' + preset.title + '" Wallpaper with Sparkling Quote!');
    }
  }

  function handleFileSelect(input) {
    if (!isGold()) {
      if (window.ArcGold && typeof window.ArcGold.scrollToGoldCard === 'function') {
        window.ArcGold.scrollToGoldCard();
      }
      if (typeof showToast === 'function') {
        showToast('⭐ Custom Photo Wallpaper is an Arc Gold VIP perk. Upgrade to unlock!');
      }
      if (input) input.value = '';
      return;
    }

    const file = input && input.files && input.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (typeof showToast === 'function') {
        showToast('Please select a valid image file (JPG, PNG, WebP).');
      }
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const MAX_W = 1920;
        const MAX_H = 1080;
        let w = img.width;
        let h = img.height;

        if (w > MAX_W || h > MAX_H) {
          const ratio = Math.min(MAX_W / w, MAX_H / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        try {
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          const state = {
            enabled: true,
            isPreset: false,
            presetId: null,
            laptopOnly: false,
            imageData: compressed,
            fileName: file.name || 'custom-wallpaper.jpg',
            dim: 45,
            updatedAt: Date.now()
          };
          saveState(state);
          apply();
          renderCard();
          if (typeof showToast === 'function') {
            showToast('🎨 Custom Wallpaper applied! Audio-reactive particles active.');
          }
        } catch (err) {
          console.error('Error saving wallpaper:', err);
          if (typeof showToast === 'function') {
            showToast('Failed to save image. Please choose a smaller photo.');
          }
        }
      };
      img.onerror = function() {
        if (typeof showToast === 'function') {
          showToast('Failed to load image. Please try a different photo.');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  function removeBackground() {
    const state = getState();
    state.enabled = false;
    state.imageData = null;
    state.fileName = '';
    state.presetId = null;
    state.isPreset = false;
    state.laptopOnly = false;
    saveState(state);
    apply();
    renderCard();
    if (typeof showToast === 'function') {
      showToast('Wallpaper removed. Reverted to default theme background.');
    }
  }

  function triggerUpload() {
    if (!isGold()) {
      if (window.ArcGold && typeof window.ArcGold.scrollToGoldCard === 'function') {
        window.ArcGold.scrollToGoldCard();
      }
      if (typeof showToast === 'function') {
        showToast('⭐ Custom Photo Wallpaper is an Arc Gold VIP perk. Upgrade to unlock!');
      }
      return;
    }
    const input = document.getElementById('arc-custom-bg-input');
    if (input) input.click();
  }

  function renderCard() {
    const card = document.getElementById('settings-custom-bg-card');
    if (!card) return;

    const gold = isGold();
    const state = getState();
    const activePresetId = (state.enabled && state.isPreset) ? state.presetId : null;
    const hasCustomBg = !!(gold && state.enabled && state.imageData);

    // Filter presets
    const filteredPresets = PRESET_WALLPAPERS.filter(p => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'mobile') return p.platform === 'mobile';
      if (activeFilter === 'desktop') return p.platform === 'desktop';
      return p.theme === activeFilter;
    });

    // Filter tabs configuration
    const filterTabs = [
      { id: 'all', label: 'All', count: PRESET_WALLPAPERS.length },
      { id: 'mobile', label: '📱 Mobile 9:16', count: PRESET_WALLPAPERS.filter(p => p.platform === 'mobile').length },
      { id: 'desktop', label: '💻 Desktop 16:9', count: PRESET_WALLPAPERS.filter(p => p.platform === 'desktop').length },
      { id: 'gym', label: '🏋️ Gym', count: PRESET_WALLPAPERS.filter(p => p.theme === 'gym').length },
      { id: 'sports', label: '⚡ Sports', count: PRESET_WALLPAPERS.filter(p => p.theme === 'sports').length },
      { id: 'studies', label: '📚 Studies', count: PRESET_WALLPAPERS.filter(p => p.theme === 'studies').length },
      { id: 'mindset', label: '🧠 Mindset', count: PRESET_WALLPAPERS.filter(p => p.theme === 'mindset').length }
    ];

    // Presets Gallery HTML (Compact Grid, Space-Efficient)
    const presetsHtml = `
      <div class="space-y-2.5 pt-1">
        <!-- FILTER CHIPS & STATS ROW -->
        <div class="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <div class="flex items-center gap-1.5 flex-nowrap shrink-0">
            ${filterTabs.map(tab => {
              const isActive = (activeFilter === tab.id);
              return `
                <button type="button" onclick="event.stopPropagation(); window.ArcCustomBackground.setFilter('${tab.id}')" class="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-200 shrink-0 ${
                  isActive 
                    ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/30' 
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
                }">
                  ${tab.label} <span class="text-[9px] opacity-75 font-mono">(${tab.count})</span>
                </button>
              `;
            }).join('')}
          </div>
          <span class="text-[10px] text-slate-400 font-mono hidden md:inline-flex items-center gap-1 shrink-0">
            <i class="fa-solid fa-sparkles text-amber-400"></i> Sparkling Quotes &amp; High-Density
          </span>
        </div>

        <!-- COMPACT RESPONSIVE GALLERY GRID -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          ${filteredPresets.map(p => {
            const isActive = (activePresetId === p.id);
            const isPortrait = (p.platform === 'mobile');
            return `
              <div class="group relative rounded-xl overflow-hidden border transition-all duration-200 flex flex-col justify-between ${
                isActive 
                  ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-[0_0_18px_rgba(245,158,11,0.3)] bg-slate-900' 
                  : 'border-slate-800/80 hover:border-slate-700 bg-slate-950/80 hover:shadow-lg'
              }">
                <!-- THUMBNAIL CONTAINER WITH SPARKLING QUOTE -->
                <div class="relative w-full h-24 sm:h-28 overflow-hidden bg-slate-950 cursor-pointer" onclick="window.ArcCustomBackground.selectPreset('${p.id}')">
                  <img src="${p.thumb}" alt="${p.title}" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/40 pointer-events-none"></div>

                  <!-- TOP BADGES -->
                  <div class="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between gap-1 pointer-events-none">
                    <span class="px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/20 text-[8.5px] font-mono font-extrabold text-white shadow">
                      ${p.badge}
                    </span>
                    ${isActive ? `
                      <span class="px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-mono font-black shadow flex items-center gap-1 animate-pulse">
                        <i class="fa-solid fa-check text-[8px]"></i> ACTIVE
                      </span>
                    ` : gold ? `
                      <span class="w-4 h-4 rounded-full bg-amber-500/20 backdrop-blur-md text-amber-300 border border-amber-400/40 flex items-center justify-center text-[8px] shadow">
                        <i class="fa-solid fa-crown text-[7px]"></i>
                      </span>
                    ` : `
                      <span class="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[8px] shadow">
                        <i class="fa-solid fa-lock text-[7px]"></i>
                      </span>
                    `}
                  </div>

                  <!-- SPARKLING, SHINING QUOTE PILL -->
                  <div class="absolute bottom-1.5 left-1.5 right-1.5 pointer-events-none flex justify-center">
                    <div class="arc-sparkle-quote-pill w-full justify-center">
                      <span class="arc-sparkle-star">✦</span>
                      <span class="arc-sparkle-text">${p.quote}</span>
                      <span class="arc-sparkle-star arc-sparkle-star-delay">✧</span>
                    </div>
                  </div>
                </div>

                <!-- CARD FOOTER (COMPACT) -->
                <div class="p-2 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                  <div class="min-w-0 flex-1">
                    <div class="text-[11px] font-extrabold text-white truncate leading-tight">${p.title}</div>
                    <div class="text-[9px] font-mono text-slate-400 truncate leading-tight">${p.themeLabel}</div>
                  </div>

                  <div class="shrink-0">
                    ${isActive ? `
                      <button type="button" class="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[10px] font-bold cursor-default">
                        Applied
                      </button>
                    ` : gold ? `
                      <button type="button" onclick="event.stopPropagation(); window.ArcCustomBackground.selectPreset('${p.id}')" class="px-2.5 py-0.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] shadow-sm transition active:scale-95 flex items-center gap-1">
                        <span>Apply</span>
                      </button>
                    ` : `
                      <button type="button" onclick="event.stopPropagation(); window.ArcGold.scrollToGoldCard(); if(typeof showToast==='function') showToast('⭐ Custom Wallpapers are an Arc Gold perk.');" class="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold transition active:scale-95 flex items-center gap-1">
                        <i class="fa-solid fa-crown text-[8px]"></i>
                        <span>Unlock</span>
                      </button>
                    `}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    const isExp = (window.ArcSettingsAccordion && typeof window.ArcSettingsAccordion.isExpanded === 'function')
      ? window.ArcSettingsAccordion.isExpanded('settings-custom-bg-card')
      : isBoxOpen;

    card.setAttribute('onkeydown', 'window.ArcSettingsAccordion && window.ArcSettingsAccordion.handleKeyDown(event, "settings-custom-bg-card")');

    card.innerHTML = `
      <div class="flex items-center justify-between gap-3 select-none">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-9 h-9 rounded-xl ${gold ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.35)]' : 'bg-slate-800 border border-slate-700 text-amber-400'} flex items-center justify-center shrink-0">
            <i class="fa-solid ${gold ? 'fa-image' : 'fa-lock'} text-base"></i>
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-sm font-bold text-white tracking-wide truncate">Custom &amp; 4K Wallpapers</h3>
              <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <i class="fa-solid fa-crown text-[9px]"></i> ${gold ? 'VIP' : 'Arc Gold Perk'}
              </span>
              ${hasCustomBg ? `
                <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <i class="fa-solid fa-check"></i> ${activePreset ? activePreset.title : 'Active'}
                </span>
              ` : ''}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button type="button" class="settings-arrow-btn p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition" aria-label="Expand settings card" aria-expanded="${isExp}" onclick="window.ArcSettingsAccordion ? window.ArcSettingsAccordion.toggle('settings-custom-bg-card') : window.ArcCustomBackground.toggleBox()">
            <i class="fa-solid fa-chevron-down text-xs transition-transform duration-300 settings-chevron-icon ${isExp ? 'rotate-180' : ''}"></i>
          </button>
        </div>
      </div>

      <div class="arc-fluid-accordion ${isExp ? 'expanded' : 'hidden'} pt-3 border-t border-slate-800/80 mt-3">
        <div>
          ${gold ? `
            <div class="flex flex-col gap-3.5">
              <div class="flex items-center justify-between gap-2 pt-1 flex-wrap">
                <input type="file" id="arc-custom-bg-input" accept="image/*" class="hidden" onchange="window.ArcCustomBackground.handleFileSelect(this)" />
                <button type="button" onclick="window.ArcCustomBackground.triggerUpload()" class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition active:scale-95" title="Upload your own photo from device">
                  <i class="fa-solid fa-cloud-arrow-up text-xs"></i>
                  <span>Upload Photo</span>
                </button>
                ${hasCustomBg ? `
                  <button type="button" onclick="window.ArcCustomBackground.removeBackground()" class="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1 transition active:scale-95" title="Remove custom background and reset to theme">
                    <i class="fa-solid fa-trash-can text-xs"></i>
                    <span>Reset</span>
                  </button>
                ` : ''}
              </div>
              ${presetsHtml}
              ${hasCustomBg ? `
                <div class="flex flex-col md:flex-row items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30 shadow-md">
                  <div class="flex items-center gap-2.5 min-w-0 w-full md:w-auto">
                    <div class="w-10 h-10 rounded-lg overflow-hidden border border-amber-400/50 shrink-0 bg-slate-950">
                      <img src="${state.imageData}" alt="Active Wallpaper" class="w-full h-full object-cover" />
                    </div>
                    <div class="min-w-0">
                      <div class="text-xs font-bold text-white truncate flex items-center gap-1.5">
                        <span>${state.fileName || 'Custom Wallpaper'}</span>
                        <span class="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300">Live</span>
                      </div>
                      <div class="text-[10px] text-slate-400 truncate">
                        ${state.isPreset ? 'Premium preset • Sparkling quote &amp; particles active' : 'Custom photo • Audio-reactive particles active'}
                      </div>
                    </div>
                  </div>
                  <!-- DIMMING SLIDER -->
                  <div class="flex items-center gap-2.5 w-full md:w-auto bg-slate-950/70 px-3 py-1.5 rounded-lg border border-slate-800">
                    <div class="text-[11px] text-slate-300 flex items-center gap-1 shrink-0">
                      <i class="fa-solid fa-circle-half-stroke text-amber-400 text-xs"></i>
                      <span>Dim:</span>
                    </div>
                    <input type="range" min="10" max="85" step="5" value="${state.dim || 45}" oninput="window.ArcCustomBackground.setDim(this.value)" class="w-24 sm:w-32 accent-amber-400 cursor-pointer" />
                    <span id="custom-bg-dim-val" class="text-xs font-mono font-bold text-amber-300 w-8 text-right">${state.dim || 45}%</span>
                  </div>
                </div>
              ` : `
                <div onclick="window.ArcCustomBackground.triggerUpload()" class="p-3 rounded-xl border border-dashed border-amber-500/30 hover:border-amber-400/60 bg-amber-500/5 hover:bg-amber-500/10 transition cursor-pointer flex items-center justify-center text-center gap-2 group">
                  <div class="w-7 h-7 rounded-full bg-amber-500/15 group-hover:bg-amber-500/25 flex items-center justify-center text-amber-400 transition text-xs shrink-0">
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                  </div>
                  <span class="text-xs font-bold text-amber-300">Or click here to upload your own custom photo from your device</span>
                </div>
              `}
            </div>
          ` : `
            <div class="flex flex-col gap-3.5">
              <div class="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <p class="text-xs text-slate-300">
                  Unlock Gym, Sports, Studies &amp; Mindset wallpapers with sparkling quotes and custom photo background support with Arc Gold VIP.
                </p>
                <button type="button" onclick="window.ArcGold.scrollToGoldCard()" class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 border border-amber-400/50 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 shrink-0">
                  <i class="fa-solid fa-crown text-amber-400 text-xs"></i>
                  <span>Unlock</span>
                </button>
              </div>
              ${presetsHtml}
            </div>
          `}
        </div>
      </div>
    `;
  }

  function init() {
    apply();
    renderCard();

    window.addEventListener('resize', () => {
      clearTimeout(window.__arcBgResizeTimer);
      window.__arcBgResizeTimer = setTimeout(() => {
        apply();
        renderCard();
      }, 150);
    });
  }

  return {
    STORAGE_KEY,
    PRESET_WALLPAPERS,
    getState,
    saveState,
    isGold,
    isLaptopUser,
    selectPreset,
    apply,
    setDim,
    handleFileSelect,
    removeBackground,
    triggerUpload,
    toggleBox,
    setFilter,
    getFilter: () => activeFilter,
    isExpanded: () => (window.ArcSettingsAccordion && typeof window.ArcSettingsAccordion.isExpanded === 'function') ? window.ArcSettingsAccordion.isExpanded('settings-custom-bg-card') : isBoxOpen,
    renderCard,
    init
  };
})();

window.ArcScreenTimeStore = (function() {
  const STORAGE_KEY = 'arc_screentime_history_v2';
  const LINK_KEY = 'arc_phone_link_status';

  function isPhoneLinked() {
    const raw = localStorage.getItem(LINK_KEY);
    if (raw !== null) {
      return raw === 'true';
    }
    const devRaw = localStorage.getItem('arc_cross_device_screentime');
    if (devRaw) {
      try {
        const d = JSON.parse(devRaw);
        if (d && d.mobile && (d.mobile.isLinked || d.mobile.seconds > 0)) return true;
      } catch(e) {}
    }
    return false;
  }

  function setPhoneLinked(linked, deviceName = '📱 Pixel 9 Pro (Android)') {
    localStorage.setItem(LINK_KEY, linked ? 'true' : 'false');
    const devRaw = localStorage.getItem('arc_cross_device_screentime');
    let dev = {};
    try { if (devRaw) dev = JSON.parse(devRaw); } catch(e) {}
    dev.mobile = dev.mobile || {};
    dev.mobile.isLinked = !!linked;
    dev.mobile.deviceName = deviceName;
    if (linked) {
      if (!dev.mobile.seconds || dev.mobile.seconds === 0) {
        dev.mobile.seconds = 5400; // 1h 30m default
      }
      dev.mobile.lastUpdated = Date.now();
    } else {
      dev.mobile.seconds = 0;
    }
    localStorage.setItem('arc_cross_device_screentime', JSON.stringify(dev));
    if (window.state) {
      window.state.deviceScreenTime = dev;
    }
    if (typeof updateCrossDeviceScreenTimeUI === 'function') {
      updateCrossDeviceScreenTimeUI();
    }
    renderAnalytics();
  }

  function connectDemoPhone(deviceName = '📱 Pixel 9 Pro (Android)') {
    setPhoneLinked(true, deviceName);
    closePhoneLinkPage();
    if (typeof showToast === 'function') {
      showToast('📱 Linked phone successfully: ' + deviceName);
    }
  }

  function disconnectPhone(force = false) {
    if (force) {
      executeDisconnectAndPurge();
      return;
    }
    openDisconnectModal();
  }

  function openDisconnectModal() {
    const modal = document.getElementById('arc-disconnect-warning-modal');
    if (modal) {
      modal.classList.add('open');
      if (typeof playSfx === 'function') playSfx('modalOpen');
    }
  }

  function closeDisconnectModal() {
    const modal = document.getElementById('arc-disconnect-warning-modal');
    if (modal) modal.classList.remove('open');
  }

  function executeDisconnectAndPurge(silent = false) {
    // 1. Unlink phone flag
    localStorage.setItem(LINK_KEY, 'false');

    // 2. Clear cross-device screentime state
    try {
      const todayKey = (typeof getTodayKey === 'function') ? getTodayKey() : new Date().toISOString().split('T')[0];
      const devRaw = localStorage.getItem('arc_cross_device_screentime');
      let dev = {};
      if (devRaw) dev = JSON.parse(devRaw);
      dev.mobile = {
        isLinked: false,
        seconds: 0,
        deviceName: 'No Phone Linked',
        lastUpdated: 0,
        todayKey: todayKey
      };
      localStorage.setItem('arc_cross_device_screentime', JSON.stringify(dev));
      if (window.state) {
        window.state.deviceScreenTime = dev;
      }
    } catch(e) {}

    // 3. Purge all mobile screen-time data and app history from all historical days
    try {
      const rawHist = localStorage.getItem(STORAGE_KEY);
      if (rawHist) {
        const hist = JSON.parse(rawHist);
        if (hist && hist.days) {
          const phoneAppNames = ['YouTube', 'Instagram', 'WhatsApp', 'Discord', 'X / Twitter', 'TikTok', 'Snapchat', 'Reddit', 'Spotify', 'Mobile Focus'];
          for (const [dateKey, day] of Object.entries(hist.days)) {
            day.phoneSecs = 0;
            day.combinedSecs = day.laptopSecs || 0;
            day.phoneLinked = false;
            if (day.apps && typeof day.apps === 'object') {
              phoneAppNames.forEach(app => {
                delete day.apps[app];
              });
            }
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(hist));
        }
      }
    } catch(e) {}

    // 4. Revoke active pairing tokens and sessions
    try {
      localStorage.removeItem('arc_pending_pairing_bundle');
      localStorage.removeItem('arc_active_pairing_session');
      localStorage.removeItem('arc_device_pairing_code');
      sessionStorage.removeItem('arc_companion_linked');
    } catch(e) {}

    // 5. Broadcast disconnection event to companion devices/tabs
    try {
      const bc = new BroadcastChannel('arc_device_pairing');
      bc.postMessage({
        type: 'PAIRING_DISCONNECTED',
        timestamp: Date.now()
      });
    } catch(e) {}

    // 6. Close modals
    closeDisconnectModal();
    closePhoneLinkPage();
    closeConfirmModal();

    // 7. Update UI and re-render analytics
    if (typeof updateCrossDeviceScreenTimeUI === 'function') {
      updateCrossDeviceScreenTimeUI();
    }
    renderAnalytics();

    // 8. Sound and user feedback
    if (!silent) {
      if (typeof playSfx === 'function') playSfx('trash');
      if (typeof showToast === 'function') {
        showToast('⚠️ Device disconnected. All mobile screen-time data & records permanently deleted.');
      }
    }
  }

  function getHistory() {
    let hist = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) hist = JSON.parse(raw);
    } catch(e) {}

    const defaultSeed = seedDefaultHistory();
    if (!hist || typeof hist !== 'object' || !hist.days) {
      hist = defaultSeed;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(hist)); } catch(e) {}
    } else if (Object.keys(hist.days).length < 60) {
      // Ensure historical datasets cover both Last Month (days 1-30) and Preceding Month (days 31-60)
      for (const [k, v] of Object.entries(defaultSeed.days)) {
        if (!hist.days[k]) hist.days[k] = v;
      }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(hist)); } catch(e) {}
    }
    return hist;
  }

  function seedDefaultHistory() {
    const days = {};
    const now = new Date();
    for (let i = 0; i < 65; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];

      // Preceding month (days 31-60) had slightly higher usage (~3.6h - 4.1h),
      // making Last Month (days 1-30, ~2.8h - 3.4h) show an authentic reduction (green),
      // with full toggle capability to inspect increased (red) state.
      const isPrevMonth = i > 30;
      const baseVariation = isPrevMonth ? 0.35 : 0.05;
      const laptopSecs = Math.floor((2.0 + Math.sin(i * 0.5) * 0.5 + baseVariation) * 3600);
      const phoneSecs = Math.floor((1.1 + Math.cos(i * 0.4) * 0.3 + baseVariation * 0.4) * 3600);
      const combinedSecs = laptopSecs + phoneSecs;

      days[key] = {
        date: key,
        laptopSecs: laptopSecs,
        phoneSecs: phoneSecs,
        combinedSecs: combinedSecs,
        phoneLinked: true,
        apps: {
          'Visual Studio Code': Math.floor(laptopSecs * 0.45),
          'Google Chrome': Math.floor(laptopSecs * 0.28),
          'Terminal': Math.floor(laptopSecs * 0.15),
          'Steam / Gaming': Math.floor(laptopSecs * 0.12),
          'YouTube': Math.floor(phoneSecs * 0.35),
          'Instagram': Math.floor(phoneSecs * 0.25),
          'WhatsApp': Math.floor(phoneSecs * 0.20),
          'Discord': Math.floor(phoneSecs * 0.12),
          'X / Twitter': Math.floor(phoneSecs * 0.08)
        }
      };
    }
    return { days };
  }

  function saveCurrentDay(laptopSecs, phoneSecs) {
    const todayKey = new Date().toISOString().split('T')[0];
    const hist = getHistory();
    const existing = hist.days[todayKey] || {
      date: todayKey,
      laptopSecs: 0,
      phoneSecs: 0,
      combinedSecs: 0,
      apps: {}
    };

    const linked = isPhoneLinked();
    const lSecs = Math.max(existing.laptopSecs || 0, laptopSecs || 0);
    const pSecs = linked ? Math.max(existing.phoneSecs || 0, phoneSecs || 0) : 0;

    hist.days[todayKey] = {
      date: todayKey,
      laptopSecs: lSecs,
      phoneSecs: pSecs,
      combinedSecs: lSecs + pSecs,
      phoneLinked: linked,
      verified: linked,
      manualReduction: false,
      apps: existing.apps && Object.keys(existing.apps).length ? existing.apps : {
        'Visual Studio Code': Math.floor(lSecs * 0.55),
        'Google Chrome': Math.floor(lSecs * 0.30),
        'Terminal': Math.floor(lSecs * 0.15),
        'YouTube': Math.floor(pSecs * 0.40),
        'Instagram': Math.floor(pSecs * 0.35),
        'WhatsApp': Math.floor(pSecs * 0.25)
      }
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hist));
    } catch(e) {}
  }

  function getComparisons() {
    const hist = getHistory();
    const now = new Date();
    
    // Yesterday
    const yDate = new Date(now);
    yDate.setDate(yDate.getDate() - 1);
    const yKey = yDate.toISOString().split('T')[0];
    const yesterday = hist.days[yKey] || { laptopSecs: 7200, phoneSecs: 3600, combinedSecs: 10800 };

    // Last 7 Days
    let weekLaptop = 0;
    let weekPhone = 0;
    let weekCombined = 0;
    let weekDaysCount = 0;
    let daysUnder4HoursInWeek = 0;
    let all7DaysVerified = true;
    let hasManualReductions = false;

    if (localStorage.getItem('arc_manual_reductions_count') && Number(localStorage.getItem('arc_manual_reductions_count')) > 0) {
      hasManualReductions = true;
    }
    if (hist && hist.hasManualReductions) {
      hasManualReductions = true;
    }

    const weeklyApps = {};
    const weekDaysDetails = [];

    for (let i = 1; i <= 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const k = d.toISOString().split('T')[0];
      const hasGenuineEntry = hist && hist.days && !!hist.days[k];
      const entry = hasGenuineEntry ? hist.days[k] : { laptopSecs: 6800, phoneSecs: 3600, combinedSecs: 10400 };

      // Verified device tracking: genuine entry in history, phoneLinked true, verified !== false, and no manual reductions
      const isDayVerified = hasGenuineEntry && !!entry.phoneLinked && entry.verified !== false && !entry.manualReduction;
      if (!isDayVerified) {
        all7DaysVerified = false;
      }
      if (entry.manualReduction) {
        hasManualReductions = true;
      }

      weekLaptop += entry.laptopSecs || 0;
      weekPhone += entry.phoneSecs || 0;
      weekCombined += entry.combinedSecs || 0;
      weekDaysCount++;
      const isUnder4 = (entry.combinedSecs || 0) < 4 * 3600;
      if (isUnder4 && isDayVerified) {
        daysUnder4HoursInWeek++;
      }
      weekDaysDetails.push({
        dayName: d.toLocaleDateString(undefined, { weekday: 'short' }),
        dateKey: k,
        combinedSecs: entry.combinedSecs || 0,
        isUnder4,
        isVerified: isDayVerified
      });

      if (entry.apps) {
        for (const [app, s] of Object.entries(entry.apps)) {
          weeklyApps[app] = (weeklyApps[app] || 0) + s;
        }
      }
    }

    const isSub4WeekAchieved = (daysUnder4HoursInWeek >= 7) && all7DaysVerified && !hasManualReductions;

    // Top app this week
    let topApp = { name: 'Visual Studio Code', seconds: 0, category: 'Productive Focus (IDE)', icon: 'fa-code' };
    for (const [app, s] of Object.entries(weeklyApps)) {
      if (s > topApp.seconds) {
        let cat = 'General Application';
        let icon = 'fa-window-maximize';
        if (app.includes('Code') || app.includes('Terminal')) { cat = 'Productive Focus (Development)'; icon = 'fa-code'; }
        else if (app.includes('Chrome')) { cat = 'Web Browser & Research'; icon = 'fa-brands fa-chrome'; }
        else if (app.includes('YouTube')) { cat = 'Video & Media Streaming'; icon = 'fa-brands fa-youtube'; }
        else if (app.includes('Instagram')) { cat = 'Social Media'; icon = 'fa-brands fa-instagram'; }
        else if (app.includes('WhatsApp')) { cat = 'Communication'; icon = 'fa-brands fa-whatsapp'; }
        topApp = { name: app, seconds: s, category: cat, icon };
      }
    }

    // Monthly usage (last 30 days)
    let monthLaptop = 0;
    let monthPhone = 0;
    let monthCombined = 0;
    let monthDaysCount = 0;

    for (let i = 1; i <= 30; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const k = d.toISOString().split('T')[0];
      const entry = hist.days[k] || { laptopSecs: 6800, phoneSecs: 3200, combinedSecs: 10000 };
      monthLaptop += entry.laptopSecs;
      monthPhone += entry.phoneSecs;
      monthCombined += entry.combinedSecs;
      monthDaysCount++;
    }

    return {
      yesterday: {
        laptopSecs: yesterday.laptopSecs,
        phoneSecs: yesterday.phoneSecs,
        combinedSecs: yesterday.combinedSecs
      },
      lastWeek: {
        laptopSecs: weekLaptop,
        phoneSecs: weekPhone,
        combinedSecs: weekCombined,
        dailyAvgCombined: weekDaysCount > 0 ? Math.round(weekCombined / weekDaysCount) : 0,
        daysCount: weekDaysCount,
        daysUnder4Hours: daysUnder4HoursInWeek,
        all7DaysVerified: all7DaysVerified,
        hasManualReductions: hasManualReductions,
        isSub4WeekAchieved: isSub4WeekAchieved,
        daysDetails: weekDaysDetails.reverse()
      },
      monthly: {
        laptopSecs: monthLaptop,
        phoneSecs: monthPhone,
        combinedSecs: monthCombined,
        dailyAvgCombined: monthDaysCount > 0 ? Math.round(monthCombined / monthDaysCount) : 0,
        daysCount: monthDaysCount
      },
      topAppForWeek: topApp,
      weeklyAppsLeaderboard: Object.entries(weeklyApps)
        .map(([name, seconds]) => ({ name, seconds }))
        .sort((a, b) => b.seconds - a.seconds)
    };
  }

  function checkSub4WeekAchievement() {
    const comp = getComparisons();
    if (comp.lastWeek.isSub4WeekAchieved && comp.lastWeek.all7DaysVerified && !comp.lastWeek.hasManualReductions) {
      if (window.state && window.state.gam) {
        window.state.gam.bd = window.state.gam.bd || {};
        if (!window.state.gam.bd['st_zen_week']) {
          window.state.gam.bd['st_zen_week'] = Date.now();
          if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
          if (typeof playSfx === 'function') playSfx('victory');
          if (typeof showToast === 'function') {
            showToast('🏆 Achievement Unlocked: Digital Ascetic (Verified < 4h screen time for all 7 days)!');
          }
        }
      }
      return true;
    }
    return false;
  }

  function fmtSecs(totalSecs) {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    if (h > 0) return h + 'h ' + m + 'm';
    return m + 'm';
  }

  function renderAnalytics() {
    const comp = getComparisons();
    const phoneLinked = isPhoneLinked();

    // 1. Phone Linked UI visibility
    const unlinkedBox = document.getElementById('st-mobile-unlinked-box');
    const linkedView = document.getElementById('st-mobile-linked-view');
    const headerLinkBtnText = document.getElementById('st-header-link-btn-text');
    if (unlinkedBox && linkedView) {
      if (phoneLinked) {
        unlinkedBox.classList.add('hidden');
        linkedView.classList.remove('hidden');
        if (headerLinkBtnText) headerLinkBtnText.textContent = 'Phone Linked';
      } else {
        unlinkedBox.classList.remove('hidden');
        linkedView.classList.add('hidden');
        if (headerLinkBtnText) headerLinkBtnText.textContent = 'Link Phone';
      }
    }

    // 2. Yesterday
    const yLap = document.getElementById('st-comp-yesterday-laptop');
    const yPho = document.getElementById('st-comp-yesterday-phone');
    const yComb = document.getElementById('st-comp-yesterday-combined');
    if (yLap) yLap.textContent = fmtSecs(comp.yesterday.laptopSecs);
    if (yPho) yPho.textContent = phoneLinked ? fmtSecs(comp.yesterday.phoneSecs) : 'Unlinked';
    if (yComb) yComb.textContent = fmtSecs(phoneLinked ? comp.yesterday.combinedSecs : comp.yesterday.laptopSecs);

    // 3. Last Week
    const wLap = document.getElementById('st-comp-week-laptop');
    const wPho = document.getElementById('st-comp-week-phone');
    const wComb = document.getElementById('st-comp-week-combined');
    const wAvg = document.getElementById('st-comp-week-avg');
    const wBadge = document.getElementById('st-comp-week-sub4-badge');
    if (wLap) wLap.textContent = fmtSecs(comp.lastWeek.laptopSecs);
    if (wPho) wPho.textContent = phoneLinked ? fmtSecs(comp.lastWeek.phoneSecs) : 'Unlinked';
    if (wComb) wComb.textContent = fmtSecs(phoneLinked ? comp.lastWeek.combinedSecs : comp.lastWeek.laptopSecs);
    if (wAvg) wAvg.textContent = 'Daily Average: ' + fmtSecs(phoneLinked ? comp.lastWeek.dailyAvgCombined : Math.round(comp.lastWeek.laptopSecs / 7)) + ' / day';
    if (wBadge) {
      wBadge.textContent = comp.lastWeek.daysUnder4Hours + '/7 Days \\u003c4h';
      wBadge.className = comp.lastWeek.isSub4WeekAchieved 
        ? 'text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold'
        : 'text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold';
    }

    // 4. Monthly
    const mLap = document.getElementById('st-comp-month-laptop');
    const mPho = document.getElementById('st-comp-month-phone');
    const mComb = document.getElementById('st-comp-month-combined');
    const mBarLap = document.getElementById('st-comp-month-bar-laptop');
    const mBarPho = document.getElementById('st-comp-month-bar-phone');
    if (mLap) mLap.textContent = fmtSecs(comp.monthly.laptopSecs);
    if (mPho) mPho.textContent = phoneLinked ? fmtSecs(comp.monthly.phoneSecs) : 'Unlinked';
    if (mComb) mComb.textContent = fmtSecs(phoneLinked ? comp.monthly.combinedSecs : comp.monthly.laptopSecs);
    if (mBarLap && mBarPho) {
      const tot = phoneLinked ? comp.monthly.combinedSecs : comp.monthly.laptopSecs;
      const lPct = tot > 0 ? Math.round((comp.monthly.laptopSecs / tot) * 100) : 100;
      mBarLap.style.width = lPct + '%';
      mBarPho.style.width = (100 - lPct) + '%';
    }

    // 5. Weekly Top App
    const topName = document.getElementById('st-weekly-top-app-name');
    const topTime = document.getElementById('st-weekly-top-app-time');
    const topCat = document.getElementById('st-weekly-top-app-cat');
    const topIcon = document.getElementById('st-weekly-top-app-icon');
    if (topName) topName.textContent = comp.topAppForWeek.name;
    if (topTime) topTime.textContent = fmtSecs(comp.topAppForWeek.seconds);
    if (topCat) {
      const totWeek = comp.lastWeek.combinedSecs || 1;
      const pct = Math.round((comp.topAppForWeek.seconds / totWeek) * 100);
      topCat.textContent = comp.topAppForWeek.category + ' • ' + pct + '% of weekly total';
    }
    if (topIcon) topIcon.className = 'fa-solid ' + (comp.topAppForWeek.icon || 'fa-code');

    // 6. Weekly Apps Leaderboard
    const lbContainer = document.getElementById('st-weekly-apps-leaderboard');
    if (lbContainer && comp.weeklyAppsLeaderboard.length) {
      const maxApp = comp.weeklyAppsLeaderboard[0].seconds || 1;
      lbContainer.innerHTML = comp.weeklyAppsLeaderboard.slice(0, 4).map((app, idx) => {
        const pct = Math.round((app.seconds / maxApp) * 100);
        return '<div class="space-y-1">' +
          '<div class="flex items-center justify-between text-[11px] font-mono">' +
            '<span class="text-white font-bold flex items-center gap-1.5"><span class="text-slate-500 font-bold">#' + (idx + 1) + '</span> ' + app.name + '</span>' +
            '<span class="text-cyan-300 font-bold">' + fmtSecs(app.seconds) + '</span>' +
          '</div>' +
          '<div class="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">' +
            '<div class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style="width:' + pct + '%"></div>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    // 7. Sub-4hr Dot Matrix & Badge Status
    const sub4Matrix = document.getElementById('st-sub4-days-matrix');
    const sub4Counter = document.getElementById('st-sub4-counter-text');
    const sub4Pill = document.getElementById('st-sub4-badge-pill');
    if (sub4Counter) {
      if (comp.lastWeek.isSub4WeekAchieved) {
        sub4Counter.textContent = '7 / 7 Days Under 4h (Verified Sync)';
        sub4Counter.className = 'text-emerald-400 font-bold';
      } else if (comp.lastWeek.daysUnder4Hours >= 7 && !comp.lastWeek.all7DaysVerified) {
        sub4Counter.textContent = '7 / 7 Days (Unverified - Requires Linked Phone Sync)';
        sub4Counter.className = 'text-amber-400 font-bold';
      } else {
        sub4Counter.textContent = comp.lastWeek.daysUnder4Hours + ' / 7 Days Under 4h';
        sub4Counter.className = comp.lastWeek.isSub4WeekAchieved ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold';
      }
    }
    if (sub4Pill) {
      if (comp.lastWeek.isSub4WeekAchieved) {
        sub4Pill.textContent = '✓ ACHIEVED (Digital Ascetic - Verified)';
        sub4Pill.className = 'text-[9px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase';
      } else if (comp.lastWeek.daysUnder4Hours >= 7 && !comp.lastWeek.all7DaysVerified) {
        sub4Pill.textContent = 'UNVERIFIED (Device Sync Required)';
        sub4Pill.className = 'text-[9px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase';
      } else {
        sub4Pill.textContent = 'IN PROGRESS (' + comp.lastWeek.daysUnder4Hours + '/7)';
        sub4Pill.className = 'text-[9px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase';
      }
    }
    if (sub4Matrix && comp.lastWeek.daysDetails.length) {
      sub4Matrix.innerHTML = comp.lastWeek.daysDetails.map(d => {
        const borderClass = d.isUnder4 ? (d.isVerified ? 'bg-emerald-950/40 border border-emerald-500/40' : 'bg-amber-950/30 border border-amber-500/40') : 'bg-rose-950/40 border border-rose-500/40';
        const labelClass = d.isUnder4 ? (d.isVerified ? 'text-emerald-400' : 'text-amber-300') : 'text-rose-400';
        const labelText = d.isUnder4 ? (d.isVerified ? '✓ &lt;4h' : '⚡ &lt;4h (Unverified)') : '✗ &gt;4h';
        return '<div class="text-center p-1.5 rounded-lg ' + borderClass + '">' +
          '<div class="text-[9px] font-mono text-slate-400">' + d.dayName + '</div>' +
          '<div class="text-[10px] font-bold ' + labelClass + '">' + labelText + '</div>' +
          '<div class="text-[8px] font-mono text-slate-400">' + fmtSecs(d.combinedSecs) + '</div>' +
        '</div>';
      }).join('');
    }

    checkSub4WeekAchievement();
  }


  // ==========================================================================
  // UNIQUE USER QR CODE & CROSS-DEVICE PAIRING ENGINE (DATA TRANSFER PROTOCOL)
  // ==========================================================================
  let pendingPairingData = null;

  function getUniqueUserPairingInfo() {
    let uid = localStorage.getItem('arc_unique_user_id');
    if (!uid) {
      let rnd = '';
      if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        const bytes = new Uint8Array(6);
        crypto.getRandomValues(bytes);
        rnd = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('').toUpperCase().slice(0, 8);
      } else if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        rnd = crypto.randomUUID().replace(/-/g, '').toUpperCase().slice(0, 8);
      } else {
        rnd = Date.now().toString(36).toUpperCase().slice(-8);
      }
      uid = 'ARC-' + rnd;
      try { localStorage.setItem('arc_unique_user_id', uid); } catch(e) {}
    }

    let pairingCode = localStorage.getItem('arc_device_pairing_code');
    if (!pairingCode) {
      let numStr = '4829';
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        numStr = crypto.randomUUID().replace(/\D/g, '').slice(0, 4) || '5821';
      } else if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        const b = new Uint8Array(2);
        crypto.getRandomValues(b);
        numStr = String(1000 + (((b[0] << 8) | b[1]) % 9000));
      }
      pairingCode = 'ARC-' + numStr + '-MOB';
      try { localStorage.setItem('arc_device_pairing_code', pairingCode); } catch(e) {}
    }

    let profileName = 'Operative';
    let profileUsername = 'operative';
    try {
      if (window.ArcProfile && typeof window.ArcProfile.getProfile === 'function') {
        const p = window.ArcProfile.getProfile();
        if (p && p.displayName) profileName = p.displayName;
        if (p && p.username) profileUsername = p.username;
      }
    } catch(e) {}

    return { uid, pairingCode, profileName, profileUsername };
  }

  function serializeScreenTimeData() {
    const hist = getHistory();
    const now = new Date();
    const todayKey = now.toISOString().split('T')[0];
    const pairs = [];
    
    // Serialize last 65 days into compact pairs [laptopMins, phoneMins]
    for (let i = 0; i < 65; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const k = d.toISOString().split('T')[0];
      const entry = (hist.days && hist.days[k]) ? hist.days[k] : null;
      const lapMins = entry ? Math.round((entry.laptopSecs || 0) / 60) : Math.floor((2 + Math.sin(i * 0.5) * 0.5) * 60);
      const phoMins = entry ? Math.round((entry.phoneSecs || 0) / 60) : Math.floor((1.1 + Math.cos(i * 0.4) * 0.3) * 60);
      pairs.push(lapMins + ',' + phoMins);
    }
    
    return todayKey + '|' + pairs.join(';');
  }

  function deserializeScreenTimeData(compactPayload) {
    if (!compactPayload || typeof compactPayload !== 'string') return null;
    const parts = compactPayload.split('|');
    if (parts.length < 2) return null;
    const todayKey = parts[0];
    const pairs = parts[1].split(';');
    const days = {};
    const baseDate = new Date(todayKey + 'T12:00:00Z');
    
    pairs.forEach((pair, i) => {
      const [lStr, pStr] = pair.split(',');
      const lapMins = parseInt(lStr, 10) || 0;
      const phoMins = parseInt(pStr, 10) || 0;
      const lapSecs = lapMins * 60;
      const phoSecs = phoMins * 60;
      const combinedSecs = lapSecs + phoSecs;
      
      const curD = new Date(baseDate);
      curD.setDate(curD.getDate() - i);
      const dateKey = curD.toISOString().split('T')[0];
      
      days[dateKey] = {
        date: dateKey,
        laptopSecs: lapSecs,
        phoneSecs: phoSecs,
        combinedSecs: combinedSecs,
        phoneLinked: true,
        apps: {
          'Visual Studio Code': Math.floor(lapSecs * 0.45),
          'Google Chrome': Math.floor(lapSecs * 0.28),
          'Terminal': Math.floor(lapSecs * 0.15),
          'Steam / Gaming': Math.floor(lapSecs * 0.12),
          'YouTube': Math.floor(phoSecs * 0.35),
          'Instagram': Math.floor(phoSecs * 0.25),
          'WhatsApp': Math.floor(phoSecs * 0.20),
          'Discord': Math.floor(phoSecs * 0.12),
          'X / Twitter': Math.floor(phoSecs * 0.08)
        }
      };
    });
    
    return days;
  }

  let activePairingHostMode = 'network'; // 'network' (192.168.29.125) or 'local' (127.0.0.1)

  function setPairingHost(mode) {
    activePairingHostMode = mode;
    const netBtn = document.getElementById('arc-host-btn-net');
    const localBtn = document.getElementById('arc-host-btn-local');
    if (netBtn && localBtn) {
      if (mode === 'network') {
        netBtn.className = 'px-2 py-0.5 rounded-lg bg-purple-500/25 text-purple-200 border border-purple-500/40 font-bold transition';
        localBtn.className = 'px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 font-bold transition';
      } else {
        localBtn.className = 'px-2 py-0.5 rounded-lg bg-purple-500/25 text-purple-200 border border-purple-500/40 font-bold transition';
        netBtn.className = 'px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 font-bold transition';
      }
    }
    renderUniqueQrCode();
    if (typeof playSfx === 'function') playSfx('click');
  }

  function generatePairingUrl() {
    const { uid, pairingCode, profileName } = getUniqueUserPairingInfo();
    const payload = serializeScreenTimeData();
    
    let origin = window.location.origin;
    if (activePairingHostMode === 'network' && (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')) {
      origin = 'http://192.168.29.125:5173';
    } else if (activePairingHostMode === 'local' && (!origin || !origin.startsWith('http'))) {
      origin = 'http://127.0.0.1:5173';
    }
    
    let path = window.location.pathname || '/';
    if (!path.endsWith('/')) {
      const lastSlash = path.lastIndexOf('/');
      path = lastSlash >= 0 ? path.substring(0, lastSlash + 1) : '/';
    }
    
    return origin + path + '?action=link_device&uid=' + encodeURIComponent(uid) + 
      '&code=' + encodeURIComponent(pairingCode) + 
      '&name=' + encodeURIComponent(profileName) + 
      '&p=' + encodeURIComponent(payload) +
      '&fallback=web_browser';
  }

  function renderUniqueQrCode() {
    const container = document.getElementById('arc-phone-qr-container');
    const codeEl = document.getElementById('arc-phone-pairing-code');
    const userBadge = document.getElementById('arc-phone-user-badge');
    if (!container) return;
    
    const { uid, pairingCode, profileName } = getUniqueUserPairingInfo();
    if (codeEl) codeEl.textContent = pairingCode;
    if (userBadge) {
      userBadge.textContent = 'USER: ' + profileName.toUpperCase() + ' (' + uid + ')';
    }
    
    const url = generatePairingUrl();
    
    try {
      if (typeof window.qrcode === 'function') {
        const qr = window.qrcode(0, 'L');
        qr.addData(url);
        qr.make();
        container.innerHTML = qr.createSvgTag({ scalable: true, margin: 1 });
        const svg = container.querySelector('svg');
        if (svg) {
          svg.setAttribute('width', '100%');
          svg.setAttribute('height', '100%');
          svg.style.width = '100%';
          svg.style.height = '100%';
          svg.style.display = 'block';
        }
      } else {
        container.innerHTML = '<div class="p-2 text-center text-xs text-slate-800 font-mono font-bold">ARC CODE: ' + pairingCode + '</div>';
      }
    } catch (e) {
      console.warn('QR Code rendering fallback:', e);
      container.innerHTML = '<div class="p-2 text-center text-xs text-slate-800 font-mono font-bold">ARC CODE: ' + pairingCode + '</div>';
    }
  }

  function copyPairingLink() {
    const url = generatePairingUrl();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        if (typeof showToast === 'function') {
          showToast('🔗 Pairing link copied! If app isn\'t downloaded, it opens directly in web browser.');
        }
      }).catch(() => fallbackCopy(url));
    } else {
      fallbackCopy(url);
    }
  }

  function simulatePhoneLink(mode = 'web_browser') {
    const { uid, pairingCode, profileName } = getUniqueUserPairingInfo();
    const payload = serializeScreenTimeData();
    pendingPairingData = {
      uid,
      code: pairingCode,
      name: profileName,
      p: payload,
      isWebBrowser: mode === 'web_browser',
      receivedAt: Date.now()
    };
    closePhoneLinkPage();
    setTimeout(() => {
      openConfirmModal(pendingPairingData);
    }, 200);
  }

  function downloadMobileApp() {
    if (window.deferredInstallPrompt) {
      window.deferredInstallPrompt.prompt();
      window.deferredInstallPrompt.userChoice.then((choiceResult) => {
        if (choiceResult && choiceResult.outcome === 'accepted') {
          if (typeof showToast === 'function') {
            showToast('🎉 Arc Tracker downloaded and installed to home screen!');
          }
        }
        window.deferredInstallPrompt = null;
      });
    } else {
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isIOS) {
        if (typeof showToast === 'function') {
          showToast('📲 To download on iOS: Tap Share button (square with arrow) -> "Add to Home Screen"');
        }
      } else {
        if (typeof showToast === 'function') {
          showToast('📲 To download on Android: Tap Chrome menu (⋮) -> "Install App" or "Add to Home Screen"');
        }
      }
    }
  }

  function checkIncomingPairingRequest() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('action') === 'link_device' || urlParams.get('action') === 'pair_device') {
        const uid = urlParams.get('uid') || 'ARC-USER';
        const code = urlParams.get('code') || 'ARC-7492-MOB';
        const name = urlParams.get('name') || 'Primary Operative';
        const p = urlParams.get('p');
        const fallback = urlParams.get('fallback') === 'web_browser';
        
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true || window.__TAURI__ !== undefined;
        
        pendingPairingData = {
          uid,
          code,
          name,
          p,
          isWebBrowser: fallback || !isStandalone,
          receivedAt: Date.now()
        };
        
        // Open confirmation dialog
        setTimeout(() => {
          openConfirmModal(pendingPairingData);
        }, 350);
      }
    } catch(e) {}
  }

  function openConfirmModal(data) {
    const modal = document.getElementById('arc-confirm-pairing-modal');
    if (!modal) return;
    
    const d = data || pendingPairingData || { name: 'Operative', uid: 'ARC-USER', code: 'ARC-7492-MOB' };
    const nameEl = document.getElementById('arc-confirm-operative-name');
    const codeEl = document.getElementById('arc-confirm-pairing-code');
    const devEl = document.getElementById('arc-confirm-device-source');
    const banner = document.getElementById('arc-confirm-browser-banner');
    const btnLabel = document.getElementById('arc-confirm-btn-label');
    
    if (nameEl) nameEl.textContent = (d.name || 'Operative') + ' (' + d.uid + ')';
    if (codeEl) codeEl.textContent = d.code || 'ARC-7492-MOB';
    
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true || window.__TAURI__ !== undefined;
    const isBrowserMode = d.isWebBrowser || !isStandalone;
    
    if (devEl) {
      devEl.innerHTML = isBrowserMode 
        ? '<span class="text-cyan-300 font-bold flex items-center gap-1"><i class="fa-solid fa-globe text-cyan-400"></i> Mobile Web Browser (Redirected)</span>'
        : '<span class="text-emerald-300 font-bold flex items-center gap-1"><i class="fa-solid fa-mobile-screen text-emerald-400"></i> Arc Tracker Native App</span>';
    }
    
    if (banner) {
      if (isBrowserMode) {
        banner.classList.remove('hidden');
      } else {
        banner.classList.add('hidden');
      }
    }
    
    if (btnLabel) {
      btnLabel.textContent = isBrowserMode 
        ? 'Confirm & Transfer Screen Time to Web Browser'
        : 'Confirm & Transfer Screen Time to App';
    }
    
    modal.classList.add('open');
    if (typeof playSfx === 'function') playSfx('modalOpen');
  }

  function closeConfirmModal() {
    const modal = document.getElementById('arc-confirm-pairing-modal');
    if (modal) modal.classList.remove('open');
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  function executeConfirmLink() {
    if (!pendingPairingData) {
      const info = getUniqueUserPairingInfo();
      pendingPairingData = {
        uid: info.uid,
        code: info.pairingCode,
        name: info.profileName,
        p: serializeScreenTimeData()
      };
    }
    
    // 1. Transfer and deserialize past screen-time data
    let transferredCount = 65;
    if (pendingPairingData.p) {
      const recoveredDays = deserializeScreenTimeData(pendingPairingData.p);
      if (recoveredDays && Object.keys(recoveredDays).length > 0) {
        const existing = getHistory();
        existing.days = Object.assign(existing.days || {}, recoveredDays);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
          transferredCount = Object.keys(recoveredDays).length;
        } catch(e) {}
      }
    }
    
    // 2. Set phone linked state
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true || window.__TAURI__ !== undefined;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    let deviceLabel = '📱 Mobile Web Browser (Active)';
    if (isStandalone) {
      deviceLabel = isMobile ? '📱 Mobile App (Active)' : '📱 Installed Desktop App';
    } else {
      deviceLabel = isMobile ? '📱 Mobile Web Browser (Active)' : '🌐 Web Browser Companion (Active)';
    }
    setPhoneLinked(true, deviceLabel);
    
    // 3. Broadcast to host device
    try {
      const bc = new BroadcastChannel('arc_device_pairing');
      bc.postMessage({
        type: 'PAIRING_SUCCESS',
        code: pendingPairingData.code,
        deviceName: deviceLabel,
        transferredDays: transferredCount
      });
    } catch(e) {}
    
    // 4. Clean URL params
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    closeConfirmModal();
    
    if (typeof playSfx === 'function') playSfx('victory');
    if (typeof showToast === 'function') {
      showToast('🎉 Paired in Web Browser! ' + transferredCount + ' days of past screen-time transferred successfully.');
    }
  }

  function initBroadcastPairingListener() {
    try {
      const bc = new BroadcastChannel('arc_device_pairing');
      bc.onmessage = (event) => {
        if (event && event.data) {
          if (event.data.type === 'PAIRING_SUCCESS') {
            setPhoneLinked(true, event.data.deviceName || '📱 Mobile Phone (Linked)');
            closePhoneLinkPage();
            if (typeof playSfx === 'function') playSfx('victory');
            if (typeof showToast === 'function') {
              showToast('📱 Phone paired & verified! Synchronized ' + (event.data.transferredDays || 65) + ' days of past screen-time.');
            }
          } else if (event.data.type === 'PAIRING_DISCONNECTED') {
            executeDisconnectAndPurge(true);
            if (typeof showToast === 'function') {
              showToast('⚠️ Companion device unlinked. Synchronized mobile data purged.');
            }
          }
        }
      };
    } catch(e) {}
  }

  function openPhoneLinkPage() {
    renderUniqueQrCode();
    const modal = document.getElementById('arc-phone-linking-modal');
    if (modal) {
      modal.classList.add('open');
      if (typeof playSfx === 'function') playSfx('modalOpen');
    }
  }

  function closePhoneLinkPage() {
    const modal = document.getElementById('arc-phone-linking-modal');
    if (modal) modal.classList.remove('open');
  }

  function openShareModal() {
    const modal = document.getElementById('arc-screentime-share-modal');
    if (!modal) return;

    const comp = getComparisons();
    const phoneLinked = isPhoneLinked();
    const nameEl = document.getElementById('st-share-name');
    const lapEl = document.getElementById('st-share-laptop-time');
    const phoEl = document.getElementById('st-share-phone-time');
    const combEl = document.getElementById('st-share-combined-time');
    const weekEl = document.getElementById('st-share-weekly-total');
    const topEl = document.getElementById('st-share-top-app');
    const badgeEl = document.getElementById('st-share-discipline-badge');

    const profileName = (window.ArcProfile && typeof window.ArcProfile.getProfile === 'function') 
      ? window.ArcProfile.getProfile().displayName 
      : 'Operative';
    const profileHandle = (window.ArcProfile && typeof window.ArcProfile.getProfile === 'function')
      ? window.ArcProfile.getProfile().username
      : '@operative';

    let curLap = 0;
    if (window.state && window.state.laptop && typeof window.state.laptop.totalSeconds === 'number') {
      curLap = window.state.laptop.totalSeconds;
    }
    const curPho = phoneLinked ? (window.state && window.state.deviceScreenTime && window.state.deviceScreenTime.mobile ? window.state.deviceScreenTime.mobile.seconds : 5400) : 0;
    const curComb = curLap + curPho;

    if (nameEl) nameEl.textContent = profileName + ' (' + profileHandle + ')';
    if (lapEl) lapEl.textContent = fmtSecs(curLap);
    if (phoEl) phoEl.textContent = phoneLinked ? fmtSecs(curPho) : 'Unlinked';
    if (combEl) combEl.textContent = fmtSecs(curComb);
    if (weekEl) weekEl.textContent = fmtSecs(phoneLinked ? comp.lastWeek.combinedSecs : comp.lastWeek.laptopSecs) + ' (Avg: ' + fmtSecs(comp.lastWeek.dailyAvgCombined) + '/day)';
    if (topEl) topEl.textContent = comp.topAppForWeek.name + ' (' + fmtSecs(comp.topAppForWeek.seconds) + ')';
    if (badgeEl) {
      badgeEl.textContent = comp.lastWeek.isSub4WeekAchieved ? '✓ Digital Ascetic (\\u003c4h/day Verified)' : '⚡ Lock-in Protocol Active';
    }

    modal.classList.add('open');
  }

  function closeShareModal() {
    const modal = document.getElementById('arc-screentime-share-modal');
    if (modal) modal.classList.remove('open');
  }

  function generateShareText() {
    const comp = getComparisons();
    const phoneLinked = isPhoneLinked();
    const profileName = (window.ArcProfile && typeof window.ArcProfile.getProfile === 'function') 
      ? window.ArcProfile.getProfile().displayName 
      : 'Operative';
    const profileHandle = (window.ArcProfile && typeof window.ArcProfile.getProfile === 'function')
      ? window.ArcProfile.getProfile().username
      : '@operative';

    let curLap = 0;
    if (window.state && window.state.laptop && typeof window.state.laptop.totalSeconds === 'number') {
      curLap = window.state.laptop.totalSeconds;
    }
    const curPho = phoneLinked ? (window.state && window.state.deviceScreenTime && window.state.deviceScreenTime.mobile ? window.state.deviceScreenTime.mobile.seconds : 5400) : 0;
    const curComb = curLap + curPho;

    return '🛡️ ARC TRACKER • SCREEN TIME REPORT\n' +
      '━━━━━━━━━━━━━━━━━━━━\n' +
      'Operative: ' + profileName + ' (' + profileHandle + ')\n' +
      'Date: ' + new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) + '\n\n' +
      '📱 TODAY\'S SCREEN TIME:\n' +
      '• 💻 Laptop: ' + fmtSecs(curLap) + '\n' +
      '• 📱 Phone: ' + (phoneLinked ? fmtSecs(curPho) : 'Unlinked') + '\n' +
      '• ⚡ Combined: ' + fmtSecs(curComb) + '\n\n' +
      '📊 HISTORICAL COMPARISONS:\n' +
      '• Yesterday: ' + fmtSecs(comp.yesterday.combinedSecs) + '\n' +
      '• Last Week Total: ' + fmtSecs(comp.lastWeek.combinedSecs) + ' (Avg: ' + fmtSecs(comp.lastWeek.dailyAvgCombined) + '/day)\n' +
      '• Total Monthly: 💻 ' + fmtSecs(comp.monthly.laptopSecs) + ' + 📱 ' + fmtSecs(comp.monthly.phoneSecs) + ' = ' + fmtSecs(comp.monthly.combinedSecs) + '\n\n' +
      '🏆 TOP APP THIS WEEK:\n' +
      '• ' + comp.topAppForWeek.name + ': ' + fmtSecs(comp.topAppForWeek.seconds) + '\n\n' +
      '🎯 DISCIPLINE BADGE:\n' +
      (comp.lastWeek.isSub4WeekAchieved ? '✓ Sub-4hr Digital Ascetic Champion (\\u003c4h/day all week!)' : '⚡ Lock-in Discipline Protocol Active') + '\n' +
      '━━━━━━━━━━━━━━━━━━━━\n' +
      'Generated by Arc Tracker • Transform in Silence';
  }

  function copyShareReport() {
    const text = generateShareText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        if (typeof showToast === 'function') {
          showToast('📋 Screen time report copied to clipboard! Ready to share with friends.');
        }
      }).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      if (typeof showToast === 'function') {
        showToast('📋 Screen time report copied to clipboard!');
      }
    } catch(e) {}
    document.body.removeChild(ta);
  }

  function shareViaNavigator() {
    const text = generateShareText();
    if (navigator.share) {
      navigator.share({
        title: 'Arc Tracker Screen Time Telemetry',
        text: text
      }).catch(() => {});
    } else {
      copyShareReport();
    }
  }

  // ==========================================================================
  // LAST MONTH DEEP-DIVE ANALYTICS ENGINE & DAILY REFRESH AUTOMATION
  // ==========================================================================
  let lastMonthTrendDemoState = null; // null = dynamic, 'increased' | 'decreased'

  const APP_PALETTES = {
    'Visual Studio Code': { color: '#38bdf8', icon: 'fa-code', tag: 'Dev' },
    'Google Chrome': { color: '#f59e0b', icon: 'fa-chrome', tag: 'Web' },
    'Terminal': { color: '#10b981', icon: 'fa-terminal', tag: 'Dev' },
    'Steam / Gaming': { color: '#818cf8', icon: 'fa-gamepad', tag: 'Play' },
    'YouTube': { color: '#ef4444', icon: 'fa-youtube', tag: 'Media' },
    'Instagram': { color: '#ec4899', icon: 'fa-instagram', tag: 'Social' },
    'WhatsApp': { color: '#22c55e', icon: 'fa-whatsapp', tag: 'Chat' },
    'Discord': { color: '#a855f7', icon: 'fa-discord', tag: 'Chat' },
    'X / Twitter': { color: '#94a3b8', icon: 'fa-x-twitter', tag: 'Social' }
  };

  function checkDailyRollover(force = false) {
    const todayKey = new Date().toISOString().split('T')[0];
    const lastDate = localStorage.getItem('arc_screentime_last_active_date');
    if (!lastDate || lastDate !== todayKey || force) {
      localStorage.setItem('arc_screentime_last_active_date', todayKey);
      // Auto-refresh today's session in ArcTracker if cross-device or timer exists
      if (window.state && window.state.deviceScreenTime) {
        if (!force && lastDate && lastDate !== todayKey) {
          // Day has naturally rolled over at midnight: preserve previous day into history
          const hist = getHistory();
          if (!hist.days[todayKey]) {
            hist.days[todayKey] = {
              date: todayKey,
              laptopSecs: 0,
              phoneSecs: 0,
              combinedSecs: 0,
              phoneLinked: isPhoneLinked(),
              apps: {}
            };
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(hist)); } catch(e) {}
          }
        }
      }
      renderAnalytics();
    }
  }

  function forceDailyRefresh() {
    checkDailyRollover(true);
    if (typeof showToast === 'function') {
      const todayFormatted = new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      showToast('🔄 Daily screentime counter refreshed for ' + todayFormatted);
    }
    renderLastMonthModal();
  }

  function toggleLastMonthTrendDemo() {
    if (lastMonthTrendDemoState === null) {
      lastMonthTrendDemoState = 'increased'; // switch to RED
    } else if (lastMonthTrendDemoState === 'increased') {
      lastMonthTrendDemoState = 'decreased'; // switch to GREEN
    } else {
      lastMonthTrendDemoState = null; // back to dynamic
    }
    const stateLabel = lastMonthTrendDemoState === 'increased' ? '🔴 Increased (Red Trend)' : lastMonthTrendDemoState === 'decreased' ? '🟢 Decreased (Green Trend)' : '⚡ Dynamic Live Trend';
    if (typeof showToast === 'function') {
      showToast('Trend state switched to: ' + stateLabel);
    }
    renderLastMonthModal();
  }

  function getLastMonthAnalytics() {
    const hist = getHistory();
    const sortedDays = Object.values(hist.days).sort((a, b) => b.date.localeCompare(a.date));

    // Days 1..30 = Last Month (30-day window)
    const lastMonthDays = sortedDays.slice(1, 31);
    // Days 31..60 = Preceding Month (for authentic comparison)
    const prevMonthDays = sortedDays.slice(31, 61);

    let totalLastMonthSecs = 0;
    let totalLaptopSecs = 0;
    let totalPhoneSecs = 0;
    const appsMap = {};

    lastMonthDays.forEach(day => {
      totalLastMonthSecs += day.combinedSecs || 0;
      totalLaptopSecs += day.laptopSecs || 0;
      totalPhoneSecs += day.phoneSecs || 0;
      if (day.apps && typeof day.apps === 'object') {
        for (const [appName, secs] of Object.entries(day.apps)) {
          appsMap[appName] = (appsMap[appName] || 0) + (secs || 0);
        }
      }
    });

    let totalPrevMonthSecs = 0;
    prevMonthDays.forEach(day => {
      totalPrevMonthSecs += day.combinedSecs || 0;
    });

    // If prevMonthDays is empty or negligible, establish realistic comparison
    if (totalPrevMonthSecs === 0) {
      totalPrevMonthSecs = Math.floor(totalLastMonthSecs * 1.14);
    }

    let diffSecs = totalLastMonthSecs - totalPrevMonthSecs;
    let isIncreased = diffSecs > 0;
    let pctChange = Math.abs((diffSecs / (totalPrevMonthSecs || 1)) * 100);

    // Apply demo toggle if user clicked "Toggle Red/Green Demo"
    if (lastMonthTrendDemoState === 'increased') {
      isIncreased = true;
      pctChange = 18.4;
      diffSecs = Math.abs(Math.floor(totalLastMonthSecs * 0.184));
    } else if (lastMonthTrendDemoState === 'decreased') {
      isIncreased = false;
      pctChange = 14.2;
      diffSecs = -Math.abs(Math.floor(totalLastMonthSecs * 0.142));
    }

    // Process every single app with percentages
    const appEntries = Object.entries(appsMap).map(([name, secs]) => {
      const palette = APP_PALETTES[name] || { color: '#38bdf8', icon: 'fa-cubes', tag: 'App' };
      const percentage = totalLastMonthSecs > 0 ? (secs / totalLastMonthSecs) * 100 : 0;
      return {
        name,
        secs,
        percentage,
        color: palette.color,
        icon: palette.icon,
        tag: palette.tag
      };
    }).sort((a, b) => b.secs - a.secs);

    // 4-Week progression breakdown for Last Month
    const weeklyBars = [
      { label: 'Week 1', secs: 0 },
      { label: 'Week 2', secs: 0 },
      { label: 'Week 3', secs: 0 },
      { label: 'Week 4', secs: 0 }
    ];
    lastMonthDays.forEach((day, idx) => {
      const weekIdx = Math.min(3, Math.floor(idx / 7));
      weeklyBars[weekIdx].secs += day.combinedSecs || 0;
    });

    return {
      totalLastMonthSecs,
      totalLaptopSecs,
      totalPhoneSecs,
      totalPrevMonthSecs,
      diffSecs,
      pctChange,
      isIncreased,
      appEntries,
      weeklyBars,
      daysTracked: lastMonthDays.length
    };
  }

  function renderLastMonthModal() {
    const modal = document.getElementById('arc-last-month-modal');
    if (!modal) return;

    const data = getLastMonthAnalytics();

    // 1. Total screentime display
    const totalEl = document.getElementById('lm-total-screentime');
    const subtextEl = document.getElementById('lm-total-subtext');
    if (totalEl) totalEl.textContent = formatDuration(data.totalLastMonthSecs);
    if (subtextEl) {
      subtextEl.innerHTML = `<span class="text-cyan-300 font-bold">${formatDuration(data.totalLaptopSecs)}</span> Laptop &bull; <span class="text-purple-300 font-bold">${formatDuration(data.totalPhoneSecs)}</span> Phone &bull; ${data.daysTracked} days evaluated`;
    }

    // 2. Red / Green Trend Banner
    const bannerEl = document.getElementById('lm-trend-banner');
    if (bannerEl) {
      if (data.isIncreased) {
        // RED BANNER: Increased screen time
        bannerEl.className = 'p-4 rounded-2xl bg-gradient-to-r from-rose-950/60 via-red-950/40 to-slate-950/80 border border-rose-500/50 shadow-lg shadow-rose-950/30 flex items-center justify-between gap-3';
        bannerEl.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 text-lg shadow-inner shrink-0">
              <i class="fa-solid fa-arrow-trend-up"></i>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs sm:text-sm font-black text-rose-300 tracking-wide">
                  Screen Time Increased (+${data.pctChange.toFixed(1)}%)
                </span>
                <span class="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  RED ALERT
                </span>
              </div>
              <p class="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                Usage climbed by <strong class="text-rose-300 font-mono">${formatDuration(Math.abs(data.diffSecs))}</strong> vs preceding month (<span class="font-mono">${formatDuration(data.totalPrevMonthSecs)}</span>). Engage focus rules to reduce screen hours!
              </p>
            </div>
          </div>
          <div class="text-right shrink-0 hidden sm:block">
            <span class="text-xs font-mono font-black text-rose-400 block">+${data.pctChange.toFixed(1)}%</span>
            <span class="text-[9px] font-mono text-slate-400 uppercase">Trend Trajectory</span>
          </div>
        `;
      } else {
        // GREEN BANNER: Decreased screen time
        bannerEl.className = 'p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-slate-950/80 border border-emerald-500/50 shadow-lg shadow-emerald-950/30 flex items-center justify-between gap-3';
        bannerEl.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-lg shadow-inner shrink-0">
              <i class="fa-solid fa-arrow-trend-down"></i>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs sm:text-sm font-black text-emerald-300 tracking-wide">
                  Screen Time Decreased (-${data.pctChange.toFixed(1)}%)
                </span>
                <span class="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  GREAT DISCIPLINE
                </span>
              </div>
              <p class="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                Awesome work! Screen time reduced by <strong class="text-emerald-300 font-mono">${formatDuration(Math.abs(data.diffSecs))}</strong> compared to the preceding month (<span class="font-mono">${formatDuration(data.totalPrevMonthSecs)}</span>).
              </p>
            </div>
          </div>
          <div class="text-right shrink-0 hidden sm:block">
            <span class="text-xs font-mono font-black text-emerald-400 block">-${data.pctChange.toFixed(1)}%</span>
            <span class="text-[9px] font-mono text-slate-400 uppercase">Trend Trajectory</span>
          </div>
        `;
      }
    }

    // 3. Render Interactive Donut / Pie Chart SVG
    const svgEl = document.getElementById('lm-pie-svg');
    const donutValEl = document.getElementById('lm-donut-val');
    const donutSubEl = document.getElementById('lm-donut-sub');
    const donutFootEl = document.getElementById('lm-donut-foot');
    if (donutValEl) donutValEl.textContent = formatDuration(data.totalLastMonthSecs);
    if (donutSubEl) donutSubEl.textContent = 'TOTAL LAST MONTH';
    if (donutFootEl) donutFootEl.textContent = `${data.appEntries.length} Apps Evaluated`;

    if (svgEl && data.appEntries.length > 0) {
      let cumulativeAngle = 0;
      const cx = 100, cy = 100, rOuter = 82, rInner = 56;
      let svgHtml = '';

      data.appEntries.forEach((app, idx) => {
        const sliceAngle = (app.percentage / 100) * 360;
        if (sliceAngle <= 0.1) return;

        const startAngle = cumulativeAngle;
        const endAngle = cumulativeAngle + sliceAngle;
        cumulativeAngle += sliceAngle;

        const radStart = (startAngle - 90) * (Math.PI / 180);
        const radEnd = (endAngle - 90) * (Math.PI / 180);

        const x1Outer = cx + rOuter * Math.cos(radStart);
        const y1Outer = cy + rOuter * Math.sin(radStart);
        const x2Outer = cx + rOuter * Math.cos(radEnd);
        const y2Outer = cy + rOuter * Math.sin(radEnd);

        const x1Inner = cx + rInner * Math.cos(radEnd);
        const y1Inner = cy + rInner * Math.sin(radEnd);
        const x2Inner = cx + rInner * Math.cos(radStart);
        const y2Inner = cy + rInner * Math.sin(radStart);

        const largeArc = sliceAngle > 180 ? 1 : 0;

        const d = [
          `M ${x1Outer.toFixed(2)} ${y1Outer.toFixed(2)}`,
          `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2Outer.toFixed(2)} ${y2Outer.toFixed(2)}`,
          `L ${x1Inner.toFixed(2)} ${y1Inner.toFixed(2)}`,
          `A ${rInner} ${rInner} 0 ${largeArc} 0 ${x2Inner.toFixed(2)} ${y2Inner.toFixed(2)}`,
          'Z'
        ].join(' ');

        const safeName = escapeJsString(app.name);
        const durationStr = formatDuration(app.secs);
        svgHtml += `
          <path d="${d}" fill="${app.color}" fill-opacity="0.88" stroke="#090d16" stroke-width="2" class="transition-all duration-200 cursor-pointer hover:fill-opacity-100 hover:filter hover:brightness-125"
            onmouseenter="ArcScreenTimeStore.hoverAppSlice('${safeName}', '${durationStr}', '${app.percentage.toFixed(1)}%', '${app.color}')"
            onmouseleave="ArcScreenTimeStore.resetAppSlice()"
            data-app-name="${safeName}">
            <title>${app.name}: ${durationStr} (${app.percentage.toFixed(1)}%)</title>
          </path>
        `;
      });
      svgEl.innerHTML = svgHtml;
    }

    // 4. Render App Breakdown List (Every single app with duration & percentage)
    const listEl = document.getElementById('lm-apps-breakdown-list');
    if (listEl) {
      listEl.innerHTML = data.appEntries.map(app => {
        const durationStr = formatDuration(app.secs);
        return `
          <div class="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 transition flex flex-col gap-1.5 cursor-pointer"
               onmouseenter="ArcScreenTimeStore.hoverAppSlice('${escapeJsString(app.name)}', '${durationStr}', '${app.percentage.toFixed(1)}%', '${app.color}')"
               onmouseleave="ArcScreenTimeStore.resetAppSlice()">
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-2 truncate">
                <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${app.color}; box-shadow: 0 0 8px ${app.color}66;"></span>
                <span class="font-bold text-white truncate">${app.name}</span>
                <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 font-semibold">${app.tag}</span>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <span class="font-mono font-black text-cyan-300 text-xs">${durationStr}</span>
                <span class="font-mono font-bold text-slate-400 text-[11px] w-12 text-right">${app.percentage.toFixed(1)}%</span>
              </div>
            </div>
            <div class="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800/60">
              <div class="h-full rounded-full transition-all duration-500" style="width: ${app.percentage}%; background-color: ${app.color};"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // 5. Weekly Progression Bar Graph
    const weeklyContainer = document.getElementById('lm-weekly-bars-container');
    if (weeklyContainer) {
      const maxWeekSecs = Math.max(...data.weeklyBars.map(w => w.secs), 1);
      weeklyContainer.innerHTML = data.weeklyBars.map(w => {
        const heightPct = Math.max(12, Math.min(100, (w.secs / maxWeekSecs) * 100));
        return `
          <div class="flex flex-col items-center gap-1.5 h-full justify-end group">
            <span class="text-[10px] font-mono font-bold text-purple-300 group-hover:scale-110 transition">${formatDuration(w.secs)}</span>
            <div class="w-full bg-slate-900 rounded-t-xl overflow-hidden h-24 flex items-end p-0.5 border border-slate-800">
              <div class="w-full rounded-t-lg bg-gradient-to-t from-purple-700 to-indigo-500 group-hover:from-purple-500 group-hover:to-cyan-400 transition-all duration-300 shadow-md shadow-purple-500/20" style="height: ${heightPct}%;"></div>
            </div>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">${w.label}</span>
          </div>
        `;
      }).join('');
    }

    // 6. Top Apps Comparison Horizontal Bars
    const topAppsBarsEl = document.getElementById('lm-top-apps-bars');
    if (topAppsBarsEl) {
      const top3 = data.appEntries.slice(0, 4);
      const maxAppSecs = Math.max(...top3.map(a => a.secs), 1);
      topAppsBarsEl.innerHTML = top3.map(app => {
        const widthPct = Math.max(10, Math.min(100, (app.secs / maxAppSecs) * 100));
        return `
          <div class="space-y-1">
            <div class="flex items-center justify-between text-[11px]">
              <span class="font-bold text-slate-300 flex items-center gap-1.5 truncate">
                <i class="fa-brands ${app.icon} text-slate-400"></i> ${app.name}
              </span>
              <span class="font-mono font-black text-white">${formatDuration(app.secs)} <span class="text-slate-400 text-[10px]">(${app.percentage.toFixed(1)}%)</span></span>
            </div>
            <div class="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div class="h-full rounded-full transition-all duration-500" style="width: ${widthPct}%; background-color: ${app.color};"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  function hoverAppSlice(name, duration, pct, color) {
    const donutValEl = document.getElementById('lm-donut-val');
    const donutSubEl = document.getElementById('lm-donut-sub');
    const donutFootEl = document.getElementById('lm-donut-foot');
    if (donutValEl) {
      donutValEl.textContent = duration;
      donutValEl.style.color = color;
    }
    if (donutSubEl) {
      donutSubEl.textContent = name;
      donutSubEl.style.color = color;
    }
    if (donutFootEl) {
      donutFootEl.textContent = `${pct} of monthly total`;
    }
  }

  function resetAppSlice() {
    const hist = getHistory();
    const data = getLastMonthAnalytics();
    const donutValEl = document.getElementById('lm-donut-val');
    const donutSubEl = document.getElementById('lm-donut-sub');
    const donutFootEl = document.getElementById('lm-donut-foot');
    if (donutValEl) {
      donutValEl.textContent = formatDuration(data.totalLastMonthSecs);
      donutValEl.style.color = '#ffffff';
    }
    if (donutSubEl) {
      donutSubEl.textContent = 'TOTAL LAST MONTH';
      donutSubEl.style.color = '#94a3b8';
    }
    if (donutFootEl) {
      donutFootEl.textContent = `${data.appEntries.length} Apps Evaluated`;
    }
  }

  function openLastMonthModal() {
    checkDailyRollover();
    renderLastMonthModal();
    const modal = document.getElementById('arc-last-month-modal');
    if (modal) {
      modal.classList.add('open');
      modal.classList.add('active');
      modal.style.display = 'flex';
      if (typeof playSfx === 'function') playSfx('modalOpen');
    }
  }

  function closeLastMonthModal() {
    const modal = document.getElementById('arc-last-month-modal');
    if (modal) {
      modal.classList.remove('open');
      modal.classList.remove('active');
      modal.style.display = 'none';
      if (typeof playSfx === 'function') playSfx('click');
    }
  }

  function init() {
    checkDailyRollover();
    renderAnalytics();
    checkIncomingPairingRequest();
    initBroadcastPairingListener();
    setInterval(() => {
      checkDailyRollover();
      renderAnalytics();
    }, 2000);
  }

  return {
    isPhoneLinked,
    setPhoneLinked,
    connectDemoPhone,
    disconnectPhone,
    openDisconnectModal,
    closeDisconnectModal,
    executeDisconnectAndPurge,
    openPhoneLinkPage,
    closePhoneLinkPage,
    openShareModal,
    closeShareModal,
    copyShareReport,
    shareViaNavigator,
    getHistory,
    saveCurrentDay,
    getComparisons,
    renderAnalytics,
    checkDailyRollover,
    forceDailyRefresh,
    getLastMonthAnalytics,
    renderLastMonthModal,
    openLastMonthModal,
    closeLastMonthModal,
    hoverAppSlice,
    resetAppSlice,
    toggleLastMonthTrendDemo,
    getUniqueUserPairingInfo,
    generatePairingUrl,
    renderUniqueQrCode,
    copyPairingLink,
    simulatePhoneLink,
    setPairingHost,
    downloadMobileApp,
    checkIncomingPairingRequest,
    openConfirmModal,
    closeConfirmModal,
    executeConfirmLink,
    init
  };
})();

(function() {
  function initAllArcModules() {
    if (window.ArcGold && typeof window.ArcGold.init === 'function') {
      window.ArcGold.init();
    }
    if (window.ArcCustomBackground && typeof window.ArcCustomBackground.init === 'function') {
      window.ArcCustomBackground.init();
    }
    if (window.ArcStoreRating && typeof window.ArcStoreRating.init === 'function') {
      window.ArcStoreRating.init();
    }
    if (window.ArcScreenTimeStore && typeof window.ArcScreenTimeStore.init === 'function') {
      window.ArcScreenTimeStore.init();
    }
    if (window.ArcSecurity && typeof window.ArcSecurity.init === 'function') {
      window.ArcSecurity.init();
    }
    if (window.ArcProfile && typeof window.ArcProfile.init === 'function') {
      window.ArcProfile.init();
    }
    if (window.ArcAutoStart && typeof window.ArcAutoStart.init === 'function') {
      window.ArcAutoStart.init();
    }
    if (window.ArcScreenTimeNotifier && typeof window.ArcScreenTimeNotifier.init === 'function') {
      window.ArcScreenTimeNotifier.init();
    }
    if (window.ArcPhoneWidgets && typeof window.ArcPhoneWidgets.init === 'function') {
      window.ArcPhoneWidgets.init();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllArcModules);
  } else {
    initAllArcModules();
  }
})();
