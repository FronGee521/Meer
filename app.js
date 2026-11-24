"use strict";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const T={
ru:{tuner:"Тюнер",metro:"Метроном",settings:"Настройки",chrom:"Хроматический тюнер",guitar:"Гитарный тюнер",ready:"Готов",live:"Слушаю",hint:"Сыграйте открытую струну",start:"Начать настройку",stop:"Остановить",gmode:"Гитара",cmode:"Хроматика",strings:"Струны",std:"Стандартный строй",reset:"Сбросить отметки",tap:"Тап-темп",accent:"Акцент: вкл",noacc:"Акцент: выкл",nosig:"Нет сигнала",perfect:"Идеально настроено",near:"Почти — ещё чуть-чуть",low:"Низко — подтяните",high:"Высоко — ослабьте",tuned:"Струна настроена",cleared:"Отметки сброшены",micerr:"Нет доступа к микрофону. Разрешите его в настройках браузера.",language:"Язык",theme:"Тема",dark:"Тёмная",light:"Светлая",system:"Авто",notation:"Обозначение нот",latin:"C D E",solfege:"До Ре Ми",ref:"Эталон A4",prec:"Допуск настройки",cal:"Калибровка",sound:"Звук метронома",classic:"Классика",wood:"Дерево"},
en:{tuner:"Tuner",metro:"Metronome",settings:"Settings",chrom:"Chromatic tuner",guitar:"Guitar tuner",ready:"Ready",live:"Listening",hint:"Play an open string",start:"Start tuning",stop:"Stop",gmode:"Guitar",cmode:"Chromatic",strings:"Strings",std:"Standard tuning",reset:"Reset marks",tap:"Tap tempo",accent:"Accent: on",noacc:"Accent: off",nosig:"No signal",perfect:"In tune",near:"Almost there",low:"Flat — tighten",high:"Sharp — loosen",tuned:"String tuned",cleared:"Marks cleared",micerr:"Microphone blocked. Allow it in browser settings.",language:"Language",theme:"Theme",dark:"Dark",light:"Light",system:"Auto",notation:"Note names",latin:"C D E",solfege:"Do Re Mi",ref:"Reference A4",prec:"In-tune tolerance",cal:"Calibration",sound:"Click sound",classic:"Classic",wood:"Wood"}};
Object.assign(T.ru,{instrument:"Инструмент",i_guitar:"Гитара",i_bass:"Бас-гитара",i_ukulele:"Укулеле",i_chrom:"Хроматический тюнер",done:"Настроено",of:"из",all:"Все струны настроены"});Object.assign(T.en,{instrument:"Instrument",i_guitar:"Guitar",i_bass:"Bass guitar",i_ukulele:"Ukulele",i_chrom:"Chromatic tuner",done:"Tuned",of:"of",all:"All strings are tuned"});
Object.assign(T.ru,{chords:"Аккорды",strum:"Сыграть",root:"Нота",type:"Тип",goal:"Цель на день",stage:"Сцена",min:"мин",series:"Серия",days:"дн.",today:"сегодня",goalhit:"Цель на сегодня выполнена!"});Object.assign(T.en,{chords:"Chords",strum:"Strum",root:"Root",type:"Type",goal:"Daily goal",stage:"Stage",min:"min",series:"Streak",days:"d",today:"today",goalhit:"Daily goal reached!"});
Object.assign(T.ru,{learn:"Уроки",l_min:"Минута",l_best:"Рекорд",l_minhint:"60 секунд, максимум аккордов. Каждые 3 аккорда дают +5 секунд.",l_start:"Начать",l_next:"Дальше",l_again:"Ещё раз",l_skip:"Пропустить",l_listen:"Слушаю…",l_hold:"Держи…",l_slow:"Слишком медленно — не засчитано",l_done:"Урок пройден!",l_fail:"Не получилось, попробуй ещё",l_change:"Связка",l_sprint:"Минутка",l_melody:"Мелодия · 1 струна",l_chords:"аккордов",sec:"с",l_mod1:"Первые аккорды",l_mod2:"Классика",l_d_chords:"Играй аккорды по очереди и держи звучание около полсекунды.",l_d_change:"Меняй аккорды быстро: на смену даётся {x} с, иначе она не засчитается. Нужно {need} из {n}.",l_d_sprint:"60 секунд. Играй как можно больше аккордов: каждые 3 аккорда дают +5 секунд.",l_d_melody:"Босс! Сыграй мелодию на одной струне быстрее, чем за {time} с. Лады: {fr}.",l_str:"-я струна"});
Object.assign(T.en,{learn:"Lessons",l_min:"One minute",l_best:"Best",l_minhint:"60 seconds, as many chords as you can. Every 3 chords add 5 seconds.",l_start:"Start",l_next:"Continue",l_again:"Try again",l_skip:"Skip",l_listen:"Listening…",l_hold:"Hold it…",l_slow:"Too slow — not counted",l_done:"Lesson complete!",l_fail:"Not this time, try again",l_change:"Switch",l_sprint:"Sprint",l_melody:"Melody · 1 string",l_chords:"chords",sec:"s",l_mod1:"First chords",l_mod2:"Classics",l_d_chords:"Play the chords one by one and hold each for half a second.",l_d_change:"Switch chords fast: you get {x} s per change, slower changes don't count. Need {need} of {n}.",l_d_sprint:"60 seconds. Play as many chords as you can: every 3 chords add 5 seconds.",l_d_melody:"Boss! Play the melody on one string in under {time} s. Frets: {fr}.",l_str:" string"});
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(_){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}};
const S=Object.assign({lang:"ru",theme:"dark",notation:"latin",ref:440,prec:3,cal:0,sound:"classic",vol:70,inst:"guitar",goal:3,cr:0,ct:"maj",bpm:120,meter:"4/4",accent:1},store.get("tm4",{}));
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
function drawGauge(){let h="";for(let i=-10;i<=10;i++){const a=i*9*Math.PI/180,mj=i%2===0,r1=i?(mj?116:123):112,x=v=>(160+Math.sin(a)*v).toFixed(1),y=v=>(160-Math.cos(a)*v).toFixed(1);h+=`<line class="tk${i===0?" z":mj?" m":""}" x1="${x(r1)}" y1="${y(r1)}" x2="${x(131)}" y2="${y(131)}"/>`;if(i&&i%5===0)h+=`<text x="${x(98)}" y="${+y(98)+3}">${i>0?"+":"−"}${Math.abs(i*5)}</text>`}$("#ticks").innerHTML=h}
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
function renderChord(){const r=S.cr,ty=S.ct;$("#c-name").textContent=rootName(r)+SUF[ty];$("#c-notes").textContent=IV[ty].map(i=>rootName((r+i)%12)).join(" · ");$("#c-diag").innerHTML=diag(chord(r,ty));
 $("#roots").innerHTML=[...Array(12).keys()].map(i=>`<button data-r="${i}" class="${i===r?"on":""}">${rootName(i)}</button>`).join("");$("#ctypes").innerHTML=TY.map(k=>`<button data-t="${k}" class="${k===ty?"on":""}">${k==="maj"?"maj":SUF[k]}</button>`).join("")}
