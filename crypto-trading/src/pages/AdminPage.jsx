/**
 * AdminPage.jsx
 *
 * TRADES TAB — the new core feature:
 *   Shows all trades sorted by status (pending first).
 *   For each PENDING trade the admin sees:
 *     - User name, coin, type, amount, total, time
 *     - Three buttons: ✅ Mark Win | ❌ Mark Loss | ⚖️ Settle Normal
 *   Clicking opens a modal:
 *     - Win:  slider 1-100% → "user earns X% of trade total as profit"
 *     - Loss: slider 1-100% → "user loses X% of trade total"
 *     - Normal: settle at face value, no balance change
 *   Confirming calls settleTrade(tradeId, outcome, pct)
 *
 * DEPOSIT ADDRESSES tab (inside Settings):
 *   Admin can edit the wallet address for each coin.
 *   User sees these addresses in Wallet → Deposit modal.
 */

import { useState } from "react";
import { useApp, SUPPORTED_COINS } from "../context/AppContext";
import { CoinChip, StatCard } from "../components/UI";

function Badge({ children, color = "#8896b3", bg = "rgba(255,255,255,.05)" }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 9px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 700,
        background: bg,
        color,
        border: `1px solid ${color}35`,
      }}
    >
      {children}
    </span>
  );
}

function ModeBtn({ active, color, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "8px 4px",
        borderRadius: 8,
        cursor: "pointer",
        fontFamily: "var(--font-body)",
        fontWeight: 700,
        fontSize: 12,
        border: `1.5px solid ${active ? color : "rgba(255,255,255,.1)"}`,
        background: active ? `${color}14` : "transparent",
        color: active ? color : "var(--text-muted)",
        transition: "all .15s",
      }}
    >
      {label}
    </button>
  );
}

