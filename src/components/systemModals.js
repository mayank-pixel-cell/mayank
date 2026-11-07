export function renderSystemModals() {
  return `<div id="pp12-live" class="pp-sr" aria-live="polite" role="status"></div>
<canvas id="pp12-fx" aria-hidden="true"></canvas>
<div id="pp12-back"></div>
<aside id="pp12-drawer" role="dialog" aria-modal="true" aria-label="Settings" aria-hidden="true" class="backdrop-blur-md">
  <div class="flex items-center justify-between p-4 pb-2"><h2 class="font-black text-lg"><i class="fa-solid fa-gear"></i> Settings</h2><button role="button" class="pp-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="pp-close" aria-label="Close settings">✕</button></div>
  <div class="px-4"><input id="settings-search" class="pp-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" type="search" placeholder="Search settings…" aria-label="Search settings"></div>
  <div id="pp-tabs" role="tablist" aria-label="Settings categories" class="flex gap-1.5 p-4 pb-2 overflow-x-auto">
    <button class="pp-tab shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" role="tab" aria-controls="pp-body" data-t="audio">[ Audio &amp; Synth ]</button>
    <button class="pp-tab shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" role="tab" aria-controls="pp-body" data-t="vis">[ Visuals &amp; Themes ]</button>
    <button class="pp-tab shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" role="tab" aria-controls="pp-body" data-t="habit">[ Habit Engine ]</button>
    <button class="pp-tab shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" role="tab" aria-controls="pp-body" data-t="focus">[ Focus &amp; Time ]</button>
    <button class="pp-tab shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" role="tab" aria-controls="pp-body" data-t="account">[ 👤 Accounts &amp; Sync ]</button>
    <button class="pp-tab shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" role="tab" aria-controls="pp-body" data-t="sys">[ System &amp; Data ]</button>
    <button class="pp-tab shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" role="tab" aria-controls="pp-body" data-t="sec">[ 🛡️ Security Sentinel ]</button>
  </div>
  <div id="pp-body" class="flex-1 overflow-y-auto px-4 pb-6"></div>
</aside>
<button class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" role="button" id="pp12-hud" aria-label="Pause or resume focus timer"><i class="fa-solid fa-bullseye"></i><span id="pp-hud-t">25:00</span><small id="pp-hud-m">FOCUS</small></button>
<div id="pp-keys" class="pp-modal" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts"><div class="pp-box"><h3>Keyboard Shortcuts</h3>
  <div class="space-y-2"><div><kbd>S</kbd> Open / close settings</div><div><kbd>M</kbd> Toggle global mute</div><div><kbd>A</kbd> Cycle heavenly body soundscapes</div><div><kbd>P</kbd> Play / pause focus timer</div><div><kbd>◀</kbd> / <kbd>▶</kbd> Switch day on calendar</div><div><kbd>?</kbd> This shortcut guide</div><div><kbd>Esc</kbd> Close all modals, overlays and drawers</div></div>
  <button role="button" class="pp-btn mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-close>Close</button></div></div>
<div id="pp-imp" class="pp-modal" role="dialog" aria-modal="true" aria-label="Import backup"><div class="pp-box"><h3>Import Backup</h3><p id="pp-imp-info" class="mb-3"></p>
  <div class="grid grid-cols-2 gap-2"><button role="button" class="pp-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="pp-imp-merge">Merge Data</button><button role="button" class="pp-btn text-rose-400 border-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="pp-imp-over">Overwrite Current State</button><button role="button" class="pp-btn col-span-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-close>Cancel</button></div></div></div>
<div id="pp-rst" class="pp-modal" role="dialog" aria-modal="true" aria-label="Factory reset"><div class="pp-box"><h3 class="text-rose-400">Factory Reset</h3>
  <p class="mb-3">This permanently erases all habits, history, settings and snapshots stored in this browser. Type <b>RESET</b> to confirm.</p>
  <input id="pp-rst-in" class="pp-in mb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" autocomplete="off" placeholder="Type RESET" aria-label="Type RESET to confirm">
  <div class="grid grid-cols-2 gap-2"><button role="button" class="pp-btn text-rose-400 border-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="pp-rst-go" disabled>Erase Everything</button><button role="button" class="pp-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-close>Cancel</button></div></div></div>

<!-- Threat Quarantine Modal -->
<div id="pp-sec-quarantine" class="pp-modal" role="dialog" aria-modal="true" aria-label="Malware threat detected in backup">
  <div class="pp-box border-rose-500/40">
    <div class="flex items-center gap-2 text-rose-400 font-extrabold text-base mb-2">
      <i class="fa-solid fa-triangle-exclamation text-xl"></i>
      <h3>Security Alert: Threats Intercepted</h3>
    </div>
    <p class="text-xs text-slate-300 mb-2">The Antivirus Sentinel intercepted potentially malicious payloads or exploit vectors in this backup file:</p>
    <div id="sec-quarantine-list" class="p-2.5 rounded-lg bg-black/70 border border-rose-500/30 text-rose-300 font-mono text-[11px] max-h-36 overflow-y-auto space-y-1 mb-3"></div>
    <p class="text-[11px] text-slate-400 mb-3">To protect your device and privacy, unverified executable code and script tags are quarantined.</p>
    <div class="grid grid-cols-2 gap-2">
      <button role="button" class="pp-btn text-cyan-300 border-cyan-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="btn-sec-sanitize-import">Sanitize &amp; Import</button>
      <button role="button" class="pp-btn text-rose-400 border-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-close>Reject &amp; Discard</button>
    </div>
  </div>
</div>

<!-- ==========================================================================
     PHONE APPLICATION LINKING MODAL (PAIRING & REDIRECT DESTINATION)
     ========================================================================== -->
<!-- ==========================================================================
     PHONE APPLICATION LINKING MODAL (PAIRING & REDIRECT DESTINATION)
     ========================================================================== -->
<div id="arc-phone-linking-modal" class="pp-modal" role="dialog" aria-modal="true" aria-label="Link Mobile Phone Tracker">
  <div class="relative my-auto flex flex-col max-w-2xl sm:max-w-3xl w-full max-h-[92vh] overflow-y-auto glass-card rounded-3xl p-5 sm:p-6 border border-purple-500/40 shadow-2xl bg-gradient-to-b from-slate-900/98 via-slate-950/98 to-purple-950/35 animate-zoom-in space-y-4">
    <div class="flex items-center justify-between border-b border-purple-500/20 pb-3">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 text-lg shadow-sm shrink-0">
          <i class="fa-solid fa-qrcode"></i>
        </div>
        <div class="min-w-0">
          <h3 class="text-base sm:text-lg font-black text-white truncate">Link Mobile Phone Tracker</h3>
          <p class="text-xs text-slate-400 truncate">Scan mega QR code • Auto-redirects to Web Browser if app isn't downloaded</p>
        </div>
      </div>
      <button type="button" onclick="ArcScreenTimeStore.closePhoneLinkPage()" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white grid place-items-center transition shrink-0" aria-label="Close phone link modal">
        <i class="fa-solid fa-xmark text-sm"></i>
      </button>
    </div>

    <!-- MAIN RESPONSIVE 2-COLUMN GRID (MEGA SCANNER + APP/WEB REDIRECT DASHBOARD) -->
    <div class="p-4 sm:p-5 rounded-2xl bg-slate-950/85 border border-slate-800 shrink-0 grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
      
      <!-- LEFT COL: THE MEGA SCANNER (320px) -->
      <div class="flex flex-col items-center justify-center space-y-3">
        <div class="flex items-center justify-between w-full max-w-[320px] px-1">
          <div id="arc-phone-user-badge" class="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono text-[10px] font-bold tracking-wider">
            OPERATIVE: USER
          </div>
          <div class="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>MEGA SCANNER (320px)</span>
          </div>
        </div>

        <!-- ENLARGED AUTHENTIC VECTOR SVG QR CODE VIEWFINDER -->
        <div class="relative mx-auto w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-2xl bg-white p-3.5 shadow-[0_0_45px_rgba(168,85,247,0.4)] flex items-center justify-center transition-all duration-300 hover:scale-[1.01] group">
          <!-- VIEWFINDER TARGET CORNERS -->
          <span class="absolute -top-1.5 -left-1.5 w-7 h-7 border-t-4 border-l-4 border-purple-500 rounded-tl-lg pointer-events-none transition-all duration-300 group-hover:scale-110"></span>
          <span class="absolute -top-1.5 -right-1.5 w-7 h-7 border-t-4 border-r-4 border-purple-500 rounded-tr-lg pointer-events-none transition-all duration-300 group-hover:scale-110"></span>
          <span class="absolute -bottom-1.5 -left-1.5 w-7 h-7 border-b-4 border-l-4 border-purple-500 rounded-bl-lg pointer-events-none transition-all duration-300 group-hover:scale-110"></span>
          <span class="absolute -bottom-1.5 -right-1.5 w-7 h-7 border-b-4 border-r-4 border-purple-500 rounded-br-lg pointer-events-none transition-all duration-300 group-hover:scale-110"></span>

          <!-- SVG QR CODE CONTAINER -->
          <div id="arc-phone-qr-container" class="w-full h-full flex items-center justify-center overflow-hidden">
            <div class="text-[11px] text-slate-700 font-mono font-bold animate-pulse">Generating QR...</div>
          </div>

          <!-- ANIMATED SCAN LASER LINE -->
          <div class="arc-qr-scan-line pointer-events-none"></div>
        </div>

        <!-- NETWORK HOST SWITCHER PILL -->
        <div class="flex items-center justify-center gap-1.5 pt-0.5 text-[10px] font-mono">
          <span class="text-slate-400">Host:</span>
          <button type="button" onclick="ArcScreenTimeStore.setPairingHost('network')" id="arc-host-btn-net" class="px-2 py-0.5 rounded-lg bg-purple-500/25 text-purple-200 border border-purple-500/40 font-bold transition">
            📱 Wi-Fi LAN (192.168.29.125)
          </button>
          <button type="button" onclick="ArcScreenTimeStore.setPairingHost('local')" id="arc-host-btn-local" class="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 font-bold transition">
            💻 Localhost
          </button>
        </div>
      </div>

      <!-- RIGHT COL: DETAILS, BROWSER REDIRECT NOTICE & ACTIONS -->
      <div class="flex flex-col space-y-3 text-left">
        <div class="space-y-1">
          <div class="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Device Pairing Security Code</div>
          <div id="arc-phone-pairing-code" class="text-base sm:text-lg font-black font-mono tracking-widest text-cyan-400 bg-slate-900 py-1.5 px-4 rounded-xl border border-slate-800 inline-block shadow-inner">
            ARC-7492-MOB
          </div>
        </div>

        <!-- HIGHLIGHT: IF APP ISN'T DOWNLOADED, REDIRECT TO WEB BROWSER -->
        <div class="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/50 via-slate-900 to-indigo-950/40 border border-cyan-500/40 space-y-2 shadow-inner">
          <div class="flex items-center gap-2 text-xs font-black text-cyan-300 uppercase tracking-wider">
            <i class="fa-solid fa-globe text-cyan-400"></i>
            <span>Web Browser Auto-Redirect</span>
          </div>
          <p class="text-[11.5px] text-slate-300 leading-relaxed font-sans">
            If the <strong>Arc Tracker app is not downloaded</strong> on your phone, scanning this QR code automatically opens and redirects to your <strong>Web Browser</strong> (Safari / Chrome).
          </p>
          <div class="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10.5px]">
            <span class="text-emerald-400 font-mono font-bold flex items-center gap-1">
              <i class="fa-solid fa-circle-check text-emerald-400"></i> No Download Needed
            </span>
            <span class="text-purple-300 font-mono font-semibold">65 Days Sync Ready</span>
          </div>
        </div>

        <!-- ACTIONS -->
        <div class="space-y-2 pt-1">
          <!-- COPY LINK & TEST SCAN BUTTONS -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button type="button" onclick="ArcScreenTimeStore.copyPairingLink()" class="py-2.5 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 font-bold text-[11px] flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm" title="Copy redirect link to send via messaging">
              <i class="fa-solid fa-copy text-purple-300"></i>
              <span>Copy Web Link</span>
            </button>

            <button type="button" onclick="ArcScreenTimeStore.simulatePhoneLink('web_browser')" class="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-[11px] flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm" title="Simulate scanning when app is not downloaded">
              <i class="fa-solid fa-globe text-cyan-400"></i>
              <span>Simulate Browser Scan</span>
            </button>
          </div>

          <!-- 1-CLICK PRESET LINK BUTTON -->
          <button type="button" onclick="ArcScreenTimeStore.connectDemoPhone('📱 Pixel 9 Pro (Android)'); playSfx('victory')" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition">
            <i class="fa-solid fa-mobile-screen-button"></i> 1-Click Link Phone (Pixel 9 Pro)
          </button>

          <div class="pt-1 flex items-center justify-between text-xs">
            <button type="button" onclick="ArcScreenTimeStore.disconnectPhone(); playSfx('click')" class="text-slate-400 hover:text-rose-400 transition font-mono text-[11px] flex items-center gap-1.5">
              <i class="fa-solid fa-triangle-exclamation text-amber-400 text-[10px]"></i>
              <span>Disconnect / Unlink Phone</span>
            </button>
            <button type="button" onclick="ArcScreenTimeStore.closePhoneLinkPage()" class="text-slate-400 hover:text-white transition font-mono text-[11px]">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ==========================================================================
     CONFIRM MOBILE DEVICE LINKING & SCREEN TIME DATA TRANSFER MODAL
     ========================================================================== -->
<div id="arc-confirm-pairing-modal" class="pp-modal" role="dialog" aria-modal="true" aria-label="Confirm Device Pairing">
  <div class="relative my-auto flex flex-col max-w-md w-full glass-card rounded-3xl p-5 sm:p-7 border border-emerald-500/40 shadow-2xl bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-emerald-950/30 animate-zoom-in space-y-4">
    <div class="flex items-center justify-between border-b border-emerald-500/20 pb-3">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-lg shadow-sm shrink-0">
          <i class="fa-solid fa-link"></i>
        </div>
        <div class="min-w-0">
          <h3 class="text-base sm:text-lg font-black text-white truncate">Confirm Device Link</h3>
          <p class="text-xs text-slate-400 truncate">Incoming pairing request from primary device</p>
        </div>
      </div>
      <button type="button" onclick="ArcScreenTimeStore.closeConfirmModal()" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white grid place-items-center transition shrink-0" aria-label="Close confirmation modal">
        <i class="fa-solid fa-xmark text-sm"></i>
      </button>
    </div>

    <!-- WEB BROWSER REDIRECT BANNER (SHOWN WHEN APP IS NOT DOWNLOADED) -->
    <div id="arc-confirm-browser-banner" class="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-[11.5px] text-cyan-200 leading-relaxed flex items-start gap-2.5">
      <i class="fa-solid fa-globe text-cyan-400 mt-0.5 text-sm shrink-0"></i>
      <div>
        <div class="font-bold text-white flex items-center gap-2">
          <span>Redirected to Web Browser</span>
          <span class="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[9px] font-bold">APP NOT DOWNLOADED</span>
        </div>
        <p class="text-[11px] text-slate-300 mt-0.5">
          Arc Tracker is not installed on this device. You were redirected to your mobile web browser. All screen-time telemetry and 65 days of past data will transfer directly into this browser!
        </p>
      </div>
    </div>

    <div class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
      <div class="flex items-center justify-between text-xs pb-2 border-b border-slate-800/80">
        <span class="text-slate-400 font-mono">Primary Operative:</span>
        <span id="arc-confirm-operative-name" class="font-extrabold text-white"></span>
      </div>
      <div class="flex items-center justify-between text-xs pb-2 border-b border-slate-800/80">
        <span class="text-slate-400 font-mono">Pairing Security Code:</span>
        <span id="arc-confirm-pairing-code" class="font-mono font-bold text-cyan-400 bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800"></span>
      </div>
      <div class="flex items-center justify-between text-xs pb-2 border-b border-slate-800/80">
        <span class="text-slate-400 font-mono">Platform / Environment:</span>
        <span id="arc-confirm-device-source" class="font-medium text-cyan-300 flex items-center gap-1">
          <i class="fa-solid fa-globe text-cyan-400"></i> Mobile Web Browser (Redirected)
        </span>
      </div>
      <div class="flex items-center justify-between text-xs">
        <span class="text-slate-400 font-mono">Historical Telemetry:</span>
        <span id="arc-confirm-telemetry-badge" class="font-bold text-emerald-400 flex items-center gap-1">
          <i class="fa-solid fa-database text-[10px]"></i> 65 Days of History Ready
        </span>
      </div>
    </div>

    <!-- OPTIONAL NATIVE APP DOWNLOAD CTA -->
    <button type="button" onclick="ArcScreenTimeStore.downloadMobileApp()" class="w-full py-2.5 px-3 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-200 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer">
      <i class="fa-solid fa-download text-purple-400"></i>
      <span>Download Native App / Add to Home Screen</span>
    </button>

    <!-- ACTION BUTTONS -->
    <div class="space-y-2 pt-1">
      <button type="button" onclick="ArcScreenTimeStore.executeConfirmLink()" class="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition cursor-pointer">
        <i class="fa-solid fa-circle-check text-sm"></i>
        <span id="arc-confirm-btn-label">Confirm &amp; Transfer Screen Time to Web Browser</span>
      </button>

      <button type="button" onclick="ArcScreenTimeStore.closeConfirmModal()" class="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-400 hover:text-white font-bold text-xs transition cursor-pointer">
        Cancel / Reject
      </button>
    </div>
  </div>
</div>

<!-- ==========================================================================
     DISCONNECT DEVICE WARNING & DATA DELETION CONFIRMATION MODAL
     ========================================================================== -->
<div id="arc-disconnect-warning-modal" class="pp-modal" role="dialog" aria-modal="true" aria-label="Disconnect Device & Delete Data Warning">
  <div class="relative my-auto flex flex-col max-w-md w-full glass-card rounded-3xl p-5 sm:p-7 border border-rose-500/50 shadow-2xl bg-gradient-to-b from-slate-900/98 via-slate-950/98 to-rose-950/40 animate-zoom-in space-y-4">
    <!-- PROMINENT WARNING SIGN -->
    <div class="text-center space-y-2 pt-1">
      <div class="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 via-rose-500/25 to-red-600/30 border-2 border-rose-500/60 flex items-center justify-center text-rose-400 text-3xl shadow-[0_0_35px_rgba(244,63,94,0.45)]">
        <i class="fa-solid fa-triangle-exclamation text-rose-400 text-3xl drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]"></i>
        <span class="absolute -top-1 -right-1 flex h-4 w-4">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border border-slate-900"></span>
        </span>
      </div>
      <div class="space-y-1">
        <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono text-[10px] font-bold tracking-widest uppercase">
          <i class="fa-solid fa-triangle-exclamation text-rose-400"></i> Warning: Permanent Action
        </div>
        <h3 class="text-lg sm:text-xl font-black text-white tracking-tight">Disconnect &amp; Delete All Data?</h3>
        <p class="text-xs text-slate-400 leading-relaxed">
          Disconnecting this device will permanently delete all synchronized information and purge screen-time data.
        </p>
      </div>
    </div>

    <!-- PURGE AUDIT BREAKDOWN -->
    <div class="p-3.5 sm:p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-2.5 text-left shadow-inner">
      <div class="text-[11px] font-black text-rose-200 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-rose-500/25">
        <i class="fa-solid fa-trash-can text-rose-400"></i>
        <span>Data To Be Permanently Erased:</span>
      </div>
      <ul class="text-[11.5px] text-slate-300 space-y-2">
        <li class="flex items-start gap-2 leading-tight">
          <i class="fa-solid fa-circle-xmark text-rose-400 mt-0.5 shrink-0 text-xs"></i>
          <span><strong class="text-white font-semibold">All Mobile Screen-Time:</strong> Active and recorded phone session counters will be reset to 00h 00m 00s.</span>
        </li>
        <li class="flex items-start gap-2 leading-tight">
          <i class="fa-solid fa-circle-xmark text-rose-400 mt-0.5 shrink-0 text-xs"></i>
          <span><strong class="text-white font-semibold">65-Day Mobile History &amp; App Logs:</strong> All phone records for YouTube, Instagram, WhatsApp, etc. will be completely deleted.</span>
        </li>
        <li class="flex items-start gap-2 leading-tight">
          <i class="fa-solid fa-circle-xmark text-rose-400 mt-0.5 shrink-0 text-xs"></i>
          <span><strong class="text-white font-semibold">Pairing Codes &amp; Session Keys:</strong> All active synchronization channels and tokens will be revoked immediately.</span>
        </li>
        <li class="flex items-start gap-2 leading-tight text-emerald-300/90 pt-1 border-t border-rose-500/20">
          <i class="fa-solid fa-shield-check text-emerald-400 mt-0.5 shrink-0 text-xs"></i>
          <span class="text-[11px]">Desktop/laptop focus sessions, rules, and local habits will remain safe and unaffected.</span>
        </li>
      </ul>
    </div>

    <!-- ACTION BUTTONS -->
    <div class="space-y-2 pt-1">
      <button type="button" onclick="ArcScreenTimeStore.executeDisconnectAndPurge()" class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-600/40 border border-rose-400/50 transition cursor-pointer">
        <i class="fa-solid fa-trash-can text-sm"></i>
        <span>Delete All Data &amp; Disconnect</span>
      </button>

      <button type="button" onclick="ArcScreenTimeStore.closeDisconnectModal()" class="w-full py-2.5 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white font-bold text-xs transition border border-slate-700/80 cursor-pointer">
        Keep Device Connected (Cancel)
      </button>
    </div>
  </div>
</div>

<!-- ==========================================================================
     SHARE SCREEN TIME WITH FRIENDS MODAL
     ========================================================================== -->
<div id="arc-screentime-share-modal" class="pp-modal" role="dialog" aria-modal="true" aria-label="Share Screen Time With Friends">
  <div class="relative my-auto flex flex-col max-w-lg w-full glass-card rounded-3xl p-5 sm:p-7 border border-cyan-500/40 shadow-2xl bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-cyan-950/30 animate-zoom-in space-y-5">
    <div class="flex items-center justify-between border-b border-cyan-500/20 pb-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-lg shadow-sm">
          <i class="fa-solid fa-share-nodes"></i>
        </div>
        <div>
          <h3 class="text-base sm:text-lg font-black text-white">Share Screen Time With Friends</h3>
          <p class="text-xs text-slate-400">Export verified discipline card &amp; cross-device telemetry</p>
        </div>
      </div>
      <button type="button" onclick="ArcScreenTimeStore.closeShareModal()" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white grid place-items-center transition">
        <i class="fa-solid fa-xmark text-sm"></i>
      </button>
    </div>

    <!-- SOCIAL REPORT PREVIEW CARD -->
    <div class="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-3 font-mono text-xs text-slate-300 relative overflow-hidden shadow-inner" id="st-share-preview-card">
      <div class="flex items-center justify-between border-b border-slate-800 pb-2">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-black text-[10px] flex items-center justify-center border border-cyan-400/40" id="st-share-avatar">
            M
          </div>
          <span class="font-bold text-white" id="st-share-name">Mayank (@operative)</span>
        </div>
        <span class="text-[9px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
          ARC VERIFIED
        </span>
      </div>

      <div class="grid grid-cols-3 gap-2 py-1 text-center">
        <div class="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
          <span class="text-[9px] text-slate-400 uppercase block">Laptop</span>
          <span class="font-bold text-cyan-300 text-sm" id="st-share-laptop-time">--</span>
        </div>
        <div class="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
          <span class="text-[9px] text-slate-400 uppercase block">Phone</span>
          <span class="font-bold text-purple-300 text-sm" id="st-share-phone-time">--</span>
        </div>
        <div class="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
          <span class="text-[9px] text-slate-400 uppercase block">Combined</span>
          <span class="font-bold text-white text-sm" id="st-share-combined-time">--</span>
        </div>
      </div>

      <div class="space-y-1 text-[11px] pt-1 border-t border-slate-800">
        <div class="flex justify-between">
          <span class="text-slate-400">Weekly Total:</span>
          <span class="font-bold text-white" id="st-share-weekly-total">--</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">Top Focus Asset:</span>
          <span class="font-bold text-cyan-400" id="st-share-top-app">--</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">Sub-4hr Status:</span>
          <span class="font-bold text-emerald-400" id="st-share-discipline-badge">Digital Ascetic (&lt;4h/day)</span>
        </div>
      </div>
    </div>

    <!-- SHARE ACTIONS -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      <button type="button" onclick="ArcScreenTimeStore.copyShareReport(); playSfx('fanfare')" class="py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-cyan-500/25 transition">
        <i class="fa-solid fa-copy"></i> Copy Report Text
      </button>

      <button type="button" onclick="ArcScreenTimeStore.shareViaNavigator()" class="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-cyan-300 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition">
        <i class="fa-solid fa-arrow-up-right-from-square"></i> Share via Device Apps
      </button>
    </div>
  </div>
</div>

<!-- ==========================================================================
     LAST MONTH'S SCREEN TIME ANALYTICS & APP BREAKDOWN MODAL
     Includes Pie Chart with all apps, percentages, bar graphs & Red/Green trend
     ========================================================================== -->
<div id="arc-last-month-modal" class="pp-modal" role="dialog" aria-modal="true" aria-label="Last Month's Screen Time Analytics">
  <div class="arc-last-month-fullscreen-wrap w-screen h-screen flex flex-col bg-slate-950 text-white overflow-hidden animate-zoom-in">
    <!-- TOP FULL-WIDTH NAVBAR -->
    <div class="shrink-0 px-4 sm:px-8 py-3.5 border-b border-purple-500/20 bg-slate-950/90 backdrop-blur-xl flex items-center justify-between z-20 shadow-lg shadow-black/40">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 text-xl shadow-lg shadow-purple-500/20 shrink-0">
          <i class="fa-solid fa-chart-pie"></i>
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-base sm:text-xl font-black text-white tracking-tight">Last Month's Screen Time Analytics</h3>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold uppercase tracking-wider">30-Day Deep Dive</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase tracking-wider hidden sm:inline-flex items-center gap-1">
              <i class="fa-solid fa-expand text-[9px]"></i> Full-Screen Dashboard
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5 hidden sm:block">Comprehensive 30-day cross-device telemetry, app percentages pie chart, weekly progression, and month-over-month trend</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button type="button" onclick="ArcScreenTimeStore.toggleLastMonthTrendDemo()" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[11px] font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95" title="Test Red vs Green trend state">
          <i class="fa-solid fa-arrows-split-up-and-left text-cyan-400"></i>
          <span class="hidden md:inline">Toggle Trend Demo</span>
        </button>
        <button type="button" onclick="ArcScreenTimeStore.forceDailyRefresh(); playSfx('click')" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95" title="Recalculate today's counter">
          <i class="fa-solid fa-rotate text-emerald-400"></i>
          <span class="hidden md:inline">Refresh Data</span>
        </button>
        <button type="button" onclick="ArcScreenTimeStore.closeLastMonthModal()" class="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/30 transition active:scale-95" title="Exit Fullscreen (Esc)">
          <i class="fa-solid fa-xmark text-sm"></i>
          <span>Close</span>
          <span class="text-[9px] font-mono opacity-60 hidden lg:inline bg-black/30 px-1.5 py-0.5 rounded">ESC</span>
        </button>
      </div>
    </div>

    <!-- MAIN SCROLLABLE DASHBOARD VIEWPORT -->
    <div class="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-8 lg:px-12 py-6 space-y-6 max-w-7xl mx-auto w-full">
      <!-- 1. TOP METRICS ROW -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Card -->
        <div class="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner flex flex-col justify-between space-y-2">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-clock text-amber-400"></i> Total Monthly Screen Time
          </span>
          <div class="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight" id="lm-total-screentime">--</div>
          <p class="text-xs text-slate-400" id="lm-total-subtext">Calculating telemetry...</p>
        </div>

        <!-- Daily Average Card -->
        <div class="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner flex flex-col justify-between space-y-2">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-calendar-day text-cyan-400"></i> Daily Average
          </span>
          <div class="text-3xl sm:text-4xl font-black font-mono text-cyan-300 tracking-tight" id="lm-daily-avg">2h 45m</div>
          <p class="text-xs text-slate-400">Target: &lt;4h per day &bull; Healthy Cadence</p>
        </div>

        <!-- Cross-Device Distribution -->
        <div onclick="ArcCrossDeviceComparison.openModal(); playSfx('modalOpen')" class="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/60 shadow-inner flex flex-col justify-between space-y-2 cursor-pointer group transition" title="Tap to compare screen time and app usage between Phone and Laptop">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-laptop text-purple-400"></i> Cross-Device Balance
            </span>
            <span class="text-[9px] font-mono font-bold text-indigo-300 group-hover:text-indigo-200 group-hover:translate-x-0.5 transition flex items-center gap-0.5">
              Compare &rarr;
            </span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-xl font-black font-mono text-cyan-300">63%</span>
            <span class="text-xs text-slate-400">Laptop</span>
            <span class="text-slate-600">&bull;</span>
            <span class="text-xl font-black font-mono text-purple-300">37%</span>
            <span class="text-xs text-slate-400">Phone</span>
          </div>
          <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden flex border border-slate-800 mt-1 group-hover:ring-1 group-hover:ring-indigo-500/50 transition">
            <div class="h-full bg-cyan-400 w-[63%]"></div>
            <div class="h-full bg-purple-400 w-[37%]"></div>
          </div>
        </div>

        <!-- Evaluation Period -->
        <div class="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner flex flex-col justify-between space-y-2">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-shield-halved text-emerald-400"></i> Audit Trajectory
          </span>
          <div class="text-lg font-black text-white flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            30 Days Verified
          </div>
          <p class="text-xs text-slate-400">Full 30-day baseline comparison locked in</p>
        </div>
      </div>

      <!-- 2. MONTH-OVER-MONTH TREND ALERT BANNER (RED IF INCREASED, GREEN IF DECREASED) -->
      <div id="lm-trend-banner" class="p-4 sm:p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 shadow-md flex items-center justify-between gap-3">
        <!-- Rendered dynamically -->
      </div>

      <!-- 3. APP USAGE BREAKDOWN: DONUT PIE CHART & FULL APP LIST (RESPONSIVE GRID) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <!-- Left: Donut / Pie Chart SVG (Col 5) -->
        <div class="lg:col-span-5 p-6 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center justify-between shadow-inner">
          <div class="w-full flex items-center justify-between border-b border-slate-800/80 pb-3 mb-2">
            <h4 class="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
              <i class="fa-solid fa-chart-pie text-cyan-400"></i> Interactive App Pie Chart
            </h4>
            <span class="text-[10px] font-mono text-slate-400">Hover slices to inspect</span>
          </div>

          <div class="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-4">
            <svg id="lm-pie-svg" viewBox="0 0 200 200" class="w-full h-full filter drop-shadow-[0_0_16px_rgba(168,85,247,0.3)]">
              <!-- Slices rendered dynamically -->
            </svg>
            <div id="lm-donut-center" class="absolute text-center pointer-events-none px-2">
              <div class="text-[10px] font-mono text-slate-400 uppercase tracking-widest truncate" id="lm-donut-sub">TOTAL LAST MONTH</div>
              <div class="text-xl sm:text-2xl font-black font-mono text-white tracking-tight" id="lm-donut-val">--</div>
              <div class="text-[10px] font-mono text-purple-300 truncate" id="lm-donut-foot">30 Days Combined</div>
            </div>
          </div>

          <div class="w-full text-center border-t border-slate-800/80 pt-3">
            <p class="text-xs text-slate-400 font-mono">Interactive SVG Donut &bull; Every tracked application included</p>
          </div>
        </div>

        <!-- Right: App Breakdown List with Percentages (Col 7) -->
        <div class="lg:col-span-7 p-6 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between shadow-inner">
          <div class="w-full flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
            <h4 class="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
              <i class="fa-solid fa-list-check text-purple-400"></i> All Tracked Applications &amp; Percentages
            </h4>
            <span class="text-[10px] font-mono text-slate-400">Full Monthly Breakdown</span>
          </div>

          <!-- App Percentages List (Every App Included) -->
          <div class="space-y-2.5 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar" id="lm-apps-breakdown-list">
            <!-- Populated dynamically -->
          </div>

          <div class="w-full flex items-center justify-between text-[11px] text-slate-500 font-mono border-t border-slate-800/80 pt-3 mt-3">
            <span>Hovering slices highlights duration &amp; percent contribution</span>
            <span class="text-emerald-400 font-bold">&check; 100% Accounted</span>
          </div>
        </div>
      </div>

      <!-- 4. BAR GRAPHS: WEEKLY PROGRESSION & TOP APPS COMPARISON -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Weekly Progression Bar Graph -->
        <div class="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 shadow-inner">
          <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h5 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <i class="fa-solid fa-chart-simple text-purple-400"></i> Weekly Screen Time Progression
            </h5>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">4-Week Rhythm</span>
          </div>
          <div class="grid grid-cols-4 gap-3 items-end h-40 pt-2" id="lm-weekly-bars-container">
            <!-- Weekly bars rendered dynamically -->
          </div>
        </div>

        <!-- Top Apps Comparative Bar Graph -->
        <div class="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 shadow-inner">
          <div class="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h5 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <i class="fa-solid fa-bars-staggered text-cyan-400"></i> Top Apps Comparison Ranking
            </h5>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold">Duration Ranking</span>
          </div>
          <div class="space-y-3 pt-1" id="lm-top-apps-bars">
            <!-- Top app comparison bars rendered dynamically -->
          </div>
        </div>
      </div>
    </div>

    <!-- BOTTOM FULL-WIDTH STATUS BAR -->
    <div class="shrink-0 px-4 sm:px-8 py-3 border-t border-slate-800 bg-slate-950/90 backdrop-blur-md flex items-center justify-between text-xs shadow-lg">
      <div class="flex items-center gap-2 text-slate-400 font-mono">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Everyday Automatic Refresh: <b class="text-white">Active</b></span>
      </div>
      <div class="hidden md:flex items-center gap-2 text-[11px] text-slate-500 font-mono">
        <span>Cross-device historical telemetry synchronized</span>
        <span>&bull;</span>
        <span>Press <kbd class="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">ESC</kbd> to exit full-screen</span>
      </div>
      <div class="flex items-center gap-2">
        <button type="button" onclick="ArcScreenTimeStore.forceDailyRefresh(); playSfx('click')" class="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95">
          <i class="fa-solid fa-rotate text-emerald-400"></i> Refresh Counter
        </button>
        <button type="button" onclick="ArcScreenTimeStore.closeLastMonthModal()" class="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition active:scale-95">
          Done
        </button>
      </div>
    </div>
  </div>
</div>

<!-- ==========================================================================
     CROSS-DEVICE SCREEN TIME & APP USAGE COMPARISON MODAL (PHONE VS LAPTOP)
     Modes: Day, Week, Month (with interactive calendar, week comparison & trending)
     ========================================================================== -->
<div id="arc-cross-device-comparison-modal" class="pp-modal" role="dialog" aria-modal="true" aria-label="Cross-Device Phone vs. Laptop Comparison" onclick="if(event.target===this)ArcCrossDeviceComparison.closeModal()">
  <div class="arc-cross-device-wrap w-screen h-screen flex flex-col bg-slate-950 text-white overflow-hidden animate-zoom-in">
    <!-- TOP FULL-WIDTH NAVBAR -->
    <div class="shrink-0 px-4 sm:px-8 py-3.5 border-b border-indigo-500/20 bg-slate-950/90 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 z-20 shadow-lg shadow-black/40">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 text-xl shadow-lg shadow-indigo-500/20 shrink-0">
          <i class="fa-solid fa-code-compare"></i>
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-base sm:text-xl font-black text-white tracking-tight">Cross-Device Screen Time &amp; App Usage</h3>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold uppercase tracking-wider">Dual-Device Telemetry</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase tracking-wider hidden sm:inline-flex items-center gap-1">
              <i class="fa-solid fa-laptop text-[9px]"></i> Laptop vs. <i class="fa-solid fa-mobile-screen text-[9px]"></i> Phone
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5 hidden sm:block">Side-by-side app usage breakdown, duration hierarchy, and cross-platform screen time trends.</p>
        </div>
      </div>

      <!-- CENTER / MODES SWITCHER -->
      <div class="flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800 shadow-inner gap-1">
        <button id="cxd-btn-mode-day" type="button" onclick="ArcCrossDeviceComparison.setMode('day')" class="px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition active:scale-95 text-white bg-gradient-to-r from-indigo-600 to-purple-600 border border-indigo-400 shadow-md shadow-indigo-600/30">
          ☀️ Day
        </button>
        <button id="cxd-btn-mode-week" type="button" onclick="ArcCrossDeviceComparison.setMode('week')" class="px-3.5 py-1.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition active:scale-95 text-slate-400 hover:text-white bg-slate-900 border border-slate-800">
          📅 Week
        </button>
        <button id="cxd-btn-mode-month" type="button" onclick="ArcCrossDeviceComparison.setMode('month')" class="px-3.5 py-1.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition active:scale-95 text-slate-400 hover:text-white bg-slate-900 border border-slate-800">
          🗓️ Month
        </button>
      </div>

      <!-- RIGHT ACTIONS & DEVICE FILTER -->
      <div class="flex items-center gap-2">
        <div class="hidden md:flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
          <span class="text-[10px] text-slate-400 font-mono uppercase">Filter:</span>
          <select id="cxd-device-select" onchange="ArcCrossDeviceComparison.setDeviceFilter(this.value)" class="bg-transparent text-slate-200 text-xs font-bold focus:outline-none cursor-pointer">
            <option value="all" class="bg-slate-900 text-white">All Devices</option>
            <option value="phone" class="bg-slate-900 text-white">📱 Phone Only</option>
            <option value="laptop" class="bg-slate-900 text-white">💻 Laptop Only</option>
            <option value="homePhone" class="bg-slate-900 text-white">☎️ Home Phone / Tablet</option>
          </select>
        </div>

        <button type="button" onclick="ArcCrossDeviceComparison.closeModal()" class="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/30 transition active:scale-95" title="Exit Fullscreen (Esc)">
          <i class="fa-solid fa-xmark text-sm"></i>
          <span>Close</span>
          <span class="text-[9px] font-mono opacity-60 hidden lg:inline bg-black/30 px-1.5 py-0.5 rounded">ESC</span>
        </button>
      </div>
    </div>

    <!-- MAIN SCROLLABLE DASHBOARD VIEWPORT -->
    <div class="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-8 lg:px-12 py-6 space-y-6 max-w-7xl mx-auto w-full">
      <!-- ==========================================
           1. DAY MODE SUBVIEW
           ========================================== -->
      <div id="cxd-view-day" class="space-y-6">
        <!-- Day Navigation Bar -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner">
          <div class="flex items-center gap-2">
            <button id="cxd-day-prev-btn" type="button" onclick="ArcCrossDeviceComparison.prevDay()" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1 active:scale-95 disabled:opacity-30 disabled:pointer-events-none">
              <i class="fa-solid fa-chevron-left"></i> Previous Day
            </button>
            <button id="cxd-day-next-btn" type="button" onclick="ArcCrossDeviceComparison.nextDay()" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1 active:scale-95 disabled:opacity-30 disabled:pointer-events-none">
              Next Day <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>

          <div class="text-center">
            <span class="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Day Telemetry Inspector</span>
            <h4 class="text-sm sm:text-base font-black text-white" id="cxd-day-title">Tuesday, Oct 27, 2026</h4>
          </div>

          <div class="flex items-center gap-1.5">
            <button type="button" onclick="ArcCrossDeviceComparison.setDay(0)" class="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[11px] font-bold transition active:scale-95">
              Today
            </button>
            <button type="button" onclick="ArcCrossDeviceComparison.setDay(1)" class="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 text-[11px] font-bold transition active:scale-95">
              Yesterday
            </button>
          </div>
        </div>

        <!-- Head-to-Head Split Summary Card -->
        <div class="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-950/90 to-cyan-950/40 border border-indigo-500/30 shadow-xl space-y-3">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <span class="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold block">📱 Phone Screen Time</span>
              <div class="text-2xl sm:text-3xl font-black font-mono text-purple-300" id="cxd-day-sum-phone-val">4h 18m (44%)</div>
            </div>

            <div id="cxd-day-diff-badge" class="px-3.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-xs font-mono font-black flex items-center gap-1.5 shadow-sm">
              <i class="fa-solid fa-laptop text-cyan-400"></i> LAPTOP HIGHER (+1h 14m)
            </div>

            <div class="text-center sm:text-right">
              <span class="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">💻 Laptop Screen Time</span>
              <div class="text-2xl sm:text-3xl font-black font-mono text-cyan-300" id="cxd-day-sum-laptop-val">5h 32m (56%)</div>
            </div>
          </div>

          <!-- Dual-color comparative progress bar -->
          <div class="w-full bg-slate-900 h-3 rounded-full overflow-hidden flex border border-slate-800 p-0.5">
            <div id="cxd-day-bar-phone" class="h-full rounded-l-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 w-[44%] shadow-sm"></div>
            <div id="cxd-day-bar-laptop" class="h-full rounded-r-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 w-[56%] shadow-sm"></div>
          </div>
        </div>

        <!-- 2-COLUMN SPLIT VIEW: PHONE VS LAPTOP -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <!-- LEFT: 📱 MOBILE PHONE PANEL -->
          <div class="p-6 rounded-2xl bg-slate-950/80 border-2 border-purple-500/40 shadow-xl shadow-purple-950/20 space-y-4">
            <div class="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 text-lg shadow-sm">
                  <i class="fa-solid fa-mobile-screen-button"></i>
                </div>
                <div>
                  <h4 class="text-base font-black text-white flex items-center gap-2">
                    Mobile Phone
                    <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase font-bold">Android 15</span>
                  </h4>
                  <span class="text-xs text-purple-300/80">Pixel 9 Pro &bull; Linked Tracker</span>
                </div>
              </div>
              <div class="text-right">
                <span class="text-xl sm:text-2xl font-black font-mono text-purple-300 block" id="cxd-phone-total-time">4h 18m</span>
                <span class="text-[10px] text-slate-400 font-mono uppercase">Daily Phone Time</span>
              </div>
            </div>

            <!-- Spotlight: #1 Top Mobile App (Instagram) -->
            <div class="p-4 rounded-xl bg-gradient-to-br from-purple-950/60 via-slate-900 to-pink-950/40 border border-purple-500/40 space-y-2 shadow-inner">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-pink-300 flex items-center gap-1.5">
                  <i class="fa-solid fa-crown text-amber-400"></i> #1 Top Mobile App Today
                </span>
                <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 font-bold uppercase">Highest Mobile Time</span>
              </div>
              <div class="flex items-center justify-between pt-1">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white text-xl shadow-md">
                    <i class="fa-brands fa-instagram"></i>
                  </div>
                  <div>
                    <h5 class="text-sm font-black text-white" id="cxd-phone-spotlight-name">Instagram</h5>
                    <span class="text-xs text-slate-300 font-mono" id="cxd-phone-spotlight-pct">41% of mobile usage</span>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-lg font-black font-mono text-pink-300" id="cxd-phone-spotlight-time">1h 45m</span>
                </div>
              </div>
              <div class="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div id="cxd-phone-spotlight-bar" class="h-full rounded-full animate-shimmer-mobile cxd-bar-w-41"></div>
              </div>
            </div>

            <!-- Top Apps List for Phone -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                <span>Every Top Mobile App</span>
                <span>Duration (% of Phone)</span>
              </div>
              <div id="cxd-phone-apps-list" class="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                <!-- Rendered dynamically -->
              </div>
            </div>

            <div class="pt-2 border-t border-purple-500/20 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Primary Category: <b class="text-purple-300">Social &amp; Entertainment</b></span>
              <span class="text-purple-300 font-bold">&check; Fully Tracked</span>
            </div>
          </div>

          <!-- RIGHT: 💻 LAPTOP / WORKSTATION PANEL -->
          <div class="p-6 rounded-2xl bg-slate-950/80 border-2 border-cyan-500/40 shadow-xl shadow-cyan-950/20 space-y-4">
            <div class="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 text-lg shadow-sm">
                  <i class="fa-solid fa-laptop"></i>
                </div>
                <div>
                  <h4 class="text-base font-black text-white flex items-center gap-2">
                    Laptop / Workstation
                    <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase font-bold">macOS &amp; Win 11</span>
                  </h4>
                  <span class="text-xs text-cyan-300/80">Primary Desktop &bull; Active Workstation</span>
                </div>
              </div>
              <div class="text-right">
                <span class="text-xl sm:text-2xl font-black font-mono text-cyan-300 block" id="cxd-laptop-total-time">5h 32m</span>
                <span class="text-[10px] text-slate-400 font-mono uppercase">Daily Laptop Time</span>
              </div>
            </div>

            <!-- Spotlight: #1 Top Laptop App (Google Chrome) -->
            <div class="p-4 rounded-xl bg-gradient-to-br from-cyan-950/60 via-slate-900 to-blue-950/40 border border-cyan-500/40 space-y-2 shadow-inner">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <i class="fa-solid fa-crown text-amber-400"></i> #1 Top Laptop App Today
                </span>
                <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase">Highest Laptop Time</span>
              </div>
              <div class="flex items-center justify-between pt-1">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xl shadow-md">
                    <i class="fa-brands fa-chrome"></i>
                  </div>
                  <div>
                    <h5 class="text-sm font-black text-white" id="cxd-laptop-spotlight-name">Google Chrome</h5>
                    <span class="text-xs text-slate-300 font-mono" id="cxd-laptop-spotlight-pct">42% of laptop usage</span>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-lg font-black font-mono text-cyan-300" id="cxd-laptop-spotlight-time">2h 20m</span>
                </div>
              </div>
              <div class="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div id="cxd-laptop-spotlight-bar" class="h-full rounded-full animate-shimmer-desktop cxd-bar-w-42"></div>
              </div>
            </div>

            <!-- Top Apps List for Laptop -->
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                <span>Every Top Laptop App</span>
                <span>Duration (% of Laptop)</span>
              </div>
              <div id="cxd-laptop-apps-list" class="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                <!-- Rendered dynamically -->
              </div>
            </div>

            <div class="pt-2 border-t border-cyan-500/20 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Primary Category: <b class="text-cyan-300">Web Research &amp; Development</b></span>
              <span class="text-cyan-300 font-bold">&check; Fully Tracked</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ==========================================
           2. WEEK MODE SUBVIEW
           ========================================== -->
      <div id="cxd-view-week" class="space-y-6 cxd-subview-hidden">
        <!-- Week Navigator & Day Strip -->
        <div class="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span class="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Week View Telemetry</span>
              <h4 class="text-base font-black text-white" id="cxd-week-title">Week 4 (Oct 21 - Oct 27, 2026)</h4>
            </div>
            <span class="text-xs text-indigo-300 font-mono">Select entire week or choose a specific day below:</span>
          </div>

          <div id="cxd-week-pills-container" class="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
            <!-- Populated dynamically -->
          </div>
        </div>

        <!-- Panel A: Entire Week Overview -->
        <div id="cxd-week-overview-panel" class="space-y-6">
          <!-- 7-Day Total Summary Card -->
          <div class="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-950/90 to-cyan-950/40 border border-indigo-500/30 shadow-xl space-y-3">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <span class="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold block">📱 7-Day Phone Total</span>
                <div class="text-2xl sm:text-3xl font-black font-mono text-purple-300" id="cxd-week-phone-total">28h 15m (42%)</div>
              </div>
              <div id="cxd-week-diff-badge" class="px-3.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-xs font-mono font-black shadow-sm">
                Laptop +11h 25m higher across 7 days
              </div>
              <div class="text-center sm:text-right">
                <span class="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">💻 7-Day Laptop Total</span>
                <div class="text-2xl sm:text-3xl font-black font-mono text-cyan-300" id="cxd-week-laptop-total">39h 40m (58%)</div>
              </div>
            </div>
            <div class="w-full bg-slate-900 h-3 rounded-full overflow-hidden flex border border-slate-800 p-0.5">
              <div id="cxd-week-bar-phone" class="h-full rounded-l-full animate-shimmer-mobile cxd-bar-w-42"></div>
              <div id="cxd-week-bar-laptop" class="h-full rounded-r-full animate-shimmer-desktop cxd-bar-w-58"></div>
            </div>
          </div>

          <!-- 7-Day Dual Bar Chart (Side-by-side comparative bars) -->
          <div class="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <h5 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <i class="fa-solid fa-chart-simple text-indigo-400"></i> Daily Head-to-Head Progression (Mon - Sun)
              </h5>
              <div class="flex items-center gap-3 text-xs font-mono">
                <span class="flex items-center gap-1.5 text-purple-300"><span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Phone</span>
                <span class="flex items-center gap-1.5 text-cyan-300"><span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Laptop</span>
              </div>
            </div>
            <div id="cxd-week-bars-chart" class="grid grid-cols-7 gap-2 items-end h-44 pt-4 border-b border-slate-800/80 pb-2">
              <!-- Rendered dynamically -->
            </div>
            <p class="text-[11px] text-slate-500 font-mono text-center">Hover bars to inspect exact duration for each day</p>
          </div>

          <!-- Weekly Top Apps Side-by-Side -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="p-5 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-3">
              <h5 class="text-xs font-bold uppercase text-purple-300 flex items-center gap-2">
                <i class="fa-solid fa-mobile-screen"></i> Top Mobile Apps Across Full Week
              </h5>
              <div id="cxd-week-phone-apps" class="space-y-2">
                <!-- Rendered dynamically -->
              </div>
            </div>

            <div class="p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-3">
              <h5 class="text-xs font-bold uppercase text-cyan-300 flex items-center gap-2">
                <i class="fa-solid fa-laptop"></i> Top Laptop Apps Across Full Week
              </h5>
              <div id="cxd-week-laptop-apps" class="space-y-2">
                <!-- Rendered dynamically -->
              </div>
            </div>
          </div>
        </div>

        <!-- Panel B: Selected Single Day from Week -->
        <div id="cxd-week-singleday-panel" class="space-y-4 cxd-subview-hidden">
          <div class="p-6 rounded-2xl bg-slate-950/80 border border-indigo-500/40 text-center space-y-3">
            <h4 class="text-lg font-black text-white" id="cxd-week-singleday-title">Single Day Telemetry</h4>
            <div class="flex items-center justify-center gap-8 text-xl font-mono font-black">
              <span class="text-purple-300">📱 Phone: <span id="cxd-week-singleday-phone">--</span></span>
              <span class="text-slate-600">&bull;</span>
              <span class="text-cyan-300">💻 Laptop: <span id="cxd-week-singleday-laptop">--</span></span>
            </div>
            <button type="button" onclick="ArcCrossDeviceComparison.setMode('day')" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition active:scale-95 inline-flex items-center gap-2">
              <i class="fa-solid fa-magnifying-glass"></i> View Full App Breakdown in Day Mode
            </button>
          </div>
        </div>
      </div>

      <!-- ==========================================
           3. MONTH MODE (IN-PAGE SUBVIEW WITH CALENDAR & TRENDS)
           ========================================== -->
      <div id="cxd-view-month" class="space-y-6 cxd-subview-hidden">
        <!-- In-page subview banner -->
        <div class="p-4 rounded-2xl bg-slate-950/80 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-mono font-bold uppercase">MONTHLY IN-PAGE SUBVIEW</span>
              <span class="text-xs text-slate-400 font-mono">October 2026 Cycle</span>
            </div>
            <h4 class="text-base sm:text-lg font-black text-white mt-1">Cross-Device Monthly Breakdown &amp; Interactive Calendar</h4>
          </div>

          <!-- Device Selector Filters -->
          <div id="cxd-month-device-filters" class="flex flex-wrap items-center gap-1.5">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- 2-PANEL MONTH LAYOUT: PANEL 1 (STATS & TRENDS) + PANEL 2 (CALENDAR & INSPECTOR) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- PANEL 1: MONTHLY SCREEN TIME & WEEK-OVER-WEEK TRENDS (COL 7) -->
          <div class="lg:col-span-7 space-y-6">
            <!-- Monthly Total Screen Time Card -->
            <div class="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 shadow-inner">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <i class="fa-solid fa-calendar-check text-indigo-400"></i> Total Monthly Screen Time
                </span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">Laptop Dominant</span>
              </div>
              <div class="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight" id="cxd-month-total-screentime">146h 35m</div>
              <p class="text-xs text-slate-400" id="cxd-month-total-subtext">💻 92h 10m Laptop (63%) &bull; 📱 54h 25m Phone (37%) &bull; 30 Days Evaluated</p>
            </div>

            <!-- Detailed Statistics Grid for Selected Period -->
            <div class="grid grid-cols-2 gap-3">
              <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span class="text-[10px] font-mono text-slate-400 uppercase">Daily Average</span>
                <div class="text-lg font-mono font-black text-cyan-300">4h 53m / day</div>
                <span class="text-[10px] text-slate-500">Across both devices</span>
              </div>
              <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span class="text-[10px] font-mono text-slate-400 uppercase">Peak Consumption Day</span>
                <div class="text-lg font-mono font-black text-rose-300">Oct 14 (7h 12m)</div>
                <span class="text-[10px] text-slate-500">High laptop dev sprint</span>
              </div>
              <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span class="text-[10px] font-mono text-slate-400 uppercase">Most Disciplined Day</span>
                <div class="text-lg font-mono font-black text-emerald-300">Oct 22 (2h 18m)</div>
                <span class="text-[10px] text-slate-500">Minimal phone distractions</span>
              </div>
              <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span class="text-[10px] font-mono text-slate-400 uppercase">Dominant Device Gap</span>
                <div class="text-lg font-mono font-black text-indigo-300">+37h 45m Laptop</div>
                <span class="text-[10px] text-slate-500">Workstation prioritized</span>
              </div>
            </div>

            <!-- WEEK-OVER-WEEK COMPARISON (WEEK 1 vs WEEK 2 vs WEEK 3 vs WEEK 4) -->
            <div class="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 shadow-inner">
              <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h5 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <i class="fa-solid fa-chart-line text-indigo-400"></i> Week-Over-Week Telemetry Comparison
                  </h5>
                  <span class="text-[11px] text-slate-400">Comparing Week 1 vs Week 2 vs Week 3 vs Week 4</span>
                </div>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">4-Week Matrix</span>
              </div>

              <!-- 4 Week Cards with Progress Bars -->
              <div id="cxd-month-weeks-comparison" class="space-y-3">
                <!-- Populated dynamically -->
              </div>

              <!-- PERCENTAGE TRENDING INSIGHT BANNER -->
              <div class="p-4 rounded-xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-indigo-950/50 border border-emerald-500/40 space-y-1.5 shadow-md">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span class="text-xs font-black text-emerald-300 uppercase tracking-wide">Percentage Trending Trajectory</span>
                </div>
                <p id="cxd-month-trend-banner" class="text-xs font-mono text-white font-bold">
                  Laptop usage rose +12.0% (52% &rarr; 64%) while Phone usage fell -12.0% (48% &rarr; 36%)
                </p>
                <p class="text-[11px] text-slate-400">
                  Great digital discipline! Screen time is actively migrating from passive mobile entertainment toward productive laptop development and research.
                </p>
              </div>
            </div>
          </div>

          <!-- PANEL 2: INTERACTIVE CALENDAR & DATE INSPECTOR (COL 5) -->
          <div class="lg:col-span-5 space-y-6">
            <!-- Calendar Card -->
            <div class="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 shadow-inner">
              <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h5 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <i class="fa-solid fa-calendar text-cyan-400"></i> October 2026 Calendar
                  </h5>
                  <span class="text-[10px] text-slate-400">Select any date to view exact screen time</span>
                </div>
                <div class="flex items-center gap-2 text-[10px] font-mono">
                  <span class="flex items-center gap-1 text-cyan-300"><span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Laptop</span>
                  <span class="flex items-center gap-1 text-purple-300"><span class="w-1.5 h-1.5 rounded-full bg-purple-400"></span> Phone</span>
                </div>
              </div>

              <!-- Days of week header -->
              <div class="grid grid-cols-7 gap-1 text-center text-[10px] font-mono text-slate-400 font-bold uppercase pb-1">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>

              <!-- Calendar Grid (1 - 31) -->
              <div id="cxd-calendar-grid" class="grid grid-cols-7 gap-1.5">
                <!-- Populated dynamically -->
              </div>
            </div>

            <!-- SELECTED DATE TELEMETRY INSPECTOR CARD -->
            <div class="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/40 space-y-3.5 shadow-xl">
              <div class="flex items-center justify-between border-b border-indigo-500/20 pb-2">
                <span class="text-xs font-black text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <i class="fa-solid fa-crosshairs text-cyan-400"></i> Date Telemetry Inspector
                </span>
                <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">Exact Telemetry</span>
              </div>

              <div>
                <h4 id="cxd-inspector-date" class="text-sm font-black text-white">October 27, 2026 Telemetry Snapshot</h4>
                <div class="grid grid-cols-2 gap-2 mt-2">
                  <div class="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span class="text-[10px] font-mono text-cyan-400 uppercase block">💻 Laptop Time</span>
                    <span id="cxd-inspector-laptop-val" class="text-base font-black font-mono text-white">5h 32m</span>
                  </div>
                  <div class="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span class="text-[10px] font-mono text-purple-400 uppercase block">📱 Phone Time</span>
                    <span id="cxd-inspector-phone-val" class="text-base font-black font-mono text-white">4h 18m</span>
                  </div>
                </div>
                <div class="mt-2 text-xs font-mono text-slate-300 flex items-center justify-between px-1">
                  <span>Combined Total:</span>
                  <span id="cxd-inspector-comb-val" class="font-bold text-amber-300">9h 50m</span>
                </div>
              </div>

              <!-- Top apps snapshot for this date -->
              <div id="cxd-inspector-top-apps" class="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <!-- Rendered dynamically -->
              </div>

              <button type="button" onclick="ArcCrossDeviceComparison.jumpToDayFromCalendar()" class="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition active:scale-95">
                <i class="fa-solid fa-magnifying-glass text-cyan-300"></i> Open Day Split View for this Date &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- BOTTOM FULL-WIDTH STATUS BAR -->
    <div class="shrink-0 px-4 sm:px-8 py-3 border-t border-slate-800 bg-slate-950/90 backdrop-blur-md flex items-center justify-between text-xs shadow-lg">
      <div class="flex items-center gap-2 text-slate-400 font-mono">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Cross-Device Comparison Engine: <b class="text-white">Active</b></span>
      </div>
      <div class="hidden md:flex items-center gap-2 text-[11px] text-slate-500 font-mono">
        <span>Mock Telemetry Engine &bull; Press <kbd class="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">ESC</kbd> to return</span>
      </div>
      <button type="button" onclick="ArcCrossDeviceComparison.closeModal()" class="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition active:scale-95">
        Done
      </button>
    </div>
  </div>
</div>

<!-- ==========================================================================
     APP STORE RATING & MICROSOFT STORE DESKTOP MODAL (CLEAN, NO FAKE NUMBERS)
     ========================================================================== -->
<div id="arc-store-rating-modal" class="pp-modal" role="dialog" aria-modal="true" aria-label="Arc Tracker on App Stores">
  <div class="relative my-auto flex flex-col max-w-lg w-full glass-card rounded-3xl p-5 sm:p-6 border border-cyan-500/40 shadow-2xl bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-indigo-950/40 animate-zoom-in space-y-4">
    <!-- MODAL HEADER -->
    <div class="flex items-center justify-between border-b border-cyan-500/20 pb-3">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-base shadow-sm">
          <i class="fa-solid fa-store"></i>
        </div>
        <div>
          <h3 class="text-sm sm:text-base font-black text-white">Arc Tracker on App Stores</h3>
          <p class="text-xs text-slate-400">Available across Android, iOS &amp; Windows Desktop</p>
        </div>
      </div>
      <button type="button" onclick="ArcStoreRating.closeModal()" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white grid place-items-center transition">
        <i class="fa-solid fa-xmark text-sm"></i>
      </button>
    </div>

    <!-- STORE OPTIONS -->
    <div class="space-y-2.5">
      <!-- 1. MICROSOFT STORE (WINDOWS 10 & 11) -->
      <div id="modal-store-tab-microsoft_store" class="p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/40 hover:border-cyan-400 transition space-y-2.5">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <i class="fa-brands fa-microsoft text-lg"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="text-xs font-black text-white">Microsoft Store</h4>
                <span class="text-[9px] font-mono bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/30 font-bold uppercase">Windows 10 / 11</span>
              </div>
              <p class="text-[11px] text-slate-400">Install as a native desktop application with taskbar shortcut &amp; autostart.</p>
            </div>
          </div>
        </div>
        <div class="pt-1">
          <a href="https://apps.microsoft.com/detail/arc-tracker" target="_blank" rel="noopener noreferrer" class="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition text-center">
            <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
            <span>Open in Store</span>
          </a>
        </div>
      </div>

      <!-- 2. GOOGLE PLAY STORE (ANDROID) -->
      <div id="modal-store-tab-google_play" class="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 transition flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <i class="fa-brands fa-google-play text-base"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h4 class="text-xs font-black text-white">Google Play Store</h4>
              <span class="text-[9px] font-mono bg-emerald-500/15 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30 font-bold">Android</span>
            </div>
            <p class="text-[11px] text-slate-400">Available for Android phones, tablets &amp; Wear OS devices.</p>
          </div>
        </div>
        <a href="https://play.google.com/store/apps/details?id=com.arctracker.app" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 text-xs font-bold transition shrink-0">
          Open Store
        </a>
      </div>

      <!-- 3. APPLE APP STORE (IOS & MAC) -->
      <div id="modal-store-tab-app_store" class="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-sky-500/40 transition flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-300 shrink-0">
            <i class="fa-brands fa-apple text-lg"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h4 class="text-xs font-black text-white">Apple App Store</h4>
              <span class="text-[9px] font-mono bg-sky-500/15 text-sky-300 px-1.5 py-0.2 rounded border border-sky-500/30 font-bold">iOS / Mac</span>
            </div>
            <p class="text-[11px] text-slate-400">Available for iPhone, iPad &amp; Mac.</p>
          </div>
        </div>
        <a href="https://apps.apple.com/app/arc-tracker/id1688000000" target="_blank" rel="noopener noreferrer" class="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-400 text-sky-300 hover:text-slate-950 border border-sky-500/40 text-xs font-bold transition shrink-0">
          Open Store
        </a>
      </div>
    </div>

    <!-- FEEDBACK BOX -->
    <div class="space-y-2 pt-2 border-t border-slate-800">
      <label for="modal-review-feedback-input" class="text-xs font-bold text-slate-300 flex items-center justify-between">
        <span>Send your feedback or feature requests:</span>
      </label>
      <div class="flex gap-2">
        <input id="modal-review-feedback-input" type="text" placeholder="Share your suggestions with us..." class="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" />
        <button type="button" onclick="ArcStoreRating.submitReviewFeedback()" class="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition active:scale-95 shadow-sm">
          Send
        </button>
      </div>
    </div>
  </div>
</div>

<!-- AES-256 Encrypted Export Modal -->
<div id="pp-sec-enc-exp" class="pp-modal" role="dialog" aria-modal="true" aria-label="Export password-protected encrypted backup">
  <div class="pp-box">
    <div class="flex items-center gap-2 text-cyan-400 font-black text-base mb-2">
      <i class="fa-solid fa-lock text-lg"></i>
      <h3>AES-256 Encrypted Export</h3>
    </div>
    <p class="text-xs text-slate-300 mb-3">Create a high-security encrypted backup (<span class="font-mono text-cyan-400">.arcenc</span>). Protects your habits, thoughts, reflections, and streak data with military-grade AES-GCM 256-bit encryption.</p>
    <div class="space-y-2 mb-4">
      <div>
        <label for="sec-enc-pass" class="block text-[11px] font-semibold text-slate-400 mb-1">Encryption Password</label>
        <input id="sec-enc-pass" type="password" class="pp-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" placeholder="Minimum 6 characters" autocomplete="new-password">
      </div>
      <div>
        <label for="sec-enc-pass-confirm" class="block text-[11px] font-semibold text-slate-400 mb-1">Confirm Password</label>
        <input id="sec-enc-pass-confirm" type="password" class="pp-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" placeholder="Re-type password" autocomplete="new-password">
      </div>
      <p id="sec-enc-exp-err" class="text-xs text-rose-400 h-4 font-mono"></p>
    </div>
    <div class="grid grid-cols-2 gap-2">
      <button role="button" class="pp-btn text-cyan-300 border-cyan-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="btn-sec-enc-exp-confirm">Generate &amp; Download</button>
      <button role="button" class="pp-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-close>Cancel</button>
    </div>
  </div>
</div>

<!-- AES-256 Encrypted Import Modal -->
<div id="pp-sec-enc-imp" class="pp-modal" role="dialog" aria-modal="true" aria-label="Decrypt encrypted backup">
  <div class="pp-box">
    <div class="flex items-center gap-2 text-cyan-400 font-black text-base mb-2">
      <i class="fa-solid fa-key text-lg"></i>
      <h3>Decrypt Encrypted Backup</h3>
    </div>
    <p class="text-xs text-slate-300 mb-3">This backup is protected with AES-256 encryption. Enter the passphrase used during export to decrypt and verify its contents.</p>
    <div class="space-y-2 mb-4">
      <div>
        <label for="sec-dec-pass" class="block text-[11px] font-semibold text-slate-400 mb-1">Decryption Password</label>
        <input id="sec-dec-pass" type="password" class="pp-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" placeholder="Enter password" autocomplete="current-password">
      </div>
      <p id="sec-dec-err" class="text-xs text-rose-400 h-4 font-mono"></p>
    </div>
    <div class="grid grid-cols-2 gap-2">
      <button role="button" class="pp-btn text-cyan-300 border-cyan-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="btn-sec-dec-confirm">Decrypt &amp; Inspect</button>
      <button role="button" class="pp-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-close>Cancel</button>
    </div>
  </div>
</div>

<!-- Two-Step Verification (2FA) Setup & Management Modal -->
<div id="pp-sec-2fa-modal" class="pp-modal" role="dialog" aria-modal="true" aria-label="Two-Step Verification settings">
  <div class="pp-box max-w-lg w-full max-h-[90vh] overflow-y-auto">
    <div class="flex items-center justify-between pb-3 border-b border-slate-800">
      <div class="flex items-center gap-2 text-cyan-400 font-black text-base">
        <i class="fa-solid fa-shield-halved text-lg"></i>
        <h3>Two-Step Verification (2FA)</h3>
      </div>
      <button type="button" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white grid place-items-center transition" data-close>
        <i class="fa-solid fa-xmark text-sm"></i>
      </button>
    </div>

    <!-- Overview Banner -->
    <div class="p-3 my-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 text-xs text-slate-300">
      <div class="flex items-center justify-between mb-1">
        <span class="font-bold text-cyan-300 flex items-center gap-1.5">
          <i class="fa-solid fa-lock text-cyan-400"></i> Optional Extra Security Layer
        </span>
        <span id="arc-2fa-modal-status-badge" class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
          INACTIVE
        </span>
      </div>
      <p class="text-[11px] text-slate-300 leading-relaxed">
        Add a second verification step to guard your habits and data. Choose between <b>Google Authenticator</b> or <b>SMS Phone Number</b>, accompanied by 5 emergency single-use backup codes.
      </p>
    </div>

    <!-- Active Management Card (Shown when 2FA is currently active) -->
    <div id="arc-2fa-active-view" class="space-y-4 hidden">
      <div class="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-xs font-bold text-white">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Active Method:</span>
            <span id="arc-2fa-active-method-name" class="font-mono text-cyan-300 uppercase">Google Authenticator</span>
          </div>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">PROTECTED</span>
        </div>
        <div id="arc-2fa-active-method-detail" class="text-xs text-slate-400 font-mono"></div>
      </div>

      <!-- Backup Codes Box -->
      <div class="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
        <div class="flex items-center justify-between">
          <div class="font-bold text-xs text-white flex items-center gap-2">
            <i class="fa-solid fa-key text-cyan-400"></i>
            <span>5 Emergency Backup Codes</span>
          </div>
          <span id="arc-2fa-active-codes-badge" class="text-[10px] font-mono text-cyan-300">5 of 5 Available</span>
        </div>
        <p class="text-[11px] text-slate-400">
          Each backup code can be used once to unlock if your phone or authenticator app is unavailable.
        </p>
        <div id="arc-2fa-active-codes-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
          <!-- Rendered dynamically -->
        </div>
        <div class="flex flex-wrap gap-2 pt-1">
          <button type="button" onclick="ArcTwoFactor.copyBackupCodes()" class="pp-btn text-xs text-cyan-300 border-cyan-500/40 flex items-center gap-1.5">
            <i class="fa-solid fa-copy"></i> Copy Codes
          </button>
          <button type="button" onclick="ArcTwoFactor.downloadBackupCodes()" class="pp-btn text-xs text-slate-300 flex items-center gap-1.5">
            <i class="fa-solid fa-download"></i> Download (.txt)
          </button>
          <button type="button" onclick="ArcTwoFactor.regenerateBackupCodes()" class="pp-btn text-xs text-amber-300 border-amber-500/40 flex items-center gap-1.5">
            <i class="fa-solid fa-arrows-rotate"></i> Regenerate 5 Codes
          </button>
        </div>
      </div>

      <!-- Danger Zone / Removal -->
      <div class="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div class="text-xs font-bold text-rose-300">Remove Two-Step Verification</div>
          <div class="text-[11px] text-slate-400">Turn off 2FA security checks. You can re-enable it at any time.</div>
        </div>
        <button type="button" onclick="ArcTwoFactor.confirmRemove()" class="px-3.5 py-2 rounded-xl text-xs font-bold border border-rose-500/50 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 transition shrink-0 active:scale-95 shadow-sm">
          <i class="fa-solid fa-trash-can mr-1"></i> Remove 2FA
        </button>
      </div>
    </div>

    <!-- Inactive Setup View (Shown when 2FA is being configured) -->
    <div id="arc-2fa-setup-view" class="space-y-4">
      <!-- Step 1: Choose Method -->
      <div>
        <label class="block text-xs font-bold text-slate-300 mb-2">1. Choose Your Verification Method:</label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button type="button" id="arc-2fa-choice-authenticator" onclick="ArcTwoFactor.selectMethod('authenticator')" class="p-3 rounded-xl border-2 border-cyan-400 bg-cyan-950/40 text-left transition relative select-none">
            <div class="flex items-center gap-2 mb-1">
              <i class="fa-solid fa-mobile-screen text-cyan-400 text-base"></i>
              <span class="font-bold text-xs text-white">Google Authenticator</span>
            </div>
            <p class="text-[11px] text-slate-300 leading-tight">Time-based 6-digit codes generated on your phone. Works completely offline.</p>
            <div class="absolute top-2.5 right-2.5 text-cyan-400 text-xs check-icon"><i class="fa-solid fa-circle-check"></i></div>
          </button>

          <button type="button" id="arc-2fa-choice-phone" onclick="ArcTwoFactor.selectMethod('phone')" class="p-3 rounded-xl border-2 border-slate-700 bg-slate-900/60 hover:border-slate-600 text-left transition relative select-none">
            <div class="flex items-center gap-2 mb-1">
              <i class="fa-solid fa-comment-sms text-indigo-400 text-base"></i>
              <span class="font-bold text-xs text-white">Phone Number (SMS)</span>
            </div>
            <p class="text-[11px] text-slate-300 leading-tight">Receive 6-digit verification codes sent directly to your mobile phone.</p>
            <div class="absolute top-2.5 right-2.5 text-slate-500 text-xs check-icon hidden"><i class="fa-solid fa-circle-check"></i></div>
          </button>
        </div>
      </div>

      <!-- Step 2: Method Configuration -->
      <div id="arc-2fa-config-authenticator" class="space-y-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
        <div class="font-bold text-xs text-cyan-300 flex items-center gap-1.5">
          <i class="fa-solid fa-qrcode"></i> Scan QR Code in Google Authenticator
        </div>
        <div class="flex flex-col sm:flex-row items-center gap-4">
          <div id="arc-2fa-qr-code-box" class="w-36 h-36 shrink-0 bg-white rounded-xl p-2 flex items-center justify-center shadow-lg">
            <!-- Injected QR SVG -->
          </div>
          <div class="space-y-2 flex-1 w-full text-xs">
            <p class="text-slate-300 text-[11px]">
              Scan with <b>Google Authenticator</b> or compatible app. Or enter the setup key manually:
            </p>
            <div>
              <label class="block text-[10px] uppercase font-mono text-slate-400 mb-0.5">Secret Key (Base32)</label>
              <div class="flex gap-1.5">
                <input id="arc-2fa-secret-display" type="text" readonly class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-300 font-bold select-all focus:outline-none">
                <button type="button" onclick="ArcTwoFactor.copySecretKey()" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition" title="Copy Key">
                  <i class="fa-solid fa-copy"></i>
                </button>
              </div>
            </div>
            <div class="flex items-center gap-2 pt-1">
              <button type="button" onclick="ArcTwoFactor.fillCurrentTOTP()" class="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-semibold">
                ⚡ Auto-fill Current Code for Instant Test
              </button>
            </div>
          </div>
        </div>

        <!-- Verification Code Entry -->
        <div class="pt-2 border-t border-slate-800">
          <label class="block text-[11px] font-semibold text-slate-300 mb-1">Enter 6-digit Code from Authenticator to Confirm:</label>
          <div class="flex gap-2">
            <input id="arc-2fa-setup-totp-input" type="text" maxlength="6" inputmode="numeric" placeholder="123456" class="w-36 text-center tracking-widest font-mono font-bold text-base bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-400">
            <button type="button" onclick="ArcTwoFactor.verifySetupCode()" class="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition active:scale-95">
              Verify Code
            </button>
          </div>
          <p id="arc-2fa-setup-totp-err" class="text-xs text-rose-400 font-mono mt-1 min-h-[1rem]"></p>
        </div>
      </div>

      <!-- Step 2: Phone Number Configuration -->
      <div id="arc-2fa-config-phone" class="space-y-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hidden">
        <div class="font-bold text-xs text-indigo-300 flex items-center gap-1.5">
          <i class="fa-solid fa-phone"></i> Mobile Phone Number Setup
        </div>
        <p class="text-[11px] text-slate-300">
          Enter your mobile phone number. Arc Tracker will dispatch verification codes via secure SMS.
        </p>
        <div>
          <label class="block text-[10px] uppercase font-mono text-slate-400 mb-1">Phone Number (with country code)</label>
          <div class="flex gap-2">
            <input id="arc-2fa-setup-phone-input" type="tel" placeholder="+1 (555) 234-5678" value="+1 (555) 234-5678" class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono">
            <button type="button" onclick="ArcTwoFactor.sendSetupSms()" class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition active:scale-95 shrink-0 flex items-center gap-1.5">
              <i class="fa-solid fa-paper-plane"></i> Send SMS Code
            </button>
          </div>
        </div>

        <div id="arc-2fa-phone-verify-wrap" class="pt-2 border-t border-slate-800 space-y-2">
          <label class="block text-[11px] font-semibold text-slate-300">Enter 6-digit SMS Code:</label>
          <div class="flex gap-2">
            <input id="arc-2fa-setup-sms-input" type="text" maxlength="6" inputmode="numeric" placeholder="••••••" class="w-36 text-center tracking-widest font-mono font-bold text-base bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-400">
            <button type="button" onclick="ArcTwoFactor.verifySetupSms()" class="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition active:scale-95">
              Verify SMS
            </button>
          </div>
          <p id="arc-2fa-setup-sms-err" class="text-xs text-rose-400 font-mono min-h-[1rem]"></p>
        </div>
      </div>

      <!-- Step 3: 5 Emergency Backup Codes Display -->
      <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="font-bold text-xs text-amber-300 flex items-center gap-1.5">
            <i class="fa-solid fa-key"></i> Step 2: Save Your 5 Emergency Backup Codes
          </div>
          <span class="text-[10px] font-mono text-slate-400">5 Single-Use Codes</span>
        </div>
        <p class="text-[11px] text-slate-400 leading-relaxed">
          If you lose access to your authenticator app or phone, each single-use backup code allows you to unlock your account. Save them now in a safe place.
        </p>
        <div id="arc-2fa-setup-codes-grid" class="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
          <!-- 5 codes rendered here -->
        </div>
        <div class="flex flex-wrap gap-2 pt-1">
          <button type="button" onclick="ArcTwoFactor.copySetupBackupCodes()" class="pp-btn text-xs text-cyan-300 border-cyan-500/40 flex items-center gap-1.5">
            <i class="fa-solid fa-copy"></i> Copy All 5 Codes
          </button>
          <button type="button" onclick="ArcTwoFactor.downloadSetupBackupCodes()" class="pp-btn text-xs text-slate-300 flex items-center gap-1.5">
            <i class="fa-solid fa-download"></i> Download Codes (.txt)
          </button>
        </div>
        <label class="flex items-center gap-2 pt-1 text-xs text-slate-300 cursor-pointer select-none">
          <input id="arc-2fa-confirm-saved-chk" type="checkbox" onchange="ArcTwoFactor.onConfirmSavedChange()" class="accent-cyan-400 rounded w-4 h-4">
          <span>I have securely saved these 5 backup codes.</span>
        </label>
      </div>

      <!-- Enable / Activate Button -->
      <div class="pt-2 flex gap-2">
        <button type="button" id="btn-arc-2fa-activate" onclick="ArcTwoFactor.activateTwoFactor()" class="pp-btn flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black border-none font-extrabold text-xs uppercase tracking-wider disabled:opacity-40 disabled:pointer-events-none" disabled>
          <i class="fa-solid fa-shield-check mr-1.5"></i> Activate Two-Step Verification
        </button>
        <button type="button" class="pp-btn" data-close>Cancel</button>
      </div>
    </div>
  </div>
</div>

<!-- App Security Password / PIN Configuration Modal -->
<div id="pp-sec-pin-modal" class="pp-modal z-[130]" role="dialog" aria-modal="true" aria-label="Configure app security password">
  <div class="pp-box max-w-md w-full">
    <div class="flex items-center gap-2 text-cyan-400 font-black text-base mb-2">
      <i class="fa-solid fa-shield-halved text-lg"></i>
      <h3 id="sec-pin-modal-title">Configure Security Password / PIN</h3>
    </div>
    <p class="text-xs text-slate-300 mb-3">Protect your private habits, notes, and screen time. Choose any password or numeric PIN of 4 or more characters/numbers.</p>
    <div class="space-y-3 mb-4" id="sec-pin-fields">
      <div id="sec-pin-curr-wrap" class="hidden">
        <label for="sec-pin-curr" class="block text-[11px] font-semibold text-slate-400 mb-1">Current Password / PIN</label>
        <div class="relative">
          <input id="sec-pin-curr" type="password" maxlength="64" class="pp-in pr-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 font-mono" placeholder="Enter current password or PIN">
          <button type="button" onclick="ArcSecurity.togglePassVisible('sec-pin-curr')" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"><i class="fa-solid fa-eye"></i></button>
        </div>
        <div class="flex justify-end mt-1">
          <button type="button" onclick="ArcSecurity.openForgotPasswordModal()" class="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold transition hover:underline">
            Forgot current password? Reset here
          </button>
        </div>
      </div>
      <div id="sec-pin-new-wrap">
        <div class="flex items-center justify-between mb-1">
          <label for="sec-pin-new" class="text-[11px] font-semibold text-slate-400">New Password or PIN (Min 4 characters)</label>
          <span class="text-[10px] text-cyan-400/90 font-mono">Numbers or text</span>
        </div>
        <div class="relative">
          <input id="sec-pin-new" type="password" maxlength="64" class="pp-in pr-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 font-mono" placeholder="e.g. 123456, winterarc2026, or custom passphrase">
          <button type="button" onclick="ArcSecurity.togglePassVisible('sec-pin-new')" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"><i class="fa-solid fa-eye"></i></button>
        </div>
      </div>
      <div id="sec-pin-confirm-wrap">
        <label for="sec-pin-confirm" class="block text-[11px] font-semibold text-slate-400 mb-1">Confirm New Password / PIN</label>
        <div class="relative">
          <input id="sec-pin-confirm" type="password" maxlength="64" class="pp-in pr-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 font-mono" placeholder="Re-enter password or PIN">
          <button type="button" onclick="ArcSecurity.togglePassVisible('sec-pin-confirm')" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"><i class="fa-solid fa-eye"></i></button>
        </div>
      </div>
      <p id="sec-pin-modal-err" class="text-xs text-rose-400 min-h-[1.25rem] font-mono"></p>
    </div>
    <div class="flex gap-2">
      <button role="button" class="pp-btn flex-1 text-cyan-300 border-cyan-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 font-bold" id="btn-sec-pin-save">Save Password</button>
      <button role="button" class="pp-btn text-rose-400 border-rose-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 hidden" id="btn-sec-pin-disable">Remove Lock</button>
      <button role="button" class="pp-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-close>Cancel</button>
    </div>
  </div>
</div>

<!-- Full-Screen App Security Password & PIN Lock Overlay -->
<div id="arc-pin-overlay" class="fixed inset-0 z-[120] hidden flex-col items-center justify-center p-4 bg-slate-950/95 select-none" role="dialog" aria-modal="true" aria-label="Security password verification">
  <div class="max-w-xs sm:max-w-sm w-full p-6 sm:p-7 rounded-2xl border border-cyan-500/30 bg-slate-900/95 shadow-2xl flex flex-col items-center space-y-3.5 text-center backdrop-blur-xl">
    <!-- STEP 1: PASSWORD / PIN -->
    <div id="arc-lock-step-1" class="w-full flex flex-col items-center space-y-3.5">
    <div class="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 grid place-items-center text-cyan-400 text-2xl shadow-inner shrink-0">
      <i class="fa-solid fa-shield-halved"></i>
    </div>
    <div>
      <h3 class="text-base font-black tracking-wider text-white">ARC SENTINEL</h3>
      <p class="text-xs text-slate-400 mt-0.5">Enter Security Password or PIN to unlock</p>
    </div>

    <!-- Flexible Input Box with Eye Toggle -->
    <div class="w-full relative">
      <input id="arc-lock-pass-input" type="password" maxlength="64" autocomplete="off" class="w-full text-center text-base sm:text-lg font-mono tracking-widest px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700 text-cyan-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 focus:outline-none transition shadow-inner" placeholder="Enter password or PIN...">
      <button type="button" onclick="ArcSecurity.togglePassVisible('arc-lock-pass-input')" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1" title="Show/Hide Password">
        <i class="fa-solid fa-eye"></i>
      </button>
    </div>

    <!-- Dynamic Indicator -->
    <div class="flex gap-1.5 justify-center py-0.5 flex-wrap max-w-full min-h-[14px]" id="arc-pin-dots">
      <!-- Dots render dynamically as typed -->
    </div>

    <p id="arc-pin-err" class="text-xs text-rose-400 min-h-[1.25rem] font-mono"></p>

    <!-- Anti-Spy Keylogger Defense Bar -->
    <div class="flex items-center justify-between w-full text-[10px] text-slate-400 px-1 pt-0.5">
      <span class="flex items-center gap-1 text-slate-400"><i class="fa-solid fa-shield-virus text-cyan-400 text-[10px]"></i> Anti-Spy Keypad</span>
      <button type="button" onclick="ArcSecurity.toggleKeypadScramble()" class="text-slate-400 hover:text-cyan-300 transition flex items-center gap-1 font-mono text-[10px]" id="btn-toggle-scramble-pad">
        <i class="fa-solid fa-shuffle text-[10px]"></i> <span id="arc-scramble-pad-label">Scramble: OFF</span>
      </button>
    </div>

    <!-- Numeric Quick Keypad (For mobile/touch, keyboard typing also supported) -->
    <div class="grid grid-cols-3 gap-2 w-full pt-0.5" id="arc-pin-pad">
      <button type="button" class="arc-pad-btn" data-v="1">1</button>
      <button type="button" class="arc-pad-btn" data-v="2">2</button>
      <button type="button" class="arc-pad-btn" data-v="3">3</button>
      <button type="button" class="arc-pad-btn" data-v="4">4</button>
      <button type="button" class="arc-pad-btn" data-v="5">5</button>
      <button type="button" class="arc-pad-btn" data-v="6">6</button>
      <button type="button" class="arc-pad-btn" data-v="7">7</button>
      <button type="button" class="arc-pad-btn" data-v="8">8</button>
      <button type="button" class="arc-pad-btn" data-v="9">9</button>
      <button type="button" class="arc-pad-btn text-xs text-slate-400 font-mono" data-v="clear">CLR</button>
      <button type="button" class="arc-pad-btn" data-v="0">0</button>
      <button type="button" class="arc-pad-btn text-xs text-slate-400" data-v="back" aria-label="Backspace"><i class="fa-solid fa-delete-left"></i></button>
    </div>

    <!-- Unlock Action Button -->
    <button type="button" id="arc-lock-submit-btn" onclick="ArcSecurity.submitUnlock()" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 active:scale-95 text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2">
      <i class="fa-solid fa-unlock"></i> Unlock Tracker
    </button>

    <!-- Forgot Password / Email Verification Link -->
    <div class="pt-1 border-t border-slate-800/80 w-full">
      <button type="button" id="btn-arc-forgot-pin" onclick="ArcSecurity.openForgotPasswordModal()" class="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition hover:underline flex items-center justify-center gap-1.5 mx-auto">
        <i class="fa-solid fa-envelope-open-text text-[11px]"></i> Forgot Password? (Email Recovery)
      </button>
    </div>
    </div><!-- End arc-lock-step-1 -->

    <!-- STEP 2: TWO-STEP VERIFICATION CHALLENGE -->
    <div id="arc-lock-step-2" class="w-full hidden flex-col items-center space-y-3.5">
      <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-400/50 grid place-items-center text-cyan-300 text-2xl shadow-inner shrink-0">
        <i class="fa-solid fa-shield-halved"></i>
      </div>
      <div>
        <h3 class="text-base font-black tracking-wider text-white">TWO-STEP VERIFICATION</h3>
        <p id="arc-2fa-challenge-desc" class="text-xs text-slate-300 mt-0.5">Enter 6-digit code from Google Authenticator</p>
      </div>

      <!-- 6-Digit Challenge Input -->
      <div id="arc-2fa-digit-wrap" class="w-full space-y-2">
        <input id="arc-2fa-challenge-input" type="text" maxlength="6" inputmode="numeric" autocomplete="one-time-code" class="w-full text-center text-2xl font-mono font-black tracking-[0.4em] px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700 text-cyan-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 focus:outline-none transition shadow-inner" placeholder="••••••">
        <div id="arc-2fa-sms-resend-wrap" class="hidden">
          <button type="button" onclick="ArcTwoFactor.resendChallengeSms()" class="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold underline">
            <i class="fa-solid fa-rotate-right mr-1"></i> Resend SMS Code
          </button>
        </div>
      </div>

      <!-- Emergency Backup Code Input (Hidden by default) -->
      <div id="arc-2fa-backup-wrap" class="w-full space-y-1.5 hidden">
        <input id="arc-2fa-backup-input" type="text" maxlength="9" class="w-full text-center text-lg font-mono font-bold tracking-widest uppercase px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700 text-cyan-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 focus:outline-none transition shadow-inner" placeholder="XXXX-XXXX">
        <p class="text-[10px] text-slate-400 font-mono">Enter 1 of your 5 single-use emergency backup codes</p>
      </div>

      <p id="arc-2fa-challenge-err" class="text-xs text-rose-400 min-h-[1.25rem] font-mono"></p>

      <!-- Verify & Unlock Action Button -->
      <button type="button" id="arc-2fa-challenge-btn" onclick="ArcTwoFactor.submitChallengeUnlock()" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 active:scale-95 text-black font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2">
        <i class="fa-solid fa-lock-open"></i> Verify &amp; Unlock
      </button>

      <!-- Challenge Option Links -->
      <div class="pt-1.5 border-t border-slate-800/80 w-full space-y-1.5">
        <button type="button" id="btn-arc-2fa-toggle-mode" onclick="ArcTwoFactor.toggleChallengeMode()" class="text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition hover:underline flex items-center justify-center gap-1.5 mx-auto">
          <i class="fa-solid fa-key text-[11px]"></i> <span id="arc-2fa-toggle-mode-text">Use an Emergency Backup Code</span>
        </button>
        <button type="button" onclick="ArcTwoFactor.backToPasswordStep()" class="text-[11px] text-slate-400 hover:text-slate-200 transition hover:underline flex items-center justify-center gap-1 mx-auto">
          <i class="fa-solid fa-arrow-left text-[10px]"></i> Back to Password
        </button>
      </div>
    </div><!-- End arc-lock-step-2 -->
  </div>
</div>

<!-- Privacy Shield (Anti-Snoop / Window Blur Mask) -->
<div id="arc-privacy-shield" class="fixed inset-0 z-[115] hidden flex-col items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl select-none text-center cursor-pointer transition-all duration-300" onclick="ArcSecurity.dismissPrivacyShield()" role="region" aria-label="Privacy Shield">
  <div class="max-w-sm w-full p-6 sm:p-7 rounded-2xl bg-slate-900/95 border border-cyan-500/40 shadow-2xl flex flex-col items-center space-y-3.5 backdrop-blur-xl">
    <div class="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 grid place-items-center text-cyan-400 text-2xl shadow-inner animate-pulse">
      <i class="fa-solid fa-eye-slash"></i>
    </div>
    <div>
      <h3 class="text-base font-black tracking-wider text-white">PRIVACY SHIELD ACTIVE</h3>
      <p class="text-xs text-slate-300 mt-1">Screen veiled to protect habits and personal notes from shoulder-surfing.</p>
    </div>
    <div class="pt-2 w-full">
      <span class="inline-flex items-center justify-center gap-1.5 w-full px-4 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-bold hover:bg-cyan-500/30 transition shadow-sm">
        <i class="fa-solid fa-hand-pointer"></i> Tap anywhere to reveal
      </span>
    </div>
  </div>
</div>

<!-- Cryptographic Secure Data Shredder Modal (Anti-Forensic Wipe) -->
<div id="pp-sec-shredder-modal" class="pp-modal" role="dialog" aria-modal="true" aria-label="Cryptographic Secure Shredder">
  <div class="pp-box max-w-md w-full">
    <div class="flex items-center gap-2 text-rose-400 font-black text-base mb-2">
      <i class="fa-solid fa-fire-flame-curved text-lg"></i>
      <h3>Cryptographic Data Shredder</h3>
    </div>
    <p class="text-xs text-slate-300 mb-3">
      Overwrites all local habits, reflections, tokens, and credentials with 3 passes of cryptographically secure pseudo-random noise before permanent destruction. Irreversible.
    </p>
    <div class="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs text-rose-300 space-y-1 mb-3">
      <div class="font-bold flex items-center gap-1.5"><i class="fa-solid fa-triangle-exclamation"></i> DATA LEAK DEFENSE PROTOCOL</div>
      <p class="text-[11px] text-slate-300">Pass 1: CSPRNG Random Noise Overwrite<br>Pass 2: Zeroization (0x00) Overwrite<br>Pass 3: Cryptographic Inversion (0xFF) &amp; Storage Purge</p>
    </div>
    <div class="space-y-1 mb-3">
      <label for="sec-shred-confirm-input" class="block text-[11px] font-semibold text-slate-400">Type <span class="text-rose-400 font-mono font-bold select-all">SHRED-ALL-DATA</span> to authorize:</label>
      <input id="sec-shred-confirm-input" type="text" autocomplete="off" class="w-full text-center text-sm font-mono tracking-wider px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-rose-300 focus:border-rose-400 focus:outline-none" placeholder="SHRED-ALL-DATA">
      <p id="sec-shred-err" class="text-xs text-rose-400 min-h-[1rem] font-mono"></p>
    </div>
    <div class="flex gap-2">
      <button type="button" id="btn-sec-shred-confirm" onclick="ArcSecurity.executeSecureShred()" class="pp-btn flex-1 text-rose-400 border-rose-500/40 hover:bg-rose-500/20 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">Execute Secure Shred</button>
      <button type="button" onclick="ArcSecurity.closeShredderModal()" class="pp-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">Cancel</button>
    </div>
  </div>
</div>

<!-- Forgot Password / Email Verification Modal -->
<div id="arc-forgot-modal" class="pp-modal z-[130]" role="dialog" aria-modal="true" aria-label="Forgot password and email verification">
  <div class="pp-box max-w-md w-full">
    <div class="flex items-center gap-2 text-cyan-400 font-black text-base mb-2">
      <i class="fa-solid fa-envelope-circle-check text-lg"></i>
      <h3>Account Verification &amp; Password Reset</h3>
    </div>
    <p class="text-xs text-slate-300 mb-3">Reset your security password via your logged-in Google / Arc account.</p>

    <!-- Logged in account banner -->
    <div id="arc-forgot-account-card" class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3 mb-3">
      <!-- Injected with current user name and email -->
    </div>

    <!-- Dispatch status & offline code banner -->
    <div id="arc-forgot-dispatch-info" class="space-y-2 mb-3">
      <p class="text-xs text-slate-300" id="arc-forgot-dispatch-text">
        We sent a 6-digit verification code to your email. Enter it below to unlock and change your password.
      </p>
      <div id="arc-forgot-offline-badge" class="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-xs text-cyan-300 flex items-center justify-between font-mono">
        <span>Security Recovery Code:</span>
        <strong id="arc-forgot-code-disp" class="text-white text-base tracking-widest font-black">123456</strong>
      </div>
    </div>

    <!-- Code Input -->
    <div class="space-y-1 mb-3">
      <label for="arc-forgot-otp-input" class="block text-[11px] font-semibold text-slate-400">Enter 6-Digit Verification Code</label>
      <input id="arc-forgot-otp-input" type="text" maxlength="6" inputmode="numeric" class="w-full text-center text-xl font-mono tracking-widest px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 focus:border-cyan-400 focus:outline-none" placeholder="000000">
    </div>

    <!-- New Password Fields Directly on Reset Page -->
    <div class="space-y-3 mb-3 pt-2 border-t border-slate-800/80">
      <div>
        <div class="flex items-center justify-between mb-1">
          <label for="arc-forgot-new-pass" class="text-[11px] font-semibold text-slate-400">New Password or PIN (Min 4 characters)</label>
          <span class="text-[10px] text-cyan-400/90 font-mono">Numbers or text</span>
        </div>
        <div class="relative">
          <input id="arc-forgot-new-pass" type="password" maxlength="64" class="pp-in pr-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 font-mono" placeholder="Enter new password or PIN">
          <button type="button" onclick="ArcSecurity.togglePassVisible('arc-forgot-new-pass')" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1" title="Show/Hide Password"><i class="fa-solid fa-eye"></i></button>
        </div>
      </div>
      <div>
        <label for="arc-forgot-confirm-pass" class="block text-[11px] font-semibold text-slate-400 mb-1">Confirm New Password / PIN</label>
        <div class="relative">
          <input id="arc-forgot-confirm-pass" type="password" maxlength="64" class="pp-in pr-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 font-mono" placeholder="Re-enter new password or PIN">
          <button type="button" onclick="ArcSecurity.togglePassVisible('arc-forgot-confirm-pass')" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1" title="Show/Hide Password"><i class="fa-solid fa-eye"></i></button>
        </div>
      </div>
      <p id="arc-forgot-err" class="text-xs text-rose-400 min-h-[1.25rem] font-mono"></p>
    </div>

    <div class="flex gap-2">
      <button type="button" onclick="ArcSecurity.verifyRecoveryCode()" class="pp-btn flex-1 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black border-none font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
        <i class="fa-solid fa-key"></i> Reset &amp; Save New Password
      </button>
      <button type="button" onclick="ArcSecurity.closeForgotPasswordModal()" class="pp-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">Cancel</button>
    </div>
  </div>
</div>

<!-- FIRST-TIME SIGN UP & TERMS AND CONDITIONS MODAL -->
<div id="arc-terms-signup-modal" class="pp-modal z-[140]" role="dialog" aria-modal="true" aria-label="First-Time Sign Up and Terms and Conditions Agreement">
  <div class="pp-box max-w-lg w-full max-h-[94vh] overflow-y-auto p-4 sm:p-5 bg-slate-950/98 border-2 border-cyan-500/50 rounded-2xl shadow-[0_20px_60px_rgba(0,240,255,0.25)] backdrop-blur-2xl">
    
    <!-- Modal Header -->
    <div class="flex items-start justify-between gap-3 mb-2.5 border-b border-slate-800 pb-2.5">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
            First-Time Operative Setup
          </span>
          <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            Protocol v2026.1
          </span>
        </div>
        <h3 class="text-base sm:text-lg font-black text-white flex items-center gap-2">
          <i class="fa-solid fa-file-shield text-cyan-400"></i>
          <span>Operative Sign-Up &amp; Terms Agreement</span>
        </h3>
      </div>
      <div class="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
        <i class="fa-solid fa-user-astronaut"></i>
      </div>
    </div>

    <p class="text-[11px] sm:text-xs text-slate-300 leading-relaxed mb-3">
      Welcome to the <strong>Arc Tracker 2026</strong> protocol. Declare your operative call-sign and accept the covenant of self-discipline, local privacy, and focus shields.
    </p>

    <!-- Operative Profile Quick Registration Fields -->
    <div class="space-y-2 mb-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800/80">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label for="terms-signup-name" class="block text-[10px] font-semibold text-slate-400 mb-1">Call-Sign / Display Name</label>
          <input id="terms-signup-name" type="text" maxlength="32" spellcheck="false" autocomplete="off" value="Operative" class="pp-in w-full text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" placeholder="e.g. Alex Rivera">
        </div>
        <div>
          <label for="terms-signup-handle" class="block text-[10px] font-semibold text-slate-400 mb-1">Username Handle (@)</label>
          <div class="relative">
            <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-cyan-400 font-mono text-xs font-bold pointer-events-none select-none">@</span>
            <input id="terms-signup-handle" type="text" maxlength="24" spellcheck="false" autocomplete="off" value="operative" class="pp-in w-full pl-6 text-xs font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" placeholder="handle">
          </div>
        </div>
      </div>
      <div>
        <label for="terms-signup-motto" class="block text-[10px] font-semibold text-slate-400 mb-1">Personal Lock-In Motto</label>
        <input id="terms-signup-motto" type="text" maxlength="80" value="Transform in Silence." class="pp-in w-full text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" placeholder="e.g. Quiet discipline yields loud results.">
      </div>
    </div>

    <!-- Terms & Conditions Summary Scrollable Box -->
    <div class="mb-3">
      <div class="flex items-center justify-between mb-1">
        <span class="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <i class="fa-solid fa-scroll text-cyan-400"></i> Covenant of Terms &amp; Conditions
        </span>
        <button type="button" onclick="ArcTermsOnboarding.openTermsReader()" class="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-medium">
          Read Full Terms &rarr;
        </button>
      </div>

      <div class="max-h-24 sm:max-h-28 overflow-y-auto p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 space-y-1.5 select-text leading-relaxed no-scrollbar border-l-2 border-l-cyan-400">
        <div>
          <strong class="text-white block font-semibold mb-0.5">1. Local Data Sovereignty &amp; Zero Exfiltration</strong>
          <span>All habits, streaks, check-in journals, and screen time telemetry remain 100% on your device local storage. Arc Tracker never sells or transfers your personal behavior data to external servers.</span>
        </div>
        <div>
          <strong class="text-white block font-semibold mb-0.5">2. Focus Shield &amp; Application Lockout Authorization</strong>
          <span>By initiating a Focus Session or enabling Strict Focus Mode, you authorize Arc Tracker to monitor foreground app titles and active browser domains to enforce distraction lockout shields.</span>
        </div>
        <div>
          <strong class="text-white block font-semibold mb-0.5">3. Truthful Habit Execution &amp; Progression</strong>
          <span>Levels, XP, rank titles, and badges represent your honest commitment to self-discipline and real-world execution.</span>
        </div>
        <div>
          <strong class="text-white block font-semibold mb-0.5">4. Security PIN &amp; Client-Side Backup Custody</strong>
          <span>You are the sole custodian of your Security PIN, emergency recovery codes, and AES-256 backup passwords. Lost encryption passcodes cannot be retrieved by third parties.</span>
        </div>
        <div>
          <strong class="text-white block font-semibold mb-0.5">5. Offline Operation &amp; Optional Cloud Sync</strong>
          <span>Arc Tracker runs 100% offline. Optional Google Account connection uses Google Drive AppData folder isolated strictly to your authenticated devices.</span>
        </div>
      </div>
    </div>

    <!-- Checkbox Agreement -->
    <div class="space-y-1.5 mb-3">
      <label class="flex items-start gap-2.5 p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 hover:border-cyan-400/60 cursor-pointer transition select-none group">
        <input id="arc-terms-checkbox" type="checkbox" onchange="ArcTermsOnboarding.handleCheckboxChange(this)" class="mt-0.5 w-4 h-4 rounded text-cyan-500 border-slate-700 bg-slate-900 focus:ring-cyan-400 cursor-pointer">
        <span class="text-xs text-slate-200 leading-snug">
          I have read, understood, and accept the <a href="./terms-and-conditions.html" target="_blank" class="text-cyan-400 underline font-bold hover:text-cyan-300" onclick="event.stopPropagation()">Terms and Conditions</a>, Operative Protocol rules, and the <a href="./privacy-policy.html" target="_blank" class="text-cyan-400 underline font-bold hover:text-cyan-300" onclick="event.stopPropagation()">Privacy Policy</a>.
        </span>
      </label>
      <p id="arc-terms-error-msg" class="text-xs text-rose-400 font-mono min-h-[1rem]"></p>
    </div>

    <!-- Actions -->
    <div class="flex gap-2">
      <button type="button" id="btn-accept-terms-signup" onclick="ArcTermsOnboarding.acceptAndRegister()" class="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-cyan-500/25">
        <i class="fa-solid fa-shield-check"></i>
        <span>Accept Terms &amp; Enter Arc Tracker</span>
      </button>
    </div>
  </div>
</div>

<!-- IN-APP TERMS AND CONDITIONS FULL READER MODAL -->
<div id="arc-terms-reader-modal" class="pp-modal z-[140]" role="dialog" aria-modal="true" aria-label="Arc Tracker Terms and Conditions Review">
  <div class="pp-box max-w-2xl w-full p-4 sm:p-6 bg-slate-950/98 border border-cyan-500/40 rounded-2xl shadow-2xl backdrop-blur-2xl">
    <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
      <div class="flex items-center gap-2 text-cyan-400 font-black text-base">
        <i class="fa-solid fa-file-contract text-lg"></i>
        <h3>Arc Tracker Terms &amp; Conditions (Protocol v2026.2)</h3>
      </div>
      <button type="button" onclick="ArcTermsOnboarding.closeTermsReader()" class="text-slate-400 hover:text-white text-sm p-1"><i class="fa-solid fa-xmark"></i></button>
    </div>

    <div class="max-h-[55vh] overflow-y-auto space-y-3.5 pr-2 text-xs text-slate-300 select-text leading-relaxed">
      <div class="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
        <h4 class="font-bold text-cyan-300 mb-1">Covenant of Self-Discipline, Privacy &amp; Local Sovereignty</h4>
        <p>By registering or using Arc Tracker, you agree to these Terms and Conditions. Arc Tracker is an airgapped, high-accountability operating system designed for self-mastery, screen time moderation, and habit execution.</p>
      </div>

      <div class="space-y-1">
        <h5 class="font-bold text-white text-sm">01. First-Time Registration &amp; Operative Identity</h5>
        <p>You choose a display name, handle (@operative), and lock-in motto stored locally on your device. Participation in the Winter Arc and Summer Arc protocols is voluntary and intended solely for personal self-improvement.</p>
      </div>

      <div class="space-y-1">
        <h5 class="font-bold text-white text-sm">02. Local Data Sovereignty &amp; Zero Exfiltration</h5>
        <p>100% of habit data, check-ins, journal notes, and screen time records reside on your personal device hardware (LocalStorage, IndexedDB, and Tauri Store). No data is covertly sold, tracked, or monetized.</p>
      </div>

      <div class="space-y-1">
        <h5 class="font-bold text-white text-sm">03. Multi-User Account Governance &amp; Shared Devices</h5>
        <p>Operative profiles on a shared terminal operate in isolated storage partitions. Each user is responsible for locking their account with a PIN. Arc Gold VIP binds to up to 2 authorized profiles per device.</p>
      </div>

      <div class="space-y-1">
        <h5 class="font-bold text-white text-sm">04. Focus Mode &amp; Application Lockout Authorization</h5>
        <p>Enabling Focus Sessions or Strict Mode authorizes Arc Tracker to inspect foreground distraction apps and active browser tabs in volatile memory, actively shielding distractions according to your custom blocklist rules.</p>
      </div>

      <div class="space-y-1">
        <h5 class="font-bold text-white text-sm">05. Optional Cloud Sync &amp; End-to-End Encryption</h5>
        <p>Sync via Google Drive AppData or private server is opt-in and client-side encrypted (AES-256-GCM / PBKDF2). You are the sole custodian of your password; lost keys cannot be recovered by third parties.</p>
      </div>

      <div class="space-y-1">
        <h5 class="font-bold text-white text-sm">06. Leaderboards, Groups &amp; Fair Execution (Level 10+)</h5>
        <p>Leaderboard and group features unlock at Level 10. You agree to honest check-ins without bot automation or clock-tampering. Only aggregate XP and level ranks are shared under your chosen handle.</p>
      </div>

      <div class="space-y-1">
        <h5 class="font-bold text-white text-sm">07. Arc Gold VIP &amp; Customization</h5>
        <p>Gold VIP unlocks 4K wallpapers, custom avatar lining rings, Black &amp; White Monochrome mode, 120Hz ProMotion UI responsiveness, and advanced exports without deceptive auto-renewals.</p>
      </div>

      <div class="space-y-1">
        <h5 class="font-bold text-white text-sm">08. Security PIN, Two-Factor Authentication &amp; Backups</h5>
        <p>You are the sole custodian of your PIN and 2FA recovery codes. Backups use client-side AES-256 encryption. Anti-spy keypad layouts and 45s clipboard wipes safeguard credentials.</p>
      </div>

      <div class="space-y-1">
        <h5 class="font-bold text-white text-sm">09. Health &amp; Wellness Disclaimer</h5>
        <p>Arc Tracker is a self-discipline productivity tool and does not provide medical, psychiatric, or clinical addiction advice. Consult healthcare professionals for health concerns.</p>
      </div>
    </div>

    <div class="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
      <span id="arc-terms-reader-status" class="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1.5">
        <i class="fa-solid fa-check"></i> Terms Accepted (v2026.2)
      </span>
      <div class="flex gap-2">
        <a href="./terms-and-conditions.html" target="_blank" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Open Full Document
        </a>
        <button type="button" onclick="ArcTermsOnboarding.closeTermsReader()" class="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition">
          Close
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Choose Operative Details Modal -->
<div id="arc-profile-setup-modal" class="pp-modal" role="dialog" aria-modal="true" aria-label="Customize user profile and username" onclick="if(event.target===this)ArcProfile.closeSetupModal()">
  <div class="pp-box max-w-md w-full">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2 text-cyan-400 font-black text-base">
        <i class="fa-solid fa-user-astronaut text-lg"></i>
        <h3>Operative Identity Setup</h3>
      </div>
      <button type="button" onclick="ArcProfile.closeSetupModal()" class="text-slate-400 hover:text-white text-sm"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <p class="text-xs text-slate-300 mb-4">Personalize your display name and unique @username handle across all your synced devices.</p>

    <!-- Live Preview Card -->
    <div class="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-indigo-950/50 border border-cyan-500/30 flex items-center gap-3.5 mb-4 shadow-inner">
      <div id="arc-preview-avatar" class="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white font-black text-lg flex items-center justify-center border-2 border-cyan-400 shadow-lg overflow-hidden shrink-0">
        O
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <h4 id="arc-preview-name" class="font-extrabold text-sm text-white truncate">Operative</h4>
          <span id="arc-preview-rank-tag" class="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono">Lv. 1</span>
        </div>
        <p id="arc-preview-username" class="text-xs text-cyan-400 font-mono">@operative</p>
        <p id="arc-preview-email" class="text-[10px] text-slate-400 truncate">user@gmail.com</p>
      </div>
    </div>

    <div class="space-y-3 mb-4">
      <div>
        <label for="arc-input-display-name" class="block text-[11px] font-semibold text-slate-400 mb-1">Display Profile Name</label>
        <input id="arc-input-display-name" type="text" maxlength="32" spellcheck="false" autocomplete="off" oninput="ArcProfile.handleLivePreview()" class="pp-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 font-medium" placeholder="Your Name or Call-Sign">
      </div>
      <div>
        <div class="flex items-center justify-between mb-1">
          <label for="arc-input-username" class="text-[11px] font-semibold text-slate-400">Username Handle (@)</label>
          <span class="text-[10px] text-slate-400 font-mono">Letters, numbers, underscores</span>
        </div>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 font-mono font-bold text-sm pointer-events-none select-none">@</span>
          <input id="arc-input-username" type="text" maxlength="24" spellcheck="false" autocomplete="off" oninput="ArcProfile.handleLivePreview()" class="pp-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 font-mono" placeholder="username">
        </div>
      </div>
      <div>
        <label for="arc-select-title" class="block text-[11px] font-semibold text-slate-400 mb-1">Operative Title / Rank</label>
        <select id="arc-select-title" onchange="ArcProfile.handleLivePreview()" class="pp-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
          <option value="Shadow Initiate">Shadow Initiate (Focus Cultivator)</option>
          <option value="Iron Vanguard">Iron Vanguard (Habit Sentinel)</option>
          <option value="Dopamine Aegis">Dopamine Aegis (Attention Defender)</option>
          <option value="Apex Sovereign">Apex Sovereign (Execution Master)</option>
          <option value="Titan of Discipline">Titan of Discipline (Zero Procrastination)</option>
        </select>
      </div>
      <div>
        <label for="arc-input-motto" class="block text-[11px] font-semibold text-slate-400 mb-1">Personal Lock-In Motto</label>
        <input id="arc-input-motto" type="text" maxlength="80" class="pp-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 text-xs" placeholder="Transform in Silence.">
      </div>

      <!-- VIP Avatar Outer Ring Lining (Arc Gold Exclusive) -->
      <div id="arc-pfp-ring-section" class="p-3 rounded-xl border border-slate-700/60 bg-slate-900/60 transition-all">
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-1.5">
            <i class="fa-solid fa-circle-notch text-amber-400 text-xs"></i>
            <span class="text-[11px] font-bold text-slate-200">Avatar Outer Lining Ring</span>
          </div>
          <span id="arc-pfp-ring-badge" class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
            <i class="fa-solid fa-crown text-[8px]"></i> Arc Gold VIP
          </span>
        </div>
        <p id="arc-pfp-ring-desc" class="text-[10px] text-slate-400 mb-2.5">
          Arc Gold default is Royal Gold. Customize your outer lining ring and glow below.
        </p>

        <!-- Ring Options Grid -->
        <div id="arc-pfp-ring-options" class="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
          <button type="button" onclick="ArcProfile.selectRingStyle('gold')" data-ring="gold" class="arc-ring-option p-1.5 rounded-xl border border-amber-400/50 bg-amber-500/10 hover:bg-amber-500/20 flex flex-col items-center justify-center gap-1 transition-all" title="Royal Gold (VIP Default)">
            <span class="w-4 h-4 rounded-full border-2 border-amber-400 bg-amber-400/30 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
            <span class="text-[9px] font-bold text-amber-300">Gold</span>
          </button>
          <button type="button" onclick="ArcProfile.selectRingStyle('diamond')" data-ring="diamond" class="arc-ring-option p-1.5 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800/50 flex flex-col items-center justify-center gap-1 transition-all" title="Diamond Ice">
            <span class="w-4 h-4 rounded-full border-2 border-sky-300 bg-sky-400/30 shadow-[0_0_8px_rgba(56,189,248,0.8)]"></span>
            <span class="text-[9px] font-bold text-slate-300">Diamond</span>
          </button>
          <button type="button" onclick="ArcProfile.selectRingStyle('amethyst')" data-ring="amethyst" class="arc-ring-option p-1.5 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800/50 flex flex-col items-center justify-center gap-1 transition-all" title="Neon Amethyst">
            <span class="w-4 h-4 rounded-full border-2 border-purple-400 bg-purple-400/30 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>
            <span class="text-[9px] font-bold text-slate-300">Amethyst</span>
          </button>
          <button type="button" onclick="ArcProfile.selectRingStyle('emerald')" data-ring="emerald" class="arc-ring-option p-1.5 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800/50 flex flex-col items-center justify-center gap-1 transition-all" title="Emerald Matrix">
            <span class="w-4 h-4 rounded-full border-2 border-emerald-400 bg-emerald-400/30 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            <span class="text-[9px] font-bold text-slate-300">Emerald</span>
          </button>
          <button type="button" onclick="ArcProfile.selectRingStyle('ruby')" data-ring="ruby" class="arc-ring-option p-1.5 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800/50 flex flex-col items-center justify-center gap-1 transition-all" title="Crimson Flame">
            <span class="w-4 h-4 rounded-full border-2 border-rose-500 bg-rose-500/30 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
            <span class="text-[9px] font-bold text-slate-300">Crimson</span>
          </button>
          <button type="button" onclick="ArcProfile.selectRingStyle('aurora')" data-ring="aurora" class="arc-ring-option p-1.5 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800/50 flex flex-col items-center justify-center gap-1 transition-all" title="Cosmic Aurora">
            <span class="w-4 h-4 rounded-full border-2 border-pink-400 bg-pink-400/30 shadow-[0_0_8px_rgba(236,72,153,0.8)]"></span>
            <span class="text-[9px] font-bold text-slate-300">Aurora</span>
          </button>
        </div>

        <!-- Custom Color Picker Row -->
        <div id="arc-pfp-custom-color-row" class="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <label for="arc-input-ring-custom-color" class="text-[10px] font-medium text-slate-300 flex items-center gap-1.5 cursor-pointer">
            <i class="fa-solid fa-palette text-amber-400 text-xs"></i>
            <span>Custom Lining Color</span>
          </label>
          <div class="flex items-center gap-2">
            <span id="arc-ring-color-preview-hex" class="text-[10px] font-mono text-amber-300 font-bold">#F59E0B</span>
            <input type="color" id="arc-input-ring-custom-color" value="#F59E0B" onchange="ArcProfile.setCustomRingColor(this.value)" oninput="ArcProfile.setCustomRingColor(this.value)" class="w-7 h-7 rounded-lg cursor-pointer bg-transparent border border-slate-700 p-0.5">
          </div>
        </div>

        <!-- Non-Gold Lock Notice -->
        <div id="arc-pfp-ring-locked-banner" class="hidden mt-2 p-2 rounded-lg bg-amber-950/30 border border-amber-500/30 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 text-[10px] text-amber-200">
            <i class="fa-solid fa-lock text-amber-400"></i>
            <span>Outer lining unlocks with Arc Gold. Standard cyan active.</span>
          </div>
          <button type="button" onclick="ArcProfile.closeSetupModal(); if(window.ArcGold) window.ArcGold.scrollToGoldCard();" class="px-2 py-1 rounded bg-amber-500 text-slate-950 font-black text-[9px] hover:bg-amber-400 shrink-0">
            Get Gold
          </button>
        </div>
      </div>

      <!-- Terms & Conditions Status in Profile Setup -->
      <div class="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2 text-xs">
        <span class="text-slate-400 flex items-center gap-1.5 text-[11px]">
          <i class="fa-solid fa-file-contract text-cyan-400"></i>
          <span>Terms &amp; Conditions:</span>
        </span>
        <div class="flex items-center gap-2">
          <span id="arc-profile-terms-status" class="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
            <i class="fa-solid fa-check"></i> Accepted (v2026.1)
          </span>
          <button type="button" onclick="ArcTermsOnboarding.openTermsReader()" class="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-semibold">Review</button>
        </div>
      </div>
      <p id="arc-profile-modal-err" class="text-xs text-rose-400 min-h-[1.25rem] font-mono"></p>
    </div>

    <div class="flex gap-2">
      <button type="button" onclick="ArcProfile.saveProfile()" class="pp-btn flex-1 text-cyan-300 border-cyan-500/40 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">Save Identity Details</button>
      <button type="button" onclick="ArcProfile.closeSetupModal()" class="pp-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">Cancel</button>
    </div>
  </div>
</div>

<!-- Share This Tracker Modal -->
<div id="arc-share-modal" class="pp-modal" role="dialog" aria-modal="true" aria-label="Share Arc Tracker">
  <div class="pp-box max-w-lg w-full">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2 text-cyan-400 font-black text-base">
        <i class="fa-solid fa-share-nodes text-lg"></i>
        <h3>Share Your Arc Tracker</h3>
      </div>
      <button type="button" onclick="ArcShare.closeShareModal()" class="text-slate-400 hover:text-white text-sm"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <p class="text-xs text-slate-300 mb-4">Inspire others and hold yourself accountable. Share your lock-in stats or invite friends to transform with Arc Tracker.</p>

    <!-- Progress Snapshot Card Preview -->
    <div id="arc-share-snapshot-card" class="p-4 rounded-2xl bg-gradient-to-br from-[#0c1322] via-[#080d1a] to-[#150d22] border border-cyan-400/40 shadow-xl space-y-3 mb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white grid place-items-center font-black text-sm">❄️</div>
          <div>
            <h4 class="font-extrabold text-xs text-white">WINTER ARC 2026</h4>
            <span class="text-[10px] text-cyan-400 font-mono">Transform in Silence</span>
          </div>
        </div>
        <div class="text-right">
          <span id="share-card-user" class="text-xs font-bold text-white block">@operative</span>
          <span id="share-card-rank" class="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Lv. 1 • Shadow Initiate</span>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
        <div class="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
          <span class="text-[9px] text-slate-400 block">ACTIVE STREAK</span>
          <span id="share-card-streak" class="text-base font-black text-amber-400">3 Days</span>
        </div>
        <div class="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
          <span class="text-[9px] text-slate-400 block">DOPAMINE SHIELD</span>
          <span id="share-card-shield" class="text-base font-black text-cyan-400">100%</span>
        </div>
        <div class="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
          <span class="text-[9px] text-slate-400 block">ARC DAY</span>
          <span id="share-card-day" class="text-base font-black text-purple-300">25 / 92</span>
        </div>
      </div>
      <p class="text-[10px] text-slate-400 italic text-center pt-1">"He who conquers himself is the mightiest warrior."</p>
    </div>

    <!-- 1-Click Share Channels -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
      <button type="button" onclick="ArcShare.shareNative()" class="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex flex-col items-center justify-center gap-1 transition active:scale-95 shadow-md">
        <i class="fa-solid fa-arrow-up-from-bracket text-base"></i>
        <span>Share Device</span>
      </button>
      <button type="button" onclick="ArcShare.shareWhatsApp()" class="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 transition active:scale-95 shadow-md">
        <i class="fa-brands fa-whatsapp text-base"></i>
        <span>WhatsApp</span>
      </button>
      <button type="button" onclick="ArcShare.shareTwitter()" class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 transition active:scale-95 border border-slate-700">
        <i class="fa-brands fa-x-twitter text-base"></i>
        <span>X / Twitter</span>
      </button>
      <button type="button" onclick="ArcShare.shareTelegram()" class="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 transition active:scale-95 shadow-md">
        <i class="fa-brands fa-telegram text-base"></i>
        <span>Telegram</span>
      </button>
    </div>

    <div class="space-y-2">
      <button type="button" onclick="ArcShare.copyShareLink()" class="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-sm">
        <i class="fa-solid fa-link text-cyan-400"></i>
        <span id="arc-share-copy-link-label">Copy Tracker Web Link</span>
      </button>
      <button type="button" onclick="ArcShare.copyTextSummary()" class="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-sm">
        <i class="fa-solid fa-copy text-purple-400"></i>
        <span id="arc-share-copy-text-label">Copy Formatted Progress Report</span>
      </button>
    </div>
  </div>
</div>

<!-- Full-Screen Post-Unlock Cinematic Loading Overlay -->
<div id="arc-unlock-loader" class="fixed inset-0 z-[130] hidden flex-col items-center justify-center p-6 bg-slate-950/98 backdrop-blur-2xl select-none transition-opacity duration-500" role="status" aria-label="Loading application state">
  <div class="max-w-md w-full flex flex-col items-center text-center space-y-6">
    <!-- Animated Glowing Ring & Logo -->
    <div class="relative w-24 h-24 grid place-items-center">
      <div class="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin arc-loader-ring-outer"></div>
      <div class="absolute inset-2 rounded-full border-2 border-indigo-500/20 border-b-indigo-400 animate-spin arc-loader-ring-inner"></div>
      <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 grid place-items-center text-white text-2xl shadow-[0_0_25px_rgba(6,182,212,0.6)]">
        <i class="fa-solid fa-shield-halved"></i>
      </div>
    </div>

    <!-- Time-aware Greeting & Motivational Message -->
    <div class="space-y-2">
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-bold tracking-wider" id="arc-loader-badge">
        🌅 EARLY BIRD PROTOCOL ACTIVE
      </div>
      <h2 class="text-2xl sm:text-3xl font-black text-white tracking-tight" id="arc-loader-greeting">
        Good morning, early bird!
      </h2>
      <p class="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed" id="arc-loader-subtext">
        The sunrise belongs to those who discipline their mind before the world wakes. Initializing high-focus terminal...
      </p>
    </div>

    <!-- Progress Bar & Subsystem Step -->
    <div class="w-full space-y-2">
      <div class="flex items-center justify-between text-[11px] font-mono">
        <span class="text-slate-400" id="arc-loader-step">Verifying cryptographic state...</span>
        <span class="text-cyan-400 font-bold" id="arc-loader-pct">0%</span>
      </div>
      <div class="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden shadow-inner p-0.5">
        <div id="arc-loader-bar" class="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(6,182,212,0.8)] arc-loader-bar-initial"></div>
      </div>
    </div>
  </div>
</div>

<!-- Auto-Start Setup Modal -->
<div id="arc-autostart-modal" class="pp-modal" role="dialog" aria-modal="true" aria-label="Configure Auto-Start on Device Boot">
  <div class="pp-box max-w-lg w-full">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2 text-cyan-400 font-black text-base">
        <i class="fa-solid fa-power-off text-lg"></i>
        <h3>Launch When Device Turns On</h3>
      </div>
      <button type="button" onclick="ArcAutoStart.closeModal()" class="text-slate-400 hover:text-white text-sm"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <p class="text-xs text-slate-300 mb-4">Start Arc Tracker as soon as your computer or phone turns on. Keep your dopamine shield and habits active 24/7 without having to remember to open the app.</p>

    <!-- Platform specific instructions tab -->
    <div class="space-y-3 mb-4 text-xs">
      <!-- Windows PC -->
      <div class="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-2">
        <div class="flex items-center justify-between">
          <span class="font-bold text-white flex items-center gap-1.5"><i class="fa-brands fa-windows text-cyan-400"></i> Windows 10 / 11 (Automatic 1-Click)</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">RECOMMENDED</span>
        </div>
        <p class="text-[11px] text-slate-300">Download the 1-Click Windows Startup installer script. It automatically registers Arc Tracker into your personal Windows Startup folder (<code class="text-cyan-300 font-mono text-[10px]">shell:startup</code>).</p>
        <button type="button" onclick="ArcAutoStart.downloadWindowsStartupScript()" class="w-full py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md">
          <i class="fa-solid fa-download"></i>
          <span>Download 1-Click Windows Auto-Start (.bat)</span>
        </button>
      </div>

      <!-- Android Phone / Tablet -->
      <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
        <span class="font-bold text-white flex items-center gap-1.5"><i class="fa-brands fa-android text-emerald-400"></i> Android Phone &amp; Tablet</span>
        <ol class="text-[11px] text-slate-300 space-y-1 list-decimal list-inside">
          <li>Open device <b>Settings ➔ Apps ➔ Arc Tracker</b>.</li>
          <li>Tap <b>Battery ➔ Unrestricted / Allow background activity</b>.</li>
          <li>Enable <b>Auto-start / Launch on reboot</b> (on Xiaomi, OnePlus, Samsung &amp; Realme devices).</li>
          <li>In Recent Apps overview, tap the <b>Lock 🔒 icon</b> on Arc Tracker to keep it pinned in memory.</li>
        </ol>
      </div>

      <!-- macOS -->
      <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
        <span class="font-bold text-white flex items-center gap-1.5"><i class="fa-brands fa-apple text-slate-200"></i> Apple macOS</span>
        <p class="text-[11px] text-slate-300">Open <b>System Settings ➔ General ➔ Login Items</b>, click the <b>+</b> button under "Open at Login", and select <b>Arc Tracker</b>.</p>
      </div>
    </div>

    <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 mb-4">
      <div>
        <span class="text-xs font-bold text-white block">Auto-Start Setting Preference</span>
        <span class="text-[10px] text-slate-400">Record auto-start status in your operative profile</span>
      </div>
      <button type="button" onclick="ArcAutoStart.toggle()" id="arc-autostart-modal-toggle-btn" class="px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-extrabold text-xs">
        Enable
      </button>
    </div>

    <div class="flex gap-2">
      <button type="button" onclick="ArcAutoStart.closeModal()" class="pp-btn flex-1 text-cyan-300 border-cyan-500/40 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">Done</button>
    </div>
  </div>
</div>

<!-- Auto-Start Post-Unlock Polite Recommendation Modal -->
<div id="arc-autostart-prompt-modal" class="pp-modal" role="dialog" aria-modal="true" aria-label="Recommendation: Turn on auto-start">
  <div class="pp-box max-w-sm w-full text-center">
    <div class="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 grid place-items-center text-xl mx-auto mb-3 shadow-lg">
      <i class="fa-solid fa-power-off"></i>
    </div>
    <h3 class="text-base font-black text-white mb-1">Start Arc Tracker on Device Boot?</h3>
    <p class="text-xs text-slate-300 mb-4 leading-relaxed">
      Would you like Arc Tracker to automatically start when your device turns on? This guarantees your daily habits, screen time, and dopamine shield stay protected without manual intervention.
    </p>
    <div class="flex flex-col gap-2">
      <button type="button" onclick="ArcAutoStart.acceptPrompt()" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-extrabold text-xs uppercase tracking-wider transition active:scale-95 shadow-md">
        <i class="fa-solid fa-check mr-1"></i> Yes, Enable Auto-Start
      </button>
      <button type="button" onclick="ArcAutoStart.dismissPrompt()" class="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-medium text-xs transition">
        Maybe Later
      </button>
    </div>
  </div>
</div>

<!-- ==========================================================================
     INTERACTIVE PHONE APPLICATION HOMESCREEN SIMULATOR MODAL (IMAGE TWIN)
     ========================================================================== -->
<div id="arc-phone-simulator-modal" class="pp-modal" role="dialog" aria-modal="true" aria-label="Phone Application Homescreen & Widgets">
  <div class="relative my-auto flex flex-col items-center max-w-sm w-full animate-zoom-in">
    <!-- Top Close Bar -->
    <div class="w-full flex items-center justify-between mb-2 px-2 text-white">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="text-xs font-bold font-mono uppercase tracking-wider text-slate-300">Android 15 Phone Simulator</span>
      </div>
      <button type="button" onclick="ArcPhoneWidgets.closeSimulator()" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white grid place-items-center transition" title="Close Phone View">
        <i class="fa-solid fa-xmark text-sm"></i>
      </button>
    </div>

    <!-- Smartphone Bezel Frame -->
    <div class="arc-phone-frame w-full shadow-[0_0_80px_rgba(0,0,0,0.85)]">
      <!-- Top Speaker / Dynamic Notch -->
      <div class="arc-phone-notch"></div>

      <!-- Phone Screen with Mountain Wallpaper -->
      <div class="arc-phone-screen p-4 flex flex-col justify-between" id="arc-phone-sim-screen">
        <!-- 1. Android Status Bar -->
        <div class="flex items-center justify-between text-white text-[11px] font-sans px-1 pt-1 select-none z-10">
          <div class="flex items-center gap-1.5">
            <span id="phone-sim-status-time" class="font-bold">15:19</span>
            <i class="fa-solid fa-comment text-[10px] opacity-80"></i>
          </div>
          <div class="flex items-center gap-1.5 text-[10px]">
            <i class="fa-solid fa-bell text-[9px] opacity-80"></i>
            <span class="font-mono text-[9px] font-bold">VoWiFi 5G+</span>
            <div class="flex items-center gap-0.5 font-bold">
              <span class="text-[10px]">79%</span>
              <i class="fa-solid fa-battery-three-quarters text-emerald-400"></i>
            </div>
          </div>
        </div>

        <!-- 2. Phone Homescreen Widgets Area -->
        <div class="pt-3 space-y-2 z-10">
          <!-- Widget Switcher Tabs -->
          <div class="flex items-center justify-center gap-1 bg-black/40 backdrop-blur-md p-1 rounded-xl border border-white/10 text-[10px] font-mono">
            <button role="button" onclick="ArcPhoneWidgets.setSimWidgetTab('screentime'); playSfx('click')" id="sim-tab-screentime" class="px-2.5 py-1 rounded-lg bg-white/20 text-white font-bold transition">
              📊 Screen Time
            </button>
            <button role="button" onclick="ArcPhoneWidgets.setSimWidgetTab('focus'); playSfx('click')" id="sim-tab-focus" class="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white transition">
              ⚡ Focus Mode
            </button>
          </div>

          <!-- Embedded Widget 1: Screen Time Spent (on phone) -->
          <div id="sim-widget-screentime-container" class="phone-widget-card p-4 space-y-2.5">
            <div class="flex items-center justify-between gap-2">
              <div class="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg class="w-28 h-28 -rotate-90 transform" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="56" stroke="#27272a" stroke-width="14" fill="none" />
                  <circle id="sim-widget-svg-distracting" cx="80" cy="80" r="56" stroke="#f97316" stroke-width="14" fill="none" stroke-linecap="round" stroke-dasharray="134 352" stroke-dashoffset="0" />
                  <circle id="sim-widget-svg-productive" cx="80" cy="80" r="56" stroke="#22c55e" stroke-width="14" fill="none" stroke-linecap="round" stroke-dasharray="31 352" stroke-dashoffset="-138" />
                  <circle id="sim-widget-svg-others" cx="80" cy="80" r="56" stroke="#94a3b8" stroke-width="14" fill="none" stroke-linecap="round" stroke-dasharray="175 352" stroke-dashoffset="-173" />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                  <span id="sim-widget-total-val" class="text-2xl font-black font-sans text-white tracking-tight leading-none">51m</span>
                  <span class="text-[10px] text-slate-400 mt-0.5">Today's usage</span>
                </div>
              </div>
              <div class="flex-1 space-y-2 pl-1">
                <div class="flex items-start gap-2">
                  <span class="w-2 h-2 rounded-full bg-[#f97316] shrink-0 mt-1"></span>
                  <div class="leading-none">
                    <div id="sim-widget-distracting-time" class="text-sm font-black text-white font-sans">20m</div>
                    <div class="text-[10px] text-slate-400">Distracting</div>
                  </div>
                </div>
                <div class="flex items-start gap-2">
                  <span class="w-2 h-2 rounded-full bg-[#22c55e] shrink-0 mt-1"></span>
                  <div class="leading-none">
                    <div id="sim-widget-productive-time" class="text-sm font-black text-white font-sans">5m</div>
                    <div class="text-[10px] text-slate-400">Productive</div>
                  </div>
                </div>
                <div class="flex items-start gap-2">
                  <span class="w-2 h-2 rounded-full bg-[#94a3b8] shrink-0 mt-1"></span>
                  <div class="leading-none">
                    <div id="sim-widget-others-time" class="text-sm font-black text-white font-sans">25m</div>
                    <div class="text-[10px] text-slate-400">Others</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Embedded Widget 2: Focus Mode (on phone) -->
          <div id="sim-widget-focus-container" class="phone-widget-card p-4 space-y-2.5 hidden">
            <div class="flex items-center justify-between gap-2">
              <div class="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg class="w-28 h-28 -rotate-90 transform" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="56" stroke="#27272a" stroke-width="14" fill="none" />
                  <circle id="sim-widget-svg-focus" cx="80" cy="80" r="56" stroke="#a855f7" stroke-width="14" fill="none" stroke-linecap="round" stroke-dasharray="90 352" stroke-dashoffset="0" />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                  <span id="sim-widget-focus-val" class="text-xl font-black font-sans text-purple-200 tracking-tight leading-none">OFF</span>
                  <span id="sim-widget-focus-sub" class="text-[10px] text-slate-400 mt-0.5">Focus Mode</span>
                </div>
              </div>
              <div class="flex-1 space-y-2 pl-1">
                <div>
                  <div id="sim-widget-focus-status" class="text-xs font-black text-white">Focus Standby</div>
                  <div id="sim-widget-focus-desc" class="text-[10px] text-slate-400">8 Apps Blocked</div>
                </div>
                <button role="button" id="sim-widget-toggle-focus-btn" onclick="ArcPhoneWidgets.toggleFocus()" class="w-full py-2 px-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition">
                  <i class="fa-solid fa-bolt"></i> Turn On Focus
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. App Icons Grid (Exactly matching screenshot!) -->
        <div class="py-3 space-y-3 z-10">
          <!-- Row 1: Settings, My Files, Gemini, Music -->
          <div class="grid grid-cols-4 gap-2 text-center">
            <div class="flex flex-col items-center cursor-pointer group" onclick="ArcPhoneWidgets.handlePhoneAppClick('settings')">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition">
                <i class="fa-solid fa-sliders text-lg"></i>
              </div>
              <span class="text-[10px] text-white mt-1 font-medium truncate w-14">Settings</span>
            </div>

            <div class="flex flex-col items-center cursor-pointer group" onclick="ArcPhoneWidgets.handlePhoneAppClick('files')">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition">
                <i class="fa-solid fa-folder text-lg"></i>
              </div>
              <span class="text-[10px] text-white mt-1 font-medium truncate w-14">My Files</span>
            </div>

            <div class="flex flex-col items-center cursor-pointer group" onclick="ArcPhoneWidgets.handlePhoneAppClick('gemini')">
              <div class="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-500 shadow-md group-hover:scale-105 transition">
                <i class="fa-solid fa-wand-magic-sparkles text-xl text-blue-500"></i>
              </div>
              <span class="text-[10px] text-white mt-1 font-medium truncate w-14">Gemini</span>
            </div>

            <div class="flex flex-col items-center cursor-pointer group" onclick="ArcPhoneWidgets.handlePhoneAppClick('music')">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-b from-orange-400 to-orange-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition">
                <i class="fa-solid fa-music text-lg"></i>
              </div>
              <span class="text-[10px] text-white mt-1 font-medium truncate w-14">Music</span>
            </div>
          </div>

          <!-- Row 2: Tools, Featured, Facebook, Amazon -->
          <div class="grid grid-cols-4 gap-2 text-center">
            <div class="flex flex-col items-center cursor-pointer group" onclick="ArcPhoneWidgets.handlePhoneAppClick('tools')">
              <div class="w-12 h-12 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/20 p-1.5 grid grid-cols-2 gap-1 group-hover:scale-105 transition">
                <div class="w-3.5 h-3.5 rounded bg-rose-500"></div>
                <div class="w-3.5 h-3.5 rounded bg-amber-400"></div>
                <div class="w-3.5 h-3.5 rounded bg-cyan-400"></div>
                <div class="w-3.5 h-3.5 rounded bg-emerald-400"></div>
              </div>
              <span class="text-[10px] text-white mt-1 font-medium truncate w-14">Tools</span>
            </div>

            <div class="flex flex-col items-center cursor-pointer group" onclick="ArcPhoneWidgets.handlePhoneAppClick('featured')">
              <div class="w-12 h-12 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/20 p-1.5 grid grid-cols-2 gap-1 group-hover:scale-105 transition">
                <div class="w-3.5 h-3.5 rounded bg-indigo-500"></div>
                <div class="w-3.5 h-3.5 rounded bg-rose-400"></div>
                <div class="w-3.5 h-3.5 rounded bg-purple-500"></div>
                <div class="w-3.5 h-3.5 rounded bg-cyan-300"></div>
              </div>
              <span class="text-[10px] text-white mt-1 font-medium truncate w-14">Featured</span>
            </div>

            <div class="flex flex-col items-center cursor-pointer group relative" onclick="ArcPhoneWidgets.handlePhoneAppClick('facebook')">
              <div class="w-12 h-12 rounded-2xl bg-[#1877f2] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition relative">
                <i class="fa-brands fa-facebook-f text-2xl font-bold"></i>
                <span class="sim-lock-badge absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center hidden"><i class="fa-solid fa-lock text-[9px]"></i></span>
              </div>
              <span class="text-[10px] text-white mt-1 font-medium truncate w-14">Facebook</span>
            </div>

            <div class="flex flex-col items-center cursor-pointer group relative" onclick="ArcPhoneWidgets.handlePhoneAppClick('amazon')">
              <div class="w-12 h-12 rounded-2xl bg-[#fcd200] text-black flex items-center justify-center shadow-md group-hover:scale-105 transition relative">
                <i class="fa-brands fa-amazon text-2xl"></i>
                <span class="sim-lock-badge absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center hidden"><i class="fa-solid fa-lock text-[9px]"></i></span>
              </div>
              <span class="text-[10px] text-white mt-1 font-medium truncate w-14">Amazon</span>
            </div>
          </div>

          <!-- Row 3: Strava, Theme Store -->
          <div class="grid grid-cols-4 gap-2 text-center">
            <div class="flex flex-col items-center cursor-pointer group" onclick="ArcPhoneWidgets.handlePhoneAppClick('strava')">
              <div class="w-12 h-12 rounded-2xl bg-[#fc5200] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition">
                <i class="fa-brands fa-strava text-2xl"></i>
              </div>
              <span class="text-[10px] text-white mt-1 font-medium truncate w-14">Strava</span>
            </div>

            <div class="flex flex-col items-center cursor-pointer group" onclick="ArcPhoneWidgets.handlePhoneAppClick('theme-store')">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-b from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition">
                <i class="fa-solid fa-paintbrush text-lg"></i>
              </div>
              <span class="text-[10px] text-white mt-1 font-medium truncate w-14">Theme Store</span>
            </div>
          </div>
        </div>

        <!-- 4. Bottom Dock & Navigation Bar -->
        <div class="space-y-2 pt-2 z-10">
          <div class="text-center text-white/50 text-xs">
            <i class="fa-solid fa-chevron-up"></i>
          </div>

          <!-- Dock (Chrome, Camera) -->
          <div class="flex items-center justify-center gap-6 py-1">
            <div class="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition" onclick="ArcPhoneWidgets.handlePhoneAppClick('chrome')">
              <i class="fa-brands fa-chrome text-2xl text-blue-500"></i>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-900 border border-slate-600 flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-105 transition" onclick="ArcPhoneWidgets.handlePhoneAppClick('camera')">
              <i class="fa-solid fa-camera text-xl"></i>
            </div>
          </div>

          <!-- Android 3-Button Navigation Bar -->
          <div class="flex items-center justify-around py-1 text-white/60 text-xs border-t border-white/10 select-none">
            <button role="button" onclick="ArcPhoneWidgets.closeSimulator()" class="p-1 hover:text-white transition" title="Back">
              <i class="fa-solid fa-chevron-left"></i>
            </button>
            <button role="button" onclick="ArcPhoneWidgets.closeSimulator()" class="p-1 hover:text-white transition" title="Home">
              <i class="fa-regular fa-circle text-sm"></i>
            </button>
            <button role="button" onclick="ArcPhoneWidgets.openSimulator()" class="p-1 hover:text-white transition" title="Recent Tasks">
              <i class="fa-regular fa-square text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


<div id="rpg-levelup-overlay" role="dialog" aria-modal="true" class="fixed inset-0 z-50 hidden bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto">
  <div class="relative max-w-md w-full rounded-3xl p-6 sm:p-8 text-center space-y-6 border-2 border-amber-400/80 shadow-[0_0_60px_rgba(245,158,11,0.4)] bg-gradient-to-b from-[#1E192B] via-[#0E1322] to-[#060913] animate-zoom-in overflow-hidden">
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none animate-spin-slow"></div>
    <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none animate-spin-slow"></div>

    <div class="space-y-1.5 relative z-10">
      <span class="inline-block px-4 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50 text-[11px] font-mono font-extrabold tracking-widest uppercase animate-pulse">
        ⚡ ASCENSION ACHIEVED ⚡
      </span>
      <h2 class="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
        LEVEL UP!
      </h2>
      <p id="levelup-tier-headline" class="text-xs sm:text-sm text-cyan-300 font-bold uppercase tracking-wider">
        Shadow Initiate
      </p>
    </div>

    <!-- Center Hero Badge -->
    <div class="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto my-2 flex items-center justify-center relative z-10">
      <div class="absolute inset-0 rounded-full border-4 border-amber-400/40 animate-ping"></div>
      <div class="w-full h-full rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-cyan-400 p-1 shadow-2xl flex items-center justify-center">
        <div class="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center">
          <span id="levelup-icon" class="text-3xl sm:text-4xl">👑</span>
          <span id="levelup-number" class="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">LVL 2</span>
        </div>
      </div>
    </div>

    <!-- Rewards & Unlocks Showcase -->
    <div class="space-y-2 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 text-left text-xs relative z-10">
      <div class="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
        <i class="fa-solid fa-gift"></i> Unlocked Operative Perks:
      </div>
      <div class="flex items-center justify-between text-slate-200">
        <span>+ Attribute Points Boost:</span>
        <strong class="text-emerald-400 font-mono">+25 All Stats</strong>
      </div>
      <div class="flex items-center justify-between text-slate-200">
        <span>Active Streak Multiplier:</span>
        <strong id="levelup-bonus-text" class="text-purple-300 font-mono">×1.15 XP</strong>
      </div>
      <div id="levelup-perk-notice" class="pt-1 border-t border-slate-800 text-[11px] text-cyan-300 font-semibold">
        ✨ New Buff: Adrenaline Surge active!
      </div>
      <!-- Level 10 Leaderboard Unlock Note -->
      <div id="levelup-leaderboard-unlock-note" class="hidden p-2 rounded-xl bg-amber-500/20 border border-amber-400/50 text-[11px] text-amber-200 font-bold flex items-center justify-center gap-1.5 animate-pulse">
        <i class="fa-solid fa-trophy text-amber-400 text-xs shrink-0"></i>
        <span>Leaderboards are now unlocked</span>
      </div>
    </div>

    <button role="button" onclick="closeLevelUpModal()" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black font-black text-sm uppercase tracking-wider transition shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-95 relative z-10">
      Claim Glory &amp; Continue <i class="fa-solid fa-arrow-right ml-1"></i>
    </button>
  </div>
</div>

<!-- EXPORTABLE VICTORY CERTIFICATE MODAL -->
<div id="rpg-victory-cert-modal" role="dialog" aria-modal="true" class="fixed inset-0 z-50 hidden bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
  <div class="max-w-xl w-full my-auto space-y-4">
    <div class="flex items-center justify-between">
      <span class="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
        <i class="fa-solid fa-award"></i> Verified Victory Snapshot
      </span>
      <button role="button" onclick="closeVictoryCertModal()" class="text-slate-400 hover:text-white p-2 transition" aria-label="Close Victory Certificate" title="Close Victory Certificate"><i class="fa-solid fa-xmark text-xl"></i></button>
    </div>

    <div id="rpg-cert-card-render" class="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#161B2E] via-[#0E1322] to-[#080B14] cert-gold-border shadow-[0_0_50px_rgba(245,158,11,0.25)] text-center space-y-5">
      <div class="space-y-1">
        <div class="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-mono font-extrabold uppercase tracking-widest">
          OFFICIAL ARC VICTORY CERTIFICATE
        </div>
        <h2 id="cert-heading" class="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
          WINTER ARC SOVEREIGN
        </h2>
        <p class="text-xs text-slate-300 font-medium">Presented in recognition of unwavering discipline and execution.</p>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
        <div class="p-3 rounded-2xl bg-slate-900/90 border border-amber-500/30">
          <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Hours</span>
          <div id="cert-stat-hours" class="text-base sm:text-lg font-black text-amber-300 font-mono mt-0.5">0h 0m</div>
        </div>
        <div class="p-3 rounded-2xl bg-slate-900/90 border border-amber-500/30">
          <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Highest Streak</span>
          <div id="cert-stat-streak" class="text-base sm:text-lg font-black text-white font-mono mt-0.5">0 Days</div>
        </div>
        <div class="p-3 rounded-2xl bg-slate-900/90 border border-amber-500/30">
          <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Level Achieved</span>
          <div id="cert-stat-level" class="text-base sm:text-lg font-black text-cyan-300 font-mono mt-0.5">Lv. 1</div>
        </div>
        <div class="p-3 rounded-2xl bg-slate-900/90 border border-amber-500/30">
          <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Arc Grade</span>
          <div id="cert-stat-grade" class="text-base sm:text-lg font-black text-emerald-400 font-mono mt-0.5">GRADE S</div>
        </div>
      </div>

      <div class="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-around text-xs font-mono">
        <span class="text-cyan-300">STR: <strong id="cert-attr-str" class="text-white">0</strong></span>
        <span class="text-purple-300">INT: <strong id="cert-attr-int" class="text-white">0</strong></span>
        <span class="text-teal-300">DEX: <strong id="cert-attr-dex" class="text-white">0</strong></span>
        <span class="text-amber-300">WIL: <strong id="cert-attr-wil" class="text-white">0</strong></span>
      </div>

      <div class="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-1">
        <span class="text-[9px] font-bold uppercase text-amber-400 font-mono block">Final Mindset Inscription</span>
        <blockquote id="cert-mindset-quote" class="text-xs italic text-slate-200 leading-snug">
          "Quiet discipline in the cold dark yields results that speak loudly in the light."
        </blockquote>
        <p id="cert-mindset-author" class="text-[10px] text-slate-400 text-right">— Marcus Aurelius</p>
      </div>

      <div class="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
        <span>SEAL: VERIFIED-ARC-2026</span>
        <span id="cert-date-stamp">OCTOBER 2026</span>
      </div>
    </div>

    <div class="flex gap-2">
      <button role="button" onclick="copyVictoryCertSummary()" class="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2">
        <i class="fa-solid fa-copy"></i> Copy Summary
      </button>
      <button role="button" onclick="downloadVictoryCertImage()" class="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs font-extrabold transition shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2">
        <i class="fa-solid fa-download"></i> Download PNG
      </button>
    </div>
  </div>
</div>


<div id="arc-mobile-permissions-modal" class="hidden fixed inset-0 z-[150] flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-xl transition-all duration-300" role="dialog" aria-modal="true" aria-labelledby="mobile-perm-title">
  <div id="arc-mobile-perm-card" class="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-slate-900 border-t sm:border border-cyan-500/40 p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
    
    <!-- STAGE 1: PERMISSIONS OVERVIEW -->
    <div id="perm-stage-overview" class="space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center font-bold text-base shadow-lg shadow-cyan-500/20 shrink-0">
            <i class="fa-solid fa-mobile-screen"></i>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.2 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">Mobile Setup</span>
              <span class="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">Mandatory</span>
            </div>
            <h2 id="mobile-perm-title" class="text-base font-extrabold text-white">Grant App Permissions</h2>
          </div>
        </div>
        <!-- Close button: Attempts close, but will block and warn if permissions missing -->
        <button type="button" onclick="ArcMobilePermissions.attemptClose()" class="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg text-sm transition" title="Permissions Mandatory">
          <i class="fa-solid fa-lock text-xs text-rose-400 mr-1"></i>
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- RED WARNING BANNER: Permission Required -->
      <div id="perm-mandatory-warning" class="hidden p-3.5 rounded-2xl bg-rose-950/80 border-2 border-rose-500 text-rose-200 text-xs shadow-lg shadow-rose-950/60 space-y-1 animate-pulse">
        <div class="flex items-center gap-2 text-rose-400 font-black text-xs uppercase tracking-wide">
          <i class="fa-solid fa-triangle-exclamation text-rose-500 text-sm shrink-0"></i>
          <span class="text-rose-500 text-xs">Permission required.</span>
        </div>
        <div id="perm-mandatory-warning-text" class="text-[11px] text-rose-200 leading-relaxed font-semibold">
          Some functions won’t work without required permissions. All permissions are mandatory to grant before this tab can close.
        </div>
      </div>

      <p class="text-xs text-slate-300 leading-relaxed">
        Welcome to your mobile tracker! Device permissions are mandatory to enable lock-in alerts, background telemetry, and anti-uninstall protection.
      </p>

      <!-- Permission Items -->
      <div class="space-y-2.5">
        <!-- 1. Notifications -->
        <div class="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center text-sm shrink-0">
              <i class="fa-solid fa-bell"></i>
            </div>
            <div>
              <div class="text-xs font-bold text-white flex items-center gap-1.5">
                Notification Alerts
                <span class="text-[9px] font-mono text-rose-400 bg-rose-950/60 px-1.5 py-0.2 rounded border border-rose-800/40">Mandatory</span>
              </div>
              <div class="text-[11px] text-slate-400">Lock-in reminders & dopamine blocker alarms</div>
            </div>
          </div>
          <span id="perm-status-notif" class="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">PENDING</span>
        </div>

        <!-- 2. Local Storage Persistence -->
        <div class="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center text-sm shrink-0">
              <i class="fa-solid fa-hard-drive"></i>
            </div>
            <div>
              <div class="text-xs font-bold text-white flex items-center gap-1.5">
                Data Persistence & Anti-Wipe
                <span class="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/40">Required</span>
              </div>
              <div class="text-[11px] text-slate-400">Guarantees streak and XP survival across resets</div>
            </div>
          </div>
          <span id="perm-status-storage" class="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">PERSISTENT</span>
        </div>

        <!-- 3. Gold Anti-Uninstall Protection -->
        <div class="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm shrink-0">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            <div>
              <div class="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                Commitment Lock & Anti-Uninstall
                <span class="text-[9px] font-mono font-bold text-amber-400 uppercase bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-600/40">VIP</span>
              </div>
              <div class="text-[11px] text-slate-300">Prevents premature removal during your active Arc</div>
            </div>
          </div>
          <span id="perm-status-gold" class="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">GOLD ONLY</span>
        </div>

        <!-- 4. Haptic Feedback -->
        <div class="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-sm shrink-0">
              <i class="fa-solid fa-wave-square"></i>
            </div>
            <div>
              <div class="text-xs font-bold text-white">Vibrations & Haptics</div>
              <div class="text-[11px] text-slate-400">Tactile rumble for habit hits, boss attacks & focus rings</div>
            </div>
          </div>
          <span class="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">ENABLED</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="pt-2 flex flex-col gap-2">
        <button id="btn-grant-permissions" type="button" onclick="ArcMobilePermissions.startVideoGuide()" class="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-slate-950 shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2">
          <i class="fa-solid fa-circle-play text-sm"></i>
          Grant Permissions (Watch Video Guide)
        </button>
        <!-- Mandatory indicator button: Blocks and triggers warning notification if clicked -->
        <button type="button" onclick="ArcMobilePermissions.attemptClose()" class="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 active:scale-[0.98] transition flex items-center justify-center gap-1.5">
          <i class="fa-solid fa-lock text-[10px]"></i>
          Mandatory Permissions · Cannot Skip
        </button>
      </div>
    </div>

    <!-- STAGE 2: BRAND VIDEO WALKTHROUGH -->
    <div id="perm-stage-video" class="hidden space-y-3.5">
      <!-- Stage Header -->
      <div class="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <span class="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">Step 2 of 2 · Video Walkthrough</span>
          <h2 id="perm-video-brand-title" class="text-sm font-extrabold text-white mt-1 flex items-center gap-1.5">
            <i class="fa-solid fa-mobile-screen text-cyan-400"></i> Setup Guide for OnePlus (OxygenOS)
          </h2>
        </div>
        <span id="perm-video-verified-badge" class="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
          OxygenOS 14/15 Verified
        </span>
      </div>

      <!-- RED WARNING BANNER IN VIDEO STAGE -->
      <div id="perm-video-mandatory-warning" class="hidden p-3 rounded-2xl bg-rose-950/80 border-2 border-rose-500 text-rose-200 text-xs shadow-lg space-y-1 animate-pulse">
        <div class="flex items-center gap-2 text-rose-400 font-black text-xs uppercase tracking-wide">
          <i class="fa-solid fa-triangle-exclamation text-rose-500 text-sm shrink-0"></i>
          <span class="text-rose-500 text-xs">Permission required.</span>
        </div>
        <div id="perm-video-mandatory-warning-text" class="text-[11px] text-rose-200 leading-relaxed font-semibold">
          Some functions won’t work: You must grant notification and device permissions to continue.
        </div>
      </div>

      <!-- Brand Selector Tabs -->
      <div>
        <div class="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider mb-1.5 flex items-center justify-between">
          <span>Select Your Phone Brand:</span>
          <span class="text-cyan-400 font-normal">Auto-detected or tap to switch</span>
        </div>
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar" id="perm-brand-pills-bar">
          <button type="button" onclick="ArcMobilePermissions.selectBrand('oneplus')" data-brand="oneplus" class="perm-brand-tab px-3 py-1 rounded-full bg-cyan-500 text-slate-950 font-black border border-cyan-400 whitespace-nowrap shadow-sm transition active:scale-95">OnePlus</button>
          <button type="button" onclick="ArcMobilePermissions.selectBrand('samsung')" data-brand="samsung" class="perm-brand-tab px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap transition active:scale-95">Samsung</button>
          <button type="button" onclick="ArcMobilePermissions.selectBrand('xiaomi')" data-brand="xiaomi" class="perm-brand-tab px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap transition active:scale-95">Xiaomi / POCO</button>
          <button type="button" onclick="ArcMobilePermissions.selectBrand('apple')" data-brand="apple" class="perm-brand-tab px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap transition active:scale-95">Apple iOS</button>
          <button type="button" onclick="ArcMobilePermissions.selectBrand('pixel')" data-brand="pixel" class="perm-brand-tab px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap transition active:scale-95">Google Pixel</button>
          <button type="button" onclick="ArcMobilePermissions.selectBrand('vivo')" data-brand="vivo" class="perm-brand-tab px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap transition active:scale-95">Vivo / iQOO</button>
        </div>
      </div>

      <!-- VIDEO SIMULATOR CANVAS / PLAYER CONTAINER -->
      <div id="perm-video-player-container" class="relative rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/30 shadow-xl perm-glow-cyan">
        
        <!-- Video Top Bar (OEM Phone Header) -->
        <div class="px-3 py-1.5 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div class="flex items-center gap-1.5 text-cyan-400">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="font-bold uppercase tracking-wider text-[10px]">Verified OEM Video Guide</span>
          </div>
          <div class="flex items-center gap-2">
            <span id="perm-video-timer" class="text-[10px] text-slate-400">0:00 / 0:12</span>
            <button type="button" onclick="ArcMobilePermissions.replayVideo()" class="text-slate-400 hover:text-cyan-400 p-0.5" title="Replay">
              <i class="fa-solid fa-rotate-right text-xs"></i>
            </button>
          </div>
        </div>

        <!-- Video Frame / Phone Screen Simulation -->
        <div class="relative w-full h-52 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-3 flex flex-col justify-between overflow-hidden">
          
          <!-- Mock Phone System Settings Header -->
          <div class="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-arrow-left text-xs text-slate-400"></i>
              <span class="text-xs font-bold text-white">App info · Arc Tracker</span>
            </div>
            <i class="fa-solid fa-ellipsis-vertical text-xs text-slate-400"></i>
          </div>

          <!-- Mock Settings List inside Video -->
          <div class="space-y-2 py-1 relative">
            <!-- Simulated Row 1: Notifications -->
            <div id="sim-row-notif" class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between transition-all duration-300">
              <div class="flex items-center gap-2.5">
                <i class="fa-solid fa-bell text-cyan-400 text-xs"></i>
                <div>
                  <div id="sim-text-notif-label" class="text-[11px] font-bold text-white">Allow Notifications</div>
                  <div class="text-[9px] text-slate-400">Lock screen, banners, sound & badges</div>
                </div>
              </div>
              <div id="sim-toggle-notif" class="w-9 h-5 rounded-full bg-slate-800 p-0.5 transition-colors duration-500 flex items-center">
                <div class="w-4 h-4 rounded-full bg-white transition-transform duration-500 shadow-md translate-x-0"></div>
              </div>
            </div>

            <!-- Simulated Row 2: Battery & Autostart -->
            <div id="sim-row-battery" class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between transition-all duration-300">
              <div class="flex items-center gap-2.5">
                <i class="fa-solid fa-bolt text-amber-400 text-xs"></i>
                <div>
                  <div id="sim-text-battery-label" class="text-[11px] font-bold text-white">Unrestricted Battery & Autostart</div>
                  <div class="text-[9px] text-slate-400">Run in background without being killed</div>
                </div>
              </div>
              <div id="sim-toggle-battery" class="w-9 h-5 rounded-full bg-slate-800 p-0.5 transition-colors duration-500 flex items-center">
                <div class="w-4 h-4 rounded-full bg-white transition-transform duration-500 shadow-md translate-x-0"></div>
              </div>
            </div>

            <!-- Animated Virtual Tap Pointer -->
            <div id="perm-tap-pointer" class="absolute pointer-events-none transition-all duration-700 ease-in-out" style="top: 14px; right: 18px;">
              <div class="relative flex items-center justify-center">
                <div class="absolute w-7 h-7 rounded-full bg-cyan-400/40 sim-ripple"></div>
                <div class="w-4 h-4 rounded-full bg-cyan-400 border-2 border-white shadow-lg flex items-center justify-center text-[8px] text-slate-950 font-black">
                  <i class="fa-solid fa-hand-pointer"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Video Subtitle & Verified Watermark -->
          <div class="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
            <span class="text-cyan-300 font-medium flex items-center gap-1">
              <i class="fa-solid fa-shield-check text-emerald-400"></i> Verified Step-by-Step OEM Sequence
            </span>
            <span class="font-mono text-[9px] text-slate-500">1080p HD SIM</span>
          </div>

          <!-- Video Progress Bar -->
          <div class="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
            <div id="perm-video-progressbar" class="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-200" style="width: 0%;"></div>
          </div>
        </div>
      </div>

      <!-- Verified Brand Step-by-Step Instructions -->
      <div id="perm-brand-steps-list" class="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/90 text-xs space-y-1.5">
        <!-- Injected via JavaScript based on brand -->
      </div>

      <!-- Action Buttons for Video Stage -->
      <div class="pt-1 flex flex-col gap-2">
        <button id="btn-perm-understood" type="button" onclick="ArcMobilePermissions.onUnderstood()" class="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2">
          <i class="fa-solid fa-circle-check text-sm"></i>
          Understood · Grant Permissions
        </button>
        <button type="button" onclick="ArcMobilePermissions.showStage('overview')" class="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition">
          <i class="fa-solid fa-arrow-left mr-1"></i> Back to Overview
        </button>
      </div>
    </div>

    <!-- STAGE 3: CONFIRMATION & RETURN TO MAIN SCREEN -->
    <div id="perm-stage-confirmation" class="hidden py-6 px-2 text-center space-y-4">
      <div class="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center text-2xl mx-auto shadow-lg shadow-emerald-500/30 animate-bounce">
        <i class="fa-solid fa-check"></i>
      </div>
      <div>
        <h3 class="text-base font-extrabold text-white">All Permissions Granted & Verified!</h3>
        <p id="perm-confirmation-message" class="text-xs text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
          Your notifications, storage locks, and phone telemetry are now active. Returning to your main Arc tracker...
        </p>
      </div>
      <div class="pt-2">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          Returning to Main Screen...
        </div>
      </div>
      <div>
        <button type="button" onclick="ArcMobilePermissions.finishAndReturnHome()" class="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-800 text-white hover:bg-slate-700 active:scale-95 transition">
          Return Now
        </button>
      </div>
    </div>

  </div>
</div>

<!-- FLOATING PICTURE-IN-PICTURE (PIP) MINI-PLAYER WIDGET (MOBILE ONLY) -->
<div id="arc-perm-pip-widget" class="hidden fixed bottom-4 right-4 z-[160] w-64 rounded-2xl bg-slate-900/95 border-2 border-cyan-500/50 shadow-2xl p-2.5 backdrop-blur-xl animate-in zoom-in-95 duration-200">
  <div class="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[10px]">
    <div class="flex items-center gap-1.5 text-cyan-400 font-bold">
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      <span id="pip-brand-label">OnePlus Guide</span>
    </div>
    <div class="flex items-center gap-1">
      <button type="button" onclick="ArcMobilePermissions.maximizeVideo()" class="text-slate-400 hover:text-white p-1" title="Maximize Video">
        <i class="fa-solid fa-expand text-xs"></i>
      </button>
      <button type="button" onclick="ArcMobilePermissions.dismissPip()" class="text-slate-400 hover:text-white p-1" title="Close PiP">
        <i class="fa-solid fa-xmark text-xs"></i>
      </button>
    </div>
  </div>

  <div class="pt-2 pb-1 flex items-center gap-2">
    <div class="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-sm shrink-0">
      <i class="fa-solid fa-play"></i>
    </div>
    <div class="flex-1 min-w-0">
      <div class="text-[11px] font-bold text-white truncate">Video Guide Minimized</div>
      <div class="text-[9px] text-slate-400 leading-tight">Follow steps in your phone Settings</div>
    </div>
  </div>

  <div class="pt-1 flex items-center gap-1.5">
    <button type="button" onclick="ArcMobilePermissions.maximizeVideo()" class="flex-1 py-1 px-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-[10px] text-center border border-cyan-500/40 transition">
      Expand Video
    </button>
    <button type="button" onclick="ArcMobilePermissions.dismissPip()" class="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold text-[10px] hover:text-white transition">
      Done
    </button>
  </div>
</div>

<!-- PERMISSIONS LOGIC & BRAND VIDEO CONTROLLER ENGINE -->`;
}
