import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { CoinChip, CandleChart, OrderBook } from "../components/UI";
import "./TradePage.css";

function OrderTypeBtns({ value, onChange }) {
  return (
    <div className="trade-order-type-group">
      {["Market", "Limit", "Stop-Limit"].map(t => {
        const typeValue = t.toLowerCase().replace("-", "_");
        return (
          <button
            key={t}
            onClick={() => onChange(typeValue)}
            className={`trade-order-type-btn ${value === typeValue ? "active" : ""}`}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

export default function TradePage() {
  const { coins, user, executeTrade } = useApp();
  const [sel, setSel] = useState("BTC");
  const [side, setSide] = useState("buy");
  const [otype, setOtype] = useState("market");
  const [amount, setAmount] = useState("");
  const [lp, setLp] = useState("");
  const [pct, setPct] = useState(0);
  const [result, setResult] = useState(null);

  const coin = coins.find(c => c.id === sel);
  const price = otype === "limit" && lp ? parseFloat(lp) : coin?.price || 0;
  const qty = parseFloat(amount || 0);
  const total = qty * price;
  const maxBuy = (user?.balance || 0) / price;
  const maxSell = user?.portfolio?.[sel] || 0;

  const setPercent = p => {
    setPct(p);
    const max = side === "buy" ? maxBuy : maxSell;
    setAmount(((max * p) / 100).toFixed(6));
  };

  const handleTrade = () => {
    if (!qty || qty <= 0) return;
    const res = executeTrade(sel, side, qty, price);
    setResult(res);
    if (res.success) {
      setAmount("");
      setPct(0);
      setTimeout(() => setResult(null), 3000);
    }
  };

  const availableDisplay = side === "buy"
    ? `$${(user?.balance || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT`
    : `${maxSell.toFixed(4)} ${sel}`;

  return (
    <div className="trade-page-container">

      {/* ── PAIR LIST ── */}
      <div className="trade-pair-list-card">
        <div className="trade-pair-list-header">
          USDT Pairs
        </div>
        <div className="trade-pair-list">
          {coins.map(c => (
            <div
              key={c.id}
              className={`trade-pair-item ${sel === c.id ? "active" : ""}`}
              onClick={() => {
                setSel(c.id);
                setAmount("");
                setPct(0);
              }}
            >
              <div>
                <div className="trade-pair-name">{c.id}/USDT</div>
                <div className="trade-pair-price">${c.price.toLocaleString()}</div>
              </div>
              <div className={`trade-pair-change ${c.change >= 0 ? "positive" : "negative"}`}>
                {c.change >= 0 ? "+" : ""}{c.change}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CHART + ORDER BOOK ── */}
      <div className="trade-chart-section">
        {/* Price header */}
        <div className="trade-price-card">
          <div className="trade-price-header">
            <CoinChip coin={coin} size={42} />
            <div>
              <div className="trade-coin-symbol">
                {coin?.id}/USDT
              </div>
              <div className="trade-coin-name">{coin?.name}</div>
            </div>
            <div>
              <div className={`trade-current-price ${coin?.change >= 0 ? "positive" : "negative"}`}>
                ${coin?.price?.toLocaleString()}
              </div>
              <div className={`trade-price-change ${coin?.change >= 0 ? "positive" : "negative"}`}>
                {coin?.change >= 0 ? "+" : ""}{coin?.change}% (24h)
              </div>
            </div>
            <div className="trade-price-stats">
              {[
                ["24h High", `$${(coin?.price * 1.03).toLocaleString(undefined, { maximumFractionDigits: 2 })}`],
                ["24h Low", `$${(coin?.price * 0.97).toLocaleString(undefined, { maximumFractionDigits: 2 })}`],
                ["Volume", coin?.volume],
                ["Mkt Cap", coin?.marketCap],
              ].map(([l, v]) => (
                <div key={l}>
                  <div className="trade-price-stat-label">{l}</div>
                  <div className="trade-price-stat-value">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart */}
          <CandleChart height={250} seed={coins.findIndex(c => c.id === sel) + 1} />
        </div>

        {/* Order Book */}
        <div className="trade-orderbook-card">
          <div className="trade-orderbook-title">Order Book</div>
          <OrderBook price={coin?.price || 0} />
        </div>
      </div>

      {/* ── TRADE PANEL ── */}
      <div className="trade-panel-card">

        {/* Buy / Sell toggle */}
        <div className="trade-side-toggle">
          <button className={`trade-side-btn trade-buy-btn ${side === "buy" ? "active" : ""}`} onClick={() => setSide("buy")}>
            Buy
          </button>
          <button className={`trade-side-btn trade-sell-btn ${side === "sell" ? "active" : ""}`} onClick={() => setSide("sell")}>
            Sell
          </button>
        </div>

        {/* Order type */}
        <OrderTypeBtns value={otype} onChange={setOtype} />

        {/* Available balance */}
        <div className="trade-available-balance">
          <span className="trade-available-label">Available</span>
          <span className="trade-available-value">{availableDisplay}</span>
        </div>

        {/* Limit price */}
        {otype !== "market" && (
          <div className="trade-input-group">
            <label className="trade-input-label">Price (USDT)</label>
            <input
              className="trade-input"
              type="number"
              value={lp}
              onChange={e => setLp(e.target.value)}
              placeholder={coin?.price?.toString()}
            />
          </div>
        )}

        {/* Amount */}
        <div className="trade-input-group">
          <label className="trade-input-label">Amount ({sel})</label>
          <input
            className="trade-input"
            type="number"
            value={amount}
            onChange={e => {
              setAmount(e.target.value);
              setPct(0);
            }}
            placeholder="0.000000"
          />
        </div>

        {/* Percent quick-pick */}
        <div className="trade-percent-buttons">
          {[25, 50, 75, 100].map(p => (
            <button
              key={p}
              className={`trade-percent-btn ${pct === p ? "active" : ""}`}
              onClick={() => setPercent(p)}
            >
              {p}%
            </button>
          ))}
        </div>

        {/* Order summary */}
        <div className="trade-summary">
          <div className="trade-summary-row">
            <span>Total</span>
            <span>${total.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT</span>
          </div>
          <div className="trade-summary-row">
            <span>Fee (0.1%)</span>
            <span className="trade-fee-amount">${(total * 0.001).toFixed(4)}</span>
          </div>
        </div>

        {/* Submit */}
        <button
          className={`trade-submit-btn trade-submit-${side}`}
          onClick={handleTrade}
          disabled={!qty || qty <= 0}
        >
          {side === "buy" ? `Buy ${sel}` : `Sell ${sel}`}
        </button>

        {/* Result */}
        {result && (
          <div className={`trade-result-message ${result.success ? "success" : "error"}`}>
            {result.success ? "✅ Trade executed successfully!" : "❌ Trade failed — try again"}
          </div>
        )}

        {/* Market stats */}
        <div className="trade-market-info">
          <div className="trade-market-info-title">Market Info</div>
          {[
            ["24h Volume", coin?.volume],
            ["Market Cap", coin?.marketCap],
            ["Circulating", "19.7M BTC"],
          ].map(([l, v]) => (
            <div key={l} className="trade-market-info-row">
              <span className="trade-market-info-label">{l}</span>
              <span className="trade-market-info-value">{v}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}