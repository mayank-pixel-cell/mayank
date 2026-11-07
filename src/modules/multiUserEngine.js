const REGISTRY_KEY = "__arc_users_registry_v1";
const ACTIVE_USER_KEY = "__arc_active_user_id";
const LAUNCH_PICKER_KEY = "__arc_show_picker_on_launch";

const AVATAR_GRADIENTS = [
  "from-cyan-500 to-indigo-600",
  "from-amber-500 to-orange-600",
  "from-purple-500 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-red-600",
  "from-blue-500 to-violet-600"
];

class ArcMultiUserEngine {
  constructor() {
    this.registry = [];
  }

  getRegistry() {
    try {
      const store = window.ArcStorage || window.localStorage;
      const raw = store.getItem(REGISTRY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.registry = parsed;
          return this.registry;
        }
      }
    } catch (_) {}

    // Seed primary user from existing profile
    let existingProfile = { displayName: "Operative", username: "operative", title: "Shadow Initiate" };
    try {
      const rawProf = localStorage.getItem("arc_user_profile");
      if (rawProf) existingProfile = Object.assign(existingProfile, JSON.parse(rawProf));
    } catch (_) {}

    const primary = {
      id: "usr_primary",
      displayName: existingProfile.displayName || "Operative",
      username: (existingProfile.username || "operative").replace(/^@+/, ""),
      title: existingProfile.title || "Shadow Initiate",
      avatar: (existingProfile.displayName || "O").charAt(0).toUpperCase(),
      gradient: AVATAR_GRADIENTS[0],
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      isPrimary: true
    };

