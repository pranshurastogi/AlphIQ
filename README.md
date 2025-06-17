# AlphIQ Dashboard

[![Live Demo](https://img.shields.io/badge/demo-live-green)](https://alph-iq.vercel.app/) [![GitHub](https://img.shields.io/badge/github-repo-blue)](https://github.com/pranshurastogi/AlphIQ)

AlphIQ is a comprehensive, open-source analytics dashboard for the Alephium blockchain. It provides real-time blockchain metrics, wallet profiling, contract decoding, and gamified onchain scoring—all in a modern, extensible interface. Built with Next.js, React, Tailwind CSS, and Radix UI, AlphIQ is designed for both end-users and developers who want to explore, analyze, or extend Alephium's ecosystem.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Live Demo](#live-demo)
- [Screenshots](#screenshots)
- [Architecture & Technology](#architecture--technology)
- [Getting Started](#getting-started)
- [Repository Structure](#repository-structure)
- [Customization & Development](#customization--development)
- [Major Components Explained](#major-components-explained)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Project Overview

**AlphIQ** aims to make Alephium blockchain data accessible, interactive, and fun. It combines:
- **Live network stats** for transparency and monitoring
- **Wallet profiling** for users and analysts
- **Gamified onchain scoring** to incentivize engagement
- **Contract and token analytics** for developers and power users

Whether you're a blockchain enthusiast, developer, or data scientist, AlphIQ provides the tools and visualizations you need to understand and interact with Alephium.

---

## Features

### 1. Live Network Stats
- Fetches and displays real-time data from the Alephium explorer API
- Metrics include block height, transaction throughput, network health, and more
- Uses a custom React hook for efficient polling and updates

### 2. Wallet Profiler
- Connect any Alephium wallet to view balances, recent transfers, and usage trends
- Visualizes wallet activity with charts and tables
- Supports multiple wallet addresses

### 3. Token Flow Analyzer
- Visualizes token movements between wallets
- Helps track large transfers and token distribution
- Useful for both users and researchers

### 4. Contract Decoder
- Decodes and displays smart contract data
- Supports Ralph contracts and custom contract types
- Makes contract interactions transparent and understandable

### 5. Onchain Score & Leaderboards
- Calculates a gamified onchain score for each wallet
- XP, achievements, streaks, and multipliers
- Leaderboard and score history chart to track progress

### 6. Quests & Achievements
- Complete onchain actions to earn XP and unlock badges
- Encourages user engagement and learning

### 7. Customizable UI
- Built with Tailwind CSS and Radix UI for easy theming
- Responsive and accessible design
- Easily extendable with new components

---

## Live Demo

- **Try it now:** [alph-iq.vercel.app](https://alph-iq.vercel.app/)
- **GitHub:** [github.com/pranshurastogi/AlphIQ](https://github.com/pranshurastogi/AlphIQ)

---

## Screenshots
<img width="716" alt="Screenshot 2025-06-17 at 7 19 18 PM" src="https://github.com/user-attachments/assets/982de8e6-eee9-4b6c-968e-dcd0f9d80cff" />

<img width="716" alt="Screenshot 2025-06-17 at 7 19 35 PM" src="https://github.com/user-attachments/assets/9199f406-d16b-4685-9552-fa31a2272369" />

---

## Architecture & Technology

- **Frontend:** Next.js (React), TypeScript, Tailwind CSS, Radix UI
- **Data Fetching:** Custom React hooks, REST APIs (Alephium explorer)
- **State Management:** React state/hooks
- **Backend/API:** Next.js API routes (for blogs, etc.)
- **Deployment:** Vercel (see [Live Demo](https://alph-iq.vercel.app/))

---

## Getting Started

### Prerequisites
- **Node.js** v18 or newer
- **pnpm** (recommended) or npm/yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pranshurastogi/AlphIQ.git
   cd AlphIQ/alphiq-dashboard
   ```
2. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   ```
3. **Run the development server:**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.
4. **Build for production:**
   ```bash
   pnpm build
   pnpm start
   ```
5. **Lint the code:**
   ```bash
   pnpm lint
   ```

---

## Repository Structure

```
AlphIQ/
  alphiq-dashboard/
    app/            # Next.js pages (dashboard, onchain score, API routes)
    components/     # Reusable UI components (charts, cards, primitives)
    hooks/          # Custom React hooks for data fetching and logic
    lib/            # Helper functions and utilities
    public/         # Static assets (logos, images)
    styles/         # Global CSS and Tailwind config
    ...
  LICENSE
  README.md
```

### Key Directories and Files

- **app/**
  - `page.tsx`: Main dashboard page, orchestrates layout and data fetching
  - `onchain-score/page.tsx`: Dedicated page for onchain scoring and leaderboards
  - `api/`: Next.js API routes (e.g., `/api/blogs` for blog posts)
  - `layout.tsx`: Global layout, header/footer, and theming
  - `globals.css`: Global CSS overrides
- **components/**
  - `LiveStats.tsx`: Displays real-time network stats
  - `WalletProfiler.tsx`: Wallet analytics and activity
  - `animated-gauge.tsx`: Animated gauge for scores/metrics
  - `progress-bar.tsx`: XP and progress visualization
  - `ContractDecoder.tsx`: Smart contract decoding UI
  - `leaderboard.tsx`, `score-history-chart.tsx`, `score-multiplier.tsx`: Gamification widgets
  - `ui/`: Radix UI-based primitives (buttons, dialogs, etc.)
  - `Footer.tsx`, `TopBar.tsx`: Layout and navigation
- **hooks/**
  - `useNetworkStats.ts`: Fetches and updates network stats
  - `useAddressInfo.ts`, `useAddressTransactions.ts`: Wallet data fetching
  - `useBlogPosts.ts`, `useTokenDistribution.ts`: Blog and token analytics
- **lib/**
  - `utils.ts`: Core logic for scoring, calculations, and helpers
  - `supabaseClient.ts`: (If used) Supabase integration for backend services
- **public/**
  - Placeholder images, logos, and static assets
- **styles/**
  - Tailwind CSS configuration and global styles
- **package.json**
  - Project dependencies and scripts
- **next.config.mjs**
  - Next.js configuration
- **tailwind.config.ts**
  - Tailwind CSS theme and color palette
- **tsconfig.json**
  - TypeScript configuration

---

## Customization & Development

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

### Adding New Features
- Create new components in `components/` and import them where needed
- Add new pages in `app/` following Next.js conventions
- Use hooks in `hooks/` for data fetching and logic separation
- Extend API routes in `app/api/` for backend logic

### Extending the Dashboard
- **Add a new metric:** Create a new hook in `hooks/`, a display component in `components/`, and import it in `app/page.tsx`
- **Change the theme:** Edit `tailwind.config.ts` and `components/theme-provider.tsx`
- **Add a new quest or achievement:** Update logic in `lib/utils.ts` and UI in relevant components

---

## Major Components Explained

- **LiveStats.tsx:** Fetches and displays up-to-date network stats using the custom `useNetworkStats` hook. Auto-refreshes and shows block height, TPS, and more.
- **WalletProfiler.tsx:** Lets users enter or connect a wallet address, then fetches balances, recent transactions, and visualizes activity.
- **ContractDecoder.tsx:** Accepts contract addresses or data, decodes using Alephium/Ralph standards, and presents human-readable info.
- **Leaderboard.tsx:** Ranks wallets by onchain score, XP, or achievements. Pulls data from scoring logic in `lib/utils.ts`.
- **AnimatedGauge.tsx:** Visually represents scores, XP, or other metrics with smooth, animated gauges.
- **ProgressBar.tsx:** Shows XP progress toward the next level or achievement.
- **BlogFeed.tsx:** (If enabled) Fetches and displays blog posts or updates from the team/community.
- **UI Primitives:** All basic UI elements (buttons, dialogs, etc.) are in `components/ui/` for easy reuse and customization.

---

## Contributing

**We welcome contributions of all kinds!**

Whether you want to fix a bug, add a feature, improve documentation, or suggest ideas, your help is appreciated. Here's how to get started:

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a new branch** for your feature or fix:
   ```bash
   git checkout -b feature/my-feature
   ```
4. **Make your changes** (see [Customization & Development](#customization--development) for guidance)
5. **Test your changes** locally
6. **Commit and push** to your fork:
   ```bash
   git commit -am 'Add new feature'
   git push origin feature/my-feature
   ```
7. **Open a pull request** on GitHub and describe your changes

### Contribution Guidelines
- Please follow the existing code style (TypeScript, functional React, Tailwind CSS)
- Write clear commit messages
- For major changes, open an issue first to discuss your ideas
- Add tests or documentation if relevant
- Be respectful and constructive in code reviews and discussions

**We especially encourage first-time contributors and Alephium community members to get involved!**

---

## License

This project is licensed under the Apache 2.0 License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgements

- [Alephium](https://alephium.org/) for the blockchain and explorer APIs
- [Next.js](https://nextjs.org/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), and [Radix UI](https://www.radix-ui.com/) for the tech stack
- [Supabase](https://supabase.com/) if used for backend services
- All contributors and the Alephium community

---

_For questions, suggestions, or support, please open an issue or contact the maintainers._

---

> Project repo: [github.com/pranshurastogi/AlphIQ](https://github.com/pranshurastogi/AlphIQ)  
> Live demo: [alph-iq.vercel.app](https://alph-iq.vercel.app/)
