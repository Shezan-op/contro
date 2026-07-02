# Contro
## Technical Blueprint, Part 3

This document covers the technical design of Contro in a way that is readable, implementation-aware, and easy to follow.

It focuses on the systems, methods, data flow, state handling, routing, storage, syncing, and behavioral logic needed to build the product.

Design system details are intentionally kept light here. This document is primarily technical and backend-related, while still including the UI-facing implementation logic that is necessary for development.

For each major system, a short reason is included to explain why it exists and what problem it solves.

---

# 1. Technical Goals

## 1.1 Primary Technical Goal

Build a local-first, offline-capable, content management application that supports writing, storing, categorizing, searching, and tracking content across projects and reusable libraries.

**Why this exists:** The entire product depends on reliable content capture and retrieval. If the app cannot safely store content and recover drafts, the core promise fails.

## 1.2 Technical Priorities

The technical system should prioritize:

- reliability,
- fast writing,
- safe saving,
- offline support,
- low friction,
- searchability,
- structured organization,
- and a maintainable codebase.

**Why this exists:** The product is content-first, so the technical architecture must protect the writing flow above everything else.

## 1.3 Stack Direction

The application will be built using:

- **Next.js**
- **React**

**Why this exists:** Next.js provides the application framework, routing, rendering flexibility, and deployment-friendly structure. React provides the component model required for the editor-heavy interface.

---

# 2. Application Architecture Overview

## 2.1 Architecture Style

Contro should follow a modular, feature-based application structure.

The app should not be built as one large monolithic UI file set.

Instead, each product area should be isolated into clear modules such as:

- dashboard,
- writer,
- lead magnets,
- inventory,
- projects,
- tasks,
- settings,
- shared UI,
- and shared state logic.

**Why this exists:** A feature-based structure prevents the app from becoming difficult to maintain as content types and interactions grow.

## 2.2 Product Data Flow

The data flow should follow this logic:

1. user edits content,
2. local state updates instantly,
3. local persistence saves immediately,
4. background sync updates the remote store,
5. UI save state updates visibly,
6. retrieval systems use indexed data for quick search and opening.

**Why this exists:** This keeps writing safe and responsive even when the network is weak or unavailable.

## 2.3 Local-First Principle

The app should always prefer local preservation before remote synchronization.

**Why this exists:** Content loss is one of the fastest ways to destroy user trust. Local-first behavior protects against browser crashes, accidental tab close, weak internet, and temporary failures.

---

# 3. Data Model Strategy

## 3.1 Core Entity Types

The app should be built around a small number of core entities:

- User
- Workspace identity / profile
- Draft
- Content item
- Lead magnet
- Inventory item
- Project
- Task
- Reminder
- Tag
- Star marker
- Archive marker
- Trash marker
- Scratchpad item
- Notification record
- Asset reference

**Why this exists:** The app is a content operating system. It must have a clear data vocabulary so content can be stored, filtered, moved, and reused without ambiguity.

## 3.2 Content-Type Based Modeling

Content should be stored in a flexible structure where each item has common fields plus type-specific fields.

Common fields may include:

- id,
- title,
- body,
- tags,
- project reference,
- status,
- createdAt,
- updatedAt,
- starred,
- archived,
- trashed,
- localDraftState,
- and search tokens.

Type-specific fields may include:

- CTA,
- preview metadata,
- page sections,
- assets,
- or reminder settings.

**Why this exists:** One shared content model reduces duplication while still allowing specialized behavior for lead magnets, inventory items, and standard drafts.

## 3.3 Project as Container Model

A project acts like a structured content container.

A project should hold references to items rather than forcing everything into deep nested folders.

**Why this exists:** This keeps the system simple. Projects remain clean containers without subfolder complexity.

## 3.4 Tag Model

Tags should be separate objects or structured references that can attach to many content items.

Users can assign multiple tags to one item.

**Why this exists:** Multiple tagging is more flexible than a single rigid category and supports real writing workflows where one item belongs in more than one conceptual bucket.

## 3.5 Trash and Archive Flags

Trash and archive should be modeled as explicit states or markers rather than deletion-only behavior.

**Why this exists:** Items need to be recoverable, manageable, and reversible without destructive loss.

