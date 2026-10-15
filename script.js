const FB={url:"https://nexus-39896-default-rtdb.firebaseio.com",apiKey:"AIzaSyD3Pwd-YAufk7LMMobSagfnRnPi8n3OOU4"};
const PLANS=[{n:1,name:"STARTER",cpu:100,ram:2.5,disk:5,price:30},{n:2,name:"STANDARD",cpu:150,ram:3.5,disk:10,price:45},{n:3,name:"ADVANCED",cpu:200,ram:4.5,disk:15,price:70},{n:4,name:"VIP",cpu:200,ram:6,disk:20,price:100}];
const KINDS=["بوت واتساب","بوت تيليجرام","مشروع Node.js"];
const I=(d)=>'<svg viewBox="0 0 24 24">'+d+'</svg>';
const ICONS={
lock:I('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>'),
home:I('<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-5h4v5"/>'),
users:I('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-4 3-6 6.5-6s6 2 6.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17.5 14c2.5.3 4 2 4.5 5"/>'),
tag:I('<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/>'),
gear:I('<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>'),
sun:I('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>'),
moon:I('<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/>'),
plus:I('<path d="M12 5v14M5 12h14"/>'),
edit:I('<path d="M4 20h4L19 9l-4-4L4 16z"/>'),
trash:I('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
copy:I('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3"/>'),
renew:I('<path d="M20 12a8 8 0 10-2.5 5.8M20 5v5h-5"/>'),
out:I('<path d="M9 4H5a1 1 0 00-1 1v14a1 1 0 001 1h4M15 8l4 4-4 4M19 12H9"/>')};
Object.assign(ICONS,{chat:I('<path d="M4 5h16v11H9l-5 4z"/>'),receipt:I('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>'),ban:I('<circle cx="12" cy="12" r="8"/><path d="M6.5 6.5l11 11"/>'),send:I('<path d="M4 12l16-8-6 16-3-7z"/>')});
const icon=n=>ICONS[n]||"";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const store={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
$$("[data-i]").forEach(e=>e.innerHTML=icon(e.dataset.i));
function toast(t){const e=$("#toast");e.textContent=t;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>e.hidden=true,1800)}

/* theme */
function setTheme(t){document.documentElement.dataset.theme=t;store.set("axel_theme",t);$$(".themeBtn").forEach(b=>b.innerHTML=icon(t==="dark"?"sun":"moon"))}
setTheme(store.get("axel_theme")||"light");
$$(".themeBtn").forEach(b=>b.onclick=()=>setTheme(document.documentElement.dataset.theme==="dark"?"light":"dark"));

/* roles + auth */
const ADMIN="abmen@gmail.com",WA="201069763042",CASH="01035880919";
let sess=null;try{sess=JSON.parse(store.get("axel_sess")||"null")}catch(e){}
const isIn=()=>!!(sess&&sess.refresh);
const R=()=>sess&&(sess.email||"").toLowerCase()===ADMIN?"a":"u";
const saveSess=()=>store.set("axel_sess",JSON.stringify(sess));
const AUTH="https://identitytoolkit.googleapis.com/v1/accounts:";
const REFRESH_URL="https://securetoken.googleapis.com/v1/token?key="+FB.apiKey;
let subs={},users={},mine=null,prof=null,peer=null,poll=null,mode="in";
async function token(){
  if(!sess)throw new Error("auth");
  if(Date.now()<sess.exp-60000)return sess.id;
  const r=await fetch(REFRESH_URL,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"grant_type=refresh_token&refresh_token="+encodeURIComponent(sess.refresh)});
  const d=await r.json();
  if(!r.ok){sess=null;saveSess();route();throw new Error("auth")}
  sess={...sess,id:d.id_token,refresh:d.refresh_token,exp:Date.now()+d.expires_in*1000};saveSess();return sess.id;
}
function boot(){subs={};if(isIn()&&R()==="a")try{subs=JSON.parse(store.get("axel_subs")||"{}")}catch(e){}}
function setMode(m){mode=m;$("#nm").hidden=$("#un").hidden=m==="in";$("#loginBtn").textContent=m==="in"?"دخول":"إنشاء حساب";$("#swMode").textContent=m==="in"?"ليس لديك حساب؟ أنشئ حساب":"لديك حساب؟ سجل الدخول";$("#loginErr").textContent=""}
$("#swMode").onclick=()=>setMode(mode==="in"?"up":"in");
const EM={EMAIL_EXISTS:"البريد مسجل بالفعل",WEAK_PASSWORD:"كلمة المرور 6 أحرف على الأقل",INVALID_EMAIL:"البريد غير صحيح",TOO_MANY:"محاولات كثيرة، حاول لاحقا",OPERATION_NOT_ALLOWED:"فعّل Email/Password من Firebase Authentication",USER_DISABLED:"الحساب معطل"};
const emsg=m=>{for(const k in EM)if(m.includes(k))return EM[k];return mode==="in"?"بيانات الدخول غير صحيحة":"تعذر إنشاء الحساب"};
async function unCheck(un){
  if(!/^[a-z0-9_]{3,20}$/.test(un))return"اليوزر نيم: حروف إنجليزية صغيرة وأرقام و _ فقط (3-20)";
  try{const t=await(await fetch(`${FB.url}/usernames/${un}.json`)).json();if(t&&t!==(sess&&sess.uid))return"اليوزر نيم مأخوذ، جرب غيره"}catch(e){return"تعذر الاتصال"}
  return"";
}
$("#loginForm").addEventListener("submit",async e=>{
  e.preventDefault();const err=$("#loginErr"),btn=$("#loginBtn"),name=$("#nm").value.trim(),un=$("#un").value.trim().toLowerCase().replace(/^@/,""),lbl=()=>mode==="in"?"دخول":"إنشاء حساب";err.textContent="";
  if(mode==="up"&&!name){err.textContent="اكتب اسمك";return}
  btn.disabled=true;btn.textContent="جاري التنفيذ";
  try{
    if(mode==="up"){const m=await unCheck(un);if(m){err.textContent=m;btn.disabled=false;btn.textContent=lbl();return}}
    const r=await fetch(AUTH+(mode==="in"?"signInWithPassword":"signUp")+"?key="+FB.apiKey,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:$("#em").value.trim(),password:$("#pw").value,returnSecureToken:true})});
    const d=await r.json();
    if(!r.ok)err.textContent=emsg((d.error&&d.error.message)||"");
    else{
      sess={id:d.idToken,refresh:d.refreshToken,exp:Date.now()+(+d.expiresIn)*1000,email:d.email,uid:d.localId};saveSess();
      if(mode==="up"){
        try{await fb("usernames/"+un,"PUT",sess.uid)}
        catch(x){try{await fetch(AUTH+"delete?key="+FB.apiKey,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken:d.idToken})})}catch(y){}sess=null;saveSess();err.textContent="اليوزر نيم مأخوذ، جرب غيره";btn.disabled=false;btn.textContent=lbl();return}
        try{await fb("users/"+sess.uid,"PATCH",{email:d.email,name,username:un,created:today()})}catch(x){}
      }
      $("#pw").value="";boot();location.hash="";route();sync();
    }
  }catch(x){err.textContent="تعذر الاتصال، تأكد من الإنترنت"}
  btn.disabled=false;btn.textContent=lbl();
});
function logout(){sess=null;saveSess();subs={};users={};mine=null;prof=null;peer=null;location.hash="";route()}
$("#logout").onclick=logout;$("#banOut").onclick=logout;
$("#banWa").href="https://wa.me/"+WA;

