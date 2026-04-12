import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { CoinChip, Sparkline } from "../components/UI";
import "./Dashboard.css";

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

  const quickActions = [
    { icon: "🤝", label: "P2P", page: "p2p", color: "#6366f1" },
    { icon: "📤", label: "Send", page: "wallet", color: "#10b981" },
    { icon: "📥", label: "Receive", page: "wallet", color: "#f59e0b" },
    { icon: "🔄", label: "Swap", page: "trade", color: "#8b5cf6" },
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

  return (
    <div className="dashboard-mobile">
      {/* Status Bar */}
      <div className="status-bar">
        <span className="status-time">9:41</span>
        <div className="status-icons">
          <span>📶</span>
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Greeting */}
      <div className="greeting-section">
        <h1 className="greeting-title">
          Hello, {user?.name?.split(" ")[0] || "Trader"} 👋
        </h1>
        <p className="greeting-subtitle">Welcome back to CryptoX</p>
      </div>

      {/* Wallet Card */}
      <div className="wallet-card">
        <div className="wallet-header">
          <div className="wallet-label-group">
            <span className="wallet-icon">💰</span>
            <span className="wallet-label">Total Portfolio Value</span>
          </div>
          <div className="wallet-badge">USD</div>
        </div>

        <div className="wallet-balance">${formatNumber(portfolioValue)}</div>

        <div className="wallet-change-group">
          <span
            className={`change-badge ${portfolioChange >= 0 ? "positive" : "negative"}`}
          >
            {portfolioChange >= 0 ? "+" : ""}
            {portfolioChange}%
          </span>
          <span
            className={`change-amount ${portfolioChange >= 0 ? "positive" : "negative"}`}
          >
            {portfolioChange >= 0 ? "↑" : "↓"} +$
            {formatNumber(Math.abs(portfolioChangeAmount))}
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
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-row">
        {quickActions.map((action) => (
          <button
            key={action.label}
            className="quick-action-chip"
            onClick={() => navigate(action.page)}
            style={{
              background: `${action.color}15`,
              borderColor: `${action.color}30`,
            }}
          >
            <span className="quick-action-icon">{action.icon}</span>
            <span className="quick-action-label">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Chart Card */}
      <div className="chart-card">
        <div className="chart-header">
          <div className="chart-title-group">
            <span className="chart-title">Bitcoin Price</span>
            <button className="see-all-btn" onClick={() => navigate("market")}>
              See All &gt;
            </button>
          </div>
          <div className="chart-price-group">
            <span className="chart-coin-price">
              ${btcCoin.price.toLocaleString()}
            </span>
            <span
              className={`chart-change ${btcCoin.change >= 0 ? "positive" : "negative"}`}
            >
              {btcCoin.change >= 0 ? "+" : ""}
              {btcCoin.change}%
            </span>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-bars">
            {chartData.map((value, index) => (
              <div key={index} className="bar-wrapper">
                <div
                  className="chart-bar"
                  style={{
                    height: `${(value / Math.max(...chartData)) * 100}%`,
                    background: `linear-gradient(180deg, #f7931a, #f59e0b)`,
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
              <span className="mini-stat-label">{coin.id}</span>
              <span className="mini-stat-value">
                ${coin.price.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ranking Section */}
      <div className="ranking-card">
        <div className="ranking-header">
          <h3 className="ranking-title">Market Rankings</h3>
          <button className="see-all-btn" onClick={() => navigate("market")}>
            See All &gt;
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
                <span className="ranking-position">{idx + 1}</span>
                <div className="ranking-info">
                  <span className="ranking-symbol">{item.symbol}</span>
                  <span className="ranking-name">{item.name}</span>
                </div>
              </div>
              <div className="ranking-right">
                <div className="ranking-price">
                  {item.volume
                    ? item.volume
                    : `$${item.price?.toLocaleString()}`}
                </div>
                {item.change !== undefined && (
                  <div
                    className={`ranking-change ${item.change >= 0 ? "positive" : "negative"}`}
                  >
                    {item.change >= 0 ? "+" : ""}
                    {item.change}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SOL/USDT Detail Card */}
      {solCoin.price > 0 && (
        <div className="detail-card" onClick={() => navigate("trade")}>
          <div className="detail-header">
            <span className="detail-pair">SOL/USDT</span>
            <span className="detail-arrow">→</span>
          </div>

          <div className="detail-price-row">
            <span className="detail-price">
              ${solCoin.price.toLocaleString()}
            </span>
            <span
              className={`detail-change ${solCoin.change >= 0 ? "positive" : "negative"}`}
            >
              {solCoin.change >= 0 ? "+" : ""}
              {solCoin.change}%
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
        <div className="eth-card" onClick={() => navigate("trade")}>
          <div className="eth-left">
            <span className="eth-icon">⟠</span>
            <span className="eth-label">ETH/USDT</span>
          </div>
          <div className="eth-right">
            <div className="eth-price">${ethCoin.price.toLocaleString()}</div>
            <div
              className={`eth-change ${ethCoin.change >= 0 ? "positive" : "negative"}`}
            >
              {ethCoin.change >= 0 ? "+" : ""}
              {ethCoin.change}%
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Section */}
      {userTrades.length > 0 && (
        <div className="recent-activity-card">
          <div className="recent-header">
            <h3 className="recent-title">Recent Activity</h3>
            <button className="see-all-btn" onClick={() => navigate("wallet")}>
              View All &gt;
            </button>
          </div>
          <div className="recent-list">
            {userTrades.slice(0, 3).map((trade) => (
              <div key={trade.id} className="recent-item">
                <div className="recent-icon">
                  {trade.type === "buy" ? "📈" : "📉"}
                </div>
                <div className="recent-details">
                  <div className="recent-type">
                    {trade.type.toUpperCase()} {trade.coin}
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
        Buy / Swap
      </button>

      {/* Extra padding for bottom nav */}
      <div className="bottom-padding" />
    </div>
  );
}
