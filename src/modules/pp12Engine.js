(function(){'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const DEF={masterVolume:.8,sfxVolume:.9,ambientVolume:.6,sfxEnabled:true,tuningFreq:440,ambientPreset:'solar',sleepTimerMinutes:0,particleDensity:'medium',audioReactiveParticles:true,snowflakeParticles:true,winterParticleShape:'snowflakes',noiseOverlay:true,noiseOpacity:.15,performanceMode:false,theme:'deep-nebula',customAccentHex:'#8b5cf6',customAccentOn:false,mode:'dark',transition:'slide',pulsarBpm:90,focusWork:25,focusBreak:5,focusSyncAudio:true,focusBlocker:true};
const TH={'lunar':['🌑','Lunar Monolith','#e5e7eb','#94a3b8','#0a0a0b'],'solar':['☀️','Solar Flare','#f59e0b','#ea580c','#14100b'],'deep-nebula':['🌌','Deep Nebula','#00f0ff','#d946ef','#060913'],'saturn':['🪐','Saturn Dust','#d4a937','#a8a29e','#1a1714'],'void':['🕳️','Void Black','#39ff14','#22c55e','#000000'],'aurora':['🌿','Aurora Teal','#34d399','#14b8a6','#04120e'],'cyber':['💠','Cyber Magenta','#ec4899','#8b5cf6','#12061a'],'crimson':['🔻','Crimson Void','#f43f5e','#be123c','#14060a']};
const PRE=[['solar','☀️','Solar Wind & Flares'],['lunar','🌙','Lunar Silence & Resonance'],['saturn','🪐','Saturn Rings Vibration'],['nebula','🌌','Deep Nebula Drift'],['pulsar','💫','Pulsar Rhythmic Pulses'],['blackhole','🕳️','Singularity Hum'],['cmb','📡','Cosmic Microwave Background']];
const DN={low:30,medium:75,high:150,ultra:300,off:0};
const S=()=>state.settings||DEF,save=()=>{try{saveToLocalStorage()}catch(e){}},toast=m=>{try{showToast(m)}catch(e){}};
const A={ctx:null,cur:null,on:false,muted:false,sl:[],sleeping:false,nb:{},buf:new Uint8Array(1024)}; window.A = A;
const R={b:0,m:0,t:0,pt:0,sp:[],rg:[],col:'0,240,255'};window.__audioBands=R;window.R=R;
const F={mode:'work',left:1500,run:false,id:0};
let TAB='audio',PEND=null,opener=null,D;
function announce(m){const L=$('#pp12-live');if(L){L.textContent='';setTimeout(()=>{L.textContent=m},40)}}
function ensureState(){state.settings=Object.assign({},DEF,state.settings||{});['calendarEvents','screenTimeLogs'].forEach(k=>{if(!Array.isArray(state[k]))state[k]=[]})}

/* ---------- AUDIO GRAPH: sfx/ambient -> master -> analyser -> speakers ---------- */
let _inEnsure = false;
function ensure(){
 if(_inEnsure) return false;
 _inEnsure = true;
 try {
  try{initAudio()}catch(e){}
  if(typeof audioCtx==='undefined'||!audioCtx)return false;
  if(A.ctx===audioCtx && A.an && A.buf && A.buf.length)return true;
  const c=audioCtx;A.ctx=c;A.master=c.createGain();A.sfx=c.createGain();A.amb=c.createGain();A.an=c.createAnalyser();A.an.fftSize=2048;A.an.smoothingTimeConstant=.8;
  A.sfx.connect(A.master);A.amb.connect(A.master);A.master.connect(A.an);
  let real=null;try{real=Object.getOwnPropertyDescriptor((window.BaseAudioContext||window.AudioContext).prototype,'destination').get.call(c)}catch(e){}
  if(real){A.an.connect(real);try{Object.defineProperty(c,'destination',{get:()=>A.sfx,configurable:true})}catch(e){}}else A.an.connect(c.destination);
  A.buf=new Uint8Array(A.an.frequencyBinCount);vol();return true;
 } finally {
  _inEnsure = false;
 }
}
window.ensureAudioGraph=ensure;
function vol(){if(!A.ctx)return;const s=S(),t=A.ctx.currentTime;
 A.master.gain.setTargetAtTime(A.muted?0:s.masterVolume,t,.03);A.sfx.gain.setTargetAtTime(s.sfxEnabled?s.sfxVolume:0,t,.03);
 if(!A.sleeping){A.amb.gain.cancelScheduledValues(t);A.amb.gain.setTargetAtTime(s.ambientVolume,t,.05)}}
function nbuf(c,type){const n=c.sampleRate*4,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
 for(let i=0;i<n;i++){const w=Math.random()*2-1;if(type==='pink'){b0=.99886*b0+w*.0555179;b1=.99332*b1+w*.0750759;b2=.969*b2+w*.153852;b3=.8665*b3+w*.3104856;b4=.55*b4+w*.5329522;b5=-.7616*b5-w*.016898;d[i]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)*.11;b6=w*.115926}else d[i]=w}return b}
function ir(c,sec,dec){const n=c.sampleRate*sec,b=c.createBuffer(2,n,c.sampleRate);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,dec)}return b}
function mk(c){let dead=false;const src=[];return{
 osc(t,f){const o=c.createOscillator();o.type=t;o.frequency.value=f;o.start();src.push(o);return o},
 noise(t){const n=c.createBufferSource();n.buffer=A.nb[t]||(A.nb[t]=nbuf(c,t));n.loop=true;n.start();src.push(n);return n},
 g(v){const g=c.createGain();g.gain.value=v;return g},
 f(t,fr,q){const f=c.createBiquadFilter();f.type=t;f.frequency.value=fr;if(q)f.Q.value=q;return f},
 every(fn,ms){const run=()=>{if(dead)return;fn();setTimeout(run,ms())};run()},
 stop(){dead=true;src.forEach(s=>{try{s.stop()}catch(e){}})}}}
