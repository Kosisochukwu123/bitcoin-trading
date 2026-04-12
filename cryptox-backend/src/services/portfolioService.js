// src/services/portfolioService.js
import User from "../models/User.js";
import Coin from "../models/Coin.js";
import Trade from "../models/Trade.js";

const PortfolioService = {
  /**
   * Build a full portfolio summary for a user
   */
  getSummary: (userId) => {
    const user  = User.findById(userId);
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }

    const coins = Coin.findAll();

    // Build holdings with live valuations
    const holdings = Object.entries(user.portfolio || {})
      .filter(([, amt]) => amt > 0)
      .map(([coinId, amount]) => {
        const coin  = coins.find(c => c.id === coinId);
        if (!coin) return null;
        const value = coin.price * amount;
        return { coinId, name: coin.name, icon: coin.icon, color: coin.color, amount, price: coin.price, value, change24h: coin.change };
      })
      .filter(Boolean)
      .sort((a, b) => b.value - a.value); // largest first

    const portfolioValue = holdings.reduce((s, h) => s + h.value, 0);
    const totalValue     = user.balance + portfolioValue;

    // Allocation percentages
    const allocations = [
      ...holdings.map(h => ({
        coinId: h.coinId,
        label:  h.coinId,
        value:  h.value,
        pct:    totalValue > 0 ? parseFloat(((h.value / totalValue) * 100).toFixed(2)) : 0,
        color:  h.color,
      })),
      {
        coinId: "USDT",
        label:  "USDT",
        value:  user.balance,
        pct:    totalValue > 0 ? parseFloat(((user.balance / totalValue) * 100).toFixed(2)) : 0,
        color:  "#10b981",
      },
    ];

    // Trade stats
    const trades     = Trade.findByUserId(userId);
    const buyVolume  = trades.filter(t => t.type === "buy").reduce((s, t) => s + t.total, 0);
    const sellVolume = trades.filter(t => t.type === "sell").reduce((s, t) => s + t.total, 0);

    return {
      userId,
      balance:        user.balance,
      portfolioValue,
      totalValue,
      holdings,
      allocations,
      tradeStats: {
        totalTrades: trades.length,
        buyVolume:   parseFloat(buyVolume.toFixed(2)),
        sellVolume:  parseFloat(sellVolume.toFixed(2)),
        totalVolume: parseFloat((buyVolume + sellVolume).toFixed(2)),
      },
    };
  },
};

export default PortfolioService;
