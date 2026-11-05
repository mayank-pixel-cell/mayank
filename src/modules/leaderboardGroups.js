// === ARC LEADERBOARD & GROUPS ENGINE ===

/**
 * Arc Tracker - Competitive Ranked Leaderboards & Operative Squads
 * Three Competitive Categories: Regional, Country, Global
 * Gated by Level 10 (Adept Operative status) with interactive Dev Mode preview.
 */
class ArcLeaderboardGroupsEngine {
  constructor() {
    this.activeView = 'leaderboard'; // 'leaderboard' | 'groups'
    this.activeCategory = 'regional'; // 'regional' | 'country' | 'global'
    this.devOverride = false;
    this.isCompacted = true; // COMPACT BY DEFAULT
    this.joinedSquadId = null;
    this.customSquads = [];

    // Unlimited Capacity Squads (No member limit)
    this.defaultSquads = [
      {
        id: 'squad-5am',
        name: '5 AM Club Elite',
        motto: 'Rise in the dark, execute before the world wakes.',
        category: 'Mindset & Morning',
        icon: 'fa-solid fa-sun',
        members: 1240,
        avgScore: '94.6%',
        streak: 34,
        color: 'from-amber-500 to-yellow-400'
      },
      {
        id: 'squad-iron',
        name: 'Iron Willpower Syndicate',
        motto: 'Heavy lifts, zero social media, non-negotiable discipline.',
        category: 'Physical & Strength',
        icon: 'fa-solid fa-dumbbell',
        members: 3820,
        avgScore: '92.1%',
        streak: 28,
        color: 'from-cyan-500 to-blue-500'
      },
      {
        id: 'squad-deepwork',
        name: 'Hyper-Focus Titans',
        motto: '4 hours undistracted code and deep study every day.',
        category: 'Productivity & Focus',
        icon: 'fa-solid fa-brain',
        members: 950,
        avgScore: '89.8%',
        streak: 21,
        color: 'from-purple-500 to-pink-500'
      },
      {
        id: 'squad-cold',
        name: 'Cold Shower & Dopamine Detox',
        motto: 'Embrace physical discomfort, eradicate cheap digital dopamine.',
        category: 'Discipline',
        icon: 'fa-solid fa-snowflake',
        members: 1610,
        avgScore: '88.0%',
        streak: 22,
        color: 'from-teal-500 to-emerald-400'
      }
    ];

    this.leaderboardData = {
      regional: {
        scopeTitle: 'Regional Sector: Western Metro Zone',
        scopeCount: '1,240 Operatives',
        scopeIcon: 'fa-solid fa-location-dot',
        userRank: 7,
        userPercentile: 'Top 1%',
        operatives: [
          { rank: 1, handle: '@vanguard_rex', level: 24, score: '99.4%', streak: '44d', tier: 'Grandmaster', avatar: 'R', color: 'from-amber-400 to-yellow-500' },
          { rank: 2, handle: '@valkyrie_focus', level: 22, score: '98.1%', streak: '39d', tier: 'Master', avatar: 'V', color: 'from-cyan-400 to-blue-500' },
          { rank: 3, handle: '@iron_discipline', level: 21, score: '97.5%', streak: '36d', tier: 'Master', avatar: 'I', color: 'from-purple-400 to-pink-500' },
          { rank: 4, handle: '@solitary_monk', level: 19, score: '95.8%', streak: '32d', tier: 'Diamond', avatar: 'M', color: 'from-emerald-400 to-teal-500' },
          { rank: 5, handle: '@deep_work_titan', level: 17, score: '94.2%', streak: '29d', tier: 'Diamond', avatar: 'D', color: 'from-blue-400 to-indigo-500' },
          { rank: 6, handle: '@zenith_operative', level: 15, score: '93.0%', streak: '24d', tier: 'Platinum', avatar: 'Z', color: 'from-indigo-400 to-purple-500' },
          { rank: 8, handle: '@cold_shower_sam', level: 14, score: '91.5%', streak: '21d', tier: 'Platinum', avatar: 'S', color: 'from-cyan-400 to-teal-500' },
          { rank: 9, handle: '@shadow_runner', level: 12, score: '89.2%', streak: '17d', tier: 'Gold', avatar: 'S', color: 'from-amber-400 to-orange-500' },
          { rank: 10, handle: '@hyperfocus_leo', level: 11, score: '87.0%', streak: '15d', tier: 'Gold', avatar: 'L', color: 'from-rose-400 to-pink-500' }
        ]
      },
      country: {
        scopeTitle: 'National League: India (IN)',
        scopeCount: '18,920 Operatives',
        scopeIcon: 'fa-solid fa-flag',
        userRank: 42,
        userPercentile: 'Top 3%',
        operatives: [
          { rank: 1, handle: '@arjuna_focus', level: 32, score: '99.8%', streak: '58d', tier: 'Apex Legend', avatar: 'A', color: 'from-amber-400 to-yellow-500' },
          { rank: 2, handle: '@kavach_iron', level: 29, score: '99.1%', streak: '51d', tier: 'Grandmaster', avatar: 'K', color: 'from-cyan-400 to-blue-500' },
          { rank: 3, handle: '@vanguard_rex', level: 24, score: '98.5%', streak: '44d', tier: 'Master', avatar: 'V', color: 'from-purple-400 to-pink-500' },
          { rank: 4, handle: '@dharma_warrior', level: 23, score: '97.9%', streak: '41d', tier: 'Master', avatar: 'D', color: 'from-emerald-400 to-teal-500' },
          { rank: 5, handle: '@shunya_mind', level: 21, score: '96.4%', streak: '35d', tier: 'Diamond', avatar: 'S', color: 'from-blue-400 to-indigo-500' },
          { rank: 6, handle: '@agni_discipline', level: 20, score: '95.2%', streak: '33d', tier: 'Diamond', avatar: 'A', color: 'from-indigo-400 to-purple-500' },
          { rank: 7, handle: '@garuda_titan', level: 18, score: '94.0%', streak: '29d', tier: 'Diamond', avatar: 'G', color: 'from-teal-400 to-cyan-500' },
          { rank: 8, handle: '@brahma_stride', level: 16, score: '92.8%', streak: '26d', tier: 'Platinum', avatar: 'B', color: 'from-amber-400 to-orange-500' }
        ]
      },
      global: {
        scopeTitle: 'Worldwide Syndicate: 142 Countries',
        scopeCount: '148,500 Operatives',
        scopeIcon: 'fa-solid fa-globe',
        userRank: 284,
        userPercentile: 'Top 5%',
        operatives: [
          { rank: 1, handle: '@kratos_lockin', level: 42, score: '100%', streak: '78d', tier: 'Immortal', avatar: 'K', color: 'from-amber-400 to-yellow-500' },
          { rank: 2, handle: '@shinobi_discipline', level: 38, score: '99.9%', streak: '69d', tier: 'Apex Legend', avatar: 'S', color: 'from-cyan-400 to-blue-500' },
          { rank: 3, handle: '@nordic_stoic', level: 35, score: '99.5%', streak: '62d', tier: 'Apex Legend', avatar: 'N', color: 'from-purple-400 to-pink-500' },
          { rank: 4, handle: '@arjuna_focus', level: 32, score: '99.2%', streak: '58d', tier: 'Grandmaster', avatar: 'A', color: 'from-emerald-400 to-teal-500' },
          { rank: 5, handle: '@spartan_iron', level: 30, score: '98.7%', streak: '53d', tier: 'Grandmaster', avatar: 'S', color: 'from-blue-400 to-indigo-500' },
          { rank: 6, handle: '@valkyrie_focus', level: 27, score: '98.1%', streak: '47d', tier: 'Master', avatar: 'V', color: 'from-indigo-400 to-purple-500' },
          { rank: 7, handle: '@cyber_monk', level: 25, score: '97.4%', streak: '43d', tier: 'Master', avatar: 'C', color: 'from-teal-400 to-cyan-500' },
          { rank: 8, handle: '@titan_zen', level: 23, score: '96.0%', streak: '38d', tier: 'Diamond', avatar: 'T', color: 'from-rose-400 to-pink-500' }
        ]
      }
    };
  }

