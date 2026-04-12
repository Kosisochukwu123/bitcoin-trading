import { useState } from "react";
import { useApp } from "../context/AppContext";
import { CoinChip, StatCard, SectionHeader, EmptyState, Sparkline, CandleChart, Modal } from "../components/UI";


// ══════════════════════════════════════════════════════════════
//  PORTFOLIO PAGE
// ══════════════════════════════════════════════════════════════
export function PortfolioPage() {
  const { user, coins, trades, navigate } = useApp();

  const holdings = Object.entries(user?.portfolio || {})
    .filter(([, a]) => a > 0)
    .map(([id, amount]) => {
      const coin = coins.find(c => c.id === id);
      return coin ? { ...coin, amount, value: coin.price * amount } : null;
    })
    .filter(Boolean);

  const portVal  = holdings.reduce((s, h) => s + h.value, 0);
  const totalVal = (user?.balance || 0) + portVal;
  const myTrades = trades.filter(t => t.userId === user?.id);

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Portfolio</h1>
        <p>Track your assets and performance in real time</p>
      </div>

      <div className="grid-3 mb-20">
        <StatCard label="Total Portfolio Value" value={`$${totalVal.toLocaleString(undefined,{maximumFractionDigits:2})}`} sub="All assets combined" subColor="var(--green)" accentColor="var(--green)"/>
        <StatCard label="Crypto Holdings"       value={`$${portVal.toLocaleString(undefined,{maximumFractionDigits:2})}`}  sub={`${holdings.length} assets`} subColor="var(--gold)" accentColor="var(--gold)"/>
        <StatCard label="Cash (USDT)"           value={`$${(user?.balance||0).toLocaleString(undefined,{maximumFractionDigits:2})}`} sub="Available to trade" subColor="var(--text-muted)" accentColor="var(--blue)"/>
      </div>

      <div className="grid-2 mb-20">
        {/* Allocation pie */}
        <div className="card">
          <SectionHeader title="Allocation"/>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
            <svg width={150} height={150} viewBox="0 0 150 150">
              {(() => {
                const items = [
                  ...holdings.map(h => ({ n:h.id, v:h.value, color:h.color })),
                  { n:"USDT", v:user?.balance||0, color:"#10b981" },
                ];
                const tot = items.reduce((s,i) => s+i.v, 0);
                let off = 0;
                return items.map(item => {
                  const pct = tot > 0 ? item.v / tot : 0;
                  const ang = pct * 360;
                  const r=58, cx=75, cy=75;
                  const sR=(off-90)*Math.PI/180, eR=(off+ang-90)*Math.PI/180;
                  off += ang;
                  const x1=cx+r*Math.cos(sR),y1=cy+r*Math.sin(sR);
                  const x2=cx+r*Math.cos(eR),y2=cy+r*Math.sin(eR);
                  return ang > 1 ? (
                    <path key={item.n}
                      d={`M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${ang>180?1:0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`}
                      fill={item.color} opacity={0.82}
                    />
                  ) : null;
                });
              })()}
              <circle cx="75" cy="75" r="34" fill="var(--bg-elevated)"/>
              <text x="75" y="71" textAnchor="middle" fill="var(--text-primary)" fontSize="11" fontWeight="800">
                {holdings.length + 1}
              </text>
              <text x="75" y="84" textAnchor="middle" fill="var(--text-muted)" fontSize="9">
                Assets
              </text>
            </svg>
          </div>
          {[...holdings, { id:"USDT", color:"#10b981", value:user?.balance||0 }].map(h => (
            <div key={h.id} className="alloc-item">
              <div style={{ display:"flex", alignItems:"center" }}>
                <div className="alloc-dot" style={{ background:h.color }}/>
                <span className="alloc-name">{h.id}</span>
              </div>
              <span className="alloc-pct">{totalVal>0?((h.value/totalVal)*100).toFixed(1):0}%</span>
            </div>
          ))}
        </div>

        {/* Holdings table */}
        <div className="card">
          <SectionHeader title="Holdings" action="Trade →" onAction={() => navigate("trade")}/>
          {holdings.length === 0
            ? <EmptyState message="No holdings yet." cta="Start trading →" onCta={() => navigate("trade")}/>
            : <>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:10, fontSize:10, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:10, paddingBottom:10, borderBottom:"1px solid var(--border-subtle)" }}>
                <span>Asset</span><span>Price</span><span>Amount</span><span>Value</span><span>24h</span>
              </div>
              {holdings.map(h => (
                <div key={h.id} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:10, alignItems:"center", marginBottom:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <CoinChip coin={h}/>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13 }}>{h.id}</div>
                      <div style={{ fontSize:10, color:"var(--text-muted)" }}>{h.name}</div>
                    </div>
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, fontFamily:"var(--font-mono)" }}>${h.price.toLocaleString()}</span>
                  <span style={{ fontSize:12, color:"var(--text-secondary)", fontFamily:"var(--font-mono)" }}>{h.amount.toFixed(4)}</span>
                  <span style={{ fontSize:12, fontWeight:700, fontFamily:"var(--font-mono)" }}>${h.value.toLocaleString(undefined,{maximumFractionDigits:2})}</span>
                  <span style={{ fontSize:12, fontWeight:700, color: h.change>=0?"var(--green)":"var(--red)" }}>{h.change>=0?"+":""}{h.change}%</span>
                </div>
              ))}
            </>
          }
        </div>
      </div>

      {/* Trade history */}
      <div className="table-wrap">
        <div style={{ padding:"16px 20px", fontWeight:700, fontSize:15, borderBottom:"1px solid var(--border-subtle)" }}>Trade History</div>
        <div className="table-head" style={{ gridTemplateColumns:"0.8fr 0.8fr 1fr 1fr 1fr 1.5fr" }}>
          <span>Type</span><span>Coin</span><span>Amount</span><span>Price</span><span>Total</span><span>Date</span>
        </div>
        {myTrades.length === 0
          ? <div className="empty-state">No trades yet.</div>
          : myTrades.map(t => (
            <div key={t.id} className="table-row" style={{ gridTemplateColumns:"0.8fr 0.8fr 1fr 1fr 1fr 1.5fr" }}>
              <span className={`badge badge-${t.type}`}>{t.type.toUpperCase()}</span>
              <span style={{ fontWeight:700, fontSize:13 }}>{t.coin}</span>
              <span style={{ fontSize:12, fontFamily:"var(--font-mono)", color:"var(--text-secondary)" }}>{t.amount.toFixed(4)}</span>
              <span style={{ fontSize:12, fontFamily:"var(--font-mono)" }}>${t.price.toLocaleString()}</span>
              <span style={{ fontSize:13, fontWeight:700, fontFamily:"var(--font-mono)" }}>${t.total.toLocaleString(undefined,{maximumFractionDigits:2})}</span>
              <span style={{ fontSize:11, color:"var(--text-muted)" }}>{new Date(t.time).toLocaleString()}</span>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  FUTURES PAGE
// ══════════════════════════════════════════════════════════════
export function FuturesPage() {
  const { coins, executeTrade } = useApp();
  const [sel,    setSel]   = useState("BTC");
  const [lev,    setLev]   = useState(10);
  const [side,   setSide]  = useState("long");
  const [margin, setMargin]= useState("");
  const [result, setResult]= useState(null);

  const coin    = coins.find(c => c.id === sel);
  const posSize = parseFloat(margin || 0) * lev;
  const liqPrice = side === "long"
    ? ((coin?.price||0) * (1 - 0.9/lev))
    : ((coin?.price||0) * (1 + 0.9/lev));

  const openPosition = () => {
    const qty = posSize / (coin?.price || 1);
    const res = executeTrade(sel, side === "long" ? "buy" : "sell", qty, coin?.price);
    setResult(res);
    if (res.success) { setMargin(""); setTimeout(() => setResult(null), 3000); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Futures Trading</h1>
        <span className="badge badge-gold" style={{ fontSize:12, padding:"5px 14px" }}>
          ⚠️ High Risk — Demo Mode
        </span>
      </div>

      <div className="futures-layout">
        <div>
          {/* Pair selector + chart */}
          <div className="card mb-12">
            <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
              {coins.slice(0,5).map(c => (
                <button
                  key={c.id}
                  onClick={() => setSel(c.id)}
                  style={{
                    padding:"6px 16px", borderRadius:8, fontFamily:"var(--font-body)", fontSize:13, fontWeight:600,
                    border:`1px solid ${sel===c.id ? "var(--border-gold)" : "var(--border-soft)"}`,
                    background: sel===c.id ? "var(--gold-dim)" : "transparent",
                    color: sel===c.id ? "var(--gold)" : "var(--text-secondary)",
                  }}
                >
                  {c.id} · <span style={{ fontFamily:"var(--font-mono)", fontSize:11 }}>${c.price.toLocaleString()}</span>
                </button>
              ))}
              <div style={{ marginLeft:"auto", fontFamily:"var(--font-mono)", fontSize:20, fontWeight:800, color: coin?.change>=0?"var(--green)":"var(--red)" }}>
                ${coin?.price?.toLocaleString()}
              </div>
            </div>
            <CandleChart height={230} seed={coins.findIndex(c=>c.id===sel)+5}/>
          </div>

          {/* Open positions (empty state) */}
          <div className="card">
            <div style={{ fontWeight:700, fontSize:14, marginBottom:14 }}>Open Positions</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr 1fr", gap:10, fontSize:10, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:10, paddingBottom:10, borderBottom:"1px solid var(--border-subtle)" }}>
              <span>Symbol</span><span>Side</span><span>Size</span><span>Entry</span><span>Liq. Price</span><span>PnL</span>
            </div>
            <EmptyState message="No open positions." cta="Open one using the panel →" onCta={()=>{}}/>
          </div>
        </div>

        {/* Trade panel */}
        <div className="card" style={{ height:"fit-content" }}>
          <div className="toggle-wrap mb-16">
            <button className={`toggle-btn long${side==="long"?" active":""}`} onClick={() => setSide("long")}>📈 Long</button>
            <button className={`toggle-btn short${side==="short"?" active":""}`} onClick={() => setSide("short")}>📉 Short</button>
          </div>

          {/* Leverage slider */}
          <div style={{ marginBottom:20 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontWeight:700, color:"var(--text-secondary)", marginBottom:8 }}>
              <span>Leverage</span>
              <span style={{ color:"var(--gold)", fontFamily:"var(--font-mono)", fontSize:14 }}>{lev}×</span>
            </div>
            <input
              type="range" min="1" max="125" value={lev}
              onChange={e => setLev(Number(e.target.value))}
              className="lev-track"
            />
            <div className="lev-labels"><span>1×</span><span>25×</span><span>50×</span><span>75×</span><span>125×</span></div>
            {/* Risk indicator */}
            <div style={{ marginTop:8, height:4, borderRadius:4, background:"linear-gradient(90deg, var(--green), #f59e0b 60%, var(--red))", position:"relative" }}>
              <div style={{ position:"absolute", top:-2, width:8, height:8, background:"var(--text-primary)", borderRadius:"50%", left:`${(lev/125)*100}%`, transform:"translateX(-50%)", boxShadow:"0 0 6px rgba(0,0,0,0.5)" }}/>
            </div>
          </div>

          <div style={{ marginBottom:12 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:"var(--text-muted)", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.4px" }}>Margin (USDT)</label>
            <input type="number" value={margin} onChange={e => setMargin(e.target.value)} placeholder="0.00"/>
          </div>

          <div className="pos-details mb-16">
            <div className="pos-row"><span className="pos-lbl">Position Size</span><span className="pos-val">${posSize.toLocaleString(undefined,{maximumFractionDigits:2})}</span></div>
            <div className="pos-row"><span className="pos-lbl">Entry Price</span><span className="pos-val">${coin?.price?.toLocaleString()}</span></div>
            <div className="pos-row"><span className="pos-lbl">Liq. Price</span><span className="pos-val" style={{ color:"var(--red)" }}>${liqPrice.toFixed(2)}</span></div>
            <div className="pos-row"><span className="pos-lbl">Margin Ratio</span><span className="pos-val">{(100/lev).toFixed(1)}%</span></div>
          </div>

          <button
            className="btn w-full"
            style={{
              padding:13, fontSize:15, borderRadius:12,
              background: side === "long" ? "linear-gradient(135deg,#059669,var(--green))" : "linear-gradient(135deg,#dc2626,var(--red))",
              color:"#fff",
              boxShadow: side === "long" ? "0 2px 12px rgba(16,185,129,0.3)" : "0 2px 12px rgba(239,68,68,0.3)",
            }}
            onClick={openPosition}
            disabled={!parseFloat(margin)}
          >
            Open {lev}× {side === "long" ? "Long" : "Short"}
          </button>
          {result && <div className={`trade-result ${result.success?"success":"error"}`}>{result.success?"✅ Position opened!":"❌ Failed"}</div>}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  P2P PAGE
// ══════════════════════════════════════════════════════════════


// ══════════════════════════════════════════════════════════════
//  EARN PAGE
// ══════════════════════════════════════════════════════════════
export function EarnPage() {
  const products = [
    { n:"BTC Flexible",  coin:"BTC",   apy:"3.5%",   minAmt:"0.001 BTC",  type:"Flexible",    risk:"Low",    icon:"₿", color:"#f7931a", users:"2.1M" },
    { n:"ETH Staking",   coin:"ETH",   apy:"4.2%",   minAmt:"0.1 ETH",    type:"60-day lock", risk:"Low",    icon:"Ξ", color:"#627eea", users:"1.4M" },
    { n:"BNB Vault",     coin:"BNB",   apy:"8.7%",   minAmt:"0.5 BNB",    type:"90-day lock", risk:"Medium", icon:"B", color:"#f0b90b", users:"890K" },
    { n:"SOL Staking",   coin:"SOL",   apy:"6.1%",   minAmt:"1 SOL",      type:"30-day lock", risk:"Low",    icon:"◎", color:"#9945ff", users:"540K" },
    { n:"USDT Savings",  coin:"USDT",  apy:"5.5%",   minAmt:"10 USDT",    type:"Flexible",    risk:"Low",    icon:"₮", color:"#10b981", users:"3.2M" },
    { n:"DeFi Mining",   coin:"Multi", apy:"15–50%", minAmt:"$100",       type:"Flexible",    risk:"High",   icon:"⛏", color:"#ef4444", users:"320K" },
  ];

  const riskColor = r => r === "Low" ? "var(--green)" : r === "Medium" ? "#f59e0b" : "var(--red)";

  return (
    <div className="page">
      <div className="page-header">
        <h1>Earn</h1>
        <p>Put your crypto to work and earn passive income</p>
      </div>

      {/* Banner */}
      <div className="card mb-24" style={{ background:"linear-gradient(135deg,rgba(16,185,129,0.07),rgba(247,147,26,0.04))", border:"1px solid var(--green-border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:800, marginBottom:4 }}>
            Earn up to <span style={{ color:"var(--green)" }}>50% APY</span>
          </div>
          <div style={{ fontSize:13, color:"var(--text-secondary)" }}>
            Over 12M users are already earning with CryptoX. Join them today.
          </div>
        </div>
        <button className="btn btn-buy" style={{ padding:"12px 28px", flexShrink:0 }}>
          Start Earning
        </button>
      </div>

      <div className="grid-3">
        {products.map(p => (
          <div key={p.n} className="earn-card">
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
              <div className="coin-chip" style={{ width:44, height:44, background:`${p.color}18`, border:`1px solid ${p.color}35`, color:p.color, fontSize:20, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800 }}>{p.icon}</div>
              <div>
                <div style={{ fontWeight:700, fontSize:15 }}>{p.n}</div>
                <div style={{ fontSize:11, color:"var(--text-muted)" }}>{p.type}</div>
              </div>
              <div style={{ marginLeft:"auto" }}>
                <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:4, background:`${riskColor(p.risk)}18`, color:riskColor(p.risk) }}>
                  {p.risk}
                </span>
              </div>
            </div>

            <div className="earn-apy">{p.apy}</div>
            <div className="earn-apy-lbl">Estimated APY</div>

            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16, fontSize:12 }}>
              <div><span style={{ color:"var(--text-muted)" }}>Min: </span><span style={{ fontWeight:600, fontFamily:"var(--font-mono)" }}>{p.minAmt}</span></div>
              <div style={{ color:"var(--text-muted)" }}>👥 {p.users}</div>
            </div>

            {/* Progress-style bar */}
            <div style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"var(--text-muted)", marginBottom:4 }}>
                <span>Capacity used</span><span>{Math.floor(Math.random()*40+40)}%</span>
              </div>
              <div className="progress">
                <div className="progress-fill" style={{ width:`${Math.floor(Math.random()*40+40)}%`, background: p.color }}/>
              </div>
            </div>

            <button
              className="btn w-full"
              style={{ padding:"10px 0", background:`${p.color}15`, border:`1px solid ${p.color}35`, color:p.color, borderRadius:10 }}
            >
              Subscribe Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  ADMIN PAGE
// ══════════════════════════════════════════════════════════════

// export default MarketPage;