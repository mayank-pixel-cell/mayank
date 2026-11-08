(function(){'use strict';
const S=window.SettingsApp,q=s=>document.querySelector(s),H=document.documentElement,sr=q('#sx-root');
if(!S||!sr)return;
const C=()=>S.get().ax,sv=()=>S.save(),say=m=>{const l=q('#ax-live');if(l)l.textContent=m};
const buzz=()=>{try{const n=[0,8,15,30][C().hap];if(n&&navigator.vibrate)navigator.vibrate(n)}catch(e){}};
let bat=null,rv=0;
const sw=(id,l,on)=>'<label class="sx-sw"><input type="checkbox" id="'+id+'" aria-label="'+l+'"'+(on?' checked':'')+'><span></span></label>';
const row=(l,h,c)=>'<div class="sx-row"><div class="min-w-0"><div class="text-xs font-semibold text-slate-200">'+l+'</div>'+(h?'<div class="text-[10px] text-slate-500">'+h+'</div>':'')+'</div>'+c+'</div>';
const seg=(k,l,o,v)=>'<div class="sx-seg" role="group" aria-label="'+l+'">'+o.map(x=>'<button data-x="'+k+'" data-v="'+x[0]+'" aria-pressed="'+(v===x[0])+'">'+x[1]+'</button>').join('')+'</div>';
const card=(i,t,s,b)=>'<section class="glass-card rounded-2xl p-4 sm:p-5 space-y-2"><div class="flex items-center gap-3"><div class="sx-ic"><i class="fa-solid fa-'+i+'"></i></div><div class="min-w-0"><h2 class="text-sm sm:text-base font-extrabold text-white">'+t+'</h2><p class="text-[11px] text-slate-400">'+s+'</p></div></div>'+b+'</section>';
const fps=n=>{const e=q('#sx-root [data-a=fps][data-v="'+n+'"]');if(!e)return;window.__sxQuiet=true;try{e.click()}finally{window.__sxQuiet=false}};
const mk=(t,id,h)=>{const e=document.createElement(t);e.id=id;if(h)e.innerHTML=h;return e};
const ax=mk('div','ax-root');ax.className='space-y-4 mb-4';sr.parentNode.insertBefore(ax,sr);
const tint=mk('div','ax-tint'),sh=mk('div','ax-sh','<div><i class="fa-solid fa-shield-halved text-3xl"></i><p class="mt-2 text-xs">Hidden for privacy</p></div>'),live=mk('div','ax-live');
live.className='sr-only';live.setAttribute('role','status');live.setAttribute('aria-live','polite');document.body.append(tint,sh,live);

function look(){const a=C(),o=a.out.on,t=o?Math.max(a.text,125):a.text;H.style.fontSize=t===100?'':t+'%';H.classList.toggle('ax-hc',a.hc||o);H.classList.toggle('ax-rm',a.rm);document.body.classList.toggle('ax-reach',a.reach)}
function mode(){const a=C(),n=new Date(),m=n.getHours()*60+n.getMinutes(),t=s=>{const p=String(s).split(':');return(+p[0]||0)*60+(+p[1]||0)},f=t(a.night.from),e=t(a.night.to),
 night=a.night.on&&(f>e?m>=f||m<e:m>=f&&m<e),low=a.saver.on&&!!bat&&bat.level<.2&&!bat.charging;
 tint.style.background=night?'rgba(24,12,0,.24)':'transparent';
 if(low&&!a.saver.act){a.saver.act=true;a.saver.pf=S.get().fx.fps;fps(30);sv()}else if(!low&&a.saver.act){a.saver.act=false;fps(a.saver.pf);sv()}
 look();const on=[night&&'Night',low&&'Battery saver',a.out.on&&'Outdoor boost'].filter(Boolean),el=q('#ax-act');if(el)el.textContent=on.length?'Active mode: '+on.join(' + '):'No context mode active'}
const press=(k,v)=>ax.querySelectorAll('[data-x='+k+']').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.v===v));
function paint(){const a=C(),b=bat?Math.round(bat.level*100)+'% now':'battery status unavailable here';
 ax.innerHTML='<div id="ax-act" class="text-[11px] font-mono text-slate-400" role="status"></div>'+
 card('universal-access','Comfort & accessibility','Presets apply instantly. Text changes auto-revert unless you keep them.',
  row('Text size','Scales the whole app',seg('text','Text size',[[100,'100%'],[115,'115%'],[130,'130%'],[150,'150%']],a.text))+
  '<div id="ax-keep" class="hidden sx-hr text-[11px] text-slate-200"><span class="flex-1" id="ax-kt"></span><button class="sx-chip" data-x="keep">Keep</button></div>'+
  row('High contrast','Brighter text and borders',sw('ax-hc','High contrast',a.hc))+
  row('Reduce motion','Stops animations and particles',sw('ax-rm','Reduce motion',a.rm))+
  row('Haptics','Vibration on taps, on supported phones','<div class="flex items-center gap-2">'+seg('hap','Haptic strength',[[0,'Off'],[1,'Subtle'],[2,'Normal'],[3,'Strong']],a.hap)+'<button class="sx-chip" data-x="feel">Feel it</button></div>')+
  row('Reach mode','Moves content into thumb range',sw('ax-reach','Reach mode',a.reach)))+
 card('shield-halved','Privacy & sensors','Everything stays on this device. Nothing is uploaded.',
  row('Privacy shield','Hides the app when you switch away',sw('ax-shield','Privacy shield',a.shield))+
  row('Quiet & still','One tap turns sounds and particles off','<button class="sx-btn" data-x="quiet" id="ax-quiet"><i class="fa-solid fa-volume-xmark"></i> Mute all</button>'))+
 card('wand-magic-sparkles','Context modes','Settings that adapt on their own. Active modes are shown above.',
  row('Night mode','Dims the screen on a schedule','<div class="flex items-center gap-2">'+sw('ax-night','Night mode',a.night.on)+'<input type="time" class="sx-in" id="ax-nf" value="'+a.night.from+'" aria-label="Night starts"><input type="time" class="sx-in" id="ax-nt" value="'+a.night.to+'" aria-label="Night ends"></div>')+
  row('Battery saver','Caps FPS at 30 under 20% ('+b+')',sw('ax-saver','Battery saver',a.saver.on))+
  row('Outdoor boost','Text at least 125% plus high contrast',sw('ax-out','Outdoor boost',a.out.on)));
 mode()}
