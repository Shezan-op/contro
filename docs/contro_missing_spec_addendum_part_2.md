# Contro
## Missing Specification Addendum, Part 2

This document extends the Contro single source of truth with the parts that were not fully captured in the first document.

It focuses on the product details that make the application feel complete from a UX, design, interaction, and product-specification perspective.

This document does not cover technical architecture or backend infrastructure.

---

# 1. Purpose of This Addendum

The main Contro source document already defines the core product vision, screens, flows, and product rules.

This addendum captures the remaining product-level details that were still missing or only implied, including:

- design system rules,
- component behavior,
- interaction states,
- field-level behavior,
- microcopy expectations,
- accessibility standards,
- confirmation and warning flows,
- empty states,
- loading states,
- error states,
- global product rules,
- acceptance logic,
- and future expansion guardrails.

The purpose is to make the product definition complete enough that the design and product direction stay consistent later.

---

# 2. Complete Design System Direction

## 2.1 Visual Style

Contro should remain visually plain, minimal, premium, and readable.

The visual system should not become decorative or overly playful.

The interface should feel professional and calm.

## 2.2 Color Usage Philosophy

The color palette already defined in the main source document is the core palette.

Color usage should follow a restrained hierarchy:

- background for the overall app canvas,
- surface for cards and panels,
- text for primary readable content,
- muted for secondary labels and helper text,
- border for structure and separation.

Dark mode should preserve the same visual hierarchy while reducing glare and maintaining readability.

## 2.3 Typography Usage Rules

### Headings

Use Geist for:

- page titles,
- section headers,
- card titles,
- dialog titles,
- important labels.

### Body Text

Use Source Sans 3 for:

- paragraph text,
- helper text,
- descriptions,
- form content,
- lists,
- task descriptions,
- item content.

## 2.4 Layout Philosophy

The layout should use generous spacing, but not waste space.

The UI should feel organized, with enough breathing room to avoid clutter.

The screen should never feel dense unless the user intentionally opens a content-heavy view.

## 2.5 Surfaces and Cards

Cards should be the main container pattern for most content blocks.

Cards should look clean, bordered, and subtle.

They should support both dark and light mode with good contrast.

## 2.6 Shape Language

The product should favor soft, practical geometry.

Not overly rounded.
Not sharp and harsh.

Balanced, modern, functional corners are preferred.

## 2.7 Motion Philosophy

Motion should be quiet and useful.

Animations should support clarity, not distract from work.

Examples:

- smooth opening of panels,
- subtle state transitions,
- lightweight dropdown motion,
- gentle save-state updates,
- clean dialog appearance.

Motion should never feel flashy.

## 2.8 Iconography Philosophy

Icons should be simple, clean, and easy to understand.

They should support:

- navigation,
- project visuals,
- tags,
- task states,
- actions,
- and empty states.

Icons should never overpower text.

---

# 3. Component Library Definition

## 3.1 Core Components

The application should rely on a stable set of reusable UI components.

### Required Components

- buttons
- icon buttons
- input fields
- textareas
- rich text editor surface
- dropdowns
- select menus
- search input
- tags / chips
- badges
- cards
- panels
- side navigation items
- top navigation items
- floating action button
- modals
- dialogs
- confirmations
- toasts
- skeleton loaders
- empty states
- saved state indicators
- task items
- project cards
- inventory cards
- draft cards
- preview cards
- calendar blocks
- reminder blocks
- star indicators
- archive indicators
- trash indicators

## 3.2 Button Hierarchy

Buttons should have a clear hierarchy.

### Primary Button

Used for the main action on a screen.

Examples:

- Save
- Create Draft
- Add Project
- Add Task
- Create Lead Magnet

### Secondary Button

Used for supporting actions.

Examples:

- Cancel
- View All
- Show More
- Edit
- Rename

### Destructive Button

Used for actions like:

- Delete
- Move to Trash
- Remove
- Permanently Delete

## 3.3 Badge and Chip Behavior

Badges and chips should be used for:

- tags,
- status labels,
- project markers,
- reminder markers,
- search filters,
- stars,
- and compact metadata.

## 3.4 Cards

Cards should display:

- title,
- subtitle,
- tags,
- metadata,
- quick actions,
- and any relevant status indicators.

## 3.5 Inputs

Inputs should be easy to scan and use.

They should support:

- labels,
- placeholder text,
- helper text,
- error states,
- disabled states,
- and required markers when needed.

---

# 4. Interaction States

Every major interactive element in Contro should support the following states when relevant:

- default,
- hover,
- focus,
- active,
- disabled,
- loading,
- empty,
- error,
- success,
- unsaved,
- saving,
- saved,
- offline.

## 4.1 Hover State

Hover should provide subtle clarity, especially on desktop.

Used for:

- buttons,
- project cards,
- draft cards,
- inventory items,
- quick actions,
- copy actions,
- and menu items.

## 4.2 Focus State

Focus states must be clearly visible.

Keyboard navigation should be predictable and easy to follow.

## 4.3 Loading State

Loading should never feel broken.

It should be shown with:

- skeletons,
- loading text,
- or a subtle spinner when appropriate.

## 4.4 Empty State

Empty states are required for every major area.

They should explain what the user can do next without feeling dead or broken.

## 4.5 Error State

Errors should be clear and short.

They should explain:

- what went wrong,
- whether the user can continue,
- and what to do next.

## 4.6 Offline State

The app should clearly indicate when the user is offline.

Offline mode should not destroy confidence.

The user should know that local writing is still safe.

---

# 5. Microcopy Rules

## 5.1 Tone

Microcopy should be plain, respectful, and clear.

It should not sound robotic or overly corporate.

It should not feel gimmicky.

It should help the user understand what is happening.

## 5.2 Button Labels

Button labels should be short and action-based.

Examples:

- Save
- Cancel
- Delete
- Rename
- Replace
- Archive
- Restore
- Star
- Copy
- View All
- Show More
- New Draft
- New Project
- New Task
- New Lead Magnet

## 5.3 Confirmation Text

Confirmation messages should be short and explicit.

Examples:

- Move this project to trash?
- Delete this item permanently?
- Replace the existing item with this one?
- Restore this from trash?
- Add a reminder for this task?

## 5.4 Helper Text

Helper text should explain only what is necessary.

It should not overexplain.

---

# 6. Accessibility Rules

## 6.1 Keyboard Access

The application must be keyboard-friendly.

Users should be able to move through the app without being forced to use only the mouse.

## 6.2 Focus Order

Focus should move in a logical order.

## 6.3 Readability

Text contrast should remain readable in both Light Mode and Dark Mode.

## 6.4 Touch Usability

Mobile and tablet interactions should be large enough to tap comfortably.

## 6.5 Screen Reader Friendliness

The UI should remain understandable through accessible labels and semantic structure.

## 6.6 No Hover Dependency on Mobile

Important actions must never rely only on hover.

Anything critical must also be accessible on mobile and tablet.

---

# 7. Modal, Dialog, and Confirmation Behavior

## 7.1 Unsaved Changes Warning

If the user attempts to leave an editor with unsaved changes, the system should ask before discarding work.

Options:

- Save
- Don't Save
- Cancel

## 7.2 Duplicate Title Warning

If the user saves a duplicate title inside the same project, the app should alert them.

Options:

- Replace existing
- Rename this item
- Cancel

## 7.3 Delete Confirmation

Any destructive action should require confirmation.

Examples include:

- deleting a content item,
- deleting a project,
- moving something to trash,
- permanently deleting something from trash.

## 7.4 Reminder Creation Prompt

When a task is marked important, the app may prompt:

> Add a reminder for this task?

This should be simple and optional.

## 7.5 Project Deletion Flow

Project deletion should move the project to trash.

It should not instantly erase the project.

## 7.6 Restore Flow

Items in trash should be restorable during the retention window.

## 7.7 Archive Flow

Archive should be a soft hiding state, not a destructive state.

