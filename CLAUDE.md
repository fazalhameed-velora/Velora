# Velora — Claude Code Configuration

## Quick Context

This is **Velora**, a React 19 + Express.js e-commerce platform for tech accessories in Pakistan. Orders are placed via WhatsApp (no payment gateway).

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
- **Brand colors**: Primary blue (#5c7cfa → #364fc7), Surface grays
- **Styling**: Tailwind CSS with `dark:` variants for dark mode
- **State**: React Context (Auth, Cart, Wishlist, RecentlyViewed, Theme)
- **Notifications**: Use `notify` from `utils/notifications.ts` (NOT `toast` from react-hot-toast)
- **Session**: Use `session` from `utils/session.ts` for localStorage/cookie operations

## Key Files to Know

| File | Why |
|------|-----|
| `MEMORY.md` | Full project documentation |
| `src/App.tsx` | Provider hierarchy, routes, auth guards |
| `src/services/api.ts` | API layer with status code handling |
| `src/utils/notifications.ts` | Toast notification system |
| `src/utils/session.ts` | Session/cookie management |
| `src/contexts/AuthContext.tsx` | Clerk auth integration |
| `src/contexts/CartContext.tsx` | Cart with localStorage persistence |
| `src/contexts/WishlistContext.tsx` | Wishlist with guest + backend merge |
| `backend/src/middleware/auth.js` | Backend auth (x-clerk-id header) |
| `backend/.env` | All API keys (NEVER COMMIT) |
| `frontend/.env` | Frontend env vars (NEVER COMMIT) |

## Commands

```bash
# Frontend
cd frontend && npm start          # Dev server (port 3000)
cd frontend && npx tsc --noEmit   # Type check

# Backend
cd backend && npm run dev         # Dev server (port 5000)

# Docker
docker-compose up                # Full stack
```

## Deployment

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
2. Add lazy import in `App.tsx`
3. Add route in `AppRoutes`
4. Wrap with `UserRoute` if auth needed

### Add a new API endpoint
1. Add route in `backend/src/routes/`
2. Add to `api.ts` exports
3. Use `notify` for user feedback

### Modify notification behavior
Edit `src/utils/notifications.ts` — all toast styling is centralized there.

### Change session/cookie behavior
Edit `src/utils/session.ts` — all localStorage/cookie logic is there.