const P={
solar(c,o,k){const m=mk(c),d=m.osc('sine',60*k),d2=m.osc('triangle',42*k),lf=m.osc('sine',.07),lg=m.g(20*k),vg=m.g(.55),am=m.osc('sine',.05),ag=m.g(.25);
 lf.connect(lg);lg.connect(d.frequency);am.connect(ag);ag.connect(vg.gain);d.connect(vg);d2.connect(vg);vg.connect(o);
 const nz=m.noise('white'),bp=m.f('bandpass',400,2.5),fg=m.g(.0001);nz.connect(bp);bp.connect(fg);fg.connect(o);
 m.every(()=>{const t=c.currentTime;bp.frequency.cancelScheduledValues(t);bp.frequency.setValueAtTime(300,t);bp.frequency.exponentialRampToValueAtTime(3200,t+3.5);bp.frequency.exponentialRampToValueAtTime(350,t+7);
  fg.gain.cancelScheduledValues(t);fg.gain.setValueAtTime(.0001,t);fg.gain.exponentialRampToValueAtTime(.3,t+3);fg.gain.exponentialRampToValueAtTime(.0001,t+7)},()=>9000+Math.random()*7000);return m},
lunar(c,o,k){const m=mk(c),f=220*k,beat=2+Math.random()*2,pl=c.createStereoPanner(),pr=c.createStereoPanner(),g=m.g(.16),cv=c.createConvolver(),wet=m.g(.7),dry=m.g(.6);
 pl.pan.value=-.8;pr.pan.value=.8;m.osc('sine',f).connect(pl);m.osc('sine',f*1.5).connect(pl);m.osc('sine',f+beat).connect(pr);m.osc('sine',f*1.5+beat*.7).connect(pr);
 cv.buffer=ir(c,4,2.5);pl.connect(g);pr.connect(g);g.connect(dry);g.connect(cv);cv.connect(wet);dry.connect(o);wet.connect(o);return m},
saturn(c,o,k){const m=mk(c),out=m.g(.22);
 [1,1.5,2.01].forEach((h,i)=>{const rg=m.g(0),mod=m.osc('sine',(23+i*17)*k),md=m.g(.5);mod.connect(md);md.connect(rg.gain);
  [1,1.004].forEach(dt=>m.osc(i?'sine':'triangle',110*k*h*dt).connect(rg));rg.connect(out)});
 const l=m.osc('sine',.13),lg=m.g(.08);l.connect(lg);lg.connect(out.gain);out.connect(o);return m},
nebula(c,o,k){const m=mk(c),lp=m.f('lowpass',420,.8),pan=c.createStereoPanner(),g=m.g(.2);
 [110,110.9,165.4,82.4].forEach(f=>m.osc('sawtooth',f*k).connect(lp));
 const lf=m.osc('sine',.09),lg=m.g(220),pl=m.osc('sine',.11);lf.connect(lg);lg.connect(lp.frequency);pl.connect(pan.pan);lp.connect(g);g.connect(pan);pan.connect(o);return m},
pulsar(c,o,k){const m=mk(c),a=m.osc('sine',55*k),sh=m.osc('square',110*k),sg=m.g(.15),env=m.g(.0001);a.connect(env);sh.connect(sg);sg.connect(env);env.connect(o);
 m.every(()=>{const t=c.currentTime;env.gain.cancelScheduledValues(t);env.gain.setValueAtTime(.0001,t);env.gain.linearRampToValueAtTime(.9,t+.006);env.gain.exponentialRampToValueAtTime(.0001,t+.28)},()=>60000/(S().pulsarBpm||90));return m},
blackhole(c,o,k){const m=mk(c),lp=m.f('lowpass',500,10),g=m.g(.7),a=m.osc('sine',50*k),b=m.osc('sine',36*k),bg=m.g(.8);a.connect(lp);b.connect(bg);bg.connect(lp);lp.connect(g);g.connect(o);
 m.every(()=>{const t=c.currentTime;[[a.frequency,50,30],[b.frequency,36,30],[lp.frequency,500,70]].forEach(([p,hi,lo])=>{const h=hi*(p===lp.frequency?1:k),l=lo*(p===lp.frequency?1:k);p.cancelScheduledValues(t);p.setValueAtTime(h,t);p.exponentialRampToValueAtTime(l,t+6);p.exponentialRampToValueAtTime(h,t+12)})},()=>12000);return m},
cmb(c,o,k){const m=mk(c),n=m.noise('pink'),hp=m.f('highpass',300),lp=m.f('lowpass',7000),n1=m.f('notch',1000,6),n2=m.f('notch',2600,8),g=m.g(.9),l=m.osc('sine',.05),lg=m.g(400);
 n.connect(hp);hp.connect(n1);n1.connect(n2);n2.connect(lp);lp.connect(g);g.connect(o);l.connect(lg);lg.connect(n1.frequency);return m}};
function fadeOut(){const o=A.cur;if(!o)return;A.cur=null;const t=A.ctx.currentTime,g=o.bus.gain;g.cancelScheduledValues(t);g.setValueAtTime(Math.max(g.value,.0001),t);g.exponentialRampToValueAtTime(.0001,t+.8);setTimeout(()=>{o.stop();try{o.bus.disconnect()}catch(e){}},900)}
function play(name){const s=S();if(name)s.ambientPreset=name;name=s.ambientPreset;if(!name||name==='off'){stopAmb();save();return}
 if(!ensure())return;const c=A.ctx,t=c.currentTime;fadeOut();A.sleeping=false;vol();
 const bus=c.createGain();bus.gain.setValueAtTime(.0001,t);bus.gain.exponentialRampToValueAtTime(1,t+.8);bus.connect(A.amb);
 const inst=P[name](c,bus,s.tuningFreq/440);inst.bus=bus;A.cur=inst;A.on=true;save();ui();
 const p=PRE.find(x=>x[0]===name);announce('Soundscape playing: '+(p?p[2]:name))}
function pauseAmb(){if(A.ctx)fadeOut();A.on=false;ui()}
function stopAmb(){pauseAmb();clearSleep();announce('Soundscape off')}
function toggleAmb(){A.on?stopAmb():play(S().ambientPreset==='off'?'solar':null)}
function cycle(){const o=PRE.map(x=>x[0]),n=o[(o.indexOf(S().ambientPreset)+1)%o.length];play(n)}
function clearSleep(){A.sl.forEach(clearTimeout);A.sl=[];A.sleeping=false}
function setSleep(min){const s=S();s.sleepTimerMinutes=+min;save();clearSleep();if(!min)return;const ms=min*60000;
 A.sl.push(setTimeout(()=>{if(!A.ctx)return;A.sleeping=true;const t=A.ctx.currentTime;A.amb.gain.cancelScheduledValues(t);A.amb.gain.setValueAtTime(A.amb.gain.value,t);A.amb.gain.linearRampToValueAtTime(0,t+60)},Math.max(0,ms-60000)));
 A.sl.push(setTimeout(()=>{stopAmb();s.sleepTimerMinutes=0;save();ui();toast('Sleep timer finished — ambient off')},ms));announce('Sleep timer set for '+min+' minutes')}

/* ---------- AUDIO-REACTIVE CANVAS (FFT 2048: bass / mid / treble) ---------- */
const cv=$('#pp12-fx'),cx=cv.getContext('2d');
function rs(){const d=Math.min(window.devicePixelRatio||1,2);cv.width=Math.round(innerWidth*d);cv.height=Math.round(innerHeight*d);cx.setTransform(d,0,0,d,0,0)}
function rgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return[n>>16&255,n>>8&255,n&255].join(',')}
function bands(){
 if(!A.an || !A.buf || !(A.buf instanceof Uint8Array)){
  R.b*=.9;R.m*=.9;R.pt=R.t;R.t*=.9;
 } else {
  try {
   A.an.getByteFrequencyData(A.buf);
   const hz=(A.ctx&&A.ctx.sampleRate)?A.ctx.sampleRate/2048:21.5;
   const av=(a,b)=>{let s=0,n=0;for(let i=Math.max(1,Math.floor(a/hz));i<=Math.min(Math.ceil(b/hz),A.buf.length-1);i++){s+=A.buf[i];n++}return n?s/n/255:0};
   R.pt=R.t;R.b+=(Math.min(1,av(20,250)*2.2)-R.b)*.3;R.m+=(Math.min(1,av(250,2000)*3)-R.m)*.3;R.t+=(Math.min(1,av(2000,8000)*5)-R.t)*.45;
  } catch(e){ R.b*=.9;R.m*=.9;R.pt=R.t;R.t*=.9; }
 }
 if(typeof window.__getHbBands==='function'){
  const hb=window.__getHbBands();
  if(hb){
   R.b=Math.max(R.b,Math.min(1,(hb.b||0)*0.5));
   R.m=Math.max(R.m,Math.min(1,(hb.m||0)*0.5));
   R.t=Math.max(R.t,Math.min(1,(hb.t||0)*0.5));
  }
 }
}
let pRaf=0,pLast=0;function frame(ts){pRaf=0;if(document.hidden)return;pRaf=requestAnimationFrame(frame);if(ts-pLast<15.6)return;pLast=ts;bands();const s=S(),re=s.audioReactiveParticles&&s.particleDensity!=='off';cx.clearRect(0,0,cv.width,cv.height);
 if(typeof fxParticles!=='undefined')fxParticles.forEach(p=>{if(p._r0===undefined){p._r0=p.radius;p._v0=p.vx;p._a0=p.alpha}
  if(re){p.radius=p._r0*(1+R.b*1.4);p.vx=p._v0+Math.sin(ts*.0015+p.y*.01)*R.m*1.8;p.alpha=Math.min(1,(p._a0||p.alpha)*(1+R.b*0.7))}else{p.radius=p._r0;p.vx=p._v0;if(p._a0!==undefined)p.alpha=p._a0}});
 if(!re)return;const W=innerWidth,H=innerHeight;
 if(!s.performanceMode&&R.b>.03){const r=120+R.b*320,g=cx.createRadialGradient(W/2,H*.45,0,W/2,H*.45,r);g.addColorStop(0,`rgba(${R.col},${.05+R.b*.28})`);g.addColorStop(1,`rgba(${R.col},0)`);cx.fillStyle=g;cx.fillRect(0,0,W,H)}
 if(R.t>.12&&R.sp.length<80&&Math.random()<R.t*1.2)R.sp.push({x:Math.random()*W,y:Math.random()*H,l:1,r:1+Math.random()*2.5});
 if(R.t-R.pt>.1&&R.rg.length<6)R.rg.push({x:Math.random()*W,y:Math.random()*H,r:4,l:1});
 R.sp=R.sp.filter(q=>{q.l-=.025;if(q.l<=0)return false;cx.globalAlpha=q.l;cx.fillStyle=`rgb(${R.col})`;cx.fillRect(q.x-q.r*3,q.y-.5,q.r*6,1);cx.fillRect(q.x-.5,q.y-q.r*3,1,q.r*6);return true});
 R.rg=R.rg.filter(g=>{g.r+=3;g.l-=.02;if(g.l<=0)return false;cx.globalAlpha=g.l*.6;cx.strokeStyle=`rgb(${R.col})`;cx.beginPath();cx.arc(g.x,g.y,g.r,0,6.283);cx.stroke();return true});cx.globalAlpha=1}
