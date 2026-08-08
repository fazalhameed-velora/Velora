# Velora — Project Memory

> Auto-generated context file for CLI continuity. Last updated: 2026-08-02

## Project Overview

**Velora** is a premium e-commerce platform for tech accessories and gadgets (mobile phones, earbuds, chargers, smart watches, etc.) built for the Pakistani market. Orders are placed via WhatsApp (no payment gateway).

- **Stack**: React 19 + TypeScript + Tailwind CSS (frontend), Express.js + MongoDB (backend)
- **Build Tool**: Vite 6.4.3 (migrated from CRA/react-scripts)
- **Auth**: Clerk (development mode)
- **Storage**: Cloudinary (images), MongoDB Atlas (database)
- **WhatsApp**: Click-to-chat order flow (`wa.me` URL scheme)

---

## Architecture

```
frontend/                    backend/
├── index.html               ├── src/
├── vite.config.ts           │   ├── config/        (db.js, cloudinary.js)
├── postcss.config.cjs       │   ├── controllers/   (userController.js)
├── tailwind.config.cjs      │   ├── middleware/     (auth.js, upload.js, errorHandler.js)
├── src/                     │   ├── models/        (Mongoose schemas)
│   ├── main.tsx             │   ├── routes/        (Express routers)
│   ├── App.tsx              │   └── seeds/         (seed.js)
│   ├── vite-env.d.ts        ├── .env              (secrets — DO NOT COMMIT)
│   ├── components/          └── package.json
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   └── AdminLayout.tsx
│   │   └── ui/
│   ├── contexts/
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
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminProducts.tsx
│   │   │   └── AdminManagement.tsx (Categories, Brands, Orders, Coupons, Banners, Users, Analytics)
│   │   └── user/UserPages.tsx
│   ├── services/api.ts
│   ├── utils/
│   │   ├── index.ts         (formatPrice, generateWhatsAppMessage)
│   │   ├── session.ts       (cookie/session management)
│   │   └── notifications.ts (enhanced toast system)
│   └── types/index.ts
└── package.json
```

---

## Key Implementation Details

### Build Tool — Vite 6.4.3

- **Config**: `vite.config.ts` — React plugin, port 3000, output to `dist/`
- **Entry**: `index.html` at project root (not `public/`), loads `/src/main.tsx`
- **Env vars**: Use `import.meta.env.VITE_*` (NOT `process.env.REACT_APP_*`)
- **Type declarations**: `src/vite-env.d.ts` defines `ImportMetaEnv`
- **PostCSS/Tailwind**: Config files use `.cjs` extension (ESM compat)
- **Scripts**: `npm run dev` (dev), `npm run build` (tsc + vite build)
- **No `require()`** — Vite is ESM-only, use `import` everywhere

### Authentication Flow

1. **Clerk** handles login/signup (development mode keys in `.env`)
2. **AuthContext** wraps Clerk's `useAuth` + `useUser`, syncs with backend via `x-clerk-id` header
3. **Guest mode** — localStorage `guestId` for non-authenticated users
4. **Admin role** — checked via `clerkUser.publicMetadata.role === 'admin'` AND `user.role === 'admin'` from MongoDB
5. **Backend middleware** (`auth.js`) reads `x-clerk-id` or `x-guest-id` headers
6. **Admin guard** — `AdminGuard` component in `App.tsx` uses both `useAuth()` and `useUser()` from Clerk

### Admin Account

- **Email**: `faizhameed521@gmail.com`
- **Password**: `Fazalhameed1st.,`
- **Clerk ID**: `user_3HKIAAsBSwYW1XuSfRuzSqyWRs3`
- **MongoDB**: Role set to `admin` in both Clerk `public_metadata` and MongoDB `users` collection
- Created via Clerk Backend API + direct MongoDB update

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
| `/admin/products` | AdminProducts | Clerk + admin role |
| `/admin/categories` | AdminCategories | Clerk + admin role |
| `/admin/brands` | AdminBrands | Clerk + admin role |
| `/admin/orders` | AdminOrders | Clerk + admin role |
| `/admin/banners` | AdminBanners | Clerk + admin role |
| `/admin/coupons` | AdminCoupons | Clerk + admin role |
| `/admin/users` | AdminUsers | Clerk + admin role |
| `/admin/analytics` | AdminAnalytics | Clerk + admin role |
| `*` | NotFoundPage (404) | No |

