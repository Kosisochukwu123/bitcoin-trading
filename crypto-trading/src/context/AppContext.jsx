/**
 * AppContext.jsx
 * =============
 * The ONLY source of truth for the entire app.
 *
 * What lives here:
 *  - users[]         → every registered account with balance + portfolio
 *  - user            → the currently logged-in user (mirror of users[i])
 *  - coins[]         → live coin prices (simulated ticker)
 *  - trades[]        → every buy/sell ever made
 *  - transactions[]  → every money movement (trades, admin funding, etc.)
 *  - overrides{}     → admin controls what happens when a user trades
 *
 * How balance works:
 *  - user.balance  = USDT cash (the "wallet balance")
 *  - user.portfolio = { BTC: 0.5, ETH: 2.1, ... } (coin holdings)
 *  - When buying:  balance goes DOWN, portfolio coin goes UP
 *  - When selling: balance goes UP, portfolio coin goes DOWN
 *  - When admin funds USDT: balance goes UP, transaction recorded
 *  - When admin funds coin: portfolio[coin] goes UP, transaction recorded
 *
 * Key rule: setUser and setUsers are ALWAYS called together for trades
 * so React batches them into one render → instant UI update.
 */

import {
  createContext, useContext, useState,
  useEffect, useCallback, useRef,
} from "react";

const AppContext = createContext(null);

// ── Safe localStorage wrapper ─────────────────────────────────
const LS = {
  get: (key) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; } },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
  del: (key)      => { try { localStorage.removeItem(key); } catch {} },
};

// ── Coins the platform supports ───────────────────────────────
export const SUPPORTED_COINS = [
  { id:"BTC",  name:"Bitcoin",    icon:"₿", color:"#f7931a", startPrice:67420.50 },
  { id:"ETH",  name:"Ethereum",   icon:"Ξ", color:"#627eea", startPrice:3541.20  },
  { id:"BNB",  name:"BNB",        icon:"B", color:"#f0b90b", startPrice:412.80   },
  { id:"SOL",  name:"Solana",     icon:"◎", color:"#9945ff", startPrice:178.40   },
  { id:"LTC",  name:"Litecoin",   icon:"Ł", color:"#bfbbbb", startPrice:82.50    },
  { id:"XRP",  name:"XRP",        icon:"✕", color:"#346aa9", startPrice:0.6234   },
  { id:"ADA",  name:"Cardano",    icon:"₳", color:"#0033ad", startPrice:0.4521   },
  { id:"DOGE", name:"Dogecoin",   icon:"Ð", color:"#c2a633", startPrice:0.1834   },
];

// Build initial coins array with volume/marketCap display strings
const makeCoins = () => SUPPORTED_COINS.map(c => ({
  ...c,
  price:     c.startPrice,
  change:    parseFloat(((Math.random() - 0.5) * 6).toFixed(2)),
  volume:    `${(Math.random() * 20 + 1).toFixed(1)}B`,
  marketCap: `${(Math.random() * 500 + 10).toFixed(0)}B`,
}));

// ── Demo accounts seeded on first load ───────────────────────
const SEED_USERS = [
  {
    id:        1,
    name:      "Alex Johnson",
    email:     "user@demo.com",
    password:  "demo123",
    isAdmin:   false,
    balance:   10000,       // USDT cash balance
    portfolio: { BTC: 0.15, ETH: 2.5, LTC: 3.0 }, // coin holdings
    banned:    false,
    joinedAt:  "2024-01-01T00:00:00.000Z",
  },
  {
    id:        2,
    name:      "Admin User",
    email:     "admin@demo.com",
    password:  "admin123",
    isAdmin:   true,
    balance:   999999,
    portfolio: {},
    banned:    false,
    joinedAt:  "2024-01-01T00:00:00.000Z",
  },
];

// ── Transaction factory ───────────────────────────────────────
// Every financial event creates one of these records.
let txnCounter = Date.now();
function makeTxn(fields) {
  txnCounter++;
  return {
    id:            txnCounter,
    time:          new Date().toISOString(),
    userId:        fields.userId,
    type:          fields.type,        // see types below
    currency:      fields.currency || "USDT",
    amount:        fields.amount,      // positive = credit, negative = debit
    usdValue:      fields.usdValue,    // USD equivalent (for coin txns)
    note:          fields.note || "",
    balanceBefore: fields.balanceBefore,
    balanceAfter:  fields.balanceAfter,
    meta:          fields.meta || {},
  };
  //
  // Transaction types used in the app:
  //  "usdt_credit"     → admin adds USDT cash to user
  //  "usdt_debit"      → admin removes USDT cash from user
  //  "coin_credit"     → admin grants a coin to user portfolio
  //  "coin_debit"      → admin removes a coin from user portfolio
  //  "trade_buy"       → user bought a coin (balance goes down)
  //  "trade_sell"      → user sold a coin (balance goes up)
  //  "account_reset"   → admin reset the account
  //  "welcome_bonus"   → starting balance on registration
}