function tryText(v){const a=C(),old=a.text;if(v===old)return;a.text=v;look();press('text',v);const k=q('#ax-keep'),t=q('#ax-kt');let n=8;k.classList.remove('hidden');clearTimeout(rv);
 (function tick(){t.textContent='Keep this size? Reverting in '+n+'s';if(n--<=0){a.text=old;look();press('text',old);k.classList.add('hidden');say('Text size reverted');return}rv=setTimeout(tick,1000)})()}
function quiet(){['sx-a-click','sx-a-check','sx-a-fanfare','sx-fx-on'].forEach(id=>{const e=q('#'+id);if(e&&e.checked){e.checked=false;e.dispatchEvent(new Event('change',{bubbles:true}))}});say('Sounds and particles are off')}
ax.addEventListener('click',e=>{const b=e.target.closest('[data-x]');if(!b)return;const x=b.dataset.x,v=+b.dataset.v,a=C();
 if(x==='text')tryText(v);
 else if(x==='keep'){clearTimeout(rv);q('#ax-keep').classList.add('hidden');sv();say('Text size kept')}
 else if(x==='hap'){a.hap=v;sv();press('hap',v);buzz()}
 else if(x==='feel')buzz();
 else if(x==='quiet')quiet()});
ax.addEventListener('change',e=>{const t=e.target,a=C(),m={'ax-hc':()=>a.hc=t.checked,'ax-rm':()=>a.rm=t.checked,'ax-reach':()=>a.reach=t.checked,'ax-shield':()=>a.shield=t.checked,'ax-night':()=>a.night.on=t.checked,'ax-saver':()=>a.saver.on=t.checked,'ax-out':()=>a.out.on=t.checked,'ax-nf':()=>a.night.from=t.value,'ax-nt':()=>a.night.to=t.value};
 if(!m[t.id])return;m[t.id]();sv();mode();say((t.getAttribute('aria-label')||'Setting')+(t.type==='checkbox'?(t.checked?' on':' off'):' updated'))});
document.addEventListener('click',e=>{if(e.target.closest('button,label,select,input'))buzz()},true);
document.addEventListener('visibilitychange',()=>{sh.style.display=C().shield&&document.hidden?'grid':'none'});
addEventListener('pagehide',()=>{if(C().shield)sh.style.display='grid'});

