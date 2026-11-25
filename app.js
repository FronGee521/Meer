"use strict";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const T={
ru:{tuner:"Тюнер",metro:"Метроном",settings:"Настройки",chrom:"Хроматический тюнер",guitar:"Гитарный тюнер",ready:"Готов",live:"Слушаю",hint:"Сыграйте открытую струну",start:"Начать настройку",stop:"Остановить",gmode:"Гитара",cmode:"Хроматика",strings:"Струны",std:"Стандартный строй",reset:"Сбросить отметки",tap:"Тап-темп",accent:"Акцент: вкл",noacc:"Акцент: выкл",nosig:"Нет сигнала",perfect:"Идеально настроено",near:"Почти — ещё чуть-чуть",low:"Низко — подтяните",high:"Высоко — ослабьте",tuned:"Струна настроена",cleared:"Отметки сброшены",micerr:"Нет доступа к микрофону. Разрешите его в настройках браузера.",language:"Язык",theme:"Тема",dark:"Тёмная",light:"Светлая",system:"Авто",notation:"Обозначение нот",latin:"C D E",solfege:"До Ре Ми",ref:"Эталон A4",prec:"Допуск настройки",cal:"Калибровка",sound:"Звук метронома",classic:"Классика",wood:"Дерево"},
en:{tuner:"Tuner",metro:"Metronome",settings:"Settings",chrom:"Chromatic tuner",guitar:"Guitar tuner",ready:"Ready",live:"Listening",hint:"Play an open string",start:"Start tuning",stop:"Stop",gmode:"Guitar",cmode:"Chromatic",strings:"Strings",std:"Standard tuning",reset:"Reset marks",tap:"Tap tempo",accent:"Accent: on",noacc:"Accent: off",nosig:"No signal",perfect:"In tune",near:"Almost there",low:"Flat — tighten",high:"Sharp — loosen",tuned:"String tuned",cleared:"Marks cleared",micerr:"Microphone blocked. Allow it in browser settings.",language:"Language",theme:"Theme",dark:"Dark",light:"Light",system:"Auto",notation:"Note names",latin:"C D E",solfege:"Do Re Mi",ref:"Reference A4",prec:"In-tune tolerance",cal:"Calibration",sound:"Click sound",classic:"Classic",wood:"Wood"}};
Object.assign(T.ru,{instrument:"Инструмент",i_guitar:"Гитара",i_bass:"Бас-гитара",i_ukulele:"Укулеле",i_chrom:"Хроматический тюнер",done:"Настроено",of:"из",all:"Все струны настроены"});Object.assign(T.en,{instrument:"Instrument",i_guitar:"Guitar",i_bass:"Bass guitar",i_ukulele:"Ukulele",i_chrom:"Chromatic tuner",done:"Tuned",of:"of",all:"All strings are tuned"});
Object.assign(T.ru,{chords:"Аккорды",strum:"Сыграть",root:"Нота",type:"Тип",goal:"Цель на день",stage:"Сцена",min:"мин",series:"Серия",days:"дн.",today:"сегодня",goalhit:"Цель на сегодня выполнена!"});Object.assign(T.en,{chords:"Chords",strum:"Strum",root:"Root",type:"Type",goal:"Daily goal",stage:"Stage",min:"min",series:"Streak",days:"d",today:"today",goalhit:"Daily goal reached!"});
Object.assign(T.ru,{c_basic:"Базовые",c_seventh:"Септаккорды",c_power:"Квинтаккорды",c_barre:"Баре",c_other:"Другое"});Object.assign(T.en,{c_basic:"Basic",c_seventh:"Sevenths",c_power:"Power chords",c_barre:"Barre",c_other:"Other"});
Object.assign(T.ru,{i_next:"Дальше",i_go:"Поехали!",i_skip:"Пропустить",i_replay:"Обучение с Meerik",i0:"Привет! Я Meerik. Покажу, что тут есть, это быстро.",i1:"Жми «Начать настройку» и играй открытую струну.",i2:"Стрелка в центре — строй точный. Левее — низко, правее — высоко.",i3:"Крути кольцо или жми «Тап-темп», выбирай размер и запускай.",i4:"Выбери категорию и тапни диаграмму — я сыграю аккорд.",i5:"Строй, ноты, тема и язык живут в настройках. Обучение можно включить снова.",i6:"Готово! Играй, а я буду рядом."});
Object.assign(T.en,{i_next:"Next",i_go:"Let's go!",i_skip:"Skip",i_replay:"Tour with Meerik",i0:"Hi! I'm Meerik. Here's a quick tour.",i1:"Tap Start tuning and play an open string.",i2:"Needle in the middle means in tune. Left is flat, right is sharp.",i3:"Drag the ring or tap the tempo, pick a meter and go.",i4:"Pick a category and tap the diagram — I'll play the chord.",i5:"Tuning, note names, theme and language live in settings. You can replay this tour.",i6:"All set! Play on, I'll be around."});
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(_){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}};
const S=Object.assign({lang:"ru",theme:"dark",notation:"latin",ref:440,prec:3,cal:0,sound:"classic",vol:70,inst:"guitar",intro:0,goal:3,cr:0,ct:"maj",bpm:120,meter:"4/4",accent:1},store.get("tm4",{}));
const tuned=new Set(),save=()=>store.set("tm4",S);
const t=k=>T[S.lang][k]??k,toast=m=>{const e=$("#toast");e.textContent=m;e.classList.add("show");clearTimeout(toast.h);toast.h=setTimeout(()=>e.classList.remove("show"),2400)};
let ctx;const ac=()=>ctx||(ctx=new(window.AudioContext||window.webkitAudioContext)());
const NL=["C","C♯","D","D♯","E","F","F♯","G","G♯","A","A♯","B"],NS=["До","До♯","Ре","Ре♯","Ми","Фа","Фа♯","Соль","Соль♯","Ля","Ля♯","Си"];
const noteName=m=>(S.notation==="latin"?NL:NS)[((m%12)+12)%12],oct=m=>Math.floor(m/12)-1,mf=m=>S.ref*2**((m-69)/12);

