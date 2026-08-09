# 🚀 Velora — Modern MERN Stack E-Commerce Platform

<div align="center">

![Velora](https://img.shields.io/badge/Velora-v2.0-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)

**A production-ready, full-stack e-commerce platform for selling mobile phones and tech accessories in Pakistan.**

[![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel)](https://velora7.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/fazalhameed-velora/Velora)

</div>

---

## ✨ Features

### 🛍️ Shopping Experience
| Feature | Description |
|---------|-------------|
| **Product Catalog** | Browse, search, filter, sort, and paginate products with real-time updates |
| **Advanced Search** | Autocomplete with instant suggestions and search history |
| **Smart Filters** | Filter by category, brand, price range, rating, and stock availability |
| **Shopping Cart** | Persistent cart with quantity management and localStorage sync |
| **Wishlist** | Save products for later with backend synchronization |
| **Buy Now** | One-click purchase with beautiful gradient button animation |
| **WhatsApp Checkout** | Generate order and redirect to WhatsApp for payment confirmation |
| **Guest Checkout** | Browse and checkout without creating an account |
| **Free Shipping** | All orders include free shipping across Pakistan |
| **Order Confirmation** | Beautiful confirmation page with estimated delivery and print receipt |

### 🎨 Product Reviews
| Feature | Description |
|---------|-------------|
| **Star Ratings** | 5-star rating system with visual feedback |
| **Review Sorting** | Sort by newest, oldest, highest rated, lowest rated, or most helpful |
| **Rating Filters** | Filter reviews by specific star ratings (5★ to 1★) |
| **Review Submission** | Submit reviews with ratings and comments |
| **Review Statistics** | See average rating and total review count |

### 🏷️ Product Management
| Feature | Description |
|---------|-------------|
| **Quick Toggle Flags** | Instantly toggle Featured, Trending, New Arrivals, Best Seller status |
| **Auto-Trending** | Products automatically flag as trending based on sales count |
| **Bulk Operations** | Select and manage multiple products at once |
| **Image Upload** | Multi-image upload with Cloudinary integration |
| **Inventory Management** | Stock tracking with low-stock alerts |

### 🎫 Banner System
| Feature | Description |
|---------|-------------|
| **Banner Scheduling** | Set start/end dates for automatic banner display |
| **Click Analytics** | Track banner impressions and click-through rates |
| **Position Control** | Place banners in different positions (hero, sidebar, footer) |
| **Image Upload** | Upload banner images directly from admin panel |
| **Preview Mode** | Preview banners before publishing |

### 🎯 Admin Dashboard
| Feature | Description |
|---------|-------------|
| **Analytics Charts** | Interactive charts with Recharts (revenue, orders, products, users) |
| **Real-time Stats** | Live dashboard with key metrics |
| **Order Management** | Update order status, add tracking, delete orders |
| **User Management** | View and manage user accounts |
| **Security Dashboard** | Monitor blocked IPs and suspicious activity |
| **Responsive Design** | Works perfectly on desktop and mobile |

### 👤 User Profile
| Feature | Description |
|---------|-------------|
| **Profile Management** | Update personal information and avatar |
| **Order History** | View all past orders with status tracking |
| **Wishlist Management** | View and manage saved products |
| **Address Book** | Save multiple shipping addresses |
| **Email Display** | Shows user email instead of ID |

### 🔒 Security Features
| Feature | Description |
|---------|-------------|
| **Helmet Headers** | Security headers (CSP, X-Frame-Options, etc.) |
| **Rate Limiting** | API rate limiting (200 req/15min general, 10 req/15min for auth) |
| **IP Blocking** | Auto-block suspicious IPs after 5 failed attempts |
| **Input Validation** | Server-side validation with express-validator |
| **SQL Injection Protection** | MongoDB sanitize middleware |
| **HPP Protection** | HTTP Parameter Pollution protection |
| **CORS Configuration** | Strict CORS policies |
| **Error Handling** | Secure error messages (no stack traces in production) |

### 🎨 Design & UX
| Feature | Description |
|---------|-------------|
| **Dark/Light Mode** | System-aware theme with persistence and flash prevention |
| **Responsive Design** | Works from 320px to 1920px+ |
| **Glassmorphism UI** | Modern glass-effect elements |
| **Micro-interactions** | Smooth animations and transitions |
| **Skeleton Loading** | Beautiful loading states |
| **Empty States** | Meaningful UI for empty data |
| **Mobile-First Modals** | Full-screen modals on mobile, centered on desktop |
| **Print Receipts** | Generate printable receipts with barcodes |

### 🚀 Performance
| Feature | Description |
|---------|-------------|
| **API Retry Logic** | Automatic retry for failed requests (handles cold starts) |
| **Loading Spinners** | Visual feedback during API calls |
| **Code Splitting** | Lazy loading for routes |
| **Image Optimization** | Sharp for server-side image processing |
| **CDN Delivery** | Cloudinary for image CDN |
| **Gzip Compression** | Enabled for faster transfers |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 6.x | Build tool |
| TailwindCSS | 3.x | Styling |
| Framer Motion | 11.x | Animations |
| React Router | 6.x | Routing |
| Axios | 1.x | HTTP client |
| Recharts | 2.x | Charts |
| Lucide Icons | Latest | Icons |
| Clerk | Latest | Authentication |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x | Runtime |
| Express | 4.x | Web framework |
| MongoDB | 7.x | Database |
| Mongoose | 7.x | ODM |
| Clerk | Latest | Auth middleware |
| Cloudinary | Latest | Image storage |
| Sharp | Latest | Image processing |
| Helmet | Latest | Security headers |
| express-validator | Latest | Input validation |
| express-rate-limit | Latest | Rate limiting |
| hpp | Latest | HTTP Parameter Pollution |
| mongo-sanitize | Latest | NoSQL injection protection |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (recommended: 20.x)
- MongoDB (local or Atlas)
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/fazalhameed-velora/Velora.git
cd Velora

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
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/velora

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# WhatsApp
WHATSAPP_BUSINESS_NUMBER=923070528980

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

**Frontend** — Create `.env` in `/frontend`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
VITE_WHATSAPP_NUMBER=923070528980
```

### Running Locally

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

### Seed Database
```bash
cd backend
npm run seed
```

---

## 📡 API Endpoints

### Products
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | List products (with filters) | Public |
| GET | `/api/products/:slug` | Product detail | Public |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |
| PATCH | `/api/products/:id/flags` | Toggle product flags | Admin |

### Categories
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/categories` | List categories | Public |
| POST | `/api/categories` | Create category | Admin |
| PUT | `/api/categories/:id` | Update category | Admin |
| DELETE | `/api/categories/:id` | Delete category | Admin |

### Orders
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders` | Create order | Public |
| GET | `/api/orders` | List orders | Admin |
| GET | `/api/orders/:id` | Get order | Admin |
| PUT | `/api/orders/:id/status` | Update status | Admin |
| DELETE | `/api/orders/:id` | Delete order | Admin |

### Reviews
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/reviews/product/:productId` | Get product reviews | Public |
| POST | `/api/reviews` | Create review | Auth |
| DELETE | `/api/reviews/:id` | Delete review | Admin |

### Banners
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/banners` | List active banners | Public |
| POST | `/api/banners` | Create banner | Admin |
| PUT | `/api/banners/:id` | Update banner | Admin |
| DELETE | `/api/banners/:id` | Delete banner | Admin |
| POST | `/api/banners/:id/click` | Track banner click | Public |

### Security
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/security/blocked-ips` | List blocked IPs | Admin |
| POST | `/api/security/block-ip` | Block IP | Admin |
| DELETE | `/api/security/unblock-ip/:ip` | Unblock IP | Admin |
| GET | `/api/security/audit` | Security audit | Admin |

---

## 📁 Project Structure

```
Velora/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Cloudinary configuration
│   │   ├── controllers/     # Route handlers (product, order, user, etc.)
│   │   ├── middleware/       # Auth, upload, validation, IP blocker
│   │   ├── models/          # Mongoose schemas (Product, Order, User, etc.)
│   │   ├── routes/          # Express routes
│   │   ├── seeds/           # Database seeder
│   │   ├── services/        # Business logic (webhook queue)
│   │   └── server.js        # Entry point
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # Button, Input, ProductCard, Skeleton, etc.
│   │   │   └── layout/      # Header, Footer, MainLayout, AdminLayout
│   │   ├── contexts/        # Auth, Cart, Wishlist, Theme, RecentlyViewed
│   │   ├── pages/
│   │   │   ├── home/        # HomePage
│   │   │   ├── shop/        # ShopPage with filters
│   │   │   ├── product/     # ProductDetailPage
│   │   │   ├── cart/        # CartPage
│   │   │   ├── checkout/    # CheckoutPage + OrderConfirmation
│   │   │   ├── admin/       # AdminDashboard, Products, Analytics, Security
│   │   │   └── user/        # User Profile, Orders, Wishlist
│   │   ├── services/        # API client (Axios with retry logic)
│   │   ├── types/           # TypeScript interfaces
│   │   └── utils/           # Helpers, formatters, notifications
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.cjs
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 🚢 Deployment

### Vercel (Frontend)
```
Root Directory: frontend
Build Command: npm install && npm run build
Output Directory: dist
Environment Variables:
  - VITE_API_URL
  - VITE_CLERK_PUBLISHABLE_KEY
  - VITE_WHATSAPP_NUMBER
```

### Render (Backend)
```
Root Directory: backend
Build Command: npm install
Start Command: npm start
Environment Variables:
  - MONGODB_URI
  - CLERK_SECRET_KEY
  - CLOUDINARY_*
  - WHATSAPP_BUSINESS_NUMBER
  - FRONTEND_URL
```

### Deploy Order
1. Deploy backend first → get URL
2. Set backend's `FRONTEND_URL` to frontend's URL
3. Deploy frontend → set `VITE_API_URL` to backend's URL

### Docker
```bash
docker-compose up -d
```

---

## 🔐 Security

Velora implements multiple layers of security:

- **Helmet** — Sets various HTTP headers for security
- **CORS** — Configured for specific origins only
- **Rate Limiting** — Prevents abuse (200 req/15min general, 10 req/15min auth)
- **IP Blocking** — Auto-blocks after 5 failed attempts, manual blocking available
- **Input Validation** — Server-side validation with express-validator
- **MongoDB Sanitize** — Prevents NoSQL injection attacks
- **HPP** — HTTP Parameter Pollution protection
- **Secure Errors** — No stack traces in production

---

## 📊 Analytics

### Admin Dashboard Charts
- **Revenue Chart** — Monthly revenue visualization
- **Orders Chart** — Order volume over time
- **Products Chart** — Product sales distribution
- **Users Chart** — User registration trends

### Banner Analytics
- **Impressions** — Track banner views
- **Click-through Rate** — Measure banner effectiveness
- **Performance Metrics** — Identify best-performing banners

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Fazal Hameed**
- GitHub: [@fazalhameed-velora](https://github.com/fazalhameed-velora)
- Email: faizhameed521@gmail.com
- Phone: +92 307 0528980

---

## 🙏 Acknowledgments

- [Clerk](https://clerk.dev) — Authentication
- [Cloudinary](https://cloudinary.com) — Image hosting
- [Vercel](https://vercel.com) — Frontend hosting
- [Render](https://render.com) — Backend hosting
- [MongoDB Atlas](https://www.mongodb.com/atlas) — Database
- [Tailwind CSS](https://tailwindcss.com) — Styling
- [Recharts](https://recharts.org) — Charts
- [Lucide Icons](https://lucide.dev) — Icons

---

<div align="center">

**Made with ❤️ in Pakistan**

![Pakistan](https://img.shields.io/badge/🇵🇰-Pakistan-01411C?style=for-the-badge)

</div>
