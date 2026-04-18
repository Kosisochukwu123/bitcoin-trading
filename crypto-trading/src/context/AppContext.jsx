/**
 * AppContext.jsx — Single source of truth
 *
 * TRADE LIFECYCLE (the key change):
 *   1. User buys/sells → balance debits at market price → trade saved as status:"pending"
 *   2. Admin sees the pending trade in Admin → Trades tab
 *   3. Admin clicks "Mark Win" or "Mark Loss" + sets a percentage
 *   4. A profit/loss amount is credited / debited from user's balance
 *   5. Trade status → "settled", resultType → "profit"|"loss"|"normal"
 *   6. A transaction record appears in the user's Wallet history
 *
 * DEPOSIT ADDRESSES:
 *   Stored in depositAddresses[coinId] = "address string"
 *   Admin can change any address from Admin → Settings tab
 *   User sees the current address in Wallet → Deposit modal
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

const AppContext = createContext(null);

const LS = {
  get: (key) => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  },
  set: (key, val) => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  },
  del: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};

// ── Supported coins ───────────────────────────────────────────
export const SUPPORTED_COINS = [
  {
    id: "BTC",
    name: "Bitcoin",
    icon: "₿",
    color: "#f7931a",
    startPrice: 67420.5,
  },
  {
    id: "ETH",
    name: "Ethereum",
    icon: "Ξ",
    color: "#627eea",
    startPrice: 3541.2,
  },
  { id: "BNB", name: "BNB", icon: "B", color: "#f0b90b", startPrice: 412.8 },
  { id: "SOL", name: "Solana", icon: "◎", color: "#9945ff", startPrice: 178.4 },
  {
    id: "LTC",
    name: "Litecoin",
    icon: "Ł",
    color: "#bfbbbb",
    startPrice: 82.5,
  },
  { id: "XRP", name: "XRP", icon: "✕", color: "#346aa9", startPrice: 0.6234 },
  {
    id: "ADA",
    name: "Cardano",
    icon: "₳",
    color: "#0033ad",
    startPrice: 0.4521,
  },
  {
    id: "DOGE",
    name: "Dogecoin",
    icon: "Ð",
    color: "#c2a633",
    startPrice: 0.1834,
  },
];

// Default deposit addresses — admin can change these any time
const DEFAULT_DEPOSIT_ADDRESSES = {
  BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  ETH: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  BNB: "bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2",
  SOL: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  LTC: "LQZaqKHSCXhBFabfB9hbmCzfMFmGLQBh89",
  XRP: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
  ADA: "addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp",
  DOGE: "DH5yaieqoZN36fDVciNyRueRGvGLR3mr7L",
  USDT: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
};

const makeCoins = () =>
  SUPPORTED_COINS.map((c) => ({
    ...c,
    price: c.startPrice,
    change: parseFloat(((Math.random() - 0.5) * 6).toFixed(2)),
    volume: `${(Math.random() * 20 + 1).toFixed(1)}B`,
    marketCap: `${(Math.random() * 500 + 10).toFixed(0)}B`,
  }));

const SEED_USERS = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "user@demo.com",
    password: "demo123",
    isAdmin: false,
    balance: 10000,
    portfolio: { BTC: 0.15, ETH: 2.5, LTC: 3.0 },
    banned: false,
    joinedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    name: "Admin User",
    email: "admin@demo.com",
    password: "admin123",
    isAdmin: true,
    balance: 999999,
    portfolio: {},
    banned: false,
    joinedAt: "2024-01-01T00:00:00.000Z",
  },
];

let txnCounter = Date.now();
function makeTxn(fields) {
  txnCounter++;
  return {
    id: txnCounter,
    time: new Date().toISOString(),
    userId: fields.userId,
    type: fields.type,
    currency: fields.currency || "USDT",
    amount: fields.amount,
    usdValue: fields.usdValue || 0,
    note: fields.note || "",
    balanceBefore: fields.balanceBefore,
    balanceAfter: fields.balanceAfter,
    meta: fields.meta || {},
  };
}

function loadUsers() {
  const s = LS.get("cx_users");
  return Array.isArray(s) && s.length
    ? s
    : (() => {
        LS.set("cx_users", SEED_USERS);
        return SEED_USERS;
      })();
}
function loadTrades() {
  const s = LS.get("cx_trades");
  return Array.isArray(s) ? s : [];
}
function loadTransactions() {
  const s = LS.get("cx_transactions");
  return Array.isArray(s) ? s : [];
}
function loadAddresses() {
  return LS.get("cx_addresses") ?? DEFAULT_DEPOSIT_ADDRESSES;
}

// ─────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const savedUsers = loadUsers();
  const savedId = LS.get("cx_session");
  const savedUser = savedId
    ? (savedUsers.find((u) => u.id === savedId) ?? null)
    : null;

  const [page, setPage] = useState(() =>
    !savedUser ? "home" : savedUser.isAdmin ? "admin" : "dashboard",
  );
  const [user, setUser] = useState(savedUser);
  const [users, setUsers] = useState(savedUsers);
  const [coins, setCoins] = useState(makeCoins);
  const [trades, setTrades] = useState(loadTrades);
  const [transactions, setTransactions] = useState(loadTransactions);
  const [notifs, setNotifs] = useState([]);
  const [depositAddresses, setDepositAddresses] = useState(loadAddresses);

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // ── Persist ───────────────────────────────────────────────────
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
    LS.set("cx_addresses", depositAddresses);
  }, [depositAddresses]);
  useEffect(() => {
    if (user) LS.set("cx_session", user.id);
    else LS.del("cx_session");
  }, [user]);

  // ── Sync logged-in user when users array changes ──────────────
  // DO NOT add `user` to deps — causes infinite loop
  useEffect(() => {
    setUser((prev) => {
      if (!prev) return prev;
      const fresh = users.find((u) => u.id === prev.id);
      if (!fresh) return prev;
      if (
        fresh.balance !== prev.balance ||
        fresh.banned !== prev.banned ||
        JSON.stringify(fresh.portfolio) !== JSON.stringify(prev.portfolio)
      )
        return fresh;
      return prev;
    });
  }, [users]); // ← ONLY [users]

  // ── Cross-tab sync ────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (e.key === "cx_users" && e.newValue)
        try {
          setUsers(JSON.parse(e.newValue));
        } catch {}
      if (e.key === "cx_trades" && e.newValue)
        try {
          setTrades(JSON.parse(e.newValue));
        } catch {}
      if (e.key === "cx_transactions" && e.newValue)
        try {
          setTransactions(JSON.parse(e.newValue));
        } catch {}
      if (e.key === "cx_addresses" && e.newValue)
        try {
          setDepositAddresses(JSON.parse(e.newValue));
        } catch {}
    };
    window.addEventListener("storage", h);
    return () => window.removeEventListener("storage", h);
  }, []);

  // ── Live prices ───────────────────────────────────────────────
  useEffect(() => {
    const iv = setInterval(() => {
      setCoins((prev) =>
        prev.map((c) => {
          const delta = (Math.random() - 0.495) * c.price * 0.0008;
          const newPrice = Math.max(c.price + delta, 0.0001);
          const newChg = parseFloat(
            (c.change + (Math.random() - 0.5) * 0.05).toFixed(2),
          );
          return {
            ...c,
            price: parseFloat(newPrice.toFixed(c.price < 1 ? 4 : 2)),
            change: newChg,
          };
        }),
      );
    }, 2500);
    return () => clearInterval(iv);
  }, []);

  const navigate = useCallback((p) => setPage(p), []);
  const addNotif = useCallback(
    (msg, type = "info") =>
      setNotifs((p) => [{ id: Date.now(), msg, type }, ...p.slice(0, 9)]),
    [],
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  AUTH
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const login = useCallback(
    (email, pwd) => {
      const all = LS.get("cx_users") ?? SEED_USERS;
      const found = all.find((u) => u.email === email && u.password === pwd);
      if (!found) return { success: false, error: "Invalid email or password" };
      if (found.banned)
        return { success: false, error: "Account suspended. Contact support." };
      setUsers(all);
      setUser(found);
      LS.set("cx_session", found.id);
      setPage(found.isAdmin ? "admin" : "dashboard");
      addNotif(`Welcome back, ${found.name}!`, "success");
      return { success: true };
    },
    [addNotif],
  );

  const register = useCallback(
    (name, email, pwd) => {
      const all = LS.get("cx_users") ?? SEED_USERS;
      if (all.find((u) => u.email === email))
        return { success: false, error: "Email already registered" };
      const nu = {
        id: Date.now(),
        name,
        email,
        password: pwd,
        isAdmin: false,
        balance: 10000,
        portfolio: {},
        banned: false,
        joinedAt: new Date().toISOString(),
      };
      const txn = makeTxn({
        userId: nu.id,
        type: "welcome_bonus",
        currency: "USDT",
        amount: 10000,
        usdValue: 10000,
        note: "Demo welcome bonus",
        balanceBefore: 0,
        balanceAfter: 10000,
      });
      const nextUsers = [...all, nu];
      const nextTxns = [txn, ...(LS.get("cx_transactions") ?? [])];
      setUsers(nextUsers);
      setTransactions(nextTxns);
      LS.set("cx_users", nextUsers);
      LS.set("cx_transactions", nextTxns);
      setUser(nu);
      LS.set("cx_session", nu.id);
      setPage("dashboard");
      addNotif(`Welcome to CryptoX, ${name}!`, "success");
      return { success: true };
    },
    [addNotif],
  );

  const logout = useCallback(() => {
    setUser(null);
    LS.del("cx_session");
    setPage("home");
  }, []);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  EXECUTE TRADE
  //
  //  What happens when user clicks Buy / Sell:
  //   1. Validate balance
  //   2. Debit USDT from balance (for buy) or debit coin (for sell)
  //   3. Credit coin to portfolio (for buy) or credit USDT (for sell)
  //   4. Save trade as status: "pending" — admin will settle it
  //   5. Record a transaction
  //
  //  The admin then reviews pending trades and marks each one as:
  //   - "settled_win"  → user gets bonus USDT credited
  //   - "settled_loss" → user gets USDT debited
  //   - "settled"      → trade settles at face value (no adjustment)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const executeTrade = useCallback(
    (coinId, type, amount, price) => {
      const cu = userRef.current;
      if (!cu) {
        addNotif("Please log in to trade", "error");
        return { success: false };
      }
      if (cu.banned) {
        addNotif("Your account is suspended", "error");
        return { success: false };
      }

      const total = parseFloat((amount * price).toFixed(6));
      const fee = parseFloat((total * 0.001).toFixed(6));

      // Validate
      if (type === "buy") {
        if (cu.balance < total + fee) {
          addNotif(
            `Insufficient USDT. Need $${(total + fee).toFixed(2)}, have $${cu.balance.toFixed(2)}`,
            "error",
          );
          return { success: false };
        }
      } else {
        const held = cu.portfolio?.[coinId] || 0;
        if (held < amount) {
          addNotif(
            `Insufficient ${coinId}. Have ${held.toFixed(6)}, need ${amount.toFixed(6)}`,
            "error",
          );
          return { success: false };
        }
      }

      // Apply balance/portfolio changes at face value (no multiplier yet)
      function apply(bal, port) {
        let b = bal,
          p = { ...port };
        if (type === "buy") {
          b -= total + fee;
          p[coinId] = parseFloat(((p[coinId] || 0) + amount).toFixed(6));
        } else {
          b += total - fee;
          p[coinId] = parseFloat(
            Math.max(0, (p[coinId] || 0) - amount).toFixed(6),
          );
        }
        return { bal: parseFloat(b.toFixed(4)), port: p };
      }

      const { bal: newBal } = apply(cu.balance, cu.portfolio || {});

      // Trade record — starts as "pending", admin will settle it
      const tradeRecord = {
        id: Date.now(),
        userId: cu.id,
        userName: cu.name,
        coin: coinId,
        type,
        amount,
        price,
        total,
        fee,
        status: "pending", // "pending" | "settled" | "settled_win" | "settled_loss"
        resultType: "normal", // updated by admin when settling
        profitLossPct: 0, // set by admin
        profitLossAmt: 0, // actual USDT credited/debited on settle
        time: new Date().toISOString(),
        settledAt: null,
      };

      const txnRecord = makeTxn({
        userId: cu.id,
        type: type === "buy" ? "trade_buy" : "trade_sell",
        currency: "USDT",
        amount: type === "buy" ? -(total + fee) : +(total - fee),
        usdValue: total,
        note: `${type === "buy" ? "Bought" : "Sold"} ${amount.toFixed(6)} ${coinId} @ $${price.toLocaleString()} — pending settlement`,
        balanceBefore: cu.balance,
        balanceAfter: newBal,
        meta: {
          coinId,
          coinAmount: amount,
          price,
          fee,
          tradeId: tradeRecord.id,
        },
      });

      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== cu.id) return u;
          const { bal, port } = apply(u.balance, u.portfolio || {});
          return { ...u, balance: bal, portfolio: port };
        }),
      );
      setUser((prev) => {
        if (!prev || prev.id !== cu.id) return prev;
        const { bal, port } = apply(prev.balance, prev.portfolio || {});
        return { ...prev, balance: bal, portfolio: port };
      });
      setTrades((p) => [tradeRecord, ...p]);
      setTransactions((p) => [txnRecord, ...p]);

      addNotif(
        `${type === "buy" ? "✅ Bought" : "✅ Sold"} ${amount.toFixed(4)} ${coinId} @ $${price.toLocaleString()} — awaiting settlement`,
        "success",
      );
      return { success: true, trade: tradeRecord };
    },
    [addNotif],
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  ADMIN: SETTLE TRADE
  //
  //  Called when admin reviews a pending trade and marks it.
  //  outcome: "win" | "loss" | "normal"
  //  pct:     percentage of trade total to credit/debit as profit/loss
  //
  //  win:    user.balance  += total * (pct/100)   — bonus paid out
  //  loss:   user.balance  -= total * (pct/100)   — loss deducted
  //  normal: no balance change, just marks the trade settled
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const settleTrade = useCallback(
    (tradeId, outcome, pct = 0) => {
      const trade = trades.find((t) => t.id === tradeId);
      if (!trade) {
        addNotif("Trade not found", "error");
        return;
      }
      if (trade.status !== "pending") {
        addNotif("Trade already settled", "error");
        return;
      }

      const profitLossAmt = parseFloat(((trade.total * pct) / 100).toFixed(4));
      const resultType =
        outcome === "win" ? "profit" : outcome === "loss" ? "loss" : "normal";
      const newStatus =
        outcome === "win"
          ? "settled_win"
          : outcome === "loss"
            ? "settled_loss"
            : "settled";

      // Update the trade record
      setTrades((prev) =>
        prev.map((t) => {
          if (t.id !== tradeId) return t;
          return {
            ...t,
            status: newStatus,
            resultType,
            profitLossPct:
              outcome === "win" ? pct : outcome === "loss" ? -pct : 0,
            profitLossAmt:
              outcome === "win"
                ? profitLossAmt
                : outcome === "loss"
                  ? -profitLossAmt
                  : 0,
            settledAt: new Date().toISOString(),
          };
        }),
      );

      // Credit or debit the user's balance
      if (outcome !== "normal") {
        setUsers((prev) =>
          prev.map((u) => {
            if (u.id !== trade.userId) return u;
            const before = u.balance;
            const after =
              outcome === "win"
                ? parseFloat((before + profitLossAmt).toFixed(4))
                : parseFloat(Math.max(0, before - profitLossAmt).toFixed(4));

            const note =
              outcome === "win"
                ? `Trade profit credited — ${pct}% of $${trade.total.toFixed(2)} (${trade.coin} trade)`
                : `Trade loss deducted — ${pct}% of $${trade.total.toFixed(2)} (${trade.coin} trade)`;

            const txn = makeTxn({
              userId: u.id,
              type: outcome === "win" ? "trade_profit" : "trade_loss",
              currency: "USDT",
              amount: outcome === "win" ? profitLossAmt : -profitLossAmt,
              usdValue: profitLossAmt,
              note,
              balanceBefore: before,
              balanceAfter: after,
              meta: {
                adminAction: true,
                tradeId,
                tradeTotal: trade.total,
                pct,
                outcome,
                coinId: trade.coin,
              },
            });

            setTransactions((p) => [txn, ...p]);
            addNotif(
              outcome === "win"
                ? `✅ Win settled — $${profitLossAmt.toFixed(2)} credited to ${u.name}`
                : `📉 Loss settled — $${profitLossAmt.toFixed(2)} deducted from ${u.name}`,
              outcome === "win" ? "success" : "error",
            );
            return { ...u, balance: after };
          }),
        );
      } else {
        addNotif("Trade settled at face value", "info");
      }
    },
    [trades, addNotif],
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  ADMIN: DEPOSIT ADDRESS MANAGEMENT
  //  Admin can change the wallet address shown to users for each coin.
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const updateDepositAddress = useCallback(
    (coinId, address) => {
      setDepositAddresses((prev) => ({ ...prev, [coinId]: address }));
      addNotif(`${coinId} deposit address updated`, "success");
    },
    [addNotif],
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  ADMIN: FUND USER BALANCE (USDT)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const fundUserBalance = useCallback(
    (userId, amount, mode = "add") => {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u;
          const before = u.balance;
          const after =
            mode === "set"
              ? amount
              : mode === "subtract"
                ? Math.max(0, before - amount)
                : before + amount;
          const note =
            mode === "set"
              ? `Admin set USDT balance to $${after.toLocaleString()}`
              : mode === "subtract"
                ? `Admin deducted $${amount.toLocaleString()} USDT`
                : `Admin credited $${amount.toLocaleString()} USDT`;
          const txn = makeTxn({
            userId,
            type: mode === "subtract" ? "usdt_debit" : "usdt_credit",
            currency: "USDT",
            amount:
              mode === "subtract"
                ? -Math.abs(after - before)
                : Math.abs(after - before),
            usdValue: Math.abs(after - before),
            note,
            balanceBefore: before,
            balanceAfter: parseFloat(after.toFixed(4)),
            meta: { adminAction: true, mode },
          });
          setTransactions((p) => [txn, ...p]);
          addNotif(note, "success");
          return { ...u, balance: parseFloat(after.toFixed(4)) };
        }),
      );
    },
    [addNotif],
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  ADMIN: FUND USER COIN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const fundUserCoin = useCallback(
    (userId, coinId, amount, mode = "add") => {
      const coin = coins.find((c) => c.id === coinId);
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u;
          const before = u.portfolio?.[coinId] || 0;
          const after =
            mode === "set"
              ? amount
              : mode === "subtract"
                ? Math.max(0, before - amount)
                : before + amount;
          const delta = Math.abs(after - before);
          const usdVal = delta * (coin?.price || 0);
          const note =
            mode === "subtract"
              ? `Admin removed ${delta.toFixed(6)} ${coinId} from portfolio`
              : `Admin credited ${delta.toFixed(6)} ${coinId} to portfolio`;
          const txn = makeTxn({
            userId,
            type: mode === "subtract" ? "coin_debit" : "coin_credit",
            currency: coinId,
            amount: mode === "subtract" ? -delta : delta,
            usdValue: usdVal,
            note,
            balanceBefore: before,
            balanceAfter: parseFloat(after.toFixed(6)),
            meta: { adminAction: true, mode, coinId, coinPrice: coin?.price },
          });
          setTransactions((p) => [txn, ...p]);
          addNotif(note, "success");
          return {
            ...u,
            portfolio: {
              ...u.portfolio,
              [coinId]: parseFloat(after.toFixed(6)),
            },
          };
        }),
      );
    },
    [coins, addNotif],
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  ADMIN: RESET ACCOUNT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const resetUserAccount = useCallback(
    (userId) => {
      const target = users.find((u) => u.id === userId);
      const txn = makeTxn({
        userId,
        type: "account_reset",
        currency: "USDT",
        amount: 10000,
        usdValue: 10000,
        note: "Account reset by admin — restored to $10,000",
        balanceBefore: target?.balance ?? 0,
        balanceAfter: 10000,
        meta: { adminAction: true },
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id !== userId ? u : { ...u, balance: 10000, portfolio: {} },
        ),
      );
      setTrades((prev) => prev.filter((t) => t.userId !== userId));
      setTransactions((prev) => [
        txn,
        ...prev.filter((t) => t.userId !== userId),
      ]);
      addNotif("Account reset to $10,000", "info");
    },
    [users, addNotif],
  );

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  ADMIN: BAN / UNBAN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const banUser = useCallback(
    (userId, banned) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, banned } : u)),
      );
      addNotif(`User ${banned ? "banned" : "unbanned"}`, "info");
    },
    [addNotif],
  );

  // ── Futures margin debit ──────────────────────────────────────
  const debitBalance = useCallback(
    (amount, note = "Margin deducted") => {
      const cu = userRef.current;
      if (!cu) return { success: false, error: "Not logged in" };
      if (cu.balance < amount) {
        addNotif(`Insufficient balance. Need $${amount.toFixed(2)}`, "error");
        return { success: false, error: "Insufficient balance" };
      }
      const newBal = parseFloat((cu.balance - amount).toFixed(4));
      const txn = makeTxn({
        userId: cu.id,
        type: "trade_buy",
        currency: "USDT",
        amount: -amount,
        usdValue: amount,
        note,
        balanceBefore: cu.balance,
        balanceAfter: newBal,
        meta: { futures: true },
      });
      setUsers((prev) =>
        prev.map((u) => (u.id !== cu.id ? u : { ...u, balance: newBal })),
      );
      setUser((prev) =>
        prev?.id !== cu.id ? prev : { ...prev, balance: newBal },
      );
      setTransactions((p) => [txn, ...p]);
      return { success: true };
    },
    [addNotif],
  );

  // ── Coin helpers ──────────────────────────────────────────────
  const getCoin = useCallback((id) => coins.find((c) => c.id === id), [coins]);
  const updateCoinPrice = useCallback(
    (id, price) =>
      setCoins((prev) => prev.map((c) => (c.id === id ? { ...c, price } : c))),
    [],
  );

  // ── Query helpers ─────────────────────────────────────────────
  const getUserTrades = useCallback(
    (uid) => trades.filter((t) => t.userId === uid),
    [trades],
  );
  const getUserTransactions = useCallback(
    (uid) => transactions.filter((t) => t.userId === uid),
    [transactions],
  );

  const pendingTrades = trades.filter((t) => t.status === "pending");

  return (
    <AppContext.Provider
      value={{
        page,
        navigate,
        user,
        users,
        login,
        register,
        logout,
        coins,
        getCoin,
        updateCoinPrice,
        trades,
        executeTrade,
        getUserTrades,
        settleTrade,
        pendingTrades,
        transactions,
        getUserTransactions,
        notifs,
        addNotif,
        depositAddresses,
        updateDepositAddress,
        fundUserBalance,
        fundUserCoin,
        resetUserAccount,
        banUser,
        debitBalance,
        updateUserBalance: fundUserBalance,
        updateUserPortfolio: fundUserCoin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
