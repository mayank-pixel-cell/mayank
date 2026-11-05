(function(){'use strict';
const formatDateKey = d => (window.formatDateKey ? window.formatDateKey(d) : d.toISOString().split('T')[0]);
const getArcWindow = () => (window.getArcWindow ? window.getArcWindow() : null);
const getGradeInfo = (p, b) => (window.getGradeInfo ? window.getGradeInfo(p, b) : { grade: 'N' });
const getTodayKey = () => (window.getTodayKey ? window.getTodayKey() : new Date().toISOString().split('T')[0]);
const $=(s,r=document)=>r.querySelector(s),pad=n=>String(n).padStart(2,'0'),T=()=>getTodayKey(),BT=document.title;
const esc=s=>String(s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';'),uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const toast=m=>{try{showToast(m)}catch(e){}},sfx=t=>{try{playSfx(t)}catch(e){}},save=()=>{try{saveToLocalStorage()}catch(e){}};
let sv=0;const lazy=()=>{clearTimeout(sv);sv=setTimeout(save,300)};
const G={phys:['Physical','fa-dumbbell'],mind:['Mindset','fa-brain'],skill:['Skill / Career','fa-rocket']},gl=id=>state.vision.goals.find(g=>g.id===id);
const RK=[['Novice',0,'fa-seedling'],['Initiate',2500,'fa-bolt'],['Monk Mode',12000,'fa-yin-yang'],['Arc Master',30000,'fa-crown']];
const BD=[['s3','Spark','fa-fire','3-day lock-in streak',c=>c.streak>=3],['s7','Week Warrior','fa-bolt','7-day streak',c=>c.streak>=7],['s21','Habit Forged','fa-hammer','21-day streak',c=>c.streak>=21],['s50','Unbreakable','fa-shield','50-day streak',c=>c.streak>=50],
['f10','Deep Diver','fa-water','10 focus hours',c=>c.fh>=10],['f50','Flow State','fa-brain','50 focus hours',c=>c.fh>=50],['f100','Centurion','fa-hourglass-half','100 focus hours',c=>c.fh>=100],
['p1','Perfect Day','fa-star','Hit 100% in a day',c=>c.perfect>=1],['a30','Month Strong','fa-calendar-check','30 days at 60%+',c=>c.active>=30],['a60','Arc Veteran','fa-medal','60 days at 60%+',c=>c.active>=60],['ax','Arc Master','fa-crown','Reach Arc Master rank',c=>c.rk.i>=3],['st_zen_week','Digital Ascetic','fa-shield-heart','< 4h screen time for 7 days',c=>!!(state.gam&&state.gam.bd&&state.gam.bd.st_zen_week)]];

const EE_BADGES = [
  { id: 'ee_konami', secretId: 'konami', name: 'Arcade Virtuoso', icon: 'fa-gamepad', desc: 'Entered the legendary Konami Code sequence.', hint: 'Keyboard: 30-lives retro gaming sequence' },
  { id: 'ee_matrix', secretId: 'matrix', name: 'Digital Matrix Protocol', icon: 'fa-terminal', desc: 'Discovered the falling Matrix cyber code rain.', hint: 'Keyboard: Cyberpunk film title keyword' },
  { id: 'ee_spider', secretId: 'spider', name: 'Spider Web Overdrive', icon: 'fa-network-wired', desc: 'Hypercharged the Pillar Spider Web with plasma shine.', hint: 'Keyboard: Central web component keyword' },
  { id: 'ee_zen', secretId: 'zen', name: 'Zen Meditation Sanctum', icon: 'fa-yin-yang', desc: 'Attuned mind and habits to tranquil 432Hz stillness.', hint: 'Keyboard: State of calm meditative peace' },
  { id: 'ee_godmode', secretId: 'godmode', name: 'Divine Discipline', icon: 'fa-wand-magic-sparkles', desc: 'Invoked the radiant chromatic aura of absolute consistency.', hint: 'Keyboard: Ultimate cheat code keyword' },
  { id: 'ee_logo7', secretId: 'logo7', name: 'The Architect\'s Seal', icon: 'fa-certificate', desc: 'Harmonized 7 rapid strikes upon the sacred Arc emblem.', hint: 'Click: Rapid strikes on the Arc header logo' },
  { id: 'ee_core3', secretId: 'core3', name: 'Quantum Core Overclock', icon: 'fa-atom', desc: 'Overclocked the central reactor matrix with triple harmonics.', hint: 'Click: Triple pulse on spider web center hub' },
  { id: 'ee_inferno', secretId: 'inferno', name: 'Inferno Momentum Surge', icon: 'fa-fire-flame-curved', desc: 'Triggered the blazing 5-strike thermal streak surge.', hint: 'Click: 5 rapid strikes on streak counter card' },
  { id: 'ee_harmonic', secretId: 'harmonic', name: 'Harmonic Convergence', icon: 'fa-compass', desc: 'Connected all 4 spider web pillars in celestial sequence.', hint: 'Click: Clockwise sequence on 4 spider web nodes' },
  { id: 'ee_cyberdeck', secretId: 'cyberdeck', name: 'Architect Cyberdeck', icon: 'fa-laptop-code', desc: 'Accessed the classified terminal via the quantum micro-node.', hint: 'Click: Microscopic quantum dot in the footer' }
];

const GRAND_EE_BADGE = {
  id: 'ee_all',
  name: 'Omniscient Architect',
  icon: 'fa-crown',
  desc: 'Master of Secrets: Unlocked all 10 hidden Easter eggs across the Arc matrix.',
  req: 'Master all 10 classified Easter eggs'
};

window.EE_BADGES = EE_BADGES;
window.GRAND_EE_BADGE = GRAND_EE_BADGE;

function syncEasterEggBadges() {
  if (!state.gam) state.gam = { rank: 0, bd: {}, init: false };
  if (!state.gam.bd) state.gam.bd = {};
  let found = [];
  try {
    found = JSON.parse(localStorage.getItem('arc_secrets_found') || '[]');
  } catch(e) { found = []; }
  
  Object.keys(state.gam.bd).forEach(k => {
    if (k.startsWith('ee_') && k !== 'ee_all') {
      const sId = k.replace('ee_', '');
      if (!found.includes(sId)) found.push(sId);
    }
  });

  found.forEach(sId => {
    if (!state.gam.bd['ee_' + sId]) {
      state.gam.bd['ee_' + sId] = Date.now();
    }
  });

  const all10 = ['konami', 'matrix', 'spider', 'zen', 'godmode', 'logo7', 'core3', 'inferno', 'harmonic', 'cyberdeck'];
  const allUnlocked = all10.every(id => found.includes(id));
  if (allUnlocked && !state.gam.bd['ee_all']) {
    state.gam.bd['ee_all'] = Date.now();
  }
}

function getBadgeStats() {
  syncEasterEggBadges();
  const g = (state && state.gam && state.gam.bd) ? state.gam.bd : {};
  let coreCount = 0;
  BD.forEach(b => { if (g[b[0]]) coreCount++; });
  let eeCount = 0;
  EE_BADGES.forEach(e => { if (g[e.id]) eeCount++; });
  const hasGrand = !!g[GRAND_EE_BADGE.id];
  const totalUnlocked = coreCount + eeCount + (hasGrand ? 1 : 0);
  const totalBadges = BD.length + EE_BADGES.length + 1;
  return { coreCount, eeCount, hasGrand, totalUnlocked, totalBadges };
}

/* ---------- state + scoring ---------- */
function ens(){state.timer=Object.assign({totalFocusSeconds:0},state.timer);state.pomo=Object.assign({f:25,b:5,n:0,vol:.5},state.pomo);state.gam=Object.assign({rank:0,bd:{},init:false},state.gam);
 if(!state.vision||!Array.isArray(state.vision.goals))state.vision={goals:Object.keys(G).map(id=>({id,title:'',tasks:[]}))};syncEasterEggBadges()}
const dd=(a,b)=>Math.round((new Date(a+'T00:00')-new Date(b+'T00:00'))/864e5);
function pct(k){const isToday=(k===T()),d=(state.dailyHabits||{})[k];if(!d&&!isToday)return null;let t=0,c=0;(state.habits||[]).forEach(h=>{t+=h.weight;const done=isToday?(d&&d[h.id]!==undefined?!!d[h.id]:!!h.completed):(d&&!!d[h.id]);if(done)c+=h.weight});return t?Math.round(c/t*100):0}
function rank(xp){let i=0;RK.forEach((r,j)=>{if(xp>=r[1])i=j});const n=RK[i+1];return{i,name:RK[i][0],ico:RK[i][2],lv:1+Math.floor(xp/1000),lo:RK[i][1],hi:n?n[1]:0,next:n?n[0]:''}}
function calc(){const t=T(),dh=state.dailyHabits||{},ks=Object.keys(dh);if(ks.indexOf(t)<0)ks.push(t);ks.sort();window.__sfzReset&&window.__sfzReset();let xp=0,run=0,last=null,perfect=0,active=0,sum=0,logged=0;
 ks.forEach(k=>{const p=pct(k);if(p==null)return;const isToday=(k===t),d=dh[k];let raw=0;(state.habits||[]).forEach(h=>{const isDone=isToday?(d&&d[h.id]!==undefined?!!d[h.id]:!!h.completed):(d&&!!d[h.id]);if(isDone)raw+=h.weight*50});
  logged++;sum+=p;if(p>=100)perfect++;
  if(p>=60){run=last&&(dd(k,last)===1||(window.__sfzGap&&window.__sfzGap(k,last)))?run+1:1;last=k;active++}else if(k!==t){if(window.__sfzDay&&window.__sfzDay(k)){last=k}else{run=0;last=null}}
  xp+=Math.round(raw*(1+Math.min(run,10)*.05))});
 const cur=last&&dd(t,last)<=1?run:0,streak=cur;state.streak=cur;
 return{xp,streak,perfect,active,sum,logged,rk:rank(xp),fh:(state.timer.totalFocusSeconds||0)/3600,mult:1+Math.min(streak,10)*.05}}
function gam(c){const g=state.gam,first=!g.init,nu=[],revoked=[];g.bd=g.bd||{};
 BD.forEach(b=>{const id=b[0],name=b[1],isUnlocked=!!g.bd[id],qualified=!!b[4](c);
  if(!isUnlocked&&qualified){g.bd[id]=Date.now();nu.push(name)}
  else if(isUnlocked&&!qualified){delete g.bd[id];revoked.push(name)}});
 const prevRank=typeof g.rank==='number'?g.rank:0,newRank=c.rk.i;
 const up=!first&&newRank>prevRank,down=!first&&newRank<prevRank;
 g.rank=newRank;g.init=true;
 if(first||nu.length||revoked.length||up||down){try{saveToLocalStorage()}catch(e){save()}
  if(!first){
   if(up||nu.length){toast((up?'⬆️ Rank up: '+c.rk.name+' ':'')+(nu.length?'🏅 '+nu.join(', '):''));sfx('check');try{triggerConfettiBurst()}catch(e){}}
   else if(down||revoked.length){toast((down?'⬇️ Rank demoted: '+c.rk.name+' ':'')+(revoked.length?'⚠️ Revoked: '+revoked.join(', '):''));sfx('uncheck')}}}
 const m=document.querySelector('#p13-m');if(m&&m.classList.contains('open')&&typeof bdHtml==='function'){const bBox=m.querySelector('.bx');if(bBox){bBox.innerHTML='<button role="button" class="p13-x focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-p13="x" aria-label="Close">✕</button>'+bdHtml(currentBadgeFilter)}}
 if(typeof renderProgressionTab==='function'){try{renderProgressionTab()}catch(e){}}}

/* ---------- XP / level card ---------- */
function rXP(c){const el=$('#p13-xp');if(!el)return;const r=c.rk,p=r.hi?Math.min(100,(c.xp-r.lo)/(r.hi-r.lo)*100):100,stats=getBadgeStats();
 el.innerHTML=`<div class="flex items-center justify-between gap-3"><div class="flex items-center gap-3 min-w-0"><div class="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0" style="background:linear-gradient(135deg,var(--a2),var(--a));color:#000"><i class="fa-solid ${r.ico}"></i></div><div class="min-w-0"><div class="text-[10px] font-bold uppercase tracking-wider" style="color:var(--a)">Rank • Level ${r.lv}</div><div class="text-base font-black text-white truncate">${r.name}</div></div></div><button role="button" class="p13-b focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-p13="badges"><i class="fa-solid ${stats.hasGrand ? 'fa-crown text-amber-400' : 'fa-trophy'}" style="color:${stats.hasGrand ? '#F59E0B' : 'var(--a)'}"></i> Badges ${stats.totalUnlocked}/${stats.totalBadges}</button></div><div class="p13-bar mt-3" role="progressbar" aria-label="Rank progress" aria-valuenow="${Math.round(p)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${p}%"></i></div><div class="flex justify-between text-[10px] text-slate-400 mt-1 font-mono"><span>${c.xp.toLocaleString()} XP</span><span>${r.next?(r.hi-c.xp).toLocaleString()+' XP to '+r.next:'MAX RANK'}</span></div><div class="text-[10px] text-slate-400 mt-1"><i class="fa-solid fa-fire" style="color:var(--a)"></i> ${c.streak}-day streak • ×${c.mult.toFixed(2)} XP bonus</div>`;
 const h=$('#p13-hb');if(h){h.style.width=p+'%';h.parentNode.title=r.name+' · Level '+r.lv}}

let currentBadgeFilter = 'all';
window.switchBadgeFilter = function(filter) {
  currentBadgeFilter = filter;
  const bBox = document.querySelector('#p13-m .bx');
  if (bBox) {
    bBox.innerHTML = '<button role="button" class="p13-x focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-p13="x" aria-label="Close">✕</button>' + bdHtml(filter);
  }
};

function renderGrandAchievementCard(hasGrand, eeCount) {
  const pct = Math.min(100, Math.round((eeCount / 10) * 100));
  if (hasGrand) {
    return `<div class="grand-achievement-card grand-achievement-unlocked p-4 sm:p-5 relative overflow-hidden transition-all duration-300">
      <div class="grand-holographic-glint"></div>
      <div class="flex items-start gap-3.5 relative z-10">
        <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-0.5 shadow-xl flex items-center justify-center shrink-0 animate-crown-pulse">
          <div class="w-full h-full bg-slate-950/90 rounded-2xl flex items-center justify-center text-amber-300 text-2xl sm:text-3xl">
            <i class="fa-solid fa-crown drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]"></i>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-400 text-black shadow-md flex items-center gap-1">
              <i class="fa-solid fa-sparkles"></i> EXTRA GRAND ACHIEVEMENT
            </span>
            <span class="text-[9px] font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40">
              10/10 SECRETS MASTERED
            </span>
          </div>
          <h4 class="text-base sm:text-lg font-black text-white mt-1 drop-shadow flex items-center gap-2">
            Omniscient Architect
            <i class="fa-solid fa-circle-check text-emerald-400 text-sm"></i>
          </h4>
          <p class="text-xs text-amber-200/90 mt-0.5 leading-snug">
            Master of Secrets: Unlocked all 10 hidden Easter eggs across the Arc matrix.
          </p>
          <div class="mt-2 flex items-center gap-3 text-[10px] font-mono text-amber-300/80">
            <span><i class="fa-solid fa-certificate text-amber-400 mr-1"></i>Supreme Architect Ascendancy</span>
            <span><i class="fa-solid fa-infinity text-cyan-400 mr-1"></i>Permanent Omniscience</span>
          </div>
        </div>
      </div>
    </div>`;
  } else {
    return `<div class="grand-achievement-card grand-achievement-locked p-4 sm:p-5 relative overflow-hidden transition-all duration-300">
      <div class="flex items-start gap-3.5 relative z-10">
        <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-900 border border-amber-500/30 flex items-center justify-center text-slate-500 text-2xl shrink-0">
          <div class="relative">
            <i class="fa-solid fa-crown text-amber-500/40 text-2xl"></i>
            <i class="fa-solid fa-lock text-xs text-amber-400 absolute -bottom-1 -right-1 bg-slate-950 rounded-full p-0.5"></i>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-800 text-amber-400 border border-amber-500/30">
              🔒 EXTRA GRAND ACHIEVEMENT
            </span>
            <span class="text-[9px] font-mono font-bold text-slate-400">
              ${eeCount} / 10 Secrets Unlocked
            </span>
          </div>
          <h4 class="text-base font-black text-slate-200 mt-1 flex items-center gap-2">
            Omniscient Architect
          </h4>
          <p class="text-xs text-slate-400 mt-0.5 leading-snug">
            Unlock all 10 hidden Easter eggs across the Arc matrix to claim this prestigious extra achievement!
          </p>
          <div class="mt-2.5 space-y-1">
            <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800 p-0.5">
              <div class="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500" style="width:${pct}%"></div>
            </div>
            <div class="flex justify-between text-[10px] font-mono text-slate-400">
              <span>Progress: ${eeCount}/10</span>
              <span>${10 - eeCount} Easter egg${10 - eeCount === 1 ? '' : 's'} remaining</span>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }
}

function renderEasterEggBadgeCard(e, unlockedTimestamp) {
  const isUnlocked = !!unlockedTimestamp;
  const timeStr = isUnlocked && typeof unlockedTimestamp === 'number' 
    ? new Date(unlockedTimestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';

  if (isUnlocked) {
    return `<div class="ee-badge-card ee-badge-unlocked p-3 sm:p-3.5 flex items-start gap-3">
      <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shadow-md flex items-center justify-center shrink-0">
        <div class="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center text-cyan-300 text-base">
          <i class="fa-solid ${e.icon}"></i>
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-1">
          <h5 class="text-xs font-black text-white truncate">${e.name}</h5>
          <span class="text-[9px] font-mono font-bold text-emerald-400 flex items-center gap-1 shrink-0">
            <i class="fa-solid fa-check"></i> UNLOCKED
          </span>
        </div>
        <p class="text-[10px] text-slate-300 mt-0.5 leading-snug">${e.desc}</p>
        <div class="mt-1 flex items-center justify-between text-[9px] font-mono text-slate-400">
          <span class="text-cyan-400/80">Secret #${e.secretId}</span>
          <span>${timeStr ? `Discovered ${timeStr}` : 'Classified'}</span>
        </div>
      </div>
    </div>`;
  } else {
    return `<div class="ee-badge-card ee-badge-locked p-3 sm:p-3.5 flex items-start gap-3 opacity-65 hover:opacity-85 transition-all">
      <div class="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-base shrink-0">
        <i class="fa-solid fa-lock"></i>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-1">
          <h5 class="text-xs font-black text-slate-400 truncate">??? [CLASSIFIED SECRET]</h5>
          <span class="text-[9px] font-mono text-slate-500 uppercase shrink-0">🔒 LOCKED</span>
        </div>
        <p class="text-[10px] text-slate-400/90 mt-0.5 leading-snug italic">
          Hint: ${e.hint}
        </p>
        <div class="mt-1 text-[9px] font-mono text-slate-600">
          Hidden interaction required
        </div>
      </div>
    </div>`;
  }
}

const bdHtml = (filter = currentBadgeFilter) => {
  const stats = getBadgeStats();
  const g = (state && state.gam && state.gam.bd) ? state.gam.bd : {};

  return `<div class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
      <div>
        <h3 class="text-base sm:text-lg font-black text-white flex items-center gap-2">
          <i class="fa-solid fa-trophy" style="color:var(--a)"></i> Achievements &amp; Badges Matrix
        </h3>
        <p class="text-xs text-slate-400 mt-0.5">
          Classified protocol milestones, hidden Easter eggs, and secret Architect ranks.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-3 py-1 rounded-full text-xs font-mono font-black" style="background:rgba(var(--ar),0.15); border:1px solid rgba(var(--ar),0.4); color:var(--a)">
          ${stats.totalUnlocked} / ${stats.totalBadges} Unlocked
        </span>
      </div>
    </div>

    <!-- Category Filter Tabs -->
    <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs" id="badge-filter-tabs">
      <button role="button" onclick="window.switchBadgeFilter('all')" class="badge-tab-btn px-2.5 py-1 rounded-lg font-bold transition ${filter==='all'?'active bg-cyan-500/20 text-cyan-300 border border-cyan-400':'bg-slate-900/60 text-slate-400 hover:text-white'}">All (${stats.totalBadges})</button>
      <button role="button" onclick="window.switchBadgeFilter('core')" class="badge-tab-btn px-2.5 py-1 rounded-lg font-bold transition ${filter==='core'?'active bg-cyan-500/20 text-cyan-300 border border-cyan-400':'bg-slate-900/60 text-slate-400 hover:text-white'}">Milestones (${stats.coreCount}/${BD.length})</button>
      <button role="button" onclick="window.switchBadgeFilter('secrets')" class="badge-tab-btn px-2.5 py-1 rounded-lg font-bold transition ${filter==='secrets'?'active bg-cyan-500/20 text-cyan-300 border border-cyan-400':'bg-slate-900/60 text-slate-400 hover:text-white'}">Easter Eggs (${stats.eeCount}/10)</button>
      <button role="button" onclick="window.switchBadgeFilter('grand')" class="badge-tab-btn px-2.5 py-1 rounded-lg font-bold transition ${filter==='grand'?'active bg-amber-500/20 text-amber-300 border border-amber-400':'bg-slate-900/60 text-slate-400 hover:text-white'}">Grand Crown (${stats.hasGrand?'1/1':'0/1'})</button>
    </div>

    <!-- Extra Grand Achievement -->
    ${(filter === 'all' || filter === 'grand' || filter === 'secrets') ? `
      <div>
        ${renderGrandAchievementCard(stats.hasGrand, stats.eeCount)}
      </div>
    ` : ''}

    <!-- Classified Easter Eggs -->
    ${(filter === 'all' || filter === 'secrets') ? `
      <div class="space-y-2.5">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-user-secret"></i> Classified Easter Egg Achievements
          </h4>
          <span class="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30 font-bold">
            ${stats.eeCount} / 10 Discovered
          </span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          ${EE_BADGES.map(e => renderEasterEggBadgeCard(e, g[e.id])).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Core Milestones -->
    ${(filter === 'all' || filter === 'core') ? `
      <div class="space-y-2.5">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-medal" style="color:var(--a)"></i> Core Protocol Milestones
          </h4>
          <span class="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800 font-bold">
            ${stats.coreCount} / ${BD.length} Unlocked
          </span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          ${BD.map(b => {
            const u = g[b[0]];
            return `<div class="p13-bd ${u ? 'unlocked-core-badge' : 'lk'} flex flex-col justify-between">
              <div>
                <i class="fa-solid ${u ? b[2] : 'fa-lock'} text-xl ${u ? '' : 'text-slate-600'}" style="color:${u ? 'var(--a)' : ''}"></i>
                <div class="text-[11px] font-black text-white mt-1.5">${b[1]}</div>
                <div class="text-[9px] text-slate-400 leading-tight mt-0.5">${b[3]}</div>
              </div>
              <div class="mt-2 text-[9px] font-mono font-bold ${u ? 'text-emerald-400' : 'text-slate-500'}">
                ${u ? '✓ UNLOCKED' : 'LOCKED'}
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    ` : ''}
  </div>`;
};

/* ---------- 90-day heatmap + tooltip ---------- */
function rH(){const el=$('#p13-hm');if(!el)return;const t=T(),s=new Date(t+'T00:00');s.setDate(s.getDate()-89);let h='<span></span>'.repeat(s.getDay());
 for(let i=0;i<90;i++){const d=new Date(s);d.setDate(s.getDate()+i);const k=formatDateKey(d),p=pct(k),lv=p==null?0:p>=90?5:p>=75?4:p>=60?3:p>=40?2:1,g=p==null?'':getGradeInfo(p,true).grade;
  h+=`<button role="button" class="pq${lv}${k===t?' td':''} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-k="${k}" data-p="${p==null?'':p}" data-g="${g}" aria-label="${k}: ${p==null?'no data':p+'% grade '+g}"></button>`}
 el.innerHTML=h}
function tip(b){const t=$('#p13-tip'),q=b.dataset.k.split('-').map(Number),p=b.dataset.p;t.innerHTML='<b>'+new Date(q[0],q[1]-1,q[2]).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})+'</b><br>'+(p===''?'No data logged':p+'% complete • Grade '+b.dataset.g);t.style.display='block';
 const r=b.getBoundingClientRect(),w=t.offsetWidth;t.style.left=Math.max(6,Math.min(innerWidth-w-6,r.left+r.width/2-w/2))+'px';t.style.top=(r.top>70?r.top-t.offsetHeight-8:r.bottom+8)+'px'}
const hideTip=()=>{const t=$('#p13-tip');if(t)t.style.display='none'};

/* ---------- Pomodoro ---------- */
const P={m:'focus',left:1500,run:false,end:0,id:0,fresh:true},fmt=s=>pad(Math.floor(s/60))+':'+pad(s%60),pLen=()=>(P.m==='focus'?state.pomo.f:state.pomo.b)*60;
function pUI(){const t=$('#p13-t');if(!t)return;const L=pLen();t.textContent=fmt(P.left);$('#p13-ml').textContent=P.m==='focus'?'FOCUS':'BREAK';$('#p13-ring').style.strokeDashoffset=276.46*(1-P.left/L);
 $('#p13-go').innerHTML=P.run?'<i class="fa-solid fa-pause"></i> Pause':'<i class="fa-solid fa-play"></i> '+(P.left<L?'Resume':'Start');
 $('#p13-mf').classList.toggle('on',P.m==='focus');$('#p13-mb').classList.toggle('on',P.m==='break');
 $('#p13-st').textContent=state.pomo.n+' sessions • '+Math.floor((state.timer.totalFocusSeconds||0)/60)+' min total focus';
 document.title=P.run?fmt(P.left)+' · '+(P.m==='focus'?'Focus':'Break'):BT}
function pTick(){const l=Math.max(0,Math.ceil((P.end-Date.now())/1000));if(l!==P.left){P.left=l;pUI()}if(l<=0)pDone()}
function pGo(){P.fresh=false;try{initAudio()}catch(e){}if(P.run){P.run=false;clearInterval(P.id);P.left=Math.max(1,Math.ceil((P.end-Date.now())/1000))}else{P.run=true;P.end=Date.now()+P.left*1000;P.id=setInterval(pTick,250)}sfx('click');pUI()}
function pReset(){P.fresh=false;P.run=false;clearInterval(P.id);P.left=pLen();pUI()}
function pDone(){P.run=false;clearInterval(P.id);
 if(P.m==='focus'){const s=state.pomo.f*60;state.timer.totalFocusSeconds=(state.timer.totalFocusSeconds||0)+s;state.dailyFocus=state.dailyFocus||{};state.dailyFocus[getTodayKey()]=(state.dailyFocus[getTodayKey()]||0)+s;state.pomo.n++;
  if(Array.isArray(state.screenTimeLogs))state.screenTimeLogs.push({date:T(),type:'focus',seconds:s,ts:Date.now()});
  save();try{renderScreenTime()}catch(e){}try{renderProgressionTab()}catch(e){}toast('🍅 Focus complete · +'+state.pomo.f+' min logged');P.m='break';try{triggerConfettiBurst()}catch(e){}}
 else{toast('☕ Break over — ready to focus');P.m='focus'}
 sfx('check');P.left=pLen();pUI();all()}

/* ---------- synthesized ambience (Web Audio, no assets) ---------- */
const AM={cur:null},NB={};
function nbuf(){if(NB.b&&NB.r===audioCtx)return NB.b;const c=audioCtx,b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;NB.b=b;NB.r=c;return b}
const ns=()=>{const s=audioCtx.createBufferSource();s.buffer=nbuf();s.loop=true;s.start();return s};
const fl=(t,f)=>{const n=audioCtx.createBiquadFilter();n.type=t;n.frequency.value=f;return n};
const gn=v=>{const g=audioCtx.createGain();g.gain.value=v;return g};
const lfo=(f,dep,prm)=>{const o=audioCtx.createOscillator(),g=gn(dep);o.frequency.value=f;o.connect(g);g.connect(prm);o.start();return o};
const SC={
 rain(out){const r=ns(),h=fl('highpass',1200),rg=gn(.45),w=ns(),l=fl('lowpass',420),wg=gn(.5);r.connect(h);h.connect(rg);rg.connect(out);w.connect(l);l.connect(wg);wg.connect(out);return[r,w,lfo(.11,.3,wg.gain),lfo(.07,180,l.frequency)]},
 drone(out){const l=fl('lowpass',700),g=gn(.16),o=[55,110,110.8,165,220.5].map((f,i)=>{const s=audioCtx.createOscillator(),q=gn(i<2?1:.4);s.type=i%2?'sawtooth':'sine';s.frequency.value=f;s.connect(q);q.connect(l);s.start();return s});l.Q.value=2;l.connect(g);g.connect(out);return o.concat([lfo(.05,350,l.frequency),lfo(.13,.05,g.gain)])},
 white(out){const s=ns(),f=fl('lowpass',9000),g=gn(.3);s.connect(f);f.connect(g);g.connect(out);return[s]}};
function vol(){if(!AM.cur||!audioCtx)return;AM.cur.g.gain.setTargetAtTime(isMuted?0:state.pomo.vol*.9,audioCtx.currentTime,.4)}
function amb(n){try{initAudio()}catch(e){}if(!audioCtx){toast('Web Audio not supported');return}const o=AM.cur;AM.cur=null;
 if(o){o.g.gain.setTargetAtTime(0,audioCtx.currentTime,.25);setTimeout(()=>{o.n.forEach(x=>{try{x.stop()}catch(e){}});try{o.g.disconnect()}catch(e){}},1400)}
 if(SC[n]){try{window.PP12&&PP12.stop&&PP12.stop()}catch(e){}const g=gn(0);g.connect(sfxOut());AM.cur={g,n:SC[n](g),k:n};vol()}
 $('#p13-amb').querySelectorAll('button').forEach(b=>b.classList.toggle('on',!!AM.cur&&b.dataset.p13==='amb:'+AM.cur.k))}

/* ---------- vision board ---------- */
function rV(){const el=$('#p13-vg');if(!el)return;let all=0,dn=0;
 el.innerHTML=state.vision.goals.map(g=>{const m=G[g.id]||['Goal','fa-star'],n=g.tasks.length,d=g.tasks.filter(t=>t.d).length,p=n?Math.round(d/n*100):0;all+=n;dn+=d;
  return`<div class="rounded-2xl p-3.5 space-y-2.5" style="background:rgba(var(--ar),.06);border:1px solid rgba(var(--ar),.25)"><div class="flex items-center justify-between"><span class="text-[10px] font-black uppercase tracking-wider" style="color:var(--a)"><i class="fa-solid ${m[1]}"></i> ${m[0]}</span><span class="text-[10px] font-mono text-slate-400">${d}/${n} • ${p}%</span></div><input class="p13-in font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-p13t="${g.id}" value="${esc(g.title)}" placeholder="Macro goal, e.g. Run a 10K" maxlength="80" aria-label="${m[0]} macro goal"><div class="p13-bar" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100" aria-label="${m[0]} progress"><i style="width:${p}%"></i></div><ul class="space-y-0.5">${g.tasks.map(t=>`<li class="flex items-center gap-2 text-xs"><input type="checkbox" class="w-5 h-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" style="accent-color:var(--a)" ${t.d?'checked':''} data-p13="vt:${g.id}:${t.id}" aria-label="${esc(t.t)}"><span class="flex-1 break-words ${t.d?'line-through text-slate-500':'text-slate-200'}">${esc(t.t)}</span><button role="button" class="text-slate-500 p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-p13="vd:${g.id}:${t.id}" aria-label="Delete sub-task"><i class="fa-solid fa-xmark"></i></button></li>`).join('')}</ul><div class="flex gap-1.5"><input class="p13-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="p13-n-${g.id}" data-p13n="${g.id}" placeholder="Add sub-task…" maxlength="80" aria-label="New ${m[0]} sub-task"><button role="button" class="p13-b focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-p13="va:${g.id}" aria-label="Add sub-task"><i class="fa-solid fa-plus"></i></button></div></div>`}).join('');
 const v=$('#p13-vp');if(v)v.textContent=dn+'/'+all+' sub-tasks'}
function addTask(id){const i=$('#p13-n-'+id),v=i&&i.value.trim();if(!v)return;gl(id).tasks.push({id:uid(),t:v,d:false});save();sfx('click');rV();const n=$('#p13-n-'+id);if(n)n.focus()}

/* ---------- Arc Snapshot card (9:16 canvas) ---------- */
function drawCard(){const cv=$('#p13-cv');if(!cv)return;const x=cv.getContext('2d'),W=1080,H=1920,c=calc(),r=c.rk,sm=state.currentArc==='summer',A=sm?'#fbbf24':'#22d3ee',B=sm?'#f97316':'#6366f1',F='system-ui,-apple-system,"Segoe UI",Roboto,sans-serif',ov=c.logged?c.sum/c.logged:0,gi=getGradeInfo(ov,c.logged>0).grade;
 const bg=x.createLinearGradient(0,0,0,H);bg.addColorStop(0,sm?'#1c1405':'#0b1330');bg.addColorStop(1,sm?'#0f0b03':'#060913');x.fillStyle=bg;x.fillRect(0,0,W,H);
 [[180,240,560,B],[920,1560,640,A]].forEach(q=>{const g=x.createRadialGradient(q[0],q[1],0,q[0],q[1],q[2]);g.addColorStop(0,q[3]+'66');g.addColorStop(1,q[3]+'00');x.fillStyle=g;x.fillRect(0,0,W,H)});
 let s=11;const rnd=()=>(s=s*16807%2147483647)/2147483647;x.fillStyle=A;for(let i=0;i<110;i++){x.globalAlpha=.08+rnd()*.35;x.beginPath();x.arc(rnd()*W,rnd()*H,1+rnd()*3.5,0,7);x.fill()}x.globalAlpha=1;
 const tx=(t,px,py,sz,col,w)=>{x.font=(w||800)+' '+sz+'px '+F;x.fillStyle=col;x.textAlign='center';x.fillText(t,px,py)},rr=(a,b,w,h,q)=>{x.beginPath();x.roundRect?x.roundRect(a,b,w,h,q):x.rect(a,b,w,h)};
 tx((sm?'SUMMER':'WINTER')+' ARC 2026',540,190,64,A);tx('LOCK-IN REPORT',540,255,34,'#94a3b8',600);
 x.save();x.shadowColor=A;x.shadowBlur=50;x.lineWidth=16;x.strokeStyle=A;x.beginPath();x.arc(540,560,170,0,7);x.stroke();x.restore();x.lineWidth=4;x.strokeStyle=B;x.beginPath();x.arc(540,560,200,0,7);x.stroke();
 tx('LEVEL',540,520,34,'#94a3b8',700);tx(String(r.lv),540,640,130,'#fff');tx(r.name.toUpperCase(),540,880,100,A);tx(c.xp.toLocaleString()+' XP',540,950,44,'#cbd5e1',600);
 const pr=r.hi?Math.max(0,Math.min(1,(c.xp-r.lo)/(r.hi-r.lo))):1,pg=x.createLinearGradient(160,0,920,0);pg.addColorStop(0,B);pg.addColorStop(1,A);
 rr(160,990,760,24,12);x.fillStyle='rgba(148,163,184,.2)';x.fill();rr(160,990,Math.max(24,760*pr),24,12);x.fillStyle=pg;x.fill();
 let tp=null,day='—',sub='no screen-time data';try{tp=getTopProductiveDay()}catch(e){}
 if(tp&&tp.totalSecs>0){const q=tp.dateStr.split('/');day=new Date(+q[2],q[0]-1,+q[1]).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});sub=Math.floor(tp.totalSecs/3600)+'h '+Math.floor(tp.totalSecs%3600/60)+'m logged'}
 const fs=Math.round(c.fh*3600);
 [['LOCK-IN STREAK',c.streak+(c.streak===1?' day':' days'),'×'+c.mult.toFixed(2)+' XP bonus',A,c.streak>9?84:96],['OVERALL GRADE',gi,ov.toFixed(1)+'% average',gi==='S'?'#34d399':A,150],['TOP PRODUCTIVE DAY',day,sub,'#fff',58],['TOTAL FOCUS TIME',Math.floor(fs/3600)+'h '+Math.floor(fs%3600/60)+'m',state.pomo.n+' pomodoros','#fff',80]].forEach((t,i)=>{
  const px=60+i%2*490,py=1090+Math.floor(i/2)*330;rr(px,py,470,300,36);x.fillStyle='rgba(255,255,255,.05)';x.fill();x.lineWidth=2;x.strokeStyle=A+'55';x.stroke();
  tx(t[0],px+235,py+70,28,'#94a3b8',700);tx(t[1],px+235,py+185,t[4],t[3]);tx(t[2],px+235,py+250,28,'#94a3b8',600)});
 tx(sm?'Radiate discipline.':'Transform in silence.',540,1850,40,'#cbd5e1',600)}
const cardHtml=()=>'<h3 class="text-sm font-black text-white mb-2"><i class="fa-solid fa-image" style="color:var(--a)"></i> Arc Snapshot</h3><canvas id="p13-cv" width="1080" height="1920" class="mx-auto rounded-2xl block" style="max-height:62vh;max-width:100%;width:auto;height:auto" role="img" aria-label="Arc snapshot stat card"></canvas><div class="grid grid-cols-2 gap-2 mt-3"><button role="button" class="p13-b focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-p13="dl"><i class="fa-solid fa-download"></i> Download PNG</button><button role="button" class="p13-b focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-p13="cp"><i class="fa-solid fa-copy"></i> Copy Image</button></div>';
function dl(){$('#p13-cv').toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='arc-snapshot-'+T()+'.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1e3);toast('Snapshot downloaded')},'image/png')}
async function cp(){const cv=$('#p13-cv');try{await navigator.clipboard.write([new ClipboardItem({'image/png':new Promise(r=>cv.toBlob(r,'image/png'))})]);toast('Snapshot copied to clipboard')}catch(e){toast('Copy not supported here — use Download')}}

/* ---------- modal, mount, wiring ---------- */
let MO,lastF;
function openM(html,fn){$('.bx',MO).innerHTML='<button role="button" class="p13-x focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-p13="x" aria-label="Close">✕</button>'+html;lastF=document.activeElement;MO.classList.add('open');sfx('modalOpen');if(fn)fn();$('.p13-x',MO).focus()}
function closeM(){MO.classList.remove('open');sfx('modalClose');if(lastF&&lastF.focus)lastF.focus()}
function mount(){if($('#p13-xp'))return true;const sg=$('#stat-today-completion'),rg=$('#rules-pillar-grid'),vr=$('#view-results');if(!sg||!rg||!vr)return false;
 const opt=(a,v)=>a.map(n=>`<option value="${n}"${n===v?' selected':''}>${n} min</option>`).join(''),w=document.createElement('div');w.className='grid gap-3 sm:gap-4 lg:grid-cols-2';
 w.innerHTML=`<div id="p13-xp" class="glass-card p13-c"></div><div id="p13-pomo" class="glass-card p13-c"><div class="flex items-center justify-between"><h3 class="text-xs font-bold text-white uppercase tracking-wider"><i class="fa-solid fa-bullseye" style="color:var(--a)"></i> Pomodoro Focus</h3><div class="flex gap-1"><button role="button" class="p13-b focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="p13-mf" data-p13="m:focus">Focus</button><button role="button" class="p13-b focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="p13-mb" data-p13="m:break">Break</button></div></div>
<div class="flex items-center gap-4 mt-3"><div class="relative w-28 h-28 shrink-0"><svg viewBox="0 0 100 100" style="transform:rotate(-90deg)" aria-hidden="true"><circle cx="50" cy="50" r="44" fill="none" stroke="rgba(148,163,184,.18)" stroke-width="7"/><circle id="p13-ring" cx="50" cy="50" r="44" fill="none" stroke="var(--a)" stroke-width="7" stroke-linecap="round" stroke-dasharray="276.46" style="transition:stroke-dashoffset .3s linear"/></svg><div class="absolute inset-0 flex flex-col items-center justify-center"><span id="p13-t" role="timer" class="text-2xl font-black text-white font-mono">25:00</span><span id="p13-ml" class="text-[9px] font-bold tracking-widest" style="color:var(--a)">FOCUS</span></div></div>
<div class="flex-1 space-y-2 min-w-0"><div class="grid grid-cols-2 gap-2"><button role="button" class="p13-b focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" id="p13-go" data-p13="go">Start</button><button role="button" class="p13-b focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-p13="reset"><i class="fa-solid fa-rotate-left"></i> Reset</button></div><div class="grid grid-cols-2 gap-2"><select id="p13-sf" class="p13-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" aria-label="Focus length">${opt([15,20,25,30,45,50],25)}</select><select id="p13-sb" class="p13-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" aria-label="Break length">${opt([3,5,10,15],5)}</select></div><div id="p13-st" class="text-[10px] text-slate-400 font-mono"></div></div></div>
<div class="mt-3"><div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5"><i class="fa-solid fa-wave-square"></i> Ambience</div><div id="p13-amb" class="flex flex-wrap gap-1.5"><button role="button" class="p13-b focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-p13="amb:rain"><i class="fa-solid fa-cloud-rain"></i> Rain &amp; Wind</button><button role="button" class="p13-b focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-p13="amb:drone"><i class="fa-solid fa-wave-square"></i> Focus Drone</button><button role="button" class="p13-b focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-p13="amb:white"><i class="fa-solid fa-signal"></i> White Noise</button></div><input id="p13-vol" type="range" min="0" max="100" class="w-full mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" style="accent-color:var(--a)" aria-label="Ambience volume"></div></div>`;
 sg.closest('.grid').after(w);
 rg.insertAdjacentHTML('afterend','<div class="glass-card p13-c space-y-3"><div class="flex items-center justify-between gap-2"><div><h3 class="text-base sm:text-lg font-extrabold text-white flex items-center gap-2"><i class="fa-solid fa-mountain-sun" style="color:var(--a)"></i> Vision &amp; Milestones</h3><p class="text-[11px] text-slate-400">Three macro goals for this arc, broken into sub-tasks.</p></div><span id="p13-vp" class="text-xs font-mono font-bold" style="color:var(--a)"></span></div><div id="p13-vg" class="grid gap-3 md:grid-cols-3"></div></div>');
 vr.insertAdjacentHTML('beforeend','<div class="glass-card p13-c space-y-3"><div class="flex items-center justify-between gap-2 flex-wrap"><h3 class="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><i class="fa-solid fa-border-all" style="color:var(--a)"></i> 90-Day Activity Heatmap</h3><button role="button" class="p13-b focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400" data-p13="card"><i class="fa-solid fa-image"></i> Generate Stat Card</button></div><div id="p13-hm" class="p13-hm" role="group" aria-label="Completion heatmap, last 90 days"></div><div class="p13-lg flex items-center justify-center gap-1 text-[10px] text-slate-400"><i class="pq0"></i> none &nbsp;Less <i class="pq1"></i><i class="pq2"></i><i class="pq3"></i><i class="pq4"></i><i class="pq5"></i> More</div></div>');
 document.body.insertAdjacentHTML('beforeend','<div id="p13-m" role="dialog" aria-modal="true"><div class="bx"></div></div><div id="p13-tip" role="tooltip"></div>');MO=$('#p13-m');
 const hd=$('header');if(hd)hd.insertAdjacentHTML('beforeend','<div class="p13-bar" style="position:absolute;left:0;right:0;bottom:0;height:3px;border-radius:0"><i id="p13-hb" style="border-radius:0"></i></div>');return true}
function all(){try{if(!mount())return;ens();document.body.dataset.arc=state.currentArc==='summer'?'summer':'winter';const c=calc();gam(c);rXP(c);rH();
 if(!(document.activeElement&&document.activeElement.closest('#p13-vg')))rV();
 const f=$('#p13-sf'),b=$('#p13-sb'),v=$('#p13-vol'),a=document.activeElement;if(f&&a!==f)f.value=state.pomo.f;if(b&&a!==b)b.value=state.pomo.b;if(v&&a!==v)v.value=Math.round(state.pomo.vol*100);
 if(P.fresh&&!P.run)P.left=pLen();pUI()}catch(e){console.error('Pro13',e)}}
const ACT={go:pGo,reset:()=>{pReset();sfx('click')},m:(x)=>{P.m=x;pReset()},amb:x=>amb(AM.cur&&AM.cur.k===x?'off':x),badges:()=>openM(bdHtml()),card:()=>openM(cardHtml(),drawCard),x:closeM,dl,cp,va:addTask,
 vt:(g,t)=>{const k=gl(g).tasks.find(z=>z.id===t);if(k){k.d=!k.d;sfx(k.d?'check':'uncheck');save();rV()}},vd:(g,t)=>{const o=gl(g);o.tasks=o.tasks.filter(z=>z.id!==t);save();sfx('uncheck');rV()}};
document.addEventListener('click',e=>{const hb=e.target.closest('.p13-hm button');hb?tip(hb):hideTip();const b=e.target.closest('[data-p13]');if(!b)return;const a=b.dataset.p13.split(':');if(ACT[a[0]])ACT[a[0]](a[1],a[2])});
document.addEventListener('mouseover',e=>{const b=e.target.closest('.p13-hm button');if(b)tip(b)});
document.addEventListener('mouseout',e=>{if(e.target.closest('.p13-hm button'))hideTip()});
document.addEventListener('scroll',hideTip,{passive:true});
document.addEventListener('keydown',e=>{const d=e.target.dataset||{};if(e.key==='Enter'&&d.p13n){e.preventDefault();addTask(d.p13n)}else if(e.key==='Escape'&&MO&&MO.classList.contains('open'))closeM()});
document.addEventListener('input',e=>{const t=e.target;if(t.dataset&&t.dataset.p13t){gl(t.dataset.p13t).title=t.value;lazy()}else if(t.id==='p13-vol'){state.pomo.vol=t.value/100;vol();lazy()}});
document.addEventListener('change',e=>{const t=e.target;if(t.id==='p13-sf'||t.id==='p13-sb'){state.pomo[t.id==='p13-sf'?'f':'b']=+t.value;save();if(!P.run){P.left=pLen();pUI()}}});
document.addEventListener('click',e=>{if(MO&&e.target===MO)closeM()});
const wrap=(n,f)=>{const o=window[n];if(typeof o!=='function')return;window[n]=function(){const r=o.apply(this,arguments);f();return r}};
wrap('renderHabits',all);wrap('switchTab',all);wrap('applyArcTheme',all);wrap('toggleAudioMute',vol);
window.openP13Modal = openM;
window.openM = openM;
window.bdHtml = bdHtml;
window.getBadgeStats = getBadgeStats;
window.openBadgeModal = () => openM(bdHtml());
window.rXP = rXP;
window.calc = calc;
window.allP13 = all;
window.addEventListener('beforeunload',()=>{if(P.run)document.title=BT});
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',all):all();
})();
