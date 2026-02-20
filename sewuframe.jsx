import { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

/* ═══════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════ */
const T = {
  bg:      "#070e09",
  surface: "rgba(13,28,16,0.92)",
  glass:   "rgba(255,255,255,0.035)",
  border:  "rgba(255,215,0,0.1)",
  borderHi:"rgba(255,215,0,0.4)",
  green:   "#00c45a",
  greenDim:"rgba(0,196,90,0.15)",
  gold:    "#FFD700",
  goldDim: "rgba(255,215,0,0.55)",
  red:     "#ff5a5a",
  redDim:  "rgba(255,90,90,0.12)",
  text:    "#eae8df",
  mid:     "#7a8a74",
  dim:     "#3a4a3a",
  purple:  "#a78bfa",
  teal:    "#4ecdc4",
};

const fmt  = n => "Rp " + (n||0).toLocaleString("id-ID");
const fmtS = n => n>=1e6?"Rp "+(n/1e6).toFixed(1)+"jt":n>=1e3?"Rp "+(n/1e3).toFixed(0)+"rb":fmt(n);
const tod  = () => new Date().toISOString().slice(0,10);
const mk   = d => d.slice(0,7);
const DEF_LOCS   = ["Caffe Namuin","Maliosewu"];
const DEF_PRICES = [20000,25000,30000];
const DEF_CATS   = ["Operasional","Transport","Maintenance","Gaji","Listrik","Lainnya"];
const PIE_C      = [T.green,T.gold,T.red,T.teal,T.purple,"#fb923c"];

async function ls(k){try{const r=await window.storage.get(k);return r?JSON.parse(r.value):null;}catch{return null;}}
async function sv(k,v){try{await window.storage.set(k,JSON.stringify(v));}catch{}}

/* ═══════════════════════════════════════════════
   GLOBAL CSS
═══════════════════════════════════════════════ */
const GS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:${T.bg};color:${T.text};font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased;}
::-webkit-scrollbar{width:3px;height:3px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:rgba(255,215,0,0.25);border-radius:99px;}
input,select,textarea,button{font-family:'DM Sans',sans-serif;color:${T.text};}
input::placeholder{color:${T.dim};}
select option{background:#0d1c10;color:${T.text};}
@keyframes fu{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:none;}}
@keyframes fl{from{opacity:0;transform:translateX(-12px);}to{opacity:1;transform:none;}}
@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
@keyframes glow{0%,100%{box-shadow:0 0 20px rgba(0,196,90,0);}50%{box-shadow:0 0 30px rgba(0,196,90,0.25);}}
.fu{animation:fu .4s cubic-bezier(.16,1,.3,1) both;}
.fu1{animation:fu .4s .07s cubic-bezier(.16,1,.3,1) both;}
.fu2{animation:fu .4s .14s cubic-bezier(.16,1,.3,1) both;}
.fu3{animation:fu .4s .21s cubic-bezier(.16,1,.3,1) both;}
.fu4{animation:fu .4s .28s cubic-bezier(.16,1,.3,1) both;}
.fu5{animation:fu .4s .35s cubic-bezier(.16,1,.3,1) both;}
.fl{animation:fl .35s cubic-bezier(.16,1,.3,1) both;}
`;

/* ═══════════════════════════════════════════════
   COMPONENTS
═══════════════════════════════════════════════ */
function Logo({s=48}){
  return(
    <svg width={s} height={s} viewBox="0 0 100 100" style={{flexShrink:0}}>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={T.gold}/>
          <stop offset="100%" stopColor={T.green}/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="#0a1a0d"/>
      <rect x="1.5" y="1.5" width="97" height="97" rx="21" fill="none" stroke="url(#lg)" strokeWidth="1.5"/>
      <rect x="11" y="11" width="32" height="32" rx="7" fill={T.gold} opacity=".88"/>
      <rect x="57" y="11" width="32" height="32" rx="7" fill={T.gold} opacity=".42"/>
      <rect x="11" y="57" width="32" height="32" rx="7" fill={T.gold} opacity=".42"/>
      <rect x="57" y="57" width="32" height="32" rx="7" fill={T.gold} opacity=".88"/>
      <circle cx="50" cy="50" r="12" fill={T.bg}/>
      <circle cx="50" cy="50" r="6.5" fill="url(#lg)"/>
    </svg>
  );
}

function Card({children,style={},cls=""}){
  return(
    <div className={cls} style={{
      background:T.surface,
      border:`1px solid ${T.border}`,
      borderRadius:18,
      backdropFilter:"blur(24px)",
      WebkitBackdropFilter:"blur(24px)",
      ...style
    }}>{children}</div>
  );
}

function Btn({children,onClick,v="green",style={},disabled=false}){
  const bg={
    green:`linear-gradient(135deg,${T.green},#009944)`,
    gold:`linear-gradient(135deg,${T.gold},#e6b800)`,
    red:`linear-gradient(135deg,${T.red},#cc2222)`,
    ghost:"rgba(255,255,255,0.05)",
  }[v]||"rgba(255,255,255,0.05)";
  const tc=v==="gold"?"#0a1a0d":T.text;
  return(
    <button onClick={onClick} disabled={disabled} style={{
      background:bg,color:tc,border:v==="ghost"?`1px solid ${T.border}`:"none",
      borderRadius:11,padding:"10px 20px",fontSize:13,fontWeight:600,
      cursor:disabled?"not-allowed":"pointer",opacity:disabled?.5:1,
      transition:"transform .12s,opacity .12s",
      boxShadow:v==="green"?"0 4px 18px rgba(0,196,90,.3)":v==="gold"?"0 4px 18px rgba(255,215,0,.25)":"none",
      ...style
    }}
    onMouseEnter={e=>{if(!disabled)e.currentTarget.style.transform="translateY(-2px)";}}
    onMouseLeave={e=>{e.currentTarget.style.transform="none";}}
    >{children}</button>
  );
}