function strum(){const c=chord(S.cr,S.ct);lastAct=performance.now();try{ac().resume()}catch(_){}c.f.forEach((x,i)=>{if(x>=0)setTimeout(()=>tone(mf(INST.guitar[i]+x),1.5,.1),i*55)})}
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

/* ---------- Learn ---------- */
const CH={Em:[4,"m"],Am:[9,"m"],E:[4,"maj"],A:[9,"maj"],D:[2,"maj"],C:[0,"maj"],G:[7,"maj"],Dm:[2,"m"]};
const chName=id=>rootName(CH[id][0])+SUF[CH[id][1]],chTones=id=>IV[CH[id][1]].map(i=>(CH[id][0]+i)%12);
const MODS=[{nodes:[
 {id:"1a",k:"chords",seq:["Em","Am","Em","Am"]},{id:"1b",k:"change",c:["Em","Am"],n:8,need:5,x:5},
 {id:"1c",k:"chords",seq:["D","A","D","A"]},{id:"1d",k:"change",c:["D","A"],n:8,need:5,x:5},
 {id:"1e",k:"sprint",pool:["Em","Am","D","A"],goal:6},{id:"1f",k:"melody",s:5,fr:[0,3,5,3,0,3,5,7],time:25,boss:1}]},
 {nodes:[{id:"2a",k:"chords",seq:["C","G","C","G"]},{id:"2b",k:"change",c:["C","G"],n:8,need:5,x:4},
 {id:"2c",k:"change",c:["C","G","Am","Em"],n:8,need:5,x:5},{id:"2d",k:"sprint",pool:["Em","Am","D","A","C","G"],goal:8},
 {id:"2e",k:"change",c:["G","D","Em","C"],n:12,need:8,x:3,boss:1}]}];