---

# 4. Authentication and User Identity

## 4.1 Authentication Requirement

Contro requires authenticated user access.

Each user should have their own personal environment or workspace identity.

**Why this exists:** The app is built around saved work, personal organization, and private content. Authentication protects that structure.

## 4.2 User-Centric Workspace

The app is not designed for public anonymous usage.

It is a personal and close-group internal tool.

**Why this exists:** The product is meant to act like a personal operating system, not a public collaborative SaaS.

## 4.3 Ownership Logic

Content should belong to a user account and be accessible only within that user’s environment.

**Why this exists:** This prevents mixing of content and keeps each user’s workspace independent and clear.

---

# 5. Storage Strategy

## 5.1 Storage Layers

Contro should use a layered storage strategy:

- immediate local draft storage,
- remote authenticated storage,
- and metadata storage for search and organization.

**Why this exists:** Different kinds of data need different handling. Draft text must be safe instantly, while metadata must be structured for fast retrieval.

## 5.2 Local Draft Storage

Draft text should be stored locally as the user types.

**Why this exists:** Local draft storage protects against accidental data loss and keeps the editor responsive.

## 5.3 Remote Sync Storage

When connected, data should synchronize quietly to the server.

**Why this exists:** Remote storage ensures that work is not trapped on one device and can be restored later.

## 5.4 Asset Storage

Asset references such as images or cover links should be stored separately from raw text content.

**Why this exists:** Assets have different storage and retrieval needs than text. Keeping them separate makes the system cleaner and more efficient.

## 5.5 Metadata Storage

Metadata such as tags, stars, archive state, project links, reminder state, and timestamps should be stored in a structured way for fast querying.

**Why this exists:** The app needs fast organization and filtering, not just raw text storage.

---

# 6. Offline and Recovery Systems

## 6.1 Offline-First Writing

The editor must continue working even if the internet is unavailable.

**Why this exists:** Writing should never stop because connectivity fails.

## 6.2 Local Continuity

When offline, the app must preserve changes locally and allow continued editing.

**Why this exists:** This keeps the system trustworthy during travel, weak network, or browser interruptions.

## 6.3 Automatic Recovery

If the browser tab or app window is closed unexpectedly, the app should restore the draft automatically when reopened.

**Why this exists:** Accidental close is a common failure mode. Recovery prevents frustration and content loss.

## 6.4 Sync Resume Behavior

When connectivity returns, local changes should sync quietly without requiring the user to manually resend or recover them.

**Why this exists:** The user should not have to think about network state for ordinary writing.

## 6.5 Offline State Indicator

The UI should clearly indicate offline status.

**Why this exists:** Users need confidence that their work is still being kept safe even when the network is unavailable.

---

# 7. Saving System

## 7.1 Save State Handling

The app should display explicit save states:

- Saving...
- Saved
- Unsaved

**Why this exists:** Clear save feedback reduces anxiety and prevents accidental loss concerns.

## 7.2 Debounced Save Logic

Typing should not trigger heavy remote writes on every keystroke.

The save system should use local persistence immediately and delay heavier sync actions in the background.

**Why this exists:** This avoids performance issues and improves typing smoothness.

## 7.3 Draft Reopen Logic

If the editor is reopened after interruption, the latest local draft should load first.

**Why this exists:** The user should continue from where they left off without hunting for the last state.

## 7.4 Conflict Safety

If multiple versions of the same item could exist, the system must resolve conflicts deliberately instead of silently overwriting important work.

**Why this exists:** Content systems fail when duplicate versions quietly destroy each other.

---

# 8. Editor System

## 8.1 Universal Editor Concept

Contro should use one shared editor engine for all content types.

The editor engine is the same, while the fields and templates change depending on the content type.

**Why this exists:** A shared editor reduces duplication and keeps the writing experience consistent.

## 8.2 Template-Driven Fields

Different item types should simply activate different field templates.

Examples:

- Content template
- Lead magnet template
- Proposal template
- Inventory template
- Scratchpad template

**Why this exists:** One core editor can remain stable while supporting many content use cases.

## 8.3 Editor Input Behavior

The editor should allow:

- raw paste,
- direct typing,
- formatting later,
- fast moving between sections,
- and simple edits without friction.

**Why this exists:** Users often write first and refine later.

## 8.4 Section-Specific Field Logic

### Standard Content

Fields such as:

- Heading / Hook / Title
- Title V2
- Body
- CTA

### Lead Magnets

Fields such as:

- Title
- Subheading
- Body
- CTA
- Assets
- Page-by-page sections

### Proposals / Documents

Fields such as:

- title,
- body,
- document structure,
- and supporting text blocks.

**Why this exists:** Different content types need different organizational layers, even if the editing engine itself is shared.

## 8.5 LinkedIn-Inspired Preview

The standard content editor should support a preview that resembles a LinkedIn post layout, but not an exact clone.

**Why this exists:** Writers need a visual sense of how content will read in a social-post format without building a full external platform replica.

## 8.6 Preview Purpose

The preview is for composition and readability, not for export.

**Why this exists:** The product stores content to be reused elsewhere, not to replace publishing platforms.

## 8.7 Editor Protection

The editor must protect the user from losing text during navigation, refresh, accidental close, or browser issues.

**Why this exists:** The editor is the most critical part of the app.

---

# 9. Search System

## 9.1 Search Philosophy

Search should feel like Google.

It should be fast, forgiving, and broad.

**Why this exists:** The user should not need to remember exact folder names or storage paths.

## 9.2 Search Scope

Search should scan across:

- titles,
- body text,
- tags,
- projects,
- inventory sections,
- lead magnets,
- tasks,
- and other relevant saved items.

**Why this exists:** The app is only useful if old work can be retrieved instantly.

## 9.3 Search Inside Projects

Projects must support internal search.

**Why this exists:** Projects can become large and need quick filtering inside the container.

## 9.4 Search Result Behavior

Search results should open the relevant item directly or take the user to the matching section.

**Why this exists:** Search should reduce work, not create extra navigation.

## 9.5 Search Priority Logic

Search should prioritize exact or near-exact matches while still supporting broader discovery.

**Why this exists:** Users often search by remembered phrases, tags, or partial names.

---

# 10. Reminder and Notification System

## 10.1 Purpose

Notifications exist to remind, not spam.

**Why this exists:** Reminders should be useful, not irritating.

## 10.2 Task Reminder Trigger

If a task is marked important, the app may prompt the user to add a reminder.

**Why this exists:** Important tasks deserve proactive visibility.

## 10.3 Notification Deep Link

Clicking a notification should take the user to the task list section.

**Why this exists:** Notifications should not be dead ends. They should land the user exactly where the action is needed.

## 10.4 Completion Shutdown

When a reminder task is marked complete, the reminder should automatically stop.

**Why this exists:** Completed work should no longer generate noise.

## 10.5 Reminder Frequency

Reminder frequency can repeat at a chosen interval such as hourly.

**Why this exists:** Repeated reminder visibility keeps important work from being forgotten.

## 10.6 Notification Scope

Notifications should be used mainly for tasks and reminders, not for every tiny content event.

**Why this exists:** Too many notifications make the system feel noisy and less trustworthy.

---

# 11. Project System Technical Logic

## 11.1 Project as Single-Level Container

A project should behave as a single-level content container.

No nested folders.
No subprojects.

**Why this exists:** This is the chosen organizational limit that keeps the UI simple and prevents structural bloat.

## 11.2 Project Metadata

Each project should store:

- name,
- icon,
- description,
- active status,
- pinned state,
- archive state,
- trash state.

**Why this exists:** Projects need enough metadata to be recognizable and manageable without being overcomplicated.

## 11.3 Project Pin Limit

Only 3 projects can be pinned.

**Why this exists:** The dashboard stays focused and does not become cluttered.

## 11.4 Project Archive and Trash

Projects can be archived or moved to trash.

**Why this exists:** This supports cleanup without destructive loss.

## 11.5 Project Item Uniqueness

Duplicate titles within the same project should be handled with explicit warnings.

**Why this exists:** This prevents confusion when the same project contains many items.

## 11.6 Project Searchability

Projects should be searchable globally and internally.

**Why this exists:** The user must be able to access old project work quickly.

---

