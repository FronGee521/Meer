"use strict";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const T={
ru:{tuner:"Тюнер",metro:"Метроном",settings:"Настройки",chrom:"Хроматический тюнер",guitar:"Гитарный тюнер",ready:"Готов",live:"Слушаю",hint:"Сыграйте открытую струну",start:"Начать настройку",stop:"Остановить",gmode:"Гитара",cmode:"Хроматика",strings:"Струны",std:"Стандартный строй",reset:"Сбросить отметки",tap:"Тап-темп",accent:"Акцент: вкл",noacc:"Акцент: выкл",nosig:"Нет сигнала",perfect:"Идеально настроено",near:"Почти — ещё чуть-чуть",low:"Низко — подтяните",high:"Высоко — ослабьте",tuned:"Струна настроена",cleared:"Отметки сброшены",micerr:"Нет доступа к микрофону. Разрешите его в настройках браузера.",language:"Язык",theme:"Тема",dark:"Тёмная",light:"Светлая",system:"Авто",notation:"Обозначение нот",latin:"C D E",solfege:"До Ре Ми",ref:"Эталон A4",prec:"Допуск настройки, ¢",cal:"Калибровка, ¢",sound:"Звук метронома",classic:"Классика",wood:"Дерево"},
en:{tuner:"Tuner",metro:"Metronome",settings:"Settings",chrom:"Chromatic tuner",guitar:"Guitar tuner",ready:"Ready",live:"Listening",hint:"Play an open string",start:"Start tuning",stop:"Stop",gmode:"Guitar",cmode:"Chromatic",strings:"Strings",std:"Standard tuning",reset:"Reset marks",tap:"Tap tempo",accent:"Accent: on",noacc:"Accent: off",nosig:"No signal",perfect:"In tune",near:"Almost there",low:"Flat — tighten",high:"Sharp — loosen",tuned:"String tuned",cleared:"Marks cleared",micerr:"Microphone blocked. Allow it in browser settings.",language:"Language",theme:"Theme",dark:"Dark",light:"Light",system:"Auto",notation:"Note names",latin:"C D E",solfege:"Do Re Mi",ref:"Reference A4",prec:"In-tune tolerance, ¢",cal:"Calibration, ¢",sound:"Click sound",classic:"Classic",wood:"Wood"}};
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(_){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}};
const S=Object.assign({lang:"ru",theme:"dark",notation:"latin",ref:440,prec:3,cal:0,sound:"classic",vol:70,mode:"guitar",bpm:120,meter:"4/4",accent:1},store.get("tm4",{}));
const tuned=new Set(store.get("tm4t",[])),save=()=>store.set("tm4",S);
const t=k=>T[S.lang][k]??k,toast=m=>{const e=$("#toast");e.textContent=m;e.classList.add("show");clearTimeout(toast.h);toast.h=setTimeout(()=>e.classList.remove("show"),2400)};
let ctx;const ac=()=>ctx||(ctx=new(window.AudioContext||window.webkitAudioContext)());
const NL=["C","C♯","D","D♯","E","F","F♯","G","G♯","A","A♯","B"],NS=["До","До♯","Ре","Ре♯","Ми","Фа","Фа♯","Соль","Соль♯","Ля","Ля♯","Си"];
const noteName=m=>(S.notation==="latin"?NL:NS)[((m%12)+12)%12],oct=m=>Math.floor(m/12)-1,mf=m=>S.ref*2**((m-69)/12);
const STR=[40,45,50,55,59,64];

/* ---------- Pitch detection (YIN) ---------- */
function yin(buf,sr){
 let e=0;for(let i=0;i<buf.length;i++)e+=buf[i]*buf[i];if(Math.sqrt(e/buf.length)<.008)return -1;
 const maxT=Math.floor(sr/60),minT=Math.floor(sr/520),W=Math.min(1536,buf.length-maxT-2),d=new Float32Array(maxT+2);
 for(let tau=1;tau<=maxT;tau++){let s=0;for(let i=0;i<W;i++){const x=buf[i]-buf[i+tau];s+=x*x}d[tau]=s}
 let run=0;for(let tau=1;tau<=maxT;tau++){run+=d[tau];d[tau]=run?d[tau]*tau/run:1}
 let tau=minT;while(tau<maxT){if(d[tau]<.13){while(tau+1<maxT&&d[tau+1]<d[tau])tau++;break}tau++}
 if(tau>=maxT||d[tau]>=.13)return -1;
 const a=d[tau-1],b=d[tau],c=d[tau+1],den=2*(2*b-a-c);return sr/(tau+(den?(c-a)/den:0));
}

