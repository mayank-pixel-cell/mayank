/**
 * Arc Tracker - Terms and Conditions & First-Time Onboarding Engine
 * Protocol: v2026.2 // Local Data Sovereignty, Multi-User Governance & Covenant of Discipline
 */

const TERMS_KEY = 'arc_terms_accepted_v1';
const TERMS_TIMESTAMP_KEY = 'arc_terms_accepted_at';
const TERMS_VERSION = 'v2026.2';

export const arcTermsOnboarding = {
  isAccepted() {
    try {
      return localStorage.getItem(TERMS_KEY) === 'true';
    } catch (_) {
      return false;
    }
  },

  getAcceptedDate() {
    try {
      const ts = localStorage.getItem(TERMS_TIMESTAMP_KEY);
      if (!ts) return null;
      const d = new Date(ts);
      return isNaN(d.getTime()) ? null : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (_) {
      return null;
    }
  },

  openSignupModal() {
    const modal = document.getElementById('arc-terms-signup-modal');
    if (!modal) return;

    // Pre-populate with current profile if available
    let currentProfile = { displayName: 'Operative', username: 'operative', motto: 'Transform in Silence.' };
    if (window.ArcProfile && typeof window.ArcProfile.getProfile === 'function') {
      currentProfile = window.ArcProfile.getProfile();
    }

    const nameIn = document.getElementById('terms-signup-name');
    const handleIn = document.getElementById('terms-signup-handle');
    const mottoIn = document.getElementById('terms-signup-motto');
    const cb = document.getElementById('arc-terms-checkbox');
    const err = document.getElementById('arc-terms-error-msg');

    if (nameIn) nameIn.value = currentProfile.displayName || 'Operative';
    if (handleIn) handleIn.value = currentProfile.username || 'operative';
    if (mottoIn) mottoIn.value = currentProfile.motto || 'Transform in Silence.';
    if (cb) cb.checked = false;
    if (err) err.textContent = '';

    modal.classList.add('open');
    if (window.playSfx) window.playSfx('modalOpen');
    if (nameIn) setTimeout(() => nameIn.focus(), 200);
  },

  closeSignupModal() {
    const modal = document.getElementById('arc-terms-signup-modal');
    if (modal) modal.classList.remove('open');
    if (window.playSfx) window.playSfx('modalClose');
  },

  openTermsReader() {
    const modal = document.getElementById('arc-terms-reader-modal');
    if (!modal) return;
    this.updateReaderStatus();
    modal.classList.add('open');
    if (window.playSfx) window.playSfx('modalOpen');
  },

  closeTermsReader() {
    const modal = document.getElementById('arc-terms-reader-modal');
    if (modal) modal.classList.remove('open');
    if (window.playSfx) window.playSfx('modalClose');
  },

  handleCheckboxChange(checkbox) {
    const err = document.getElementById('arc-terms-error-msg');
    if (checkbox && checkbox.checked && err) {
      err.textContent = '';
    }
  },

  acceptAndRegister() {
    const cb = document.getElementById('arc-terms-checkbox');
    const err = document.getElementById('arc-terms-error-msg');

    if (!cb || !cb.checked) {
      if (err) {
        err.textContent = '⚠️ You must review and check the box to accept the Terms and Conditions before entering.';
      }
      if (typeof window.playSfx === 'function') window.playSfx('error');
      if (typeof window.showToast === 'function') {
        window.showToast('⚠️ Please accept the Terms and Conditions to complete sign-up.');
      }
      if (cb) cb.focus();
      return false;
    }

    // Capture and validate profile inputs
    const nameIn = document.getElementById('terms-signup-name');
    const handleIn = document.getElementById('terms-signup-handle');
    const mottoIn = document.getElementById('terms-signup-motto');

    let displayName = nameIn ? nameIn.value.trim() : 'Operative';
    let handle = handleIn ? handleIn.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') : 'operative';
    let motto = mottoIn ? mottoIn.value.trim() : 'Transform in Silence.';

    if (!displayName) displayName = 'Operative';
    if (!handle) handle = 'operative';
    if (!motto) motto = 'Transform in Silence.';

    // Save profile via ArcProfile
    try {
      if (window.ArcProfile && typeof window.ArcProfile.getProfile === 'function') {
        const cur = window.ArcProfile.getProfile();
        const updated = {
          ...cur,
          displayName: displayName,
          username: handle,
          motto: motto,
          avatar: displayName.charAt(0).toUpperCase() || 'O',
          isCustomized: true
        };
        localStorage.setItem('arc_user_profile', JSON.stringify(updated));
        if (typeof window.ArcProfile.renderHeaderProfile === 'function') {
          window.ArcProfile.renderHeaderProfile();
        }
      }
    } catch (e) {
      console.warn('[ArcTermsOnboarding] Profile sync notice:', e);
    }

    // Mark terms as officially accepted
    try {
      localStorage.setItem(TERMS_KEY, 'true');
      localStorage.setItem(TERMS_TIMESTAMP_KEY, new Date().toISOString());
      localStorage.setItem('arc_terms_version', TERMS_VERSION);
    } catch (_) {}

    this.closeSignupModal();
    this.updateStatusPills();

    if (typeof window.playSfx === 'function') window.playSfx('victory');
    if (typeof window.showToast === 'function') {
      window.showToast(`🎉 Welcome, ${displayName} (@${handle})! Terms accepted & Operative identity initialized.`);
    }

    // Trigger notification into notification center if present
    if (window.ArcNotifications) {
      if (typeof window.ArcNotifications.notify === 'function') {
        window.ArcNotifications.notify({
          title: '📜 Covenant of Discipline Accepted',
          message: `You have successfully agreed to the Arc Tracker Terms & Conditions (v2026.2). Welcome to the protocol, Operative @${handle}.`,
          category: 'Governance',
          icon: 'fa-solid fa-file-contract'
        });
      } else if (typeof window.ArcNotifications.addNotification === 'function') {
        window.ArcNotifications.addNotification({
          title: '📜 Covenant of Discipline Accepted',
          desc: `You have successfully agreed to the Arc Tracker Terms & Conditions (v2026.2). Welcome to the protocol, Operative @${handle}.`,
          category: 'Governance'
        });
      }
    }

    return true;
  },

  updateReaderStatus() {
    const statusEl = document.getElementById('arc-terms-reader-status');
    if (!statusEl) return;
    const isAcc = this.isAccepted();
    const dateStr = this.getAcceptedDate();
    if (isAcc) {
      statusEl.className = 'text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1.5';
      statusEl.innerHTML = `<i class="fa-solid fa-check"></i> Accepted on ${dateStr || 'Initial Setup'} (v2026.2)`;
    } else {
      statusEl.className = 'text-[11px] font-mono text-amber-400 font-bold flex items-center gap-1.5';
      statusEl.innerHTML = `<i class="fa-solid fa-clock"></i> Acceptance Pending`;
    }
  },

  updateStatusPills() {
    const isAcc = this.isAccepted();
    const dateStr = this.getAcceptedDate();

    // 1. Settings tab status pill
    const settingsPill = document.getElementById('settings-terms-status-pill');
    if (settingsPill) {
      if (isAcc) {
        settingsPill.className = 'px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold uppercase';
        settingsPill.textContent = `✓ TERMS ACCEPTED (${dateStr || 'ACTIVE'})`;
      } else {
        settingsPill.className = 'px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold uppercase';
        settingsPill.textContent = 'PENDING AGREEMENT';
      }
    }

    // 2. Profile setup modal status pill
    const profileStatus = document.getElementById('arc-profile-terms-status');
    if (profileStatus) {
      if (isAcc) {
        profileStatus.className = 'text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1';
        profileStatus.innerHTML = `<i class="fa-solid fa-check"></i> Accepted (${dateStr || 'v2026.2'})`;
      } else {
        profileStatus.className = 'text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1';
        profileStatus.innerHTML = `<i class="fa-solid fa-clock"></i> Not Yet Accepted`;
      }
    }

    this.updateReaderStatus();
  },

  checkFirstTimeOnboarding() {
    // Check if terms have been accepted; if not, initiate first-time sign-up flow
    if (!this.isAccepted()) {
      console.log('[ArcTermsOnboarding] First-time sign-up detected. Launching Terms & Conditions gate...');
      setTimeout(() => {
        // Do not interrupt if another security PIN modal is open
        const pinModal = document.getElementById('pp-sec-pin-modal');
        if (pinModal && pinModal.classList.contains('open')) return;
        this.openSignupModal();
      }, 500);
    } else {
      console.log('[ArcTermsOnboarding] Terms and conditions previously accepted.');
    }
  },

  init() {
    this.updateStatusPills();
    this.checkFirstTimeOnboarding();
  }
};

// Expose globally for inline DOM click handlers
if (typeof window !== 'undefined') {
  window.ArcTermsOnboarding = arcTermsOnboarding;
}
