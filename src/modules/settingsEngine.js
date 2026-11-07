(function(){'use strict';
const KEY='app_settings',q=s=>document.querySelector(s);
const DEF={v:1,tab:'tracker',audio:{volume:100,click:true,check:true,fanfare:true},fx:{enabled:true,density:null,fps:60,snowflakes:true},theme:null,accent:null,arc:{start:'2026-10-01',end:'2026-12-31'},quotes:{touched:true,winter:true,summer:true,custom:true,list:[]},weights:{},order:[],freeze:{on:false},ax:{text:100,hc:false,rm:false,hap:0,reach:false,shield:false,recents:[],night:{on:false,from:'21:00',to:'06:00'},saver:{on:false,act:false,pf:60},out:{on:false}}};
const TH={winter:{n:'Winter Arc',d:'Cyan / Indigo',a:'#22d3ee',b:'#6366f1',bg:'#060913'},summer:{n:'Summer Arc',d:'Amber / Gold',a:'#f59e0b',b:'#eab308',bg:'#14100b'},cyber:{n:'Cyberpunk',d:'Purple / Emerald',a:'#a855f7',b:'#10b981',bg:'#0a0612'}};
const toast=m=>{try{showToast(m)}catch(e){}},ok=m=>toast('\u2705 '+m),bad=m=>toast('\u26A0\uFE0F '+m),sfx=t=>{try{playSfx(t)}catch(e){}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const D=s=>new Date(s+'T00:00'),dd=(a,b)=>Math.round((a-b)/864e5),ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'),fd=d=>d.toLocaleDateString('en-US',{month:'short',day:'numeric'}),h2r=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)).join(', ');
function mg(d,s){s=s&&typeof s==='object'?s:{};const o={};for(const k in d){const dv=d[k],sv=s[k];
 if(Array.isArray(dv))o[k]=Array.isArray(sv)?sv:dv;
 else if(dv&&typeof dv==='object')o[k]=Object.keys(dv).length?mg(dv,sv):(sv&&typeof sv==='object'&&!Array.isArray(sv)?sv:dv);
 else if(sv===undefined)o[k]=dv;
 else o[k]=(dv===null||typeof sv===typeof dv)?sv:dv}return o}
let cfg,locked=false;
function load(src){let p=null;try{p=src||JSON.parse(localStorage.getItem(KEY))}catch(e){}
 cfg=mg(DEF,p);const a=cfg.audio,f=cfg.fx;a.volume=Math.min(100,Math.max(0,+a.volume||0));
 if(f.density!=null)f.density=Math.min(200,Math.max(0,Math.round(+f.density||0)));f.fps=[30,60,120,200].includes(+f.fps)?+f.fps:60;
 if(!TH[cfg.theme])cfg.theme=null;if(!/^#[0-9a-f]{6}$/i.test(cfg.accent||''))cfg.accent=null;
 if(!cfg.quotes)cfg.quotes={touched:true,winter:true,summer:true,custom:true,list:[]};else{cfg.quotes.winter=true;cfg.quotes.summer=true;cfg.quotes.custom=true;if(!Array.isArray(cfg.quotes.list))cfg.quotes.list=[];}cfg.quotes.list=cfg.quotes.list.filter(x=>x&&typeof x.quote==='string');
 Object.keys(cfg.weights).forEach(k=>{const w=+cfg.weights[k];if(w>=1&&w<=3)cfg.weights[k]=w;else delete cfg.weights[k]})}
load();
function save(){if(locked)return;try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){bad('Settings not saved: browser storage is full')}gaugeSoon()}

/* ---- storage gauge ---- */
let gt=0;function gaugeSoon(){clearTimeout(gt);gt=setTimeout(gauge,200)}
function gauge(){const t=q('#sx-gt'),b=q('#sx-gb');if(!t||!b)return;let n=0;
 try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);n+=(k.length+(localStorage.getItem(k)||'').length)*2}}catch(e){}
 const kb=Math.round(n/1024),L=5000,p=Math.min(100,kb/L*100);
 t.textContent=kb.toLocaleString()+' KB / '+L.toLocaleString()+' KB used';q('#sx-gp').textContent=p.toFixed(1)+'%';
 b.style.width=Math.max(p,1)+'%';b.style.background=p>90?'#f43f5e':p>70?'#f59e0b':'var(--pp-accent)';q('#sx-gm').setAttribute('aria-valuenow',p.toFixed(1))}

