(function(){
'use strict';
const $=s=>document.querySelector(s),VK='arc_vault',CATS=['Physical','Mindset','Productivity','Discipline'];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PRESETS=[{n:'Shred Diet',c:'Physical',w:2},{n:'Outdoor Workout',c:'Physical',w:3},{n:'Sunrise Wake-Up (6 AM)',c:'Discipline',w:3},{n:'Read 10 Pages Outdoors',c:'Mindset',w:1},{n:'2 Hours Deep Focus Lock-In',c:'Productivity',w:3}];
const sv=()=>{try{saveToLocalStorage()}catch(e){}},toast=m=>{try{showToast(m)}catch(e){}},sfx=t=>{try{playSfx(t)}catch(e){}};
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const BTN='focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400';

/* ---------- metrics + Arc Vault ---------- */
function track(){const s=+state.streak||0;if(s>(+state.longestStreak||0))state.longestStreak=s}
function metrics(){
 track();const cs={};CATS.forEach(c=>cs[c]={t:0,k:0});let T=0,K=0;
 (state.habits||[]).forEach(h=>{const w=+h.weight||1;T+=w;if(h.completed)K+=w;const o=cs[h.category];if(o){o.t+=w;if(h.completed)o.k+=w}});
 const pct=T?Math.round(K/T*100):0,f=(state.timer&&state.timer.totalFocusSeconds)||0,l=(state.laptop&&state.laptop.totalSeconds)||0;let top=null;try{top=getTopProductiveDay()}catch(e){}
 return{completion:pct,grade:getGradeInfo(pct,true).grade,radar:CATS.map(c=>({cat:c,pct:cs[c].t?Math.round(cs[c].k/cs[c].t*100):0})),
  focusSeconds:f,totalSeconds:f+l,focusHours:+(f/3600).toFixed(2),streak:+state.streak||0,longestStreak:Math.max(+state.streak||0,+state.longestStreak||0),
  reflection:(lsGetRaw('whatHappenedText')||'').slice(0,600),topDay:top?{date:top.dateDisplay,hours:+(top.totalSecs/3600).toFixed(2),time:top.formattedTime}:null,
  habits:(state.habits||[]).map(h=>({name:h.name,category:h.category,weight:h.weight,completed:!!h.completed}))}}
function vault(){try{const a=JSON.parse(localStorage.getItem(VK)||'[]');return Array.isArray(a)?a:[]}catch(e){return[]}}
function archiveCurrentArc(arcName){
 const e=Object.assign({id:'arc_'+Date.now().toString(36),name:String(arcName||((state.currentArc==='summer'?'Summer':'Winter')+' Arc')),arcType:state.currentArc||'winter',archivedAt:new Date().toISOString()},metrics()),a=vault();a.push(e);
 try{localStorage.setItem(VK,JSON.stringify(a))}catch(err){toast('Arc Vault is full. Export a backup first.');return null}return e}
function radar(r,col){const n=r.length,pt=(i,k)=>{const a=-Math.PI/2+i*2*Math.PI/n;return(50+38*k*Math.cos(a)).toFixed(1)+','+(50+38*k*Math.sin(a)).toFixed(1)};
 const g=[.5,1].map(f=>`<polygon points="${r.map((o,i)=>pt(i,f)).join(' ')}" fill="none" stroke="rgba(148,163,184,.3)" stroke-width=".6"/>`).join('');
 return`<svg viewBox="0 0 100 100" class="w-20 h-20 shrink-0" role="img" aria-label="Pillar radar">${g}<polygon points="${r.map((o,i)=>pt(i,Math.max(.04,o.pct/100))).join(' ')}" fill="${col}33" stroke="${col}" stroke-width="1.5"/></svg>`}
function vcard(name,e,cur,live){
 const col=(live?state.currentArc==='summer':e.arcType==='summer')?'#fbbf24':'#22d3ee',
 d=(a,b,u)=>{if(!cur)return'';const x=a-b;return`<span class="${x>=0?'text-emerald-400':'text-rose-400'}">${x>=0?'+':''}${+x.toFixed(1)}${u} now</span>`},
 row=(l,v,x)=>`<div class="flex justify-between gap-2 text-[11px]"><span class="text-slate-400">${l}</span><span class="text-white font-bold">${v} ${x||''}</span></div>`,
 dt=e.archivedAt?new Date(e.archivedAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'';
 return`<div class="rounded-2xl border ${live?'border-amber-500/40':'border-slate-700'} bg-slate-900/70 p-3 space-y-2"><div class="flex items-center gap-3">${radar(e.radar||[],col)}<div class="flex-1 min-w-0 space-y-1"><div class="flex items-center justify-between gap-2"><strong class="text-sm text-white truncate">${esc(name)}</strong><span class="px-2 py-0.5 rounded-lg text-xs font-black" style="background:${col}22;color:${col}">${esc(e.grade)}</span></div><div class="text-[10px] text-slate-500">${live?'Live analytics, updates as you log':'Frozen '+dt}</div>${row('Completion',e.completion+'%',cur&&d(cur.completion,e.completion,'%'))}${row('Focus hours',e.focusHours+'h',cur&&d(cur.focusHours,e.focusHours,'h'))}${row('Best streak',e.longestStreak+' d',cur&&d(cur.longestStreak,e.longestStreak,'d'))}</div></div>${e.reflection?`<p class="text-[11px] italic text-slate-300 line-clamp-3">“${esc(e.reflection)}”</p>`:''}${e.topDay?`<p class="text-[10px] text-slate-400">Top day: ${esc(e.topDay.date)} (${esc(e.topDay.time)})</p>`:''}</div>`}
function openVault(){
 let m=$('#sa-vault');if(!m){m=document.createElement('div');m.id='sa-vault';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label','Arc Vault');m.className='fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-3';m.addEventListener('click',e=>{if(e.target===m)closeVault()});document.body.appendChild(m)}
 const cur=metrics(),list=vault().slice().reverse();
 m.innerHTML=`<div class="glass-card w-full max-w-lg max-h-[88dvh] overflow-y-auto rounded-3xl p-4 sm:p-5 space-y-3 border border-slate-700"><div class="flex items-center justify-between"><h3 class="text-lg font-extrabold text-white flex items-center gap-2"><i class="fa-solid fa-archive text-amber-400"></i> Arc Vault</h3><button type="button" onclick="SummerArc.closeVault()" aria-label="Close Arc Vault" class="min-w-[44px] min-h-[44px] text-slate-400 hover:text-white ${BTN}"><i class="fa-solid fa-xmark text-xl"></i></button></div>${vcard('Current Arc',cur,null,true)}${list.length?list.map(e=>vcard(e.name,e,cur,false)).join(''):'<p class="text-xs text-slate-400 text-center py-4">Nothing archived yet. Your Winter Arc is frozen here when you start the Summer Arc.</p>'}</div>`;
 m.classList.remove('hidden');sfx('modalOpen')}
function closeVault(){const m=$('#sa-vault');if(m)m.classList.add('hidden');sfx('modalClose')}
function addVaultBtn(){const b=$('#view-results button[onclick*="openArcModal"]');if(!b||$('#sa-vault-btn'))return;const v=document.createElement('button');v.id='sa-vault-btn';v.type='button';v.setAttribute('role','button');
 v.className='flex-1 sm:flex-none px-3 py-2 min-h-[44px] rounded-xl bg-slate-800 active:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition hover:bg-slate-700 '+BTN;
 v.innerHTML='<i class="fa-solid fa-archive"></i> Arc Vault';v.onclick=openVault;b.parentElement.insertBefore(v,b)}

/* ---------- two-step transition wizard ---------- */
let step=1,busy=false;
function statsBox(){const el=$('#modal-stat-time');return el&&el.parentElement?el.parentElement.parentElement:null}
function wizInit(){
 const modal=$('#arc-modal');if(!modal)return;
 const card=modal.firstElementChild,box=statsBox(),btn=$('#btn-confirm-arc-transition');
 if(!card||!box||!btn)return;
 const row=btn.parentElement;if(!row)return;
 card.classList.add('max-h-[90dvh]','overflow-y-auto');
 if(!$('#sa-steps')){
  const s=document.createElement('div');s.id='sa-steps';s.className='flex items-center justify-center gap-2 text-[10px] font-mono text-slate-400';
  box.parentNode.insertBefore(s,box);
  const p=document.createElement('div');p.id='sa-step2';p.className='hidden space-y-3';
  row.parentNode.insertBefore(p,row);
  const b=document.createElement('button');b.id='sa-back';b.type='button';b.setAttribute('aria-label','Back to stats');b.className='hidden px-3 min-w-[44px] min-h-[44px] rounded-xl bg-slate-800 text-slate-300 '+BTN;b.innerHTML='<i class="fa-solid fa-arrow-left"></i>';b.onclick=()=>{sfx('click');setStep(1)};
  row.insertBefore(b,row.firstChild);
  row.insertAdjacentHTML('afterend','<button id="sa-winter" type="button" class="hidden w-full py-2.5 min-h-[44px] rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold '+BTN+'"><i class="fa-solid fa-snowflake mr-1.5"></i>Switch back to Winter Arc</button>');
  const sw=$('#sa-winter');if(sw)sw.onclick=toWinter;
 }
 let ex=$('#sa-stat-extra');
 if(!ex){
  ex=document.createElement('div');ex.id='sa-stat-extra';ex.className='space-y-2';box.insertBefore(ex,box.firstChild);
 }
 const m=metrics(),r=(l,v)=>`<div class="flex items-center justify-between"><span class="flex items-center gap-1.5"><i class="fa-solid fa-check text-emerald-400"></i> ${l}</span><strong class="text-white">${v}</strong></div>`;
 ex.innerHTML=r('Focus Hours Logged',m.focusHours+'h')+r('Completion Rate (Grade '+m.grade+')',m.completion+'%');
 const swb=$('#sa-winter');if(swb)swb.classList.toggle('hidden',state.currentArc!=='summer');
 setStep(1);
}
function setStep(n){
 if(!$('#sa-steps'))wizInit();
 step=n;
 const box=statsBox();if(box)box.classList.toggle('hidden',n===2);
 const md=$('#modal-desc');if(md)md.classList.toggle('hidden',n===2);
 const s2=$('#sa-step2');if(s2)s2.classList.toggle('hidden',n!==2);
 const sb=$('#sa-back');if(sb)sb.classList.toggle('hidden',n!==2);
 const stp=$('#sa-steps');
 if(stp)stp.innerHTML=[1,2].map(i=>`<span class="flex items-center gap-1 ${i===n?'text-amber-300':''}"><b class="w-5 h-5 rounded-full grid place-items-center ${i===n?'bg-amber-500 text-black':'bg-slate-800'}">${i}</b>${i===1?'Your stats carry over':'Summer habits'}</span>`).join('<span class="w-6 h-px bg-slate-700"></span>');
 const btn=$('#btn-confirm-arc-transition');
 if(btn)btn.textContent=n===1?'Next: Update Habits':'Launch Showcase & Transition';
 if(n===2)buildStep2();
}
function buildStep2(){
 const o=PRESETS.map((p,i)=>`<option value="${i}">${esc(p.n)}</option>`).join('');
 $('#sa-step2').innerHTML=`<p class="text-[11px] text-slate-300 leading-relaxed">Swap a winter rule for a summer one, type your own, or keep it. Each rule keeps its history.</p><div class="space-y-2">${state.habits.map((h,i)=>`<div class="rounded-xl bg-slate-900/80 border border-slate-800 p-2 space-y-1.5" data-i="${i}"><input class="sa-nm w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white ${BTN}" value="${esc(h.name)}" maxlength="60" aria-label="Habit ${i+1} name"><select class="sa-pre w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 min-h-[40px] text-[11px] text-slate-300" aria-label="Summer preset for habit ${i+1}"><option value="">Keep as ${esc(h.category)} rule</option>${o}</select></div>`).join('')}</div><div><div class="text-[10px] font-mono text-slate-400 mb-1.5">Add as new rules</div><div class="flex flex-wrap gap-1.5">${PRESETS.slice(0,3).map((p,i)=>`<label class="px-2.5 py-1.5 min-h-[36px] rounded-full border border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-200 flex items-center gap-1.5"><input type="checkbox" class="sa-add accent-amber-400" value="${i}"> ${esc(p.n)}</label>`).join('')}</div></div>`;
 document.querySelectorAll('#sa-step2 .sa-pre').forEach(s=>s.onchange=()=>{const p=PRESETS[s.value];if(p)s.closest('[data-i]').querySelector('.sa-nm').value=p.n})}
function applyMigration(){
 document.querySelectorAll('#sa-step2 [data-i]').forEach(r=>{const h=state.habits[+r.dataset.i];if(!h)return;const nm=r.querySelector('.sa-nm').value.trim().slice(0,60),p=PRESETS[r.querySelector('.sa-pre').value];
  if(nm)h.name=nm;if(p&&nm===p.n){h.category=p.c;h.weight=p.w}});
 document.querySelectorAll('#sa-step2 .sa-add:checked').forEach(c=>{const p=PRESETS[c.value];if(!state.habits.some(h=>h.name===p.n))state.habits.push({id:'s'+Date.now().toString(36)+c.value,name:p.n,category:p.c,weight:p.w,completed:false})});
 try{renderHabits();renderRulesBlueprint()}catch(e){}sv()}
function burst(mode){const o=$('#sa-burst');if(o)o.remove();const d=document.createElement('div');d.id='sa-burst';d.setAttribute('aria-hidden','true');if(mode==='w')d.className='w';d.innerHTML='<i></i><b></b>';document.body.appendChild(d);setTimeout(()=>d.remove(),2600)}
function toWinter(){closeArcModal();state.currentArc='winter';sv();burst('w');sfx('slideNext');try{applyArcTheme();updateDailyQuote();renderSpiderWeb();renderHabits()}catch(e){}toast('Back to Winter Arc')}

const _open=window.openArcModal;window.openArcModal=function(){const r=_open.apply(this,arguments);try{wizInit()}catch(e){console.error(e)}return r};
const _closeArcModal=window.closeArcModal;window.closeArcModal=function(){if(typeof _closeArcModal==='function')_closeArcModal.apply(this,arguments);step=1};
const _go=window.confirmAndLaunchSummerShowcase;
window.confirmAndLaunchSummerShowcase=function(){
 if(step===1){sfx('click');setStep(2);return}
 if(busy)return;busy=true;const w=state.currentArc!=='summer',a=arguments;
 if(w){archiveCurrentArc('Winter Arc '+new Date().getFullYear());sfx('arcIgnite');burst()}
 applyMigration();closeArcModal();step=1;
 setTimeout(()=>{busy=false;_go.apply(null,a)},w?1000:0)};
const _theme=window.applyArcTheme;
window.applyArcTheme=function(){const r=_theme.apply(this,arguments),s=state.currentArc==='summer';document.body.dataset.arc=s?'summer':'winter';document.body.style.backgroundColor=s?'#120817':'#060913';try{renderSummerWidgets()}catch(e){}return r};

/* ---------- summer tracker widgets ---------- */
let sunT=null;
const tk=()=>{const k=today();state.summerTrack=state.summerTrack||{};return state.summerTrack[k]=state.summerTrack[k]||{sun:0,done:false,water:0}},mmss=s=>Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
function stopSun(){if(sunT){clearInterval(sunT);sunT=null}}
/* Hydration & Sunlight trackers removed */
function renderSummerWidgets(){const w=$('#sa-widgets');if(w)w.remove();stopSun()}
const _rh=window.renderHabits;window.renderHabits=function(){const r=_rh.apply(this,arguments);try{track();renderSummerWidgets()}catch(e){}return r};

/* ---------- achievement card (off-screen 1080x1920 canvas) ---------- */
function rr(x,X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()}
function txt(x,s,X,Y,px,wt,col,maxW,al){x.font=wt+' '+px+'px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';while(maxW&&x.measureText(s).width>maxW&&px>18){px-=2;x.font=wt+' '+px+'px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif'}x.fillStyle=col;x.textAlign=al||'center';x.fillText(s,X,Y)}
function downloadCard(){
 const m=metrics(),W=1080,H=1920,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
 let g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#120817');g.addColorStop(.55,'#2a0f2e');g.addColorStop(1,'#7c2d12');x.fillStyle=g;x.fillRect(0,0,W,H);
 x.save();x.translate(W/2,560);for(let i=0;i<36;i++){x.rotate(Math.PI/18);x.fillStyle=i%2?'rgba(251,191,36,.11)':'rgba(251,191,36,.03)';x.beginPath();x.moveTo(0,0);x.lineTo(-95,-1500);x.lineTo(95,-1500);x.closePath();x.fill()}x.restore();
 g=x.createRadialGradient(W/2,560,20,W/2,560,430);g.addColorStop(0,'rgba(255,247,214,.9)');g.addColorStop(.4,'rgba(251,191,36,.45)');g.addColorStop(1,'rgba(251,191,36,0)');x.fillStyle=g;x.beginPath();x.arc(W/2,560,430,0,7);x.fill();
 g=x.createRadialGradient(W/2-50,500,20,W/2,560,260);g.addColorStop(0,'#fff3c4');g.addColorStop(.55,'#fbbf24');g.addColorStop(1,'#f97316');x.fillStyle=g;x.beginPath();x.arc(W/2,560,260,0,7);x.fill();
 txt(x,m.grade,W/2,690,430,'900','#120817');
 rr(x,90,90,900,170,85);x.fillStyle='rgba(18,8,23,.72)';x.fill();x.strokeStyle='#fbbf24';x.lineWidth=4;x.stroke();
 txt(x,'SUMMER ARC UNLOCKED',W/2,172,56,'900','#fbbf24',800);txt(x,'GRADE '+m.grade+'  |  '+m.longestStreak+'-DAY LOCK-IN',W/2,226,32,'700','#fde68a',800);
 txt(x,'ARC GRADE',W/2,900,40,'700','#fde68a');txt(x,m.completion+'% of habit weight completed',W/2,952,36,'500','#fcd9a8',900);
 const top=m.topDay,cards=[['FOCUS & SCREEN TIME LOGGED',formatDuration(m.totalSeconds),'Winter '+new Date().getFullYear()+' carried into summer'],['LONGEST LOCK-IN STREAK',m.longestStreak+(m.longestStreak===1?' day':' days'),'Current streak: '+m.streak+' days'],['TOP PRODUCTIVE DAY',top?top.date:'Not logged yet',top?top.time+' logged':'Log screen time to set one']];
 cards.forEach((c,i)=>{const y=1010+i*235;rr(x,90,y,900,205,36);x.fillStyle='rgba(18,8,23,.62)';x.fill();x.strokeStyle='rgba(251,191,36,.35)';x.lineWidth=3;x.stroke();
  txt(x,c[0],130,y+58,30,'700','#fbbf24',820,'left');txt(x,c[1],130,y+130,i===2?50:68,'900','#ffffff',820,'left');txt(x,c[2],130,y+174,28,'500','#e9c9a0',820,'left')});
 txt(x,'Winter built it. Summer shows it.',W/2,1800,40,'700','#fde68a',900);txt(x,'Winter & Summer Arc Tracker '+new Date().getFullYear(),W/2,1856,28,'500','rgba(253,230,138,.6)',900);
 const name='summer-arc-unlocked-'+today()+'.png',save=url=>{const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();if(url.indexOf('blob:')===0)setTimeout(()=>URL.revokeObjectURL(url),4000)};
 if(cv.toBlob)cv.toBlob(b=>b?save(URL.createObjectURL(b)):toast('Could not build the card'),'image/png');else save(cv.toDataURL('image/png'));sfx('check');toast('Achievement card downloaded')}
const _rs=window.renderShowcaseSlide;
window.renderShowcaseSlide=function(){const r=_rs.apply(this,arguments);
 try{const s=showcaseSlides[currentShowcaseIndex],c=$('#showcase-slide-card');if(s&&s.type==='outro'&&c&&!c.querySelector('#sa-dl')){const b=document.createElement('button');b.id='sa-dl';b.type='button';b.className='w-full sm:w-auto mx-auto px-6 py-3 min-h-[44px] rounded-2xl bg-slate-900 border border-amber-400/50 text-amber-300 font-extrabold text-sm flex items-center justify-center gap-2 '+BTN;b.innerHTML='<i class="fa-solid fa-download"></i> Download Achievement Card';b.onclick=downloadCard;c.appendChild(b)}}catch(e){}return r};

document.addEventListener('keydown',e=>{if(e.key==='Escape'){const v=$('#sa-vault');if(v&&!v.classList.contains('hidden'))closeVault()}});
window.archiveCurrentArc=archiveCurrentArc;
window.SummerArc={archiveCurrentArc,openVault,closeVault,downloadCard,metrics,burst,getVault:vault};
function init(){try{addVaultBtn();track();document.body.dataset.arc=state.currentArc==='summer'?'summer':'winter';renderSummerWidgets()}catch(e){console.error(e)}}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
