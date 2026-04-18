/**
 * TradePage.jsx
 * All styles live in TradePage.css — no inline styles except
 * dynamic values (colours driven by data, % widths, etc.)
 */

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { CoinChip } from "../components/UI";
import "./TradePage.css";

// SVG Icons
const Icons = {
  Buy: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5V19M12 5L8 9M12 5L16 9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  Sell: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 19V5M12 19L8 15M12 19L16 15" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  TrendingUp: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 6L13.5 15.5L8.5 10.5L1 18" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 6H23V12" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  TrendingDown: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 18L13.5 8.5L8.5 13.5L1 6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 18H23V12" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  X: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6L18 18" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  Volume: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 12H5L8 5L11 19L14 8L17 15L19 12H21" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  MarketCap: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8V16M8 12H16" strokeLinecap="round"/>
    </svg>
  ),
  
  Range: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4H20V20H4V4Z" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 16L12 12L16 16" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 8L12 12" strokeLinecap="round"/>
    </svg>
  ),
  
  Fee: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2V4M12 20V22M4 12H2M6.5 6.5L5 5M17.5 6.5L19 5M6.5 17.5L5 19M17.5 17.5L19 19M22 12H20" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  
  ArrowUp: () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5V19M12 5L8 9M12 5L16 9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  ArrowDown: () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 19V5M12 19L8 15M12 19L16 15" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

// ── Order Book ────────────────────────────────────────────────
function OrderBookPanel({ price }) {
  const asks = Array.from({ length: 8 }, (_, i) => ({
    p: (price + (i + 1) * price * 0.0012).toFixed(price < 1 ? 4 : 2),
    a: (Math.random() * 2 + 0.01).toFixed(4),
    w: 20 + Math.floor(Math.random() * 60),
  }));
  const bids = Array.from({ length: 8 }, (_, i) => ({
    p: (price - (i + 1) * price * 0.0012).toFixed(price < 1 ? 4 : 2),
    a: (Math.random() * 2 + 0.01).toFixed(4),
    w: 20 + Math.floor(Math.random() * 60),
  }));

  const Row = ({ o, side }) => (
    <div className={`ob-row ${side}`}>
      <div className="ob-row__bar" style={{ width: `${o.w}%` }} />
      <span className="ob-row__price">{o.p}</span>
      <span className="ob-row__amount">{o.a}</span>
      <span className="ob-row__total">{(parseFloat(o.p) * parseFloat(o.a)).toFixed(2)}</span>
    </div>
  );

  return (
    <div>
      <div className="ob-header">
        <span>Price</span>
        <span>Amount</span>
        <span>Total</span>
      </div>
      {asks.slice().reverse().map((o, i) => <Row key={i} o={o} side="ask" />)}
      <div className="ob-mid-price">${parseFloat(price).toLocaleString()}</div>
      {bids.map((o, i) => <Row key={i} o={o} side="bid" />)}
    </div>
  );
}