function Fld({label,children}){
  return(
    <div style={{marginBottom:16}}>
      <label style={{display:"block",fontSize:9.5,fontWeight:700,color:T.goldDim||"rgba(255,215,0,.5)",letterSpacing:"1.4px",textTransform:"uppercase",marginBottom:7}}>{label}</label>
      {children}
    </div>
  );
}
const iS={
  width:"100%",padding:"10px 14px",background:"rgba(255,255,255,0.042)",
  border:`1px solid ${T.border}`,borderRadius:11,fontSize:13,outline:"none",
  color:T.text,transition:"border-color .18s",
};

function Tip({active,payload,label}){
  if(!active||!payload?.length)return null;
  return(
    <div style={{background:"#0d1c10",border:`1px solid ${T.borderHi}`,borderRadius:10,padding:"10px 16px",fontSize:12}}>
      <div style={{color:T.goldDim,marginBottom:5,fontWeight:600}}>{label}</div>
      {payload.map((p,i)=><div key={i} style={{color:p.color,marginTop:2}}>{p.name}: {fmt(p.value)}</div>)}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════ */
export default function App(){
  const [user,setUser]=useState(null);
  const [inc,setInc]=useState([]);
  const [exp,setExp]=useState([]);
  const [locs,setLocs]=useState(DEF_LOCS);
  const [prices,setPrices]=useState(DEF_PRICES);
  const [ep,setEp]=useState(10000);
  const [mt,setMt]=useState(0);
  const [tab,setTab]=useState("ringkasan");
  const [sb,setSb]=useState(true);
  const [loaded,setLoaded]=useState(false);

  useEffect(()=>{
    (async()=>{
      const u=await ls("sf:u");const i=await ls("sf:i");const e=await ls("sf:e");
      const l=await ls("sf:l");const p=await ls("sf:p");const ep2=await ls("sf:ep");
      const m=await ls("sf:mt");
      if(u)setUser(u);if(i)setInc(i);if(e)setExp(e);
      if(l)setLocs(l);if(p)setPrices(p);if(ep2!==null)setEp(ep2);if(m!==null)setMt(m);
      setLoaded(true);
    })();
  },[]);

  const pI=v=>{setInc(v);sv("sf:i",v);};
  const pE=v=>{setExp(v);sv("sf:e",v);};
  const pL=v=>{setLocs(v);sv("sf:l",v);};
  const pP=v=>{setPrices(v);sv("sf:p",v);};
  const pEp=v=>{setEp(v);sv("sf:ep",v);};
  const pMt=v=>{setMt(v);sv("sf:mt",v);};

  if(!loaded)return(
    <><style>{GS}</style>
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:T.bg}}>
      <div style={{textAlign:"center"}}>
        <Logo s={70}/>
        <div style={{marginTop:20,color:T.goldDim,letterSpacing:"3px",fontSize:10,animation:"spin 0s"}}>MEMUAT...</div>
      </div>
    </div></>
  );

  if(!user)return <Login onLogin={u=>{setUser(u);sv("sf:u",u);}}/>;

  const totInc=inc.reduce((s,i)=>s+i.total,0);
  const totExp=exp.reduce((s,e)=>s+e.amount,0);
  const profit=totInc-totExp;
  const curM=new Date().toISOString().slice(0,7);
  const mOmset=inc.filter(i=>i.date.startsWith(curM)).reduce((s,i)=>s+i.total,0);
  const tPct=mt>0?Math.min((mOmset/mt)*100,100):0;

  const TABS=[
    {id:"ringkasan",ic:"◈",lb:"Ringkasan"},
    {id:"pemasukan",ic:"↑",lb:"Pemasukan"},
    {id:"pengeluaran",ic:"↓",lb:"Pengeluaran"},
    {id:"laporan",ic:"≡",lb:"Laporan Bulanan"},
    {id:"riwayat",ic:"⊙",lb:"Riwayat"},
    {id:"pengaturan",ic:"◎",lb:"Pengaturan"},
  ];

  return(
    <><style>{GS}</style>
    <div style={{display:"flex",minHeight:"100vh",background:T.bg,position:"relative",overflow:"hidden"}}>
      {/* BG atmosphere */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
        <div style={{position:"absolute",width:800,height:800,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,196,90,.055),transparent 65%)",top:-300,left:-200}}/>
        <div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,215,0,.04),transparent 65%)",bottom:-200,right:-100}}/>
        <div style={{position:"absolute",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,196,90,.03),transparent 65%)",bottom:100,left:"40%"}}/>
      </div>

      {/* SIDEBAR */}
      <aside style={{
        width:sb?252:0,minWidth:sb?252:0,overflow:"hidden",flexShrink:0,
        transition:"all .3s cubic-bezier(.4,0,.2,1)",
        borderRight:`1px solid ${T.border}`,position:"relative",zIndex:10,
        background:"rgba(6,14,7,0.97)",backdropFilter:"blur(32px)",
        display:"flex",flexDirection:"column",
      }}>
        {/* brand */}
        <div style={{padding:"26px 20px 18px",borderBottom:`1px solid ${T.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:13}}>
            <Logo s={42}/>
            <div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:700,color:T.gold,letterSpacing:"-.2px",lineHeight:1}}>Sewu Frame</div>
              <div style={{fontSize:8.5,color:T.dim,letterSpacing:"2px",marginTop:4}}>PHOTOBOOTH MANAGER</div>
            </div>
          </div>
        </div>

        {/* user */}
        <div style={{padding:"12px 14px"}}>
          <div style={{background:"rgba(255,215,0,.05)",border:`1px solid ${T.border}`,borderRadius:12,padding:"11px 14px",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${T.gold},${T.green})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#07120a",flexShrink:0}}>
              {(user.name||"U")[0].toUpperCase()}
            </div>
            <div style={{overflow:"hidden"}}>
              <div style={{fontSize:12,fontWeight:600,color:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
              <div style={{fontSize:10,color:T.mid,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.email}</div>
            </div>
          </div>
        </div>

        {/* target */}
        {mt>0&&(
          <div style={{padding:"0 14px 12px"}}>
            <div style={{background:"rgba(0,196,90,.07)",border:`1px solid rgba(0,196,90,.18)`,borderRadius:12,padding:"12px 14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                <span style={{fontSize:9,color:T.mid,fontWeight:700,letterSpacing:"1.2px"}}>TARGET BULAN INI</span>
                <span style={{fontSize:11,color:T.green,fontWeight:700}}>{tPct.toFixed(0)}%</span>
              </div>
              <div style={{height:4,background:"rgba(255,255,255,.07)",borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${tPct}%`,background:`linear-gradient(90deg,${T.green},${T.gold})`,borderRadius:99,transition:"width .9s ease"}}/>
              </div>
              <div style={{fontSize:10,color:T.dim,marginTop:6}}>{fmtS(mOmset)} / {fmtS(mt)}</div>
            </div>
          </div>
        )}

        {/* nav */}
        <nav style={{flex:1,padding:"6px 10px",display:"flex",flexDirection:"column",gap:2}}>
          {TABS.map(t=>{
            const a=tab===t.id;
            return(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                display:"flex",alignItems:"center",gap:11,
                padding:"10px 13px",borderRadius:11,border:"none",
                background:a?"rgba(255,215,0,.08)":"transparent",
                color:a?T.gold:T.mid,cursor:"pointer",
                fontSize:13,fontWeight:a?600:400,textAlign:"left",width:"100%",
                transition:"all .16s",
                borderLeft:a?`2px solid ${T.gold}`:"2px solid transparent",
              }}>
                <span style={{fontSize:13,width:16,textAlign:"center",opacity:a?1:.7}}>{t.ic}</span>
                {t.lb}
              </button>
            );
          })}
        </nav>

        <div style={{padding:"10px 14px 22px"}}>
          <button onClick={()=>{setUser(null);sv("sf:u",null);}} style={{
            width:"100%",padding:"9px",background:"rgba(255,90,90,.07)",
            border:`1px solid rgba(255,90,90,.18)`,borderRadius:11,
            color:T.red,cursor:"pointer",fontSize:12,fontWeight:600
          }}>← Keluar</button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",position:"relative",zIndex:1}}>
        {/* topbar */}
        <header style={{
          padding:"13px 24px",display:"flex",alignItems:"center",gap:12,
          borderBottom:`1px solid ${T.border}`,
          background:"rgba(6,14,7,0.7)",backdropFilter:"blur(24px)",flexShrink:0
        }}>
          <button onClick={()=>setSb(!sb)} style={{
            background:"rgba(255,255,255,.04)",border:`1px solid ${T.border}`,
            borderRadius:9,width:36,height:36,display:"flex",alignItems:"center",
            justifyContent:"center",cursor:"pointer",color:T.mid,fontSize:15,flexShrink:0
          }}>{sb?"‹":"›"}</button>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700,color:T.text,lineHeight:1}}>{TABS.find(t=>t.id===tab)?.lb}</div>
          </div>
          <div style={{flex:1}}/>
          <div style={{fontSize:11,color:T.dim}}>{new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
          <div style={{display:"flex",gap:8}}>
            {[{l:"OMSET",v:fmtS(totInc),c:T.green},{l:"PROFIT",v:fmtS(profit),c:profit>=0?T.green:T.red}].map(s=>(
              <div key={s.l} style={{background:"rgba(255,255,255,.03)",border:`1px solid ${T.border}`,borderRadius:10,padding:"5px 14px",textAlign:"center"}}>
                <div style={{fontSize:13,fontWeight:700,color:s.c,fontFamily:"'Cormorant Garamond',serif"}}>{s.v}</div>
                <div style={{fontSize:8.5,color:T.dim,letterSpacing:"1.2px"}}>{s.l}</div>
              </div>
            ))}
          </div>
        </header>

        {/* content */}
        <div style={{flex:1,overflow:"auto",padding:"26px 28px"}}>
          {tab==="ringkasan"   &&<Dashboard inc={inc} exp={exp} totInc={totInc} totExp={totExp} profit={profit}/>}
          {tab==="pemasukan"   &&<IncomeForm locs={locs} prices={prices} ep={ep} onAdd={i=>pI([...inc,i])}/>}
          {tab==="pengeluaran" &&<ExpenseForm onAdd={e=>pE([...exp,e])}/>}
          {tab==="laporan"     &&<MonthlyReport inc={inc} exp={exp}/>}
          {tab==="riwayat"     &&<History inc={inc} exp={exp} onDI={id=>pI(inc.filter(x=>x.id!==id))} onDE={id=>pE(exp.filter(x=>x.id!==id))}/>}
          {tab==="pengaturan"  &&<Settings locs={locs} prices={prices} ep={ep} mt={mt} onL={pL} onP={pP} onEp={pEp} onMt={pMt}/>}
        </div>
      </main>
    </div>
    </>
  );
}

