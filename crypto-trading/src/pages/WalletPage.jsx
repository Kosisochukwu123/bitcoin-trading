/**
 * WalletPage.jsx
 * ==============
 * Shows the user's:
 *  1. Total portfolio value (USDT cash + all coin holdings valued at live price)
 *  2. Asset table — USDT balance + every coin they hold
 *  3. Transaction history — every credit, debit, trade, admin funding
 *
 * Everything here is LIVE — it reads from context which updates
 * the instant a trade happens or the admin funds the user.
 */

import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import "./WalletPage.css"

// SVG Icons
const Icons = {
  Wallet: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z" strokeLinejoin="round"/>
      <path d="M3 9H21" strokeLinecap="round"/>
      <circle cx="17" cy="13" r="1.2" fill="currentColor"/>
    </svg>
  ),
  
  TrendingUp: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 6L13.5 15.5L8.5 10.5L1 18" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 6H23V12" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  TrendingDown: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 18L13.5 8.5L8.5 13.5L1 6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 18H23V12" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  ArrowRight: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12H19M12 5L19 12L12 19" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  Trade: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 16L10 10L14 14L20 8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 14V8H14" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  Deposit: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 5V19M12 5L8 9M12 5L16 9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  Withdraw: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 19V5M12 19L8 15M12 19L16 15" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  Transfer: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 2L21 6L17 10" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 6H21" strokeLinecap="round"/>
      <path d="M7 22L3 18L7 14" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 18H3" strokeLinecap="round"/>
    </svg>
  ),
  
  Buy: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8V16M8 12H16" strokeLinecap="round"/>
    </svg>
  ),
  
  Refresh: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 12C1 18.5 5.5 23 12 23C18.5 23 23 18.5 23 12C23 5.5 18.5 1 12 1" strokeLinecap="round"/>
      <path d="M12 1L9 4L12 7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  Clock: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6V12L16 14" strokeLinecap="round"/>
    </svg>
  ),
  
  Check: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  Copy: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="9" y="9" width="13" height="13" rx="2" strokeLinejoin="round"/>
      <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" strokeLinecap="round"/>
    </svg>
  ),
  
  Warning: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 9V13M12 17H12.01" strokeLinecap="round"/>
      <path d="M12 2L1 21H23L12 2Z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  Info: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16V12M12 8H12.01" strokeLinecap="round"/>
    </svg>
  ),
  
  USDTIcon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#10b981" opacity="0.2" stroke="#10b981" strokeWidth="1"/>
      <text x="12" y="16" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">₮</text>
    </svg>
  ),
  
  TransactionBuy: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
      <path d="M12 5V19M12 5L8 9M12 5L16 9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  TransactionSell: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5">
      <path d="M12 19V5M12 19L8 15M12 19L16 15" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  Credit: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8V16M8 12H16" strokeLinecap="round"/>
    </svg>
  ),
  
  Debit: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <path d="M8 12H16" strokeLinecap="round"/>
    </svg>
  ),
  
  Gift: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5">
      <path d="M20 12V22H4V12" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 7H2V12H22V7Z" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 22V7M12 7H7.5C6.5 7 5.5 6.5 5.5 5C5.5 3.5 6.5 3 7.5 3C9.5 3 12 7 12 7Z" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 7H16.5C17.5 7 18.5 6.5 18.5 5C18.5 3.5 17.5 3 16.5 3C14.5 3 12 7 12 7Z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  Reset: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f7931a" strokeWidth="1.5">
      <path d="M1 12C1 18.5 5.5 23 12 23C18.5 23 23 18.5 23 12C23 5.5 18.5 1 12 1" strokeLinecap="round"/>
      <path d="M12 1L9 4L12 7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  Admin: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f7931a" strokeWidth="1.5">
      <path d="M12 2C8.5 2 6 4.5 6 8C6 12 12 22 12 22C12 22 18 12 18 8C18 4.5 15.5 2 12 2Z" strokeLinecap="round"/>
      <circle cx="12" cy="8" r="2.5" strokeLinecap="round"/>
    </svg>
  ),
};