// ── Storage init helpers ──────────────────────────────────────
function loadUsers() {
  const stored = LS.get("cx_users");
  if (Array.isArray(stored) && stored.length > 0) return stored;
  LS.set("cx_users", SEED_USERS);
  return SEED_USERS;
}
function loadTrades()       { const s = LS.get("cx_trades");       return Array.isArray(s) ? s : []; }
function loadTransactions() { const s = LS.get("cx_transactions"); return Array.isArray(s) ? s : []; }
function loadOverrides()    { return LS.get("cx_overrides") ?? {}; }

// ─────────────────────────────────────────────────────────────
export function AppProvider({ children }) {

  // Restore session
  const savedUsers  = loadUsers();
  const savedId     = LS.get("cx_session");
  const savedUser   = savedId ? (savedUsers.find(u => u.id === savedId) ?? null) : null;

  const [page,         setPage]         = useState(() => !savedUser ? "home" : savedUser.isAdmin ? "admin" : "dashboard");
  const [user,         setUser]         = useState(savedUser);
  const [users,        setUsers]        = useState(savedUsers);
  const [coins,        setCoins]        = useState(makeCoins);
  const [trades,       setTrades]       = useState(loadTrades);
  const [transactions, setTransactions] = useState(loadTransactions);
  const [notifs,       setNotifs]       = useState([]);
  const [overrides,    setOverrides]    = useState(loadOverrides);

  // userRef lets callbacks always read the freshest user
  // without needing user in their dependency arrays
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);

  // ── Persist everything to localStorage ───────────────────────
  useEffect(() => { LS.set("cx_users",        users);        }, [users]);
  useEffect(() => { LS.set("cx_trades",       trades);       }, [trades]);
  useEffect(() => { LS.set("cx_transactions", transactions); }, [transactions]);
  useEffect(() => { LS.set("cx_overrides",    overrides);    }, [overrides]);
  useEffect(() => {
    if (user) LS.set("cx_session", user.id);
    else      LS.del("cx_session");
  }, [user]);

  // ── Sync logged-in user when users array changes ─────────────
  // This makes admin funding show up for the user immediately.
  //
  // ⚠️ IMPORTANT: user must NOT be in the dep array here.
  //    Adding it causes: setUser → user changes → effect fires
  //    → setUser again → infinite loop → UI freezes.
  //    We use the functional form of setUser to safely read
  //    the previous value without making it a dependency.
  useEffect(() => {
    setUser(prev => {
      if (!prev) return prev;
      const fresh = users.find(u => u.id === prev.id);
      if (!fresh) return prev;
      // Only trigger a re-render if something the UI cares about changed
      if (
        fresh.balance   !== prev.balance  ||
        fresh.banned    !== prev.banned   ||
        JSON.stringify(fresh.portfolio)   !== JSON.stringify(prev.portfolio)
      ) return fresh;
      return prev; // same data → React skips re-render
    });
  }, [users]); // ← ONLY [users], never [users, user]

  // ── Cross-tab sync (admin on Tab A → user sees update on Tab B)
  useEffect(() => {
    const handler = e => {
      if (e.key === "cx_users"        && e.newValue) try { setUsers(JSON.parse(e.newValue));        } catch {}
      if (e.key === "cx_trades"       && e.newValue) try { setTrades(JSON.parse(e.newValue));       } catch {}
      if (e.key === "cx_transactions" && e.newValue) try { setTransactions(JSON.parse(e.newValue)); } catch {}
      if (e.key === "cx_overrides"    && e.newValue) try { setOverrides(JSON.parse(e.newValue));    } catch {}
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // ── Live coin price simulation ────────────────────────────────
  useEffect(() => {
    const iv = setInterval(() => {
      setCoins(prev => prev.map(c => {
        const delta    = (Math.random() - 0.495) * c.price * 0.0008;
        const newPrice = Math.max(c.price + delta, 0.0001);
        const newChg   = parseFloat((c.change + (Math.random() - 0.5) * 0.05).toFixed(2));
        return { ...c, price: parseFloat(newPrice.toFixed(c.price < 1 ? 4 : 2)), change: newChg };
      }));
    }, 2500);
    return () => clearInterval(iv);
  }, []);

  // ── Navigation ────────────────────────────────────────────────
  const navigate = useCallback(p => setPage(p), []);

  // ── Notifications ─────────────────────────────────────────────
  const addNotif = useCallback((msg, type = "info") =>
    setNotifs(p => [{ id: Date.now(), msg, type }, ...p.slice(0, 9)]),
  []);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  AUTH
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const login = useCallback((email, pwd) => {
    // Always read fresh from storage so newly registered users work
    const all   = LS.get("cx_users") ?? SEED_USERS;
    const found = all.find(u => u.email === email && u.password === pwd);
    if (!found)       return { success: false, error: "Invalid email or password" };
    if (found.banned) return { success: false, error: "Account suspended. Contact support." };
    setUsers(all);
    setUser(found);
    LS.set("cx_session", found.id);
    setPage(found.isAdmin ? "admin" : "dashboard");
    addNotif(`Welcome back, ${found.name}!`, "success");
    return { success: true };
  }, [addNotif]);

  const register = useCallback((name, email, pwd) => {
    const all = LS.get("cx_users") ?? SEED_USERS;
    if (all.find(u => u.email === email))
      return { success: false, error: "Email already registered" };
    const nu = {
      id: Date.now(), name, email, password: pwd,
      isAdmin: false, balance: 10000, portfolio: {}, banned: false,
      joinedAt: new Date().toISOString(),
    };
    // Welcome transaction
    const txn = makeTxn({
      userId: nu.id, type: "welcome_bonus", currency: "USDT",
      amount: 10000, usdValue: 10000,
      note: "Demo welcome bonus — starting balance",
      balanceBefore: 0, balanceAfter: 10000,
    });
    const nextUsers = [...all, nu];
    const nextTxns  = [txn, ...(LS.get("cx_transactions") ?? [])];
    setUsers(nextUsers); setTransactions(nextTxns);
    LS.set("cx_users", nextUsers); LS.set("cx_transactions", nextTxns);
    setUser(nu); LS.set("cx_session", nu.id);
    setPage("dashboard");
    addNotif(`Welcome to CryptoX, ${name}!`, "success");
    return { success: true };
  }, [addNotif]);

  const logout = useCallback(() => {
    setUser(null); LS.del("cx_session"); setPage("home");
  }, []);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  EXECUTE TRADE
  //  This is the core function. It must:
  //   1. Validate the user has enough balance / coins
  //   2. Apply the admin override (profit / loss / block)
  //   3. Debit balance and credit portfolio (or vice versa)
  //   4. Call BOTH setUsers and setUser so UI updates instantly
  //   5. Record the trade and a transaction
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const executeTrade = useCallback((coinId, type, amount, price) => {
    const cu = userRef.current; // cu = current user
    if (!cu)        { addNotif("Please log in to trade", "error"); return { success: false }; }
    if (cu.banned)  { addNotif("Your account is suspended", "error"); return { success: false }; }

    const total = parseFloat((amount * price).toFixed(6));
    const fee   = parseFloat((total * 0.001).toFixed(6)); // 0.1% fee

    // ── Admin override ────────────────────────────────────────
    const ov     = (LS.get("cx_overrides") ?? {})[cu.id] ?? "none";
    const ovType = typeof ov === "object" ? (ov.type || "none") : ov;

    if (ovType === "force_fail") {
      addNotif("Trade failed: Insufficient liquidity", "error");
      return { success: false };
    }

    const mult = ovType === "force_profit" ? 1.10
               : ovType === "force_loss"   ? 0.90
               : 1.0;
    const resultType = ovType === "force_profit" ? "profit"
                     : ovType === "force_loss"   ? "loss" : "normal";

    // ── Validation ────────────────────────────────────────────
    if (type === "buy") {
      if (cu.balance < total + fee) {
        addNotif(`Insufficient USDT. Need $${(total+fee).toFixed(2)}, have $${cu.balance.toFixed(2)}`, "error");
        return { success: false };
      }
    } else {
      const held = cu.portfolio?.[coinId] || 0;
      if (held < amount) {
        addNotif(`Insufficient ${coinId}. Need ${amount.toFixed(6)}, have ${held.toFixed(6)}`, "error");
        return { success: false };
      }
    }

    // ── Calculate new balance and portfolio ───────────────────
    // Written as a pure function so we call it identically for
    // both setUsers and setUser — no chance of them drifting apart.
    function apply(currentBalance, currentPortfolio) {
      let bal  = currentBalance;
      let port = { ...currentPortfolio };
      if (type === "buy") {
        bal  -= (total + fee);
        port[coinId] = parseFloat(((port[coinId] || 0) + amount * mult).toFixed(6));
      } else {
        bal  += (total * mult - fee);
        port[coinId] = parseFloat(Math.max(0, (port[coinId] || 0) - amount).toFixed(6));
      }
      return { bal: parseFloat(bal.toFixed(4)), port };
    }

    const { bal: newBal, port: newPort } = apply(cu.balance, cu.portfolio || {});

    // ── Build records ─────────────────────────────────────────
    const tradeRecord = {
      id: Date.now(), userId: cu.id, coin: coinId,
      type, amount, price, total, fee, resultType,
      time: new Date().toISOString(),
    };

    const txnRecord = makeTxn({
      userId:        cu.id,
      type:          type === "buy" ? "trade_buy" : "trade_sell",
      currency:      "USDT",
      amount:        type === "buy" ? -(total + fee) : +(total * mult - fee),
      usdValue:      total,
      note:          `${type === "buy" ? "Bought" : "Sold"} ${amount.toFixed(6)} ${coinId} @ $${price.toLocaleString()}`,
      balanceBefore: cu.balance,
      balanceAfter:  newBal,
      meta:          { coinId, coinAmount: amount, price, fee, resultType },
    });

    // ── Apply state — BOTH in one synchronous block ───────────
    // React 18 batches these into a single render automatically.
    setUsers(prev => prev.map(u => {
      if (u.id !== cu.id) return u;
      const { bal, port } = apply(u.balance, u.portfolio || {});
      return { ...u, balance: bal, portfolio: port };
    }));

    setUser(prev => {
      if (!prev || prev.id !== cu.id) return prev;
      const { bal, port } = apply(prev.balance, prev.portfolio || {});
      return { ...prev, balance: bal, portfolio: port };
    });

    setTrades(p       => [tradeRecord, ...p]);
    setTransactions(p => [txnRecord,   ...p]);

    addNotif(
      `${type === "buy" ? "✅ Bought" : "✅ Sold"} ${amount.toFixed(4)} ${coinId} @ $${price.toLocaleString()}`,
      "success"
    );
    return { success: true, trade: tradeRecord };
  }, [addNotif]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  DEBIT BALANCE — used by Futures to deduct margin without
  //  touching the coin portfolio. Returns { success, error }
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const debitBalance = useCallback((amount, note = "Margin deducted") => {
    const cu = userRef.current;
    if (!cu) return { success: false, error: "Not logged in" };
    if (cu.balance < amount) {
      addNotif(`Insufficient balance. Need $${amount.toFixed(2)}, have $${cu.balance.toFixed(2)}`, "error");
      return { success: false, error: "Insufficient balance" };
    }

    const newBal = parseFloat((cu.balance - amount).toFixed(4));

    const txn = makeTxn({
      userId:        cu.id,
      type:          "trade_buy",
      currency:      "USDT",
      amount:        -amount,
      usdValue:      amount,
      note,
      balanceBefore: cu.balance,
      balanceAfter:  newBal,
      meta:          { futures: true },
    });

    setUsers(prev => prev.map(u =>
      u.id !== cu.id ? u : { ...u, balance: newBal }
    ));
    setUser(prev =>
      prev?.id !== cu.id ? prev : { ...prev, balance: newBal }
    );
    setTransactions(p => [txn, ...p]);
    return { success: true };
  }, [addNotif]);
  //  mode: "add" | "subtract" | "set"
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const fundUserBalance = useCallback((userId, amount, mode = "add") => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      const before = u.balance;
      const after  = mode === "set"      ? amount
                   : mode === "subtract" ? Math.max(0, before - amount)
                   : before + amount;
      const note   = mode === "set"      ? `Admin set USDT balance to $${after.toLocaleString()}`
                   : mode === "subtract" ? `Admin deducted $${amount.toLocaleString()} USDT`
                   :                      `Admin credited $${amount.toLocaleString()} USDT`;
      const txn = makeTxn({
        userId, type: mode === "subtract" ? "usdt_debit" : "usdt_credit",
        currency: "USDT",
        amount:   mode === "subtract" ? -Math.abs(after - before) : Math.abs(after - before),
        usdValue: Math.abs(after - before),
        note, balanceBefore: before, balanceAfter: parseFloat(after.toFixed(4)),
        meta: { adminAction: true, mode },
      });
      setTransactions(p => [txn, ...p]);
      addNotif(note, "success");
      return { ...u, balance: parseFloat(after.toFixed(4)) };
    }));
  }, [addNotif]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  ADMIN: FUND USER COIN (BTC, ETH, LTC, etc.)
  //  The user's portfolio[coinId] increases — they see the coin
  //  appear immediately in their dashboard and wallet.
  //  mode: "add" | "subtract" | "set"
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const fundUserCoin = useCallback((userId, coinId, amount, mode = "add") => {
    const coin = coins.find(c => c.id === coinId);
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      const before  = u.portfolio?.[coinId] || 0;
      const after   = mode === "set"      ? amount
                    : mode === "subtract" ? Math.max(0, before - amount)
                    : before + amount;
      const delta   = Math.abs(after - before);
      const usdVal  = delta * (coin?.price || 0);
      const note    = mode === "subtract"
        ? `Admin removed ${delta.toFixed(6)} ${coinId} from your portfolio`
        : `Admin credited ${delta.toFixed(6)} ${coinId} to your portfolio`;
      const txn = makeTxn({
        userId,
        type:          mode === "subtract" ? "coin_debit" : "coin_credit",
        currency:      coinId,
        amount:        mode === "subtract" ? -delta : delta,
        usdValue:      usdVal,
        note,
        balanceBefore: before,
        balanceAfter:  parseFloat(after.toFixed(6)),
        meta:          { adminAction: true, mode, coinId, coinName: coin?.name, coinPrice: coin?.price },
      });
      setTransactions(p => [txn, ...p]);
      addNotif(note, "success");
      return {
        ...u,
        portfolio: { ...u.portfolio, [coinId]: parseFloat(after.toFixed(6)) },
      };
    }));
  }, [coins, addNotif]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  ADMIN: OVERRIDE (control what happens when user trades)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const setAdminOverride = useCallback((userId, type) => {
    // type: "none" | "force_profit" | "force_loss" | "force_fail"
    setOverrides(prev => ({ ...prev, [userId]: type }));
  }, []);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  ADMIN: RESET USER ACCOUNT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const resetUserAccount = useCallback((userId) => {
    const target = users.find(u => u.id === userId);
    const txn = makeTxn({
      userId, type: "account_reset", currency: "USDT",
      amount: 10000, usdValue: 10000,
      note: "Account reset by admin — balance restored to $10,000",
      balanceBefore: target?.balance ?? 0, balanceAfter: 10000,
      meta: { adminAction: true },
    });
    setUsers(prev => prev.map(u => u.id !== userId ? u : { ...u, balance: 10000, portfolio: {} }));
    setTrades(prev => prev.filter(t => t.userId !== userId));
    setTransactions(prev => [txn, ...prev.filter(t => t.userId !== userId)]);
    setOverrides(prev => { const n = { ...prev }; delete n[userId]; return n; });
    addNotif("User account has been reset to $10,000", "info");
  }, [users, addNotif]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  ADMIN: BAN / UNBAN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const banUser = useCallback((userId, banned) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, banned } : u));
    addNotif(`User ${banned ? "banned" : "unbanned"}`, "info");
  }, [addNotif]);

  // ── Coin helpers ──────────────────────────────────────────────
  const getCoin         = useCallback(id  => coins.find(c => c.id === id), [coins]);
  const updateCoinPrice = useCallback((id, price) =>
    setCoins(prev => prev.map(c => c.id === id ? { ...c, price } : c)), []);

  // ── Query helpers ─────────────────────────────────────────────
  const getUserTrades       = useCallback(uid => trades.filter(t => t.userId === uid), [trades]);
  const getUserTransactions = useCallback(uid => transactions.filter(t => t.userId === uid), [transactions]);

  // updateCoinPrice alias used in admin panel
  const adminSetCoinPrice = updateCoinPrice;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <AppContext.Provider value={{
      // Navigation
      page, navigate,

      // Auth
      user, users, login, register, logout,

      // Coins
      coins, getCoin, updateCoinPrice, adminSetCoinPrice,

      // Trading
      trades, executeTrade, getUserTrades,
      debitBalance,

      // Transactions (full ledger)
      transactions, getUserTransactions,

      // Notifications
      notifs, addNotif,

      // Admin
      overrides,
      setAdminOverride,
      fundUserBalance,    // fund USDT cash
      fundUserCoin,       // fund a specific coin (BTC, LTC, etc.)
      resetUserAccount,
      banUser,

      // Kept for backward compat with existing pages
      updateUserBalance:   fundUserBalance,
      updateUserPortfolio: fundUserCoin,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
