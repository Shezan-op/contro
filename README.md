# Contro - Content Operating System

A premium, local-first, offline-capable Content Operating System designed for writing, storing, and organizing content seamlessly.

## Quick Start

### Prerequisites
- Node.js (v18+)
- npm / yarn / pnpm

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Local-First Architecture:** Built on IndexedDB (via Dexie.js) ensuring instantaneous loading and full offline capabilities.
- **Universal Content Model:** Drafts, Scheduled Posts, and Calendar items share a unified `UniversalContent` data structure.
- **Distraction-Free Writer:** A rich-text TipTap editor optimized for high-focus writing, with integrated meta-panels.
- **Inventory System:** A permanent reusable library for assets like Hooks, CTAs, Offers, and DM Scripts.
- **Premium UX:** High-end aesthetic featuring smooth micro-animations, glassmorphism overlays, and curated typography (Geist + Source Sans 3).

## Documentation

For a deeper dive into the system's design and progression, check out our documentation:
- [System Architecture](./docs/SYSTEM-ARCHITECTURE.md)
- [Changelog](./docs/CHANGELOG.md)
- [AI Guidelines](./docs/llms.txt)

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **State Management:** Zustand
- **Local Storage:** Dexie.js (IndexedDB)
- **Styling:** Tailwind CSS v4
- **Editor:** TipTap
- **Backend (Future-proof):** Supabase

## License

MIT