const ALL=MODS.flatMap(m=>m.nodes),L=store.get("tm4l",{done:{},best:0}),saveL=()=>store.set("tm4l",L);
function chromaFrom(fd,sr,N,ref){
 const bw=sr/N,k0=Math.ceil(70/bw),k1=Math.min(fd.length-2,Math.floor(1500/bw)),c=new Float32Array(12);let mx=-200;
 for(let k=k0;k<=k1;k++)if(fd[k]>mx)mx=fd[k];
 if(mx<-72)return null;
 for(let k=k0;k<=k1;k++){const a=fd[k-1],b=fd[k],d=fd[k+1];if(b<=a||b<d||b<mx-35)continue;
  const den=a-2*b+d,m=12*Math.log2((k+(den?.5*(a-d)/den:0))*bw/ref)+69,r=Math.round(m);if(Math.abs(m-r)>.3)continue;c[((r%12)+12)%12]+=10**(b/10)}
 const tot=c.reduce((x,y)=>x+y,0);return tot?c.map(v=>v/tot):null
}
function chordHit(c,T){
 if(!c)return false;const inC=T.reduce((s,p)=>s+c[p],0),have=T.filter(p=>c[p]>.07).length,out=Math.max(...c.map((v,i)=>T.includes(i)?0:v));
 return inC>=.74&&have>=3&&c[T[0]]>.1&&out<.15
}
const nTitle=n=>n.k==="chords"?n.seq.slice(0,2).map(chName).join(" · "):n.k==="change"?t("l_change")+" "+n.c.slice(0,3).map(chName).join("→")+(n.c.length>3?"…":""):n.k==="sprint"?t("l_sprint"):t("l_melody");
function renderPath(){const cur=ALL.findIndex(n=>!L.done[n.id]);
 $("#path").innerHTML=MODS.map((m,mi)=>`<div class="mod"><h3>${t("l_mod"+(mi+1))}</h3>`+m.nodes.map((n,i)=>{const g=ALL.indexOf(n),ok=L.done[n.id],open=g===0||!!L.done[ALL[g-1].id],ic=n.boss&&n.k==="melody"?"star":n.k==="chords"?"chords":n.k==="change"?"swap":n.k==="sprint"?"bolt":"star";
  return `<button class="node${ok?" ok":""}${g===cur?" cur":""}${n.boss?" boss":""}" style="--x:${[0,34,56,34,0,-34,-56,-34][i%8]}px" data-n="${n.id}"${open?"":" disabled"}><span class="nc"><svg class="i"><use href="#i-${ic}"/></svg></span><em>${n.boss?"★ ":""}${nTitle(n)}</em>${ok?`<small>${"★".repeat(ok)}</small>`:""}</button>`}).join("")+"</div>").join("");
 $("#lvl").textContent=ALL.filter(n=>L.done[n.id]).length+" / "+ALL.length;$("#best").textContent=L.best}
