// src/config/database.js
// ─────────────────────────────────────────────────────────────
//  In-memory database store
//  Swap this out for MongoDB/PostgreSQL by replacing the
//  db.users / db.trades / db.coins references in the services.
// ─────────────────────────────────────────────────────────────
import { v4 as uuid } from "uuid";
import bcrypt from "bcryptjs";

const COINS = [
  { id:"BTC",  name:"Bitcoin",    price:67420.50, change:2.34,  icon:"₿", color:"#f7931a", volume:"28.4B", marketCap:"1.32T" },
  { id:"ETH",  name:"Ethereum",   price:3541.20,  change:-1.12, icon:"Ξ", color:"#627eea", volume:"15.2B", marketCap:"425B"  },
  { id:"BNB",  name:"BNB",        price:412.80,   change:0.87,  icon:"B", color:"#f0b90b", volume:"2.1B",  marketCap:"61B"   },
  { id:"SOL",  name:"Solana",     price:178.40,   change:5.21,  icon:"◎", color:"#9945ff", volume:"4.8B",  marketCap:"82B"   },
  { id:"XRP",  name:"XRP",        price:0.6234,   change:-0.45, icon:"✕", color:"#346aa9", volume:"1.9B",  marketCap:"35B"   },
  { id:"ADA",  name:"Cardano",    price:0.4521,   change:1.23,  icon:"₳", color:"#0033ad", volume:"0.8B",  marketCap:"16B"   },
  { id:"DOGE", name:"Dogecoin",   price:0.1834,   change:3.45,  icon:"Ð", color:"#c2a633", volume:"1.2B",  marketCap:"26B"   },
  { id:"AVAX", name:"Avalanche",  price:38.72,    change:-2.11, icon:"A", color:"#e84142", volume:"0.6B",  marketCap:"16B"   },
];

// Pre-hash passwords synchronously at boot (demo only)
const hashSync = (pwd) => bcrypt.hashSync(pwd, 10);

const db = {
  users: [
    {
      id:        "user-001",
      name:      "Alex Johnson",
      email:     "user@demo.com",
      password:  hashSync("demo123"),
      isAdmin:   false,
      balance:   10000,
      portfolio: { BTC: 0.15, ETH: 2.5 },
      banned:    false,
      createdAt: new Date("2024-01-01").toISOString(),
    },
    {
      id:        "admin-001",
      name:      "Admin User",
      email:     "admin@demo.com",
      password:  hashSync("admin123"),
      isAdmin:   true,
      balance:   999999,
      portfolio: {},
      banned:    false,
      createdAt: new Date("2024-01-01").toISOString(),
    },
  ],

  trades: [],

  coins: COINS.map(c => ({ ...c })),

  // Admin overrides:  { [userId]: "none" | "force_profit" | "force_loss" | "force_fail" }
  overrides: {},

  // Refresh tokens store:  { [token]: userId }
  refreshTokens: {},
};

export default db;
export { uuid };