/* ---------- Pitch detection (YIN) ---------- */
function yin(buf,sr,fmin=60){
 let e=0;for(let i=0;i<buf.length;i++)e+=buf[i]*buf[i];if(Math.sqrt(e/buf.length)<.008)return -1;
 const maxT=Math.floor(sr/fmin),minT=Math.floor(sr/520),W=Math.min(1536,buf.length-maxT-2),d=new Float32Array(maxT+2);
 for(let tau=1;tau<=maxT;tau++){let s=0;for(let i=0;i<W;i++){const x=buf[i]-buf[i+tau];s+=x*x}d[tau]=s}
 let run=0;for(let tau=1;tau<=maxT;tau++){run+=d[tau];d[tau]=run?d[tau]*tau/run:1}
 let tau=minT;while(tau<maxT){if(d[tau]<.13){while(tau+1<maxT&&d[tau+1]<d[tau])tau++;break}tau++}
 if(tau>=maxT||d[tau]>=.13)return -1;
 const a=d[tau-1],b=d[tau],c=d[tau+1],den=2*(2*b-a-c);return sr/(tau+(den?(c-a)/den:0));
}

/* ---------- Tuner ---------- */
const INST={guitar:[40,45,50,55,59,64],bass:[28,33,38,43],ukulele:[67,60,64,69]},ST=()=>INST[S.inst]||[];
let run=false,stream,an,buf,wl,hist=[],miss=0,hold=null,drift=null,lastA=0,target=0,cur=0,selStr=-1,raf;
function drawGauge(){let h="";for(let i=-10;i<=10;i++){const a=i*9*Math.PI/180,mj=i%2===0,r1=i?(mj?116:123):112,x=v=>(160+Math.sin(a)*v).toFixed(1),y=v=>(160-Math.cos(a)*v).toFixed(1);h+=`<line class="tk${i===0?" z":mj?" m":""}" x1="${x(r1)}" y1="${y(r1)}" x2="${x(131)}" y2="${y(131)}"/>`;if(i&&i%5===0)h+=`<text x="${x(98)}" y="${+y(98)+3}">${i>0?"+":"−"}${Math.abs(i*5)}</text>`}$("#ticks").innerHTML=h;{const g=S.prec*1.8*Math.PI/180,x=v=>(160+Math.sin(v)*140).toFixed(1),y=(160-Math.cos(g)*140).toFixed(1);$("#zone").setAttribute("d",`M${x(-g)} ${y}A140 140 0 0 1 ${x(g)} ${y}`)}}
function renderStrings(){const st=ST(),n=st.length;$("#str-card").hidden=!n;if(!n)return;const el=$("#strings");el.style.setProperty("--n",n);el.innerHTML=st.map((m,i)=>`<button data-i="${i}" class="${tuned.has(i)?"ok":""}${selStr===i?" sel":""}" aria-label="${n-i}: ${noteName(m)}${oct(m)}"><b>${noteName(m)}</b><small>${n-i}</small></button>`).join("");$("#str-count").textContent=`${t("done")} ${tuned.size} ${t("of")} ${n}`}
function setStatus(s,ok){$("#status span").textContent=s;$("#status").classList.toggle("ok",!!ok)}
function idle(){hold=drift=null;target=0;$("#note").textContent="—";$("#note").parentElement.classList.add("idle");$("#oct").textContent="";$("#hz").textContent="— Hz";$("#cents").textContent="0 ¢";setStatus(run?t("nosig"):t("hint"));document.body.classList.remove("good")}
function analyse(ts){
 an.getFloatTimeDomainData(buf);const f=yin(buf,ctx.sampleRate,S.inst==="bass"?32:60);
 if(f>0){hist.push(f);if(hist.length>5)hist.shift();miss=0}else if(++miss>6)hist=[];
 if(!hist.length)return idle();
 const p=[...hist].sort((x,y)=>x-y)[hist.length>>1]*2**(S.cal/1200),st=ST();let m,si=-1,c=1e9;
 st.forEach((sm,i)=>{const cc=1200*Math.log2(p/mf(sm));if(Math.abs(cc)<Math.abs(c)){c=cc;si=i}});
 if(si>=0&&Math.abs(c)<=200)m=st[si];else{si=-1;m=Math.round(12*Math.log2(p/S.ref)+69)}
 const cents=Math.round(1200*Math.log2(p/mf(m))),good=Math.abs(cents)<=S.prec;
 $("#note").parentElement.classList.remove("idle");$("#note").textContent=noteName(m);$("#oct").textContent=oct(m);$("#hz").textContent=p.toFixed(1)+" Hz";$("#cents").textContent=(cents>0?"+":"")+cents+" ¢";
 target=Math.max(-50,Math.min(50,cents));document.body.classList.toggle("good",good);
 setStatus(good?t("perfect"):Math.abs(cents)<=8?t("near"):cents<0?t("low"):t("high"),good);
 if(si>=0&&selStr!==si){selStr=si;renderStrings()}
 if(si<0){hold=drift=null;return}
 if(good){drift=null;if(tuned.has(si))return;if(!hold||hold.i!==si)hold={i:si,t:ts};else if(ts-hold.t>700){tuned.add(si);hold=null;renderStrings();toast(t("tuned")+": "+noteName(m)+oct(m));chime();navigator.vibrate?.(40);if(tuned.size===st.length)setTimeout(()=>{toast(t("all"));chime()},1500)}}
 else{hold=null;if(tuned.has(si)&&Math.abs(cents)>15){if(!drift||drift.i!==si)drift={i:si,t:ts};else if(ts-drift.t>900){tuned.delete(si);drift=null;renderStrings()}}else drift=null}
}
function frame(ts){if(!run)return;raf=requestAnimationFrame(frame);cur+=(target-cur)*.25;$("#needle").style.transform=`rotate(${cur*1.8}deg)`;if(ts-lastA>40){lastA=ts;analyse(ts)}}
async function startMic(){
 try{ac();await ctx.resume();stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
 an=ctx.createAnalyser();an.fftSize=S.inst==="bass"?8192:4096;an.smoothingTimeConstant=0;buf=new Float32Array(an.fftSize);ctx.createMediaStreamSource(stream).connect(an);
 run=true;hist=[];tuned.clear();selStr=-1;document.body.classList.add("mic");try{wl=await navigator.wakeLock?.request("screen")}catch(_){}ui();raf=requestAnimationFrame(frame)}
 catch(e){toast(t("micerr"))}
}
function stopMic(){run=false;cancelAnimationFrame(raf);stream?.getTracks().forEach(x=>x.stop());stream=null;wl?.release?.().catch(()=>{});wl=null;document.body.classList.remove("mic","good");target=0;cur=0;$("#needle").style.transform="";idle();ui()}
function onInst(){tuned.clear();selStr=-1;hist=[];hold=drift=null;if(an){an.fftSize=S.inst==="bass"?8192:4096;buf=new Float32Array(an.fftSize)}}
function tone(f,d=1.6,g=.22){const c=ac(),n=c.currentTime,o=c.createGain();o.gain.setValueAtTime(.0001,n);o.gain.exponentialRampToValueAtTime(g,n+.02);o.gain.exponentialRampToValueAtTime(.0001,n+d);o.connect(c.destination);[[1,1],[2,.35],[3,.15]].forEach(([k,a])=>{const x=c.createOscillator(),y=c.createGain();x.frequency.value=f*k;y.gain.value=a;x.connect(y).connect(o);x.start(n);x.stop(n+d+.05)})}
function chime(){try{tone(784,.5,.12);setTimeout(()=>tone(1046.5,.6,.1),110)}catch(_){}}
$("#strings").onclick=e=>{const b=e.target.closest("button");if(!b)return;selStr=+b.dataset.i;renderStrings();try{ac().resume();tone(mf(ST()[selStr]))}catch(_){}};
$("#start").onclick=()=>run?stopMic():startMic();
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

