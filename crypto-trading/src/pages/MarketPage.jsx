/**
 * MarketPage.jsx
 * Real coin logos from /public/coins/{id}.svg (cryptocurrency-icons npm package)
 * Falls back to a styled initial badge for coins without an icon file.
 */

import { useState } from "react";
import { useApp } from "../context/AppContext";
import "./MarketPage.css";

// ── Which coins have a real SVG in /public/coins/ ────────────
const HAS_ICON = new Set([
  "BTC",
  "ETH",
  "USDT",
  "BNB",
  "SOL",
  "XRP",
  "ADA",
  "DOGE",
  "DOT",
  "MATIC",
  "AVAX",
  "TRX",
  "LINK",
  "ATOM",
  "UNI",
  "LTC",
  "ALGO",
  "VET",
  "ICP",
  "FIL",
  "THETA",
]);

// ── Coin logo component ───────────────────────────────────────
function CoinLogo({ id, name, color, size = 36 }) {
  const [errored, setErrored] = useState(false);
  const src = `/coins/${id.toLowerCase()}.svg`;

  if (HAS_ICON.has(id) && !errored) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        onError={() => setErrored(true)}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          display: "block",
          flexShrink: 0,
        }}
      />
    );
  }

  // Fallback: coloured circle with initial
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `${color}20`,
        border: `1.5px solid ${color}50`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color,
        fontWeight: 800,
        fontSize: size * 0.38,
        flexShrink: 0,
        fontFamily: "var(--font-display)",
      }}
    >
      {id.charAt(0)}
    </div>
  );
}

// ── All market coins ──────────────────────────────────────────
const ALL_COINS = [
  {
    id: "BTC",
    name: "Bitcoin",
    price: 82127.25,
    change: 4.32,
    volume: "32.5B",
    marketCap: "1.62T",
    color: "#f7931a",
    rank: 1,
  },
  {
    id: "ETH",
    name: "Ethereum",
    price: 2073.56,
    change: 3.21,
    volume: "21.2B",
    marketCap: "249.3B",
    color: "#627eea",
    rank: 2,
  },
  {
    id: "USDT",
    name: "Tether",
    price: 1.0,
    change: 0.01,
    volume: "68.5B",
    marketCap: "112.4B",
    color: "#26a17b",
    rank: 3,
  },
  {
    id: "BNB",
    name: "BNB",
    price: 612.45,
    change: 2.15,
    volume: "1.82B",
    marketCap: "93.7B",
    color: "#f3ba2f",
    rank: 4,
  },
  {
    id: "SOL",
    name: "Solana",
    price: 127.81,
    change: -4.49,
    volume: "4.19B",
    marketCap: "56.8B",
    color: "#9945ff",
    rank: 5,
  },
  {
    id: "XRP",
    name: "XRP",
    price: 0.62,
    change: 1.89,
    volume: "1.23B",
    marketCap: "33.2B",
    color: "#346aa9",
    rank: 6,
  },
  {
    id: "ADA",
    name: "Cardano",
    price: 0.34,
    change: -3.45,
    volume: "892M",
    marketCap: "12.1B",
    color: "#0033ad",
    rank: 7,
  },
  {
    id: "DOGE",
    name: "Dogecoin",
    price: 0.089,
    change: -5.67,
    volume: "567M",
    marketCap: "12.8B",
    color: "#c2a633",
    rank: 8,
  },
  {
    id: "DOT",
    name: "Polkadot",
    price: 4.21,
    change: -2.89,
    volume: "234M",
    marketCap: "5.8B",
    color: "#e6007a",
    rank: 9,
  },
  {
    id: "MATIC",
    name: "Polygon",
    price: 0.51,
    change: -1.23,
    volume: "345M",
    marketCap: "5.1B",
    color: "#8247e5",
    rank: 10,
  },
  {
    id: "TON",
    name: "Toncoin",
    price: 2.68,
    change: 1.89,
    volume: "178M",
    marketCap: "9.2B",
    color: "#0088cc",
    rank: 11,
  },
  {
    id: "SHIB",
    name: "Shiba Inu",
    price: 0.000013,
    change: -2.34,
    volume: "456M",
    marketCap: "7.8B",
    color: "#f00532",
    rank: 12,
  },
  {
    id: "AVAX",
    name: "Avalanche",
    price: 22.45,
    change: 3.45,
    volume: "567M",
    marketCap: "8.9B",
    color: "#e84142",
    rank: 13,
  },
  {
    id: "TRX",
    name: "TRON",
    price: 0.12,
    change: 0.56,
    volume: "234M",
    marketCap: "10.2B",
    color: "#ff0018",
    rank: 14,
  },
  {
    id: "LINK",
    name: "Chainlink",
    price: 14.32,
    change: -1.89,
    volume: "345M",
    marketCap: "8.4B",
    color: "#2a5ada",
    rank: 15,
  },
  {
    id: "ATOM",
    name: "Cosmos",
    price: 6.78,
    change: 2.34,
    volume: "123M",
    marketCap: "2.6B",
    color: "#2c3e50",
    rank: 16,
  },
  {
    id: "UNI",
    name: "Uniswap",
    price: 5.67,
    change: -0.78,
    volume: "89M",
    marketCap: "4.3B",
    color: "#ff007a",
    rank: 17,
  },
  {
    id: "LTC",
    name: "Litecoin",
    price: 67.89,
    change: 1.23,
    volume: "234M",
    marketCap: "5.1B",
    color: "#345d9d",
    rank: 18,
  },
  {
    id: "NEAR",
    name: "NEAR Protocol",
    price: 3.45,
    change: 4.56,
    volume: "156M",
    marketCap: "3.8B",
    color: "#00c08b",
    rank: 19,
  },
  {
    id: "ALGO",
    name: "Algorand",
    price: 0.12,
    change: -2.45,
    volume: "67M",
    marketCap: "1.0B",
    color: "#00b4d8",
    rank: 20,
  },
  {
    id: "VET",
    name: "VeChain",
    price: 0.023,
    change: 1.78,
    volume: "45M",
    marketCap: "1.7B",
    color: "#15bdff",
    rank: 21,
  },
  {
    id: "ICP",
    name: "Internet Computer",
    price: 7.89,
    change: -3.12,
    volume: "89M",
    marketCap: "3.6B",
    color: "#29abe2",
    rank: 22,
  },
  {
    id: "FIL",
    name: "Filecoin",
    price: 3.45,
    change: 2.34,
    volume: "78M",
    marketCap: "1.8B",
    color: "#0090ff",
    rank: 23,
  },
  {
    id: "THETA",
    name: "Theta Network",
    price: 0.89,
    change: 3.21,
    volume: "23M",
    marketCap: "0.9B",
    color: "#2a9d8f",
    rank: 24,
  },
];