/* ---------- Tuner ---------- */
let run=false,stream,an,buf,wl,hist=[],miss=0,hold=null,lastA=0,target=0,cur=0,selStr=-1,raf;
function drawGauge(){let h="";for(let i=-10;i<=10;i++){const a=i*8*Math.PI/180,mj=i%2===0,r1=i?(mj?112:118):108,r2=124,x=v=>160+Math.sin(a)*v,y=v=>160-Math.cos(a)*v;h+=`<line class="tk${i===0?" z":mj?" m":""}" x1="${x(r1)}" y1="${y(r1)}" x2="${x(r2)}" y2="${y(r2)}"/>`;if(i%5===0)h+=`<text x="${x(94)}" y="${y(94)+3}">${i*5>0?"+":i*5<0?"−":""}${Math.abs(i*5)}</text>`}$("#ticks").innerHTML=h}
function renderStrings(){$("#strings").innerHTML=STR.map((m,i)=>`<button data-i="${i}" class="${tuned.has(i)?"ok":""}${selStr===i?" sel":""}" aria-label="${6-i}: ${noteName(m)}${oct(m)}"><b>${noteName(m)}</b><small>${6-i}</small></button>`).join("")}
function idle(){hold=null;target=0;$("#note").textContent="—";$("#oct").textContent="";$("#hz").textContent="— Hz";$("#cents").textContent="0 ¢";$("#status").textContent=run?t("nosig"):t("hint");document.body.classList.remove("good")}
function analyse(ts){
 an.getFloatTimeDomainData(buf);const f=yin(buf,ctx.sampleRate);
 if(f>0){hist.push(f);if(hist.length>5)hist.shift();miss=0}else if(++miss>6)hist=[];
 if(!hist.length)return idle();
 const p=[...hist].sort((x,y)=>x-y)[hist.length>>1]*2**(S.cal/1200);
 let m,si=-1,c=1e9;
 if(S.mode==="guitar"){STR.forEach((sm,i)=>{const cc=1200*Math.log2(p/mf(sm));if(Math.abs(cc)<Math.abs(c)){c=cc;si=i}});if(Math.abs(c)<=200)m=STR[si];else si=-1}
 if(si<0)m=Math.round(12*Math.log2(p/S.ref)+69);
 const cents=Math.round(1200*Math.log2(p/mf(m))),good=Math.abs(cents)<=S.prec;
 $("#note").textContent=noteName(m);$("#oct").textContent=oct(m);$("#hz").textContent=p.toFixed(1)+" Hz";$("#cents").textContent=(cents>0?"+":"")+cents+" ¢";
 target=Math.max(-50,Math.min(50,cents));document.body.classList.toggle("good",good);
 $("#status").textContent=good?t("perfect"):Math.abs(cents)<=8?t("near"):cents<0?t("low"):t("high");
 if(si>=0&&selStr!==si){selStr=si;renderStrings()}
 if(good&&si>=0){if(!hold||hold.i!==si)hold={i:si,t:ts};else if(ts-hold.t>700&&!tuned.has(si)){tuned.add(si);store.set("tm4t",[...tuned]);renderStrings();toast("✓ "+t("tuned")+": "+noteName(m)+oct(m));chime();navigator.vibrate?.(40)}}else hold=null;
}
function frame(ts){if(!run)return;raf=requestAnimationFrame(frame);cur+=(target-cur)*.25;$("#needle").style.transform=`rotate(${cur*1.6}deg)`;if(ts-lastA>40){lastA=ts;analyse(ts)}}
async function startMic(){
 try{ac();await ctx.resume();stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
 an=ctx.createAnalyser();an.fftSize=4096;an.smoothingTimeConstant=0;buf=new Float32Array(an.fftSize);ctx.createMediaStreamSource(stream).connect(an);
 run=true;hist=[];document.body.classList.add("mic");try{wl=await navigator.wakeLock?.request("screen")}catch(_){}ui();raf=requestAnimationFrame(frame)}
 catch(e){toast(t("micerr"))}
}
function stopMic(){run=false;cancelAnimationFrame(raf);stream?.getTracks().forEach(x=>x.stop());stream=null;wl?.release?.().catch(()=>{});wl=null;document.body.classList.remove("mic","good");target=0;cur=0;$("#needle").style.transform="";idle();ui()}
function tone(f,d=1.6,g=.22){const c=ac(),n=c.currentTime,o=c.createGain();o.gain.setValueAtTime(.0001,n);o.gain.exponentialRampToValueAtTime(g,n+.02);o.gain.exponentialRampToValueAtTime(.0001,n+d);o.connect(c.destination);[[1,1],[2,.35],[3,.15]].forEach(([k,a])=>{const x=c.createOscillator(),y=c.createGain();x.frequency.value=f*k;y.gain.value=a;x.connect(y).connect(o);x.start(n);x.stop(n+d+.05)})}
function chime(){try{tone(784,.5,.12);setTimeout(()=>tone(1046.5,.6,.1),110)}catch(_){}}
$("#strings").onclick=e=>{const b=e.target.closest("button");if(!b)return;selStr=+b.dataset.i;renderStrings();try{ac().resume();tone(mf(STR[selStr]))}catch(_){}};
$("#reset").onclick=()=>{tuned.clear();store.set("tm4t",[]);renderStrings();toast(t("cleared"))};
$("#start").onclick=()=>run?stopMic():startMic();
$("#mode-btn").onclick=()=>{S.mode=S.mode==="guitar"?"chrom":"guitar";save();ui()};
document.addEventListener("visibilitychange",()=>document.hidden&&run&&stopMic());