---

# 8. Field-Level Behavior Rules

## 8.1 Content Fields

Content pieces should support the fields discussed earlier:

- Heading / Hook / Title
- Title V2
- Content / Body Text
- CTA box

These are the core content fields for standard writing.

## 8.2 Lead Magnet Fields

Lead magnets should support:

- Title / Heading
- Subheading
- Body
- CTA
- Assets link
- Page-by-page content blocks

## 8.3 Project Fields

Projects should support:

- name,
- icon,
- short description,
- associated content,
- tags,
- and search.

## 8.4 Task Fields

Tasks should support:

- task name,
- notes,
- priority,
- reminder setting,
- status,
- and completion state.

## 8.5 Inventory Fields

Inventory items should support:

- title,
- content body,
- tags,
- stars,
- and copy access.

## 8.6 Field Optionality Philosophy

Fields should be optional where possible so users can move quickly.

The system should not force rigid completion when the user only needs a quick draft.

---

# 9. Content Model Definitions

This section defines the product-level meaning of each content type.

## 9.1 Draft

A draft is any saved written piece that is not yet finalized.

A draft may be independent or assigned to a project.

## 9.2 Project

A project is a single-level structured container for related content and files.

It is like a properly organized folder.

## 9.3 Inventory Item

An inventory item is reusable content stored for quick retrieval.

## 9.4 Lead Magnet

A lead magnet is a structured long-form content item, usually broken into page-like segments.

## 9.5 Task

A task is an actionable item that may also have a reminder.

## 9.6 Scratchpad Item

A scratchpad item is a temporary thought, note, or quick dump that is not meant to behave like a formal document.

## 9.7 Starred Item

A starred item is an important item the user wants to access more easily.

## 9.8 Archived Item

An archived item is hidden from the main active flow but still preserved.

## 9.9 Trashed Item

A trashed item is removed from active use but still recoverable until the retention period ends.

---

# 10. Global Product Rules

## 10.1 Search Everywhere

Search must work across the whole app.

It should also work inside projects.

## 10.2 One Shared Editor Engine

There should be one universal editor system with different field configurations per content type.

## 10.3 No Nested Project Hierarchy

No project should contain subfolders or subprojects.

## 10.4 Local-First Writing

Drafts must not depend on perfect internet connectivity.

## 10.5 Project Pin Limit

Only 3 projects can be pinned.

## 10.6 Custom Tag Limit

Custom tags are limited to 7.

## 10.7 Project Description Limit

Project descriptions are limited to 150 characters.

## 10.8 Trash Retention Limit

Trash retention is 15 days.

## 10.9 Notification Intent

Notifications exist to remind the user, not spam them.

## 10.10 No Admin Dashboard

The system has no separate admin dashboard.

## 10.11 No PDF Export

Contro stores content for copying and reuse elsewhere, not PDF export.

---

# 11. Screen-Level Acceptance Expectations

This section defines when the major product areas should be considered functionally complete.

## 11.1 Dashboard Completion

The dashboard is complete when it can show:

- profile name,
- content dashboard,
- weekly calendar,
- expandable month view,
- pinned projects,
- recent items,
- top tasks,
- quick actions,
- and entry points to the main sections.

## 11.2 Writer Completion

The writer is complete when it can:

- accept independent drafts,
- assign to a project,
- autosave,
- recover from interruption,
- display save states,
- show a LinkedIn-inspired preview,
- and prevent accidental data loss.

## 11.3 Lead Magnet Completion

Lead magnets are complete when they can:

- store page-by-page content,
- show a document-like preview,
- accept assets,
- support formatting,
- and allow quick copying of content for external design tools.

## 11.4 Inventory Completion

Inventory is complete when it can:

- store the defined reusable categories,
- support tags,
- support stars,
- support copy,
- and support search.

## 11.5 Projects Completion

Projects are complete when they can:

- be created,
- be customized,
- hold content and files,
- support tags,
- support search,
- support pinning,
- support archive,
- support trash,
- and resolve duplicate titles.

