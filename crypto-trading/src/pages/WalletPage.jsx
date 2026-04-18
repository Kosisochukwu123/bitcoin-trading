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

// ── Readable labels for each transaction type ─────────────────
const TXN_LABEL = {
  usdt_credit:   { label: "USDT Credited",    icon: "💵", color: "#10b981" },
  usdt_debit:    { label: "USDT Deducted",    icon: "💸", color: "#ef4444" },
  coin_credit:   { label: "Coin Granted",      icon: "🪙", color: "#10b981" },
  coin_debit:    { label: "Coin Removed",      icon: "🪙", color: "#ef4444" },
  trade_buy:     { label: "Bought",            icon: "📈", color: "#ef4444" },
  trade_sell:    { label: "Sold",              icon: "📉", color: "#10b981" },
  account_reset: { label: "Account Reset",     icon: "🔄", color: "#f7931a" },
  welcome_bonus: { label: "Welcome Bonus",     icon: "🎁", color: "#10b981" },
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

  const mono = { fontFamily: "var(--font-mono)" };

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
    <div className="page">
      <div className="page-header">
        <h1>Wallet</h1>
        <p>Live balances and full transaction history</p>
      </div>

      {/* ── TOTAL VALUE BANNER ────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg,rgba(247,147,26,.08),rgba(16,185,129,.04))",
        border: "1px solid var(--border-gold-s)", borderRadius: 20,
        padding: "26px 30px", marginBottom: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>
            Total Portfolio Value
          </div>
          {/* ← This number = USDT cash + all coin holdings at live price */}
          <div style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 900, lineHeight: 1, marginBottom: 8 }}>
            ${fmt2(totalValue)}
            <span style={{ fontSize: 15, color: "var(--text-muted)", marginLeft: 8, fontFamily: "var(--font-body)", fontWeight: 400 }}>USDT</span>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>USDT Cash</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#10b981", ...mono }}>${fmt2(user?.balance || 0)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>In Crypto</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--gold)", ...mono }}>${fmt2(cryptoValue)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Transactions</div>
              <div style={{ fontSize: 16, fontWeight: 800, ...mono }}>{allTxns.length}</div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => navigate("trade")} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#059669,#10b981)", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)" }}>
            📈 Trade Now
          </button>
        </div>
      </div>

      {/* ── ASSET TABLE ───────────────────────────────────── */}
      <div className="card mb-20" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", fontWeight: 700, fontSize: 15, borderBottom: "1px solid var(--border-subtle)" }}>
          My Assets
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr 1fr 1fr", gap: 12, padding: "10px 20px", borderBottom: "1px solid var(--border-subtle)", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".5px", background: "rgba(0,0,0,.1)" }}>
          <span>Asset</span><span>Balance</span><span>Value (USDT)</span><span>Price</span><span>24h</span>
        </div>
        {assets.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>No assets yet. <span onClick={() => navigate("trade")} style={{ color: "var(--gold)", cursor: "pointer" }}>Start trading →</span></div>
        )}
        {assets.map(a => (
          <div key={a.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1.2fr 1fr 1fr", gap: 12, padding: "13px 20px", borderBottom: "1px solid rgba(255,255,255,.03)", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, background: `${a.color}18`, border: `1px solid ${a.color}35`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: a.color, fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                {a.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{a.id}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{a.name}</div>
              </div>
            </div>
            <span style={{ fontWeight: 700, fontSize: 13, ...mono }}>
              {a.id === "USDT" ? `$${fmt2(a.amount)}` : a.amount.toFixed(6)}
            </span>
            <span style={{ fontWeight: 700, fontSize: 13, color: "var(--gold)", ...mono }}>${fmt2(a.value)}</span>
            <span style={{ fontSize: 12, color: "var(--text-secondary)", ...mono }}>${a.price.toLocaleString()}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: a.change >= 0 ? "#10b981" : "#ef4444" }}>
              {a.id === "USDT" ? "—" : `${a.change >= 0 ? "+" : ""}${a.change}%`}
            </span>
          </div>
        ))}
      </div>

      {/* ── TRANSACTION HISTORY ───────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>

        {/* Header with totals */}
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>Transaction History</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{filtered.length} record{filtered.length !== 1 ? "s" : ""}</div>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>Total In</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#10b981", ...mono }}>+${totalIn.toLocaleString(undefined,{maximumFractionDigits:2})}</div>
            </div>
            <div style={{ width: 1, background: "var(--border-subtle)" }} />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 2 }}>Total Out</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#ef4444", ...mono }}>-${totalOut.toLocaleString(undefined,{maximumFractionDigits:2})}</div>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 4, padding: "10px 16px", borderBottom: "1px solid var(--border-subtle)", background: "rgba(0,0,0,.08)" }}>
          {[
            ["all",    "All"],
            ["usdt",   "💵 USDT"],
            ["crypto", "🪙 Crypto"],
            ["trades", "📊 Trades"],
            ["admin",  "⚡ Admin"],
          ].map(([id, label]) => (
            <button key={id} onClick={() => { setFilter(id); setPage(1); }}
              style={{
                padding: "5px 13px", borderRadius: 7, cursor: "pointer",
                fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600,
                border:     `1px solid ${filter===id ? "var(--border-gold)" : "transparent"}`,
                background: filter===id ? "var(--gold-dim)"  : "transparent",
                color:      filter===id ? "var(--gold)"       : "var(--text-muted)",
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Transaction rows */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📭</div>
            No transactions yet
          </div>
        ) : (
          <>
            {paged.map(txn => {
              const meta    = TXN_LABEL[txn.type] || { label: txn.type, icon: "💱", color: "var(--text-secondary)" };
              const isCoin  = ["coin_credit","coin_debit"].includes(txn.type);
              const absAmt  = Math.abs(txn.amount);
              const isCredit = txn.amount > 0;

              return (
                <div key={txn.id}
                  style={{ display: "grid", gridTemplateColumns: "44px 1fr auto", gap: 14, padding: "13px 20px", borderBottom: "1px solid rgba(255,255,255,.03)", alignItems: "center", transition: "background .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,.025)"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}
                >
                  {/* Icon circle */}
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${meta.color}15`, border: `1px solid ${meta.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {meta.icon}
                  </div>

                  {/* Details */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{meta.label}</span>
                      {txn.meta?.adminAction && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: "rgba(247,147,26,.15)", color: "var(--gold)", border: "1px solid var(--border-gold-s)" }}>
                          ADMIN
                        </span>
                      )}
                      {txn.meta?.resultType && txn.meta.resultType !== "normal" && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: txn.meta.resultType==="profit" ? "rgba(16,185,129,.12)" : "rgba(239,68,68,.12)", color: txn.meta.resultType==="profit" ? "#10b981" : "#ef4444" }}>
                          {txn.meta.resultType.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 2 }}>{txn.note}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", gap: 12 }}>
                      <span>{timeAgo(txn.time)}</span>
                      {txn.balanceAfter != null && txn.currency === "USDT" && (
                        <span>Balance after: <strong style={{ color: "var(--text-secondary)", ...mono }}>${fmt2(txn.balanceAfter)}</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: meta.color, ...mono }}>
                      {isCredit ? "+" : "-"}
                      {isCoin
                        ? `${absAmt.toFixed(6)} ${txn.currency}`
                        : `$${fmt2(absAmt)}`
                      }
                    </div>
                    {isCoin && txn.usdValue > 0 && (
                      <div style={{ fontSize: 11, color: "var(--text-muted)", ...mono }}>≈ ${fmt2(txn.usdValue)}</div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Load more */}
            {hasMore && (
              <div style={{ padding: "14px 20px", textAlign: "center", borderTop: "1px solid var(--border-subtle)" }}>
                <button onClick={() => setPage(p => p + 1)}
                  style={{ background: "rgba(255,255,255,.04)", border: "1px solid var(--border-soft)", color: "var(--text-secondary)", padding: "9px 28px", borderRadius: 9, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-body)" }}>
                  Load more ({filtered.length - paged.length} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
