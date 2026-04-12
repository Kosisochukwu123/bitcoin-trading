# CryptoX — Full Crypto Trading Platform (School Project)

## 🚀 Setup & Run

```bash
npm install
npm run dev
```
Then open http://localhost:5173

---

## 🔑 Demo Login Credentials

| Role  | Email              | Password   |
|-------|--------------------|------------|
| User  | user@demo.com      | demo123    |
| Admin | admin@demo.com     | admin123   |

New users get **$10,000 USDT** demo balance on signup.

---

## 📱 8 Features (Copied from Binance)

| #  | Feature           | Page         | Description |
|----|-------------------|--------------|-------------|
| 1  | Spot Trading      | /trade       | Buy/Sell at market, limit, stop-limit |
| 2  | Futures Trading   | /futures     | Leveraged trading up to 125x |
| 3  | P2P Trading       | /p2p         | User-to-user direct trades |
| 4  | Earn / Staking    | /earn        | APY products (3.5% – 50%) |
| 5  | Order Book        | /trade       | Live bid/ask depth display |
| 6  | Wallet            | /wallet      | Deposit, withdraw, asset overview |
| 7  | Portfolio Tracker | /portfolio   | PnL, allocation chart, trade history |
| 8  | Market Overview   | /market      | All coins, 24h data, mini charts |

---

## ⚡ Admin Control System

Login as **admin@demo.com** to access the Admin Panel.

### User Trade Override
For each user you can set:
- **Normal** — standard simulated market outcome
- **Force Profit** — user's buy amounts are multiplied (gains extra coins, pays less)
- **Force Loss** — user receives fewer coins or lower sell proceeds
- **Block Trades** — all trades return "Insufficient liquidity" error

### Price Control
Manually adjust any coin's price using:
- Direct input (type a number → Update)
- Quick buttons: -10%, -5%, +5%, +10%

Changes apply **instantly** to all users' portfolio values.

### Trade History
View every trade made on the platform with user, type, coin, amount, and result tag.

---

## 🗂 Project Structure

```
src/
├── main.jsx                  # Entry point
├── App.jsx                   # Root component + routing
├── context/
│   └── AppContext.jsx         # Global state (users, trades, coins, overrides)
├── components/
│   └── Navbar.jsx             # Top navigation bar
└── pages/
    ├── HomePage.jsx           # Landing page
    ├── LoginPage.jsx          # Login + Register
    ├── RegisterPage.jsx       # Re-exports RegisterPage
    ├── Dashboard.jsx          # User dashboard
    ├── TradePage.jsx          # Spot trading + order book
    ├── MarketPage.jsx         # Market overview table
    ├── PortfolioPage.jsx      # Holdings + trade history
    ├── WalletPage.jsx         # Wallet + Futures + P2P + Earn
    ├── FuturesPage.jsx        # Re-exports FuturesPage
    ├── P2PPage.jsx            # Re-exports P2PPage
    ├── EarnPage.jsx           # Re-exports EarnPage
    └── AdminPage.jsx          # Admin control panel
```

---

## 🛠 Tech Stack
- **React 18** (hooks, context API)
- **Vite** (dev server + bundler)
- No external UI library — pure inline styles
- No backend — all state in React context (in-memory)

---

*Built for school project — dynamic website building practice.*