/* ---------- Chords ---------- */
const SH={E:{maj:[0,2,2,1,0,0],m:[0,2,2,0,0,0],7:[0,2,0,1,0,0],m7:[0,2,0,0,0,0],maj7:[0,2,1,1,0,0],sus4:[0,2,2,2,0,0],5:[0,2,2,-1,-1,-1]},A:{maj:[-1,0,2,2,2,0],m:[-1,0,2,2,1,0],7:[-1,0,2,0,2,0],m7:[-1,0,2,0,1,0],maj7:[-1,0,2,1,2,0],sus4:[-1,0,2,2,3,0],sus2:[-1,0,2,2,0,0],5:[-1,0,2,2,-1,-1]}};
const OPEN={"0:maj":[-1,3,2,0,1,0],"7:maj":[3,2,0,0,0,3],"2:maj":[-1,-1,0,2,3,2],"2:m":[-1,-1,0,2,3,1],"0:7":[-1,3,2,3,1,0],"2:7":[-1,-1,0,2,1,2],"7:7":[3,2,0,0,0,1],"11:7":[-1,2,1,2,0,2],"0:maj7":[-1,3,2,0,0,0],"2:maj7":[-1,-1,0,2,2,2],"7:maj7":[3,2,0,0,0,2],"5:maj7":[-1,-1,3,2,1,0],"2:sus2":[-1,-1,0,2,3,0],"2:sus4":[-1,-1,0,2,3,3]};
const IV={maj:[0,4,7],m:[0,3,7],7:[0,4,7,10],m7:[0,3,7,10],maj7:[0,4,7,11],sus2:[0,2,7],sus4:[0,5,7],5:[0,7]},TY=["maj","m","7","m7","maj7","sus2","sus4","5"],SUF={maj:"",m:"m",7:"7",m7:"m7",maj7:"maj7",sus2:"sus2",sus4:"sus4",5:"5"},rootName=r=>(S.notation==="latin"?NL:NS)[r];
function chord(r,ty){
 const o=OPEN[r+":"+ty];if(o)return{f:o};
 if(ty==="sus2"&&(r+3)%12>8)return chord((r+7)%12,"sus4");
 const E=SH.E[ty],A=SH.A[ty],fe=(r+8)%12,fa=(r+3)%12,e=E&&(!A||fe<fa),sh=e?E:A,b=e?fe:fa;
 return{f:sh.map(x=>x<0?-1:x+b),b,bar:b>0&&ty!=="5"?(e?[0,5]:[1,5]):null}}