/* dates: exp = last subscription day (inclusive). Pure UTC day math, no DST drift */
const P=s=>s.split("-").map(Number);
const iso=d=>new Date(d-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
const today=()=>iso(new Date());
const addD=(s,n)=>{const[y,m,d]=P(s);return new Date(Date.UTC(y,m-1,d+n)).toISOString().slice(0,10)};
function addM(s,m,ad){const[y,mo,d]=P(s),t=new Date(Date.UTC(y,mo-1+m,1)),dim=new Date(Date.UTC(t.getUTCFullYear(),t.getUTCMonth()+1,0)).getUTCDate();t.setUTCDate(Math.min(ad||d,dim));return t.toISOString().slice(0,10)}
const endOf=(start,ad)=>addD(addM(start,1,ad),-1);
const dl=s=>{const[a,b,c]=P(s),[x,y,z]=P(today());return Math.round((Date.UTC(a,b-1,c)-Date.UTC(x,y-1,z))/864e5)};
const left=c=>dl(c.exp)+1;
function state(c){if(!c.exp)return"none";const l=left(c);return l<=0?"exp":l<=3?"soon":"ok"}
const LBL={ok:"نشط",soon:"قريب الانتهاء",exp:"منتهي",none:"بدون تاريخ"};
function dtxt(c){if(!c.exp)return"";const l=left(c);return l<=0?"منتهي منذ "+(1-l)+" يوم":l===1?"آخر يوم (ينتهي اليوم)":"باقي "+l+" يوم"}
const plan=n=>PLANS.find(p=>p.n==n)||PLANS[0];
function renew(c){
  const act=c.exp&&dl(c.exp)>=0,st=act?addD(c.exp,1):today();
  c.ad=act?(c.ad||P(st)[2]):P(st)[2];if(!act)c.from=st;c.exp=endOf(st,c.ad);c.dirty=true;c.upd=Date.now();
}

/* data */
const persist=()=>{if(R()==="a")store.set("axel_subs",JSON.stringify(subs))};
const clean=s=>{const c={...s};delete c.dirty;return c};
const pub=c=>({un:c.un||"",upd:c.upd||0,id:c.id,name:c.name,phone:c.phone||"",plan:c.plan,kind:c.kind||"",exp:c.exp,from:c.from||c.date||"",date:c.date||""});
async function fb(path,method,body){
  const t=await token();
  const r=await fetch(`${FB.url}/${path}.json?auth=${encodeURIComponent(t)}`,{method:method||"GET",body:body!==undefined?JSON.stringify(body):undefined});
  if(!r.ok)throw new Error(r.status);return r.json();
}
async function push(id){const c=subs[id];await fb("subscribers/"+id,"PUT",clean(c));if(c.uid)await fb("userSubs/"+c.uid,"PUT",pub(c));delete c.dirty}
function net(on){$("#net").textContent=on?"متصل":"محفوظ على الجهاز"}
async function sync(){
  if(!isIn())return;
  try{
    if(R()==="a"){
      for(const id in subs)if(subs[id].dirty)await push(id);
      const remote=(await fb("subscribers"))||{};
      for(const id in remote)subs[id]=remote[id];
      for(const id in subs)if(!(id in remote))await push(id);
      users=(await fb("users"))||{};persist();
    }else{
      prof=(await fb("users/"+sess.uid))||{};
      mine=await fb("userSubs/"+sess.uid);
      const was=$("#banned").hidden;if(was===!!prof.banned)route();if(!prof.username)$("#unSheet").hidden=false;checkNote();
    }
    net(true);renderAll();
  }catch(e){net(false)}
}
async function put(id){persist();renderAll();try{await push(id);persist();net(true)}catch(e){net(false)}}
setInterval(()=>{if(isIn())sync()},60000);

/* render */
function renderAll(){
  if(R()==="a"){renderHome();renderList();renderUsers()}else renderMine();
  renderPlans();if(!$("#chat").hidden)renderChat();
}
function renderHome(){
  const all=Object.values(subs),st=all.map(state);
  const act=all.filter((c,i)=>st[i]==="ok"||st[i]==="soon");
  $("#stTotal").textContent=all.length;$("#stActive").textContent=act.length;
  $("#stSoon").textContent=st.filter(x=>x==="soon").length;$("#stExp").textContent=st.filter(x=>x==="exp").length;
  $("#stRev").textContent=act.reduce((a,c)=>a+plan(c.plan).price,0);
  const w=all.filter(c=>["soon","exp"].includes(state(c))).sort((a,b)=>a.exp.localeCompare(b.exp)).slice(0,6);
  $("#watch").innerHTML=w.length?w.map(c=>`<div class="card mini"><div><b>${esc(c.name)}</b><small>${dtxt(c)}</small></div><button class="btn main" data-act="renew" data-id="${c.id}">تجديد</button></div>`).join(""):'<div class="empty">لا يوجد اشتراكات تحتاج متابعة</div>';
  const tot=all.length||1;
  $("#dist").innerHTML=PLANS.map(p=>{const n=all.filter(c=>c.plan==p.n).length;return `<div class="meter"><span>${p.name}</span><div class="track"><div class="fill" style="width:${n/tot*100}%"></div></div><b class="num">${n}</b></div>`}).join("");
}
let armed=null;
function renderList(){
  const q=$("#search").value.trim().toLowerCase(),fp=$("#fPlan").value,fs=$("#fSt").value;
  const items=Object.values(subs).filter(c=>(c.name+" "+(c.phone||"")).toLowerCase().includes(q)&&(!fp||c.plan==fp)&&(!fs||state(c)===fs)).sort((a,b)=>(a.exp||"9999").localeCompare(b.exp||"9999"));
  $("#list").innerHTML=items.length?items.map(c=>{
    const p=plan(c.plan),s=state(c),u=c.uid&&users[c.uid],bn=u&&u.banned;
    return `<div class="card cust">
<div class="ch"><div><b>${esc(c.name)}</b><span class="ph num">${esc(c.phone||"-")}</span>${c.un?`<small class="mut">@${esc(c.un)}${bn?" - محظور":""}</small>`:""}</div><span class="st ${s}">${LBL[s]}</span></div>
<div class="cm"><span class="badge">${p.n} - ${p.name}</span><span>${esc(c.kind||"")}</span><span>${dtxt(c)}</span></div>
${c.note?`<p class="note">${esc(c.note)}</p>`:""}
<div class="acts"><button data-act="inv" data-id="${c.id}">${icon("receipt")}فاتورة</button><button data-act="renew" data-id="${c.id}">${icon("renew")}تجديد</button><button data-act="edit" data-id="${c.id}">${icon("edit")}تعديل</button><button data-act="copy" data-id="${c.id}">${icon("copy")}نسخ</button>${c.uid?`<button data-act="open" data-id="${c.uid}">${icon("chat")}دردشة</button><button data-act="ban" data-id="${c.uid}" class="${bn?"sure":""}">${icon("ban")}${bn?"فك الحظر":"حظر المستخدم"}</button>`:""}<button data-act="del" data-id="${c.id}" class="${armed===c.id?"sure":""}">${armed===c.id?"تأكيد":icon("trash")}</button></div></div>`}).join(""):'<div class="empty">لا يوجد عملاء</div>';
}
["#search","#fPlan","#fSt"].forEach(s=>$(s).addEventListener("input",renderList));
$("#fPlan").innerHTML='<option value="">كل الباقات</option>'+PLANS.map(p=>`<option value="${p.n}">${p.name}</option>`).join("");
$("#cPlan").innerHTML=PLANS.map(p=>`<option value="${p.n}">${p.name} - ${p.price} ج.م</option>`).join("");
$("#cKind").innerHTML=KINDS.map(k=>`<option>${k}</option>`).join("");
function renderPlans(){
  const u=isIn()&&R()==="u";
  $("#plans").innerHTML=PLANS.map(p=>`<div class="card plan"><div><h4>${p.name}</h4>
<div class="meter"><span>المعالج</span><div class="track"><div class="fill" style="width:${p.cpu/2}%"></div></div><b class="num">${p.cpu}%</b></div>
<div class="meter"><span>الرام</span><div class="track"><div class="fill" style="width:${p.ram/6*100}%"></div></div><b class="num">${p.ram}GB</b></div>
<div class="meter"><span>المساحة</span><div class="track"><div class="fill" style="width:${p.disk/20*100}%"></div></div><b class="num">${p.disk}GB</b></div>
${u?`<button class="btn main" data-act="pay" data-id="${p.n}">اشترك الآن</button>`:""}</div>
<div class="price"><b class="num">${p.price}</b><small>ج.م / شهر</small></div></div>`).join("");
}
function renderMine(){
  const c=mine,el=$("#mineBox");
  if(!c||!c.plan||!c.exp){el.innerHTML='<div class="card stack"><div class="empty">لا يوجد اشتراك حاليا</div><a class="btn main" href="#prices">اشترك الآن</a></div>';return}
  const p=plan(c.plan),s=state(c),l=Math.max(left(c),0);
  el.innerHTML=`<div class="card stack"><div class="ch"><div><b>${esc(c.name)}</b><span class="ph">${esc(c.kind||"")}</span></div><span class="st ${s}">${LBL[s]}</span></div>
${s==="exp"?"":`<div class="okBanner">تم الاشتراك في باقة ${p.name}</div>`}<div class="dayBox"><b class="num big">${l}</b><small class="mut">يوم متبقي - ${dtxt(c)}</small></div>
<div class="cm"><span class="badge">${p.n} - ${p.name}</span><span>من ${esc(c.from||c.date||"-")}</span><span>إلى ${esc(c.exp)}</span></div>
<div class="meter"><span>المعالج</span><div class="track"><div class="fill" style="width:${p.cpu/2}%"></div></div><b class="num">${p.cpu}%</b></div>
<div class="meter"><span>الرام</span><div class="track"><div class="fill" style="width:${p.ram/6*100}%"></div></div><b class="num">${p.ram}GB</b></div>
<div class="meter"><span>المساحة</span><div class="track"><div class="fill" style="width:${p.disk/20*100}%"></div></div><b class="num">${p.disk}GB</b></div>
<div class="row"><button class="btn" data-act="inv" data-id="mine">${icon("receipt")}فاتورة</button><a class="btn main" href="#prices">تجديد</a></div></div>`;
}

/* invoice (PNG image) */
async function invoice(c){try{await invoice2(c)}catch(e){toast("تعذر إنشاء الفاتورة")}}
async function invoice2(c){
  try{await document.fonts.load("700 30px Tajawal")}catch(e){}
  const p=plan(c.plan),W=900,H=1400,cv=document.createElement("canvas");cv.width=W;cv.height=H;const x=cv.getContext("2d");
  const G="#3DDC84",F="Tajawal,system-ui,sans-serif";
  x.fillStyle="#000";x.fillRect(0,0,W,H);
  x.strokeStyle=G;x.lineWidth=3;x.beginPath();x.rect(24,24,W-48,H-48);x.stroke();
  x.direction="rtl";x.textAlign="center";x.fillStyle=G;x.font="800 96px "+F;x.fillText("AXEL",W/2,170);
  x.font="700 30px "+F;x.fillText("HOSTING",W/2,218);
  x.fillStyle="#fff";x.font="700 34px "+F;x.fillText("فاتورة اشتراك",W/2,290);
  const s=state(c),rows=[["اسم العميل",c.name],["اسم المستخدم","@"+(c.un||"-")],["رقم الهاتف",c.phone||"-"],["الباقة",p.n+" - "+p.name],["نوع الخدمة",c.kind||"-"],["المعالج",p.cpu+"%"],["الرام",p.ram+" GB"],["المساحة",p.disk+" GB"],["بداية الاشتراك",c.from||c.date||"-"],["آخر يوم",c.exp||"-"],["المتبقي",c.exp?dtxt(c):"-"],["الحالة",LBL[s]],["السعر",p.price+" ج.م / شهر"]];
  let y=360;
  rows.forEach(r=>{
    x.textAlign="right";x.fillStyle="rgba(255,255,255,.55)";x.font="500 28px "+F;x.fillText(r[0],W-70,y);
    x.textAlign="left";x.fillStyle="#fff";x.font="700 30px "+F;x.fillText(String(r[1]),70,y);
    x.strokeStyle="rgba(61,220,132,.25)";x.lineWidth=1.5;x.beginPath();x.moveTo(70,y+24);x.lineTo(W-70,y+24);x.stroke();y+=72;
  });
  x.textAlign="center";x.fillStyle=G;x.font="700 26px "+F;x.fillText("رقم الفاتورة: "+String(c.id||"").slice(-6).toUpperCase()+" | "+today(),W/2,H-110);
  x.fillStyle="rgba(255,255,255,.55)";x.font="500 24px "+F;x.fillText("شكرا لاختيارك AXEL",W/2,H-64);
  invUrl=cv.toDataURL("image/png");
  $("#invImg").src=invUrl;$("#invDl").href=invUrl;$("#invSheet").hidden=false;
}
let invUrl="";
$("#invClose").onclick=()=>$("#invSheet").hidden=true;
$("#invShare").onclick=async()=>{
  try{const b=await(await fetch(invUrl)).blob(),f=new File([b],"AXEL-invoice.png",{type:"image/png"});
    if(navigator.canShare&&navigator.canShare({files:[f]}))await navigator.share({files:[f]});else toast("اضغط مطولا على الصورة لحفظها")}
  catch(e){toast("اضغط مطولا على الصورة لحفظها")}
};

/* chat */
const myUid=()=>R()==="a"?peer:(sess&&sess.uid);
async function loadMsgs(){
  const u=myUid();if(!u)return;
  try{
    const arr=Object.values((await fb("chats/"+u))||{}).sort((a,b)=>a.ts-b.ts),box=$("#msgs");
    box.innerHTML=arr.length?arr.map(m=>`<div class="bub ${m.from===R()?"me":"ot"}">${esc(m.t)}<small>${new Date(m.ts).toLocaleTimeString("ar-EG",{hour:"2-digit",minute:"2-digit"})}</small></div>`).join(""):'<div class="empty">ابدأ المحادثة مع خدمة العملاء</div>';
    if(box.dataset.n!=arr.length){box.scrollTop=box.scrollHeight;box.dataset.n=arr.length}
  }catch(e){}
}
function renderChat(){
  const a=R()==="a";
  $("#chatList").hidden=!a||!!peer;$("#thread").hidden=a&&!peer;
  if(a&&!peer){
    const l=Object.entries(users).filter(([u,x])=>x.last&&(x.email||"").toLowerCase()!==ADMIN).sort((p,q)=>(q[1].last||0)-(p[1].last||0));
    $("#chatList").innerHTML=l.length?l.map(([u,x])=>`<div class="card mini"><div data-act="open" data-id="${u}" class="grow"><b>@${esc(x.username||"-")}</b><small>${esc(x.name||"")}${x.banned?" - محظور":""} - ${new Date(x.last).toLocaleString("ar-EG",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</small></div></div>`).join(""):'<div class="empty">لا توجد رسائل من المستخدمين</div>';
  }else{
    const x=users[peer]||{};
    $("#thName").textContent=a?(x.username?"@"+x.username:(x.name||x.email||"")):"خدمة العملاء";$("#back").hidden=!a;loadMsgs();
  }
}
async function tick(){
  if(R()==="a"&&!peer){try{users=(await fb("users"))||{};renderChat()}catch(e){}}else loadMsgs();
}
function openThread(u){peer=u;$("#msgs").dataset.n="";if(location.hash==="#chat")route();else location.hash="#chat"}
$("#chatForm").addEventListener("submit",async e=>{
  e.preventDefault();const i=$("#chatIn"),t=i.value.trim().slice(0,500),u=myUid();if(!t||!u)return;i.value="";
  try{const ts=Date.now();await fb("chats/"+u,"POST",{from:R(),t,ts});if(R()==="u")await fb("users/"+u,"PATCH",{last:ts})}catch(x){toast("تعذر الإرسال");i.value=t}
  loadMsgs();
});
async function ban(u){
  const x=users[u]||{},nb=!x.banned;
  try{await fb("users/"+u+"/banned","PUT",nb);x.banned=nb;users[u]=x;renderAll();toast(nb?"تم حظر المستخدم":"تم فك الحظر")}catch(e){toast("تعذر التنفيذ")}
}

/* payment */
let payN=1;
function pay(n){payN=n;const p=plan(n);$("#payPlan").textContent=p.name+" - "+p.price+" ج.م";$("#paySheet").hidden=false}
const SH=[["1","افتح تطبيق أنا فودافون","واختر تحويل أموال"],["2","ادخل الرقم "+CASH,"والمبلغ ثم أكّد"],["3","احتفظ بصورة التحويل","واضغط تم إرسال المال"]];
$("#payShots").innerHTML=SH.map(s=>`<svg viewBox="0 0 110 190" class="shot"><rect x="3" y="3" width="104" height="184" rx="14" fill="#0a0a0a" stroke="#3DDC84" stroke-width="2"/><rect x="40" y="9" width="30" height="4" rx="2" fill="#333"/><circle cx="55" cy="58" r="22" fill="#3DDC84"/><text x="55" y="67" text-anchor="middle" font-size="24" font-weight="800" fill="#000">${s[0]}</text><rect x="12" y="100" width="86" height="50" rx="8" fill="#161616"/><text x="55" y="122" text-anchor="middle" font-size="7.5" fill="#fff">${s[1]}</text><text x="55" y="138" text-anchor="middle" font-size="7.5" fill="#3DDC84">${s[2]}</text><rect x="22" y="160" width="66" height="16" rx="8" fill="#3DDC84"/></svg>`).join("");
$("#payCopy").onclick=()=>copy(CASH);
$("#payCancel").onclick=()=>$("#paySheet").hidden=true;
$("#paySheet").addEventListener("click",e=>{if(e.target.id==="paySheet")$("#paySheet").hidden=true});
$("#payDone").onclick=()=>{
  const p=plan(payN);
  window.open("https://wa.me/"+WA+"?text="+encodeURIComponent("السلام عليكم بعت فلوس\nاشتراك خدمة "+p.name+" ("+p.price+" ج.م)\nالحساب: "+(sess.email||"")),"_blank");
  $("#paySheet").hidden=true;
};

/* actions */
function copy(t){const a=document.createElement("textarea");a.value=t;document.body.appendChild(a);a.select();try{document.execCommand("copy")}catch(e){}a.remove();toast("تم النسخ")}
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-act]");if(!b)return;
  const id=b.dataset.id,a=b.dataset.act;
  if(a==="ban")return ban(id);
  if(a==="open")return openThread(id);
  if(a==="pay")return pay(+id);
  if(a==="back"){peer=null;renderChat();return}
  if(a==="inv"&&id==="mine")return mine&&invoice(mine);
  const c=subs[id];if(!c)return;
  if(a==="copy")copy(c.phone||c.name);
  else if(a==="inv")invoice(c);
  else if(a==="renew"){renew(c);toast("تم تجديد شهر");put(id)}
  else if(a==="edit")openSheet(id);
  else if(a==="del"){
    if(armed!==id){armed=id;renderList();setTimeout(()=>{if(armed===id){armed=null;renderList()}},3000);return}
    fb("subscribers/"+id,"DELETE").then(()=>c.uid&&fb("userSubs/"+c.uid,"DELETE")).then(()=>{delete subs[id];persist();armed=null;renderAll();toast("تم الحذف")}).catch(()=>{armed=null;renderList();toast("الحذف يحتاج اتصال بالإنترنت")});
  }
});
let editing=null;
function openSheet(id){
  editing=id||null;const c=id?subs[id]:{};
  $("#formTitle").textContent=id?"تعديل عميل":"عميل جديد";
  $("#cName").value=c.name||"";$("#cPhone").value=c.phone||"";$("#cPlan").value=c.plan||1;
  $("#cUn").value=c.un||(c.uid&&users[c.uid]&&users[c.uid].username)||"";
  $("#cKind").value=c.kind||KINDS[0];$("#cExp").value=c.exp||endOf(today());$("#cNote").value=c.note||"";
  $("#sheet").hidden=false;
}
const closeSheet=()=>{$("#sheet").hidden=true;editing=null};
$("#fab").onclick=()=>openSheet();$("#cCancel").onclick=closeSheet;
$("#sheet").addEventListener("click",e=>{if(e.target.id==="sheet")closeSheet()});
$("#cForm").addEventListener("submit",async e=>{
  e.preventDefault();const name=$("#cName").value.trim(),un=$("#cUn").value.trim().toLowerCase().replace(/^@/,"");if(!name||!un)return;
  let uid;try{uid=await(await fetch(`${FB.url}/usernames/${encodeURIComponent(un)}.json`)).json()}catch(x){toast("تعذر الاتصال");return}
  if(!uid||typeof uid!=="string"){toast("اليوزر نيم غير موجود");return}
  const id=editing||"s"+Date.now().toString(36),old=subs[id]||{},exp=$("#cExp").value;
  const dup=Object.values(subs).find(c=>c.uid===uid&&c.id!==id);if(dup){toast("اليوزر مربوط بالعميل "+dup.name);return}
  if(old.uid&&old.uid!==uid)fb("userSubs/"+old.uid,"DELETE").catch(()=>{});
  subs[id]={...old,id,name,un,uid,phone:$("#cPhone").value.trim(),plan:+$("#cPlan").value,kind:$("#cKind").value,exp,ad:exp?P(addD(exp,1))[2]:undefined,from:old.from||today(),note:$("#cNote").value.trim(),date:old.date||today(),upd:Date.now(),dirty:true};
  closeSheet();put(id);toast("تم الحفظ");
});
$("#exportBtn").onclick=()=>copy(JSON.stringify(subs));
$("#restoreBtn").onclick=()=>{
  try{
    let d=JSON.parse($("#restoreTxt").value);d=Array.isArray(d)?d:Object.values(d);let n=0;
    d.forEach(c=>{if(c&&c.name){const id=c.id||"s"+Date.now().toString(36)+n;subs[id]={...c,id,plan:+c.plan||1,date:c.date||today(),dirty:true};n++}});
    persist();renderAll();sync();$("#restoreTxt").value="";toast("تمت استعادة "+n+" عميل");
  }catch(x){toast("صيغة البيانات غير صحيحة")}
};