  init() {
    try {
      this.joinedSquadId = localStorage.getItem('arc_joined_squad_id') || null;
      const savedCustom = localStorage.getItem('arc_custom_squads');
      if (savedCustom) {
        this.customSquads = JSON.parse(savedCustom) || [];
      }
      const savedCompact = localStorage.getItem('arc_lb_compact');
      if (savedCompact !== null) {
        this.isCompacted = savedCompact === 'true';
      } else {
        this.isCompacted = true; // COMPACT BY DEFAULT
      }
    } catch (_) {}

    // Check if level >= 10 and notification should be dispatched
    this.checkUnlockNotification(false);

    this.render();
  }

  getUserLevel() {
    if (typeof window.calculateUserXP === 'function') {
      const rpg = window.calculateUserXP();
      if (rpg && rpg.level) return rpg.level;
    }
    return (window.state && window.state.level) || 1;
  }

  isUnlocked() {
    if (this.devOverride) return true;
    return this.getUserLevel() >= 10;
  }

  toggleCompact() {
    this.isCompacted = !this.isCompacted;
    try {
      localStorage.setItem('arc_lb_compact', this.isCompacted ? 'true' : 'false');
    } catch (_) {}
    if (typeof window.playSfx === 'function') window.playSfx('click');
    this.render();
  }

