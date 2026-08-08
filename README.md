# Velora — MERN Stack E-Commerce Platform

A production-ready, full-stack e-commerce platform for selling mobile phones and tech accessories. Built with React 19 (CRA), Node.js, Express, MongoDB, and Clerk authentication.

## Features

### Shopping
- **Product Catalog** — Browse, search, filter, sort, and paginate products
- **Advanced Search** — Autocomplete with real-time suggestions
- **Shopping Cart** — Persistent cart with quantity management
- **Wishlist** — Save products for later
- **WhatsApp Checkout** — Generate order and redirect to WhatsApp for payment
- **Guest Login** — Browse and checkout without creating an account
- **Product Reviews** — Rate and review purchased products
- **Responsive Design** — Works perfectly from 320px to 1920px

### Admin Panel
- **Dashboard** — Revenue, orders, products, users analytics
- **CRUD Management** — Products, categories, brands, banners, coupons
- **Order Management** — Status tracking (pending → confirmed → packed → shipped → delivered)
- **Inventory** — Stock alerts and management
- **User Management** — View and manage user accounts

### User Panel
- **Profile** — Update personal information
- **Orders** — View order history and status
- **Wishlist** — Manage saved products
- **Addresses** — Save multiple shipping addresses

### Design
- **Dark/Light Mode** — System-aware theme with persistence
- **Glassmorphism** — Modern glass-effect UI elements
- **Micro-interactions** — Framer Motion animations
- **Skeleton Loading** — Beautiful loading states
- **Empty States** — Meaningful UI for empty data

## Tech Stack

### Frontend
- React 19 (Create React App)
- TypeScript
- TailwindCSS v4
- Framer Motion
- React Router v6
- TanStack Query
- React Hook Form + Zod
- Axios
- Lucide Icons

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Clerk Authentication
- Cloudinary (image storage)
- Sharp (image processing)
- Helmet (security)
- Rate Limiting

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/techhive.git
cd techhive

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Variables

**Backend** — Create `.env` in `/backend`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/techhive
CLERK_SECRET_KEY=your_clerk_secret
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
WHATSAPP_BUSINESS_NUMBER=923001234567
FRONTEND_URL=http://localhost:3000
```

**Frontend** — Create `.env` in `/frontend`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
REACT_APP_WHATSAPP_NUMBER=923001234567
```

### Running

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm start
```

### Seed Database
```bash
cd backend
npm run seed
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | List products (with filters) |
| GET | /api/products/:slug | Product detail |
| POST | /api/products | Create product (admin) |
| PUT | /api/products/:id | Update product (admin) |
| DELETE | /api/products/:id | Delete product (admin) |
| GET | /api/categories | List categories |
| POST | /api/categories | Create category (admin) |
| GET | /api/brands | List brands |
| POST | /api/orders | Create order |
| GET | /api/orders | List orders |
| PUT | /api/orders/:id/status | Update order status (admin) |
| POST | /api/auth/guest | Create guest session |
| POST | /api/users/wishlist/:productId | Toggle wishlist |
| GET | /api/search/autocomplete | Search autocomplete |
| POST | /api/upload | Upload images (admin) |

## Project Structure

```
techhive/
├── backend/
│   ├── src/
│   │   ├── config/        # DB, Cloudinary config
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/     # Auth, upload, error handler
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # Express routes
│   │   ├── seeds/         # Database seeder
│   │   ├── services/      # Business logic
│   │   └── utils/         # Helpers
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable UI
│   │   │   ├── ui/        # Button, Input, ProductCard, etc.
│   │   │   └── layout/    # Header, Footer, AdminLayout
│   │   ├── contexts/      # Theme, Auth, Cart
│   │   ├── pages/         # Route pages
│   │   │   ├── home/      # HomePage
│   │   │   ├── shop/      # ShopPage with filters
│   │   │   ├── product/   # ProductDetailPage
│   │   │   ├── cart/      # CartPage
│   │   │   ├── checkout/  # CheckoutPage + WhatsApp
│   │   │   ├── admin/     # AdminDashboard, Products, etc.
│   │   │   └── user/      # User Profile, Orders, etc.
│   │   ├── services/      # API client (Axios)
│   │   ├── types/         # TypeScript interfaces
│   │   └── utils/         # Helpers, formatters
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Deployment

### Docker
```bash
docker-compose up -d
```

### Manual
1. Build frontend: `cd frontend && npm run build`
2. Start backend: `cd backend && npm start`
3. Serve frontend build with Nginx, proxy `/api` to backend

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| MONGODB_URI | MongoDB connection string | Yes |
| CLERK_SECRET_KEY | Clerk secret key | Yes |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name | Yes |
| CLOUDINARY_API_KEY | Cloudinary API key | Yes |
| CLOUDINARY_API_SECRET | Cloudinary API secret | Yes |
| WHATSAPP_BUSINESS_NUMBER | WhatsApp number for orders | Yes |
| FRONTEND_URL | Frontend URL for CORS | Yes |
| REACT_APP_API_URL | Backend API URL | Yes |

## License

MIT
