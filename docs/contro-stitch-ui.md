# Contro, Stitch UI Master Prompt

Use this document as the full prompt for Stitch to generate a connected, exportable UI prototype for Contro.

## 1. Project Context

Build **Contro**, a clean, premium, minimal **Content Operating System** for writing, storing, organizing, searching, tracking, and reusing content.

This is a personal and close-use workspace product, not a public social app. The UI should feel calm, structured, premium, and highly usable.

The interface must support both **desktop** and **mobile** versions.

The prototype should be fully connected, interactive, and export-ready.

## 2. Brand Identity

### Visual Style

* Minimal, plain, premium, corporate-clean.
* Not flashy, not playful, not cluttered.
* Spacious layout with strong readability.
* Modern, polished, and practical.

### Light Theme Colors

* Background: `#FAFAFA`
* Surface: `#FFFFFF`
* Text: `#1A1A1A`
* Muted: `#6B7280`
* Border: `#E5E7EB`

### Dark Theme Colors

* Background: `#121212`
* Card: `#1A1A1A`
* Text: `#F5F5F5`
* Muted: `#A1A1AA`
* Border: `#2A2A2A`

### Typography

* Headings: **Geist**
* Body: **Source Sans 3**

### Design Tone

* Content-first
* Calm and structured
* Clean cards
* Soft borders
* Strong hierarchy
* Minimal but not empty

## 3. Prototype Rules

* Create **both desktop and mobile screens** for every key flow.
* Keep desktop and mobile layouts consistent in structure and purpose.
* Make every major button, card, menu item, and navigation element clickable.
* Connect screens logically.
* Include filled states and empty states.
* Include modal and overlay interactions.
* Include save states, loading states, and confirmation states where relevant.
* The prototype should feel like a real working product, not static mockups.
* Keep the navigation simple and connected.

## 4. Core App Flow

The main flow is:

**Splash → Auth → Dashboard → Writer / Projects / Inventory / Tasks / Search / Scratchpad / Settings**

The app should always feel like one connected system.

## 5. Splash Screen

### Purpose

Introduce the Contro brand with a premium startup moment.

### Must Contain

* Centered Contro wordmark.
* Typewriting animation effect revealing `Contro` from `C` to `O`.
* Small loading/progress bar that moves as the letters appear.
* Minimal background.
* Premium startup feel.

### Navigation

* Splash leads to Auth screen.

## 6. Auth Screens

### Sign In Screen

**Contains:**

* Brand title
* Email input
* Password input
* Sign in button
* Optional forgot password link
* Minimal supporting text

**States:**

* Empty
* Filled
* Error
* Loading

**Navigation:**

* Sign In → Dashboard after success
* Sign In → Sign Up

### Sign Up Screen

**Contains:**

* Brand title
* Name input
* Email input
* Password input
* Create account button
* Optional switch to sign in

**States:**

* Empty
* Filled
* Error
* Loading

**Navigation:**

* Sign Up → Dashboard after success
* Sign Up → Sign In

## 7. Dashboard

### Purpose

The dashboard is the home base and daily command center.

### Contains

* Profile name / greeting
* Global search input
* Quick actions
* Content dashboard section
* Weekly calendar view
* Expand to full month view
* This week tasks
* Top 3 tasks
* Recent items
* Pinned projects (up to 3)
* Inventory shortcuts
* Notifications icon
* View all buttons
* View more / show more actions

### Buttons

* New Draft
* New Project
* New Task
* New Lead Magnet
* View All Tasks
* View Inventory
* View All Projects
* View Recent

### Interactions

* Clicking a project opens Project Detail.
* Clicking a task opens Tasks.
* Clicking an inventory shortcut opens Inventory section.
* Clicking Search opens Search overlay or Search page.
* Clicking quick action opens the relevant creation flow.
* Clicking calendar arrows changes month.
* Clicking weekly calendar expands into monthly calendar.

### Dashboard States

* Filled dashboard
* Empty dashboard
* Partial dashboard with only a few items

### Desktop Layout

* Top or side navigation visible.
* Multi-column dashboard cards.
* Quick access panels.

### Mobile Layout

* Menu-based navigation.
* Stacked cards.
* Compact task preview.
* Quick actions accessible via floating button.

## 8. Writer Screen

