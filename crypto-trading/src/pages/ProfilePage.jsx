import { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import "./ProfilePage.css";

// ── SVG Icons ─────────────────────────────────────────────────
const Icons = {
  Back: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M19 12H5M12 19L5 12L12 5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Logout: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 17L21 12L16 7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Edit: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M17 3L21 7L7 21H3V17L17 3Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Camera: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="13"
        r="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Chart: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M21 16L15 10L11 14L3 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M21 10V16H15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Wallet: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M3 7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z"
        strokeLinejoin="round"
      />
      <path d="M3 9H21" strokeLinecap="round" />
      <circle cx="17" cy="13" r="1.2" fill="currentColor" />
    </svg>
  ),
  Trophy: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M6 9H3C2.44772 9 2 8.55228 2 8V5C2 4.44772 2.44772 4 3 4H6"
        strokeLinecap="round"
      />
      <path
        d="M18 9H21C21.5523 9 22 8.55228 22 8V5C22 4.44772 21.5523 4 21 4H18"
        strokeLinecap="round"
      />
      <path d="M12 14V20M8 20H16" strokeLinecap="round" />
      <path
        d="M12 14C9.23858 14 7 11.7614 7 9V4H17V9C17 11.7614 14.7614 14 12 14Z"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Star: () => (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        strokeLinejoin="round"
      />
    </svg>
  ),
  User: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="8" r="4" strokeLinecap="round" />
      <path
        d="M5 20V19C5 15.5 8.5 14 12 14C15.5 14 19 15.5 19 19V20"
        strokeLinecap="round"
      />
    </svg>
  ),
  Lock: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="5" y="11" width="14" height="11" rx="2" strokeLinecap="round" />
      <path
        d="M8 11V7C8 4.5 9.5 3 12 3C14.5 3 16 4.5 16 7V11"
        strokeLinecap="round"
      />
    </svg>
  ),
  Globe: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="10" />
      <path
        d="M2 12H22M12 2C14.5 4.5 15 9 15 12C15 15 14.5 19.5 12 22C9.5 19.5 9 15 9 12C9 9 9.5 4.5 12 2Z"
        strokeLinecap="round"
      />
    </svg>
  ),
  ArrowRight: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M5 12H19M12 5L19 12L12 19"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Trash: () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M3 6H21M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 11V17M14 11V17" strokeLinecap="round" />
    </svg>
  ),
};