// Readable labels for each transaction type
const TXN_LABEL = {
  usdt_credit:   { label: "USDT Credited",    icon: <Icons.Credit />, color: "#10b981" },
  usdt_debit:    { label: "USDT Deducted",    icon: <Icons.Debit />, color: "#ef4444" },
  coin_credit:   { label: "Coin Granted",     icon: <Icons.Gift />, color: "#10b981" },
  coin_debit:    { label: "Coin Removed",     icon: <Icons.Debit />, color: "#ef4444" },
  trade_buy:     { label: "Bought",           icon: <Icons.TransactionBuy />, color: "#ef4444" },
  trade_sell:    { label: "Sold",             icon: <Icons.TransactionSell />, color: "#10b981" },
  account_reset: { label: "Account Reset",    icon: <Icons.Reset />, color: "#f7931a" },
  welcome_bonus: { label: "Welcome Bonus",    icon: <Icons.Gift />, color: "#10b981" },
};

function timeAgo(iso) {
  const d = new Date(iso);
  const s = Math.floor((Date.now() - d) / 1000);
  if (s < 60)   return "Just now";
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return d.toLocaleDateString(undefined, { month:"short", day:"numeric", year:"numeric" });
}

// ─────────────────────────────────────────────────────────────
export default function WalletPage() {
  const { user, coins, navigate, getUserTransactions } = useApp();

  const [filter, setFilter] = useState("all");
  const [page,   setPage]   = useState(1);
  const PER_PAGE = 12;

  // ── Build asset list ──────────────────────────────────────
  // Always starts with USDT (the cash balance), then every coin in portfolio
  const assets = useMemo(() => {
    const list = [
      {
        id: "USDT", name: "Tether USD", icon: "₮", color: "#10b981",
        amount: user?.balance || 0,
        price:  1,
        value:  user?.balance || 0,
        change: 0,
      },
    ];
    Object.entries(user?.portfolio || {}).forEach(([coinId, amt]) => {
      if (!amt || amt <= 0) return;
      const coin = coins.find(c => c.id === coinId);
      if (!coin) return;
      list.push({
        id:     coinId,
        name:   coin.name,
        icon:   coin.icon,
        color:  coin.color,
        amount: amt,
        price:  coin.price,
        value:  amt * coin.price,
        change: coin.change,
      });
    });
    return list;
  }, [user, coins]);

  // ── Total portfolio value = USDT + all coins at live price ─
  const totalValue   = assets.reduce((s, a) => s + a.value, 0);
  const cryptoValue  = totalValue - (user?.balance || 0);

  // ── Transactions ──────────────────────────────────────────
  const allTxns = useMemo(() =>
    (getUserTransactions ? getUserTransactions(user?.id) : [])
      .sort((a, b) => new Date(b.time) - new Date(a.time)),
    [getUserTransactions, user?.id]
  );

  const filtered = useMemo(() => {
    switch (filter) {
      case "usdt":   return allTxns.filter(t => ["usdt_credit","usdt_debit","welcome_bonus"].includes(t.type));
      case "crypto": return allTxns.filter(t => ["coin_credit","coin_debit"].includes(t.type));
      case "trades": return allTxns.filter(t => ["trade_buy","trade_sell"].includes(t.type));
      case "admin":  return allTxns.filter(t => t.meta?.adminAction);
      default:       return allTxns;
    }
  }, [allTxns, filter]);

  const paged   = filtered.slice(0, page * PER_PAGE);
  const hasMore = paged.length < filtered.length;

  const totalIn  = allTxns.filter(t => t.amount > 0).reduce((s,t) => s + t.amount, 0);
  const totalOut = allTxns.filter(t => t.amount < 0).reduce((s,t) => s + Math.abs(t.amount), 0);

  const fmt2 = n => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="wallet-page-container">
      {/* Header */}
      <div className="wallet-header-area">
        <div className="wallet-title-area">
          <h1>Wallet</h1>
          <p>Live balances and full transaction history</p>
        </div>
        <div className="wallet-header-buttons">
          <button className="wallet-header-btn" onClick={() => navigate("trade")}>
            <Icons.Trade /> Trade Now
          </button>
        </div>
      </div>

      {/* Total Value Banner */}
      <div className="wallet-balance-card">
        <div className="balance-card-header">
          <span className="balance-card-label">Total Portfolio Value</span>
          <span className="balance-card-badge">LIVE</span>
        </div>
        <div className="balance-card-amount">
          ${fmt2(totalValue)} <span className="balance-currency">USDT</span>
        </div>
        <div className="balance-card-stats">
          <div className="balance-card-change positive">
            <Icons.TrendingUp /> +4.34%
          </div>
          <div className="balance-card-profit">
            <span>USDT Cash: <strong>${fmt2(user?.balance || 0)}</strong></span>
            <span>In Crypto: <strong className="profit-percent-text">${fmt2(cryptoValue)}</strong></span>
          </div>
        </div>
        <div className="balance-card-chart">
          <div className="chart-indicator-line"></div>
          <div className="chart-indicator-dots">
            <span className="indicator-dot"></span>
            <span className="indicator-dot"></span>
            <span className="indicator-dot active"></span>
            <span className="indicator-dot"></span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="wallet-action-grid">
        <div className="wallet-action-item deposit-action" onClick={() => navigate("deposit")}>
          <span className="action-item-icon"><Icons.Deposit /></span>
          <span className="action-item-label">Deposit</span>
        </div>
        <div className="wallet-action-item withdraw-action" onClick={() => navigate("withdraw")}>
          <span className="action-item-icon"><Icons.Withdraw /></span>
          <span className="action-item-label">Withdraw</span>
        </div>
        <div className="wallet-action-item transfer-action" onClick={() => navigate("transfer")}>
          <span className="action-item-icon"><Icons.Transfer /></span>
          <span className="action-item-label">Transfer</span>
        </div>
        <div className="wallet-action-item buy-action" onClick={() => navigate("trade")}>
          <span className="action-item-icon"><Icons.Buy /></span>
          <span className="action-item-label">Buy Crypto</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="wallet-stats-wrapper">
        <div className="wallet-stat-block">
          <div className="stat-block-icon"><Icons.Wallet /></div>
          <div className="stat-block-info">
            <span className="stat-block-label">Total Transactions</span>
            <span className="stat-block-value">{allTxns.length}</span>
          </div>
        </div>
        <div className="wallet-stat-block">
          <div className="stat-block-icon"><Icons.TrendingUp /></div>
          <div className="stat-block-info">
            <span className="stat-block-label">Total In</span>
            <span className="stat-block-value">+${fmt2(totalIn)}</span>
          </div>
        </div>
        <div className="wallet-stat-block">
          <div className="stat-block-icon"><Icons.TrendingDown /></div>
          <div className="stat-block-info">
            <span className="stat-block-label">Total Out</span>
            <span className="stat-block-value">-${fmt2(totalOut)}</span>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="assets-table-wrapper">
        <div className="assets-table-header">
          <h3><Icons.Wallet /> My Assets</h3>
          <button className="assets-refresh-btn" onClick={() => window.location.reload()}>
            <Icons.Refresh /> Refresh
          </button>
        </div>
        <div className="assets-table">
          <div className="assets-table-head">
            <span>Asset</span>
            <span>Balance</span>
            <span>Value (USDT)</span>
            <span>Price</span>
            <span>24h</span>
            <span>Actions</span>
          </div>
          <div className="assets-table-body">
            {assets.length === 0 ? (
              <div className="assets-empty-state">
                <span>📭</span>
                <h4>No assets yet</h4>
                <p>Start trading to build your portfolio</p>
                <button className="empty-state-trade-btn" onClick={() => navigate("trade")}>
                  Start Trading <Icons.ArrowRight />
                </button>
              </div>
            ) : (
              assets.map(a => (
                <div key={a.id} className="assets-table-row">
                  <div className="asset-info-cell">
                    <div className="asset-icon-circle" style={{ background: `${a.color}15`, border: `1px solid ${a.color}30`, color: a.color }}>
                      {a.icon}
                    </div>
                    <div className="asset-details-cell">
                      <span className="asset-symbol-text">{a.id}</span>
                      <span className="asset-name-text">{a.name}</span>
                    </div>
                  </div>
                  <div className="asset-balance-cell">
                    {a.id === "USDT" ? `$${fmt2(a.amount)}` : `${a.amount.toFixed(6)}`}
                  </div>
                  <div className="asset-value-cell">${fmt2(a.value)}</div>
                  <div className="asset-price-cell">${a.price.toLocaleString()}</div>
                  <div className={`asset-change-cell ${a.change >= 0 ? "positive-change" : "negative-change"}`}>
                    {a.id === "USDT" ? "—" : `${a.change >= 0 ? "+" : ""}${a.change}%`}
                  </div>
                  <div className="asset-actions-cell">
                    <button className="asset-action-btn trade-action" onClick={() => navigate("trade")}>
                      Trade
                    </button>
                    <button className="asset-action-btn send-action" onClick={() => navigate("send")}>
                      Send
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="recent-transactions-wrapper">
        <div className="transactions-header-section">
          <h3><Icons.Clock /> Transaction History</h3>
          <span className="transactions-view-all">{filtered.length} records</span>
        </div>

        {/* Filter Tabs */}
        <div className="wallet-filter-tabs">
          {[
            ["all",    "All"],
            ["usdt",   "USDT"],
            ["crypto", "Crypto"],
            ["trades", "Trades"],
            ["admin",  "Admin"],
          ].map(([id, label]) => (
            <button 
              key={id} 
              className={`filter-tab-btn ${filter === id ? "active" : ""}`}
              onClick={() => { setFilter(id); setPage(1); }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        <div className="transactions-list-container">
          {filtered.length === 0 ? (
            <div className="empty-transactions">
              <span>📭</span>
              <p>No transactions yet</p>
            </div>
          ) : (
            <>
              {paged.map(txn => {
                const meta = TXN_LABEL[txn.type] || { label: txn.type, icon: <Icons.Info />, color: "#9ca3af" };
                const isCoin = ["coin_credit","coin_debit"].includes(txn.type);
                const absAmt = Math.abs(txn.amount);
                const isCredit = txn.amount > 0;

                return (
                  <div key={txn.id} className="transaction-item-row">
                    <div className="transaction-item-icon" style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}>
                      {meta.icon}
                    </div>
                    <div className="transaction-item-details">
                      <div className="transaction-item-type">
                        {meta.label}
                        {txn.meta?.adminAction && (
                          <span className="admin-badge"><Icons.Admin /> ADMIN</span>
                        )}
                        {txn.meta?.resultType && txn.meta.resultType !== "normal" && (
                          <span className={`result-badge ${txn.meta.resultType}`}>
                            {txn.meta.resultType.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="transaction-item-note">{txn.note}</div>
                      <div className="transaction-item-time">
                        <Icons.Clock /> {timeAgo(txn.time)}
                      </div>
                    </div>
                    <div className="transaction-item-amount">
                      <div className={`amount-value ${isCredit ? "positive" : "negative"}`}>
                        {isCredit ? "+" : "-"}
                        {isCoin ? `${absAmt.toFixed(6)} ${txn.currency}` : `$${fmt2(absAmt)}`}
                      </div>
                      {isCoin && txn.usdValue > 0 && (
                        <div className="amount-usd">≈ ${fmt2(txn.usdValue)}</div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Load More */}
              {hasMore && (
                <div className="load-more-container">
                  <button className="load-more-btn" onClick={() => setPage(p => p + 1)}>
                    Load more ({filtered.length - paged.length} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}