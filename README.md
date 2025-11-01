# CoinoWin — Offline Trading Pro

CoinoWin is a fully offline rebrand of the OPEX Web App experience. The interface emulates a professional exchange (Binance/OKX style) using local mock data only—no network calls are performed at runtime.

## Getting started

```bash
npm install
npm run dev
```

The dev server runs with Vite and uses the mock API layer located in `web/src/lib/api.mock.ts`.

## Building

```bash
npm run build
```

The production bundle is emitted into `dist/`.

## Standalone offline build

```bash
npm run build:standalone
```

This command builds the Vite bundle and then inlines all CSS, JS, and icon assets into a single `index-standalone.html` file. The repository ships with a placeholder file that is replaced the first time you execute the command. Opening the regenerated file from disk renders the complete CoinoWin UI offline.

## Project structure

```
mock/                # JSON data sources consumed by the mock API
scripts/             # Utility scripts (standalone builder)
web/                 # Vite + React application source
  src/assets/        # CoinoWin branding assets and SVG sprite
  src/components/    # Reusable UI components
  src/context/       # Settings and trading state providers
  src/lib/           # Types, utils, i18n, and mock API layer
  src/pages/         # Page-level views (Markets, Spot, Wallet, Orders, Settings, Support)
```

## Features

- Markets overview with filters and search.
- Spot trading layout (chart, order book, trades tape, form, order tabs).
- Wallet balances with offline deposit/withdraw modals.
- Orders table with CSV export.
- Settings for theme, language (en/fa with RTL support), and currency display.
- Support FAQ with offline notice.
- 100% offline mock data layer reading from local JSON.

## License

This project is released under the MIT License. See [LICENSE](./LICENSE) for details.

## Disclaimer

CoinoWin is an offline demonstration only. All balances, markets, and orders are synthetic and should not be used for real trading or financial decisions.
