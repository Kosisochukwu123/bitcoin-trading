import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Modal } from "../components/UI";
import "./WalletPage.css";

// Transaction metadata mapping
const TXN_META = {
  credit:        { label: "Admin Credit",   icon: "⬇️", color: "#10b981", sign: "+" },
  debit:         { label: "Admin Debit",    icon: "⬆️", color: "#ef4444", sign: "-" },
  trade_buy:     { label: "Buy Trade",      icon: "📈", color: "#ef4444", sign: "-" },
  trade_sell:    { label: "Sell Trade",     icon: "📉", color: "#10b981", sign: "+" },
  crypto_credit: { label: "Crypto Grant",   icon: "🪙", color: "#10b981", sign: "+" },
  crypto_debit:  { label: "Crypto Removed", icon: "🪙", color: "#ef4444", sign: "-" },
  reset:         { label: "Account Reset",  icon: "🔄", color: "#f7931a", sign: "+" },
};

const Label = ({ children }) => (
  <label style={{ 
    display: "block", 
    fontSize: 11, 
    fontWeight: 700, 
    color: "var(--text-muted)", 
    textTransform: "uppercase", 
    letterSpacing: ".4px", 
    marginBottom: 6 
  }}>
    {children}
  </label>
);

export default function WalletPage() {
  const { user, coins, navigate, getUserTransactions } = useApp();
  const [showDep, setShowDep] = useState(false);
  const [showWit, setShowWit] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [depositNetwork, setDepositNetwork] = useState("BTC (Native SegWit)");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  // Assets with real-time calculation
  const assets = useMemo(() => [
    { 
      id: "USDT", 
      name: "Tether USD", 
      amount: user?.balance || 0, 
      price: 1, 
      color: "#10b981", 
      icon: "₮",
      change: 0.01,
      network: ["ERC-20", "BEP-20", "TRC-20"]
    },
    ...Object.entries(user?.portfolio || {})
      .filter(([, amount]) => amount > 0)
      .map(([id, amount]) => {
        const c = coins.find(x => x.id === id);
        return c ? { ...c, amount, network: ["Native", "BEP-20"] } : null;
      })
      .filter(Boolean),
  ], [user, coins]);

  const totalValue = assets.reduce((sum, asset) => sum + asset.amount * asset.price, 0);
  const cryptoValue = totalValue - (user?.balance || 0);
  const totalProfit = 2345.67;
  const profitPercentage = (totalProfit / (totalValue - totalProfit)) * 100;

  // Deposit addresses
  const depositAddresses = {
    "BTC (Native SegWit)": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "ETH (ERC-20)": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb5",
    "BNB (BEP-20)": "bnb1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "TRX (TRC-20)": "TQx5yZ8Xx9Kj3Lm2Np4Qr5St6Uv7Wx8Yz9A",
    "SOL (Solana)": "SolanaAddress1234567890ABCDEFGHIJKLMNOP"
  };

  // Transactions from context
  const allTransactions = useMemo(() => 
    (getUserTransactions ? getUserTransactions(user?.id) : [])
      .sort((a, b) => new Date(b.time) - new Date(a.time)),
    [getUserTransactions, user?.id]
  );

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (filter === "usdt") return allTransactions.filter(t => 
      ["credit", "debit", "reset", "trade_buy", "trade_sell"].includes(t.type)
    );
    if (filter === "crypto") return allTransactions.filter(t => 
      ["crypto_credit", "crypto_debit"].includes(t.type)
    );
    if (filter === "admin") return allTransactions.filter(t => t.meta?.adminAction);
    if (filter === "trades") return allTransactions.filter(t => 
      ["trade_buy", "trade_sell"].includes(t.type)
    );
    return allTransactions;
  }, [allTransactions, filter]);

  const pagedTransactions = filteredTransactions.slice(0, page * PER_PAGE);
  const hasMore = pagedTransactions.length < filteredTransactions.length;

  // Calculate totals
  const totalIn = allTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalOut = allTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Helper functions
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const minutes = Math.floor((now - date) / 60000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const formatNumber = (num) => num.toLocaleString(undefined, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });

  const formatCrypto = (num) => num.toLocaleString(undefined, { 
    minimumFractionDigits: 4, 
    maximumFractionDigits: 6 
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Address copied to clipboard!");
  };

  const handleWithdraw = () => {
    if (!withdrawAddress || !withdrawAmount) {
      alert("Please fill in all fields");
      return;
    }
    if (parseFloat(withdrawAmount) > selectedAsset?.amount) {
      alert("Insufficient balance");
      return;
    }
    alert(`Withdrawal request submitted for ${withdrawAmount} ${selectedAsset?.id}`);
    setShowWit(false);
    setWithdrawAmount("");
    setWithdrawAddress("");
    setSelectedAsset(null);
  };

  const MONO = { fontFamily: "var(--font-mono)" };

  return (
    <div className="wallet-page-container">
      {/* Header */}
      <div className="wallet-header-area">
        <div className="wallet-title-area">
          <h1>My Wallet</h1>
          <p>Manage, deposit and withdraw your crypto assets</p>
        </div>
        <div className="wallet-header-buttons">
          <button className="wallet-header-btn" onClick={() => setShowDep(true)}>
            📥 Deposit
          </button>
          <button className="wallet-header-btn" onClick={() => setShowWit(true)}>
            📤 Withdraw
          </button>
        </div>
      </div>

      {/* Balance Hero Card */}
      <div className="wallet-balance-card" style={{
        background: "linear-gradient(135deg, rgba(247,147,26,.08), rgba(16,185,129,.04))",
        border: "1px solid var(--border-gold-s)",
        borderRadius: 20,
        padding: "28px 32px",
        marginBottom: 20
      }}>
        <div className="balance-card-header">
          <span className="balance-card-label">Total Portfolio Value</span>
          <span className="balance-card-badge">USDT</span>
        </div>
        <div className="balance-card-amount" style={{ fontSize: 42, fontWeight: 900 }}>
          ${formatNumber(totalValue)}
        </div>
        <div style={{ display: "flex", gap: 24, marginTop: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Cash (USDT)</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#10b981", ...MONO }}>
              ${formatNumber(user?.balance || 0)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>In Crypto</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--gold)", ...MONO }}>
              ${formatNumber(cryptoValue)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Transactions</div>
            <div style={{ fontSize: 17, fontWeight: 800, ...MONO }}>
              {allTransactions.length}
            </div>
          </div>
        </div>
        <div className="balance-card-stats">
          <div className="balance-card-change positive">
            ↑ +2.34% ($234.56)
          </div>
          <div className="balance-card-profit">
            <span>24h Profit</span>
            <strong>+${formatNumber(totalProfit)}</strong>
            <span className="profit-percent-text">(+{profitPercentage.toFixed(1)}%)</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="wallet-action-grid">
        <button className="wallet-action-item deposit-action" onClick={() => setShowDep(true)}>
          <span className="action-item-icon">⬇️</span>
          <span className="action-item-label">Deposit</span>
        </button>
        <button className="wallet-action-item withdraw-action" onClick={() => setShowWit(true)}>
          <span className="action-item-icon">⬆️</span>
          <span className="action-item-label">Withdraw</span>
        </button>
        <button className="wallet-action-item transfer-action" onClick={() => navigate("trade")}>
          <span className="action-item-icon">↔️</span>
          <span className="action-item-label">Transfer</span>
        </button>
        <button className="wallet-action-item buy-action" onClick={() => navigate("trade")}>
          <span className="action-item-icon">💳</span>
          <span className="action-item-label">Buy Crypto</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="wallet-stats-wrapper">
        <div className="wallet-stat-block">
          <div className="stat-block-icon">💰</div>
          <div className="stat-block-info">
            <span className="stat-block-label">Total Value Locked</span>
            <span className="stat-block-value">${formatNumber(totalValue)}</span>
          </div>
        </div>
        <div className="wallet-stat-block">
          <div className="stat-block-icon">📊</div>
          <div className="stat-block-info">
            <span className="stat-block-label">Total Assets</span>
            <span className="stat-block-value">{assets.length}</span>
          </div>
        </div>
        <div className="wallet-stat-block">
          <div className="stat-block-icon">🔄</div>
          <div className="stat-block-info">
            <span className="stat-block-label">24h Volume</span>
            <span className="stat-block-value">$12,456</span>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="assets-table-wrapper">
        <div className="assets-table-header">
          <h3>My Assets</h3>
          <button className="assets-refresh-btn" onClick={() => window.location.reload()}>
            🔄 Refresh
          </button>
        </div>
        
        <div className="assets-table">
          <div className="assets-table-head">
            <span>Asset</span>
            <span>Balance</span>
            <span>Value (USDT)</span>
            <span>Price</span>
            <span>24h Change</span>
            <span>Actions</span>
          </div>
          
          <div className="assets-table-body">
            {assets.map(asset => (
              <div key={asset.id} className="assets-table-row">
                <div className="asset-info-cell">
                  <div 
                    className="asset-icon-circle" 
                    style={{ 
                      background: `${asset.color}18`, 
                      border: `1px solid ${asset.color}35`,
                      color: asset.color 
                    }}
                  >
                    {asset.icon}
                  </div>
                  <div className="asset-details-cell">
                    <div className="asset-symbol-text">{asset.id}</div>
                    <div className="asset-name-text">{asset.name}</div>
                  </div>
                </div>
                
                <div className="asset-balance-cell">
                  {asset.id === "USDT" 
                    ? `$${formatNumber(asset.amount)}` 
                    : formatCrypto(asset.amount)}
                </div>
                
                <div className="asset-value-cell" style={{ color: "var(--gold)", fontWeight: 700 }}>
                  ${formatNumber(asset.amount * asset.price)}
                </div>
                
                <div className="asset-price-cell">
                  ${asset.price.toLocaleString()}
                </div>
                
                <div className={`asset-change-cell ${asset.change >= 0 ? "positive-change" : "negative-change"}`}>
                  {asset.change >= 0 ? "+" : ""}{asset.change}%
                </div>
                
                <div className="asset-actions-cell">
                  <button className="asset-action-btn trade-action" onClick={() => navigate("trade")}>
                    Trade
                  </button>
                  <button className="asset-action-btn send-action" onClick={() => {
                    setSelectedAsset(asset);
                    setShowWit(true);
                  }}>
                    Send
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {assets.length === 0 && (
          <div className="assets-empty-state">
            <span>💰</span>
            <h4>No assets yet</h4>
            <p>Start trading to see your assets here</p>
            <button className="empty-state-trade-btn" onClick={() => navigate("trade")}>
              Start Trading
            </button>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="recent-transactions-wrapper" style={{ marginTop: 24 }}>
        <div className="transactions-header-section">
          <div>
            <h3>Transaction History</h3>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
              {filteredTransactions.length} record{filteredTransactions.length !== 1 ? "s" : ""}
            </div>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>Total In</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#10b981", ...MONO }}>
                +${formatNumber(totalIn)}
              </div>
            </div>
            <div style={{ width: 1, background: "var(--border-subtle)" }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>Total Out</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#ef4444", ...MONO }}>
                -${formatNumber(totalOut)}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ 
          display: "flex", 
          gap: 4, 
          padding: "10px 16px", 
          borderBottom: "1px solid var(--border-subtle)", 
          background: "rgba(0,0,0,.08)" 
        }}>
          {[
            { id: "all", l: "All" },
            { id: "usdt", l: "💵 USDT" },
            { id: "crypto", l: "🪙 Crypto" },
            { id: "trades", l: "📊 Trades" },
            { id: "admin", l: "⚡ Admin" },
          ].map(f => (
            <button 
              key={f.id} 
              onClick={() => { setFilter(f.id); setPage(1); }} 
              style={{
                padding: "5px 14px",
                borderRadius: 7,
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: 12,
                fontWeight: 600,
                border: `1px solid ${filter === f.id ? "var(--border-gold)" : "transparent"}`,
                background: filter === f.id ? "var(--gold-dim)" : "transparent",
                color: filter === f.id ? "var(--gold)" : "var(--text-muted)",
              }}
            >
              {f.l}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        {filteredTransactions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
            <div style={{ marginBottom: 12 }}>No transactions yet</div>
            {filter !== "all" && (
              <button 
                onClick={() => setFilter("all")} 
                style={{ 
                  background: "transparent", 
                  border: "none", 
                  color: "var(--gold)", 
                  cursor: "pointer", 
                  fontSize: 13, 
                  fontFamily: "var(--font-body)" 
                }}
              >
                View all →
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="transactions-list-container">
              {pagedTransactions.map(txn => {
                const meta = TXN_META[txn.type] || TXN_META.credit;
                const isCrypto = ["crypto_credit", "crypto_debit"].includes(txn.type);
                const absAmount = Math.abs(txn.amount);

                return (
                  <div key={txn.id} className="transaction-item-row" style={{ 
                    display: "grid", 
                    gridTemplateColumns: "44px 1fr auto", 
                    gap: 14, 
                    padding: "14px 20px", 
                    borderBottom: "1px solid rgba(255,255,255,.03)", 
                    alignItems: "center" 
                  }}>
                    {/* Icon */}
                    <div style={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: 12, 
                      background: `${meta.color}15`, 
                      border: `1px solid ${meta.color}30`, 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      fontSize: 18, 
                      flexShrink: 0 
                    }}>
                      {meta.icon}
                    </div>

                    {/* Info */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>{meta.label}</span>
                        {txn.meta?.adminAction && (
                          <span style={{ 
                            fontSize: 10, 
                            fontWeight: 700, 
                            padding: "1px 7px", 
                            borderRadius: 99, 
                            background: "rgba(247,147,26,.15)", 
                            color: "var(--gold)", 
                            border: "1px solid var(--border-gold-s)" 
                          }}>
                            ADMIN
                          </span>
                        )}
                        {txn.meta?.resultType && txn.meta.resultType !== "normal" && (
                          <span style={{ 
                            fontSize: 10, 
                            fontWeight: 700, 
                            padding: "1px 7px", 
                            borderRadius: 99, 
                            background: txn.meta.resultType === "profit" ? "rgba(16,185,129,.12)" : "rgba(239,68,68,.12)", 
                            color: txn.meta.resultType === "profit" ? "#10b981" : "#ef4444" 
                          }}>
                            {txn.meta.resultType.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 3 }}>{txn.note}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", gap: 14, flexWrap: "wrap" }}>
                        <span>{formatTime(txn.time)}</span>
                        {txn.balanceAfter != null && txn.currency === "USDT" && (
                          <span>
                            Balance after: <strong style={{ color: "var(--text-secondary)", ...MONO }}>
                              ${formatNumber(txn.balanceAfter)} USDT
                            </strong>
                          </span>
                        )}
                        {txn.meta?.coin && (
                          <span>
                            Coin: <strong style={{ color: "var(--text-secondary)" }}>{txn.meta.coin}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: meta.color, ...MONO }}>
                        {meta.sign}{isCrypto
                          ? `${absAmount.toFixed(6)} ${txn.currency}`
                          : `$${formatNumber(absAmount)}`
                        }
                      </div>
                      {isCrypto && txn.meta?.usdValue && (
                        <div style={{ fontSize: 11, color: "var(--text-muted)", ...MONO }}>
                          ≈ ${formatNumber(txn.meta.usdValue)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <div style={{ padding: "16px 20px", textAlign: "center", borderTop: "1px solid var(--border-subtle)" }}>
                <button 
                  onClick={() => setPage(p => p + 1)} 
                  style={{ 
                    background: "rgba(255,255,255,.04)", 
                    border: "1px solid var(--border-soft)", 
                    color: "var(--text-secondary)", 
                    padding: "9px 28px", 
                    borderRadius: 9, 
                    cursor: "pointer", 
                    fontSize: 13, 
                    fontWeight: 600, 
                    fontFamily: "var(--font-body)" 
                  }}
                >
                  Load more ({filteredTransactions.length - pagedTransactions.length} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Deposit Modal */}
      {showDep && (
        <Modal title="Deposit Crypto" onClose={() => setShowDep(false)}>
          <div className="deposit-modal-content">
            <div className="deposit-warning-msg" style={{ 
              background: "rgba(16,185,129,.06)", 
              border: "1px dashed rgba(16,185,129,.3)", 
              borderRadius: 10, 
              padding: 18, 
              textAlign: "center", 
              marginBottom: 16 
            }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 10 }}>Your BTC Deposit Address</div>
              <div style={{ 
                fontSize: 11.5, 
                color: "#10b981", 
                wordBreak: "break-all", 
                ...MONO, 
                background: "rgba(0,0,0,.2)", 
                padding: "10px 12px", 
                borderRadius: 8 
              }}>
                bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
              </div>
              <div style={{ marginTop: 10, fontSize: 11, color: "var(--text-muted)" }}>
                ⚠️ Demo address — school project only
              </div>
            </div>
            
            <Label>Select Network</Label>
            <div className="deposit-network-list">
              {Object.keys(depositAddresses).map(network => (
                <button
                  key={network}
                  className={`deposit-network-option ${depositNetwork === network ? "active" : ""}`}
                  onClick={() => setDepositNetwork(network)}
                  style={{
                    padding: "10px 14px",
                    border: `1px solid ${depositNetwork === network ? "var(--border-gold)" : "var(--border-soft)"}`,
                    borderRadius: 8,
                    cursor: "pointer",
                    marginBottom: 6,
                    fontSize: 13,
                    fontWeight: 500,
                    background: depositNetwork === network ? "var(--gold-dim)" : "transparent",
                    color: depositNetwork === network ? "var(--gold)" : "var(--text-secondary)",
                    width: "100%",
                    textAlign: "left"
                  }}
                >
                  {network}
                </button>
              ))}
            </div>

            <div className="deposit-info-note" style={{ 
              marginTop: 14, 
              padding: "10px 14px", 
              background: "rgba(245,158,11,.06)", 
              border: "1px solid rgba(245,158,11,.2)", 
              borderRadius: 8, 
              fontSize: 12, 
              color: "#f59e0b" 
            }}>
              ℹ️ Contact admin to have funds credited to your account.
            </div>
          </div>
        </Modal>
      )}

      {/* Withdraw Modal */}
      {showWit && (
        <Modal title="Withdraw Crypto" onClose={() => setShowWit(false)}>
          <div className="withdraw-modal-content">
            <div className="withdraw-asset-selector">
              <Label>Select Asset</Label>
              <select 
                className="wallet-select"
                value={selectedAsset?.id || ""} 
                onChange={(e) => {
                  const asset = assets.find(a => a.id === e.target.value);
                  setSelectedAsset(asset);
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,.05)",
                  border: "1px solid var(--border-soft)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  marginBottom: 16
                }}
              >
                <option value="">Choose cryptocurrency</option>
                {assets.map(asset => (
                  <option key={asset.id} value={asset.id}>
                    {asset.id} - Available: {asset.id === "USDT" 
                      ? `$${formatNumber(asset.amount)}` 
                      : formatCrypto(asset.amount)}
                  </option>
                ))}
              </select>
            </div>

            {selectedAsset && (
              <>
                <div className="withdraw-address-input">
                  <Label>Recipient Address</Label>
                  <input
                    type="text"
                    placeholder="Enter wallet address..."
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    className="wallet-input"
                  />
                </div>

                <div className="withdraw-amount-input">
                  <Label>Amount ({selectedAsset.id})</Label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="wallet-input"
                  />
                  <button 
                    className="withdraw-max-btn"
                    onClick={() => setWithdrawAmount(selectedAsset.amount.toString())}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(247,147,26,.15)",
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: 6,
                      color: "var(--gold)",
                      cursor: "pointer",
                      fontSize: 11,
                      fontWeight: 700
                    }}
                  >
                    MAX
                  </button>
                </div>

                <div className="withdraw-details-panel" style={{
                  padding: "14px",
                  background: "rgba(255,255,255,.03)",
                  borderRadius: 10,
                  margin: "16px 0"
                }}>
                  <div className="withdraw-detail-row" style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "var(--text-muted)" }}>Available Balance:</span>
                    <strong style={{ color: "var(--gold)" }}>
                      {selectedAsset.id === "USDT" 
                        ? `$${formatNumber(selectedAsset.amount)}` 
                        : `${formatCrypto(selectedAsset.amount)} ${selectedAsset.id}`}
                    </strong>
                  </div>
                  <div className="withdraw-detail-row" style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "var(--text-muted)" }}>Network Fee:</span>
                    <strong>~$2.50</strong>
                  </div>
                  <div className="withdraw-detail-row" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>You'll Receive:</span>
                    <strong style={{ color: "#10b981" }}>
                      ~${(parseFloat(withdrawAmount) * selectedAsset.price - 2.5).toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="withdraw-warning-msg" style={{
                  padding: "10px 14px",
                  background: "rgba(245,158,11,.06)",
                  border: "1px solid rgba(245,158,11,.2)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#f59e0b",
                  marginBottom: 16
                }}>
                  ⚠️ Demo mode: withdrawals are simulated for this school project.
                </div>

                <button className="withdraw-confirm-btn" onClick={handleWithdraw} style={{
                  width: "100%",
                  padding: 12,
                  background: "linear-gradient(135deg, #f7931a, #ffcc02)",
                  border: "none",
                  borderRadius: 10,
                  color: "#000",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: 14
                }}>
                  Confirm Withdrawal
                </button>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}