# Contro

## Single Source of Truth Document

This document is the definitive record of the Contro product as discussed, planned, and decided so far. It captures the brand identity, core goal, product vision, application structure, screens, workflows, interactions, limits, and all product decisions that define how the application is intended to work.

This document intentionally excludes detailed system architecture and technical infrastructure design. Those will be created later.

---

# 1. Brand Identity

## 1.1 Project Name

**Contro**

## 1.2 Brand Positioning

Contro is a content operating system for writing, storing, categorizing, tracking, and reusing content in a simple, clean, structured way. It is designed for personal use and for a small circle of trusted users, not as a public multi-tenant SaaS with broad enterprise complexity.

It is not meant to become a Notion clone. It is meant to become a focused internal tool that helps manage content, lead magnets, strategies, proposals, documents, ideas, tasks, and project-based work with clarity.

The product should feel premium, calm, structured, and easy to use.

## 1.3 Design Principles

- Plain and minimal design.
- Clean and professional visual language.
- Support for Light Mode and Dark Mode.
- Usable, low-friction writing experience.
- Strong organization without clutter.
- Fast retrieval of saved content.
- Structured enough for serious use, but not overloaded with unnecessary features.
- Content-first interface.
- Simple, readable, corporate-premium style.
- Minimalism is followed, but not to the point of becoming sterile or lifeless.

## 1.4 Color Palette

### Light Theme

```css
--background: #FAFAFA;
--surface: #FFFFFF;
--text: #1A1A1A;
--muted: #6B7280;
--border: #E5E7EB;
```

### Dark Theme

```css
--dark-bg: #121212;
--dark-card: #1A1A1A;
--dark-text: #F5F5F5;
--dark-muted: #A1A1AA;
--dark-border: #2A2A2A;
```

## 1.5 Typography

- **Geist** from Google Fonts for all headings.
- **Source Sans 3** from Google Fonts for all body text.

## 1.6 Visual Tone

The product should feel:

- clean
- premium
- structured
- calm
- efficient
- modern
- corporate in a polished way
- not overly decorative
- not overly minimal to the point of feeling empty

The interface must support serious work without feeling like a toy.

---

# 2. Core Goal

## 2.1 Main Objective

Contro exists to make it easy to:

- write content,
- store content,
- categorize content,
- track content,
- find content,
- reuse content,
- manage project-based work,
- and keep everything organized in one place.

The purpose is not to build a general-purpose documentation platform. The purpose is to create a personal content operating system.

## 2.2 Primary Use Case

The main use case is writing and managing content in a structured way for:

- personal work,
- internal work,
- close collaborators,
- and project-based content storage.

The application should help the user avoid scattered Google Docs, buried files, slow manual search, and disconnected content storage.

## 2.3 Strategic Intent

The product is designed as a personal portfolio project that is also useful in real life. It should be valuable enough to use every day and impressive enough to demonstrate real product thinking and execution.

The goal is not to mimic Notion. The goal is to build a more focused system around a narrower, real workflow.

---

# 3. Product Vision

## 3.1 Product Identity

Contro is a **Content Operating System**.

The product revolves around four core actions:

- Capture
- Organize
- Retrieve
- Reuse

Every feature should support one or more of those actions.

## 3.2 What Contro Is Not

Contro is not:

- a general Notion clone,
- a collaboration-heavy enterprise platform,
- a public multi-user workspace product,
- a PDF export tool,
- a design tool,
- a project management tool in the ClickUp sense,
- a task monster,
- a bloated second brain,
- or a folder labyrinth.

## 3.3 Product Strategy

The product should remain limited, intentional, and practical.

It should not attempt to cover every possible productivity workflow. Instead, it should be extremely good at the specific workflows discussed.

The product should reduce the number of clicks, reduce the amount of thinking, and reduce the time needed to:

- write,
- save,
- organize,
- search,
- open,
- reuse,
- and track content.

## 3.4 Guiding Product Rule

