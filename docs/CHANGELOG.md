# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Next.js 14+ (App Router) project foundation with Tailwind CSS 4.
- Minimalist design system and global CSS configuration adhering to brand guidelines.
- Font integration (Geist for headings, Source Sans 3 for body).
- Offline-first architecture initialized with Dexie.js (`lib/db.ts`) encompassing Universal Content, Tasks, Projects, and Inventory.
- Global state management initialized via Zustand (`store/useAppStore.ts`).
- Local Supabase instance configuration and initial SQL migrations with RLS policies.
- Sync Engine skeleton (`lib/sync.ts`) for deferred cloud syncing.
- `/splash` page with specific outline-to-fill and typewriter animations using Framer Motion.
- Basic Authentication UI (`/login`, `/signup`) with server actions.
- Client-side authentication interceptor in `AuthCheck.tsx`.
- Global search shortcut (`Cmd+K` / `Ctrl+K`).
- Core UI components:
  - Sidebar and Mobile navigation.
  - Dashboard view (`/`) with Quick Actions and Upcoming Tasks/Calendar overview.
  - Universal Writer (`/writer`) with distraction-free layout and meta panel.
  - Projects View (`/projects`).
  - Tasks (`/tasks`) with inline creation and status toggling.
  - Inventory Library (`/inventory`) for permanent reusable assets.
  - Profile Page (`/profile`) with Workspace statistics.

### Changed
- Re-architected the Content model into a single `UniversalContent` structure for all drafts, calendar entries, and posts.
- Refined Splash Screen animation to meet strict letter-by-letter left-to-right fill requirements.
- Updated `AuthCheck.tsx` to automatically trigger `loadInitialData()` upon verification.
- Re-styled Interactive Elements: buttons have `active:scale-[0.98]` feedback, and cards feature a `.card-hover` lift.

### Fixed
- Fixed `AuthCheck` bug where `isChecking` was permanently true due to a missing initialization call.
- Resolved TypeScript errors regarding `ContentService` method calls in `writer/page.tsx`.
- Fixed "Open in Writer" functionality on the Calendar page to correctly route to `/writer?id={id}`.
- Fixed `CssSyntaxError` caused by `@tailwindcss/typography` failing to resolve in Turbopack by writing custom editor styles natively in `globals.css`.
