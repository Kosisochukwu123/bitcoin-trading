# CryptoX Backend API

REST API backend for the CryptoX crypto trading school project.  
Built with **Node.js + Express**. Uses an in-memory store (no database install needed).

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
cp .env.example .env

# 3. Start development server (auto-restarts on save)
npm run dev

# 4. (Optional) Print seed / demo data info
npm run seed
```

Server runs at **http://localhost:5000**

---

## Demo Credentials

| Role  | Email              | Password   |
|-------|--------------------|------------|
| User  | user@demo.com      | demo123    |
| Admin | admin@demo.com     | admin123   |

---

## Project Structure

```
cryptox-backend/
├── src/
│   ├── server.js              # Entry point — starts HTTP server
│   ├── app.js                 # Express app (middleware + routes)
│   │
│   ├── config/
│   │   ├── app.js             # Env-based config values
│   │   └── database.js        # In-memory DB (users, trades, coins)
│   │
│   ├── models/
│   │   ├── User.js            # User CRUD + balance/portfolio ops
│   │   ├── Trade.js           # Trade CRUD + aggregations
│   │   └── Coin.js            # Coin prices + tick simulation
│   │
│   ├── services/
│   │   ├── authService.js     # Register / login / token rotation
│   │   ├── tradeService.js    # Trade execution + admin overrides
│   │   ├── adminService.js    # All admin operations
│   │   ├── portfolioService.js# Portfolio valuation + allocations
│   │   └── priceService.js    # Background price ticker
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── tradeController.js
│   │   ├── marketController.js
│   │   ├── portfolioController.js
│   │   └── adminController.js
│   │
│   ├── routes/
│   │   ├── index.js           # Mounts all sub-routers under /api
│   │   ├── auth.js
│   │   ├── trades.js
│   │   ├── market.js
│   │   ├── portfolio.js
│   │   └── admin.js
│   │
│   ├── middleware/
│   │   ├── auth.js            # authenticate + requireAdmin guards
│   │   ├── validate.js        # express-validator rule sets
│   │   ├── rateLimiter.js     # API / auth / trade rate limiters
│   │   └── errorHandler.js    # Global error + 404 handlers
│   │
│   ├── utils/
│   │   ├── jwt.js             # Sign / verify access + refresh tokens
│   │   ├── response.js        # Consistent JSON response helpers
│   │   ├── logger.js          # Simple console logger
│   │   └── seed.js            # Prints demo DB state (npm run seed)
│   │
│   └── api/
│       ├── client.js               # Frontend fetch client (copy to React)
│       └── AppContext.backend.jsx  # Backend-wired React context
│
├── .env.example
├── .gitignore
└── package.json
```

---

## Environment Variables

| Variable                 | Default                  | Description                       |
|--------------------------|--------------------------|-----------------------------------|
| `PORT`                   | `5000`                   | HTTP port                         |
| `NODE_ENV`               | `development`            | `development` / `production`      |
| `JWT_SECRET`             | *(required)*             | Access token signing secret       |
| `JWT_EXPIRES_IN`         | `7d`                     | Access token lifetime             |
| `JWT_REFRESH_SECRET`     | *(required)*             | Refresh token signing secret      |
| `JWT_REFRESH_EXPIRES_IN` | `30d`                    | Refresh token lifetime            |
| `CLIENT_URL`             | `http://localhost:5173`  | Allowed CORS origin               |
| `DEMO_STARTING_BALANCE`  | `10000`                  | USDT given to new accounts        |
| `TRADING_FEE_PERCENT`    | `0.001`                  | Fee per trade (0.1%)              |
| `PRICE_TICK_INTERVAL_MS` | `3000`                   | Price simulation interval         |

---

## API Reference

All responses follow this shape:
```json
{ "success": true, "message": "...", "data": { ... } }
{ "success": false, "message": "...", "errors": [...] }
```

### Authentication

| Method | Endpoint              | Auth     | Body                        | Description            |
|--------|-----------------------|----------|-----------------------------|------------------------|
| POST   | `/api/auth/register`  | None     | `name, email, password`     | Create account         |
| POST   | `/api/auth/login`     | None     | `email, password`           | Login, get tokens      |
| POST   | `/api/auth/refresh`   | None     | `refreshToken`              | Rotate tokens          |
| POST   | `/api/auth/logout`    | None     | `refreshToken`              | Invalidate token       |
| GET    | `/api/auth/me`        | Bearer   | —                           | Get current user       |

