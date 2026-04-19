/**
 * WalletPage.jsx
 * Live balance, assets, and full transaction history.
 * Deposit modal shows the address from context (admin can change it).
 * Withdraw modal is demo-only (no real funds move).
 */

import { useState, useMemo } from "react";
import { useApp, SUPPORTED_COINS } from "../context/AppContext";
import "./WalletPage.css";

// ── SVG Icons (self-contained, no import needed) ──────────────
const I = {
  copy: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path
        d="M5 15H4C2.9 15 2 14.1 2 13V4C2 2.9 2.9 2 4 2H13C14.1 2 15 2.9 15 4V5"
        strokeLinecap="round"
      />
    </svg>
  ),
  check: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  warn: (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M12 9V13M12 17H12.01" strokeLinecap="round" />
      <path
        d="M12 2L1 21H23L12 2Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  deposit: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  ),
  withdraw: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M12 19V5M5 12h14" strokeLinecap="round" />
    </svg>
  ),
  transfer: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M17 7l-5-5-5 5M7 17l5 5 5-5M12 2v20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  buy: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M12 2v20M17 7l-5-5-5 5M7 17l5 5 5-5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  trendUp: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M23 6L13.5 15.5L8.5 10.5L1 18"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17 6H23V12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  trendDown: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M23 18L13.5 8.5L8.5 13.5L1 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17 18H23V12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  coinIcon: (color) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v12M8 10h8" strokeLinecap="round" />
    </svg>
  ),
  history: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline
        points="12 6 12 12 16 14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  refresh: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M23 4v6h-6M1 20v-6h6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  arrowRight: (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M5 12h14M12 5l7 7-7 7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

// ── Transaction type display config ───────────────────────────
const TXN_META = {
  usdt_credit: { label: "USDT Credited", icon: "💰", color: "#10b981" },
  usdt_debit: { label: "USDT Deducted", icon: "💸", color: "#ef4444" },
  coin_credit: { label: "Coin Granted", icon: "🪙", color: "#10b981" },
  coin_debit: { label: "Coin Removed", icon: "🗑️", color: "#ef4444" },
  trade_buy: { label: "Bought", icon: "📈", color: "#ef4444" },
  trade_sell: { label: "Sold", icon: "📉", color: "#10b981" },
  trade_profit: { label: "Trade Profit", icon: "🏆", color: "#10b981" },
  trade_loss: { label: "Trade Loss", icon: "⚠️", color: "#ef4444" },
  account_reset: { label: "Account Reset", icon: "🔄", color: "#f7931a" },
  welcome_bonus: { label: "Welcome Bonus", icon: "🎁", color: "#10b981" },
};

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Copy-to-clipboard hook ────────────────────────────────────
function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };
  return [copied, copy];
}