function diag(c){
 const f=c.f,fr=f.filter(x=>x>0),lo=Math.min(...fr,99),hi=Math.max(...fr,0),st=hi<=5?1:lo,X=i=>30+i*28,cy=k=>50+(k-st)*32+16;let h="";
 for(let k=0;k<=5;k++)h+=`<line class="${k===0&&st===1?"d-n":"d-f"}" x1="30" x2="170" y1="${50+k*32}" y2="${50+k*32}"/>`;
 for(let i=0;i<6;i++)h+=`<line class="d-s" x1="${X(i)}" x2="${X(i)}" y1="50" y2="210"/>`;
 if(st>1)h+=`<text class="d-t" x="9" y="${cy(st)+5}">${st}</text>`;
 if(c.bar)h+=`<rect class="d-bar" x="${X(c.bar[0])-10}" y="${cy(c.b)-10}" width="${X(c.bar[1])-X(c.bar[0])+20}" height="20" rx="10"/>`;
 f.forEach((x,i)=>{h+=x>0?`<circle class="d-dot" cx="${X(i)}" cy="${cy(x)}" r="11"/>`:x===0?`<circle class="d-o" cx="${X(i)}" cy="34" r="6"/>`:`<text class="d-t" x="${X(i)}" y="40">×</text>`});
 return `<svg viewBox="0 0 200 222" aria-hidden="true">${h}</svg>`}