When deciding whether to add something new, the product should ask:

**Does this help users write, store, organize, find, or reuse content more easily?**

If the answer is no, the feature does not belong in this product.

---

# 4. Product Scope and Limits

## 4.1 Included Scope

Contro includes:

- authentication,
- dashboard,
- universal editor,
- independent drafts,
- project organization,
- inventory sections,
- lead magnet drafting,
- tasks and reminders,
- scratchpad,
- settings,
- tags,
- search,
- stars,
- archive,
- trash,
- saved states,
- autosave,
- offline-first writing behavior,
- notification behavior,
- responsive navigation,
- quick actions,
- shortcuts,
- recent items,
- pinned projects,
- duplication handling,
- and project-level categorization.

## 4.2 Excluded Scope

The product does **not** currently include:

- detailed system architecture documentation,
- technical infrastructure design,
- PDF export,
- history timeline as a formal feature,
- analytics,
- admin dashboard,
- nested folders,
- nested subprojects,
- subfolders inside projects,
- collaboration-heavy permissions design,
- public marketplace behavior,
- broad enterprise workflows,
- or full Notion parity.

## 4.3 Feature Limitation Philosophy

The product deliberately avoids unnecessary complexity.

It is intentionally limited to keep the experience clean and manageable.

This includes:

- no subfolders inside a project,
- no subprojects inside a project,
- no admin dashboard,
- no PDF export,
- no analytics layer,
- no bloated archive strategy,
- no unnecessary feature sprawl.

---

# 5. Product Structure Overview

## 5.1 Main Structure

The core top-level structure is:

- Dashboard
- Writer
- Lead Magnets
- Inventory
- Projects
- Tasks
- Profile
- Settings

## 5.2 Inventory Subsections

The Inventory section contains:

- Hooks
- CTAs
- Ideas
- Offers
- DM Scripts
- Proposals / Contract Documents

These are the primary reusable content banks.

## 5.3 Project Structure Philosophy

Projects are used as organized containers for content and files.

They are structured properly, but they do not contain nested folders or subprojects.

Each project is a single-level container.

---

# 6. Navigation and Information Architecture

## 6.1 Navigation Model

### Desktop and Tablet

- Desktop and tablet devices use a nav bar.
- Navigation should be fast, structured, and visible.

### Mobile

- Mobile devices use a menu bar.
- The interface should remain easy to navigate on smaller screens.

## 6.2 Sidebar Structure

The sidebar structure is intentionally clean and limited.

Suggested primary structure:

- Dashboard
- Writer
- Lead Magnets
- Inventory
  - Hooks
  - CTAs
  - Ideas
  - Offers
  - DM Scripts
  - Proposals / Contract Documents
- Projects
- Tasks
- Profile
- Settings

## 6.3 Access Philosophy

The product should make it immediately obvious where everything lives.

The user should not feel lost.

The product should reduce uncertainty about where content is stored and how to find it again.

---

# 7. User Model and Permission Philosophy

## 7.1 Internal Use Case

The application is intended for internal use and close people only.

It is not designed as a public open platform.

## 7.2 Admin Concept

There is no separate admin dashboard.

The user is effectively the admin.

Because of that, the settings area serves the configuration function instead of a separate admin layer.

## 7.3 Workspace Philosophy

The app behaves like a personal operating environment.

It is a controlled and familiar system for the user and trusted users, not a public-scale governance platform.

---

# 8. Screen-by-Screen Specification

## 8.1 Dashboard

### Purpose

The dashboard is the landing area and command center.

It should quickly show the user what matters now.

### Dashboard Content

The dashboard should include:

- profile name,
- content dashboard,
- a weekly calendar view,
- a full monthly view when expanded,
- arrows to browse months,
- view to-do list,
- view inventory,
- content ideas bank,
- hooks bank,
- CTA bank,
- view this week tasks,
- top 3 tasks,
- view all button for the task list,
- recent items,
- pinned projects,
- quick actions,
- and shortcuts to core areas.