/* ---- audio ---- */
const GR={check:'check',uncheck:'check',fanfare:'fanfare',arcIgnite:'fanfare'},_p=window.playSfx;
window.playSfx=function(t){if(window.__sxQuiet||cfg.audio[GR[t]||'click']===false)return;return _p.apply(this,arguments)};
const applyAudio=()=>{window.__setSfxVol&&window.__setSfxVol(cfg.audio.volume/100)};

/* ---- particle canvas ---- */
const mk=()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,radius:Math.random()*2.8+.5,vx:(Math.random()-.5)*.5,vy:Math.random()*.8+.3,alpha:Math.random()*.5+.2});
function applyFx(){const f=cfg.fx,cv=q('#fx-canvas'),ov=q('#pp12-fx');window.__fxOff=!f.enabled;window.__fxMs=1000/f.fps;
 if(ov)ov.style.display=f.enabled?'':'none';
 if(!f.enabled){window.__fxStop&&window.__fxStop();if(cv){const c=cv.getContext('2d');if(c){c.save();c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv.width,cv.height);c.restore()}cv.style.display='none'}return}
 if(cv)cv.style.display='';
 if(f.density!=null&&typeof fxParticles!=='undefined'){while(fxParticles.length>f.density)fxParticles.pop();while(fxParticles.length<f.density)fxParticles.push(mk())}
 window.__fxStart&&window.__fxStart()}

/* ---- theme ---- */
function applyTheme(){const t=TH[cfg.theme]||(cfg.accent?TH.winter:null),r=document.documentElement,isLight=r.getAttribute('data-mode')==='light';
 const isBw=(window.ArcBlackWhiteMode&&window.ArcBlackWhiteMode.isEnabled())||r.classList.contains('arc-bw-mode');
 if(!t){window.__fxRGB=null;r.removeAttribute('data-preset');return}
 const a=isBw?(isLight?'#000000':'#ffffff'):(cfg.accent||t.a);
 const b=isBw?(isLight?'#000000':'#ffffff'):t.b;
 const bg=isBw?(isLight?'#ffffff':'#000000'):t.bg;
 r.style.setProperty('--pp-accent',a);r.style.setProperty('--pp-accent2',b);r.style.setProperty('--pp-bg',bg);
 r.classList.add('pp-themed');r.dataset.preset=cfg.theme||'winter';window.__fxRGB=isBw?(isLight?'0, 0, 0':'255, 255, 255'):h2r(a);if(isBw){if(window.R)window.R.col=isLight?'0, 0, 0':'255, 255, 255';if(typeof R!=='undefined')R.col=isLight?'0, 0, 0':'255, 255, 255';}document.body.style.backgroundColor=bg}

/* ---- arc dates ---- */
function arcInfo(){const w=getArcWindow(),t=getEffectiveToday();return{s:w.start,e:w.end,total:w.total,day:dd(t,w.start)+1}}
function arcLabels(){const i=arcInfo();if(!(i.total>0))return;
 const st=i.day<1?'starts in '+(1-i.day)+(i.day<0?' days':' day'):i.day>i.total?'finished':'day '+i.day+' of '+i.total;
 const sub=q('#arc-subtitle');if(sub)sub.textContent=fd(i.s)+' - '+fd(i.e)+' \u2022 '+(state.currentArc==='summer'?'Shine in the Light':'Transform in Silence');
 const cd=q('#stat-current-day');if(cd)cd.textContent=i.day<1?'Starts in '+(1-i.day)+'d':i.day>i.total?'Done \u00B7 '+i.total+'d':'Day '+i.day+' / '+i.total;
 if(window.updateDynamicDayCounter)updateDynamicDayCounter();const bd=q('#banner-day-count');if(bd)bd.textContent=i.total+' / '+i.total+' Days Finished';
 const sm=q('#sx-arc-sum');if(sm)sm.textContent=i.total+'-day arc \u00B7 '+st}
function setArc(s,e){const a=D(s),b=D(e);if(isNaN(a)||isNaN(b)){syncArc();return bad('Pick a valid start and end date')}
 const n=dd(b,a)+1;if(n<1){syncArc();return bad('End date must be on or after the start date')}if(n>366){syncArc();return bad('An arc can last at most 366 days')}
 cfg.arc={start:s,end:e};save();arcLabels();syncArc();ok('Arc set to '+n+' days')}