  checkUnlockNotification(isDevSimulation = false) {
    const userLevel = this.getUserLevel();
    if (!isDevSimulation && userLevel < 10) return;

    const storageKey = 'arc_lb_unlocked_notified';
    let alreadyNotified = false;
    try {
      alreadyNotified = localStorage.getItem(storageKey) === 'true';
    } catch (_) {}

    if (alreadyNotified && !isDevSimulation) return;

    if (!isDevSimulation) {
      try {
        localStorage.setItem(storageKey, 'true');
      } catch (_) {}
    }

    const title = isDevSimulation
      ? '🏆 Note: Leaderboards are now unlocked! (Dev Preview)'
      : '🏆 Note: Leaderboards are now unlocked!';
    const message = isDevSimulation
      ? 'Level 10 reached! Note: Leaderboards are now unlocked. Regional, Country, and Global ranked competition is now accessible.'
      : 'Level 10 reached! Note: Leaderboards are now unlocked. Check your standings in Results across Regional, Country, and Global ladders.';

    if (window.ArcNotifications && typeof window.ArcNotifications.notify === 'function') {
      window.ArcNotifications.notify({
        title,
        message,
        type: 'system',
        category: 'Milestone Unlocked',
        icon: 'fa-solid fa-trophy',
        features: [
          'Unlocked Regional, Country, and Global competitive ladders',
          'Real-time percentile rankings and operative scores',
          'Operative accountability squads with unlimited member capacity'
        ]
      });
    } else {
      if (typeof window.showToast === 'function') window.showToast(title);
      if (typeof window.playSfx === 'function') window.playSfx('levelUp');
    }
  }

  switchView(view) {
    this.activeView = view;
    if (typeof window.playSfx === 'function') window.playSfx('click');

    const btnLb = document.getElementById('tab-btn-leaderboard');
    const btnGp = document.getElementById('tab-btn-groups');
    const lbView = document.getElementById('lb-view-container');
    const gpView = document.getElementById('groups-view-container');

    if (btnLb && btnGp && lbView && gpView) {
      if (view === 'leaderboard') {
        btnLb.className = "px-2.5 py-1 rounded-md text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 font-black shadow-sm flex items-center gap-1.5 transition active:scale-95";
        btnGp.className = "px-2.5 py-1 rounded-md text-slate-400 hover:text-slate-200 transition flex items-center gap-1.5 active:scale-95";
        lbView.classList.remove('hidden');
        gpView.classList.add('hidden');
      } else {
        btnGp.className = "px-2.5 py-1 rounded-md text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 font-black shadow-sm flex items-center gap-1.5 transition active:scale-95";
        btnLb.className = "px-2.5 py-1 rounded-md text-slate-400 hover:text-slate-200 transition flex items-center gap-1.5 active:scale-95";
        gpView.classList.remove('hidden');
        lbView.classList.add('hidden');
      }
    }

    this.render();
  }

