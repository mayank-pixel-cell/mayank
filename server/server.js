import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'arc-cloud-db.json');

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for all local and production origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// ============================================================================
// PERSISTENT ATOMIC JSON DATABASE & AUTO-SEEDING
// ============================================================================

function getDefaultSeedData() {
  const now = new Date();
  const pastDay = (daysAgo) => new Date(now.getTime() - daysAgo * 86400000).toISOString();

  const users = [
    {
      userId: 'op_seed_001',
      handle: '@vanguard_rex',
      displayName: 'Vanguard Rex',
      avatar: 'R',
      region: 'Western Metro Zone',
      country: 'India',
      level: 24,
      xp: 1820,
      arcScore: 99.4,
      streak: 44,
      isGold: true,
      goldPlan: 'annual',
      goldPurchasedAt: pastDay(30),
      joinedGroupIds: ['squad-5am', 'squad-iron'],
      createdAt: pastDay(60),
      lastSeenAt: pastDay(0.1)
    },
    {
      userId: 'op_seed_002',
      handle: '@valkyrie_focus',
      displayName: 'Valkyrie Focus',
      avatar: 'V',
      region: 'Western Metro Zone',
      country: 'India',
      level: 22,
      xp: 1450,
      arcScore: 98.1,
      streak: 39,
      isGold: true,
      goldPlan: 'lifetime',
      goldPurchasedAt: pastDay(45),
      joinedGroupIds: ['squad-deepwork'],
      createdAt: pastDay(50),
      lastSeenAt: pastDay(0.2)
    },
    {
      userId: 'op_seed_003',
      handle: '@iron_discipline',
      displayName: 'Iron Discipline',
      avatar: 'I',
      region: 'Western Metro Zone',
      country: 'India',
      level: 21,
      xp: 1200,
      arcScore: 97.5,
      streak: 36,
      isGold: false,
      goldPlan: null,
      goldPurchasedAt: null,
      joinedGroupIds: ['squad-iron', 'squad-cold'],
      createdAt: pastDay(45),
      lastSeenAt: pastDay(0.3)
    },
    {
      userId: 'op_seed_004',
      handle: '@solitary_monk',
      displayName: 'Solitary Monk',
      avatar: 'M',
      region: 'Western Metro Zone',
      country: 'India',
      level: 19,
      xp: 980,
      arcScore: 95.8,
      streak: 32,
      isGold: true,
      goldPlan: 'monthly',
      goldPurchasedAt: pastDay(12),
      joinedGroupIds: ['squad-5am'],
      createdAt: pastDay(40),
      lastSeenAt: pastDay(0.4)
    },
    {
      userId: 'op_seed_005',
      handle: '@deep_work_titan',
      displayName: 'Deep Work Titan',
      avatar: 'D',
      region: 'Western Metro Zone',
      country: 'India',
      level: 17,
      xp: 760,
      arcScore: 94.2,
      streak: 29,
      isGold: false,
      goldPlan: null,
      goldPurchasedAt: null,
      joinedGroupIds: ['squad-deepwork'],
      createdAt: pastDay(35),
      lastSeenAt: pastDay(0.5)
    },
    {
      userId: 'op_seed_006',
      handle: '@zenith_operative',
      displayName: 'Zenith Operative',
      avatar: 'Z',
      region: 'Western Metro Zone',
      country: 'India',
      level: 15,
      xp: 610,
      arcScore: 93.0,
      streak: 24,
      isGold: false,
      goldPlan: null,
      goldPurchasedAt: null,
      joinedGroupIds: ['squad-5am'],
      createdAt: pastDay(30),
      lastSeenAt: pastDay(0.6)
    },
    {
      userId: 'op_seed_007',
      handle: '@cold_shower_sam',
      displayName: 'Cold Shower Sam',
      avatar: 'S',
      region: 'Western Metro Zone',
      country: 'India',
      level: 14,
      xp: 490,
      arcScore: 91.5,
      streak: 21,
      isGold: true,
      goldPlan: 'annual',
      goldPurchasedAt: pastDay(20),
      joinedGroupIds: ['squad-cold'],
      createdAt: pastDay(28),
      lastSeenAt: pastDay(0.8)
    },
    {
      userId: 'op_seed_008',
      handle: '@arjuna_focus',
      displayName: 'Arjuna Focus',
      avatar: 'A',
      region: 'Northern Ridge Sector',
      country: 'India',
      level: 32,
      xp: 3400,
      arcScore: 99.8,
      streak: 58,
      isGold: true,
      goldPlan: 'lifetime',
      goldPurchasedAt: pastDay(55),
      joinedGroupIds: ['squad-deepwork', 'squad-iron'],
      createdAt: pastDay(90),
      lastSeenAt: pastDay(0.1)
    },
    {
      userId: 'op_seed_009',
      handle: '@kavach_iron',
      displayName: 'Kavach Iron',
      avatar: 'K',
      region: 'Northern Ridge Sector',
      country: 'India',
      level: 29,
      xp: 2900,
      arcScore: 99.1,
      streak: 51,
      isGold: true,
      goldPlan: 'annual',
      goldPurchasedAt: pastDay(40),
      joinedGroupIds: ['squad-iron'],
      createdAt: pastDay(80),
      lastSeenAt: pastDay(0.3)
    },
    {
      userId: 'op_seed_010',
      handle: '@dharma_warrior',
      displayName: 'Dharma Warrior',
      avatar: 'D',
      region: 'Northern Ridge Sector',
      country: 'India',
      level: 23,
      xp: 1680,
      arcScore: 97.9,
      streak: 41,
      isGold: false,
      goldPlan: null,
      goldPurchasedAt: null,
      joinedGroupIds: ['squad-5am'],
      createdAt: pastDay(50),
      lastSeenAt: pastDay(0.5)
    },
    {
      userId: 'op_seed_011',
      handle: '@kratos_lockin',
      displayName: 'Kratos Lockin',
      avatar: 'K',
      region: 'Pacific Coast Sector',
      country: 'United States',
      level: 42,
      xp: 5600,
      arcScore: 100.0,
      streak: 78,
      isGold: true,
      goldPlan: 'lifetime',
      goldPurchasedAt: pastDay(75),
      joinedGroupIds: ['squad-iron', 'squad-cold'],
      createdAt: pastDay(120),
      lastSeenAt: pastDay(0.05)
    },
    {
      userId: 'op_seed_012',
      handle: '@shinobi_discipline',
      displayName: 'Shinobi Discipline',
      avatar: 'S',
      region: 'Kanto Central Sector',
      country: 'Japan',
      level: 38,
      xp: 4800,
      arcScore: 99.9,
      streak: 69,
      isGold: true,
      goldPlan: 'annual',
      goldPurchasedAt: pastDay(65),
      joinedGroupIds: ['squad-5am', 'squad-deepwork'],
      createdAt: pastDay(110),
      lastSeenAt: pastDay(0.1)
    },
    {
      userId: 'op_seed_013',
      handle: '@nordic_stoic',
      displayName: 'Nordic Stoic',
      avatar: 'N',
      region: 'Bavaria Sector',
      country: 'Germany',
      level: 35,
      xp: 4100,
      arcScore: 99.5,
      streak: 62,
      isGold: true,
      goldPlan: 'lifetime',
      goldPurchasedAt: pastDay(60),
      joinedGroupIds: ['squad-cold'],
      createdAt: pastDay(100),
      lastSeenAt: pastDay(0.2)
    },
    {
      userId: 'op_seed_014',
      handle: '@spartan_iron',
      displayName: 'Spartan Iron',
      avatar: 'S',
      region: 'Atlantic Coast Sector',
      country: 'United States',
      level: 30,
      xp: 3100,
      arcScore: 98.7,
      streak: 53,
      isGold: true,
      goldPlan: 'monthly',
      goldPurchasedAt: pastDay(15),
      joinedGroupIds: ['squad-iron'],
      createdAt: pastDay(75),
      lastSeenAt: pastDay(0.3)
    },
    {
      userId: 'op_seed_015',
      handle: '@cyber_monk',
      displayName: 'Cyber Monk',
      avatar: 'C',
      region: 'London Central Sector',
      country: 'United Kingdom',
      level: 25,
      xp: 2200,
      arcScore: 97.4,
      streak: 43,
      isGold: false,
      goldPlan: null,
      goldPurchasedAt: null,
      joinedGroupIds: ['squad-deepwork'],
      createdAt: pastDay(60),
      lastSeenAt: pastDay(0.4)
    }
  ];

  const gold_purchases = users
    .filter(u => u.isGold)
    .map(u => ({
      purchaseId: 'ARC-GOLD-' + u.userId.toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      userId: u.userId,
      handle: u.handle,
      planTier: u.goldPlan || 'annual',
      amount: u.goldPlan === 'lifetime' ? 700 : (u.goldPlan === 'annual' ? 365 : 59),
      currency: 'INR',
      purchasedAt: u.goldPurchasedAt || pastDay(10),
      status: 'active'
    }));

  const groups = [
    {
      groupId: 'squad-5am',
      name: '5 AM Club Elite',
      motto: 'Rise in the dark, execute before the world wakes.',
      category: 'Mindset',
      createdByUserId: 'op_seed_001',
      createdByHandle: '@vanguard_rex',
      icon: 'fa-solid fa-sun',
      color: 'from-amber-500 to-yellow-400',
      memberIds: ['op_seed_001', 'op_seed_004', 'op_seed_006', 'op_seed_010', 'op_seed_012'],
      createdAt: pastDay(80)
    },
    {
      groupId: 'squad-iron',
      name: 'Iron Willpower Syndicate',
      motto: 'Heavy lifts, zero social media, non-negotiable discipline.',
      category: 'Physical',
      createdByUserId: 'op_seed_003',
      createdByHandle: '@iron_discipline',
      icon: 'fa-solid fa-dumbbell',
      color: 'from-cyan-500 to-blue-500',
      memberIds: ['op_seed_001', 'op_seed_003', 'op_seed_008', 'op_seed_009', 'op_seed_011', 'op_seed_014'],
      createdAt: pastDay(80)
    },
    {
      groupId: 'squad-deepwork',
      name: 'Hyper-Focus Titans',
      motto: '4 hours undistracted code and deep study every day.',
      category: 'Productivity',
      createdByUserId: 'op_seed_002',
      createdByHandle: '@valkyrie_focus',
      icon: 'fa-solid fa-brain',
      color: 'from-purple-500 to-pink-500',
      memberIds: ['op_seed_002', 'op_seed_005', 'op_seed_008', 'op_seed_012', 'op_seed_015'],
      createdAt: pastDay(75)
    },
    {
      groupId: 'squad-cold',
      name: 'Cold Shower & Dopamine Detox',
      motto: 'Embrace physical discomfort, eradicate cheap digital dopamine.',
      category: 'Discipline',
      createdByUserId: 'op_seed_007',
      createdByHandle: '@cold_shower_sam',
      icon: 'fa-solid fa-snowflake',
      color: 'from-teal-500 to-emerald-400',
      memberIds: ['op_seed_003', 'op_seed_007', 'op_seed_011', 'op_seed_013'],
      createdAt: pastDay(70)
    }
  ];

  return { users, gold_purchases, groups };
}