/* Ask Settings: intent search, recents, deep links (#s=id) */
const X=[['text','Text size','font bigger larger smaller zoom read size scale','[data-x=text]'],['hc','High contrast','contrast readable sunlight glare clarity','#ax-hc'],['rm','Reduce motion','animation motion dizzy still calm','#ax-rm'],['hap','Haptic feedback','vibrate vibration buzz touch feel','[data-x=hap]'],['reach','Reach mode (one-handed)','one hand thumb reach lower bottom big phone','#ax-reach'],['shield','Privacy shield','privacy hide blur recents switch lock','#ax-shield'],['quiet','Quiet & still','mute silence quiet stop sound particles pause','#ax-quiet'],['night','Night mode','night evening dim sleep bedtime schedule time','#ax-night'],['saver','Battery saver','battery power drain low save fps charge','#ax-saver'],['out','Outdoor boost','outside outdoor sun sunlight bright glare','#ax-out'],
['vol','Master volume','volume loud sound audio quiet','#sx-vol'],['fx','Particle canvas','particles effects canvas animation performance lag','#sx-fx-on'],['fps','Frame rate cap','fps frame smooth battery 30 60 120 200 max hz refresh','[data-a=fps]'],['theme','Theme & accent','theme color dark winter summer cyberpunk accent look','[data-a=theme]'],['arc','Arc dates','arc start end date days challenge window','#sx-start'],['quotes','My quotes','quote motivation custom','#sx-qt'],['weights','Category weights','weight category points score habit','#sx-w'],['order','Checklist order','reorder order habit list move sort','#sx-ho'],['freeze','Streak freeze','streak freeze miss skip protect','#sx-fz'],['export','Export backup','backup export download save data json','[data-a=export]'],['import','Import backup','restore import upload json','#json-sync-input'],['clear','Clear all data','delete wipe reset erase factory clear','[data-a=clear]']];
const V={text:()=>C().text+'%',hc:()=>C().hc?'On':'Off',rm:()=>C().rm?'On':'Off',hap:()=>['Off','Subtle','Normal','Strong'][C().hap],reach:()=>C().reach?'On':'Off',shield:()=>C().shield?'On':'Off',night:()=>C().night.on?'On':'Off',saver:()=>C().saver.on?'On':'Off',out:()=>C().out.on?'On':'Off',vol:()=>S.get().audio.volume+'%',fx:()=>S.get().fx.enabled?'On':'Off',fps:()=>S.get().fx.fps===200?'Max':S.get().fx.fps+' FPS',theme:()=>S.get().theme||'winter',freeze:()=>S.get().freeze.on?'On':'Off'};
const AUTO=[[/outside|outdoor|sun|glare/,'out','Outdoor boost'],[/night|evening|bed|sleep/,'night','Night mode'],[/battery|low power|drain/,'saver','Battery saver']];
const st=w=>w.length>3?w.replace(/s$/,''):w,toks=s=>s.toLowerCase().replace(/[^a-z0-9 ]+/g,' ').split(/\s+/).filter(w=>w.length>1).map(st);
function find(s){const T=toks(s);return X.map(x=>{const t=toks(x[1]),k=toks(x[2]);let n=0;T.forEach(w=>{if(t.includes(w))n+=3;if(k.includes(w))n+=3;else if(k.some(z=>z.length>3&&(z.startsWith(w)||w.startsWith(z))))n+=1});return[n,x]}).filter(r=>r[0]>0).sort((a,b)=>b[0]-a[0]).slice(0,5).map(r=>r[1])}
const bar=mk('div','ax-bar','<div id="ax-res" role="listbox" aria-label="Search results"></div><div class="ax-sb"><i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i><input id="ax-q" type="search" placeholder="Ask settings: make text bigger outside" aria-label="Ask settings" autocomplete="off"><button id="ax-mic" class="sx-ib" style="display:none" aria-label="Voice search"><i class="fa-solid fa-microphone"></i></button></div>');
const dock = document.getElementById('ax-bar-dock');
if (dock) {
  dock.appendChild(bar);
} else {
  const viewSettings = document.getElementById('view-settings');
  const subtabsRow = viewSettings ? viewSettings.firstElementChild : null;
  if (subtabsRow && subtabsRow.nextSibling) {
    subtabsRow.parentNode.insertBefore(bar, subtabsRow.nextSibling);
  } else {
    document.body.appendChild(bar);
  }
}
function show(s){const el=q('#ax-res'),l=s.toLowerCase(),r=s?find(s):C().recents.map(i=>X.find(x=>x[0]===i)).filter(Boolean),c=/\b(when|while|whenever|if|every)\b/.test(l)&&AUTO.find(a=>a[0].test(l));
 let h=c?'<button class="ax-r" data-auto="'+c[1]+'"><b>Make it automatic</b><small>Turn on '+c[2]+'</small></button>':'';
 h+=r.map(x=>'<button class="ax-r" role="option" data-go="'+x[0]+'"><b>'+x[1]+'</b><small>'+(V[x[0]]?V[x[0]]():'Open')+'</small></button>').join('');
 if(s&&!r.length&&!c)h='<div class="ax-r">No match. Try sound, battery or backup.</div>';
 if(s&&/text|size|font|bigger|larger|smaller|outdoor|outside|reset/i.test(s)){
  h = '<button class="ax-r" data-cmd="make text bigger"><b>🔍 Make text bigger</b><small>+15%</small></button>' +
      '<button class="ax-r" data-cmd="smaller text"><b>🔍 Make text smaller</b><small>-15%</small></button>' +
      '<button class="ax-r" data-cmd="make text bigger outside"><b>☀️ Outdoor boost (125%)</b><small>High Contrast</small></button>' +
      '<button class="ax-r" data-cmd="reset text size"><b>↺ Reset text size</b><small>100%</small></button>' + h;
 }
 el.innerHTML=h+(!s&&r.length?'<div class="ax-h">Recent</div>':'')}
function go(id){const x=X.find(z=>z[0]===id);if(!x)return;try{switchTab('settings')}catch(e){}
 const a=C();a.recents=[id].concat(a.recents.filter(z=>z!==id)).slice(0,5);sv();
 setTimeout(()=>{const t=q(x[3]);if(!t)return;const r=t.closest('.sx-row,section,li')||t;r.scrollIntoView({block:'center',behavior:a.rm?'auto':'smooth'});r.classList.add('ax-hit');setTimeout(()=>r.classList.remove('ax-hit'),1800);if(t.focus)t.focus({preventScroll:true})},150);
 history.replaceState(null,'','#s='+id);say('Opened '+x[1])}