/* admin panel + user notices */
function renderUsers(){
  const q=$("#usearch").value.trim().toLowerCase();
  const l=Object.entries(users).filter(([u,x])=>(x.email||"").toLowerCase()!==ADMIN&&((x.username||"")+" "+(x.name||"")).toLowerCase().includes(q));
  $("#ulist").innerHTML=l.length?l.map(([u,x])=>`<div class="card mini"><div class="grow"><b>@${esc(x.username||"-")}</b><small>${esc(x.name||"")} - ${esc(x.email||"")}${x.banned?" - محظور":""}</small></div><div class="btns"><button class="btn" data-act="open" data-id="${u}">${icon("chat")}</button><button class="btn ${x.banned?"main":""}" data-act="ban" data-id="${u}">${x.banned?"فك الحظر":"حظر"}</button></div></div>`).join(""):'<div class="empty">لا يوجد مستخدمون</div>';
}
$("#usearch").addEventListener("input",renderUsers);
function checkNote(){
  if(!mine||!mine.upd||!mine.plan)return;
  const k="axel_seen_"+sess.uid;if(store.get(k)===String(mine.upd))return;
  $("#noteTxt").innerHTML=`تم الاشتراك في باقة <b>${plan(mine.plan).name}</b><br>${dtxt(mine)}<br><small class="mut">آخر يوم: ${esc(mine.exp)}</small>`;
  $("#noteSheet").hidden=false;$("#noteOk").onclick=()=>{store.set(k,String(mine.upd));$("#noteSheet").hidden=true};
}
$("#unSave").onclick=async()=>{
  const un=$("#unIn").value.trim().toLowerCase().replace(/^@/,""),e=$("#unErr");e.textContent="";
  const m=await unCheck(un);if(m){e.textContent=m;return}
  try{await fb("usernames/"+un,"PUT",sess.uid);await fb("users/"+sess.uid,"PATCH",{username:un});prof.username=un;$("#unSheet").hidden=true;toast("تم حفظ اليوزر نيم")}catch(x){e.textContent="اليوزر نيم مأخوذ، جرب غيره"}
};

