import { useState } from "react";
import { useApp } from "../context/AppContext";
import "./Navbar.css";

export default function Navbar() {
  const { navigate, page, user, logout, notifs } = useApp();
  const [showNotif, setShowNotif] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Bottom navigation items (mobile tab bar)

  const Icons = {

    Profile: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="7"
          r="3.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M5 20C5 16.5 8.5 14.5 12 14.5C15.5 14.5 19 16.5 19 20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),

    Home: () => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Roof */}
        <path
          d="M3 10L12 3L21 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* House body */}
        <path
          d="M5 10V20H19V10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Door */}
        <path
          d="M10 20V14H14V20"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),

    Markets: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {/* Candle 1 */}
        <path
          d="M6 6V18"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <rect
          x="5"
          y="10"
          width="2"
          height="5"
          stroke="currentColor"
          strokeWidth="1.5"
        />

        {/* Candle 2 */}
        <path
          d="M12 4V14"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <rect
          x="11"
          y="6"
          width="2"
          height="6"
          stroke="currentColor"
          strokeWidth="1.5"
        />

        {/* Candle 3 */}
        <path
          d="M18 8V20"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <rect
          x="17"
          y="12"
          width="2"
          height="5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),

    Portfolio: () => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Wallet body */}
        <path
          d="M3 7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Wallet flap */}
        <path
          d="M3 9H21"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Balance dot */}
        <circle cx="17" cy="13" r="1.2" fill="currentColor" />
      </svg>
    ),

    Trading: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {/* Up trend */}
        <path
          d="M4 16L10 10L14 14L20 8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Down trend */}
        <path
          d="M4 8L10 14L14 10L20 16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  };


  const bottomNavItems = [
    {
      id: "dashboard",
      label: "Home",
      activeIcon: <Icons.Home />,
      icon: <Icons.Home />,
      color: "#6366f1",
      bgOpacity: "0.12",
    },

    {
      id: "market",
      label: "Markets",
      activeIcon: <Icons.Markets />,
      icon: <Icons.Markets />,
      color: "#10b981",
      bgOpacity: "0.12",
    },

    {
      id: "futures",
      label: "futures",
      activeIcon: <Icons.Trading />,
      icon: <Icons.Trading />,
      color: "#f59e0b",

      bgOpacity: "0.12",
    },
    {
      id: "wallet",
      label: "Wallet",
      activeIcon: <Icons.Portfolio />,
      icon: <Icons.Portfolio />,
      color: "#10b981",
      bgOpacity: "0.12",
    },

    {
      id: "profile",
      label: "Profile",
      activeIcon: <Icons.Profile />,
      icon: <Icons.Profile />,
      color: "#6366f1",
      bgOpacity: "0.12",
    },
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
            <span className="bottom-nav-icon" style={{ color: item.color }}>
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
