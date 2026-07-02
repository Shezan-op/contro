# System Architecture

## Overview
Contro is built as a **local-first, offline-capable Content Operating System**. 
The application guarantees instant load times and complete functionality without an active internet connection by using IndexedDB as the primary source of truth, combined with Zustand for reactive global state.

---

## 1. Core Data Flow

### The "Local First" Approach
- **Dexie.js (IndexedDB):** The underlying database (`src/lib/db.ts`). Every read and write operation hits the local database first.
- **Zustand (`src/store/useAppStore.ts`):** The global reactive state. The store is hydrated from Dexie on startup (`loadInitialData()`), and acts as the immediate data source for React components.
- **Services (`src/services/`):** Abstraction layer that orchestrates updates. A typical operation (e.g., `ContentService.create`) will:
  1. Write the change to Dexie.
  2. Refresh the Zustand store.
  3. (Future) Push the delta to the Sync Engine.

---

## 2. Universal Content Model

Contro avoids disjointed data schemas by treating all written work as `UniversalContent`.

**What is Universal Content?**
Whether it's a draft, a scheduled social post, or an archived script, it uses the exact same schema.
- **Scheduling:** A post becomes a "calendar item" simply by setting the `scheduledFor` property.
- **Organization:** Folders are replaced by `projectId` relations and `contentPillars` tags.
- **State:** Drafts, archived, and trashed states are controlled by `status`, `archived`, and `trashed` boolean flags.

### Data Schemas

#### Universal Content
```typescript
interface UniversalContent {
  id: string;
  title: string;
  body: string;         // HTML string (TipTap output)
  cta?: string;
  projectId?: string;
  contentPillars: string[];
  platform?: string;    // e.g., 'twitter', 'linkedin'
  status: 'draft' | 'review' | 'ready' | 'published';
  scheduledFor?: number; // timestamp
  archived: boolean;
  trashed: boolean;
  starred: boolean;
}
```

#### Inventory Asset
```typescript
interface InventoryAsset {
  id: string;
  workspaceId: string;
  type: 'hook' | 'idea' | 'cta' | 'offer' | 'script' | 'proposal' | 'doc';
  title: string;
  content: string;
  tags: string[];
}
```
*Note: The Inventory is explicitly separate from Universal Content. It is a permanent, reusable library (templates, scripts) rather than consumable posts.*

---

## 3. UI and Styling Architecture

Contro uses **Tailwind CSS v4** combined with highly curated design tokens to maintain a premium, minimalistic aesthetic.

- **Global CSS (`globals.css`):** Defines CSS variables for themes (`--background`, `--surface`, `--text`, `--muted`, `--border`). These are dynamically controlled by the `ThemeProvider`.
- **Typography:** 
  - Headings: `Geist` (loaded via `next/font/local`)
  - Body: `Source Sans 3` (loaded via `next/font/google`)
- **Micro-Animations:** 
  - Interactive elements have an `active:scale-[0.98]` feedback loop.
  - Hover states utilize `transition-transform` and subtle box shadows.
  - Page transitions leverage `.animate-fade-in` and `.animate-slide-up`.

---

## 4. Backend & Sync (Deferred)

While primarily offline, Contro is configured to optionally synchronize with a Supabase backend.

- **Supabase Local:** Docker-based local setup for testing migrations and Row-Level Security (RLS) policies.
- **Sync Engine (`src/lib/sync.ts`):** 
  - Tracks a queue of mutations.
  - When a connection is available, the engine flushes the queue to Supabase.
  - Pulls down external mutations using a `lastSyncTimestamp`.

## 5. Security & Authentication

- **Client Side:** Authenticated states are cached locally (`contro_auth`). `AuthCheck.tsx` serves as a route guard.
- **Server Side (Supabase):** Enforces RLS, ensuring users can only read/write data linked to their `workspaceId`.
