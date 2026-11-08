// ============================================================================
// ARC EXTERNAL SERVER SYNC ENGINE (window.ArcServerSync)
// Live client sync engine backed directly by Supabase Cloud
// Handles Operative Sync, Arc Gold VIP Purchases, Global/National/Regional Leaderboards & Squads
// ============================================================================

import { supabase } from '../supabaseClient.js';
import { getOrCreateUserId, getCurrentStats } from '../storage.js';

const SERVER_URL_KEY = 'arc_external_server_url';
const UID_KEY = 'arc_operative_uid';
const QUEUE_KEY = 'arc_server_sync_queue';
const CACHE_TELEMETRY_KEY = 'arc_cached_telemetry_summary';
const CACHE_GOLD_KEY = 'arc_cached_gold_users';
const CACHE_RANKS_KEY = 'arc_cached_ranks';
const JOINED_GROUPS_KEY = 'arc_user_joined_group_ids';

const safeStorage = {
  getItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) return window.localStorage.getItem(key);
      if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
    } catch (_) {}
    return null;
  },
  setItem: (key, val) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem(key, val);
      else if (typeof localStorage !== 'undefined') localStorage.setItem(key, val);
    } catch (_) {}
  },
  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) window.localStorage.removeItem(key);
      else if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
    } catch (_) {}
  }
};

function computeScore(user) {
  const arcScore = Number(user.arcScore) || 0;
  const xp = Number(user.xp) || 0;
  return (arcScore * 1000) + xp;
}

function getTierForLevel(level) {
  if (level >= 35) return 'Grandmaster';
  if (level >= 25) return 'Master';
  if (level >= 15) return 'Diamond';
  if (level >= 10) return 'Platinum';
  if (level >= 5) return 'Gold';
  return 'Initiate';
}

function getColorForUser(user, index) {
  const gradients = [
    'from-amber-400 to-yellow-500',
    'from-cyan-400 to-blue-500',
    'from-purple-400 to-pink-500',
    'from-emerald-400 to-teal-500',
    'from-blue-400 to-indigo-500',
    'from-indigo-400 to-purple-500',
    'from-teal-400 to-cyan-500',
    'from-rose-400 to-pink-500'
  ];
  return gradients[index % gradients.length];
}

