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

## Problem 5: Supabase Auth Email Enumeration & Strict Segregation
**Context:** The application required strict separation between Signup (new users only) and Login (existing users only), with explicit error messages ("User already exists" or "User not found"). Supabase obscures these errors by default for security (Email Enumeration Protection).
**Solution:** We built the front-end to explicitly map specific error string subsets to the requested UX messages. However, for "User not found" to trigger appropriately, the project administrator must toggle off "Email Enumeration Protection" in the Supabase Dashboard. Without this, Supabase will uniformly return "Invalid login credentials". We also implemented a robust validation layer in `src/lib/validation.ts` to intercept disposable emails and weak passwords before they ever hit the Supabase API.

## Problem 6: Custom Cursor in Next.js 14
**Context:** Adding a global custom cursor caused hydration mismatch errors and interfered with mobile touch interactions.
**Solution:** Created a client-side only `<Cursor />` component mounted in `layout.tsx`. It uses `window.matchMedia("(pointer: coarse)")` to detect touch devices and cleanly unmounts itself to preserve native mobile behavior. It uses CSS `mix-blend-difference` for high-contrast visibility across light/dark backgrounds.