const CATS=[["basic",[[9,"maj"],[9,"m"],[0,"maj"],[2,"maj"],[2,"m"],[4,"maj"],[4,"m"],[7,"maj"]]],["seventh",[[9,"7"],[11,"7"],[0,"7"],[2,"7"],[4,"7"],[7,"7"],[9,"m7"],[4,"m7"],[0,"maj7"],[2,"maj7"],[5,"maj7"],[7,"maj7"]]],["power",[...Array(12).keys()].map(r=>[r,"5"])],["barre",[[5,"maj"],[5,"m"],[11,"maj"],[11,"m"],[0,"m"],[7,"m"],[6,"m"],[10,"maj"],[1,"m"],[8,"m"]]],["other",null]];
function renderChord(){
 {const cat=S.cc||"basic",C=CATS.find(x=>x[0]===cat);$("#cats").innerHTML=CATS.map(x=>`<button data-c="${x[0]}" class="${x[0]===cat?"on":""}">${t("c_"+x[0])}</button>`).join("");$("#cother").hidden=!!C[1];$("#cgrid").hidden=!C[1];
  if(C[1])$("#cgrid").innerHTML=C[1].map(([a,b])=>`<button data-r="${a}" data-t="${b}" class="${a===S.cr&&b===S.ct?"on":""}">${rootName(a)+SUF[b]}</button>`).join("")}const r=S.cr,ty=S.ct;$("#c-name").textContent=rootName(r)+SUF[ty];$("#c-notes").textContent=IV[ty].map(i=>rootName((r+i)%12)).join(" · ");$("#c-diag").innerHTML=diag(chord(r,ty));
 $("#roots").innerHTML=[...Array(12).keys()].map(i=>`<button data-r="${i}" class="${i===r?"on":""}">${rootName(i)}</button>`).join("");$("#ctypes").innerHTML=TY.map(k=>`<button data-t="${k}" class="${k===ty?"on":""}">${k==="maj"?"maj":SUF[k]}</button>`).join("")}