/* router */
const TITLES={panel:"لوحة الأدمن",home:"الرئيسية",mine:"اشتراكي",customers:"العملاء",prices:"الباقات",chat:"الدردشة",settings:"الإعدادات"};
const ALLOW={a:["home","customers","panel","prices","chat","settings"],u:["mine","prices","chat","settings"]};
function route(){
  const inn=isIn(),r=inn?R():"u",bn=inn&&r==="u"&&prof&&prof.banned;
  $("#login").hidden=inn;$("#app").hidden=!inn||!!bn;$("#banned").hidden=!bn;
  clearInterval(poll);
  if(!inn||bn)return;
  $$("[data-r]").forEach(e=>e.hidden=e.dataset.r!==r);
  let v=(location.hash||"#").slice(1);if(!ALLOW[r].includes(v))v=ALLOW[r][0];
  Object.keys(TITLES).forEach(x=>$("#"+x).hidden=x!==v);
  $$(".tabs a").forEach(a=>a.classList.toggle("on",a.dataset.v===v));
  $("#title").textContent=TITLES[v];$("#fab").hidden=!(r==="a"&&v==="customers");
  $("#who").textContent=sess.email||"";
  renderAll();window.scrollTo(0,0);
  if(v==="chat")poll=setInterval(tick,4000);
}
window.addEventListener("hashchange",route);
boot();route();sync();
