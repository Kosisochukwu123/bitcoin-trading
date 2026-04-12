// AppContext.backend.jsx  (replaces AppContext.jsx in your React project)
// ─────────────────────────────────────────────────────────────
//  Drop-in replacement for the in-memory AppContext.
//  Wires the same interface to the real REST API.
//
//  To activate:
//    1. Copy this file to  src/context/AppContext.jsx
//    2. Add VITE_API_URL=http://localhost:5000/api  to frontend .env
// ─────────────────────────────────────────────────────────────
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api, { Token } from "../api/client";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [page,     setPage]     = useState("home");
  const [user,     setUser]     = useState(null);
  const [users,    setUsers]    = useState([]);
  const [coins,    setCoins]    = useState([]);
  const [trades,   setTrades]   = useState([]);
  const [notifs,   setNotifs]   = useState([]);
  const [overrides,setOverrides]= useState({});
  const [loading,  setLoading]  = useState(true);

  const navigate = useCallback(p => setPage(p), []);

  const addNotif = useCallback((msg, type = "info") =>
    setNotifs(p => [{ id: Date.now(), msg, type }, ...p.slice(0, 9)]), []);

  // ── BOOT: restore session if token exists ─────────────────
  useEffect(() => {
    const restore = async () => {
      if (!Token.getAccess()) { setLoading(false); return; }
      try {
        const { data } = await api.auth.me();
        setUser(data);
        setPage(data.isAdmin ? "admin" : "dashboard");
      } catch {
        Token.clear();
      } finally {
        setLoading(false);
      }
    };
    restore();

    // Listen for forced logouts (token expired + refresh failed)
    const handleLogout = () => { setUser(null); setPage("login"); };
    window.addEventListener("cx:logout", handleLogout);
    return () => window.removeEventListener("cx:logout", handleLogout);
  }, []);

  // ── LIVE PRICES: poll every 3 s ──────────────────────────
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const { data } = await api.market.getAll();
        setCoins(data);
      } catch { /* silent fail */ }
    };
    fetchCoins();
    const iv = setInterval(fetchCoins, 3000);
    return () => clearInterval(iv);
  }, []);

  // ── AUTH ─────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const { data } = await api.auth.login(email, password);
      setUser(data.user);
      setPage(data.user.isAdmin ? "admin" : "dashboard");
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.auth.register(name, email, password);
      setUser(data.user);
      setPage("dashboard");
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    await api.auth.logout().catch(() => {});
    setUser(null);
    setPage("home");
  };

  // ── TRADES ───────────────────────────────────────────────
  const executeTrade = async (coinId, type, amount, price, orderType = "market") => {
    try {
      const { data, message } = await api.trades.execute(coinId, type, amount, orderType);
      // Update user balance + portfolio from response
      setUser(data.user);
      // Prepend new trade to local list
      setTrades(p => [data.trade, ...p]);
      addNotif(message, "success");
      return { success: true, trade: data.trade };
    } catch (err) {
      addNotif(err.message, "error");
      return { success: false, error: err.message };
    }
  };

  const fetchMyTrades = useCallback(async (page = 1, limit = 20) => {
    try {
      const { data } = await api.trades.getAll(page, limit);
      setTrades(data.data);
      return data;
    } catch { return null; }
  }, []);

  // ── ADMIN ────────────────────────────────────────────────
  const fetchAdminUsers = useCallback(async () => {
    try {
      const { data } = await api.admin.getUsers();
      setUsers(data);
      return data;
    } catch { return []; }
  }, []);

  const fetchAdminOverrides = useCallback(async () => {
    try {
      const { data } = await api.admin.getOverrides();
      setOverrides(data);
      return data;
    } catch { return {}; }
  }, []);

  const setAdminOverride = async (userId, override) => {
    try {
      await api.admin.setOverride(userId, override);
      setOverrides(p => ({ ...p, [userId]: override }));
      addNotif(`Override set to '${override}'`, "info");
    } catch (err) {
      addNotif(err.message, "error");
    }
  };

  const updateUserBalance = async (userId, amount, mode) => {
    try {
      const { data } = await api.admin.fundBalance(userId, amount, mode);
      setUsers(p => p.map(u => u.id === userId ? data : u));
      addNotif(`Balance updated for ${data.name}`, "success");
      return data;
    } catch (err) {
      addNotif(err.message, "error");
      return null;
    }
  };

  const updateUserPortfolio = async (userId, coinId, amount, mode) => {
    try {
      const { data } = await api.admin.fundPortfolio(userId, coinId, amount, mode);
      setUsers(p => p.map(u => u.id === userId ? data : u));
      addNotif(`Portfolio updated for ${data.name}`, "success");
      return data;
    } catch (err) {
      addNotif(err.message, "error");
      return null;
    }
  };

  const resetUserAccount = async (userId) => {
    try {
      const { data } = await api.admin.resetUser(userId);
      setUsers(p => p.map(u => u.id === userId ? data.user : u));
      addNotif("User account reset successfully", "success");
      return data;
    } catch (err) {
      addNotif(err.message, "error");
      return null;
    }
  };

  const banUser = async (userId, banned) => {
    try {
      const { data } = await api.admin.banUser(userId, banned);
      setUsers(p => p.map(u => u.id === userId ? data : u));
      addNotif(`User ${banned ? "banned" : "unbanned"}`, "info");
      return data;
    } catch (err) {
      addNotif(err.message, "error");
      return null;
    }
  };

  const updateCoinPrice = async (coinId, price) => {
    try {
      const { data } = await api.admin.setCoinPrice(coinId, price);
      setCoins(p => p.map(c => c.id === coinId ? data : c));
      addNotif(`${coinId} price updated to $${price.toLocaleString()}`, "success");
    } catch (err) {
      addNotif(err.message, "error");
    }
  };

  const getCoin = useCallback(id => coins.find(c => c.id === id), [coins]);

  return (
    <AppContext.Provider value={{
      page, navigate, loading,
      user, setUser, users,
      login, register, logout,
      coins, getCoin, updateCoinPrice,
      trades, executeTrade, fetchMyTrades,
      notifs, addNotif,
      overrides, setAdminOverride,
      updateUserBalance, updateUserPortfolio,
      resetUserAccount, banUser,
      fetchAdminUsers, fetchAdminOverrides,
    }}>
      {loading
        ? (
          <div style={{ minHeight:"100vh", background:"#080c18", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>₿</div>
              <div style={{ color:"#f7931a", fontWeight:700 }}>Loading CryptoX…</div>
            </div>
          </div>
        )
        : children
      }
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