function strum(){const c=chord(S.cr,S.ct);lastAct=performance.now();try{ac().resume()}catch(_){}c.f.forEach((x,i)=>{if(x>=0)setTimeout(()=>tone(mf(INST.guitar[i]+x),1.5,.1),i*55)})}
$("#cats").onclick=e=>{const b=e.target.closest("button");if(!b)return;S.cc=b.dataset.c;const f=CATS.find(x=>x[0]===S.cc)[1];if(f){[S.cr,S.ct]=f[0]}save();renderChord()};
$("#cgrid").onclick=e=>{const b=e.target.closest("button");if(b){S.cr=+b.dataset.r;S.ct=b.dataset.t;save();renderChord()}};
$("#roots").onclick=e=>{const b=e.target.closest("button");if(b){S.cr=+b.dataset.r;save();renderChord()}};$("#ctypes").onclick=e=>{const b=e.target.closest("button");if(b){S.ct=b.dataset.t;save();renderChord()}};
$("#c-play").onclick=strum;$("#c-diag").onclick=strum;

/* ---------- Streak ---------- */
const P=store.get("tm4p",{}),dk=(d=new Date())=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"),fmt=s=>Math.floor(s/60)+":"+String(Math.floor(s%60)).padStart(2,"0");
let lastTick=performance.now(),lastAct=0;
function streak(){let n=0,d=new Date();const g=S.goal*60;if((P[dk(d)]||0)<g)d.setDate(d.getDate()-1);while((P[dk(d)]||0)>=g){n++;d.setDate(d.getDate()-1)}return n}
function updStreak(){const g=S.goal*60,td=P[dk()]||0,el=$("#streak");$("#sn").textContent=streak();el.classList.toggle("on",td>=g);el.style.setProperty("--p",Math.min(100,td/g*100)+"%")}
$("#streak").onclick=()=>toast(`🔥 ${t("series")}: ${streak()} ${t("days")} · ${t("today")} ${fmt(P[dk()]||0)} / ${S.goal}:00`);
setInterval(()=>{const now=performance.now(),dt=Math.min((now-lastTick)/1000,65);lastTick=now;if(!(run||playing||now-lastAct<45000))return;const k=dk(),g=S.goal*60,was=P[k]||0;P[k]=was+dt;
 if(was<g&&P[k]>=g){updStreak();toast(`🔥 ${t("goalhit")} ${t("series")}: ${streak()} ${t("days")}`);chime()}
 const old=dk(new Date(Date.now()-120*864e5));for(const x in P)if(x<old)delete P[x];store.set("tm4p",P);updStreak()},1000);

