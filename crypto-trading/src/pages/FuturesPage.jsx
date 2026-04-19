import { useState } from "react";
import { useApp } from "../context/AppContext";
import "./FuturesPage.css";

// SVG Icons
const Icons = {
  Long: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M12 5v14M5 12l7-7 7 7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Short: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M12 19V5M5 12l7 7 7-7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  TrendingUp: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M23 6L13.5 15.5L8.5 10.5L1 18"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17 6H23V12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  TrendingDown: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M23 18L13.5 8.5L8.5 13.5L1 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17 18H23V12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Warning: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
      <path
        d="M12 2L1 21h22L12 2z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Leverage: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M3 12h4l2-3 3 3 3-3 2 3h4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Shield: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M12 2L3 7v7c0 5 9 8 9 8s9-3 9-8V7l-9-5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

// Simple CandleChart Component
const CandleChart = ({ height = 200, seed = 0 }) => {
  const candles = Array.from({ length: 30 }, (_, i) => {
    const base = 45000 + seed * 1000;
    const open = base + Math.sin(i * 0.5) * 2000;
    const close = open + (Math.random() - 0.5) * 800;
    const high = Math.max(open, close) + Math.random() * 400;
    const low = Math.min(open, close) - Math.random() * 400;
    return { open, close, high, low, isGreen: close >= open };
  });

  const maxPrice = Math.max(...candles.map((c) => c.high));
  const minPrice = Math.min(...candles.map((c) => c.low));
  const range = maxPrice - minPrice;

  return (
    <div className="candle-chart" style={{ height }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 200"
        preserveAspectRatio="none"
      >
        {candles.map((candle, i) => {
          const x = (i / candles.length) * 800;
          const candleWidth = 18;
          const bodyTop =
            ((maxPrice - Math.max(candle.open, candle.close)) / range) * height;
          const bodyHeight =
            (Math.abs(candle.close - candle.open) / range) * height;
          const wickTop = ((maxPrice - candle.high) / range) * height;
          const wickHeight = ((candle.high - candle.low) / range) * height;

          return (
            <g key={i}>
              <line
                x1={x + candleWidth / 2}
                y1={wickTop}
                x2={x + candleWidth / 2}
                y2={wickTop + wickHeight}
                stroke={candle.isGreen ? "#10b981" : "#ef4444"}
                strokeWidth="1.5"
              />
              <rect
                x={x}
                y={bodyTop}
                width={candleWidth}
                height={Math.max(1, bodyHeight)}
                fill={candle.isGreen ? "#10b981" : "#ef4444"}
                opacity="0.8"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default function FuturesPage() {
  const { coins, user, debitBalance } = useApp();
  const [sel, setSel] = useState("BTC");
  const [lev, setLev] = useState(10);
  const [side, setSide] = useState("long");
  const [margin, setMargin] = useState("");
  const [result, setResult] = useState(null);

  const coin = coins.find((c) => c.id === sel);
  const marginAmt = parseFloat(margin) || 0;
  const posSize = marginAmt * lev;
  const liqPrice =
    side === "long"
      ? (coin?.price || 0) * (1 - 0.9 / lev)
      : (coin?.price || 0) * (1 + 0.9 / lev);
  const posCoins = coin?.price ? posSize / coin.price : 0;
  const isDisabled =
    !marginAmt || marginAmt <= 0 || marginAmt > (user?.balance || 0);
  const riskLevel = lev <= 10 ? "low" : lev <= 50 ? "medium" : "high";

  const openPosition = () => {
    if (!marginAmt || marginAmt <= 0) {
      setResult({ success: false, message: "Enter a margin amount" });
      return;
    }
    if (!coin?.price) {
      setResult({ success: false, message: "Price unavailable" });
      return;
    }

    const res = debitBalance(
      marginAmt,
      `Futures margin — ${lev}× ${side === "long" ? "Long" : "Short"} ${sel} @ $${coin.price.toLocaleString()}`,
    );

    if (!res.success) {
      setResult({
        success: false,
        message: res.error || "Insufficient balance",
      });
      return;
    }

    setResult({
      success: true,
      message: `${lev}× ${side === "long" ? "Long" : "Short"} opened. $${marginAmt.toLocaleString()} margin debited.`,
    });
    setMargin("");
    setTimeout(() => setResult(null), 4000);
  };

  const quickMargins = [10, 50, 100, 500];

  return (
    <div className="futures-page">
      {/* Header */}
      <div className="futures-header">
        <div className="futures-title-section">
          <h1>Futures Trading</h1>
          <p>Trade with leverage up to 125×</p>
        </div>
        <div className="futures-badge">
          <Icons.Warning />
          <span>Demo Mode — High Risk</span>
        </div>
      </div>

      <div className="futures-grid">
        {/* Left Column - Chart & Positions */}
        <div className="futures-left">
          {/* Chart Card */}
          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-pair-selector">
                {coins.slice(0, 6).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSel(c.id)}
                    className={`pair-btn ${sel === c.id ? "active" : ""}`}
                  >
                    <span className="pair-symbol">{c.id}</span>
                    <span
                      className={`pair-price ${c.change >= 0 ? "positive" : "negative"}`}
                    >
                      ${c.price.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
              <div className="current-price">
                <span className="price-label">{sel}/USDT</span>
                <span
                  className={`price-value ${coin?.change >= 0 ? "positive" : "negative"}`}
                >
                  ${coin?.price?.toLocaleString()}
                </span>
                <span
                  className={`price-change ${coin?.change >= 0 ? "positive" : "negative"}`}
                >
                  {coin?.change >= 0 ? "+" : ""}
                  {coin?.change}%
                </span>
              </div>
            </div>
            <CandleChart
              height={280}
              seed={coins.findIndex((c) => c.id === sel) + 5}
            />
            <div className="chart-timeframe">
              <button className="time-btn active">1m</button>
              <button className="time-btn">5m</button>
              <button className="time-btn">15m</button>
              <button className="time-btn">1h</button>
              <button className="time-btn">4h</button>
              <button className="time-btn">1d</button>
            </div>
          </div>

          {/* Open Positions Card */}
          <div className="positions-card">
            <div className="card-header">
              <h3>Open Positions</h3>
              <span className="position-count">0 active</span>
            </div>
            <div className="positions-table">
              <div className="positions-header">
                <span>Symbol</span>
                <span>Side</span>
                <span>Size</span>
                <span>Entry</span>
                <span>Liq. Price</span>
                <span>PnL</span>
              </div>
              <div className="empty-positions">
                <div className="empty-icon">📭</div>
                <p>No open positions</p>
                <span>Open a position using the panel →</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Trading Panel */}
        <div className="futures-right">
          <div className="trade-panel">
            <div className="panel-header">
              <h3>Open Position</h3>
              <span className="risk-badge" data-risk={riskLevel}>
                {riskLevel.toUpperCase()} RISK
              </span>
            </div>

            {/* Long/Short Toggle */}
            <div className="side-toggle">
              <button
                className={`side-btn long ${side === "long" ? "active" : ""}`}
                onClick={() => setSide("long")}
              >
                <Icons.Long />
                Long
              </button>
              <button
                className={`side-btn short ${side === "short" ? "active" : ""}`}
                onClick={() => setSide("short")}
              >
                <Icons.Short />
                Short
              </button>
            </div>

            {/* Leverage Slider */}
            <div className="leverage-section">
              <div className="section-label">
                <Icons.Leverage />
                <span>Leverage</span>
              </div>
              <div className="leverage-value">{lev}×</div>
              <input
                type="range"
                min="1"
                max="125"
                value={lev}
                onChange={(e) => setLev(Number(e.target.value))}
                className="leverage-slider"
                style={{
                  background: `linear-gradient(90deg, #10b981 ${(lev / 125) * 100}%, #2d3748 ${(lev / 125) * 100}%)`,
                }}
              />
              <div className="leverage-marks">
                <span>1×</span>
                <span>25×</span>
                <span>50×</span>
                <span>75×</span>
                <span>125×</span>
              </div>
              <div className="risk-indicator">
                <div className="risk-bar">
                  <div
                    className="risk-fill"
                    style={{ width: `${(lev / 125) * 100}%` }}
                  />
                </div>
                <div className="risk-labels">
                  <span>Low Risk</span>
                  <span>Medium</span>
                  <span>High Risk</span>
                </div>
              </div>
            </div>

            {/* Balance Display */}
            <div className="balance-display">
              <span className="balance-label">Available Balance</span>
              <span className="balance-amount">
                $
                {(user?.balance || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                USDT
              </span>
            </div>

            {/* Margin Input */}
            <div className="margin-section">
              <div className="section-label">
                <span>Margin Amount</span>
                <span className="quick-margins-label">Quick:</span>
              </div>
              <div className="margin-input-wrapper">
                <span className="input-currency">$</span>
                <input
                  type="number"
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                  placeholder="0.00"
                  className="margin-input"
                />
              </div>
              <div className="quick-margins">
                {quickMargins.map((q) => (
                  <button
                    key={q}
                    className="quick-margin-btn"
                    onClick={() => setMargin(q.toString())}
                  >
                    ${q}
                  </button>
                ))}
              </div>
            </div>

            {/* Position Details */}
            <div className="position-details">
              <div className="detail-row">
                <span>Position Size</span>
                <strong>
                  $
                  {posSize.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </strong>
              </div>
              <div className="detail-row">
                <span>Entry Price</span>
                <strong>${coin?.price?.toLocaleString()}</strong>
              </div>
              <div className="detail-row">
                <span>Liquidation Price</span>
                <strong className="danger-text">${liqPrice.toFixed(2)}</strong>
              </div>
              <div className="detail-row">
                <span>Margin Ratio</span>
                <strong>{(100 / lev).toFixed(1)}%</strong>
              </div>
              <div className="detail-row highlight">
                <span>Margin to Debit</span>
                <strong className="success-text">
                  $
                  {marginAmt.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}{" "}
                  USDT
                </strong>
              </div>
            </div>

            {/* Balance After Preview */}
            {marginAmt > 0 && (
              <div className="balance-after">
                <span>Balance after open</span>
                <strong>
                  $
                  {Math.max(0, (user?.balance || 0) - marginAmt).toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 },
                  )}{" "}
                  USDT
                </strong>
              </div>
            )}

            {/* Submit Button */}
            <button
              className={`trade-btn ${side}`}
              onClick={openPosition}
              disabled={isDisabled}
            >
              {side === "long" ? <Icons.TrendingUp /> : <Icons.TrendingDown />}
              Open {lev}× {side === "long" ? "Long" : "Short"}
            </button>

            {/* Result Message */}
            {result && (
              <div
                className={`result-message ${result.success ? "success" : "error"}`}
              >
                {result.success ? "✓" : "✗"} {result.message}
              </div>
            )}

            {/* Warning */}
            <div className="warning-message">
              <Icons.Warning />
              <span>
                High leverage increases both potential profits and risks. Always
                use stop-loss.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
