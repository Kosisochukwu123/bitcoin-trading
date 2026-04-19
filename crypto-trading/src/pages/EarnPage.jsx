export default function EarnPage() {
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
