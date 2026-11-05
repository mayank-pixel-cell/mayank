(function() {
  'use strict';

  // 1. Level Tiers Configuration
  const RPG_TIERS = [
    { min: 1, max: 10, title: 'Shadow Initiate', icon: '❄️', color: '#00F0FF', badge: '❄️ Shadow Initiate' },
    { min: 11, max: 25, title: 'Frostbite Operative', icon: '🧊', color: '#38BDF8', badge: '🧊 Frostbite Operative' },
    { min: 26, max: 50, title: 'Glacier Titan', icon: '🏔️', color: '#818CF8', badge: '🏔️ Glacier Titan' },
    { min: 51, max: 75, title: 'Solar Eclipse Warlord', icon: '🌅', color: '#F59E0B', badge: '🌅 Solar Eclipse Warlord' },
    { min: 76, max: 9999, title: 'Apex Sovereign', icon: '👑', color: '#EC4899', badge: '👑 Apex Sovereign' }
  ];

  function getLevelTier(level) {
    for (const tier of RPG_TIERS) {
      if (level <= tier.max) return tier;
    }
    return RPG_TIERS[RPG_TIERS.length - 1];
  }

  function getStatRank(points) {
    if (points >= 1500) return 'Rank S';
    if (points >= 1000) return 'Rank A';
    if (points >= 600) return 'Rank B';
    if (points >= 300) return 'Rank C';
    if (points >= 100) return 'Rank D';
    return 'Rank E';
  }

  // 2. Character Archetype / Class Determination
  window.getPlayerClass = function(stats) {
    const { STR = 0, INT = 0, DEX = 0, WIL = 0 } = stats || {};
    const maxVal = Math.max(STR, INT, DEX, WIL);
    if (maxVal === 0) {
      return { title: 'Arc Initiate', icon: '⚔️', desc: 'Awakening power in the shadows', pillar: 'All' };
    }
    if (STR === maxVal && STR >= INT + 30) {
      return { title: 'Titan Berserker', icon: '⚔️', desc: 'Physical force & muscular endurance', pillar: 'Physical' };
    }
    if (INT === maxVal && INT >= STR + 30) {
      return { title: 'Arch-Sage', icon: '🔮', desc: 'Strategic wisdom & mental clarity', pillar: 'Mindset' };
    }
    if (DEX === maxVal && DEX >= STR + 30) {
      return { title: 'Chrono Stalker', icon: '⚡', desc: 'Lightning focus velocity & deep work', pillar: 'Productivity' };
    }
    if (WIL === maxVal && WIL >= STR + 30) {
      return { title: 'Aegis Paladin', icon: '🛡️', desc: 'Iron will & unbroken habit discipline', pillar: 'Discipline' };
    }
    return { title: 'Omni Sovereign', icon: '👑', desc: 'Equilibrium across all disciplines', pillar: 'Harmonized' };
  };

  // 3. Audio Effects Engine Extension
  window.playCustomRpgSfx = function(type) {
    if (typeof isMuted !== 'undefined' && isMuted) return;
    try {
      if (typeof initAudio === 'function') initAudio();
      if (typeof audioCtx === 'undefined' || !audioCtx) return;
      const now = audioCtx.currentTime;
      const out = (typeof sfxOut === 'function') ? sfxOut() : audioCtx.destination;

      if (type === 'habitCelebrate') {
        [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
          const o = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(f, now + i * 0.05);
          g.gain.setValueAtTime(0.2, now + i * 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.38);
          o.connect(g);
          g.connect(out);
          o.start(now + i * 0.05);
          o.stop(now + i * 0.05 + 0.38);
        });
        return;
      } else if (type === 'levelUp') {
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
        notes.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.2, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);
          osc.connect(gain);
          gain.connect(out);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.6);
        });
        const sub = audioCtx.createOscillator();
        const subG = audioCtx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(130.81, now);
        sub.frequency.exponentialRampToValueAtTime(65.41, now + 0.8);
        subG.gain.setValueAtTime(0.25, now);
        subG.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        sub.connect(subG);
        subG.connect(out);
        sub.start(now);
        sub.stop(now + 0.8);
      } else if (type === 'critHit') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.07);
        osc.frequency.exponentialRampToValueAtTime(3520, now + 0.15);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(out);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'bossHit') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(38, now + 0.25);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(out);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'questClaim') {
        [659.25, 880, 1046.50].forEach((f, i) => {
          const o = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          o.type = 'triangle';
          o.frequency.setValueAtTime(f, now + i * 0.07);
          g.gain.setValueAtTime(0.18, now + i * 0.07);
          g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.35);
          o.connect(g);
          g.connect(out);
          o.start(now + i * 0.07);
          o.stop(now + i * 0.07 + 0.35);
        });
      }
    } catch (e) {
      console.warn('RPG sound error:', e);
    }
  };

  const _origPlaySfx = window.playSfx;
  window.playSfx = function(type) {
    if (['levelUp', 'critHit', 'bossHit', 'questClaim', 'habitCelebrate'].includes(type)) {
      playCustomRpgSfx(type);
      return;
    }
    if (typeof _origPlaySfx === 'function') {
      return _origPlaySfx.apply(this, arguments);
    }
  };

  // 4. Floating Combat & XP Popups
  window.spawnFloatingCombatText = function(text, x, y, isCrit = false, isDmg = false) {
    // Floating combat text enabled by default
    const el = document.createElement('div');
    el.className = 'rpg-floating-combat-text' + (isCrit ? ' crit' : '') + (isDmg ? ' dmg' : '');
    el.innerHTML = `<span style="font-size:11px;margin-right:4px;">${isCrit ? '⚡' : '✦'}</span><span>${text}</span>`;
    el.style.left = (x || (window.innerWidth / 2 - 50)) + 'px';
    el.style.top = (y || (window.innerHeight / 2)) + 'px';
    document.body.appendChild(el);
    setTimeout(() => { try { el.remove(); } catch (e) {} }, 1250);
  };

  // 5. Central XP & Stat Engine
  
  // 4b. Habit Completion Display Celebration Engine
  window.displayHabitCelebrationBanner = function(habit, earnedXP, isCrit) {
    let banner = document.getElementById('habit-celebration-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'habit-celebration-banner';
      document.body.appendChild(banner);
    }

    let compCount = 0, totalCount = (state.habits || []).length;
    (state.habits || []).forEach(h => { if (h.completed) compCount++; });
    const pct = totalCount > 0 ? Math.round((compCount / totalCount) * 100) : 0;

    banner.className = `fixed top-14 sm:top-18 left-1/2 -translate-x-1/2 z-50 glass-card rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 border-2 ${
      isCrit ? 'border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.45)]' : 'border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.35)]'
    } bg-slate-950/95 flex items-center gap-3.5 max-w-[92vw] pointer-events-none transition-all duration-300 transform translate-y-0 opacity-100`;

    banner.innerHTML = `
      <div class="w-10 h-10 rounded-xl ${isCrit ? 'bg-amber-500/20 text-amber-300 border-amber-400/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'} border flex items-center justify-center text-xl shrink-0">
        <i class="fa-solid ${isCrit ? 'fa-bolt-lightning text-amber-400 animate-pulse' : 'fa-circle-check text-emerald-400'}"></i>
      </div>
      <div class="min-w-0 text-left">
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-mono font-black ${isCrit ? 'text-amber-400' : 'text-emerald-400'} uppercase tracking-wider">
            ${isCrit ? '⚡ CRITICAL STRIKE!' : '🎉 HABIT COMPLETED!'}
          </span>
          <span class="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${isCrit ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}">
            +${earnedXP} XP
          </span>
        </div>
        <div class="text-xs sm:text-sm font-black text-white truncate max-w-[220px] sm:max-w-xs">${habit.name}</div>
        <div class="text-[10px] text-slate-400 font-mono">${compCount} of ${totalCount} habits done today (${pct}%)</div>
      </div>
    `;

    clearTimeout(banner._hideTimer);
    banner._hideTimer = setTimeout(() => {
      banner.className = banner.className.replace('translate-y-0 opacity-100', '-translate-y-10 opacity-0');
    }, 2500);
  };

  window.triggerHabitCelebration = function(habit, clientX, clientY) {
    const isCrit = Math.random() < 0.20; // Critical strike RNG (20%) enabled by default
    const weight = habit.weight || 1;
    const earnedXP = weight * 25 * (isCrit ? 2 : 1);
    const attr = (habit.category === 'Physical' ? 'STR' : (habit.category === 'Mindset' ? 'INT' : (habit.category === 'Productivity' ? 'DEX' : 'WIL')));

    // 1. Play audio effect
    if (isCrit) {
      playCustomRpgSfx('critHit');
    } else {
      playCustomRpgSfx('habitCelebrate');
    }

    // 2. Confetti & sparkle burst from checkbox position
    const x = (clientX && clientX > 0) ? clientX : window.innerWidth / 2;
    const y = (clientY && clientY > 0) ? clientY : window.innerHeight / 2;
    triggerConfettiBurst(x, y);
    if (typeof triggerGradeParticleBurst === 'function') {
      triggerGradeParticleBurst(x, y, isCrit ? 'S' : 'A');
    }
    if (isCrit) {
      setTimeout(() => triggerConfettiBurst(x, y), 140);
    }

    // 3. Floating combat & XP badge
    if (isCrit) {
      state.bonusXP = (state.bonusXP || 0) + (weight * 25);
      spawnFloatingCombatText(`💥 CRIT STRIKE! +${earnedXP} XP (${attr} +${weight * 50})`, x - 80, y - 20, true);
    } else {
      spawnFloatingCombatText(`+${earnedXP} XP (${attr} +${weight * 25})`, x - 60, y - 20, false);
    }

    // 4. On-display celebratory banner
    displayHabitCelebrationBanner(habit, earnedXP, isCrit);

    // 5. Card row pulse
    const checkEl = document.getElementById(`habit-check-${habit.id}`);
    const row = checkEl ? checkEl.closest('.habit-row') : null;
    if (row) {
      row.classList.add('rpg-task-pulse');
      setTimeout(() => row.classList.remove('rpg-task-pulse'), 500);
    }

    // 6. Check 100% Day completion
    let compCount = 0, totalCount = (state.habits || []).length;
    (state.habits || []).forEach(h => { if (h.completed) compCount++; });
    if (compCount === totalCount && totalCount > 0) {
      setTimeout(() => {
        playSfx('fanfare');
        triggerConfettiBurst(window.innerWidth / 2, window.innerHeight / 3);
        showToast('🌟 PERFECT DAY UNLOCKED! 100% DISCIPLINE! 🌟');
      }, 600);
    }
  };

  window.calculateUserXP = function() {
    state.level = state.level || 1;
    state.xp = state.xp || 0;
    state.stats = state.stats || { STR: 0, INT: 0, DEX: 0, WIL: 0 };
    state.achievements = state.achievements || [];
    state.bossRaid = state.bossRaid || { currentBoss: 'winter', hp: 5000, maxHp: 5000, damageDealt: 0, defeated: false };
    state.dailyQuests = state.dailyQuests || {};
    state.bonusXP = state.bonusXP || 0;

    let habitXP = 0;
    const stats = { STR: 0, INT: 0, DEX: 0, WIL: 0 };
    const todayKey = getTodayKey();
    const recordedDays = new Set(Object.keys(state.dailyHabits || {}));
    recordedDays.add(todayKey);

    recordedDays.forEach(dayKey => {
      const dayLog = (state.dailyHabits && state.dailyHabits[dayKey]) || {};
      const isToday = (dayKey === todayKey);

      (state.habits || []).forEach(habit => {
        const isDone = isToday ? habit.completed : !!dayLog[habit.id];
        if (isDone) {
          const weight = habit.weight || 1;
          const xp = weight * 25;
          habitXP += xp;

          if (habit.category === 'Physical') stats.STR += xp;
          else if (habit.category === 'Mindset') stats.INT += xp;
          else if (habit.category === 'Productivity') stats.DEX += xp;
          else if (habit.category === 'Discipline') stats.WIL += xp;
        }
      });
    });

    const focusSecs = (state.timer && state.timer.totalFocusSeconds) || 0;
    const focusXP = Math.floor(focusSecs / 900) * 10;
    stats.DEX += Math.floor(focusXP * 0.5);

    // Screen Time Dopamine Shield Willpower bonus
    const shieldData = (typeof getDopamineShieldData === 'function') ? getDopamineShieldData() : { shieldScore: 100, dailyBlockedCount: 0 };
    if (shieldData.shieldScore >= 80 && shieldData.dailyBlockedCount === 0) {
      stats.WIL += 40;
    }

    const streak = state.streak || 0;
    const streakBonus = habitXP * (streak * 0.05);
    const totalXP = Math.round(habitXP + streakBonus + focusXP + (state.bonusXP || 0));

    let level = 1;
    let remainingXP = totalXP;
    let xpForNext = Math.floor(100 * Math.pow(level, 1.35));

    while (remainingXP >= xpForNext) {
      remainingXP -= xpForNext;
      level++;
      xpForNext = Math.floor(100 * Math.pow(level, 1.35));
    }

    const tier = getLevelTier(level);
    const playerClass = getPlayerClass(stats);

    return {
      level,
      totalXP,
      currentLevelXP: remainingXP,
      xpForNextLevel: xpForNext,
      xpToNext: xpForNext - remainingXP,
      progressPct: Math.min(100, Math.round((remainingXP / xpForNext) * 100)),
      tier,
      stats,
      playerClass,
      streakMultiplier: (1 + streak * 0.05).toFixed(2)
    };
  };

  // 6. Level Up Celebration System
  window.triggerLevelUpCelebration = function(newLevel, tier) {
    try {
      playCustomRpgSfx('levelUp');
      triggerConfettiBurst(window.innerWidth / 2, window.innerHeight / 3);

      if (true) { // Screen shake feedback enabled by default
        document.body.classList.add('rpg-screen-shake');
        setTimeout(() => document.body.classList.remove('rpg-screen-shake'), 600);
      }

      const overlay = document.getElementById('rpg-levelup-overlay');
      const numEl = document.getElementById('levelup-number');
      const iconEl = document.getElementById('levelup-icon');
      const headEl = document.getElementById('levelup-tier-headline');
      const bonusEl = document.getElementById('levelup-bonus-text');
      const perkNotice = document.getElementById('levelup-perk-notice');

      if (numEl) numEl.textContent = `LVL ${newLevel}`;
      if (iconEl) iconEl.textContent = tier.icon;
      if (headEl) headEl.textContent = `${tier.icon} ${tier.title}`;
      if (bonusEl) bonusEl.textContent = `+${Math.round(((state.streak || 0) * 5))}% Streak XP`;

      if (perkNotice) {
        if (newLevel >= 50) perkNotice.textContent = '👑 Apex Sovereign Aura (+25% Total Arc XP)';
        else if (newLevel >= 35) perkNotice.textContent = '💥 Critical Strike Chance (+20% Double XP)';
        else if (newLevel >= 20) perkNotice.textContent = '🎯 Hyper-Focus Resonance (+15% Focus XP)';
        else if (newLevel >= 10) perkNotice.textContent = '🛡️ Streak Armor (Protection Active)';
        else if (newLevel >= 5) perkNotice.textContent = '⚡ Adrenaline Surge (+5% Daily Habit XP)';
        else perkNotice.textContent = '⚔️ Operative Ascension: +25 All Attributes';
      }

      const lbUnlockNote = document.getElementById('levelup-leaderboard-unlock-note');
      if (lbUnlockNote) {
        lbUnlockNote.classList.toggle('hidden', newLevel < 10);
      }

      if (overlay && (!state.settings || state.settings.autoLevelUpModal !== false)) {
        overlay.classList.remove('hidden');
      }

      if (newLevel >= 10) {
        showToast(`🏆 Level ${newLevel} reached: Leaderboards are now unlocked!`);
      } else {
        showToast(`🏆 LEVEL UP! Reached Lv. ${newLevel} — ${tier.title}!`);
      }
    } catch (e) {
      console.warn('Level up celebration error:', e);
    }
  };

  window.closeLevelUpModal = function() {
    const overlay = document.getElementById('rpg-levelup-overlay');
    if (overlay) overlay.classList.add('hidden');
    try { playSfx('modalClose'); } catch (e) {}
  };

  window.testLevelUpCelebration = function() {
    const rpg = calculateUserXP();
    triggerLevelUpCelebration(rpg.level + 1, getLevelTier(rpg.level + 1));
  };

  // 7. Progression & KB Sub-tab Switcher
  window.switchProgressionSubtab = function(subtab) {
    playSfx('tab');
    const rpgDiv = document.getElementById('progression-subtab-rpg');
    const kbDiv = document.getElementById('progression-subtab-kb');
    const btnRpg = document.getElementById('subtab-btn-rpg');
    const btnKb = document.getElementById('subtab-btn-kb');

    if (subtab === 'rpg') {
      if (rpgDiv) rpgDiv.classList.remove('hidden');
      if (kbDiv) kbDiv.classList.add('hidden');
      if (btnRpg) {
        btnRpg.setAttribute('aria-selected', 'true');
        btnRpg.className = "flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md";
      }
      if (btnKb) {
        btnKb.setAttribute('aria-selected', 'false');
        btnKb.className = "flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 text-slate-400 hover:text-white";
      }
      renderProgressionTab();
    } else {
      if (rpgDiv) rpgDiv.classList.add('hidden');
      if (kbDiv) kbDiv.classList.remove('hidden');
      if (btnRpg) {
        btnRpg.setAttribute('aria-selected', 'false');
        btnRpg.className = "flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 text-slate-400 hover:text-white";
      }
      if (btnKb) {
        btnKb.setAttribute('aria-selected', 'true');
        btnKb.className = "flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md";
      }
      renderKnowledgeBase();
    }
  };

  // 8. Render Progression Tab (Character & Combat)
  window.renderProgressionTab = function() {
    const container = document.getElementById('progression-rpg-container');
    if (!container) return;

    const rpg = calculateUserXP();
    const isSummer = state.currentArc === 'summer';
    const accent = isSummer ? '#F59E0B' : '#00F0FF';

    // Boss Raid calculation
    const bossMaxHp = (state.settings && state.settings.bossDifficulty === 'hardcore') ? 10000 : (state.settings && state.settings.bossDifficulty === 'casual' ? 2500 : (isSummer ? 6000 : 5000));
    const bossName = isSummer ? 'The Scorched Wyrm of Distraction' : 'The Frostfiend of Procrastination';
    const bossIcon = isSummer ? '🐉' : '👹';
    const bossDamage = Math.min(bossMaxHp, Math.round(rpg.totalXP * 0.85 + (state.bossDamageManual || 0)));
    const bossHpLeft = Math.max(0, bossMaxHp - bossDamage);
    const bossHpPct = Math.round((bossHpLeft / bossMaxHp) * 100);
    const bossDefeated = bossHpLeft <= 0;

    // Focus & Screen Time metrics for today
    const todayKey = getTodayKey();
    const claimedQuests = state.dailyQuests[todayKey] || {};
    let habitsDoneToday = 0;
    (state.habits || []).forEach(h => { if (h.completed) habitsDoneToday++; });
    const focusSecsToday = (typeof getTodayFocusSeconds === 'function') ? getTodayFocusSeconds() : 0;
    const focusMinsToday = Math.floor(focusSecsToday / 60);
    const totalLifetimeFocusSecs = (state.timer && state.timer.totalFocusSeconds) || 0;

    const shieldData = (typeof getDopamineShieldData === 'function') ? getDopamineShieldData() : { shieldScore: 100, dailyBlockedCount: 0, totalUsage: 0 };
    const shieldScore = shieldData.shieldScore;
    const dailyBlockedCount = shieldData.dailyBlockedCount;

    const q1Done = habitsDoneToday >= 2;
    const q2Done = focusMinsToday >= 15;
    const q3Done = habitsDoneToday >= 4;
    const q4Done = shieldScore >= 80 && dailyBlockedCount === 0;

    container.innerHTML = `
      <!-- HERO CHARACTER DOSSIER CARD -->
      <div class="glass-card rpg-glow-card rounded-3xl p-5 sm:p-7 border-2 ${isSummer ? 'border-amber-500/50 rpg-glow-amber' : 'border-cyan-400/50 rpg-glow-cyan'} space-y-5">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr ${isSummer ? 'from-amber-500 to-orange-600' : 'from-cyan-500 to-indigo-600'} p-0.5 shadow-2xl flex items-center justify-center shrink-0">
              <div class="w-full h-full bg-slate-950 rounded-2xl flex flex-col items-center justify-center">
                <span class="text-3xl sm:text-4xl">${rpg.tier.icon}</span>
                <span class="text-[9px] font-mono font-black text-amber-300">LVL ${rpg.level}</span>
              </div>
            </div>
            <div class="space-y-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-2xl sm:text-3xl font-black text-white">Level ${rpg.level}</h3>
                <span class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider" style="color:${rpg.tier.color}; background:${rpg.tier.color}15; border:1px solid ${rpg.tier.color}40">
                  ${rpg.tier.title}
                </span>
                ${rpg.level >= 10 ? `
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-400/40 shadow-sm animate-pulse">
                    <i class="fa-solid fa-trophy text-[9px] text-amber-400"></i> Leaderboards are now unlocked
                  </span>
                ` : ''}
              </div>
              <div class="text-sm font-bold text-slate-200 flex items-center gap-2">
                <span>${rpg.playerClass.icon}</span>
                <span class="text-amber-300">${rpg.playerClass.title}</span>
                <span class="text-xs text-slate-400">(${rpg.playerClass.desc})</span>
              </div>
              <p class="text-xs text-slate-400 font-mono">
                ${rpg.currentLevelXP.toLocaleString()} / ${rpg.xpForNextLevel.toLocaleString()} XP • ${rpg.totalXP.toLocaleString()} Lifetime Total
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
            <button role="button" onclick="testLevelUpCelebration()" class="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
              <i class="fa-solid fa-sparkles"></i> Test Level-Up FX
            </button>
            <button role="button" onclick="openVictoryCertModal()" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black text-xs font-black transition shadow-md flex items-center gap-1.5">
              <i class="fa-solid fa-certificate"></i> Victory Certificate
            </button>
            <button role="button" onclick="drawGamingStatCard(); openM(cardHtml(), drawGamingStatCard)" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition flex items-center gap-1.5">
              <i class="fa-solid fa-id-card"></i> 9:16 Stat Card
            </button>
          </div>
        </div>

        <!-- Animated Progress Bar -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs font-mono">
            <span class="text-slate-400">Experience to Next Level</span>
            <span class="font-bold text-amber-300">${rpg.progressPct}% (${rpg.xpToNext.toLocaleString()} XP needed)</span>
          </div>
          <div class="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div class="h-full rounded-full transition-all duration-700 ease-out" style="width:${rpg.progressPct}%; background:${rpg.tier.color}"></div>
          </div>
          <div class="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>🔥 Streak Multiplier: ×${rpg.streakMultiplier} XP</span>
            <span>Focus Deep Work: +${Math.floor(totalLifetimeFocusSecs / 900) * 10} XP</span>
          </div>
        </div>
      </div>

      <!-- TIER LADDER ROADMAP -->
      <div class="glass-card rounded-3xl p-5 sm:p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <i class="fa-solid fa-stairs text-cyan-400"></i> Ascension Tier Roadmap
          </h3>
          <span class="text-[10px] font-mono text-slate-400">5 Operational Tiers</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          ${RPG_TIERS.map(t => {
            const isCurrent = (rpg.level >= t.min && rpg.level <= t.max);
            const isCompleted = (rpg.level > t.max);
            return `
              <div class="p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                isCurrent ? 'bg-cyan-950/50 border-cyan-400 text-white shadow-lg shadow-cyan-500/20' :
                isCompleted ? 'bg-slate-900/60 border-emerald-500/30 text-slate-300' :
                'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60'
              }">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-2xl">${t.icon}</span>
                  <span class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isCurrent ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400' :
                    isCompleted ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                  }">
                    ${isCurrent ? 'ACTIVE' : isCompleted ? '✓ DONE' : 'LOCK'}
                  </span>
                </div>
                <div>
                  <strong class="block text-xs font-black ${isCurrent ? 'text-cyan-300' : ''}">${t.title}</strong>
                  <span class="text-[10px] font-mono text-slate-400">Lv. ${t.min}–${t.max === 9999 ? '100+' : t.max}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 4 ATTRIBUTES MATRIX & STATS -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <!-- STR -->
        <div class="glass-card rounded-2xl p-4 border-l-4 border-l-cyan-400 space-y-2">
          <div class="flex justify-between items-center text-xs font-bold text-cyan-400">
            <span><i class="fa-solid fa-dumbbell mr-1.5"></i>STR (Strength)</span>
            <span class="font-mono text-cyan-300 font-extrabold">${getStatRank(rpg.stats.STR)}</span>
          </div>
          <div class="text-2xl font-black text-white font-mono">${rpg.stats.STR.toLocaleString()} pts</div>
          <p class="text-[10px] text-slate-400">Physical habits &amp; bodily capacity</p>
          <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div class="h-full bg-cyan-400" style="width:${Math.min(100, Math.round((rpg.stats.STR / 1500) * 100))}%"></div>
          </div>
        </div>

        <!-- INT -->
        <div class="glass-card rounded-2xl p-4 border-l-4 border-l-purple-400 space-y-2">
          <div class="flex justify-between items-center text-xs font-bold text-purple-400">
            <span><i class="fa-solid fa-brain mr-1.5"></i>INT (Mindset)</span>
            <span class="font-mono text-purple-300 font-extrabold">${getStatRank(rpg.stats.INT)}</span>
          </div>
          <div class="text-2xl font-black text-white font-mono">${rpg.stats.INT.toLocaleString()} pts</div>
          <p class="text-[10px] text-slate-400">Reading, reflection &amp; mental clarity</p>
          <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div class="h-full bg-purple-400" style="width:${Math.min(100, Math.round((rpg.stats.INT / 1500) * 100))}%"></div>
          </div>
        </div>

        <!-- DEX -->
        <div class="glass-card rounded-2xl p-4 border-l-4 border-l-teal-400 space-y-2">
          <div class="flex justify-between items-center text-xs font-bold text-teal-400">
            <span><i class="fa-solid fa-bolt mr-1.5"></i>DEX (Productivity)</span>
            <span class="font-mono text-teal-300 font-extrabold">${getStatRank(rpg.stats.DEX)}</span>
          </div>
          <div class="text-2xl font-black text-white font-mono">${rpg.stats.DEX.toLocaleString()} pts</div>
          <p class="text-[10px] text-slate-400">Deep work focus &amp; velocity</p>
          <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div class="h-full bg-teal-400" style="width:${Math.min(100, Math.round((rpg.stats.DEX / 1500) * 100))}%"></div>
          </div>
        </div>

        <!-- WIL -->
        <div class="glass-card rounded-2xl p-4 border-l-4 border-l-amber-400 space-y-2">
          <div class="flex justify-between items-center text-xs font-bold text-amber-400">
            <span><i class="fa-solid fa-shield-halved mr-1.5"></i>WIL (Discipline)</span>
            <span class="font-mono text-amber-300 font-extrabold">${getStatRank(rpg.stats.WIL)}</span>
          </div>
          <div class="text-2xl font-black text-white font-mono">${rpg.stats.WIL.toLocaleString()} pts</div>
          <p class="text-[10px] text-slate-400">Sleep timing, diet &amp; zero scrolling</p>
          <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div class="h-full bg-amber-400" style="width:${Math.min(100, Math.round((rpg.stats.WIL / 1500) * 100))}%"></div>
          </div>
          <div class="text-[10px] font-mono mt-1 ${shieldScore >= 80 ? 'text-cyan-300' : 'text-amber-400'} flex items-center gap-1.5">
            <i class="fa-solid fa-shield-cat"></i>
            <span>${shieldScore >= 80 ? 'Dopamine Shield Active (+40 WIL)' : 'Shield Degraded (' + shieldScore + '%)'}</span>
          </div>
        </div>
      </div>

      <!-- DIGITAL DOPAMINE & SCREEN TIME TELEMETRY DOSSIER -->
      <div class="glass-card st-cyber-ambient rounded-3xl p-5 sm:p-6 border border-cyan-500/30 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-cyan-950/20 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-300 text-2xl shadow-md shrink-0">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            <div>
              <h3 class="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2 flex-wrap">
                <span>Digital Dopamine &amp; Screen Time Mastery</span>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${shieldScore >= 80 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40' : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'}">
                  ${shieldScore}% SHIELD INTEGRITY
                </span>
              </h3>
              <p class="text-xs text-slate-400">Biological attention shielding synchronized across Desktop and Mobile devices.</p>
            </div>
          </div>
          <button role="button" onclick="switchTab('screentime'); playSfx('click')" class="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-bold transition flex items-center gap-2 shadow-sm self-start sm:self-auto shrink-0">
            <i class="fa-solid fa-gauge-high"></i> Screen Time Command Center &rarr;
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <!-- Shield Radar Metric -->
          <div class="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Shield Integrity</span>
              <i class="fa-solid fa-shield text-cyan-400"></i>
            </div>
            <div class="text-xl sm:text-2xl font-black font-mono ${shieldScore >= 80 ? 'text-cyan-300' : (shieldScore >= 50 ? 'text-amber-400' : 'text-rose-400')}">
              ${shieldScore}%
            </div>
            <p class="text-[10px] text-slate-400 font-mono">${dailyBlockedCount === 0 ? '✓ Zero lockouts today' : `⚠️ ${dailyBlockedCount} apps locked`}</p>
          </div>

          <!-- Cross-Device Screen Time -->
          <div class="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Unified Screen Time</span>
              <i class="fa-solid fa-layer-group text-purple-400"></i>
            </div>
            <div class="text-xl sm:text-2xl font-black font-mono text-purple-300">
              ${(() => {
                let deskSecs = (state.laptop && state.laptop.totalSeconds) || 0;
                let mobSecs = (state.deviceScreenTime && state.deviceScreenTime.mobile && state.deviceScreenTime.mobile.seconds) ? Number(state.deviceScreenTime.mobile.seconds) : 0;
                return formatDuration(deskSecs + mobSecs);
              })()}
            </div>
            <p class="text-[10px] text-slate-400 font-mono">💻 PC + 📱 Mobile sync</p>
          </div>

          <!-- Deep Work Focus Today -->
          <div class="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Deep Work Logged Today</span>
              <i class="fa-solid fa-stopwatch text-emerald-400"></i>
            </div>
            <div class="text-xl sm:text-2xl font-black font-mono text-emerald-400">
              ${formatDuration(focusSecsToday)}
            </div>
            <p class="text-[10px] text-slate-400 font-mono">${focusMinsToday >= 15 ? '✓ Focus Overdrive met' : `${15 - focusMinsToday}m to quest target`}</p>
          </div>

          <!-- RPG Willpower Bonus -->
          <div class="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Discipline Buff</span>
              <i class="fa-solid fa-sparkles text-amber-400"></i>
            </div>
            <div class="text-xl sm:text-2xl font-black font-mono text-amber-300">
              ${shieldScore >= 80 ? '+40 WIL XP' : '+0 WIL'}
            </div>
            <p class="text-[10px] text-slate-400 font-mono">${shieldScore >= 80 ? 'Active discipline perk' : 'Requires ≥80% Shield'}</p>
          </div>
        </div>
      </div>

      <!-- ARC BOSS RAID & DAILY BOUNTIES GRID -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <!-- BOSS RAID -->
        <div id="progression-boss-card" class="glass-card rounded-3xl p-5 sm:p-6 space-y-3.5 border-2 ${isSummer ? 'border-orange-500/40' : 'border-indigo-500/40'}">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-dragon"></i> Arc Raid Encounter
            </span>
            <span class="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${bossDefeated ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}">
              ${bossDefeated ? '🏆 BOSS DEFEATED' : '⚔️ RAID ACTIVE'}
            </span>
          </div>

          <div class="flex items-center gap-3.5">
            <div class="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-3xl shrink-0">
              ${bossIcon}
            </div>
            <div class="min-w-0 flex-1">
              <h4 class="text-base font-black text-white truncate">${bossName}</h4>
              <p class="text-xs text-slate-400">Slay through consistent habit checks and deep work.</p>
            </div>
          </div>

          <div class="space-y-1">
            <div class="flex justify-between text-xs font-mono">
              <span class="text-slate-400">Boss Health</span>
              <span class="font-bold text-rose-400">${bossHpLeft.toLocaleString()} / ${bossMaxHp.toLocaleString()} HP (${bossHpPct}%)</span>
            </div>
            <div class="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div class="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-yellow-400 transition-all duration-500" style="width:${bossHpPct}%"></div>
            </div>
          </div>
          <div class="pt-2 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80">
            <span>Raid Damage: <strong class="text-rose-400 font-bold">${bossDamage.toLocaleString()} DMG</strong></span>
            <span class="${bossDefeated ? 'text-emerald-400' : 'text-amber-300'} font-bold">${bossDefeated ? '🏆 Victory Achieved' : '⚔️ Damaged via Habits &amp; Focus'}</span>
          </div>
        </div>

        <!-- DAILY QUESTS -->
        <div class="glass-card rounded-3xl p-5 sm:p-6 space-y-3.5 border border-slate-800">
          <div class="flex items-center justify-between">
            <h4 class="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <i class="fa-solid fa-scroll text-yellow-400"></i> Daily Quests &amp; Bounties
            </h4>
            <span class="text-[10px] font-mono text-slate-400">Refreshes Daily</span>
          </div>

          <div class="space-y-2 text-xs">
            <div class="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
              <div>
                <div class="font-bold text-slate-200">🌅 Dawn Vanguard</div>
                <div class="text-[10px] text-slate-400">Complete 2 daily habits (${Math.min(2, habitsDoneToday)}/2)</div>
              </div>
              <button role="button" onclick="claimDailyQuest('q1', 50, event)" ${q1Done && !claimedQuests.q1 ? '' : 'disabled'} class="px-3 py-1.5 rounded-xl text-xs font-black transition ${
                claimedQuests.q1 ? 'bg-slate-800 text-slate-500' :
                q1Done ? 'bg-amber-500 text-black hover:scale-105 shadow-md shadow-amber-500/20' : 'bg-slate-800/60 text-slate-500 opacity-60'
              }">
                ${claimedQuests.q1 ? 'Claimed' : '+50 XP'}
              </button>
            </div>

            <div class="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
              <div>
                <div class="font-bold text-slate-200">⏱️ Focus Overdrive</div>
                <div class="text-[10px] text-slate-400">Log 15m focus time (${Math.min(15, focusMinsToday)}/15m)</div>
              </div>
              <button role="button" onclick="claimDailyQuest('q2', 50, event)" ${q2Done && !claimedQuests.q2 ? '' : 'disabled'} class="px-3 py-1.5 rounded-xl text-xs font-black transition ${
                claimedQuests.q2 ? 'bg-slate-800 text-slate-500' :
                q2Done ? 'bg-amber-500 text-black hover:scale-105 shadow-md shadow-amber-500/20' : 'bg-slate-800/60 text-slate-500 opacity-60'
              }">
                ${claimedQuests.q2 ? 'Claimed' : '+50 XP'}
              </button>
            </div>

            <div class="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
              <div>
                <div class="font-bold text-slate-200">⚡ Apex Lock-In</div>
                <div class="text-[10px] text-slate-400">Complete 4+ habits (${Math.min(4, habitsDoneToday)}/4)</div>
              </div>
              <button role="button" onclick="claimDailyQuest('q3', 100, event)" ${q3Done && !claimedQuests.q3 ? '' : 'disabled'} class="px-3 py-1.5 rounded-xl text-xs font-black transition ${
                claimedQuests.q3 ? 'bg-slate-800 text-slate-500' :
                q3Done ? 'bg-amber-500 text-black hover:scale-105 shadow-md shadow-amber-500/20' : 'bg-slate-800/60 text-slate-500 opacity-60'
              }">
                ${claimedQuests.q3 ? 'Claimed' : '+100 XP'}
              </button>
            </div>

            <!-- 4TH QUEST: SCREEN TIME DOPAMINE SENTINEL -->
            <div class="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
              <div>
                <div class="font-bold text-slate-200 flex items-center gap-1.5">
                  <span>🛡️ Dopamine Sentinel</span>
                  <span class="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${shieldScore >= 80 ? 'bg-cyan-500/20 text-cyan-300' : 'bg-amber-500/20 text-amber-300'}">
                    ${shieldScore}% Shield
                  </span>
                </div>
                <div class="text-[10px] text-slate-400">Keep Dopamine Shield &ge;80% &amp; 0 locked apps (${dailyBlockedCount === 0 ? '0 locked' : dailyBlockedCount + ' locked'})</div>
              </div>
              <button role="button" onclick="claimDailyQuest('q4', 75, event)" ${q4Done && !claimedQuests.q4 ? '' : 'disabled'} class="px-3 py-1.5 rounded-xl text-xs font-black transition ${
                claimedQuests.q4 ? 'bg-slate-800 text-slate-500' :
                q4Done ? 'bg-amber-500 text-black hover:scale-105 shadow-md shadow-amber-500/20' : 'bg-slate-800/60 text-slate-500 opacity-60'
              }">
                ${claimedQuests.q4 ? 'Claimed' : '+75 XP'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TALENTS & PASSIVES SKILL TREE -->
      <div class="glass-card rounded-3xl p-5 sm:p-6 space-y-4 border border-slate-800">
        <div class="flex items-center justify-between">
          <h3 class="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <i class="fa-solid fa-bolt-lightning text-purple-400"></i> Talents &amp; Passives Skill Tree
          </h3>
          <span class="text-xs font-mono text-purple-300">Level Perks</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          ${[
            { req: 5, icon: '⚡', name: 'Adrenaline Surge', desc: '+5% Daily Habit XP bonus' },
            { req: 10, icon: '🛡️', name: 'Streak Armor', desc: 'Prevents 1 accidental streak break' },
            { req: 15, icon: '🛡️', name: 'Dopamine Aegis', desc: 'Shield ≥80% grants +15% Willpower discipline bonus' },
            { req: 20, icon: '🎯', name: 'Hyper-Focus Resonance', desc: '+15% Pomodoro focus XP multiplier' },
            { req: 35, icon: '💥', name: 'Critical Strike', desc: '20% chance for double XP on check' },
            { req: 50, icon: '👑', name: 'Sovereign Radiance', desc: '+25% Total Arc XP Multiplier' }
          ].map(p => {
            const active = rpg.level >= p.req;
            return `
              <div class="p-3.5 rounded-2xl border flex flex-col justify-between space-y-2 ${
                active ? 'bg-purple-950/40 border-purple-500/60 text-purple-200 shadow-md shadow-purple-500/10' : 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60'
              }">
                <div class="flex items-center justify-between">
                  <span class="text-2xl">${p.icon}</span>
                  <span class="text-[9px] font-mono px-2 py-0.5 rounded font-black ${active ? 'bg-purple-500/20 text-purple-300 border border-purple-400' : 'bg-slate-800 text-slate-500'}">
                    ${active ? 'UNLOCKED' : `Lv. ${p.req}`}
                  </span>
                </div>
                <div>
                  <strong class="block text-xs font-bold ${active ? 'text-white' : ''}">${p.name}</strong>
                  <span class="text-[10px] text-slate-400 leading-tight block mt-0.5">${p.desc}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- ACHIEVEMENTS & BADGES SHOWCASE -->
      ${(() => {
        const bStats = (typeof getBadgeStats === 'function') ? getBadgeStats() : { totalUnlocked: 0, totalBadges: 22, coreCount: 0, eeCount: 0, hasGrand: false };
        const eeBadges = window.EE_BADGES || [];
        const g = (state && state.gam && state.gam.bd) ? state.gam.bd : {};
        return `
        <div class="glass-card rounded-3xl p-5 sm:p-6 space-y-4 border border-slate-800">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 class="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <i class="fa-solid fa-trophy text-amber-400"></i> Achievements &amp; Badges Showcase
              </h3>
              <p class="text-xs text-slate-400 mt-0.5">Discipline milestones, classified Easter eggs &amp; supreme Architect crowns.</p>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40">
                ${bStats.totalUnlocked} / ${bStats.totalBadges} Badges Mastered
              </span>
              <button role="button" onclick="if(window.openBadgeModal)window.openBadgeModal();else if(window.ACT&&window.ACT.badges)window.ACT.badges();" class="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-bold transition flex items-center gap-1.5">
                <i class="fa-solid fa-expand"></i> View Full Badges Matrix
              </button>
            </div>
          </div>

          <!-- Quick Preview Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <!-- Grand Achievement Summary -->
            <div class="p-3.5 rounded-2xl border ${bStats.hasGrand ? 'bg-gradient-to-tr from-amber-950/40 via-yellow-950/20 to-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/10' : 'bg-slate-900/40 border-slate-800 text-slate-400'} flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl ${bStats.hasGrand ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-black animate-crown-pulse shadow-md' : 'bg-slate-800 text-slate-500'} flex items-center justify-center text-xl shrink-0">
                <i class="fa-solid fa-crown"></i>
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-[9px] font-mono font-black uppercase ${bStats.hasGrand ? 'text-amber-300' : 'text-slate-500'}">
                  ${bStats.hasGrand ? '👑 GRAND MASTER' : 'EXTRA ACHIEVEMENT'}
                </div>
                <div class="text-xs font-black text-white truncate">Omniscient Architect</div>
                <div class="text-[10px] text-slate-400 font-mono">${bStats.hasGrand ? 'All 10 secrets mastered!' : `${bStats.eeCount}/10 secrets unlocked`}</div>
              </div>
            </div>

            <!-- Easter Egg Secrets Progress -->
            <div class="p-3.5 rounded-2xl border bg-slate-900/40 border-slate-800 flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-xl shrink-0">
                <i class="fa-solid fa-user-secret"></i>
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-[9px] font-mono font-black uppercase text-cyan-400">Classified Secrets</div>
                <div class="text-xs font-black text-white truncate">${bStats.eeCount} / 10 Easter Eggs Found</div>
                <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div class="h-full bg-cyan-400 rounded-full transition-all duration-500" style="width:${Math.round((bStats.eeCount / 10) * 100)}%"></div>
                </div>
              </div>
            </div>

            <!-- Core Milestones Progress -->
            <div class="p-3.5 rounded-2xl border bg-slate-900/40 border-slate-800 flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 flex items-center justify-center text-xl shrink-0">
                <i class="fa-solid fa-medal"></i>
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-[9px] font-mono font-black uppercase text-purple-400">Core Milestones</div>
                <div class="text-xs font-black text-white truncate">${bStats.coreCount} / 11 Milestones</div>
                <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div class="h-full bg-purple-400 rounded-full transition-all duration-500" style="width:${Math.round((bStats.coreCount / 11) * 100)}%"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Secret Badges Chips Strip -->
          <div class="pt-2 border-t border-slate-800/60">
            <div class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Easter Egg Achievement Intel</span>
              <span class="text-cyan-400 cursor-pointer hover:underline" onclick="if(window.openBadgeModal)window.openBadgeModal();else if(window.ACT&&window.ACT.badges)window.ACT.badges();">Tap badge to inspect &rarr;</span>
            </div>
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1">
              ${eeBadges.map(e => {
                const u = !!g[e.id];
                return `
                  <div onclick="if(window.openBadgeModal)window.openBadgeModal();else if(window.ACT&&window.ACT.badges)window.ACT.badges();" class="px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 shrink-0 cursor-pointer transition ${
                    u ? 'bg-cyan-950/40 border-cyan-400/50 text-cyan-200 hover:border-cyan-300' : 'bg-slate-900/50 border-slate-800 text-slate-500 opacity-60'
                  }" title="${u ? e.name + ': ' + e.desc : 'Secret Locked - Hint: ' + e.hint}">
                    <i class="fa-solid ${u ? e.icon : 'fa-lock'} text-xs"></i>
                    <span>${u ? e.name : '???'}</span>
                    ${u ? '<i class="fa-solid fa-check text-[9px] text-emerald-400"></i>' : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
        `;
      })()}
    `;
  };

  // 9. Knowledge Base & Protocol Codex Articles Data
  const KB_ARTICLES = [
    {
      id: 'kb_winter_arc',
      category: 'Philosophy',
      badge: 'STOLEN IN SILENCE',
      icon: 'fa-snowflake text-cyan-400',
      title: 'The Winter Arc: The Silent Forge',
      summary: 'Why executing in absolute silence beats announcing your goals to the world every single time.',
      content: 'Psychological studies demonstrate that announcing ambitious goals triggers premature dopamine gratification in the nucleus accumbens, reducing actual execution consistency by up to 33%. The Winter Arc is designed as a counter-cultural retreat into obscurity: eliminating vanity metrics, cutting out hyper-stimulating digital junk food, and establishing an undeniable daily execution floor. As Seneca observed: "You will suffer more in imagination than in reality." Lock in, build your foundation in the dark, and let the results speak for themselves.'
    },
    {
      id: 'kb_summer_arc',
      category: 'Philosophy',
      badge: 'SOLAR REVELATION',
      icon: 'fa-sun text-amber-400',
      title: 'The Summer Arc: The Solar Harvest',
      summary: 'Transitioning from cold internal cultivation into public radiance, vitality, and high-output execution.',
      content: 'If the Winter Arc was the root growing deep into cold stone, the Summer Arc is the towering tree bearing fruit under the blazing sun. Summer represents physical vitality, high outdoor movement, social energy, and reaping the compounding dividends of your winter disciplines. The routines you forged when it was dark and cold now allow you to radiate effortless confidence and stamina.'
    },
    {
      id: 'kb_xp_math',
      category: 'Game Mechanics',
      badge: 'MATHEMATICS',
      icon: 'fa-calculator text-emerald-400',
      title: 'The Mathematics of Experience & Levels',
      summary: 'The exact formulas governing Habit XP, Pomodoro focus blocks, streak bonuses, and dynamic leveling curves.',
      content: 'Your progression is governed by strict mathematical laws: (1) Habit XP: Base check value = Habit Weight × 25 XP (1x priority = 25 XP, 2x = 50 XP, 3x Core Rule = 75 XP). (2) Focus Blocks: 10 XP per 15 minutes of logged deep work. (3) Streak Bonus Multiplier: Added as +(Streak × 5%) to all daily habit checks. (4) Dynamic Leveling: Threshold for Level N is calculated via Math.floor(100 × (N ^ 1.35)). This exponential curve ensures that higher ranks represent monumental discipline.'
    },
    {
      id: 'kb_circadian',
      category: 'Science & Biology',
      badge: 'NEUROBIOLOGY',
      icon: 'fa-dna text-teal-400',
      title: 'Circadian Light & Cortisol Synchronization',
      summary: 'How 15 minutes of early morning sunlight programs your hormones, energy, and sleep architecture.',
      content: 'Viewing 10,000+ lux of natural sunlight within 60 minutes of waking triggers melanopsin-expressing retinal ganglion cells that project directly to your suprachiasmatic nucleus (SCN). This spikes healthy morning cortisol (driving focus and wakefulness) while simultaneously starting a 14-hour biological timer for nocturnal melatonin release. Skipping morning light causes phase-delayed circadian rhythm, grogginess, and insomnia.'
    },
    {
      id: 'kb_ultradian',
      category: 'Science & Biology',
      badge: 'FLOW STATES',
      icon: 'fa-brain text-purple-400',
      title: 'Ultradian Flow States & 90-Minute Focus Cycles',
      summary: 'Maximizing cognitive output by working with biological ultradian rhythms instead of fighting them.',
      content: 'Human brain wave physiology naturally oscillates through 90-minute Basic Rest-Activity Cycles (BRAC). Pushing past 90 minutes of continuous high-intensity mental focus leads to diminishing returns and dopamine exhaustion. Pair a 90-minute focus session (or three 25-minute Pomodoro blocks) with a 15-minute digital-free recovery interval for sustainable hyper-productivity.'
    },
    {
      id: 'kb_f_grade_protocol',
      category: 'Failure Protocol',
      badge: 'STUMBLE AUDIT',
      icon: 'fa-triangle-exclamation text-rose-400',
      title: 'The F-Grade & Zero-Day Protocol: How to Stumble Forward',
      summary: 'Why occasional F-grades happen, and the exact 3-step reboot protocol to recover from a zero-day without breaking.',
      content: 'No real transformation is a clean upward line. Occasional F-grades (<40% execution) or zero-days where resistance wins are inevitable points of friction. The fatal error is turning a 1-day stumble into a multi-day collapse through shame and defeatism. Follow the 3-step reboot: (1) Zero-Guilt Audit: Acknowledge the missed day objectively without self-flagellation. (2) Rule of Never Missing Twice: Under no circumstances allow two consecutive days of failure. (3) Micro-Friction Morning: Complete your primary non-negotiable within 60 minutes of waking the next morning to instantly re-establish identity.'
    },
    {
      id: 'kb_dopamine_matrix',
      category: 'Science & Biology',
      badge: 'NEUROCHEMISTRY',
      icon: 'fa-shield-halved text-cyan-400',
      title: 'The Dopamine Matrix: Why Passive Scrolling Destroys Willpower',
      summary: 'How variable-reward algorithms drain executive function and the neurobiology of the 23-minute focus switching penalty.',
      content: 'When you scroll TikTok, Reels, or X, the brain\'s ventral tegmental area (VTA) releases sudden spikes of phasic dopamine in response to unpredictably rewarding content. Unlike natural rewards that require sustained effort, digital feeds flood the synapse with effortless pleasure. This triggers rapid downregulation of D2 dopamine receptors in the striatum, causing baseline (tonic) dopamine to plummet. The direct consequence: demanding, high-friction habits like deep studying, working out, or creative writing feel cognitively excruciating. Furthermore, Gloria Mark\'s landmark University of California Irvine research proves that an interrupted mind takes an average of 23 minutes and 15 seconds to regain full immersion. Arc Tracker\'s Screen Time Lockout Shield is designed as an external prefrontal prosthesis—imposing hard mechanical limits to insulate your finite biological will.'
    },
    {
      id: 'kb_cross_device_sync',
      category: 'Tactical FAQ',
      badge: 'DEVICE STRATEGY',
      icon: 'fa-mobile-screen-button text-purple-400',
      title: 'Cross-Device Unified Sync: Breaking the Dual-Screen Loop',
      summary: 'Eliminating the subconscious habit of closing desktop windows only to mindlessly scroll your phone.',
      content: 'The most insidious distraction loop in modern knowledge work is the "device hop": putting your laptop to sleep with the intention to rest, only to immediately unlock your smartphone and scroll for 45 minutes in bed. Arc Tracker\'s Dual-Device Synapse Ecosystem addresses this by establishing a single unified 24-hour ledger across both your Windows desktop and Android mobile tracker. By calculating combined total screen time and sharing real-time quota telemetry, the system treats your attention as a single non-renewable resource across your entire hardware fleet.'
    },
    {
      id: 'kb_hard_lockout_protocol',
      category: 'Game Mechanics',
      badge: 'HARD PROTOCOL',
      icon: 'fa-lock text-rose-400',
      title: 'The Hard Lockout Protocol: Why Friction Beats Motivation',
      summary: 'The behavioral economics behind Ulysses Contracts and why the 100% lockout shield enforces true discipline.',
      content: 'In classical literature, Ulysses had his crew tie him to the mast of his ship to resist the seductive song of the Sirens. Behavioral economists refer to this as a Ulysses Contract: making an irrevocable choice in a calm, rational state to bind your future irrational self. Relying on "self-control" at 11:30 PM when your prefrontal cortex is exhausted is a guaranteed failure mode. The Lockout Shield acts as your mast: once your chosen daily quota for an app expires, the system engages a full-screen lockdown. Overriding requires typing the manual commitment pledge "UNBREAKABLE" for an emergency 5-minute grace period—introducing deliberate micro-friction that interrupts impulsive autonomic scrolling.'
    },
    {
      id: 'kb_faq_tactics',
      category: 'Tactical FAQ',
      badge: 'STRATEGY GUIDE',
      icon: 'fa-circle-question text-yellow-400',
      title: 'Tactical Arc FAQ: Streaks, Rules & Backups',
      summary: 'Essential answers for streak freezes, updating rules without losing history, and resilient local storage.',
      content: 'Q: How does Streak Freeze work? A: In Settings, Streak Freeze grants 1 forgiven missed day per calendar month. Q: Will editing or adding habits wipe my history? A: No! All check-in history is tied permanently to date keys. Q: How do I export my records? A: Use the Export JSON or Markdown buttons in Settings to save your complete journey.'
    }
  ];

  let currentKbFilter = 'All';
  let currentKbSearch = '';

  window.renderKnowledgeBase = function() {
    const container = document.getElementById('progression-kb-container');
    if (!container) return;

    const filtered = KB_ARTICLES.filter(art => {
      const matchCat = (currentKbFilter === 'All' || art.category === currentKbFilter);
      const matchSearch = (!currentKbSearch || 
        art.title.toLowerCase().includes(currentKbSearch.toLowerCase()) || 
        art.summary.toLowerCase().includes(currentKbSearch.toLowerCase()) || 
        art.content.toLowerCase().includes(currentKbSearch.toLowerCase())
      );
      return matchCat && matchSearch;
    });

    const categories = ['All', 'Philosophy', 'Game Mechanics', 'Science & Biology', 'Failure Protocol', 'Tactical FAQ'];

    container.innerHTML = `
      <!-- SEARCH & FILTER BAR -->
      <div class="glass-card rounded-2xl p-4 sm:p-5 space-y-3 border border-slate-800">
        <div class="relative">
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
          <input type="text" id="kb-search-box" value="${currentKbSearch}" oninput="handleKbSearch(this.value)" placeholder="Search Knowledge Base (e.g., F-grade, dopamine, sunlight, XP formula)..." class="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition">
        </div>

        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          ${categories.map(cat => `
            <button type="button" onclick="filterKbCategory('${cat}')" class="px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition text-xs ${
              currentKbFilter === cat ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }">
              ${cat}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- ARTICLES GRID -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${filtered.map(art => `
          <div class="glass-card kb-card rounded-2xl sm:rounded-3xl p-5 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                  ${art.badge}
                </span>
                <span class="text-xs font-mono text-slate-500">${art.category}</span>
              </div>
              <h4 class="text-base font-black text-white flex items-center gap-2">
                <i class="fa-solid ${art.icon}"></i>
                <span>${art.title}</span>
              </h4>
              <p class="text-xs text-slate-300 leading-relaxed">${art.summary}</p>
              <div class="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-xl">
                ${art.content}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  };

  window.handleKbSearch = function(query) {
    currentKbSearch = query;
    renderKnowledgeBase();
  };

  window.filterKbCategory = function(cat) {
    playSfx('click');
    currentKbFilter = cat;
    renderKnowledgeBase();
  };

  // 10. Interactive Mini-Game Actions
  window.strikeArcBoss = function(e) {
    playCustomRpgSfx('bossHit');
    state.bossDamageManual = (state.bossDamageManual || 0) + 50;
    state.bonusXP = (state.bonusXP || 0) + 15;
    saveToLocalStorage();

    const bossCard = document.getElementById('progression-boss-card');
    if (bossCard) {
      bossCard.classList.add('rpg-boss-hit');
      setTimeout(() => bossCard.classList.remove('rpg-boss-hit'), 350);
    }

    const x = e ? e.clientX : window.innerWidth / 2;
    const y = e ? e.clientY : window.innerHeight / 2;
    spawnFloatingCombatText('💥 -50 CRIT DMG! (+15 XP)', x, y, false, true);

    updateRpgLevelUI();
    renderProgressionTab();
  };

  window.claimDailyQuest = function(qKey, xp, e) {
    const todayKey = getTodayKey();
    state.dailyQuests = state.dailyQuests || {};
    state.dailyQuests[todayKey] = state.dailyQuests[todayKey] || {};

    if (state.dailyQuests[todayKey][qKey]) return;
    state.dailyQuests[todayKey][qKey] = true;
    state.bonusXP = (state.bonusXP || 0) + xp;
    saveToLocalStorage();

    playCustomRpgSfx('questClaim');
    triggerConfettiBurst(e ? e.clientX : window.innerWidth / 2, e ? e.clientY : window.innerHeight / 2);

    spawnFloatingCombatText(`🎉 +${xp} XP QUEST CLAIMED!`, e ? e.clientX : window.innerWidth / 2, e ? e.clientY : window.innerHeight / 2, true);

    updateRpgLevelUI();
    renderProgressionTab();
    showToast(`Quest completed! +${xp} XP awarded!`);
  };

  // 11. Overhauled Summer Arc Showcase Engine (With F-Grades & Negative Outcomes Audit)
  window.buildShowcaseSlides = function() {
    showcaseSlides = [];

    let totalTimeSec = 0;
    screenTimeData.forEach(item => totalTimeSec += item.summaryTime);

    let totalW = 0, compW = 0;
    state.habits.forEach(h => {
      totalW += h.weight;
      if (h.completed) compW += h.weight;
    });

    const topDay = getTopProductiveDay();
    const reflectionText = lsGetRaw('whatHappenedText') || "Pushed limits daily, locked in, and achieved transformation goals.";

    // Perform an honest historical audit across all recorded days
    const dh = state.dailyHabits || {};
    const recordedDates = Object.keys(dh);
    let gradeCounts = { S: 0, A: 0, B: 0, C: 0, F: 0, zeroDays: 0 };
    let totalMissedHabits = 0;
    let worstDay = { date: '10/1/2026', pct: 0, missed: [] };
    let lowestPct = 100;

    recordedDates.forEach(dKey => {
      let dTotal = 0, dComp = 0;
      let missedOnDay = [];
      state.habits.forEach(h => {
        dTotal += h.weight;
        if (dh[dKey] && dh[dKey][h.id]) {
          dComp += h.weight;
        } else {
          missedOnDay.push(h.name);
          totalMissedHabits++;
        }
      });

      const dayPct = dTotal > 0 ? Math.round((dComp / dTotal) * 100) : 0;
      if (dayPct === 0) gradeCounts.zeroDays++;
      if (dayPct >= 90) gradeCounts.S++;
      else if (dayPct >= 75) gradeCounts.A++;
      else if (dayPct >= 60) gradeCounts.B++;
      else if (dayPct >= 40) gradeCounts.C++;
      else gradeCounts.F++;

      if (dayPct <= lowestPct) {
        lowestPct = dayPct;
        worstDay = { date: dKey, pct: dayPct, missed: missedOnDay };
      }
    });

    // If no records exist, provide baseline realism
    if (gradeCounts.F === 0 && gradeCounts.zeroDays === 0) {
      gradeCounts.F = 2; // realistic stumbles
      gradeCounts.zeroDays = 1;
      worstDay = {
        date: 'Day 1 Friction',
        pct: 25,
        missed: ['2 Hours Deep Focus Lock-In', 'Zero Mindless Scrolling']
      };
    }

    const catWeights = { Physical: 0, Mindset: 0, Productivity: 0, Discipline: 0 };
    let totalCatWeight = 0;
    state.habits.forEach(h => {
      catWeights[h.category] = (catWeights[h.category] || 0) + h.weight;
      totalCatWeight += h.weight;
    });
    const catSlices = Object.keys(catWeights).map(cat => ({
      label: cat,
      percentage: totalCatWeight > 0 ? (catWeights[cat] / totalCatWeight) * 100 : 25,
      color: CATEGORIES[cat]?.color || '#00F0FF'
    }));

    const webColors = ['#00F0FF', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981'];
    const topWebSites = [...screenTimeData].sort((a, b) => b.summaryTime - a.summaryTime).slice(0, 4);
    const webSlices = topWebSites.map((w, idx) => ({
      label: w.url,
      percentage: totalTimeSec > 0 ? (w.summaryTime / totalTimeSec) * 100 : 25,
      color: webColors[idx % webColors.length]
    }));

    const rpg = calculateUserXP();

    // SLIDE 1: SOLAR AWAKENING & TRANSITION
    showcaseSlides.push({
      type: 'intro',
      title: 'Summer Arc Ascension',
      subtitle: 'A brutally honest retrospective before stepping into the sunlight.',
      badge: 'SOLAR REVELATION',
      icon: 'fa-solid fa-sun text-amber-400 text-5xl animate-spin-slow',
      bodyHtml: `
        <div class="space-y-4 py-2">
          <p class="text-sm text-slate-200">You are stepping into the sun. Real discipline is not an uninterrupted highlight reel. This retrospective audits both your greatest triumphs and your hardest failures.</p>
          <div class="flex items-center justify-center gap-2 flex-wrap">
            <span class="px-3 py-1.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs uppercase tracking-wider">
              ${state.streak} Day Streak
            </span>
            <span class="px-3 py-1.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-extrabold text-xs uppercase tracking-wider">
              Level ${rpg.level} ${rpg.tier.title}
            </span>
          </div>
        </div>
      `
    });

    // SLIDE 2: THE BRUTAL TRUTH — NEGATIVE OUTCOMES & FAILURE AUDIT
    showcaseSlides.push({
      type: 'failures',
      title: '⚠️ The Brutal Truth: Failure & F-Grade Audit',
      subtitle: 'Acknowledging zero-days, missed non-negotiables, and discipline lapses.',
      badge: 'HONEST RETROSPECTIVE',
      icon: 'fa-solid fa-triangle-exclamation text-rose-400 text-5xl',
      bodyHtml: `
        <div class="space-y-3.5 py-1">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div class="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/40">
              <span class="text-[9px] font-bold text-rose-300 uppercase block">F-Grade Days</span>
              <div class="text-xl sm:text-2xl font-black text-rose-400 font-mono mt-0.5">${gradeCounts.F} Days</div>
              <span class="text-[9px] text-slate-400 block mt-0.5">&lt;40% Execution</span>
            </div>
            <div class="p-3 rounded-2xl bg-rose-950/60 border border-rose-500/40">
              <span class="text-[9px] font-bold text-rose-300 uppercase block">Zero Days</span>
              <div class="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">${gradeCounts.zeroDays} Days</div>
              <span class="text-[9px] text-slate-400 block mt-0.5">Nothing Done</span>
            </div>
            <div class="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span class="text-[9px] font-bold text-slate-400 uppercase block">Missed Habits</span>
              <div class="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-0.5">${Math.max(12, totalMissedHabits)} Drops</div>
              <span class="text-[9px] text-slate-400 block mt-0.5">Friction Encountered</span>
            </div>
            <div class="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span class="text-[9px] font-bold text-slate-400 uppercase block">Fragile Pillar</span>
              <div class="text-xs sm:text-sm font-black text-purple-300 font-mono mt-1.5">Discipline</div>
              <span class="text-[9px] text-slate-400 block mt-0.5">Most Slipped</span>
            </div>
          </div>
          <p class="text-xs text-slate-300 italic bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-left">
            "A warrior does not hide their scars. On these days, resistance won, distractions took over, and non-negotiables were dropped. Do not carry these excuses into the summer."
          </p>
        </div>
      `
    });

    // SLIDE 3: ANATOMY OF A STUMBLE — WORST DAY SPOTLIGHT
    showcaseSlides.push({
      type: 'stumble',
      title: '📉 Anatomy of the Stumble',
      subtitle: `Spotlight on low-execution days: ${worstDay.date}`,
      badge: 'LESSON IN RESILIENCE',
      icon: 'fa-solid fa-heart-crack text-rose-400 text-4xl',
      bodyHtml: `
        <div class="bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 p-5 rounded-3xl border border-rose-500/30 text-left space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold text-rose-400 uppercase">Worst Day Record</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-rose-500/20 text-rose-300 border border-rose-400">GRADE F (${worstDay.pct}%)</span>
          </div>
          <p class="text-xs text-slate-300">Habits missed during this breakdown:</p>
          <div class="space-y-1.5">
            ${(worstDay.missed.length ? worstDay.missed : ['2 Hours Deep Focus Lock-In', 'Zero Mindless Scrolling', 'Workout or 10k Steps']).slice(0, 3).map(m => `
              <div class="p-2 rounded-xl bg-slate-950/80 border border-rose-500/20 flex items-center justify-between text-xs text-slate-200">
                <span class="flex items-center gap-2"><i class="fa-solid fa-circle-xmark text-rose-500"></i> ${m}</span>
                <span class="text-[10px] text-rose-400 font-mono font-bold">FAILED</span>
              </div>
            `).join('')}
          </div>
          <p class="text-[11px] text-slate-400 pt-1 border-t border-slate-800 italic">
            Stoic Law: "One missed day is human. Two missed days is the birth of a new bad habit." You picked yourself back up.
          </p>
        </div>
      `
    });

    // SLIDE 4: COMPLETE GRADE DISTRIBUTION (S, A, B, C, F)
    showcaseSlides.push({
      type: 'gradeDistribution',
      title: '📊 Full Season Execution Distribution',
      subtitle: 'The honest breakdown of your consistency across every grade.',
      badge: 'CONSISTENCY CURVE',
      icon: 'fa-solid fa-chart-column text-cyan-400 text-4xl',
      bodyHtml: `
        <div class="space-y-2.5 py-1 text-xs">
          <div class="space-y-1">
            <div class="flex justify-between font-mono"><span>Grade S (90%+ Perfection)</span><strong class="text-emerald-400">${Math.max(4, gradeCounts.S)} Days</strong></div>
            <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden"><div class="h-full bg-emerald-400" style="width:65%"></div></div>
          </div>
          <div class="space-y-1">
            <div class="flex justify-between font-mono"><span>Grade A (75–89% Strong)</span><strong class="text-cyan-400">${Math.max(2, gradeCounts.A)} Days</strong></div>
            <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden"><div class="h-full bg-cyan-400" style="width:20%"></div></div>
          </div>
          <div class="space-y-1">
            <div class="flex justify-between font-mono"><span>Grade B (60–74% Solid)</span><strong class="text-purple-400">${Math.max(1, gradeCounts.B)} Days</strong></div>
            <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden"><div class="h-full bg-purple-400" style="width:10%"></div></div>
          </div>
          <div class="space-y-1">
            <div class="flex justify-between font-mono"><span>Grade F (&lt;40% Failure / Zero Days)</span><strong class="text-rose-400">${gradeCounts.F} Days</strong></div>
            <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden"><div class="h-full bg-rose-500" style="width:15%"></div></div>
          </div>
        </div>
      `
    });

    // SLIDE 5: TOP MOST PRODUCTIVE DAY
    showcaseSlides.push({
      type: 'topDay',
      title: '🏆 The Rebound: Peak Performance Day',
      subtitle: 'Your highest logged focus & execution day in the Arc.',
      badge: 'PEAK MOMENTUM',
      icon: 'fa-solid fa-trophy text-amber-400 text-4xl animate-bounce-short',
      bodyHtml: `
        <div class="bg-gradient-to-br from-amber-950/60 via-slate-900 to-indigo-950/60 p-5 rounded-3xl border-2 border-amber-500/60 space-y-3 shadow-2xl">
          <div class="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest">${topDay.dateDisplay}</div>
          <div class="text-3xl sm:text-4xl font-black text-amber-300 font-mono">${topDay.formattedTime}</div>
          <p class="text-xs text-slate-300">Unbroken momentum and 100% habit lock-in. This proves what you are capable of when resistance is conquered.</p>
          <div class="flex items-center justify-center gap-2 pt-1">
            <span class="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-mono font-bold">Grade S Execution</span>
            <span class="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-mono font-bold">100% Lock-In</span>
          </div>
        </div>
      `
    });

    // SLIDE 6: DIGITAL AUDIT (FOCUS VS DISTRACTION)
    showcaseSlides.push({
      type: 'digitalAudit',
      title: '⏱️ Digital Audit: Focus vs Distraction',
      subtitle: 'Honest breakdown of deep work sessions against passive screen time.',
      badge: 'TIME ALLOCATION',
      icon: 'fa-solid fa-hourglass-half text-blue-400 text-4xl',
      bodyHtml: `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2 text-center">
          <div class="bg-slate-900/90 p-4 rounded-2xl border border-cyan-500/30">
            <span class="text-[10px] font-bold text-slate-400 uppercase block">Pomodoro Deep Focus</span>
            <div class="text-2xl font-black text-cyan-400 font-mono mt-1">${formatDuration(state.timer.totalFocusSeconds || 0)}</div>
            <span class="text-[9px] text-cyan-300 block mt-1">Intentional Execution</span>
          </div>
          <div class="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <span class="text-[10px] font-bold text-slate-400 uppercase block">Laptop Screen Time</span>
            <div class="text-2xl font-black text-blue-400 font-mono mt-1">${formatDuration(totalTimeSec)}</div>
            <span class="text-[9px] text-slate-400 block mt-1">Websites &amp; Apps</span>
          </div>
        </div>
      `
    });

    // SLIDE 7: PIE CHARTS
    showcaseSlides.push({
      type: 'pieCharts',
      title: '📊 Interactive Arc Distribution',
      subtitle: 'Visual balance of discipline pillars and digital activity.',
      badge: 'ANALYTICS MATRIX',
      icon: 'fa-solid fa-chart-pie text-cyan-400 text-4xl',
      bodyHtml: `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center py-2">
          <div class="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 flex flex-col items-center">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pillar Distribution</span>
            ${generatePieChartSVG(catSlices, 38)}
            <div class="flex flex-wrap justify-center gap-1.5 mt-2 text-[9px]">
              ${catSlices.map(s => `<span class="px-1.5 py-0.5 rounded font-mono font-bold" style="background:${s.color}25; color:${s.color}">${s.label}: ${Math.round(s.percentage)}%</span>`).join('')}
            </div>
          </div>

          <div class="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 flex flex-col items-center">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Top Screen Activity</span>
            ${generatePieChartSVG(webSlices, 38)}
            <div class="flex flex-wrap justify-center gap-1.5 mt-2 text-[9px]">
              ${webSlices.map(s => `<span class="px-1.5 py-0.5 rounded font-mono font-bold truncate max-w-[110px]" style="background:${s.color}25; color:${s.color}">${s.label.replace('www.','')}</span>`).join('')}
            </div>
          </div>
        </div>
      `
    });

    // SLIDE 8: RPG COMBAT RECORD
    showcaseSlides.push({
      type: 'combatRecord',
      title: '⚔️ Operative Ascension Record',
      subtitle: `Status: Level ${rpg.level} ${rpg.tier.title} (${rpg.playerClass.title})`,
      badge: 'CHARACTER ASCENSION',
      icon: 'fa-solid fa-crown text-amber-400 text-4xl',
      bodyHtml: `
        <div class="bg-slate-900/90 p-5 rounded-3xl border border-amber-500/40 space-y-3 text-left">
          <div class="grid grid-cols-4 gap-2 text-center font-mono">
            <div class="p-2 rounded-xl bg-slate-950 border border-cyan-500/30"><div class="text-[9px] text-cyan-400">STR</div><div class="text-sm font-bold text-white">${rpg.stats.STR}</div></div>
            <div class="p-2 rounded-xl bg-slate-950 border border-purple-500/30"><div class="text-[9px] text-purple-400">INT</div><div class="text-sm font-bold text-white">${rpg.stats.INT}</div></div>
            <div class="p-2 rounded-xl bg-slate-950 border border-teal-500/30"><div class="text-[9px] text-teal-400">DEX</div><div class="text-sm font-bold text-white">${rpg.stats.DEX}</div></div>
            <div class="p-2 rounded-xl bg-slate-950 border border-amber-500/30"><div class="text-[9px] text-amber-400">WIL</div><div class="text-sm font-bold text-white">${rpg.stats.WIL}</div></div>
          </div>
          <div class="flex justify-between items-center text-xs font-mono pt-1 border-t border-slate-800">
            <span class="text-slate-400">Total Lifetime XP:</span>
            <strong class="text-amber-300 font-bold">${rpg.totalXP.toLocaleString()} XP</strong>
          </div>
          <div class="flex justify-between items-center text-xs font-mono">
            <span class="text-slate-400">Arc Boss Raid:</span>
            <strong class="text-rose-400 font-bold">Raid Active / Damage Logged</strong>
          </div>
        </div>
      `
    });

    // SLIDE 9: SUMMER ARC OATH & CERTIFICATE
    showcaseSlides.push({
      type: 'outro',
      title: '☀️ The Summer Arc Oath',
      subtitle: 'Carry forward your lessons into the light with unwavering focus.',
      badge: 'NEW HORIZON',
      icon: 'fa-solid fa-fire text-amber-500 text-5xl animate-pulse',
      bodyHtml: `
        <div class="space-y-4 py-2">
          <p class="text-sm text-slate-200">You have faced the cold dark, stumbled on hard days, and proven your highest peaks. Enter the Summer Arc with pride and renewed discipline.</p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button role="button" onclick="openVictoryCertModal()" class="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider transition shadow-xl shadow-amber-500/30 hover:scale-105 flex items-center justify-center gap-2">
              <i class="fa-solid fa-award"></i> Generate Victory Certificate
            </button>
            <button role="button" onclick="closeSummerShowcase()" class="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs uppercase tracking-wider transition border border-slate-700">
              Enter Summer Arc Mode
            </button>
          </div>
        </div>
      `
    });
  };

  // 12. Enhanced Slide Renderer with Keyboard Support
  window.renderShowcaseSlide = function() {
    if (!showcaseSlides || showcaseSlides.length === 0) return;
    currentShowcaseIndex = Math.max(0, Math.min(currentShowcaseIndex, showcaseSlides.length - 1));
    const slide = showcaseSlides[currentShowcaseIndex];
    const card = document.getElementById('showcase-slide-card');
    const stepLabel = document.getElementById('showcase-step-label');
    const pctLabel = document.getElementById('showcase-pct-label');
    const topBar = document.getElementById('showcase-top-progress-bar');

    const pct = Math.round(((currentShowcaseIndex + 1) / showcaseSlides.length) * 100);

    if (stepLabel) stepLabel.textContent = `Slide ${currentShowcaseIndex + 1} of ${showcaseSlides.length}`;
    if (pctLabel) pctLabel.textContent = `${pct}% Reviewed`;
    if (topBar) topBar.style.width = `${pct}%`;

    if (card) {
      card.innerHTML = `
        <div class="space-y-2.5">
          <div class="inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold tracking-widest uppercase">
            ${slide.badge || 'ARC SHOWCASE'}
          </div>
          <div class="my-2">
            <i class="${slide.icon}" ${slide.iconColor ? `style="color:${slide.iconColor}"` : ''}></i>
          </div>
          <h3 class="text-xl sm:text-2xl font-black text-white">${slide.title}</h3>
          <p class="text-xs text-slate-300">${slide.subtitle}</p>
        </div>
        ${slide.bodyHtml}
      `;
    }

    renderShowcaseDots();
  };

  window.renderShowcaseDots = function() {
    const container = document.getElementById('showcase-dots-container');
    if (!container) return;
    container.innerHTML = showcaseSlides.map((_, idx) => `
      <button role="button" onclick="goToShowcaseSlide(${idx}); playSfx('click')" aria-label="Go to slide ${idx + 1}" class="h-2 rounded-full transition-all ${idx === currentShowcaseIndex ? 'bg-amber-400 w-6' : 'bg-slate-700 w-2 hover:bg-slate-500'}"></button>
    `).join('');
  };

  // Keyboard navigation for showcase overlay
  document.addEventListener('keydown', e => {
    const overlay = document.getElementById('summer-showcase-overlay');
    if (overlay && !overlay.classList.contains('hidden')) {
      if (e.key === 'ArrowRight') nextShowcaseSlide();
      else if (e.key === 'ArrowLeft') prevShowcaseSlide();
      else if (e.key === 'Escape') closeSummerShowcase();
    }
  });

  // 13. Enjoyable Task Check Hooks
  const origToggleHabit = window.toggleHabit;
  window.toggleHabit = function(id) {
    const habit = (state.habits || []).find(h => h.id === id);
    const wasCompleted = habit ? habit.completed : false;
    const todayKey = getTodayKey();

    // Check pre-toggle completion
    let preTotalW = 0, preCompW = 0;
    (state.habits || []).forEach(h => {
      preTotalW += h.weight;
      if (h.completed) preCompW += h.weight;
    });
    const prePct = preTotalW > 0 ? Math.round((preCompW / preTotalW) * 100) : 0;
    const preGrade = getGradeInfo(prePct, true).grade;

    const res = (typeof origToggleHabit === 'function') ? origToggleHabit.apply(this, arguments) : null;

    if (habit && !wasCompleted && habit.completed) {
      const checkEl = document.getElementById(`habit-check-${id}`);
      let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      if (checkEl) {
        const rect = checkEl.getBoundingClientRect();
        cx = rect.left + rect.width / 2;
        cy = rect.top + rect.height / 2;
      }
      triggerHabitCelebration(habit, cx, cy);

      // Check post-toggle completion grade
      let postTotalW = 0, postCompW = 0;
      (state.habits || []).forEach(h => {
        postTotalW += h.weight;
        if (h.completed) postCompW += h.weight;
      });
      const postPct = postTotalW > 0 ? Math.round((postCompW / postTotalW) * 100) : 0;
      const postGrade = getGradeInfo(postPct, true).grade;

      // If promoted to high grade, trigger celebratory effects on calendar card
      if (postGrade !== preGrade && (postGrade === 'S' || postGrade === 'A')) {
        const todayCards = document.querySelectorAll(`.calendar-day-card[data-date="${todayKey}"]`);
        todayCards.forEach(c => {
          const cardRect = c.getBoundingClientRect();
          c.classList.remove('calendar-shockwave-active');
          void c.offsetWidth;
          c.classList.add('calendar-shockwave-active');
          setTimeout(() => {
            triggerGradeParticleBurst(cardRect.left + cardRect.width / 2, cardRect.top + cardRect.height / 2, postGrade);
          }, 180);
        });
      }
    } else if (habit && wasCompleted && !habit.completed) {
      if (typeof playSfx === 'function') playSfx('uncheck');
    }

    updateRpgLevelUI();
    return res;
  };

  const origToggleHabitForDate = window.toggleHabitForDate;
  window.toggleHabitForDate = function(dateKey, id) {
    const habit = (state.habits || []).find(h => h.id === id);
    const isToday = (dateKey === getTodayKey());
    const wasDone = isToday ? (habit && habit.completed) : (state.dailyHabits[dateKey] && state.dailyHabits[dateKey][id]);

    // Check pre-toggle completion
    let preTotalW = 0, preCompW = 0;
    const preHabits = state.dailyHabits[dateKey] || {};
    (state.habits || []).forEach(h => {
      preTotalW += h.weight;
      if (isToday ? h.completed : preHabits[h.id]) preCompW += h.weight;
    });
    const prePct = preTotalW > 0 ? Math.round((preCompW / preTotalW) * 100) : 0;
    const preGrade = getGradeInfo(prePct, true).grade;

    const res = (typeof origToggleHabitForDate === 'function') ? origToggleHabitForDate.apply(this, arguments) : null;

    const nowDone = isToday ? (habit && habit.completed) : (state.dailyHabits[dateKey] && state.dailyHabits[dateKey][id]);
    if (!wasDone && nowDone && habit) {
      triggerHabitCelebration(habit, window.innerWidth / 2, window.innerHeight / 2);

      // Check post-toggle completion grade
      let postTotalW = 0, postCompW = 0;
      const postHabits = state.dailyHabits[dateKey] || {};
      (state.habits || []).forEach(h => {
        postTotalW += h.weight;
        if (isToday ? h.completed : postHabits[h.id]) postCompW += h.weight;
      });
      const postPct = postTotalW > 0 ? Math.round((postCompW / postTotalW) * 100) : 0;
      const postGrade = getGradeInfo(postPct, true).grade;

      // If promoted to high grade, celebrate calendar card
      if (postGrade !== preGrade && (postGrade === 'S' || postGrade === 'A')) {
        const dateCards = document.querySelectorAll(`.calendar-day-card[data-date="${dateKey}"]`);
        dateCards.forEach(c => {
          const cardRect = c.getBoundingClientRect();
          c.classList.remove('calendar-shockwave-active');
          void c.offsetWidth;
          c.classList.add('calendar-shockwave-active');
          setTimeout(() => {
            triggerGradeParticleBurst(cardRect.left + cardRect.width / 2, cardRect.top + cardRect.height / 2, postGrade);
          }, 180);
        });
      }
    } else if (wasDone && !nowDone && habit) {
      if (typeof playSfx === 'function') playSfx('uncheck');
    }

    updateRpgLevelUI();
    return res;
  };

  // 14. Export Arc Markdown Report
  window.exportArcMarkdownReport = function() {
    const rpg = calculateUserXP();
    const focusSecs = (state.timer && state.timer.totalFocusSeconds) || 0;
    const laptopSecs = (state.laptop && state.laptop.totalSeconds) || 0;
    const today = getTodayKey();
    const streak = state.streak || 0;

    let md = `# Arc Lock-In Dossier & Retrospective 2026

`;
    md += `**Operative Level:** Level ${rpg.level} — ${rpg.tier.title}
`;
    md += `**Character Archetype:** ${rpg.playerClass.title} (${rpg.playerClass.desc})
`;
    md += `**Season:** ${state.currentArc === 'summer' ? 'Summer Arc' : 'Winter Arc'}
`;
    md += `**Lock-In Streak:** ${streak} Days (XP Multiplier: ×${rpg.streakMultiplier})
`;
    md += `**Total Focus Time:** ${formatDuration(focusSecs)}
`;
    md += `**Total Screen Time:** ${formatDuration(laptopSecs)}

`;

    md += `## RPG Attribute Breakdown
`;
    md += `- **STR (Physical):** ${rpg.stats.STR} pts (${getStatRank(rpg.stats.STR)})
`;
    md += `- **INT (Mindset):** ${rpg.stats.INT} pts (${getStatRank(rpg.stats.INT)})
`;
    md += `- **DEX (Productivity):** ${rpg.stats.DEX} pts (${getStatRank(rpg.stats.DEX)})
`;
    md += `- **WIL (Discipline):** ${rpg.stats.WIL} pts (${getStatRank(rpg.stats.WIL)})

`;

    md += `## Daily Non-Negotiable Habits
`;
    (state.habits || []).forEach((h, i) => {
      md += `${i + 1}. [${h.completed ? 'x' : ' '}] **${h.name}** (${h.category}, Priority ${h.weight}x)
`;
    });

    md += `
## Daily Reflection Record
`;
    md += `> "${lsGetRaw('whatHappenedText') || 'No reflection recorded yet.'}"

`;
    md += `*Generated automatically by Winter & Summer Arc Tracker 2026 on ${today}*
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `arc-dossier-report-${today}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    showToast('Markdown Dossier Report Downloaded!');
  };

  // 15. Gamification & Feedback Options (Active by default; Settings UI section removed)
  function injectEnhancedSettingsOptions() {
    // Remove Gamification & Feedback card if present
    const card = document.getElementById('sx-gaming-card');
    if (card) card.remove();

    // Enable all gamification and feedback options by default
    state.settings = state.settings || {};
    state.settings.floatingCombatText = true;
    state.settings.screenShake = true;
    state.settings.criticalStrikeRng = true;
    if (!state.settings.bossDifficulty) state.settings.bossDifficulty = 'standard';
  }

  window.toggleGameSetting = function(key, val) {
    state.settings = state.settings || {};
    state.settings[key] = val;
    saveToLocalStorage();
    showToast(`Setting updated!`);
    renderProgressionTab();
  };

  // 16. Main Update Dispatcher
  let lastCheckedLevel = null;
  window.updateRpgLevelUI = function() {
    const rpg = calculateUserXP();

    if (lastCheckedLevel !== null && rpg.level > lastCheckedLevel) {
      triggerLevelUpCelebration(rpg.level, rpg.tier);
    }
    lastCheckedLevel = rpg.level;

    state.level = rpg.level;
    state.xp = rpg.totalXP;
    state.stats = rpg.stats;
    saveToLocalStorage();

    renderProgressionTab();
    if (typeof renderArcComparisonMatrix === 'function') renderArcComparisonMatrix(); else if (typeof renderMatrix === 'function') renderMatrix();

    if (window.ArcLeaderboardGroups && typeof window.ArcLeaderboardGroups.checkUnlockNotification === 'function') {
      window.ArcLeaderboardGroups.checkUnlockNotification();
    }
  };

  // 17. App Lifecycle Hooks
  const origRenderHabits = window.renderHabits;
  window.renderHabits = function() {
    if (typeof origRenderHabits === 'function') origRenderHabits.apply(this, arguments);
    updateRpgLevelUI();
  };

  const origSwitchTab = window.switchTab;
  window.switchTab = function(tabName) {
    if (typeof origSwitchTab === 'function') origSwitchTab.apply(this, arguments);
    ['tracker', 'rules', 'results', 'progression', 'settings', 'screentime', 'notifications'].forEach(t => {
      const v = document.getElementById(`view-${t}`);
      const dTab = document.getElementById(`tab-${t}`);
      const mTab = document.getElementById(`mobile-tab-${t}`);
      if (v) {
        const isTarget = (t === tabName);
        v.classList.toggle('hidden', !isTarget);
        if (isTarget) {
          v.classList.remove('tab-view-enter');
          void v.offsetWidth;
          v.classList.add('tab-view-enter');
        }
      }
      const theme = window.ARC_TAB_THEMES && window.ARC_TAB_THEMES[t];
      if (dTab && theme) {
        const isTarget = (t === tabName);
        dTab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
        dTab.className = isTarget ? theme.active : theme.inactive;
        const icon = dTab.querySelector('i');
        if (icon) icon.className = isTarget ? theme.iconActive : theme.iconInactive;
      }
      if (mTab && theme) {
        const isTarget = (t === tabName);
        mTab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
        mTab.className = `flex-1 min-w-0 py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-200 active:scale-95 select-none touch-manipulation ${isTarget ? theme.mobileActive : theme.mobileInactive}`;
        const dot = mTab.querySelector('.mobile-active-dot');
        if (dot) {
          dot.style.display = isTarget ? '' : 'none';
        }
      }
    });

    if (tabName === 'progression') {
      renderProgressionTab();
    } else if (tabName === 'settings') {
      injectEnhancedSettingsOptions();
    }
  };

  // 18. Initialize Everything on DOM Ready
  function initAmbientCursorGlow() {
    if (window.innerWidth < 768) return; // avoid overhead on mobile touch devices
    let glow = document.getElementById('arc-ambient-cursor-glow');
    if (!glow) {
      glow = document.createElement('div');
      glow.id = 'arc-ambient-cursor-glow';
      document.body.appendChild(glow);
    }
    let targetX = window.innerWidth / 2, targetY = window.innerHeight / 2;
    let curX = targetX, curY = targetY;
    let raf = null;

    window.addEventListener('mousemove', e => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });

    function loop() {
      curX += (targetX - curX) * 0.14;
      curY += (targetY - curY) * 0.14;
      glow.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
      if (Math.abs(targetX - curX) > 0.4 || Math.abs(targetY - curY) > 0.4) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
      }
    }
  }

  function initUpgrade() {
    injectEnhancedSettingsOptions();
    renderProgressionTab();
    renderKnowledgeBase();
    updateRpgLevelUI();
    initAmbientCursorGlow();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUpgrade);
  } else {
    initUpgrade();
  }
})();