let dbCache = null;

function loadDatabase() {
  if (dbCache) return dbCache;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      dbCache = JSON.parse(raw);
      if (!dbCache.users || !Array.isArray(dbCache.users)) throw new Error('Corrupt DB structure');
      return dbCache;
    } catch (err) {
      console.warn('[ArcServer] Existing db corrupt or unreadable, re-seeding:', err.message);
    }
  }

  // Seed new database
  dbCache = getDefaultSeedData();
  saveDatabase(dbCache);
  console.log('[ArcServer] Successfully initialized and seeded database at', DB_FILE);
  return dbCache;
}

function saveDatabase(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = DB_FILE + '.tmp.' + Date.now();
    fs.writeFileSync(tempFile, JSON.stringify(data || dbCache, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    dbCache = data || dbCache;
  } catch (err) {
    console.error('[ArcServer] Error saving database:', err);
  }
}

// Compute composite ranking score
// Formula: (level * 1000) + (arcScore * 15) + (streak * 25) + xp
function computeScore(user) {
  const level = Number(user.level) || 1;
  const arcScore = Number(user.arcScore) || 0;
  const streak = Number(user.streak) || 0;
  const xp = Number(user.xp) || 0;
  return (level * 1000) + (arcScore * 15) + (streak * 25) + xp;
}

function getTierForLevel(level) {
  if (level >= 40) return 'Immortal';
  if (level >= 35) return 'Apex Legend';
  if (level >= 25) return 'Grandmaster';
  if (level >= 20) return 'Master';
  if (level >= 15) return 'Diamond';
  if (level >= 10) return 'Platinum';
  return 'Gold';
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

// ============================================================================
// REST API ENDPOINTS
// ============================================================================

// 0. Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// 1. GET /api/telemetry/summary
app.get('/api/telemetry/summary', (req, res) => {
  const db = loadDatabase();
  const now = Date.now();
  const oneDayAgo = now - (24 * 60 * 60 * 1000);

  const totalUsers = db.users.length;
  const activeTodayCount = db.users.filter(u => {
    if (!u.lastSeenAt) return false;
    const t = new Date(u.lastSeenAt).getTime();
    return !isNaN(t) && t >= oneDayAgo;
  }).length;

  const goldUsers = db.users.filter(u => u.isGold);
  const totalGoldUsers = goldUsers.length;

  const goldUsersList = goldUsers.map(u => ({
    userId: u.userId,
    handle: u.handle,
    displayName: u.displayName || u.handle,
    avatar: u.avatar || (u.displayName ? u.displayName.charAt(0).toUpperCase() : 'O'),
    goldPlan: u.goldPlan,
    goldPurchasedAt: u.goldPurchasedAt,
    level: u.level || 1,
    arcScore: u.arcScore || 0,
    streak: u.streak || 0
  })).sort((a, b) => new Date(b.goldPurchasedAt || 0) - new Date(a.goldPurchasedAt || 0));

  res.json({
    totalUsers,
    activeTodayCount,
    totalGoldUsers,
    goldUsersList,
    totalGroups: db.groups.length,
    serverTime: new Date().toISOString()
  });
});

// 2. POST /api/users/sync
app.post('/api/users/sync', (req, res) => {
  const db = loadDatabase();
  const body = req.body || {};
  const userId = body.userId || ('usr_' + Date.now().toString(36));
  const now = new Date().toISOString();

  let user = db.users.find(u => u.userId === userId);
  const isNew = !user;

  if (isNew) {
    user = {
      userId,
      handle: body.handle || '@operative',
      displayName: body.displayName || body.handle || 'Operative',
      avatar: body.avatar || (body.displayName ? body.displayName.charAt(0).toUpperCase() : 'O'),
      region: body.region || 'Western Metro Zone',
      country: body.country || 'India',
      level: Number(body.level) || 1,
      xp: Number(body.xp) || 0,
      arcScore: Number(body.arcScore) || 0,
      streak: Number(body.streak) || 0,
      isGold: !!body.isGold,
      goldPlan: body.goldPlan || null,
      goldPurchasedAt: body.goldPurchasedAt || (body.isGold ? now : null),
      joinedGroupIds: Array.isArray(body.joinedGroupIds) ? body.joinedGroupIds : [],
      createdAt: now,
      lastSeenAt: now
    };
    db.users.push(user);
  } else {
    // Update existing user profile & telemetry
    if (body.handle) user.handle = body.handle;
    if (body.displayName) user.displayName = body.displayName;
    if (body.avatar) user.avatar = body.avatar;
    if (body.region) user.region = body.region;
    if (body.country) user.country = body.country;
    if (body.level !== undefined) user.level = Number(body.level);
    if (body.xp !== undefined) user.xp = Number(body.xp);
    if (body.arcScore !== undefined) user.arcScore = Number(body.arcScore);
    if (body.streak !== undefined) user.streak = Number(body.streak);
    if (body.isGold !== undefined) {
      user.isGold = !!body.isGold || user.isGold;
      if (body.goldPlan) user.goldPlan = body.goldPlan;
      if (body.goldPurchasedAt) user.goldPurchasedAt = body.goldPurchasedAt;
    }
    if (Array.isArray(body.joinedGroupIds)) {
      user.joinedGroupIds = body.joinedGroupIds;
    }
    user.lastSeenAt = now;
  }

  // Synchronize group rosters bidirectionally
  if (Array.isArray(user.joinedGroupIds)) {
    db.groups.forEach(g => {
      const shouldBeMember = user.joinedGroupIds.includes(g.groupId);
      const isMember = g.memberIds.includes(user.userId);
      if (shouldBeMember && !isMember) {
        g.memberIds.push(user.userId);
      } else if (!shouldBeMember && isMember) {
        g.memberIds = g.memberIds.filter(id => id !== user.userId);
      }
    });
  }

  // Compute live ranks
  const sortedGlobal = [...db.users].sort((a, b) => computeScore(b) - computeScore(a));
  const globalRank = sortedGlobal.findIndex(u => u.userId === user.userId) + 1;

  const sortedRegional = db.users
    .filter(u => u.region === user.region)
    .sort((a, b) => computeScore(b) - computeScore(a));
  const regionalRank = Math.max(1, sortedRegional.findIndex(u => u.userId === user.userId) + 1);

  const sortedCountry = db.users
    .filter(u => u.country === user.country)
    .sort((a, b) => computeScore(b) - computeScore(a));
  const countryRank = Math.max(1, sortedCountry.findIndex(u => u.userId === user.userId) + 1);

  const totalUsers = db.users.length;
  const percentileVal = Math.max(1, Math.round((globalRank / totalUsers) * 100));
  const percentile = `Top ${percentileVal}%`;

  saveDatabase(db);

  const activeTodayCount = db.users.filter(u => {
    const t = new Date(u.lastSeenAt).getTime();
    return !isNaN(t) && (Date.now() - t) <= 86400000;
  }).length;

  res.json({
    success: true,
    user,
    ranks: {
      regionalRank,
      countryRank,
      globalRank,
      percentile,
      regionalTotal: sortedRegional.length,
      countryTotal: sortedCountry.length,
      globalTotal: totalUsers
    },
    serverCounts: {
      totalUsers,
      activeTodayCount,
      totalGoldUsers: db.users.filter(u => u.isGold).length,
      totalGroups: db.groups.length
    }
  });
});

// 3. POST /api/gold/purchase & GET /api/gold/users
app.post('/api/gold/purchase', (req, res) => {
  const db = loadDatabase();
  const { userId, handle, displayName, planTier, amount, currency } = req.body || {};

  if (!userId) {
    return res.status(400).json({ success: false, error: 'userId is required' });
  }

  const now = new Date().toISOString();
  let user = db.users.find(u => u.userId === userId);

  if (!user) {
    user = {
      userId,
      handle: handle || '@operative',
      displayName: displayName || handle || 'VIP Operative',
      avatar: (displayName || handle || 'V').replace('@', '').charAt(0).toUpperCase(),
      region: 'Western Metro Zone',
      country: 'India',
      level: 1,
      xp: 0,
      arcScore: 0,
      streak: 0,
      isGold: true,
      goldPlan: planTier || 'monthly',
      goldPurchasedAt: now,
      joinedGroupIds: [],
      createdAt: now,
      lastSeenAt: now
    };
    db.users.push(user);
  } else {
    user.isGold = true;
    user.goldPlan = planTier || user.goldPlan || 'monthly';
    user.goldPurchasedAt = now;
    user.lastSeenAt = now;
    if (handle) user.handle = handle;
    if (displayName) user.displayName = displayName;
  }

  const purchaseId = 'ARC-GOLD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  const purchase = {
    purchaseId,
    userId: user.userId,
    handle: user.handle,
    planTier: planTier || 'monthly',
    amount: Number(amount) || (planTier === 'lifetime' ? 700 : (planTier === 'annual' ? 365 : 59)),
    currency: currency || 'INR',
    purchasedAt: now,
    status: 'active'
  };

  db.gold_purchases.push(purchase);
  saveDatabase(db);

  const totalGoldUsers = db.users.filter(u => u.isGold).length;

  res.json({
    success: true,
    receipt: purchase,
    user,
    totalGoldUsers
  });
});

app.get('/api/gold/users', (req, res) => {
  const db = loadDatabase();
  const goldUsers = db.users
    .filter(u => u.isGold)
    .map(u => ({
      userId: u.userId,
      handle: u.handle,
      displayName: u.displayName || u.handle,
      avatar: u.avatar || (u.displayName ? u.displayName.charAt(0).toUpperCase() : 'O'),
      goldPlan: u.goldPlan,
      goldPurchasedAt: u.goldPurchasedAt,
      level: u.level || 1,
      arcScore: u.arcScore || 0,
      streak: u.streak || 0
    }))
    .sort((a, b) => new Date(b.goldPurchasedAt || 0) - new Date(a.goldPurchasedAt || 0));

  res.json({
    totalGoldUsers: goldUsers.length,
    goldUsers
  });
});

// 4. GET /api/leaderboard
app.get('/api/leaderboard', (req, res) => {
  const db = loadDatabase();
  const scope = (req.query.scope || 'regional').toLowerCase();
  const region = req.query.region || 'Western Metro Zone';
  const country = req.query.country || 'India';
  const callerUserId = req.query.userId || null;
  const limit = parseInt(req.query.limit, 10) || 50;

  let pool = [...db.users];
  let scopeTitle = 'Worldwide Syndicate';

  if (scope === 'regional') {
    pool = pool.filter(u => u.region === region);
    if (pool.length === 0) pool = [...db.users]; // graceful fallback if user is in unknown region
    scopeTitle = `Regional Sector: ${region}`;
  } else if (scope === 'country') {
    pool = pool.filter(u => u.country === country);
    if (pool.length === 0) pool = [...db.users];
    scopeTitle = `National League: ${country}`;
  } else {
    scopeTitle = 'Worldwide Syndicate: Global Sector';
  }

  // Sort pool by composite ranking score descending
  pool.sort((a, b) => computeScore(b) - computeScore(a));

  const totalOperativesInScope = pool.length;

  // Find caller standing if userId provided
  let callerStanding = null;
  if (callerUserId) {
    const callerIdx = pool.findIndex(u => u.userId === callerUserId);
    if (callerIdx >= 0) {
      const rank = callerIdx + 1;
      const pct = Math.max(1, Math.round((rank / totalOperativesInScope) * 100));
      callerStanding = {
        rank,
        percentile: `Top ${pct}%`,
        totalInScope: totalOperativesInScope
      };
    }
  }

  const rankings = pool.slice(0, limit).map((u, i) => {
    const rank = i + 1;
    const scoreVal = typeof u.arcScore === 'number' ? u.arcScore.toFixed(1) + '%' : (u.arcScore || '0%');
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

  res.json({
    scope,
    scopeTitle,
    totalOperativesInScope,
    rankings,
    callerStanding
  });
});

// 5. Squads (Groups) Endpoints
// GET /api/groups?userId=...
app.get('/api/groups', (req, res) => {
  const db = loadDatabase();
  const callerUserId = req.query.userId || null;

  const usersMap = new Map();
  db.users.forEach(u => usersMap.set(u.userId, u));

  const squads = db.groups.map(g => {
    const members = (g.memberIds || []).map(id => {
      const op = usersMap.get(id);
      if (op) {
        return {
          userId: op.userId,
          handle: op.handle,
          displayName: op.displayName || op.handle,
          avatar: op.avatar || (op.displayName ? op.displayName.charAt(0).toUpperCase() : 'O'),
          isGold: !!op.isGold,
          goldPlan: op.goldPlan || null,
          level: op.level || 1,
          arcScore: op.arcScore || 0
        };
      }
      return {
        userId: id,
        handle: '@operative',
        displayName: 'Operative',
        avatar: 'O',
        isGold: false,
        goldPlan: null,
        level: 1,
        arcScore: 0
      };
    });

    const isJoined = callerUserId ? (g.memberIds || []).includes(callerUserId) : false;

    // Calculate live avgScore
    const totalScore = members.reduce((acc, m) => acc + (Number(m.arcScore) || 0), 0);
    const avgVal = members.length > 0 ? (totalScore / members.length).toFixed(1) : '90.0';

    return {
      groupId: g.groupId,
      name: g.name,
      motto: g.motto,
      category: g.category,
      icon: g.icon || 'fa-solid fa-shield-halved',
      color: g.color || 'from-cyan-500 to-blue-500',
      createdByUserId: g.createdByUserId,
      createdByHandle: g.createdByHandle,
      memberCount: members.length,
      avgScore: avgVal + '%',
      streak: 30,
      createdAt: g.createdAt,
      isJoined,
      members
    };
  });

  res.json({
    totalGroups: squads.length,
    groups: squads
  });
});

// POST /api/groups/create
app.post('/api/groups/create', (req, res) => {
  const db = loadDatabase();
  const { name, motto, category, userId, handle, displayName } = req.body || {};

  if (!name || !userId) {
    return res.status(400).json({ success: false, error: 'Squad name and userId are required' });
  }

  const groupId = 'squad-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5);
  const now = new Date().toISOString();

  let user = db.users.find(u => u.userId === userId);
  if (!user) {
    user = {
      userId,
      handle: handle || '@operative',
      displayName: displayName || handle || 'Operative',
      avatar: (displayName || handle || 'O').replace('@', '').charAt(0).toUpperCase(),
      region: 'Western Metro Zone',
      country: 'India',
      level: 1,
      xp: 0,
      arcScore: 0,
      streak: 0,
      isGold: false,
      goldPlan: null,
      goldPurchasedAt: null,
      joinedGroupIds: [groupId],
      createdAt: now,
      lastSeenAt: now
    };
    db.users.push(user);
  } else {
    if (!Array.isArray(user.joinedGroupIds)) user.joinedGroupIds = [];
    if (!user.joinedGroupIds.includes(groupId)) user.joinedGroupIds.push(groupId);
    user.lastSeenAt = now;
  }

  const newGroup = {
    groupId,
    name: name.trim(),
    motto: (motto || 'Forged in discipline.').trim(),
    category: category || 'All Pillars',
    createdByUserId: userId,
    createdByHandle: handle || user.handle || '@operative',
    icon: 'fa-solid fa-shield-halved',
    color: 'from-amber-400 to-yellow-500',
    memberIds: [userId], // Unlimited capacity, auto-joins creator
    createdAt: now
  };

  db.groups.push(newGroup);
  saveDatabase(db);

  res.json({
    success: true,
    group: newGroup,
    joinedGroupIds: user.joinedGroupIds
  });
});

// POST /api/groups/join
app.post('/api/groups/join', (req, res) => {
  const db = loadDatabase();
  const { groupId, userId } = req.body || {};

  if (!groupId || !userId) {
    return res.status(400).json({ success: false, error: 'groupId and userId are required' });
  }

  const group = db.groups.find(g => g.groupId === groupId);
  if (!group) {
    return res.status(404).json({ success: false, error: 'Group not found' });
  }

  let user = db.users.find(u => u.userId === userId);
  if (!user) {
    const now = new Date().toISOString();
    user = {
      userId,
      handle: '@operative',
      displayName: 'Operative',
      avatar: 'O',
      region: 'Western Metro Zone',
      country: 'India',
      level: 1,
      xp: 0,
      arcScore: 0,
      streak: 0,
      isGold: false,
      goldPlan: null,
      goldPurchasedAt: null,
      joinedGroupIds: [groupId],
      createdAt: now,
      lastSeenAt: now
    };
    db.users.push(user);
  } else {
    if (!Array.isArray(user.joinedGroupIds)) user.joinedGroupIds = [];
    if (!user.joinedGroupIds.includes(groupId)) {
      user.joinedGroupIds.push(groupId);
    }
  }

  if (!group.memberIds.includes(userId)) {
    group.memberIds.push(userId); // Unlimited capacity
  }

  saveDatabase(db);

  res.json({
    success: true,
    group,
    joinedGroupIds: user.joinedGroupIds
  });
});

// POST /api/groups/leave
app.post('/api/groups/leave', (req, res) => {
  const db = loadDatabase();
  const { groupId, userId } = req.body || {};

  if (!groupId || !userId) {
    return res.status(400).json({ success: false, error: 'groupId and userId are required' });
  }

  const group = db.groups.find(g => g.groupId === groupId);
  if (group) {
    group.memberIds = (group.memberIds || []).filter(id => id !== userId);
  }

  const user = db.users.find(u => u.userId === userId);
  if (user && Array.isArray(user.joinedGroupIds)) {
    user.joinedGroupIds = user.joinedGroupIds.filter(id => id !== groupId);
  }

  saveDatabase(db);

  res.json({
    success: true,
    group,
    joinedGroupIds: user ? user.joinedGroupIds : []
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[ArcServer] Arc Cloud External Backend Server listening on http://localhost:${PORT}`);
  console.log(`[ArcServer] Telemetry Summary: http://localhost:${PORT}/api/telemetry/summary`);
  console.log(`[ArcServer] Leaderboards:     http://localhost:${PORT}/api/leaderboard?scope=regional`);
});
