# 💰 FinTrack — Personal Finance Tracker

A full-stack, production-ready personal finance dashboard built with **React**, **Node.js**, **Express**, and **MongoDB**.

---

## 📸 Features

| Feature | Details |
|---|---|
| **Authentication** | JWT signup/login, bcrypt hashing, protected routes |
| **Dashboard** | Balance, income, expense KPI cards + area chart + donut pie |
| **Transactions** | Full CRUD — add, edit, delete. Search + filter by type/category/month |
| **Analytics** | Area & bar chart switcher, category pie, top spenders with progress bars |
| **Settings** | Profile editing, dark/light mode, notification toggles, CSV export |
| **Dark / Light Mode** | Full CSS-variable-based theme system |
| **Toasts** | Contextual success/error/info notifications |
| **Skeleton Loaders** | Loading states on all data-fetching components |
| **Responsive** | Mobile-friendly sidebar + fluid grid |

---

## 🗂️ Folder Structure

```
fintrack/
├── package.json              ← Root workspace (concurrently)
├── .gitignore
│
├── frontend/
│   ├── package.json
│   ├── .env.example
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js               ← React entry point
│       ├── App.jsx                ← Root with all providers
│       ├── styles/
│       │   └── global.css         ← Full design system (CSS variables, components)
│       ├── constants/
│       │   └── categories.js      ← Categories, months, getCategoryMeta()
│       ├── utils/
│       │   ├── formatters.js      ← fmt(), fmtDate(), pctChange(), abbr()
│       │   └── mockData.js        ← Realistic seed data generator (demo mode)
│       ├── services/
│       │   └── api.js             ← Axios instance + all API functions
│       ├── hooks/
│       │   └── useApi.js          ← Generic async hook with loading/error state
│       ├── contexts/
│       │   ├── ThemeContext.jsx   ← Dark/light mode
│       │   ├── ToastContext.jsx   ← Global toast notifications
│       │   ├── AuthContext.jsx    ← JWT auth state + login/signup/logout
│       │   └── DataContext.jsx    ← Transaction state + analytics helpers
│       ├── components/
│       │   ├── StatCard.jsx       ← KPI metric card
│       │   ├── TxnRow.jsx         ← Single transaction row (hover actions)
│       │   ├── TransactionModal.jsx  ← Add/Edit modal with category grid
│       │   ├── layout/
│       │   │   ├── Sidebar.jsx    ← Fixed left navigation
│       │   │   └── Topbar.jsx     ← Sticky header with actions
│       │   └── ui/
│       │       ├── Skeleton.jsx   ← Loading placeholders
│       │       ├── EmptyState.jsx ← Zero-data placeholder
│       │       └── ChartTooltip.jsx ← Recharts custom tooltip
│       └── pages/
│           ├── AuthPage.jsx       ← Login + Signup + Demo
│           ├── Dashboard.jsx      ← Overview with charts + recent txns
│           ├── Transactions.jsx   ← Full list with filters + CRUD
│           ├── Analytics.jsx      ← Charts + category breakdown
│           └── Settings.jsx       ← Profile, security, export
│
└── backend/
    ├── package.json
    ├── .env.example
    ├── .gitignore
    ├── server.js                  ← Express app + middleware + graceful shutdown
    ├── config/
    │   └── db.js                  ← Mongoose connect with retry
    ├── models/
    │   ├── User.js                ← Schema + bcrypt hooks + toPublic()
    │   └── Transaction.js         ← Schema + compound indexes + CATEGORIES
    ├── middleware/
    │   ├── auth.js                ← JWT protect middleware
    │   ├── errorHandler.js        ← Global error handler (JSON always)
    │   └── validate.js            ← express-validator result middleware
    ├── utils/
    │   └── jwt.js                 ← signToken() + sendToken()
    ├── routes/
    │   ├── auth.js                ← signup, login, /me, profile, password
    │   ├── transactions.js        ← Full CRUD + pagination + search + bulk delete
    │   └── analytics.js           ← summary, monthly, categories, trends, compare
    └── scripts/
        └── seed.js                ← MongoDB seeder (6 months of realistic data)
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18 or later
- **MongoDB** (local) or [MongoDB Atlas](https://cloud.mongodb.com) (free tier)

---

### 1 — Install dependencies

```bash
# From the project root
npm install          # installs concurrently
npm run install:all  # installs backend + frontend dependencies
```

Or manually:

```bash
cd backend  && npm install
cd ../frontend && npm install
```

---

### 2 — Configure environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/fintrack
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

For **MongoDB Atlas**, replace `MONGO_URI` with your connection string:
```
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/fintrack
```

---

### 3 — Seed the database (optional)

```bash
cd backend
npm run seed
```

This creates a demo user and ~150 transactions across 6 months:
- **Email:** demo@fintrack.app
- **Password:** demo123456

---

### 4 — Run (both servers together)

```bash
# From project root
npm run dev
```

Or separately:

```bash
# Terminal 1
cd backend && npm run dev      # → http://localhost:5000