function syncArc(){const a=q('#sx-start'),b=q('#sx-end');if(a)a.value=cfg.arc.start;if(b)b.value=cfg.arc.end}

/* ---- quotes ---- */
function pool(){const arc=state.currentArc==='summer'?SUMMER_ARC_QUOTES:WINTER_ARC_QUOTES;const custom=(cfg&&cfg.quotes&&Array.isArray(cfg.quotes.list))?cfg.quotes.list.map(x=>({quote:x.quote,author:x.author||'Me'})):[];return arc.concat(custom)}
window.getQuotePool=pool;
const requote=()=>{try{currentQuoteIndex=0;updateDailyQuote()}catch(e){}};

/* ---- weights, order, freeze ---- */
const applyWeights=()=>Object.entries(cfg.weights).forEach(([c,w])=>state.habits.forEach(h=>{if(h.category===c)h.weight=w}));
function applyOrder(){if(!cfg.order.length)return;const ix=id=>{const i=cfg.order.indexOf(id);return i<0?1e6:i};
 state.habits=state.habits.map((h,i)=>[h,i]).sort((a,b)=>ix(a[0].id)-ix(b[0].id)||a[1]-b[1]).map(x=>x[0])}
const redraw=()=>['renderHabits','renderMatrix','renderSpiderWeb'].forEach(f=>{try{typeof window[f]==='function'&&window[f]()}catch(e){}});
const refreshApp=()=>{try{saveToLocalStorage()}catch(e){}redraw()};
const memo={};window.__sfzMemo=memo;window.__sfzReset=()=>{for(const k in memo)delete memo[k]};
const use=d=>{if(!cfg.freeze.on)return false;const m=d.slice(0,7);if(!memo[m]){memo[m]=d;return true}return memo[m]===d};
window.__sfzDay=k=>use(k);
window.__sfzGap=(k,last)=>{if(dd(D(k),D(last))!==2)return false;const a=D(last);a.setDate(a.getDate()+1);return use(ymd(a))};
function fzStatus(){const el=q('#sx-fzs');if(!el)return;const u=memo[ymd(new Date()).slice(0,7)];
 el.textContent=!cfg.freeze.on?'Off. A missed day resets your streak.':u?'Free miss used on '+u+' this month.':'Free miss available this month.'}

