# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Next.js 14+ (App Router) project foundation with Tailwind CSS 4.
- Minimalist design system and global CSS configuration adhering to brand guidelines.
- Font integration (Geist for headings, Source Sans 3 for body).
- Offline-first architecture initialized with Dexie.js (`lib/db.ts`) encompassing `projects`, `content_items`, and `tasks`.
- Global state management initialized via Zustand (`store/useAppStore.ts`).
- Local Supabase instance configuration and initial SQL migrations with RLS policies.
- Sync Engine skeleton (`lib/sync.ts`) for deferred cloud syncing.
- `/splash` page with specific outline-to-fill and typewriter animations using Framer Motion.
- Basic Authentication UI (`/login`, `/signup`) with server actions.
- Core UI components:
  - Sidebar layout navigation.
  - Dashboard view (`/`) with mock data mapping.
  - Universal Writer (`/writer`) with distraction-free layout and meta panel.
  - Projects View (`/projects`).
- Development authentication bypass implemented in `middleware.ts`.

### Changed
- Refined Splash Screen animation to meet strict letter-by-letter left-to-right fill requirements.
- Temporarily disabled Supabase auth checks in `middleware.ts` to allow testing of all routes locally.

### Fixed
- Next.js App Router initialization errors resolved by using temporary directory building and copying files to prevent path conflicts.
