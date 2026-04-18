/**
 * AdminPage.jsx
 * =============
 * Admin control panel. Three tabs:
 *
 *  1. USERS — for each user the admin can:
 *     - Fund USDT balance (add / subtract / set exact)
 *     - Fund a specific COIN (BTC, ETH, LTC, etc.)
 *       → user's portfolio[coin] increases immediately
 *       → user sees the coin in their dashboard/wallet
 *     - Set trade override (profit / loss / block)
 *     - Reset account
 *     - Ban / Unban
 *
 *  2. TRADES — full platform trade history
 *
 *  3. PRICES — manually set any coin's price
 *
 * Every action writes to the shared context → localStorage → user
 * sees the change instantly (same tab) or on next interaction
 * (cross-tab via storage event).
 */

import { useState } from "react";
import { useApp, SUPPORTED_COINS } from "../context/AppContext";
import { CoinChip, StatCard, Modal } from "../components/UI";

// ── Small badge component ─────────────────────────────────────
function Badge({ children, color = "#8896b3", bg = "rgba(255,255,255,.05)" }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 9px", borderRadius: 99,
      fontSize: 11, fontWeight: 700,
      background: bg, color,
      border: `1px solid ${color}35`,
    }}>
      {children}
    </span>
  );
}

// ── Mode selector button ──────────────────────────────────────
function ModeBtn({ active, color, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: "8px 4px", borderRadius: 8, cursor: "pointer",
      fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12,
      border:     `1.5px solid ${active ? color : "rgba(255,255,255,.1)"}`,
      background: active ? `${color}14` : "transparent",
      color:      active ? color        : "var(--text-muted)",
    }}>
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
export default function AdminPage() {

  // Pull every admin function from context
  const {
    users, trades, coins,
    overrides, setAdminOverride,
    fundUserBalance,
    fundUserCoin,
    resetUserAccount,
    banUser,
    updateCoinPrice,
    addNotif,
  } = useApp();

  const [tab,  setTab]  = useState("users");  // users | trades | prices
  const [editP, setEditP] = useState({});     // for price control inputs

  // ── Fund modal state ──────────────────────────────────────
  const [fundTarget, setFundTarget] = useState(null); // the user object being funded
  const [fundTab,    setFundTab]    = useState("usdt"); // "usdt" | "coin"
  const [fundMode,   setFundMode]   = useState("add");  // "add" | "subtract" | "set"
  const [fundAmt,    setFundAmt]    = useState("");
  const [fundCoin,   setFundCoin]   = useState("BTC");
  const [fundCoinAmt,setFundCoinAmt]= useState("");

  // ── Confirm modal ─────────────────────────────────────────
  const [confirm, setConfirm] = useState(null); // { message, onConfirm }

  const regulars   = users.filter(u => !u.isAdmin);
  const totalVol   = trades.reduce((s, t) => s + t.total, 0);
  const activeOvrs = Object.values(overrides).filter(v => v && v !== "none").length;

  const MONO = { fontFamily: "var(--font-mono)" };
  const LBL  = { fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".4px", display: "block", marginBottom: 6 };
  const OVERRIDES = [
    { v:"none",         icon:"⚖️", label:"Normal",       color:"var(--text-muted)", desc:"Standard market behaviour"  },
    { v:"force_profit", icon:"📈", label:"Force Profit",  color:"#10b981",           desc:"User always gains 10%"      },
    { v:"force_loss",   icon:"📉", label:"Force Loss",    color:"#ef4444",           desc:"User always loses 10%"      },
    { v:"force_fail",   icon:"🚫", label:"Block Trades",  color:"#f59e0b",           desc:"All trades return error"    },
  ];

  // ── Open fund modal ────────────────────────────────────────
  const openFund = (u) => {
    setFundTarget(u);
    setFundTab("usdt");
    setFundMode("add");
    setFundAmt("");
    setFundCoinAmt("");
    setFundCoin(SUPPORTED_COINS[0]?.id || "BTC");
  };

  // ── Handle USDT funding ────────────────────────────────────
  const handleFundUSDT = () => {
    const amt = parseFloat(fundAmt);
    if (!amt || amt <= 0) { addNotif("Enter a valid amount", "error"); return; }
    fundUserBalance(fundTarget.id, amt, fundMode);
    setFundTarget(null);
  };

  // ── Handle coin funding ────────────────────────────────────
  // This puts the coin directly into user.portfolio[fundCoin]
  // The user sees it immediately in their dashboard and wallet.
  const handleFundCoin = () => {
    const amt = parseFloat(fundCoinAmt);
    if (!amt || amt <= 0) { addNotif("Enter a valid amount", "error"); return; }
    fundUserCoin(fundTarget.id, fundCoin, amt, fundMode);
    setFundTarget(null);
  };

  // ── Preview: what will the balance be after? ──────────────
  const previewBal = () => {
    if (!fundTarget || !fundAmt || parseFloat(fundAmt) <= 0) return null;
    const a = parseFloat(fundAmt), b = fundTarget.balance;
    if (fundMode === "set")      return a;
    if (fundMode === "add")      return b + a;
    if (fundMode === "subtract") return Math.max(0, b - a);
    return b;
  };

  const fmt2 = n => n.toLocaleString(undefined, { minimumFractionDigits:2, maximumFractionDigits:2 });

  // ─────────────────────────────────────────────────────────
  return (
    <div className="page">

      {/* ── CONFIRM MODAL ──────────────────────────────────── */}
      {confirm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.72)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }}
          onClick={e => e.target===e.currentTarget && setConfirm(null)}>
          <div style={{ background:"var(--bg-overlay)", border:"1px solid var(--border-soft)", borderRadius:18, padding:28, width:"100%", maxWidth:380 }}>
            <div style={{ fontWeight:800, fontSize:17, marginBottom:12 }}>Confirm Action</div>
            <p style={{ color:"var(--text-secondary)", marginBottom:22, lineHeight:1.6 }}>{confirm.message}</p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setConfirm(null)} style={{ flex:1, padding:11, borderRadius:9, border:"1px solid var(--border-soft)", background:"rgba(255,255,255,.05)", color:"var(--text-secondary)", cursor:"pointer", fontFamily:"var(--font-body)", fontWeight:600 }}>Cancel</button>
              <button onClick={() => { confirm.onConfirm(); setConfirm(null); }} style={{ flex:1, padding:11, borderRadius:9, border:"none", background:"linear-gradient(135deg,#dc2626,#ef4444)", color:"#fff", cursor:"pointer", fontFamily:"var(--font-body)", fontWeight:700 }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* ── FUND USER MODAL ────────────────────────────────── */}
      {fundTarget && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.72)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }}
          onClick={e => e.target===e.currentTarget && setFundTarget(null)}>
          <div style={{ background:"var(--bg-overlay)", border:"1px solid var(--border-soft)", borderRadius:20, padding:30, width:"100%", maxWidth:430, maxHeight:"90vh", overflowY:"auto" }}>

            {/* Modal header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <div style={{ fontWeight:800, fontSize:17 }}>Fund Account</div>
              <button onClick={() => setFundTarget(null)} style={{ background:"transparent", border:"none", color:"var(--text-muted)", fontSize:22, cursor:"pointer", lineHeight:1 }}>×</button>
            </div>

            {/* User preview card */}
            <div style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", background:"rgba(255,255,255,.03)", borderRadius:10, marginBottom:18 }}>
              <div style={{ width:40, height:40, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:16, color:"#fff", flexShrink:0 }}>
                {fundTarget.name.charAt(0)}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{fundTarget.name}</div>
                <div style={{ fontSize:12, color:"var(--text-muted)" }}>{fundTarget.email}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ ...LBL, marginBottom:2 }}>USDT Balance</div>
                <div style={{ fontWeight:800, fontSize:16, color:"#10b981", ...MONO }}>${fmt2(fundTarget.balance)}</div>
              </div>
            </div>

            {/* USDT / Coin tab switcher */}
            <div style={{ display:"flex", background:"rgba(0,0,0,.3)", borderRadius:9, padding:3, marginBottom:18 }}>
              {[["usdt","💵 Fund USDT"],["coin","🪙 Fund Coin"]].map(([id, label]) => (
                <button key={id} onClick={() => { setFundTab(id); setFundMode("add"); }}
                  style={{ flex:1, padding:"7px 0", borderRadius:7, border:"none", cursor:"pointer", fontFamily:"var(--font-body)", fontWeight:700, fontSize:13, background: fundTab===id ? "rgba(247,147,26,.15)" : "transparent", color: fundTab===id ? "var(--gold)" : "var(--text-muted)" }}>
                  {label}
                </button>
              ))}
            </div>

            {/* ── USDT FUNDING TAB ── */}
            {fundTab === "usdt" && (
              <>
                <label style={LBL}>Operation</label>
                <div style={{ display:"flex", gap:6, marginBottom:16 }}>
                  <ModeBtn active={fundMode==="add"}      color="#10b981" label="➕ Add"       onClick={()=>setFundMode("add")} />
                  <ModeBtn active={fundMode==="subtract"} color="#ef4444" label="➖ Deduct"    onClick={()=>setFundMode("subtract")} />
                  <ModeBtn active={fundMode==="set"}      color="#f7931a" label="🎯 Set Exact" onClick={()=>setFundMode("set")} />
                </div>

                {/* Quick preset buttons */}
                <label style={LBL}>Quick Amount</label>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
                  {[100,500,1000,5000,10000].map(p => (
                    <button key={p} onClick={() => setFundAmt(String(p))}
                      style={{ padding:"5px 12px", borderRadius:7, cursor:"pointer", fontFamily:"var(--font-body)", fontSize:12, fontWeight:600, border:`1px solid ${fundAmt===String(p)?"var(--border-gold)":"rgba(255,255,255,.1)"}`, background:fundAmt===String(p)?"var(--gold-dim)":"transparent", color:fundAmt===String(p)?"var(--gold)":"var(--text-secondary)" }}>
                      ${p.toLocaleString()}
                    </button>
                  ))}
                </div>

                <label style={LBL}>Custom Amount (USDT)</label>
                <input type="number" value={fundAmt} placeholder="e.g. 2500" onChange={e => setFundAmt(e.target.value)} style={{ marginBottom:14 }} />

                {/* Preview */}
                {previewBal() !== null && (
                  <div style={{ padding:"10px 13px", background:"rgba(255,255,255,.03)", borderRadius:8, fontSize:13, marginBottom:16 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <span style={{ color:"var(--text-muted)" }}>Current</span>
                      <span style={MONO}>${fmt2(fundTarget.balance)}</span>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ color:"var(--text-muted)" }}>After {fundMode}</span>
                      <span style={{ fontWeight:700, color:"#10b981", ...MONO }}>${fmt2(previewBal())}</span>
                    </div>
                  </div>
                )}

                <button className="btn btn-primary" style={{ width:"100%", padding:13, fontSize:14 }}
                  onClick={handleFundUSDT}
                  disabled={!fundAmt || parseFloat(fundAmt)<=0}>
                  {fundMode==="add" ? "➕ Credit USDT" : fundMode==="subtract" ? "➖ Deduct USDT" : "🎯 Set Balance"}
                </button>
              </>
            )}

            {/* ── COIN FUNDING TAB ── */}
            {fundTab === "coin" && (
              <>
                {/*
                  Admin picks a coin here.
                  When confirmed, fundUserCoin() is called.
                  → user.portfolio[coinId] += amount
                  → transaction record created
                  → user sees the coin in Dashboard, Portfolio, Wallet
                */}
                <label style={LBL}>Select Coin to Fund</label>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
                  {SUPPORTED_COINS.map(c => {
                    const coin = coins.find(x => x.id === c.id);
                    return (
                      <button key={c.id} onClick={() => setFundCoin(c.id)}
                        style={{ padding:"7px 14px", borderRadius:8, cursor:"pointer", fontFamily:"var(--font-body)", fontSize:13, fontWeight:700, border:`1.5px solid ${fundCoin===c.id ? c.color : "rgba(255,255,255,.1)"}`, background:fundCoin===c.id ? `${c.color}18` : "transparent", color:fundCoin===c.id ? c.color : "var(--text-secondary)" }}>
                        {c.icon} {c.id}
                        {coin && <span style={{ fontSize:10, display:"block", fontWeight:400, color:fundCoin===c.id?`${c.color}99`:"var(--text-muted)" }}>${coin.price.toLocaleString()}</span>}
                      </button>
                    );
                  })}
                </div>

                <label style={LBL}>Operation</label>
                <div style={{ display:"flex", gap:6, marginBottom:16 }}>
                  <ModeBtn active={fundMode==="add"}      color="#10b981" label="➕ Grant"  onClick={()=>setFundMode("add")} />
                  <ModeBtn active={fundMode==="subtract"} color="#ef4444" label="➖ Remove" onClick={()=>setFundMode("subtract")} />
                  <ModeBtn active={fundMode==="set"}      color="#f7931a" label="🎯 Set"    onClick={()=>setFundMode("set")} />
                </div>

                <label style={LBL}>Amount ({fundCoin})</label>
                <input type="number" value={fundCoinAmt} placeholder={`e.g. 0.5 ${fundCoin}`} onChange={e => setFundCoinAmt(e.target.value)} style={{ marginBottom:8 }} />

                {/* Show user's current holding of that coin */}
                <div style={{ fontSize:12, color:"var(--text-muted)", marginBottom:16, padding:"8px 12px", background:"rgba(255,255,255,.03)", borderRadius:8 }}>
                  User currently holds:{" "}
                  <strong style={{ color:"var(--gold)", ...MONO }}>
                    {(fundTarget.portfolio?.[fundCoin] || 0).toFixed(6)} {fundCoin}
                  </strong>
                  {" "}≈{" "}
                  <strong style={{ color:"#10b981", ...MONO }}>
                    ${fmt2((fundTarget.portfolio?.[fundCoin] || 0) * (coins.find(c=>c.id===fundCoin)?.price || 0))}
                  </strong>
                </div>

                {/* What they'll have after */}
                {fundCoinAmt && parseFloat(fundCoinAmt) > 0 && (
                  <div style={{ padding:"10px 13px", background:"rgba(255,255,255,.03)", borderRadius:8, fontSize:13, marginBottom:16 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <span style={{ color:"var(--text-muted)" }}>Current {fundCoin}</span>
                      <span style={MONO}>{(fundTarget.portfolio?.[fundCoin]||0).toFixed(6)}</span>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ color:"var(--text-muted)" }}>After {fundMode}</span>
                      <span style={{ fontWeight:700, color:"#10b981", ...MONO }}>
                        {fundMode==="set"     ? parseFloat(fundCoinAmt).toFixed(6)
                        :fundMode==="add"     ? ((fundTarget.portfolio?.[fundCoin]||0)+parseFloat(fundCoinAmt)).toFixed(6)
                        : Math.max(0,(fundTarget.portfolio?.[fundCoin]||0)-parseFloat(fundCoinAmt)).toFixed(6)
                        } {fundCoin}
                      </span>
                    </div>
                  </div>
                )}

                <button className="btn btn-primary" style={{ width:"100%", padding:13, fontSize:14 }}
                  onClick={handleFundCoin}
                  disabled={!fundCoinAmt || parseFloat(fundCoinAmt)<=0}>
                  {fundMode==="subtract" ? `➖ Remove ${fundCoin}` : `➕ Grant ${fundCoin} to User`}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── PAGE HEADER ────────────────────────────────────── */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:8 }}>
          <div style={{ width:44, height:44, background:"linear-gradient(135deg,#f7931a,#ef4444)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>⚡</div>
          <h1>Admin Control Panel</h1>
        </div>
        <div style={{ padding:"10px 14px", background:"rgba(247,147,26,.05)", border:"1px solid var(--border-gold-s)", borderLeft:"3px solid var(--gold)", borderRadius:"0 10px 10px 0", fontSize:13, color:"var(--text-secondary)" }}>
          💡 Fund users with USDT or specific coins. Set trade overrides. Adjust market prices.
        </div>
      </div>

      {/* ── STATS ──────────────────────────────────────────── */}
      <div className="grid-4 mb-24">
        <StatCard label="Registered Users" value={regulars.length}  sub="Accounts" subColor="var(--blue)"  accentColor="var(--blue)"/>
        <StatCard label="Total Trades"     value={trades.length}    sub="All time" subColor="var(--gold)"  accentColor="var(--gold)"/>
        <StatCard label="Platform Volume"  value={`$${totalVol.toLocaleString(undefined,{maximumFractionDigits:0})}`} sub="Traded" subColor="var(--green)" accentColor="var(--green)"/>
        <StatCard label="Active Overrides" value={activeOvrs}       sub="Users"    subColor={activeOvrs>0?"var(--red)":"var(--text-muted)"} accentColor="var(--red)"/>
      </div>

      {/* ── TABS ───────────────────────────────────────────── */}
      <div className="tabs mb-20">
        {[{id:"users",l:"👥 Users"},{id:"trades",l:"📋 Trades"},{id:"prices",l:"💹 Prices"}].map(t => (
          <button key={t.id} className={`tab-btn${tab===t.id?" active":""}`} onClick={() => setTab(t.id)}>{t.l}</button>
        ))}
      </div>

      {/* ══════════ USERS TAB ══════════════════════════════ */}
      {tab === "users" && (
        <div>
          {regulars.length === 0 && (
            <div style={{ textAlign:"center", padding:"48px 20px", color:"var(--text-muted)" }}>No registered users yet.</div>
          )}
          {regulars.map(u => {
            const cur     = overrides[u.id] || "none";
            const portVal = Object.entries(u.portfolio||{}).reduce((s,[id,amt])=>{
              const c = coins.find(x=>x.id===id); return s+(c?c.price*amt:0);
            },0);
            const myTrades = trades.filter(t=>t.userId===u.id);
            const isBanned = !!u.banned;

            return (
              <div key={u.id} className="card" style={{ marginBottom:14, opacity:isBanned?0.7:1 }}>

                {/* User header */}
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:14, marginBottom:18 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:46, height:46, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-display)", fontWeight:800, fontSize:18, color:"#fff", flexShrink:0, position:"relative" }}>
                      {u.name.charAt(0)}
                      {isBanned && <div style={{ position:"absolute", inset:0, background:"rgba(239,68,68,.55)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🚫</div>}
                    </div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15, display:"flex", alignItems:"center", gap:8 }}>
                        {u.name}
                        {isBanned && <Badge color="#ef4444" bg="rgba(239,68,68,.12)">BANNED</Badge>}
                      </div>
                      <div style={{ fontSize:12, color:"var(--text-muted)" }}>{u.email} · {myTrades.length} trades</div>
                    </div>
                  </div>

                  {/* Balances + action buttons */}
                  <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:10, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:".4px" }}>USDT</div>
                      <div style={{ fontWeight:800, color:"#10b981", fontSize:15, ...MONO }}>${fmt2(u.balance)}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:10, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:".4px" }}>Portfolio</div>
                      <div style={{ fontWeight:800, color:"var(--gold)", fontSize:15, ...MONO }}>${fmt2(portVal)}</div>
                    </div>

                    {/* FUND button — opens the full fund modal */}
                    <button className="btn btn-buy" style={{ padding:"8px 18px", fontSize:13 }} onClick={() => openFund(u)}>
                      💳 Fund User
                    </button>
                    <button className="btn btn-ghost" style={{ padding:"8px 14px", fontSize:13, color:"var(--gold)", borderColor:"var(--border-gold-s)" }}
                      onClick={() => setConfirm({ message:`Reset ${u.name}'s account to $10,000 and clear portfolio?`, onConfirm:()=>resetUserAccount(u.id) })}>
                      🔄 Reset
                    </button>
                    <button className="btn btn-ghost"
                      style={{ padding:"8px 14px", fontSize:13, color:isBanned?"#10b981":"#ef4444", borderColor:isBanned?"rgba(16,185,129,.3)":"rgba(239,68,68,.3)" }}
                      onClick={() => setConfirm({ message:isBanned?`Unban ${u.name}?`:`Ban ${u.name}? They cannot trade.`, onConfirm:()=>banUser(u.id,!isBanned) })}>
                      {isBanned ? "✅ Unban" : "🚫 Ban"}
                    </button>
                  </div>
                </div>

                {/* Current coin holdings */}
                {Object.entries(u.portfolio||{}).filter(([,a])=>a>0).length > 0 && (
                  <div style={{ marginBottom:14, paddingBottom:14, borderBottom:"1px solid var(--border-subtle)" }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:".4px", marginBottom:8 }}>Holdings</div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      {Object.entries(u.portfolio).filter(([,a])=>a>0).map(([id,amt])=>{
                        const c = coins.find(x=>x.id===id);
                        if (!c) return null;
                        return (
                          <div key={id} style={{ padding:"5px 12px", background:"rgba(255,255,255,.03)", border:"1px solid var(--border-subtle)", borderRadius:8, fontSize:12 }}>
                            <span style={{ color:c.color, fontWeight:700, marginRight:4 }}>{c.icon} {id}</span>
                            <span style={{ ...MONO, color:"var(--text-secondary)" }}>{amt.toFixed(4)}</span>
                            <span style={{ color:"var(--text-muted)", marginLeft:4 }}>(${fmt2(c.price*amt)})</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Override selector */}
                <div style={{ fontSize:10, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:".4px", marginBottom:10 }}>
                  Trade Outcome Override
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {OVERRIDES.map(opt => {
                    const isActive = cur === opt.v;
                    return (
                      <button key={opt.v} onClick={() => setAdminOverride(u.id, opt.v)}
                        style={{
                          flex:"1 1 120px", padding:"11px 8px", borderRadius:10, cursor:"pointer",
                          fontFamily:"var(--font-body)", textAlign:"center",
                          border:`2px solid ${isActive ? opt.color : "var(--border-subtle)"}`,
                          background:isActive ? `${opt.color}12` : "rgba(255,255,255,.02)",
                          color:isActive ? opt.color : "var(--text-muted)",
                        }}>
                        <div style={{ fontSize:20, marginBottom:3 }}>{opt.icon}</div>
                        <div style={{ fontWeight:700, fontSize:12, marginBottom:2 }}>{opt.label}</div>
                        <div style={{ fontSize:10, opacity:.7 }}>{opt.desc}</div>
                        {isActive && <div style={{ marginTop:5, fontSize:9, fontWeight:800, background:opt.color, color:"#000", padding:"2px 8px", borderRadius:4, display:"inline-block" }}>ACTIVE</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════ TRADES TAB ════════════════════════════ */}
      {tab === "trades" && (
        <div className="table-wrap">
          <div style={{ padding:"14px 20px", fontWeight:700, fontSize:15, borderBottom:"1px solid var(--border-subtle)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span>All Platform Trades</span>
            <Badge color="var(--gold)" bg="var(--gold-dim)">{trades.length} total</Badge>
          </div>
          <div className="table-head" style={{ gridTemplateColumns:"1.5fr .8fr .8fr 1fr 1fr .9fr 1.2fr" }}>
            <span>User</span><span>Type</span><span>Coin</span><span>Amount</span><span>Total</span><span>Result</span><span>Time</span>
          </div>
          {trades.length === 0
            ? <div style={{ textAlign:"center", padding:"40px 20px", color:"var(--text-muted)" }}>No trades yet.</div>
            : trades.slice(0,50).map(t => {
              const u = users.find(x=>x.id===t.userId);
              return (
                <div key={t.id} className="table-row" style={{ gridTemplateColumns:"1.5fr .8fr .8fr 1fr 1fr .9fr 1.2fr" }}>
                  <span style={{ fontWeight:600, fontSize:13 }}>{u?.name||"Unknown"}</span>
                  <span className={`badge badge-${t.type}`}>{t.type.toUpperCase()}</span>
                  <span style={{ fontWeight:600 }}>{t.coin}</span>
                  <span style={{ ...MONO, fontSize:12 }}>{t.amount.toFixed(4)}</span>
                  <span style={{ fontWeight:700, ...MONO }}>${fmt2(t.total)}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:t.resultType==="profit"?"#10b981":t.resultType==="loss"?"#ef4444":"var(--text-muted)" }}>
                    {t.resultType||"normal"}
                  </span>
                  <span style={{ fontSize:11, color:"var(--text-muted)" }}>{new Date(t.time).toLocaleTimeString()}</span>
                </div>
              );
            })
          }
        </div>
      )}

      {/* ══════════ PRICES TAB ════════════════════════════ */}
      {tab === "prices" && (
        <div>
          <div style={{ padding:"10px 14px", background:"rgba(247,147,26,.05)", border:"1px solid var(--border-gold-s)", borderLeft:"3px solid var(--gold)", borderRadius:"0 10px 10px 0", fontSize:13, color:"var(--text-secondary)", marginBottom:20 }}>
            💹 Adjust any coin's price. Changes apply instantly and affect all portfolio valuations.
          </div>
          <div className="grid-2">
            {coins.map(c => (
              <div key={c.id} className="card">
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                  <CoinChip coin={c} size={40}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:15 }}>{c.name}</div>
                    <div style={{ fontSize:12, color:"var(--text-muted)" }}>
                      Current: <strong style={{ color:"var(--gold)", ...MONO }}>${c.price.toLocaleString()}</strong>
                    </div>
                  </div>
                  <span style={{ ...MONO, fontSize:13, fontWeight:700, color:c.change>=0?"#10b981":"#ef4444" }}>
                    {c.change>=0?"+":""}{c.change}%
                  </span>
                </div>
                <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                  <input type="number" placeholder={`New price for ${c.id}…`}
                    value={editP[c.id]||""}
                    onChange={e => setEditP(p=>({...p,[c.id]:e.target.value}))}/>
                  <button className="btn btn-primary" style={{ padding:"10px 16px", fontSize:13, flexShrink:0 }}
                    onClick={()=>{ const np=parseFloat(editP[c.id]); if(np>0){updateCoinPrice(c.id,np);setEditP(p=>({...p,[c.id]:""}));} }}>
                    Set
                  </button>
                </div>
                <div style={{ display:"flex", gap:5 }}>
                  {[{l:"-20%",f:.80},{l:"-10%",f:.90},{l:"-5%",f:.95},{l:"+5%",f:1.05},{l:"+10%",f:1.10},{l:"+20%",f:1.20}].map(({l,f})=>(
                    <button key={l}
                      style={{ flex:1, padding:"5px 0", borderRadius:6, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"var(--font-body)", border:"1px solid var(--border-soft)", background:"transparent", color:l.startsWith("+")?"#10b981":"#ef4444" }}
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
