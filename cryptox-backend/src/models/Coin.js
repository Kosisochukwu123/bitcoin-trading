// src/models/Coin.js
import db from "../config/database.js";

const Coin = {
  // ── READ ────────────────────────────────────────────────────

  findAll: () => db.coins,

  findById: (id) => db.coins.find(c => c.id === id.toUpperCase()) || null,

  // ── WRITE ───────────────────────────────────────────────────

  setPrice: (id, price) => {
    const idx = db.coins.findIndex(c => c.id === id.toUpperCase());
    if (idx === -1) return null;
    const delta    = price - db.coins[idx].price;
    const changePct = parseFloat(((delta / db.coins[idx].price) * 100).toFixed(2));
    db.coins[idx] = { ...db.coins[idx], price, change: changePct };
    return db.coins[idx];
  },

  /** Apply a small random tick (called by PriceService) */
  tick: () => {
    db.coins = db.coins.map(c => {
      const delta    = (Math.random() - 0.495) * c.price * 0.0009;
      const newPrice = Math.max(c.price + delta, 0.0001);
      const rounded  = parseFloat(newPrice.toFixed(newPrice < 1 ? 4 : 2));
      const change   = parseFloat((c.change + (Math.random() - 0.5) * 0.06).toFixed(2));
      return { ...c, price: rounded, change };
    });
    return db.coins;
  },
};

export default Coin;
