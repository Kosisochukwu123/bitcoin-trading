import { useApp } from "../context/AppContext";

// ── COIN CHIP ──────────────────────────────────────────────
export function CoinChip({ coin, size = 36 }) {
  return (
    <div
      className="coin-chip"
      style={{
        width: size, height: size,
        background: `${coin.color}1a`,
        border: `1px solid ${coin.color}40`,
        color: coin.color,
        fontSize: size * 0.42,
      }}
    >
      {coin.icon}
    </div>
  );
}

// ── STAT CARD ──────────────────────────────────────────────
export function StatCard({ label, value, sub, subColor = "var(--text-muted)", accentColor }) {
  return (
    <div className="card stat-card">
      {accentColor && (
        <div style={{
          position:"absolute", top:-20, right:-20,
          width:80, height:80, borderRadius:"50%",
          background: accentColor, opacity:0.07
        }}/>
      )}
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-sub" style={{ color: subColor }}>{sub}</div>
    </div>
  );
}

// ── FORM INPUT ─────────────────────────────────────────────
export function FormInput({ label, type="text", value, onChange, placeholder, style={} }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label style={{
          display: "block",
          fontSize: 12,
          fontWeight: 700,
          color: "var(--text-secondary)",
          marginBottom: 5,
          letterSpacing: "0.3px"
        }}>
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={style}
      />
    </div>
  );
}

// ── SECTION HEADER ─────────────────────────────────────────
export function SectionHeader({ title, action, onAction }) {
  return (
    <div className="section-hdr">
      <h3>{title}</h3>
      {action && <a onClick={onAction}>{action}</a>}
    </div>
  );
}

// ── MODAL ──────────────────────────────────────────────────
export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div className="modal-title">{title}</div>
          <button
            onClick={onClose}
            style={{ background:"transparent", border:"none", color:"var(--text-muted)", fontSize:20, cursor:"pointer", lineHeight:1 }}
          >×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── EMPTY STATE ────────────────────────────────────────────
export function EmptyState({ message, cta, onCta }) {
  return (
    <div className="empty-state">
      <div style={{ fontSize:32, marginBottom:10 }}>📭</div>
      <div>{message} {cta && <a onClick={onCta}>{cta}</a>}</div>
    </div>
  );
}

// ── MINI SPARKLINE ─────────────────────────────────────────
export function Sparkline({ positive, color, width=70, height=28 }) {
  const pts = positive
    ? [30,28,32,25,34,30,38,36,43,40,46]
    : [46,43,40,38,36,37,30,28,25,22,20];
  const max = Math.max(...pts), min = Math.min(...pts);
  const toX = i => (i / (pts.length - 1)) * width;
  const toY = v => height - ((v - min) / ((max - min) || 1)) * height;
  const d = pts.map((v,i) => `${i===0?"M":"L"} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(" ");
  return (
    <svg className="sparkline" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={`${d} L ${width} ${height} L 0 ${height} Z`}
        fill={`${color}20`} />
      <path d={d} stroke={color} strokeWidth="1.8" fill="none" />
    </svg>
  );
}

// ── CANDLE CHART ───────────────────────────────────────────
export function CandleChart({ height=240, seed=1 }) {
  return (
    <div className="chart-area" style={{ height }}>
      {Array.from({ length:70 }, (_, i) => {
        const h = 30 + Math.sin((i + seed) * 0.25) * 22 + ((i * seed * 7) % 30);
        const up = ((i * seed + 3) % 5) !== 0;
        return (
          <div
            key={i}
            className="candle-bar"
            style={{
              height: `${Math.max(h, 8)}%`,
              background: up ? "rgba(16,185,129,0.75)" : "rgba(239,68,68,0.75)",
            }}
          />
        );
      })}
    </div>
  );
}

// ── ORDER BOOK ROWS ────────────────────────────────────────
export function OrderBook({ price }) {
  const asks = Array.from({length:8}, (_, i) => ({
    p: (price + (i + 1) * price * 0.0012).toFixed(price < 1 ? 4 : 2),
    a: (Math.random() * 2 + 0.01).toFixed(4),
    w: 20 + Math.random() * 60,
  }));
  const bids = Array.from({length:8}, (_, i) => ({
    p: (price - (i + 1) * price * 0.0012).toFixed(price < 1 ? 4 : 2),
    a: (Math.random() * 2 + 0.01).toFixed(4),
    w: 20 + Math.random() * 60,
  }));

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:4, fontSize:10, color:"var(--text-muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:6 }}>
        <span>Price</span><span style={{textAlign:"right"}}>Amount</span><span style={{textAlign:"right"}}>Total</span>
      </div>
      {asks.slice().reverse().map((o, i) => (
        <div key={i} className="ob-row ob-ask">
          <div className="ob-bar" style={{ width:`${o.w}%` }}/>
          <span>{o.p}</span>
          <span style={{textAlign:"right", color:"var(--text-secondary)"}}>{o.a}</span>
          <span style={{textAlign:"right", color:"var(--text-muted)"}}>{(parseFloat(o.p)*parseFloat(o.a)).toFixed(2)}</span>
        </div>
      ))}
      <div className="ob-mid" style={{ color: "var(--green)" }}>${parseFloat(price).toLocaleString()}</div>
      {bids.map((o, i) => (
        <div key={i} className="ob-row ob-bid">
          <div className="ob-bar" style={{ width:`${o.w}%` }}/>
          <span>{o.p}</span>
          <span style={{textAlign:"right", color:"var(--text-secondary)"}}>{o.a}</span>
          <span style={{textAlign:"right", color:"var(--text-muted)"}}>{(parseFloat(o.p)*parseFloat(o.a)).toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}