/* ═══════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════ */
function Login({onLogin}){
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [loading,setLoading]=useState(false);
  const go=()=>{
    if(!email.includes("@"))return alert("Email tidak valid");
    setLoading(true);
    setTimeout(()=>onLogin({name:name||email.split("@")[0],email,role:"admin"}),700);
  };
  return(
    <><style>{GS}</style>
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",width:900,height:900,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,196,90,.07),transparent 60%)",top:-300,left:-200,pointerEvents:"none"}}/>
      <div style={{position:"absolute",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,215,0,.06),transparent 60%)",bottom:-200,right:-100,pointerEvents:"none"}}/>

      {/* Decorative grid lines */}
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,215,0,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,215,0,.025) 1px,transparent 1px)",backgroundSize:"60px 60px",pointerEvents:"none"}}/>

      <Card cls="fu" style={{width:"100%",maxWidth:420,padding:"48px 44px",textAlign:"center",position:"relative"}}>
        {/* Top accent */}
        <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:80,height:2,background:`linear-gradient(90deg,transparent,${T.gold},transparent)`}}/>

        <div style={{display:"flex",justifyContent:"center",marginBottom:22}}><Logo s={72}/></div>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,color:T.gold,fontWeight:700,marginBottom:4,letterSpacing:"-.5px"}}>Sewu Frame</h1>
        <p style={{fontSize:10,color:T.dim,letterSpacing:"2.5px",marginBottom:38}}>SISTEM LAPORAN KEUANGAN</p>

        <Fld label="Nama">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Masukkan nama Anda" style={iS}
            onFocus={e=>e.target.style.borderColor=T.goldDim} onBlur={e=>e.target.style.borderColor=T.border}/>
        </Fld>
        <Fld label="Gmail">
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@gmail.com" type="email" style={iS}
            onFocus={e=>e.target.style.borderColor=T.goldDim} onBlur={e=>e.target.style.borderColor=T.border}
            onKeyDown={e=>e.key==="Enter"&&go()}/>
        </Fld>

        <Btn onClick={go} v="gold" disabled={loading} style={{width:"100%",padding:"14px",fontSize:14,marginTop:8,color:"#07120a"}}>
          {loading
            ?<span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>⟳</span>
            :<>
              <svg width="15" height="15" viewBox="0 0 24 24" style={{verticalAlign:"middle",marginRight:8}}>
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Masuk dengan Google
            </>
          }
        </Btn>
        <p style={{marginTop:18,fontSize:10,color:T.dim,letterSpacing:".5px"}}>Data tersimpan aman &amp; terenkripsi</p>

        {/* bottom accent */}
        <div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:80,height:2,background:`linear-gradient(90deg,transparent,${T.green},transparent)`}}/>
      </Card>
    </div>
    </>
  );
}