/* ---------- Metronome ---------- */
const M={"4/4":{n:4,g:[0]},"3/4":{n:3,g:[0]},"2/4":{n:2,g:[0]},"6/8":{n:6,g:[0,3]},"5/4":{n:5,g:[0,3]},"7/8":{n:7,g:[0,2,4]}};
let playing=false,timer,next=0,beat=0,q=[],vraf;
const tempoName=b=>b<60?"Largo":b<76?"Adagio":b<108?"Andante":b<120?"Moderato":b<156?"Allegro":b<176?"Vivace":"Presto";
function setBpm(v){S.bpm=Math.max(30,Math.min(250,Math.round(v)));const f=(S.bpm-30)/220,a=(135+270*f)*Math.PI/180;$("#bpm").textContent=S.bpm;$("#slider").value=S.bpm;$("#tname").textContent=tempoName(S.bpm);$("#r-prog").style.strokeDashoffset=100*(1-f);const k=$("#r-knob");k.setAttribute("cx",130+104*Math.cos(a));k.setAttribute("cy",130+104*Math.sin(a));$$("#presets button").forEach(b=>b.classList.toggle("on",+b.dataset.b===S.bpm));save()}
function dots(){$("#dots").innerHTML="<i></i>".repeat(M[S.meter].n)}
function click(time,lvl){const c=ac(),o=c.createOscillator(),g=c.createGain(),w=S.sound==="wood",fr=w?[620,900,1350]:[880,1175,1760];o.type=w?"triangle":"sine";o.frequency.value=fr[lvl];const pk=Math.max(.0001,S.vol/100*[.35,.6,.9][lvl]);g.gain.setValueAtTime(pk,time);g.gain.exponentialRampToValueAtTime(.0001,time+(w?.04:.07));o.connect(g).connect(c.destination);o.start(time);o.stop(time+.09)}
function sched(){const m=M[S.meter];while(next<ctx.currentTime+.15){click(next,S.accent?(beat===0?2:m.g.includes(beat)?1:0):1);q.push([next,beat]);next+=60/S.bpm;beat=(beat+1)%m.n}}
function vis(){if(!playing)return;vraf=requestAnimationFrame(vis);let b=-1;while(q.length&&q[0][0]<=ctx.currentTime)b=q.shift()[1];if(b>=0)$$("#dots i").forEach((d,i)=>{d.className=i===b?"on"+(b===0&&S.accent?" ac":""):""})}
async function startM(){ac();await ctx.resume();playing=true;beat=0;q=[];next=ctx.currentTime+.06;timer=setInterval(sched,25);sched();vis();ui()}
function stopM(){playing=false;clearInterval(timer);cancelAnimationFrame(vraf);dots();ui()}
$("#go").onclick=()=>playing?stopM():startM();
$("#slider").oninput=e=>setBpm(e.target.value);$("#m10").onclick=()=>setBpm(S.bpm-1);$("#p10").onclick=()=>setBpm(S.bpm+1);
$("#vol").oninput=e=>{S.vol=+e.target.value;$("#vol-v").textContent=S.vol+"%";save()};
$("#accent").onclick=()=>{S.accent^=1;save();ui()};
let taps=[];$("#tap").onclick=()=>{const n=performance.now();if(taps.length&&n-taps.at(-1)>2000)taps=[];taps.push(n);if(taps.length>7)taps.shift();if(taps.length>1)setBpm(60000/((taps.at(-1)-taps[0])/(taps.length-1)))};
const ring=$("#ring"),drag=e=>{const r=ring.getBoundingClientRect();let rel=(((Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2)*180/Math.PI)-135)%360+360)%360;if(rel>270)rel=rel<315?270:0;setBpm(30+rel/270*220)};
ring.onpointerdown=e=>{ring.setPointerCapture(e.pointerId);drag(e);ring.onpointermove=drag};ring.onpointerup=ring.onpointercancel=()=>ring.onpointermove=null;
$("#meters").innerHTML=Object.keys(M).map(k=>`<button data-m="${k}">${k}</button>`).join("");
$("#meters").onclick=e=>{const b=e.target.closest("button");if(!b)return;S.meter=b.dataset.m;save();beat=0;q=[];dots();ui()};
$("#presets").innerHTML=[60,90,120,160].map(b=>`<button data-b="${b}">${b}</button>`).join("");$("#presets").onclick=e=>{const b=e.target.closest("button");b&&setBpm(+b.dataset.b)};