function handleAskSettingsCommand(rawQuery) {
  if (!rawQuery || typeof rawQuery !== 'string') return false;
  const q = rawQuery.trim().toLowerCase();
  
  if (/make text bigger outside|bigger text outside|outdoor boost|outside/i.test(q)) {
    document.documentElement.style.fontSize = '125%';
    try { localStorage.setItem('arc_ui_font_scale', '125'); } catch(e){}
    try { const a = C(); a.out.on = true; a.text = 125; sv(); } catch(e){}
    const msg = '🔍 Outdoor Boost: Text size increased to 125%';
    if (typeof showToast === 'function') showToast(msg);
    else if (typeof toast === 'function') toast(msg);
    say(msg);
    return true;
  }
  if (/make text bigger|bigger text|larger text|increase text|zoom in|larger font/i.test(q)) {
    let currentScale = parseInt(localStorage.getItem('arc_ui_font_scale') || '100', 10);
    let newScale = Math.min(160, currentScale + 15);
    document.documentElement.style.fontSize = newScale + '%';
    try { localStorage.setItem('arc_ui_font_scale', String(newScale)); } catch(e){}
    try { const a = C(); a.text = newScale; sv(); } catch(e){}
    const msg = '🔍 Text size increased to ' + newScale + '%';
    if (typeof showToast === 'function') showToast(msg);
    else if (typeof toast === 'function') toast(msg);
    say(msg);
    return true;
  }
  if (/smaller text|make text smaller|decrease text|zoom out|smaller font/i.test(q)) {
    let currentScale = parseInt(localStorage.getItem('arc_ui_font_scale') || '100', 10);
    let newScale = Math.max(85, currentScale - 15);
    document.documentElement.style.fontSize = newScale + '%';
    try { localStorage.setItem('arc_ui_font_scale', String(newScale)); } catch(e){}
    try { const a = C(); a.text = newScale; sv(); } catch(e){}
    const msg = '🔍 Text size decreased to ' + newScale + '%';
    if (typeof showToast === 'function') showToast(msg);
    else if (typeof toast === 'function') toast(msg);
    say(msg);
    return true;
  }
  if (/reset text size|reset text|normal text|default text/i.test(q)) {
    document.documentElement.style.fontSize = '';
    try { localStorage.setItem('arc_ui_font_scale', '100'); } catch(e){}
    try { const a = C(); a.text = 100; a.out.on = false; sv(); } catch(e){}
    const msg = '🔍 Text size reset to 100%';
    if (typeof showToast === 'function') showToast(msg);
    else if (typeof toast === 'function') toast(msg);
    say(msg);
    return true;
  }
  return false;
}

bar.addEventListener('click',e=>{const g=e.target.closest('[data-go]'),u=e.target.closest('[data-auto]'),cmd=e.target.closest('[data-cmd]'),i=q('#ax-q');
 if(cmd){handleAskSettingsCommand(cmd.dataset.cmd);i.value='';q('#ax-res').innerHTML='';i.blur();return;}
 if(g){go(g.dataset.go)}else if(u){const a=C();a[u.dataset.auto].on=true;sv();paint();say('Automatic mode turned on')}else return;
 i.value='';q('#ax-res').innerHTML='';i.blur()});
bar.addEventListener('input',e=>{if(e.target.id==='ax-q')show(e.target.value)});
bar.addEventListener('focusin',()=>show(q('#ax-q').value));
bar.addEventListener('focusout',()=>setTimeout(()=>{if(!bar.contains(document.activeElement))q('#ax-res').innerHTML=''},200));
bar.addEventListener('keydown',e=>{
  if(e.key==='Enter'){
    const i=q('#ax-q');
    if(i&&i.value){
      if(handleAskSettingsCommand(i.value)){
        i.value='';q('#ax-res').innerHTML='';i.blur();
      }
    }
  }else if(e.key==='Escape'){
    q('#ax-q').value='';q('#ax-res').innerHTML='';
  }
});
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
if(SR){const m=q('#ax-mic');m.style.display='grid';m.onclick=()=>{try{const r=new SR();r.lang=navigator.language||'en-US';r.onresult=e=>{const i=q('#ax-q');i.value=e.results[0][0].transcript;show(i.value)};r.start();say('Listening')}catch(e){}}}
const vis=()=>{const v=q('#view-settings');bar.style.display=v&&v.offsetParent!==null?'':'none'};
const dl=()=>{const m=/#s=(\w+)/.exec(location.hash);if(m)go(m[1])};
addEventListener('hashchange',dl);setInterval(vis,400);vis();

paint();look();setInterval(mode,6e4);
const imp=q('#json-sync-input');if(imp)imp.addEventListener('change',()=>setTimeout(()=>{paint();look()},700));
if(navigator.getBattery)navigator.getBattery().then(b=>{bat=b;['levelchange','chargingchange'].forEach(e=>b.addEventListener(e,mode));paint()}).catch(()=>{});
setTimeout(dl,500);
})();
(()=>{'use strict';
const KEY='arc_hb_audio',$=s=>document.querySelector(s),
B=[['Sun',126.22],['Jupiter',183.58],['Saturn',147.85],['Neptune',211.44],['Deep Space Void',55]];
let cfg={on:false,vol:.35},ctx=null,master=null,voice=null,nb=null,tmr=0,cur=-1;
try{const o=JSON.parse(localStorage.getItem(KEY)||'null');if(o){cfg.on=o.on===true;if(o.vol>=0&&o.vol<=1)cfg.vol=+o.vol}}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){}},
lvl=v=>v*v*.55,
ramp=(p,to,t,c)=>{const n=c.currentTime;p.cancelScheduledValues(n);p.setValueAtTime(p.value,n);p.linearRampToValueAtTime(to,n+t)};
function noise(c){const n=c.sampleRate*4,b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);let l=0;for(let i=0;i<n;i++){l=(l+.02*(Math.random()*2-1))/1.02;d[i]=l*3.5}return b}
/* One celestial voice: resonant drone + drifting detune + filter sweep + stellar shimmer + solar-wind noise */
function mkVoice(c,[nm,f]){
 const dark=nm==='Deep Space Void',nodes=[],srcs=[],N=n=>(nodes.push(n),n),out=N(c.createGain());out.gain.value=0;
 const lp=N(c.createBiquadFilter());lp.type='lowpass';lp.Q.value=5;lp.frequency.value=f*(dark?2:4);lp.connect(out);
 const O=(type,hz,amp,det,dst)=>{const o=c.createOscillator(),g=N(c.createGain());srcs.push(o);o.type=type;o.frequency.value=hz;o.detune.value=det||0;g.gain.value=amp;o.connect(g);g.connect(dst||lp);return o},
 L=(rate,depth,param)=>{const o=c.createOscillator(),g=N(c.createGain());srcs.push(o);o.frequency.value=rate;g.gain.value=depth;o.connect(g);g.connect(param)};
 [O('sine',f,.3),O('triangle',f*1.5,.1,-5),O('sine',f*2,.12,6),O('sine',f/2,.28)].forEach(o=>L(.05+Math.random()*.1,6,o.detune));
 L(.03+Math.random()*.04,f*1.6,lp.frequency);
 if(!dark){const sg=N(c.createGain());sg.gain.value=.03;sg.connect(out);[4,6].forEach(m=>O('sine',f*m,1,m,sg));L(.1+Math.random()*.2,.03,sg.gain)}
 const ns=c.createBufferSource(),bp=N(c.createBiquadFilter()),ng=N(c.createGain());ns.buffer=nb;ns.loop=true;srcs.push(ns);
 bp.type='bandpass';bp.Q.value=1.4;bp.frequency.value=900;ng.gain.value=dark?.03:.07;ns.connect(bp);bp.connect(ng);ng.connect(out);L(.04+Math.random()*.05,650,bp.frequency);
 let tail=out;if(c.createStereoPanner){const pn=N(c.createStereoPanner());L(.04+Math.random()*.04,.6,pn.pan);out.connect(pn);tail=pn}
 srcs.forEach(x=>x.start());return{out,tail,nodes,srcs}}