# Terminal 2
cd frontend && npm start       # → http://localhost:3000
```

---

### 5 — Demo Mode (no backend needed)

The app ships with a **demo mode** — click **"Try Demo Account"** on the login page. This uses in-memory mock data with no API calls required.

---

## 🔌 API Reference

### Auth

| Method | Endpoint | Body | Auth |
|--------|----------|------|------|
| `POST` | `/api/auth/signup`  | `name, email, password` | ❌ |
| `POST` | `/api/auth/login`   | `email, password`       | ❌ |
| `GET`  | `/api/auth/me`      | —                       | ✅ |
| `PUT`  | `/api/auth/profile` | `name?, currency?, theme?` | ✅ |
| `PUT`  | `/api/auth/password`| `currentPassword, newPassword` | ✅ |

### Transactions

| Method   | Endpoint                  | Description |
|----------|---------------------------|-------------|
| `GET`    | `/api/transactions`       | List with filters + pagination |
| `POST`   | `/api/transactions`       | Create transaction |
| `GET`    | `/api/transactions/:id`   | Get single |
| `PUT`    | `/api/transactions/:id`   | Full update |
| `PATCH`  | `/api/transactions/:id`   | Partial update |
| `DELETE` | `/api/transactions/:id`   | Delete one |
| `DELETE` | `/api/transactions`       | Bulk delete (body: `{ ids: [] }`) |

**Query params for GET list:**
```
?type=income|expense
&category=Food+%26+Dining
&month=3&year=2025
&search=netflix
&page=1&limit=20
&sortBy=date|amount|category
&sortOrder=asc|desc
```

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/analytics/summary`    | YTD totals + savings rate |
| `GET`  | `/api/analytics/monthly`    | 12-month income/expense/net |
| `GET`  | `/api/analytics/categories` | Category breakdown with % |
| `GET`  | `/api/analytics/trends`     | Daily running balance |
| `GET`  | `/api/analytics/compare`    | MoM comparison + pct change |

---

## 🗄️ Database Schema

### User
```js
{
  name:       String,     // required, 2–60 chars
  email:      String,     // unique, lowercase
  password:   String,     // bcrypt hashed, select: false
  currency:   String,     // USD | EUR | GBP | INR | JPY | CAD | AUD
  theme:      String,     // dark | light
  isVerified: Boolean,
  createdAt:  Date,
  updatedAt:  Date
}
```

### Transaction
```js
{
  userId:   ObjectId,   // ref: User
  amount:   Number,     // > 0
  type:     String,     // income | expense
  category: String,     // one of 13 categories
  date:     Date,
  note:     String,     // max 200 chars
  createdAt: Date,
  updatedAt: Date
}
```

**Categories:**
`Food & Dining` · `Shopping` · `Travel` · `Bills & Utilities` · `Entertainment` · `Healthcare` · `Education` · `Transport` · `Salary` · `Freelance` · `Investment` · `Gift` · `Other`

---

## 🔐 Authentication Flow

```
Client                          Server
  │                               │
  ├─POST /api/auth/login─────────►│  validate credentials
  │◄──{ token, user }─────────────┤  sign JWT (7d expiry)
  │                               │
  ├─GET /api/transactions─────────►│  Authorization: Bearer <token>
  │  (with Authorization header)  │  verify JWT → attach req.user
  │◄──{ data: [...] }─────────────┤
```

Store the token in `localStorage` (already handled by `AuthContext`).

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Functional Components, Context API, Hooks |
| **Charts** | Recharts (AreaChart, BarChart, PieChart) |
| **Icons** | Lucide React |
| **HTTP Client** | Axios |
| **Backend** | Node.js, Express 4 |
| **Database** | MongoDB, Mongoose 8 |
| **Auth** | JWT (jsonwebtoken), bcryptjs |
| **Security** | Helmet, CORS, express-rate-limit |
| **Validation** | express-validator |
| **Styling** | Custom CSS with CSS variables (no framework) |
| **Fonts** | Sora (UI), JetBrains Mono (numbers) |

---

## 🚢 Deployment

### Backend (Railway / Render / Fly.io)
1. Set all `.env` variables in your hosting dashboard
2. Set `NODE_ENV=production`
3. Point `MONGO_URI` to your Atlas cluster
4. Deploy — the server auto-starts with `node server.js`

### Frontend (Vercel / Netlify)
1. Set `REACT_APP_API_URL=https://your-api-domain.com/api`
2. Build: `npm run build`
3. Deploy the `frontend/build` folder

---

## 📄 License

MIT