### Weekly and Monthly Calendar

The content dashboard should show:

- week-specific calendar view by default,
- ability to expand to a full 30-day calendar,
- ability to move across months using arrows.

### Dashboard Purpose in Practice

The dashboard is not just a summary screen.

It is the user's daily control room.

It should help answer:

- What is due today?
- What was recently created?
- What is pinned?
- What is important?
- What is being worked on this week?

### Dashboard Tone

The dashboard should remain visually clean and not overloaded.

It should support fast action, not become decorative noise.

---

## 8.2 Writer

### Purpose

The Writer is the core content creation area.

This is where the user writes text-based content and stores it.

### Writer Purpose

The Writer supports:

- content writing,
- captions,
- newsletter drafts,
- copy,
- hooks,
- CTAs,
- documents,
- and other text-based content.

### Writer Behavior

The Writer should behave like a live writing environment.

Users should be able to:

- start typing immediately,
- write first,
- edit later,
- format later,
- save automatically,
- and optionally attach the draft to a project.

### Writer Philosophy

The writer should not force a heavy form-first process.

The user should be able to enter raw thoughts quickly and organize later.

### Writer Assignment Logic

When writing opens, the content should be independent by default.

The user may also assign it to a project from a dropdown while writing.

This means:

- content can exist independently first,
- content can be moved into a project later,
- content can be saved directly into a project if selected.

### Writer Fields

For general content, the writer includes fields such as:

- Heading / Hook / Title
- Title V2
- Content / Body Text
- CTA box

### Writer Preview

The Writer includes a LinkedIn-inspired preview.

This preview is not an exact LinkedIn clone.

It should visually resemble how a LinkedIn post appears, including:

- image placement,
- name area,
- heading style,
- and post-style content flow.

### Writer Save States

The Writer must show clear save states:

- Saving...
- Saved
- Unsaved

The app should save locally immediately and sync quietly in the background.

### Writer Offline Behavior

If the internet is lost, writing should continue.

The draft should remain locally available.

When connectivity returns, the app should save or sync automatically.

### Writer Recovery Behavior

If the browser closes accidentally or the tab is restored, the draft should reopen automatically, similar to restoring browser tabs.

### Writer Back Button Behavior

If the user accidentally clicks back while editing, the app should not immediately lose work.

Instead, it should present options such as:

- Save
- Don't Save
- Cancel

### Writer Duplicate Handling

If a user tries to save content in a project where a document with the same title already exists, the system should handle duplication properly.

The behavior should be:

- warn the user,
- ask whether to replace the existing item,
- allow the user to rename if they ignore replacement,
- or let them cancel.

### Writer Search and Retrieval Philosophy

The Writer is not just for typing.

It is also a source of saved content that should be easy to search later and reuse elsewhere.

---

## 8.3 Lead Magnets

### Purpose

The Lead Magnets section stores and edits lead magnet content.

This is for structured downloadable-style content that is often used later in Canva or similar tools by copy-pasting.

### Lead Magnet Design Philosophy

Lead magnets are not being exported as PDFs from Contro.

Instead, Contro stores the source content so it can be reused, copied, and assembled elsewhere.

### Lead Magnet Fields

The lead magnet area includes fields such as:

- Title / Heading
- Subheading
- Body
- CTA
- Assets link such as cover image

### Lead Magnet Page-by-Page Structure

Lead magnets must support page-by-page content.

This is important because lead magnets are often structured in sections or pages.

The user should be able to build lead magnets in a segmented format.

### Lead Magnet Preview

The lead magnet preview should feel like a document or page-based preview.

It should reflect the page-like feel of a lead magnet without exporting a PDF.

### Lead Magnet Editing Philosophy

The lead magnet editor should allow:

- pasting raw content first,
- then editing alignment,
- bold,
- italics,
- formatting,
- and structure later.

### Lead Magnet Workflow

A user should be able to:

1. create a lead magnet draft,
2. enter title and basic details,
3. paste the page-by-page body,
4. attach assets,
5. preview the structure,
6. save it,
7. store it under a project or independently.

---

## 8.4 Inventory

### Purpose

Inventory is the reusable content bank.

It is a structured repository for repeat-use content assets.

### Inventory Subsections

The Inventory section contains:

- Hooks
- CTAs
- Ideas
- Offers
- DM Scripts
- Proposals / Contract Documents

### Inventory Philosophy

This section exists so reusable content is not scattered everywhere.

The inventory acts as a clean central bank for common content pieces.

### Inventory Features

Each inventory item should support:

- title,
- body,
- tags,
- search,
- stars,
- quick copy,
- and project association if needed.

### Inventory Retrieval Logic

Inventory items should be easy to find quickly through search or section navigation.

### Quick Copy Behavior

On desktop, users can hover and use a copy action.

On mobile and tablet, where hover is unavailable, copy must be accessible manually.

---

## 8.5 Projects

### Purpose

Projects are the structured containers for grouped content and files.

### Project Philosophy

A project is like a properly organized folder.

However, inside a project there are no subfolders and no subprojects.

One project is one container.

### Project Purpose in Practice

Projects are used to group together related work such as:

- client content,
- captions,
- newsletters,
- copy,
- lead magnets,
- proposals,
- contracts,
- documentation,
- and other saved pieces.

### Project Count Philosophy

Projects are unlimited.

The dashboard can pin only three projects.

The rest remain accessible through view-all and search.

### Project Pinning

- Up to 3 projects can be pinned.
- Pinned projects appear prominently.
- The rest can be accessed via show more / view all.

### Project Customization

Each project can be customized with:

- name,
- icon,
- a short 150-character description.

### Project Icons

A small icon library should be available.

Users can choose icons and customize projects visually.

### Project Tags and Categorization

Projects can contain files and content pieces.

Inside a project, tags can be used as small categories.

Tags are limited to 7 custom tags.

### Tag Philosophy

The system should already include common internal content categories such as:

- Content
- Captions
- Newsletter
- Offers
- DM Scripts
- Contracts / Proposals
- Documentation

Users can also create custom tags when needed.

### Tags and Categories

Tags are allowed to work like small category wrappers inside projects.

These help users group content inside a project without needing deeper nesting.

### Duplicate Rules Inside Projects

A project should not allow duplicate titles inside the same project without warning.

If a duplicate title is attempted, the user should be warned and given choices such as:

- Replace existing item,
- Ignore and rename,
- or cancel.

### Project Deletion Behavior

If a project is deleted, it goes to trash.

The project is not instantly destroyed.

### Project Archive Behavior

Projects can also be archived.

Archive should help hide completed or inactive projects while keeping them searchable.

### Project Search

Search should work inside a project as well as globally.

This is important for projects with many items.

### Project History of Saved Work

The user wants project-level storage to make it easier to find all work done for a client or project in one place.

The project should act as the home for that work.

### Project Workflow Example

A client project could contain:

- captions,
- newsletters,
- content drafts,
- hooks,
- proposals,
- contracts,
- and related files.

---

## 8.6 Tasks

### Purpose

Tasks are the daily and weekly action layer.

They help the user keep track of what needs to be done.

### Task List Behavior

The task list should be simple and usable.

It should support:

- daily tasks,
- weekly tasks,
- important marking,
- priorities,
- reminders,
- and completion tracking.

### Important Task Behavior

If a task is marked important, the app can prompt the user to add a reminder.

### Notification Reminder Logic

Reminders should not be spammy.

They should be used only to remind and not irritate.

### Notification Deep Link

When a reminder notification is clicked, it should open the task list section and ideally highlight or focus the relevant task.

### Reminder Completion Behavior

When the task is marked complete, the reminder should automatically turn off.

### Reminder Frequency Philosophy

The reminder can repeat at intervals such as every hour, but the purpose is only to keep the task visible and prevent forgetting.

### Reminder Timing Goal

