# CoinoWin — Offline Trading Pro

CoinoWin is a fully offline rebrand of the OPEX Web App experience. The interface emulates a professional exchange (Binance/OKX style) using local mock data only—no network calls are performed at runtime.

## Offline bundle

The repository now ships with a prebuilt single-file experience: `index-standalone.html`.

### How to open

- **Double click** the file (`file:///` URL) or
- Serve it from a lightweight static server, e.g. `python -m http.server 8080` and visit <http://127.0.0.1:8080/index-standalone.html>.

Everything—fonts, icons, styles, scripts, and mock datasets—is embedded directly inside the HTML file. No additional assets or external CDNs are required. The bundled typography now ships with the inline "Coinowin Yekan" WOFF2 stack for consistent rendering offline.

## Development (optional)

If you want to work on the React source, the usual Vite workflow is still available:

```bash
npm install
npm run dev
```

The dev server uses the mock API layer located in `web/src/lib/api.mock.ts`.

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

## GitHub workflow tips

- اگر یک Pull Request قبل از دریافت تایید Merge شد یا بسته شد، راهنمای [مدیریت Pull Requestهای Merge شده بدون تایید](docs/pr-approval.md) را دنبال کنید تا شاخه را بازیابی کنید، تایید جدید بگیرید و قوانین Branch Protection را تنظیم کنید.
