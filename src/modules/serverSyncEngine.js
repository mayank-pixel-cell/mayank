// ============================================================================
// ARC EXTERNAL SERVER SYNC ENGINE (window.ArcServerSync)
// Live client sync engine for Users, Arc Gold VIP Purchases, Leaderboards & Squads
// ============================================================================

(function() {
  const SERVER_URL_KEY = 'arc_external_server_url';
  const UID_KEY = 'arc_operative_uid';
  const QUEUE_KEY = 'arc_server_sync_queue';
  const CACHE_TELEMETRY_KEY = 'arc_cached_telemetry_summary';
  const CACHE_GOLD_KEY = 'arc_cached_gold_users';
  const CACHE_RANKS_KEY = 'arc_cached_ranks';
  const JOINED_GROUPS_KEY = 'arc_user_joined_group_ids';

  class ArcServerSyncEngine {
    constructor() {
      this.serverUrl = this.getStoredServerUrl();
      this.isOnline = false;
      this.lastSyncTime = null;
      this.syncDebounceTimer = null;
      this.periodicTimer = null;
      this.cachedTelemetry = null;
      this.cachedGoldUsers = [];
      this.cachedRanks = null;
      this.isSyncing = false;
    }

    getStoredServerUrl() {
      try {
        return localStorage.getItem(SERVER_URL_KEY) || 'http://localhost:4000';
      } catch (_) {
        return 'http://localhost:4000';
      }
    }

    setServerUrl(url) {
      if (!url) return;
      const cleanUrl = url.trim().replace(/\/+$/, '');
      this.serverUrl = cleanUrl;
      try {
        localStorage.setItem(SERVER_URL_KEY, cleanUrl);
      } catch (_) {}
      this.syncUserAndFetchTelemetry();
      if (typeof window.showToast === 'function') {
        window.showToast(`Server URL updated: ${cleanUrl}`);
      }
    }

    getOperativeUid() {
      try {
        // If logged into Google, link to Google ID or email
        if (window.ArcGoogleSync && typeof window.ArcGoogleSync.getUser === 'function') {
          const gUser = window.ArcGoogleSync.getUser();
          if (gUser && (gUser.sub || gUser.id || gUser.email)) {
            const gid = 'g_' + (gUser.sub || gUser.id || gUser.email).replace(/[^a-zA-Z0-9_-]/g, '_');
            localStorage.setItem(UID_KEY, gid);
            return gid;
          }
        }
        let uid = localStorage.getItem(UID_KEY);
        if (!uid) {
          uid = 'op_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
          localStorage.setItem(UID_KEY, uid);
        }
        return uid;
      } catch (_) {
        return 'op_fallback_' + Date.now();
      }
    }

    getJoinedGroupIds() {
      try {
        const stored = localStorage.getItem(JOINED_GROUPS_KEY);
        if (stored) {
          const arr = JSON.parse(stored);
          if (Array.isArray(arr)) return arr;
        }
        // Fallback: check legacy single squad ID
        const single = localStorage.getItem('arc_joined_squad_id');
        if (single) {
          return [single];
        }
      } catch (_) {}
      return [];
    }

    saveJoinedGroupIds(groupIds) {
      try {
        const arr = Array.isArray(groupIds) ? groupIds : [];
        localStorage.setItem(JOINED_GROUPS_KEY, JSON.stringify(arr));
        if (arr.length > 0) {
          localStorage.setItem('arc_joined_squad_id', arr[0]);
        } else {
          localStorage.removeItem('arc_joined_squad_id');
        }
      } catch (_) {}
    }

    getOperativePayload() {
      const uid = this.getOperativeUid();
      let handle = '@operative';
      let displayName = 'Primary Operative';
      let avatar = 'O';

      try {
        if (window.ArcProfile && typeof window.ArcProfile.getProfile === 'function') {
          const p = window.ArcProfile.getProfile();
          if (p) {
            if (p.user) handle = p.user;
            if (p.name) displayName = p.name;
            if (displayName) avatar = displayName.charAt(0).toUpperCase();
          }
        }
      } catch (_) {}

      let level = 1;
      let xp = 0;
      let streak = 0;
      let arcScore = 0;

      try {
        if (window.ArcLeaderboardGroups && typeof window.ArcLeaderboardGroups.getUserLevel === 'function') {
          level = window.ArcLeaderboardGroups.getUserLevel();
        } else if (window.state && window.state.level) {
          level = window.state.level;
        }

        if (window.state) {
          xp = window.state.xp || 0;
          streak = window.state.streak || 0;
          if (window.state.overallArcIndex !== undefined) {
            arcScore = parseFloat(String(window.state.overallArcIndex).replace('%', '')) || 0;
          }
        }
      } catch (_) {}

      let isGold = false;
      let goldPlan = null;
      let goldPurchasedAt = null;

      try {
        if (window.ArcGold) {
          isGold = typeof window.ArcGold.isGold === 'function' ? window.ArcGold.isGold() : false;
          if (typeof window.ArcGold.getState === 'function') {
            const gState = window.ArcGold.getState();
            if (gState) {
              goldPlan = gState.plan || null;
              if (gState.activatedAt) {
                goldPurchasedAt = new Date(gState.activatedAt).toISOString();
              }
            }
          }
        }
      } catch (_) {}

      const region = localStorage.getItem('arc_user_region') || 'Western Metro Zone';
      const country = localStorage.getItem('arc_user_country') || 'India';
      const joinedGroupIds = this.getJoinedGroupIds();

      return {
        userId: uid,
        handle,
        displayName,
        avatar,
        region,
        country,
        level,
        xp,
        arcScore,
        streak,
        isGold,
        goldPlan,
        goldPurchasedAt,
        joinedGroupIds
      };
    }

    init() {
      // 1. Initial sync and telemetry fetch
      this.syncUserAndFetchTelemetry();

      // 2. Set recurring 60s background sync
      if (this.periodicTimer) clearInterval(this.periodicTimer);
      this.periodicTimer = setInterval(() => {
        this.syncUserAndFetchTelemetry();
      }, 60000);

      // 3. Online/offline window events
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.updateOfflineIndicator(false);
        this.flushOfflineQueue();
        this.syncUserAndFetchTelemetry();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.updateOfflineIndicator(true);
        this.renderSettingsCard();
      });

      // 4. Render UI cards if DOM is already ready
      this.renderSettingsCard();
    }

    updateOfflineIndicator(isOffline) {
      const ind = document.getElementById('arc-offline-indicator');
      if (ind) {
        if (isOffline) {
          ind.classList.remove('hidden');
          ind.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span><span>OFFLINE CACHE</span>';
        } else {
          ind.classList.add('hidden');
        }
      }
    }

    scheduleDebouncedSync(delay = 1500) {
      if (this.syncDebounceTimer) clearTimeout(this.syncDebounceTimer);
      this.syncDebounceTimer = setTimeout(() => {
        this.syncUserAndFetchTelemetry();
      }, delay);
    }

    async syncUserAndFetchTelemetry() {
      if (this.isSyncing) return;
      this.isSyncing = true;
      const payload = this.getOperativePayload();

      try {
        const res = await fetch(`${this.serverUrl}/api/users/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(6000)
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        this.isOnline = true;
        this.lastSyncTime = new Date();
        this.updateOfflineIndicator(false);

        // Update rank cache
        if (data.ranks) {
          this.cachedRanks = data.ranks;
          try {
            localStorage.setItem(CACHE_RANKS_KEY, JSON.stringify(data.ranks));
          } catch (_) {}
          this.applyRanksToLeaderboard(data.ranks);
        }

        // Fetch telemetry summary & gold users
        await Promise.allSettled([
          this.fetchTelemetrySummary(),
          this.fetchGoldUsers(),
          this.fetchGroups()
        ]);

        // Process any queued offline mutations
        this.flushOfflineQueue();

      } catch (err) {
        // Offline or connection failed
        this.isOnline = false;
        this.updateOfflineIndicator(true);
        this.loadLocalCacheFallback();
      } finally {
        this.isSyncing = false;
        this.renderSettingsCard();
      }
    }

    applyRanksToLeaderboard(ranks) {
      if (!ranks) return;

      const userRankDisplay = document.getElementById('lb-user-rank-display');
      const userPercentile = document.getElementById('lb-user-percentile');

      const activeCategory = (window.ArcLeaderboardGroups && window.ArcLeaderboardGroups.activeCategory) || 'regional';
      let rankNum = ranks.regionalRank || 1;
      let label = 'Regional';

      if (activeCategory === 'country') {
        rankNum = ranks.countryRank || 1;
        label = 'National';
      } else if (activeCategory === 'global') {
        rankNum = ranks.globalRank || 1;
        label = 'Global';
      }

      if (userRankDisplay) {
        userRankDisplay.textContent = `#${rankNum} ${label}`;
      }
      if (userPercentile && ranks.percentile) {
        userPercentile.textContent = ranks.percentile;
      }
    }

    async fetchTelemetrySummary() {
      try {
        const res = await fetch(`${this.serverUrl}/api/telemetry/summary`, {
          signal: AbortSignal.timeout(5000)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        this.cachedTelemetry = data;
        try {
          localStorage.setItem(CACHE_TELEMETRY_KEY, JSON.stringify(data));
        } catch (_) {}
        this.renderSettingsCard();
        return data;
      } catch (err) {
        return null;
      }
    }

    async fetchGoldUsers() {
      try {
        const res = await fetch(`${this.serverUrl}/api/gold/users`, {
          signal: AbortSignal.timeout(5000)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        this.cachedGoldUsers = data.goldUsers || [];
        try {
          localStorage.setItem(CACHE_GOLD_KEY, JSON.stringify(this.cachedGoldUsers));
        } catch (_) {}
        this.renderSettingsCard();
        return data.goldUsers;
      } catch (err) {
        return [];
      }
    }

    async fetchLeaderboard(scope = 'regional') {
      const payload = this.getOperativePayload();
      try {
        const url = `${this.serverUrl}/api/leaderboard?scope=${encodeURIComponent(scope)}&region=${encodeURIComponent(payload.region)}&country=${encodeURIComponent(payload.country)}&userId=${encodeURIComponent(payload.userId)}&limit=50`;
        const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Update ArcLeaderboardGroups with live server rankings
        if (window.ArcLeaderboardGroups) {
          if (!window.ArcLeaderboardGroups.leaderboardData) {
            window.ArcLeaderboardGroups.leaderboardData = {};
          }
          window.ArcLeaderboardGroups.leaderboardData[scope] = {
            scopeTitle: data.scopeTitle,
            scopeCount: `${data.totalOperativesInScope.toLocaleString()} Operatives`,
            scopeIcon: scope === 'regional' ? 'fa-solid fa-location-dot' : (scope === 'country' ? 'fa-solid fa-flag' : 'fa-solid fa-globe'),
            userRank: data.callerStanding ? data.callerStanding.rank : 1,
            userPercentile: data.callerStanding ? data.callerStanding.percentile : 'Top 5%',
            operatives: data.rankings.filter(r => r.userId !== payload.userId)
          };
          window.ArcLeaderboardGroups.renderLeaderboard();
        }

        // Update Scope header directly
        const scopeCountEl = document.getElementById('lb-scope-count');
        if (scopeCountEl) {
          scopeCountEl.textContent = `${data.totalOperativesInScope.toLocaleString()} Operatives`;
        }
        if (data.callerStanding) {
          const userRankDisplay = document.getElementById('lb-user-rank-display');
          const userPercentile = document.getElementById('lb-user-percentile');
          const catLabel = scope === 'regional' ? 'Regional' : (scope === 'country' ? 'National' : 'Global');
          if (userRankDisplay) userRankDisplay.textContent = `#${data.callerStanding.rank} ${catLabel}`;
          if (userPercentile) userPercentile.textContent = data.callerStanding.percentile;
        }

        return data;
      } catch (err) {
        // Fallback to local default leaderboard
        if (window.ArcLeaderboardGroups && typeof window.ArcLeaderboardGroups.renderLeaderboard === 'function') {
          window.ArcLeaderboardGroups.renderLeaderboard();
        }
        return null;
      }
    }

    async fetchGroups() {
      const uid = this.getOperativeUid();
      try {
        const res = await fetch(`${this.serverUrl}/api/groups?userId=${encodeURIComponent(uid)}`, {
          signal: AbortSignal.timeout(6000)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (window.ArcLeaderboardGroups) {
          window.ArcLeaderboardGroups.serverGroups = data.groups || [];
          window.ArcLeaderboardGroups.renderGroups();
        }
        return data.groups;
      } catch (err) {
        return null;
      }
    }

    async createSquad(name, motto, category) {
      const payload = this.getOperativePayload();
      const body = {
        name,
        motto,
        category: category || 'All Pillars',
        userId: payload.userId,
        handle: payload.handle,
        displayName: payload.displayName
      };

      try {
        const res = await fetch(`${this.serverUrl}/api/groups/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(6000)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.joinedGroupIds) {
          this.saveJoinedGroupIds(data.joinedGroupIds);
        }
        await this.fetchGroups();
        return data;
      } catch (err) {
        this.enqueueMutation('create_group', body);
        return null;
      }
    }

    async joinSquad(groupId) {
      const uid = this.getOperativeUid();
      const body = { groupId, userId: uid };

      // Optimistic update
      const joined = this.getJoinedGroupIds();
      if (!joined.includes(groupId)) {
        joined.push(groupId);
        this.saveJoinedGroupIds(joined);
      }

      try {
        const res = await fetch(`${this.serverUrl}/api/groups/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(6000)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.joinedGroupIds) {
          this.saveJoinedGroupIds(data.joinedGroupIds);
        }
        await this.fetchGroups();
        return data;
      } catch (err) {
        this.enqueueMutation('join_group', body);
        if (window.ArcLeaderboardGroups) window.ArcLeaderboardGroups.renderGroups();
        return null;
      }
    }

    async leaveSquad(groupId) {
      const uid = this.getOperativeUid();
      const body = { groupId, userId: uid };

      // Optimistic update
      const joined = this.getJoinedGroupIds().filter(id => id !== groupId);
      this.saveJoinedGroupIds(joined);

      try {
        const res = await fetch(`${this.serverUrl}/api/groups/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(6000)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.joinedGroupIds) {
          this.saveJoinedGroupIds(data.joinedGroupIds);
        }
        await this.fetchGroups();
        return data;
      } catch (err) {
        this.enqueueMutation('leave_group', body);
        if (window.ArcLeaderboardGroups) window.ArcLeaderboardGroups.renderGroups();
        return null;
      }
    }

    async recordGoldPurchase(planTier, user) {
      const payload = this.getOperativePayload();
      const body = {
        userId: payload.userId,
        handle: payload.handle,
        displayName: payload.displayName,
        planTier: planTier || 'monthly',
        amount: planTier === 'lifetime' ? 700 : (planTier === 'annual' ? 365 : 59),
        currency: 'INR'
      };

      try {
        const res = await fetch(`${this.serverUrl}/api/gold/purchase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(6000)
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        this.syncUserAndFetchTelemetry();
        return data;
      } catch (err) {
        this.enqueueMutation('gold_purchase', body);
        return null;
      }
    }

    enqueueMutation(type, data) {
      try {
        const raw = localStorage.getItem(QUEUE_KEY);
        const queue = raw ? JSON.parse(raw) : [];
        queue.push({ type, data, timestamp: Date.now() });
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      } catch (_) {}
    }

    async flushOfflineQueue() {
      try {
        const raw = localStorage.getItem(QUEUE_KEY);
        if (!raw) return;
        const queue = JSON.parse(raw);
        if (!Array.isArray(queue) || queue.length === 0) return;

        const remaining = [];
        for (const item of queue) {
          try {
            if (item.type === 'create_group') {
              await fetch(`${this.serverUrl}/api/groups/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item.data)
              });
            } else if (item.type === 'join_group') {
              await fetch(`${this.serverUrl}/api/groups/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item.data)
              });
            } else if (item.type === 'leave_group') {
              await fetch(`${this.serverUrl}/api/groups/leave`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item.data)
              });
            } else if (item.type === 'gold_purchase') {
              await fetch(`${this.serverUrl}/api/gold/purchase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item.data)
              });
            }
          } catch (e) {
            remaining.push(item);
          }
        }
        localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
      } catch (_) {}
    }

    loadLocalCacheFallback() {
      try {
        const rawTel = localStorage.getItem(CACHE_TELEMETRY_KEY);
        if (rawTel) this.cachedTelemetry = JSON.parse(rawTel);

        const rawGold = localStorage.getItem(CACHE_GOLD_KEY);
        if (rawGold) this.cachedGoldUsers = JSON.parse(rawGold);

        const rawRanks = localStorage.getItem(CACHE_RANKS_KEY);
        if (rawRanks) this.cachedRanks = JSON.parse(rawRanks);
      } catch (_) {}
    }

    renderSettingsCard() {
      const container = document.getElementById('p20-server-sync');
      if (!container) return;

      const tel = this.cachedTelemetry || {
        totalUsers: 16,
        activeTodayCount: 16,
        totalGoldUsers: 11,
        totalGroups: 4
      };

      const goldUsers = this.cachedGoldUsers || [];

      const statusBadge = this.isOnline
        ? `<span class="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] font-black flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE • Connected to External Server</span>`
        : `<span class="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-black flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-400"></span> OFFLINE CACHE • Server Reconnecting</span>`;

      container.innerHTML = `
        <div class="glass-card rounded-2xl p-4 sm:p-5 border-l-4 border-l-amber-400 bg-slate-900/90 space-y-4 shadow-xl relative overflow-hidden">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <i class="fa-solid fa-server"></i> EXTERNAL CLOUD TELEMETRY
                </span>
                ${statusBadge}
              </div>
              <h3 class="text-sm sm:text-base font-black text-white flex items-center gap-2">
                Live Server Telemetry &amp; Community Registry
              </h3>
              <p class="text-[11px] text-slate-400">
                Synchronized tracking for global operatives, Gold VIP purchases, competitive ranks, and squads.
              </p>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <button type="button" onclick="ArcServerSync.syncUserAndFetchTelemetry(); playSfx('click');" class="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow-sm">
                <i class="fa-solid fa-arrows-rotate ${this.isSyncing ? 'animate-spin' : ''}"></i>
                <span>${this.isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>
          </div>

          <!-- Server URL Configuration Bar -->
          <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <label class="block text-[10px] font-mono uppercase text-slate-400 font-bold">
              Configurable External Backend Endpoint
            </label>
            <div class="flex items-center gap-2">
              <div class="relative flex-1">
                <input id="arc-server-url-input" type="text" value="${this.serverUrl}" placeholder="http://localhost:4000" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400" />
              </div>
              <button type="button" onclick="const el = document.getElementById('arc-server-url-input'); if(el) ArcServerSync.setServerUrl(el.value); playSfx('click');" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold transition active:scale-95">
                Save &amp; Test
              </button>
            </div>
          </div>

          <!-- 4 Live Server Metrics Counters -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
              <div class="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                <i class="fa-solid fa-users text-cyan-400"></i> Registered
              </div>
              <div class="text-lg sm:text-xl font-black text-white font-mono">
                ${Number(tel.totalUsers || 0).toLocaleString()}
              </div>
              <div class="text-[9px] text-slate-400">Total Operatives</div>
            </div>

            <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
              <div class="text-[10px] font-mono text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-1">
                <i class="fa-solid fa-bolt"></i> Active Today
              </div>
              <div class="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                ${Number(tel.activeTodayCount || 0).toLocaleString()}
              </div>
              <div class="text-[9px] text-slate-400">In Last 24 Hours</div>
            </div>

            <div class="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-center space-y-1">
              <div class="text-[10px] font-mono text-amber-300 uppercase tracking-wider flex items-center justify-center gap-1">
                <i class="fa-solid fa-crown"></i> Arc Gold VIPs
              </div>
              <div class="text-lg sm:text-xl font-black text-amber-400 font-mono">
                ${Number(tel.totalGoldUsers || 0).toLocaleString()}
              </div>
              <div class="text-[9px] text-amber-300/80">Active Supporters</div>
            </div>

            <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
              <div class="text-[10px] font-mono text-purple-400 uppercase tracking-wider flex items-center justify-center gap-1">
                <i class="fa-solid fa-shield-halved"></i> Squads
              </div>
              <div class="text-lg sm:text-xl font-black text-purple-300 font-mono">
                ${Number(tel.totalGroups || 0).toLocaleString()}
              </div>
              <div class="text-[9px] text-slate-400">Accountability Units</div>
            </div>
          </div>

          <!-- Collapsible Arc Gold VIP Supporters Roster -->
          <div class="rounded-xl border border-amber-500/30 bg-slate-950/80 overflow-hidden">
            <button type="button" onclick="const r = document.getElementById('arc-gold-roster-body'); const chevron = document.getElementById('arc-gold-roster-chevron'); if(r){ r.classList.toggle('hidden'); if(chevron){ chevron.classList.toggle('rotate-180'); } } playSfx('tab');" class="w-full p-3 flex items-center justify-between text-left hover:bg-amber-500/5 transition">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/40 grid place-items-center text-xs">
                  <i class="fa-solid fa-crown"></i>
                </span>
                <div>
                  <h4 class="text-xs font-black text-white flex items-center gap-2">
                    Arc Gold VIP Supporters Roster
                    <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold">
                      ${goldUsers.length} VIPs
                    </span>
                  </h4>
                  <p class="text-[10px] text-slate-400">Operatives fueling independent development with Arc Gold licenses</p>
                </div>
              </div>
              <i id="arc-gold-roster-chevron" class="fa-solid fa-chevron-down text-slate-400 text-xs transition-transform duration-200"></i>
            </button>

            <div id="arc-gold-roster-body" class="p-3 border-t border-slate-800 space-y-2 max-h-56 overflow-y-auto custom-scroll">
              ${goldUsers.length === 0 ? '<div class="text-xs text-slate-400 text-center py-2 italic">Loading VIP supporters...</div>' : goldUsers.map(u => {
                const planBadge = u.goldPlan === 'lifetime'
                  ? '<span class="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-400/40">LIFETIME VIP</span>'
                  : (u.goldPlan === 'annual'
                    ? '<span class="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">ANNUAL</span>'
                    : '<span class="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 border border-slate-600">MONTHLY</span>');

                const dateStr = u.goldPurchasedAt ? new Date(u.goldPurchasedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';

                return `
                  <div class="flex items-center justify-between p-2 rounded-lg bg-slate-900/70 border border-slate-800/80 text-xs">
                    <div class="flex items-center gap-2 min-w-0">
                      <div class="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-bold grid place-items-center text-[10px] shrink-0">
                        ${u.avatar || u.handle.charAt(1).toUpperCase()}
                      </div>
                      <div class="min-w-0">
                        <div class="flex items-center gap-1.5">
                          <span class="font-bold text-slate-200 truncate">${u.handle}</span>
                          <span class="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[8px] font-mono font-black shrink-0"><i class="fa-solid fa-crown mr-0.5"></i>GOLD</span>
                        </div>
                        <div class="text-[10px] text-slate-400 font-mono">
                          Level ${u.level} • ${typeof u.arcScore === 'number' ? u.arcScore.toFixed(1) : u.arcScore}% Score
                        </div>
                      </div>
                    </div>
                    <div class="text-right shrink-0 space-y-0.5">
                      <div>${planBadge}</div>
                      <div class="text-[9px] font-mono text-slate-400">${dateStr}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }
  }

  const arcServerSync = new ArcServerSyncEngine();
  if (typeof window !== 'undefined') {
    window.ArcServerSync = arcServerSync;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        arcServerSync.init();
      }, { once: true });
    } else {
      arcServerSync.init();
    }
  }
})();