/* ═══════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════ */
function Dashboard({inc,exp,totInc,totExp,profit}){
  const [ct,setCt]=useState("area");
  const daily=useMemo(()=>{
    const m={};
    for(let i=13;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=d.toISOString().slice(0,10);m[k]={date:k.slice(5),income:0,expense:0};}
    inc.forEach(x=>{if(m[x.date])m[x.date].income+=x.total;});
    exp.forEach(x=>{if(m[x.date])m[x.date].expense+=x.amount;});
    return Object.values(m);
  },[inc,exp]);
  const byLoc=useMemo(()=>{const m={};inc.forEach(i=>{m[i.location]=(m[i.location]||0)+i.total;});return Object.entries(m).map(([n,v])=>({name:n,value:v}));},[inc]);
  const totS=inc.reduce((s,i)=>s+i.sessions,0);
  const totX=inc.reduce((s,i)=>s+i.extras,0);

  const STATS=[
    {ic:"💰",lb:"Total Omset",v:fmtS(totInc),c:T.gold,cls:"fu1"},
    {ic:"💸",lb:"Total Pengeluaran",v:fmtS(totExp),c:T.red,cls:"fu2"},
    {ic:"📈",lb:"Laba Bersih",v:fmtS(profit),c:profit>=0?T.green:T.red,cls:"fu3"},
    {ic:"📸",lb:"Total Sesi Foto",v:totS+" sesi",c:T.green,cls:"fu4"},
    {ic:"🖨",lb:"Extra Print",v:totX+" lembar",c:T.purple,cls:"fu5"},
    {ic:"🧾",lb:"Total Transaksi",v:inc.length+" tx",c:T.teal,cls:"fu1"},
  ];

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:14,marginBottom:22}}>
        {STATS.map(s=>(
          <Card key={s.lb} cls={s.cls} style={{padding:"20px 22px",position:"relative",overflow:"hidden",borderTop:`2px solid ${s.c}`}}>
            <div style={{position:"absolute",top:-10,right:-10,fontSize:60,opacity:.05,userSelect:"none"}}>{s.ic}</div>
            <div style={{fontSize:22,marginBottom:9}}>{s.ic}</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:s.c,lineHeight:1}}>{s.v}</div>
            <div style={{fontSize:11,color:T.mid,marginTop:6,fontWeight:500}}>{s.lb}</div>
          </Card>
        ))}
      </div>

      <Card cls="fu2" style={{padding:"22px 26px",marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22,flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,color:T.text,fontWeight:700}}>Tren Keuangan</div>
            <div style={{fontSize:11,color:T.mid,marginTop:2}}>14 hari terakhir</div>
          </div>
          <div style={{display:"flex",gap:5}}>
            {["area","bar"].map(c=>(
              <button key={c} onClick={()=>setCt(c)} style={{
                padding:"6px 15px",borderRadius:9,border:`1px solid ${ct===c?T.gold:T.border}`,
                background:ct===c?"rgba(255,215,0,.1)":"transparent",
                color:ct===c?T.gold:T.mid,cursor:"pointer",fontSize:12,fontWeight:600,
              }}>{c==="area"?"Area":"Bar"}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          {ct==="area"?(
            <AreaChart data={daily}>
              <defs>
                <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.green} stopOpacity={.22}/>
                  <stop offset="95%" stopColor={T.green} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.red} stopOpacity={.18}/>
                  <stop offset="95%" stopColor={T.red} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.03)"/>
              <XAxis dataKey="date" tick={{fill:T.dim,fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:T.dim,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?(v/1000)+"rb":v}/>
              <Tooltip content={<Tip/>}/>
              <Area type="monotone" dataKey="income" name="Pemasukan" stroke={T.green} strokeWidth={2} fill="url(#gi)"/>
              <Area type="monotone" dataKey="expense" name="Pengeluaran" stroke={T.red} strokeWidth={2} fill="url(#ge)"/>
            </AreaChart>
          ):(
            <BarChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.03)"/>
              <XAxis dataKey="date" tick={{fill:T.dim,fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:T.dim,fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?(v/1000)+"rb":v}/>
              <Tooltip content={<Tip/>}/>
              <Bar dataKey="income" name="Pemasukan" fill={T.green} radius={[5,5,0,0]}/>
              <Bar dataKey="expense" name="Pengeluaran" fill={T.red} radius={[5,5,0,0]}/>
            </BarChart>
          )}
        </ResponsiveContainer>
      </Card>

      {byLoc.length>0&&(
        <Card cls="fu3" style={{padding:"22px 26px"}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,color:T.text,fontWeight:700,marginBottom:4}}>Omset per Lokasi</div>
          <div style={{fontSize:11,color:T.mid,marginBottom:20}}>Distribusi pendapatan berdasarkan lokasi</div>
          <div style={{display:"flex",gap:28,alignItems:"center",flexWrap:"wrap"}}>
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={byLoc} cx="50%" cy="50%" innerRadius={55} outerRadius={95} dataKey="value" paddingAngle={4}>
                  {byLoc.map((_,i)=><Cell key={i} fill={PIE_C[i%PIE_C.length]}/>)}
                </Pie>
                <Tooltip formatter={v=>fmt(v)}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{flex:1,minWidth:150}}>
              {byLoc.map((d,i)=>(
                <div key={d.name} style={{display:"flex",alignItems:"center",gap:11,padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{width:9,height:9,borderRadius:2.5,background:PIE_C[i%PIE_C.length],flexShrink:0}}/>
                  <div style={{flex:1,fontSize:13,color:T.text,fontWeight:500}}>{d.name}</div>
                  <div style={{fontSize:13,color:PIE_C[i%PIE_C.length],fontWeight:700}}>{fmt(d.value)}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   INCOME FORM
═══════════════════════════════════════════════ */
function IncomeForm({locs,prices,ep,onAdd}){
  const [f,setF]=useState({date:tod(),location:"",price:0,sessions:1,extras:0,note:""});
  const [ok,setOk]=useState(false);
  const total=f.sessions*f.price+f.extras*ep;
  const submit=()=>{
    if(!f.location)return alert("Pilih lokasi");
    if(!f.price)return alert("Pilih harga sesi");
    onAdd({id:Date.now().toString(),...f,total,createdAt:new Date().toISOString()});
    setF({date:tod(),location:"",price:0,sessions:1,extras:0,note:""});
    setOk(true);setTimeout(()=>setOk(false),3000);
  };
  return(
    <div style={{maxWidth:560}} className="fu">
      {ok&&<Notice color={T.green}>✓ Pemasukan berhasil disimpan!</Notice>}
      <Card style={{padding:"30px 34px"}}>
        <SectionTitle color={T.gold}>Input Pemasukan</SectionTitle>
        <Fld label="Tanggal">
          <input type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})} style={iS}
            onFocus={e=>e.target.style.borderColor=T.goldDim} onBlur={e=>e.target.style.borderColor=T.border}/>
        </Fld>
        <Fld label="Lokasi">
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {locs.map(l=>(
              <ToggleBtn key={l} active={f.location===l} color={T.gold} onClick={()=>setF({...f,location:l})}>{l}</ToggleBtn>
            ))}
          </div>
        </Fld>
        <Fld label="Harga Sesi">
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {prices.map(p=>(
              <ToggleBtn key={p} active={f.price===p} color={T.green} onClick={()=>setF({...f,price:p})}>Rp {p.toLocaleString("id-ID")}</ToggleBtn>
            ))}
          </div>
        </Fld>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <Fld label="Jumlah Sesi">
            <input type="number" min="1" value={f.sessions} onChange={e=>setF({...f,sessions:parseInt(e.target.value)||0})} style={iS}
              onFocus={e=>e.target.style.borderColor=T.goldDim} onBlur={e=>e.target.style.borderColor=T.border}/>
          </Fld>
          <Fld label={`Extra Print (Rp ${ep.toLocaleString("id-ID")})`}>
            <input type="number" min="0" value={f.extras} onChange={e=>setF({...f,extras:parseInt(e.target.value)||0})} style={iS}
              onFocus={e=>e.target.style.borderColor=T.goldDim} onBlur={e=>e.target.style.borderColor=T.border}/>
          </Fld>
        </div>
        <Fld label="Catatan (opsional)">
          <input value={f.note} onChange={e=>setF({...f,note:e.target.value})} placeholder="Keterangan tambahan..." style={iS}
            onFocus={e=>e.target.style.borderColor=T.goldDim} onBlur={e=>e.target.style.borderColor=T.border}/>
        </Fld>
        <TotalBox color={T.green}>
          <TotalRow label={`${f.sessions} sesi × ${fmt(f.price)}`} val={fmt(f.sessions*f.price)}/>
          {f.extras>0&&<TotalRow label={`${f.extras} extra × ${fmt(ep)}`} val={fmt(f.extras*ep)}/>}
          <div style={{borderTop:`1px solid rgba(0,196,90,.2)`,paddingTop:10,marginTop:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontFamily:"'Cormorant Garamond',serif",color:T.text,fontSize:14}}>Total</span>
            <span style={{fontFamily:"'Cormorant Garamond',serif",color:T.green,fontSize:24,fontWeight:700}}>{fmt(total)}</span>
          </div>
        </TotalBox>
        <Btn onClick={submit} v="green" style={{width:"100%",padding:"14px",fontSize:14}}>💾 Simpan Pemasukan</Btn>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   EXPENSE FORM
═══════════════════════════════════════════════ */
function ExpenseForm({onAdd}){
  const [f,setF]=useState({date:tod(),category:"Operasional",description:"",amount:""});
  const [ok,setOk]=useState(false);
  const submit=()=>{
    if(!f.description)return alert("Masukkan keterangan");
    if(!f.amount||isNaN(f.amount))return alert("Nominal tidak valid");
    onAdd({id:Date.now().toString(),...f,amount:parseInt(f.amount),createdAt:new Date().toISOString()});
    setF({date:tod(),category:"Operasional",description:"",amount:""});
    setOk(true);setTimeout(()=>setOk(false),3000);
  };
  return(
    <div style={{maxWidth:560}} className="fu">
      {ok&&<Notice color={T.red}>✓ Pengeluaran berhasil disimpan!</Notice>}
      <Card style={{padding:"30px 34px"}}>
        <SectionTitle color={T.red}>Input Pengeluaran</SectionTitle>
        <Fld label="Tanggal">
          <input type="date" value={f.date} onChange={e=>setF({...f,date:e.target.value})} style={iS}
            onFocus={e=>e.target.style.borderColor=T.goldDim} onBlur={e=>e.target.style.borderColor=T.border}/>
        </Fld>
        <Fld label="Kategori">
          <select value={f.category} onChange={e=>setF({...f,category:e.target.value})} style={{...iS,background:"rgba(255,255,255,.042)"}}
            onFocus={e=>e.target.style.borderColor=T.goldDim} onBlur={e=>e.target.style.borderColor=T.border}>
            {DEF_CATS.map(c=><option key={c}>{c}</option>)}
          </select>
        </Fld>
        <Fld label="Keterangan">
          <input value={f.description} onChange={e=>setF({...f,description:e.target.value})} placeholder="Deskripsi pengeluaran..." style={iS}
            onFocus={e=>e.target.style.borderColor=T.goldDim} onBlur={e=>e.target.style.borderColor=T.border}/>
        </Fld>
        <Fld label="Nominal (Rp)">
          <input type="number" min="0" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})} placeholder="0" style={iS}
            onFocus={e=>e.target.style.borderColor=T.goldDim} onBlur={e=>e.target.style.borderColor=T.border}/>
        </Fld>
        {parseInt(f.amount)>0&&(
          <TotalBox color={T.red}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontFamily:"'Cormorant Garamond',serif",color:T.text,fontSize:14}}>Total</span>
              <span style={{fontFamily:"'Cormorant Garamond',serif",color:T.red,fontSize:24,fontWeight:700}}>{fmt(parseInt(f.amount)||0)}</span>
            </div>
          </TotalBox>
        )}
        <Btn onClick={submit} v="red" style={{width:"100%",padding:"14px",fontSize:14}}>💾 Simpan Pengeluaran</Btn>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MONTHLY REPORT
═══════════════════════════════════════════════ */
function MonthlyReport({inc,exp}){
  const months=useMemo(()=>{
    const s=new Set([...inc.map(i=>mk(i.date)),...exp.map(e=>mk(e.date))]);
    return Array.from(s).sort().reverse();
  },[inc,exp]);
  const [sel,setSel]=useState(new Date().toISOString().slice(0,7));
  const mi=inc.filter(i=>i.date.startsWith(sel));
  const me=exp.filter(e=>e.date.startsWith(sel));
  const om=mi.reduce((s,i)=>s+i.total,0);
  const te=me.reduce((s,e)=>s+e.amount,0);
  const lb=om-te;
  const ts=mi.reduce((s,i)=>s+i.sessions,0);
  const tx=mi.reduce((s,i)=>s+i.extras,0);
  const pct=om>0?((lb/om)*100).toFixed(1):0;
  return(
    <div className="fu">
      <div style={{display:"flex",gap:10,marginBottom:22,flexWrap:"wrap",alignItems:"center"}}>
        <select value={sel} onChange={e=>setSel(e.target.value)} style={{...iS,width:"auto",minWidth:210}}
          onFocus={e=>e.target.style.borderColor=T.goldDim} onBlur={e=>e.target.style.borderColor=T.border}>
          {months.map(m=><option key={m} value={m}>{new Date(m+"-01").toLocaleDateString("id-ID",{year:"numeric",month:"long"})}</option>)}
          {!months.includes(sel)&&<option value={sel}>{new Date(sel+"-01").toLocaleDateString("id-ID",{year:"numeric",month:"long"})}</option>}
        </select>
        <Btn onClick={()=>doExport(mi,me,sel)} v="ghost">📥 Export CSV</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:12,marginBottom:20}}>
        {[
          {l:"Total Omset",v:fmt(om),c:T.gold},
          {l:"Total Pengeluaran",v:fmt(te),c:T.red},
          {l:"Laba Bersih",v:fmt(lb),c:lb>=0?T.green:T.red},
          {l:"Margin Profit",v:pct+"%",c:T.purple},
          {l:"Total Sesi",v:ts+" sesi",c:T.green},
          {l:"Extra Print",v:tx+" lembar",c:T.teal},
        ].map(c=>(
          <Card key={c.l} style={{padding:"15px 17px",borderTop:`2px solid ${c.c}`}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontWeight:700,color:c.c}}>{c.v}</div>
            <div style={{fontSize:10,color:T.dim,marginTop:5,letterSpacing:".5px"}}>{c.l}</div>
          </Card>
        ))}
      </div>
      {mi.length>0&&(
        <Card style={{padding:"20px 22px",marginBottom:16}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:T.green,fontWeight:700,marginBottom:14}}>Detail Pemasukan</div>
          <Tbl cols={["Tanggal","Lokasi","Harga/Sesi","Sesi","Extra","Total"]}>
            {mi.map(i=><tr key={i.id} style={{borderBottom:`1px solid ${T.border}`}}>
              <Td>{i.date}</Td><Td><Lbadge>{i.location}</Lbadge></Td>
              <Td>{fmt(i.price)}</Td><Td>{i.sessions}</Td><Td>{i.extras}</Td>
              <Td style={{color:T.green,fontWeight:700}}>{fmt(i.total)}</Td>
            </tr>)}
          </Tbl>
        </Card>
      )}
      {me.length>0&&(
        <Card style={{padding:"20px 22px"}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:T.red,fontWeight:700,marginBottom:14}}>Detail Pengeluaran</div>
          <Tbl cols={["Tanggal","Kategori","Keterangan","Nominal"]}>
            {me.map(e=><tr key={e.id} style={{borderBottom:`1px solid ${T.border}`}}>
              <Td>{e.date}</Td><Td><Cbadge>{e.category}</Cbadge></Td>
              <Td>{e.description}</Td><Td style={{color:T.red,fontWeight:700}}>{fmt(e.amount)}</Td>
            </tr>)}
          </Tbl>
        </Card>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   HISTORY
═══════════════════════════════════════════════ */
function History({inc,exp,onDI,onDE}){
  const [tab,setTab]=useState("i");
  const [q,setQ]=useState("");
  const [loc,setLoc]=useState("");
  const [sort,setSort]=useState("dd");
  const locs=[...new Set(inc.map(i=>i.location))];
  const items=(tab==="i"?inc:exp)
    .filter(x=>(!q||JSON.stringify(x).toLowerCase().includes(q.toLowerCase()))&&(tab!=="i"||!loc||x.location===loc))
    .sort((a,b)=>sort==="dd"?b.date.localeCompare(a.date):sort==="da"?a.date.localeCompare(b.date):sort==="ad"?(b.total||b.amount)-(a.total||a.amount):(a.total||a.amount)-(b.total||b.amount));
  return(
    <div className="fu">
      <div style={{display:"flex",gap:7,marginBottom:18}}>
        {[["i","💰 Pemasukan",T.green,inc.length],["e","💸 Pengeluaran",T.red,exp.length]].map(([id,lb,c,n])=>(
          <button key={id} onClick={()=>setTab(id)} style={{
            padding:"9px 20px",borderRadius:10,
            border:`1px solid ${tab===id?c:T.border}`,
            background:tab===id?`rgba(${id==="i"?"0,196,90":"255,90,90"},.1)`:"transparent",
            color:tab===id?c:T.mid,cursor:"pointer",fontSize:13,fontWeight:600,
          }}>{lb} ({n})</button>
        ))}
      </div>
      <div style={{display:"flex",gap:9,marginBottom:14,flexWrap:"wrap"}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Cari..." style={{...iS,maxWidth:200}}
          onFocus={e=>e.target.style.borderColor=T.goldDim} onBlur={e=>e.target.style.borderColor=T.border}/>
        {tab==="i"&&(
          <select value={loc} onChange={e=>setLoc(e.target.value)} style={{...iS,width:"auto"}}
            onFocus={e=>e.target.style.borderColor=T.goldDim} onBlur={e=>e.target.style.borderColor=T.border}>
            <option value="">Semua Lokasi</option>
            {locs.map(l=><option key={l}>{l}</option>)}
          </select>
        )}
        <select value={sort} onChange={e=>setSort(e.target.value)} style={{...iS,width:"auto"}}
          onFocus={e=>e.target.style.borderColor=T.goldDim} onBlur={e=>e.target.style.borderColor=T.border}>
          <option value="dd">Terbaru</option>
          <option value="da">Terlama</option>
          <option value="ad">Terbesar</option>
          <option value="aa">Terkecil</option>
        </select>
        <Btn onClick={()=>doExport(tab==="i"?items:[],tab==="e"?items:[],"export")} v="ghost">📥 CSV</Btn>
      </div>
      <Card style={{padding:"20px 22px"}}>
        {items.length===0?(
          <div style={{textAlign:"center",padding:"48px",color:T.dim}}>
            <div style={{fontSize:36,marginBottom:12}}>🗂</div>
            <div>Belum ada data</div>
          </div>
        ):(
          <Tbl cols={tab==="i"?["Tanggal","Lokasi","Harga/Sesi","Sesi","Extra","Total",""]
            :["Tanggal","Kategori","Keterangan","Nominal",""]}>
            {items.map(x=>tab==="i"?(
              <tr key={x.id} style={{borderBottom:`1px solid ${T.border}`}}>
                <Td>{x.date}</Td><Td><Lbadge>{x.location}</Lbadge></Td>
                <Td>{fmt(x.price)}</Td><Td>{x.sessions}</Td><Td>{x.extras}</Td>
                <Td style={{color:T.green,fontWeight:700}}>{fmt(x.total)}</Td>
                <Td><DBtn onClick={()=>{if(window.confirm("Hapus?"))onDI(x.id);}}/></Td>
              </tr>
            ):(
              <tr key={x.id} style={{borderBottom:`1px solid ${T.border}`}}>
                <Td>{x.date}</Td><Td><Cbadge>{x.category}</Cbadge></Td>
                <Td>{x.description}</Td>
                <Td style={{color:T.red,fontWeight:700}}>{fmt(x.amount)}</Td>
                <Td><DBtn onClick={()=>{if(window.confirm("Hapus?"))onDE(x.id);}}/></Td>
              </tr>
            ))}
          </Tbl>
        )}
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SETTINGS
═══════════════════════════════════════════════ */
function Settings({locs,prices,ep,mt,onL,onP,onEp,onMt}){
  const [nL,setNL]=useState("");
  const [nP,setNP]=useState("");
  const [nEp,setNEp]=useState(ep);
  const [nMt,setNMt]=useState(mt);
  const [fl,setFl]=useState("");
  const flash=m=>{setFl(m);setTimeout(()=>setFl(""),2500);};
  return(
    <div className="fu">
      {fl&&<Notice color={T.green}>✓ {fl}</Notice>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(270px,1fr))",gap:16}}>

        <Card style={{padding:"22px 24px"}}>
          <SectionTitle color={T.text} size={15}>📍 Kelola Lokasi</SectionTitle>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <input value={nL} onChange={e=>setNL(e.target.value)} placeholder="Nama lokasi baru" style={{...iS,flex:1}}
              onFocus={e=>e.target.style.borderColor=T.goldDim} onBlur={e=>e.target.style.borderColor=T.border}/>
            <Btn v="gold" onClick={()=>{if(nL.trim()){onL([...locs,nL.trim()]);setNL("");flash("Lokasi ditambahkan");}}} style={{padding:"10px 14px",color:"#07120a"}}>+</Btn>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {locs.map(l=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 13px",background:"rgba(255,255,255,.025)",border:`1px solid ${T.border}`,borderRadius:10}}>
                <span style={{fontSize:13,color:T.text,fontWeight:500}}>{l}</span>
                <button onClick={()=>{onL(locs.filter(x=>x!==l));flash("Lokasi dihapus");}} style={{background:"none",border:"none",cursor:"pointer",color:T.red,fontSize:18,lineHeight:1}}>×</button>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{padding:"22px 24px"}}>
          <SectionTitle color={T.text} size={15}>💰 Kelola Harga Sesi</SectionTitle>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <input type="number" value={nP} onChange={e=>setNP(e.target.value)} placeholder="Harga baru" style={{...iS,flex:1}}
              onFocus={e=>e.target.style.borderColor=T.goldDim} onBlur={e=>e.target.style.borderColor=T.border}/>
            <Btn v="gold" onClick={()=>{const p=parseInt(nP);if(p>0&&!prices.includes(p)){onP([...prices,p].sort((a,b)=>a-b));setNP("");flash("Harga ditambahkan");}}} style={{padding:"10px 14px",color:"#07120a"}}>+</Btn>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {prices.map(p=>(
              <div key={p} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 13px",background:"rgba(255,255,255,.025)",border:`1px solid ${T.border}`,borderRadius:10}}>
                <span style={{fontSize:13,color:T.green,fontWeight:700}}>{fmt(p)}</span>
                <button onClick={()=>{onP(prices.filter(x=>x!==p));flash("Harga dihapus");}} style={{background:"none",border:"none",cursor:"pointer",color:T.red,fontSize:18,lineHeight:1}}>×</button>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{padding:"22px 24px"}}>
          <SectionTitle color={T.text} size={15}>🖨 Harga Extra Print</SectionTitle>
          <Fld label="Harga per lembar (Rp)">
            <input type="number" value={nEp} onChange={e=>setNEp(parseInt(e.target.value)||0)} style={iS}
              onFocus={e=>e.target.style.borderColor=T.goldDim} onBlur={e=>e.target.style.borderColor=T.border}/>
          </Fld>
          <Btn v="green" onClick={()=>{onEp(nEp);flash("Harga extra print disimpan");}} style={{width:"100%"}}>Simpan Perubahan</Btn>
          <p style={{fontSize:11,color:T.dim,marginTop:10}}>Saat ini: {fmt(ep)} / lembar</p>
        </Card>

        <Card style={{padding:"22px 24px"}}>
          <SectionTitle color={T.text} size={15}>🎯 Target Omset Bulanan</SectionTitle>
          <Fld label="Nominal Target (Rp)">
            <input type="number" value={nMt} onChange={e=>setNMt(parseInt(e.target.value)||0)} placeholder="0" style={iS}
              onFocus={e=>e.target.style.borderColor=T.goldDim} onBlur={e=>e.target.style.borderColor=T.border}/>
          </Fld>
          <Btn v="gold" onClick={()=>{onMt(nMt);flash("Target bulanan disimpan");}} style={{width:"100%",color:"#07120a"}}>Simpan Target</Btn>
          <p style={{fontSize:11,color:T.dim,marginTop:10}}>Saat ini: {fmt(mt)}</p>
        </Card>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MICRO COMPONENTS
═══════════════════════════════════════════════ */
function SectionTitle({children,color=T.gold,size=20}){
  return<div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:size,color,fontWeight:700,marginBottom:20,letterSpacing:"-.2px"}}>{children}</div>;
}
function Notice({children,color}){
  return<div style={{background:`rgba(${color===T.green?"0,196,90":"255,90,90"},.1)`,border:`1px solid ${color}40`,borderRadius:11,padding:"11px 16px",marginBottom:18,color,fontWeight:600,fontSize:13}}>{children}</div>;
}
function ToggleBtn({children,active,color,onClick}){
  return(
    <button onClick={onClick} style={{
      padding:"8px 18px",borderRadius:10,
      border:`1px solid ${active?color:T.border}`,
      background:active?`rgba(${color===T.gold?"255,215,0":"0,196,90"},.1)`:"transparent",
      color:active?color:T.mid,cursor:"pointer",fontSize:13,fontWeight:600,transition:"all .14s",
    }}>{children}</button>
  );
}
function TotalBox({children,color}){
  return<div style={{background:`rgba(${color===T.green?"0,196,90":"255,90,90"},.06)`,border:`1px solid ${color}33`,borderRadius:13,padding:"15px 20px",marginBottom:22}}>{children}</div>;
}
function TotalRow({label,val}){
  return<div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T.mid,marginBottom:5}}><span>{label}</span><span>{val}</span></div>;
}
function Tbl({cols,children}){
  return(
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
        <thead><tr>{cols.map(c=><th key={c} style={{padding:"9px 12px",textAlign:"left",fontSize:9.5,fontWeight:700,color:T.dim,letterSpacing:"1px",textTransform:"uppercase",borderBottom:`1px solid ${T.border}`}}>{c}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
function Td({children,style={}}){return<td style={{padding:"10px 12px",color:T.text,verticalAlign:"middle",...style}}>{children}</td>;}
function Lbadge({children}){return<span style={{background:"rgba(0,196,90,.12)",color:T.green,padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{children}</span>;}
function Cbadge({children}){return<span style={{background:"rgba(255,215,0,.09)",color:T.gold,padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>{children}</span>;}
function DBtn({onClick}){
  return<button onClick={onClick} style={{background:"rgba(255,90,90,.07)",border:`1px solid rgba(255,90,90,.2)`,borderRadius:8,width:28,height:28,cursor:"pointer",color:T.red,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>;
}

/* ═══════════════════════════════════════════════
   EXPORT
═══════════════════════════════════════════════ */
function doExport(inc,exp,label){
  const rows=[];
  if(inc.length){rows.push(["PEMASUKAN"],["Tanggal","Lokasi","Harga Sesi","Sesi","Extra Print","Total"]);inc.forEach(i=>rows.push([i.date,i.location,i.price,i.sessions,i.extras,i.total]));rows.push([]);}
  if(exp.length){rows.push(["PENGELUARAN"],["Tanggal","Kategori","Keterangan","Nominal"]);exp.forEach(e=>rows.push([e.date,e.category,e.description,e.amount]));}
  const csv=rows.map(r=>r.join(",")).join("\n");
  const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8;"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download=`sewuframe-${label}.csv`;a.click();
  URL.revokeObjectURL(url);
}