### Purpose

Primary place to write content.

### Contains

* Title / Hook / Heading field
* Title V2 field
* Content / Body text area
* CTA box
* Project dropdown
* Tags
* Save status indicator
* LinkedIn-inspired preview panel
* Toolbar for formatting
* Copy action
* Archive / delete / star actions where relevant

### Behavior

* Content begins as independent by default.
* User can assign it to a project from the dropdown.
* User can write first and organize later.
* Save states must show clearly: Saving, Saved, Unsaved.
* Draft should restore automatically if browser closes accidentally.
* Back button should warn if unsaved changes exist.

### Preview

* LinkedIn-inspired post preview.
* Not an exact clone.
* Should show how title, image, name-like header area, body, and CTA may appear visually.

### States

* Empty draft
* Draft with content
* Saving
* Saved
* Offline
* Duplicate title warning

### Navigation

* Writer → Project Detail if assigned to a project
* Writer → Dashboard
* Writer → Inventory if user wants to reuse content
* Writer → Scratchpad if temporary dumping is needed

### Desktop Layout

* Editor and preview side-by-side.

### Mobile Layout

* Editor first.
* Preview below or in tabs.

## 9. Lead Magnets Screen

### Purpose

Store and edit lead magnet content in structured page-by-page format.

### Contains

* Title / heading
* Subheading
* Body
* CTA
* Assets link / cover image reference
* Page-by-page content blocks
* Preview panel that feels like a document or page sequence
* Copy actions

### Behavior

* Paste raw content first.
* Edit formatting later.
* Page-by-page structure must be visible.
* No PDF export needed.
* This is for storage and reuse, especially for copying into Canva or similar tools.

### States

* Empty lead magnet
* Filled lead magnet
* Page list with multiple pages
* Partial draft

### Navigation

* Lead Magnets → Project Detail
* Lead Magnets → Dashboard
* Lead Magnets → Inventory if reuse is needed

### Desktop Layout

* Form/editor area plus preview.

### Mobile Layout

* Vertical stacked editor flow.

## 10. Projects Section

### Purpose

Organize work into project-based containers.

### Contains

* Project cards or project list/grid
* Project name
* Project icon
* Short 150-character description
* Tags
* Search within project
* Items inside project
* Pinned state indicator
* Archive and trash actions

### Project Rules

* Unlimited projects.
* Only 3 pinned projects.
* No subfolders.
* No subprojects.
* Duplicate titles inside the same project must trigger a warning.
* If project is deleted, move it to trash.

### Project Detail Screen

**Contains:**

* Project header
* Icon
* Name
* Description
* Tags
* Search inside project
* Items inside project
* Create new draft inside this project
* Open existing content inside this project
* Archive / trash options

### Project Item Types

* Content
* Captions
* Newsletter
* Offers
* DM Scripts
* Contracts / Proposals
* Documentation
* Lead magnets if stored here

### States

* Filled project with items
* Empty project
* Archived project
* Trashed project

### Navigation

* Projects list → Project Detail
* Project Detail → Writer for new draft
* Project Detail → relevant saved content
* Project Detail → Dashboard

### Desktop Layout

* Grid or list of project cards.
* Detail view with content list and filters.

### Mobile Layout

* Stack of project cards.
* Project detail with compact headers.

## 11. Inventory Section

### Purpose

Reusable content bank.

### Contains

* Hooks
* CTAs
* Ideas
* Offers
* DM Scripts
* Proposals / Contract Documents

### Behavior

* Searchable.
* Taggable.
* Star-able.
* Easy to copy.
* Built for reuse.

### States

* Empty bank section
* Filled bank section
* Search filtered section

### Navigation

* Inventory → item detail
* Inventory → Dashboard
* Inventory → Writer if content is being reused

### Desktop Layout

* Category list plus item content.

### Mobile Layout

* Category tabs or stacked sections.

## 12. Tasks Screen

### Purpose

Track what needs to be done.

### Contains

* Today tasks
* This week tasks
* Important tasks
* Priority labels
* Reminder toggle or indicator
* Completed tasks
* Top 3 visible tasks on dashboard

### Behavior

* Important task can prompt: “Add a reminder for this?”
* Reminder deep links back to Tasks.
* When task is marked complete, reminder turns off automatically.

### States

