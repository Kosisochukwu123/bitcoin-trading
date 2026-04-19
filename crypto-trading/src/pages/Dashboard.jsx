import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { CoinChip, Sparkline } from "../components/UI";
import "./Dashboard.css";
import image1 from "../../public/images/images-removebg-preview.png";

export default function Dashboard() {
  const { user, coins, trades, navigate, getUserTrades } = useApp();
  const [timeFilter, setTimeFilter] = useState("24H");
  const [statsTab, setStatsTab] = useState("Gainers");

  // Get user's trades for portfolio calculation
  const userTrades = useMemo(
    () => getUserTrades?.(user?.id) || [],
    [getUserTrades, user?.id],
  );

  // Calculate real portfolio value from user's actual holdings
  const portfolioValue = useMemo(() => {
    if (!user) return 0;

    // Calculate crypto holdings value
    const cryptoValue = Object.entries(user.portfolio || {}).reduce(
      (sum, [coinId, amount]) => {
        const coin = coins.find((c) => c.id === coinId);
        return sum + (coin ? coin.price * amount : 0);
      },
      0,
    );

    // Add USDT balance
    return (user.balance || 0) + cryptoValue;
  }, [user, coins]);

  // Calculate 24h change (mock data - in real app would come from API)
  const portfolioChange = 4.34;
  const portfolioChangeAmount = (portfolioValue * portfolioChange) / 100;

  // Get top coins by market cap
  const topCoins = useMemo(() => {
    return coins.slice(0, 5).map((coin) => ({
      ...coin,
      value: coin.price,
    }));
  }, [coins]);

  // Get gainers and losers from real coin data
  const gainersList = useMemo(() => {
    return [...coins]
      .sort((a, b) => b.change - a.change)
      .slice(0, 4)
      .map((coin) => ({
        symbol: coin.id,
        name: coin.name,
        price: coin.price,
        change: coin.change,
      }));
  }, [coins]);

  const losersList = useMemo(() => {
    return [...coins]
      .sort((a, b) => a.change - b.change)
      .slice(0, 4)
      .map((coin) => ({
        symbol: coin.id,
        name: coin.name,
        price: coin.price,
        change: coin.change,
      }));
  }, [coins]);

  const volumeList = useMemo(() => {
    return coins.slice(0, 4).map((coin) => ({
      symbol: coin.id,
      name: coin.name,
      volume: coin.volume,
      change: coin.change,
    }));
  }, [coins]);

  const currentRankingList =
    statsTab === "Gainers"
      ? gainersList
      : statsTab === "Losers"
        ? losersList
        : volumeList;

  // Find specific coins for detail cards
  const solCoin = coins.find((c) => c.id === "SOL") || { price: 0, change: 0 };
  const ethCoin = coins.find((c) => c.id === "ETH") || { price: 0, change: 0 };
  const btcCoin = coins.find((c) => c.id === "BTC") || { price: 0, change: 0 };

  // User's holdings
  const userHoldings = useMemo(() => {
    if (!user) return [];
    return [
      { id: "USDT", amount: user.balance || 0, price: 1 },
      ...Object.entries(user.portfolio || {}).map(([id, amount]) => {
        const coin = coins.find((c) => c.id === id);
        return {
          id,
          amount,
          price: coin?.price || 0,
          change: coin?.change || 0,
        };
      }),
    ].filter((h) => h.amount > 0);
  }, [user, coins]);

  // Get SOL holding
  const solHolding = userHoldings.find((h) => h.id === "SOL");
  const solAmount = solHolding?.amount || 0;

  // Chart data based on time filter (mock data - would come from API)
  const getChartData = () => {
    switch (timeFilter) {
      case "24H":
        return [28000, 31000, 29000, 34000, 36000, 35000, 38000];
      case "1W":
        return [32000, 33500, 31000, 34500, 37000, 36500, 39000];
      case "1M":
        return [28000, 30000, 32000, 31000, 34000, 36000, 35000];
      case "1Y":
        return [25000, 28000, 31000, 29000, 34000, 37000, 42000];
      default:
        return [28000, 31000, 29000, 34000, 36000, 35000, 38000];
    }
  };

  const chartData = getChartData();
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const Icons = {
    P2P: () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17 9L21 5L17 1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 5H21"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M7 15L3 19L7 23"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 19H3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M12 3V21"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),

    Send: () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22 2L15 9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 2L11 13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 2L2 7L9 15L15 22L22 2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),

    Receive: () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 15V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 3V15M12 15L9 12M12 15L15 12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),

    Swap: () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M17 2L21 6L17 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 6H21"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M7 22L3 18L7 14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 18H3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),

    ArrowRight: () => (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M5 12H19" stroke="currentColor" strokeLinecap="round" />
        <path
          d="M12 5L19 12L12 19"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),

    Profile: () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          cx="12"
          cy="7"
          r="3.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M5 20C5 16.5 8.5 14.5 12 14.5C15.5 14.5 19 16.5 19 20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),

    Home: () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 10L12 3L21 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 10V20H19V10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M10 20V14H14V20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),

    Markets: () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M6 6V18"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <rect
          x="5"
          y="10"
          width="2"
          height="5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M12 4V14"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <rect
          x="11"
          y="6"
          width="2"
          height="6"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M18 8V20"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <rect
          x="17"
          y="12"
          width="2"
          height="5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),

    Portfolio: () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M3 9H21"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle
          cx="17"
          cy="13"
          r="1.2"
          fill="currentColor"
        />
      </svg>
    ),

    Trading: () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M4 16L10 10L14 14L20 8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 8L10 14L14 10L20 16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),

    TrendingUp: () => (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M23 6L13.5 15.5L8.5 10.5L1 18" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 6H23V12" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),

    TrendingDown: () => (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M23 18L13.5 8.5L8.5 13.5L1 6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 18H23V12" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),

    Fire: () => (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 2C10 6 8 8 8 12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12C16 8 14 6 12 2Z" />
        <path d="M12 22C15.3137 22 18 19.3137 18 16C18 14 16 12 12 10C8 12 6 14 6 16C6 19.3137 8.68629 22 12 22Z" />
      </svg>
    ),

    Clock: () => (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6V12L16 14" strokeLinecap="round"/>
      </svg>
    ),
  };

  // Updated quickActions array with SVG icons
  const quickActions = [
    {
      icon: <Icons.P2P />,
      label: "P2P",
      page: "p2p",
      color: "#6366f1",
      bgOpacity: "0.12",
    },
    {
      icon: <Icons.ArrowRight />,
      label: "Earn",
      page: "earn",
      color: "#10b981",
      bgOpacity: "0.12",
    },
    {
      icon: <Icons.Receive />,
      label: "Receive",
      page: "wallet",
      color: "#f59e0b",
      bgOpacity: "0.12",
    },
    {
      icon: <Icons.Swap />,
      label: "Swap",
      page: "trade",
      color: "#8b5cf6",
      bgOpacity: "0.12",
    },
  ];

  const formatNumber = (num) => {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatCrypto = (num) => {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    });
  };

  // Helper to get gradient for coin
  const getCoinGradient = (symbol) => {
    const gradients = {
      BTC: "linear-gradient(135deg, #f7931a, #f59e0b)",
      ETH: "linear-gradient(135deg, #627eea, #4f46e5)",
      SOL: "linear-gradient(135deg, #14f195, #00d4aa)",
    };
    return gradients[symbol] || "linear-gradient(135deg, #6b7280, #4b5563)";
  };

  return (
    <div className="dashboard-mobile">
      {/* Greeting Section with Animated Wave */}
     <div className="greeting-section">
  <div className="greeting-avatar">
    {user?.avatar ? (
      <img 
        src={user.avatar} 
        alt={user?.name || "User"} 
        className="greeting-avatar-img"
      />
    ) : (
      <span className="greeting-emoji">👋</span>
    )}
  </div>
  <div className="greeting-text">
    <h1 className="greeting-title">
      Hello, {user?.name?.split(" ")[0] || "Trader"}
    </h1>
    <p className="greeting-subtitle">
      Ready to trade? <span className="market-badge">📈 Bull Run</span>
    </p>
  </div>
</div>

      {/* Wallet Card with Glassmorphism */}
      <div className="wallet-card glass-card">
        <div className="wallet-header">
          <div className="wallet-label-group">
            <span className="wallet-icon">💰</span>
            <span className="wallet-label">Total Portfolio</span>
          </div>
          <div className="wallet-badge-group">
            <span className="wallet-badge">USD</span>
          </div>
        </div>

        <div className="wallet-balance">
          <span className="currency-symbol">$</span>
          {formatNumber(portfolioValue)}
        </div>

        <div className="wallet-change-group">
          <span
            className={`change-badge ${portfolioChange >= 0 ? "positive" : "negative"}`}
          >
            {portfolioChange >= 0 ? <Icons.TrendingUp /> : <Icons.TrendingDown />}
            {portfolioChange}%
          </span>
          <span
            className={`change-amount ${portfolioChange >= 0 ? "positive" : "negative"}`}
          >
            {portfolioChange >= 0 ? "↑" : "↓"} ${formatNumber(Math.abs(portfolioChangeAmount))}
          </span>
        </div>

        <div className="time-filters">
          {["24H", "1W", "1M", "1Y"].map((filter) => (
            <button
              key={filter}
              className={`time-chip ${timeFilter === filter ? "active" : ""}`}
              onClick={() => setTimeFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="wallet-image">
          <img src={image1} alt="Dashboard" />
        </div>
        
      </div>

      {/* Quick Actions with Enhanced Design */}
      <div className="quick-actions-row">
        {quickActions.map((action) => (
          <button
            key={action.label}
            className="quick-action-chip"
            onClick={() => navigate(action.page)}
            style={{
              background: `${action.color}${action.bgOpacity}`,
              borderColor: `${action.color}30`,
            }}
          >
            <span className="quick-action-icon" style={{ color: action.color }}>
              {action.icon}
            </span>
            <span className="quick-action-label">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Chart Card with Live Indicator */}
      <div className="chart-card glass-card">
        <div className="chart-header">
          <div className="chart-title-group">
            <div className="live-indicator">
              <span className="live-dot"></span>
              <span className="live-text">LIVE</span>
            </div>
            <span className="chart-title">Bitcoin (BTC)</span>
          </div>
          <button className="see-all-btn" onClick={() => navigate("market")}>
            Details <Icons.ArrowRight />
          </button>
        </div>

        <div className="chart-price-group">
          <span className="chart-coin-price">
            <span className="btc-icon">₿</span>
            {btcCoin.price.toLocaleString()}
          </span>
          <span
            className={`chart-change ${btcCoin.change >= 0 ? "positive" : "negative"}`}
          >
            {btcCoin.change >= 0 ? <Icons.TrendingUp /> : <Icons.TrendingDown />}
            {Math.abs(btcCoin.change)}%
          </span>
        </div>

        <div className="chart-container">
          <div className="chart-bars">
            {chartData.map((value, index) => (
              <div key={index} className="bar-wrapper">
                <div
                  className="chart-bar"
                  style={{
                    height: `${(value / Math.max(...chartData)) * 100}%`,
                    background: getCoinGradient("BTC"),
                  }}
                />
                <span className="bar-label">{days[index]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-stats-row">
          {topCoins.slice(0, 3).map((coin) => (
            <div
              key={coin.id}
              className="mini-stat"
              onClick={() => navigate("trade")}
            >
              <span className="mini-stat-symbol">{coin.id}</span>
              <span className="mini-stat-value">
                ${coin.price.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ranking Section with Enhanced Tabs */}
      <div className="ranking-card glass-card">
        <div className="ranking-header">
          <h3 className="ranking-title">
            <Icons.Fire /> Market Movers
          </h3>
          <button className="see-all-btn" onClick={() => navigate("market")}>
            View All <Icons.ArrowRight />
          </button>
        </div>

        <div className="stats-tabs">
          {["Gainers", "Losers", "24h Vol"].map((tab) => {
            const getTabValue = () => {
              if (tab === "Gainers")
                return gainersList[0]?.change
                  ? `+${gainersList[0].change}%`
                  : "+0%";
              if (tab === "Losers")
                return losersList[0]?.change
                  ? `${losersList[0].change}%`
                  : "0%";
              return volumeList[0]?.volume || "0";
            };
            return (
              <div
                key={tab}
                className={`stat-tab ${statsTab === tab ? "active" : ""}`}
                onClick={() => setStatsTab(tab)}
              >
                <div className="stat-tab-icon">
                  {tab === "Gainers" ? <Icons.TrendingUp /> : tab === "Losers" ? <Icons.TrendingDown /> : <Icons.Clock />}
                </div>
                <div className="stat-tab-label">{tab}</div>
                <div
                  className={`stat-tab-value ${tab === "Gainers" ? "positive" : tab === "Losers" ? "negative" : ""}`}
                >
                  {getTabValue()}
                </div>
              </div>
            );
          })}
        </div>

        <div className="ranking-list">
          {currentRankingList.map((item, idx) => (
            <div
              key={item.symbol}
              className="ranking-item"
              onClick={() => navigate("trade")}
            >
              <div className="ranking-left">
                <span className="ranking-position">
                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`}
                </span>
                <div className="ranking-info">
                  <div className="ranking-symbol-group">
                    <span className="ranking-symbol">{item.symbol}</span>
                  </div>
                  <span className="ranking-name">{item.name}</span>
                </div>
              </div>
              <div className="ranking-right">
                <div className="ranking-price">
                  {item.volume
                    ? `$${item.volume}`
                    : `$${item.price?.toLocaleString()}`}
                </div>
                {item.change !== undefined && (
                  <div
                    className={`ranking-change ${item.change >= 0 ? "positive" : "negative"}`}
                  >
                    {item.change >= 0 ? <Icons.TrendingUp /> : <Icons.TrendingDown />}
                    {Math.abs(item.change)}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SOL/USDT Detail Card */}
      {solCoin.price > 0 && (
        <div
          className="detail-card glass-card"
          onClick={() => navigate("trade")}
        >
          <div className="detail-header">
            <div className="detail-pair-group">
              <span className="detail-emoji">◎</span>
              <span className="detail-pair">SOL/USDT</span>
            </div>
            <Icons.ArrowRight />
          </div>

          <div className="detail-price-row">
            <span className="detail-price">
              ${solCoin.price.toLocaleString()}
            </span>
            <span
              className={`detail-change ${solCoin.change >= 0 ? "positive" : "negative"}`}
            >
              {solCoin.change >= 0 ? <Icons.TrendingUp /> : <Icons.TrendingDown />}
              {Math.abs(solCoin.change)}%
            </span>
          </div>

          <div className="detail-stats-grid">
            <div className="detail-stat">
              <span className="stat-label">24h High</span>
              <span className="stat-value">
                ${(solCoin.price * 1.05).toFixed(2)}
              </span>
            </div>
            <div className="detail-stat">
              <span className="stat-label">24h Low</span>
              <span className="stat-value">
                ${(solCoin.price * 0.95).toFixed(2)}
              </span>
            </div>
            <div className="detail-stat">
              <span className="stat-label">Volume</span>
              <span className="stat-value">{solCoin.volume || "4.8B"}</span>
            </div>
          </div>

          {solAmount > 0 && (
            <div className="holdings-row">
              <span className="holdings-label">Your Holdings</span>
              <span className="holdings-value">
                {formatCrypto(solAmount)} SOL
              </span>
            </div>
          )}

          <div className="volume-row">
            <span className="volume-label">Market Cap</span>
            <span className="volume-value">{solCoin.marketCap || "$82B"}</span>
          </div>
        </div>
      )}

      {/* ETH/USDT Row */}
      {ethCoin.price > 0 && (
        <div className="eth-card glass-card" onClick={() => navigate("trade")}>
          <div className="eth-left">
            <div
              className="eth-icon-wrapper"
              style={{ background: "rgba(98, 126, 234, 0.15)" }}
            >
              <span className="eth-icon">⟠</span>
            </div>
            <div className="eth-info">
              <span className="eth-label">ETH/USDT</span>
              <span className="eth-sub">Ethereum</span>
            </div>
          </div>
          <div className="eth-right">
            <div className="eth-price">${ethCoin.price.toLocaleString()}</div>
            <div
              className={`eth-change ${ethCoin.change >= 0 ? "positive" : "negative"}`}
            >
              {ethCoin.change >= 0 ? <Icons.TrendingUp /> : <Icons.TrendingDown />}
              {Math.abs(ethCoin.change)}%
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Section */}
      {userTrades.length > 0 && (
        <div className="recent-activity-card glass-card">
          <div className="recent-header">
            <h3 className="recent-title">
              <Icons.Clock /> Recent Activity
            </h3>
            <button className="see-all-btn" onClick={() => navigate("wallet")}>
              History <Icons.ArrowRight />
            </button>
          </div>
          <div className="recent-list">
            {userTrades.slice(0, 3).map((trade) => (
              <div key={trade.id} className="recent-item">
                <div className="recent-icon-wrapper">
                  {trade.type === "buy" ? "🟢" : "🔴"}
                </div>
                <div className="recent-details">
                  <div className="recent-type">
                    {trade.type === "buy" ? "Bought" : "Sold"} {trade.coin}
                  </div>
                  <div className="recent-time">
                    {new Date(trade.time).toLocaleDateString()}
                  </div>
                </div>
                <div
                  className={`recent-amount ${trade.type === "buy" ? "negative" : "positive"}`}
                >
                  {trade.type === "buy" ? "-" : "+"}${trade.total.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buy/Swap Button */}
      <button className="buy-swap-button" onClick={() => navigate("trade")}>
        <span className="btn-icon">🔄</span>
        Buy / Swap Crypto
        <Icons.ArrowRight />
      </button>

      {/* Extra padding for bottom nav */}
      <div className="bottom-padding" />
    </div>
  );
}