The reminder exists to nudge the user toward completion, not to act like repetitive shopping-site spam.

### Task Dashboard Visibility

The dashboard should show top tasks, especially the top 3 items, with a view-all option.

---

## 8.7 Scratchpad

### Purpose

The scratchpad is a separate lightweight area for quick, temporary notes.

### Scratchpad Philosophy

The scratchpad should not interfere with the main editor.

It is for quick dumping of thoughts, ideas, or temporary text.

### Scratchpad Behavior

It should remain separate from structured documents.

It can later be converted into something more formal if needed.

### Scratchpad Constraints

It must not mess up the main editor or become confused with saved drafts.

---

## 8.8 Profile

### Purpose

The profile area is tied to authentication and user identity.

### Profile Content

The profile should show:

- the user identity,
- saved content counts,
- lead magnets count,
- strategy items,
- action plans,
- to-do lists,
- and other saved pieces.

### Profile Philosophy

The profile acts as a personal summary of the user’s stored work.

---

## 8.9 Settings

### Purpose

Settings are the place for personal configuration.

Since there is no admin dashboard, settings cover the user-level controls.

### Settings Content

Settings may include:

- theme selection,
- light mode / dark mode,
- notification preferences,
- autosave behavior,
- default project behavior,
- keyboard shortcuts,
- pinned project configuration,
- and data preferences.

### Settings Philosophy

Settings should support personalization without adding unnecessary complexity.

---

# 9. Core Workflows

## 9.1 Writing Workflow

1. Open Writer.
2. Start writing immediately.
3. Content begins as independent by default.
4. Optionally select a project from the dropdown.
5. Write the content body.
6. Add title, hook, CTA, and other fields as required.
7. View the LinkedIn-inspired preview.
8. Save automatically.
9. Reopen later from Recent, Search, Project, or Dashboard.

## 9.2 Lead Magnet Workflow

1. Open Lead Magnets.
2. Create a new item.
3. Add title, subheading, CTA, and assets.
4. Enter page-by-page content.
5. Paste raw content first if preferred.
6. Edit formatting and alignment later.
7. Preview the page-based structure.
8. Save locally and sync quietly.
9. Reuse the content later in external tools.

## 9.3 Project Workflow

1. Create a project.
2. Give it a name.
3. Set an icon.
4. Add a short description.
5. Assign content or files to it.
6. Use tags inside the project.
7. Search inside it when needed.
8. Pin it if it is one of the top 3 active projects.
9. Archive or trash when no longer active.

## 9.4 Inventory Workflow

1. Open Inventory.
2. Choose a subsection such as Hooks or CTAs.
3. Add reusable content.
4. Tag it.
5. Star it if important.
6. Copy it quickly when needed.
7. Reuse it in writing or projects.

## 9.5 Task and Reminder Workflow

1. Create a task.
2. Mark it important if necessary.
3. Optionally create a reminder.
4. The reminder sends a periodic nudge.
5. Clicking the reminder opens the task list.
6. Completing the task disables the reminder automatically.

## 9.6 Search Workflow

1. Open search.
2. Search like Google.
3. Search across titles, body, tags, projects, inventory, and stored items.
4. Jump directly to the relevant item.

## 9.7 Duplicate Handling Workflow

1. The user creates or saves a piece of content inside a project.
2. The app detects a duplicate title in that project.
3. A warning appears.
4. The user can replace, rename, or cancel.
5. The final result is clean and non-confusing.

## 9.8 Recovery Workflow

1. The user writes content.
2. The browser closes accidentally or the tab is interrupted.
3. The app restores the draft automatically when reopened.
4. Work is not lost.

---

# 10. Editor Design and Behavior

## 10.1 Universal Editor

Contro uses one universal editor.

This editor powers all content types.

Only the extra fields change based on the section or item type.

## 10.2 Editor Philosophy

The editor should feel familiar and easy.

It should support a Google Docs-type improvement, meaning:

- easy typing,
- simple formatting,
- copy-paste friendliness,
- quick editing,
- low friction,
- and comfort during long writing sessions.

## 10.3 Section-Specific Fields

The editor changes based on the item type.

### For Content

- Heading / Hook / Title
- Title V2
- Content / Body Text
- CTA box
- LinkedIn-inspired preview

### For Lead Magnets

- Title / Heading
- Subheading
- Body
- CTA
- Assets link
- Page-by-page structure
- preview like a document or page sequence

### For Other Content Types

The same editor system is reused with different field sets depending on the item type.

## 10.4 Raw Paste Then Refine

The editor should allow the user to paste in raw content first.

Later the user can refine:

- alignment,
- bold,
- italics,
- and structure.

## 10.5 Editor Independence

The scratchpad and the main editor must remain separate.

The scratchpad is for quick temporary notes.

The editor is for proper saved content.

---

# 11. Save and Data Behavior

## 11.1 Save Status

The app should clearly communicate save status.

### Required States

- Saving...
- Saved
- Unsaved

## 11.2 Local Draft First

Changes should save locally immediately.

Server sync should happen quietly.

## 11.3 Offline Behavior

If the app loses internet connection:

- writing continues,
- content remains available,
- local draft stays intact,
- sync resumes automatically when the connection returns.

## 11.4 Auto-Restore

If the tab or browser is accidentally closed, the draft should reopen automatically when possible.

This should feel like restoring a browser tab.

## 11.5 Save-Without-Disruption Philosophy

Saving should not interrupt the user unnecessarily.

The user should feel safe writing.

---

# 12. Search, Retrieval, and Organization

## 12.1 Search Philosophy

Search should behave like Google.

The user should be able to search naturally and quickly.

## 12.2 Search Scope

Search should cover:

- titles,
- body text,
- tags,
- projects,
- inventory entries,
- lead magnets,
- tasks,
- and other stored content.

## 12.3 Recent Section

The app includes a Recent section for accessibility.

This helps the user quickly reopen recently worked-on items.

## 12.4 Stars

The system uses stars.

Stars are important for marking key items.

## 12.5 Pins

Projects can be pinned.

Only 3 projects can be pinned on the dashboard.

## 12.6 Archive

Archive is included and works as a way to hide inactive items while preserving access and searchability.

## 12.7 Trash

Deleted items move to trash.

Trash retention is 15 days.

After that, items are removed.

## 12.8 Search Inside Projects

Projects can be large.

Search inside projects is required to find items quickly.

---

# 13. Tag System

## 13.1 Multiple Tags Allowed

Items can belong to multiple tags.

## 13.2 Tag Limits

Custom tags are limited to 7.

This is intentional and keeps the system from becoming tag-chaotic.

## 13.3 System Tags

The platform should include common predefined tags such as:

- Content
- Captions
- Newsletter
- Offers
- DM Scripts
- Contracts / Proposals
- Documentation

## 13.4 Custom Tags

Users can create their own tags when necessary.

## 13.5 Tag Philosophy

Tags act as small categories or wrappers inside projects and content groups.

---

# 14. Project Rules and Limits

## 14.1 Unlimited Projects

Projects are unlimited.

## 14.2 Pinned Projects

Only 3 projects can be pinned.

## 14.3 No Nested Structure

Projects contain files and content, but:

- no subfolders,
- no subprojects,
- no multi-level project nesting.

## 14.4 Project Customization

Each project can be customized with:

- name,
- icon,
- description.

## 14.5 Project Description Limit

Description is limited to 150 characters.

## 14.6 Duplicate Titles

Duplicate titles are not allowed silently inside the same project.

Warnings and replacement choices are required.

---

# 15. Notification System

## 15.1 Purpose

Notifications are reminders, not spam.

## 15.2 Reminder Triggering

If a task is marked important, the system can prompt the user to add a reminder.

## 15.3 Reminder Frequency

The reminder may repeat at an interval such as every hour until the task is completed or the reminder is turned off.

