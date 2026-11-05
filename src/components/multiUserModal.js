export function renderMultiUserModal() {
  return `
    <!-- MULTI-USER OPERATIVE SWITCHER & LAUNCH SELECTOR MODAL -->
    <div id="arc-multiuser-modal" class="pp-modal z-[145]" role="dialog" aria-modal="true" aria-label="Select or Switch Operative Profile" onclick="if(event.target===this)ArcMultiUser.closeSwitcherModal()">
      <div class="pp-box max-w-xl w-full p-5 sm:p-7 rounded-3xl bg-slate-950/98 border-2 border-cyan-500/50 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_40px_rgba(0,240,255,0.2)] space-y-5 backdrop-blur-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-slate-950 flex items-center justify-center font-black text-lg shadow-lg shadow-cyan-500/25">
              <i class="fa-solid fa-users text-white"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base sm:text-lg font-black text-white tracking-wide">Who's Locking In?</h3>
                <span id="arc-multiuser-count-badge" class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">1 Operative</span>
              </div>
              <p class="text-xs text-slate-400">Each operative has an isolated habit vault, streak, XP level, and PIN lock.</p>
            </div>
          </div>
          <button type="button" onclick="ArcMultiUser.closeSwitcherModal()" class="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white grid place-items-center transition" aria-label="Close User Switcher">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Operatives Grid -->
        <div id="arc-multiuser-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[46vh] overflow-y-auto pr-1 custom-scroll">
          <!-- Populated dynamically by ArcMultiUser.renderModal() -->
        </div>

        <!-- Create New Operative Form (Collapsible) -->
        <div id="arc-multiuser-create-form" class="hidden p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/40 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-user-plus"></i> New Operative Profile
            </span>
            <button type="button" onclick="ArcMultiUser.toggleCreateForm(false)" class="text-xs text-slate-400 hover:text-white">Cancel</button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label for="mu-new-name" class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Display Name</label>
              <input id="mu-new-name" type="text" maxlength="28" placeholder="e.g. Alex Rivera" class="pp-in w-full text-xs font-semibold focus:border-cyan-400">
            </div>
            <div>
              <label for="mu-new-handle" class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Handle (@)</label>
              <input id="mu-new-handle" type="text" maxlength="20" placeholder="alex_arc" class="pp-in w-full text-xs font-mono focus:border-cyan-400">
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label for="mu-new-arc" class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Starting Season</label>
              <select id="mu-new-arc" class="pp-in w-full text-xs">
                <option value="winter">❄️ Winter Arc (Oct - Dec)</option>
                <option value="summer">☀️ Summer Arc (Apr - Jul)</option>
              </select>
            </div>
            <div>
              <label for="mu-new-pin" class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Optional Security PIN</label>
              <input id="mu-new-pin" type="password" maxlength="32" placeholder="Leave blank for none" class="pp-in w-full text-xs font-mono focus:border-cyan-400">
            </div>
          </div>
          <p id="mu-create-err" class="text-xs text-rose-400 font-mono min-h-[1rem]"></p>
          <button type="button" onclick="ArcMultiUser.createNewOperative()" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition active:scale-95">
            <i class="fa-solid fa-bolt mr-1"></i> Create &amp; Switch to Operative
          </button>
        </div>

        <!-- Footer Controls -->
        <div class="pt-3 border-t border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <label class="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
            <input type="checkbox" id="mu-show-on-launch-chk" onchange="ArcMultiUser.setShowPickerOnLaunch(this.checked)" class="accent-cyan-400 rounded w-4 h-4">
            <span class="text-[11px]">Ask "Who's Locking In?" on app launch when multiple users exist</span>
          </label>
          <div class="flex items-center gap-2 shrink-0">
            <button type="button" id="btn-mu-open-create" onclick="ArcMultiUser.toggleCreateForm(true)" class="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-extrabold text-xs flex items-center gap-1.5 transition active:scale-95">
              <i class="fa-solid fa-user-plus"></i>
              <span>Add Operative</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
