# Velora — Project Memory

> Auto-generated context file for CLI continuity. Last updated: 2026-08-01

## Project Overview

**Velora** is a premium e-commerce platform for tech accessories and gadgets (mobile phones, earbuds, chargers, smart watches, etc.) built for the Pakistani market. Orders are placed via WhatsApp (no payment gateway).

- **Stack**: React 19 + TypeScript + Tailwind CSS (frontend), Express.js + MongoDB (backend)
- **Auth**: Clerk (development mode)
- **Storage**: Cloudinary (images), MongoDB Atlas (database)
- **WhatsApp**: Click-to-chat order flow (`wa.me` URL scheme)

---

## Architecture

```
frontend/                    backend/
├── src/                     ├── src/
│   ├── components/          │   ├── config/        (db.js, cloudinary.js)
│   │   ├── layout/          │   ├── middleware/     (auth.js, upload.js, errorHandler.js)
│   │   │   ├── Header.tsx   │   ├── models/        (Mongoose schemas)
│   │   │   ├── Footer.tsx   │   ├── routes/        (Express routers)
│   │   │   └── MainLayout   │   └── seeds/         (seed.js)
│   │   └── ui/              ├── .env              (secrets — DO NOT COMMIT)
│   ├── contexts/            └── package.json
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   ├── WishlistContext.tsx
│   │   ├── RecentlyViewedContext.tsx
│   │   └── ThemeContext.tsx
│   ├── pages/
│   │   ├── home/HomePage.tsx
│   │   ├── shop/ShopPage.tsx
│   │   ├── product/ProductDetailPage.tsx
│   │   ├── cart/CartPage.tsx
│   │   ├── checkout/CheckoutPage.tsx
│   │   ├── admin/AdminManagement.tsx
│   │   └── user/UserPages.tsx
│   ├── services/api.ts
│   ├── utils/
│   │   ├── index.ts         (formatPrice, generateWhatsAppMessage)
│   │   ├── session.ts       (cookie/session management)
│   │   └── notifications.ts (enhanced toast system)
│   └── types/index.ts
├── tailwind.config.js
└── package.json
```

---

## Key Implementation Details

### Authentication Flow

1. **Clerk** handles login/signup (development mode keys in `.env`)
2. **AuthContext** wraps Clerk's `useAuth` + `useUser`, syncs with backend via `x-clerk-id` header
3. **Guest mode** — localStorage `guestId` for non-authenticated users
4. **Admin role** — checked via `clerkUser.publicMetadata.role === 'admin'`
5. **Backend middleware** (`auth.js`) reads `x-clerk-id` or `x-guest-id` headers

### State Persistence (Guest → Login Merge)

| State | Storage Key | Merge on Login |
|-------|-------------|----------------|
| Cart | `velora_cart` | Persists as-is (localStorage) |
| Wishlist | `velora_wishlist` | Merges with backend (no duplicates) |
| Recently Viewed | `velora_recently_viewed` | localStorage only (12 items max) |
| Search History | `velora_search_history` | localStorage (10 items) |
| Session ID | `velora_session_id` | 30-day expiry |
| Visitor ID | `velora_visitor_id` | 365-day expiry |

### API Layer (`services/api.ts`)

- **Request interceptor**: attaches `x-session-id`, `x-visitor-id`, `x-guest-id`, `Authorization: Bearer <clerk-token>`
- **Response interceptor**: handles all HTTP status codes with distinct user-facing messages
- **Status code mapping**: 400 (warning), 401 (session expired), 403 (access denied), 404 (not found), 422 (validation), 429 (rate limit), 500+ (server error)
- **Network errors**: "Network Error", "Connection Timeout" notifications

### Notification System (`utils/notifications.ts`)

4 distinct toast types with custom styling:
- **Success** (green) — ✓ icon, 3.5s duration
- **Error** (red) — ✕ icon, 6s duration
- **Warning** (amber) — ⚠ icon, 5s duration
- **Info** (blue) — ℹ icon, 3.5s duration

All support `description`, `action` button, dark mode adaptation.

### Session Management (`utils/session.ts`)

- `session.set(key, value, days)` — stores with expiry in localStorage + cookie
- `session.get<T>(key)` — retrieves and validates expiry
- `session.getSessionId()` — unique session fingerprint
- `session.trackPageView(path)` — last 20 page visits
- `session.trackSearch(query)` — search history
- `session.trackAddToCart(productId)` — cart events
- `session.getCookieConsent()` — GDPR consent state

---

## Provider Hierarchy (App.tsx)

```
HelmetProvider
└── QueryClientProvider
    └── ThemeProvider
        └── ClerkProvider
            └── AuthProvider
                └── CartProvider
                    └── WishlistProvider
                        └── RecentlyViewedProvider
                            └── BrowserRouter
                                └── PageTracker
                                └── AppRoutes (ErrorBoundary wrapped)
                                └── CookieConsent
                                └── Toaster
```

---

## Route Structure

| Path | Component | Auth Required |
|------|-----------|---------------|
| `/` | HomePage | No |
| `/shop` | ShopPage | No |
| `/product/:slug` | ProductDetailPage | No |
| `/cart` | CartPage | No |
| `/checkout` | CheckoutPage | Clerk sign-in |
| `/user/profile` | UserProfile | Clerk sign-in |
| `/user/orders` | UserOrders | Clerk sign-in |
| `/user/wishlist` | UserWishlist | Clerk sign-in |
| `/user/addresses` | UserAddresses | Clerk sign-in |
| `/admin` | AdminDashboard | Clerk + admin role |
| `/admin/*` | Admin management pages | Clerk + admin role |
| `*` | NotFoundPage (404) | No |

---

## Environment Variables

