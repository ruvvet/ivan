# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Example flows to try

A demo B2B marketplace. All data is in-memory — refreshing resets state. Any password works on the business sign-in.

**1. Quick buy as an individual**
Catalog → click any product → **Add to cart** → **Cart** → **Checkout** → fill card details → see order confirmation, then visit **Orders**.

**2. Buy on net terms as a business**
**Sign in** → Business tab → pick a business → catalog → product → Add to cart → **Checkout** → choose *Purchase order / Net terms*. Watch the business's available credit shrink on the login screen next time.

**3. Compare vendors for the same product**
Open a product that has multiple sellers → **Compare vendors** → review the price-history chart and pick a different seller.

**4. Request a quote**
Product detail → **Request quote** → fill the form → see it appear under **Quotes**, then open the quote detail to accept or counter.

**5. Track spend against a project**
**Projects** → create a new project → during checkout, attach the order to that project → return to the project to see spend roll up.

**6. Approvals (business only)**
Place an order over the business's auto-approve threshold → it lands in **Approvals** → approve or reject it there.

**7. Watchlist**
Catalog or product detail → bookmark a product → **Watchlist** to see saved items.

**8. Seller side**
**Seller dashboard** → **New listing** to add a product → **Analytics** to see (mock) revenue and order charts. Edit an existing listing from the dashboard.

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
