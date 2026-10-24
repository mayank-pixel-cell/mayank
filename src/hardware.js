/**
 * Arc Tracker - Hardware Profiler & Device Compatibility Gatekeeper
 * 
 * Enforces hardware standards:
 * 1. Extremely lower-end devices (< 2GB RAM, single-core, missing WebGL 2.0, or legacy 32-bit OS)
 *    are flagged incompatible with an unclosable diagnostic barrier screen to protect device health.
 * 2. Lower-end devices (2GB-4GB RAM, <= 4 cores, battery saver) automatically have heavy extra
 *    features disabled (moving canvas particles and celestial bodies audio soundscapes)
 *    to guarantee a silky-smooth, lag-free 60 FPS experience.
 * 3. High-end devices run with full visual and acoustic fidelity.
 */

export class ArcHardwareGatekeeper {
  constructor() {
    this.STORAGE_KEY = 'arc_hardware_profile';
    this.specs = null;
    this.tier = 'high_end'; // 'incompatible' | 'lower_end' | 'high_end'
    this.reasons = [];
    this.overrides = {
      forceSmoothMode: false,
      forceHighEnd: false,
      manualParticles: null, // null = auto by tier, true = forced on, false = forced off
      manualCelestialAudio: null, // null = auto by tier, true = forced on, false = forced off
      bypassedIncompatible: false
    };
    this.benchmarkResult = null;
    this.isBenchmarking = false;
  }

