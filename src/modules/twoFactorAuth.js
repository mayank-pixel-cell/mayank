window.ArcTwoFactor = (function() {
  'use strict';

  // Storage Keys
  const KEY_ENABLED = 'arc_sec_2fa_enabled';
  const KEY_METHOD = 'arc_sec_2fa_method'; // 'authenticator' | 'phone'
  const KEY_SECRET = 'arc_sec_2fa_secret';
  const KEY_PHONE = 'arc_sec_2fa_phone';
  const KEY_BACKUP_CODES = 'arc_sec_2fa_backup_codes';
  const KEY_SMS_CODE = 'arc_sec_2fa_sms_code';
  const KEY_SMS_EXP = 'arc_sec_2fa_sms_exp';

  // Internal state for setup modal
  let _stagedMethod = 'authenticator';
  let _stagedSecret = '';
  let _stagedCodes = [];
  let _stagedVerified = false;
  let _challengeIsBackupMode = false;

  // --- ENCRYPTION & SANITIZATION HELPERS ---
  function encryptSecret(plainText) {
    if (!plainText) return '';
    const salt = 'ARC_2FA_VAULT_KEY_2026';
    let result = '';
    for (let i = 0; i < plainText.length; i++) {
      result += String.fromCharCode(plainText.charCodeAt(i) ^ salt.charCodeAt(i % salt.length));
    }
    return 'enc:' + btoa(result);
  }

  function decryptSecret(val) {
    if (!val) return '';
    if (!val.startsWith('enc:')) return val; // Legacy backward-compatibility
    try {
      const raw = atob(val.slice(4));
      const salt = 'ARC_2FA_VAULT_KEY_2026';
      let result = '';
      for (let i = 0; i < raw.length; i++) {
        result += String.fromCharCode(raw.charCodeAt(i) ^ salt.charCodeAt(i % salt.length));
      }
      return result;
    } catch (_) {
      return val;
    }
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // --- CRYPTOGRAPHY & ENCODING ---
  const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  function base32Decode(base32) {
    const clean = base32.toUpperCase().replace(/[\s=-]/g, '');
    let bits = 0, value = 0;
    const bytes = [];
    for (let i = 0; i < clean.length; i++) {
      const idx = BASE32_ALPHABET.indexOf(clean[i]);
      if (idx === -1) continue;
      value = (value << 5) | idx;
      bits += 5;
      if (bits >= 8) {
        bytes.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }
    return new Uint8Array(bytes);
  }

  function generateSecretBase32() {
    let secret = '';
    const rand = crypto.getRandomValues(new Uint8Array(16));
    for (let i = 0; i < 16; i++) {
      secret += BASE32_ALPHABET[rand[i] & 31];
    }
    return secret;
  }

  function generate5BackupCodes() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    const codes = [];
    for (let i = 0; i < 5; i++) {
      const bytes = crypto.getRandomValues(new Uint8Array(8));
      let p1 = '', p2 = '';
      for (let j = 0; j < 4; j++) p1 += chars[bytes[j] & 31];
      for (let j = 4; j < 8; j++) p2 += chars[bytes[j] & 31];
      codes.push({
        code: `${p1}-${p2}`,
        used: false,
        usedAt: null
      });
    }
    return codes;
  }

  async function generateTOTP(secretBase32, timeMs = Date.now()) {
    const keyBytes = base32Decode(secretBase32);
    const epoch = Math.floor(timeMs / 1000);
    const timeStep = Math.floor(epoch / 30);
    const counterBuffer = new ArrayBuffer(8);
    const counterView = new DataView(counterBuffer);
    counterView.setUint32(0, 0, false);
    counterView.setUint32(4, timeStep, false);

    const key = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );
    const hmac = await crypto.subtle.sign('HMAC', key, counterBuffer);
    const hmacBytes = new Uint8Array(hmac);
    const offset = hmacBytes[hmacBytes.length - 1] & 0x0f;
    const code =
      ((hmacBytes[offset] & 0x7f) << 24) |
      ((hmacBytes[offset + 1] & 0xff) << 16) |
      ((hmacBytes[offset + 2] & 0xff) << 8) |
      (hmacBytes[offset + 3] & 0xff);
    return (code % 1000000).toString().padStart(6, '0');
  }

  async function verifyTOTP(secretBase32, codeToTest) {
    if (!codeToTest || codeToTest.length !== 6) return false;
    const now = Date.now();
    for (let offset = -1; offset <= 1; offset++) {
      const candidate = await generateTOTP(secretBase32, now + offset * 30000);
      if (candidate === codeToTest) return true;
    }
    return false;
  }

  // --- COMPACT PURE JS QR CODE GENERATOR (100% OFFLINE) ---
  const QR = (function() {
    const EXP = new Uint8Array(512);
    const LOG = new Uint8Array(256);
    for (let i = 0, x = 1; i < 255; i++) {
      EXP[i] = x;
      EXP[i + 255] = x;
      LOG[x] = i;
      x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
    }
    function gfMul(a, b) { return (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]]; }
    function rsPoly(n) {
      let p = [1];
      for (let i = 0; i < n; i++) {
        const next = new Array(p.length + 1).fill(0);
        for (let j = 0; j < p.length; j++) {
          next[j] ^= gfMul(p[j], EXP[i]);
          next[j + 1] ^= p[j];
        }
        p = next;
      }
      return p;
    }
    function rsEncode(data, ecLen) {
      const poly = rsPoly(ecLen);
      const msg = data.concat(new Array(ecLen).fill(0));
      for (let i = 0; i < data.length; i++) {
        const coef = msg[i];
        if (coef !== 0) {
          for (let j = 0; j < poly.length; j++) msg[i + j] ^= gfMul(poly[j], coef);
        }
      }
      return msg.slice(data.length);
    }
    const VERSIONS = [
      null,
      { v: 1, sz: 21, total: 26, ec: 7, cap: 17, align: [] },
      { v: 2, sz: 25, total: 44, ec: 10, cap: 32, align: [6, 18] },
      { v: 3, sz: 29, total: 70, ec: 15, cap: 53, align: [6, 22] },
      { v: 4, sz: 33, total: 100, ec: 20, cap: 78, align: [6, 26] },
      { v: 5, sz: 37, total: 134, ec: 26, cap: 106, align: [6, 30] },
      { v: 6, sz: 41, total: 172, ec: 36, cap: 134, align: [6, 34] }
    ];
    function getVersion(len) {
      for (let i = 1; i < VERSIONS.length; i++) {
        if (len <= VERSIONS[i].cap) return VERSIONS[i];
      }
      return VERSIONS[VERSIONS.length - 1];
    }
    function encodeData(str, ver) {
      const utf8 = [];
      for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i);
        if (c < 128) utf8.push(c);
        else if (c < 2048) utf8.push(192 | (c >> 6), 128 | (c & 63));
        else utf8.push(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63));
      }
      const dataCodewords = ver.total - ver.ec;
      let bits = '0100' + utf8.length.toString(2).padStart(8, '0');
      for (let b of utf8) bits += b.toString(2).padStart(8, '0');
      const termLen = Math.min(4, dataCodewords * 8 - bits.length);
      bits += '0'.repeat(termLen);
      while (bits.length % 8 !== 0) bits += '0';
      const pad = ['11101100', '00010001'];
      let pIdx = 0;
      while (bits.length < dataCodewords * 8) {
        bits += pad[pIdx % 2];
        pIdx++;
      }
      const data = [];
      for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.substr(i, 8), 2));
      const ec = rsEncode(data, ver.ec);
      return data.concat(ec);
    }
    function createMatrix(ver, codewords) {
      const sz = ver.sz;
      const mat = Array.from({ length: sz }, () => Array(sz).fill(null));
      const reserved = Array.from({ length: sz }, () => Array(sz).fill(false));
      function setPattern(r, c, pattern) {
        for (let i = 0; i < pattern.length; i++) {
          for (let j = 0; j < pattern[i].length; j++) {
            mat[r + i][c + j] = pattern[i][j];
            reserved[r + i][c + j] = true;
          }
        }
      }
      const finder = [
        [1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1],
        [1,0,1,1,1,0,1],
        [1,0,1,1,1,0,1],
        [1,0,1,1,1,0,1],
        [1,0,0,0,0,0,1],
        [1,1,1,1,1,1,1]
      ];
      setPattern(0, 0, finder);
      setPattern(0, sz - 7, finder);
      setPattern(sz - 7, 0, finder);
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (!reserved[i][j]) { mat[i][j] = 0; reserved[i][j] = true; }
          if (!reserved[i][sz - 1 - j]) { mat[i][sz - 1 - j] = 0; reserved[i][sz - 1 - j] = true; }
          if (!reserved[sz - 1 - i][j]) { mat[sz - 1 - i][j] = 0; reserved[sz - 1 - i][j] = true; }
        }
      }
      if (ver.align && ver.align.length) {
        const alignPattern = [
          [1,1,1,1,1],
          [1,0,0,0,1],
          [1,0,1,0,1],
          [1,0,0,0,1],
          [1,1,1,1,1]
        ];
        for (let r of ver.align) {
          for (let c of ver.align) {
            if (reserved[r][c]) continue;
            setPattern(r - 2, c - 2, alignPattern);
          }
        }
      }
      for (let i = 8; i < sz - 8; i++) {
        if (!reserved[6][i]) { mat[6][i] = (i % 2 === 0 ? 1 : 0); reserved[6][i] = true; }
        if (!reserved[i][6]) { mat[i][6] = (i % 2 === 0 ? 1 : 0); reserved[i][6] = true; }
      }
      mat[sz - 8][8] = 1; reserved[sz - 8][8] = true;
      for (let i = 0; i < 9; i++) { if (!reserved[8][i]) reserved[8][i] = true; if (!reserved[i][8]) reserved[i][8] = true; }
      for (let i = sz - 8; i < sz; i++) { if (!reserved[8][i]) reserved[8][i] = true; if (!reserved[i][8]) reserved[i][8] = true; }
      let bitIdx = 0;
      const allBits = codewords.map(b => b.toString(2).padStart(8, '0')).join('');
      let upward = true;
      for (let right = sz - 1; right > 0; right -= 2) {
        if (right === 6) right--;
        const cols = [right, right - 1];
        const rows = [];
        if (upward) { for (let r = sz - 1; r >= 0; r--) rows.push(r); }
        else { for (let r = 0; r < sz; r++) rows.push(r); }
        for (let r of rows) {
          for (let c of cols) {
            if (!reserved[r][c]) {
              const bit = bitIdx < allBits.length ? (allBits[bitIdx++] === '1' ? 1 : 0) : 0;
              const mask = ((r + c) % 2 === 0);
              mat[r][c] = mask ? (bit ^ 1) : bit;
            }
          }
        }
        upward = !upward;
      }
      const formatBits = [1,1,1,0,1,1,1,1,1,0,0,0,1,0,0];
      for (let i = 0; i < 6; i++) mat[8][i] = formatBits[i];
      mat[8][7] = formatBits[6];
      mat[8][8] = formatBits[7];
      mat[7][8] = formatBits[8];
      for (let i = 0; i < 6; i++) mat[5 - i][8] = formatBits[9 + i];
      for (let i = 0; i < 8; i++) mat[8][sz - 1 - i] = formatBits[i];
      for (let i = 0; i < 7; i++) mat[sz - 7 + i][8] = formatBits[8 + i];
      return mat;
    }
    function toSVG(str, size = 140) {
      const ver = getVersion(str.length);
      const codewords = encodeData(str, ver);
      const mat = createMatrix(ver, codewords);
      const sz = mat.length;
      const pad = 2;
      const totalSz = sz + pad * 2;
      let paths = '';
      for (let r = 0; r < sz; r++) {
        for (let c = 0; c < sz; c++) {
          if (mat[r][c] === 1) paths += `M${c + pad},${r + pad}h1v1h-1z `;
        }
      }
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSz} ${totalSz}" width="${size}" height="${size}" class="w-full h-full">
        <rect width="${totalSz}" height="${totalSz}" fill="#ffffff"/>
        <path d="${paths}" fill="#090d16" shape-rendering="crispEdges"/>
      </svg>`;
    }
    return { toSVG };
  })();

  // --- STATE ACCESSORS ---
  function isEnabled() {
    return localStorage.getItem(KEY_ENABLED) === 'true';
  }

  function getMethod() {
    return localStorage.getItem(KEY_METHOD) || 'authenticator';
  }

  function getSecret() {
    return decryptSecret(localStorage.getItem(KEY_SECRET) || '');
  }

  function getPhone() {
    return localStorage.getItem(KEY_PHONE) || '';
  }

  function getBackupCodes() {
    try {
      const raw = localStorage.getItem(KEY_BACKUP_CODES);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  function getRemainingCodesCount() {
    const codes = getBackupCodes();
    return codes.filter(c => !c.used).length;
  }

  // --- NOTIFICATION BANNER (SMS SIMULATION) ---
  function showSmsNotification(phone, code) {
    // Show top notification toast banner
    const existing = document.getElementById('arc-sms-toast');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'arc-sms-toast';
    banner.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-[200] max-w-md w-[92vw] p-4 rounded-2xl bg-slate-900/95 border-2 border-indigo-500/80 shadow-2xl text-white backdrop-blur-xl animate-bounce-short select-none';
    banner.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 grid place-items-center text-lg shrink-0">
          <i class="fa-solid fa-comment-sms"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-indigo-300">📱 SMS Dispatch (2FA)</span>
            <span class="text-[10px] font-mono text-slate-400">Just now</span>
          </div>
          <div class="text-[11px] text-slate-300 mt-0.5">
            To: <b class="text-white font-mono">${escapeHtml(phone)}</b>
          </div>
          <div class="mt-2 p-2 rounded-lg bg-black/60 border border-indigo-500/30 flex items-center justify-between gap-2">
            <div>
              <span class="text-[10px] text-slate-400 block">Verification Code:</span>
              <span class="font-mono text-lg font-black tracking-widest text-cyan-300">${escapeHtml(code)}</span>
            </div>
            <button type="button" id="btn-arc-sms-autofill" class="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition active:scale-95">
              Copy &amp; Fill
            </button>
          </div>
          <div class="text-[10px] text-slate-400 mt-1">Valid for 10 minutes. Click to auto-fill into verification field.</div>
        </div>
        <button type="button" onclick="this.closest('#arc-sms-toast').remove()" class="text-slate-400 hover:text-white text-xs p-1">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;
    document.body.appendChild(banner);

    const btn = banner.querySelector('#btn-arc-sms-autofill');
    if (btn) {
      btn.addEventListener('click', () => {
        // Auto fill into setup sms input or challenge input
        const setupIn = document.getElementById('arc-2fa-setup-sms-input');
        if (setupIn && setupIn.offsetParent !== null) {
          setupIn.value = code;
          verifySetupSms();
        }
        const chalIn = document.getElementById('arc-2fa-challenge-input');
        if (chalIn && chalIn.offsetParent !== null) {
          chalIn.value = code;
          submitChallengeUnlock();
        }
        banner.remove();
      });
    }

    if (window.playSfx) window.playSfx('chime');

    setTimeout(() => {
      if (document.body.contains(banner)) banner.remove();
    }, 12000);
  }

  // --- SMS DISPATCH HELPER ---
  function dispatchSms(phoneNumber) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    localStorage.setItem(KEY_SMS_CODE, code);
    localStorage.setItem(KEY_SMS_EXP, String(Date.now() + 10 * 60 * 1000));
    showSmsNotification(phoneNumber, code);
    return code;
  }

  // --- MODAL CONTROLS ---
  function openSetupModal() {
    const modal = document.getElementById('pp-sec-2fa-modal');
    if (!modal) return;

    const activeView = document.getElementById('arc-2fa-active-view');
    const setupView = document.getElementById('arc-2fa-setup-view');
    const badge = document.getElementById('arc-2fa-modal-status-badge');

    if (isEnabled()) {
      // Show active management
      if (badge) {
        badge.textContent = 'ACTIVE';
        badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
      }
      if (activeView) activeView.classList.remove('hidden');
      if (setupView) setupView.classList.add('hidden');
      renderActiveManagementView();
    } else {
      // Show setup wizard
      if (badge) {
        badge.textContent = 'OPTIONAL • INACTIVE';
        badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700';
      }
      if (activeView) activeView.classList.add('hidden');
      if (setupView) setupView.classList.remove('hidden');
      startSetupFlow();
    }

    modal.classList.add('open');
    if (window.playSfx) window.playSfx('modalOpen');
  }

  function closeSetupModal() {
    const modal = document.getElementById('pp-sec-2fa-modal');
    if (!modal) return;
    modal.classList.remove('open');
    if (window.playSfx) window.playSfx('modalClose');
  }

  function startSetupFlow() {
    _stagedMethod = 'authenticator';
    _stagedSecret = generateSecretBase32();
    _stagedCodes = generate5BackupCodes();
    _stagedVerified = false;

    selectMethod('authenticator');

    // Populate Authenticator QR and Secret Key
    const qrBox = document.getElementById('arc-2fa-qr-code-box');
    const secDisp = document.getElementById('arc-2fa-secret-display');
    const totpIn = document.getElementById('arc-2fa-setup-totp-input');
    const err = document.getElementById('arc-2fa-setup-totp-err');

    if (totpIn) totpIn.value = '';
    if (err) err.textContent = '';
    if (secDisp) secDisp.value = _stagedSecret;

    if (qrBox) {
      const uri = `otpauth://totp/ArcTracker:Operative?secret=${_stagedSecret}&issuer=ArcTracker&algorithm=SHA1&digits=6&period=30`;
      qrBox.innerHTML = QR.toSVG(uri, 140);
    }

    // Render 5 Backup Codes in Setup
    renderSetupBackupCodes();

    const chk = document.getElementById('arc-2fa-confirm-saved-chk');
    if (chk) chk.checked = false;

    updateActivateButtonState();
  }

  function renderSetupBackupCodes() {
    const grid = document.getElementById('arc-2fa-setup-codes-grid');
    if (!grid) return;
    grid.innerHTML = _stagedCodes.map((item, idx) => `
      <div class="p-2 rounded-lg bg-black/70 border border-slate-800 flex items-center justify-between">
        <span class="text-slate-400 text-[10px]">#${idx + 1}</span>
        <span class="text-cyan-300 font-bold font-mono tracking-wider">${item.code}</span>
        <span class="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">VALID</span>
      </div>
    `).join('');
  }

  function selectMethod(method) {
    _stagedMethod = method;
    _stagedVerified = false;

    const btnAuth = document.getElementById('arc-2fa-choice-authenticator');
    const btnPhone = document.getElementById('arc-2fa-choice-phone');
    const cfgAuth = document.getElementById('arc-2fa-config-authenticator');
    const cfgPhone = document.getElementById('arc-2fa-config-phone');

    if (method === 'authenticator') {
      if (btnAuth) {
        btnAuth.className = 'p-3 rounded-xl border-2 border-cyan-400 bg-cyan-950/40 text-left transition relative select-none';
        const chk = btnAuth.querySelector('.check-icon');
        if (chk) chk.classList.remove('hidden');
      }
      if (btnPhone) {
        btnPhone.className = 'p-3 rounded-xl border-2 border-slate-700 bg-slate-900/60 hover:border-slate-600 text-left transition relative select-none';
        const chk = btnPhone.querySelector('.check-icon');
        if (chk) chk.classList.add('hidden');
      }
      if (cfgAuth) cfgAuth.classList.remove('hidden');
      if (cfgPhone) cfgPhone.classList.add('hidden');
    } else {
      if (btnPhone) {
        btnPhone.className = 'p-3 rounded-xl border-2 border-indigo-400 bg-indigo-950/40 text-left transition relative select-none';
        const chk = btnPhone.querySelector('.check-icon');
        if (chk) chk.classList.remove('hidden');
      }
      if (btnAuth) {
        btnAuth.className = 'p-3 rounded-xl border-2 border-slate-700 bg-slate-900/60 hover:border-slate-600 text-left transition relative select-none';
        const chk = btnAuth.querySelector('.check-icon');
        if (chk) chk.classList.add('hidden');
      }
      if (cfgAuth) cfgAuth.classList.add('hidden');
      if (cfgPhone) cfgPhone.classList.remove('hidden');
    }

    updateActivateButtonState();
    if (window.playSfx) window.playSfx('click');
  }

  async function fillCurrentTOTP() {
    const code = await generateTOTP(_stagedSecret);
    const inEl = document.getElementById('arc-2fa-setup-totp-input');
    if (inEl) {
      inEl.value = code;
      verifySetupCode();
    }
  }

  async function verifySetupCode() {
    const inEl = document.getElementById('arc-2fa-setup-totp-input');
    const err = document.getElementById('arc-2fa-setup-totp-err');
    if (err) err.textContent = '';
    const val = (inEl ? inEl.value : '').trim();
    if (!val || val.length !== 6) {
      if (err) err.textContent = 'Please enter a 6-digit code from Google Authenticator.';
      return;
    }

    const ok = await verifyTOTP(_stagedSecret, val);
    if (ok) {
      _stagedVerified = true;
      if (err) {
        err.className = 'text-xs text-emerald-400 font-mono mt-1 min-h-[1rem]';
        err.textContent = '✓ Google Authenticator code verified successfully!';
      }
      if (window.playSfx) window.playSfx('fanfare');
      updateActivateButtonState();
    } else {
      _stagedVerified = false;
      if (err) {
        err.className = 'text-xs text-rose-400 font-mono mt-1 min-h-[1rem]';
        err.textContent = 'Incorrect code. Please make sure phone time is synchronized.';
      }
      if (window.playSfx) window.playSfx('uncheck');
      updateActivateButtonState();
    }
  }

  function sendSetupSms() {
    const phoneIn = document.getElementById('arc-2fa-setup-phone-input');
    const phone = (phoneIn ? phoneIn.value : '').trim();
    const err = document.getElementById('arc-2fa-setup-sms-err');
    if (err) err.textContent = '';
    if (!phone || phone.length < 6) {
      if (err) err.textContent = 'Please enter a valid mobile phone number.';
      return;
    }
    dispatchSms(phone);
    if (err) {
      err.className = 'text-xs text-cyan-400 font-mono min-h-[1rem]';
      err.textContent = `SMS dispatched to ${phone}. Enter the code below.`;
    }
  }

  function verifySetupSms() {
    const inEl = document.getElementById('arc-2fa-setup-sms-input');
    const err = document.getElementById('arc-2fa-setup-sms-err');
    if (err) err.textContent = '';
    const val = (inEl ? inEl.value : '').trim();
    const stored = localStorage.getItem(KEY_SMS_CODE);
    const exp = parseInt(localStorage.getItem(KEY_SMS_EXP) || '0', 10);

    if (!val) {
      if (err) err.textContent = 'Please enter the 6-digit SMS code.';
      return;
    }
    if (Date.now() > exp) {
      if (err) err.textContent = 'SMS code has expired. Click Send SMS Code again.';
      return;
    }
    if (val !== stored) {
      if (err) err.textContent = 'Incorrect SMS verification code.';
      if (window.playSfx) window.playSfx('uncheck');
      _stagedVerified = false;
      updateActivateButtonState();
      return;
    }

    _stagedVerified = true;
    if (err) {
      err.className = 'text-xs text-emerald-400 font-mono min-h-[1rem]';
      err.textContent = '✓ Mobile phone verified successfully!';
    }
    if (window.playSfx) window.playSfx('fanfare');
    updateActivateButtonState();
  }

  function onConfirmSavedChange() {
    updateActivateButtonState();
  }

  function updateActivateButtonState() {
    const chk = document.getElementById('arc-2fa-confirm-saved-chk');
    const btn = document.getElementById('btn-arc-2fa-activate');
    if (!btn) return;
    const isSavedConfirmed = chk ? chk.checked : false;
    btn.disabled = !(_stagedVerified && isSavedConfirmed);
  }

  function copySecretKey() {
    const secDisp = document.getElementById('arc-2fa-secret-display');
    const text = secDisp ? secDisp.value : _stagedSecret;
    if (window.ArcSecurity && typeof window.ArcSecurity.copySensitiveWithAutoClear === 'function') {
      window.ArcSecurity.copySensitiveWithAutoClear(text, '2FA Secret Key');
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (typeof showToast === 'function') showToast('Secret Key copied to clipboard');
      if (window.playSfx) window.playSfx('click');
    }
  }

  function copySetupBackupCodes() {
    const lines = [
      'ARC TRACKER - EMERGENCY BACKUP CODES',
      `Generated: ${new Date().toISOString()}`,
      'Keep these 5 single-use codes in a secure offline location.',
      '',
      ..._stagedCodes.map((c, i) => `Code #${i + 1}: ${c.code}`),
      ''
    ].join('\n');
    if (window.ArcSecurity && typeof window.ArcSecurity.copySensitiveWithAutoClear === 'function') {
      window.ArcSecurity.copySensitiveWithAutoClear(lines, '5 Backup Codes');
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(lines);
      if (typeof showToast === 'function') showToast('5 Backup Codes copied to clipboard');
      if (window.playSfx) window.playSfx('click');
    }
  }

  function downloadSetupBackupCodes() {
    const lines = [
      'ARC TRACKER - EMERGENCY BACKUP CODES',
      `Generated: ${new Date().toISOString()}`,
      'Keep these 5 single-use codes in a secure offline location.',
      '',
      ..._stagedCodes.map((c, i) => `Code #${i + 1}: ${c.code}`),
      ''
    ].join('\n');
    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arc-tracker-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    if (typeof showToast === 'function') showToast('Backup codes saved to arc-tracker-backup-codes.txt');
  }

  function activateTwoFactor() {
    if (!_stagedVerified) return;
    const phoneIn = document.getElementById('arc-2fa-setup-phone-input');
    const phone = (phoneIn ? phoneIn.value : '').trim();

    localStorage.setItem(KEY_ENABLED, 'true');
    localStorage.setItem(KEY_METHOD, _stagedMethod);
    localStorage.setItem(KEY_SECRET, encryptSecret(_stagedSecret));
    localStorage.setItem(KEY_PHONE, phone || '+1 (555) 234-5678');
    localStorage.setItem(KEY_BACKUP_CODES, JSON.stringify(_stagedCodes));

    closeSetupModal();
    updateSettingsRow();

    if (window.playSfx) window.playSfx('victory');
    if (typeof showToast === 'function') {
      showToast('🛡️ Two-Step Verification is now ACTIVE and protecting your app!');
    }
  }

  // --- ACTIVE MANAGEMENT VIEW ---
  function renderActiveManagementView() {
    const method = getMethod();
    const nameEl = document.getElementById('arc-2fa-active-method-name');
    const detailEl = document.getElementById('arc-2fa-active-method-detail');
    const codesBadge = document.getElementById('arc-2fa-active-codes-badge');
    const grid = document.getElementById('arc-2fa-active-codes-grid');

    if (nameEl) {
      nameEl.textContent = method === 'phone' ? 'Phone Number (SMS)' : 'Google Authenticator';
    }
    if (detailEl) {
      detailEl.textContent = method === 'phone'
        ? `Verified Mobile: ${getPhone()}`
        : 'Time-Based One-Time Passwords (RFC 6238 Standard)';
    }

    const codes = getBackupCodes();
    const unused = codes.filter(c => !c.used).length;
    if (codesBadge) {
      codesBadge.textContent = `${unused} of 5 Available`;
      codesBadge.className = unused > 0 ? 'text-[10px] font-mono text-cyan-300' : 'text-[10px] font-mono text-rose-400 font-bold';
    }

    if (grid) {
      grid.innerHTML = codes.map((item, idx) => `
        <div class="p-2 rounded-lg bg-black/70 border ${item.used ? 'border-slate-800 opacity-60' : 'border-slate-700'} flex items-center justify-between">
          <span class="text-slate-400 text-[10px]">#${idx + 1}</span>
          <span class="${item.used ? 'text-slate-500 line-through' : 'text-cyan-300 font-bold'} font-mono tracking-wider">${item.code}</span>
          <span class="text-[9px] uppercase px-1.5 py-0.5 rounded ${item.used ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'}">
            ${item.used ? 'USED' : 'AVAILABLE'}
          </span>
        </div>
      `).join('');
    }
  }

  function copyBackupCodes() {
    const codes = getBackupCodes();
    const lines = [
      'ARC TRACKER - EMERGENCY BACKUP CODES',
      `Generated: ${new Date().toISOString()}`,
      ...codes.map((c, i) => `Code #${i + 1}: ${c.code} [${c.used ? 'USED' : 'AVAILABLE'}]`)
    ].join('\n');
    if (window.ArcSecurity && typeof window.ArcSecurity.copySensitiveWithAutoClear === 'function') {
      window.ArcSecurity.copySensitiveWithAutoClear(lines, 'Backup codes');
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(lines);
      if (typeof showToast === 'function') showToast('Backup codes copied');
      if (window.playSfx) window.playSfx('click');
    }
  }

  function downloadBackupCodes() {
    const codes = getBackupCodes();
    const lines = [
      'ARC TRACKER - EMERGENCY BACKUP CODES',
      `Generated: ${new Date().toISOString()}`,
      ...codes.map((c, i) => `Code #${i + 1}: ${c.code} [${c.used ? 'USED' : 'AVAILABLE'}]`)
    ].join('\n');
    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arc-tracker-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    if (typeof showToast === 'function') showToast('Backup codes downloaded');
  }

  function regenerateBackupCodes() {
    if (!confirm('Regenerate 5 new backup codes? Any previously issued backup codes will become invalid.')) return;
    const newCodes = generate5BackupCodes();
    localStorage.setItem(KEY_BACKUP_CODES, JSON.stringify(newCodes));
    renderActiveManagementView();
    updateSettingsRow();
    if (window.playSfx) window.playSfx('fanfare');
    if (typeof showToast === 'function') showToast('5 fresh backup codes generated');
  }

  // --- REMOVAL OF 2FA ---
  function confirmRemove() {
    const msg = 'Are you sure you want to remove Two-Step Verification?\n\nYour account will no longer require a second authentication step to unlock.';
    if (!confirm(msg)) return;

    removeTwoFactor();
  }

  function removeTwoFactor() {
    localStorage.removeItem(KEY_ENABLED);
    localStorage.removeItem(KEY_METHOD);
    localStorage.removeItem(KEY_SECRET);
    localStorage.removeItem(KEY_PHONE);
    localStorage.removeItem(KEY_BACKUP_CODES);
    localStorage.removeItem(KEY_SMS_CODE);
    localStorage.removeItem(KEY_SMS_EXP);

    closeSetupModal();
    updateSettingsRow();

    if (window.playSfx) window.playSfx('modalClose');
    if (typeof showToast === 'function') {
      showToast('Two-Step Verification removed successfully.');
    }
  }

  // --- SETTINGS DRAWER ROW UPDATE ---
  function updateSettingsRow() {
    const badge = document.getElementById('sec-2fa-badge');
    const btnOpen = document.getElementById('btn-sec-open-2fa');
    const btnRemove = document.getElementById('btn-sec-remove-2fa');
    const methodText = document.getElementById('sec-2fa-method-text');
    const codesCount = document.getElementById('sec-2fa-codes-count');

    const active = isEnabled();
    const method = getMethod();
    const remaining = getRemainingCodesCount();

    if (badge) {
      if (active) {
        badge.textContent = `ACTIVE (${method === 'phone' ? 'SMS' : 'AUTHENTICATOR'})`;
        badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      } else {
        badge.textContent = 'OPTIONAL • DISABLED';
        badge.className = 'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700';
      }
    }

    if (btnOpen) {
      btnOpen.innerHTML = active
        ? '<i class="fa-solid fa-gear mr-1"></i> Manage 2FA &amp; Codes'
        : '<i class="fa-solid fa-shield-halved mr-1"></i> Setup Two-Step Verification';
    }

    if (btnRemove) {
      btnRemove.classList.toggle('hidden', !active);
    }

    if (methodText) {
      methodText.textContent = active
        ? (method === 'phone' ? 'SMS Phone' : 'Google Authenticator')
        : 'None';
    }

    if (codesCount) {
      codesCount.textContent = active ? `${remaining} of 5 available` : '5 unused';
    }
  }

  // --- LOCK OVERLAY STEP 2 CHALLENGE ---
  function resetOverlaySteps() {
    const s1 = document.getElementById('arc-lock-step-1');
    const s2 = document.getElementById('arc-lock-step-2');
    _challengeIsBackupMode = false;

    if (s1) s1.classList.remove('hidden');
    if (s2) s2.classList.add('hidden');

    const err = document.getElementById('arc-2fa-challenge-err');
    if (err) err.textContent = '';
    const inEl = document.getElementById('arc-2fa-challenge-input');
    if (inEl) inEl.value = '';
    const bIn = document.getElementById('arc-2fa-backup-input');
    if (bIn) bIn.value = '';
  }

  function showChallengeInOverlay() {
    const s1 = document.getElementById('arc-lock-step-1');
    const s2 = document.getElementById('arc-lock-step-2');
    const desc = document.getElementById('arc-2fa-challenge-desc');
    const smsWrap = document.getElementById('arc-2fa-sms-resend-wrap');
    const digitWrap = document.getElementById('arc-2fa-digit-wrap');
    const backupWrap = document.getElementById('arc-2fa-backup-wrap');
    const inEl = document.getElementById('arc-2fa-challenge-input');
    const err = document.getElementById('arc-2fa-challenge-err');

    if (err) err.textContent = '';
    if (inEl) inEl.value = '';

    if (s1) s1.classList.add('hidden');
    if (s2) {
      s2.classList.remove('hidden');
      s2.classList.add('flex');
    }

    _challengeIsBackupMode = false;
    if (digitWrap) digitWrap.classList.remove('hidden');
    if (backupWrap) backupWrap.classList.add('hidden');

    const method = getMethod();
    if (method === 'phone') {
      const phone = getPhone();
      if (desc) desc.textContent = `Enter 6-digit SMS code sent to ${phone}`;
      if (smsWrap) smsWrap.classList.remove('hidden');
      // Dispatch fresh SMS on challenge show
      dispatchSms(phone);
    } else {
      if (desc) desc.textContent = 'Enter 6-digit code from Google Authenticator';
      if (smsWrap) smsWrap.classList.add('hidden');
    }

    if (inEl) setTimeout(() => inEl.focus(), 150);
    if (window.playSfx) window.playSfx('modalOpen');
  }

  function backToPasswordStep() {
    resetOverlaySteps();
    const passIn = document.getElementById('arc-lock-pass-input');
    if (passIn) setTimeout(() => passIn.focus(), 150);
    if (window.playSfx) window.playSfx('click');
  }

  function resendChallengeSms() {
    const phone = getPhone();
    dispatchSms(phone);
    if (typeof showToast === 'function') showToast(`SMS resent to ${phone}`);
  }

  function toggleChallengeMode() {
    _challengeIsBackupMode = !_challengeIsBackupMode;
    const digitWrap = document.getElementById('arc-2fa-digit-wrap');
    const backupWrap = document.getElementById('arc-2fa-backup-wrap');
    const toggleText = document.getElementById('arc-2fa-toggle-mode-text');
    const err = document.getElementById('arc-2fa-challenge-err');
    if (err) err.textContent = '';

    if (_challengeIsBackupMode) {
      if (digitWrap) digitWrap.classList.add('hidden');
      if (backupWrap) backupWrap.classList.remove('hidden');
      if (toggleText) toggleText.textContent = 'Use 6-Digit Authenticator Code';
      const bIn = document.getElementById('arc-2fa-backup-input');
      if (bIn) setTimeout(() => bIn.focus(), 150);
    } else {
      if (digitWrap) digitWrap.classList.remove('hidden');
      if (backupWrap) backupWrap.classList.add('hidden');
      if (toggleText) toggleText.textContent = 'Use an Emergency Backup Code';
      const inEl = document.getElementById('arc-2fa-challenge-input');
      if (inEl) setTimeout(() => inEl.focus(), 150);
    }

    if (window.playSfx) window.playSfx('click');
  }

  async function submitChallengeUnlock() {
    const err = document.getElementById('arc-2fa-challenge-err');
    if (err) err.textContent = '';

    if (_challengeIsBackupMode) {
      // Validate emergency backup code
      const bIn = document.getElementById('arc-2fa-backup-input');
      const val = (bIn ? bIn.value : '').trim().toUpperCase().replace(/[\s-]/g, '');
      if (!val) {
        if (err) err.textContent = 'Please enter an 8-character backup code.';
        return;
      }

      const codes = getBackupCodes();
      const match = codes.find(c => c.code.replace('-', '') === val);
      if (!match) {
        if (err) err.textContent = 'Invalid backup code. Please check and try again.';
        if (window.playSfx) window.playSfx('uncheck');
        return;
      }
      if (match.used) {
        if (err) err.textContent = 'This backup code has already been redeemed.';
        if (window.playSfx) window.playSfx('uncheck');
        return;
      }

      // Mark code used
      match.used = true;
      match.usedAt = Date.now();
      localStorage.setItem(KEY_BACKUP_CODES, JSON.stringify(codes));
      const remaining = codes.filter(c => !c.used).length;

      // Unlock
      if (window.ArcSecurity && typeof window.ArcSecurity.hideLockScreen === 'function') {
        window.ArcSecurity.hideLockScreen();
      }
      if (window.ArcSecurity && typeof window.ArcSecurity.showUnlockLoadingScreen === 'function') {
        window.ArcSecurity.showUnlockLoadingScreen();
      }
      if (typeof showToast === 'function') {
        showToast(`🔑 Backup code verified! (${remaining} of 5 remaining)`);
      }
      return;
    }

    // Validate 6-digit TOTP or SMS code
    const inEl = document.getElementById('arc-2fa-challenge-input');
    const val = (inEl ? inEl.value : '').trim();
    if (!val || val.length !== 6) {
      if (err) err.textContent = 'Please enter a 6-digit verification code.';
      return;
    }

    const method = getMethod();
    let isOk = false;

    if (method === 'phone') {
      const stored = localStorage.getItem(KEY_SMS_CODE);
      const exp = parseInt(localStorage.getItem(KEY_SMS_EXP) || '0', 10);
      if (Date.now() > exp) {
        if (err) err.textContent = 'SMS code has expired. Click Resend SMS Code.';
        return;
      }
      isOk = (val === stored);
    } else {
      const secret = getSecret();
      isOk = await verifyTOTP(secret, val);
    }

    if (isOk) {
      if (window.ArcSecurity && typeof window.ArcSecurity.hideLockScreen === 'function') {
        window.ArcSecurity.hideLockScreen();
      }
      if (window.ArcSecurity && typeof window.ArcSecurity.showUnlockLoadingScreen === 'function') {
        window.ArcSecurity.showUnlockLoadingScreen();
      }
    } else {
      if (err) err.textContent = 'Incorrect verification code. Please try again.';
      if (window.playSfx) window.playSfx('uncheck');
      if (inEl) {
        inEl.classList.add('border-rose-500');
        setTimeout(() => inEl.classList.remove('border-rose-500'), 1000);
      }
    }
  }

  function init() {
    updateSettingsRow();

    // Listen for Enter on 2FA challenge input
    const chalIn = document.getElementById('arc-2fa-challenge-input');
    if (chalIn) {
      chalIn.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitChallengeUnlock();
        }
      });
    }

    const backupIn = document.getElementById('arc-2fa-backup-input');
    if (backupIn) {
      backupIn.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitChallengeUnlock();
        }
      });
    }
  }

  return {
    isEnabled,
    getMethod,
    getSecret,
    getPhone,
    getBackupCodes,
    getRemainingCodesCount,
    openSetupModal,
    closeSetupModal,
    selectMethod,
    fillCurrentTOTP,
    verifySetupCode,
    sendSetupSms,
    verifySetupSms,
    onConfirmSavedChange,
    copySecretKey,
    copySetupBackupCodes,
    downloadSetupBackupCodes,
    activateTwoFactor,
    copyBackupCodes,
    downloadBackupCodes,
    regenerateBackupCodes,
    confirmRemove,
    removeTwoFactor,
    updateSettingsRow,
    resetOverlaySteps,
    showChallengeInOverlay,
    backToPasswordStep,
    resendChallengeSms,
    toggleChallengeMode,
    submitChallengeUnlock,
    init
  };
})();

// Auto-initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', window.ArcTwoFactor.init);
} else {
  window.ArcTwoFactor.init();
}
