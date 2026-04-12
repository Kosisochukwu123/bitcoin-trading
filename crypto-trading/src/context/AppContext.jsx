import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const AppContext = createContext();

// ─────────────────────────────────────────────────────────────
//  localStorage helpers — safe, never throw
// ─────────────────────────────────────────────────────────────
const LS = {
  get: (key, fallback = null) => {
    try {
      const r = localStorage.getItem(key);
      return r ? JSON.parse(r) : fallback;
    } catch {
      return fallback;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
  del: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};

// ── seed data ─────────────────────────────────────────────────
const INITIAL_COINS = [
  { id: "BTC", name: "Bitcoin", price: 67420.5, change: 2.34, icon: "₿", color: "#f7931a", volume: "28.4B", marketCap: "1.32T" },
  { id: "ETH", name: "Ethereum", price: 3541.2, change: -1.12, icon: "Ξ", color: "#627eea", volume: "15.2B", marketCap: "425B" },
  { id: "BNB", name: "BNB", price: 412.8, change: 0.87, icon: "B", color: "#f0b90b", volume: "2.1B", marketCap: "61B" },
  { id: "SOL", name: "Solana", price: 178.4, change: 5.21, icon: "◎", color: "#9945ff", volume: "4.8B", marketCap: "82B" },
  { id: "XRP", name: "XRP", price: 0.6234, change: -0.45, icon: "✕", color: "#346aa9", volume: "1.9B", marketCap: "35B" },
  { id: "ADA", name: "Cardano", price: 0.4521, change: 1.23, icon: "₳", color: "#0033ad", volume: "0.8B", marketCap: "16B" },
  { id: "DOGE", name: "Dogecoin", price: 0.1834, change: 3.45, icon: "Ð", color: "#c2a633", volume: "1.2B", marketCap: "26B" },
  { id: "AVAX", name: "Avalanche", price: 38.72, change: -2.11, icon: "A", color: "#e84142", volume: "0.6B", marketCap: "16B" },
];

const SEED_USERS = [
  {
    id: 1,
    email: "user@demo.com",
    password: "demo123",
    name: "Alex Johnson",
    username: "crypto_alex",
    isAdmin: false,
    balance: 10000,
    portfolio: { BTC: 0.15, ETH: 2.5 },
    joined: "January 2024",
    phone: "+1 234 567 8900",
    location: "New York, USA",
    bio: "Crypto enthusiast and trader since 2020",
    avatar: null,
    banned: false,
  },
  {
    id: 2,
    email: "admin@demo.com",
    password: "admin123",
    name: "Admin User",
    username: "crypto_admin",
    isAdmin: true,
    balance: 999999,
    portfolio: {},
    joined: "January 2024",
    phone: "+1 987 654 3210",
    location: "San Francisco, USA",
    bio: "Platform administrator",
    avatar: null,
    banned: false,
  },
];

// Valid pages for navigation
const VALID_PAGES = [
  "home", "dashboard", "market", "trade", "portfolio",
  "wallet", "profile", "p2p", "earn", "futures", "admin", "login", "register"
];

// ── Transaction Helper ─────────────────────────────────────────
// Creates a standardized transaction record for the ledger
function makeTxn({ userId, type, amount, currency = "USDT", note = "", balanceBefore, balanceAfter, meta = {} }) {
  return {
    id: Date.now() + Math.random(), // ensure unique even in same ms
    userId,
    type,        // "credit" | "debit" | "trade_buy" | "trade_sell" | "crypto_credit" | "crypto_debit" | "reset"
    amount,
    currency,
    note,
    balanceBefore,
    balanceAfter,
    meta,        // e.g. { coin, coinAmount, adminAction, resultType }
    time: new Date().toISOString(),
  };
}

// ── localStorage initialization functions ─────────────────────
function initUsers() {
  const stored = LS.get("cx_users");
  if (stored && Array.isArray(stored) && stored.length > 0) return stored;
  LS.set("cx_users", SEED_USERS);
  return SEED_USERS;
}

function initTrades() {
  const stored = LS.get("cx_trades");
  return Array.isArray(stored) ? stored : [];
}

function initTransactions() {
  const stored = LS.get("cx_transactions");
  return Array.isArray(stored) ? stored : [];
}

function initOverrides() {
  return LS.get("cx_overrides") ?? {};
}

// ─────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  // ── Restore session from storage ────────────────────────────
  const restoredUsers = initUsers();
  const restoredUserId = LS.get("cx_session");
  const restoredUser = restoredUserId
    ? restoredUsers.find((u) => u.id === restoredUserId) ?? null
    : null;

  const [page, setPage] = useState(() => {
    if (!restoredUser) return "home";
    return restoredUser.isAdmin ? "admin" : "dashboard";
  });

  const [user, setUser] = useState(restoredUser);
  const [users, setUsers] = useState(restoredUsers);
  const [coins, setCoins] = useState(INITIAL_COINS);
  const [trades, setTrades] = useState(initTrades);
  const [transactions, setTransactions] = useState(initTransactions);
  const [notifs, setNotifs] = useState([]);
  const [overrides, setOverrides] = useState(initOverrides);

  // ref so callbacks can read latest user without stale closure
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // ── Persist to localStorage whenever data changes ────────────
  useEffect(() => {
    LS.set("cx_users", users);
  }, [users]);
  useEffect(() => {
    LS.set("cx_trades", trades);
  }, [trades]);
  useEffect(() => {
    LS.set("cx_transactions", transactions);
  }, [transactions]);
  useEffect(() => {
    LS.set("cx_overrides", overrides);
  }, [overrides]);

  // ── Keep session pointer in sync with current user ───────────
  useEffect(() => {
    if (user) {
      LS.set("cx_session", user.id);
    } else {
      LS.del("cx_session");
    }
  }, [user]);

  // ── Keep logged-in user in sync with users array ───────────
  // This is what makes admin funding reflect INSTANTLY for the user
  useEffect(() => {
    if (!user) return;
    const fresh = users.find((u) => u.id === user.id);
    if (fresh && JSON.stringify(fresh) !== JSON.stringify(user)) {
      setUser(fresh);
    }
  }, [users, user]);

  // ── Cross-tab / cross-window real-time sync ─────────────────
  // When admin funds a user from a DIFFERENT browser tab, the user's
  // tab receives a storage event and immediately pulls fresh data.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "cx_users" && e.newValue) {
        try {
          const fresh = JSON.parse(e.newValue);
          setUsers(fresh);
        } catch {}
      }
      if (e.key === "cx_trades" && e.newValue) {
        try {
          setTrades(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === "cx_transactions" && e.newValue) {
        try {
          setTransactions(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === "cx_overrides" && e.newValue) {
        try {
          setOverrides(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ── Live price simulation ────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setCoins((prev) =>
        prev.map((c) => {
          const delta = (Math.random() - 0.495) * c.price * 0.0008;
          const newPrice = Math.max(c.price + delta, 0.001);
          const newChange = parseFloat((c.change + (Math.random() - 0.5) * 0.05).toFixed(2));
          return {
            ...c,
            price: parseFloat(newPrice.toFixed(c.price < 1 ? 4 : 2)),
            change: newChange,
          };
        })
      );
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // ── Navigation with validation ───────────────────────────────
  const navigate = useCallback((targetPage) => {
    if (VALID_PAGES.includes(targetPage)) {
      console.log("Navigating to:", targetPage);
      setPage(targetPage);
    } else {
      console.warn(`Invalid page: ${targetPage}`);
      setPage("dashboard");
    }
  }, []);

  // ── Add notification ─────────────────────────────────────────
  const addNotif = useCallback((msg, type = "info") => {
    setNotifs((prev) => [
      { id: Date.now(), msg, type, time: new Date() },
      ...prev.slice(0, 9),
    ]);
  }, []);

  // ── Auth Functions ───────────────────────────────────────────
  const login = useCallback(
    (email, pwd) => {
      const all = LS.get("cx_users") ?? users;
      const found = all.find((u) => u.email === email && u.password === pwd);

      if (!found) {
        addNotif("Invalid email or password", "error");
        return { success: false, error: "Invalid email or password" };
      }

      if (found.banned) {
        addNotif("Your account has been banned. Contact support.", "error");
        return { success: false, error: "Account banned" };
      }

      setUsers(all);
      setUser(found);
      LS.set("cx_session", found.id);
      setPage(found.isAdmin ? "admin" : "dashboard");
      addNotif(`Welcome back, ${found.name}!`, "success");
      return { success: true };
    },
    [users, addNotif]
  );

  const register = useCallback(
    (name, email, pwd) => {
      const all = LS.get("cx_users") ?? users;

      if (all.find((u) => u.email === email)) {
        addNotif("Email already exists", "error");
        return { success: false, error: "Email already exists" };
      }

      const newUser = {
        id: Date.now(),
        email,
        password: pwd,
        name,
        username: email.split("@")[0],
        isAdmin: false,
        balance: 10000,
        portfolio: {},
        joined: new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        phone: "",
        location: "",
        bio: "New to CryptoX!",
        avatar: null,
        banned: false,
      };

      // Create opening balance transaction
      const openTxn = makeTxn({
        userId: newUser.id,
        type: "credit",
        amount: 10000,
        currency: "USDT",
        note: "Welcome bonus — demo starting balance",
        balanceBefore: 0,
        balanceAfter: 10000,
      });

      const nextUsers = [...all, newUser];
      const nextTxns = [openTxn, ...transactions];

      setUsers(nextUsers);
      setTransactions(nextTxns);
      LS.set("cx_users", nextUsers);
      LS.set("cx_transactions", nextTxns);
      setUser(newUser);
      LS.set("cx_session", newUser.id);
      setPage("dashboard");
      addNotif(`Welcome to CryptoX, ${name}!`, "success");
      return { success: true };
    },
    [users, transactions, addNotif]
  );

  const logout = useCallback(() => {
    setUser(null);
    LS.del("cx_session");
    setPage("home");
    addNotif("You have been logged out", "info");
  }, [addNotif]);

  // ── Update user profile ──────────────────────────────────────
  const updateProfile = useCallback(
    (updatedData) => {
      if (!user) return false;

      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === user.id) {
            const updated = { ...u, ...updatedData };
            setUser(updated);
            return updated;
          }
          return u;
        })
      );

      addNotif("Profile updated successfully!", "success");
      return true;
    },
    [user, addNotif]
  );

  // ── Execute Trade (with transaction record) ─────────────────
  const executeTrade = useCallback(
    (coinId, type, amount, price) => {
      const currentUser = userRef.current;
      if (!currentUser) {
        addNotif("Please login to trade", "error");
        return { success: false };
      }

      if (currentUser.banned) {
        addNotif("Your account is banned. Cannot execute trades.", "error");
        return { success: false };
      }

      const total = amount * price;
      const override = overrides[currentUser.id] || { type: "none" };
      const overrideType = override.type || "none";

      if (overrideType === "force_fail") {
        addNotif("Trade failed: Admin override active", "error");
        return { success: false };
      }

      // Apply profit/loss percentages from override
      let multiplier = 1;
      let resultType = "normal";

      if (overrideType === "force_profit") {
        const profitPercent = override?.profitPercent || 10;
        multiplier = 1 + profitPercent / 100;
        resultType = "profit";
      } else if (overrideType === "force_loss") {
        const lossPercent = override?.lossPercent || 10;
        multiplier = 1 - lossPercent / 100;
        resultType = "loss";
      }

      const fee = parseFloat((total * 0.001).toFixed(4));

      const trade = {
        id: Date.now(),
        userId: currentUser.id,
        coin: coinId,
        type,
        amount,
        price,
        total,
        fee,
        time: new Date().toISOString(),
        resultType,
      };

      // Calculate balance changes for transaction record
      const balBefore = currentUser.balance;
      let balAfter = balBefore;
      if (type === "buy") {
        balAfter = balBefore - total - fee;
      } else {
        balAfter = balBefore + total * multiplier - fee;
      }

      // Create transaction record
      const txn = makeTxn({
        userId: currentUser.id,
        type: type === "buy" ? "trade_buy" : "trade_sell",
        amount: type === "buy" ? -(total + fee) : total * multiplier - fee,
        currency: "USDT",
        note: `${type === "buy" ? "Bought" : "Sold"} ${amount.toFixed(6)} ${coinId} @ $${price.toLocaleString()}`,
        balanceBefore: balBefore,
        balanceAfter: balAfter,
        meta: { coin: coinId, coinAmount: amount, price, resultType },
      });

      setTrades((prev) => [trade, ...prev]);
      setTransactions((prev) => [txn, ...prev]);

      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== currentUser.id) return u;
          let bal = u.balance;
          let port = { ...u.portfolio };

          if (type === "buy") {
            if (bal < total) {
              addNotif("Insufficient balance", "error");
              return u;
            }
            bal -= total + fee;
            port[coinId] = (port[coinId] || 0) + amount * multiplier;
          } else {
            const currentAmount = port[coinId] || 0;
            if (currentAmount < amount) {
              addNotif("Insufficient holdings", "error");
              return u;
            }
            bal += total * multiplier - fee;
            port[coinId] = Math.max(0, currentAmount - amount);
          }

          return { ...u, balance: parseFloat(bal.toFixed(4)), portfolio: port };
        })
      );

      addNotif(
        `${type === "buy" ? "Bought" : "Sold"} ${amount.toFixed(4)} ${coinId} @ $${price.toLocaleString()}`,
        "success"
      );
      return { success: true, trade };
    },
    [overrides, addNotif]
  );

  // ── Coin Management ──────────────────────────────────────────
  const updateCoinPrice = useCallback(
    (id, price) => {
      setCoins((prev) => prev.map((c) => (c.id === id ? { ...c, price } : c)));
      addNotif(`${id} price updated to $${price.toLocaleString()}`, "info");
    },
    [addNotif]
  );

  const getCoin = useCallback((id) => coins.find((c) => c.id === id), [coins]);

  // ── Admin: Override Management ───────────────────────────────
  const setUserTradeOverride = useCallback(
    (uid, overrideData) => {
      setOverrides((prev) => ({
        ...prev,
        [uid]: overrideData,
      }));
      addNotif(`Trade override set for user`, "info");
    },
    [addNotif]
  );

  const setAdminOverride = useCallback(
    (uid, val) => {
      setOverrides((prev) => ({
        ...prev,
        [uid]: { type: val, profitPercent: 10, lossPercent: 10 },
      }));
      addNotif(`Admin override set to ${val}`, "info");
    },
    [addNotif]
  );

  // ── Admin: Balance Management (with transaction record) ──────
  const updateUserBalance = useCallback(
    (uid, amount, mode = "add") => {
      setUsers((prev) => {
        const next = prev.map((u) => {
          if (u.id !== uid) return u;
          const before = u.balance;
          let after;

          switch (mode) {
            case "set":
              after = amount;
              break;
            case "subtract":
              after = Math.max(0, before - amount);
              break;
            default:
              after = before + amount;
          }

          const label =
            mode === "set"
              ? `Admin set balance to $${after.toLocaleString()}`
              : mode === "subtract"
              ? `Admin deducted $${amount.toLocaleString()} from wallet`
              : `Admin credited $${amount.toLocaleString()} to wallet`;

          // Create transaction record
          const txn = makeTxn({
            userId: uid,
            type: mode === "subtract" ? "debit" : "credit",
            amount: mode === "subtract" ? -amount : mode === "set" ? after - before : amount,
            currency: "USDT",
            note: label,
            balanceBefore: before,
            balanceAfter: parseFloat(after.toFixed(4)),
            meta: { adminAction: true, mode },
          });

          setTransactions((p) => [txn, ...p]);
          addNotif(label, mode === "subtract" ? "error" : "success");

          return { ...u, balance: parseFloat(after.toFixed(4)) };
        });
        return next;
      });
    },
    [addNotif]
  );

  // ── Admin: Portfolio Management (with transaction record) ────
  const updateUserPortfolio = useCallback(
    (uid, coinId, amount, mode = "add") => {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== uid) return u;
          const current = u.portfolio[coinId] || 0;
          let newAmount;

          switch (mode) {
            case "add":
              newAmount = current + amount;
              break;
            case "subtract":
              newAmount = Math.max(0, current - amount);
              break;
            default:
              newAmount = amount;
          }

          const coin = coins.find((c) => c.id === coinId);
          const usdVal = (mode === "subtract" ? amount : newAmount - current) * (coin?.price || 0);
          const label = `Admin ${mode === "subtract" ? "removed" : "granted"} ${amount} ${coinId}`;

          const txn = makeTxn({
            userId: uid,
            type: mode === "subtract" ? "crypto_debit" : "crypto_credit",
            amount: mode === "subtract" ? -amount : amount,
            currency: coinId,
            note: label,
            balanceBefore: current,
            balanceAfter: parseFloat(newAmount.toFixed(6)),
            meta: { adminAction: true, mode, coinId, usdValue: usdVal, coinPrice: coin?.price },
          });

          setTransactions((p) => [txn, ...p]);
          addNotif(label, "success");

          return { ...u, portfolio: { ...u.portfolio, [coinId]: parseFloat(newAmount.toFixed(6)) } };
        })
      );
    },
    [coins, addNotif]
  );

  // ── Admin: Reset Account ─────────────────────────────────────
  const resetUserAccount = useCallback(
    (uid) => {
      const target = users.find((u) => u.id === uid);
      const txn = makeTxn({
        userId: uid,
        type: "reset",
        amount: 10000,
        currency: "USDT",
        note: "Account reset by admin — balance restored to $10,000",
        balanceBefore: target?.balance ?? 0,
        balanceAfter: 10000,
        meta: { adminAction: true },
      });

      setUsers((prev) =>
        prev.map((u) => (u.id !== uid ? u : { ...u, balance: 10000, portfolio: {} }))
      );
      setTrades((prev) => prev.filter((t) => t.userId !== uid));
      setTransactions((prev) => [txn, ...prev.filter((t) => t.userId !== uid)]);
      addNotif("User account has been reset", "info");
    },
    [users, addNotif]
  );

  // ── Admin: Ban/Unban User ────────────────────────────────────
  const banUser = useCallback(
    (uid, banned) => {
      setUsers((prev) => prev.map((u) => (u.id === uid ? { ...u, banned } : u)));

      if (user && user.id === uid && banned) {
        logout();
        addNotif("Your account has been banned. Contact support.", "error");
      }

      addNotif(`User ${banned ? "banned" : "unbanned"} successfully`, "info");
    },
    [user, logout, addNotif]
  );

  // ── Helper Functions ─────────────────────────────────────────
  const getUserById = useCallback((id) => users.find((u) => u.id === id), [users]);
  const getUserTrades = useCallback((userId) => trades.filter((t) => t.userId === userId), [trades]);
  const getUserTransactions = useCallback((userId) => transactions.filter((t) => t.userId === userId), [transactions]);

  // ─────────────────────────────────────────────────────────────
  return (
    <AppContext.Provider
      value={{
        // Navigation
        page,
        navigate,

        // User Management
        user,
        users,
        login,
        register,
        logout,
        updateProfile,
        getUserById,

        // Market Data
        coins,
        getCoin,
        updateCoinPrice,

        // Trading
        trades,
        executeTrade,
        getUserTrades,

        // Transactions (NEW)
        transactions,
        getUserTransactions,

        // Notifications
        notifs,
        addNotif,

        // Admin Functions
        overrides,
        setAdminOverride,
        setUserTradeOverride,
        updateUserBalance,
        updateUserPortfolio,
        resetUserAccount,
        banUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);