## 15.4 Notification Click Behavior

Clicking the notification should open the task list section and take the user directly to the relevant task or task area.

## 15.5 Reminder Completion Behavior

When the task is marked complete, the reminder should automatically stop.

## 15.6 Notification Design Intent

The reminder exists to nudge, not to annoy.

---

# 16. Quick Actions and Shortcut Logic

## 16.1 Floating Quick Action Button

A floating button should allow fast creation.

### Example Quick Actions

- New Draft
- New Project
- New Task
- New Lead Magnet

## 16.2 Keyboard Shortcuts

Keyboard shortcuts are required.

They should support faster navigation and action.

### Shortcut Intent

- search quickly,
- create quickly,
- save quickly,
- close dialogs quickly,
- and reduce friction.

## 16.3 Command Shortcut List

A command shortcut list should exist and be connected properly so users can quickly discover and use shortcuts.

## 16.4 Command Search Philosophy

A command shortcut search should help the user jump to tools and content fast.

---

# 17. UX and Interaction Rules

## 17.1 No Clutter Rule

The app should remain structured and not visually overloaded.

## 17.2 Empty States

Empty states must be designed.

They should guide the user without making the interface feel dead.

## 17.3 Autosave Behavior

Autosave should happen naturally and quietly.

## 17.4 Unsaved Draft Warning

Leaving the editor should not lose work silently.

## 17.5 Copy Behavior

Content should be easy to copy manually or quickly.

### Desktop

Hover copy is allowed.

### Mobile and Tablet

Manual copy is required because hover does not exist.

## 17.6 LinkedIn-Inspired Preview

The preview should look inspired by LinkedIn’s post style.

It should not be exact.

## 17.7 Live Preview Principle

The preview should help the user understand how the content will appear once pasted or published elsewhere.

---

# 18. Mobile, Tablet, and Desktop Behavior

## 18.1 Desktop

Desktop should use a nav bar and support keyboard shortcuts comfortably.

## 18.2 Tablet

Tablet should remain usable, visually balanced, and touch-friendly.

## 18.3 Mobile

Mobile should use a menu bar and maintain access to the same core flows.

## 18.4 Responsive Priority

The app must remain practical across device types without losing clarity.

---

# 19. Content Storage Philosophy

## 19.1 Content as Source of Truth

Contro stores content as the source of truth.

It is not a PDF export platform.

## 19.2 Copy-and-Use Workflow

The main flow is to store content so it can be copied into tools like Canva or other editors later.

## 19.3 Independent Drafts

Drafts can begin independently and later be assigned to projects.

## 19.4 Project-Based Saving

Users can select a project during writing so the content is stored directly under that project.

---

# 20. Allowed Content Types and Storage Intent

The app is intended to handle a wide range of text-based content, including:

- content posts,
- captions,
- newsletters,
- offers,
- hooks,
- CTA libraries,
- DM scripts,
- proposals,
- contract documents,
- documentation,
- strategy notes,
- plans of action,
- lead magnets,
- project work,
- and other reusable written assets.

---

# 21. Product Decisions Locked In

The following decisions are locked in:

- The product name is Contro.
- The product is a content operating system.
- The design is plain, minimal, and premium.
- Light and Dark mode are supported.
- Geist is used for headings.
- Source Sans 3 is used for body text.
- The app uses a universal editor.
- Lead magnets support page-by-page structure.
- No PDF export is needed.
- LinkedIn-inspired preview exists but is not an exact clone.
- Projects are unlimited.
- Only 3 projects can be pinned.
- Projects contain files but no subfolders or subprojects.
- Each project is customizable by name, icon, and short description.
- Description length is limited to 150 characters.
- Search behaves like Google.
- Search works globally and inside projects.
- Tags can be multiple.
- Custom tags are limited to 7.
- Core item categories are Content, Captions, Newsletter, Offers, DM Scripts, Contracts / Proposals, and Documentation.
- Duplicate titles inside a project trigger a warning.
- Content starts as independent by default and can be assigned to a project.
- Autosave is local-first with quiet sync.
- Offline writing is supported.
- Draft recovery is automatic.
- Save states are shown clearly.
- Notification clicks deep-link to the task list.
- Task reminders stop when the task is complete.
- Trash retention is 15 days.
- Archive exists.
- Stars exist.
- Recent exists.
- Quick actions exist.
- Keyboard shortcuts exist.
- A scratchpad exists and remains separate from the main editor.
- There is no admin dashboard.
- There is no nested folder system.
- There is no analytics requirement.
- There is no history timeline feature requirement right now.