# 12. Tagging and Categorization Logic

## 12.1 Multiple Tags per Item

An item can belong to multiple tags.

**Why this exists:** A single item can serve multiple categories in real workflows.

## 12.2 System Tags

The app should include the core system tags discussed earlier.

**Why this exists:** These represent the common content types the product is built to support.

## 12.3 Custom Tags

Users can create their own tags, limited to 7.

**Why this exists:** The app needs flexibility without encouraging uncontrolled tag sprawl.

## 12.4 Tags as Lightweight Categories

Tags should behave like compact category wrappers rather than heavy taxonomy.

**Why this exists:** This matches the user's desired simplicity.

---

# 13. Recent, Star, Archive, Trash Technical Rules

## 13.1 Recent

Recent items should be tracked so users can return to recently edited content quickly.

**Why this exists:** This is one of the fastest paths back into active work.

## 13.2 Stars

Stars should mark important items.

**Why this exists:** Important content deserves a one-click priority marker.

## 13.3 Archive

Archive should hide inactive content without losing it.

**Why this exists:** Not everything should be deleted just because it is not active.

## 13.4 Trash

Deleted content should move to trash.

**Why this exists:** Trash protects against mistakes.

## 13.5 Trash Retention

Trash retention is 15 days.

**Why this exists:** This gives enough time for recovery without creating permanent clutter.

---

# 14. Quick Actions and Shortcut Logic

## 14.1 Floating Action Button

A floating quick action should allow fast creation.

**Why this exists:** Creation should be available from anywhere without deep navigation.

## 14.2 Quick Action Targets

Quick actions should include:

- New Draft
- New Project
- New Task
- New Lead Magnet

**Why this exists:** These are the core creation flows users will need most often.

## 14.3 Keyboard Shortcuts

Keyboard shortcuts should support faster work on desktop.

**Why this exists:** Keyboard support improves efficiency and makes the app feel premium.

## 14.4 Command Shortcut List

A shortcut list or command center should exist so users can discover and use shortcuts easily.

**Why this exists:** Shortcuts are useful only if users can find and remember them.

---

# 15. Autosave and State Management Logic

## 15.1 Save State Feedback

Visible save feedback is required.

**Why this exists:** Users need to know whether their work is safe.

## 15.2 State Types

State handling should include:

- saving,
- saved,
- unsaved,
- offline,
- sync pending.

**Why this exists:** The application needs to communicate data state clearly.

## 15.3 Save Timing

Save operations should not block the typing experience.

**Why this exists:** Performance and smooth input are essential for writing.

## 15.4 Local Preservation

Local data should be the first layer of protection.

**Why this exists:** This prevents loss from browser issues or network failures.

---

# 16. Duplicate and Conflict Resolution Logic

## 16.1 Duplicate Title Checks

Before saving into a project, the app should check whether the title already exists in that project.

**Why this exists:** Duplicate titles create confusion and make search less reliable.

## 16.2 Resolution Options

The user should be able to:

- replace the existing item,
- rename the new one,
- or cancel.

**Why this exists:** Conflict handling must be intentional and reversible.

## 16.3 Conflict Visibility

Conflicts should be clearly explained in user-facing language.

**Why this exists:** The user should understand exactly what is being replaced or renamed.

---

# 17. Scratchpad Technical Logic

## 17.1 Scratchpad Separation

The scratchpad must remain separate from formal content editing.

**Why this exists:** Temporary notes should not pollute the main content database.

## 17.2 Scratchpad Use

The scratchpad is for fast dumping of thoughts, temporary ideas, or raw notes.

**Why this exists:** Sometimes the user just needs a place to write without structure.

## 17.3 Conversion Potential

Scratchpad material may later be turned into a proper draft if the user wants.

**Why this exists:** Temporary thinking should still be reusable.

---

# 18. Empty State Technical Expectations

Every major screen or section should have a defined empty state behavior.

**Why this exists:** Empty states prevent the UI from feeling broken or unfinished.

## 18.1 Empty State Requirements

Empty states should:

- explain the state,
- suggest a first action,
- and keep the interface useful.

## 18.2 Screen Examples

Empty states should be defined for:

- dashboard,
- writer,
- lead magnets,
- inventory,
- projects,
- tasks,
- archive,
- trash,
- search results,
- and scratchpad.

---

# 19. Error Handling and Recovery Logic

## 19.1 Error Philosophy

Errors should be short, readable, and non-technical.

**Why this exists:** Users should understand problems without needing technical interpretation.

## 19.2 Common Error Cases

The app should handle at minimum:

- save failure,
- network failure,
- duplicate title conflict,
- reminder creation failure,
- invalid field input,
- item not found,
- permission issues,
- and sync conflict.

**Why this exists:** Real apps fail in predictable ways and should recover gracefully.

## 19.3 Recovery Focus

Whenever possible, the system should preserve user input even if an operation fails.

**Why this exists:** Protecting content is more important than perfect immediate syncing.

---

# 20. Route and Screen Implementation Logic

## 20.1 Route Separation

Each main screen should have its own route or clear route state.

**Why this exists:** Routing clarity improves navigation, sharing later, and code maintainability.

## 20.2 Screen State Handling

The app should distinguish between:

- base screen state,
- selected item state,
- editor open state,
- search state,
- empty state,
- and loading state.

**Why this exists:** Complex content apps need structured UI state to remain understandable.

## 20.3 Deep Linking

Important content or task views should be reachable directly.

**Why this exists:** Deep linking improves task flow and notification usefulness.

---

# 21. Responsive Behavior Logic

## 21.1 Desktop Focus

Desktop should support the richest productivity behavior.

**Why this exists:** Writing and organizing content are often faster on a desktop environment.

## 21.2 Mobile Support

Mobile should preserve the core product experience.

**Why this exists:** Users may need to check or edit content away from the main device.

## 21.3 Tablet Support

Tablet should behave like a comfortable middle ground.

**Why this exists:** The app should not break between form factors.

## 21.4 Mobile Hover Replacement

Any hover-based action must have a mobile equivalent.

**Why this exists:** Mobile users cannot depend on hover behavior.

---

# 22. Security and Privacy Direction

## 22.1 Personal Workspace Security

Content should remain private to the authenticated user or trusted internal circle.

**Why this exists:** The app contains sensitive work, drafts, and client-related material.

## 22.2 Access Control

The product should not expose a broad public-facing permission layer in the current phase.

**Why this exists:** The use case is internal and focused.

## 22.3 Data Trust

The app should be designed to make the user trust that content remains safe, recoverable, and under control.

**Why this exists:** Trust is essential in any storage-based product.

---

# 23. Implementation Priorities

When building Contro, implementation should prioritize in this order:

1. Safe writing and save behavior.
2. Project-based organization.
3. Search and retrieval.
4. Inventory and reuse.
5. Tasks and reminders.
6. Offline and recovery behavior.
7. Quick actions and shortcuts.
8. Polish and edge-case handling.

**Why this exists:** This order reflects the actual value structure of the product.

---

# 24. What Not to Build Into the Technical Foundation Yet

The technical foundation should intentionally avoid premature complexity such as:

- nested folder engines,
- subproject trees,
- analytics pipelines,
- admin dashboards,
- PDF export systems,
- collaboration-heavy permission systems,
- version history systems unless explicitly needed later,
- or overengineered automation layers.

**Why this exists:** These items increase complexity without helping the core content workflow right now.

---

# 25. Technical Product Definition in One Line

Contro should be built as a local-first, searchable, project-based content operating system with one universal editor, strong recovery behavior, lightweight organization, and enough structure to make written work easy to create and easy to find.

**Why this exists:** This line describes the technical purpose of the product without pulling it into unnecessary feature bloat.

---

# 26. Final Technical Notes

This technical blueprint is meant to guide the build phase after the product and UX decisions are already locked.

It captures:

- how the app should think,
- how content should flow,
- how data should behave,
- how safety should work,
- how storage should work,
- how search should work,
- how tasks should work,
- how projects should work,
- and how the editor should stay stable.

The next step after this document is the actual build implementation plan.

---

# 27. End State

At this point, the product now has:

- a defined brand identity,
- a complete product specification,
- a missing-spec addendum,
- and a technical blueprint.

Together, these documents form the full product reference needed to begin building Contro.

