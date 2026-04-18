import { useState } from "react";
import { useApp } from "../context/AppContext";
import { CoinChip, Sparkline } from "../components/UI";
import "./MarketPage.css";

// SVG Icons
const Icons = {
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" strokeLinecap="round"/>
      <path d="M21 21L17 17" strokeLinecap="round"/>
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
  
  SortAsc: () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5V19M12 5L8 9M12 5L16 9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  SortDesc: () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 19V5M12 19L8 15M12 19L16 15" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  SortNeutral: () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5V19M8 9L12 5L16 9M8 15L12 19L16 15" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  ArrowRight: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12H19M12 5L19 12L12 19" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  Globe: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12H22M12 2C14.5 4.5 15 9 15 12C15 15 14.5 19.5 12 22C9.5 19.5 9 15 9 12C9 9 9.5 4.5 12 2Z" strokeLinecap="round"/>
    </svg>
  ),
  
  VolumeIcon: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 12H5L8 5L11 19L14 8L17 15L19 12H21" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  ChartIcon: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 16L15 10L11 14L3 6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 10V16H15" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  AllMarkets: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  
  Gainers: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5">
      <path d="M12 5V19M12 5L8 9M12 5L16 9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  Losers: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
      <path d="M12 19V5M12 19L8 15M12 19L16 15" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