// ─────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, navigate, logout, updateProfile, getUserTrades, coins } =
    useApp();

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null); // base64 data URL
  const fileInputRef = useRef(null);

  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    bio: user?.bio || "",
    username: user?.username || user?.email?.split("@")[0] || "",
  });

  const userTrades = getUserTrades?.(user?.id) || [];

  // ── Calculate stats ───────────────────────────────────────
  const totalVolume = userTrades.reduce((s, t) => s + t.total, 0);
  const winTrades = userTrades.filter(
    (t) => t.status === "settled_win" || t.resultType === "profit",
  ).length;
  const lossTrades = userTrades.filter(
    (t) => t.status === "settled_loss" || t.resultType === "loss",
  ).length;
  const winRate =
    userTrades.length > 0
      ? Math.round((winTrades / userTrades.length) * 100)
      : 0;
  const bestTrade =
    userTrades.length > 0 ? Math.max(...userTrades.map((t) => t.total)) : 0;

  // ── Portfolio value ───────────────────────────────────────
  const portValue = Object.entries(user?.portfolio || {}).reduce(
    (s, [id, amt]) => {
      const c = coins?.find((x) => x.id === id);
      return s + (c ? c.price * amt : 0);
    },
    0,
  );

  // ── Avatar upload ─────────────────────────────────────────
  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setAvatarPreview(dataUrl);
      // Save immediately to user profile
      updateProfile({ avatar: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  // ── Profile save ──────────────────────────────────────────
  const handleSave = () => {
    updateProfile(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      location: user?.location || "",
      bio: user?.bio || "",
      username: user?.username || user?.email?.split("@")[0] || "",
    });
    setIsEditing(false);
  };

  const fmt = (n) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(n);
  const avatarSrc = avatarPreview || user?.avatar;

  // ─────────────────────────────────────────────────────────
  return (
    <div className="profile-page">
      {/* ── TOP BAR ───────────────────────────────────────── */}
      <div className="profile-header">
        <button
          className="profile-back-btn"
          onClick={() => navigate("dashboard")}
        >
          <Icons.Back /> Back to Dashboard
        </button>
        <button className="profile-logout-btn-header" onClick={logout}>
          <Icons.Logout /> Logout
        </button>
      </div>

      {/* ── COVER + AVATAR ────────────────────────────────── */}
      <div className="profile-cover">
        <div className="profile-avatar-container">
          {/* Hidden file input for avatar upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />

          {/* Avatar display — shows photo if uploaded, initials otherwise */}
          <div
            className="profile-avatar"
            onClick={handleAvatarClick}
            title="Click to change photo"
          >
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            ) : (
              <span className="avatar-initials">
                {user?.name?.charAt(0)?.toUpperCase() ||
                  user?.email?.charAt(0)?.toUpperCase() ||
                  "U"}
              </span>
            )}
          </div>

          {/* Camera overlay button */}
          <button
            className="profile-avatar-edit"
            onClick={handleAvatarClick}
            title="Upload photo"
          >
            <Icons.Camera />
          </button>
        </div>

        <h1 className="profile-name">{user?.name || "User"}</h1>
        <p className="profile-username">
          @{user?.username || user?.email?.split("@")[0]}
        </p>
        <p className="profile-joined">
          Member since{" "}
          {user?.joinedAt
            ? new Date(user.joinedAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })
            : "January 2024"}
        </p>

        {/* Avatar upload hint */}
        <p className="profile-avatar-hint">
          Click your avatar to upload a photo
        </p>
      </div>

      {/* ── STAT CARDS ────────────────────────────────────── */}
      <div className="profile-stats-grid">
        {[
          {
            icon: <Icons.Chart />,
            label: "Total Trades",
            value: userTrades.length,
          },
          {
            icon: <Icons.Wallet />,
            label: "Total Volume",
            value: fmt(totalVolume),
          },
          { icon: <Icons.Trophy />, label: "Win Rate", value: `${winRate}%` },
          { icon: <Icons.Star />, label: "Best Trade", value: fmt(bestTrade) },
        ].map((s) => (
          <div key={s.label} className="profile-stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-content">
              <span className="stat-label">{s.label}</span>
              <span className="stat-value">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── TABS ──────────────────────────────────────────── */}
      <div className="profile-tabs-container">
        <div className="profile-tabs">
          {[
            { id: "overview", icon: <Icons.User />, label: "Overview" },
            { id: "security", icon: <Icons.Lock />, label: "Security" },
            { id: "activity", icon: <Icons.Chart />, label: "Activity" },
            { id: "settings", icon: <Icons.Globe />, label: "Settings" },
          ].map((t) => (
            <button
              key={t.id}
              className={`profile-tab${activeTab === t.id ? " active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="profile-tab-content">
          {/* ── OVERVIEW ──────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="profile-overview">
              <div className="profile-info-section">
                <div className="section-header">
                  <h3>Personal Information</h3>
                  {!isEditing && (
                    <button
                      className="edit-btn"
                      onClick={() => setIsEditing(true)}
                    >
                      <Icons.Edit /> Edit Profile
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="edit-form">
                    {[
                      {
                        label: "Full Name",
                        key: "name",
                        type: "text",
                        placeholder: "Your full name",
                      },
                      {
                        label: "Username",
                        key: "username",
                        type: "text",
                        placeholder: "Choose a username",
                      },
                      {
                        label: "Email",
                        key: "email",
                        type: "email",
                        placeholder: "your@email.com",
                      },
                      {
                        label: "Phone Number",
                        key: "phone",
                        type: "tel",
                        placeholder: "+1 234 567 8900",
                      },
                      {
                        label: "Location",
                        key: "location",
                        type: "text",
                        placeholder: "City, Country",
                      },
                    ].map((f) => (
                      <div key={f.key} className="form-group">
                        <label>{f.label}</label>
                        <input
                          type={f.type}
                          value={editForm[f.key]}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              [f.key]: e.target.value,
                            })
                          }
                          placeholder={f.placeholder}
                        />
                      </div>
                    ))}
                    <div className="form-group">
                      <label>Bio</label>
                      <textarea
                        rows="3"
                        value={editForm.bio}
                        onChange={(e) =>
                          setEditForm({ ...editForm, bio: e.target.value })
                        }
                        placeholder="Tell us about yourself…"
                      />
                    </div>
                    <div className="form-actions">
                      <button className="cancel-btn" onClick={handleCancel}>
                        Cancel
                      </button>
                      <button className="save-btn" onClick={handleSave}>
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="info-grid">
                    {[
                      { label: "Full Name", value: user?.name },
                      {
                        label: "Username",
                        value: `@${user?.username || user?.email?.split("@")[0]}`,
                      },
                      { label: "Email", value: user?.email },
                      { label: "Phone", value: user?.phone },
                      { label: "Location", value: user?.location },
                    ].map((row) => (
                      <div key={row.label} className="info-row">
                        <span className="info-label">{row.label}</span>
                        <span className="info-value">
                          {row.value || "Not set"}
                        </span>
                      </div>
                    ))}
                    <div className="info-row full-width">
                      <span className="info-label">Bio</span>
                      <span className="info-value">
                        {user?.bio || "No bio yet"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Wallet info */}
              <div className="profile-wallet-section">
                <h3>Wallet Information</h3>
                <div className="wallet-stats">
                  <div className="wallet-stat">
                    <span className="wallet-label">USDT Balance</span>
                    <span className="wallet-value" style={{ color: "#10b981" }}>
                      {fmt(user?.balance || 0)}
                    </span>
                  </div>
                  <div className="wallet-stat">
                    <span className="wallet-label">Portfolio Value</span>
                    <span className="wallet-value" style={{ color: "#f7931a" }}>
                      {fmt(portValue)}
                    </span>
                  </div>
                  <div className="wallet-stat">
                    <span className="wallet-label">Total Assets</span>
                    <span className="wallet-value">
                      {
                        Object.keys(user?.portfolio || {}).filter(
                          (k) => user.portfolio[k] > 0,
                        ).length
                      }
                    </span>
                  </div>
                  <div className="wallet-stat">
                    <span className="wallet-label">Pending Trades</span>
                    <span className="wallet-value" style={{ color: "#f7931a" }}>
                      {
                        userTrades.filter(
                          (t) => !t.status || t.status === "pending",
                        ).length
                      }
                    </span>
                  </div>
                </div>

                {/* Coin holdings preview */}
                {Object.entries(user?.portfolio || {}).filter(([, a]) => a > 0)
                  .length > 0 && (
                  <div style={{ marginTop: 16 }}>
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
                      Holdings
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {Object.entries(user.portfolio)
                        .filter(([, a]) => a > 0)
                        .map(([id, amt]) => {
                          const c = coins?.find((x) => x.id === id);
                          if (!c) return null;
                          return (
                            <div
                              key={id}
                              style={{
                                padding: "6px 12px",
                                background: "rgba(255,255,255,.04)",
                                border: "1px solid rgba(255,255,255,.08)",
                                borderRadius: 9,
                                fontSize: 13,
                              }}
                            >
                              <span
                                style={{
                                  color: c.color,
                                  fontWeight: 700,
                                  marginRight: 5,
                                }}
                              >
                                {c.icon} {id}
                              </span>
                              <span
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  color: "var(--text-secondary)",
                                }}
                              >
                                {amt.toFixed(4)}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── SECURITY ──────────────────────────────────── */}
          {activeTab === "security" && (
            <div className="profile-security">
              {[
                {
                  icon: <Icons.Lock />,
                  title: "Two-Factor Authentication",
                  desc: "Add an extra layer of security",
                  btn: "Enable 2FA",
                },
                {
                  icon: <Icons.Globe />,
                  title: "Change Password",
                  desc: "Update your password regularly",
                  btn: "Change",
                },
                {
                  icon: <Icons.User />,
                  title: "Device Management",
                  desc: "Manage devices with account access",
                  btn: "Manage",
                },
                {
                  icon: <Icons.Globe />,
                  title: "Email Notifications",
                  desc: "Configure email preferences",
                  btn: "Configure",
                },
              ].map((s) => (
                <div key={s.title} className="security-card">
                  <div className="security-icon">{s.icon}</div>
                  <div className="security-info">
                    <h4>{s.title}</h4>
                    <p>{s.desc}</p>
                  </div>
                  <button className="security-btn">{s.btn}</button>
                </div>
              ))}
            </div>
          )}

          {/* ── ACTIVITY ──────────────────────────────────── */}
          {activeTab === "activity" && (
            <div className="profile-activity">
              {userTrades.length === 0 ? (
                <div className="empty-activity">
                  <span>📭</span>
                  <h4>No Activity Yet</h4>
                  <p>Start trading to see your activity here</p>
                  <button
                    className="start-trading-btn"
                    onClick={() => navigate("trade")}
                  >
                    Start Trading <Icons.ArrowRight />
                  </button>
                </div>
              ) : (
                <div className="activity-list">
                  {userTrades.slice(0, 30).map((trade, i) => {
                    const isPending =
                      !trade.status || trade.status === "pending";
                    const isWin = trade.status === "settled_win";
                    const isLoss = trade.status === "settled_loss";
                    return (
                      <div key={trade.id || i} className="activity-item">
                        <div className={`activity-icon ${trade.type}`}>
                          <span style={{ fontSize: 22 }}>
                            {trade.type === "buy" ? "📈" : "📉"}
                          </span>
                        </div>
                        <div className="activity-details">
                          <div className="activity-title">
                            {trade.type === "buy" ? "Bought" : "Sold"}{" "}
                            {trade.coin}
                            <span
                              style={{
                                marginLeft: 8,
                                padding: "2px 8px",
                                borderRadius: 99,
                                fontSize: 10,
                                fontWeight: 700,
                                background: isPending
                                  ? "rgba(247,147,26,.15)"
                                  : isWin
                                    ? "rgba(16,185,129,.12)"
                                    : isLoss
                                      ? "rgba(239,68,68,.12)"
                                      : "rgba(136,150,179,.12)",
                                color: isPending
                                  ? "#f7931a"
                                  : isWin
                                    ? "#10b981"
                                    : isLoss
                                      ? "#ef4444"
                                      : "#8896b3",
                              }}
                            >
                              {isPending
                                ? "⏳ Pending"
                                : isWin
                                  ? "📈 Won"
                                  : isLoss
                                    ? "📉 Loss"
                                    : "⚖️ Settled"}
                            </span>
                          </div>
                          <div className="activity-time">
                            {new Date(trade.time).toLocaleString()}
                          </div>
                        </div>
                        <div className="activity-amount">
                          <div className="amount-value">
                            {trade.amount.toFixed(4)} {trade.coin}
                          </div>
                          <div className="amount-price">
                            @ {fmt(trade.price)}
                          </div>
                        </div>
                        <div className="activity-result">
                          <div
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontWeight: 700,
                            }}
                          >
                            {fmt(trade.total)}
                          </div>
                          {(isWin || isLoss) && trade.profitLossAmt !== 0 && (
                            <div
                              style={{
                                fontSize: 12,
                                color: isWin ? "#10b981" : "#ef4444",
                                fontFamily: "var(--font-mono)",
                              }}
                            >
                              {isWin ? "+" : ""}
                              {fmt(trade.profitLossAmt || 0)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── SETTINGS ──────────────────────────────────── */}
          {activeTab === "settings" && (
            <div className="profile-settings">
              <div className="settings-group">
                <h3>Preferences</h3>
                {[
                  { label: "Language", value: "English (US)" },
                  { label: "Currency Display", value: "USD ($)" },
                  { label: "Theme", value: "Dark" },
                ].map((s) => (
                  <div key={s.label} className="setting-item">
                    <div className="setting-info">
                      <span className="setting-label">{s.label}</span>
                      <span className="setting-value">{s.value}</span>
                    </div>
                    <button className="setting-btn">Change</button>
                  </div>
                ))}
              </div>

              <div className="settings-group">
                <h3>Notifications</h3>
                {[
                  {
                    label: "Price Alerts",
                    desc: "Receive alerts for price movements",
                    def: true,
                  },
                  {
                    label: "Trade Confirmations",
                    desc: "Get notified when trades execute",
                    def: true,
                  },
                  {
                    label: "Marketing Emails",
                    desc: "Receive promotions and updates",
                    def: false,
                  },
                ].map((s) => (
                  <div key={s.label} className="setting-item toggle-item">
                    <div className="setting-info">
                      <span className="setting-label">{s.label}</span>
                      <span className="setting-value">{s.desc}</span>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked={s.def} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                ))}
              </div>

              <div className="settings-group danger-zone">
                <h3>Danger Zone</h3>
                <div className="setting-item danger-item">
                  <div className="setting-info">
                    <span className="setting-label">Delete Account</span>
                    <span className="setting-value">
                      Permanently delete your account and all data
                    </span>
                  </div>
                  <button
                    className="danger-btn"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Icons.Trash /> Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── DELETE CONFIRM MODAL ──────────────────────────── */}
      {showDeleteConfirm && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Account?</h3>
            <p>
              This action cannot be undone. All your data will be permanently
              lost.
            </p>
            <div className="modal-actions">
              <button
                className="modal-cancel"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button className="modal-confirm" onClick={logout}>
                Yes, Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