function kill(v,c,t){ramp(v.out.gain,0,t,c);setTimeout(()=>{v.srcs.forEach(x=>{try{x.stop()}catch(e){}});v.nodes.forEach(n=>{try{n.disconnect()}catch(e){}});v.srcs.length=v.nodes.length=0},t*1e3+150)}
function setBody(target){
  if(!ctx)return;
  let i = 0;
  if(typeof target === 'number') i = (target >= 0 && target < B.length) ? target : 0;
  else if(typeof target === 'string') {
    const found = B.findIndex(b => b[0].toLowerCase() === target.toLowerCase() || (target.toLowerCase() === 'solar' && b[0] === 'Sun'));
    i = found >= 0 ? found : 0;
  }
  clearTimeout(tmr);
  const old = voice; cur = i;
  voice = mkVoice(ctx, B[i]);
  voice.tail.connect(master);
  ramp(voice.out.gain, 1, 4, ctx);
  if(old) kill(old, ctx, 4);
  ui();
  tmr = setTimeout(next, 26e3 + Math.random() * 16e3);
}
function next(){clearTimeout(tmr);if(!ctx)return;let i;do{i=Math.random()*B.length|0}while(i===cur);const old=voice;cur=i;voice=mkVoice(ctx,B[i]);voice.tail.connect(master);ramp(voice.out.gain,1,7,ctx);if(old)kill(old,ctx,7);ui();tmr=setTimeout(next,24e3+Math.random()*18e3)}
async function start(targetBody){if(window.ArcHardwareGatekeeper&&window.ArcHardwareGatekeeper.isCelestialAudioDisabled()){console.log('[HeavenlyBodies] Suppressed for lower-end device smoothness');return false;}if(ctx){if(targetBody)setBody(targetBody);return true;}const C=window.AudioContext||window.webkitAudioContext;if(!C)return false;
 const c=new C({latencyHint:'playback'});ctx=c;master=c.createGain();master.gain.value=0;
 const cp=c.createDynamicsCompressor();master.connect(cp);cp.connect(c.destination);master._cp=cp;
 const an=c.createAnalyser();an.fftSize=1024;an.smoothingTimeConstant=0.8;master.connect(an);master._an=an;
 window.__hbAnalyser=an;window.__hbCtx=c;nb=noise(c);
 try{await c.resume()}catch(e){}
 if(ctx!==c)return false;ramp(master.gain,lvl(cfg.vol),2,c);
 if(targetBody) setBody(targetBody); else next();
 return true}
function stop(){clearTimeout(tmr);const c=ctx,m=master,v=voice;ctx=master=voice=nb=null;window.__hbAnalyser=null;window.__hbCtx=null;cur=-1;if(!c)return;ramp(m.gain,0,.5,c);if(v)kill(v,c,.5);
 setTimeout(()=>{try{m.disconnect();m._cp.disconnect()}catch(e){}try{c.close()}catch(e){}},900)}