  setCategory(category) {
    if (!['regional', 'country', 'global'].includes(category)) return;
    this.activeCategory = category;
    if (typeof window.playSfx === 'function') window.playSfx('tab');

    ['regional', 'country', 'global'].forEach(cat => {
      const btn = document.getElementById(`btn-lb-cat-${cat}`);
      if (btn) {
        if (cat === category) {
          btn.className = "flex-1 py-1 px-2 rounded-lg text-center transition flex items-center justify-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-sm";
        } else {
          btn.className = "flex-1 py-1 px-2 rounded-lg text-center text-slate-400 hover:text-slate-200 transition flex items-center justify-center gap-1 font-semibold";
        }
      }
    });

    this.renderLeaderboard();
  }

  toggleDevOverride() {
    this.devOverride = !this.devOverride;
    if (typeof window.playSfx === 'function') window.playSfx('check');
    if (typeof window.showToast === 'function') {
      window.showToast(this.devOverride ? '🏆 Note: Leaderboards are now unlocked! (Dev Preview)' : '🔒 Restored to actual Operative Level');
    }
    if (this.devOverride) {
      this.checkUnlockNotification(true);
    }
    this.render();
  }

  joinSquad(squadId) {
    if (this.joinedSquadId && this.joinedSquadId !== squadId) {
      const prev = [...this.defaultSquads, ...this.customSquads].find(s => s.id === this.joinedSquadId);
      if (prev && prev.members > 0) prev.members--;
    }

    this.joinedSquadId = squadId;
    try {
      localStorage.setItem('arc_joined_squad_id', squadId);
    } catch (_) {}

    const allSquads = [...this.defaultSquads, ...this.customSquads];
    const target = allSquads.find(s => s.id === squadId);
    if (target) target.members++;

    if (typeof window.playSfx === 'function') window.playSfx('check');
    if (typeof window.showToast === 'function') {
      window.showToast(`⚔️ Joined ${target ? target.name : 'Squad'}! (Unlimited size)`);
    }
    this.renderGroups();
  }

  leaveSquad() {
    const prev = [...this.defaultSquads, ...this.customSquads].find(s => s.id === this.joinedSquadId);
    if (prev && prev.members > 1) prev.members--;

    this.joinedSquadId = null;
    try {
      localStorage.removeItem('arc_joined_squad_id');
    } catch (_) {}
    if (typeof window.playSfx === 'function') window.playSfx('click');
    if (typeof window.showToast === 'function') {
      window.showToast('Left squad.');
    }
    this.renderGroups();
  }

  openCreateSquadModal() {
    const modal = document.getElementById('arc-create-squad-modal');
    if (modal) modal.classList.remove('hidden');
    if (typeof window.playSfx === 'function') window.playSfx('hover');
  }

  closeCreateSquadModal() {
    const modal = document.getElementById('arc-create-squad-modal');
    if (modal) modal.classList.add('hidden');
  }

  handleCreateSquad(e) {
    if (e) e.preventDefault();
    const nameEl = document.getElementById('new-squad-name');
    const mottoEl = document.getElementById('new-squad-motto');
    const catEl = document.getElementById('new-squad-category');

    const name = nameEl ? nameEl.value.trim() : '';
    const motto = mottoEl ? mottoEl.value.trim() : '';
    const category = catEl ? catEl.value : 'All Pillars';

    if (!name) return;

    const newSquad = {
      id: 'squad-custom-' + Date.now(),
      name,
      motto: motto || 'Formed in discipline.',
      category,
      icon: 'fa-solid fa-shield-halved',
      members: 1, // Unlimited capacity, starts with creator
      avgScore: '100%',
      streak: 1,
      color: 'from-amber-400 to-yellow-500'
    };

    this.customSquads.push(newSquad);
    this.joinedSquadId = newSquad.id;

    try {
      localStorage.setItem('arc_custom_squads', JSON.stringify(this.customSquads));
      localStorage.setItem('arc_joined_squad_id', newSquad.id);
    } catch (_) {}

    this.closeCreateSquadModal();
    if (nameEl) nameEl.value = '';
    if (mottoEl) mottoEl.value = '';

    if (typeof window.playSfx === 'function') window.playSfx('levelUp');
    if (typeof window.showToast === 'function') {
      window.showToast(`⚔️ Squad "${name}" created! Unlimited member capacity enabled.`);
    }

    this.renderGroups();
  }