export function MarketPage() {
  const { coins, navigate } = useApp();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rank");
  const [sortOrder, setSortOrder] = useState("asc");

  // Extended coin data with more coins
  const allCoins = [
    // Top 10 by market cap
    { id: "BTC", name: "Bitcoin", price: 82127.25, change: 4.32, volume: "32.5B", marketCap: "1.62T", color: "#f7931a", icon: "₿", rank: 1 },
    { id: "ETH", name: "Ethereum", price: 2073.56, change: 3.21, volume: "21.2B", marketCap: "249.3B", color: "#627eea", icon: "⟠", rank: 2 },
    { id: "USDT", name: "Tether", price: 1.00, change: 0.01, volume: "68.5B", marketCap: "112.4B", color: "#26a17b", icon: "₮", rank: 3 },
    { id: "BNB", name: "BNB", price: 612.45, change: 2.15, volume: "1.82B", marketCap: "93.7B", color: "#f3ba2f", icon: "B", rank: 4 },
    { id: "SOL", name: "Solana", price: 127.81, change: -4.49, volume: "4.19B", marketCap: "56.8B", color: "#00ffa3", icon: "◎", rank: 5 },
    { id: "XRP", name: "Ripple", price: 0.62, change: 1.89, volume: "1.23B", marketCap: "33.2B", color: "#23292f", icon: "X", rank: 6 },
    { id: "ADA", name: "Cardano", price: 0.34, change: -3.45, volume: "892M", marketCap: "12.1B", color: "#0033ad", icon: "A", rank: 7 },
    { id: "DOGE", name: "Dogecoin", price: 0.089, change: -5.67, volume: "567M", marketCap: "12.8B", color: "#c2a633", icon: "Ð", rank: 8 },
    { id: "DOT", name: "Polkadot", price: 4.21, change: -2.89, volume: "234M", marketCap: "5.8B", color: "#e6007a", icon: "D", rank: 9 },
    { id: "MATIC", name: "Polygon", price: 0.51, change: -1.23, volume: "345M", marketCap: "5.1B", color: "#8247e5", icon: "M", rank: 10 },
    
    // Additional coins
    { id: "TON", name: "Toncoin", price: 2.68, change: 1.89, volume: "178M", marketCap: "9.2B", color: "#0088cc", icon: "T", rank: 11 },
    { id: "SHIB", name: "Shiba Inu", price: 0.000013, change: -2.34, volume: "456M", marketCap: "7.8B", color: "#f00532", icon: "SH", rank: 12 },
    { id: "AVAX", name: "Avalanche", price: 22.45, change: 3.45, volume: "567M", marketCap: "8.9B", color: "#e84142", icon: "A", rank: 13 },
    { id: "TRX", name: "TRON", price: 0.12, change: 0.56, volume: "234M", marketCap: "10.2B", color: "#ff0018", icon: "T", rank: 14 },
    { id: "LINK", name: "Chainlink", price: 14.32, change: -1.89, volume: "345M", marketCap: "8.4B", color: "#2a5ada", icon: "L", rank: 15 },
    { id: "ATOM", name: "Cosmos", price: 6.78, change: 2.34, volume: "123M", marketCap: "2.6B", color: "#2c3e50", icon: "A", rank: 16 },
    { id: "UNI", name: "Uniswap", price: 5.67, change: -0.78, volume: "89M", marketCap: "4.3B", color: "#ff007a", icon: "U", rank: 17 },
    { id: "LTC", name: "Litecoin", price: 67.89, change: 1.23, volume: "234M", marketCap: "5.1B", color: "#345d9d", icon: "Ł", rank: 18 },
    { id: "NEAR", name: "NEAR Protocol", price: 3.45, change: 4.56, volume: "156M", marketCap: "3.8B", color: "#000000", icon: "N", rank: 19 },
    { id: "ALGO", name: "Algorand", price: 0.12, change: -2.45, volume: "67M", marketCap: "1.0B", color: "#000000", icon: "A", rank: 20 },
    { id: "VET", name: "VeChain", price: 0.023, change: 1.78, volume: "45M", marketCap: "1.7B", color: "#15bdff", icon: "V", rank: 21 },
    { id: "ICP", name: "Internet Computer", price: 7.89, change: -3.12, volume: "89M", marketCap: "3.6B", color: "#29abe2", icon: "I", rank: 22 },
    { id: "FIL", name: "Filecoin", price: 3.45, change: 2.34, volume: "78M", marketCap: "1.8B", color: "#0090ff", icon: "F", rank: 23 },
    { id: "EGLD", name: "MultiversX", price: 28.90, change: -1.45, volume: "34M", marketCap: "0.8B", color: "#00a3e0", icon: "E", rank: 24 },
    { id: "THETA", name: "Theta Network", price: 0.89, change: 3.21, volume: "23M", marketCap: "0.9B", color: "#2a9d8f", icon: "θ", rank: 25 },
  ];

  // Sort coins
  const getSortedCoins = (coinsList) => {
    let sorted = [...coinsList];
    switch(sortBy) {
      case "price":
        sorted.sort((a, b) => sortOrder === "asc" ? a.price - b.price : b.price - a.price);
        break;
      case "change":
        sorted.sort((a, b) => sortOrder === "asc" ? a.change - b.change : b.change - a.change);
        break;
      case "volume":
        sorted.sort((a, b) => {
          const volA = parseFloat(a.volume);
          const volB = parseFloat(b.volume);
          return sortOrder === "asc" ? volA - volB : volB - volA;
        });
        break;
      case "marketCap":
        sorted.sort((a, b) => {
          const capA = parseFloat(a.marketCap);
          const capB = parseFloat(b.marketCap);
          return sortOrder === "asc" ? capA - capB : capB - capA;
        });
        break;
      default:
        sorted.sort((a, b) => sortOrder === "asc" ? a.rank - b.rank : b.rank - a.rank);
    }
    return sorted;
  };

  const filtered = getSortedCoins(allCoins
    .filter(c =>
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.id.toLowerCase().includes(q.toLowerCase())
    )
    .filter(c => {
      if (filter === "gainers") return c.change > 0;
      if (filter === "losers") return c.change < 0;
      return true;
    })
  );

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return <Icons.SortNeutral />;
    return sortOrder === "asc" ? <Icons.SortAsc /> : <Icons.SortDesc />;
  };

  return (
    <div className="market-layout">
      <div className="market-header">
        <div className="market-title-section">
          <h1>Crypto Markets</h1>
          <p>Live prices and market data for 350+ assets</p>
        </div>
        <div className="market-stats">
          <div className="market-stat">
            <span className="stat-label"><Icons.Globe /> Total Market Cap</span>
            <span className="stat-value">$2.45T</span>
          </div>
          <div className="market-stat">
            <span className="stat-label"><Icons.VolumeIcon /> 24h Volume</span>
            <span className="stat-value">$98.5B</span>
          </div>
          <div className="market-stat">
            <span className="stat-label"><Icons.ChartIcon /> BTC Dominance</span>
            <span className="stat-value">48.2%</span>
          </div>
        </div>
      </div>

      <div className="market-controls">
        <div className="search-section">
          <div className="search-wrapper">
            <Icons.Search />
            <input
              className="market-search"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search by coin name or symbol..."
            />
          </div>
        </div>
        
        <div className="filter-section">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            <Icons.AllMarkets />
            <span className="filter-label">All</span>
          </button>
          <button
            className={`filter-btn ${filter === "gainers" ? "active" : ""}`}
            onClick={() => setFilter("gainers")}
          >
            <Icons.Gainers />
            <span className="filter-label">Gainers</span>
          </button>
          <button
            className={`filter-btn ${filter === "losers" ? "active" : ""}`}
            onClick={() => setFilter("losers")}
          >
            <Icons.Losers />
            <span className="filter-label">Losers</span>
          </button>
        </div>
      </div>

      <div className="market-table-container">
        <div className="market-table">
          <div className="table-header">
            <div className="col-rank" onClick={() => handleSort("rank")}>
              # {getSortIcon("rank")}
            </div>
            <div className="col-name">Name</div>
            <div className="col-price" onClick={() => handleSort("price")}>
              Price {getSortIcon("price")}
            </div>
            <div className="col-change" onClick={() => handleSort("change")}>
              24h {getSortIcon("change")}
            </div>
            <div className="col-volume" onClick={() => handleSort("volume")}>
              Volume {getSortIcon("volume")}
            </div>
            <div className="col-marketcap" onClick={() => handleSort("marketCap")}>
              Market Cap {getSortIcon("marketCap")}
            </div>
            <div className="col-chart">7D Chart</div>
            <div className="col-action"></div>
          </div>

          <div className="table-body">
            {filtered.map((c, i) => (
              <div
                key={c.id}
                className="table-row"
                onClick={() => navigate("trade", { state: { coin: c } })}
              >
                <div className="col-rank">{i + 1}</div>
                
                <div className="col-name">
                  <div className="coin-info">
                    <div className="coin-icon" style={{ background: `${c.color}20`, color: c.color }}>
                      {c.icon}
                    </div>
                    <div className="coin-details">
                      <div className="coin-symbol">{c.id}</div>
                      <div className="coin-fullname">{c.name}</div>
                    </div>
                  </div>
                </div>
                
                <div className="col-price">
                  <div className="price-value">
                    ${c.price.toLocaleString(undefined, { minimumFractionDigits: c.price < 1 ? 4 : 2, maximumFractionDigits: c.price < 1 ? 4 : 2 })}
                  </div>
                </div>
                
                <div className="col-change">
                  <div className={`change-badge ${c.change >= 0 ? "positive" : "negative"}`}>
                    {c.change >= 0 ? <Icons.TrendingUp /> : <Icons.TrendingDown />}
                    {c.change >= 0 ? "+" : ""}{c.change}%
                  </div>
                </div>
                
                <div className="col-volume">
                  <div className="volume-value">{c.volume}</div>
                </div>
                
                <div className="col-marketcap">
                  <div className="marketcap-value">{c.marketCap}</div>
                </div>
                
                <div className="col-chart">
                  <Sparkline positive={c.change >= 0} color={c.change >= 0 ? "var(--green)" : "var(--red)"} />
                </div>
                
                <div className="col-action">
                  <button
                    className="trade-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("trade", { state: { coin: c } });
                    }}
                  >
                    Trade <Icons.ArrowRight />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="empty-state">
            <Icons.Search />
            <h3>No coins found</h3>
            <p>Try searching with a different term</p>
          </div>
        )}
      </div>

      <div className="market-footer">
        <div className="footer-stats">
          Showing {filtered.length} of {allCoins.length} cryptocurrencies
        </div>
        <div className="footer-note">
          * Data updates every 5 seconds
        </div>
      </div>
    </div>
  );
}