function density(){if(typeof fxParticles==='undefined')return;const n=DN[S().particleDensity];if(n===undefined)return;
 while(fxParticles.length>n)fxParticles.pop();while(fxParticles.length<n)fxParticles.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,radius:Math.random()*2.8+.5,vx:(Math.random()-.5)*.5,vy:Math.random()*.8+.3,alpha:Math.random()*.5+.2});if(window.__fxStart)window.__fxStart()}

/* ---------- THEMES ---------- */
function applyTheme(){const s=S(),t=TH[s.theme]||TH['deep-nebula'],r=document.documentElement,isLight=s.mode==='light';
 const isBw=(window.ArcBlackWhiteMode&&window.ArcBlackWhiteMode.isEnabled())||r.classList.contains('arc-bw-mode');
 const acc=isBw?(isLight?'#000000':'#ffffff'):(s.customAccentOn?s.customAccentHex:(isLight?'#0284c7':t[2]));
 const acc2=isBw?(isLight?'#000000':'#ffffff'):t[3];
 const bg=isBw?(isLight?'#ffffff':'#000000'):(isLight?'#f8fafc':t[4]);
 r.style.setProperty('--pp-accent',acc);r.style.setProperty('--pp-accent2',acc2);r.style.setProperty('--pp-bg',bg);r.style.setProperty('--pp-noise-op',isLight?0.02:s.noiseOpacity);R.col=rgb(acc);
 if(isBw&&document.body)document.body.style.backgroundColor=bg;
 if(window.__fxRGB!==undefined)window.__fxRGB=isBw?(isLight?'0, 0, 0':'255, 255, 255'):(isLight?'2, 132, 199':R.col);
 r.setAttribute('data-theme',s.theme);r.setAttribute('data-mode',s.mode);r.setAttribute('data-transition',s.transition);
 r.classList.toggle('dark',!isLight);r.classList.toggle('pp-themed',s.theme!=='deep-nebula'||!!s.customAccentOn);r.classList.toggle('pp-eco',!!s.performanceMode);
 const n=$('.bg-noise');if(n)n.style.display=s.noiseOverlay?'':'none';
 try{localStorage.setItem('arc_app_theme',s.theme);localStorage.setItem('arc_app_mode',s.mode);localStorage.setItem('arc_app_transition',s.transition)}catch(e){}
 const mb=$('#header-mode-toggle-btn'),mi=$('#header-mode-toggle-icon'),ml=$('#header-mode-toggle-label');
 if(mb&&mi){mi.className=isLight?'fa-solid fa-moon text-indigo-400':'fa-solid fa-sun text-amber-400';if(ml)ml.textContent=isLight?'Dark Mode':'Light Mode';mb.title=isLight?'Switch to Dark Mode':'Switch to Light Mode';mb.setAttribute('aria-label',isLight?'Switch to Dark Mode':'Switch to Light Mode')}
 try{if(typeof window.renderSpiderWeb==='function')window.renderSpiderWeb()}catch(e){};try{if(window.ArcCustomBackground&&typeof window.ArcCustomBackground.apply==='function')window.ArcCustomBackground.apply()}catch(e){};try{if(window.ArcBlackWhiteMode&&typeof window.ArcBlackWhiteMode.updateUI==='function')window.ArcBlackWhiteMode.updateUI()}catch(e){};try{if(window.ArcNotifications&&typeof window.ArcNotifications.renderUi==='function')window.ArcNotifications.renderUi()}catch(e){};try{if(window.ArcFaq&&typeof window.ArcFaq.render==='function')window.ArcFaq.render()}catch(e){}}

/* ---------- FOCUS / POMODORO + SCREEN TIME ---------- */
const fset=()=>{F.left=(F.mode==='work'?S().focusWork:S().focusBreak)*60};
const ftxt=()=>String(Math.floor(F.left/60)).padStart(2,'0')+':'+String(F.left%60).padStart(2,'0');
function fui(){const t=ftxt(),a=$('#pp-f-time'),h=$('#pp12-hud');if(a)a.textContent=t;
 if(h){$('#pp-hud-t').textContent=t;$('#pp-hud-m').textContent=F.mode==='work'?'FOCUS':'BREAK';h.style.display=F.run?'flex':'none';h.classList.toggle('pomodoro-running-glow',!!F.run)}
 const g=$('#pp-f-go');if(g)g.textContent=F.run?'Pause (P)':'Start (P)';document.body.classList.toggle('pp-focus',F.run&&F.mode==='work'&&!!S().focusBlocker)}
function logFocus(sec){const d=getTodayKey();state.dailyFocus=state.dailyFocus||{};state.dailyFocus[d]=(state.dailyFocus[d]||0)+sec;state.screenTimeLogs.push({date:d,type:'focus',seconds:sec,ts:Date.now()});save()}
window.logFocus=logFocus;
function logLaptop(){const d=getTodayKey();let e=state.screenTimeLogs.find(x=>x.date===d&&x.type==='laptop');if(!e){e={date:d,type:'laptop',seconds:0};state.screenTimeLogs.push(e)}e.seconds=(state.laptop&&state.laptop.totalSeconds)||0}
function ftick(){if(--F.left>0){fui();return}
 if(F.mode==='work')logFocus(S().focusWork*60);F.mode=F.mode==='work'?'break':'work';fset();playSfx(F.mode==='break'?'pomodoroComplete':'pomodoroStart');
 const w=F.mode==='work';toast(w?'Break over — back to focus':'Focus block complete — take a break');announce(w?'Focus block started':'Break started');
 if(S().focusSyncAudio){if(w){if(S().ambientPreset!=='off')play()}else pauseAmb()}fui();stats()}
function fstart(){if(F.run)return;F.run=true;F.id=setInterval(ftick,1000);playSfx('pomodoroStart');if(S().focusSyncAudio&&F.mode==='work'&&S().ambientPreset!=='off'&&!A.on)play();announce('Focus timer started');fui()}
function fpause(force = false){if(!force && typeof isFocusStrictModeActive === 'function' && isFocusStrictModeActive()){triggerStrictModeLockoutNotice();return;}if(!F.run)return;F.run=false;clearInterval(F.id);playSfx('click');if(S().focusSyncAudio&&A.on)pauseAmb();announce('Focus timer paused');fui()}
function stats(){const d=getTodayKey(),f=state.screenTimeLogs.filter(x=>x.date===d&&x.type==='focus').reduce((a,x)=>a+x.seconds,0),l=(state.laptop&&state.laptop.totalSeconds)||0,e=l?Math.min(100,Math.round(f/l*100)):0,el=$('#pp-stats');
 if(el)el.innerHTML=`<div>Active laptop session: <b>${formatDuration(l)}</b></div><div>Pomodoro focus today: <b>${formatDuration(f)}</b></div><div>Focus efficiency: <b>${e}%</b></div>`}