/* ---- UI ---- */
const row=(l,h,c)=>'<div class="sx-row"><div class="min-w-0"><div class="text-xs font-semibold text-slate-200">'+l+'</div>'+(h?'<div class="text-[10px] text-slate-500">'+h+'</div>':'')+'</div>'+c+'</div>';
const sw=(id,on,l,dis)=>'<label class="sx-sw"><input type="checkbox" id="'+id+'" '+(on?'checked':'')+(dis?' disabled':'')+' aria-label="'+l+'"><span></span></label>';
const rg=(id,max,v,u,l,dis)=>'<div class="sx-rg"><input type="range" id="'+id+'" min="0" max="'+max+'" value="'+v+'"'+(dis?' disabled':'')+' aria-label="'+l+'"><output id="'+id+'-o" class="sx-o">'+v+u+'</output></div>';
const card = (id, i, t, s, pill, b) => {
 const isExp = (typeof window !== 'undefined' && window.ArcSettingsAccordion && typeof window.ArcSettingsAccordion.isExpanded === 'function')
  ? window.ArcSettingsAccordion.isExpanded(id)
  : false;
 return '<section id="' + id + '" class="glass-card rounded-2xl p-4 sm:p-5 settings-card-item" onkeydown="window.ArcSettingsAccordion && window.ArcSettingsAccordion.handleKeyDown(event, \'' + id + '\')">' +
  '<div class="flex items-center justify-between gap-3 select-none">' +
   '<div class="flex items-center gap-3 min-w-0">' +
    '<div class="sx-ic shrink-0"><i class="fa-solid ' + i + '"></i></div>' +
    '<div class="min-w-0 flex items-center gap-2 flex-wrap">' +
     '<h2 class="text-sm sm:text-base font-extrabold text-white truncate">' + t + '</h2>' +
     (pill ? '<span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 shrink-0">' + pill + '</span>' : '') +
    '</div>' +
   '</div>' +
   '<div class="flex items-center gap-2 shrink-0">' +
    '<button type="button" class="settings-arrow-btn p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition" aria-label="Expand settings card" aria-expanded="' + isExp + '" onclick="window.ArcSettingsAccordion && window.ArcSettingsAccordion.toggle(\'' + id + '\')">' +
     '<i class="fa-solid fa-chevron-down text-xs transition-transform duration-300 settings-chevron-icon ' + (isExp ? 'rotate-180' : '') + '"></i>' +
    '</button>' +
   '</div>' +
  '</div>' +
  '<div class="arc-fluid-accordion ' + (isExp ? 'expanded' : 'hidden') + ' pt-3 border-t border-slate-800/80 mt-3">' +
   '<div class="space-y-3">' +
    '<p class="text-[11px] text-slate-400">' + s + '</p>' +
    b +
   '</div>' +
  '</div>' +
 '</section>';
};
const sub=t=>'<div class="text-xs font-bold text-slate-200 pt-2">'+t+'</div>';
function weightsHtml(){return Object.keys(CATEGORIES).map(c=>{const hs=state.habits.filter(h=>h.category===c),ws=[...new Set(hs.map(h=>h.weight))],cur=cfg.weights[c]||(ws.length===1?ws[0]:0);
 return row('<span class="inline-block w-2 h-2 rounded-full mr-1.5" style="background:'+CATEGORIES[c].color+'"></span>'+c,hs.length+(hs.length===1?' habit':' habits'),
 '<select class="sx-in" data-w="'+c+'" aria-label="'+c+' weight">'+(cur?'':'<option value="0" selected>Mixed</option>')+[1,2,3].map(w=>'<option value="'+w+'"'+(cur===w?' selected':'')+'>'+w+'x</option>').join('')+'</select>')}).join('')}
function habitsHtml(){const H=state.habits;return H.map((h,i)=>{const c=(CATEGORIES[h.category]||{}).color||'#94a3b8',nm=esc(h.name);
 return '<li class="sx-hr"><span class="w-2 h-2 rounded-full shrink-0" style="background:'+c+'"></span><span class="flex-1 min-w-0 truncate text-xs text-slate-200">'+nm+'</span><span class="text-[10px] font-mono text-slate-500">'+h.weight+'x</span>'+
 '<button class="sx-ib" data-a="mv" data-i="'+i+'" data-d="-1" aria-label="Move '+nm+' up"'+(i===0?' disabled':'')+'><i class="fa-solid fa-chevron-up"></i></button>'+
 '<button class="sx-ib" data-a="mv" data-i="'+i+'" data-d="1" aria-label="Move '+nm+' down"'+(i===H.length-1?' disabled':'')+'><i class="fa-solid fa-chevron-down"></i></button></li>'}).join('')||'<li class="text-[11px] text-slate-500">No habits yet.</li>'}
