# Velora — Claude Code Configuration

## Quick Context

This is **Velora**, a React 19 + Vite + Express.js e-commerce platform for tech accessories in Pakistan. Orders are placed via WhatsApp (no payment gateway).

## Rules

- Read `MEMORY.md` first — it has full architecture, file map, and implementation details
- Do what has been asked; nothing more, nothing less
- NEVER create files unless absolutely necessary — prefer editing existing files
- NEVER commit secrets, credentials, or `.env` files
- ALWAYS read a file before editing it
- Keep files under 500 lines
- Run `npx tsc --noEmit` after TypeScript changes (ignore node_modules errors)

## Project Conventions

- **App name**: Velora (not TechHive — that was renamed)
- **Build tool**: Vite 6.4.3 (NOT react-scripts/CRA)
- **Brand colors**: Primary blue (#5c7cfa → #364fc7), Surface grays
- **Styling**: Tailwind CSS with `dark:` variants for dark mode
- **State**: React Context (Auth, Cart, Wishlist, RecentlyViewed, Theme)
- **Notifications**: Use `notify` from `utils/notifications.ts` (NOT `toast` from react-hot-toast)
- **Session**: Use `session` from `utils/session.ts` for localStorage/cookie operations
- **Env vars**: Use `import.meta.env.VITE_*` (NOT `process.env.REACT_APP_*`)
- **Config files**: PostCSS/Tailwind use `.cjs` extension (ESM compatibility)

## Key Files to Know

| File | Why |
|------|-----|
| `MEMORY.md` | Full project documentation |
| `vite.config.ts` | Vite build configuration |
| `src/main.tsx` | Entry point (was `index.tsx` in CRA) |
| `src/App.tsx` | Provider hierarchy, routes, auth guards |
| `src/vite-env.d.ts` | TypeScript env type declarations |
| `src/services/api.ts` | API layer with status code handling |
| `src/utils/notifications.ts` | Toast notification system |
| `src/utils/session.ts` | Session/cookie management |
| `src/contexts/AuthContext.tsx` | Clerk auth integration |
| `src/contexts/CartContext.tsx` | Cart with localStorage persistence |
| `src/contexts/WishlistContext.tsx` | Wishlist with guest + backend merge |
| `backend/src/middleware/auth.js` | Backend auth (x-clerk-id header) |
| `backend/.env` | All API keys (NEVER COMMIT) |
| `frontend/.env` | Frontend env vars (VITE_ prefix, NEVER COMMIT) |

## Commands

```bash
# Frontend (Vite)
cd frontend && npm run dev          # Dev server (port 3000)
cd frontend && npm run build        # Production build (outputs to dist/)
cd frontend && npx tsc --noEmit     # Type check

# Backend
cd backend && npm run dev           # Dev server (port 5000)
cd backend && npm start             # Production start

# Docker
docker-compose up                   # Full stack
```

## Deployment

### Vercel (Frontend)
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Output Directory: `dist`
- Env vars: `VITE_API_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_WHATSAPP_NUMBER`

### Render (Backend)
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Env vars: `MONGODB_URI`, `CLERK_SECRET_KEY`, `CLOUDINARY_*`, `WHATSAPP_BUSINESS_NUMBER`, `FRONTEND_URL`

### Deploy Order
1. Deploy backend first → get URL
2. Set backend's `FRONTEND_URL` to frontend's URL
3. Deploy frontend → set `VITE_API_URL` to backend's URL

- `.gitignore` files configured for GitHub, Vercel, and Render
- `.env.example` files in both frontend/backend for developer reference
- NEVER commit `.env` files — they contain API keys and secrets

## API Keys (in .env files, DO NOT COMMIT)

- MongoDB Atlas: `velora` cluster
- Clerk: Development mode (`sk_test_...`, `pk_test_...`)
- Cloudinary: `zx4dkcqx` cloud
- WhatsApp: `+923070528980`

## Common Tasks

### Add a new page
1. Create component in `src/pages/`
2. Add lazy import in `App.tsx` (if it has a default export)
3. Or add direct import (if it exports named components used in routes)
4. Add route in `AppRoutes`
5. Wrap with `UserRoute` or `AdminRoute` if auth needed

### Add a new admin section
1. Create component in `src/pages/admin/AdminManagement.tsx` (named export)
2. Add route in `AppRoutes` in `App.tsx`
3. Add to sidebar in `AdminLayout.tsx`
4. Add to default export object in AdminManagement.tsx

### Add a new API endpoint
1. Add route in `backend/src/routes/`
2. Add to `api.ts` exports
3. Use `notify` for user feedback

### Modify notification behavior
Edit `src/utils/notifications.ts` — all toast styling is centralized there.

### Change session/cookie behavior
Edit `src/utils/session.ts` — all localStorage/cookie logic is there.