/* ---------- Meerik onboarding ---------- */
function meerik(p){const K="#141414",C="#f4ead8",O=(d,w)=>`<path d="${d}" fill="none" stroke="${C}" stroke-width="${w+5}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${K}" stroke-width="${w}" stroke-linecap="round"/>`,
 hand=(x,y,s)=>`<g transform="translate(${x} ${y})"><ellipse rx="11" ry="10" fill="${C}" stroke="${K}" stroke-width="2.5"/><circle cx="${-9*s}" cy="-3" r="4.5" fill="${C}" stroke="${K}" stroke-width="2"/></g>`,
 shoe=`<path d="M48 180C48 170 58 168 66 170C76 172 80 178 78 184C77 189 70 190 60 190H54C50 190 48 186 48 180Z" fill="${C}" stroke="${K}" stroke-width="2.5"/><path d="M56 176l10 2M55 182l10 2" stroke="${K}" stroke-width="2.2" stroke-linecap="round"/>`,
 L=p==="cheer"?["M30 74C10 70 4 54 10 40",10,34]:["M30 78C12 92 10 108 16 122",16,128],R=p==="idle"?["M130 78C148 92 150 108 144 122",144,128]:["M130 74C150 70 156 54 150 40",150,34];
 return `<svg viewBox="0 0 160 198" aria-hidden="true">${O("M68 128L64 170",8)}${O("M92 128L96 170",8)}${shoe}<g transform="translate(160 0) scale(-1 1)">${shoe}</g>${O(L[0],8)}${O(R[0],8)}
 <path d="M80 24C46 24 24 36 24 62C24 94 60 132 80 144C100 132 136 94 136 62C136 36 114 24 80 24Z" fill="${K}" stroke="${C}" stroke-width="4" stroke-linejoin="round"/>
 <ellipse cx="60" cy="66" rx="11" ry="16" fill="${C}"/><ellipse cx="62" cy="69" rx="6" ry="10" fill="${K}"/><ellipse cx="100" cy="66" rx="11" ry="16" fill="${C}"/><ellipse cx="98" cy="69" rx="6" ry="10" fill="${K}"/>
 <path d="M71 90Q80 99 89 90" fill="none" stroke="${C}" stroke-width="3.5" stroke-linecap="round"/>${hand(L[1],L[2],-1)}${hand(R[1],R[2],1)}</svg>`}
const IS=[["hi","tuner",null],["idle","tuner","#start"],["idle","tuner","#gauge"],["idle","metro","#ring"],["idle","chords","#cats"],["idle","tuner","#open-set"],["cheer","tuner",null]];let ii=0;
function intro(i){if(i>=IS.length)return endIntro();ii=i;const st=IS[i];show(st[1]);$$(".hl").forEach(e=>e.classList.remove("hl"));$("#mk").innerHTML=meerik(st[0]);$("#ibub").textContent=t("i"+i);
 const el=st[2]&&$(st[2]);if(el){el.classList.add("hl");el.scrollIntoView({block:"center",behavior:"smooth"})}else window.scrollTo({top:0,behavior:"smooth"});
 $("#ibk").hidden=false;$("#intro").classList.add("open");$("#idots").innerHTML=IS.map((_,k)=>`<i class="${k===i?"on":""}"></i>`).join("");$("#inext").textContent=i===IS.length-1?t("i_go"):t("i_next")}
function endIntro(){S.intro=1;save();$$(".hl").forEach(e=>e.classList.remove("hl"));$("#intro").classList.remove("open");$("#ibk").hidden=true;show("tuner");window.scrollTo(0,0)}
$("#inext").onclick=()=>intro(ii+1);$("#iskip").onclick=endIntro;

/* ---------- Settings & UI ---------- */
const CFG=[["inst","instrument",["guitar","bass","ukulele","chrom"],v=>t("i_"+v)],["lang","language",["ru","en"],v=>v==="ru"?"Русский":"English"],["theme","theme",["dark","light","stage","system"],v=>t(v)],["notation","notation",["latin","solfege"],v=>t(v)],["prec","prec",[1,2,3,5],v=>"±"+v+" ¢"],["sound","sound",["classic","wood"],v=>t(v)],["goal","goal",[1,3,5,10],v=>v+" "+t("min")]];
const NUM=[["ref","ref",415,466,v=>v+" Hz"],["cal","cal",-50,50,v=>(v>0?"+":"")+v+" ¢"]];let openRow=null;
function renderSet(){
 const item=(k,l,val,body)=>`<div class="acc-item${openRow===k?" open":""}"><button class="acc-head" data-o="${k}" aria-expanded="${openRow===k}"><span>${t(l)}</span><em>${val}</em><svg class="i"><use href="#i-chev"/></svg></button><div class="acc-body"><div><div class="acc-in">${body}</div></div></div></div>`;
 $("#sets").innerHTML=CFG.map(([k,l,o,f])=>item(k,l,f(S[k]),o.map(v=>`<button class="opt${S[k]==v?" on":""}" data-k="${k}" data-v="${v}"><span>${f(v)}</span><i></i></button>`).join(""))).join("")+`<div class="acc-item"><button class="acc-head" data-act="intro"><span>${t("i_replay")}</span><svg class="i"><use href="#i-chev"/></svg></button></div>`+NUM.map(([k,l,,,f])=>item(k,l,f(S[k]),`<div class="step"><button data-s="${k}" data-d="-1" aria-label="-">−</button><b>${f(S[k])}</b><button data-s="${k}" data-d="1" aria-label="+">+</button></div>`)).join("")}