---

## Environment Variables

### Backend (`backend/.env`)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://faizhameed521_db_user:ZkBHbTQC8IWmt6ot@velora.z3izcfg.mongodb.net/techhive?retryWrites=true&w=majority
CLERK_SECRET_KEY=sk_test_SFFg3fIAbpNCfNaZtWyDBn3NZJLuZAHYGkOleozTyP
CLERK_PUBLISHABLE_KEY=pk_test_aW5zcGlyZWQtZHJhZ29uLTM1LmNsZXJrLmFjY291bnRzLmRldiQ
CLOUDINARY_CLOUD_NAME=zx4dkcqx
CLOUDINARY_API_KEY=764413747654299
CLOUDINARY_API_SECRET=Mwa_DGcy-bZLRrLYz_BiABArCXc
WHATSAPP_BUSINESS_NUMBER=923070528980
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_aW5zcGlyZWQtZHJhZ29uLTM1LmNsZXJrLmFjY291bnRzLmRldiQ
VITE_WHATSAPP_NUMBER=923070528980
```

**IMPORTANT**: Vite uses `VITE_` prefix, NOT `REACT_APP_`. Access via `import.meta.env.VITE_*`.

---

## Design System

### Colors (tailwind.config.cjs)
- **Primary**: Blue shades (#5c7cfa → #364fc7)
- **Surface**: Gray shades (#f8f9fa → #0d1117)

### Key UI Patterns
- **Header**: Fixed, glass effect on scroll, Velora gradient logo, Clerk sign-in button
- **Product Cards**: Rounded-2xl, hover shadow, wishlist heart, add-to-cart button
- **Hero**: Blue-to-indigo gradient, floating stat cards, animated bounce
- **Modals**: Rounded-2xl, backdrop blur
- **Buttons**: Rounded-xl, primary (blue), secondary (gray), outline, ghost, danger (red)

### Animations
- `animate-fade-in`, `animate-slide-up`, `animate-slide-down`
- `animate-scale-in`, `animate-pulse-soft`
- `animate-slide-up` (CSS keyframe for cookie consent)
- Framer Motion for page transitions

---

## Admin Panel Features

### Admin Dashboard (`AdminDashboard.tsx`)
- Gradient icon stat cards with change percentages
- Recent Orders with status icons
- Top Selling Products with gold/silver/bronze ranking
- Low Stock Alert with progress display
- Orders by Status with percentage progress bars
- Monthly Sales table

### Admin User Management (`AdminUsers` in `AdminManagement.tsx`)
- Stats cards: Total Users, Admins, Regular Users, Guests
- Search by name/email, filter by role
- Edit user (name, role) via modal
- Delete user with confirmation modal
- Toggle admin/user role with one click
- User avatars with initials, joined date

### Admin Products (`AdminProducts.tsx`)
- Full CRUD for products
- Image upload to Cloudinary
- Category/brand selection
- Stock management

### Other Admin CRUD
- **Categories**: Name, description, product count
- **Brands**: Name, slug
- **Orders**: Status filter, status update dropdown
- **Coupons**: Code, discount type/value, usage limits
- **Banners**: Title, subtitle, position (hero/promo/sidebar)

### User Account Deletion (`UserProfile` in `UserPages.tsx`)
- Danger Zone section with red-bordered card
- Delete Account modal with irreversible warning
- Type-`DELETE` confirmation input
- Calls `userAPI.deleteMyAccount()`, then logout + redirect

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
| PUT | `/api/categories/:id` | Update category (admin) |
| DELETE | `/api/categories/:id` | Delete category (admin) |
| GET | `/api/brands` | List brands |
| POST | `/api/brands` | Create brand (admin) |
| PUT | `/api/brands/:id` | Update brand (admin) |
| DELETE | `/api/brands/:id` | Delete brand (admin) |
| GET | `/api/orders` | List orders (admin) |
| POST | `/api/orders` | Create order |
| PUT | `/api/orders/:id/status` | Update order status (admin) |
| GET | `/api/coupons` | List coupons (admin) |
| POST | `/api/coupons` | Create coupon (admin) |
| PUT | `/api/coupons/:id` | Update coupon (admin) |
| DELETE | `/api/coupons/:id` | Delete coupon (admin) |
| POST | `/api/coupons/validate/:code` | Validate coupon |
| GET | `/api/banners` | List banners |
| POST | `/api/banners` | Create banner (admin) |
| PUT | `/api/banners/:id` | Update banner (admin) |
| DELETE | `/api/banners/:id` | Delete banner (admin) |
| POST | `/api/reviews` | Create review |
| GET | `/api/users` | List users (admin) |
| GET | `/api/users/profile` | Get current user profile |
| PUT | `/api/users/profile` | Update profile |
| DELETE | `/api/users/profile` | Delete own account |
| GET | `/api/users/:id` | Get user by ID (admin) |
| PUT | `/api/users/:id` | Update user (admin) |
| DELETE | `/api/users/:id` | Delete user (admin) |
| POST | `/api/users/wishlist/:productId` | Toggle wishlist |
| GET | `/api/users/wishlist` | Get wishlist |
| POST | `/api/upload` | Upload images to Cloudinary |
| GET | `/api/analytics/dashboard` | Dashboard stats (admin) |

---

## Cloudinary Folders

- `velora/` — default uploads
- `velora/products/` — product images
- `velora/products/thumbs/` — product thumbnails

---

## Deployment

### Vercel (Frontend)

| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

**Environment Variables** (set in Vercel dashboard):
```
VITE_API_URL=https://velora-backend.onrender.com/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_aW5zcGlyZWQtZHJhZ29uLTM1LmNsZXJrLmFjY291bnRzLmRldiQ
VITE_WHATSAPP_NUMBER=923070528980
```

### Render (Backend)

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Runtime | Node |

**Environment Variables** (set in Render dashboard):
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://faizhameed521_db_user:ZkBHbTQC8IWmt6ot@velora.z3izcfg.mongodb.net/techhive?retryWrites=true&w=majority
CLERK_SECRET_KEY=sk_test_SFFg3fIAbpNCfNaZtWyDBn3NZJLuZAHYGkOleozTyP
CLERK_PUBLISHABLE_KEY=pk_test_aW5zcGlyZWQtZHJhZ29uLTM1LmNsZXJrLmFjY291bnRzLmRldiQ
CLOUDINARY_CLOUD_NAME=zx4dkcqx
CLOUDINARY_API_KEY=764413747654299
CLOUDINARY_API_SECRET=Mwa_DGcy-bZLRrLYz_BiABArCXc
WHATSAPP_BUSINESS_NUMBER=923070528980
FRONTEND_URL=https://velora-frontend.onrender.com
```