    this.registry = [primary];
    this.saveRegistry();
    return this.registry;
  }

  saveRegistry() {
    try {
      const json = JSON.stringify(this.registry);
      if (window.ArcStorage) window.ArcStorage.setItem(REGISTRY_KEY, json);
      localStorage.setItem(REGISTRY_KEY, json);
    } catch (e) {
      console.warn("[ArcMultiUser] Failed to save registry:", e);
    }
  }

  getActiveUserId() {
    if (window.ArcStorage && typeof window.ArcStorage.getActiveUserId === "function") {
      return window.ArcStorage.getActiveUserId();
    }
    return localStorage.getItem(ACTIVE_USER_KEY) || "usr_primary";
  }

  getActiveUser() {
    const reg = this.getRegistry();
    const uid = this.getActiveUserId();
    return reg.find((u) => u.id === uid) || reg[0];
  }

  syncActiveUserSummary() {
    const reg = this.getRegistry();
    const uid = this.getActiveUserId();
    const entry = reg.find((u) => u.id === uid);
    if (!entry) return;

    try {
      const profRaw = localStorage.getItem("arc_user_profile");
      if (profRaw) {
        const p = JSON.parse(profRaw);
        if (p.displayName) entry.displayName = p.displayName;
        if (p.username) entry.username = p.username.replace(/^@+/, "");
        if (p.title) entry.title = p.title;
        entry.avatar = (entry.displayName || "O").charAt(0).toUpperCase();
      }
      if (window.state) {
        entry.streak = Number(window.state.streak) || 0;
        entry.level = Number(window.state.level) || 1;
        entry.currentArc = window.state.currentArc || "winter";
      }
      entry.hasPin = !!localStorage.getItem("arc_sec_pin_hash");
      entry.lastActiveAt = Date.now();
      this.saveRegistry();
    } catch (_) {}
  }

  isShowPickerOnLaunch() {
    const raw = localStorage.getItem(LAUNCH_PICKER_KEY);
    return raw === null ? true : raw === "true";
  }

  setShowPickerOnLaunch(enabled) {
    const val = enabled ? "true" : "false";
    localStorage.setItem(LAUNCH_PICKER_KEY, val);
    if (window.ArcStorage) window.ArcStorage.setItem(LAUNCH_PICKER_KEY, val);
  }

  openSwitcherModal() {
    this.syncActiveUserSummary();
    this.renderModal();
    const modal = document.getElementById("arc-multiuser-modal");
    if (!modal) return;
    modal.style.display = "flex";
    void modal.offsetWidth;
    modal.classList.add("open");
    if (typeof window.playSfx === "function") window.playSfx("modalOpen");
  }

  closeSwitcherModal() {
    const modal = document.getElementById("arc-multiuser-modal");
    if (!modal) return;
    modal.classList.remove("open");
    setTimeout(() => {
      if (!modal.classList.contains("open")) modal.style.display = "none";
    }, 320);
    if (typeof window.playSfx === "function") window.playSfx("modalClose");
  }

  toggleCreateForm(show) {
    const form = document.getElementById("arc-multiuser-create-form");
    const btn = document.getElementById("btn-mu-open-create");
    const err = document.getElementById("mu-create-err");
    if (err) err.textContent = "";
    if (form) form.classList.toggle("hidden", !show);
    if (btn) btn.classList.toggle("hidden", !!show);
    if (show) {
      const nameIn = document.getElementById("mu-new-name");
      if (nameIn) {
        nameIn.value = "";
        setTimeout(() => nameIn.focus(), 80);
      }
      const handleIn = document.getElementById("mu-new-handle");
      if (handleIn) handleIn.value = "";
      const pinIn = document.getElementById("mu-new-pin");
      if (pinIn) pinIn.value = "";
    }
  }

  async createNewOperative() {
    const nameIn = document.getElementById("mu-new-name");
    const handleIn = document.getElementById("mu-new-handle");
    const arcIn = document.getElementById("mu-new-arc");
    const pinIn = document.getElementById("mu-new-pin");
    const err = document.getElementById("mu-create-err");
    if (err) err.textContent = "";

    const displayName = (nameIn ? nameIn.value : "").trim();
    let username = (handleIn ? handleIn.value : "").trim().toLowerCase().replace(/^@+/, "");
    const startingArc = (arcIn ? arcIn.value : "winter") || "winter";
    const rawPin = (pinIn ? pinIn.value : "").trim();

    if (!displayName || displayName.length < 2) {
      if (err) err.textContent = "Display name must be at least 2 characters.";
      return;
    }
    if (!username) {
      username = displayName.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 16) || "operative";
    }
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      if (err) err.textContent = "Handle must be 3–20 letters, numbers, or underscores.";
      return;
    }
    if (rawPin && rawPin.length < 4) {
      if (err) err.textContent = "Optional Security PIN must be at least 4 characters.";
      return;
    }

    const reg = this.getRegistry();
    if (reg.some((u) => u.username.toLowerCase() === username)) {
      if (err) err.textContent = `Handle @${username} is already taken on this device.`;
      return;
    }

    let randSuffix = '';
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      randSuffix = crypto.randomUUID().replace(/-/g, '').slice(0, 6);
    } else if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      const b = new Uint8Array(4);
      crypto.getRandomValues(b);
      randSuffix = Array.from(b, x => x.toString(16).padStart(2, '0')).join('').slice(0, 6);
    } else {
      randSuffix = Date.now().toString(36).slice(-4);
    }
    const newUserId = "usr_" + Date.now().toString(36) + "_" + randSuffix;
    const gradient = AVATAR_GRADIENTS[reg.length % AVATAR_GRADIENTS.length];

    const newOperative = {
      id: newUserId,
      displayName,
      username,
      title: "Shadow Initiate",
      avatar: displayName.charAt(0).toUpperCase(),
      gradient,
      streak: 0,
      level: 1,
      currentArc: startingArc,
      hasPin: !!rawPin,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      isPrimary: false
    };

    reg.push(newOperative);
    this.saveRegistry();

    // Seed initial profile and state into the new user's partition
    const initialProfile = {
      displayName,
      username,
      title: "Shadow Initiate",
      motto: "Transform in Silence.",
      email: `${username}@winterarc.local`,
      avatar: newOperative.avatar,
      pfpRingStyle: "gold",
      pfpRingColor: "#F59E0B",
      isCustomized: true,
      updatedAt: new Date().toISOString()
    };

    const initialHabits = typeof window.DEFAULT_HABITS !== "undefined"
      ? JSON.parse(JSON.stringify(window.DEFAULT_HABITS))
      : [
          { id: "1", name: "Workout or 10k Steps", category: "Physical", weight: 2, completed: false },
          { id: "2", name: "Clean Eating", category: "Physical", weight: 2, completed: false },
          { id: "3", name: "Sleep/Wake Schedule (7-8 hrs)", category: "Discipline", weight: 3, completed: false },
          { id: "4", name: "Read 10+ Pages Non-Fiction", category: "Mindset", weight: 1, completed: false },
          { id: "5", name: "2 Hours Deep Focus Lock-In", category: "Productivity", weight: 3, completed: false },
          { id: "6", name: "Zero Mindless Social Media Scrolling", category: "Discipline", weight: 2, completed: false }
        ];

    const initialState = {
      currentArc: startingArc,
      habits: initialHabits,
      activeTab: "tracker",
      streak: 0,
      level: 1,
      xp: 0,
      dailyHabits: {},
      dailyFocus: {},
      laptop: { isAutoPaused: false, isRunning: true, totalSeconds: 0, interval: null },
      timer: { totalFocusSeconds: 0 }
    };

    if (window.ArcStorage) {
      window.ArcStorage.memCache.set(`u:${newUserId}:arc_user_profile`, JSON.stringify(initialProfile));
      window.ArcStorage.memCache.set(`u:${newUserId}:arc_tracker_state`, JSON.stringify(initialState));
      window.ArcStorage.memCache.set(`u:${newUserId}:arc_terms_accepted_v1`, JSON.stringify({ accepted: true, version: "2026.1", timestamp: Date.now() }));
      window.ArcStorage.dirtyKeys.add(`u:${newUserId}:arc_user_profile`);
      window.ArcStorage.dirtyKeys.add(`u:${newUserId}:arc_tracker_state`);
      window.ArcStorage.dirtyKeys.add(`u:${newUserId}:arc_terms_accepted_v1`);
    }

    // Switch to the new user partition and optionally set PIN
    await this.switchUser(newUserId, rawPin);
  }

  async switchUser(targetUserId, initialPinToSet = null) {
    if (!targetUserId) return;
    this.syncActiveUserSummary();

    if (window.ArcStorage && typeof window.ArcStorage.switchUserPartition === "function") {
      await window.ArcStorage.switchUserPartition(targetUserId);
    } else {
      localStorage.setItem(ACTIVE_USER_KEY, targetUserId);
    }

    if (initialPinToSet && window.ArcSecurity && typeof window.ArcSecurity.setPin === "function") {
      try {
        await window.ArcSecurity.setPin(initialPinToSet);
      } catch (_) {}
    }

    // Perform clean reload so all singleton timers, Web Audio nodes, and state caches reset for the new operative
    sessionStorage.setItem("__arc_just_switched_user", targetUserId);
    window.location.reload();
  }

  async deleteOperative(userId, event) {
    if (event) event.stopPropagation();
    const reg = this.getRegistry();
    const target = reg.find((u) => u.id === userId);
    if (!target) return;

    if (target.isPrimary || reg.length <= 1) {
      if (typeof window.showToast === "function") {
        window.showToast("⚠️ The primary operative account cannot be deleted.");
      }
      return;
    }

    const ok = confirm(
      `Delete operative profile "${target.displayName} (@${target.username})"?\n\nAll habits, streaks, reflections, and screen time logs for this operative will be permanently erased.`
    );
    if (!ok) return;

    this.registry = reg.filter((u) => u.id !== userId);
    this.saveRegistry();

    if (window.ArcStorage && typeof window.ArcStorage.purgeUserPartition === "function") {
      await window.ArcStorage.purgeUserPartition(userId);
    }

    if (this.getActiveUserId() === userId) {
      await this.switchUser("usr_primary");
    } else {
      this.renderModal();
      this.updateHeaderBadge();
      if (typeof window.showToast === "function") {
        window.showToast(`🗑️ Deleted operative profile @${target.username}`);
      }
    }
  }

  renderModal() {
    const grid = document.getElementById("arc-multiuser-grid");
    const countBadge = document.getElementById("arc-multiuser-count-badge");
    const chk = document.getElementById("mu-show-on-launch-chk");
    if (!grid) return;

    const reg = this.getRegistry();
    const activeId = this.getActiveUserId();

    if (countBadge) {
      countBadge.textContent = `${reg.length} ${reg.length === 1 ? "Operative" : "Operatives"}`;
    }
    if (chk) {
      chk.checked = this.isShowPickerOnLaunch();
    }

    grid.innerHTML = reg
      .map((u) => {
        const isCurrent = u.id === activeId;
        const arcBadge =
          u.currentArc === "summer"
            ? '<span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">☀️ Summer</span>'
            : '<span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">❄️ Winter</span>';

        return `
          <div role="button" tabindex="0" onclick="ArcMultiUser.handleCardClick('${u.id}')" class="p-3.5 rounded-2xl border ${
            isCurrent
              ? "border-cyan-400 bg-cyan-950/30 shadow-[0_0_20px_rgba(0,240,255,0.2)]"
              : "border-slate-800 bg-slate-900/75 hover:border-slate-600"
          } flex items-center justify-between gap-3 cursor-pointer transition group">
            <div class="flex items-center gap-3 min-w-0">
              <div class="relative w-11 h-11 rounded-full bg-gradient-to-tr ${
                u.gradient || "from-cyan-500 to-indigo-600"
              } text-white font-black text-base grid place-items-center shrink-0 shadow-md border border-white/20">
                ${u.avatar || "O"}
                ${
                  isCurrent
                    ? '<span class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950" title="Active"></span>'
                    : ""
                }
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="font-extrabold text-xs sm:text-sm text-white truncate">${u.displayName}</span>
                  ${
                    isCurrent
                      ? '<span class="text-[8px] font-mono font-black px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">ACTIVE</span>'
                      : ""
                  }
                  ${u.hasPin ? '<i class="fa-solid fa-lock text-[10px] text-amber-400" title="PIN Protected"></i>' : ""}
                </div>
                <div class="text-[11px] font-mono text-cyan-400 truncate">@${u.username}</div>
                <div class="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-400">
                  <span>Lv.${u.level || 1}</span>
                  <span>•</span>
                  <span>🔥 ${u.streak || 0}d</span>
                  ${arcBadge}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              ${
                !u.isPrimary
                  ? `<button type="button" onclick="ArcMultiUser.deleteOperative('${u.id}', event)" class="w-7 h-7 rounded-lg bg-slate-950 hover:bg-rose-950 text-slate-500 hover:text-rose-400 grid place-items-center transition border border-slate-800" title="Delete Operative">
                      <i class="fa-solid fa-trash-can text-[11px]"></i>
                    </button>`
                  : ""
              }
            </div>
          </div>
        `;
      })
      .join("");
  }

  handleCardClick(userId) {
    if (userId === this.getActiveUserId()) {
      this.closeSwitcherModal();
      return;
    }
    this.switchUser(userId);
  }

  updateHeaderBadge() {
    const reg = this.getRegistry();
    const active = this.getActiveUser();
    const switcherBtn = document.getElementById("btn-header-switch-user");
    const switcherLabel = document.getElementById("header-switch-user-label");
    if (switcherBtn && active) {
      switcherBtn.title = `Active Operative: ${active.displayName} (@${active.username}) • Click to Switch or Add User (${reg.length} profiles)`;
    }
    if (switcherLabel && active) {
      switcherLabel.textContent = `@${active.username}`;
    }
  }

  init() {
    this.syncActiveUserSummary();
    this.updateHeaderBadge();

    // Hook into ArcProfile.saveProfile so profile edits sync into MultiUser registry
    if (window.ArcProfile && typeof window.ArcProfile.saveProfile === "function") {
      const origSave = window.ArcProfile.saveProfile;
      window.ArcProfile.saveProfile = (...args) => {
        const res = origSave.apply(window.ArcProfile, args);
        this.syncActiveUserSummary();
        this.updateHeaderBadge();
        return res;
      };
    }

    const justSwitched = sessionStorage.getItem("__arc_just_switched_user");
    if (justSwitched) {
      sessionStorage.removeItem("__arc_just_switched_user");
      const active = this.getActiveUser();
      if (active && typeof window.showToast === "function") {
        setTimeout(() => {
          window.showToast(`👤 Switched to Operative: ${active.displayName} (@${active.username})`);
        }, 450);
      }
      return;
    }

    // Show "Who's Locking In?" picker on launch if >1 user exists and enabled
    if (
      this.getRegistry().length > 1 &&
      this.isShowPickerOnLaunch() &&
      !sessionStorage.getItem("__arc_launch_picker_shown")
    ) {
      sessionStorage.setItem("__arc_launch_picker_shown", "true");
      setTimeout(() => this.openSwitcherModal(), 350);
    }
  }
}

const arcMultiUser = new ArcMultiUserEngine();
if (typeof window !== "undefined") {
  window.ArcMultiUser = arcMultiUser;
}
export default arcMultiUser;
