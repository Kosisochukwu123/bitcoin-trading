import { useApp } from "../context/AppContext";
import { Sparkline } from "../components/UI";
import "./HomePage.css";

export default function HomePage() {
  const { navigate, coins } = useApp();

  return (
    <div className="home-container">
      {/* ── HEADER ── */}
      <header className="home-header">
        <div className="home-logo" onClick={() => navigate("home")}>
          <div className="home-logo-icon">₿</div>
          <span className="home-wordmark">CryptoX</span>
        </div>
        <nav className="home-nav">
          {["Markets", "Trade", "Earn", "Learn"].map((item) => (
            <span
              key={item}
              className="home-nav-item"
              onMouseEnter={(e) => (e.target.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-secondary)")}
            >
              {item}
            </span>
          ))}
        </nav>
        <div className="home-auth-buttons">
          <button className="home-btn home-btn-ghost" onClick={() => navigate("login")}>
            Log In
          </button>
          <button className="home-btn home-btn-primary" onClick={() => navigate("register")}>
            Sign Up Free
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="home-hero-section">
        <div className="home-hero-glow" />
        <div className="home-hero-grid-bg" />

        <div className="home-hero-pill">🔥 TRUSTED BY 500M+ USERS WORLDWIDE</div>

        <h1 className="home-hero-title">
          The Smarter Way
          <br />
          to Trade <span className="home-hero-accent">Crypto</span>
        </h1>

        <p className="home-hero-subtitle">
          Buy, sell and grow your portfolio with 350+ cryptocurrencies.
          Professional tools, ultra-low fees, unbeatable security.
        </p>

        <div className="home-hero-actions">
          <button
            className="home-btn home-btn-primary"
            style={{ padding: "14px 36px", fontSize: 15 }}
            onClick={() => navigate("register")}
          >
            Get Started Free →
          </button>
          <button
            className="home-btn home-btn-ghost"
            style={{ padding: "14px 36px", fontSize: 15 }}
            onClick={() => navigate("market")}
          >
            View Markets
          </button>
        </div>

        <div className="home-hero-stats">
          {[
            ["$76B+", "Daily Volume"],
            ["350+", "Cryptocurrencies"],
            ["0.1%", "Trading Fee"],
            ["24/7", "Live Support"],
          ].map(([v, l]) => (
            <div key={l} className="home-stat-item">
              <div className="home-stat-value">{v}</div>
              <div className="home-stat-label">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVE TICKER ── */}
      <div className="home-ticker-strip">
        <div className="home-ticker-inner">
          {[...coins, ...coins].map((c, i) => (
            <div
              key={i}
              className="home-ticker-item"
              onClick={() => navigate("market")}
            >
              <div
                className="home-ticker-coin"
                style={{
                  width: 30,
                  height: 30,
                  background: `${c.color}18`,
                  border: `1px solid ${c.color}35`,
                  color: c.color,
                  fontSize: 13,
                }}
              >
                {c.icon}
              </div>
              <div>
                <div className="home-ticker-symbol">{c.id}</div>
                <div className="home-ticker-name">{c.name}</div>
              </div>
              <div className="home-ticker-price-info">
                <div className="home-ticker-price">
                  ${c.price.toLocaleString()}
                </div>
                <div
                  className="home-ticker-change"
                  style={{ color: c.change >= 0 ? "var(--green)" : "var(--red)" }}
                >
                  {c.change >= 0 ? "+" : ""}
                  {c.change}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="home-features-section">
        <div className="home-features-header">
          <h2 className="home-features-title">Everything You Need to Trade</h2>
          <p className="home-features-subtitle">
            8 powerful features copied from the world's best exchanges — all in
            one place.
          </p>
        </div>
        <div className="home-features-grid">
          {[
            {
              icon: "📊",
              title: "Spot Trading",
              desc: "Buy & sell at real-time prices with deep liquidity pools.",
              delay: 0,
            },
            {
              icon: "🔮",
              title: "Futures & Leverage",
              desc: "Trade derivatives with up to 125x leverage on top pairs.",
              delay: 50,
            },
            {
              icon: "🤝",
              title: "P2P Trading",
              desc: "Direct user-to-user trades. Zero fees, any payment method.",
              delay: 100,
            },
            {
              icon: "💰",
              title: "Earn & Staking",
              desc: "Put your crypto to work. Earn up to 50% APY passively.",
              delay: 150,
            },
            {
              icon: "📈",
              title: "Advanced Charts",
              desc: "Professional-grade charts with 100+ technical indicators.",
              delay: 200,
            },
            {
              icon: "🔔",
              title: "Price Alerts",
              desc: "Set custom alerts and never miss a key price movement again.",
              delay: 250,
            },
            {
              icon: "🛡️",
              title: "Secure Wallet",
              desc: "Cold storage multi-sig security with industry-leading protection.",
              delay: 300,
            },
            {
              icon: "🌐",
              title: "Portfolio Tracker",
              desc: "Real-time PnL, allocation breakdowns and full trade history.",
              delay: 350,
            },
          ].map(({ icon, title, desc, delay }) => (
            <div
              key={title}
              className="home-feature-card"
              style={{ animationDelay: `${delay}ms` }}
            >
              <div className="home-feature-icon">{icon}</div>
              <div className="home-feature-title">{title}</div>
              <div className="home-feature-desc">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MARKET PREVIEW ── */}
      <section className="home-market-section">
        <div className="home-market-container">
          <div className="home-market-header">
            <h2 className="home-market-title">Live Market Prices</h2>
            <button
              className="home-btn home-btn-ghost"
              style={{ fontSize: 13 }}
              onClick={() => navigate("market")}
            >
              View All Markets →
            </button>
          </div>
          <div className="home-market-table">
            {coins.slice(0, 5).map((c, i) => (
              <div
                key={c.id}
                className="home-market-row"
                onClick={() => navigate("trade")}
              >
                <span className="home-market-rank">
                  {i + 1}
                </span>
                
                <div className="home-market-coin-info">
                  <div
                    className="home-market-coin-icon"
                    style={{
                      width: 36,
                      height: 36,
                      background: `${c.color}18`,
                      border: `1px solid ${c.color}35`,
                      color: c.color,
                      fontSize: 15,
                    }}
                  >
                    {c.icon}
                  </div>
                  <div>
                    <div className="home-market-coin-name">{c.name}</div>
                    <div className="home-market-coin-symbol">{c.id}</div>
                  </div>
                </div>
                
                <span className="home-market-price">
                  ${c.price.toLocaleString()}
                </span>
                
                <span
                  className="home-market-change"
                  style={{ color: c.change >= 0 ? "var(--green)" : "var(--red)" }}
                >
                  {c.change >= 0 ? "+" : ""}
                  {c.change}%
                </span>
                
                <div className="home-market-sparkline">
                  <Sparkline
                    positive={c.change >= 0}
                    color={c.change >= 0 ? "var(--green)" : "var(--red)"}
                  />
                </div>
                
                <button
                  className="home-market-trade-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("trade");
                  }}
                >
                  Trade
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="home-cta-section">
        <div className="home-cta-card">
          <div className="home-cta-icon">🚀</div>
          <h2 className="home-cta-title">Start Trading in Minutes</h2>
          <p className="home-cta-text">
            Join millions of traders. Sign up for a free demo account and get{" "}
            <strong>$10,000 USDT</strong> to practice with.
          </p>
          <button
            className="home-btn home-btn-primary"
            style={{ padding: "15px 44px", fontSize: 15 }}
            onClick={() => navigate("register")}
          >
            Create Free Account →
          </button>
          <div className="home-cta-demo">
            Demo login: <code>user@demo.com</code> / <code>demo123</code>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="home-footer">
        <div className="home-logo">
          <div
            className="home-logo-icon"
            style={{ width: 26, height: 26, fontSize: 13 }}
          >
            ₿
          </div>
          <span className="home-wordmark" style={{ fontSize: 15 }}>
            CryptoX
          </span>
        </div>
        <div className="home-copyright">
          © 2025 CryptoX. School project — demo purposes only.
        </div>
      </footer>
    </div>
  );
}