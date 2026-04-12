// src/api/client.js  (place this in your React project)
// ─────────────────────────────────────────────────────────────
//  Centralised API client for the CryptoX React frontend.
//  Handles token storage, auto-refresh, and typed responses.
//
//  Usage:
//    import api from "./api/client";
//    const { data } = await api.auth.login("email", "pass");
// ─────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ── TOKEN STORAGE ────────────────────────────────────────────
const Token = {
  getAccess:     ()      => localStorage.getItem("cx_access"),
  getRefresh:    ()      => localStorage.getItem("cx_refresh"),
  setAccess:     (t)     => localStorage.setItem("cx_access", t),
  setRefresh:    (t)     => localStorage.setItem("cx_refresh", t),
  setAll:        (a, r)  => { Token.setAccess(a); Token.setRefresh(r); },
  clear:         ()      => { localStorage.removeItem("cx_access"); localStorage.removeItem("cx_refresh"); },
};

// ── BASE FETCH ───────────────────────────────────────────────
let isRefreshing = false;
let refreshQueue = [];

const flushQueue = (token, error) => {
  refreshQueue.forEach(cb => error ? cb.reject(error) : cb.resolve(token));
  refreshQueue = [];
};

async function request(path, options = {}, retry = true) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = Token.getAccess();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // Auto-refresh on 401
  if (res.status === 401 && retry) {
    const refreshToken = Token.getRefresh();
    if (!refreshToken) {
      Token.clear();
      window.dispatchEvent(new Event("cx:logout"));
      throw new Error("Session expired — please log in again");
    }

    if (isRefreshing) {
      // Queue the request until refresh completes
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then(newToken => {
        headers["Authorization"] = `Bearer ${newToken}`;
        return request(path, { ...options, headers }, false);
      });
    }

    isRefreshing = true;
    try {
      const refreshRes  = await fetch(`${BASE_URL}/auth/refresh`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ refreshToken }),
      });
      const refreshData = await refreshRes.json();
      if (!refreshData.success) throw new Error("Refresh failed");

      Token.setAll(refreshData.data.accessToken, refreshData.data.refreshToken);
      flushQueue(refreshData.data.accessToken, null);
      isRefreshing = false;

      // Retry the original request with the new token
      return request(path, options, false);
    } catch (err) {
      flushQueue(null, err);
      isRefreshing = false;
      Token.clear();
      window.dispatchEvent(new Event("cx:logout"));
      throw err;
    }
  }

  const data = await res.json();
  if (!data.success) {
    const err = new Error(data.message || "Request failed");
    err.status = res.status;
    err.errors = data.errors;
    throw err;
  }

  return data;
}

const get    = (path)         => request(path, { method: "GET" });
const post   = (path, body)   => request(path, { method: "POST",  body });
const patch  = (path, body)   => request(path, { method: "PATCH", body });
const del    = (path)         => request(path, { method: "DELETE" });

// ── API SURFACE ──────────────────────────────────────────────
const api = {

  // ── AUTH ──────────────────────────────────────────────────
  auth: {
    register: (name, email, password) =>
      post("/auth/register", { name, email, password }).then(r => {
        Token.setAll(r.data.accessToken, r.data.refreshToken);
        return r;
      }),

    login: (email, password) =>
      post("/auth/login", { email, password }).then(r => {
        Token.setAll(r.data.accessToken, r.data.refreshToken);
        return r;
      }),

    logout: () =>
      post("/auth/logout", { refreshToken: Token.getRefresh() }).finally(() => {
        Token.clear();
      }),

    refresh: () =>
      post("/auth/refresh", { refreshToken: Token.getRefresh() }).then(r => {
        Token.setAll(r.data.accessToken, r.data.refreshToken);
        return r;
      }),

    me: () => get("/auth/me"),
  },

  // ── MARKET ────────────────────────────────────────────────
  market: {
    getAll:    ()       => get("/market"),
    getOne:    (coinId) => get(`/market/${coinId}`),
    snapshot:  ()       => get("/market/snapshot"),
  },

  // ── TRADES ───────────────────────────────────────────────
  trades: {
    execute: (coinId, type, amount, orderType = "market", limitPrice = null) =>
      post("/trades", { coinId, type, amount, orderType, limitPrice }),

    getAll:  (page = 1, limit = 20) =>
      get(`/trades?page=${page}&limit=${limit}`),

    getOne:  (id) => get(`/trades/${id}`),
  },

  // ── PORTFOLIO ────────────────────────────────────────────
  portfolio: {
    getSummary: () => get("/portfolio"),
  },

  // ── ADMIN ────────────────────────────────────────────────
  admin: {
    getStats:    ()                            => get("/admin/stats"),
    getUsers:    ()                            => get("/admin/users"),
    getUser:     (userId)                      => get(`/admin/users/${userId}`),
    getTrades:   (page = 1, limit = 50)        => get(`/admin/trades?page=${page}&limit=${limit}`),
    getOverrides:()                            => get("/admin/overrides"),

    // Balance
    fundBalance: (userId, amount, mode)        =>
      patch(`/admin/users/${userId}/balance`, { amount, mode }),

    // Portfolio
    fundPortfolio: (userId, coinId, amount, mode) =>
      patch(`/admin/users/${userId}/portfolio`, { coinId, amount, mode }),

    // Account actions
    resetUser:   (userId)                      => post(`/admin/users/${userId}/reset`),
    banUser:     (userId, banned)              => patch(`/admin/users/${userId}/ban`, { banned }),

    // Override
    setOverride: (userId, override)            =>
      patch(`/admin/users/${userId}/override`, { override }),

    // Price
    setCoinPrice:(coinId, price)               =>
      patch(`/admin/coins/${coinId}/price`, { price }),
  },
};

export { Token };
export default api;
