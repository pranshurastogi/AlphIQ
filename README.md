# AlphIQ Dashboard

AlphIQ is a Next.js dashboard that showcases real‑time metrics and gamified analytics for the Alephium blockchain. It uses React, Tailwind CSS and Radix UI primitives to provide a sleek interface for tracking network activity, profiling wallets and viewing onchain scores.

## Features

- **Live Network Stats** – pulls data from the Alephium explorer API using the custom [useNetworkStats](alphiq-dashboard/hooks/useNetworkStats.ts) hook.
- **Wallet Profiler** – connect a wallet to inspect balances, recent transfers and usage trends.
- **Token Flow Analyzer** and **Contract Decoder** dashboards.
- **Onchain Alerts**, **Quests** and XP‑driven achievements.
- Separate [Onchain Score view](alphiq-dashboard/app/onchain-score/page.tsx) with leaderboards, history chart and score multipliers.

Imports on the main page show many of these components working together:

```ts
import { LiveStats } from '@/components/LiveStats'
import { WalletProfiler } from '@/components/WalletProfiler'
import { AnimatedGauge } from '@/components/animated-gauge'
import { ProgressBar } from '@/components/progress-bar'
```

## Getting Started

1. Install Node.js (18 or newer).
2. Install dependencies with [pnpm](https://pnpm.io):
   ```bash
   cd alphiq-dashboard
   pnpm install
   ```
3. Run the development server:
   ```bash
   pnpm dev
   ```
   Then open `http://localhost:3000` in your browser.

The project also includes `build`, `start` and `lint` scripts defined in `package.json`.

## Repository Layout

- **app/** – Next.js pages including the primary dashboard and the onchain score page.
- **components/** – reusable UI widgets such as charts, animated gauges and Radix‑based primitives.
- **hooks/** – small data‑fetching utilities for network stats and address activity.
- **lib/** – helper functions.
- **public/** – placeholder images and static assets.
- **styles/** – global CSS and Tailwind configuration.

## Customization Tips

```text
| Change                         | File(s) to edit                           |
| ------------------------------ | ----------------------------------------- |
| **Rearrange panels**           | `app/page.tsx`                            |
| **Global typography**          | `app/globals.css` or `styles/globals.css` |
| **Add header/footer**          | `app/layout.tsx`                          |
| **Update score logic**         | `lib/utils.ts` + `components/animated-gauge.tsx` |
| **Badge XP bar styling**       | `components/progress-bar.tsx`             |
| **Color palette**              | `tailwind.config.ts` & `components/theme-provider.tsx` |
| **Replace logos/placeholders** | `/public/placeholder-*.{png,svg,jpg}`     |
| **Install new UI component**   | `pnpm add ...` + import in `components/ui/` |
```

## License

This project is licensed under the Apache 2.0 License. See the [LICENSE](LICENSE) file for details.
