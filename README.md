<div align="center">
  
# ✍️ Contro
### The Content Operating System

<p align="center">
  A premium, local-first, offline-capable Content Operating System designed for writing, storing, and organizing your content seamlessly. Stop rewriting the same ideas—write once, deploy endlessly.
</p>

---

</div>

## ✨ Features

- **⚡ Local-First Architecture:** Built on IndexedDB (via Dexie.js), Contro ensures instantaneous loading and full offline capabilities. You never lose a draft.
- **🧱 Universal Content Model:** Drafts, Scheduled Posts, and Calendar items share a unified, scalable `UniversalContent` data structure.
- **🧘‍♂️ Distraction-Free Writer:** A rich-text TipTap editor optimized for high-focus writing, with an integrated, retractable meta-panel for tags and scheduling.
- **🏦 The Inventory System:** A permanent, reusable library for your high-leverage assets—Hooks, CTAs, Offers, and DM Scripts. Accessible instantly.
- **🎨 Premium UX:** High-end aesthetic featuring smooth micro-animations, glassmorphism overlays, and curated typography (Geist + Source Sans 3).
- **📱 Responsive & PWA Ready:** Installable as a Progressive Web App (PWA) with fluid scaling across mobile and desktop.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm / yarn / pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Shezan-op/contro.git
   cd contro
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Enter the Workspace:** Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Architecture & Documentation

For a deeper dive into how Contro is built under the hood, explore the detailed documentation:

- 📐 **[System Architecture](./docs/SYSTEM-ARCHITECTURE.md)**: Details on state management, IndexedDB storage, and data flow.
- 🔄 **[User Flow Diagram](./docs/user-flow.md)**: A complete mapped journey of how users navigate the system and create content.
- 📝 **[Changelog](./docs/CHANGELOG.md)**: History of releases and feature additions.
- 🤖 **[AI Guidelines](./docs/llms.txt)**: Strict conventions for AI agents interacting with the codebase.

---

## 🛠️ Tech Stack

### Core
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** Radix UI / Framer Motion

### State & Data
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Local Storage:** [Dexie.js](https://dexie.org/) (IndexedDB wrapper)
- **Editor:** [TipTap](https://tiptap.dev/) (Headless rich-text editor)

### Infrastructure
- **Deployment:** Vercel (with Vercel Analytics)
- **Backend Architecture:** Supabase-ready (Future-proofed)

---

## 📜 License

This project is licensed under the **MIT License**.
