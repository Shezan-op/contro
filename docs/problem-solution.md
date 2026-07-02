# Problem / Solution Log

This document tracks implementation challenges, architectural roadblocks, and the applied solutions.

## Problem 1: Next.js Initialization Path Conflicts
**Context:** Creating a new Next.js project via `create-next-app` failed due to conflicting files already existing in the target root folder (`docs/`, markdown specifications).
**Solution:** Initialized the Next.js project in a temporary subdirectory (`contro_temp`), then moved all generated hidden and visible files (`.*` and `*`) into the root directory before deleting the temp folder. This bypassed `create-next-app` strict path checks while maintaining documentation integrity.

## Problem 2: Next.js Middleware Intercepting Development Workflow
**Context:** Supabase authentication was configured in `src/middleware.ts` to strictly redirect unauthenticated users to `/splash` and `/login`. This blocked rapid UI development and testing of protected routes.
**Solution:** Temporarily implemented an auth bypass in `middleware.ts` (`return NextResponse.next()`) to grant immediate local access to all routes (e.g., `/projects`, `/writer`, `/inventory`). This will be removed prior to production deployment.

## Problem 3: Splash Screen Animation Requirements
**Context:** Standard Framer Motion `opacity` animations were insufficient for the specific "static outline with left-to-right fill" requirement.
**Solution:** Employed CSS `WebkitTextStroke` to render the transparent static outline. Utilized Framer Motion's `clipPath` property (`inset(0 100% 0 0)` to `inset(0 0% 0 0)`) to cleanly wipe the solid text color across the screen letter-by-letter, matching the premium aesthetic.

## Problem 4: Tailwind Typography Plugin Resolution Error in Next.js Turbopack
**Context:** The Next.js 14+ (Turbopack) build crashed with `CssSyntaxError: Can't resolve '@tailwindcss/typography'` when importing the plugin via `@plugin "@tailwindcss/typography";` in `globals.css`. 
**Solution:** Removed the `@tailwindcss/typography` dependency and the plugin import. Instead, implemented custom CSS rules targeting `.tiptap-editor` directly in `globals.css`. This provides tighter control over the visual aesthetic (locking in Geist and Source Sans 3) while keeping the bundle lighter and avoiding the bundler resolution issue.
