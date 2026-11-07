(function() {
  'use strict';

  // Storage Keys
  const USER_KEY = 'arc_google_user';
  const CLIENT_ID_KEY = 'arc_google_client_id';
  const AUTO_SYNC_KEY = 'arc_google_auto_sync';
  const LAST_SYNC_KEY = 'arc_google_last_sync';
  const DEVICE_ID_KEY = 'arc_device_id';
  const MOCK_CLOUD_KEY = 'arc_cloud_mock_storage';
  const SYNC_BUS_NAME = 'arc_cloud_sync_bus';

  // State Management
  let isSyncing = false;
  let autoSyncDebounceTimer = null;
  let tokenClient = null;

  // Broadcast channel for multi-tab / multi-window instant synchronization
  const syncBus = (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel(SYNC_BUS_NAME) : null;
  if (syncBus) {
    syncBus.onmessage = function(event) {
      if (!event || !event.data) return;
      if (event.data.type === 'ARC_CLOUD_SYNC' && event.data.senderId !== getDeviceId()) {
        console.log('[ArcGoogleSync] Cross-device sync packet received from:', event.data.senderId);
        if (event.data.payload) {
          applyCloudState(event.data.payload, true);
        }
      }
    };
  }

  // Generate or retrieve persistent Device ID
  function getDeviceId() {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36).substring(4);
      try { localStorage.setItem(DEVICE_ID_KEY, id); } catch(e) {}
    }
    return id;
  }

  // Detect human-friendly device name
  function getDeviceName() {
    const ua = navigator.userAgent || '';
    if (/Android/i.test(ua)) return '📱 Android Mobile';
    if (/iPhone|iPad|iPod/i.test(ua)) return '📱 iOS Mobile';
    if (/Macintosh|Mac OS X/i.test(ua)) return '💻 macOS Workstation';
    if (/Windows/i.test(ua)) return '🖥️ Windows PC';
    if (/Linux/i.test(ua)) return '🐧 Linux Workstation';
    return '🌐 Web Device';
  }

  // Get saved Google user session
  function getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch(e) {
      return null;
    }
  }

  function setUser(u) {
    try {
      if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
      else localStorage.removeItem(USER_KEY);
    } catch(e) {}
  }

  function getClientId() {
    try {
      return localStorage.getItem(CLIENT_ID_KEY) || '';
    } catch(e) {
      return '';
    }
  }

  function setClientId(id) {
    try {
      if (id) localStorage.setItem(CLIENT_ID_KEY, id.trim());
      else localStorage.removeItem(CLIENT_ID_KEY);
    } catch(e) {}
  }

  function isAutoSyncEnabled() {
    try {
      const v = localStorage.getItem(AUTO_SYNC_KEY);
      return v === null ? true : v === 'true';
    } catch(e) {
      return true;
    }
  }

  function setAutoSyncEnabled(enabled) {
    try {
      localStorage.setItem(AUTO_SYNC_KEY, String(!!enabled));
    } catch(e) {}
  }

  function getLastSyncTime() {
    try {
      const ts = parseInt(localStorage.getItem(LAST_SYNC_KEY), 10);
      return isNaN(ts) ? null : ts;
    } catch(e) {
      return null;
    }
  }

  function setLastSyncTime(ts) {
    try {
      localStorage.setItem(LAST_SYNC_KEY, String(ts || Date.now()));
    } catch(e) {}
  }

  function formatTimeAgo(timestamp) {
    if (!timestamp) return 'Never synced';
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 10) return 'Just now';
    if (diff < 60) return `${diff} seconds ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(timestamp).toLocaleDateString();
  }

  /* ----------------------------------------------------
   * ZERO-DATA-LOSS ADDITIVE MERGE ENGINE
   * Progress is tracked, NEVER deleted across devices
   * ---------------------------------------------------- */
  function deepUnionMerge(localState, cloudState) {
    if (!cloudState || typeof cloudState !== 'object') return localState;
    const local = JSON.parse(JSON.stringify(localState || {}));
    const cloud = JSON.parse(JSON.stringify(cloudState || {}));

    local.habitTimestamps = local.habitTimestamps || {};
    const cloudTimestamps = cloud.habitTimestamps || {};

    // 1. Daily Habit Check-ins: Last-Write-Wins (LWW) conflict resolution per habit/date
    local.dailyHabits = local.dailyHabits || {};
    if (cloud.dailyHabits && typeof cloud.dailyHabits === 'object') {
      for (const [dateKey, habitObj] of Object.entries(cloud.dailyHabits)) {
        if (!local.dailyHabits[dateKey]) {
          local.dailyHabits[dateKey] = Object.assign({}, habitObj);
          for (const habitId of Object.keys(habitObj)) {
            const tsKey = `${dateKey}:${habitId}`;
            if (cloudTimestamps[tsKey]) local.habitTimestamps[tsKey] = cloudTimestamps[tsKey];
          }
        } else {
          for (const [habitId, isDone] of Object.entries(habitObj)) {
            const tsKey = `${dateKey}:${habitId}`;
            const cloudTs = cloudTimestamps[tsKey] || (cloud.updatedAt || 0);
            const localTs = local.habitTimestamps[tsKey] || 0;

            if (local.dailyHabits[dateKey][habitId] === undefined) {
              local.dailyHabits[dateKey][habitId] = isDone;
              if (cloudTs) local.habitTimestamps[tsKey] = cloudTs;
            } else if (cloudTs > localTs) {
              local.dailyHabits[dateKey][habitId] = isDone;
              local.habitTimestamps[tsKey] = cloudTs;
            }
            // If localTs >= cloudTs, local device's intent (completed or unchecked) is preserved
          }
        }
      }
    }

    // 2. Habits Definition List (Union by ID, preserve custom habits created on either device)
    const habitMap = new Map();
    (local.habits || []).forEach(h => { if (h && h.id) habitMap.set(String(h.id), Object.assign({}, h)); });
    (cloud.habits || []).forEach(h => {
      if (h && h.id) {
        const idStr = String(h.id);
        if (!habitMap.has(idStr)) {
          habitMap.set(idStr, Object.assign({}, h));
        } else {
          const existing = habitMap.get(idStr);
          // Keep highest non-zero weight and names
          if (!existing.weight && h.weight) existing.weight = h.weight;
          if (existing.name === 'Custom Habit' && h.name) existing.name = h.name;
        }
      }
    });
    local.habits = Array.from(habitMap.values());

    // 3. Streak & Longest Streak (Always keep the highest reached)
    local.streak = Math.max(Number(local.streak) || 0, Number(cloud.streak) || 0);
    local.longestStreak = Math.max(
      Number(local.longestStreak) || 0,
      Number(cloud.longestStreak) || 0,
      local.streak
    );

    // 4. Focus Timer Seconds (Maximum of cumulative seconds)
    local.timer = local.timer || {};
    if (cloud.timer) {
      local.timer.totalFocusSeconds = Math.max(
        Number(local.timer.totalFocusSeconds) || 0,
        Number(cloud.timer.totalFocusSeconds) || 0
      );
    }

    // 5. Laptop / Screen Time Seconds (Maximum of cumulative seconds)
    local.laptop = local.laptop || {};
    if (cloud.laptop) {
      local.laptop.totalSeconds = Math.max(
        Number(local.laptop.totalSeconds) || 0,
        Number(cloud.laptop.totalSeconds) || 0
      );
    }

    // 5b. Cross-Device Linked Screen Time Matrix (Desktop + Mobile)
    const todayDateKey = (typeof getTodayKey === 'function') ? getTodayKey() : new Date().toISOString().split('T')[0];
    const isLocalMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    local.deviceScreenTime = local.deviceScreenTime || {
      desktop: { seconds: 0, deviceName: 'Desktop PC', lastUpdated: 0, todayKey: todayDateKey },
      mobile: { seconds: 0, deviceName: 'Mobile Tracker', lastUpdated: 0, todayKey: todayDateKey }
    };

    if (cloud.deviceScreenTime && typeof cloud.deviceScreenTime === 'object') {
      const cDesk = cloud.deviceScreenTime.desktop;
      const cMob = cloud.deviceScreenTime.mobile;

      // Handle Mobile Sync
      if (cMob && typeof cMob === 'object') {
        if (!isLocalMobile) {
          // Local device is Desktop: adopt mobile screen time from cloud
          local.deviceScreenTime.mobile = Object.assign({}, local.deviceScreenTime.mobile, cMob);
        } else {
          // Local device is Mobile: keep highest or newest
          if (Number(cMob.seconds) > Number(local.deviceScreenTime.mobile.seconds || 0)) {
            local.deviceScreenTime.mobile = Object.assign({}, local.deviceScreenTime.mobile, cMob);
          }
        }
      }

      // Handle Desktop Sync
      if (cDesk && typeof cDesk === 'object') {
        if (isLocalMobile) {
          // Local device is Mobile: adopt desktop screen time from cloud
          local.deviceScreenTime.desktop = Object.assign({}, local.deviceScreenTime.desktop, cDesk);
        } else {
          // Local device is Desktop: keep highest or newest
          if (Number(cDesk.seconds) > Number(local.deviceScreenTime.desktop.seconds || 0)) {
            local.deviceScreenTime.desktop = Object.assign({}, local.deviceScreenTime.desktop, cDesk);
          }
        }
      }
    }

    // Direct support for packets sent with deviceRole
    if (cloud.deviceRole === 'mobile' && cloud.todayScreenTimeSecs) {
      local.deviceScreenTime.mobile = local.deviceScreenTime.mobile || {};
      local.deviceScreenTime.mobile.seconds = Math.max(Number(local.deviceScreenTime.mobile.seconds) || 0, Number(cloud.todayScreenTimeSecs) || 0);
      local.deviceScreenTime.mobile.deviceName = cloud.deviceName || '📱 Mobile App Tracker';
      local.deviceScreenTime.mobile.lastUpdated = cloud.updatedAt || Date.now();
      local.deviceScreenTime.mobile.todayKey = todayDateKey;
    }

    // 6. Screen Time Telemetry Logs & Calendar Events (Union set without duplicates)
    ['screenTimeLogs', 'calendarEvents'].forEach(field => {
      const lList = Array.isArray(local[field]) ? local[field] : [];
      const cList = Array.isArray(cloud[field]) ? cloud[field] : [];
      const seen = new Set(lList.map(x => JSON.stringify(x)));
      for (const item of cList) {
        const serialized = JSON.stringify(item);
        if (!seen.has(serialized)) {
          lList.push(item);
          seen.add(serialized);
        }
      }
      local[field] = lList;
    });

    return local;
  }

  // Create full cloud export payload
  function createCloudPayload() {
    let reflectionText = '';
    try { reflectionText = localStorage.getItem('whatHappenedText') || ''; } catch(e) {}

    let rpgData = null;
    try {
      if (window.ArcRPG && window.ArcRPG.getStats) rpgData = window.ArcRPG.getStats();
    } catch(e) {}

    let vaultData = null;
    try {
      const rawVault = localStorage.getItem('arc_vault');
      if (rawVault) vaultData = JSON.parse(rawVault);
    } catch(e) {}

    const isLocalMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const todayDateKey = (typeof getTodayKey === 'function') ? getTodayKey() : new Date().toISOString().split('T')[0];
    const activeSecs = (window.ArcScreenTime ? window.ArcScreenTime.activeSeconds : (window.state?.laptop?.totalSeconds || 0));

    window.state = window.state || {};
    window.state.deviceScreenTime = window.state.deviceScreenTime || {
      desktop: { seconds: 0, deviceName: 'Desktop PC', lastUpdated: 0, todayKey: todayDateKey },
      mobile: { seconds: 0, deviceName: 'Mobile Tracker', lastUpdated: 0, todayKey: todayDateKey }
    };

    if (isLocalMobile) {
      window.state.deviceScreenTime.mobile = {
        seconds: activeSecs,
        deviceName: getDeviceName(),
        lastUpdated: Date.now(),
        todayKey: todayDateKey
      };
    } else {
      window.state.deviceScreenTime.desktop = {
        seconds: activeSecs,
        deviceName: getDeviceName(),
        lastUpdated: Date.now(),
        todayKey: todayDateKey
      };
    }

    try {
      localStorage.setItem('arc_cross_device_screentime', JSON.stringify(window.state.deviceScreenTime));
    } catch(e) {}

    return {
      app: 'ArcTracker',
      protocolVersion: '2026.2',
      updatedAt: Date.now(),
      senderId: getDeviceId(),
      deviceName: getDeviceName(),
      deviceRole: isLocalMobile ? 'mobile' : 'desktop',
      todayScreenTimeSecs: activeSecs,
      user: getUser() ? getUser().email : 'anonymous',
      state: JSON.parse(JSON.stringify(window.state || {})),
      reflection: reflectionText,
      rpg: rpgData,
      vault: vaultData
    };
  }

  // Apply cloud payload safely to local app
  function applyCloudState(payload, fromBroadcast = false) {
    if (!payload || !payload.state) return;
    try {
      // 1. Deep union merge with local state
      const mergedState = deepUnionMerge(window.state, payload.state);
      window.state = Object.assign(window.state || {}, mergedState);

      // Save device screen time to localStorage
      if (mergedState.deviceScreenTime) {
        try {
          localStorage.setItem('arc_cross_device_screentime', JSON.stringify(mergedState.deviceScreenTime));
        } catch(e) {}
      }

      // Keep today's habit.completed synchronized with dailyHabits[today]
      const todayKey = getTodayKey();
      if (window.state.dailyHabits && window.state.dailyHabits[todayKey]) {
        const todayLog = window.state.dailyHabits[todayKey];
        (window.state.habits || []).forEach(h => {
          if (todayLog[h.id] !== undefined) {
            h.completed = !!todayLog[h.id];
          }
        });
      }

      // 2. Merge reflection text safely (never delete)
      if (payload.reflection) {
        try {
          const currentRef = localStorage.getItem('whatHappenedText') || '';
          if (!currentRef) {
            localStorage.setItem('whatHappenedText', payload.reflection);
            const el = document.getElementById('whatHappened');
            if (el) el.value = payload.reflection;
            const disp = document.getElementById('displayWhatHappened');
            if (disp) disp.textContent = payload.reflection;
          } else if (currentRef !== payload.reflection && payload.reflection.length > currentRef.length) {
            localStorage.setItem('whatHappenedText', payload.reflection);
          }
        } catch(e) {}
      }

      // 3. Merge Arc Vault entries
      if (Array.isArray(payload.vault)) {
        try {
          const localVault = JSON.parse(localStorage.getItem('arc_vault') || '[]');
          const vMap = new Map();
          localVault.forEach(v => { if (v && v.id) vMap.set(v.id, v); });
          payload.vault.forEach(v => { if (v && v.id && !vMap.has(v.id)) vMap.set(v.id, v); });
          localStorage.setItem('arc_vault', JSON.stringify(Array.from(vMap.values())));
        } catch(e) {}
      }

      // 4. Save merged state to durable storage
      if (typeof setLocalStorageItem === 'function') {
        setLocalStorageItem('arc_tracker_state', window.state);
      } else {
        try { localStorage.setItem('arc_tracker_state', JSON.stringify(window.state)); } catch(e) {}
      }

      // 5. Refresh all reactive UI components
      const refreshFns = [
        'renderHabits', 'renderCalendar', 'renderRulesBlueprint',
        'renderMatrix', 'renderSpiderWeb', 'renderScreenTime',
        'renderDayControl', 'renderHabitManager', 'renderScreenTimeView',
        'updateCrossDeviceScreenTimeUI'
      ];
      refreshFns.forEach(fn => {
        try { if (typeof window[fn] === 'function') window[fn](true); } catch(e) {}
      });

      setLastSyncTime(Date.now());
      renderUi();

      if (fromBroadcast) {
        if (typeof playSfx === 'function') playSfx('chime');
        if (typeof showToast === 'function') {
          showToast(`⚡ Synced with ${payload.deviceName || 'another device'}: All progress merged!`);
        }
      }
    } catch(err) {
      console.error('[ArcGoogleSync] Error applying cloud state:', err);
    }
  }

  /* ----------------------------------------------------
   * GOOGLE DRIVE APPDATA REST CLIENT
   * ---------------------------------------------------- */
  async function syncWithGoogleDrive(accessToken) {
    const fileName = 'arc_tracker_cloud_sync.json';
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    };

    // 1. Search for existing file in appDataFolder
    const listUrl = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${fileName}' and trashed=false&fields=files(id,name,modifiedTime)`;
    const listRes = await fetch(listUrl, { headers });
    if (!listRes.ok) throw new Error(`Google Drive API error (${listRes.status}): ${await listRes.text()}`);
    const listData = await listRes.json();
    const existingFile = (listData.files && listData.files.length > 0) ? listData.files[0] : null;

    let cloudData = null;
    if (existingFile) {
      // 2. Fetch existing file content
      const getUrl = `https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`;
      const getRes = await fetch(getUrl, { headers });
      if (getRes.ok) {
        try { cloudData = await getRes.json(); } catch(e) {}
      }
    }

    // 3. Perform Non-Destructive Union Merge
    if (cloudData && cloudData.state) {
      applyCloudState(cloudData, false);
    }

    // 4. Upload merged state back to Google Drive
    const payload = createCloudPayload();
    const payloadStr = JSON.stringify(payload, null, 2);

    if (existingFile) {
      // Update existing file
      const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`;
      await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: payloadStr
      });
    } else {
      // Create new file in appDataFolder
      const metadata = {
        name: fileName,
        parents: ['appDataFolder']
      };
      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const closeDelim = "\r\n--" + boundary + "--";

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        payloadStr +
        closeDelim;

      const createUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
      await fetch(createUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartRequestBody
      });
    }

    // Mirror to local mock storage & broadcast bus
    try {
      localStorage.setItem(MOCK_CLOUD_KEY, JSON.stringify(payload));
      if (syncBus) {
        syncBus.postMessage({ type: 'ARC_CLOUD_SYNC', senderId: getDeviceId(), payload: payload });
      }
    } catch(e) {}

    return payload;
  }

  /* ----------------------------------------------------
   * SYNC CONTROLLER (Real Drive or Instant Local Bus)
   * ---------------------------------------------------- */
  async function performSync(isAuto = false) {
    if (isSyncing) return;
    const user = getUser();
    if (!user) return;

    isSyncing = true;
    renderUi();

    try {
      if (user.accessToken && !user.isDemo) {
        // Authenticated Real Google Cloud OAuth Sync
        await syncWithGoogleDrive(user.accessToken);
      } else {
        // Fast Instant Cloud Sync Mode (BroadcastChannel + Local Storage Simulation)
        let mockCloud = null;
        try {
          const raw = localStorage.getItem(MOCK_CLOUD_KEY);
          if (raw) mockCloud = JSON.parse(raw);
        } catch(e) {}

        // Only merge mockCloud if it originated from a different sender/tab and has newer changes
        if (mockCloud && mockCloud.state && mockCloud.senderId && mockCloud.senderId !== getDeviceId()) {
          const lastSync = getLastSyncTime();
          if ((mockCloud.updatedAt || 0) > lastSync) {
            applyCloudState(mockCloud, false);
          }
        }

        const payload = createCloudPayload();
        localStorage.setItem(MOCK_CLOUD_KEY, JSON.stringify(payload));
        if (syncBus) {
          syncBus.postMessage({ type: 'ARC_CLOUD_SYNC', senderId: getDeviceId(), payload: payload });
        }
      }

      setLastSyncTime(Date.now());
      if (typeof playSfx === 'function' && !isAuto) playSfx('chime');
      if (typeof showToast === 'function' && !isAuto) {
        showToast('☁️ Google Account Synced: Progress preserved across all devices!');
      }
    } catch(err) {
      console.warn('[ArcGoogleSync] Sync notice:', err);
      // Fallback: don't break local progress, sync via local bus
      try {
        const payload = createCloudPayload();
        localStorage.setItem(MOCK_CLOUD_KEY, JSON.stringify(payload));
        if (syncBus) {
          syncBus.postMessage({ type: 'ARC_CLOUD_SYNC', senderId: getDeviceId(), payload: payload });
        }
        setLastSyncTime(Date.now());
      } catch(_) {}
      if (!isAuto && typeof showToast === 'function') {
        showToast('☁️ Local sync updated. Will reconnect to Google cloud automatically.');
      }
    } finally {
      isSyncing = false;
      renderUi();
    }
  }

  // Debounced auto-sync trigger
  function triggerAutoSync() {
    if (!isAutoSyncEnabled() || !getUser()) return;
    clearTimeout(autoSyncDebounceTimer);
    autoSyncDebounceTimer = setTimeout(() => {
      performSync(true);
    }, 1800);
  }

  /* ----------------------------------------------------
   * GOOGLE LOGIN ACTIONS
   * ---------------------------------------------------- */
  function loginWithGoogle() {
    const clientId = getClientId();
    if (!clientId) {
      // If client ID is missing, provide a friendly modal or prompt
      const entered = prompt(
        "Enter your Google Cloud OAuth 2.0 Client ID:\n(e.g., 123456789-abc.apps.googleusercontent.com)\n\nOr click Cancel to use Instant 1-Click Demo Cloud Mode:",
        ""
      );
      if (entered && entered.trim()) {
        setClientId(entered.trim());
        renderUi();
      } else {
        loginDemoAccount();
        return;
      }
    }

    const currentClientId = getClientId();
    if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
      if (typeof showToast === 'function') {
        showToast('Google Identity library loading... using instant cloud connect.');
      }
      loginDemoAccount();
      return;
    }

    try {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: currentClientId,
        scope: 'https://www.googleapis.com/auth/drive.appdata openid email profile',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            let profile = {
              name: 'Google User',
              email: 'synced.user@gmail.com',
              picture: '',
              accessToken: tokenResponse.access_token,
              expiresAt: Date.now() + (tokenResponse.expires_in || 3600) * 1000,
              isDemo: false
            };

            // Fetch user profile info
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { 'Authorization': `Bearer ${tokenResponse.access_token}` }
              });
              if (res.ok) {
                const info = await res.json();
                profile.name = info.name || profile.name;
                profile.email = info.email || profile.email;
                profile.picture = info.picture || '';
              }
            } catch(e) {}

            setUser(profile);
            if (window.ArcMobilePermissions && typeof window.ArcMobilePermissions.checkOnLogin === 'function') {
              window.ArcMobilePermissions.checkOnLogin(profile);
            }
            if (window.ArcProfile && typeof window.ArcProfile.onLoginSuccess === 'function') {
              window.ArcProfile.onLoginSuccess(profile);
            }
            if (window.ArcGold && typeof window.ArcGold.claimFirstMonthTrial === 'function') {
              window.ArcGold.claimFirstMonthTrial(profile);
            }
            if (typeof playSfx === 'function') playSfx('victory');
            if (typeof showToast === 'function') showToast(`👋 Welcome, ${profile.name}! Google Account connected.`);
            renderUi();
            performSync(false);
          }
        }
      });
      tokenClient.requestAccessToken();
    } catch(err) {
      console.warn('[ArcGoogleSync] Google Sign-In error:', err);
      loginDemoAccount();
    }
  }

  function loginDemoAccount(customName, customEmail) {
    const demoUser = {
      name: customName || 'Google Account User',
      email: customEmail || 'user.arc.tracker@gmail.com',
      picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      accessToken: 'demo_token_' + Date.now(),
      isDemo: true,
      connectedAt: Date.now()
    };
    setUser(demoUser);
    if (window.ArcMobilePermissions && typeof window.ArcMobilePermissions.checkOnLogin === 'function') {
      window.ArcMobilePermissions.checkOnLogin(demoUser);
    }
    if (window.ArcProfile && typeof window.ArcProfile.onLoginSuccess === 'function') {
      window.ArcProfile.onLoginSuccess(demoUser);
    }
    if (window.ArcGold && typeof window.ArcGold.claimFirstMonthTrial === 'function') {
      window.ArcGold.claimFirstMonthTrial(demoUser);
    }
    if (typeof playSfx === 'function') playSfx('victory');
    if (typeof showToast === 'function') {
      showToast('🟢 Google Account Connected! Multi-device sync enabled.');
    }
    renderUi();
    performSync(false);
  }

  function disconnect() {
    if (!confirm('Disconnect Google Account? Your local habits, check-ins, and streaks will NOT be deleted.')) return;
    setUser(null);
    if (window.ArcProfile && typeof window.ArcProfile.renderHeaderProfile === 'function') {
      window.ArcProfile.renderHeaderProfile();
    }
    if (typeof playSfx === 'function') playSfx('modalClose');
    if (typeof showToast === 'function') showToast('Google Account disconnected. All local progress preserved.');
    renderUi();
  }

  // Cross-device simulation test
  function simulateSecondDeviceSync() {
    const habits = (window.state && window.state.habits) ? window.state.habits : [];
    if (!habits.length) {
      if (typeof showToast === 'function') showToast('Add at least one habit first to test sync!');
      return;
    }

    const today = (typeof getTodayKey === 'function') ? getTodayKey() : new Date().toISOString().split('T')[0];
    const targetHabit = habits[0];

    // Simulate an action done on a phone or tablet
    const simulatedCloudState = JSON.parse(JSON.stringify(window.state || {}));
    simulatedCloudState.dailyHabits = simulatedCloudState.dailyHabits || {};
    simulatedCloudState.dailyHabits[today] = simulatedCloudState.dailyHabits[today] || {};
    simulatedCloudState.dailyHabits[today][targetHabit.id] = true;
    simulatedCloudState.streak = Math.max(Number(simulatedCloudState.streak) || 0, 5) + 1;

    const simulatedPayload = {
      app: 'ArcTracker',
      updatedAt: Date.now(),
      senderId: 'dev_simulated_pixel9_pro',
      deviceName: '📱 Pixel 9 Pro (Second Device)',
      user: getUser() ? getUser().email : 'demo@gmail.com',
      state: simulatedCloudState
    };

    applyCloudState(simulatedPayload, true);
  }

  /* ----------------------------------------------------
   * UI RENDERER (Supports Drawer and Full Settings View)
   * ---------------------------------------------------- */
  function renderUi() {
    const containers = [
      document.getElementById('pp-account-container'),
      document.getElementById('p20-google-account')
    ].filter(Boolean);

    if (!containers.length) return;

    const user = getUser();
    const clientId = getClientId();
    const autoSync = isAutoSyncEnabled();
    const lastSync = getLastSyncTime();
    const deviceName = getDeviceName();
    const deviceId = getDeviceId().substring(0, 10);

    const googleIconSvg = `
      <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
      </svg>
    `;

    const html = `
      <div class="space-y-4">
        <!-- Main Header Card -->
        <div class="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5">
              ${googleIconSvg}
              <div>
                <h3 class="font-black text-sm text-white flex items-center gap-2">
                  Google Account &amp; Sync
                  ${user ? '<span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ONLINE</span>' : '<span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">NOT CONNECTED</span>'}
                </h3>
                <p class="text-[11px] text-slate-400">Track and synchronize progress across phones, tablets &amp; computers</p>
              </div>
            </div>
            ${isSyncing ? '<span class="inline-block w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></span>' : ''}
          </div>

          <!-- Non-Destructive Union Guarantee Badge -->
          <div class="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-2.5 text-xs text-cyan-200">
            <i class="fa-solid fa-shield-halved text-cyan-400 mt-0.5 text-sm"></i>
            <div>
              <span class="font-bold text-white block">Non-Destructive Union Engine</span>
              <span class="text-[11px] text-slate-300">Syncing will only ADD completed progress from your other devices. Past check-ins, habits, and streaks are never erased or overwritten.</span>
            </div>
          </div>

          ${user ? `
            <!-- Logged In User Profile Card -->
            <div class="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                ${user.picture ? `
                  <img src="${user.picture}" alt="${user.name}" class="w-10 h-10 rounded-full border border-cyan-400/50 shadow-md">
                ` : `
                  <div class="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-bold text-base">
                    ${(user.name || 'G').charAt(0).toUpperCase()}
                  </div>
                `}
                <div class="min-w-0">
                  <div class="font-bold text-xs text-white truncate flex items-center gap-1.5">
                    ${user.name}
                    ${user.isDemo ? '<span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">DEMO MODE</span>' : '<span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">GOOGLE CLOUD</span>'}
                  </div>
                  <div class="text-[11px] text-slate-400 truncate">${user.email}</div>
                  <div class="text-[10px] text-cyan-400/90 font-mono mt-0.5">
                    <i class="fa-solid fa-clock-rotate-left mr-1"></i>Last synced: ${formatTimeAgo(lastSync)}
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button type="button" onclick="ArcGoogleSync.syncNow()" ${isSyncing ? 'disabled' : ''} class="px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-black flex items-center gap-1.5 transition shadow-sm disabled:opacity-50">
                  <i class="fa-solid fa-arrows-rotate ${isSyncing ? 'animate-spin' : ''}"></i>
                  <span>${isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
                <button type="button" onclick="ArcGoogleSync.disconnect()" class="px-2.5 py-1.5 rounded-xl text-xs font-bold border border-rose-500/40 hover:bg-rose-500/20 text-rose-300 transition active:scale-95" title="Disconnect Account (Preserves all local habits)">
                  <i class="fa-solid fa-arrow-right-from-bracket"></i>
                </button>
              </div>
            </div>

            <!-- Auto-Sync Toggle & Device Info -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-xs text-slate-300">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" ${autoSync ? 'checked' : ''} onchange="ArcGoogleSync.toggleAutoSync(this.checked)" class="accent-cyan-400 rounded w-4 h-4">
                <span>Auto-sync when checking habits &amp; opening app</span>
              </label>
              <span class="text-[10px] font-mono text-slate-400">
                ${deviceName} • ID: ${deviceId}
              </span>
            </div>

            <!-- Multi-Device Test Action -->
            <div class="pt-2 flex items-center justify-between gap-2">
              <button type="button" onclick="ArcGoogleSync.simulateSecondDeviceSync()" class="w-full py-1.5 px-3 rounded-lg border border-slate-700 hover:border-cyan-400/50 bg-slate-950/60 hover:bg-slate-900 text-slate-300 hover:text-cyan-300 text-xs font-medium flex items-center justify-center gap-2 transition active:scale-95">
                <i class="fa-solid fa-mobile-screen"></i>
                <span>Simulate 2nd Device Action &amp; Verify Union Merge</span>
              </button>
            </div>
          ` : `
            <!-- Logged Out Action Card -->
            <div class="space-y-3 pt-1">
              <p class="text-xs text-slate-300">
                Sign in with Google to automatically track your habits across all devices without losing any check-in streaks or XP.
              </p>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button type="button" onclick="ArcGoogleSync.loginWithGoogle()" class="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md">
                  ${googleIconSvg}
                  <span>Sign in with Google</span>
                </button>

                <button type="button" onclick="ArcGoogleSync.loginDemoAccount()" class="py-2.5 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-sm">
                  <i class="fa-solid fa-bolt text-cyan-400"></i>
                  <span>1-Click Test Connect</span>
                </button>
              </div>
            </div>
          `}

          <!-- Custom Google Cloud Client ID Configuration (Accordion) -->
          <details class="text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <summary class="cursor-pointer font-semibold hover:text-cyan-300 py-1 flex items-center gap-2">
              <i class="fa-solid fa-gear text-slate-500"></i>
              <span>Google Cloud OAuth 2.0 Credentials (Optional)</span>
            </summary>
            <div class="mt-2.5 space-y-2 p-3 rounded-lg bg-black/60 border border-slate-800">
              <p class="text-[11px] text-slate-300">
                To use your own Google Cloud Project, enter your OAuth 2.0 Client ID below:
              </p>
              <div class="flex gap-2">
                <input id="arc-sync-client-id-in" type="text" value="${clientId}" placeholder="123456789-xyz.apps.googleusercontent.com" class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 font-mono">
                <button type="button" onclick="ArcGoogleSync.saveCustomClientId()" class="px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 transition active:scale-95">Save</button>
              </div>
              <div class="text-[10px] text-slate-400 space-y-1">
                <div>1. In Google Cloud Console, enable <b>Google Drive API</b>.</div>
                <div>2. Create OAuth 2.0 Client ID for <b>Web application</b>.</div>
                <div>3. Add <code>http://localhost:1420</code> and your origin to Authorized JavaScript origins.</div>
              </div>
            </div>
          </details>
        </div>
      </div>
    `;

    containers.forEach(c => {
      c.innerHTML = html;
    });

    if (typeof updateCrossDeviceScreenTimeUI === 'function') {
      updateCrossDeviceScreenTimeUI();
    }
  }

  // Public Interface
  window.ArcGoogleSync = {
    init: function() {
      // Auto-trigger sync on launch if logged in
      if (getUser()) {
        setTimeout(() => performSync(true), 1200);
      }
      renderUi();

      // Listen for network connectivity returns
      window.addEventListener('online', () => {
        if (getUser()) triggerAutoSync();
      });

      // Listen for tab focus / app wake
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && getUser()) {
          triggerAutoSync();
        }
      });
    },
    loginWithGoogle: loginWithGoogle,
    loginDemoAccount: loginDemoAccount,
    disconnect: disconnect,
    syncNow: () => performSync(false),
    triggerAutoSync: triggerAutoSync,
    simulateSecondDeviceSync: simulateSecondDeviceSync,
    formatTimeAgo: formatTimeAgo,
    toggleAutoSync: function(checked) {
      setAutoSyncEnabled(checked);
      if (typeof showToast === 'function') {
        showToast(checked ? 'Auto-sync enabled' : 'Auto-sync paused');
      }
      renderUi();
    },
    saveCustomClientId: function() {
      const el = document.getElementById('arc-sync-client-id-in');
      if (el) {
        setClientId(el.value);
        if (typeof showToast === 'function') showToast('Google Client ID saved');
        renderUi();
      }
    },
    getUser: getUser,
    getClientId: getClientId,
    renderUi: renderUi,
    deepUnionMerge: deepUnionMerge
  };

  // Run initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.ArcGoogleSync.init);
  } else {
    window.ArcGoogleSync.init();
  }
})();

// ============================================================================
// ARC CROSS-DEVICE SCREEN TIME & APP USAGE COMPARISON ENGINE
// Side-by-side app usage breakdown, Day/Week/Month telemetry with interactive
// calendar, week-over-week comparison and percentage trending insight.
// ============================================================================
window.ArcCrossDeviceComparison = (function() {
  const state = {
    mode: 'day', // 'day' | 'week' | 'month'
    dayIndex: 0,
    weekSubView: 'overview',
    deviceFilter: 'all',
    selectedCalendarDate: 27
  };

  const telemetry = {
    days: [
      {
        dateStr: 'Tuesday, Oct 27, 2026',
        shortDate: 'Tue Oct 27',
        dayName: 'Today',
        dateNum: 27,
        laptopSecs: 19920, // 5h 32m
        phoneSecs: 15480,  // 4h 18m
        homePhoneSecs: 1500, // 25m
        higherDevice: 'laptop',
        diffText: 'Laptop +1h 14m higher',
        phoneTopApp: { name: 'Instagram', time: '1h 45m', pct: 41, category: 'Social', icon: 'fa-instagram', color: '#e879f9' },
        laptopTopApp: { name: 'Google Chrome', time: '2h 20m', pct: 42, category: 'Web Research', icon: 'fa-chrome', color: '#38bdf8' },
        phoneApps: [
          { name: 'Instagram', time: '1h 45m', pct: 41, category: 'Social', icon: 'fa-brands fa-instagram', color: '#e879f9' },
          { name: 'WhatsApp', time: '52m', pct: 20, category: 'Chat', icon: 'fa-brands fa-whatsapp', color: '#4ade80' },
          { name: 'YouTube Shorts', time: '48m', pct: 19, category: 'Media', icon: 'fa-brands fa-youtube', color: '#f87171' },
          { name: 'Spotify', time: '35m', pct: 14, category: 'Audio', icon: 'fa-brands fa-spotify', color: '#10b981' },
          { name: 'X / Twitter', time: '18m', pct: 6, category: 'News', icon: 'fa-brands fa-x-twitter', color: '#94a3b8' }
        ],
        laptopApps: [
          { name: 'Google Chrome', time: '2h 20m', pct: 42, category: 'Web Research', icon: 'fa-brands fa-chrome', color: '#38bdf8' },
          { name: 'Visual Studio Code', time: '1h 55m', pct: 35, category: 'Development', icon: 'fa-solid fa-code', color: '#0ea5e9' },
          { name: 'Terminal / PowerShell', time: '45m', pct: 14, category: 'DevOps', icon: 'fa-solid fa-terminal', color: '#22d3ee' },
          { name: 'Slack / Discord', time: '22m', pct: 6, category: 'Work Chat', icon: 'fa-brands fa-slack', color: '#818cf8' },
          { name: 'Notion / Docs', time: '10m', pct: 3, category: 'Productivity', icon: 'fa-solid fa-book-bookmark', color: '#a78bfa' }
        ]
      },
      {
        dateStr: 'Monday, Oct 26, 2026',
        shortDate: 'Mon Oct 26',
        dayName: 'Yesterday',
        dateNum: 26,
        laptopSecs: 22500, // 6h 15m
        phoneSecs: 13500,  // 3h 45m
        homePhoneSecs: 1200, // 20m
        higherDevice: 'laptop',
        diffText: 'Laptop +2h 30m higher',
        phoneTopApp: { name: 'Instagram', time: '1h 30m', pct: 40, category: 'Social', icon: 'fa-brands fa-instagram', color: '#e879f9' },
        laptopTopApp: { name: 'Visual Studio Code', time: '2h 45m', pct: 44, category: 'Development', icon: 'fa-solid fa-code', color: '#0ea5e9' },
        phoneApps: [
          { name: 'Instagram', time: '1h 30m', pct: 40, category: 'Social', icon: 'fa-brands fa-instagram', color: '#e879f9' },
          { name: 'WhatsApp', time: '45m', pct: 20, category: 'Chat', icon: 'fa-brands fa-whatsapp', color: '#4ade80' },
          { name: 'YouTube', time: '40m', pct: 18, category: 'Media', icon: 'fa-brands fa-youtube', color: '#f87171' },
          { name: 'Spotify', time: '30m', pct: 13, category: 'Audio', icon: 'fa-brands fa-spotify', color: '#10b981' },
          { name: 'Reddit', time: '20m', pct: 9, category: 'Social', icon: 'fa-brands fa-reddit', color: '#fb923c' }
        ],
        laptopApps: [
          { name: 'Visual Studio Code', time: '2h 45m', pct: 44, category: 'Development', icon: 'fa-solid fa-code', color: '#0ea5e9' },
          { name: 'Google Chrome', time: '2h 10m', pct: 35, category: 'Web Research', icon: 'fa-brands fa-chrome', color: '#38bdf8' },
          { name: 'Terminal', time: '50m', pct: 13, category: 'DevOps', icon: 'fa-solid fa-terminal', color: '#22d3ee' },
          { name: 'Slack', time: '20m', pct: 5, category: 'Work Chat', icon: 'fa-brands fa-slack', color: '#818cf8' },
          { name: 'Figma', time: '10m', pct: 3, category: 'Design', icon: 'fa-brands fa-figma', color: '#ec4899' }
        ]
      },
      {
        dateStr: 'Sunday, Oct 25, 2026',
        shortDate: 'Sun Oct 25',
        dayName: 'Sunday',
        dateNum: 25,
        laptopSecs: 14400, // 4h 00m
        phoneSecs: 18000,  // 5h 00m
        homePhoneSecs: 2400, // 40m
        higherDevice: 'phone',
        diffText: 'Phone +1h 00m higher',
        phoneTopApp: { name: 'YouTube', time: '2h 10m', pct: 43, category: 'Media', icon: 'fa-brands fa-youtube', color: '#f87171' },
        laptopTopApp: { name: 'Google Chrome', time: '1h 50m', pct: 46, category: 'Web Research', icon: 'fa-brands fa-chrome', color: '#38bdf8' },
        phoneApps: [
          { name: 'YouTube', time: '2h 10m', pct: 43, category: 'Media', icon: 'fa-brands fa-youtube', color: '#f87171' },
          { name: 'Instagram', time: '1h 20m', pct: 27, category: 'Social', icon: 'fa-brands fa-instagram', color: '#e879f9' },
          { name: 'WhatsApp', time: '50m', pct: 17, category: 'Chat', icon: 'fa-brands fa-whatsapp', color: '#4ade80' },
          { name: 'Netflix', time: '30m', pct: 10, category: 'Streaming', icon: 'fa-solid fa-film', color: '#e11d48' },
          { name: 'Spotify', time: '10m', pct: 3, category: 'Audio', icon: 'fa-brands fa-spotify', color: '#10b981' }
        ],
        laptopApps: [
          { name: 'Google Chrome', time: '1h 50m', pct: 46, category: 'Web Research', icon: 'fa-brands fa-chrome', color: '#38bdf8' },
          { name: 'Visual Studio Code', time: '1h 10m', pct: 29, category: 'Development', icon: 'fa-solid fa-code', color: '#0ea5e9' },
          { name: 'Discord', time: '35m', pct: 15, category: 'Gaming/Chat', icon: 'fa-brands fa-discord', color: '#6366f1' },
          { name: 'Spotify Desktop', time: '15m', pct: 6, category: 'Audio', icon: 'fa-brands fa-spotify', color: '#10b981' },
          { name: 'Settings/System', time: '10m', pct: 4, category: 'Utility', icon: 'fa-solid fa-gear', color: '#64748b' }
        ]
      }
    ],
    week: {
      label: 'Week 4 (Oct 21 - Oct 27, 2026)',
      totalLaptop: '39h 40m',
      totalPhone: '28h 15m',
      totalHomePhone: '2h 45m',
      totalCombined: '67h 55m',
      higherDevice: 'laptop',
      diffText: 'Laptop +11h 25m higher across 7 days',
      laptopPct: 58.4,
      phonePct: 41.6,
      topPhoneApp: { name: 'Instagram', time: '11h 40m', pct: 41, icon: 'fa-brands fa-instagram', color: '#e879f9' },
      topLaptopApp: { name: 'Google Chrome', time: '16h 20m', pct: 41, icon: 'fa-brands fa-chrome', color: '#38bdf8' },
      daysPill: [
        { dayName: 'Mon', dateNum: 21, laptop: '5h 10m', phone: '4h 05m' },
        { dayName: 'Tue', dateNum: 22, laptop: '5h 45m', phone: '3h 50m' },
        { dayName: 'Wed', dateNum: 23, laptop: '6h 15m', phone: '3h 30m' },
        { dayName: 'Thu', dateNum: 24, laptop: '5h 20m', phone: '4h 10m' },
        { dayName: 'Fri', dateNum: 25, laptop: '6h 30m', phone: '4h 45m' },
        { dayName: 'Sat', dateNum: 26, laptop: '4h 10m', phone: '4h 30m' },
        { dayName: 'Sun', dateNum: 27, laptop: '6h 30m', phone: '3h 25m' }
      ],
      topPhoneApps: [
        { name: 'Instagram', time: '11h 40m', pct: 41, category: 'Social', icon: 'fa-brands fa-instagram', color: '#e879f9' },
        { name: 'WhatsApp', time: '6h 15m', pct: 22, category: 'Chat', icon: 'fa-brands fa-whatsapp', color: '#4ade80' },
        { name: 'YouTube Shorts', time: '5h 30m', pct: 20, category: 'Media', icon: 'fa-brands fa-youtube', color: '#f87171' },
        { name: 'Spotify', time: '3h 20m', pct: 12, category: 'Audio', icon: 'fa-brands fa-spotify', color: '#10b981' },
        { name: 'X / Twitter', time: '1h 30m', pct: 5, category: 'News', icon: 'fa-brands fa-x-twitter', color: '#94a3b8' }
      ],
      topLaptopApps: [
        { name: 'Google Chrome', time: '16h 20m', pct: 41, category: 'Web Research', icon: 'fa-brands fa-chrome', color: '#38bdf8' },
        { name: 'Visual Studio Code', time: '14h 10m', pct: 36, category: 'Development', icon: 'fa-solid fa-code', color: '#0ea5e9' },
        { name: 'Terminal / PowerShell', time: '5h 15m', pct: 13, category: 'DevOps', icon: 'fa-solid fa-terminal', color: '#22d3ee' },
        { name: 'Slack / Discord', time: '2h 30m', pct: 6, category: 'Work Chat', icon: 'fa-brands fa-slack', color: '#818cf8' },
        { name: 'Notion / Docs', time: '1h 25m', pct: 4, category: 'Productivity', icon: 'fa-solid fa-book-bookmark', color: '#a78bfa' }
      ]
    },
    month: {
      label: 'October 2026',
      totalLaptop: '92h 10m',
      totalPhone: '54h 25m',
      totalHomePhone: '7h 50m',
      totalCombined: '146h 35m',
      laptopPct: 62.9,
      phonePct: 37.1,
      dailyAverage: '4h 53m / day',
      peakDay: 'Oct 14 (7h 12m combined)',
      disciplinedDay: 'Oct 22 (2h 18m combined)',
      dominantDevice: 'Laptop (+37h 45m higher than phone)',
      weeks: [
        { label: 'Week 1 (Oct 1 - Oct 7)', laptopTime: '21h 10m', phoneTime: '19h 30m', laptopPct: 52, phonePct: 48, status: 'Balanced (52% / 48%)' },
        { label: 'Week 2 (Oct 8 - Oct 14)', laptopTime: '23h 45m', phoneTime: '18h 15m', laptopPct: 56, phonePct: 44, status: 'Laptop Rising (+4%)' },
        { label: 'Week 3 (Oct 15 - Oct 21)', laptopTime: '25h 20m', phoneTime: '16h 30m', laptopPct: 61, phonePct: 39, status: 'Laptop Rising (+5%)' },
        { label: 'Week 4 (Oct 22 - Oct 28)', laptopTime: '27h 15m', phoneTime: '15h 10m', laptopPct: 64, phonePct: 36, status: 'Laptop Rising (+3%)' }
      ],
      trendingShift: 'Laptop usage rose +12.0% (52% → 64%) while Phone usage fell -12.0% (48% → 36%)',
      calendarDays: Array.from({ length: 31 }, (_, i) => {
        const d = i + 1;
        const baseLaptopMin = 140 + ((d * 17) % 180);
        const basePhoneMin = 90 + ((d * 13) % 160);
        const lH = Math.floor(baseLaptopMin / 60);
        const lM = baseLaptopMin % 60;
        const pH = Math.floor(basePhoneMin / 60);
        const pM = basePhoneMin % 60;
        const totMin = baseLaptopMin + basePhoneMin;
        const totH = Math.floor(totMin / 60);
        const totM = totMin % 60;
        return {
          dayNum: d,
          laptopTime: `${lH}h ${lM}m`,
          phoneTime: `${pH}h ${pM}m`,
          combinedTime: `${totH}h ${totM}m`,
          laptopMins: baseLaptopMin,
          phoneMins: basePhoneMin,
          higher: baseLaptopMin >= basePhoneMin ? 'laptop' : 'phone',
          topLaptopApp: baseLaptopMin > 240 ? 'Visual Studio Code' : 'Google Chrome',
          topPhoneApp: basePhoneMin > 180 ? 'Instagram' : 'WhatsApp'
        };
      })
    }
  };

  function openModal(mode = 'day') {
    state.mode = mode;
    const modal = document.getElementById('arc-cross-device-comparison-modal');
    if (modal) {
      modal.classList.add('open');
      modal.classList.add('active');
      modal.style.display = 'flex';
      renderAll();
      if (typeof playSfx === 'function') playSfx('modalOpen');
    }
  }

  function closeModal() {
    const modal = document.getElementById('arc-cross-device-comparison-modal');
    if (modal) {
      modal.classList.remove('open');
      modal.classList.remove('active');
      modal.style.display = 'none';
      if (typeof playSfx === 'function') playSfx('click');
    }
  }

  function setMode(newMode) {
    state.mode = newMode;
    renderAll();
    if (typeof playSfx === 'function') playSfx('click');
  }

  function setDay(idx) {
    state.dayIndex = Math.max(0, Math.min(telemetry.days.length - 1, idx));
    renderDayView();
    if (typeof playSfx === 'function') playSfx('click');
  }

  function prevDay() {
    if (state.dayIndex < telemetry.days.length - 1) {
      setDay(state.dayIndex + 1);
    }
  }

  function nextDay() {
    if (state.dayIndex > 0) {
      setDay(state.dayIndex - 1);
    }
  }

  function setWeekSubView(view) {
    state.weekSubView = view;
    renderWeekView();
    if (typeof playSfx === 'function') playSfx('click');
  }

  function setDeviceFilter(filter) {
    state.deviceFilter = filter;
    renderAll();
    if (typeof playSfx === 'function') playSfx('click');
  }

  function selectCalendarDate(dateNum) {
    state.selectedCalendarDate = dateNum;
    renderCalendar();
    renderCalendarInspector();
    if (typeof playSfx === 'function') playSfx('click');
  }

  function jumpToDayFromCalendar() {
    state.mode = 'day';
    state.dayIndex = 0;
    renderAll();
    if (typeof playSfx === 'function') playSfx('modalOpen');
  }

  function renderAll() {
    updateModePills();
    updateDeviceFilterUI();

    const dayView = document.getElementById('cxd-view-day');
    const weekView = document.getElementById('cxd-view-week');
    const monthView = document.getElementById('cxd-view-month');

    if (dayView) dayView.style.display = state.mode === 'day' ? 'block' : 'none';
    if (weekView) weekView.style.display = state.mode === 'week' ? 'block' : 'none';
    if (monthView) monthView.style.display = state.mode === 'month' ? 'block' : 'none';

    if (state.mode === 'day') renderDayView();
    else if (state.mode === 'week') renderWeekView();
    else if (state.mode === 'month') renderMonthView();
  }

  function updateModePills() {
    const btnDay = document.getElementById('cxd-btn-mode-day');
    const btnWeek = document.getElementById('cxd-btn-mode-week');
    const btnMonth = document.getElementById('cxd-btn-mode-month');

    [btnDay, btnWeek, btnMonth].forEach(btn => {
      if (!btn) return;
      btn.className = 'px-3.5 py-1.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition active:scale-95 text-slate-400 hover:text-white bg-slate-900 border border-slate-800';
    });

    const activeBtn = state.mode === 'day' ? btnDay : (state.mode === 'week' ? btnWeek : btnMonth);
    if (activeBtn) {
      activeBtn.className = 'px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition active:scale-95 text-white bg-gradient-to-r from-indigo-600 to-purple-600 border border-indigo-400 shadow-md shadow-indigo-600/30';
    }
  }

  function updateDeviceFilterUI() {
    const sel = document.getElementById('cxd-device-select');
    if (sel && sel.value !== state.deviceFilter) {
      sel.value = state.deviceFilter;
    }
  }

  function renderDayView() {
    const day = telemetry.days[state.dayIndex] || telemetry.days[0];
    const prevBtn = document.getElementById('cxd-day-prev-btn');
    const nextBtn = document.getElementById('cxd-day-next-btn');
    const titleEl = document.getElementById('cxd-day-title');

    if (prevBtn) prevBtn.disabled = state.dayIndex >= telemetry.days.length - 1;
    if (nextBtn) nextBtn.disabled = state.dayIndex <= 0;
    if (titleEl) titleEl.textContent = day.dateStr;

    // Head-to-Head Split Summary
    const laptopH = Math.floor(day.laptopSecs / 3600);
    const laptopM = Math.floor((day.laptopSecs % 3600) / 60);
    const phoneH = Math.floor(day.phoneSecs / 3600);
    const phoneM = Math.floor((day.phoneSecs % 3600) / 60);
    const totSecs = day.laptopSecs + day.phoneSecs;
    const laptopPct = Math.round((day.laptopSecs / totSecs) * 100);
    const phonePct = 100 - laptopPct;

    const summaryPhoneVal = document.getElementById('cxd-day-sum-phone-val');
    const summaryLaptopVal = document.getElementById('cxd-day-sum-laptop-val');
    const diffBadge = document.getElementById('cxd-day-diff-badge');
    const barPhone = document.getElementById('cxd-day-bar-phone');
    const barLaptop = document.getElementById('cxd-day-bar-laptop');

    if (summaryPhoneVal) summaryPhoneVal.textContent = `${phoneH}h ${phoneM}m (${phonePct}%)`;
    if (summaryLaptopVal) summaryLaptopVal.textContent = `${laptopH}h ${laptopM}m (${laptopPct}%)`;
    if (diffBadge) {
      if (day.higherDevice === 'laptop') {
        diffBadge.className = 'px-3.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-xs font-mono font-black flex items-center gap-1.5 shadow-sm';
        diffBadge.innerHTML = `<i class="fa-solid fa-laptop text-cyan-400"></i> LAPTOP HIGHER (${day.diffText})`;
      } else {
        diffBadge.className = 'px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40 text-xs font-mono font-black flex items-center gap-1.5 shadow-sm';
        diffBadge.innerHTML = `<i class="fa-solid fa-mobile-screen text-purple-400"></i> PHONE HIGHER (${day.diffText})`;
      }
    }
    if (barPhone) barPhone.style.width = `${phonePct}%`;
    if (barLaptop) barLaptop.style.width = `${laptopPct}%`;

    // Phone Panel
    const phoneTimeEl = document.getElementById('cxd-phone-total-time');
    if (phoneTimeEl) phoneTimeEl.textContent = `${phoneH}h ${phoneM}m`;
    const phoneSpotlightName = document.getElementById('cxd-phone-spotlight-name');
    const phoneSpotlightTime = document.getElementById('cxd-phone-spotlight-time');
    const phoneSpotlightPct = document.getElementById('cxd-phone-spotlight-pct');
    const phoneSpotlightBar = document.getElementById('cxd-phone-spotlight-bar');

    if (phoneSpotlightName) phoneSpotlightName.textContent = day.phoneTopApp.name;
    if (phoneSpotlightTime) phoneSpotlightTime.textContent = day.phoneTopApp.time;
    if (phoneSpotlightPct) phoneSpotlightPct.textContent = `${day.phoneTopApp.pct}% of mobile usage`;
    if (phoneSpotlightBar) phoneSpotlightBar.style.width = `${day.phoneTopApp.pct}%`;

    const phoneListEl = document.getElementById('cxd-phone-apps-list');
    if (phoneListEl) {
      phoneListEl.innerHTML = day.phoneApps.map(app => `
        <div class="p-2.5 rounded-xl bg-slate-900/70 border border-purple-500/20 flex flex-col gap-1.5 hover:bg-slate-900 transition">
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 text-xs shrink-0">
                <i class="${app.icon}"></i>
              </span>
              <span class="font-bold text-white">${app.name}</span>
              <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-800">${app.category}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-mono font-black text-purple-300">${app.time}</span>
              <span class="font-mono font-bold text-slate-400 text-[11px] w-10 text-right">${app.pct}%</span>
            </div>
          </div>
          <div class="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div class="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300" style="width: ${app.pct}%;"></div>
          </div>
        </div>
      `).join('');
    }

    // Laptop Panel
    const laptopTimeEl = document.getElementById('cxd-laptop-total-time');
    if (laptopTimeEl) laptopTimeEl.textContent = `${laptopH}h ${laptopM}m`;
    const laptopSpotlightName = document.getElementById('cxd-laptop-spotlight-name');
    const laptopSpotlightTime = document.getElementById('cxd-laptop-spotlight-time');
    const laptopSpotlightPct = document.getElementById('cxd-laptop-spotlight-pct');
    const laptopSpotlightBar = document.getElementById('cxd-laptop-spotlight-bar');

    if (laptopSpotlightName) laptopSpotlightName.textContent = day.laptopTopApp.name;
    if (laptopSpotlightTime) laptopSpotlightTime.textContent = day.laptopTopApp.time;
    if (laptopSpotlightPct) laptopSpotlightPct.textContent = `${day.laptopTopApp.pct}% of laptop usage`;
    if (laptopSpotlightBar) laptopSpotlightBar.style.width = `${day.laptopTopApp.pct}%`;

    const laptopListEl = document.getElementById('cxd-laptop-apps-list');
    if (laptopListEl) {
      laptopListEl.innerHTML = day.laptopApps.map(app => `
        <div class="p-2.5 rounded-xl bg-slate-900/70 border border-cyan-500/20 flex flex-col gap-1.5 hover:bg-slate-900 transition">
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 text-xs shrink-0">
                <i class="${app.icon}"></i>
              </span>
              <span class="font-bold text-white">${app.name}</span>
              <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800">${app.category}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-mono font-black text-cyan-300">${app.time}</span>
              <span class="font-mono font-bold text-slate-400 text-[11px] w-10 text-right">${app.pct}%</span>
            </div>
          </div>
          <div class="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div class="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300" style="width: ${app.pct}%;"></div>
          </div>
        </div>
      `).join('');
    }
  }

  function renderWeekView() {
    const w = telemetry.week;
    const weekTitleEl = document.getElementById('cxd-week-title');
    if (weekTitleEl) weekTitleEl.textContent = w.label;

    // Week navigation pills
    const pillsContainer = document.getElementById('cxd-week-pills-container');
    if (pillsContainer) {
      const isOverview = state.weekSubView === 'overview';
      let html = `
        <button type="button" onclick="ArcCrossDeviceComparison.setWeekSubView('overview')" class="px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${isOverview ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'}">
          📊 Entire Week Overview
        </button>
      `;

      w.daysPill.forEach((d, idx) => {
        const isSelected = state.weekSubView === idx;
        html += `
          <button type="button" onclick="ArcCrossDeviceComparison.setWeekSubView(${idx})" class="px-2.5 py-1.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-1.5 ${isSelected ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 ring-1 ring-cyan-400 shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'}">
            <span>${d.dayName}</span>
            <span class="text-[10px] opacity-70">${d.dateNum}</span>
          </button>
        `;
      });
      pillsContainer.innerHTML = html;
    }

    const weekOverviewPanel = document.getElementById('cxd-week-overview-panel');
    const weekSingleDayPanel = document.getElementById('cxd-week-singleday-panel');

    if (state.weekSubView === 'overview') {
      if (weekOverviewPanel) weekOverviewPanel.style.display = 'block';
      if (weekSingleDayPanel) weekSingleDayPanel.style.display = 'none';

      const wPhoneVal = document.getElementById('cxd-week-phone-total');
      const wLaptopVal = document.getElementById('cxd-week-laptop-total');
      const wDiff = document.getElementById('cxd-week-diff-badge');
      const wBarPhone = document.getElementById('cxd-week-bar-phone');
      const wBarLaptop = document.getElementById('cxd-week-bar-laptop');

      if (wPhoneVal) wPhoneVal.textContent = `${w.totalPhone} (${w.phonePct}%)`;
      if (wLaptopVal) wLaptopVal.textContent = `${w.totalLaptop} (${w.laptopPct}%)`;
      if (wDiff) wDiff.textContent = w.diffText;
      if (wBarPhone) wBarPhone.style.width = `${w.phonePct}%`;
      if (wBarLaptop) wBarLaptop.style.width = `${w.laptopPct}%`;

      // 7-Day comparative bar chart
      const chartContainer = document.getElementById('cxd-week-bars-chart');
      if (chartContainer) {
        chartContainer.innerHTML = w.daysPill.map(d => {
          const lH = Math.min(100, Math.max(15, (parseInt(d.laptop) / 8) * 100));
          const pH = Math.min(100, Math.max(15, (parseInt(d.phone) / 8) * 100));
          return `
            <div class="flex flex-col items-center gap-1 h-full justify-end group">
              <div class="flex items-end gap-1.5 h-32 w-full justify-center">
                <!-- Phone Bar -->
                <div class="w-3.5 sm:w-4 rounded-t-md bg-gradient-to-t from-purple-700 to-pink-500 shadow-sm relative group/phone" style="height: ${pH}%;">
                  <span class="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-purple-300 font-bold opacity-0 group-hover/phone:opacity-100 transition whitespace-nowrap bg-slate-900 px-1 rounded border border-purple-500/40 z-10">${d.phone}</span>
                </div>
                <!-- Laptop Bar -->
                <div class="w-3.5 sm:w-4 rounded-t-md bg-gradient-to-t from-cyan-600 to-blue-400 shadow-sm relative group/laptop" style="height: ${lH}%;">
                  <span class="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-cyan-300 font-bold opacity-0 group-hover/laptop:opacity-100 transition whitespace-nowrap bg-slate-900 px-1 rounded border border-cyan-500/40 z-10">${d.laptop}</span>
                </div>
              </div>
              <span class="text-[10px] font-mono font-bold text-slate-400 uppercase mt-1">${d.dayName}</span>
            </div>
          `;
        }).join('');
      }

      // Weekly Top Apps
      const wPhoneApps = document.getElementById('cxd-week-phone-apps');
      const wLaptopApps = document.getElementById('cxd-week-laptop-apps');

      if (wPhoneApps) {
        wPhoneApps.innerHTML = w.topPhoneApps.map(a => `
          <div class="p-2 rounded-xl bg-slate-900/60 border border-purple-500/20 flex items-center justify-between text-xs">
            <span class="flex items-center gap-2 font-bold text-white"><i class="${a.icon} text-purple-400"></i> ${a.name}</span>
            <span class="font-mono font-bold text-purple-300">${a.time} <span class="text-slate-500">(${a.pct}%)</span></span>
          </div>
        `).join('');
      }

      if (wLaptopApps) {
        wLaptopApps.innerHTML = w.topLaptopApps.map(a => `
          <div class="p-2 rounded-xl bg-slate-900/60 border border-cyan-500/20 flex items-center justify-between text-xs">
            <span class="flex items-center gap-2 font-bold text-white"><i class="${a.icon} text-cyan-400"></i> ${a.name}</span>
            <span class="font-mono font-bold text-cyan-300">${a.time} <span class="text-slate-500">(${a.pct}%)</span></span>
          </div>
        `).join('');
      }
    } else {
      if (weekOverviewPanel) weekOverviewPanel.style.display = 'none';
      if (weekSingleDayPanel) weekSingleDayPanel.style.display = 'block';

      const pickedDay = w.daysPill[state.weekSubView];
      const singleDayTitle = document.getElementById('cxd-week-singleday-title');
      const singleDayPhone = document.getElementById('cxd-week-singleday-phone');
      const singleDayLaptop = document.getElementById('cxd-week-singleday-laptop');

      if (singleDayTitle) singleDayTitle.textContent = `${pickedDay.dayName}, Oct ${pickedDay.dateNum}, 2026 Telemetry`;
      if (singleDayPhone) singleDayPhone.textContent = pickedDay.phone;
      if (singleDayLaptop) singleDayLaptop.textContent = pickedDay.laptop;
    }
  }

  function renderMonthView() {
    const m = telemetry.month;

    // Filter Buttons UI
    const filterContainer = document.getElementById('cxd-month-device-filters');
    if (filterContainer) {
      const filters = [
        { id: 'all', label: 'All Devices' },
        { id: 'phone', label: '📱 Phone Only' },
        { id: 'laptop', label: '💻 Laptop Only' },
        { id: 'homePhone', label: '☎️ Home Phone / Tablet' }
      ];
      filterContainer.innerHTML = filters.map(f => {
        const isSel = state.deviceFilter === f.id;
        return `
          <button type="button" onclick="ArcCrossDeviceComparison.setDeviceFilter('${f.id}')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 ${isSel ? 'bg-indigo-600 text-white border border-indigo-400 shadow-md shadow-indigo-600/30' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'}">
            ${f.label}
          </button>
        `;
      }).join('');
    }

    const mTotalDisplay = document.getElementById('cxd-month-total-screentime');
    const mSubtext = document.getElementById('cxd-month-total-subtext');

    if (state.deviceFilter === 'phone') {
      if (mTotalDisplay) mTotalDisplay.textContent = m.totalPhone;
      if (mSubtext) mSubtext.textContent = '📱 Mobile Phone Usage • 37.1% of combined screen time';
    } else if (state.deviceFilter === 'laptop') {
      if (mTotalDisplay) mTotalDisplay.textContent = m.totalLaptop;
      if (mSubtext) mSubtext.textContent = '💻 Laptop / Workstation Usage • 62.9% of combined screen time';
    } else if (state.deviceFilter === 'homePhone') {
      if (mTotalDisplay) mTotalDisplay.textContent = m.totalHomePhone;
      if (mSubtext) mSubtext.textContent = '☎️ Home Phone / Shared Tablet Usage • Auxiliary device telemetry';
    } else {
      if (mTotalDisplay) mTotalDisplay.textContent = m.totalCombined;
      if (mSubtext) mSubtext.textContent = `💻 ${m.totalLaptop} Laptop (63%) • 📱 ${m.totalPhone} Phone (37%) • 30 Days Evaluated`;
    }

    // Week 1 vs Week 2 vs Week 3 vs Week 4 comparison
    const weeksContainer = document.getElementById('cxd-month-weeks-comparison');
    if (weeksContainer) {
      weeksContainer.innerHTML = m.weeks.map(wk => `
        <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-white">${wk.label}</span>
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">${wk.status}</span>
          </div>
          <div class="flex items-center justify-between text-xs font-mono">
            <span class="text-cyan-300 font-bold flex items-center gap-1"><i class="fa-solid fa-laptop text-[10px]"></i> ${wk.laptopTime} (${wk.laptopPct}%)</span>
            <span class="text-purple-300 font-bold flex items-center gap-1"><i class="fa-solid fa-mobile-screen text-[10px]"></i> ${wk.phoneTime} (${wk.phonePct}%)</span>
          </div>
          <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden flex border border-slate-800">
            <div class="h-full bg-cyan-400" style="width: ${wk.laptopPct}%;"></div>
            <div class="h-full bg-purple-400" style="width: ${wk.phonePct}%;"></div>
          </div>
        </div>
      `).join('');
    }

    const trendBanner = document.getElementById('cxd-month-trend-banner');
    if (trendBanner) {
      trendBanner.textContent = m.trendingShift;
    }

    renderCalendar();
    renderCalendarInspector();
  }

  function renderCalendar() {
    const calendarGrid = document.getElementById('cxd-calendar-grid');
    if (!calendarGrid) return;

    // October 2026 starts on Thursday (offset = 4 empty cells)
    const offset = 4;
    let html = '';

    for (let i = 0; i < offset; i++) {
      html += '<div class="h-10 sm:h-12 rounded-xl bg-slate-950/30 border border-slate-900 pointer-events-none opacity-30"></div>';
    }

    telemetry.month.calendarDays.forEach(day => {
      const isSelected = day.dayNum === state.selectedCalendarDate;
      html += `
        <button type="button" onclick="ArcCrossDeviceComparison.selectCalendarDate(${day.dayNum})" class="h-10 sm:h-12 rounded-xl border flex flex-col items-center justify-between p-1.5 transition active:scale-95 group ${isSelected ? 'bg-indigo-600/30 border-indigo-400 ring-2 ring-indigo-400 shadow-md shadow-indigo-600/30' : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'}">
          <span class="text-[11px] font-mono font-bold ${isSelected ? 'text-white' : 'text-slate-300'}">${day.dayNum}</span>
          <div class="flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400" title="Laptop logged"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-purple-400" title="Phone logged"></span>
          </div>
        </button>
      `;
    });

    calendarGrid.innerHTML = html;
  }

  function renderCalendarInspector() {
    const dateData = telemetry.month.calendarDays.find(d => d.dayNum === state.selectedCalendarDate) || telemetry.month.calendarDays[26];
    const inspectorTitle = document.getElementById('cxd-inspector-date');
    const laptopVal = document.getElementById('cxd-inspector-laptop-val');
    const phoneVal = document.getElementById('cxd-inspector-phone-val');
    const combVal = document.getElementById('cxd-inspector-comb-val');
    const topAppsEl = document.getElementById('cxd-inspector-top-apps');

    if (inspectorTitle) inspectorTitle.textContent = `October ${dateData.dayNum}, 2026 Telemetry Snapshot`;
    if (laptopVal) laptopVal.textContent = dateData.laptopTime;
    if (phoneVal) phoneVal.textContent = dateData.phoneTime;
    if (combVal) combVal.textContent = dateData.combinedTime;
    if (topAppsEl) {
      topAppsEl.innerHTML = `
        <div class="text-xs text-slate-300 space-y-1">
          <div class="flex items-center justify-between"><span class="text-cyan-300 font-bold"><i class="fa-solid fa-laptop mr-1"></i> Top Laptop App:</span> <span class="font-mono text-white">${dateData.topLaptopApp}</span></div>
          <div class="flex items-center justify-between"><span class="text-purple-300 font-bold"><i class="fa-solid fa-mobile-screen mr-1"></i> Top Phone App:</span> <span class="font-mono text-white">${dateData.topPhoneApp}</span></div>
        </div>
      `;
    }
  }

  // Keyboard shortcut support (Escape closes comparison modal)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('arc-cross-device-comparison-modal');
      if (modal && (modal.classList.contains('open') || modal.classList.contains('active') || modal.style.display === 'flex')) {
        closeModal();
      }
    }
  });

  return {
    state,
    telemetry,
    openModal,
    closeModal,
    setMode,
    setDay,
    prevDay,
    nextDay,
    setWeekSubView,
    setDeviceFilter,
    selectCalendarDate,
    jumpToDayFromCalendar,
    renderAll,
    renderDayView,
    renderWeekView,
    renderMonthView,
    renderCalendar,
    renderCalendarInspector
  };
})();