const quotesHtml=()=>cfg.quotes.list.map((x,i)=>'<li class="sx-hr"><span class="flex-1 min-w-0 text-xs text-slate-300">“'+esc(x.quote)+'” <span class="text-slate-500">— '+esc(x.author||'Me')+'</span></span><button class="sx-ib" data-a="qdel" data-i="'+i+'" aria-label="Delete quote"><i class="fa-solid fa-trash"></i></button></li>').join('')||'<li class="text-[11px] text-slate-500">No custom quotes yet.</li>';
function build(){const root=q('#sx-root');if(!root)return;const A=cfg.audio,F=cfg.fx,Q=cfg.quotes,sum=state.currentArc==='summer',
 den=F.density==null?(typeof fxParticles!=='undefined'?fxParticles.length:80):F.density,sel=cfg.theme||'winter';
 root.innerHTML=
 card('sx-card-data','fa-database','Data & storage','Back up, restore or wipe everything this app keeps in your browser.','Local + Airgap',
  '<div class="grid grid-cols-1 sm:grid-cols-2 gap-2"><button class="sx-btn sx-pri" data-a="export"><i class="fa-solid fa-file-export"></i> Export Backup (.json)</button>'+
  '<button class="sx-btn" type="button" onclick="exportArcMarkdownReport()"><i class="fa-solid fa-file-arrow-down"></i> Export Dossier (.md)</button>'+
  '<label class="sx-btn" role="button" tabindex="0" for="json-sync-input"><i class="fa-solid fa-file-import"></i> Import Backup (.json)</label>'+
  '<input type="file" id="json-sync-input" accept=".json,.arcenc,application/json" class="hidden" onclick="this.value=\'\'" onchange="SettingsApp.importBackup(event)" aria-label="Import backup file"></div>'+
  '<div><div class="flex justify-between text-[11px] mb-1"><span id="sx-gt" class="text-slate-300 font-mono"></span><span id="sx-gp" class="text-slate-500 font-mono"></span></div><div id="sx-gm" class="sx-bar" role="progressbar" aria-label="Storage used" aria-valuemin="0" aria-valuemax="100"><i id="sx-gb"></i></div></div>'+
  '<div class="p-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-2 mt-2">'+
  '<div class="flex items-center justify-between"><div class="flex items-center gap-2 text-xs font-bold text-cyan-300"><i class="fa-solid fa-shield-halved text-cyan-400"></i> Sentinel Antivirus & Airgap Protection</div><span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">ONLINE</span></div>'+
  '<p class="text-[11px] text-slate-400">JSON imports are automatically scanned for malware, executable code and XSS exploits. Zero-exfiltration Content Security Policy blocks network data leaks.</p>'+
  '<div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1"><button class="sx-btn text-cyan-300" data-a="sec-audit"><i class="fa-solid fa-shield-virus"></i> Malware Audit</button><button class="sx-btn" data-a="sec-enc-exp"><i class="fa-solid fa-lock"></i> Encrypted Backup</button><button class="sx-btn" data-a="sec-pin-set"><i class="fa-solid fa-key"></i> Security PIN</button></div></div>'+
  '<div class="sx-danger"><div class="min-w-0"><div class="text-xs font-bold text-rose-300"><i class="fa-solid fa-triangle-exclamation mr-1"></i>Danger zone</div><div class="text-[11px] text-slate-400">Permanently deletes all habits, logs and settings in this browser.</div></div><button class="sx-btn sx-red" data-a="clear"><i class="fa-solid fa-trash"></i> Clear All Data</button></div>')+
 card('sx-card-audio','fa-sliders','Audio, visuals & performance','Tune sound and the particle canvas. Changes apply instantly.','Realtime',
  row('Master volume','Sound effects and focus ambience',rg('sx-vol',100,A.volume,'%','Master volume'))+
  row('Click sounds','Buttons, tabs and modals',sw('sx-a-click',A.click,'Click sounds'))+
  row('Checkbox sounds','Completing and undoing habits',sw('sx-a-check',A.check,'Checkbox sounds'))+
  row('Fanfare','Rank-ups and milestones',sw('sx-a-fanfare',A.fanfare,'Fanfare'))+
  row('Particle canvas','Turn off on low-end devices',sw('sx-fx-on',F.enabled,'Particle canvas'))+
  row('Particle density','0 to 200 particles',rg('sx-den',200,den,'','Particle density',!F.enabled))+
   row('Winter Snowflakes','Audio-reactive snowflake crystals in Winter theme',sw('sx-fx-snow',F.snowflakes!==false,'Winter Snowflakes'))+
  row('Frame rate cap','30 saves battery · 120 and Max need a high-refresh display','<div class="sx-seg" role="group" aria-label="Frame rate cap">'+[30,60,120,200].map(n=>{
  const isGoldCap = (n === 120 || n === 200);
  const isUnlocked = !isGoldCap || (window.ArcGold && window.ArcGold.isGold());
  const label = n === 200 ? 'Max' : n + ' FPS';
  const subLabel = !isUnlocked ? '🔒 Gold' : (n===30?'Battery saver':n===60?'Smooth':n===120?'Ultra smooth':'Up to 200 FPS');
  return '<button data-a="fps" data-v="'+n+'" '+(isUnlocked?'':'data-gold-locked="true" title="Exclusive to Arc Gold"')+' aria-pressed="'+(F.fps===n)+'">'+label+'<small>'+subLabel+'</small></button>';
}).join('')+'</div>'))+
 card('sx-card-timeline','fa-calendar-days','Arc & timeline','Define your own challenge window, look and motivation.','Timeline',
  '<div class="grid grid-cols-2 gap-2"><label class="sx-f">Start date<input type="date" id="sx-start" class="sx-in" value="'+esc(cfg.arc.start)+'"></label><label class="sx-f">End date<input type="date" id="sx-end" class="sx-in" value="'+esc(cfg.arc.end)+'"></label></div>'+
  '<div class="flex flex-wrap items-center gap-2"><span class="text-[11px] text-slate-400">Quick length</span>'+[30,60,90].map(n=>'<button class="sx-chip" data-a="days" data-v="'+n+'">'+n+' days</button>').join('')+'<span id="sx-arc-sum" class="text-[11px] text-slate-400 ml-auto font-mono"></span></div>'+
  sub('Theme')+'<div class="grid grid-cols-3 gap-2" role="group" aria-label="Theme preset">'+Object.entries(TH).map(([k,t])=>'<button class="sx-th" data-a="theme" data-v="'+esc(k)+'" aria-pressed="'+(sel===k)+'"><span class="sx-sw2" style="background:linear-gradient(135deg,'+t.a+','+t.b+')"></span><b>'+t.n+'</b><small>'+t.d+'</small></button>').join('')+'</div>'+
  row('Accent color','Overrides the preset accent','<div class="flex items-center gap-2"><input type="color" id="sx-acc" class="sx-col" value="'+esc(cfg.accent||TH[sel].a)+'" aria-label="Accent color"><button class="sx-chip" data-a="accreset">Reset</button></div>'))+
 card('sx-card-habits','fa-scale-balanced','Habit rules & scoring','Weight categories and streak protection.','Scoring',
  sub('Category weights')+'<div id="sx-w">'+weightsHtml()+'</div>'+
  sub('Streak freeze')+row('Free miss','One missed day per calendar month keeps your streak',sw('sx-fz',cfg.freeze.on,'Streak freeze'))+'<div id="sx-fzs" class="text-[11px] text-slate-500"></div>');
 arcLabels();gauge();fzStatus()}

