import { useState } from "react";
import { useApp } from "../context/AppContext";
import { CoinChip, StatCard, SectionHeader, EmptyState, Sparkline, CandleChart, Modal } from "../components/UI";


// ══════════════════════════════════════════════════════════════
//  PORTFOLIO PAGE
// ══════════════════════════════════════════════════════════════
export default function PortfolioPage() {
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