### Deploy Order
1. Deploy backend first → get the URL
2. Set backend's `FRONTEND_URL` to frontend's URL
3. Deploy frontend → set `VITE_API_URL` to backend's URL

---

## Known Issues / Notes

- MongoDB Atlas cluster name is `velora` (mismatch with DB name `techhive` in connection string)
- WhatsApp order flow uses `wa.me` URL scheme (no Business API needed)
- `@clerk/clerk-react` v5.61.3 shows npm deprecation warning (works fine, v6 has breaking API changes)
- No payment gateway — orders confirmed via WhatsApp chat
- Backend uses `x-clerk-id` header for auth (not JWT verification)
- Free tier hosting spins down after inactivity (30-50s cold start)
- VS Code should be opened from `frontend/` directory for proper TS resolution

---

## .gitignore Coverage

| Location | Key Ignores |
|----------|-------------|
| Root | `node_modules/`, `.env*`, `build/`, `dist/`, `.DS_Store`, editor files |
| Frontend | Above + `.eslintcache`, `.vercel/`, `*.tsbuildinfo` |
| Backend | Above + `uploads/`, `temp/`, `seeds/*.bak` |

**Never committed**: `.env`, `.env.local`, secrets, credentials, service account files

### .env.example Files

Both `backend/.env.example` and `frontend/.env.example` exist with placeholder values so other developers know what's needed without exposing actual secrets.