/* ---------- HEATMAP ---------- */
function heat(){const el=$('#pp-heat');if(!el)return;const [y,m,d]=getTodayKey().split('-').map(Number),end=new Date(y,m-1,d),st=new Date(end);st.setDate(end.getDate()-364);
 let h='';for(let i=0;i<st.getDay();i++)h+='<i style="width:11px;height:11px"></i>';
 for(let i=0;i<365;i++){const x=new Date(st);x.setDate(st.getDate()+i);const k=formatDateKey(x),r=state.dailyHabits&&state.dailyHabits[k],tot=state.habits.length||1,n=r?Object.values(r).filter(Boolean).length:0,p=Math.min(1,n/tot);
  h+=`<i class="pp-cell" title="${k}: ${n}/${tot} habits"${n?` style="background:color-mix(in srgb,var(--pp-accent) ${Math.round(25+p*75)}%,transparent)"`:''}></i>`}
 el.innerHTML=h;const w=$('#pp-heat-wrap');if(w)w.scrollLeft=w.scrollWidth}

/* ---------- DATA VAULT ---------- */
const ymd=()=>formatDateKey(new Date()).replace(/-/g,'_'),RK='pp12_revisions';
function dl(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
function expJSON(){logLaptop();dl(`ppro11_backup_${ymd()}.json`,JSON.stringify({app:'ppro11',schema:12,exportedAt:new Date().toISOString(),state:JSON.parse(JSON.stringify(state)),reflection:lsGetRaw('whatHappenedText')||''},null,1),'application/json');toast('Backup exported')}
function expCSV(){logLaptop();const q=v=>'"'+String(v).replace(/"/g,'""')+'"',L=[['type','date','id','name','value']];
 Object.entries(state.dailyHabits||{}).sort().forEach(([d,r])=>Object.entries(r).forEach(([id,v])=>{const h=state.habits.find(x=>x.id===id);L.push(['habit',d,id,h?h.name:'',v?1:0])}));
 state.screenTimeLogs.forEach(x=>L.push(['screen_'+x.type,x.date,'','',x.seconds]));dl(`ppro11_export_${ymd()}.csv`,L.map(r=>r.map(q).join(',')).join('\n'),'text/csv');toast('CSV exported')}
function validate(o){if(!o||typeof o!=='object')return'not a JSON object';const s=o.state||o;if(typeof s!=='object')return'missing state';
 if(s.habits&&!Array.isArray(s.habits))return'habits must be a list';if(s.dailyHabits&&typeof s.dailyHabits!=='object')return'dailyHabits invalid';if(s.settings&&typeof s.settings!=='object')return'settings invalid';
 return(s.habits||s.dailyHabits||s.settings)?'':'no recognisable Pro 11 data'}
function merge(s){(s.habits||[]).forEach(h=>{if(!state.habits.some(x=>x.id===h.id))state.habits.push(h)});
 Object.entries(s.dailyHabits||{}).forEach(([d,r])=>{const c=state.dailyHabits[d]=state.dailyHabits[d]||{};Object.entries(r).forEach(([id,v])=>{c[id]=!!(c[id]||v)})});
 ['calendarEvents','screenTimeLogs'].forEach(k=>{const have=new Set(state[k].map(x=>JSON.stringify(x)));(s[k]||[]).forEach(x=>{if(!have.has(JSON.stringify(x)))state[k].push(x)})});state.streak=Math.max(state.streak||0,s.streak||0)}
function over(s){const keep=state.laptop;Object.keys(s).forEach(k=>{if(k!=='laptop')state[k]=s[k]});state.laptop=Object.assign({},keep,{totalSeconds:(s.laptop&&s.laptop.totalSeconds)||keep.totalSeconds})}
function refresh(){['renderHabits','renderScreenTime','renderCalendar','renderRulesBlueprint','renderMatrix','renderSpiderWeb'].forEach(f=>{try{typeof window[f]==='function'&&window[f]()}catch(e){}});applyTheme();density();vol();ui()}
function finish(msg){ensureState();save();refresh();toast(msg)}
const revs=()=>{try{return JSON.parse(localStorage.getItem(RK)||'[]')}catch(e){return[]}};
function snap(force){const r=revs(),l=r[0];if(!force&&l&&Date.now()-l.ts<864e5)return;r.unshift({ts:Date.now(),data:JSON.stringify(state)});r.length=Math.min(r.length,5);try{localStorage.setItem(RK,JSON.stringify(r))}catch(e){}}
function listRev(){const el=$('#pp-revs');if(!el)return;el.innerHTML=revs().map((r,i)=>`<div class="flex justify-between items-center py-1 text-xs"><span>${new Date(r.ts).toLocaleString()}</span><button role="button" class="pp-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-rb="${i}">Restore</button></div>`).join('')||'<p class="text-xs">No snapshots yet.</p>'}
function rollback(i){const r=revs()[i];if(!r||!confirm('Restore the snapshot from '+new Date(r.ts).toLocaleString()+'? Current data is snapshotted first.'))return;snap(true);let o;try{o=JSON.parse(r.data)}catch(e){toast('That snapshot is damaged and cannot be restored');return}over(o);finish('Snapshot restored');listRev()}

/* ---------- SETTINGS UI ---------- */
const sl=(k,mn,mx,st,l)=>`<input type="range" role="slider" data-set="${k}" min="${mn}" max="${mx}" step="${st}" aria-label="${l}" class="w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">`;
const sel=(k,l,o)=>`<select data-set="${k}" class="pp-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" aria-label="${l}">${o.map(x=>`<option value="${x[0]}">${x[1]}</option>`).join('')}</select>`;
const ck=(k,l)=>`<input type="checkbox" data-set="${k}" aria-label="${l}" class="habit-checkbox focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">`;
const row=(l,kw,b,k)=>`<div class="pp-row" data-kw="${(l+' '+kw).toLowerCase()}"><div class="pp-lab"><span>${l}</span><span data-val="${k||''}"></span></div>${b}</div>`;
function build(){$('#pp-body').innerHTML=
`<section class="pp-panel" data-p="account"><div id="pp-account-container" class="space-y-4"></div></section>`+
`<section class="pp-panel" data-p="audio">`+
row('Master Volume','global gain loudness',sl('masterVolume',0,1,.01,'Master volume'),'masterVolume')+
row('SFX','sound effects clicks chimes',ck('sfxEnabled','Enable sound effects'))+
row('SFX Volume','effects clicks chimes modal',sl('sfxVolume',0,1,.01,'SFX volume'),'sfxVolume')+
row('Ambient Volume','soundscape celestial drone',sl('ambientVolume',0,1,.01,'Ambient volume'),'ambientVolume')+
row('Tuning Frequency','pitch hz 440 432 528 verdi solfeggio',sel('tuningFreq','Tuning frequency',[[440,'440 Hz — Standard'],[432,'432 Hz — Verdi / Natural'],[528,'528 Hz — Solfeggio']]))+
row('Heavenly Body Soundscape','preset solar lunar saturn nebula pulsar singularity black hole cmb microwave celestial',`<div class="pp-grid">${PRE.map(p=>`<button role="button" class="pp-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-preset="${p[0]}">${p[1]} ${p[2]}</button>`).join('')}</div><div class="flex gap-2 mt-2"><button role="button" class="pp-btn flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="pp-amb-btn">Play Soundscape</button><button role="button" class="pp-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-preset="off">Off</button><span id="pp-amb-status" class="pp-badge">OFF</span></div>`)+
row('Pulsar Tempo','bpm pulse clock',sl('pulsarBpm',60,120,1,'Pulsar tempo in BPM'),'pulsarBpm')+
row('Sleep Timer','auto off focus fade minutes',sel('sleepTimerMinutes','Sleep timer',[[0,'Off'],[15,'15 mins'],[30,'30 mins'],[45,'45 mins'],[60,'60 mins']]))+
row('Global Mute','silence',`<button role="button" class="pp-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="pp-mute-btn">Mute (M)</button>`)+
`</section><section class="pp-panel" data-p="vis">`+
row('Cosmic Theme','color palette lunar solar nebula saturn void aurora cyber crimson',`<div class="pp-grid">${Object.entries(TH).map(([k,v])=>`<button role="button" class="pp-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-theme-set="${k}">${v[0]} ${v[1]}</button>`).join('')}</div>`)+
row('Accent Color','custom hex picker',`<div class="flex gap-2 items-center"><input class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" type="color" data-set="customAccentHex" aria-label="Custom accent color" style="width:3rem;height:2rem"><button role="button" class="pp-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="pp-acc-reset">Use theme accent</button></div>`)+
row('Display Mode','dark light oled night glass',`<div class="grid grid-cols-3 gap-2">${[['dark','🌙 Dark'],['light','☀️ Light'],['night','🕶 OLED']].map(m=>`<button role="button" class="pp-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-mode-set="${m[0]}">${m[1]}</button>`).join('')}</div>`)+
row('Black &amp; White Mode','monochrome grayscale noir e-ink dopamine detox black white gold',`<div class="flex items-center justify-between gap-3"><div class="space-y-0.5"><div class="text-xs text-slate-300 flex items-center gap-1.5 font-bold"><span>Monochrome Display</span><span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase font-black">ARC GOLD</span></div><div class="text-[10px] text-slate-400">Strips all colors for radical dopamine detox</div></div><label class="sx-sw"><input type="checkbox" id="pp-bw-toggle" onchange="if(window.ArcBlackWhiteMode)ArcBlackWhiteMode.toggle(this.checked)" aria-label="Toggle Black &amp; White Mode"><span></span></label></div>`)+
row('Liquid Glass UI &amp; Animations','liquid glass ios frosted blur refraction specular spring physics gold',`<div class="flex items-center justify-between gap-3"><div class="space-y-0.5"><div class="text-xs text-slate-300 flex items-center gap-1.5 font-bold"><span>Liquid Glass UI &amp; Animations</span><span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase font-black">GOLD</span></div><div class="text-[10px] text-slate-400">Enable iOS-style translucent liquid glass surfaces, refractive highlights, and fluid spring animations.</div></div><div id="drawer-liquid-glass-ctrl"></div></div>`)+
row('View Transition','animation slide zoom flip blur bounce',sel('transition','View transition',[['slide','Smooth Slide'],['zoom','Quantum Zoom'],['flip','3D Horizon Flip'],['blur','Nebula Blur'],['bounce','Spring Bounce']]))+
row('Particle Density','particles low medium high ultra off canvas',sel('particleDensity','Particle density',[['low','Low (30)'],['medium','Medium (75)'],['high','High (150)'],['ultra','Ultra (300)'],['off','Off']]))+
row('Audio-Reactive Particles','fft analyser bass mid treble bloom sparkle',ck('audioReactiveParticles','Audio reactive particles'))+
row('Winter Snowflakes','snowflake crystal ice winter particle shape audio reactive',ck('snowflakeParticles','Audio-reactive snowflake particles'))+
row('Winter Particle Shape','snowflakes crystal dots winter audio reactive',sel('winterParticleShape','Winter particle shape',[['snowflakes','❄️ Audio-Reactive Snowflakes'],['dots','⚪ Classic Glowing Dots']]))+
row('Noise Overlay','texture grain',ck('noiseOverlay','Noise overlay'))+
row('Noise Opacity','texture grain alpha',sl('noiseOpacity',0,1,.01,'Noise opacity'),'noiseOpacity')+
row('Performance / Eco Mode','battery blur backdrop bloom mobile',ck('performanceMode','Performance mode'))+
`</section><section class="pp-panel" data-p="habit">`+
row('365-Day Contribution Heatmap','github activity completion density history',`<div style="overflow-x:auto" id="pp-heat-wrap"><div id="pp-heat" role="img" aria-label="Habit completion heatmap for the last 365 days"></div></div><p class="text-xs mt-2" style="color:var(--pp-mut)">Brighter cells = more habits completed that day.</p>`)+
`</section><section class="pp-panel" data-p="focus">`+
row('Pomodoro Timer','focus work break session',`<div class="text-center text-3xl font-black font-mono my-2" id="pp-f-time">25:00</div><div class="flex gap-2"><button role="button" class="pp-btn flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="pp-f-go">Start (P)</button><button role="button" class="pp-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="pp-f-reset">Reset</button></div>`)+
row('Interval','work break 25/5 50/10',`<select id="pp-pomo" class="pp-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" aria-label="Pomodoro interval">${['25/5','50/10','15/3','90/15'].map(v=>`<option>${v}</option>`).join('')}</select>`)+
row('Sync Soundscape','ambient focus start pause',ck('focusSyncAudio','Sync ambient soundscape to focus timer'))+
row('Distraction Blocker','hide habit stats overlay focus block',ck('focusBlocker','Hide habit stats during focus'))+
row('Screen-Time Metrics','laptop session efficiency log',`<div id="pp-stats" class="text-xs space-y-1"></div>`)+
`</section><section class="pp-panel" data-p="sys">`+
row('Backup & Export','json csv download backup import',`<div class="grid grid-cols-2 gap-2"><button role="button" class="pp-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="pp-exp-json">Export JSON</button><button role="button" class="pp-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="pp-exp-csv">Export CSV</button><button role="button" class="pp-btn col-span-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="pp-imp-btn">Import JSON…</button></div><input type="file" id="pp-file" accept=".json,application/json" class="hidden" aria-label="Import JSON backup">`)+
row('Revision Rollbacks','auto save snapshots restore history',`<div id="pp-revs"></div>`)+
row('Keyboard Shortcuts','hotkeys help',`<button role="button" class="pp-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="pp-keys-open">Show shortcuts (?)</button>`)+
row('Factory Reset','erase clear wipe danger',`<button role="button" class="pp-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="pp-rst-open" style="color:#f87171;border-color:#f87171">Factory reset…</button>`)+
row('Privacy Policy & Compliance','privacy policy offline airgap terms compliance legal',`<div class="flex items-center justify-between gap-2"><span class="text-xs text-slate-300">100% Offline • Zero Data Collection</span><a href="./privacy-policy.html" target="_blank" rel="noopener" class="pp-btn text-cyan-300 border-cyan-500/40 text-xs py-1 px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 font-bold inline-flex items-center gap-1.5"><i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i> View Policy</a></div>`)+
`</section><section class="pp-panel" data-p="sec">`+
`<div class="mb-3 p-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20"><div class="flex items-center justify-between"><div class="flex items-center gap-2"><span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span><span class="font-mono font-bold text-xs text-emerald-300">SENTINEL DEFENSES ONLINE</span></div><span class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">AIRGAP ACTIVE</span></div><p class="text-[11px] text-slate-300 mt-1">Zero-Exfiltration Network Airgap enforced. Local state protected against memory tampering and data leaks.</p></div>`+
row('Antivirus & Integrity Scanner','malware threat scanner security xss audit',`<div class="space-y-2"><div class="flex gap-2"><button role="button" class="pp-btn flex-1 text-cyan-300 border-cyan-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="btn-sec-run-scan"><i class="fa-solid fa-shield-virus mr-1"></i> Run Security Audit</button><button role="button" class="pp-btn text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="btn-sec-clear-log">Clear</button></div><div id="sec-scan-terminal" class="p-2.5 rounded-lg bg-black/80 border border-slate-700 font-mono text-[11px] text-cyan-400 h-36 overflow-y-auto space-y-1"><div class="text-slate-400">> Sentinel Anti-Malware Engine v2.4 initialized.</div><div class="text-slate-400">> Click 'Run Security Audit' to scan habits and verify airgap integrity.</div></div></div>`)+
row('AES-256 Encrypted Backups','encryption aes-256 backup password export leak protection',`<div class="grid grid-cols-2 gap-2"><button role="button" class="pp-btn text-cyan-300 border-cyan-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="btn-sec-exp-enc"><i class="fa-solid fa-lock mr-1"></i> Export (.arcenc)</button><button role="button" class="pp-btn text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="btn-sec-imp-enc"><i class="fa-solid fa-key mr-1"></i> Import Encrypted</button></div><input type="file" id="pp-enc-file" accept=".arcenc,.json,application/json" class="hidden" aria-label="Import encrypted backup">`)+
row('App Security PIN Lock','app pin lock passcode privacy authentication',`<div class="flex gap-2"><button role="button" class="pp-btn flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="btn-sec-toggle-pin">Setup Security PIN</button><button role="button" class="pp-btn text-rose-300 border-rose-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 hidden" id="btn-sec-lock-now"><i class="fa-solid fa-lock mr-1"></i> Lock Now</button></div>`)+
row('Anti-Spy Scrambled Keypad','keypad scramble shuffle spy shoulder surf pin',`<div class="flex items-center justify-between"><span class="text-xs text-slate-300">Randomize PIN keypad digit positions to defeat shoulder-surfing</span><input type="checkbox" id="sec-scramblepad-toggle" onchange="if(window.ArcSecurity)ArcSecurity.setKeypadScrambleEnabled(this.checked)" class="habit-checkbox focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"></div>`)+
row('Two-Step Verification (2FA)','two step factor 2fa google authenticator sms phone backup codes security',`<div class="space-y-2"><div class="flex items-center justify-between text-xs"><span class="font-bold text-slate-300">Status:</span><span id="sec-2fa-badge" class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">OPTIONAL • DISABLED</span></div><div class="flex gap-2"><button role="button" class="pp-btn flex-1 text-cyan-300 border-cyan-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 font-bold" id="btn-sec-open-2fa"><i class="fa-solid fa-shield-halved mr-1"></i> Setup Two-Step Verification</button><button role="button" class="pp-btn text-rose-400 border-rose-500/30 hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 hidden" id="btn-sec-remove-2fa" title="Disable Two-Step Verification"><i class="fa-solid fa-trash-can mr-1"></i> Remove</button></div><div id="sec-2fa-info" class="text-[11px] text-slate-400 flex items-center justify-between"><span>Method: <b id="sec-2fa-method-text" class="text-slate-300 font-mono">None</b></span><span>Backup Codes: <b id="sec-2fa-codes-count" class="text-slate-300 font-mono">5 unused</b></span></div></div>`)+
row('Inactivity Auto-Lock','auto lock timeout idle sleep timer leak security',`<div class="flex items-center justify-between gap-3"><div class="text-xs text-slate-400">Lock terminal when idle:</div><select id="sec-autolock-select" onchange="if(window.ArcSecurity)ArcSecurity.setAutoLockMinutes(parseInt(this.value,10))" class="pp-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 text-xs"><option value="0">Disabled</option><option value="1">1 Minute (Strict)</option><option value="3">3 Minutes</option><option value="5" selected>5 Minutes (Recommended)</option><option value="15">15 Minutes</option><option value="30">30 Minutes</option></select></div>`)+
row('Privacy Shield (Anti-Snoop)','blur veil tab switch task switcher hide shoulder surf',`<div class="flex items-center justify-between"><span class="text-xs text-slate-300">Veil screen on tab switch or window blur</span><input type="checkbox" id="sec-privshield-toggle" onchange="if(window.ArcSecurity)ArcSecurity.setPrivacyShieldEnabled(this.checked)" checked class="habit-checkbox focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"></div>`)+
row('Discretion / Camouflage Mode','censor redact mask habits disguise stealth alt+s',`<div class="space-y-1.5"><div class="flex items-center justify-between"><span class="text-xs text-slate-300">Mask habit names and journal reflections</span><input type="checkbox" id="sec-discretion-toggle" onchange="if(window.ArcSecurity)ArcSecurity.setDiscretionMode(this.checked)" class="habit-checkbox focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"></div><div class="text-[11px] text-slate-400 flex items-center justify-between"><span>Hover or tap to reveal</span><span class="font-mono text-[10px] text-cyan-300 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded">Alt + S</span></div></div>`)+
row('Zero-Exfiltration Network Firewall','airgap network outbound leak block telemetry firewall',`<div class="space-y-2"><div class="flex items-center justify-between text-xs"><span class="text-slate-300">Outbound Data Protection:</span><span id="sec-firewall-status" class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">ENFORCED (0 Leaks)</span></div><button role="button" class="pp-btn w-full text-cyan-300 border-cyan-500/40 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="btn-sec-test-firewall"><i class="fa-solid fa-shield-virus mr-1"></i> Test Outbound Interception</button></div>`)+
row('Clipboard Self-Destruct','clipboard wipe auto clear timer 45s credential leak',`<div class="flex items-center justify-between"><span class="text-xs text-slate-300">Auto-wipe clipboard 45s after copying sensitive codes</span><input type="checkbox" id="sec-clipautoclear-toggle" onchange="if(window.ArcSecurity)ArcSecurity.setClipboardAutoClearEnabled(this.checked)" checked class="habit-checkbox focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"></div>`)+
row('Print Hardcopy DLP Shield','print export paper pdf physical leak redaction dlp',`<div class="flex items-center justify-between"><span class="text-xs text-slate-300">Enforce blank redaction shield against physical print and PDF leaks</span><span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">ENFORCED</span></div>`)+
row('Cryptographic Secure Shredder','emergency wipe shred 3-pass overwrite forensic anti-leak',`<div class="space-y-1"><p class="text-[11px] text-slate-400">Cryptographically overwrite all local data with 3 passes of CSPRNG noise to prevent forensic recovery.</p><button role="button" class="pp-btn w-full text-rose-400 border-rose-500/40 hover:bg-rose-500/15 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400" id="btn-sec-open-shredder"><i class="fa-solid fa-fire-flame-curved mr-1"></i> Secure 3-Pass Data Shredder…</button></div>`)+
row('State Integrity Checksum','checksum hash sha-256 verification tamper proof',`<div class="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-300 break-all" id="sec-checksum-disp">Computing SHA-256 hash...</div>`)+
`</section>`}
function ui(){const s=S(),pct=['masterVolume','sfxVolume','ambientVolume','noiseOpacity'];
 $$('#pp12-drawer [data-set]').forEach(e=>{const v=s[e.dataset.set];if(e.type==='checkbox')e.checked=!!v;else e.value=v});
 $$('#pp12-drawer [data-val]').forEach(e=>{const k=e.dataset.val,v=s[k];e.textContent=pct.includes(k)?Math.round(v*100)+'%':k==='pulsarBpm'?v+' BPM':''});
 $$('[data-preset]').forEach(b=>b.classList.toggle('on',s.ambientPreset===b.dataset.preset));
 $$('[data-theme-set]').forEach(b=>b.classList.toggle('on',s.theme===b.dataset.themeSet));
 $$('[data-mode-set]').forEach(b=>b.classList.toggle('on',s.mode===b.dataset.modeSet));
 const ab=$('#btn-ambient-toggle');if(ab){ab.classList.toggle('on',A.on);ab.setAttribute('aria-pressed',String(A.on))}
 const st=$('#pp-amb-status'),pb=$('#pp-amb-btn'),mb=$('#pp-mute-btn'),pm=$('#pp-pomo');
 if(st)st.textContent=A.on?'PLAYING':'OFF';if(pb)pb.textContent=A.on?'Pause Soundscape':'Play Soundscape';if(mb)mb.textContent=A.muted?'Unmute (M)':'Mute (M)';if(pm)pm.value=s.focusWork+'/'+s.focusBreak;fui();
 const pbw=$('#pp-bw-toggle');if(pbw)pbw.checked=!!(window.ArcBlackWhiteMode&&window.ArcBlackWhiteMode.isEnabled());
 if(window.ArcLiquidGlass&&typeof window.ArcLiquidGlass.updateUI==='function')window.ArcLiquidGlass.updateUI();
 if(window.ArcGoogleSync&&TAB==='account'){window.ArcGoogleSync.renderUi();}}
function onSet(k){const s=S();
 if(['masterVolume','sfxVolume','ambientVolume','sfxEnabled'].includes(k))vol();
 else if(k==='tuningFreq'){if(A.on)play()}
 else if(k==='sleepTimerMinutes')setSleep(s[k]);
 else if(k==='particleDensity')density();
  else if(k==='snowflakeParticles'||k==='winterParticleShape'){if(typeof cfg!=='undefined'&&cfg.fx)cfg.fx.snowflakes=(S().snowflakeParticles!==false&&S().winterParticleShape!=='dots');announce('Winter snowflakes '+(S().snowflakeParticles?'on':'off'));}
 else if(k==='customAccentHex'){s.customAccentOn=true;applyTheme()}
 else if(['theme','mode','transition','noiseOverlay','noiseOpacity','performanceMode'].includes(k))applyTheme();
 save();ui()}
function tab(n){TAB=n;$$('.pp-tab').forEach(b=>{const on=b.dataset.t===n;b.classList.toggle('on',on);b.setAttribute('aria-selected',String(on))});
 $$('.pp-panel').forEach(p=>{p.style.display=p.dataset.p===n?'block':'none'});$$('.pp-row').forEach(r=>{r.style.display=''});$('#settings-search').value='';
 if(n==='account'&&window.ArcGoogleSync){window.ArcGoogleSync.renderUi();}
 if(n==='habit')heat();if(n==='focus')stats();if(n==='sys')listRev();
 if(n==='sec'&&window.ArcSecurity){window.ArcSecurity.computeStateHash().then(c=>{const el=$('#sec-checksum-disp');if(el)el.textContent=c});window.ArcSecurity.updatePinBadge();if(window.ArcTwoFactor)window.ArcTwoFactor.updateSettingsRow();window.ArcSecurity.updateSecuritySettingsUi();}}

/* ---------- MODALS, FOCUS TRAP, HOTKEYS ---------- */
const foc=c=>$$('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',c).filter(x=>!x.disabled&&x.offsetParent!==null);
function openDrawer(){opener=document.activeElement;D.classList.add('open');D.setAttribute('aria-hidden','false');$('#pp12-back').classList.add('open');const g=$('#btn-open-settings');if(g)g.setAttribute('aria-expanded','true');playSfx('modalOpen');ui();setTimeout(()=>{const f=foc(D)[0];if(f)f.focus()},60)}
function closeDrawer(){D.classList.remove('open');D.setAttribute('aria-hidden','true');$('#pp12-back').classList.remove('open');const g=$('#btn-open-settings');if(g)g.setAttribute('aria-expanded','false');playSfx('modalClose');if(opener&&opener.focus)opener.focus()}
const toggleDrawer=()=>D.classList.contains('open')?closeDrawer():openDrawer();
function openM(sel){const m=$(sel);opener=document.activeElement;m.style.display='flex';void m.offsetWidth;m.classList.add('open');playSfx('modalOpen');const f=foc(m)[0];if(f)f.focus()}
function closeM(m){m.classList.remove('open');m.classList.remove('active');playSfx('modalClose');setTimeout(()=>{if(!m.classList.contains('open'))m.style.display='none';},340);if(opener&&opener.focus)opener.focus()}
function closeAll(){$$('.pp-modal.open, .pp-modal.active, .pp-modal[style*="display: flex"]').forEach(closeM);
 if(window.ArcProfile&&typeof window.ArcProfile.closeSetupModal==='function'){try{window.ArcProfile.closeSetupModal()}catch(e){}}
 if(window.ArcCrossDeviceComparison&&typeof window.ArcCrossDeviceComparison.closeModal==='function'){try{window.ArcCrossDeviceComparison.closeModal()}catch(e){}}
 if(D.classList.contains('open'))closeDrawer();
 const am=$('#arc-modal');if(am&&!am.classList.contains('hidden')){try{closeArcModal()}catch(e){}}
 const so=$('#summer-showcase-overlay');if(so&&!so.classList.contains('hidden')){try{closeSummerShowcase()}catch(e){}}
 const vm=$('#rpg-victory-cert-modal');if(vm&&!vm.classList.contains('hidden')){try{closeVictoryCertModal()}catch(e){}}
 const sv=$('#sa-vault');if(sv&&!sv.classList.contains('hidden')){try{SummerArc.closeVault()}catch(e){}}}
function onKey(e){const t=e.target;
 if(e.key==='Escape'){closeAll();return}
 if(e.altKey&&(e.key==='s'||e.key==='S')){e.preventDefault();if(window.ArcSecurity)window.ArcSecurity.toggleDiscretionMode();return}
 if(e.altKey&&(e.key==='b'||e.key==='B')){e.preventDefault();if(window.ArcBlackWhiteMode)window.ArcBlackWhiteMode.toggle();return}
 if(e.key==='Tab'){const c=$$('.pp-modal.open').pop()||(D.classList.contains('open')?D:null);if(!c)return;const f=foc(c);if(!f.length)return;
  if(!c.contains(document.activeElement)||(e.shiftKey&&document.activeElement===f[0])){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&document.activeElement===f[f.length-1]){e.preventDefault();f[0].focus()}return}
 const typing=t&&(t.isContentEditable||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||(t.tagName==='INPUT'&&!/^(range|checkbox|radio|color|button|file)$/.test(t.type)));
 if(typing||e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key.toLowerCase();
 if(e.key==='?'){e.preventDefault();const m=$('#pp-keys');m.classList.contains('open')?closeM(m):openM('#pp-keys');return}
 if($('.pp-modal.open'))return;
 if(k==='s'){e.preventDefault();toggleDrawer()}else if(k==='m')toggleAudioMute();else if(k==='a')cycle();else if(k==='p')F.run?fpause():fstart()}

/* ---------- WIRING ---------- */
function bind(){D=$('#pp12-drawer');
 const ab=$('#btn-audio-toggle'),cls='hidden sm:flex p-2 rounded-xl bg-slate-800/80 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition items-center justify-center w-8 h-8 sm:w-9 sm:h-9';
 if(ab)ab.insertAdjacentHTML('afterend',`<button role="button" id="btn-ambient-toggle" onmouseenter="playSfx('hover')" aria-label="Toggle ambient soundscape" aria-pressed="false" class="${cls} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"><i class="fa-solid fa-atom"></i></button><button role="button" id="btn-open-settings" onmouseenter="playSfx('hover')" aria-label="Open settings" aria-expanded="false" aria-controls="pp12-drawer" class="${cls} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"><i class="fa-solid fa-gear"></i></button>`);
 $('#btn-ambient-toggle').addEventListener('click',toggleAmb);$('#btn-open-settings').addEventListener('click',toggleDrawer);
 $('#pp12-back').addEventListener('click',closeDrawer);$('#pp12-hud').addEventListener('click',()=>F.run?fpause():fstart());
 $$('.pp-modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeM(m)}));
 document.addEventListener('click',e=>{const x=e.target.closest('[data-close]');if(x)closeM(x.closest('.pp-modal'))});
 document.addEventListener('keydown',onKey,true);
 document.addEventListener('visibilitychange',()=>{if(A.ctx&&A.on){document.hidden?A.ctx.suspend():A.ctx.resume()}});
 $('#settings-search').addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();
  $$('.pp-row').forEach(r=>{r.style.display=!q||r.dataset.kw.includes(q)?'':'none'});
  $$('.pp-panel').forEach(p=>{p.style.display=q?([...p.querySelectorAll('.pp-row')].some(r=>r.style.display!=='none')?'block':'none'):(p.dataset.p===TAB?'block':'none')})});
 D.addEventListener('input',e=>{const t=e.target,k=t.dataset.set;if(!k)return;let v=t.type==='checkbox'?t.checked:t.type==='range'?+t.value:t.value;if(k==='tuningFreq'||k==='sleepTimerMinutes')v=+v;S()[k]=v;onSet(k);
  if(k==='audioReactiveParticles')announce('Audio reactive particles '+(v?'on':'off'))});
 $('#pp-pomo').addEventListener('input',e=>{const [w,b]=e.target.value.split('/').map(Number);S().focusWork=w;S().focusBreak=b;save();if(!F.run){F.mode='work';fset();fui()}});
 D.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;playSfx('click');
  if(b.dataset.t)tab(b.dataset.t);else if(b.dataset.preset)play(b.dataset.preset);
  else if(b.dataset.themeSet){S().theme=b.dataset.themeSet;S().customAccentOn=false;applyTheme();save();ui()}
  else if(b.dataset.modeSet){S().mode=b.dataset.modeSet;applyTheme();save();ui()}
  else if(b.dataset.rb!==undefined)rollback(+b.dataset.rb);
  else switch(b.id){case'pp-close':closeDrawer();break;case'pp-amb-btn':toggleAmb();break;case'pp-mute-btn':toggleAudioMute();break;
   case'pp-acc-reset':S().customAccentOn=false;applyTheme();save();break;case'pp-f-go':F.run?fpause():fstart();break;case'pp-f-reset':if(typeof isFocusStrictModeActive === 'function' && isFocusStrictModeActive()){triggerStrictModeLockoutNotice();break;}fpause();F.mode='work';fset();fui();break;
   case'pp-exp-json':expJSON();break;case'pp-exp-csv':expCSV();break;case'pp-imp-btn':$('#pp-file').click();break;case'pp-rst-open':$('#pp-rst-in').value='';$('#pp-rst-go').disabled=true;openM('#pp-rst');break;case'pp-keys-open':openM('#pp-keys');break;
   case'btn-sec-run-scan':if(window.ArcSecurity)window.ArcSecurity.triggerAuditUi();break;
   case'btn-sec-clear-log':{const t=$('#sec-scan-terminal');if(t)t.innerHTML='<div class="text-slate-400">> Log cleared. System protected.</div>';}break;
   case'btn-sec-exp-enc':if(window.ArcSecurity)window.ArcSecurity.openEncExportModal();break;
   case'btn-sec-imp-enc':$('#pp-enc-file').click();break;
   case'btn-sec-open-2fa':if(window.ArcTwoFactor)window.ArcTwoFactor.openSetupModal();break;
case'btn-sec-remove-2fa':if(window.ArcTwoFactor)window.ArcTwoFactor.confirmRemove();break;
case'btn-sec-toggle-pin':if(window.ArcSecurity)window.ArcSecurity.openPinModal();break;
   case'btn-sec-lock-now':if(window.ArcSecurity)window.ArcSecurity.showLockScreen();break;
   case'btn-sec-test-firewall':if(window.ArcSecurity)window.ArcSecurity.testFirewallInterception();break;
   case'btn-sec-open-shredder':if(window.ArcSecurity)window.ArcSecurity.openShredderModal();break;}});
 const pef=$('#pp-enc-file');
 if(pef)pef.addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{if(window.ArcSecurity){window.ArcSecurity.setPendingEncrypted(r.result,f.name);window.ArcSecurity.openEncImportModal()}};r.readAsText(f);e.target.value=''});
 $('#pp-file').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{
   if(/\.arcenc$/i.test(f.name)||r.result.includes('ARC_ENCRYPTED_V1')){
    if(window.ArcSecurity){window.ArcSecurity.setPendingEncrypted(r.result,f.name);window.ArcSecurity.openEncImportModal();return}
   }
   if(window.ArcSecurity){
    const sc=window.ArcSecurity.scanPayload(r.result,f.name);
    if(!sc.safe){window.ArcSecurity.openQuarantine(sc,r.result,f.name);return}
   }
   try{let o=JSON.parse(r.result);if(window.ArcSecurity)o=window.ArcSecurity.sanitizeObject(o);
    const err=validate(o);if(err){toast('Import failed: '+err);return}PEND=o.state||o;
    $('#pp-imp-info').textContent=f.name+' — '+(PEND.habits?PEND.habits.length:0)+' habits, '+Object.keys(PEND.dailyHabits||{}).length+' days of history (Antivirus Verified)';openM('#pp-imp')}catch(x){toast('Import failed: invalid JSON')}};r.readAsText(f);e.target.value=''});
 $('#pp-imp-merge').addEventListener('click',()=>{if(PEND){merge(PEND);finish('Backup merged')}closeM($('#pp-imp'))});
 $('#pp-imp-over').addEventListener('click',()=>{if(PEND){over(PEND);finish('State overwritten from backup')}closeM($('#pp-imp'))});
 $('#pp-rst-in').addEventListener('input',e=>{$('#pp-rst-go').disabled=e.target.value!=='RESET'});
 $('#pp-rst-go').addEventListener('click',()=>{if($('#pp-rst-in').value!=='RESET')return;try{clearInterval(state.laptop.interval)}catch(e){}window.saveToLocalStorage=()=>{};try{localStorage.clear()}catch(e){}location.reload()})}