let X=null,LS,aC,aM,fd,mb;const LY=$("#lesson"),tgt=()=>X.n.k==="chords"?X.n.seq[X.i]:X.n.k==="change"?X.n.c[X.j%X.n.c.length]:X.tg,pick=()=>{const p=X.n.pool.filter(c=>c!==X.tg);return p[Math.random()*p.length|0]};
function stopLs(){LS?.getTracks().forEach(x=>x.stop());LS=null}
function panel(html,btns){const r=$("#l-res");r.innerHTML=html+`<div class="btns">${btns.filter(Boolean).map(([a,l],i)=>`<button class="${i?"sec":"pri"}" data-a="${a}">${l}</button>`).join("")}</div>`;r.hidden=false;$("#l-play").hidden=true}
async function openLesson(n,again){
 try{ac();await ctx.resume();LS=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}})}catch(e){return toast(t("micerr"))}
 const src=ctx.createMediaStreamSource(LS);aC=ctx.createAnalyser();aC.fftSize=16384;aC.smoothingTimeConstant=.4;aM=ctx.createAnalyser();aM.fftSize=4096;aM.smoothingTimeConstant=0;src.connect(aC);src.connect(aM);fd=new Float32Array(aC.frequencyBinCount);mb=new Float32Array(4096);
 X={n,i:0,j:0,cnt:0,ok:0,skip:0,score:0,bonus:0,hs:null,bad:0,st:false,run:false,shown:"",left:0};
 if(n.k==="sprint")X.tg=pick();if(n.k==="melody")X.seq=n.fr.map(f=>INST.guitar[n.s]+f);
 if(!again){history.pushState({l:1},"");LY.classList.add("open");LY.setAttribute("aria-hidden","false")}
 const d=t("l_d_"+n.k).replace("{x}",n.x).replace("{need}",n.need).replace("{n}",n.n).replace("{time}",n.time).replace("{fr}",n.fr);
 panel(`<h2>${n.quick?t("l_min"):nTitle(n)}</h2><p>${d}</p>`,[["go",t("l_start")]]);$("#l-prog").style.width="0";$("#l-meta").textContent="";$("#l-title").textContent="";
 X.timer=setInterval(tick,50)}
function startRun(){X.run=true;X.t0=X.tc=performance.now();$("#l-res").hidden=true;$("#l-play").hidden=false;X.shown="";paint()}
function tick(){
 if(!X||X.res||!X.run)return;const now=performance.now(),n=X.n;lastAct=now;let ok=false,c=null;
 if(n.k==="melody"){aM.getFloatTimeDomainData(mb);const f=yin(mb,ctx.sampleRate,60);ok=f>0&&Math.abs(1200*Math.log2(f*2**(S.cal/1200)/mf(X.seq[X.i])))<35}
 else{aC.getFloatFrequencyData(fd);c=chromaFrom(fd,ctx.sampleRate,aC.fftSize,S.ref);ok=chordHit(c,chTones(tgt()))}
 $$("#l-chroma i").forEach((b,i)=>b.style.height=Math.max(4,(c?c[i]:0)*150)+"px");
 if(ok){X.hs??=now;X.bad=0}else if(++X.bad>3)X.hs=null;
 if(X.hs&&now-X.hs>=(n.k==="melody"?250:450)){X.hs=null;accept(now)}
 if(X.res)return;
 if(n.k==="sprint"){X.left=60+X.bonus-(now-X.t0)/1000;if(X.left<=0)end(false,0)}
 if(n.k==="melody"){X.left=n.time-(now-X.t0)/1000;if(X.left<=0)end(false,0)}
 paint()}
function accept(now,sk){const n=X.n;if(!sk)try{tone(1568,.14,.07)}catch(_){}
 if(n.k==="chords"){if(sk)X.skip++;if(++X.i>=n.seq.length)return end(true,X.skip?X.skip>1?1:2:3)}
 else if(n.k==="change"){if(!X.st)X.st=true;else{X.cnt++;if(!sk&&(now-X.tc)/1000<=n.x)X.ok++;else if(!sk)toast(t("l_slow"));if(X.cnt>=n.n)return end(X.ok>=n.need,X.ok>=n.n-1?3:X.ok>n.need?2:1)}X.tc=now;X.j++}
 else if(n.k==="sprint"){if(!sk){X.score++;if(X.score%3===0){X.bonus+=5;toast("+5 "+t("sec"))}}X.tg=pick()}
 else{if(sk)X.skip++;if(++X.i>=X.seq.length){const r=X.left/n.time;return end(true,X.skip?1:r>.5?3:r>.25?2:1)}}
 paint()}