window.__getHbBands = function() {
  if (!window.__hbAnalyser || !window.__hbCtx) return null;
  const buf = new Uint8Array(window.__hbAnalyser.frequencyBinCount);
  window.__hbAnalyser.getByteFrequencyData(buf);
  const hz = window.__hbCtx.sampleRate / 1024;
  let b = 0, m = 0, t = 0, bn = 0, mn = 0, tn = 0;
  for (let i = 1; i < buf.length; i++) {
    const f = i * hz; const v = buf[i] / 255;
    if (f >= 20 && f <= 250) { b += v; bn++; }
    else if (f > 250 && f <= 2000) { m += v; mn++; }
    else if (f > 2000 && f <= 8000) { t += v; tn++; }
  }
  return { b: bn ? (b / bn) * 2.5 : 0, m: mn ? (m / mn) * 2.8 : 0, t: tn ? (t / tn) * 4.0 : 0 };
};
async function setOn(on, targetBody){if(on&&window.ArcHardwareGatekeeper&&window.ArcHardwareGatekeeper.isCelestialAudioDisabled()){console.log('[HeavenlyBodies] Suppressed for lower-end device smoothness');cfg.on=false;save();ui();return;}cfg.on=on;save();if(on){const ok=await start(targetBody);if(!ok&&!ctx){cfg.on=false;save()}}else stop();ui()}
function ui(){const t=$('#hb-t');if(!t)return;const p=Math.round(cfg.vol*100);t.setAttribute('aria-checked',String(cfg.on));$('#hb-v').value=p;$('#hb-vp').textContent=p+'%';$('#hb-now').textContent=cfg.on?(ctx&&cur>=0?'Now drifting: '+B[cur][0]:'Tap anywhere to start'):'Off'}
function inject(){const r=$('#sx-root');if(!r||$('#hb-card'))return;
 const isExp = (window.ArcSettingsAccordion && typeof window.ArcSettingsAccordion.isExpanded === 'function')
  ? window.ArcSettingsAccordion.isExpanded('hb-card')
  : false;
 const s=document.createElement('section');
 s.id='hb-card';
 s.className='glass-card rounded-2xl p-4 sm:p-5 border border-slate-700/60 settings-card-item';
 s.style.gridColumn='1/-1';
 s.setAttribute('aria-labelledby','hb-h');
 s.setAttribute('onkeydown', 'window.ArcSettingsAccordion && window.ArcSettingsAccordion.handleKeyDown(event, "hb-card")');
 s.innerHTML=`
  <div class="flex items-center justify-between gap-3 select-none">
   <div class="flex items-center gap-3 min-w-0">
    <div class="sx-ic shrink-0"><i class="fa-solid fa-earth-americas"></i></div>
    <div class="min-w-0 flex items-center gap-2 flex-wrap">
     <h3 id="hb-h" class="text-sm sm:text-base font-extrabold text-white truncate">Heavenly Bodies Ambient Audio</h3>
     <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shrink-0">Ambient</span>
    </div>
   </div>
   <div class="flex items-center gap-2 shrink-0">
    <button type="button" class="settings-arrow-btn p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition" aria-label="Expand settings card" aria-expanded="${isExp}" onclick="window.ArcSettingsAccordion && window.ArcSettingsAccordion.toggle('hb-card')">
     <i class="fa-solid fa-chevron-down text-xs transition-transform duration-300 settings-chevron-icon ${isExp ? 'rotate-180' : ''}"></i>
    </button>
   </div>
  </div>
  <div class="arc-fluid-accordion ${isExp ? 'expanded' : 'hidden'} pt-3 border-t border-slate-800/80 mt-3">
   <div class="space-y-3">
    <div class="flex items-center justify-between gap-3">
     <div>
      <div class="text-xs font-bold text-slate-300">Celestial Ambience Toggle</div>
      <p id="hb-now" class="text-xs text-slate-400" aria-live="polite">Off</p>
     </div>
     <button id="hb-t" type="button" role="switch" aria-checked="false" aria-labelledby="hb-h"></button>
    </div>
    <label for="hb-v" class="flex items-center justify-between text-xs text-slate-300">
     <span>Celestial volume (separate from sound FX)</span>
     <span id="hb-vp" class="font-mono"></span>
    </label>
    <input id="hb-v" type="range" min="0" max="100" step="1" aria-label="Celestial ambient volume">
   </div>
  </div>
 `;
 r.appendChild(s);
 $('#hb-t').onclick=()=>setOn(!cfg.on);
 $('#hb-v').oninput=e=>{cfg.vol=e.target.value/100;if(master)master.gain.setTargetAtTime(lvl(cfg.vol),ctx.currentTime,.05);ui()};
 $('#hb-v').onchange=save;
 ui();
}
/* autoplay policy: a saved ON state only (re)starts after a real user gesture; also recovers iOS interruptions */
const arm=()=>{if(!cfg.on)return;if(!ctx)start().then(ui);else if(ctx.state!=='running')ctx.resume().catch(()=>{})};
['pointerdown','keydown','touchend'].forEach(e=>addEventListener(e,arm,{capture:true,passive:true}));
document.addEventListener('visibilitychange',()=>{if(!ctx)return;document.hidden?ctx.suspend().catch(()=>{}):ctx.resume().catch(()=>{})});
const root=$('#sx-root');if(root){inject();new MutationObserver(inject).observe(root,{childList:true})}
window.HeavenlyBodies={enable:(b)=>{const t=b||'Sun';setOn(true,t);if(ctx)setBody(t);},disable:()=>setOn(false),setBody:(b)=>setBody(b),get enabled(){return cfg.on},get currentBody(){return cur>=0?B[cur][0]:'None'}};
})();

