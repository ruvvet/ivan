# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Features

A demo B2B construction-materials marketplace. All data is in-memory — refreshing resets state. Any password works on the business sign-in.

### Buyer features

1. **Projects** (`/projects`)
   Group orders, quotes, and addresses by named jobs. Each project has a budget vs. spend gauge that updates as you place orders. 3 pre-seeded.

2. **RFQ / Quotes** (`/quotes`)
   From cart, hit **Open RFQ** → pick vendors → submit. Vendors auto-respond over 1.5–7s with synthetic prices and lead times. Sorted by price, lowest flagged. Notifications fire as responses arrive.

3. **Bulk add** (in cart)
   Paste a takeoff list (SKU, qty per line) → parses, adds to cart, reports any unmatched SKUs.

4. **Approval workflow** (`/approvals`, business only)
   Each business has a threshold (Apex $1k / Bluestone $5k / Red Oak $500). Orders above it route to *pending approval*. Manager queue lets named approver approve or deny. Credit deducts only on approval.

5. **Job-site addresses + delivery slots** (in checkout)
   Saved addresses (3 pre-seeded, tied to projects) appear as picker tiles → click to auto-fill shipping. AM/PM delivery slots for the next 5 days.

6. **Watchlist** (`/watchlist`)
   ★ Watch button on every product. Per-item price thresholds — when listing price drops below, you get a **Below threshold** badge.

7. **Recently viewed** (on `/`)
   Horizontal strip on the homepage showing the last 6 listings you clicked.

8. **Reorder** (in `/orders`)
   Full order history with one-click **Reorder** — re-adds every line item from a past order to your current cart.

9. **Substitutes** (on product detail, when OOS)
   Out-of-stock items show an amber-bordered **Alternates available** panel with 4 in-stock items in the same category.

10. **Reviews + Q&A** (on product detail)
    3–5 deterministic synthetic reviews per listing (with verified badges) and 1–3 questions (some answered). Inline submit forms — additions persist for the session.

### Seller features

1. **Listings dashboard** (`/seller`)
   All your listings in one table (cards on mobile) with inline **Edit** / **Delete**. KPI strip: active count, in-stock ratio, avg unit price. Empty-state CTA when you have nothing listed.

2. **New listing** (`/seller/new`)
   Full product form: title, SKU, category (8 presets), description, unit of measure, price, lead-time days, in-stock toggle, emoji image picker, spec-sheet upload, plus a repeating **specs** key/value grid for arbitrary attributes.

3. **Edit listing** (`/seller/edit/:id`)
   Same form, pre-filled. Changes flow immediately into the buyer-side catalog and any open carts.

4. **Sales analytics** (`/seller/analytics`)
   12-month revenue bar chart, top 5 SKUs, out-of-stock alert list, KPI strip (TTM revenue, avg/month, listing count, OOS count).

5. **Role switch** (header / mobile drawer)
   Toggle between buyer and seller personas in the same session — see the same data from both sides without re-signing in.

### Cross-cutting

- **Notifications bell** — dropdown with unread badge. Auto-fires on PO approval/denial, approval requests, vendor quote responses. Pre-seeded with *back in stock* and *price drop* alerts. Click to deep-link.
- **Sticky black header** — utility strip + main bar + nav strip stick together with backdrop blur and shadow.

### Demo combos to try

Every combo is self-contained and starts from a fresh load (in-memory state resets on refresh).

**1. End-to-end procurement (PO + approval + project spend)**
1. **Sign in** → Business tab → choose **Apex** ($1k auto-approve threshold) → any password.
2. Go to **Cart**, paste this takeoff into the bulk-add box:
   ```
   REBAR-#5-20FT, 240
   LMB-2X4-8-SPF, 600
   DRY-1/2-4X8, 80
   ```
3. **Add to cart** — three line items appear, subtotal is well over $1k.
4. **Checkout** → choose *Purchase order / Net terms* → attach to project **Main St Renovation** → pick a job-site address tile → place order.
5. The order routes to *pending approval* — open `/approvals`, click **Approve**.
6. Reload `/projects` to see the spend bar on Main St Renovation move; reload sign-in to see Apex's available credit drop.

**2. RFQ to multiple vendors**
1. Add any product to cart (e.g., REBAR-#5-20FT).
2. In cart, click **Open RFQ →** → keep all 4 vendors selected → submit.
3. You're taken to the new quote. Watch the bell — vendor responses arrive over 1.5–7s with synthetic prices.
4. Once all four respond, the **Lowest** badge appears on the cheapest.
5. Click **Accept** on a vendor row to lock in the quote.

**3. Watchlist price-drop alert**
1. Open any product detail → click **★ Watch**.
2. Go to `/watchlist` → set the **Notify if &lt;** threshold to a value *above* the current price (e.g. if list price is $19.25, set threshold to $20).
3. Green **● Below threshold** pill lights up immediately.

**4. Vendor swap via Compare**
1. From the catalog, open a product that's sold by multiple vendors — `REBAR-#5-20FT` is carried by three.
2. Click **Compare vendors** on the listing.
3. Scan the table: price, lead time, rating per vendor.
4. Pick a different vendor row and **Add to cart** — same SKU, different seller.

**5. Reorder a past purchase**
1. Place any order first (combo #1 works).
2. Go to `/orders` → find the order in the history table → click **Reorder**.
3. Every line item from that order is re-added to your current cart at the same quantities.
4. **Checkout** to place it again.

**6. Project budget gauge fills up**
1. Go to `/projects` → open **Warehouse Slab Repair** (smallest budget at $8k, easiest to move).
2. Click back to the catalog → buy something → at checkout, attach the order to that project.
3. Return to `/projects` → the spend percentage and bar reflect the new total.

**7. Out-of-stock → substitute**
1. Open product `DRY-1/2-4X8` (1/2" drywall — seeded out of stock).
2. Scroll to the amber **Alternates available** panel — 4 in-stock products from the same category.
3. Click any alternate → land on its detail page → **Add to cart** instead.

**8. Notification deep-link**
1. Click the bell icon in the header.
2. Click the pre-seeded **back in stock** notification.
3. It deep-links you to the listing in question — buy it or watch it from there.

**9. Seller round-trip**
1. Use the role switch in the header (or mobile drawer) → flip to **Seller**.
2. `/seller/new` → fill in title, SKU, price, etc. → create.
3. Flip back to **Buyer** → search the catalog by your new SKU → buy one.
4. Flip to seller again → `/seller/analytics` → your new listing shows in the top SKUs and revenue chart.

## Deployment notes

Currently configured for **GitHub Pages** at `https://ruvvet.github.io/ivan/`:

- `vite.config.ts` sets `base: '/ivan/'` for the subpath.
- `src/App.tsx` uses `HashRouter` because GH Pages can't serve client-side routes on refresh.

**Before deploying to a real cloud host (Vercel, Netlify, custom domain, etc.):**

- Switch `HashRouter` back to `BrowserRouter` in `src/App.tsx` so URLs are clean (no `#`).
- Remove or change `base` in `vite.config.ts` (set to `'/'` or delete the line) unless still served from a subpath.


Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