* Empty task list
* Filled task list
* Reminder active
* Task complete
* Overdue visual state

### Navigation

* Tasks → specific task details or task list state
* Tasks → Dashboard

### Desktop Layout

* List with filters, priority badges, and reminder states.

### Mobile Layout

* Compact stacked task cards.

## 13. Search Screen

### Purpose

Fast Google-like search across everything.

### Contains

* Large search bar
* Search results list
* Filters or tag chips
* Recent searches if needed
* Item type labels

### Search Scope

* Titles
* Body text
* Tags
* Projects
* Inventory
* Lead magnets
* Tasks
* Drafts

### Behavior

* Search should feel instant and broad.
* Clicking result opens the matching item.
* Search within project should also work.

### States

* Empty search
* No results
* Results list
* Filtered results

### Navigation

* Search → target screen/item
* Search → Dashboard

## 14. Scratchpad

### Purpose

Temporary dump space for raw thoughts.

### Contains

* Simple writing area
* Very lightweight note area
* Clear separation from formal editor

### Behavior

* Must not mix with the main editor.
* Can stay temporary.
* Can later be converted into a draft if the UI supports it.

### States

* Empty scratchpad
* Filled scratchpad

## 15. Profile Screen

### Purpose

Show the user identity and saved work summary.

### Contains

* Profile name
* Account summary
* Saved content counts
* Lead magnets count
* Projects count
* Tasks count
* Quick access links

### Navigation

* Profile → Settings
* Profile → Dashboard

## 16. Settings Screen

### Purpose

Personal configuration.

### Contains

* Theme switch
* Notification settings
* Autosave behavior settings
* Shortcut references
* Pinned project management
* Default behavior preferences
* General app preferences

### States

* Filled settings
* Default settings

### Navigation

* Settings → Dashboard
* Settings → Profile

## 17. Trash Screen

### Purpose

Hold deleted items safely for recovery.

### Contains

* Deleted items list
* Restore action
* Permanently delete action
* Retention warning

### Rules

* Items stay for 15 days.
* Projects deleted move to trash.
* Restore available until expiry.

## 18. Archive Screen

### Purpose

Hold inactive but preserved content.

### Contains

* Archived projects/items
* Restore action
* Search

## 19. Global Interaction Rules

* Every screen must connect logically to another screen.
* Every primary button must navigate or open a meaningful state.
* Every list item should open detail or editor.
* Every overlay should have a close action.
* Every back action should be safe.
* Every destructive action should confirm before proceeding.
* Every major section should have filled and empty states.
* Every desktop flow should have a mobile equivalent.

## 20. Component Expectations

Include clean reusable components for:

* Buttons
* Inputs
* Textareas
* Selects
* Cards
* Chips / tags
* Badges
* Task rows
* Project cards
* Inventory cards
* Search rows
* Preview panels
* Empty states
* Toasts
* Modals
* Dialogs
* Floating action button
* Sidebar / menu bar
* Navigation tabs
* Save state indicators
* Notifications

## 21. Prototype Connection Map

Use this screen flow:

Splash
→ Auth
→ Dashboard
→ Writer
→ Projects
→ Project Detail
→ Inventory
→ Tasks
→ Search
→ Scratchpad
→ Profile
→ Settings
→ Trash
→ Archive

Make every section reachable from the dashboard and navigation.

## 22. Filled and Empty State Requirement

For each screen, generate both:

* a filled version
* an empty version

Examples:

* Dashboard with real content
* Dashboard with no content
* Projects grid filled
* Projects empty
* Writer filled draft
* Writer blank draft
* Inventory filled
* Inventory empty
* Tasks filled
* Tasks empty

## 23. Desktop and Mobile Version Requirement

For every major screen above, generate:

* Desktop version
* Mobile version

Keep them consistent in structure and identity, but adapted to screen size.

## 24. Final Stitch Instruction

Generate a **fully connected interactive prototype** for Contro.

The prototype must:

* feel like one real app,
* keep the same visual identity across all screens,
* include desktop and mobile versions,
* include filled and empty states,
* include all major navigation paths,
* include overlays and modals,
* include typewriting splash animation with progress bar,
* and make every section, button, and screen logically connected.

The result should be exportable, realistic, and suitable as the UI foundation for the Contro product.