function end(pass,stars){X.res=1;clearInterval(X.timer);stopLs();const n=X.n;let info="";
 if(n.k==="sprint"){info=`${X.score} ${t("l_chords")}`;if(n.quick){pass=true;stars=0;if(X.score>L.best){L.best=X.score;info+=" 🏆"}saveL()}else{pass=X.score>=n.goal;stars=pass?(X.score>=2*n.goal?3:X.score>=1.5*n.goal?2:1):0}}
 else if(n.k==="change")info=`${X.ok} / ${n.need}`;
 if(pass&&n.id){L.done[n.id]=Math.max(L.done[n.id]||0,stars);saveL()}
 panel(`<div class="st">${n.quick?"⚡":"★".repeat(stars)+"☆".repeat(pass?3-stars:0)}</div><h2>${pass?t("l_done"):t("l_fail")}</h2><p>${info}</p>`,[pass?["next",t("l_next")]:null,["again",t("l_again")]])}
function paint(){const n=X.n,k=n.k,now=performance.now(),mel=k==="melody",id=mel?null:tgt(),key=mel?"m"+X.i:id;
 $("#l-title").textContent=n.quick?t("l_min"):nTitle(n);$("#l-chroma").hidden=mel;$("#l-diag").hidden=mel;$("#l-mel").hidden=!mel;
 if(X.shown!==key){X.shown=key;
  if(mel)$("#l-mel").innerHTML=X.seq.map((m,i)=>`<b class="${i<X.i?"ok":i===X.i?"on":""}">${n.fr[i]}<small>${noteName(m)}</small></b>`).join("");
  else{$("#l-diag").innerHTML=diag(chord(...CH[id]));const T=chTones(id);$$("#l-chroma i").forEach((b,i)=>b.classList.toggle("t",T.includes(i)))}}
 $("#l-name").textContent=mel?`${n.s>=0?6-n.s:""}${t("l_str")}`:chName(id);
 $("#l-next").textContent=k==="change"?"→ "+chName(n.c[(X.j+1)%n.c.length]):k==="chords"&&n.seq[X.i+1]?"→ "+chName(n.seq[X.i+1]):mel?noteName(X.seq[X.i])+oct(X.seq[X.i]):"";
 let p=0,tm=1,red=false;
 if(k==="chords"){p=X.i/n.seq.length;$("#l-meta").textContent=X.i+"/"+n.seq.length}
 else if(k==="change"){p=X.cnt/n.n;$("#l-meta").textContent=X.ok+"/"+n.need;if(X.st){tm=1-(now-X.tc)/1000/n.x;red=tm<=0}}
 else if(k==="sprint"){p=Math.min(1,X.left/(60+X.bonus));tm=p;$("#l-meta").textContent=X.score+" · "+Math.ceil(X.left)}
 else{p=X.i/X.seq.length;tm=X.left/n.time;$("#l-meta").textContent=X.i+"/"+X.seq.length+" · "+Math.ceil(X.left)}
 $("#l-prog").style.width=p*100+"%";$("#l-tbar").style.width=Math.max(0,Math.min(1,tm))*100+"%";$("#l-timer").classList.toggle("red",red);
 $("#l-status span").textContent=X.hs?t("l_hold"):t("l_listen");$("#l-status").classList.toggle("ok",!!X.hs)}