## 11.6 Tasks Completion

Tasks are complete when they can:

- be created,
- be marked important,
- generate reminders,
- deep link from notifications,
- and turn reminders off on completion.

## 11.7 Settings Completion

Settings are complete when users can adjust:

- theme,
- notifications,
- behavior preferences,
- and other personal controls.

---

# 12. Content Retrieval Rules

## 12.1 Retrieval Priority

Users should be able to retrieve content in the following ways:

- Recent items,
- Search,
- Project view,
- Inventory section,
- Starred items,
- Dashboard shortcuts.

## 12.2 Retrieval Speed Goal

The app should make it feel obvious where content lives.

The ideal experience is that the user should not need to remember a complex folder path.

## 12.3 Retrieval Confidence

Users should trust that saved content will still be where they expect it to be later.

---

# 13. Empty State Philosophy

Empty states are not a low priority detail.

They are part of the product’s quality.

Every empty state should do one or more of the following:

- explain what belongs there,
- suggest the next action,
- reduce confusion,
- and keep the app feeling alive.

Examples of empty states should exist for:

- Dashboard with no data,
- no projects,
- no drafts,
- no tasks,
- no inventory items,
- no starred items,
- empty trash,
- empty archive,
- empty search results.

---

# 14. Error Handling Philosophy

Errors should be simple and understandable.

The product should avoid technical language wherever possible.

The user should be told:

- what happened,
- whether the work is safe,
- and what can be done next.

Examples:

- Could not save right now.
- Draft kept locally.
- Try again.
- Project title already exists.
- Reminder could not be created.
- No results found.

---

# 15. Duplicate and Conflict Handling

## 15.1 Title Conflicts

If two items in the same project share the same title, the product should not silently accept it.

## 15.2 Conflict Resolution Options

The system should support:

- replace existing,
- rename new item,
- cancel.

## 15.3 Conflict Prevention Philosophy

The app should reduce confusion and keep projects clean.

---

# 16. Trash, Archive, and Recovery Rules

## 16.1 Trash

Trash is for deleted items that may still need recovery.

Retention is 15 days.

## 16.2 Archive

Archive is for items that are not currently active but should remain stored.

## 16.3 Recovery

Anything in trash should be recoverable during the retention window.

## 16.4 Destructive Deletion

Permanent deletion should require explicit user consent.

---

# 17. User Journey Rules by Context

## 17.1 New User or New Setup Flow

The user should immediately understand:

- what Contro is,
- where content goes,
- how to create a draft,
- how to create a project,
- and how to retrieve items later.

## 17.2 Daily Use Flow

The user should be able to open the dashboard and instantly continue work.

## 17.3 Deep Work Flow

The user should be able to stay in Writer or Lead Magnets for long sessions without friction.

## 17.4 Retrieval Flow

The user should be able to search and recover old work quickly without remembering exact file paths.

---

# 18. Future Expansion Guardrails

Any future feature added to Contro must satisfy at least one of the following:

- helps write faster,
- helps store cleaner,
- helps categorize better,
- helps search quicker,
- helps track tasks more clearly,
- helps reuse content faster,
- or helps make the product safer and more trustworthy.

If a feature does not improve one of those outcomes, it should not be added.

Future additions must not break:

- the minimal visual identity,
- the simple top-level structure,
- the single editor philosophy,
- or the no-nesting rule for projects.

---

# 19. What Was Added in This Addendum

This part specifically fills the missing gaps by defining:

- design system direction,
- component behavior,
- state handling,
- confirmations,
- accessibility,
- microcopy,
- content model definitions,
- field-level expectations,
- completion criteria,
- empty states,
- error handling,
- duplicate conflict handling,
- trash/archive behavior,
- and future guardrails.

---

# 20. Final Addendum Statement

With this addendum, Contro now has a fuller product definition.

The main source document defines the product itself.

This addendum defines the missing product-level behaviors and standards that make the product feel complete.

Together, these documents describe the intended Contro experience in a way that can be used as the foundational product reference going forward.