/* ---------- Settings & UI ---------- */
const CFG=[["lang","language",[["ru","Русский"],["en","English"]]],["theme","theme",[["dark","dark"],["light","light"],["system","system"]]],["notation","notation",[["latin","latin"],["solfege","solfege"]]],["prec","prec",[[1,1],[2,2],[3,3],[5,5]]],["sound","sound",[["classic","classic"],["wood","wood"]]]];
function renderSet(){$("#sets").innerHTML=CFG.map(([k,l,o])=>`<div class="set"><label>${t(l)}</label><div class="seg">${o.map(([v,n])=>`<button data-k="${k}" data-v="${v}" class="${S[k]==v?"on":""}">${t(n)}</button>`).join("")}</div></div>`).join("")+[["ref",415,466,"Hz"],["cal",-50,50,"¢"]].map(([k,,,u])=>`<div class="set"><label>${t(k)}</label><div class="step"><button data-s="${k}" data-d="-1" aria-label="-">−</button><b>${k==="cal"&&S.cal>0?"+":""}${S[k]} ${u}</b><button data-s="${k}" data-d="1" aria-label="+">+</button></div></div>`).join("")}
$("#sets").onclick=e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.k){const v=b.dataset.v;S[b.dataset.k]=isNaN(v)?v:+v}else if(b.dataset.s){const k=b.dataset.s,[lo,hi]=k==="ref"?[415,466]:[-50,50];S[k]=Math.max(lo,Math.min(hi,S[k]+ +b.dataset.d))}else return;save();ui();renderSet()};
const sheet=$("#sheet"),openSet=o=>{sheet.classList.toggle("open",o);sheet.setAttribute("aria-hidden",!o);if(o)renderSet()};
$("#open-set").onclick=()=>openSet(true);$("#close-set").onclick=()=>openSet(false);sheet.onclick=e=>e.target===sheet&&openSet(false);
function show(n){$$("main").forEach(m=>m.classList.toggle("on",m.id===n));$$("nav button").forEach(b=>b.classList.toggle("on",b.dataset.s===n));if(n!=="tuner"&&run)stopMic()}
$$("nav button").forEach(b=>b.onclick=()=>show(b.dataset.s));
function ui(){
 const th=S.theme==="system"?(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):S.theme;document.body.dataset.t=th;document.documentElement.lang=S.lang;
 document.querySelector('meta[name=theme-color]').content=th==="light"?"#e9eff6":"#070b12";
 $$("[data-i]").forEach(e=>e.textContent=t(e.dataset.i));
 $("#mode-tag").textContent=S.mode==="guitar"?t("guitar"):t("chrom");$("#mode-btn").textContent=S.mode==="guitar"?t("cmode"):t("gmode");
 $("#live").textContent=run?t("live"):t("ready");$("#start span").textContent=run?t("stop"):t("start");$("#start").classList.toggle("on",run);
 if(!run)$("#status").textContent=t("hint");
 $("#go").classList.toggle("on",playing);$("#go-i").setAttribute("href",playing?"#i-pause":"#i-play");$("#go").setAttribute("aria-label",playing?"Stop":"Start");
 $("#accent").textContent=S.accent?t("accent"):t("noacc");$("#accent").classList.toggle("on",!!S.accent);
 $$("#meters button").forEach(b=>b.classList.toggle("on",b.dataset.m===S.meter));$("#vol").value=S.vol;$("#vol-v").textContent=S.vol+"%";
 renderStrings();
}
drawGauge();dots();setBpm(S.bpm);ui();
if("serviceWorker"in navigator&&(location.protocol==="https:"||location.hostname==="localhost"))addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
