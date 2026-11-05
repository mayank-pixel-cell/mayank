(function(){'use strict';
/* Web Audio autoplay policy: resume on every user gesture */
['pointerdown','touchend','keydown'].forEach(ev=>window.addEventListener(ev,()=>{try{initAudio()}catch(e){}},{passive:true,capture:true}));
/* Auto-commit state */
const commit=()=>{try{if(typeof window.saveToLocalStorage==='function')window.saveToLocalStorage()}catch(e){}};
document.addEventListener('visibilitychange',()=>{if(document.hidden)commit()});
window.addEventListener('pagehide',commit);window.addEventListener('beforeunload',commit);
/* Summer Showcase: swipe left/right */
const ov=document.getElementById('summer-showcase-overlay');
if(ov){let x0=0,y0=0,t0=0,on=false;
 ov.addEventListener('touchstart',e=>{if(e.touches.length!==1||e.target.closest('button,a,input,select,textarea,#showcase-dots-container')){on=false;return}const t=e.touches[0];x0=t.clientX;y0=t.clientY;t0=Date.now();on=true},{passive:true});
 ov.addEventListener('touchend',e=>{if(!on)return;on=false;if(ov.classList.contains('hidden'))return;const t=e.changedTouches[0],dx=t.clientX-x0,dy=t.clientY-y0;
  if(Date.now()-t0>800||Math.abs(dx)<50||Math.abs(dx)<Math.abs(dy)*1.5)return;
  if(dx<0){if(currentShowcaseIndex<showcaseSlides.length-1)nextShowcaseSlide()}else if(currentShowcaseIndex>0)prevShowcaseSlide()},{passive:true});
 ov.addEventListener('touchcancel',()=>{on=false},{passive:true})}
/* A11y: names, roles, keyboard activation, focus rings (also for dynamically rendered markup) */
const IC={'fa-xmark':'Close','fa-times':'Close','fa-play':'Play','fa-pause':'Pause','fa-chevron-left':'Previous','fa-chevron-right':'Next','fa-arrow-left':'Back','fa-arrow-right':'Next','fa-volume-high':'Toggle sound','fa-volume-xmark':'Toggle sound','fa-gear':'Settings','fa-sliders':'Settings','fa-trash':'Delete','fa-plus':'Add','fa-minus':'Remove','fa-download':'Download','fa-upload':'Upload','fa-share-nodes':'Share','fa-copy':'Copy','fa-pen':'Edit'};
const SEL='button,[role=button],[role=tab],[role=switch],a[href],input,select,textarea,summary,[onclick]';
const NAT=/^(BUTTON|A|INPUT|SELECT|TEXTAREA|SUMMARY)$/,FLD=/^(INPUT|SELECT|TEXTAREA)$/;
const RING=['focus-visible:outline-none','focus-visible:ring-2','focus-visible:ring-cyan-400'];
const txt=n=>(n.textContent||'').replace(/\s+/g,' ').trim();
function label(n){
 const oc=n.getAttribute('onclick')||'';
 if(n.classList.contains('calendar-day-card')){const m=oc.match(/(\d{4}-\d{2}-\d{2})/);if(m){const d=new Date(m[1]+'T12:00:00');return (isNaN(d)?m[1]:d.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'}))+(txt(n)?'. '+txt(n):'')}}
 if(FLD.test(n.tagName))return n.title||n.getAttribute('placeholder')||'';
 if(txt(n))return '';
 const t=n.getAttribute('title');if(t)return t;
 const i=n.querySelector('i[class*="fa-"]');if(i){for(const c of i.classList)if(IC[c])return IC[c]}
 const m=oc.match(/showToast\('([^']+)'/);return m?m[1]:'';
}
function fix(root){
 if(!root||root.nodeType!==1)return;
 const list=root.matches(SEL)?[root]:[];root.querySelectorAll(SEL).forEach(n=>list.push(n));
 for(const n of list){
  const l=(n.hasAttribute('aria-label')||n.hasAttribute('aria-labelledby'))?'':label(n);
  if(!NAT.test(n.tagName)){
   if(n.querySelector('button,a[href],input,select,textarea')||!(l||txt(n)||n.hasAttribute('aria-label')))continue;
   if(!n.hasAttribute('role'))n.setAttribute('role','button');
   if(!n.hasAttribute('tabindex'))n.setAttribute('tabindex','0');
  }
  if(l&&!(FLD.test(n.tagName)&&n.labels&&n.labels.length))n.setAttribute('aria-label',l);
  n.classList.add(...RING);
 }
}
document.addEventListener('keydown',e=>{const t=e.target;if((e.key==='Enter'||e.key===' ')&&t&&t.matches&&t.matches('[role=button]:not(button):not(a):not(input)')){e.preventDefault();t.click()}});
let q=[],tm=0;const flush=()=>{tm=0;const a=q;q=[];a.forEach(fix)};
/* App code reassigns className on some controls (mute toggle, arc logo, tabs) - restore the focus ring when that happens */
new MutationObserver(ms=>{for(const m of ms){
 if(m.type==='attributes'){const n=m.target;if(n.nodeType===1&&n.matches(SEL)&&!n.classList.contains('focus-visible:ring-2'))n.classList.add(...RING);continue}
 m.addedNodes.forEach(n=>{if(n.nodeType===1)q.push(n)})}
 if(!tm)tm=setTimeout(flush,60)}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
fix(document.body);
})();
