# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Features

A demo B2B construction-materials marketplace. All data is in-memory — refreshing resets state. Any password works on the business sign-in.

### Buyer features

1. **Projects** (`/projects`)
   Group orders, quotes, and addresses by named jobs. Each project has a budget vs. spend gauge that updates as you place orders. 3 pre-seeded.

2. **RFQ / Quotes** (`/quotes`)
   From cart, hit **Open RFQ** → pick vendors → submit. Vendors auto-respond over 1.5–8s with synthetic prices and lead times. Sorted by price, lowest flagged. Notifications fire as responses arrive.

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

### Mobile-first updates (most recent pass)

- **Hamburger drawer** on mobile — slides in from the right with full nav, account block, and role-switch toggle. Header collapses to logo + cart + bell + menu only.
- Search bar moves to its own full-width row below the header on mobile.
- Tables → card lists on `<md` for: Orders, Quotes, QuoteDetail items, ProjectDetail orders, Approvals decided, SellerDashboard, SellerAnalytics top SKUs, CompareVendors, ProductDetail "other vendors".
- ProductDetail mobile: image emoji scales down (`text-7xl` → `text-[14rem]`), and a sticky bottom action bar with live total + qty stepper + **Add** button stays reachable while scrolling.
- Touch targets sized for thumbs (44×44px minimum on icons/buttons).
- Container padding scales: `px-4 sm:px-6`, `py-6 sm:py-10`.
- Notification dropdown becomes a full-width panel on phones.

### Demo combos to try

- **End-to-end procurement:** Sign in as Apex → bulk-paste 3 SKUs → checkout with PO + project link → *Submit for approval* → `/approvals` → approve → spend rises in project, credit deducts.
- **RFQ flow:** Add to cart → Open RFQ → select 4 vendors → watch the bell → visit quote → accept lowest.
- **Watchlist trigger:** Watch any item → set threshold above current price → green **Below threshold** pill lights up.
- **Mobile drill:** Resize to 375px → hamburger → drawer → product detail → sticky bottom bar.
- **Seller round-trip:** Switch to seller → create a new listing → switch back to buyer → find it in the catalog → buy it → switch to seller → see it appear in analytics.

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