$("#sets").onclick=e=>{const b=e.target.closest("button");if(!b)return;
 if(b.dataset.act){history.back();setTimeout(()=>intro(0),500);return}
 if(b.dataset.o){const it=b.parentElement,o=!it.classList.contains("open");$$(".acc-item").forEach(x=>x.classList.remove("open"));it.classList.toggle("open",o);$$(".acc-head").forEach(h=>h.setAttribute("aria-expanded",h===b&&o));openRow=o?b.dataset.o:null;return}
 if(b.dataset.k){const v=b.dataset.v,k=b.dataset.k;S[k]=isNaN(v)?v:+v;if(k==="inst")onInst()}
 else if(b.dataset.s){const k=b.dataset.s,[lo,hi]=k==="ref"?[415,466]:[-50,50];S[k]=Math.max(lo,Math.min(hi,S[k]+ +b.dataset.d))}else return;
 save();ui();renderSet()};
const sheet=$("#sheet");
function openSet(o){if(o){renderSet();history.pushState({s:1},"")}sheet.classList.toggle("open",o);sheet.setAttribute("aria-hidden",!o)}
$("#open-set").onclick=()=>openSet(true);$("#close-set").onclick=()=>history.back();
addEventListener("popstate",()=>{sheet.classList.remove("open");sheet.setAttribute("aria-hidden","true")});
function show(n){$$("main").forEach(m=>m.classList.toggle("on",m.id===n));$$("nav button").forEach(b=>b.classList.toggle("on",b.dataset.s===n));if(n!=="tuner"&&run)stopMic()}
$$("nav button").forEach(b=>b.onclick=()=>show(b.dataset.s));
function ui(){
 const th=S.theme==="system"?(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):S.theme;document.body.dataset.t=th;document.documentElement.lang=S.lang;
 document.querySelector('meta[name=theme-color]').content=th==="light"?"#f3e9d6":th==="stage"?"#000000":"#1b1a18";
 $$("[data-i]").forEach(e=>e.textContent=t(e.dataset.i));
 $("#mode-tag").textContent=t("i_"+S.inst);$("#live").textContent=run?t("live"):t("ready");$("#start span").textContent=run?t("stop"):t("start");$("#start").classList.toggle("on",run);
 if(!run)setStatus(t("hint"));
 $("#go").classList.toggle("on",playing);$("#go-i").setAttribute("href",playing?"#i-pause":"#i-play");$("#go").setAttribute("aria-label",playing?"Stop":"Start");
 $("#accent").textContent=S.accent?t("accent"):t("noacc");$("#accent").classList.toggle("on",!!S.accent);
 $$("#meters button").forEach(b=>b.classList.toggle("on",b.dataset.m===S.meter));$("#vol").value=S.vol;$("#vol-v").textContent=S.vol+"%";
 renderStrings();renderChord();updStreak();drawGauge();
}
dots();setBpm(S.bpm);ui();idle();
if(!S.intro)setTimeout(()=>intro(0),700);
{const q=new URLSearchParams(location.search).get("tab");if(["tuner","metro","chords"].includes(q))show(q)}
if("serviceWorker"in navigator&&(location.protocol==="https:"||location.hostname==="localhost"))addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