---

## File Change Log

| File | Changes |
|------|---------|
| `vite.config.ts` | **NEW** — Vite config, React plugin, output to `dist/` |
| `index.html` | **MOVED** — From `public/` to root, `<script type="module">` |
| `src/main.tsx` | **RENAMED** — From `index.tsx`, Vite entry point |
| `src/vite-env.d.ts` | **NEW** — TypeScript env declarations |
| `postcss.config.cjs` | **RENAMED** — From `.js` to `.cjs` (ESM compat) |
| `tailwind.config.cjs` | **RENAMED** — From `.js` to `.cjs` (ESM compat) |
| `App.tsx` | ClerkProvider, ErrorBoundary, PageTracker, CookieConsent, admin guard, lazy imports |
| `AuthContext.tsx` | Clerk integration with useAuth/useUser |
| `CartContext.tsx` | localStorage persistence, notify system |
| `WishlistContext.tsx` | Guest + backend persistence with merge |
| `RecentlyViewedContext.tsx` | Last 12 products in localStorage |
| `Header.tsx` | Velora branding, Clerk sign-in, dark/light mode |
| `Footer.tsx` | Velora branding |
| `AdminLayout.tsx` | Admin sidebar navigation |
| `HomePage.tsx` | Hero (blue gradient), Recently Viewed section, Velora branding |
| `ProductDetailPage.tsx` | Recently viewed tracking, wishlist button |
| `ProductCard.tsx` | Wishlist heart button |
| `CheckoutPage.tsx` | notify system, enhanced error/success messages |
| `AdminDashboard.tsx` | **REDESIGNED** — Gradient stat cards, progress bars, ranking badges |
| `AdminManagement.tsx` | **REDESIGNED** — Modern tables, AdminUsers with full CRUD, search, role toggle |
| `AdminProducts.tsx` | Full CRUD with Cloudinary upload |
| `UserPages.tsx` | **UPDATED** — Account deletion with danger zone + confirmation modal |
| `api.ts` | Session headers, full status code handling, Clerk token, user CRUD endpoints |
| `utils/session.ts` | Session/cookie management |
| `utils/notifications.ts` | Enhanced toast system |
| `ErrorBoundary.tsx` | Runtime error catching |
| `CookieConsent.tsx` | GDPR cookie banner |
| `index.css` | Slide-up animation, toast animations |
| `backend/.env` | All API keys configured |
| `frontend/.env` | VITE_ prefixed vars (Clerk + WhatsApp + API URL) |
| `backend/.env.example` | Template for backend env vars |
| `frontend/.env.example` | Template for frontend env vars (VITE_ prefix) |
| `.gitignore` (root) | Comprehensive ignores for GitHub/Vercel/Render |
| `frontend/.gitignore` | Added Vercel, ESLint, TypeScript ignores |
| `backend/.gitignore` | Added uploads, temp, seeds backup ignores |
| `backend/src/controllers/userController.js` | **UPDATED** — deleteMyAccount, getUserById, updateUser, deleteUser |
| `backend/src/routes/users.js` | **UPDATED** — DELETE /profile, GET/PUT/DELETE /:id |
