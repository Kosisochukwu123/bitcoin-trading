import { useApp } from "../context/AppContext";
import { Sparkline } from "../components/UI";
import Testimonials from "../components/Testimonials";
import "./HomePage.css";

// Modern SVG Icons as Components
const Icons = {
  Logo: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 6H23V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Shield: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  Chart: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 16V20H3V4H7V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 10L21 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M18 10H14V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Wallet: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 12V18H4V6H20V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 12H22V16H16V12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="19" cy="14" r="1" fill="currentColor"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Star: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Lightning: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Globe: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 12H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 2C14.5 4.5 16 8 16 12C16 16 14.5 19.5 12 22C9.5 19.5 8 16 8 12C8 8 9.5 4.5 12 2Z" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  Bell: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Lock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="16" r="1" fill="currentColor"/>
    </svg>
  ),
  Percent: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="6.5" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="17.5" cy="17.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 21V19C17 16.8 15.2 15 13 15H5C2.8 15 1 16.8 1 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M23 21V19C22.9 17 21.3 15.3 19 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M16 3.13C18.3 3.7 20 5.8 20 8.03" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

export default function HomePage() {
  const { navigate, coins } = useApp();

  const features = [
    {
      icon: <Icons.Chart />,
      title: "Spot Trading",
      desc: "Buy & sell at real-time prices with deep liquidity pools.",
      gradient: "var(--gradient-chart)"
    },
    {
      icon: <Icons.Lightning />,
      title: "Futures & Leverage",
      desc: "Trade derivatives with up to 125x leverage on top pairs.",
      gradient: "var(--gradient-lightning)"
    },
    {
      icon: <Icons.Users />,
      title: "P2P Trading",
      desc: "Direct user-to-user trades. Zero fees, any payment method.",
      gradient: "var(--gradient-p2p)"
    },
    {
      icon: <Icons.Wallet />,
      title: "Earn & Staking",
      desc: "Put your crypto to work. Earn up to 50% APY passively.",
      gradient: "var(--gradient-earn)"
    },
    {
      icon: <Icons.TrendingUp />,
      title: "Advanced Charts",
      desc: "Professional-grade charts with 100+ technical indicators.",
      gradient: "var(--gradient-charts)"
    },
    {
      icon: <Icons.Bell />,
      title: "Price Alerts",
      desc: "Set custom alerts and never miss a key price movement again.",
      gradient: "var(--gradient-alerts)"
    },
    {
      icon: <Icons.Shield />,
      title: "Secure Wallet",
      desc: "Cold storage multi-sig security with industry-leading protection.",
      gradient: "var(--gradient-security)"
    },
    {
      icon: <Icons.Globe />,
      title: "Portfolio Tracker",
      desc: "Real-time PnL, allocation breakdowns and full trade history.",
      gradient: "var(--gradient-tracker)"
    }
  ];

  return (
    <div className="home-container">
      {/* ── HEADER ── */}
      <header className="home-header">
        <div className="home-logo" onClick={() => navigate("home")}>
          <div className="home-logo-icon">
            <Icons.Logo />
          </div>
          <span className="home-wordmark">CryptoX</span>
        </div>
        <nav className="home-nav">
          {["Markets", "Trade", "Earn", "Learn"].map((item) => (
            <span key={item} className="home-nav-item">
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
            <Icons.ArrowRight />
          </button>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="home-hero-section">
        <div className="home-hero-glow" />
        <div className="home-hero-grid-bg" />

        <div className="home-hero-pill">
          <Icons.Star />
          <span>TRUSTED BY 500M+ USERS WORLDWIDE</span>
        </div>

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
            onClick={() => navigate("register")}
          >
            Get Started Free
            <Icons.ArrowRight />
          </button>
          <button
            className="home-btn home-btn-outline"
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
                  background: `${c.color}18`,
                  border: `1px solid ${c.color}35`,
                  color: c.color,
                }}
              >
                {c.icon}
              </div>
              <div className="home-ticker-info">
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
                  {c.change >= 0 ? <Icons.TrendingUp /> : <Icons.TrendingUp style={{ transform: "rotate(180deg)" }} />}
                  {c.change >= 0 ? "+" : ""}{c.change}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES SECTION ── */}
      <section className="home-features-section">
        <div className="home-features-header">
          <h2 className="home-features-title">Everything You Need to Trade</h2>
          <p className="home-features-subtitle">
            Powerful features from the world's best exchanges — all in one place.
          </p>
        </div>
        <div className="home-features-grid">
          {features.map(({ icon, title, desc, gradient }, idx) => (
            <div
              key={title}
              className="home-feature-card"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="home-feature-icon" style={{ color: `var(--${title.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')})` || "var(--gold)" }}>
                {icon}
              </div>
              <div className="home-feature-title">{title}</div>
              <div className="home-feature-desc">{desc}</div>
              <div className="home-feature-link">
                <span>Learn more</span>
                <Icons.ArrowRight />
              </div>
            </div>
          ))}
        </div>
      </section>

      <Testimonials/>

      {/* ── MARKET PREVIEW ── */}
      <section className="home-market-section">
        <div className="home-market-container">
          <div className="home-market-header">
            <h2 className="home-market-title">Live Market Prices</h2>
            <button
              className="home-btn home-btn-link"
              onClick={() => navigate("market")}
            >
              View All Markets
              <Icons.ArrowRight />
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
                      background: `${c.color}18`,
                      border: `1px solid ${c.color}35`,
                      color: c.color,
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
                  {c.change >= 0 ? <Icons.TrendingUp /> : <Icons.TrendingUp style={{ transform: "rotate(180deg)" }} />}
                  {c.change >= 0 ? "+" : ""}{c.change}%
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
                  <Icons.ArrowRight />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="home-cta-section">
        <div className="home-cta-card">
          <div className="home-cta-icon">
            <Icons.Lightning />
          </div>
          <h2 className="home-cta-title">Start Trading in Minutes</h2>
          <p className="home-cta-text">
            Join millions of traders. Sign up for a free demo account and get{" "}
            <strong>$10,000 USDT</strong> to practice with.
          </p>
          <button
            className="home-btn home-btn-primary"
            onClick={() => navigate("register")}
          >
            Create Free Account
            <Icons.ArrowRight />
          </button>
          <div className="home-cta-demo">
            Demo login: <code>user@demo.com</code> / <code>demo123</code>
          </div>
        </div>
      </section>

      

      {/* ── FOOTER ── */}
      <footer className="home-footer">
        <div className="home-footer-left">
          <div className="home-logo" onClick={() => navigate("home")}>
            <div className="home-logo-icon">
              <Icons.Logo />
            </div>
            <span className="home-wordmark">CryptoX</span>
          </div>
          <div className="home-copyright">
            © 2025 CryptoX. School project — demo purposes only.
          </div>
        </div>
        <div className="home-footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Support</a>
        </div>
      </footer>

    </div>
  );
}