function init(){const had=state.settings&&Object.keys(state.settings).length;ensureState();
 if(!had){try{const th=localStorage.getItem('arc_app_theme'),md=localStorage.getItem('arc_app_mode'),tr=localStorage.getItem('arc_app_transition'),s=state.settings;
  if(th)s.theme=th==='cosmic'?'deep-nebula':th;if(md)s.mode=md;if(tr)s.transition=tr}catch(e){}if(!TH[state.settings.theme])state.settings.theme='deep-nebula'}
 build();bind();tab('audio');applyTheme();density();rs();try{ensure()}catch(e){};addEventListener('resize',()=>{clearTimeout(rs._t);rs._t=setTimeout(rs,120)});fset();ui();snap();pRaf=requestAnimationFrame(frame);document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!pRaf)pRaf=requestAnimationFrame(frame)});
 setInterval(()=>{snap();logLaptop();save();if(D.classList.contains('open')&&TAB==='focus')stats()},6e4)}

/* wrap (never replace) existing Pro 11 functions so old behaviour is preserved */
const _ps=window.playSfx;window.playSfx=function(){if(!S().sfxEnabled)return;return _ps.apply(this,arguments)};
const _th=window.toggleHabit;window.toggleHabit=function(id){const r=_th.apply(this,arguments);const h=state.habits.find(x=>x.id===id);if(h)announce(h.name+(h.completed?' completed':' marked incomplete'));if(D&&D.classList.contains('open')&&TAB==='habit')heat();return r};
const _tm=window.toggleAudioMute;window.toggleAudioMute=function(){const r=_tm.apply(this,arguments);A.muted=isMuted;vol();ui();announce(isMuted?'Audio muted':'Audio unmuted');return r};
/* Pro 12 API compatibility */
window.setAppTheme=t=>{S().theme=t==='cosmic'?'deep-nebula':t;S().customAccentOn=false;applyTheme();save();ui()};
window.setAppMode=m=>{S().mode=m;applyTheme();save();ui()};window.setAppTransition=t=>{S().transition=t;applyTheme();save();ui()};
window.toggleLightDarkMode=()=>{const cur=S().mode||document.documentElement.getAttribute('data-mode')||'dark';const next=cur==='light'?'dark':'light';window.setAppMode(next);if(typeof playSfx==='function')playSfx('themeShift');if(typeof showToast==='function')showToast(next==='light'?'☀️ Elevated Light Mode Activated':'🌙 Cyberpunk Dark Mode Activated');};
window.toggleCelestialAudio=toggleAmb;window.setCelestialVolume=v=>{S().ambientVolume=v/100;vol();save();ui()};
window.PP12={settings:S,play,stop:stopAmb,openSettings:openDrawer,closeAll,exportJSON:expJSON,exportCSV:expCSV};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