function closeLesson(){if(X){clearInterval(X.timer);X=null}stopLs();LY.classList.remove("open");LY.setAttribute("aria-hidden","true");renderPath();updStreak()}
$("#path").onclick=e=>{const b=e.target.closest(".node");b&&!b.disabled&&openLesson(ALL.find(n=>n.id===b.dataset.n))};
$("#q-go").onclick=()=>{const p=[...new Set(ALL.filter(n=>L.done[n.id]&&(n.seq||n.c)).flatMap(n=>n.seq||n.c))];openLesson({k:"sprint",quick:1,pool:p.length>=2?p:["Em","Am","D","A"],goal:0})};
$("#l-res").onclick=e=>{const b=e.target.closest("button");if(!b)return;const a=b.dataset.a;if(a==="go")startRun();else if(a==="next")history.back();else if(a==="again"){const n=X.n;clearInterval(X.timer);stopLs();openLesson(n,1)}};
$("#l-skip").onclick=()=>X&&X.run&&!X.res&&accept(performance.now(),1);
$("#l-close").onclick=()=>history.back();addEventListener("popstate",()=>LY.classList.contains("open")&&closeLesson());
document.addEventListener("visibilitychange",()=>document.hidden&&X&&history.back());
$("#l-chroma").innerHTML="<i></i>".repeat(12);

/* ---------- Settings & UI ---------- */
const CFG=[["inst","instrument",["guitar","bass","ukulele","chrom"],v=>t("i_"+v)],["lang","language",["ru","en"],v=>v==="ru"?"Русский":"English"],["theme","theme",["dark","light","stage","system"],v=>t(v)],["notation","notation",["latin","solfege"],v=>t(v)],["prec","prec",[1,2,3,5],v=>"±"+v+" ¢"],["sound","sound",["classic","wood"],v=>t(v)],["goal","goal",[1,3,5,10],v=>v+" "+t("min")]];
const NUM=[["ref","ref",415,466,v=>v+" Hz"],["cal","cal",-50,50,v=>(v>0?"+":"")+v+" ¢"]];let openRow=null;
function renderSet(){
 const item=(k,l,val,body)=>`<div class="acc-item${openRow===k?" open":""}"><button class="acc-head" data-o="${k}" aria-expanded="${openRow===k}"><span>${t(l)}</span><em>${val}</em><svg class="i"><use href="#i-chev"/></svg></button><div class="acc-body"><div><div class="acc-in">${body}</div></div></div></div>`;
 $("#sets").innerHTML=CFG.map(([k,l,o,f])=>item(k,l,f(S[k]),o.map(v=>`<button class="opt${S[k]==v?" on":""}" data-k="${k}" data-v="${v}"><span>${f(v)}</span><i></i></button>`).join(""))).join("")+NUM.map(([k,l,,,f])=>item(k,l,f(S[k]),`<div class="step"><button data-s="${k}" data-d="-1" aria-label="-">−</button><b>${f(S[k])}</b><button data-s="${k}" data-d="1" aria-label="+">+</button></div>`)).join("")}
$("#sets").onclick=e=>{const b=e.target.closest("button");if(!b)return;
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
 document.querySelector('meta[name=theme-color]').content=th==="light"?"#e9eff6":th==="stage"?"#000000":"#070b12";
 $$("[data-i]").forEach(e=>e.textContent=t(e.dataset.i));
 $("#mode-tag").textContent=t("i_"+S.inst);$("#live").textContent=run?t("live"):t("ready");$("#start span").textContent=run?t("stop"):t("start");$("#start").classList.toggle("on",run);
 if(!run)setStatus(t("hint"));
 $("#go").classList.toggle("on",playing);$("#go-i").setAttribute("href",playing?"#i-pause":"#i-play");$("#go").setAttribute("aria-label",playing?"Stop":"Start");
 $("#accent").textContent=S.accent?t("accent"):t("noacc");$("#accent").classList.toggle("on",!!S.accent);
 $$("#meters button").forEach(b=>b.classList.toggle("on",b.dataset.m===S.meter));$("#vol").value=S.vol;$("#vol-v").textContent=S.vol+"%";
 renderStrings();renderChord();updStreak();renderPath();
}
drawGauge();dots();setBpm(S.bpm);ui();idle();
{const q=new URLSearchParams(location.search).get("tab");if(["tuner","metro","chords","learn"].includes(q))show(q)}
if("serviceWorker"in navigator&&(location.protocol==="https:"||location.hostname==="localhost"))addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