// ── Deposit Modal ─────────────────────────────────────────────
function DepositModal({ onClose, depositAddresses, coins }) {
  const [selCoin, setSelCoin] = useState("BTC");
  const [copied, copy] = useCopy();

  const address =
    depositAddresses?.[selCoin] || "Address not configured — contact support";
  const coin = [
    ...(coins || []),
    { id: "USDT", name: "Tether USD", icon: "₮", color: "#10b981" },
  ].find((c) => c.id === selCoin);

  return (
    <div
      className="wallet-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="wallet-modal-box">
        <div className="wallet-modal-header">
          <div>
            <div className="wallet-modal-title">Deposit Crypto</div>
            <div className="wallet-modal-subtitle">
              Select a coin and copy your deposit address
            </div>
          </div>
          <button className="wallet-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Coin selector */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: ".4px",
              marginBottom: 10,
            }}
          >
            Select Coin
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              ...SUPPORTED_COINS,
              { id: "USDT", name: "Tether", icon: "₮", color: "#10b981" },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setSelCoin(c.id)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 700,
                  border: `1.5px solid ${selCoin === c.id ? c.color : "rgba(255,255,255,.1)"}`,
                  background: selCoin === c.id ? `${c.color}18` : "transparent",
                  color: selCoin === c.id ? c.color : "var(--text-secondary)",
                  transition: "all .15s",
                }}
              >
                {c.icon} {c.id}
              </button>
            ))}
          </div>
        </div>

        {/* Network warning */}
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "10px 13px",
            background: "rgba(245,158,11,.06)",
            border: "1px solid rgba(245,158,11,.2)",
            borderRadius: 10,
            marginBottom: 18,
            fontSize: 12,
            color: "#f59e0b",
            alignItems: "flex-start",
          }}
        >
          <span style={{ flexShrink: 0, marginTop: 1 }}>{I.warn}</span>
          <span>
            Only send <strong>{selCoin}</strong> to this address. Sending any
            other asset will result in permanent loss.
          </span>
        </div>

        {/* Address display */}
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: ".4px",
              marginBottom: 8,
            }}
          >
            Your {selCoin} Deposit Address
          </div>
          <div
            style={{
              padding: "14px 15px",
              background: "rgba(0,0,0,.3)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 12,
              position: "relative",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--text-secondary)",
                wordBreak: "break-all",
                lineHeight: 1.6,
                marginRight: 40,
              }}
            >
              {address}
            </div>
            <button
              onClick={() => copy(address)}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                padding: "6px 8px",
                borderRadius: 7,
                border: `1px solid ${copied ? "rgba(16,185,129,.4)" : "var(--border-soft)"}`,
                background: copied
                  ? "rgba(16,185,129,.12)"
                  : "rgba(255,255,255,.06)",
                color: copied ? "#10b981" : "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                fontWeight: 600,
                transition: "all .15s",
              }}
            >
              {copied ? <>{I.check} Copied!</> : <>{I.copy} Copy</>}
            </button>
          </div>
        </div>

        {/* QR placeholder */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px 0",
            borderTop: "1px solid var(--border-subtle)",
            borderBottom: "1px solid var(--border-subtle)",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              background: "rgba(255,255,255,.06)",
              border: "1px dashed rgba(255,255,255,.15)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
              fontSize: 36,
            }}
          >
            {coin?.icon || "₿"}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Scan QR code with your wallet app
          </div>
        </div>

        <div
          style={{
            padding: "10px 14px",
            background: "rgba(16,185,129,.06)",
            border: "1px solid rgba(16,185,129,.2)",
            borderRadius: 10,
            fontSize: 12,
            color: "#10b981",
            lineHeight: 1.6,
          }}
        >
          ℹ️ <strong>Demo mode:</strong> This is a school project. No real funds
          will be transferred. Contact admin to have demo funds credited to your
          account.
        </div>
      </div>
    </div>
  );
}

