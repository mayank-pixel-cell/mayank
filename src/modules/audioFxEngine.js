/* ==========================================================================
           1. AUDIO ENGINE & SOUND EFFECTS MODULE
           ========================================================================== */
        let audioCtx = null;
        let isMuted = false;

        function initAudio() {
            if (!audioCtx) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) audioCtx = new AudioContextClass(); window.audioCtx = audioCtx;
            }
            if (audioCtx && (audioCtx.state === 'suspended' || audioCtx.state === 'interrupted')) {
                const rp = audioCtx.resume();
                if (rp && rp.catch) rp.catch(() => {});
            }
            if (typeof window.ensureAudioGraph === 'function') {
                try { window.ensureAudioGraph(); } catch(e) {}
            }
        }

        // Master SFX bus: volume comes from Settings. Destination is resolved per call so later audio-graph re-routing is respected.
        let __sm = null, __smD = null;
        function sfxOut() {
            const d = (typeof A !== 'undefined' && A && A.sfx) ? A.sfx : audioCtx.destination;
            if (!__sm || __sm.context !== audioCtx || __smD !== d) {
                __sm = audioCtx.createGain();
                __sm.gain.value = (window.__sfxVol == null ? 1 : window.__sfxVol);
                __sm.connect(d); __smD = d;
            }
            return __sm;
        }
        window.__setSfxVol = v => { window.__sfxVol = v; if (__sm) __sm.gain.setTargetAtTime(v, __sm.context.currentTime, 0.02); };

        // Global gesture listener to safely unlock Web Audio API across all browsers
        function unlockAudioOnGesture() {
            initAudio();
            if (typeof window.ensureAudioGraph === 'function') {
                try { window.ensureAudioGraph(); } catch(e) {}
            }
        }
        window.addEventListener('click', unlockAudioOnGesture, { once: false });
        window.addEventListener('touchstart', unlockAudioOnGesture, { once: false });

        function toggleAudioMute() {
            isMuted = !isMuted;
            const btn = document.getElementById('btn-audio-toggle');
            const icon = document.getElementById('audio-icon');
            if (isMuted) {
                if (icon) icon.className = "fa-solid fa-volume-xmark text-slate-500";
                if (btn) btn.className = "p-2 rounded-xl bg-slate-900 text-slate-500 border border-slate-800 text-xs font-bold transition flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9";
                showToast("Sound FX Muted");
            } else {
                if (icon) icon.className = "fa-solid fa-volume-high text-cyan-400";
                if (btn) btn.className = "p-2 rounded-xl bg-slate-800/80 active:bg-slate-700 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9";
                showToast("Sound FX Enabled");
                playSfx('check');
            }
        }

        function playSfx(type) {
            if (isMuted) return;
            try {
                initAudio();
                if (!audioCtx) return;

                const now = audioCtx.currentTime;

                if (type === 'check') {
                    // 1. Transient tactile attack click (crisp mechanical snap)
                    const pop = audioCtx.createOscillator();
                    const popG = audioCtx.createGain();
                    pop.type = 'triangle';
                    pop.frequency.setValueAtTime(1050, now);
                    pop.frequency.exponentialRampToValueAtTime(260, now + 0.038);
                    popG.gain.setValueAtTime(0.14, now);
                    popG.gain.exponentialRampToValueAtTime(0.001, now + 0.042);
                    pop.connect(popG); popG.connect(sfxOut());
                    pop.start(now); pop.stop(now + 0.045);

                    // 2. Shimmering celestial major chord arpeggio with high crystal 5th (C5 -> E5 -> G5 -> C6 -> E6)
                    const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
                    chord.forEach((f, i) => {
                        const t = now + i * 0.030;
                        const o1 = audioCtx.createOscillator();
                        const o2 = audioCtx.createOscillator(); // detuned for lush sparkle
                        const g = audioCtx.createGain();
                        o1.type = 'sine';
                        o2.type = 'triangle';
                        o1.frequency.setValueAtTime(f, t);
                        o2.frequency.setValueAtTime(f * 1.004, t);
                        g.gain.setValueAtTime(0.0001, t);
                        g.gain.exponentialRampToValueAtTime(0.16, t + 0.015);
                        g.gain.exponentialRampToValueAtTime(0.001, t + 0.44);
                        o1.connect(g); o2.connect(g);
                        g.connect(sfxOut());
                        o1.start(t); o2.start(t);
                        o1.stop(t + 0.46); o2.stop(t + 0.46);
                    });

                    // 3. Warm sub-harmonic bass foundation (82.4Hz -> 41.2Hz)
                    const sub = audioCtx.createOscillator();
                    const subG = audioCtx.createGain();
                    sub.type = 'sine';
                    sub.frequency.setValueAtTime(82.4, now);
                    sub.frequency.exponentialRampToValueAtTime(41.2, now + 0.18);
                    subG.gain.setValueAtTime(0.15, now);
                    subG.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
                    sub.connect(subG); subG.connect(sfxOut());
                    sub.start(now); sub.stop(now + 0.24);
                } else if (type === 'uncheck') {
                    // Organic soft descending lowpass dual-bubble drop
                    const osc1 = audioCtx.createOscillator();
                    const osc2 = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    const filter = audioCtx.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(950, now);
                    filter.frequency.exponentialRampToValueAtTime(150, now + 0.12);
                    osc1.type = 'sine';
                    osc1.frequency.setValueAtTime(420, now);
                    osc1.frequency.exponentialRampToValueAtTime(160, now + 0.12);
                    osc2.type = 'sine';
                    osc2.frequency.setValueAtTime(210, now);
                    osc2.frequency.exponentialRampToValueAtTime(80, now + 0.12);
                    gain.gain.setValueAtTime(0.14, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                    osc1.connect(gain); osc2.connect(gain);
                    gain.connect(filter); filter.connect(sfxOut());
                    osc1.start(now); osc2.start(now);
                    osc1.stop(now + 0.13); osc2.stop(now + 0.13);
                } else if (type === 'click') {
                    // Silky organic mechanical bubble pop
                    const osc1 = audioCtx.createOscillator();
                    const osc2 = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    const filter = audioCtx.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(2600, now);
                    filter.frequency.exponentialRampToValueAtTime(500, now + 0.03);
                    osc1.type = 'sine';
                    osc1.frequency.setValueAtTime(820, now);
                    osc1.frequency.exponentialRampToValueAtTime(260, now + 0.03);
                    osc2.type = 'triangle';
                    osc2.frequency.setValueAtTime(1400, now);
                    osc2.frequency.exponentialRampToValueAtTime(340, now + 0.02);
                    gain.gain.setValueAtTime(0.08, now);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
                    osc1.connect(gain); osc2.connect(gain);
                    gain.connect(filter); filter.connect(sfxOut());
                    osc1.start(now); osc2.start(now);
                    osc1.stop(now + 0.04); osc2.stop(now + 0.04);
                } else if (type === 'hover') {
                    // Delicate crystal glass micro-tick
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(1200, now);
                    osc.frequency.exponentialRampToValueAtTime(1450, now + 0.018);
                    gain.gain.setValueAtTime(0.016, now);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);
                    osc.connect(gain);
                    gain.connect(sfxOut());
                    osc.start(now);
                    osc.stop(now + 0.025);
                } else if (type === 'tab') {
                    // 3-tone glass marimba cascade (D5 -> G5 -> B5)
                    [587.33, 783.99, 987.77].forEach((f, i) => {
                        const t = now + i * 0.022;
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(f, t);
                        gain.gain.setValueAtTime(0.0001, t);
                        gain.gain.exponentialRampToValueAtTime(0.065, t + 0.008);
                        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.075);
                        osc.connect(gain); gain.connect(sfxOut());
                        osc.start(t); osc.stop(t + 0.08);
                    });
                } else if (type === 'pomodoroStart') {
                    // Uplifting focus triad chord (F4 -> A4 -> C5 -> F5)
                    [349.23, 440.00, 523.25, 698.46].forEach((f, i) => {
                        const t = now + i * 0.045;
                        const o1 = audioCtx.createOscillator(), o2 = audioCtx.createOscillator();
                        const g = audioCtx.createGain();
                        o1.type = 'sine'; o2.type = 'triangle';
                        o1.frequency.setValueAtTime(f, t);
                        o2.frequency.setValueAtTime(f * 1.002, t);
                        g.gain.setValueAtTime(0.0001, t);
                        g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
                        g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
                        o1.connect(g); o2.connect(g);
                        g.connect(sfxOut());
                        o1.start(t); o2.start(t);
                        o1.stop(t + 0.6); o2.stop(t + 0.6);
                    });
                } else if (type === 'pomodoroComplete') {
                    // Tibetan singing bowl harmonic ring (432Hz, 864Hz, 1296Hz) + high shimmer
                    [432.0, 864.0, 1296.0, 2093.0].forEach((freq, idx) => {
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.type = idx === 3 ? 'triangle' : 'sine';
                        osc.frequency.setValueAtTime(freq, now);
                        gain.gain.setValueAtTime(0.0001, now);
                        gain.gain.exponentialRampToValueAtTime(0.18 / (idx + 1), now + 0.04);
                        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
                        osc.connect(gain); gain.connect(sfxOut());
                        osc.start(now); osc.stop(now + 2.9);
                    });
                } else if (type === 'habitCelebration') {
                    // Celebratory victory fanfare arpeggio (C5 -> E5 -> G5 -> C6 -> E6 -> G6)
                    [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98].forEach((f, i) => {
                        const t = now + i * 0.04;
                        const o1 = audioCtx.createOscillator(), o2 = audioCtx.createOscillator();
                        const g = audioCtx.createGain();
                        o1.type = 'triangle'; o2.type = 'sine';
                        o1.frequency.setValueAtTime(f, t);
                        o2.frequency.setValueAtTime(f * 1.003, t);
                        g.gain.setValueAtTime(0.0001, t);
                        g.gain.exponentialRampToValueAtTime(0.14, t + 0.02);
                        g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
                        o1.connect(g); o2.connect(g);
                        g.connect(sfxOut());
                        o1.start(t); o2.start(t);
                        o1.stop(t + 0.65); o2.stop(t + 0.65);
                    });
                } else if (type === 'themeShift') {
                    const isLight = document.documentElement.getAttribute('data-mode') === 'light';
                    if (isLight) {
                        // Crystal sunburst chime cascade
                        [659.25, 830.61, 987.77, 1318.51, 1661.22].forEach((f, i) => {
                            const o = audioCtx.createOscillator(), g = audioCtx.createGain();
                            o.type = 'sine'; o.frequency.setValueAtTime(f, now + i * 0.032);
                            g.gain.setValueAtTime(0.09, now + i * 0.032);
                            g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.032 + 0.32);
                            o.connect(g); g.connect(sfxOut());
                            o.start(now + i * 0.032); o.stop(now + i * 0.032 + 0.35);
                        });
                    } else {
                        // Deep cyberpunk warp resonance drop
                        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
                        o.type = 'triangle';
                        o.frequency.setValueAtTime(520, now);
                        o.frequency.exponentialRampToValueAtTime(85, now + 0.22);
                        g.gain.setValueAtTime(0.14, now);
                        g.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
                        o.connect(g); g.connect(sfxOut());
                        o.start(now); o.stop(now + 0.28);
                    }
                } else if (type === 'zenBell') {
                    // Authentic singing bowl harmonic bell
                    [432.0, 864.0, 1296.0].forEach((freq, idx) => {
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(freq, now);
                        gain.gain.setValueAtTime(0.0001, now);
                        gain.gain.exponentialRampToValueAtTime(0.18 / (idx + 1), now + 0.04);
                        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);
                        osc.connect(gain); gain.connect(sfxOut());
                        osc.start(now); osc.stop(now + 2.5);
                    });
                } else if (type === 'quantumHum') {
                    // Cybernetic quantum activation warp hum
                    const osc1 = audioCtx.createOscillator();
                    const osc2 = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    const filter = audioCtx.createBiquadFilter();
                    filter.type = 'bandpass';
                    filter.frequency.setValueAtTime(440, now);
                    filter.frequency.exponentialRampToValueAtTime(1760, now + 0.12);
                    filter.frequency.exponentialRampToValueAtTime(880, now + 0.28);
                    filter.Q.setValueAtTime(4, now);
                    osc1.type = 'sawtooth';
                    osc2.type = 'sine';
                    osc1.frequency.setValueAtTime(140, now);
                    osc1.frequency.exponentialRampToValueAtTime(440, now + 0.12);
                    osc1.frequency.exponentialRampToValueAtTime(220, now + 0.28);
                    osc2.frequency.setValueAtTime(280, now);
                    osc2.frequency.exponentialRampToValueAtTime(880, now + 0.12);
                    gain.gain.setValueAtTime(0.0001, now);
                    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.04);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
                    osc1.connect(gain); osc2.connect(gain);
                    gain.connect(filter); filter.connect(sfxOut());
                    osc1.start(now); osc2.start(now);
                    osc1.stop(now + 0.35); osc2.stop(now + 0.35);
                } else if (type === 'fanfare') {
                    // Ascending digital victory fanfare
                    [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((f, i) => {
                        const t = now + i * 0.045;
                        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
                        o.type = 'triangle';
                        o.frequency.setValueAtTime(f, t);
                        g.gain.setValueAtTime(0.0001, t);
                        g.gain.exponentialRampToValueAtTime(0.12, t + 0.015);
                        g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
                        o.connect(g); g.connect(sfxOut());
                        o.start(t); o.stop(t + 0.5);
                    });
                } else if (type === 'modalOpen') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(240, now);
                    osc.frequency.exponentialRampToValueAtTime(480, now + 0.16);
                    gain.gain.setValueAtTime(0.11, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
                    osc.connect(gain);
                    gain.connect(sfxOut());
                    osc.start(now);
                    osc.stop(now + 0.18);
                } else if (type === 'modalClose') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(480, now);
                    osc.frequency.exponentialRampToValueAtTime(240, now + 0.12);
                    gain.gain.setValueAtTime(0.09, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                    osc.connect(gain);
                    gain.connect(sfxOut());
                    osc.start(now);
                    osc.stop(now + 0.12);
                } else if (type === 'slideNext') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(600, now);
                    osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);
                    gain.gain.setValueAtTime(0.075, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                    osc.connect(gain);
                    gain.connect(sfxOut());
                    osc.start(now);
                    osc.stop(now + 0.08);
                } else if (type === 'arcIgnite') {
                    const lp = audioCtx.createBiquadFilter(); lp.type = 'lowpass';
                    lp.frequency.setValueAtTime(900, now); lp.frequency.exponentialRampToValueAtTime(5200, now + 1.1); lp.connect(sfxOut());
                    [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
                        const t = now + i * 0.11, o = audioCtx.createOscillator(), g = audioCtx.createGain();
                        o.type = i % 2 ? 'sine' : 'triangle'; o.frequency.setValueAtTime(f, t);
                        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.14, t + 0.03); g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
                        o.connect(g); g.connect(lp); o.start(t); o.stop(t + 0.95);
                    });
                    const pad = audioCtx.createOscillator(), pg = audioCtx.createGain(); pad.type = 'sine'; pad.frequency.setValueAtTime(130.81, now);
                    pg.gain.setValueAtTime(0.0001, now); pg.gain.exponentialRampToValueAtTime(0.1, now + 0.5); pg.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
                    pad.connect(pg); pg.connect(lp); pad.start(now); pad.stop(now + 1.85);
                } else if (type === 'fanfare') {
                    // Royal celebratory victory fanfare
                    const chord = [
                        { f: 523.25, t: 0.00 }, // C5
                        { f: 659.25, t: 0.05 }, // E5
                        { f: 783.99, t: 0.10 }, // G5
                        { f: 1046.50, t: 0.15 }, // C6
                        { f: 1318.51, t: 0.22 }, // E6
                        { f: 1567.98, t: 0.28 }, // G6
                        { f: 2093.00, t: 0.35 }  // C7 Shimmer
                    ];
                    chord.forEach(({ f, t }) => {
                        const o1 = audioCtx.createOscillator();
                        const o2 = audioCtx.createOscillator();
                        const g = audioCtx.createGain();
                        o1.type = 'triangle';
                        o2.type = 'sine';
                        o1.frequency.setValueAtTime(f, now + t);
                        o2.frequency.setValueAtTime(f * 1.003, now + t);
                        g.gain.setValueAtTime(0.0001, now + t);
                        g.gain.exponentialRampToValueAtTime(0.18, now + t + 0.02);
                        g.gain.exponentialRampToValueAtTime(0.001, now + t + 0.65);
                        o1.connect(g); o2.connect(g);
                        g.connect(sfxOut());
                        o1.start(now + t); o2.start(now + t);
                        o1.stop(now + t + 0.7); o2.stop(now + t + 0.7);
                    });
                    const sub = audioCtx.createOscillator(), subG = audioCtx.createGain();
                    sub.type = 'sine'; sub.frequency.setValueAtTime(130.81, now);
                    subG.gain.setValueAtTime(0.18, now);
                    subG.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
                    sub.connect(subG); subG.connect(sfxOut());
                    sub.start(now); sub.stop(now + 0.9);
                } else if (type === 'gradeS' || type === 'gradeA' || type === 'gradeB') {
                    playGradeSfx(type.replace('grade', ''));
                } else if (type === 'secretUnlocked') {
                    const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
                    chord.forEach((freq, idx) => {
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.type = 'triangle';
                        const t = now + idx * 0.055;
                        osc.frequency.setValueAtTime(freq, t);
                        gain.gain.setValueAtTime(0.0001, t);
                        gain.gain.exponentialRampToValueAtTime(0.14, t + 0.03);
                        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
                        osc.connect(gain);
                        gain.connect(sfxOut());
                        osc.start(t);
                        osc.stop(t + 0.75);
                    });
                } else if (type === 'matrixGlitch') {
                    [1200, 800, 1400, 600, 1600, 950].forEach((freq, idx) => {
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.type = 'sawtooth';
                        const t = now + idx * 0.032;
                        osc.frequency.setValueAtTime(freq, t);
                        gain.gain.setValueAtTime(0.07, t);
                        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
                        osc.connect(gain);
                        gain.connect(sfxOut());
                        osc.start(t);
                        osc.stop(t + 0.032);
                    });
                } else if (type === 'radarPing') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(1760, now);
                    osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
                    gain.gain.setValueAtTime(0.12, now);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
                    osc.connect(gain);
                    gain.connect(sfxOut());
                    osc.start(now);
                    osc.stop(now + 0.35);
                } else if (type === 'arcadeChiptune') {
                    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
                    notes.forEach((freq, idx) => {
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.type = 'square';
                        const t = now + idx * 0.07;
                        osc.frequency.setValueAtTime(freq, t);
                        gain.gain.setValueAtTime(0.07, t);
                        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.065);
                        osc.connect(gain);
                        gain.connect(sfxOut());
                        osc.start(t);
                        osc.stop(t + 0.07);
                    });
                } else if (type === 'quantumHum') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(65.41, now);
                    osc.frequency.exponentialRampToValueAtTime(130.81, now + 0.6);
                    gain.gain.setValueAtTime(0.001, now);
                    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.2);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
                    osc.connect(gain);
                    gain.connect(sfxOut());
                    osc.start(now);
                    osc.stop(now + 0.9);
                } else if (type === 'zenChime') {
                    [432, 864].forEach((freq, i) => {
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(freq, now);
                        gain.gain.setValueAtTime(0.0001, now);
                        gain.gain.exponentialRampToValueAtTime(0.12 / (i + 1), now + 0.1);
                        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
                        osc.connect(gain);
                        gain.connect(sfxOut());
                        osc.start(now);
                        osc.stop(now + 2.3);
                    });
                } else if (type === 'infernoRoar') {
                    const osc = audioCtx.createOscillator();
                    const filter = audioCtx.createBiquadFilter();
                    const gain = audioCtx.createGain();
                    osc.type = 'sawtooth';
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(120, now);
                    filter.frequency.linearRampToValueAtTime(600, now + 0.3);
                    filter.frequency.exponentialRampToValueAtTime(80, now + 0.8);
                    osc.frequency.setValueAtTime(70, now);
                    osc.frequency.linearRampToValueAtTime(180, now + 0.3);
                    gain.gain.setValueAtTime(0.001, now);
                    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.2);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(sfxOut());
                    osc.start(now);
                    osc.stop(now + 0.85);
                } else if (type === 'strictDenied' || type === 'denied') {
                    const o1 = audioCtx.createOscillator();
                    const o2 = audioCtx.createOscillator();
                    const g = audioCtx.createGain();
                    o1.type = 'sawtooth';
                    o2.type = 'square';
                    o1.frequency.setValueAtTime(140, now);
                    o2.frequency.setValueAtTime(144, now);
                    o1.frequency.exponentialRampToValueAtTime(65, now + 0.32);
                    o2.frequency.exponentialRampToValueAtTime(68, now + 0.32);
                    g.gain.setValueAtTime(0.22, now);
                    g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                    o1.connect(g);
                    o2.connect(g);
                    g.connect(sfxOut());
                    o1.start(now);
                    o2.start(now);
                    o1.stop(now + 0.36);
                    o2.stop(now + 0.36);
                }
            } catch(e) {
                console.warn('Audio playback suppressed', e);
            }
        }

        function playGradeSfx(grade) {
            if (isMuted) return;
            try {
                initAudio();
                if (!audioCtx) return;
                const now = audioCtx.currentTime;

                if (grade === 'S') {
                    // Royal celestial ascending arpeggio with high harmonic bell chime
                    const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
                    freqs.forEach((f, idx) => {
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.type = (idx % 2 === 0) ? 'triangle' : 'sine';
                        osc.frequency.setValueAtTime(f, now + idx * 0.055);
                        gain.gain.setValueAtTime(0.0001, now + idx * 0.055);
                        gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.055 + 0.02);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.055 + 0.55);
                        osc.connect(gain);
                        gain.connect(sfxOut());
                        osc.start(now + idx * 0.055);
                        osc.stop(now + idx * 0.055 + 0.6);
                    });
                    // Radiant high bell shimmer
                    const bell = audioCtx.createOscillator();
                    const bGain = audioCtx.createGain();
                    bell.type = 'sine';
                    bell.frequency.setValueAtTime(2093.00, now + 0.28);
                    bGain.gain.setValueAtTime(0.12, now + 0.28);
                    bGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);
                    bell.connect(bGain);
                    bGain.connect(sfxOut());
                    bell.start(now + 0.28);
                    bell.stop(now + 1.0);
                } else if (grade === 'A') {
                    // Bright harmonic melodic double-chime
                    const freqs = [587.33, 880.00, 1174.66]; // D5, A5, D6
                    freqs.forEach((f, idx) => {
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(f, now + idx * 0.07);
                        gain.gain.setValueAtTime(0.0001, now + idx * 0.07);
                        gain.gain.exponentialRampToValueAtTime(0.14, now + idx * 0.07 + 0.015);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.38);
                        osc.connect(gain);
                        gain.connect(sfxOut());
                        osc.start(now + idx * 0.07);
                        osc.stop(now + idx * 0.07 + 0.4);
                    });
                } else if (grade === 'B') {
                    // Soft mellow warm harmonic tone
                    const freqs = [440.00, 659.25]; // A4, E5
                    freqs.forEach((f, idx) => {
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(f, now + idx * 0.06);
                        gain.gain.setValueAtTime(0.0001, now + idx * 0.06);
                        gain.gain.exponentialRampToValueAtTime(0.10, now + idx * 0.06 + 0.015);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.28);
                        osc.connect(gain);
                        gain.connect(sfxOut());
                        osc.start(now + idx * 0.06);
                        osc.stop(now + idx * 0.06 + 0.3);
                    });
                } else {
                    playSfx('click');
                }
            } catch(e) {
                console.warn('Audio playback suppressed', e);
            }
        }
        window.playGradeSfx = playGradeSfx;

        function playKeypadNote(digit) {
            if (isMuted) return;
            try {
                initAudio();
                if (!audioCtx) return;
                const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
                const d = parseInt(digit, 10);
                const freq = scale[isNaN(d) ? 0 : (d % scale.length)];
                const now = audioCtx.currentTime;
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now);
                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(0.12, now + 0.015);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
                osc.connect(gain); gain.connect(sfxOut());
                osc.start(now); osc.stop(now + 0.24);
            } catch(e) {}
        }
        window.playKeypadNote = playKeypadNote;

        function createClickRipple(e, targetEl) {
            try {
                const target = targetEl || (e && e.target && e.target.closest('button, [role="button"], [role="tab"], .calendar-day-card, .arc-pad-btn, .pp-btn, .pp-tab, .habit-row, .glass-card-hover'));
                if (!target) return;
                const rect = target.getBoundingClientRect();
                const ripple = document.createElement('span');
                const size = Math.max(rect.width, rect.height) * 1.6;
                const clickX = (e && e.clientX ? e.clientX : (rect.left + rect.width / 2));
                const clickY = (e && e.clientY ? e.clientY : (rect.top + rect.height / 2));
                const x = clickX - rect.left - size / 2;
                const y = clickY - rect.top - size / 2;

                ripple.className = 'arc-click-ripple';
                ripple.style.width = `${size}px`;
                ripple.style.height = `${size}px`;
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;

                const prevOverflow = target.style.overflow;
                const computedPos = window.getComputedStyle(target).position;
                if (computedPos === 'static') target.style.position = 'relative';
                target.style.overflow = 'hidden';

                target.appendChild(ripple);
                setTimeout(() => {
                    if (ripple.parentNode) ripple.remove();
                    target.style.overflow = prevOverflow;
                }, 550);
            } catch(err) {}
        }
        window.createClickRipple = createClickRipple;

        // Global Tactile Feedback & Touch Ripple
        let _lastSfxTime = 0;
        document.addEventListener('click', (e) => {
            const clickable = e.target.closest('button, [role="button"], [role="tab"], .calendar-day-card, .arc-pad-btn, .pp-btn, .pp-tab');
            if (!clickable) return;
            createClickRipple(e, clickable);
            const now = Date.now();
            if (now - _lastSfxTime > 50 && !clickable.closest('.habit-checkbox') && !clickable.hasAttribute('onclick')) {
                _lastSfxTime = now;
                playSfx('click');
            }
        }, { passive: true });

        /* ==========================================================================
           2. CANVAS VISUAL EFFECTS MODULE (OPTIMIZED WITH PAGE VISIBILITY API)
           ========================================================================== */
        let fxParticles = []; try { Object.defineProperty(window, 'fxParticles', { get: () => fxParticles, set: v => { fxParticles = v; }, configurable: true }); } catch(e) { window.fxParticles = fxParticles; }
        let fxConfetti = [];
        let fxClickTrails = [];

        function drawSnowflake(ctx, x, y, radius, color, alpha, rot, bass) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rot);
            ctx.strokeStyle = `rgba(${color}, ${alpha})`;
            ctx.fillStyle = `rgba(${color}, ${alpha})`;
            const lw = Math.max(0.85, radius * 0.16);
            ctx.lineWidth = lw;
            ctx.lineCap = 'round';

            // 6-pointed hexagonal crystal dendrites
            const arms = 6;
            const branchLen = radius * 0.44;
            for (let i = 0; i < arms; i++) {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, -radius);
                ctx.stroke();

                if (radius > 1.8) {
                    const bY = -radius * 0.58;
                    ctx.beginPath();
                    ctx.moveTo(0, bY);
                    ctx.lineTo(-branchLen, bY - branchLen * 0.55);
                    ctx.moveTo(0, bY);
                    ctx.lineTo(branchLen, bY - branchLen * 0.55);
                    ctx.stroke();
                }
                if (radius > 4.2) {
                    const bY2 = -radius * 0.82;
                    const branchLen2 = branchLen * 0.55;
                    ctx.beginPath();
                    ctx.moveTo(0, bY2);
                    ctx.lineTo(-branchLen2, bY2 - branchLen2 * 0.55);
                    ctx.moveTo(0, bY2);
                    ctx.lineTo(branchLen2, bY2 - branchLen2 * 0.55);
                    ctx.stroke();
                }
                ctx.rotate(Math.PI / 3);
            }
            // Central frosty ice core
            ctx.beginPath();
            ctx.arc(0, 0, Math.max(0.75, radius * 0.2), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        function initFxCanvas() {
            const canvas = document.getElementById('fx-canvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            let W = window.innerWidth, H = window.innerHeight;

            function resize() {
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                W = window.innerWidth; H = window.innerHeight;
                canvas.width = Math.round(W * dpr);
                canvas.height = Math.round(H * dpr);
                canvas.style.width = W + 'px';
                canvas.style.height = H + 'px';
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }
            let rzT = 0;
            window.addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(resize, 120); });
            resize();

            // Track cursor clicks for particle ripple trails
            window.addEventListener('click', (e) => {
                if (window.__fxOff || (window.ArcHardwareGatekeeper && window.ArcHardwareGatekeeper.isParticlesDisabled())) return;
                const isSummer = state.currentArc === 'summer';
                const isBw = document.documentElement.classList.contains('arc-bw-mode');
                const isLight = document.documentElement.getAttribute('data-mode') === 'light';
                const color = isBw ? (isLight ? '0, 0, 0' : '255, 255, 255') : (window.__fxRGB || (isSummer ? '245, 158, 11' : '0, 240, 255'));
                for (let i = 0; i < 6; i++) {
                    fxClickTrails.push({
                        x: e.clientX,
                        y: e.clientY,
                        radius: Math.random() * 4 + 2,
                        vx: (Math.random() - 0.5) * 4,
                        vy: (Math.random() - 0.5) * 4,
                        alpha: 1,
                        color: color
                    });
                }
                startLoop();
            });

            fxParticles = [];
            const isParticlesOff = window.__fxOff || (window.ArcHardwareGatekeeper && window.ArcHardwareGatekeeper.isParticlesDisabled());
            const particleCount = isParticlesOff ? 0 : (window.innerWidth < 640 ? 55 : 95);
            for (let i = 0; i < particleCount; i++) {
                const rad = Math.random() * 2.8 + 0.9;
                fxParticles.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    radius: rad,
                    _r0: rad,
                    vx: (Math.random() - 0.5) * 0.7,
                    _v0: (Math.random() - 0.5) * 0.7,
                    vy: Math.random() * 1.0 + 0.8,
                    alpha: Math.random() * 0.45 + 0.35,
                    _a0: Math.random() * 0.45 + 0.35
                });
            }

            let rafId = 0, lastT = 0, nextT = 0;
            const FRAME_MS = 1000 / 60;
            function stopLoop() { if (rafId) { cancelAnimationFrame(rafId); rafId = 0; } }
            function startLoop() {
                if (window.__fxOff || (window.ArcHardwareGatekeeper && window.ArcHardwareGatekeeper.isParticlesDisabled())) return;
                if (!rafId && !document.hidden) {
                    lastT = 0;
                    nextT = 0;
                    rafId = requestAnimationFrame(loop);
                }
            }
            window.__fxStart = startLoop; window.__fxStop = stopLoop;
            document.addEventListener('visibilitychange', () => { document.hidden ? stopLoop() : startLoop(); });

            function getCelestialAudioSync() {
                let b = 0, m = 0, t = 0;
                const rObj = (typeof window.__audioBands !== 'undefined') ? window.__audioBands : ((typeof window.R !== 'undefined') ? window.R : ((typeof R !== 'undefined') ? R : null));
                if (rObj) {
                    b = Math.max(b, rObj.b || 0);
                    m = Math.max(m, rObj.m || 0);
                    t = Math.max(t, rObj.t || 0);
                }
                if (typeof window.__getHbBands === 'function') {
                    const hb = window.__getHbBands();
                    if (hb) {
                        b = Math.max(b, (hb.b || 0) * 0.5);
                        m = Math.max(m, (hb.m || 0) * 0.5);
                        t = Math.max(t, (hb.t || 0) * 0.5);
                    }
                }
                return { b, m, t, active: (b > 0.02 || m > 0.02 || t > 0.02) };
            }

            function loop(ts) {
                rafId = 0;
                if (document.hidden) return;
                rafId = requestAnimationFrame(loop);
                if (nextT && ts < nextT - 1) return;
                nextT = Math.max((nextT || ts) + (window.__fxMs || FRAME_MS), ts);
                const dt = Math.min((ts - (lastT || (ts - 16.7))) / 1000, 0.05);
                const k = dt > 0 ? dt * 60 : 1.0;
                lastT = ts;

                ctx.clearRect(0, 0, W, H);

                const isSummer = state.currentArc === 'summer';
                const isBwMode = document.documentElement.classList.contains('arc-bw-mode');
                const isLightMode = document.documentElement.getAttribute('data-mode') === 'light';
                const particleColor = isBwMode
                    ? (isLightMode ? '0, 0, 0' : '255, 255, 255')
                    : (window.__fxRGB || (isSummer ? '245, 158, 11' : '0, 240, 255'));

                const audio = getCelestialAudioSync();
                const bass = Math.min(1.8, audio.b);
                const mid = Math.min(1.8, audio.m);
                const treble = Math.min(1.8, audio.t);

                // Preserve user density preference; re-seed only if completely empty and effects enabled
                if (!window.__fxOff && (!state.settings || state.settings.particleDensity !== 'off') && fxParticles.length === 0) {
                    const targetCount = (window.innerWidth < 640 ? 40 : 80);
                    while (fxParticles.length < targetCount) {
                        const rad = Math.random() * 2.8 + 0.5;
                        const v_x = (Math.random() - 0.5) * 0.5;
                        const a = Math.random() * 0.5 + 0.2;
                        fxParticles.push({
                            x: Math.random() * W,
                            y: Math.random() * H,
                            radius: rad,
                            _r0: rad,
                            vx: v_x,
                            _v0: v_x,
                            vy: Math.random() * 0.8 + 0.3,
                            alpha: a,
                            _a0: a,
                            rot: Math.random() * Math.PI * 2,
                            vRot: (Math.random() - 0.5) * 0.02
                        });
                    }
                }

                const isWinter = state.currentArc !== 'summer';
                const isSnowflakeMode = isWinter && (
                    (!state.settings || (state.settings.snowflakeParticles !== false && state.settings.winterParticleShape !== 'dots')) &&
                    (typeof cfg === 'undefined' || !cfg.fx || cfg.fx.snowflakes !== false)
                );

                fxParticles.forEach(p => {
                    if (p._r0 === undefined) { p._r0 = p.radius; p._v0 = p.vx; p._a0 = p.alpha; }

                    // Audio-reactive particle radius swells in sync with celestial bass frequency
                    const curRadius = (p.radius != null) ? p.radius : (p._r0 * (1 + bass * 1.4));
                    // Audio-reactive particle opacity glows with the celestial chords
                    const curAlpha = (p.alpha != null) ? p.alpha : Math.min(1, (p._a0 || 0.4) * (1 + bass * 0.7));

                    if (isSnowflakeMode) {
                        p.rot = (p.rot || (Math.random() * 6.28)) + ((p.vRot || ((p._v0 || 0.2) * 0.035)) * (1 + bass * 0.8)) * k;
                        drawSnowflake(ctx, p.x, p.y, curRadius, particleColor, curAlpha, p.rot, bass);
                    } else {
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, curRadius, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(${particleColor}, ${curAlpha})`;
                        ctx.fill();
                    }

                    // Subtle resonance aura around particles when bass pulses
                    if (bass > 0.15 || (audio.b > 0.15)) {
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, curRadius * 1.7, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(${particleColor}, ${curAlpha * 0.22})`;
                        ctx.fill();
                    }

                    if (isSummer) {
                        // Rising amber ember sparks with celestial harmonic wave drift
                        p.y -= (p.vy * 0.5 + bass * 0.35) * k;
                        if (p.y < 0) { p.y = H; p.x = Math.random() * W; }
                    } else {
                        // Gentle crisp snowfall swaying in rhythm to celestial drone
                        p.y += (p.vy + bass * 0.4) * k;
                        if (p.y > H) { p.y = 0; p.x = Math.random() * W; }
                    }
                    const curVx = (p.vx != null) ? p.vx : (p._v0 + Math.sin((ts * 0.0015) + p.y * 0.01) * mid * 1.8);
                    p.x += curVx * k;
                    if (p.x < 0) p.x = W;
                    if (p.x > W) p.x = 0;
                });

                // Treble sparks in sync with celestial harmonics
                if (treble > 0.12 && Math.random() < treble * 0.35) {
                    const rx = Math.random() * W, ry = Math.random() * H;
                    ctx.save();
                    ctx.fillStyle = `rgba(${particleColor}, 0.85)`;
                    ctx.fillRect(rx - 5, ry, 11, 1);
                    ctx.fillRect(rx, ry - 5, 1, 11);
                    ctx.restore();
                }

                for (let i = fxClickTrails.length - 1; i >= 0; i--) {
                    const t = fxClickTrails[i];
                    ctx.beginPath();
                    ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${t.color}, ${t.alpha})`;
                    ctx.fill();

                    t.x += t.vx * k;
                    t.y += t.vy * k;
                    t.radius *= Math.pow(0.96, k);
                    t.alpha -= 0.03 * k;
                    if (t.alpha <= 0) fxClickTrails.splice(i, 1);
                }

                for (let i = fxConfetti.length - 1; i >= 0; i--) {
                    const c = fxConfetti[i];
                    ctx.save();
                    ctx.translate(c.x, c.y);
                    ctx.rotate(c.rotation);
                    ctx.globalAlpha = Math.max(0, Math.min(1, c.alpha != null ? c.alpha : 1));
                    ctx.fillStyle = c.color;
                    if (c.shape === 'star') {
                        // 4-pointed radiant sparkle star
                        const r = c.size;
                        ctx.beginPath();
                        ctx.moveTo(0, -r);
                        ctx.quadraticCurveTo(0, 0, r, 0);
                        ctx.quadraticCurveTo(0, 0, 0, r);
                        ctx.quadraticCurveTo(0, 0, -r, 0);
                        ctx.quadraticCurveTo(0, 0, 0, -r);
                        ctx.fill();
                    } else if (c.shape === 'circle') {
                        ctx.beginPath();
                        ctx.arc(0, 0, c.size / 2, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
                    }
                    ctx.restore();

                    c.x += c.vx * k;
                    c.y += c.vy * k;
                    c.vy += (c.gravity != null ? c.gravity : 0.15) * k;
                    c.rotation += c.vRot * k;
                    c.alpha -= (c.fadeRate || 0.018) * k;

                    if (c.alpha <= 0) fxConfetti.splice(i, 1);
                }

                if (!fxParticles.length && !fxClickTrails.length && !fxConfetti.length) {
                    stopLoop();
                }
            }
            startLoop();
        }

        function triggerConfettiBurst(originX = window.innerWidth / 2, originY = window.innerHeight / 3) {
            if (window.__fxStart) window.__fxStart();
            const colors = state.currentArc === 'summer' 
                ? ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#FBBF24', '#FFFFFF'] 
                : ['#00F0FF', '#38BDF8', '#8B5CF6', '#10B981', '#FFFFFF', '#14B8A6'];

            const count = window.innerWidth < 640 ? 40 : 65;
            for (let i = 0; i < count; i++) {
                fxConfetti.push({
                    x: originX,
                    y: originY,
                    size: Math.random() * 7 + 3,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    vx: (Math.random() - 0.5) * 12,
                    vy: (Math.random() - 0.85) * 12,
                    rotation: Math.random() * Math.PI,
                    vRot: (Math.random() - 0.5) * 0.25,
                    alpha: 1
                });
            }
        }

        function triggerGradeParticleBurst(originX = window.innerWidth / 2, originY = window.innerHeight / 2, grade = 'S') {
            if (window.__fxStart) window.__fxStart();

            let colors, count, speedMul, sizeRange;
            if (grade === 'S') {
                // Tier S (God Tier): Dazzling Emerald, Gold, Cyan & White starbursts
                colors = ['#10B981', '#34D399', '#6EE7B7', '#FBBF24', '#F59E0B', '#00F0FF', '#FFFFFF'];
                count = window.innerWidth < 640 ? 38 : 60;
                speedMul = 1.35;
                sizeRange = [4, 9];
            } else if (grade === 'A') {
                // Tier A (High Tier): Vibrant Cyan, Teal, Sky & Silver sparks
                colors = ['#00F0FF', '#38BDF8', '#14B8A6', '#22D3EE', '#FFFFFF'];
                count = window.innerWidth < 640 ? 18 : 28;
                speedMul = 1.0;
                sizeRange = [3, 7];
            } else if (grade === 'B') {
                // Tier B (Mid Tier): Soft Purple, Violet & Lilac gentle spark puff
                colors = ['#A855F7', '#C084FC', '#818CF8', '#E9D5FF'];
                count = window.innerWidth < 640 ? 8 : 14;
                speedMul = 0.72;
                sizeRange = [2.5, 5];
            } else {
                return;
            }

            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i / count) + (Math.random() - 0.5) * 0.6;
                const speed = (Math.random() * 6 + 3) * speedMul;
                const size = Math.random() * (sizeRange[1] - sizeRange[0]) + sizeRange[0];
                fxConfetti.push({
                    x: originX,
                    y: originY,
                    size: size,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - (grade === 'S' ? 2.8 : 1.2),
                    rotation: Math.random() * Math.PI,
                    vRot: (Math.random() - 0.5) * 0.35,
                    alpha: 1,
                    shape: (grade === 'S' && Math.random() < 0.45) ? 'star' : ((grade === 'B') ? 'circle' : 'square'),
                    fadeRate: grade === 'S' ? 0.014 : (grade === 'A' ? 0.02 : 0.025),
                    gravity: grade === 'S' ? 0.12 : 0.16
                });
            }
        }
        window.triggerGradeParticleBurst = triggerGradeParticleBurst;

// Global Window Bindings for Audio & FX Canvas Engine
const __fxStart = () => (window.__fxStart ? window.__fxStart() : undefined);
const __fxStop = () => (window.__fxStop ? window.__fxStop() : undefined);

if (typeof window !== 'undefined') {
  window.initAudio = initAudio;
  window.initFxCanvas = initFxCanvas;
  window.playSfx = playSfx;
  window.playGradeSfx = playGradeSfx;
  window.playKeypadNote = playKeypadNote;
  window.createClickRipple = createClickRipple;
  window.fxParticles = fxParticles;
  window.triggerConfettiBurst = triggerConfettiBurst;
  window.triggerGradeParticleBurst = triggerGradeParticleBurst;
  window.toggleAudioMute = toggleAudioMute;
  window.__setSfxVol = __setSfxVol;
  window.sfxOut = sfxOut;
}
export {
  initAudio,
  initFxCanvas,
  playSfx,
  playGradeSfx,
  playKeypadNote,
  createClickRipple,
  fxParticles,
  triggerConfettiBurst,
  triggerGradeParticleBurst,
  toggleAudioMute,
  __fxStart,
  __fxStop
};