---

# 22. Screens and Their Intended Relationship

## 22.1 Dashboard

The central summary and action screen.

## 22.2 Writer

The main content creation screen.

## 22.3 Lead Magnets

Structured long-form lead magnet storage and editing.

## 22.4 Inventory

Reusable content banks.

## 22.5 Projects

Organized content containers for grouped work.

## 22.6 Tasks

Task and reminder management.

## 22.7 Profile

User identity and personal content summary.

## 22.8 Settings

Theme, preferences, and personalization controls.

## 22.9 Scratchpad

A temporary note capture area separate from formal content.

---

# 23. User Journey Summary

## 23.1 Primary User Journey

The expected daily path is:

1. Open Contro.
2. Check dashboard.
3. See today’s tasks, recent items, and pinned projects.
4. Open Writer or Inventory.
5. Write or reuse content.
6. Save automatically.
7. Assign to a project if needed.
8. Add tags and stars.
9. Return later through Recent, Search, or Project views.

## 23.2 Project-Based Journey

1. Create project.
2. Customize project.
3. Add content, tags, and files.
4. Search inside the project later.
5. Keep related work grouped in one place.

## 23.3 Task Journey

1. Add task.
2. Mark important if needed.
3. Create reminder if desired.
4. Receive reminder.
5. Open task from notification.
6. Complete task.
7. Reminder turns off.

---

# 24. Important Product Constraints

The following constraints are intentionally part of the product design:

- Only 3 projects can be pinned.
- Custom tags are limited to 7.
- Project descriptions are limited to 150 characters.
- No subfolders.
- No subprojects.
- No PDF export.
- No admin dashboard.
- No analytics layer.
- No history timeline feature right now.
- No unnecessary bloated structure.
- No excessive feature creep.
- No public platform behavior.

---

# 25. Philosophy for Future Work

Any future changes must preserve the product’s core identity:

- simple,
- clean,
- content-first,
- easy to search,
- easy to write in,
- easy to reuse,
- and easy to keep organized.

Any future feature must be judged by whether it improves the core actions:

- Capture
- Organize
- Retrieve
- Reuse

If it does not, it should not be added.

---

# 26. Final Product Definition

Contro is a minimal but powerful personal content operating system.

It exists to store and structure text-based work in a way that is far easier to manage than scattered documents and unrelated notes.

It combines:

- a fast writer,
- a structured content store,
- a reusable inventory system,
- project-based grouping,
- task reminders,
- search,
- and a clean dashboard.

It is designed to feel useful immediately and remain useful over time.

It should help the user know exactly what has what, where it lives, and how to get back to it without friction.

---

# 27. Excluded Future Topics

The following are intentionally left for later and are not part of the current source of truth:

- detailed system architecture,
- backend infrastructure,
- database schema,
- deployment design,
- authorization architecture,
- technical implementation details,
- and non-product technical planning.

Those will be documented separately later.

---

# 28. Summary of the Original Intent Preserved

The original intent behind Contro was to create a private, highly usable content system that solves real personal workflow issues:

- content buried in scattered places,
- hard-to-find client work,
- no consistent home for written material,
- slow retrieval,
- and excessive friction when trying to reuse past work.

The entire design of Contro exists to eliminate that friction.

The product should therefore always remain a clean system for writing, storing, categorizing, and tracking content with clarity.