// ── Horizontal coin tab bar (shown on tablet / mobile) ────────
function CoinTabs({ coins, selectedId, onSelect }) {
  return (
    <div className="trade-coin-tabs">
      {coins.map(c => (
        <button
          key={c.id}
          className={`trade-coin-tab${selectedId === c.id ? " active" : ""}`}
          onClick={() => onSelect(c.id)}
        >
          <span className="coin-tab-icon">{c.icon}</span>
          <span className="coin-tab-symbol">{c.id}</span>
          <span className="coin-tab-price">${c.price.toLocaleString()}</span>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
export default function TradePage() {
  const { coins, user, executeTrade } = useApp();

  const [selectedId, setSelectedId] = useState("BTC");
  const [side,       setSide]       = useState("buy");
  const [orderType,  setOrderType]  = useState("market");
  const [amount,     setAmount]     = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [pct,        setPct]        = useState(0);
  const [result,     setResult]     = useState(null);

  const coin  = coins.find(c => c.id === selectedId);
  const price = orderType === "limit" && limitPrice ? parseFloat(limitPrice) : (coin?.price || 0);
  const qty   = parseFloat(amount) || 0;
  const total = qty * price;
  const fee   = total * 0.001;

  const maxBuy  = (user?.balance || 0) / price;
  const maxSell = user?.portfolio?.[selectedId] || 0;

  const selectCoin = id => { setSelectedId(id); setAmount(""); setPct(0); setResult(null); };

  const handleSetPercent = p => {
    setPct(p);
    setAmount(((side === "buy" ? maxBuy : maxSell) * p / 100).toFixed(6));
  };

  const handleTrade = () => {
    if (!qty || qty <= 0) { setResult({ success: false, message: "Enter an amount" }); return; }
    const res = executeTrade(selectedId, side, qty, price);
    setResult({ success: res.success, message: res.success ? "Trade executed!" : "Trade failed" });
    if (res.success) { setAmount(""); setPct(0); setTimeout(() => setResult(null), 3000); }
  };

  const availableLabel = side === "buy"
    ? `$${(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`
    : `${maxSell.toFixed(6)} ${selectedId}`;

  const seed = coins.findIndex(c => c.id === selectedId) + 1;

  return (
    <div className="trade-page">

      {/* ── PAIR LIST (desktop only) ──────────────────────── */}
      <div className="card trade-pairs">
        <div className="trade-pairs__title">USDT Pairs</div>
        {coins.map(c => (
          <div
            key={c.id}
            className={`trade-pair-item${selectedId === c.id ? " active" : ""}`}
            onClick={() => selectCoin(c.id)}
          >
            <div>
              <div className="trade-pair-item__name">{c.id}/USDT</div>
              <div className="trade-pair-item__price">${c.price.toLocaleString()}</div>
            </div>
            <div className={`trade-pair-item__change ${c.change >= 0 ? "positive" : "negative"}`}>
              {c.change >= 0 ? <Icons.ArrowUp /> : <Icons.ArrowDown />}
              {c.change >= 0 ? "+" : ""}{c.change}%
            </div>
          </div>
        ))}
      </div>

      {/* ── CHART SECTION ─────────────────────────────────── */}
      <div className="trade-chart-section">

        {/* Coin tab bar — visible on tablet/mobile (CSS shows/hides) */}
        <CoinTabs coins={coins} selectedId={selectedId} onSelect={selectCoin} />

        {/* Price card */}
        <div className="card">
          <div className="trade-price-header">
            <CoinChip coin={coin} size={42} />

            <div className="trade-coin-label">
              <span className="trade-coin-symbol">{coin?.id}/USDT</span>
              <span className="trade-coin-name">{coin?.name}</span>
            </div>

            <div>
              <div className={`trade-current-price ${coin?.change >= 0 ? "positive" : "negative"}`}>
                ${coin?.price?.toLocaleString()}
              </div>
              <div className={`trade-price-change ${coin?.change >= 0 ? "positive" : "negative"}`}>
                {coin?.change >= 0 ? <Icons.TrendingUp /> : <Icons.TrendingDown />}
                {coin?.change >= 0 ? "+" : ""}{coin?.change}% (24h)
              </div>
            </div>

            <div className="trade-price-stats">
              {[
                ["24h High", `$${((coin?.price || 0) * 1.03).toFixed(2)}`, <Icons.TrendingUp />],
                ["24h Low",  `$${((coin?.price || 0) * 0.97).toFixed(2)}`, <Icons.TrendingDown />],
                ["Volume",   coin?.volume, <Icons.Volume />],
              ].map(([l, v, icon]) => (
                <div key={l}>
                  <div className="trade-price-stat-label">{icon} {l}</div>
                  <div className="trade-price-stat-value">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Candlestick bars */}
          <div className="trade-chart-area">
            {Array.from({ length: 70 }, (_, i) => {
              const h  = 30 + Math.sin((i + seed) * 0.25) * 22 + ((i * seed * 7) % 30);
              const up = ((i * seed + 3) % 5) !== 0;
              return (
                <div
                  key={i}
                  className={`trade-chart-bar ${up ? "up" : "down"}`}
                  style={{ height: `${Math.max(h, 8)}%` }}
                />
              );
            })}
          </div>
        </div>

        {/* Order book */}
        <div className="card trade-orderbook">
          <div className="trade-orderbook__title">Order Book</div>
          <OrderBookPanel price={coin?.price || 0} />
        </div>
      </div>

      {/* ── TRADE PANEL ───────────────────────────────────── */}
      <div className="card trade-panel">

        {/* Buy / Sell */}
        <div className="trade-side-toggle">
          {["buy", "sell"].map(s => (
            <button
              key={s}
              className={`trade-side-btn ${s}${side === s ? " active" : ""}`}
              onClick={() => { setSide(s); setAmount(""); setPct(0); }}
            >
              {s === "buy" ? <Icons.Buy /> : <Icons.Sell />}
              {s === "buy" ? "Buy" : "Sell"}
            </button>
          ))}
        </div>

        {/* Order type */}
        <div className="trade-order-types">
          {[["market","Market"], ["limit","Limit"], ["stop_limit","Stop-Limit"]].map(([val, label]) => (
            <button
              key={val}
              className={`trade-order-type-btn${orderType === val ? " active" : ""}`}
              onClick={() => setOrderType(val)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Available balance */}
        <div className="trade-available">
          <span className="trade-available__label">Available</span>
          <span className={`trade-available__value ${side}`}>{availableLabel}</span>
        </div>

        {/* Limit price */}
        {orderType !== "market" && (
          <div className="trade-input-group">
            <label className="trade-input-label">Price (USDT)</label>
            <input
              type="number"
              value={limitPrice}
              placeholder={coin?.price?.toString()}
              onChange={e => setLimitPrice(e.target.value)}
            />
          </div>
        )}

        {/* Amount */}
        <div className="trade-input-group">
          <label className="trade-input-label">Amount ({selectedId})</label>
          <input
            type="number"
            value={amount}
            placeholder="0.000000"
            onChange={e => { setAmount(e.target.value); setPct(0); }}
          />
        </div>

        {/* % buttons */}
        <div className="trade-pct-row">
          {[25, 50, 75, 100].map(p => (
            <button
              key={p}
              className={`trade-pct-btn${pct === p ? " active" : ""}`}
              onClick={() => handleSetPercent(p)}
            >
              {p}%
            </button>
          ))}
        </div>

        {/* Summary */}
        <div className="trade-summary">
          <div className="trade-summary-row">
            <span>Total</span>
            <span>${total.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT</span>
          </div>
          <div className="trade-summary-row fee">
            <span><Icons.Fee /> Fee (0.1%)</span>
            <span>${fee.toFixed(4)}</span>
          </div>
          {side === "buy" && (
            <div className="trade-summary-row after-balance">
              <span>Balance after</span>
              <span>
                ${Math.max(0, (user?.balance || 0) - total - fee)
                  .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
              </span>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          className={`trade-submit-btn ${side}`}
          disabled={!qty || qty <= 0}
          onClick={handleTrade}
        >
          {side === "buy" ? <Icons.Buy /> : <Icons.Sell />}
          {side === "buy" ? `Buy ${selectedId}` : `Sell ${selectedId}`}
        </button>

        {/* Result */}
        {result && (
          <div className={`trade-result ${result.success ? "success" : "error"}`}>
            {result.success ? <Icons.Check /> : <Icons.X />}
            {result.message}
          </div>
        )}

        {/* Market info */}
        <div className="trade-market-info">
          <div className="trade-market-info__title">Market Info</div>
          {[
            ["24h Volume",  coin?.volume, <Icons.Volume />],
            ["Market Cap",  coin?.marketCap, <Icons.MarketCap />],
            ["7d Range",    `$${((coin?.price||0)*0.93).toFixed(2)} – $${((coin?.price||0)*1.05).toFixed(2)}`, <Icons.Range />],
          ].map(([l, v, icon]) => (
            <div key={l} className="trade-market-info-row">
              <span>{icon} {l}</span>
              <span>{v}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}