class ArcServerSyncEngine {
  constructor() {
    this.serverUrl = this.getStoredServerUrl();
    this.isOnline = true;
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
      return safeStorage.getItem(SERVER_URL_KEY) || 'https://zkxcwogqodwixfgmxdiy.supabase.co';
    } catch (_) {
      return 'https://zkxcwogqodwixfgmxdiy.supabase.co';
    }
  }

  setServerUrl(url) {
    if (!url) return;
    const cleanUrl = url.trim().replace(/\/+$/, '');
    this.serverUrl = cleanUrl;
    try {
      safeStorage.setItem(SERVER_URL_KEY, cleanUrl);
    } catch (_) {}
    this.syncUserAndFetchTelemetry();
    if (typeof window.showToast === 'function') {
      window.showToast(`Server URL updated: ${cleanUrl}`);
    }
  }

  getOperativeUid() {
    try {
      if (typeof getOrCreateUserId === 'function') {
        const id = getOrCreateUserId();
        if (id) {
          safeStorage.setItem(UID_KEY, id);
          return id;
        }
      }
      if (typeof window !== 'undefined' && window.ArcStorage && typeof window.ArcStorage.getOrCreateUserId === 'function') {
        const id = window.ArcStorage.getOrCreateUserId();
        if (id) {
          safeStorage.setItem(UID_KEY, id);
          return id;
        }
      }
      if (typeof window !== 'undefined' && window.ArcGoogleSync && typeof window.ArcGoogleSync.getUser === 'function') {
        const gUser = window.ArcGoogleSync.getUser();
        if (gUser && (gUser.sub || gUser.id || gUser.email)) {
          const gid = 'g_' + (gUser.sub || gUser.id || gUser.email).replace(/[^a-zA-Z0-9_-]/g, '_');
          safeStorage.setItem(UID_KEY, gid);
          return gid;
        }
      }
      let uid = safeStorage.getItem(UID_KEY);
      if (!uid) {
        let randStr = '';
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
          randStr = crypto.randomUUID().replace(/-/g, '').slice(0, 10);
        } else if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
          const bytes = new Uint8Array(8);
          crypto.getRandomValues(bytes);
          randStr = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
        } else {
          randStr = Date.now().toString(36);
        }
        uid = 'op_' + randStr + Date.now().toString(36);
        safeStorage.setItem(UID_KEY, uid);
      }
      return uid;
    } catch (_) {
      return 'op_fallback_' + Date.now();
    }
  }

  getJoinedGroupIds() {
    try {
      const stored = safeStorage.getItem(JOINED_GROUPS_KEY);
      if (stored) {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr)) return arr;
      }
      const single = safeStorage.getItem('arc_joined_squad_id');
      if (single) {
        return [single];
      }
    } catch (_) {}
    return [];
  }

  saveJoinedGroupIds(groupIds) {
    try {
      const arr = Array.isArray(groupIds) ? groupIds : [];
      safeStorage.setItem(JOINED_GROUPS_KEY, JSON.stringify(arr));
      if (arr.length > 0) {
        safeStorage.setItem('arc_joined_squad_id', arr[0]);
      } else {
        safeStorage.removeItem('arc_joined_squad_id');
      }
    } catch (_) {}
  }

  getOperativePayload() {
    const uid = this.getOperativeUid();
    let handle = '@operative';
    let displayName = 'Primary Operative';
    let avatar = 'O';

    try {
      if (typeof window !== 'undefined' && window.ArcProfile && typeof window.ArcProfile.getProfile === 'function') {
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
      if (typeof window !== 'undefined' && window.ArcLeaderboardGroups && typeof window.ArcLeaderboardGroups.getUserLevel === 'function') {
        level = window.ArcLeaderboardGroups.getUserLevel();
      } else if (typeof window !== 'undefined' && window.state && window.state.level) {
        level = window.state.level;
      }

      if (typeof window !== 'undefined' && window.state) {
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
      if (typeof window !== 'undefined' && window.ArcGold) {
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

    const region = safeStorage.getItem('arc_user_region') || 'Western Metro Zone';
    const country = safeStorage.getItem('arc_user_country') || 'India';
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
    this.syncUserAndFetchTelemetry();

    if (this.periodicTimer) clearInterval(this.periodicTimer);
    this.periodicTimer = setInterval(() => {
      this.syncUserAndFetchTelemetry();
    }, 60000);

    if (typeof window !== 'undefined') {
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
    }

    this.renderSettingsCard();
  }

  updateOfflineIndicator(isOffline) {
    if (typeof document === 'undefined') return;
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

    const fullStats = (typeof getCurrentStats === 'function')
      ? getCurrentStats()
      : ((typeof window !== 'undefined' && window.ArcStorage?.getCurrentStats) ? window.ArcStorage.getCurrentStats() : null);

    const fullPayload = {
      ...payload,
      stats: fullStats
    };

    try {
      // 1. Upsert operative profile & telemetry stats into Supabase user_data
      const { error: upsertErr } = await supabase
        .from('user_data')
        .upsert({
          email: payload.userId,
          data: fullPayload,
          last_active: new Date().toISOString()
        }, { onConflict: 'email' });

      if (upsertErr) throw upsertErr;

      this.isOnline = true;
      this.lastSyncTime = new Date();
      this.updateOfflineIndicator(false);

      // 2. Query all users from Supabase user_data to compute live ranks
      const { data: rows, error: qErr } = await supabase
        .from('user_data')
        .select('email, data, last_active');

      if (!qErr && Array.isArray(rows)) {
        const allUsers = rows.map(r => ({
          userId: r.data?.userId || r.email,
          arcScore: Number(r.data?.arcScore) || 0,
          xp: Number(r.data?.xp) || 0,
          region: r.data?.region || 'Western Metro Zone',
          country: r.data?.country || 'India'
        }));

        const existingIdx = allUsers.findIndex(u => u.userId === payload.userId);
        if (existingIdx >= 0) {
          allUsers[existingIdx] = {
            userId: payload.userId,
            arcScore: payload.arcScore,
            xp: payload.xp,
            region: payload.region,
            country: payload.country
          };
        } else {
          allUsers.push({
            userId: payload.userId,
            arcScore: payload.arcScore,
            xp: payload.xp,
            region: payload.region,
            country: payload.country
          });
        }

        const sortedGlobal = [...allUsers].sort((a, b) => computeScore(b) - computeScore(a));
        const globalRank = Math.max(1, sortedGlobal.findIndex(u => u.userId === payload.userId) + 1);

        const sortedRegional = allUsers
          .filter(u => u.region === payload.region)
          .sort((a, b) => computeScore(b) - computeScore(a));
        const regionalRank = Math.max(1, sortedRegional.findIndex(u => u.userId === payload.userId) + 1);

        const sortedCountry = allUsers
          .filter(u => u.country === payload.country)
          .sort((a, b) => computeScore(b) - computeScore(a));
        const countryRank = Math.max(1, sortedCountry.findIndex(u => u.userId === payload.userId) + 1);

        const totalUsers = allUsers.length;
        const percentileVal = Math.max(1, Math.round((globalRank / totalUsers) * 100));
        const percentile = `Top ${percentileVal}%`;

        const ranks = {
          regionalRank,
          countryRank,
          globalRank,
          percentile,
          regionalTotal: sortedRegional.length,
          countryTotal: sortedCountry.length,
          globalTotal: totalUsers
        };

        this.cachedRanks = ranks;
        try {
          safeStorage.setItem(CACHE_RANKS_KEY, JSON.stringify(ranks));
        } catch (_) {}
        this.applyRanksToLeaderboard(ranks);
      }

      // 3. Fetch telemetry summary, VIPs, and squads concurrently from Supabase
      await Promise.allSettled([
        this.fetchTelemetrySummary(),
        this.fetchGoldUsers(),
        this.fetchGroups()
      ]);

      // 4. Process queued offline mutations if any
      this.flushOfflineQueue();

    } catch (err) {
      console.warn('[ArcServerSync] Supabase sync fallback notice:', err.message || err);
      this.isOnline = false;
      this.updateOfflineIndicator(true);
      this.loadLocalCacheFallback();
    } finally {
      this.isSyncing = false;
      this.renderSettingsCard();
    }
  }

  applyRanksToLeaderboard(ranks) {
    if (!ranks || typeof document === 'undefined') return;

    const userRankDisplay = document.getElementById('lb-user-rank-display');
    const userPercentile = document.getElementById('lb-user-percentile');

    const activeCategory = (typeof window !== 'undefined' && window.ArcLeaderboardGroups && window.ArcLeaderboardGroups.activeCategory) || 'regional';
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
      const [usersRes, squadsRes] = await Promise.all([
        supabase.from('user_data').select('email, data, last_active'),
        supabase.from('squads').select('id', { count: 'exact' })
      ]);

      if (usersRes.error) throw usersRes.error;

      const users = usersRes.data || [];
      const totalUsers = users.length;
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

      const activeTodayCount = users.filter(u => {
        if (!u.last_active) return false;
        const t = new Date(u.last_active).getTime();
        return !isNaN(t) && t >= oneDayAgo;
      }).length;

      const goldUsers = users
        .filter(u => u.data && u.data.isGold)
        .map(u => ({
          userId: u.data.userId || u.email,
          handle: u.data.handle || '@operative',
          displayName: u.data.displayName || u.data.handle || 'VIP Operative',
          avatar: u.data.avatar || (u.data.displayName ? u.data.displayName.charAt(0).toUpperCase() : 'O'),
          goldPlan: u.data.goldPlan || 'monthly',
          goldPurchasedAt: u.data.goldPurchasedAt || u.last_active,
          level: u.data.level || 1,
          arcScore: u.data.arcScore || 0,
          streak: u.data.streak || 0
        }))
        .sort((a, b) => new Date(b.goldPurchasedAt || 0) - new Date(a.goldPurchasedAt || 0));

      const totalGoldUsers = goldUsers.length;
      const totalGroups = squadsRes.count !== null ? squadsRes.count : (squadsRes.data ? squadsRes.data.length : 0);

      const summary = {
        totalUsers,
        activeTodayCount,
        totalGoldUsers,
        goldUsersList: goldUsers,
        totalGroups,
        serverTime: new Date().toISOString()
      };

      this.cachedTelemetry = summary;
      this.cachedGoldUsers = goldUsers;
      try {
        safeStorage.setItem(CACHE_TELEMETRY_KEY, JSON.stringify(summary));
        safeStorage.setItem(CACHE_GOLD_KEY, JSON.stringify(goldUsers));
      } catch (_) {}

      this.renderSettingsCard();
      return summary;
    } catch (err) {
      console.warn('[ArcServerSync] Telemetry fetch notice:', err);
      return null;
    }
  }

  async fetchGoldUsers() {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('email, data, last_active');

      if (error) throw error;

      const goldUsers = (data || [])
        .filter(u => u.data && u.data.isGold)
        .map(u => ({
          userId: u.data.userId || u.email,
          handle: u.data.handle || '@operative',
          displayName: u.data.displayName || u.data.handle || 'VIP Operative',
          avatar: u.data.avatar || (u.data.displayName ? u.data.displayName.charAt(0).toUpperCase() : 'O'),
          goldPlan: u.data.goldPlan || 'monthly',
          goldPurchasedAt: u.data.goldPurchasedAt || u.last_active,
          level: u.data.level || 1,
          arcScore: u.data.arcScore || 0,
          streak: u.data.streak || 0
        }))
        .sort((a, b) => new Date(b.goldPurchasedAt || 0) - new Date(a.goldPurchasedAt || 0));

      this.cachedGoldUsers = goldUsers;
      try {
        safeStorage.setItem(CACHE_GOLD_KEY, JSON.stringify(goldUsers));
      } catch (_) {}
      this.renderSettingsCard();
      return goldUsers;
    } catch (err) {
      return [];
    }
  }

  async fetchLeaderboard(scope = 'regional') {
    const payload = this.getOperativePayload();
    try {
      const { data: rows, error } = await supabase
        .from('user_data')
        .select('email, data, last_active');

      if (error) throw error;

      let pool = (rows || []).map(r => {
        const d = r.data || {};
        return {
          userId: d.userId || r.email,
          handle: d.handle || (r.email ? `@${r.email.split('@')[0]}` : '@operative'),
          displayName: d.displayName || d.handle || 'Operative',
          avatar: d.avatar || (d.displayName ? d.displayName.charAt(0).toUpperCase() : 'O'),
          region: d.region || 'Western Metro Zone',
          country: d.country || 'India',
          level: Number(d.level) || 1,
          xp: Number(d.xp) || 0,
          arcScore: Number(d.arcScore) || 0,
          streak: Number(d.streak) || 0,
          isGold: !!d.isGold,
          goldPlan: d.goldPlan || null
        };
      });

      // Ensure current user is in pool
      const myIdx = pool.findIndex(u => u.userId === payload.userId);
      if (myIdx >= 0) {
        pool[myIdx] = { ...pool[myIdx], ...payload };
      } else {
        pool.push(payload);
      }

      let scopeTitle = 'Worldwide Syndicate';
      if (scope === 'regional') {
        const filtered = pool.filter(u => u.region === payload.region);
        if (filtered.length > 0) pool = filtered;
        scopeTitle = `Regional Sector: ${payload.region}`;
      } else if (scope === 'country') {
        const filtered = pool.filter(u => u.country === payload.country);
        if (filtered.length > 0) pool = filtered;
        scopeTitle = `National League: ${payload.country}`;
      } else {
        scopeTitle = 'Worldwide Syndicate: Global Sector';
      }

      pool.sort((a, b) => computeScore(b) - computeScore(a));

      const totalOperativesInScope = pool.length;

      let callerStanding = null;
      const callerIdx = pool.findIndex(u => u.userId === payload.userId);
      if (callerIdx >= 0) {
        const rank = callerIdx + 1;
        const pct = Math.max(1, Math.round((rank / totalOperativesInScope) * 100));
        callerStanding = {
          rank,
          percentile: `Top ${pct}%`,
          totalInScope: totalOperativesInScope
        };
      }

      const rankings = pool.slice(0, 50).map((u, i) => {
        const rank = i + 1;
        const scoreVal = typeof u.arcScore === 'number' ? u.arcScore.toFixed(1) + '%' : `${u.arcScore || 0}%`;
        const streakVal = `${u.streak || 0}d`;
        return {
          rank,
          userId: u.userId,
          handle: u.handle,
          displayName: u.displayName || u.handle,
          avatar: u.avatar || (u.displayName ? u.displayName.charAt(0).toUpperCase() : 'O'),
          level: u.level || 1,
          xp: u.xp || 0,
          score: scoreVal,
          streak: streakVal,
          isGold: !!u.isGold,
          goldPlan: u.goldPlan || null,
          tier: getTierForLevel(u.level || 1),
          color: getColorForUser(u, i)
        };
      });

      const resultData = {
        scope,
        scopeTitle,
        totalOperativesInScope,
        rankings,
        callerStanding
      };

      if (typeof window !== 'undefined' && window.ArcLeaderboardGroups) {
        if (!window.ArcLeaderboardGroups.leaderboardData) {
          window.ArcLeaderboardGroups.leaderboardData = {};
        }
        window.ArcLeaderboardGroups.leaderboardData[scope] = {
          scopeTitle: resultData.scopeTitle,
          scopeCount: `${resultData.totalOperativesInScope.toLocaleString()} Operatives`,
          scopeIcon: scope === 'regional' ? 'fa-solid fa-location-dot' : (scope === 'country' ? 'fa-solid fa-flag' : 'fa-solid fa-globe'),
          userRank: resultData.callerStanding ? resultData.callerStanding.rank : 1,
          userPercentile: resultData.callerStanding ? resultData.callerStanding.percentile : 'Top 5%',
          operatives: resultData.rankings.filter(r => r.userId !== payload.userId)
        };
        if (typeof window.ArcLeaderboardGroups.renderLeaderboard === 'function') {
          window.ArcLeaderboardGroups.renderLeaderboard();
        }
      }

      if (typeof document !== 'undefined') {
        const scopeCountEl = document.getElementById('lb-scope-count');
        if (scopeCountEl) {
          scopeCountEl.textContent = `${resultData.totalOperativesInScope.toLocaleString()} Operatives`;
        }
        if (resultData.callerStanding) {
          const userRankDisplay = document.getElementById('lb-user-rank-display');
          const userPercentile = document.getElementById('lb-user-percentile');
          const catLabel = scope === 'regional' ? 'Regional' : (scope === 'country' ? 'National' : 'Global');
          if (userRankDisplay) userRankDisplay.textContent = `#${resultData.callerStanding.rank} ${catLabel}`;
          if (userPercentile) userPercentile.textContent = resultData.callerStanding.percentile;
        }
      }

      return resultData;
    } catch (err) {
      console.warn('[ArcServerSync] Leaderboard fetch fallback notice:', err);
      if (typeof window !== 'undefined' && window.ArcLeaderboardGroups && typeof window.ArcLeaderboardGroups.renderLeaderboard === 'function') {
        window.ArcLeaderboardGroups.renderLeaderboard();
      }
      return null;
    }
  }

  async fetchGroups() {
    const uid = this.getOperativeUid();
    try {
      const { data: rows, error } = await supabase
        .from('squads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const joinedGroupIds = this.getJoinedGroupIds();
      const squads = (rows || []).map(g => {
        const members = Array.isArray(g.members) ? g.members : [];
        const isJoined = joinedGroupIds.includes(g.id) || members.includes(uid);
        return {
          groupId: g.id,
          id: g.id,
          name: g.name,
          motto: g.tag || 'Discipline over motivation.',
          tag: g.tag,
          category: g.region || 'General',
          region: g.region || 'GLOBAL',
          icon: 'fa-solid fa-shield-halved',
          color: 'from-cyan-500 to-blue-500',
          memberCount: Math.max(1, members.length),
          avgScore: '96.0%',
          streak: 30,
          createdAt: g.created_at,
          isJoined,
          members
        };
      });

      if (typeof window !== 'undefined' && window.ArcLeaderboardGroups) {
        window.ArcLeaderboardGroups.serverGroups = squads;
        if (typeof window.ArcLeaderboardGroups.renderGroups === 'function') {
          window.ArcLeaderboardGroups.renderGroups();
        }
      }
      return squads;
    } catch (err) {
      console.warn('[ArcServerSync] Squads fetch notice:', err);
      return null;
    }
  }

  async createSquad(name, motto, category) {
    const payload = this.getOperativePayload();
    const squadId = 'squad-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
    const newSquad = {
      id: squadId,
      name: name.trim(),
      tag: (motto || 'Execute before dawn.').trim(),
      region: category || 'General',
      members: [payload.userId],
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('squads')
        .insert([newSquad])
        .select();

      if (error) throw error;

      const joined = this.getJoinedGroupIds();
      if (!joined.includes(squadId)) {
        joined.push(squadId);
        this.saveJoinedGroupIds(joined);
      }

      await this.fetchGroups();
      return { success: true, group: newSquad, joinedGroupIds: joined };
    } catch (err) {
      console.warn('[ArcServerSync] Error creating squad, queuing offline mutation:', err);
      this.enqueueMutation('create_group', newSquad);
      return null;
    }
  }

  async joinSquad(groupId) {
    const uid = this.getOperativeUid();
    const joined = this.getJoinedGroupIds();
    if (!joined.includes(groupId)) {
      joined.push(groupId);
      this.saveJoinedGroupIds(joined);
    }

    try {
      const { data: current, error: fErr } = await supabase
        .from('squads')
        .select('members')
        .eq('id', groupId)
        .single();

      let members = (current && Array.isArray(current.members)) ? [...current.members] : [];
      if (!members.includes(uid)) {
        members.push(uid);
        await supabase
          .from('squads')
          .update({ members })
          .eq('id', groupId);
      }

      await this.fetchGroups();
      return { success: true, joinedGroupIds: joined };
    } catch (err) {
      console.warn('[ArcServerSync] Error joining squad, queuing mutation:', err);
      this.enqueueMutation('join_group', { groupId, userId: uid });
      if (typeof window !== 'undefined' && window.ArcLeaderboardGroups && typeof window.ArcLeaderboardGroups.renderGroups === 'function') {
        window.ArcLeaderboardGroups.renderGroups();
      }
      return null;
    }
  }

  async leaveSquad(groupId) {
    const uid = this.getOperativeUid();
    const joined = this.getJoinedGroupIds().filter(id => id !== groupId);
    this.saveJoinedGroupIds(joined);

    try {
      const { data: current } = await supabase
        .from('squads')
        .select('members')
        .eq('id', groupId)
        .single();

      if (current && Array.isArray(current.members)) {
        const members = current.members.filter(m => m !== uid);
        await supabase
          .from('squads')
          .update({ members })
          .eq('id', groupId);
      }

      await this.fetchGroups();
      return { success: true, joinedGroupIds: joined };
    } catch (err) {
      console.warn('[ArcServerSync] Error leaving squad, queuing mutation:', err);
      this.enqueueMutation('leave_group', { groupId, userId: uid });
      if (typeof window !== 'undefined' && window.ArcLeaderboardGroups && typeof window.ArcLeaderboardGroups.renderGroups === 'function') {
        window.ArcLeaderboardGroups.renderGroups();
      }
      return null;
    }
  }

  async recordGoldPurchase(planTier, user) {
    const payload = this.getOperativePayload();
    payload.isGold = true;
    payload.goldPlan = planTier || 'monthly';
    payload.goldPurchasedAt = new Date().toISOString();

    try {
      await this.syncUserAndFetchTelemetry();
      return { success: true, user: payload };
    } catch (err) {
      this.enqueueMutation('gold_purchase', { planTier, user });
      return null;
    }
  }

  enqueueMutation(type, data) {
    try {
      const raw = safeStorage.getItem(QUEUE_KEY);
      const queue = raw ? JSON.parse(raw) : [];
      queue.push({ type, data, timestamp: Date.now() });
      safeStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (_) {}
  }

  async flushOfflineQueue() {
    try {
      const raw = safeStorage.getItem(QUEUE_KEY);
      if (!raw) return;
      const queue = JSON.parse(raw);
      if (!Array.isArray(queue) || queue.length === 0) return;

      const remaining = [];
      for (const item of queue) {
        try {
          if (item.type === 'create_group') {
            await supabase.from('squads').insert([item.data]);
          } else if (item.type === 'join_group') {
            const { data: cur } = await supabase.from('squads').select('members').eq('id', item.data.groupId).single();
            if (cur && Array.isArray(cur.members) && !cur.members.includes(item.data.userId)) {
              await supabase.from('squads').update({ members: [...cur.members, item.data.userId] }).eq('id', item.data.groupId);
            }
          } else if (item.type === 'leave_group') {
            const { data: cur } = await supabase.from('squads').select('members').eq('id', item.data.groupId).single();
            if (cur && Array.isArray(cur.members)) {
              await supabase.from('squads').update({ members: cur.members.filter(m => m !== item.data.userId) }).eq('id', item.data.groupId);
            }
          } else if (item.type === 'gold_purchase') {
            await this.syncUserAndFetchTelemetry();
          }
        } catch (e) {
          remaining.push(item);
        }
      }
      safeStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
    } catch (_) {}
  }

  loadLocalCacheFallback() {
    try {
      const rawTel = safeStorage.getItem(CACHE_TELEMETRY_KEY);
      if (rawTel) this.cachedTelemetry = JSON.parse(rawTel);

      const rawGold = safeStorage.getItem(CACHE_GOLD_KEY);
      if (rawGold) this.cachedGoldUsers = JSON.parse(rawGold);

      const rawRanks = safeStorage.getItem(CACHE_RANKS_KEY);
      if (rawRanks) this.cachedRanks = JSON.parse(rawRanks);
    } catch (_) {}
  }

  renderSettingsCard() {
    if (typeof document === 'undefined') return;
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
      ? `<span class="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] font-black flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE • Connected to Supabase Cloud</span>`
      : `<span class="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-black flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-amber-400"></span> OFFLINE • Cloud Reconnecting</span>`;

    const isExp = (window.ArcSettingsAccordion && typeof window.ArcSettingsAccordion.isExpanded === 'function')
      ? window.ArcSettingsAccordion.isExpanded('p20-server-sync')
      : false;

    container.setAttribute('onkeydown', 'window.ArcSettingsAccordion && window.ArcSettingsAccordion.handleKeyDown(event, "p20-server-sync")');

    container.innerHTML = `
      <div class="glass-card rounded-2xl p-4 sm:p-5 border-l-4 border-l-amber-400 bg-slate-900/90 shadow-xl relative overflow-hidden settings-card-item">
        <div class="flex items-center justify-between gap-3 select-none">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <i class="fa-solid fa-server text-base"></i>
            </div>
            <div class="min-w-0 flex items-center gap-2 flex-wrap">
              <h3 class="text-sm sm:text-base font-black text-white truncate">Supabase Cloud Telemetry</h3>
              ${statusBadge}
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button type="button" class="settings-arrow-btn p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition" aria-label="Expand settings card" aria-expanded="${isExp}" onclick="window.ArcSettingsAccordion && window.ArcSettingsAccordion.toggle('p20-server-sync')">
              <i class="fa-solid fa-chevron-down text-xs transition-transform duration-300 settings-chevron-icon ${isExp ? 'rotate-180' : ''}"></i>
            </button>
          </div>
        </div>

        <div class="arc-fluid-accordion ${isExp ? 'expanded' : 'hidden'} pt-3 border-t border-slate-800/80 mt-3">
          <div class="space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div>
                <h4 class="text-xs font-bold text-slate-200">Live Supabase Telemetry &amp; Community Registry</h4>
                <p class="text-[11px] text-slate-400">Synchronized tracking for global operatives, Gold VIP purchases, competitive ranks, and squads.</p>
              </div>
              <button type="button" onclick="ArcServerSync.syncUserAndFetchTelemetry(); playSfx('click');" class="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow-sm shrink-0">
                <i class="fa-solid fa-arrows-rotate ${this.isSyncing ? 'animate-spin' : ''}"></i>
                <span>${this.isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>
${detailedBody}
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

export { arcServerSync, ArcServerSyncEngine };
export default arcServerSync;