  detectSpecs() {
    let ramGb = null;
    if (typeof navigator !== 'undefined' && 'deviceMemory' in navigator) {
      ramGb = Number(navigator.deviceMemory) || null;
    }

    let cores = null;
    if (typeof navigator !== 'undefined' && 'hardwareConcurrency' in navigator) {
      cores = Number(navigator.hardwareConcurrency) || null;
    }

    let webgl2Supported = false;
    let webgl2Accelerated = false;
    let renderer = 'Standard GPU';
    if (typeof document !== 'undefined') {
      try {
        const cv = document.createElement('canvas');
        const gl = cv.getContext('webgl2', { failIfMajorPerformanceCaveat: false });
        if (gl) {
          webgl2Supported = true;
          const ext = gl.getExtension('WEBGL_debug_renderer_info');
          if (ext) {
            renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || renderer;
          }
          const glStrict = cv.getContext('webgl2', { failIfMajorPerformanceCaveat: true });
          webgl2Accelerated = !!glStrict;
        }
      } catch (e) {
        webgl2Supported = false;
        webgl2Accelerated = false;
      }
    }

    const ua = (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : '';
    const is32Bit = /\b(armv7l|i686|x86)\b/i.test(ua) || 
      (typeof navigator !== 'undefined' && navigator.platform === 'Win32' && !/Win64|x64|WOW64/i.test(ua));

    let isAncientOs = false;
    let osReason = '';
    const androidMatch = ua.match(/Android\s+(\d+(\.\d+)?)/i);
    if (androidMatch && parseFloat(androidMatch[1]) < 8.0) {
      isAncientOs = true;
      osReason = `Android ${androidMatch[1]} (Minimum required: Android 8.0+)`;
    }
    const iosMatch = ua.match(/OS\s+(\d+)[_.](\d+)/i);
    if (iosMatch && parseInt(iosMatch[1], 10) < 14) {
      isAncientOs = true;
      osReason = `iOS ${iosMatch[1]} (Minimum required: iOS 14.0+)`;
    }

    const saveData = !!(typeof navigator !== 'undefined' && navigator.connection && navigator.connection.saveData);

    this.specs = {
      ramGb,
      cores,
      webgl2Supported,
      webgl2Accelerated,
      renderer,
      is32Bit,
      isAncientOs,
      osReason,
      saveData,
      ua
    };
    return this.specs;
  }

  loadOverrides() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          this.overrides = { ...this.overrides, ...parsed };
        }
      }
    } catch (e) {
      console.warn('[ArcHardwareGatekeeper] Error reading stored hardware profile:', e);
    }
  }

  saveOverrides() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.overrides));
    } catch (e) {}
  }

  evaluateTier() {
    if (!this.specs) this.detectSpecs();

    // Developer / User manual overrides
    if (this.overrides.forceSmoothMode) {
      this.tier = 'lower_end';
      this.reasons = ['User forced Smooth Performance Mode (Low-End Optimized)'];
      return;
    }
    if (this.overrides.forceHighEnd) {
      this.tier = 'high_end';
      this.reasons = ['User forced High-End Ultra Fidelity Mode'];
      return;
    }

    // Tier 0: Incompatible Devices
    const incReasons = [];
    if (this.specs.ramGb !== null && this.specs.ramGb < 2) {
      incReasons.push(`System RAM is ${this.specs.ramGb} GB (Minimum required: 2.0 GB)`);
    }
    if (this.specs.cores !== null && this.specs.cores < 2) {
      incReasons.push(`CPU has only ${this.specs.cores} core (Minimum required: Dual-Core 64-bit)`);
    }
    if (!this.specs.webgl2Supported) {
      incReasons.push(`WebGL 2.0 / OpenGL ES 3.0 graphics pipeline is unsupported`);
    }
    if (this.specs.is32Bit) {
      incReasons.push(`Legacy 32-bit architecture detected (64-bit OS required)`);
    }
    if (this.specs.isAncientOs) {
      incReasons.push(this.specs.osReason || 'Obsolete operating system');
    }

    if (incReasons.length > 0 && !this.overrides.bypassedIncompatible) {
      this.tier = 'incompatible';
      this.reasons = incReasons;
      return;
    }

    // Tier 1: Lower-End Devices
    const lowReasons = [];
    if (this.specs.ramGb !== null && this.specs.ramGb <= 4) {
      lowReasons.push(`Standard Memory (${this.specs.ramGb} GB RAM)`);
    }
    if (this.specs.cores !== null && this.specs.cores <= 4) {
      lowReasons.push(`Budget/Mobile CPU (${this.specs.cores} Cores)`);
    }
    if (this.specs.saveData) {
      lowReasons.push(`Data/Battery Saver Mode Active`);
    }
    if (!this.specs.webgl2Accelerated) {
      lowReasons.push(`Software Graphics Emulation`);
    }

    if (lowReasons.length > 0) {
      this.tier = 'lower_end';
      this.reasons = lowReasons;
      return;
    }

    // Tier 2: High-End Devices
    this.tier = 'high_end';
    this.reasons = ['High-Performance Multi-Core CPU & Accelerated WebGL 2.0 GPU'];
  }

  isIncompatible() {
    return this.tier === 'incompatible' && !this.overrides.bypassedIncompatible;
  }

  isLowerEnd() {
    return this.tier === 'lower_end';
  }

  isParticlesDisabled() {
    if (this.isIncompatible()) return true;
    if (this.overrides.manualParticles !== null) {
      return !this.overrides.manualParticles;
    }
    return this.tier === 'lower_end';
  }

  isCelestialAudioDisabled() {
    if (this.isIncompatible()) return true;
    if (this.overrides.manualCelestialAudio !== null) {
      return !this.overrides.manualCelestialAudio;
    }
    return this.tier === 'lower_end';
  }

  applyOptimizations() {
    if (this.isIncompatible()) {
      // Completely halt all heavy tasks
      if (typeof window !== 'undefined') {
        window.__fxOff = true;
        if (typeof window.__fxStop === 'function') window.__fxStop();
        if (window.HeavenlyBodies && typeof window.HeavenlyBodies.disable === 'function') {
          window.HeavenlyBodies.disable();
        }
      }
      this.renderIncompatibleScreen();
      return;
    }

    // Lower-End Optimizations
    if (this.isLowerEnd()) {
      if (typeof window !== 'undefined') {
        // 1. Disable moving particle canvas
        window.__fxOff = true;
        if (typeof window.__fxStop === 'function') window.__fxStop();
        if (typeof window.fxParticles !== 'undefined') {
          try { window.fxParticles.length = 0; } catch (e) {}
        }
        const cv = document.getElementById('fx-canvas');
        if (cv) {
          const ctx = cv.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, cv.width, cv.height);
        }

        // 2. Disable Celestial Bodies ambient multi-oscillator soundscape
        if (window.HeavenlyBodies && typeof window.HeavenlyBodies.disable === 'function') {
          window.HeavenlyBodies.disable();
        }

        // Auto-disable ambient presets in state
        if (window.state && window.state.settings) {
          window.state.settings.particleDensity = 'off';
          window.state.settings.snowflakeParticles = false;
          window.state.settings.audioReactiveParticles = false;
          window.state.settings.ambientPreset = 'off';
        }
      }
      console.log(`[ArcHardwareGatekeeper] ⚡ Lower-end device profile active (${this.reasons.join(', ')}). Particles and Celestial Bodies audio disabled to ensure 60 FPS.`);
    } else {
      console.log(`[ArcHardwareGatekeeper] 🚀 High-end hardware validated (${this.reasons.join(', ')}). Full particle and sound fidelity enabled.`);
    }

    this.renderSmoothModePill();
    this.renderSettingsCard();
  }

  init() {
    this.loadOverrides();
    this.detectSpecs();
    this.evaluateTier();
    this.applyOptimizations();

    if (typeof window !== 'undefined') {
      window.ArcHardwareGatekeeper = this;
    }
  }

  renderIncompatibleScreen() {
    if (typeof document === 'undefined') return;
    let barrier = document.getElementById('arc-incompatible-device-screen');
    if (!barrier) {
      barrier = document.createElement('div');
      barrier.id = 'arc-incompatible-device-screen';
      barrier.style.cssText = 'position:fixed;inset:0;z-index:999999;background:#05070e;display:flex;align-items:center;justify-content:center;padding:1.5rem;overflow-y:auto;font-family:Inter,system-ui,sans-serif;color:#f8fafc;';
      document.body.appendChild(barrier);
    }

    const ramDisplay = this.specs.ramGb !== null ? `${this.specs.ramGb} GB` : 'Unavailable / < 2 GB';
    const ramOk = this.specs.ramGb === null || this.specs.ramGb >= 2;
    const coresDisplay = this.specs.cores !== null ? `${this.specs.cores} Cores` : 'Single-Core / Unknown';
    const coresOk = this.specs.cores === null || this.specs.cores >= 2;
    const gpuDisplay = this.specs.webgl2Supported ? 'WebGL 2.0' : 'Missing / Unsupported';
    const gpuOk = this.specs.webgl2Supported;
    const archDisplay = this.specs.is32Bit ? '32-bit Legacy' : '64-bit Architecture';
    const archOk = !this.specs.is32Bit && !this.specs.isAncientOs;

    barrier.innerHTML = `
      <div style="max-width:540px;width:100%;background:rgba(15,23,42,0.95);border:2px solid rgba(244,63,94,0.5);border-radius:1.5rem;padding:2rem;box-shadow:0 25px 50px -12px rgba(0,0,0,0.8),0 0 40px rgba(244,63,94,0.2);text-align:center;">
        <div style="width:4.5rem;height:4.5rem;margin:0 auto 1.25rem;border-radius:1rem;background:rgba(244,63,94,0.15);border:1px solid rgba(244,63,94,0.4);display:flex;align-items:center;justify-content:center;">
          <i class="fa-solid fa-triangle-exclamation" style="font-size:2rem;color:#f43f5e;"></i>
        </div>
        <div style="display:inline-block;padding:0.25rem 0.75rem;border-radius:9999px;background:rgba(244,63,94,0.2);border:1px solid rgba(244,63,94,0.4);color:#fda4af;font-size:11px;font-family:monospace;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.75rem;">
          DEVICE INCOMPATIBLE
        </div>
        <h1 style="font-size:1.5rem;font-weight:900;color:#ffffff;margin:0 0 0.5rem;line-height:1.2;">
          Minimum System Requirements Not Met
        </h1>
        <p style="font-size:0.875rem;color:#94a3b8;line-height:1.5;margin:0 0 1.5rem;">
          To prevent critical device unresponsiveness, memory crashes, and battery overheating, Arc Tracker cannot run on this hardware.
        </p>

        <div style="background:rgba(2,6,23,0.8);border:1px solid rgba(51,65,85,0.7);border-radius:1rem;padding:1rem;margin-bottom:1.5rem;text-align:left;font-size:0.8125rem;">
          <div style="font-size:0.75rem;font-weight:800;color:#cbd5e1;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.75rem;border-bottom:1px solid rgba(51,65,85,0.7);padding-bottom:0.5rem;">
            Hardware Compatibility Audit
          </div>
          
          <div style="display:flex;justify-content:space-between;align-items:center;padding:0.4rem 0;">
            <span style="color:#94a3b8;"><i class="fa-solid fa-memory" style="width:1.25rem;color:#38bdf8;"></i> Memory (RAM):</span>
            <span style="font-family:monospace;font-weight:700;color:${ramOk ? '#34d399' : '#f43f5e'};">
              ${ramDisplay} ${ramOk ? '✓' : '✗ (< 2 GB)'}
            </span>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;padding:0.4rem 0;">
            <span style="color:#94a3b8;"><i class="fa-solid fa-microchip" style="width:1.25rem;color:#a855f7;"></i> CPU Processing:</span>
            <span style="font-family:monospace;font-weight:700;color:${coresOk ? '#34d399' : '#f43f5e'};">
              ${coresDisplay} ${coresOk ? '✓' : '✗ (< 2 Cores)'}
            </span>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;padding:0.4rem 0;">
            <span style="color:#94a3b8;"><i class="fa-solid fa-gamepad" style="width:1.25rem;color:#f59e0b;"></i> Graphics GPU:</span>
            <span style="font-family:monospace;font-weight:700;color:${gpuOk ? '#34d399' : '#f43f5e'};">
              ${gpuDisplay} ${gpuOk ? '✓' : '✗ (Requires WebGL 2.0)'}
            </span>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;padding:0.4rem 0;">
            <span style="color:#94a3b8;"><i class="fa-solid fa-shield-halved" style="width:1.25rem;color:#10b981;"></i> Architecture:</span>
            <span style="font-family:monospace;font-weight:700;color:${archOk ? '#34d399' : '#f43f5e'};">
              ${archDisplay} ${archOk ? '✓' : '✗ (64-bit Required)'}
            </span>
          </div>
        </div>

        <div style="background:rgba(244,63,94,0.1);border-left:4px solid #f43f5e;border-radius:0.5rem;padding:0.75rem;margin-bottom:1.5rem;text-align:left;font-size:0.75rem;color:#fecdd3;line-height:1.4;">
          <strong>Why this requirement exists:</strong> Arc Tracker utilizes cryptographic hashing, durable IndexedDB persistence, and real-time telemetry. Extremely low-spec devices freeze when processing these background tasks.
        </div>

        <p style="font-size:0.75rem;color:#64748b;margin:0 0 1rem;">
          Supported platforms: Android 8.0+ (64-bit), iOS 15+, Windows 10/11 64-bit, or macOS with ≥ 2GB RAM.
        </p>

        <button id="btn-force-bypass-incompatible" onclick="window.ArcHardwareGatekeeper.forceBypassIncompatible()" style="background:transparent;border:none;color:#64748b;text-decoration:underline;font-size:0.75rem;cursor:pointer;padding:0.5rem;">
          Developer / Diagnostics Bypass Mode (Not Recommended)
        </button>
      </div>
    `;
  }

  forceBypassIncompatible() {
    if (typeof window !== 'undefined') {
      const confirmBypass = window.confirm(
        'WARNING: Running Arc Tracker on incompatible hardware may lead to severe system unresponsiveness, browser tab crashes, or battery drain.\n\nAre you sure you wish to continue in Diagnostic Mode?'
      );
      if (!confirmBypass) return;

      this.overrides.bypassedIncompatible = true;
      this.overrides.forceSmoothMode = true; // Automatically enforce smooth mode
      this.saveOverrides();

      const screen = document.getElementById('arc-incompatible-device-screen');
      if (screen) screen.remove();

      this.evaluateTier();
      this.applyOptimizations();

      if (typeof window.showToast === 'function') {
        window.showToast('Diagnostic Mode Active: Smooth mode enforced');
      }
    }
  }

  renderSmoothModePill() {
    if (typeof document === 'undefined') return;
    let pill = document.getElementById('arc-smooth-mode-pill');
    
    // Only display when lower-end / smooth mode is active
    if (!this.isLowerEnd()) {
      if (pill) pill.remove();
      return;
    }

    if (!pill) {
      pill = document.createElement('div');
      pill.id = 'arc-smooth-mode-pill';
      pill.className = 'fixed bottom-4 right-4 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/40 text-amber-300 text-[11px] shadow-xl backdrop-blur-md transition-all hover:border-amber-400';
      pill.title = 'Lower-End Device Optimization: Canvas particles & celestial bodies audio are disabled to guarantee 60 FPS.';
      document.body.appendChild(pill);
    }

    pill.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
      <span class="font-bold">60 FPS Smooth Mode</span>
      <span class="text-slate-400 hidden sm:inline">• Particles &amp; Celestial Audio Off</span>
      <button onclick="switchTab('settings'); window.ArcHardwareGatekeeper.scrollToProfiler();" class="ml-1 text-cyan-400 hover:text-cyan-300 font-mono text-[10px] underline">Manage</button>
    `;
  }

  scrollToProfiler() {
    setTimeout(() => {
      const card = document.getElementById('settings-hardware-profiler-card');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('ring-2', 'ring-cyan-400');
        setTimeout(() => card.classList.remove('ring-2', 'ring-cyan-400'), 2000);
      }
    }, 100);
  }

  renderSettingsCard() {
    if (typeof document === 'undefined') return;
    const container = document.getElementById('settings-hardware-profiler-card');
    if (!container) {
      // Find insertion point right below settings-theme-arc-card
      const themeCard = document.getElementById('settings-theme-arc-card');
      if (!themeCard || !themeCard.parentNode) return;

      const card = document.createElement('div');
      card.id = 'settings-hardware-profiler-card';
      card.className = 'glass-card rounded-2xl p-4 sm:p-5 border-l-4 border-l-cyan-400 bg-slate-900/80 mb-4 shadow-xl relative overflow-hidden transition-all duration-300';
      themeCard.parentNode.insertBefore(card, themeCard.nextSibling);
    }

    const card = document.getElementById('settings-hardware-profiler-card');
    if (!card) return;

    const isLower = this.isLowerEnd();
    const isParticlesOff = this.isParticlesDisabled();
    const isCelestialOff = this.isCelestialAudioDisabled();
    const ramText = this.specs?.ramGb ? `~${this.specs.ramGb} GB RAM` : 'Standard RAM';
    const coresText = this.specs?.cores ? `${this.specs.cores} CPU Cores` : 'Multi-Core';
    const gpuText = this.specs?.webgl2Accelerated ? 'WebGL 2.0 (Accelerated)' : (this.specs?.webgl2Supported ? 'WebGL 2.0 (Standard)' : 'Basic GPU');

    card.innerHTML = `
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full ${isLower ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'} border text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <i class="fa-solid fa-microchip"></i> HARDWARE PROFILER &amp; PERFORMANCE
            </span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded ${isLower ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}">
              ${isLower ? '⚡ TIER 1: LOWER-END (SMOOTH 60 FPS)' : '🚀 TIER 2: HIGH-END (ULTRA FIDELITY)'}
            </span>
          </div>
          <h3 class="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
            Device Hardware Profiler &amp; Smoothness Engine
          </h3>
          <p class="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
            ${isLower 
              ? 'Lower-end device detected. Extra features (canvas particle physics &amp; celestial bodies multi-oscillator sound) are automatically disabled so the application stays completely smooth at 60 FPS.' 
              : 'High-end hardware validated. Ambient particle effects and celestial ambient soundscapes are fully enabled.'}
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap shrink-0">
          <button type="button" onclick="window.ArcHardwareGatekeeper.runFpsBenchmark()" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition">
            <i class="fa-solid fa-gauge-high text-cyan-400"></i>
            <span id="hw-benchmark-btn-text">Test 60 FPS Benchmark</span>
          </button>
        </div>
      </div>

      <!-- SPECS GRID -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-slate-800/80 text-xs">
        <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
          <div class="text-[10px] font-mono text-slate-400 uppercase">Memory (RAM)</div>
          <div class="font-bold text-white mt-0.5">${ramText}</div>
        </div>
        <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
          <div class="text-[10px] font-mono text-slate-400 uppercase">Processor</div>
          <div class="font-bold text-white mt-0.5">${coresText}</div>
        </div>
        <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
          <div class="text-[10px] font-mono text-slate-400 uppercase">Graphics Pipeline</div>
          <div class="font-bold text-white mt-0.5 truncate" title="${gpuText}">${gpuText}</div>
        </div>
        <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
          <div class="text-[10px] font-mono text-slate-400 uppercase">Smoothness Mode</div>
          <div class="font-bold ${isLower ? 'text-amber-400' : 'text-emerald-400'} mt-0.5">
            ${isLower ? '60 FPS Active' : 'Ultra Quality'}
          </div>
        </div>
      </div>

      <!-- BENCHMARK LIVE DISPLAY -->
      <div id="hw-benchmark-display" class="hidden mt-3 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i class="fa-solid fa-chart-line text-cyan-400"></i>
          <span id="hw-benchmark-results-text">Measuring frame timing...</span>
        </div>
        <span id="hw-benchmark-fps-badge" class="font-mono font-bold text-cyan-300">-- FPS</span>
      </div>

      <!-- SMOOTHNESS FEATURE CONTROLS -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-800/80">
        <!-- FORCE SMOOTH MODE -->
        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/70">
          <div>
            <div class="font-bold text-xs text-white">Force Smooth Mode</div>
            <div class="text-[10px] text-slate-400">Lock to 60 FPS optimizations</div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="hw-toggle-force-smooth" ${this.overrides.forceSmoothMode ? 'checked' : ''} onchange="window.ArcHardwareGatekeeper.toggleForceSmooth(this.checked)" class="sr-only peer">
            <div class="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        <!-- PARTICLES MOVING TOGGLE -->
        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/70">
          <div>
            <div class="font-bold text-xs text-white flex items-center gap-1.5">
              Moving Particles
              ${isParticlesOff ? '<span class="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">OFF</span>' : '<span class="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">ON</span>'}
            </div>
            <div class="text-[10px] text-slate-400">Snow &amp; ember physics</div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="hw-toggle-particles" ${!isParticlesOff ? 'checked' : ''} onchange="window.ArcHardwareGatekeeper.toggleParticlesManual(this.checked)" class="sr-only peer">
            <div class="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>

        <!-- CELESTIAL BODIES SOUND TOGGLE -->
        <div class="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/70">
          <div>
            <div class="font-bold text-xs text-white flex items-center gap-1.5">
              Celestial Audio
              ${isCelestialOff ? '<span class="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">OFF</span>' : '<span class="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">ON</span>'}
            </div>
            <div class="text-[10px] text-slate-400">Multi-oscillator drones</div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" id="hw-toggle-celestial" ${!isCelestialOff ? 'checked' : ''} onchange="window.ArcHardwareGatekeeper.toggleCelestialManual(this.checked)" class="sr-only peer">
            <div class="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
          </label>
        </div>
      </div>
    `;
  }

  toggleForceSmooth(enabled) {
    this.overrides.forceSmoothMode = enabled;
    if (enabled) {
      this.overrides.forceHighEnd = false;
      this.overrides.manualParticles = false;
      this.overrides.manualCelestialAudio = false;
    } else {
      this.overrides.manualParticles = null;
      this.overrides.manualCelestialAudio = null;
    }
    this.saveOverrides();
    this.evaluateTier();
    this.applyOptimizations();
    if (typeof window.showToast === 'function') {
      window.showToast(enabled ? '⚡ Smooth Performance Mode Enforced' : 'Hardware Auto-Detection Restored');
    }
  }

  toggleParticlesManual(enabled) {
    if (enabled && this.isLowerEnd()) {
      const ok = window.confirm('Notice: Enabling canvas particle simulations on a lower-end device may impact battery life and framerate.\n\nEnable particle effects anyway?');
      if (!ok) {
        this.renderSettingsCard();
        return;
      }
    }
    this.overrides.manualParticles = enabled;
    this.saveOverrides();

    if (typeof window !== 'undefined') {
      window.__fxOff = !enabled;
      if (enabled) {
        if (typeof window.__fxStart === 'function') window.__fxStart();
        if (window.state && window.state.settings) {
          window.state.settings.particleDensity = 'medium';
        }
      } else {
        if (typeof window.__fxStop === 'function') window.__fxStop();
        if (typeof window.fxParticles !== 'undefined') window.fxParticles.length = 0;
        const cv = document.getElementById('fx-canvas');
        if (cv) {
          const ctx = cv.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, cv.width, cv.height);
        }
        if (window.state && window.state.settings) {
          window.state.settings.particleDensity = 'off';
        }
      }
    }
    this.renderSettingsCard();
    if (typeof window.showToast === 'function') {
      window.showToast(enabled ? 'Particle Canvas Enabled' : 'Particle Canvas Disabled');
    }
  }

  toggleCelestialManual(enabled) {
    if (enabled && this.isLowerEnd()) {
      const ok = window.confirm('Notice: Enabling multi-oscillator celestial sound on a lower-end device consumes audio thread DSP.\n\nEnable celestial sound anyway?');
      if (!ok) {
        this.renderSettingsCard();
        return;
      }
    }
    this.overrides.manualCelestialAudio = enabled;
    this.saveOverrides();

    if (typeof window !== 'undefined') {
      if (enabled) {
        if (window.HeavenlyBodies && typeof window.HeavenlyBodies.enable === 'function') {
          window.HeavenlyBodies.enable('Sun');
        }
      } else {
        if (window.HeavenlyBodies && typeof window.HeavenlyBodies.disable === 'function') {
          window.HeavenlyBodies.disable();
        }
      }
    }
    this.renderSettingsCard();
    if (typeof window.showToast === 'function') {
      window.showToast(enabled ? 'Celestial Bodies Sound Enabled' : 'Celestial Bodies Sound Disabled');
    }
  }

  runFpsBenchmark() {
    if (this.isBenchmarking) return;
    this.isBenchmarking = true;

    const btnText = document.getElementById('hw-benchmark-btn-text');
    const disp = document.getElementById('hw-benchmark-display');
    const resultsText = document.getElementById('hw-benchmark-results-text');
    const fpsBadge = document.getElementById('hw-benchmark-fps-badge');

    if (btnText) btnText.textContent = 'Benchmarking...';
    if (disp) disp.classList.remove('hidden');
    if (resultsText) resultsText.textContent = 'Profiling display frame rates over 60 frames...';
    if (fpsBadge) fpsBadge.textContent = 'Testing...';

    const frames = [];
    let startTs = 0;
    let frameCount = 0;
    const targetFrames = 60;

    const sample = (now) => {
      if (!startTs) startTs = now;
      if (frames.length > 0) {
        const delta = now - frames[frames.length - 1];
        if (delta > 0) frameCount++;
      }
      frames.push(now);

      if (frames.length < targetFrames) {
        requestAnimationFrame(sample);
      } else {
        const totalDuration = now - startTs;
        const avgFps = Math.round((frameCount / (totalDuration / 1000)) * 10) / 10;
        this.isBenchmarking = false;
        if (btnText) btnText.textContent = 'Test 60 FPS Benchmark';
        if (resultsText) {
          resultsText.textContent = avgFps >= 55 
            ? `Excellent performance: ${avgFps} FPS. Frame rendering is stable & smooth.` 
            : `Average: ${avgFps} FPS. Smooth Mode optimizations keep the interface responsive.`;
        }
        if (fpsBadge) {
          fpsBadge.textContent = `${avgFps} FPS`;
          fpsBadge.className = avgFps >= 55 
            ? 'font-mono font-bold text-emerald-400 text-sm' 
            : 'font-mono font-bold text-amber-400 text-sm';
        }
        if (typeof window.showToast === 'function') {
          window.showToast(`Benchmark Complete: ${avgFps} FPS`);
        }
      }
    };

    requestAnimationFrame(sample);
  }
}

export const arcHardware = new ArcHardwareGatekeeper();
if (typeof window !== 'undefined') {
  window.ArcHardwareGatekeeper = arcHardware;
}