  render() {
    // Update Compact / Expand toggle button in header
    const compactIcon = document.getElementById('lb-compact-icon');
    const compactLabel = document.getElementById('lb-compact-label');
    if (compactIcon && compactLabel) {
      if (this.isCompacted) {
        compactIcon.className = "fa-solid fa-up-right-and-down-left-from-center text-[9px]";
        compactLabel.textContent = "Expand";
      } else {
        compactIcon.className = "fa-solid fa-down-left-and-up-right-to-center text-[9px]";
        compactLabel.textContent = "Compact";
      }
    }

    this.renderLeaderboard();
    this.renderGroups();
  }

  renderLeaderboard() {
    const userLevel = this.getUserLevel();
    const unlocked = this.isUnlocked();

    // 1. Update Lock Status Pill in Header
    const lockPill = document.getElementById('lb-lock-pill');
    if (lockPill) {
      if (unlocked) {
        lockPill.className = "text-[9px] font-mono font-black px-2 py-0.5 rounded-full border bg-emerald-500/15 text-emerald-300 border-emerald-500/30 flex items-center gap-1";
        lockPill.innerHTML = '<i class="fa-solid fa-unlock text-[8px]"></i><span>UNLOCKED</span>';
      } else {
        lockPill.className = "text-[9px] font-mono font-black px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-300 border-amber-500/30 flex items-center gap-1";
        lockPill.innerHTML = '<i class="fa-solid fa-lock text-[8px]"></i><span>LVL 10</span>';
      }
    }

    // 2. Toggle Locked vs Unlocked Container
    const lockedContainer = document.getElementById('lb-locked-container');
    const unlockedContainer = document.getElementById('lb-unlocked-container');

    if (lockedContainer && unlockedContainer) {
      lockedContainer.classList.toggle('hidden', unlocked);
      unlockedContainer.classList.toggle('hidden', !unlocked);
    }

    // 3. Render Locked State (Compact vs Full)
    if (!unlocked && lockedContainer) {
      const pct = Math.min(100, Math.round((userLevel / 10) * 100));
      const remaining = Math.max(0, 10 - userLevel);

      if (this.isCompacted) {
        // COMPACT LOCKED VIEW (~80px)
        lockedContainer.innerHTML = `
          <div class="p-3 rounded-xl bg-slate-950/85 border border-amber-500/30 space-y-2">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 grid place-items-center text-xs shrink-0">
                  <i class="fa-solid fa-lock"></i>
                </div>
                <div>
                  <h4 class="text-xs font-bold text-white leading-tight">Ranked Leaderboard Locked</h4>
                  <p class="text-[10px] text-slate-400">Requires Level 10 (Adept Operative)</p>
                </div>
              </div>
              <span class="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                Lvl ${userLevel} / 10 (${pct}%)
              </span>
            </div>
            <div class="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500" style="width: ${pct}%"></div>
            </div>
            <div class="flex items-center justify-between text-[10px] pt-0.5">
              <button type="button" onclick="ArcLeaderboardGroups.toggleDevOverride()" class="text-amber-400 hover:text-amber-300 font-mono font-bold flex items-center gap-1 transition">
                <i class="fa-solid fa-flask text-[9px]"></i> Preview Level 10 (Dev Mode)
              </button>
              <button type="button" onclick="ArcLeaderboardGroups.toggleCompact()" class="text-slate-400 hover:text-white flex items-center gap-1 transition font-mono">
                Details <i class="fa-solid fa-chevron-down text-[8px]"></i>
              </button>
            </div>
          </div>
        `;
      } else {
        // FULL EXPANDED LOCKED VIEW
        lockedContainer.innerHTML = `
          <div class="p-4 sm:p-5 rounded-2xl bg-slate-950/85 border border-amber-500/30 text-center space-y-3 relative overflow-hidden">
            <div class="w-12 h-12 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 grid place-items-center text-xl shadow-inner">
              <i class="fa-solid fa-lock"></i>
            </div>
            <div class="space-y-1">
              <span class="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
                <i class="fa-solid fa-shield-halved text-[8px]"></i>
                <span>CLASSIFIED PROTOCOL • LEVEL 10 REQUIRED</span>
              </span>
              <h4 class="text-sm sm:text-base font-black text-white">Ranked Leaderboard Locked</h4>
              <p class="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Regional, Country, and Global ranked competition requires <span class="text-amber-300 font-bold">Level 10 (Adept Operative)</span> status. Complete daily habits and maintain focus sessions to level up.
              </p>
            </div>

            <!-- Progress Meter -->
            <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-left max-w-md mx-auto">
              <div class="flex items-center justify-between text-xs font-mono">
                <span class="text-slate-300 font-bold">Your Rank: Level ${userLevel}</span>
                <span class="text-amber-400 font-black">${userLevel} / 10 Levels (${pct}%)</span>
              </div>
              <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div class="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500" style="width: ${pct}%"></div>
              </div>
              <div class="flex items-center justify-between text-[10px] text-slate-400">
                <span>${remaining} levels remaining</span>
                <span class="text-cyan-400">Earn XP from Habits &amp; Pomodoro</span>
              </div>
            </div>

            <div class="pt-1 flex items-center justify-center gap-2">
              <button type="button" onclick="ArcLeaderboardGroups.toggleDevOverride()" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm" title="Simulate Level 10 to preview all 3 leaderboard categories">
                <i class="fa-solid fa-flask text-amber-400"></i>
                <span>Preview Level 10 (Dev Mode)</span>
              </button>
            </div>
          </div>
        `;
      }
      return;
    }

    // 4. Populate Unlocked State (Three Categories)
    const data = this.leaderboardData[this.activeCategory] || this.leaderboardData.regional;

    // Scope Header
    const scopeTitle = document.getElementById('lb-scope-title');
    const scopeCount = document.getElementById('lb-scope-count');
    const scopeIcon = document.getElementById('lb-scope-icon');
    if (scopeTitle) scopeTitle.textContent = data.scopeTitle;
    if (scopeCount) scopeCount.textContent = data.scopeCount;
    if (scopeIcon) scopeIcon.innerHTML = `<i class="${data.scopeIcon}"></i>`;

    // User Profile Data
    let handle = '@operative';
    let avatarChar = 'O';
    try {
      if (window.ArcProfile && typeof window.ArcProfile.getProfile === 'function') {
        const p = window.ArcProfile.getProfile();
        if (p && p.user) handle = p.user;
        if (p && p.name) avatarChar = p.name.charAt(0).toUpperCase();
      }
    } catch (_) {}

    const userStats = document.getElementById('lb-user-stats');
    const userHandle = document.getElementById('lb-user-handle');
    const userAvatar = document.getElementById('lb-user-avatar');
    const userRankDisplay = document.getElementById('lb-user-rank-display');
    const userPercentile = document.getElementById('lb-user-percentile');

    const arcScore = (window.state && window.state.overallArcIndex) ? window.state.overallArcIndex : '15%';
    const streak = (window.state && window.state.streak) ? window.state.streak : 0;

    if (userHandle) userHandle.textContent = handle;
    if (userAvatar) userAvatar.textContent = avatarChar;
    if (userStats) userStats.textContent = `Level ${userLevel} • ${arcScore} Score • ${streak}d Streak`;

    const catLabel = this.activeCategory === 'regional' ? 'Regional' : (this.activeCategory === 'country' ? 'National' : 'Global');
    if (userRankDisplay) userRankDisplay.textContent = `#${data.userRank} ${catLabel}`;
    if (userPercentile) userPercentile.textContent = data.userPercentile;

    // Ladder Table Rows
    const rankingsList = document.getElementById('lb-rankings-list');
    const footerAction = document.getElementById('lb-ladder-footer-action');

    if (rankingsList) {
      let rows = [...data.operatives];
      const userObj = {
        rank: data.userRank,
        handle: `${handle} (YOU)`,
        level: userLevel,
        score: arcScore,
        streak: `${streak}d`,
        tier: userLevel >= 25 ? 'Master' : (userLevel >= 15 ? 'Diamond' : 'Platinum'),
        avatar: avatarChar,
        isUser: true,
        color: 'from-cyan-400 to-indigo-500'
      };

      rows.push(userObj);
      rows.sort((a, b) => a.rank - b.rank);

      // Adjust height based on isCompacted
      if (this.isCompacted) {
        rankingsList.className = "space-y-1 max-h-36 overflow-y-auto pr-1 custom-scroll";
        if (footerAction) {
          footerAction.innerHTML = `
            <button type="button" onclick="ArcLeaderboardGroups.toggleCompact()" class="w-full py-1.5 text-center text-[10px] font-mono text-amber-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 rounded-lg border border-slate-800 transition flex items-center justify-center gap-1.5">
              <i class="fa-solid fa-chevron-down text-[8px]"></i>
              <span>Expand Full Leaderboard (${rows.length} Operatives)</span>
            </button>
          `;
        }
      } else {
        rankingsList.className = "space-y-1.5 max-h-72 overflow-y-auto pr-1 custom-scroll";
        if (footerAction) {
          footerAction.innerHTML = `
            <button type="button" onclick="ArcLeaderboardGroups.toggleCompact()" class="w-full py-1.5 text-center text-[10px] font-mono text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 rounded-lg border border-slate-800 transition flex items-center justify-center gap-1.5">
              <i class="fa-solid fa-chevron-up text-[8px]"></i>
              <span>Compact View</span>
            </button>
          `;
        }
      }

      rankingsList.innerHTML = rows.map(op => {
        const isTop1 = op.rank === 1;
        const isTop2 = op.rank === 2;
        const isTop3 = op.rank === 3;

        let rankBadge = `<span class="font-mono font-bold text-slate-400 text-[11px] w-5 text-center">#${op.rank}</span>`;
        if (isTop1) rankBadge = `<span class="text-xs" title="Rank 1 🥇">🥇</span>`;
        else if (isTop2) rankBadge = `<span class="text-xs" title="Rank 2 🥈">🥈</span>`;
        else if (isTop3) rankBadge = `<span class="text-xs" title="Rank 3 🥉">🥉</span>`;

        const rowBorder = op.isUser
          ? 'border-cyan-400/80 bg-cyan-950/30 shadow-[0_0_15px_rgba(0,240,255,0.15)] ring-1 ring-cyan-400/50'
          : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700';

        return `
          <div class="p-1.5 sm:p-2 rounded-xl border ${rowBorder} flex items-center justify-between text-xs transition-all">
            <div class="flex items-center gap-2 min-w-0">
              <div class="flex items-center justify-center w-5 shrink-0">${rankBadge}</div>
              <div class="w-5 h-5 rounded-full bg-gradient-to-tr ${op.color || 'from-slate-700 to-slate-800'} text-white font-bold grid place-items-center text-[9px] shrink-0 border border-white/20">
                ${op.avatar || op.handle.charAt(1).toUpperCase()}
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="font-bold ${op.isUser ? 'text-cyan-300' : 'text-slate-200'} text-[11px] truncate">${op.handle}</span>
                  <span class="text-[8px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">Lvl ${op.level}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 text-right shrink-0 font-mono text-[10px]">
              <span class="text-amber-400 font-bold hidden sm:inline"><i class="fa-solid fa-fire text-[9px]"></i> ${op.streak}</span>
              <span class="font-black ${op.isUser ? 'text-cyan-400' : 'text-white'}">${op.score}</span>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  renderGroups() {
    const allSquads = [...this.defaultSquads, ...this.customSquads];
    const joined = allSquads.find(s => s.id === this.joinedSquadId);

    // 1. Active Squad Banner (Unlimited capacity, sleek)
    const activeBanner = document.getElementById('groups-active-banner');
    if (activeBanner) {
      if (joined) {
        activeBanner.innerHTML = `
          <div class="flex items-start justify-between gap-2">
            <div class="space-y-0.5 min-w-0">
              <span class="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <i class="fa-solid fa-circle-check"></i> ACTIVE OPERATIVE SQUAD
              </span>
              <h5 class="text-xs font-black text-white truncate">${joined.name}</h5>
              <p class="text-[10px] text-slate-300 line-clamp-1">${joined.motto}</p>
            </div>
            <button type="button" onclick="ArcLeaderboardGroups.leaveSquad()" class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 text-[10px] font-bold transition shrink-0 active:scale-95">
              Leave
            </button>
          </div>
          <div class="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Members: <b class="text-cyan-300">${joined.members.toLocaleString()}</b> <span class="text-emerald-400 font-sans text-[9px]">(Unlimited)</span></span>
            <span>Avg Score: <b class="text-amber-300">${joined.avgScore}</b></span>
            <span>Streak: <b class="text-emerald-300">${joined.streak}d</b></span>
          </div>
        `;
      } else {
        activeBanner.innerHTML = `
          <div class="text-center py-1.5 space-y-0.5">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No Active Squad</span>
            <p class="text-[10px] text-slate-400">Join an unlimited accountability squad below to link streak telemetry with peer operatives.</p>
          </div>
        `;
      }
    }

    // 2. Squads List
    const squadsList = document.getElementById('groups-squads-list');
    const footerAction = document.getElementById('groups-footer-action');

    if (squadsList) {
      if (this.isCompacted) {
        squadsList.className = "space-y-1.5 max-h-44 overflow-y-auto pr-1 custom-scroll";
        if (footerAction) {
          footerAction.innerHTML = `
            <button type="button" onclick="ArcLeaderboardGroups.toggleCompact()" class="w-full py-1.5 text-center text-[10px] font-mono text-cyan-300 hover:text-white bg-slate-900/60 hover:bg-slate-800 rounded-lg border border-slate-800 transition flex items-center justify-center gap-1.5">
              <i class="fa-solid fa-chevron-down text-[8px]"></i>
              <span>Expand All Squads (${allSquads.length})</span>
            </button>
          `;
        }
      } else {
        squadsList.className = "space-y-2 max-h-72 overflow-y-auto pr-1 custom-scroll";
        if (footerAction) {
          footerAction.innerHTML = `
            <button type="button" onclick="ArcLeaderboardGroups.toggleCompact()" class="w-full py-1.5 text-center text-[10px] font-mono text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 rounded-lg border border-slate-800 transition flex items-center justify-center gap-1.5">
              <i class="fa-solid fa-chevron-up text-[8px]"></i>
              <span>Compact View</span>
            </button>
          `;
        }
      }

      squadsList.innerHTML = allSquads.map(s => {
        const isJoined = s.id === this.joinedSquadId;
        return `
          <div class="p-2 sm:p-2.5 rounded-xl border ${isJoined ? 'border-cyan-400/80 bg-cyan-950/20 ring-1 ring-cyan-400/40' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'} space-y-1.5 transition-all">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-start gap-2 min-w-0">
                <div class="w-7 h-7 rounded-xl bg-gradient-to-tr ${s.color || 'from-cyan-500 to-blue-500'} text-slate-950 font-black grid place-items-center text-[11px] shrink-0 shadow-sm">
                  <i class="${s.icon || 'fa-solid fa-shield-halved'}"></i>
                </div>
                <div class="min-w-0">
                  <h5 class="text-xs font-black text-white leading-tight truncate">${s.name}</h5>
                  <p class="text-[10px] text-slate-400 leading-snug line-clamp-1">${s.motto}</p>
                </div>
              </div>
              <div class="shrink-0">
                ${isJoined ? `
                  <span class="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-bold flex items-center gap-1">
                    <i class="fa-solid fa-check text-[8px]"></i> Joined
                  </span>
                ` : `
                  <button type="button" onclick="ArcLeaderboardGroups.joinSquad('${s.id}')" class="px-2.5 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 text-[10px] font-bold transition active:scale-95">
                    Join
                  </button>
                `}
              </div>
            </div>
            <div class="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
              <span class="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[9px] font-sans">${s.category}</span>
              <div class="flex items-center gap-2">
                <span class="flex items-center gap-1"><i class="fa-solid fa-users text-[9px] text-slate-500"></i> ${s.members.toLocaleString()} <span class="text-emerald-400 font-mono text-[9px]">∞</span></span>
                <span><i class="fa-solid fa-fire text-[9px] text-amber-400"></i> ${s.streak}d</span>
                <span class="text-cyan-300 font-bold">${s.avgScore}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }
}

const arcLeaderboardGroups = new ArcLeaderboardGroupsEngine();

if (typeof window !== 'undefined') {
  window.ArcLeaderboardGroups = arcLeaderboardGroups;
}
