# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install            # install deps
npm run dev            # start dev server (Express + Vite middleware) on :3000
npm run start          # same as dev; used in production container
npm run build          # vite build → dist/
npm run preview        # preview built bundle
npm run lint           # type-check only: tsc --noEmit
npm run clean          # rm -rf dist

npx prisma generate    # regenerate Prisma client after schema.prisma changes
npx prisma db push     # sync SQLite dev.db to schema (no migrations in repo)

docker compose up      # full stack: app + Postgres + Redis
```

There is **no test suite** and **no separate lint tool** — `npm run lint` is just `tsc --noEmit`. Run it after any non-trivial change.

## Architecture

This is a single-process app: `server.ts` runs an Express server that **mounts Vite as middleware in dev** and serves the built SPA in production. There is no separate frontend dev server — `npm run dev` gives you both API and UI on `http://localhost:3000`.

### Request flow

1. **`server.ts`** (entry point) — registers custom API routes (`/api/products/*`, `/api/orders/*`, `/api/auth/register`, `/api/auth/reset-password`), then mounts the Auth.js catch-all at `/api/auth/*`, then mounts Vite middleware (or static `dist/` in prod). Order matters: custom auth routes must come **before** the Auth.js catch-all.
2. **`src/server/*`** — backend service layer (instantiates its own `PrismaClient`):
   - `productService.ts` — search + create, with Redis caching (`ioredis`) and a `Map`-based memory fallback if Redis isn't reachable.
   - `orderService.ts` — checkout wrapped in `prisma.$transaction`, uses atomic `decrement` on `ProductVariant.stock` and rolls back if stock goes negative. **Note**: if a `variantId` isn't found in DB it silently mocks a $100 line item (legacy preview-mode fallback) — be aware when debugging order totals.
   - `paymentService.ts` — VNPay (`createVNPayUrl`/`verifyVNPayIPN`) and MoMo (`createMoMoRequest`/`verifyMoMoIPN`) HMAC signing. The `vnpay_return` and `momo_ipn` handlers in `server.ts` currently have `TODO: Update Order status to PAID` — verification works but order status isn't persisted yet.
3. **`src/main.tsx`** — React 19 + React Router entry. Routes: `/`, `/products`, `/products/:id`, `/admin/*`, `/about`, `/contact`, `/policy`. Also handles OAuth popup close by sending `postMessage({type:'OAUTH_AUTH_SUCCESS'})` to `window.opener`.

### Database (Prisma + SQLite for dev)

`prisma/schema.prisma` targets **SQLite** (`file:./dev.db`). Because SQLite lacks JSON and enum support, the schema deliberately uses `String` columns where Postgres would use `Json` / `enum`:
- `Product.specs`, `ProductVariant.attributes` — stringified JSON; always `JSON.parse`/`JSON.stringify` at the boundary (see `productService.ts` and `AdminProductForm.tsx`).
- `Order.status` — plain string (`"PENDING" | "COMPLETED"` etc.) instead of an enum.

Search in `productService.searchProducts` uses `contains` (case-insensitive LIKE) — there are inline comments noting the Postgres replacement would be `{ search: query }` full-text and JSONB path queries. Keep that migration path in mind when touching search code.

Auth.js models (`User`, `Account`, `Session`, `VerificationToken`) live in the same schema. `User.password` is added for the custom Credentials provider (bcrypt-hashed, 10 rounds).

### Auth (Auth.js / @auth/express)

- Three providers wired in `server.ts`: GitHub, Google, **Credentials** (email/password against `User.password`).
- Session strategy is `jwt`, 30 days.
- **All cookies use `__Secure-` prefix + `sameSite: "none"` + `secure: true`** — this is required for the AI Studio iframe preview and means the app effectively requires HTTPS (or a trusting proxy) at runtime, even locally. `app.set("trust proxy", true)` is set for this reason.
- If `process.env.APP_URL` is set, `AUTH_URL` is derived as `${APP_URL}/api/auth` — required when behind a reverse proxy so OAuth callbacks resolve correctly.
- A **default admin** is seeded on every server start: `admin@pro-gaming.com` / `admin123`. The admin gate in `AdminDashboard.tsx` checks `session.user.email === 'admin@pro-gaming.com'`. There's also a hidden **Ctrl/Cmd+Shift+A** shortcut on `ProductsPage.tsx` that auto-logs in as admin and redirects to `/admin`.
- Client auth helpers live in `src/lib/authClient.ts` — OAuth signin opens a popup (`window.open(..., 'AuthPopup', ...)`); Credentials posts directly to `/api/auth/callback/credentials` with a CSRF token.

### Frontend state & data flow

- **Zustand stores** (`src/store/`):
  - `cartStore` — cart items, no persistence.
  - `userStore` — `recentlyViewed` (capped at 5).
- **Recommendation engine** (`src/lib/recommendations.ts`) — pure function fed by `cartStore.items + userStore.recentlyViewed`; uses hard-coded category-pair rules (Mouse→Mousepad, Keyboard→Keycaps/Wrist Rest, Headset→Headphone Stand) with an `isHot || isNew` fallback.
- **Product data is dual-sourced**: `ProductsPage` shows `mockProducts` from `src/data/mockProducts.ts` until the user types in search, at which point it hits `/api/products/search` and displays DB results. `ProductDetailsPage` tries `/api/products/:id` first and falls back to mocks. Be aware the shapes differ — DB products go through a mapping in `productService.searchProducts` that flattens `basePrice → price`, builds a `picsum.photos` image URL, and parses `specs`. The shared `Product` type lives in `src/types/index.ts`.
- **Currency**: `formatVND` (`src/lib/format.ts`) hard-codes a 25,000 VND/USD rate to convert mock USD prices into displayed VND. All UI text and prices are in Vietnamese.

### Styling

- **Tailwind v4** via `@tailwindcss/vite`. The theme is declared **inline in `src/index.css`** via the `@theme` directive — there is no `tailwind.config.js`. Custom tokens: `primary-neon` (#c8fc31), `dark-bg`, `light-bg`, `card-glass`, `text-primary/secondary`, `border-subtle`.
- The design language is "glassmorphism": `bg-white/60 backdrop-blur-xl border border-black/5` is the standard card pattern. The neon-yellow accent (`bg-primary-neon`) is the brand color.
- `cn()` helper in `src/lib/utils.ts` is the standard `clsx + twMerge`.

### Vite config gotchas

- The `@` alias resolves to the **project root** (not `src/`) — imports look like `@/src/components/...`.
- `GEMINI_API_KEY` is injected as `process.env.GEMINI_API_KEY` at build time via `define`. The Gemini SDK (`@google/genai`) is a declared dependency but **is not used anywhere in the current source** — the codebase is set up for AI features that haven't been added yet.
- HMR is disabled when `DISABLE_HMR=true` (set by AI Studio to prevent flicker during agent edits).

## Conventions

- **Comments and UI strings are mostly Vietnamese.** Match the existing language when editing user-facing text or in-line architectural comments.
- Each backend service file constructs its own `new PrismaClient()` — there's no shared singleton. Don't refactor this without checking for connection-pool implications.
- Payment integrations use HMAC-SHA512 (VNPay) and HMAC-SHA256 (MoMo); param ordering in the signature matters — see `PaymentService.sortObject` and the inline `rawSignature` template strings before changing anything signature-related.
- The `mockCheckoutEndpoint` constant in `src/server/mockCheckout.ts` is dead documentation (Stripe integration sketch in a comment block) — the real checkout is `OrderService.checkout` invoked from `POST /api/orders/checkout`.