// ── Settlement modal ──────────────────────────────────────────
function SettleModal({ trade, userName, coinColor, onClose, onConfirm }) {
  const [outcome, setOutcome] = useState("win"); // "win" | "loss" | "normal"
  const [pct, setPct] = useState(10);

  const profitAmt = parseFloat(((trade.total * pct) / 100).toFixed(2));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.78)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--bg-overlay)",
          border: "1px solid var(--border-soft)",
          borderRadius: 22,
          padding: 30,
          width: "100%",
          maxWidth: 460,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 22,
          }}
        >
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 3 }}>
              Settle Trade
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {userName} · {trade.type.toUpperCase()} {trade.amount.toFixed(4)}{" "}
              {trade.coin} @ ${trade.price.toLocaleString()}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              fontSize: 24,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Trade summary */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            padding: "14px 0",
            borderTop: "1px solid var(--border-subtle)",
            borderBottom: "1px solid var(--border-subtle)",
            marginBottom: 22,
          }}
        >
          {[
            ["Trade Total", `$${trade.total.toFixed(2)}`],
            ["Coin", trade.coin],
            ["Fee Paid", `$${trade.fee.toFixed(4)}`],
          ].map(([l, v]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 10,
                  color: "var(--text-muted)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: ".4px",
                  marginBottom: 4,
                }}
              >
                {l}
              </div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 14,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>

        {/* Outcome selector */}
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
          Outcome
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[
            { v: "win", label: "📈 Mark as Win", color: "#10b981" },
            { v: "loss", label: "📉 Mark as Loss", color: "#ef4444" },
            { v: "normal", label: "⚖️ Settle Normal", color: "#8896b3" },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() => setOutcome(o.v)}
              style={{
                flex: 1,
                padding: "11px 6px",
                borderRadius: 10,
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: 12,
                textAlign: "center",
                border: `2px solid ${outcome === o.v ? o.color : "var(--border-subtle)"}`,
                background:
                  outcome === o.v ? `${o.color}14` : "rgba(255,255,255,.02)",
                color: outcome === o.v ? o.color : "var(--text-muted)",
                transition: "all .15s",
              }}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Percentage control — shown for win and loss */}
        {outcome !== "normal" && (
          <div
            style={{
              padding: "18px 18px",
              background: "rgba(255,255,255,.03)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 12,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>
                  {outcome === "win" ? "Profit Percentage" : "Loss Percentage"}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  % of trade total (${trade.total.toFixed(2)}) to{" "}
                  {outcome === "win" ? "credit" : "debit"}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={pct}
                  onChange={(e) =>
                    setPct(
                      Math.min(200, Math.max(1, parseInt(e.target.value) || 1)),
                    )
                  }
                  style={{
                    width: 68,
                    textAlign: "center",
                    padding: "6px 8px",
                    fontFamily: "var(--font-mono)",
                    fontSize: 22,
                    fontWeight: 800,
                    color: outcome === "win" ? "#10b981" : "#ef4444",
                    background: "rgba(0,0,0,.3)",
                    border: `1.5px solid ${outcome === "win" ? "rgba(16,185,129,.4)" : "rgba(239,68,68,.4)"}`,
                    borderRadius: 8,
                  }}
                />
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                  }}
                >
                  %
                </span>
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="1"
              max="200"
              value={pct}
              onChange={(e) => setPct(Number(e.target.value))}
              style={{
                width: "100%",
                accentColor: outcome === "win" ? "#10b981" : "#ef4444",
                cursor: "pointer",
                height: 6,
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 10,
                color: "var(--text-muted)",
                marginTop: 4,
              }}
            >
              <span>1%</span>
              <span>50%</span>
              <span>100%</span>
              <span>150%</span>
              <span>200%</span>
            </div>

            {/* Quick presets */}
            <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
              {[5, 10, 20, 50, 100].map((v) => (
                <button
                  key={v}
                  onClick={() => setPct(v)}
                  style={{
                    flex: 1,
                    padding: "5px 0",
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                    border: `1px solid ${pct === v ? (outcome === "win" ? "rgba(16,185,129,.5)" : "rgba(239,68,68,.5)") : "rgba(255,255,255,.1)"}`,
                    background:
                      pct === v
                        ? outcome === "win"
                          ? "rgba(16,185,129,.12)"
                          : "rgba(239,68,68,.12)"
                        : "transparent",
                    color:
                      pct === v
                        ? outcome === "win"
                          ? "#10b981"
                          : "#ef4444"
                        : "var(--text-muted)",
                  }}
                >
                  {v}%
                </button>
              ))}
            </div>

            {/* Preview */}
            <div
              style={{
                marginTop: 16,
                padding: "12px 14px",
                borderRadius: 10,
                background: `rgba(${outcome === "win" ? "16,185,129" : "239,68,68"},.06)`,
                border: `1px solid rgba(${outcome === "win" ? "16,185,129" : "239,68,68"},.2)`,
              }}
            >
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
                Settlement Preview
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginBottom: 5,
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>Trade total</span>
                <span
                  style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}
                >
                  ${trade.total.toFixed(2)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  marginBottom: 5,
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>
                  {pct}% of trade
                </span>
                <span
                  style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}
                >
                  ${profitAmt.toFixed(2)}
                </span>
              </div>
              <div
                style={{
                  height: 1,
                  background: "rgba(255,255,255,.08)",
                  marginBottom: 8,
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                }}
              >
                <span style={{ fontWeight: 700 }}>
                  {outcome === "win" ? "💰 User receives" : "💸 User loses"}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 800,
                    color: outcome === "win" ? "#10b981" : "#ef4444",
                  }}
                >
                  {outcome === "win" ? "+" : "-"}${profitAmt.toFixed(2)} USDT
                </span>
              </div>
            </div>
          </div>
        )}

        {outcome === "normal" && (
          <div
            style={{
              padding: "14px 16px",
              borderRadius: 10,
              background: "rgba(136,150,179,.06)",
              border: "1px solid rgba(136,150,179,.2)",
              marginBottom: 20,
              fontSize: 13,
              color: "var(--text-muted)",
              lineHeight: 1.6,
            }}
          >
            ⚖️ Trade will be marked as settled at face value. No additional USDT
            will be credited or debited.
          </div>
        )}

        {/* Action buttons */}
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
            onClick={() => onConfirm(outcome, outcome === "normal" ? 0 : pct)}
            style={{
              flex: 2,
              padding: 12,
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontWeight: 800,
              fontSize: 14,
              color: "#fff",
              background:
                outcome === "win"
                  ? "linear-gradient(135deg,#059669,#10b981)"
                  : outcome === "loss"
                    ? "linear-gradient(135deg,#dc2626,#ef4444)"
                    : "linear-gradient(135deg,#374151,#6b7280)",
            }}
          >
            {outcome === "win"
              ? `✅ Confirm Win — +$${profitAmt.toFixed(2)}`
              : outcome === "loss"
                ? `📉 Confirm Loss — -$${profitAmt.toFixed(2)}`
                : "⚖️ Confirm Settlement"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
export default function AdminPage() {
  const {
    users,
    trades,
    coins,
    fundUserBalance,
    fundUserCoin,
    resetUserAccount,
    banUser,
    updateCoinPrice,
    addNotif,
    settleTrade,
    pendingTrades,
    depositAddresses,
    updateDepositAddress,
  } = useApp();

  const [tab, setTab] = useState("trades"); // trades | users | prices | addresses
  const [editP, setEditP] = useState({});
  const [editAddr, setEditAddr] = useState({}); // for address editing
  const [settle, setSettle] = useState(null); // { trade, userName }
  const [tradeFilter, setTradeFilter] = useState("pending"); // pending | all
  const [confirm, setConfirm] = useState(null);

  // ── Fund modal ────────────────────────────────────────────
  const [fundTarget, setFundTarget] = useState(null);
  const [fundTab, setFundTab] = useState("usdt");
  const [fundMode, setFundMode] = useState("add");
  const [fundAmt, setFundAmt] = useState("");
  const [fundCoin, setFundCoin] = useState("BTC");
  const [fundCoinAmt, setFundCoinAmt] = useState("");

  const regulars = users.filter((u) => !u.isAdmin);
  const totalVol = trades.reduce((s, t) => s + t.total, 0);
  const pending = pendingTrades.length;
  const displayTrades =
    tradeFilter === "pending"
      ? trades.filter((t) => t.status === "pending")
      : trades;

  const MONO = { fontFamily: "var(--font-mono)" };
  const LBL = {
    fontSize: 10,
    fontWeight: 700,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: ".4px",
    display: "block",
    marginBottom: 6,
  };
  const fmt2 = (n) =>
    n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const openFund = (u) => {
    setFundTarget(u);
    setFundTab("usdt");
    setFundMode("add");
    setFundAmt("");
    setFundCoinAmt("");
    setFundCoin(SUPPORTED_COINS[0]?.id || "BTC");
  };

  const handleFundUSDT = () => {
    const amt = parseFloat(fundAmt);
    if (!amt || amt <= 0) {
      addNotif("Enter a valid amount", "error");
      return;
    }
    fundUserBalance(fundTarget.id, amt, fundMode);
    setFundTarget(null);
  };

  const handleFundCoin = () => {
    const amt = parseFloat(fundCoinAmt);
    if (!amt || amt <= 0) {
      addNotif("Enter a valid amount", "error");
      return;
    }
    fundUserCoin(fundTarget.id, fundCoin, amt, fundMode);
    setFundTarget(null);
  };

  const previewBal = () => {
    if (!fundTarget || !fundAmt || parseFloat(fundAmt) <= 0) return null;
    const a = parseFloat(fundAmt),
      b = fundTarget.balance;
    if (fundMode === "set") return a;
    if (fundMode === "add") return b + a;
    return Math.max(0, b - a);
  };

  return (
    <div className="page">
      {/* ── CONFIRM ──────────────────────────────────────── */}
      {confirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.72)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={(e) => e.target === e.currentTarget && setConfirm(null)}
        >
          <div
            style={{
              background: "var(--bg-overlay)",
              border: "1px solid var(--border-soft)",
              borderRadius: 18,
              padding: 28,
              width: "100%",
              maxWidth: 380,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 12 }}>
              Confirm
            </div>
            <p
              style={{
                color: "var(--text-secondary)",
                marginBottom: 22,
                lineHeight: 1.6,
              }}
            >
              {confirm.message}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirm(null)}
                style={{
                  flex: 1,
                  padding: 11,
                  borderRadius: 9,
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
                onClick={() => {
                  confirm.onConfirm();
                  setConfirm(null);
                }}
                style={{
                  flex: 1,
                  padding: 11,
                  borderRadius: 9,
                  border: "none",
                  background: "linear-gradient(135deg,#dc2626,#ef4444)",
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SETTLE MODAL ─────────────────────────────────── */}
      {settle && (
        <SettleModal
          trade={settle.trade}
          userName={settle.userName}
          onClose={() => setSettle(null)}
          onConfirm={(outcome, pct) => {
            settleTrade(settle.trade.id, outcome, pct);
            setSettle(null);
          }}
        />
      )}

      {/* ── FUND MODAL ───────────────────────────────────── */}
      {fundTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.72)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={(e) => e.target === e.currentTarget && setFundTarget(null)}
        >
          <div
            style={{
              background: "var(--bg-overlay)",
              border: "1px solid var(--border-soft)",
              borderRadius: 20,
              padding: 28,
              width: "100%",
              maxWidth: 420,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 17 }}>Fund Account</div>
              <button
                onClick={() => setFundTarget(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: 22,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 13px",
                background: "rgba(255,255,255,.03)",
                borderRadius: 10,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  borderRadius: 9,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 15,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {fundTarget.name.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>
                  {fundTarget.name}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {fundTarget.email}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ ...LBL, marginBottom: 2 }}>Balance</div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 15,
                    color: "#10b981",
                    ...MONO,
                  }}
                >
                  ${fmt2(fundTarget.balance)}
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                background: "rgba(0,0,0,.3)",
                borderRadius: 9,
                padding: 3,
                marginBottom: 18,
              }}
            >
              {[
                ["usdt", "💵 USDT"],
                ["coin", "🪙 Coin"],
              ].map(([id, lbl]) => (
                <button
                  key={id}
                  onClick={() => {
                    setFundTab(id);
                    setFundMode("add");
                  }}
                  style={{
                    flex: 1,
                    padding: "7px 0",
                    borderRadius: 7,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    fontSize: 13,
                    background:
                      fundTab === id ? "rgba(247,147,26,.15)" : "transparent",
                    color: fundTab === id ? "var(--gold)" : "var(--text-muted)",
                  }}
                >
                  {lbl}
                </button>
              ))}
            </div>
            {fundTab === "usdt" && (
              <>
                <label style={LBL}>Operation</label>
                <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                  <ModeBtn
                    active={fundMode === "add"}
                    color="#10b981"
                    label="➕ Add"
                    onClick={() => setFundMode("add")}
                  />
                  <ModeBtn
                    active={fundMode === "subtract"}
                    color="#ef4444"
                    label="➖ Deduct"
                    onClick={() => setFundMode("subtract")}
                  />
                  <ModeBtn
                    active={fundMode === "set"}
                    color="#f7931a"
                    label="🎯 Set"
                    onClick={() => setFundMode("set")}
                  />
                </div>
                <label style={LBL}>Quick Amount</label>
                <div
                  style={{
                    display: "flex",
                    gap: 5,
                    flexWrap: "wrap",
                    marginBottom: 12,
                  }}
                >
                  {[100, 500, 1000, 5000, 10000].map((p) => (
                    <button
                      key={p}
                      onClick={() => setFundAmt(String(p))}
                      style={{
                        padding: "5px 11px",
                        borderRadius: 7,
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                        fontSize: 12,
                        fontWeight: 600,
                        border: `1px solid ${fundAmt === String(p) ? "var(--border-gold)" : "rgba(255,255,255,.1)"}`,
                        background:
                          fundAmt === String(p)
                            ? "var(--gold-dim)"
                            : "transparent",
                        color:
                          fundAmt === String(p)
                            ? "var(--gold)"
                            : "var(--text-secondary)",
                      }}
                    >
                      ${p.toLocaleString()}
                    </button>
                  ))}
                </div>
                <label style={LBL}>Custom Amount</label>
                <input
                  type="number"
                  value={fundAmt}
                  placeholder="e.g. 2500"
                  onChange={(e) => setFundAmt(e.target.value)}
                  style={{ marginBottom: 12 }}
                />
                {previewBal() !== null && (
                  <div
                    style={{
                      padding: "10px 13px",
                      background: "rgba(255,255,255,.03)",
                      borderRadius: 8,
                      fontSize: 13,
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ color: "var(--text-muted)" }}>
                        Current
                      </span>
                      <span style={MONO}>${fmt2(fundTarget.balance)}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ color: "var(--text-muted)" }}>After</span>
                      <span
                        style={{ fontWeight: 700, color: "#10b981", ...MONO }}
                      >
                        ${fmt2(previewBal())}
                      </span>
                    </div>
                  </div>
                )}
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", padding: 12, fontSize: 14 }}
                  onClick={handleFundUSDT}
                  disabled={!fundAmt || parseFloat(fundAmt) <= 0}
                >
                  {fundMode === "add"
                    ? "➕ Credit USDT"
                    : fundMode === "subtract"
                      ? "➖ Deduct USDT"
                      : "🎯 Set Balance"}
                </button>
              </>
            )}
            {fundTab === "coin" && (
              <>
                <label style={LBL}>Select Coin</label>
                <div
                  style={{
                    display: "flex",
                    gap: 5,
                    flexWrap: "wrap",
                    marginBottom: 14,
                  }}
                >
                  {SUPPORTED_COINS.map((c) => {
                    const coin = coins.find((x) => x.id === c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => setFundCoin(c.id)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontFamily: "var(--font-body)",
                          fontSize: 13,
                          fontWeight: 700,
                          border: `1.5px solid ${fundCoin === c.id ? c.color : "rgba(255,255,255,.1)"}`,
                          background:
                            fundCoin === c.id ? `${c.color}18` : "transparent",
                          color:
                            fundCoin === c.id
                              ? c.color
                              : "var(--text-secondary)",
                        }}
                      >
                        {c.icon} {c.id}
                        {coin && (
                          <span
                            style={{
                              fontSize: 10,
                              display: "block",
                              fontWeight: 400,
                            }}
                          >
                            ${coin.price.toLocaleString()}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <label style={LBL}>Operation</label>
                <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                  <ModeBtn
                    active={fundMode === "add"}
                    color="#10b981"
                    label="➕ Grant"
                    onClick={() => setFundMode("add")}
                  />
                  <ModeBtn
                    active={fundMode === "subtract"}
                    color="#ef4444"
                    label="➖ Remove"
                    onClick={() => setFundMode("subtract")}
                  />
                </div>
                <label style={LBL}>Amount ({fundCoin})</label>
                <input
                  type="number"
                  value={fundCoinAmt}
                  placeholder={`e.g. 0.5 ${fundCoin}`}
                  onChange={(e) => setFundCoinAmt(e.target.value)}
                  style={{ marginBottom: 14 }}
                />
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", padding: 12, fontSize: 14 }}
                  onClick={handleFundCoin}
                  disabled={!fundCoinAmt || parseFloat(fundCoinAmt) <= 0}
                >
                  {fundMode === "subtract"
                    ? `➖ Remove ${fundCoin}`
                    : `➕ Grant ${fundCoin}`}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── PAGE HEADER ──────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              background: "linear-gradient(135deg,#f7931a,#ef4444)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            ⚡
          </div>
          <h1>Admin Control Panel</h1>
        </div>
        <div
          style={{
            padding: "10px 14px",
            background: "rgba(247,147,26,.05)",
            border: "1px solid var(--border-gold-s)",
            borderLeft: "3px solid var(--gold)",
            borderRadius: "0 10px 10px 0",
            fontSize: 13,
            color: "var(--text-secondary)",
          }}
        >
          💡 Review and settle pending trades, fund users, manage deposit
          addresses.
        </div>
      </div>

      {/* ── STATS ────────────────────────────────────────── */}
      <div className="grid-4 mb-24">
        <StatCard
          label="Registered Users"
          value={regulars.length}
          sub="Accounts"
          subColor="var(--blue)"
          accentColor="var(--blue)"
        />
        <StatCard
          label="Pending Trades"
          value={pending}
          sub="Awaiting review"
          subColor={pending > 0 ? "var(--gold)" : "var(--text-muted)"}
          accentColor="var(--gold)"
        />
        <StatCard
          label="Total Trades"
          value={trades.length}
          sub="All time"
          subColor="var(--green)"
          accentColor="var(--green)"
        />
        <StatCard
          label="Platform Volume"
          value={`$${totalVol.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          sub="Traded"
          subColor="var(--text-muted)"
          accentColor="var(--text-muted)"
        />
      </div>

      {/* ── TABS ─────────────────────────────────────────── */}
      <div className="tabs mb-20">
        {[
          {
            id: "trades",
            l: `📋 Trades${pending > 0 ? ` (${pending} pending)` : ""}`,
          },
          { id: "users", l: "👥 Users" },
          { id: "prices", l: "💹 Prices" },
          { id: "addresses", l: "🏦 Deposit Addresses" },
        ].map((t) => (
          <button
            key={t.id}
            className={`tab-btn${tab === t.id ? " active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.l}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════
          TRADES TAB — the main feature
          Shows pending trades first, admin settles each one
          ════════════════════════════════════════════════════ */}
      {tab === "trades" && (
        <div>
          {/* Filter */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {[
              ["pending", "⏳ Pending"],
              ["all", "📋 All Trades"],
            ].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setTradeFilter(v)}
                style={{
                  padding: "7px 18px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: 13,
                  border: `1px solid ${tradeFilter === v ? "var(--border-gold)" : "var(--border-soft)"}`,
                  background:
                    tradeFilter === v ? "var(--gold-dim)" : "transparent",
                  color:
                    tradeFilter === v ? "var(--gold)" : "var(--text-muted)",
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {displayTrades.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "var(--text-muted)",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                {tradeFilter === "pending"
                  ? "All trades settled — nothing pending"
                  : "No trades on platform yet"}
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {displayTrades.map((t) => {
              const u = users.find((x) => x.id === t.userId);
              const isPending = t.status === "pending";
              const isWin = t.status === "settled_win";
              const isLoss = t.status === "settled_loss";
              const coin = coins.find((c) => c.id === t.coin);

              return (
                <div
                  key={t.id}
                  style={{
                    padding: "16px 20px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,.025)",
                    border: `1px solid ${isPending ? "rgba(247,147,26,.3)" : "var(--border-subtle)"}`,
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 14,
                    alignItems: "center",
                  }}
                >
                  {/* Trade info */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Status dot */}
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: isPending
                          ? "#f7931a"
                          : isWin
                            ? "#10b981"
                            : isLoss
                              ? "#ef4444"
                              : "#8896b3",
                      }}
                    />

                    {/* Coin icon */}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 9,
                        background: `${coin?.color || "#888"}18`,
                        border: `1px solid ${coin?.color || "#888"}30`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: coin?.color || "#888",
                        fontSize: 16,
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {coin?.icon || t.coin.charAt(0)}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                          marginBottom: 3,
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: 14 }}>
                          {u?.name || "Unknown"}
                        </span>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: 99,
                            fontSize: 11,
                            fontWeight: 700,
                            background:
                              t.type === "buy"
                                ? "rgba(16,185,129,.12)"
                                : "rgba(239,68,68,.12)",
                            color: t.type === "buy" ? "#10b981" : "#ef4444",
                          }}
                        >
                          {t.type.toUpperCase()}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>
                          {t.amount.toFixed(4)} {t.coin}
                        </span>
                        <span
                          style={{ fontSize: 12, color: "var(--text-muted)" }}
                        >
                          @ ${t.price.toLocaleString()}
                        </span>
                        {/* Settlement result */}
                        {!isPending && (
                          <span
                            style={{
                              padding: "2px 9px",
                              borderRadius: 99,
                              fontSize: 11,
                              fontWeight: 700,
                              background: isWin
                                ? "rgba(16,185,129,.12)"
                                : isLoss
                                  ? "rgba(239,68,68,.12)"
                                  : "rgba(136,150,179,.12)",
                              color: isWin
                                ? "#10b981"
                                : isLoss
                                  ? "#ef4444"
                                  : "#8896b3",
                            }}
                          >
                            {isWin
                              ? `📈 Win +${t.profitLossPct}%`
                              : isLoss
                                ? `📉 Loss ${t.profitLossPct}%`
                                : "⚖️ Normal"}
                          </span>
                        )}
                        {isPending && (
                          <span
                            style={{
                              padding: "2px 9px",
                              borderRadius: 99,
                              fontSize: 11,
                              fontWeight: 700,
                              background: "rgba(247,147,26,.12)",
                              color: "#f7931a",
                            }}
                          >
                            ⏳ Pending
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 16,
                          fontSize: 12,
                          color: "var(--text-muted)",
                          flexWrap: "wrap",
                        }}
                      >
                        <span>
                          Total:{" "}
                          <strong
                            style={{ color: "var(--text-secondary)", ...MONO }}
                          >
                            ${fmt2(t.total)}
                          </strong>
                        </span>
                        <span>
                          Fee:{" "}
                          <strong style={{ ...MONO }}>
                            ${t.fee.toFixed(4)}
                          </strong>
                        </span>
                        {!isPending && t.profitLossAmt !== 0 && (
                          <span>
                            P/L:{" "}
                            <strong
                              style={{
                                color:
                                  t.profitLossAmt > 0 ? "#10b981" : "#ef4444",
                                ...MONO,
                              }}
                            >
                              {t.profitLossAmt > 0 ? "+" : ""}
                              {t.profitLossAmt.toFixed(2)} USDT
                            </strong>
                          </span>
                        )}
                        <span>{new Date(t.time).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Settle button — only for pending trades */}
                  {isPending && (
                    <button
                      onClick={() =>
                        setSettle({ trade: t, userName: u?.name || "Unknown" })
                      }
                      style={{
                        padding: "10px 20px",
                        borderRadius: 10,
                        border: "1px solid rgba(247,147,26,.4)",
                        background: "rgba(247,147,26,.1)",
                        color: "#f7931a",
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                        fontWeight: 700,
                        fontSize: 13,
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      ⚖️ Settle Trade
                    </button>
                  )}
                  {!isPending && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        textAlign: "right",
                        flexShrink: 0,
                      }}
                    >
                      Settled
                      <br />
                      {t.settledAt
                        ? new Date(t.settledAt).toLocaleTimeString()
                        : "—"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          USERS TAB
          ════════════════════════════════════════════════════ */}
      {tab === "users" && (
        <div>
          {regulars.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "48px 20px",
                color: "var(--text-muted)",
              }}
            >
              No users yet.
            </div>
          )}
          {regulars.map((u) => {
            const portVal = Object.entries(u.portfolio || {}).reduce(
              (s, [id, amt]) => {
                const c = coins.find((x) => x.id === id);
                return s + (c ? c.price * amt : 0);
              },
              0,
            );
            const myT = trades.filter((t) => t.userId === u.id);
            const isBanned = !!u.banned;

            return (
              <div
                key={u.id}
                className="card"
                style={{ marginBottom: 14, opacity: isBanned ? 0.7 : 1 }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 14,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                        borderRadius: 11,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: 17,
                        color: "#fff",
                        flexShrink: 0,
                        position: "relative",
                      }}
                    >
                      {u.name.charAt(0)}
                      {isBanned && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(239,68,68,.55)",
                            borderRadius: 11,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 18,
                          }}
                        >
                          🚫
                        </div>
                      )}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 15,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        {u.name}
                        {isBanned && (
                          <Badge color="#ef4444" bg="rgba(239,68,68,.12)">
                            BANNED
                          </Badge>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {u.email} · {myT.length} trades
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: ".4px",
                        }}
                      >
                        USDT
                      </div>
                      <div
                        style={{
                          fontWeight: 800,
                          color: "#10b981",
                          fontSize: 15,
                          ...MONO,
                        }}
                      >
                        ${fmt2(u.balance)}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: ".4px",
                        }}
                      >
                        Portfolio
                      </div>
                      <div
                        style={{
                          fontWeight: 800,
                          color: "var(--gold)",
                          fontSize: 15,
                          ...MONO,
                        }}
                      >
                        ${fmt2(portVal)}
                      </div>
                    </div>
                    <button
                      className="btn btn-buy"
                      style={{ padding: "8px 16px", fontSize: 13 }}
                      onClick={() => openFund(u)}
                    >
                      💳 Fund
                    </button>
                    <button
                      className="btn btn-ghost"
                      style={{
                        padding: "8px 13px",
                        fontSize: 13,
                        color: "var(--gold)",
                        borderColor: "var(--border-gold-s)",
                      }}
                      onClick={() =>
                        setConfirm({
                          message: `Reset ${u.name}'s account?`,
                          onConfirm: () => resetUserAccount(u.id),
                        })
                      }
                    >
                      🔄 Reset
                    </button>
                    <button
                      className="btn btn-ghost"
                      style={{
                        padding: "8px 13px",
                        fontSize: 13,
                        color: isBanned ? "#10b981" : "#ef4444",
                        borderColor: isBanned
                          ? "rgba(16,185,129,.3)"
                          : "rgba(239,68,68,.3)",
                      }}
                      onClick={() =>
                        setConfirm({
                          message: isBanned
                            ? `Unban ${u.name}?`
                            : `Ban ${u.name}?`,
                          onConfirm: () => banUser(u.id, !isBanned),
                        })
                      }
                    >
                      {isBanned ? "✅ Unban" : "🚫 Ban"}
                    </button>
                  </div>
                </div>

                {/* Holdings */}
                {Object.entries(u.portfolio || {}).filter(([, a]) => a > 0)
                  .length > 0 && (
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                    {Object.entries(u.portfolio)
                      .filter(([, a]) => a > 0)
                      .map(([id, amt]) => {
                        const c = coins.find((x) => x.id === id);
                        if (!c) return null;
                        return (
                          <div
                            key={id}
                            style={{
                              padding: "4px 10px",
                              background: "rgba(255,255,255,.03)",
                              border: "1px solid var(--border-subtle)",
                              borderRadius: 7,
                              fontSize: 12,
                            }}
                          >
                            <span
                              style={{
                                color: c.color,
                                fontWeight: 700,
                                marginRight: 4,
                              }}
                            >
                              {c.icon} {id}
                            </span>
                            <span
                              style={{
                                ...MONO,
                                color: "var(--text-secondary)",
                              }}
                            >
                              {amt.toFixed(4)}
                            </span>
                            <span
                              style={{
                                color: "var(--text-muted)",
                                marginLeft: 4,
                              }}
                            >
                              (${fmt2(c.price * amt)})
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          PRICES TAB
          ════════════════════════════════════════════════════ */}
      {tab === "prices" && (
        <div className="grid-2">
          {coins.map((c) => (
            <div key={c.id} className="card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <CoinChip coin={c} size={40} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    Current:{" "}
                    <strong style={{ color: "var(--gold)", ...MONO }}>
                      ${c.price.toLocaleString()}
                    </strong>
                  </div>
                </div>
                <span
                  style={{
                    ...MONO,
                    fontSize: 13,
                    fontWeight: 700,
                    color: c.change >= 0 ? "#10b981" : "#ef4444",
                  }}
                >
                  {c.change >= 0 ? "+" : ""}
                  {c.change}%
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  type="number"
                  placeholder={`New price for ${c.id}…`}
                  value={editP[c.id] || ""}
                  onChange={(e) =>
                    setEditP((p) => ({ ...p, [c.id]: e.target.value }))
                  }
                />
                <button
                  className="btn btn-primary"
                  style={{ padding: "10px 16px", fontSize: 13, flexShrink: 0 }}
                  onClick={() => {
                    const np = parseFloat(editP[c.id]);
                    if (np > 0) {
                      updateCoinPrice(c.id, np);
                      setEditP((p) => ({ ...p, [c.id]: "" }));
                    }
                  }}
                >
                  Set
                </button>
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                {[
                  { l: "-20%", f: 0.8 },
                  { l: "-10%", f: 0.9 },
                  { l: "-5%", f: 0.95 },
                  { l: "+5%", f: 1.05 },
                  { l: "+10%", f: 1.1 },
                  { l: "+20%", f: 1.2 },
                ].map(({ l, f }) => (
                  <button
                    key={l}
                    style={{
                      flex: 1,
                      padding: "5px 0",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                      border: "1px solid var(--border-soft)",
                      background: "transparent",
                      color: l.startsWith("+") ? "#10b981" : "#ef4444",
                    }}
                    onClick={() =>
                      updateCoinPrice(
                        c.id,
                        parseFloat((c.price * f).toFixed(c.price < 1 ? 4 : 2)),
                      )
                    }
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          DEPOSIT ADDRESSES TAB
          Admin edits which address users see when they click Deposit
          ════════════════════════════════════════════════════ */}
      {tab === "addresses" && (
        <div>
          <div
            style={{
              padding: "10px 14px",
              background: "rgba(247,147,26,.05)",
              border: "1px solid var(--border-gold-s)",
              borderLeft: "3px solid var(--gold)",
              borderRadius: "0 10px 10px 0",
              fontSize: 13,
              color: "var(--text-secondary)",
              marginBottom: 20,
            }}
          >
            🏦 These are the wallet addresses shown to users in the Deposit
            modal. Change them any time — users see the updated address
            immediately.
          </div>
          <div className="grid-2">
            {[
              ...SUPPORTED_COINS,
              {
                id: "USDT",
                name: "Tether (USDT)",
                icon: "₮",
                color: "#10b981",
              },
            ].map((c) => (
              <div key={c.id} className="card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      background: `${c.color}18`,
                      border: `1px solid ${c.color}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: c.color,
                      fontWeight: 800,
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    {c.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      Deposit address shown to users
                    </div>
                  </div>
                </div>

                {/* Current address display */}
                <div
                  style={{
                    padding: "9px 12px",
                    background: "rgba(0,0,0,.25)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: 8,
                    marginBottom: 10,
                    fontSize: 11,
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-secondary)",
                    wordBreak: "break-all",
                    lineHeight: 1.5,
                  }}
                >
                  {depositAddresses[c.id] || "Not set"}
                </div>

                {/* Edit input */}
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Enter new wallet address…"
                    value={editAddr[c.id] || ""}
                    onChange={(e) =>
                      setEditAddr((p) => ({ ...p, [c.id]: e.target.value }))
                    }
                    style={{ fontSize: 12, fontFamily: "var(--font-mono)" }}
                  />
                  <button
                    className="btn btn-primary"
                    style={{
                      padding: "10px 14px",
                      fontSize: 12,
                      flexShrink: 0,
                    }}
                    onClick={() => {
                      const addr = (editAddr[c.id] || "").trim();
                      if (!addr) {
                        addNotif("Enter a valid address", "error");
                        return;
                      }
                      updateDepositAddress(c.id, addr);
                      setEditAddr((p) => ({ ...p, [c.id]: "" }));
                    }}
                  >
                    Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