// ── Tiny sparkline (canvas-free, SVG path) ────────────────────
function Sparkline({ positive }) {
  const color = positive ? "#10b981" : "#ef4444";
  const points = Array.from(
    { length: 20 },
    (_, i) =>
      20 +
      Math.sin(i * 0.7 + (positive ? 0 : Math.PI)) * 8 +
      (positive ? i * 0.4 : -i * 0.4),
  );
  const d = points
    .map((y, x) => `${x === 0 ? "M" : "L"}${(x / 19) * 80},${30 - y}`)
    .join(" ");
  return (
    <svg
      width="80"
      height="30"
      viewBox="0 0 80 30"
      style={{ display: "block" }}
    >
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Sort icon ─────────────────────────────────────────────────
function SortIcon({ col, sortBy, sortOrder }) {
  if (sortBy !== col)
    return <span style={{ opacity: 0.3, fontSize: 10 }}>⇅</span>;
  return (
    <span style={{ fontSize: 10 }}>{sortOrder === "asc" ? "↑" : "↓"}</span>
  );
}

// ─────────────────────────────────────────────────────────────
export default function MarketPage() {
  const { navigate } = useApp();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); // all | gainers | losers
  const [sortBy, setSortBy] = useState("rank");
  const [sortOrder, setSortOrder] = useState("asc");

  const handleSort = (col) => {
    if (sortBy === col) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else {
      setSortBy(col);
      setSortOrder("asc");
    }
  };

  const goTrade = (e, coin) => {
    e?.stopPropagation();
    navigate("trade");
  };

  const filtered = [...ALL_COINS]
    .filter(
      (c) =>
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.id.toLowerCase().includes(q.toLowerCase()),
    )
    .filter((c) =>
      filter === "gainers"
        ? c.change > 0
        : filter === "losers"
          ? c.change < 0
          : true,
    )
    .sort((a, b) => {
      const dir = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "price") return (a.price - b.price) * dir;
      if (sortBy === "change") return (a.change - b.change) * dir;
      if (sortBy === "volume")
        return (parseFloat(a.volume) - parseFloat(b.volume)) * dir;
      if (sortBy === "marketCap")
        return (parseFloat(a.marketCap) - parseFloat(b.marketCap)) * dir;
      return (a.rank - b.rank) * dir; // default: rank
    });

  return (
    <div className="market-layout">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="market-header">
        <div className="market-title-section">
          <h1>Crypto Markets</h1>
          <p>Live prices and market data for {ALL_COINS.length}+ assets</p>
        </div>
        <div className="market-stats">
          {[
            ["🌐 Market Cap", "$2.45T"],
            ["📊 24h Volume", "$98.5B"],
            ["₿ BTC Dominance", "48.2%"],
          ].map(([l, v]) => (
            <div key={l} className="market-stat">
              <span className="stat-label">{l}</span>
              <span className="stat-value">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTROLS ───────────────────────────────────────── */}
      <div className="market-controls">
        <div className="search-wrapper">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ flexShrink: 0, color: "var(--text-muted)" }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21L17 17" strokeLinecap="round" />
          </svg>
          <input
            className="market-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or symbol…"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: 16,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </div>

        <div className="filter-section">
          {[
            ["all", "All Markets"],
            ["gainers", "📈 Gainers"],
            ["losers", "📉 Losers"],
          ].map(([v, l]) => (
            <button
              key={v}
              className={`filter-btn${filter === v ? " active" : ""}`}
              onClick={() => setFilter(v)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* ── TABLE ──────────────────────────────────────────── */}
      <div className="market-table-container">
        <div className="market-table">
          {/* Head */}
          <div className="table-header">
            <div
              className="col-rank sortable"
              onClick={() => handleSort("rank")}
            >
              # <SortIcon col="rank" sortBy={sortBy} sortOrder={sortOrder} />
            </div>
            <div className="col-name">Name</div>
            <div
              className="col-price sortable"
              onClick={() => handleSort("price")}
            >
              Price{" "}
              <SortIcon col="price" sortBy={sortBy} sortOrder={sortOrder} />
            </div>
            <div
              className="col-change sortable"
              onClick={() => handleSort("change")}
            >
              24h %{" "}
              <SortIcon col="change" sortBy={sortBy} sortOrder={sortOrder} />
            </div>
            <div
              className="col-volume sortable"
              onClick={() => handleSort("volume")}
            >
              Volume{" "}
              <SortIcon col="volume" sortBy={sortBy} sortOrder={sortOrder} />
            </div>
            <div
              className="col-marketcap sortable"
              onClick={() => handleSort("marketCap")}
            >
              Mkt Cap{" "}
              <SortIcon col="marketCap" sortBy={sortBy} sortOrder={sortOrder} />
            </div>
            <div className="col-chart">7D</div>
            <div className="col-action"></div>
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="market-empty">
              <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
                No coins found
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
                Try a different search term
              </div>
            </div>
          ) : (
            filtered.map((c, i) => (
              <div
                key={c.id}
                className="table-row"
                onClick={(e) => goTrade(e, c)}
              >
                {/* Rank */}
                <div className="col-rank">
                  <span className="rank-num">{i + 1}</span>
                </div>

                {/* Name + logo */}
                <div className="col-name">
                  <div className="coin-info">
                    <CoinLogo
                      id={c.id}
                      name={c.name}
                      color={c.color}
                      size={36}
                    />
                    <div className="coin-details">
                      <span className="coin-symbol">{c.id}</span>
                      <span className="coin-fullname">{c.name}</span>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="col-price">
                  <span className="price-value">
                    $
                    {c.price.toLocaleString(undefined, {
                      minimumFractionDigits:
                        c.price < 0.01 ? 6 : c.price < 1 ? 4 : 2,
                      maximumFractionDigits:
                        c.price < 0.01 ? 6 : c.price < 1 ? 4 : 2,
                    })}
                  </span>
                </div>

                {/* 24h change */}
                <div className="col-change">
                  <span
                    className={`change-badge ${c.change >= 0 ? "positive" : "negative"}`}
                  >
                    {c.change >= 0 ? "▲" : "▼"} {Math.abs(c.change).toFixed(2)}%
                  </span>
                </div>

                {/* Volume */}
                <div className="col-volume">
                  <span className="volume-value">${c.volume}</span>
                </div>

                {/* Market cap */}
                <div className="col-marketcap">
                  <span className="marketcap-value">${c.marketCap}</span>
                </div>

                {/* Sparkline */}
                <div className="col-chart">
                  <Sparkline positive={c.change >= 0} />
                </div>

                {/* Trade button */}
                <div className="col-action">
                  <button className="trade-btn" onClick={(e) => goTrade(e, c)}>
                    Trade
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <div className="market-footer">
        <span>
          Showing {filtered.length} of {ALL_COINS.length} assets
        </span>
        <span>* Prices update every 2.5s</span>
      </div>
    </div>
  );
}