// ── Withdraw Modal ────────────────────────────────────────────
function WithdrawModal({ onClose, userBalance }) {
  const [selCoin, setSelCoin] = useState("BTC");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [done, setDone] = useState(false);

  if (done)
    return (
      <div
        className="wallet-modal-overlay"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className="wallet-modal-box"
          style={{ textAlign: "center", padding: "40px 30px" }}
        >
          <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
          <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>
            Request Submitted
          </div>
          <div
            style={{
              color: "var(--text-muted)",
              marginBottom: 24,
              lineHeight: 1.6,
            }}
          >
            Your withdrawal request has been recorded.
            <br />
            In demo mode no real funds are moved.
          </div>
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );

  return (
    <div
      className="wallet-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="wallet-modal-box">
        <div className="wallet-modal-header">
          <div>
            <div className="wallet-modal-title">Withdraw Crypto</div>
            <div className="wallet-modal-subtitle">
              Send funds to an external wallet
            </div>
          </div>
          <button className="wallet-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Coin selector */}
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: ".4px",
              marginBottom: 10,
            }}
          >
            Asset
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              ...SUPPORTED_COINS,
              { id: "USDT", name: "Tether", icon: "₮", color: "#10b981" },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setSelCoin(c.id)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
                  fontWeight: 700,
                  border: `1.5px solid ${selCoin === c.id ? c.color : "rgba(255,255,255,.1)"}`,
                  background: selCoin === c.id ? `${c.color}18` : "transparent",
                  color: selCoin === c.id ? c.color : "var(--text-secondary)",
                }}
              >
                {c.icon} {c.id}
              </button>
            ))}
          </div>
        </div>

        {/* Available */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 13,
            padding: "9px 12px",
            borderRadius: 8,
            background: "rgba(255,255,255,.03)",
            marginBottom: 14,
          }}
        >
          <span style={{ color: "var(--text-muted)" }}>USDT Available</span>
          <span
            style={{
              fontWeight: 700,
              color: "#10b981",
              fontFamily: "var(--font-mono)",
            }}
          >
            $
            {(userBalance || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>

        {/* Recipient address */}
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: ".4px",
              marginBottom: 6,
            }}
          >
            Recipient Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={`Enter ${selCoin} wallet address…`}
          />
        </div>

        {/* Amount */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: ".4px",
              marginBottom: 6,
            }}
          >
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div
          style={{
            padding: "10px 14px",
            background: "rgba(245,158,11,.06)",
            border: "1px solid rgba(245,158,11,.2)",
            borderRadius: 10,
            fontSize: 12,
            color: "#f59e0b",
            marginBottom: 18,
          }}
        >
          ⚠️ Demo mode — withdrawals are simulated and no real funds will be
          moved.
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 10,
              border: "1px solid var(--border-soft)",
              background: "rgba(255,255,255,.05)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => setDone(true)}
            disabled={!address || !amount}
            style={{
              flex: 2,
              padding: 12,
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg,#f7931a,#ffcc02)",
              color: "#000",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontWeight: 800,
              fontSize: 14,
              opacity: !address || !amount ? 0.5 : 1,
            }}
          >
            Confirm Withdrawal
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
export default function WalletPage() {
  const { user, coins, navigate, getUserTransactions, depositAddresses } =
    useApp();

  const [showDep, setShowDep] = useState(false);
  const [showWit, setShowWit] = useState(false);
  const [filter, setFilter] = useState("all");
  const [pg, setPg] = useState(1);
  const PER = 12;

  const fmt2 = (n) =>
    n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const MONO = { fontFamily: "var(--font-mono)" };

  // ── Assets list ───────────────────────────────────────────
  const assets = useMemo(() => {
    const list = [
      {
        id: "USDT",
        name: "Tether USD",
        icon: "₮",
        color: "#10b981",
        amount: user?.balance || 0,
        price: 1,
        value: user?.balance || 0,
        change: 0,
      },
    ];
    Object.entries(user?.portfolio || {}).forEach(([id, amt]) => {
      if (!amt || amt <= 0) return;
      const c = coins.find((x) => x.id === id);
      if (!c) return;
      list.push({
        id,
        name: c.name,
        icon: c.icon,
        color: c.color,
        amount: amt,
        price: c.price,
        value: amt * c.price,
        change: c.change,
      });
    });
    return list;
  }, [user, coins]);

  const totalValue = assets.reduce((s, a) => s + a.value, 0);
  const cryptoValue = totalValue - (user?.balance || 0);

  // ── Transactions ──────────────────────────────────────────
  const allTxns = useMemo(
    () =>
      (getUserTransactions ? getUserTransactions(user?.id) : []).sort(
        (a, b) => new Date(b.time) - new Date(a.time),
      ),
    [getUserTransactions, user?.id],
  );

  const filtered = useMemo(() => {
    switch (filter) {
      case "usdt":
        return allTxns.filter((t) =>
          ["usdt_credit", "usdt_debit", "welcome_bonus"].includes(t.type),
        );
      case "crypto":
        return allTxns.filter((t) =>
          ["coin_credit", "coin_debit"].includes(t.type),
        );
      case "trades":
        return allTxns.filter((t) =>
          ["trade_buy", "trade_sell", "trade_profit", "trade_loss"].includes(
            t.type,
          ),
        );
      case "admin":
        return allTxns.filter((t) => t.meta?.adminAction);
      default:
        return allTxns;
    }
  }, [allTxns, filter]);

  const paged = filtered.slice(0, pg * PER);
  const hasMore = paged.length < filtered.length;

  const totalIn = allTxns
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);
  const totalOut = allTxns
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="wallet-page-container">
      {/* Modals */}
      {showDep && (
        <DepositModal
          onClose={() => setShowDep(false)}
          depositAddresses={depositAddresses}
          coins={coins}
        />
      )}
      {showWit && (
        <WithdrawModal
          onClose={() => setShowWit(false)}
          userBalance={user?.balance}
        />
      )}

      {/* ── HEADER ───────────────────────────────────────── */}
      <div className="wallet-header-area">
        <div className="wallet-title-area">
          <h1>Wallet</h1>
          <p>Live balances and full transaction history</p>
        </div>
        <button className="wallet-header-btn" onClick={() => navigate("trade")}>
          {I.trendUp} Trade Now {I.arrowRight}
        </button>
      </div>

      {/* ── BALANCE HERO ─────────────────────────────────── */}
      <div className="wallet-balance-card">
        <div className="balance-card-header">
          <span className="balance-card-label">Total Portfolio Value</span>
          <span className="balance-card-badge">LIVE</span>
        </div>
        <div className="balance-card-amount">
          ${fmt2(totalValue)} <span className="balance-currency">USDT</span>
        </div>
        <div className="balance-card-stats">
          <span>
            USDT Cash: <strong>${fmt2(user?.balance || 0)}</strong>
          </span>
          <span>
            In Crypto:{" "}
            <strong style={{ color: "var(--gold)" }}>
              ${fmt2(cryptoValue)}
            </strong>
          </span>
          <span>
            Transactions: <strong>{allTxns.length}</strong>
          </span>
        </div>
      </div>

      {/* ── ACTION BUTTONS ───────────────────────────────── */}
      <div className="wallet-action-grid">
        <div
          className="wallet-action-item deposit-action"
          onClick={() => setShowDep(true)}
        >
          <span className="action-item-icon">{I.deposit}</span>
          <span className="action-item-label">Deposit</span>
        </div>
        <div
          className="wallet-action-item withdraw-action"
          onClick={() => setShowWit(true)}
        >
          <span className="action-item-icon">{I.withdraw}</span>
          <span className="action-item-label">Withdraw</span>
        </div>
        <div
          className="wallet-action-item transfer-action"
          onClick={() => navigate("trade")}
        >
          <span className="action-item-icon">{I.transfer}</span>
          <span className="action-item-label">Transfer</span>
        </div>
        <div
          className="wallet-action-item buy-action"
          onClick={() => navigate("trade")}
        >
          <span className="action-item-icon">{I.buy}</span>
          <span className="action-item-label">Buy Crypto</span>
        </div>
      </div>

      {/* ── STATS ROW ────────────────────────────────────── */}
      <div className="wallet-stats-wrapper">
        <div className="wallet-stat-block">
          <div className="stat-block-info">
            <span className="stat-block-label">Total In</span>
            <span className="stat-block-value" style={{ color: "#10b981" }}>
              +${fmt2(totalIn)}
            </span>
          </div>
        </div>
        <div className="wallet-stat-block">
          <div className="stat-block-info">
            <span className="stat-block-label">Total Out</span>
            <span className="stat-block-value" style={{ color: "#ef4444" }}>
              -${fmt2(totalOut)}
            </span>
          </div>
        </div>
        <div className="wallet-stat-block">
          <div className="stat-block-info">
            <span className="stat-block-label">Net</span>
            <span
              className="stat-block-value"
              style={{ color: totalIn - totalOut >= 0 ? "#10b981" : "#ef4444" }}
            >
              {totalIn - totalOut >= 0 ? "+" : ""}
              {fmt2(totalIn - totalOut)}
            </span>
          </div>
        </div>
      </div>

      {/* ── ASSETS TABLE ─────────────────────────────────── */}
      <div className="assets-table-wrapper">
        <div className="assets-table-header">
          <h3>My Assets</h3>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {assets.length} asset{assets.length !== 1 ? "s" : ""}
          </span>
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
              </div>
            ) : (
              assets.map((a) => (
                <div key={a.id} className="assets-table-row">
                  <div className="asset-info-cell">
                    <div
                      className="asset-icon-circle"
                      style={{
                        background: `${a.color}15`,
                        border: `1px solid ${a.color}30`,
                        color: a.color,
                      }}
                    >
                      {a.icon}
                    </div>
                    <div className="asset-details-cell">
                      <span className="asset-symbol-text">{a.id}</span>
                      <span className="asset-name-text">{a.name}</span>
                    </div>
                  </div>
                  <div className="asset-balance-cell" style={MONO}>
                    {a.id === "USDT"
                      ? `$${fmt2(a.amount)}`
                      : a.amount.toFixed(6)}
                  </div>
                  <div
                    className="asset-value-cell"
                    style={{ color: "var(--gold)", ...MONO }}
                  >
                    ${fmt2(a.value)}
                  </div>
                  <div className="asset-price-cell" style={MONO}>
                    ${a.price.toLocaleString()}
                  </div>
                  <div
                    className={`asset-change-cell ${a.change >= 0 ? "positive-change" : "negative-change"}`}
                  >
                    {a.id === "USDT"
                      ? "—"
                      : `${a.change >= 0 ? "+" : ""}${a.change}%`}
                  </div>
                  <div className="asset-actions-cell">
                    <button
                      className="asset-action-btn trade-action"
                      onClick={() => navigate("trade")}
                    >
                      Trade
                    </button>
                    <button
                      className="asset-action-btn send-action"
                      onClick={() => setShowWit(true)}
                    >
                      Send
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── TRANSACTION HISTORY ──────────────────────────── */}
      <div className="recent-transactions-wrapper">
        <div className="transactions-header-section">
          <h3>{I.history} Transaction History</h3>
          <span className="transactions-view-all">
            {filtered.length} records
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
            padding: "8px 0",
            fontSize: 12,
            color: "var(--text-muted)",
          }}
        >
          <span>
            Total In:{" "}
            <strong style={{ color: "#10b981" }}>+${fmt2(totalIn)}</strong>
          </span>
          <span>
            Total Out:{" "}
            <strong style={{ color: "#ef4444" }}>-${fmt2(totalOut)}</strong>
          </span>
        </div>

        {/* Filter tabs */}
        <div className="wallet-filter-tabs">
          {[
            ["all", "All"],
            ["usdt", "USDT"],
            ["crypto", "Crypto"],
            ["trades", "Trades"],
            ["admin", "Admin"],
          ].map(([id, lbl]) => (
            <button
              key={id}
              className={`filter-tab-btn${filter === id ? " active" : ""}`}
              onClick={() => {
                setFilter(id);
                setPg(1);
              }}
            >
              {lbl}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="transactions-list-container">
          {filtered.length === 0 ? (
            <div className="empty-transactions">
              <span>📭</span>
              <p>No transactions yet</p>
            </div>
          ) : (
            <>
              {paged.map((txn) => {
                const meta = TXN_META[txn.type] || {
                  label: txn.type,
                  icon: "💱",
                  color: "#8896b3",
                };
                const isCoin = ["coin_credit", "coin_debit"].includes(txn.type);
                const absAmt = Math.abs(txn.amount);
                const isCredit = txn.amount > 0;

                return (
                  <div key={txn.id} className="transaction-item-row">
                    <div
                      className="transaction-item-icon"
                      style={{
                        background: `${meta.color}15`,
                        border: `1px solid ${meta.color}30`,
                        fontSize: 18,
                      }}
                    >
                      {meta.icon}
                    </div>
                    <div className="transaction-item-details">
                      <div className="transaction-item-type">
                        {meta.label}
                        {txn.meta?.adminAction && (
                          <span className="admin-badge">⚡ ADMIN</span>
                        )}
                        {txn.meta?.resultType &&
                          txn.meta.resultType !== "normal" && (
                            <span
                              className={`result-badge ${txn.meta.resultType}`}
                            >
                              {txn.meta.resultType === "profit"
                                ? "WIN"
                                : "LOSS"}
                            </span>
                          )}
                        {txn.type === "trade_profit" && (
                          <span className="result-badge profit">
                            WIN CREDITED
                          </span>
                        )}
                        {txn.type === "trade_loss" && (
                          <span className="result-badge loss">
                            LOSS DEDUCTED
                          </span>
                        )}
                      </div>
                      <div className="transaction-item-note">{txn.note}</div>
                      <div className="transaction-item-time">
                        {timeAgo(txn.time)}
                      </div>
                    </div>
                    <div className="transaction-item-amount">
                      <div
                        className={`amount-value ${isCredit ? "positive" : "negative"}`}
                      >
                        {isCredit ? "+" : "-"}
                        {isCoin
                          ? `${absAmt.toFixed(6)} ${txn.currency}`
                          : `$${fmt2(absAmt)}`}
                      </div>
                      {txn.balanceAfter != null && txn.currency === "USDT" && (
                        <div className="amount-usd">
                          Balance: ${fmt2(txn.balanceAfter)}
                        </div>
                      )}
                      {isCoin && txn.usdValue > 0 && (
                        <div className="amount-usd">
                          ≈ ${fmt2(txn.usdValue)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {hasMore && (
                <div className="load-more-container">
                  <button
                    className="load-more-btn"
                    onClick={() => setPg((p) => p + 1)}
                  >
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
