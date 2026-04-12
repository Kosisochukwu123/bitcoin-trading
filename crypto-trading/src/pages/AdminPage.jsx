import { useState } from "react";
import { useApp } from "../context/AppContext";
import { CoinChip, StatCard, Modal } from "../components/UI";
import "./AdminPage.css";

export function AdminPage() {
  const { 
    users, 
    trades, 
    coins, 
    overrides, 
    setAdminOverride, 
    setUserTradeOverride,
    updateCoinPrice, 
    updateUserBalance, 
    updateUserPortfolio,
    resetUserAccount,
    banUser,
    addNotif 
  } = useApp();
  
  const [tab, setTab] = useState("users");
  const [editP, setEditP] = useState({});
  const [fundModal, setFundModal] = useState(null);
  const [fundAmount, setFundAmount] = useState("");
  const [fundMode, setFundMode] = useState("add");
  const [fundCoin, setFundCoin] = useState("BTC");
  const [fundCoinAmt, setFundCoinAmt] = useState("");
  const [fundTab, setFundTab] = useState("balance");
  const [confirmModal, setConfirmModal] = useState(null);
  
  // Override modal states
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedOverride, setSelectedOverride] = useState(null);
  const [profitPercent, setProfitPercent] = useState("10");
  const [lossPercent, setLossPercent] = useState("10");

  const regulars = users.filter(u => !u.isAdmin);
  const totalVol = trades.reduce((s, t) => s + t.total, 0);
  const activeOvrs = Object.values(overrides).filter(v => v && v !== "none").length;

  const OV_OPTS = [
    { v: "none", l: "Normal", icon: "⚖️", c: "var(--text-muted)", d: "Standard market outcome" },
    { v: "force_profit", l: "Force Profit", icon: "📈", c: "var(--green)", d: "User always gains value" },
    { v: "force_loss", l: "Force Loss", icon: "📉", c: "var(--red)", d: "User always loses value" },
    { v: "force_fail", l: "Block Trades", icon: "🚫", c: "#f59e0b", d: "All trades return error" },
  ];

  const PRESETS = [500, 1000, 5000, 10000, 50000];

  const confirm = (msg, cb) => setConfirmModal({ msg, cb });

  const handleFundBalance = () => {
    const amt = parseFloat(fundAmount);
    if (!amt || amt <= 0) {
      addNotif("Enter a valid amount", "error");
      return;
    }
    updateUserBalance(fundModal.id, amt, fundMode);
    const verb = fundMode === "add" ? "credited" : fundMode === "subtract" ? "debited" : "set to";
    addNotif(`Balance ${verb} $${amt.toLocaleString()} for ${fundModal.name}`, "success");
    setFundAmount("");
    setFundModal(null);
  };

  const handleFundCrypto = () => {
    const amt = parseFloat(fundCoinAmt);
    if (!amt || amt <= 0) {
      addNotif("Enter a valid amount", "error");
      return;
    }
    updateUserPortfolio(fundModal.id, fundCoin, amt, fundMode);
    addNotif(`${fundMode === "subtract" ? "Removed" : "Added"} ${amt} ${fundCoin} for ${fundModal.name}`, "success");
    setFundCoinAmt("");
    setFundModal(null);
  };

  const handleTradeOverride = () => {
    if (!selectedUser || !selectedOverride) return;
    const overrideData = {
      type: selectedOverride,
      profitPercent: parseFloat(profitPercent),
      lossPercent: parseFloat(lossPercent),
    };
    setUserTradeOverride(selectedUser.id, overrideData);
    setShowOverrideModal(false);
    setSelectedOverride(null);
    setProfitPercent("10");
    setLossPercent("10");
  };

  const previewBal = () => {
    if (!fundModal || !fundAmount || parseFloat(fundAmount) <= 0) return null;
    const a = parseFloat(fundAmount);
    const b = fundModal.balance;
    return fundMode === "set" ? a : fundMode === "add" ? b + a : Math.max(0, b - a);
  };

  const getPortfolioValue = (user) => {
    return Object.entries(user.portfolio || {}).reduce((sum, [id, amt]) => {
      const c = coins.find(x => x.id === id);
      return sum + (c ? c.price * amt : 0);
    }, 0);
  };

  const ModeBtn = ({ value, label, color, current, onClick }) => {
    const on = current === value;
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
          border: `1.5px solid ${on ? color : "rgba(255,255,255,.1)"}`,
          background: on ? `${color}14` : "transparent",
          color: on ? color : "var(--text-muted)",
        }}
      >
        {label}
      </button>
    );
  };

  const Badge = ({ children, type = "normal" }) => {
    const map = {
      buy: ["rgba(16,185,129,.12)", "#10b981", "rgba(16,185,129,.3)"],
      sell: ["rgba(239,68,68,.12)", "#ef4444", "rgba(239,68,68,.3)"],
      profit: ["rgba(16,185,129,.12)", "#10b981", "rgba(16,185,129,.3)"],
      loss: ["rgba(239,68,68,.12)", "#ef4444", "rgba(239,68,68,.3)"],
      gold: ["rgba(247,147,26,.12)", "#f7931a", "rgba(247,147,26,.3)"],
      normal: ["rgba(255,255,255,.05)", "#8896b3", "transparent"],
    };
    const [bg, color, border] = map[type] ?? map.normal;
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "3px 10px",
          borderRadius: 99,
          fontSize: 11,
          fontWeight: 700,
          background: bg,
          color,
          border: `1px solid ${border}`,
        }}
      >
        {children}
      </span>
    );
  };

  return (
    <div className="admin-page-container">
      {/* Confirm Modal */}
      {confirmModal && (
        <Modal title="Confirm Action" onClose={() => setConfirmModal(null)}>
          <p style={{ marginBottom: 24, lineHeight: 1.7, color: "var(--text-secondary)" }}>
            {confirmModal.msg}
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-ghost"
              style={{ flex: 1, padding: 12 }}
              onClick={() => setConfirmModal(null)}
            >
              Cancel
            </button>
            <button
              className="btn btn-sell"
              style={{ flex: 1, padding: 12 }}
              onClick={() => {
                confirmModal.cb();
                setConfirmModal(null);
              }}
            >
              Confirm
            </button>
          </div>
        </Modal>
      )}

      {/* Trade Override Modal */}
      {showOverrideModal && (
        <Modal title="Trade Outcome Override" onClose={() => setShowOverrideModal(false)}>
          <div className="admin-modal-body">
            <div className="admin-form-group">
              <label>User</label>
              <input type="text" value={selectedUser?.name} disabled />
            </div>
            <div className="admin-form-group">
              <label>Override Type</label>
              <div className="admin-override-selector" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {OV_OPTS.map(opt => (
                  <button
                    key={opt.v}
                    className={`admin-override-select ${selectedOverride === opt.v ? "active" : ""}`}
                    onClick={() => setSelectedOverride(opt.v)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 8,
                      cursor: "pointer",
                      border: `2px solid ${selectedOverride === opt.v ? opt.c : "var(--border-subtle)"}`,
                      background: selectedOverride === opt.v ? `${opt.c}12` : "transparent",
                      color: selectedOverride === opt.v ? opt.c : "var(--text-muted)",
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ fontSize: 20, marginRight: 8 }}>{opt.icon}</span>
                    <span>{opt.l}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedOverride === "force_profit" && (
              <div className="admin-form-group">
                <label>Profit Percentage (%)</label>
                <input
                  type="number"
                  value={profitPercent}
                  onChange={(e) => setProfitPercent(e.target.value)}
                  placeholder="Enter profit percentage"
                />
                <div className="admin-field-hint" style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  User will gain this percentage on each trade
                </div>
              </div>
            )}

            {selectedOverride === "force_loss" && (
              <div className="admin-form-group">
                <label>Loss Percentage (%)</label>
                <input
                  type="number"
                  value={lossPercent}
                  onChange={(e) => setLossPercent(e.target.value)}
                  placeholder="Enter loss percentage"
                />
                <div className="admin-field-hint" style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  User will lose this percentage on each trade
                </div>
              </div>
            )}

            <div className="admin-modal-hint" style={{ 
              padding: "10px", 
              background: "rgba(247,147,26,.1)", 
              borderRadius: 8, 
              marginTop: 16,
              fontSize: 13,
              color: "var(--gold)"
            }}>
              💡 This override will affect all future trades until changed.
            </div>
          </div>
          <div className="admin-modal-footer" style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button 
              className="admin-modal-cancel" 
              style={{ flex: 1, padding: 12 }}
              onClick={() => setShowOverrideModal(false)}
            >
              Cancel
            </button>
            <button 
              className="admin-modal-confirm" 
              style={{ flex: 1, padding: 12, background: "var(--gold)", color: "#000", fontWeight: 700 }}
              onClick={handleTradeOverride}
            >
              Apply Override
            </button>
          </div>
        </Modal>
      )}

      {/* Fund User Modal */}
      {fundModal && (
        <Modal title={`Manage — ${fundModal.name}`} onClose={() => setFundModal(null)}>
          {/* Mini user card */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "11px 14px",
              background: "rgba(255,255,255,.03)",
              borderRadius: 10,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 16,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {fundModal.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{fundModal.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{fundModal.email}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", marginBottom: 2 }}>
                USDT Balance
              </div>
              <div style={{ fontWeight: 800, fontSize: 16, color: "var(--green)", fontFamily: "var(--font-mono)" }}>
                ${fundModal.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Balance / Crypto switcher */}
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
              { id: "balance", l: "💵 USDT Balance" },
              { id: "crypto", l: "🪙 Crypto Assets" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setFundTab(t.id);
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
                  background: fundTab === t.id ? "rgba(247,147,26,.15)" : "transparent",
                  color: fundTab === t.id ? "var(--gold)" : "var(--text-muted)",
                }}
              >
                {t.l}
              </button>
            ))}
          </div>

          {/* BALANCE TAB */}
          {fundTab === "balance" && (
            <>
              <label style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                Operation
              </label>
              <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                <ModeBtn value="add" label="➕ Add" color="var(--green)" current={fundMode} onClick={() => setFundMode("add")} />
                <ModeBtn value="subtract" label="➖ Deduct" color="var(--red)" current={fundMode} onClick={() => setFundMode("subtract")} />
                <ModeBtn value="set" label="🎯 Set Exact" color="var(--gold)" current={fundMode} onClick={() => setFundMode("set")} />
              </div>

              <label style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                Quick Presets
              </label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setFundAmount(String(p))}
                    style={{
                      padding: "5px 12px",
                      borderRadius: 7,
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                      fontSize: 12,
                      fontWeight: 600,
                      border: `1px solid ${fundAmount === String(p) ? "var(--border-gold)" : "rgba(255,255,255,.1)"}`,
                      background: fundAmount === String(p) ? "var(--gold-dim)" : "transparent",
                      color: fundAmount === String(p) ? "var(--gold)" : "var(--text-secondary)",
                    }}
                  >
                    ${p.toLocaleString()}
                  </button>
                ))}
              </div>

              <label style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                Custom Amount (USDT)
              </label>
              <input
                type="number"
                value={fundAmount}
                placeholder="e.g. 2500"
                onChange={(e) => setFundAmount(e.target.value)}
                style={{ marginBottom: 14 }}
              />

              {previewBal() !== null && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "rgba(255,255,255,.03)",
                    borderRadius: 8,
                    fontSize: 13,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ color: "var(--text-muted)" }}>Current</span>
                    <span style={{ fontFamily: "var(--font-mono)" }}>
                      ${fundModal.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>After {fundMode}</span>
                    <span style={{ fontWeight: 700, color: "var(--green)", fontFamily: "var(--font-mono)" }}>
                      ${previewBal().toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary"
                style={{ width: "100%", padding: 13, fontSize: 14 }}
                onClick={handleFundBalance}
                disabled={!fundAmount || parseFloat(fundAmount) <= 0}
              >
                {fundMode === "add" ? "➕ Credit Balance" : fundMode === "subtract" ? "➖ Deduct Balance" : "🎯 Set Balance"}
              </button>
            </>
          )}

          {/* CRYPTO TAB */}
          {fundTab === "crypto" && (
            <>
              <label style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                Select Coin
              </label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                {coins.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setFundCoin(c.id)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                      fontSize: 13,
                      fontWeight: 700,
                      border: `1.5px solid ${fundCoin === c.id ? c.color : "rgba(255,255,255,.1)"}`,
                      background: fundCoin === c.id ? `${c.color}18` : "transparent",
                      color: fundCoin === c.id ? c.color : "var(--text-secondary)",
                    }}
                  >
                    {c.icon} {c.id}
                  </button>
                ))}
              </div>

              <label style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                Operation
              </label>
              <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
                <ModeBtn value="add" label="➕ Grant" color="var(--green)" current={fundMode} onClick={() => setFundMode("add")} />
                <ModeBtn value="subtract" label="➖ Remove" color="var(--red)" current={fundMode} onClick={() => setFundMode("subtract")} />
                <ModeBtn value="set" label="🎯 Set" color="var(--gold)" current={fundMode} onClick={() => setFundMode("set")} />
              </div>

              <label style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                Amount ({fundCoin})
              </label>
              <input
                type="number"
                value={fundCoinAmt}
                placeholder={`e.g. 0.5 ${fundCoin}`}
                onChange={(e) => setFundCoinAmt(e.target.value)}
                style={{ marginBottom: 8 }}
              />

              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
                Current holding:{" "}
                <strong style={{ color: "var(--gold)", fontFamily: "var(--font-mono)" }}>
                  {(fundModal.portfolio?.[fundCoin] || 0).toFixed(6)} {fundCoin}
                </strong>
                {" "}≈{" "}
                <strong style={{ color: "var(--green)", fontFamily: "var(--font-mono)" }}>
                  $
                  {(
                    (fundModal.portfolio?.[fundCoin] || 0) * (coins.find((c) => c.id === fundCoin)?.price || 0)
                  ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </strong>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: "100%", padding: 13, fontSize: 14 }}
                onClick={handleFundCrypto}
                disabled={!fundCoinAmt || parseFloat(fundCoinAmt) <= 0}
              >
                {fundMode === "subtract" ? `➖ Remove ${fundCoin}` : `➕ Grant ${fundCoin}`}
              </button>
            </>
          )}
        </Modal>
      )}

      {/* Header */}
      <div className="admin-header">
        <div className="admin-hero">
          <div className="admin-icon">⚡</div>
          <div>
            <h1>Admin Control Panel</h1>
            <span className="admin-badge">🔒 Restricted Access</span>
          </div>
        </div>
        <div className="admin-hint">
          💡 <strong>School Project Demo:</strong> This panel controls user balances, trade outcomes, market prices and user management in real time.
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        <StatCard label="Registered Users" value={regulars.length} sub="Active accounts" subColor="var(--blue)" accentColor="var(--blue)"/>
        <StatCard label="Total Trades" value={trades.length} sub="Platform-wide" subColor="var(--gold)" accentColor="var(--gold)"/>
        <StatCard label="Total Volume" value={`$${totalVol.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} sub="All trades combined" subColor="var(--green)" accentColor="var(--green)"/>
        <StatCard label="Active Overrides" value={activeOvrs} sub="Users affected" subColor={activeOvrs > 0 ? "var(--red)" : "var(--text-muted)"} accentColor="var(--red)"/>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {[
          { id: "users", l: "👥 User Control" },
          { id: "trades", l: "📋 Trade History" },
          { id: "prices", l: "💹 Price Control" },
        ].map(t => (
          <button key={t.id} className={`admin-tab-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ── USER CONTROL ── */}
      {tab === "users" && (
        <div className="admin-users-section">
          {regulars.map(u => {
            const curOverride = overrides[u.id] || { type: "none", profitPercent: 10, lossPercent: 10 };
            const overrideType = curOverride.type || "none";
            const portVal = getPortfolioValue(u);
            const myT = trades.filter(t => t.userId === u.id);
            const isBanned = !!u.banned;

            return (
              <div key={u.id} className="admin-user-card" style={{ opacity: isBanned ? 0.7 : 1 }}>
                {/* User info row */}
                <div className="admin-user-header">
                  <div className="admin-user-info">
                    <div className="admin-user-avatar" style={{ position: "relative" }}>
                      {u.name.charAt(0)}
                      {isBanned && (
                        <div style={{ 
                          position: "absolute", 
                          inset: 0, 
                          background: "rgba(239,68,68,.55)", 
                          borderRadius: "50%", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          fontSize: 20 
                        }}>
                          🚫
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="admin-user-name">
                        {u.name} {isBanned && <Badge type="sell">BANNED</Badge>}
                      </div>
                      <div className="admin-user-meta">{u.email} · {myT.length} trades</div>
                    </div>
                  </div>
                  <div className="admin-user-balances">
                    <div className="admin-balance-item">
                      <div className="admin-balance-label">USDT Balance</div>
                      <div className="admin-balance-value green">${u.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    </div>
                    <div className="admin-balance-item">
                      <div className="admin-balance-label">Portfolio</div>
                      <div className="admin-balance-value gold">${portVal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="admin-user-actions">
                  <button 
                    className="admin-action-btn fund-btn"
                    onClick={() => {
                      setFundModal(u);
                      setFundAmount("");
                      setFundCoinAmt("");
                      setFundMode("add");
                      setFundTab("balance");
                      setFundCoin(coins[0]?.id || "BTC");
                    }}
                  >
                    💰 Fund Wallet
                  </button>
                  <button 
                    className="admin-action-btn override-btn"
                    onClick={() => {
                      setSelectedUser(u);
                      setSelectedOverride(overrideType);
                      setProfitPercent(curOverride.profitPercent?.toString() || "10");
                      setLossPercent(curOverride.lossPercent?.toString() || "10");
                      setShowOverrideModal(true);
                    }}
                  >
                    🎮 Trade Override
                  </button>
                  <button
                    className="admin-action-btn reset-btn"
                    onClick={() => confirm(
                      `Reset ${u.name}'s account to $10,000, empty portfolio and clear all trades?`,
                      () => resetUserAccount(u.id)
                    )}
                  >
                    🔄 Reset
                  </button>
                  <button
                    className={`admin-action-btn ${isBanned ? "unban-btn" : "ban-btn"}`}
                    onClick={() => confirm(
                      isBanned ? `Unban ${u.name}? They can trade again.` : `Ban ${u.name}? Trades will be blocked.`,
                      () => { 
                        banUser(u.id, !isBanned); 
                      }
                    )}
                  >
                    {isBanned ? "✅ Unban" : "🚫 Ban"}
                  </button>
                </div>

                {/* Active Override Display */}
                {overrideType !== "none" && (
                  <div className="admin-active-override">
                    <span className="override-badge">
                      Active: {OV_OPTS.find(o => o.v === overrideType)?.l || overrideType}
                    </span>
                    {overrideType === "force_profit" && (
                      <span className="override-percent">Profit: +{curOverride.profitPercent}%</span>
                    )}
                    {overrideType === "force_loss" && (
                      <span className="override-percent">Loss: -{curOverride.lossPercent}%</span>
                    )}
                  </div>
                )}

                {/* Holdings Display */}
                {Object.entries(u.portfolio || {}).filter(([, a]) => a > 0).length > 0 && (
                  <div className="admin-holdings-section">
                    <div className="admin-holdings-label">Holdings</div>
                    <div className="admin-holdings-list">
                      {Object.entries(u.portfolio).filter(([, a]) => a > 0).map(([id, amt]) => {
                        const c = coins.find(x => x.id === id);
                        if (!c) return null;
                        return (
                          <div key={id} className="admin-holding-item">
                            <span style={{ color: c.color, fontWeight: 700, marginRight: 4 }}>
                              {c.icon} {id}
                            </span>
                            <span className="admin-holding-amount">{amt.toFixed(4)}</span>
                            <span className="admin-holding-value">
                              (${(c.price * amt).toLocaleString(undefined, { maximumFractionDigits: 0 })})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Override selector quick view */}
                <div className="admin-override-grid">
                  {OV_OPTS.map(opt => {
                    const isActive = overrideType === opt.v;
                    return (
                      <button
                        key={opt.v}
                        className={`admin-override-option ${isActive ? "active" : ""}`}
                        onClick={() => {
                          const overrideData = {
                            type: opt.v,
                            profitPercent: parseFloat(profitPercent),
                            lossPercent: parseFloat(lossPercent),
                          };
                          setUserTradeOverride(u.id, overrideData);
                        }}
                        style={{
                          borderColor: isActive ? opt.c : "var(--border-subtle)",
                          background: isActive ? `${opt.c}12` : "rgba(255,255,255,0.02)",
                        }}
                      >
                        <div className="override-icon">{opt.icon}</div>
                        <div className="override-title">{opt.l}</div>
                        <div className="override-desc">{opt.d}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Recent trades */}
                {myT.length > 0 && (
                  <div className="admin-user-trades">
                    <div className="admin-trades-label">Recent trades</div>
                    <div className="admin-trades-list">
                      {myT.slice(0, 6).map(t => (
                        <span key={t.id} className={`admin-trade-badge ${t.type}`}>
                          {t.type.toUpperCase()} {t.coin} ${t.total.toFixed(0)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── TRADE HISTORY ── */}
      {tab === "trades" && (
        <div className="admin-trades-table">
          <div className="admin-table-header">
            All Platform Trades ({trades.length} total)
          </div>
          <div className="admin-table-head">
            <span>User</span><span>Type</span><span>Coin</span><span>Amount</span><span>Total</span><span>Result</span><span>Time</span>
          </div>
          {trades.length === 0 ? (
            <div className="admin-empty-state">No trades on platform yet.</div>
          ) : (
            trades.slice(0, 50).map(t => {
              const u = users.find(x => x.id === t.userId);
              return (
                <div key={t.id} className="admin-table-row">
                  <span className="admin-user-cell">{u?.name || "Unknown"}</span>
                  <span className={`admin-type-badge ${t.type}`}>{t.type.toUpperCase()}</span>
                  <span className="admin-coin-cell">{t.coin}</span>
                  <span className="admin-amount-cell">{t.amount.toFixed(4)}</span>
                  <span className="admin-total-cell">${t.total.toFixed(2)}</span>
                  <span className={`admin-result-badge ${t.resultType || "normal"}`}>{t.resultType || "normal"}</span>
                  <span className="admin-time-cell">{new Date(t.time).toLocaleString()}</span>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── PRICE CONTROL ── */}
      {tab === "prices" && (
        <div className="admin-prices-section">
          <div className="admin-hint">
            💹 <strong>Price Control:</strong> Adjust any coin's price instantly. Changes affect all users' portfolio valuations in real time.
          </div>
          <div className="admin-prices-grid">
            {coins.map(c => (
              <div key={c.id} className="admin-price-card">
                <div className="admin-price-header">
                  <CoinChip coin={c} size={40} />
                  <div>
                    <div className="admin-price-name">{c.name}</div>
                    <div className="admin-price-current">
                      Current: <strong>${c.price.toLocaleString()}</strong>
                    </div>
                  </div>
                  <div className="admin-price-change">
                    <span className={c.change >= 0 ? "positive" : "negative"}>
                      {c.change >= 0 ? "+" : ""}{c.change}%
                    </span>
                  </div>
                </div>

                <div className="admin-price-input-group">
                  <input
                    type="number"
                    placeholder={c.price.toString()}
                    value={editP[c.id] || ""}
                    onChange={e => setEditP(p => ({ ...p, [c.id]: e.target.value }))}
                  />
                  <button
                    className="admin-update-btn"
                    onClick={() => {
                      const np = parseFloat(editP[c.id]);
                      if (np > 0) {
                        updateCoinPrice(c.id, np);
                        setEditP(p => ({ ...p, [c.id]: "" }));
                        addNotif(`${c.id} price set to $${np.toLocaleString()}`, "success");
                      }
                    }}
                  >
                    Set Price
                  </button>
                </div>

                <div className="admin-price-quick-btns">
                  {[
                    { l: "-20%", f: 0.80, cls: "down" },
                    { l: "-10%", f: 0.90, cls: "down" },
                    { l: "-5%", f: 0.95, cls: "down" },
                    { l: "+5%", f: 1.05, cls: "up" },
                    { l: "+10%", f: 1.10, cls: "up" },
                    { l: "+20%", f: 1.20, cls: "up" },
                  ].map(({ l, f, cls }) => (
                    <button 
                      key={l} 
                      className={`admin-quick-btn ${cls}`} 
                      onClick={() => {
                        const np = parseFloat((c.price * f).toFixed(c.price < 1 ? 4 : 2));
                        updateCoinPrice(c.id, np);
                        addNotif(`${c.id} ${l} → $${np.toLocaleString()}`, "success");
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}