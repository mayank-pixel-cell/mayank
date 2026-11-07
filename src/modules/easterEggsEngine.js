(function() {
  'use strict';

  // --- 1. EASTER EGG REGISTRY & PERSISTENCE ---
  const EASTER_EGGS = {
    konami: { id: 'konami', name: 'Retro Arcade 1986', desc: 'Entered the legendary Konami Code sequence.' },
    matrix: { id: 'matrix', name: 'Digital Matrix Protocol', desc: 'Discovered the Matrix cyber code rain.' },
    spider: { id: 'spider', name: 'Spider Web Overdrive', desc: 'Hypercharged the Pillar Spider Web radar.' },
    zen: { id: 'zen', name: 'Zen Meditation Sanctum', desc: 'Activated the tranquil breathing sanctuary.' },
    godmode: { id: 'godmode', name: 'Divine Discipline God Mode', desc: 'Unlocked the radiant prismatic halo of mastery.' },
    logo7: { id: 'logo7', name: 'The Architect\'s Seal', desc: 'Harmonized 7 keystones on the Arc emblem.' },
    core3: { id: 'core3', name: 'Quantum Core Overclock', desc: 'Triple-pulsed the central Arc Score reactor.' },
    inferno: { id: 'inferno', name: 'Inferno Momentum Surge', desc: 'Triggered the blazing 5-strike streak surge.' },
    harmonic: { id: 'harmonic', name: 'Harmonic Convergence', desc: 'Connected all 4 spider web pillars in celestial sequence.' },
    cyberdeck: { id: 'cyberdeck', name: 'Architect Cyberdeck', desc: 'Accessed the classified terminal via the quantum micro-node.' }
  };

  function getFoundSecrets() {
    try {
      return JSON.parse(localStorage.getItem('arc_secrets_found') || '[]');
    } catch(e) {
      return [];
    }
  }

  function saveFoundSecret(id) {
    const found = getFoundSecrets();
    if (!found.includes(id)) {
      found.push(id);
      try { localStorage.setItem('arc_secrets_found', JSON.stringify(found)); } catch(e) {}
      return true;
    }
    return false;
  }

  window.unlockEasterEgg = function(id, customTitle, customDesc) {
    const meta = EASTER_EGGS[id] || { name: customTitle || 'Classified Secret', desc: customDesc || 'Hidden feature discovered.' };
    const isNew = saveFoundSecret(id);
    const found = getFoundSecrets();
    const totalCount = Object.keys(EASTER_EGGS).length;

    // Synchronize to state.gam.bd
    const appState = (typeof state !== 'undefined' ? state : (window.state || (window.state = {})));
    appState.gam = appState.gam || { rank: 0, bd: {}, init: false };
    appState.gam.bd = appState.gam.bd || {};
    appState.gam.bd['ee_' + id] = appState.gam.bd['ee_' + id] || Date.now();
    window.state = appState;

    // Check if all 10 Easter eggs are unlocked to grant the Extra Grand Achievement
    const all10Keys = ['konami', 'matrix', 'spider', 'zen', 'godmode', 'logo7', 'core3', 'inferno', 'harmonic', 'cyberdeck'];
    const allUnlocked = all10Keys.every(k => found.includes(k));
    let newlyGrantedGrand = false;
    if (allUnlocked && !appState.gam.bd['ee_all']) {
      appState.gam.bd['ee_all'] = Date.now();
      newlyGrantedGrand = true;
    }

    if (typeof saveToLocalStorage === 'function') {
      try { saveToLocalStorage(); } catch(e) {}
    }

    if (typeof playSfx === 'function') playSfx('secretUnlocked');
    if (typeof triggerConfettiBurst === 'function') triggerConfettiBurst(window.innerWidth / 2, window.innerHeight / 3);

    showEasterEggToast(`🏆 SECRET ${isNew ? 'UNLOCKED' : 'ENGAGED'}: ${meta.name} (${found.length}/${totalCount})`, meta.desc);

    console.log(
      `%c[ARCHITECT SECRET UNLOCKED]%c ${meta.name} (${found.length}/${totalCount} Found)\n%c${meta.desc}`,
      'background: #00F0FF; color: #000; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      'color: #F59E0B; font-weight: bold; margin-left: 6px;',
      'color: #94A3B8; font-style: italic;'
    );

    // If all 10 were completed, trigger the Extra Grand Achievement celebration!
    if (newlyGrantedGrand) {
      setTimeout(() => {
        showEasterEggToast(
          '👑 EXTRA ACHIEVEMENT: Omniscient Architect!',
          'ALL 10 HIDDEN EASTER EGGS MASTERED! The supreme crown achievement is now unlocked in your Badges matrix!'
        );
        if (typeof playSfx === 'function') playSfx('fanfare');
        if (typeof triggerConfettiBurst === 'function') {
          const cx = window.innerWidth / 2, cy = window.innerHeight / 3;
          for (let i = 0; i < 4; i++) {
            setTimeout(() => triggerConfettiBurst(cx + (Math.random() - 0.5) * 220, cy + (Math.random() - 0.5) * 120), i * 160);
          }
        }
      }, 500);
    }

    // Live refresh of Badges & Progression UI
    if (typeof rXP === 'function' && typeof calc === 'function') {
      try { rXP(calc()); } catch(e) {}
    }
    if (typeof renderProgressionTab === 'function') {
      try { renderProgressionTab(); } catch(e) {}
    }
    const modal = document.getElementById('p13-m');
    if (modal && modal.classList.contains('open') && typeof bdHtml === 'function') {
      const bBox = modal.querySelector('.bx');
      if (bBox) {
        bBox.innerHTML = '<button role="button" class="p13-x focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-p13="x" aria-label="Close">✕</button>' + bdHtml();
      }
    }
  };

  function showEasterEggToast(title, desc) {
    let container = document.getElementById('egg-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'egg-toast-container';
      container.className = 'fixed top-20 right-4 sm:right-6 z-[120] pointer-events-none flex flex-col gap-2 max-w-sm w-full';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'glass-card egg-discovery-toast p-3.5 sm:p-4 rounded-2xl shadow-2xl flex items-start gap-3 transform translate-x-12 opacity-0 transition-all duration-300 pointer-events-auto';
    toast.innerHTML = `
      <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-cyan-400 flex items-center justify-center text-black font-black text-lg flex-none shadow-md">
        <i class="fa-solid fa-trophy text-black text-sm"></i>
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-xs font-black text-amber-300 tracking-wide">${title}</div>
        <p class="text-[11px] text-slate-200 mt-0.5 leading-snug">${desc}</p>
      </div>
      <button type="button" class="text-slate-400 hover:text-white transition p-1 text-xs" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.remove('translate-x-12', 'opacity-0');
      toast.classList.add('translate-x-0', 'opacity-100');
    });

    setTimeout(() => {
      if (toast && toast.parentNode) {
        toast.classList.add('translate-x-12', 'opacity-0');
        setTimeout(() => toast.remove(), 350);
      }
    }, 4500);
  }

  // --- 2. SPIDER WEB INTERACTIVE EFFECTS & OVERDRIVE ---
  window.triggerSpiderPulseEffect = function() {
    const card = document.getElementById('spider-web-card-container');
    const svg = document.getElementById('pie-chart-svg');
    if (!svg) return;

    svg.classList.add('spider-shockwave-active');
    if (card) card.classList.add('spider-card-pulsing');
    if (typeof playSfx === 'function') playSfx('radarPing');

    const rect = svg.getBoundingClientRect();
    if (typeof triggerGradeParticleBurst === 'function') {
      triggerGradeParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 'A');
    }

    setTimeout(() => {
      svg.classList.remove('spider-shockwave-active');
      if (card) card.classList.remove('spider-card-pulsing');
    }, 700);
  };

  let hubClickCount = 0;
  let hubClickTimer = null;
  window.handleCenterHubClick = function(event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    hubClickCount++;

    clearTimeout(hubClickTimer);
    hubClickTimer = setTimeout(() => {
      hubClickCount = 0;
    }, 850);

    if (hubClickCount >= 3) {
      hubClickCount = 0;
      // UNLOCK EASTER EGG: Quantum Core Overclock
      activateSpiderOverdrive(14);
      unlockEasterEgg('core3', 'Quantum Core Overclock', 'Overclocked the central reactor matrix with triple-frequency harmonics.');
    } else {
      triggerSpiderPulseEffect();
    }
  };

  let overdriveTimer = null;
  function activateSpiderOverdrive(durationSeconds = 12) {
    const card = document.getElementById('spider-web-card-container');
    if (!card) return;

    card.classList.add('spider-overdrive-active');
    if (typeof playSfx === 'function') playSfx('quantumHum');

    const hoverDetails = document.getElementById('pie-hover-details');
    if (hoverDetails) {
      hoverDetails.innerHTML = '<span class="text-cyan-300 font-bold animate-pulse">⚡ QUANTUM CORE OVERDRIVE ACTIVE: MAXIMUM DISCIPLINE FLUX ⚡</span>';
    }

    clearTimeout(overdriveTimer);
    overdriveTimer = setTimeout(() => {
      card.classList.remove('spider-overdrive-active');
      if (hoverDetails) {
        hoverDetails.textContent = 'Tap any spider web vertex to inspect category contribution.';
      }
    }, durationSeconds * 1000);
  }

  // Harmonic Quad-Combo tracker for spider web nodes
  let nodeSequence = [];
  let nodeSequenceTimer = null;
  const HARMONIC_TARGET = ['Physical', 'Mindset', 'Discipline', 'Productivity'];

  window.handleSpiderNodeClick = function(cat, pct, event) {
    if (typeof showCategoryDetail === 'function') showCategoryDetail(cat, pct);
    if (typeof playSfx === 'function') playSfx('click');

    nodeSequence.push(cat);
    clearTimeout(nodeSequenceTimer);
    nodeSequenceTimer = setTimeout(() => { nodeSequence = []; }, 5500);

    if (nodeSequence.length >= 4) {
      const lastFour = nodeSequence.slice(-4);
      const isHarmonic = HARMONIC_TARGET.every((c, i) => lastFour[i] === c);
      if (isHarmonic) {
        nodeSequence = [];
        triggerSpiderPulseEffect();
        activateSpiderOverdrive(8);
        unlockEasterEgg('harmonic', 'Harmonic Convergence', 'Activated all four pillars in the sacred clockwise alignment.');
      }
    }
  };

  // --- 3. SPECIFIC CLICK PATTERNS ---
  // A) Arc Logo 7-Click Secret
  let logoClickCount = 0;
  let logoClickTimer = null;
  window.handleLogoIconClick = function(event) {
    if (event) event.preventDefault();
    if (typeof playSfx === 'function') playSfx('fanfare');
    if (typeof triggerConfettiBurst === 'function') triggerConfettiBurst();

    logoClickCount++;
    clearTimeout(logoClickTimer);
    logoClickTimer = setTimeout(() => { logoClickCount = 0; }, 2600);

    if (logoClickCount >= 7) {
      logoClickCount = 0;
      openMandalaEasterEgg();
      unlockEasterEgg('logo7', 'The Architect\'s Seal', 'Harmonized 7 strikes upon the sacred Arc emblem.');
    }
  };

  function openMandalaEasterEgg() {
    const modal = document.getElementById('mandala-easter-egg-modal');
    if (modal) {
      modal.classList.remove('hidden');
      if (typeof playSfx === 'function') playSfx('secretUnlocked');
    }
  }

  window.closeMandalaEasterEgg = function() {
    const modal = document.getElementById('mandala-easter-egg-modal');
    if (modal) modal.classList.add('hidden');
  };

  // B) Lock-In Streak 5-Click Surge
  let streakClickCount = 0;
  let streakClickTimer = null;
  window.handleStreakCardClick = function(event) {
    streakClickCount++;
    clearTimeout(streakClickTimer);
    streakClickTimer = setTimeout(() => { streakClickCount = 0; }, 2000);

    const fireIcon = document.getElementById('streak-fire-icon');
    if (fireIcon) {
      fireIcon.style.transform = `scale(${1 + streakClickCount * 0.2}) rotate(${streakClickCount % 2 === 0 ? 12 : -12}deg)`;
    }

    if (streakClickCount >= 5) {
      streakClickCount = 0;
      if (fireIcon) fireIcon.style.transform = '';
      if (typeof playSfx === 'function') playSfx('infernoRoar');
      if (typeof triggerConfettiBurst === 'function') {
        const rect = (event && event.currentTarget) ? event.currentTarget.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2 };
        triggerConfettiBurst(rect.left + 50, rect.top);
      }
      unlockEasterEgg('inferno', 'Inferno Momentum Surge', 'Unlocked maximum thermal discipline with 5 rapid surge strikes.');
    } else {
      if (typeof playSfx === 'function') playSfx('click');
    }
  };

  // --- 4. SECRET KEYBOARD SEQUENCES ---
  const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiIndex = 0;
  let keyHistory = '';

  document.addEventListener('keydown', function(e) {
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : '';
    const isEditing = (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable);

    // Allow escape in modal overlays even when focused
    if (e.key === 'Escape') {
      const matrix = document.getElementById('matrix-rain-overlay');
      if (matrix && !matrix.classList.contains('hidden')) { toggleMatrixRain(false); return; }
      const cyber = document.getElementById('cyberdeck-terminal-modal');
      if (cyber && !cyber.classList.contains('hidden')) { toggleCyberdeckTerminal(false); return; }
      const mandala = document.getElementById('mandala-easter-egg-modal');
      if (mandala && !mandala.classList.contains('hidden')) { closeMandalaEasterEgg(); return; }
    }

    if (isEditing) return;

    // Check Konami Code
    const expectedKey = KONAMI_CODE[konamiIndex];
    if (e.key.toLowerCase() === expectedKey.toLowerCase()) {
      konamiIndex++;
      if (konamiIndex === KONAMI_CODE.length) {
        konamiIndex = 0;
        toggleRetroArcadeMode();
        unlockEasterEgg('konami', 'Retro Arcade 1986', 'Entered the 30-Lives retro gaming Konami sequence.');
      }
    } else {
      konamiIndex = (e.key.toLowerCase() === KONAMI_CODE[0].toLowerCase()) ? 1 : 0;
    }

    // Buffer matching for secret words
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      keyHistory += e.key.toLowerCase();
      if (keyHistory.length > 25) keyHistory = keyHistory.slice(-25);

      if (keyHistory.endsWith('matrix')) {
        keyHistory = '';
        toggleMatrixRain(true);
        unlockEasterEgg('matrix', 'Digital Matrix Protocol', 'Accessed the falling code matrix through the terminal keyword.');
      } else if (keyHistory.endsWith('spider') || keyHistory.endsWith('web')) {
        keyHistory = '';
        const spiderCard = document.getElementById('spider-web-card-container');
        if (spiderCard) spiderCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        activateSpiderOverdrive(14);
        unlockEasterEgg('spider', 'Spider Web Overdrive', 'Engaged hyper-speed radar diagnostics via secret command.');
      } else if (keyHistory.endsWith('zen')) {
        keyHistory = '';
        toggleZenMode();
        unlockEasterEgg('zen', 'Zen Meditation Sanctum', 'Attuned mind and habits to the tranquil obsidian stillness.');
      } else if (keyHistory.endsWith('god') || keyHistory.endsWith('godmode')) {
        keyHistory = '';
        toggleGodMode();
        unlockEasterEgg('godmode', 'Divine Discipline God Mode', 'Invoked the chromatic aura of absolute consistency.');
      } else if (keyHistory.endsWith('disco')) {
        keyHistory = '';
        toggleDiscoMode();
      }
    }
  });

  function toggleRetroArcadeMode() {
    document.body.classList.toggle('retro-arcade-mode');
    const isActive = document.body.classList.contains('retro-arcade-mode');
    if (typeof playSfx === 'function') playSfx('arcadeChiptune');
    if (typeof showToast === 'function') showToast(isActive ? '🕹️ 1986 Retro Arcade CRT Mode Active' : 'CRT Scanlines Disabled');
  }

  function toggleGodMode() {
    document.body.classList.toggle('god-mode-active');
    const isActive = document.body.classList.contains('god-mode-active');
    if (typeof playSfx === 'function') playSfx(isActive ? 'fanfare' : 'click');
    if (typeof triggerConfettiBurst === 'function' && isActive) triggerConfettiBurst();
    if (typeof showToast === 'function') showToast(isActive ? '✨ Divine God Mode: Prismatic Mastery Active' : 'God Mode Deactivated');
  }

  function toggleZenMode() {
    document.body.classList.toggle('zen-mode-active');
    const isActive = document.body.classList.contains('zen-mode-active');
    if (typeof playSfx === 'function') playSfx('zenChime');
    if (typeof showToast === 'function') showToast(isActive ? '🧘 Zen Sanctum Active: Breathe & Focus' : 'Zen Sanctum Closed');
  }

  let discoInterval = null;
  function toggleDiscoMode() {
    if (discoInterval) {
      clearInterval(discoInterval);
      discoInterval = null;
      document.body.style.filter = '';
      if (typeof showToast === 'function') showToast('Disco Mode Off');
    } else {
      let hue = 0;
      discoInterval = setInterval(() => {
        hue = (hue + 45) % 360;
        document.body.style.filter = `hue-rotate(${hue}deg)`;
      }, 350);
      if (typeof playSfx === 'function') playSfx('fanfare');
      if (typeof showToast === 'function') showToast('🕺 Disco Party Mode Active!');
    }
  }

  // --- 5. FULLSCREEN MATRIX CODE RAIN OVERLAY ---
  let matrixAnimId = null;
  window.toggleMatrixRain = function(show) {
    const overlay = document.getElementById('matrix-rain-overlay');
    const canvas = document.getElementById('matrix-canvas');
    if (!overlay || !canvas) return;

    if (show) {
      overlay.classList.remove('hidden');
      if (typeof playSfx === 'function') playSfx('matrixGlitch');

      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ010101❄️☀️ARC⚡discipline';
      const fontSize = 16;
      const columns = Math.floor(canvas.width / fontSize);
      const drops = Array(columns).fill(1);

      function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = `${fontSize}px monospace`;
        for (let i = 0; i < drops.length; i++) {
          const text = chars.charAt(Math.floor(Math.random() * chars.length));
          const isLead = Math.random() < 0.15;
          ctx.fillStyle = isLead ? '#FFFFFF' : '#10B981';
          ctx.shadowBlur = isLead ? 8 : 2;
          ctx.shadowColor = '#00F0FF';
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);

          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
        matrixAnimId = requestAnimationFrame(drawMatrix);
      }
      cancelAnimationFrame(matrixAnimId);
      drawMatrix();
    } else {
      overlay.classList.add('hidden');
      cancelAnimationFrame(matrixAnimId);
    }
  };

  // --- 6. CYBERDECK HACKER TERMINAL HUD ---
  window.toggleCyberdeckTerminal = function(show) {
    const modal = document.getElementById('cyberdeck-terminal-modal');
    const input = document.getElementById('cyberdeck-input');
    if (!modal) return;

    if (show) {
      modal.classList.remove('hidden');
      unlockEasterEgg('cyberdeck', 'Architect Cyberdeck', 'Discovered the hidden quantum micro-node terminal in the footer.');
      if (typeof playSfx === 'function') playSfx('radarPing');
      setTimeout(() => { if (input) input.focus(); }, 100);
    } else {
      modal.classList.add('hidden');
    }
  };

  window.executeCyberdeckCommand = function() {
    const input = document.getElementById('cyberdeck-input');
    const output = document.getElementById('cyberdeck-output');
    if (!input || !output) return;

    const raw = (input.value || '').trim();
    if (!raw) return;
    input.value = '';

    const cmd = raw.toLowerCase();
    appendOutput(`&gt; ${escapeHtml(raw)}`, 'text-cyan-300 font-bold');
    if (typeof playSfx === 'function') playSfx('click');

    if (cmd === 'help') {
      appendOutput(`AVAILABLE PROTOCOLS:
  matrix        - Engage digital code rain overlay
  spider        - Overdrive Pillar Spider Web radar
  godmode       - Toggle Divine Discipline prismatic aura
  zen           - Enter tranquil Zen meditation sanctum
  retro         - Toggle 1986 CRT arcade scanlines
  supernova     - Trigger cosmic celestial particle blast
  disco         - Toggle rhythmic neon disco colors
  server        - Inspect external cloud server telemetry & sync health
  gold          - Display Arc Gold VIP supporters roster & license status
  ranks         - Print live Regional, Country, and Global ladder standings
  status        - Print discovered Easter egg progress
  dossier       - Print classified habit telemetry report
  clear         - Clear terminal display log
  exit          - Disconnect and exit terminal`, 'text-emerald-300');
    } else if (cmd === 'server' || cmd === 'telemetry') {
      const sync = window.ArcServerSync;
      const url = sync ? sync.serverUrl : 'https://zkxcwogqodwixfgmxdiy.supabase.co';
      const online = sync ? sync.isOnline : false;
      const tel = sync && sync.cachedTelemetry ? sync.cachedTelemetry : null;
      const users = tel ? tel.totalUsers : 16;
      const activeToday = tel ? tel.activeTodayCount : 16;
      const gold = tel ? tel.totalGoldUsers : 11;
      const squads = tel ? tel.totalGroups : 4;
      const time = tel ? tel.serverTime : new Date().toISOString();

      appendOutput(`EXTERNAL CLOUD BACKEND TELEMETRY:
  Endpoint URL    : ${url}
  Server Status   : ${online ? '🟢 ONLINE • CONNECTED' : '🟡 OFFLINE CACHE • RECONNECTING'}
  Total Operatives: ${users} registered accounts
  Active Today    : ${activeToday} operatives (last 24h)
  Arc Gold VIPs   : ${gold} active supporters
  Active Squads   : ${squads} units configured
  Timestamp       : ${time}
  Sync Protocol   : Supabase PostgreSQL Realtime`, 'text-cyan-300');
    } else if (cmd === 'gold' || cmd === 'vip') {
      const isGold = !!(window.ArcGold && window.ArcGold.isGold());
      const gState = window.ArcGold && window.ArcGold.getState ? window.ArcGold.getState() : null;
      const myPlan = gState ? (gState.planName || gState.plan || 'Free') : (isGold ? 'VIP Active' : 'Free');
      const sync = window.ArcServerSync;
      const goldUsers = (sync && sync.cachedGoldUsers && sync.cachedGoldUsers.length) ? sync.cachedGoldUsers : [];

      let msg = `ARC GOLD VIP ROSTER & LICENSE STATUS:
  Your Status     : ${isGold ? '👑 ' + myPlan.toUpperCase() + ' (120Hz ProMotion Active)' : 'STANDARD FREE TIER (60 FPS)'}
  Total Gold VIPs : ${goldUsers.length || 11} Supporters Enrolled\n`;

      if (goldUsers.length > 0) {
        msg += `  HONOR ROLL OF VIP SUPPORTERS:\n`;
        goldUsers.slice(0, 8).forEach((u, i) => {
          const plan = (u.goldPlan || 'annual').toUpperCase();
          msg += `   [#${i+1}] ${u.handle.padEnd(20)} | Plan: ${plan.padEnd(8)} | Lvl: ${String(u.level).padEnd(2)} | Score: ${u.arcScore}%\n`;
        });
      }
      appendOutput(msg, 'text-amber-300');
    } else if (cmd === 'ranks' || cmd === 'rank' || cmd === 'ladder') {
      const sync = window.ArcServerSync;
      const p = sync ? sync.getOperativePayload() : null;
      const ranks = sync ? sync.cachedRanks : null;
      const lb = window.ArcLeaderboardGroups;
      const regRank = ranks ? ranks.regionalRank : (lb ? lb.leaderboardData.regional.userRank : 7);
      const natRank = ranks ? ranks.countryRank : (lb ? lb.leaderboardData.country.userRank : 42);
      const globRank = ranks ? ranks.globalRank : (lb ? lb.leaderboardData.global.userRank : 284);
      const pct = ranks ? ranks.percentile : (lb ? lb.leaderboardData.regional.userPercentile : 'Top 1%');

      const lvl = p ? p.level : (window.state && window.state.level ? window.state.level : 1);
      const score = (window.state && window.state.overallArcIndex) ? window.state.overallArcIndex : '15%';
      const streak = (window.state && window.state.streak) ? window.state.streak : 0;

      appendOutput(`LIVE COMPETITIVE LADDER STANDINGS:
  Operative Handle: ${p ? p.handle : '@operative'}
  Sector / Region : ${p ? p.region : 'Western Metro Zone'}
  Nation / League : ${p ? p.country : 'India'}
  Current Level   : Level ${lvl} (${p ? p.xp : 0} XP)
  Arc Score       : ${score} (Streak: ${streak}d)
  -----------------------------------------------
  Regional Ladder : #${regRank} Sector Standing
  National League : #${natRank} Country League
  Global Syndicate: #${globRank} Worldwide Ladder
  Percentile Tier : ${pct} Elite
  Ladder Status   : ${lvl >= 10 ? '🏆 UNLOCKED (Level 10+ Adept)' : '🔒 LOCKED (Requires Level 10)'}`, 'text-emerald-300');
    } else if (cmd === 'matrix') {
      toggleCyberdeckTerminal(false);
      toggleMatrixRain(true);
    } else if (cmd === 'spider') {
      toggleCyberdeckTerminal(false);
      const card = document.getElementById('spider-web-card-container');
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      activateSpiderOverdrive(14);
      unlockEasterEgg('spider');
    } else if (cmd === 'godmode' || cmd === 'god') {
      toggleGodMode();
      appendOutput('SUCCESS: God Mode state altered.', 'text-amber-400');
    } else if (cmd === 'zen') {
      toggleZenMode();
      appendOutput('SUCCESS: Zen Sanctum state altered.', 'text-cyan-400');
    } else if (cmd === 'retro' || cmd === 'arcade') {
      toggleRetroArcadeMode();
      appendOutput('SUCCESS: Retro Arcade CRT mode altered.', 'text-amber-400');
    } else if (cmd === 'supernova') {
      if (typeof ArcSecrets !== 'undefined') ArcSecrets.supernova();
      appendOutput('ALERT: Solar flare supernova burst discharged.', 'text-amber-300');
    } else if (cmd === 'disco') {
      toggleDiscoMode();
    } else if (cmd === 'status' || cmd === 'secrets') {
      const found = getFoundSecrets();
      const total = Object.keys(EASTER_EGGS).length;
      const hasGrand = !!(window.state && window.state.gam && window.state.gam.bd && window.state.gam.bd['ee_all']);
      let msg = `SECRETS ARCHIVE (${found.length}/${total} UNLOCKED | GRAND: ${hasGrand ? '👑 UNLOCKED' : '🔒 LOCKED'}):\n`;
      Object.values(EASTER_EGGS).forEach(e => {
        const has = found.includes(e.id);
        msg += `  ${has ? '✅' : '🔒'} ${e.name.padEnd(28)} - ${has ? e.desc : 'CLASSIFIED'}\n`;
      });
      msg += `  ${hasGrand ? '👑' : '🔒'} Omniscient Architect (EXTRA) - ${hasGrand ? 'MASTER OF SECRETS: All 10 Easter eggs unlocked!' : `LOCKED (${found.length}/10 unlocked)`}\n`;
      appendOutput(msg, 'text-cyan-200');
    } else if (cmd === 'dossier') {
      const habits = (state && state.habits) ? state.habits.length : 0;
      const arc = (state && state.currentArc) ? state.currentArc.toUpperCase() : 'WINTER';
      appendOutput(`HABIT DOSSIER TELEMETRY:
  Active Arc       : ${arc}
  Tracked Pillars  : ${habits} Pillars Configured
  Current Level    : LVL ${state.level || 1} (${state.xp || 0} XP)
  Security Hash    : SHA-256-${Math.random().toString(36).substring(2, 10).toUpperCase()}
  Protocol Status  : LOCKED IN`, 'text-slate-300');
    } else if (cmd.startsWith('xp ')) {
      const val = parseInt(cmd.replace('xp ', ''), 10) || 500;
      state.xp = (state.xp || 0) + val;
      if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
      if (typeof updateRpgLevelUI === 'function') updateRpgLevelUI();
      appendOutput(`GRANTED: +${val} Bonus XP infused into telemetry profile.`, 'text-amber-300');
    } else if (cmd === 'clear') {
      output.innerHTML = '';
    } else if (cmd === 'exit' || cmd === 'quit') {
      toggleCyberdeckTerminal(false);
    } else {
      appendOutput(`ERROR: Command '${raw}' not recognized. Type 'help' for directory.`, 'text-rose-400');
    }

    output.scrollTop = output.scrollHeight;
  };

  function appendOutput(text, cssClass = 'text-emerald-400') {
    const output = document.getElementById('cyberdeck-output');
    if (!output) return;
    const div = document.createElement('div');
    div.className = cssClass + ' whitespace-pre-wrap leading-relaxed';
    div.innerHTML = text;
    output.appendChild(div);
  }

  function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  const cyberInput = document.getElementById('cyberdeck-input');
  if (cyberInput) {
    cyberInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeCyberdeckCommand();
      }
    });
  }

  // --- 7. DEVELOPER CONSOLE EASTER EGG & API (window.ArcSecrets) ---
  window.ArcSecrets = {
    help: function() {
      console.log(
        '%c=== ARC SECRETS COMMAND CODEX v2026 ===\n' +
        'ArcSecrets.matrix()          - Engage full-screen Matrix rain\n' +
        'ArcSecrets.spiderOverdrive() - Overclock Pillar Spider Web with plasma shine\n' +
        'ArcSecrets.godMode()         - Toggle Divine Discipline prismatic aura\n' +
        'ArcSecrets.zen()             - Toggle Zen meditation stillness & 432Hz chime\n' +
        'ArcSecrets.retro()           - Toggle 1986 Retro Arcade CRT scanline mode\n' +
        'ArcSecrets.supernova()       - Trigger screen-wide celestial supernova explosion\n' +
        'ArcSecrets.disco()           - Toggle pulsating neon disco mode\n' +
        'ArcSecrets.secretDossier()   - Print classified habit metrics in tabular format\n' +
        'ArcSecrets.status()          - Inspect discovered secrets registry\n' +
        'ArcSecrets.unlockAll()       - Unlock all 10 Easter eggs & Extra Grand Achievement (Omniscient Architect)\n' +
        'ArcSecrets.reset()           - Reset discovered secrets & achievements archive',
        'color: #00F0FF; font-family: monospace; font-size: 12px; line-height: 1.6;'
      );
      return 'Type any command above in this console (e.g., ArcSecrets.matrix()) to activate!';
    },
    matrix: function() {
      toggleMatrixRain(true);
      unlockEasterEgg('matrix');
      return 'Matrix digital rain initialized.';
    },
    spiderOverdrive: function(sec = 14) {
      const card = document.getElementById('spider-web-card-container');
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      activateSpiderOverdrive(sec);
      unlockEasterEgg('spider');
      return 'Spider Web Overdrive active!';
    },
    godMode: function() {
      toggleGodMode();
      unlockEasterEgg('godmode');
      return 'Divine God Mode toggled.';
    },
    zen: function() {
      toggleZenMode();
      unlockEasterEgg('zen');
      return 'Zen Sanctum toggled.';
    },
    retro: function() {
      toggleRetroArcadeMode();
      unlockEasterEgg('konami');
      return 'Retro Arcade 1986 mode toggled.';
    },
    disco: function() {
      toggleDiscoMode();
      return 'Disco mode toggled.';
    },
    supernova: function() {
      if (typeof playSfx === 'function') playSfx('infernoRoar');
      if (typeof triggerConfettiBurst === 'function') {
        const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
        for (let i = 0; i < 4; i++) {
          setTimeout(() => triggerConfettiBurst(cx + (Math.random() - 0.5) * 120, cy + (Math.random() - 0.5) * 120), i * 150);
        }
      }
      return 'Cosmic Supernova exploded across the Arc!';
    },
    secretDossier: function() {
      console.table({
        ArcMode: state.currentArc || 'winter',
        HabitCount: (state.habits || []).length,
        RpgLevel: state.level || 1,
        TotalXP: state.xp || 0,
        SecretsDiscovered: `${getFoundSecrets().length} / ${Object.keys(EASTER_EGGS).length}`
      });
      return 'Classified telemetry dossier printed.';
    },
    status: function() {
      const found = getFoundSecrets();
      const total = Object.keys(EASTER_EGGS).length;
      const hasGrand = !!(window.state && window.state.gam && window.state.gam.bd && window.state.gam.bd['ee_all']);
      console.log(`%c[ARC SECRETS ARCHIVE]%c ${found.length} / ${total} Discovered | Grand Achievement: ${hasGrand ? '👑 UNLOCKED' : '🔒 LOCKED'}`, 'background:#F59E0B; color:#000; font-weight:bold; padding:2px 6px;', 'color:#00F0FF; font-weight:bold; margin-left:6px;');
      Object.values(EASTER_EGGS).forEach(e => {
        const has = found.includes(e.id);
        console.log(`  ${has ? '✅' : '🔒'} %c${e.name.padEnd(28)}%c - ${has ? e.desc : '[CLASSIFIED]'}`, 'color:#38BDF8; font-weight:bold;', 'color:#94A3B8;');
      });
      console.log(`  ${hasGrand ? '👑' : '🔒'} %cOmniscient Architect (EXTRA)%c - ${hasGrand ? 'Master of Secrets: Unlocked all 10 hidden Easter eggs.' : '[LOCKED - Unlock all 10 Easter eggs to claim]'}`, 'color:#F59E0B; font-weight:bold;', 'color:#94A3B8;');
      return `${found.length}/${total} secrets discovered so far. Grand achievement: ${hasGrand ? 'UNLOCKED' : 'LOCKED'}.`;
    },
    unlockAll: function() {
      const appState = (typeof state !== 'undefined' ? state : (window.state || (window.state = {})));
      appState.gam = appState.gam || { rank: 0, bd: {}, init: false };
      appState.gam.bd = appState.gam.bd || {};
      window.state = appState;

      Object.keys(EASTER_EGGS).forEach(id => {
        saveFoundSecret(id);
        appState.gam.bd['ee_' + id] = appState.gam.bd['ee_' + id] || Date.now();
      });
      appState.gam.bd['ee_all'] = appState.gam.bd['ee_all'] || Date.now();

      if (typeof saveToLocalStorage === 'function') {
        try { saveToLocalStorage(); } catch(e) {}
      }
      showEasterEggToast('👑 GRAND MASTER: ALL SECRETS UNLOCKED', 'All 10 Easter eggs and the Extra Grand Achievement \'Omniscient Architect\' are now unlocked in your Badges section!');
      if (typeof playSfx === 'function') playSfx('fanfare');
      if (typeof triggerConfettiBurst === 'function') {
        const cx = window.innerWidth / 2, cy = window.innerHeight / 3;
        for (let i = 0; i < 4; i++) {
          setTimeout(() => triggerConfettiBurst(cx + (Math.random() - 0.5) * 220, cy + (Math.random() - 0.5) * 120), i * 160);
        }
      }
      if (typeof rXP === 'function' && typeof calc === 'function') {
        try { rXP(calc()); } catch(e) {}
      }
      if (typeof renderProgressionTab === 'function') {
        try { renderProgressionTab(); } catch(e) {}
      }
      const modal = document.getElementById('p13-m');
      if (modal && modal.classList.contains('open') && typeof bdHtml === 'function') {
        const bBox = modal.querySelector('.bx');
        if (bBox) bBox.innerHTML = '<button role="button" class="p13-x focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-p13="x" aria-label="Close">✕</button>' + bdHtml();
      }
      return 'All 10 Easter eggs and the Extra Grand Achievement (Omniscient Architect) unlocked!';
    },
    reset: function() {
      try { localStorage.removeItem('arc_secrets_found'); } catch(e) {}
      const appState = (typeof state !== 'undefined' ? state : (window.state || (window.state = {})));
      if (appState && appState.gam && appState.gam.bd) {
        Object.keys(appState.gam.bd).forEach(k => {
          if (k.startsWith('ee_')) delete appState.gam.bd[k];
        });
        if (typeof saveToLocalStorage === 'function') {
          try { saveToLocalStorage(); } catch(e) {}
        }
      }
      window.state = appState;
      if (typeof rXP === 'function' && typeof calc === 'function') {
        try { rXP(calc()); } catch(e) {}
      }
      if (typeof renderProgressionTab === 'function') {
        try { renderProgressionTab(); } catch(e) {}
      }
      const modal = document.getElementById('p13-m');
      if (modal && modal.classList.contains('open') && typeof bdHtml === 'function') {
        const bBox = modal.querySelector('.bx');
        if (bBox) bBox.innerHTML = '<button role="button" class="p13-x focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-p13="x" aria-label="Close">✕</button>' + bdHtml();
      }
      return 'Easter egg progress and badges reset to zero.';
    }
  };

  // Aliases for intuitive developer exploration
  window.cheat = window.ArcSecrets;
  window.arc = window.ArcSecrets;

  // --- 8. WELCOME BANNER ON CONSOLE LOAD ---
  function printDevConsoleGreeting() {
    const banner = 
`%c
  ██████╗ ██████╗  ██████╗     ██████╗ ██████╗ 
  ██╔══██╗██╔══██╗██╔═══██╗    ╚════██╗╚════██╗
  ██████╔╝██████╔╝██║   ██║     █████╔╝ █████╔╝
  ██╔═══╝ ██╔══██╗██║   ██║    ██╔═══╝ ██╔═══╝ 
  ██║     ██║  ██║╚██████╔╝    ███████╗███████╗
  ╚═╝     ╚═╝  ╚═╝ ╚═════╝     ╚══════╝╚══════╝
%c  WINTER & SUMMER ARC PROTOCOL v2026 // CLASSIFIED TELEMETRY
%c  [SECURITY LEVEL: ARCHITECT S-TIER]
  Discipline in the dark, dominance in the light.
  
  🕵️ Looking for hidden interactive features?
  Type %cArcSecrets.help()%c to access classified codes.`;

    console.log(
      banner,
      'color: #00F0FF; font-family: monospace; font-size: 11px; font-weight: bold; text-shadow: 0 0 8px rgba(0,240,255,0.7);',
      'color: #F59E0B; font-family: monospace; font-size: 11px; font-weight: bold;',
      'color: #94A3B8; font-family: monospace; font-size: 11px;',
      'color: #00F0FF; font-weight: bold; text-decoration: underline;',
      'color: #94A3B8;'
    );
  }

  // Run greeting on load
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    printDevConsoleGreeting();
  } else {
    window.addEventListener('DOMContentLoaded', printDevConsoleGreeting);
  }
})();
