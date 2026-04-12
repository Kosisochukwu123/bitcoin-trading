import { useState } from "react";
import { useApp } from "../context/AppContext";
import "./Navbar.css";

export default function Navbar() {
  const { navigate, page, user, logout, notifs } = useApp();
  const [showNotif, setShowNotif] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Bottom navigation items (mobile tab bar)
  const bottomNavItems = [
    { id: "dashboard", label: "Home", icon: "🏠", activeIcon: "🏠" },
    { id: "market", label: "Markets", icon: "📊", activeIcon: "📊" },
    { id: "trade", label: "Trade", icon: "🔄", activeIcon: "🔄" },
    { id: "portfolio", label: "Portfolio", icon: "💼", activeIcon: "💼" },
    { id: "profile", label: "Profile", icon: "👤", activeIcon: "👤" },
  ];

  const go = (p) => {
    navigate(p);
    setShowMenu(false);
    setShowNotif(false);
  };

  return (
    <>
      {/* Desktop Navigation (hidden on mobile) */}
      <nav className="navbar-desktop">
        <div className="navbar-logo" onClick={() => go("dashboard")}>
          <div className="navbar-logo-icon">₿</div>
          <span className="navbar-wordmark">CryptoX</span>
        </div>

        <div className="navbar-nav">
          {[
            { id: "dashboard", label: "Dashboard" },
            { id: "market", label: "Markets" },
            { id: "trade", label: "Trade" },
            { id: "futures", label: "Futures" },
            { id: "earn", label: "Earn" },
            { id: "p2p", label: "P2P" },
            { id: "portfolio", label: "Portfolio" },
            { id: "wallet", label: "Wallet" },
            ...(user?.isAdmin ? [{ id: "admin", label: "⚡ Admin" }] : []),
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => go(item.id)}
              className={`nav-btn${page === item.id ? " active" : ""}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="navbar-actions">
          <div className="dropdown">
            <button
              className="icon-btn"
              onClick={() => setShowNotif(!showNotif)}
            >
              🔔
              {notifs.length > 0 && (
                <span className="notif-badge">
                  {Math.min(notifs.length, 9)}
                </span>
              )}
            </button>
            {showNotif && (
              <div className="notif-menu">
                <div
                  style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}
                >
                  Notifications
                </div>
                {notifs.length === 0 ? (
                  <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
                    No notifications yet
                  </div>
                ) : (
                  notifs.map((n) => (
                    <div key={n.id} className={`notif-item notif-${n.type}`}>
                      {n.msg}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="dropdown">
            <button
              className="user-menu-btn"
              onClick={() => setShowMenu(!showMenu)}
            >
              {user?.name?.split(" ")[0]} ▾
            </button>
            {showMenu && (
              <div className="dropdown-menu">
                <div
                  style={{
                    padding: "7px 12px",
                    fontSize: 12,
                    color: "var(--text-muted)",
                  }}
                >
                  {user?.email}
                </div>
                <div className="dropdown-divider" />
                {[
                  { label: "Dashboard", page: "dashboard" },
                  { label: "Portfolio", page: "portfolio" },
                  { label: "Wallet", page: "wallet" },
                  ...(user?.isAdmin
                    ? [{ label: "⚡ Admin Panel", page: "admin" }]
                    : []),
                ].map((item) => (
                  <button
                    key={item.page}
                    className="dropdown-item"
                    onClick={() => go(item.page)}
                  >
                    {item.label}
                  </button>
                ))}
                <div className="dropdown-divider" />
                <button className="dropdown-item danger" onClick={logout}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className="bottom-nav">
        {bottomNavItems.map((item) => (
          <button
            key={item.id}
            className={`bottom-nav-item ${page === item.id ? "active" : ""}`}
            onClick={() => go(item.id)}
          >
            <span className="bottom-nav-icon">
              {page === item.id ? item.activeIcon : item.icon}
            </span>
            <span className="bottom-nav-label">{item.label}</span>
            {item.id === "trade" && page !== "trade" && (
              <span className="trade-indicator">●</span>
            )}
          </button>
        ))}
      </div>
    </>
  );
}