**Login response `data`:**
```json
{
  "accessToken":  "eyJ...",
  "refreshToken": "eyJ...",
  "user": { "id": "...", "name": "...", "email": "...", "balance": 10000, "portfolio": {} }
}
```

---

### Market (Public)

| Method | Endpoint                  | Auth  | Description                    |
|--------|---------------------------|-------|--------------------------------|
| GET    | `/api/market`             | None  | All coins with live prices     |
| GET    | `/api/market/snapshot`    | None  | Same — for polling clients     |
| GET    | `/api/market/:coinId`     | None  | Single coin (e.g. `/api/market/BTC`) |

---

### Trades (Private)

| Method | Endpoint          | Auth   | Body / Query                            | Description                  |
|--------|-------------------|--------|-----------------------------------------|------------------------------|
| POST   | `/api/trades`     | Bearer | `coinId, type, amount, orderType?, limitPrice?` | Execute buy or sell  |
| GET    | `/api/trades`     | Bearer | `?page=1&limit=20`                      | My trade history             |
| GET    | `/api/trades/:id` | Bearer | —                                       | Single trade                 |

**Trade body:**
```json
{
  "coinId":     "BTC",
  "type":       "buy",
  "amount":     0.5,
  "orderType":  "market",
  "limitPrice": null
}
```

---

### Portfolio (Private)

| Method | Endpoint          | Auth   | Description                                         |
|--------|-------------------|--------|-----------------------------------------------------|
| GET    | `/api/portfolio`  | Bearer | Holdings, valuations, allocations, trade stats      |

---

### Admin (Admin token required)

#### Stats & Overview
| Method | Endpoint              | Description                       |
|--------|-----------------------|-----------------------------------|
| GET    | `/api/admin/stats`    | Platform totals                   |
| GET    | `/api/admin/trades`   | All trades, paginated (`?page&limit`) |
| GET    | `/api/admin/overrides`| All active trade overrides        |

#### User Management
| Method | Endpoint                             | Body                            | Description               |
|--------|--------------------------------------|---------------------------------|---------------------------|
| GET    | `/api/admin/users`                   | —                               | All users with stats      |
| GET    | `/api/admin/users/:userId`           | —                               | Single user detail        |
| PATCH  | `/api/admin/users/:userId/balance`   | `{ amount, mode }`              | Fund / debit balance      |
| PATCH  | `/api/admin/users/:userId/portfolio` | `{ coinId, amount, mode }`      | Grant / remove crypto     |
| POST   | `/api/admin/users/:userId/reset`     | —                               | Reset account to default  |
| PATCH  | `/api/admin/users/:userId/ban`       | `{ banned: true\|false }`       | Ban or unban user         |
| PATCH  | `/api/admin/users/:userId/override`  | `{ override }`                  | Set trade outcome         |

**`mode`** values: `"add"` · `"subtract"` · `"set"`

**`override`** values: `"none"` · `"force_profit"` · `"force_loss"` · `"force_fail"`

#### Price Control
| Method | Endpoint                          | Body          | Description          |
|--------|-----------------------------------|---------------|----------------------|
| PATCH  | `/api/admin/coins/:coinId/price`  | `{ price }`   | Set coin price       |

---

## Connecting the React Frontend

### 1. Copy the API client
```bash
cp src/api/client.js  ../crypto-trading/src/api/client.js
```

### 2. Add the env variable to your React project
```bash
# crypto-trading/.env
VITE_API_URL=http://localhost:5000/api
```

### 3. Swap the AppContext
```bash
cp src/api/AppContext.backend.jsx  ../crypto-trading/src/context/AppContext.jsx
```

That's it — the React app now talks to the real API.

---

## Swapping the Database

The in-memory store resets on every server restart. To use a real database:

1. Install your ORM: `npm install mongoose` (MongoDB) or `npm install @prisma/client` (PostgreSQL/MySQL)
2. Replace the operations inside **`src/models/User.js`**, **`Trade.js`**, **`Coin.js`** with ORM calls
3. Update **`src/config/database.js`** with your connection string
4. Everything else (services, controllers, routes) stays exactly the same

---

## Rate Limits

| Limiter  | Window   | Max requests  |
|----------|----------|---------------|
| API      | 15 min   | 100           |
| Auth     | 15 min   | 10            |
| Trades   | 1 min    | 60            |

---

*School project — for educational purposes only.*