(function(){
 const $=id=>document.getElementById(id);
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const GLOW='transition-all duration-300 ease-out hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(0,240,255,0.25)]';
 const BTN='px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 bg-slate-900 text-slate-200 transition-all duration-300 ease-out hover:scale-[1.02] active:scale-95 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(0,240,255,0.25)] disabled:opacity-40';
 const IN='bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400';
 const catOpts=sel=>Object.keys(window.CATEGORIES||{}).map(c=>'<option'+(c===sel?' selected':'')+'>'+c+'</option>').join('');
 const wOpts=w=>[...new Set([1,2,3,w])].sort((a,b)=>a-b).map(n=>'<option value="'+n+'"'+(n==w?' selected':'')+'>'+n+'x</option>').join('');
 const commit=msg=>{
   if(window.saveToLocalStorage) window.saveToLocalStorage();
   if(window.renderHabits) window.renderHabits();
   if(window.renderRulesBlueprint) window.renderRulesBlueprint();
   if(window.renderHabitManager) window.renderHabitManager();
   if(msg && window.showToast) window.showToast(msg);
 };
 let lastKey=window.getTodayKey ? window.getTodayKey() : (typeof getTodayKey==='function'?getTodayKey():new Date().toISOString().split('T')[0]);

 const root=$('p20-settings');
 if(root)root.innerHTML=
  '<section id="p20-google-account" class="glass-card rounded-2xl p-4 sm:p-5 border-l-4 border-l-cyan-400 relative" aria-label="Google Account & Cloud Sync"></section>'+
  '<section id="p20-day" class="glass-card rounded-2xl p-4 border-l-4 border-l-cyan-400" aria-label="Day counter"></section>';
 /* the existing "Add Custom Habit" form moves here, so all habit customization lives in Rules & Master Blueprint */
 {const cn=$('custom-habit-name'),cb=cn&&cn.closest('.glass-card'),mgr=$('p20-habit-manager');
  if(cb&&mgr){cb.className='mt-4 pt-4 border-t border-slate-800 space-y-3';mgr.appendChild(cb);cn.addEventListener('keydown',e=>{if(e.key==='Enter'&&window.addCustomHabit)window.addCustomHabit()})}}

 window.renderDayControl=function(){
  const c=$('p20-day');if(!c)return;
  const isExp = (window.ArcSettingsAccordion && typeof window.ArcSettingsAccordion.isExpanded === 'function')
    ? window.ArcSettingsAccordion.isExpanded('p20-day')
    : false;
  const w=(window.getArcWindow?window.getArcWindow():getArcWindow()),t=(window.getEffectiveToday?window.getEffectiveToday():getEffectiveToday()),day=Math.round((t-w.start)/864e5)+1;
  const f=d=>d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  const dOverride=(typeof window!=='undefined'&&window.dayOverride!==undefined)?window.dayOverride:(typeof dayOverride!=='undefined'?dayOverride:null);
  c.setAttribute('onkeydown', 'window.ArcSettingsAccordion && window.ArcSettingsAccordion.handleKeyDown(event, "p20-day")');
  c.innerHTML=`
    <div class="flex items-center justify-between gap-3 select-none">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
          <i class="fa-solid fa-calendar-day text-base"></i>
        </div>
        <div class="min-w-0 flex items-center gap-2 flex-wrap">
          <h3 class="font-extrabold text-sm sm:text-base text-white truncate">Day Counter</h3>
          <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${dOverride ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'} flex items-center gap-1 shrink-0">
            ${dOverride ? 'Manual Override' : (day < 1 ? 'Starts in ' + (1 - day) + 'd' : day > w.total ? 'Finished' : 'Day ' + day + ' / ' + w.total)}
          </span>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button type="button" class="settings-arrow-btn p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition" aria-label="Expand settings card" aria-expanded="${isExp}" onclick="window.ArcSettingsAccordion && window.ArcSettingsAccordion.toggle('p20-day')">
          <i class="fa-solid fa-chevron-down text-xs transition-transform duration-300 settings-chevron-icon ${isExp ? 'rotate-180' : ''}"></i>
        </button>
      </div>
    </div>
    <div class="arc-fluid-accordion ${isExp ? 'expanded' : 'hidden'} pt-3 border-t border-slate-800/80 mt-3">
      <div class="space-y-3">
        <p class="text-[11px] text-slate-400">Follows your device clock. Active arc: ${f(w.start)} to ${f(w.end)}. Change the dates under Arc &amp; timeline below.</p>
        <div class="text-xs text-slate-200 font-mono">${(day<1?'Starts in '+(1-day)+'d':day>w.total?'Arc finished':'Day '+day+' / '+w.total)} · ${f(t)} <span class="${(dOverride?'text-amber-300':'text-emerald-400')}">${(dOverride?'manual override':'live')}</span></div>
        <div class="flex flex-wrap items-center gap-2">
          <input id="p20-day-in" type="number" inputmode="numeric" min="1" max="${w.total}" value="${(dOverride||'')}" placeholder="Day 1-${w.total}" aria-label="Manual day override" class="${IN} w-28">
          <button type="button" onclick="setDayOverride(document.getElementById('p20-day-in').value)" class="${BTN}">Jump to day</button>
          <button type="button" onclick="clearDayOverride()" ${(dOverride?'':'disabled ')}class="${BTN}">Back to today</button>
        </div>
      </div>
    </div>
  `;
 };

 window.renderHabitManager=function(force){
  const box=$('p20-hm');if(!box)return;
  const a=document.activeElement;
  if(!force&&box.contains(a)&&a.tagName==='INPUT')return;
  const habits=(window.state&&window.state.habits)?window.state.habits:[];
  const n=habits.length;
  box.innerHTML=n?habits.map((h,i)=>
   '<div class="hm-row flex items-center gap-1.5 p-2 rounded-xl bg-slate-950/80 border border-slate-800 '+GLOW+'">'+
   '<div class="flex flex-col shrink-0"><button type="button" onclick="p20.mv(\''+h.id+'\',-1)" '+(i?'':'disabled ')+'aria-label="Move '+esc(h.name)+' up" class="px-1.5 py-0.5 text-[10px] leading-none text-slate-400 hover:text-cyan-300 disabled:opacity-30">\u25B2</button>'+
   '<button type="button" onclick="p20.mv(\''+h.id+'\',1)" '+(i<n-1?'':'disabled ')+'aria-label="Move '+esc(h.name)+' down" class="px-1.5 py-0.5 text-[10px] leading-none text-slate-400 hover:text-cyan-300 disabled:opacity-30">\u25BC</button></div>'+
   '<input value="'+esc(h.name)+'" maxlength="80" onchange="p20.rn(\''+h.id+'\',this.value)" aria-label="Habit name" class="'+IN+' flex-1 min-w-0">'+
   '<select onchange="p20.ct(\''+h.id+'\',this.value)" aria-label="Category" class="'+IN+' hidden sm:block">'+catOpts(h.category)+'</select>'+
   '<select onchange="p20.wt(\''+h.id+'\',this.value)" aria-label="Weight" class="'+IN+' shrink-0 text-xs py-1 px-1.5 w-16 sm:w-20">'+wOpts(h.weight)+'</select>'+
   '<button type="button" onclick="if(window.ArcHabitAnalytics)ArcHabitAnalytics.openDrawer(\''+h.id+'\');if(typeof event!==\'undefined\'&&event)event.stopPropagation();" title="Inspect Habit Heatmap & Graphs" class="w-8 h-8 rounded-xl bg-slate-800/90 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400/60 text-slate-300 hover:text-cyan-300 grid place-items-center transition active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"><i class="fa-solid fa-chart-line text-xs"></i></button>'+
   '<button type="button" onclick="p20.rm(\''+h.id+'\')" aria-label="Delete '+esc(h.name)+'" class="p-1.5 text-sm text-slate-500 hover:text-rose-400 shrink-0">\u2715</button></div>').join('')
   :'<div class="text-xs text-slate-500 italic">No habits yet. Add one below.</div>';
 };

 window.p20={
  find:id=>(window.state&&window.state.habits?window.state.habits.find(h=>h.id===id):null),
  mv(id,d){
    const a=window.state?window.state.habits:[];
    const i=a.findIndex(h=>h.id===id),j=i+d;
    if(i<0||j<0||j>=a.length)return;
    [a[i],a[j]]=[a[j],a[i]];
    if(window.playSfx)window.playSfx('click');
    commit();
  },
  rn(id,v){
    const h=this.find(id);v=v.trim();if(!h)return;
    if(!v){if(window.showToast)window.showToast('Habit name cannot be empty');renderHabitManager(true);return}
    h.name=v;commit('Habit renamed');
  },
  ct(id,v){const h=this.find(id);if(h){h.category=v;commit()}},
  wt(id,v){const h=this.find(id);if(h){h.weight=parseInt(v,10)||1;commit('Weight updated')}},
  rm(id){
    const h=this.find(id);if(!h||!confirm('Delete "'+h.name+'"? Past check-ins stay saved, but this habit stops counting toward scores.'))return;
    if(window.state&&window.state.habits) window.state.habits=window.state.habits.filter(x=>x.id!==id);
    if(window.playSfx)window.playSfx('click');
    commit('Habit removed');
    if(window.renderHabitManager)renderHabitManager(true);
  }
 };

 function rollover(){
  if(window.syncDayState) window.syncDayState();
  lastKey=window.getTodayKey?window.getTodayKey():new Date().toISOString().split('T')[0];
  const t=(window.getEffectiveToday?window.getEffectiveToday():new Date());
  if(typeof window!=='undefined'){
    window.calendarCurrentDate=new Date(t.getFullYear(),t.getMonth(),1);
    window.selectedCalendarDateStr=lastKey;
  }
  if(window.renderHabits) window.renderHabits();
  renderDayControl();
 }
 window.setDayOverride=function(v){
  const w=(window.getArcWindow?window.getArcWindow():{total:90}),n=parseInt(v,10);
  if(!(n>=1&&n<=w.total)){if(window.showToast)window.showToast('Pick a day between 1 and '+w.total);return}
  if(typeof window!=='undefined') window.dayOverride=n;
  try{localStorage.setItem('arc_day_override',String(n))}catch(e){}
  if(window.playSfx)window.playSfx('click');
  rollover();
  if(window.showToast)window.showToast('Jumped to day '+n);
 };
 window.clearDayOverride=function(){
  if(typeof window!=='undefined') window.dayOverride=null;
  try{localStorage.removeItem('arc_day_override')}catch(e){}
  if(window.playSfx)window.playSfx('click');
  rollover();
  if(window.showToast)window.showToast('Following today\u2019s date');
 };
 window.openHabitManager=function(){
  if(window.switchTab) window.switchTab('rules');
  setTimeout(()=>{const e=$('p20-habit-manager');if(e)e.scrollIntoView({behavior:'smooth',block:'start'})},60);
 };

 /* midnight rollover while the app stays open */
 const tick=()=>{
   const curKey=window.getTodayKey?window.getTodayKey():null;
   if(curKey&&curKey!==lastKey)rollover();
 };
 setInterval(tick,30000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick()});
 renderDayControl();renderHabitManager(true);
 if(window.ArcGoogleSync&&typeof window.ArcGoogleSync.renderUi==='function')window.ArcGoogleSync.renderUi();
})();

try {
  const savedScale = localStorage.getItem('arc_ui_font_scale');
  if (savedScale && savedScale !== '100') {
    document.documentElement.style.fontSize = savedScale + '%';
  }
} catch(e) {}