### Backend (`backend/.env`)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...@velora.z3izcfg.mongodb.net/techhive?retryWrites=true&w=majority
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLOUDINARY_CLOUD_NAME=zx4dkcqx
CLOUDINARY_API_KEY=764413747654299
CLOUDINARY_API_SECRET=Mwa_DGcy-...
WHATSAPP_BUSINESS_NUMBER=923070528980
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env`)
```
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_...
REACT_APP_WHATSAPP_NUMBER=923070528980
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Design System

### Colors (tailwind.config.js)
- **Primary**: Blue shades (#5c7cfa → #364fc7)
- **Surface**: Gray shades (#f8f9fa → #0d1117)

### Key UI Patterns
- **Header**: Fixed, glass effect on scroll, Velora gradient logo
- **Product Cards**: Rounded-2xl, hover shadow, wishlist heart, add-to-cart button
- **Hero**: Blue-to-indigo gradient, floating stat cards, animated bounce
- **Modals**: Rounded-2xl, backdrop blur
- **Buttons**: Rounded-xl, primary (blue), secondary (gray), outline, ghost

### Animations
- `animate-fade-in`, `animate-slide-up`, `animate-slide-down`
- `animate-scale-in`, `animate-pulse-soft`
- `animate-slide-up` (CSS keyframe for cookie consent)
- Framer Motion for page transitions

---

## Backend API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/guest` | Create guest user |
| POST | `/api/clerk-webhook` | Clerk user sync |
| GET | `/api/products` | List products (with filters) |
| GET | `/api/products/:slug` | Product detail + related |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create category (admin) |
| GET | `/api/brands` | List brands |
| POST | `/api/orders` | Create order |
| PUT | `/api/orders/:id/status` | Update order status (admin) |
| POST | `/api/coupons/validate/:code` | Validate coupon |
| POST | `/api/reviews` | Create review |
| POST | `/api/users/wishlist/:productId` | Toggle wishlist |
| GET | `/api/users/wishlist` | Get wishlist |
| POST | `/api/upload` | Upload images to Cloudinary |

---

## Cloudinary Folders

- `velora/` — default uploads
- `velora/products/` — product images
- `velora/products/thumbs/` — product thumbnails

---

## Known Issues / Notes

- Clerk frontend integration is functional but `@clerk/clerk-react` was already in package.json
- MongoDB Atlas cluster name is `velora` (mismatch with DB name `techhive` in connection string — may need `techhive` changed to `velora` in MongoDB Atlas)
- WhatsApp order flow uses `wa.me` URL scheme (no Business API needed)
- TypeScript 4.9.5 — zod v4 types have compatibility warnings (pre-existing, not blocking)
- No payment gateway — orders confirmed via WhatsApp chat
- Backend uses `x-clerk-id` header for auth (not JWT verification)

---

## .gitignore Coverage

| Location | Key Ignores |
|----------|-------------|
| Root | `node_modules/`, `.env*`, `build/`, `dist/`, `.DS_Store`, editor files |
| Frontend | Above + `.eslintcache`, `.vercel/`, `*.tsbuildinfo` |
| Backend | Above + `uploads/`, `temp/`, `seeds/*.bak` |

**Never committed**: `.env`, `.env.local`, secrets, credentials, service account files

### Deployment Platforms

- **GitHub**: `.gitignore` handles all exclusions
- **Vercel**: Ignores `node_modules/`, `.env*`, uses `build/` output
- **Render**: Ignores `node_modules/`, `.env*`, uses `npm start` or `npm run dev`

### .env.example Files

Both `backend/.env.example` and `frontend/.env.example` exist with placeholder values so other developers know what's needed without exposing actual secrets.

---

## File Change Log

| File | Changes |
|------|---------|
| `App.tsx` | ClerkProvider, ErrorBoundary, PageTracker, CookieConsent, provider hierarchy |
| `AuthContext.tsx` | Clerk integration with useAuth/useUser |
| `CartContext.tsx` | localStorage persistence, notify system |
| `WishlistContext.tsx` | **NEW** — Guest + backend persistence with merge |
| `RecentlyViewedContext.tsx` | **NEW** — Last 12 products in localStorage |
| `Header.tsx` | Velora branding, Clerk sign-in, dark/light mode |
| `Footer.tsx` | Velora branding |
| `HomePage.tsx` | Hero fix (blue gradient), Recently Viewed section, Velora branding |
| `ProductDetailPage.tsx` | Recently viewed tracking, wishlist button |
| `ProductCard.tsx` | Wishlist heart button |
| `CheckoutPage.tsx` | notify system, enhanced error/success messages |
| `UserPages.tsx` | notify system |
| `AdminManagement.tsx` | notify system |
| `AdminProducts.tsx` | notify system |
| `api.ts` | Session headers, full status code handling, Clerk token |
| `utils/session.ts` | **NEW** — Session/cookie management |
| `utils/notifications.ts` | **NEW** — Enhanced toast system |
| `ErrorBoundary.tsx` | **NEW** — Runtime error catching |
| `CookieConsent.tsx` | **NEW** — GDPR cookie banner |
| `index.css` | Slide-up animation, toast animations |
| `tailwind.config.js` | Added `h-18` spacing |
| `public/index.html` | Velora SEO, meta tags |
| `backend/.env` | All API keys configured |
| `frontend/.env` | Clerk + WhatsApp + API URL |
| `backend/.env.example` | **NEW** — Template for backend env vars |
| `frontend/.env.example` | **NEW** — Template for frontend env vars |
| `.gitignore` (root) | **UPDATED** — Comprehensive ignores for GitHub/Vercel/Render |
| `frontend/.gitignore` | **UPDATED** — Added Vercel, ESLint, TypeScript ignores |
| `backend/.gitignore` | **UPDATED** — Added uploads, temp, seeds backup ignores |