/* ---- backup ---- */
function exportBackup(){try{const o={app:'winter-arc-tracker',schema:12,exportedAt:new Date().toISOString(),state:JSON.parse(JSON.stringify(state)),reflection:localStorage.getItem('whatHappenedText')||'',app_settings:cfg};
 const b=new Blob([JSON.stringify(o,null,1)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='arc_backup_'+ymd(new Date())+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500);ok('Backup exported')}catch(e){bad('Export failed: '+e.message)}}
function importBackup(ev){const f=ev.target.files&&ev.target.files[0];if(!f)return;
 const r=new FileReader();r.onerror=()=>bad('Import failed: could not read the file');
 r.onload=()=>{
  if(/\.arcenc$/i.test(f.name)||(typeof r.result==='string'&&r.result.includes('ARC_ENCRYPTED_V1'))){
   if(window.ArcSecurity){window.ArcSecurity.setPendingEncrypted(r.result,f.name);window.ArcSecurity.openEncImportModal();return}
  }
  if(window.ArcSecurity){
   const sc=window.ArcSecurity.scanPayload(r.result,f.name);
   if(!sc.safe){window.ArcSecurity.openQuarantine(sc,r.result,f.name);return}
  }
  let j;try{j=JSON.parse(r.result)}catch(e){return bad('Import failed: file is not valid JSON')}
  if(!j||typeof j!=='object'||Array.isArray(j))return bad('Import failed: not a backup file');
  if(window.ArcSecurity)j=window.ArcSecurity.sanitizeObject(j);
  if(j.app_settings&&typeof j.app_settings==='object'){load(j.app_settings);save();applyAll();build()}
  try{if(typeof handleBackupFileSync==='function')handleBackupFileSync(ev);ok('Backup imported & verified')}catch(e){bad('Import failed: '+e.message)}gaugeSoon()};
 r.readAsText(f)}

/* ---- clear-all (double confirmation) ---- */
function wipe(){locked=true;try{clearInterval(state.laptop&&state.laptop.interval)}catch(e){}window.saveToLocalStorage=()=>{};
 try{localStorage.clear();sessionStorage.clear()}catch(e){locked=false;return bad('Could not clear storage')}location.reload()}
function clearModal(){if(q('#sx-modal'))return;const prev=document.activeElement,m=document.createElement('div');let step=1;m.id='sx-modal';m.className='sx-modal';
 const close=()=>{m.remove();document.removeEventListener('keydown',kd);prev&&prev.focus&&prev.focus()},kd=e=>{if(e.key==='Escape')close()};
 const draw=()=>{m.innerHTML='<div class="sx-dlg" role="alertdialog" aria-modal="true" aria-labelledby="sx-mt"><div class="text-rose-400 text-2xl"><i class="fa-solid fa-triangle-exclamation"></i></div><h3 id="sx-mt" class="text-base font-extrabold text-white">'+(step===1?'Clear all data?':'Final confirmation')+'</h3><p class="text-xs text-slate-300">'+(step===1?'This deletes every habit, daily log, setting and backup snapshot stored in this browser. Export a backup first if you may want it back.':'Type <b class="text-rose-300">RESET</b> to erase everything and reload the app. This cannot be undone.')+'</p>'+(step===2?'<input id="sx-rt" class="sx-in w-full" autocomplete="off" placeholder="RESET" aria-label="Type RESET to confirm">':'')+'<div class="flex gap-2 justify-end"><button class="sx-btn" data-m="x">Cancel</button><button class="sx-btn sx-red" data-m="go"'+(step===2?' disabled':'')+'>'+(step===1?'Continue':'Erase everything')+'</button></div></div>';
  const f=m.querySelector('#sx-rt')||m.querySelector('[data-m=x]');f&&f.focus()};
 m.addEventListener('click',e=>{if(e.target===m)return close();const b=e.target.closest('[data-m]');if(!b)return;if(b.dataset.m==='x')return close();
  if(step===1){step=2;return draw()}const i=m.querySelector('#sx-rt');if(i&&i.value==='RESET')wipe()});
 m.addEventListener('input',e=>{if(e.target.id==='sx-rt')m.querySelector('[data-m=go]').disabled=e.target.value!=='RESET'});
 document.addEventListener('keydown',kd);draw();document.body.appendChild(m)}

/* ---- events ---- */
function wire(){const r=q('#sx-root');if(!r)return;
 r.addEventListener('input',e=>{const t=e.target;
  if(t.id==='sx-vol'){cfg.audio.volume=+t.value;q('#sx-vol-o').textContent=t.value+'%';applyAudio();save()}
  else if(t.id==='sx-den'){cfg.fx.density=+t.value;q('#sx-den-o').textContent=t.value;applyFx();save()}
  else if(t.id==='sx-acc'){cfg.accent=t.value;applyTheme();save()}});
 r.addEventListener('change',e=>{const t=e.target,id=t.id||'';
  if(id==='sx-vol')sfx('click');
  else if(/^sx-a-(click|check|fanfare)$/.test(id)){const k=id.slice(5);cfg.audio[k]=t.checked;save();if(t.checked)sfx(k)}
  else if(id==='sx-fx-on'){cfg.fx.enabled=t.checked;q('#sx-den').disabled=!t.checked;applyFx();save()}
   else if(id==='sx-fx-snow'){cfg.fx.snowflakes=t.checked;if(typeof state!=='undefined'&&state.settings){state.settings.snowflakeParticles=t.checked;state.settings.winterParticleShape=t.checked?'snowflakes':'dots';}save();}
  else if(id==='sx-start'||id==='sx-end')setArc(q('#sx-start').value,q('#sx-end').value);
  else if(id.startsWith('sx-q-')){const w=q('#sx-q-winter').checked,s=q('#sx-q-summer').checked,c=q('#sx-q-custom').checked;
   if(!w&&!s&&!c){t.checked=true;return bad('Keep at least one quote category on')}Object.assign(cfg.quotes,{touched:true,winter:w,summer:s,custom:c});save();requote()}
  else if(id==='sx-fz'){cfg.freeze.on=t.checked;save();refreshApp();fzStatus();if(typeof window.updateRulesFreezeUI==='function')window.updateRulesFreezeUI();ok(t.checked?'Streak freeze on':'Streak freeze off')}
  else if(t.dataset&&t.dataset.w){const w=+t.value,c=t.dataset.w;if(!w)return;cfg.weights[c]=w;applyWeights();save();refreshApp();q('#sx-w').innerHTML=weightsHtml();q('#sx-ho').innerHTML=habitsHtml();ok(c+' habits now '+w+'x')}});
 r.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,v=b.dataset.v,i=+b.dataset.i;sfx('click');
  if(a==='export')exportBackup();
  else if(a==='sec-audit'){if(window.ArcSecurity)window.ArcSecurity.triggerAuditUi();else if(typeof showToast==='function')showToast('Sentinel security audit active')}
  else if(a==='sec-enc-exp'){if(window.ArcSecurity)window.ArcSecurity.openEncExportModal();else if(typeof showToast==='function')showToast('Encrypted export ready')}
  else if(a==='sec-pin-set'){if(window.ArcSecurity)window.ArcSecurity.openPinModal();else if(typeof showToast==='function')showToast('PIN security ready')}
  else if(a==='clear')clearModal();
  else if(a==='fps'){
    if((+v===120 || +v===200) && (!window.ArcGold || !window.ArcGold.isGold())){
      if(window.ArcGold && typeof window.ArcGold.scrollToGoldCard === 'function'){
        window.ArcGold.scrollToGoldCard();
      }
      return;
    }
    cfg.fx.fps=+v;applyFx();save();r.querySelectorAll('[data-a=fps]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.v===v));
    if(window.ArcGold && typeof window.ArcGold.render === 'function') window.ArcGold.render();
  }
  else if(a==='days'){const s=D(q('#sx-start').value);if(isNaN(s))return bad('Pick a start date first');const n=new Date(s);n.setDate(n.getDate()+(+v)-1);setArc(q('#sx-start').value,ymd(n))}
  else if(a==='theme'){cfg.theme=v;cfg.accent=null;q('#sx-acc').value=TH[v].a;applyTheme();save();r.querySelectorAll('[data-a=theme]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.v===v));ok(TH[v].n+' theme on')}
  else if(a==='accreset'){cfg.accent=null;q('#sx-acc').value=TH[cfg.theme||'winter'].a;applyTheme();save()}
  else if(a==='qadd'){const t=q('#sx-qt').value.trim(),au=q('#sx-qa').value.trim();if(!t)return bad('Write a quote first');cfg.quotes.list.push({quote:t,author:au||'Me'});q('#sx-qt').value='';q('#sx-qa').value='';save();q('#sx-ql').innerHTML=quotesHtml();requote();ok('Quote added')}
  else if(a==='qdel'){cfg.quotes.list.splice(i,1);save();q('#sx-ql').innerHTML=quotesHtml();requote()}
  else if(a==='mv'){const d=+b.dataset.d,j=i+d,H=state.habits;if(j<0||j>=H.length)return;[H[i],H[j]]=[H[j],H[i]];cfg.order=H.map(h=>h.id);save();refreshApp();q('#sx-ho').innerHTML=habitsHtml();const nb=q('#sx-ho [data-i="'+j+'"][data-d="'+d+'"]:not([disabled])')||q('#sx-ho [data-i="'+j+'"]:not([disabled])');nb&&nb.focus()}});
 r.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('label[for=json-sync-input]')){e.preventDefault();q('#json-sync-input').click()}})}

function applyAll(){applyOrder();applyWeights();applyTheme();applyAudio();applyFx();arcLabels();requote();redraw()}
function init(){applyOrder();applyWeights();build();wire();applyTheme();applyAudio();applyFx();arcLabels();requote();if(Object.keys(cfg.weights).length||cfg.order.length)redraw();
 const _a=window.applyArcTheme;if(typeof _a==='function')window.applyArcTheme=function(){const r=_a.apply(this,arguments);applyTheme();arcLabels();return r};
 const _s=window.saveToLocalStorage;if(typeof _s==='function')window.saveToLocalStorage=function(){const r=_s.apply(this,arguments);gaugeSoon();return r};
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)arcLabels()});
 if(['rules','results','settings'].indexOf(cfg.tab)>-1){window.__sxQuiet=true;try{switchTab(cfg.tab)}finally{window.__sxQuiet=false}}}
window.SettingsApp={importBackup,save,get:()=>cfg,onTab(t){cfg.tab=t;save();if(t==='settings'){const w=q('#sx-w'),h=q('#sx-ho');if(w)w.innerHTML=weightsHtml();if(h)h.innerHTML=habitsHtml();gauge();fzStatus();arcLabels()}}};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
