# Contro User Flow Diagram

This document maps the core paths, decisions, and branches a user takes while navigating the Contro Content Operating System.

## Architecture

```mermaid
flowchart TD
    %% Styling
    classDef entry fill:#1A1A1A,stroke:#F5F5F5,stroke-width:2px,color:#F5F5F5;
    classDef screen fill:#2A2A2A,stroke:#A1A1AA,stroke-width:1px,color:#F5F5F5;
    classDef decision fill:#3A3A3A,stroke:#F5F5F5,stroke-width:2px,color:#F5F5F5,shape:diamond;
    classDef action fill:#1A1A1A,stroke:#A1A1AA,stroke-width:1px,color:#F5F5F5,shape:rect,rx:10;
    classDef system fill:#121212,stroke:#F5F5F5,stroke-width:1px,stroke-dasharray: 5 5,color:#F5F5F5;
    classDef endpoint fill:#121212,stroke:#F5F5F5,stroke-width:4px,color:#F5F5F5;

    %% Entry Points
    Entry((Landing Page)):::entry --> ClickStart([Click 'Get Started']):::action
    Entry --> ClickLogin([Click 'Login' in Header]):::action
    
    ClickStart --> AuthScreen[Auth / Login Screen]:::screen
    ClickLogin --> AuthScreen
    
    %% Authentication Flow
    AuthScreen --> LoginDecision{Has Account?}:::decision
    LoginDecision -- Yes --> SystemAuth[System: Verify Credentials]:::system
    LoginDecision -- No --> Signup[Sign Up Screen]:::screen
    Signup --> SystemAuth
    
    SystemAuth -- Success --> Dashboard[Main Dashboard]:::screen
    SystemAuth -- Error --> AuthScreen
    
    %% Dashboard Hub
    Dashboard --> ClickTasks([Open Tasks]):::action
    Dashboard --> ClickInventory([Open Inventory]):::action
    Dashboard --> ClickLeadMagnets([Open Lead Magnets]):::action
    Dashboard --> ClickWriter([Open Writer]):::action
    Dashboard --> ClickProjects([Open Projects]):::action
    
    %% Tasks Flow
    ClickTasks --> TasksScreen[Tasks Hub]:::screen
    TasksScreen --> CreateTask([Create New Task]):::action
    TasksScreen --> ViewTask([View Task Details]):::action
    ViewTask --> ManageSubtasks([Manage Nested Subtasks]):::action
    ManageSubtasks --> SystemSaveTasks[System: Dexie IndexedDB Save]:::system
    
    %% Inventory Flow
    ClickInventory --> InventoryScreen[Inventory Library]:::screen
    InventoryScreen --> FilterInventory{Select Category}:::decision
    FilterInventory -- Hooks --> HooksView[Hooks Library]:::screen
    FilterInventory -- CTAs --> CTAsView[CTAs Library]:::screen
    FilterInventory -- Offers --> OffersView[Offers Library]:::screen
    FilterInventory -- Scripts --> ScriptsView[DM Scripts]:::screen
    
    HooksView --> CopyAsset([Copy to Clipboard]):::action
    CTAsView --> CopyAsset
    OffersView --> CopyAsset
    ScriptsView --> CopyAsset
    
    %% Lead Magnets Flow
    ClickLeadMagnets --> LeadMagnetsScreen[Lead Magnets Hub]:::screen
    LeadMagnetsScreen --> CreateMagnet([Create New Magnet]):::action
    CreateMagnet --> MagnetEditor[Lead Magnet Editor]:::screen
    MagnetEditor --> AddPage([Add Page]):::action
    MagnetEditor --> WriteContent([Write Content (Page-by-Page)]):::action
    WriteContent --> SystemSaveMagnet[System: Auto-Save]:::system
    
    %% Writer Flow
    ClickWriter --> WriterScreen[TipTap Rich Text Editor]:::screen
    WriterScreen --> WritePost([Draft Content]):::action
    WritePost --> UseSidebar([Open Meta Panels]):::action
    UseSidebar --> SetSchedule([Set Schedule Date]):::action
    UseSidebar --> AddTags([Add Tags/Meta]):::action
    WritePost --> SystemSavePost[System: Save as UniversalContent]:::system
    
    %% Projects Flow
    ClickProjects --> ProjectsScreen[Projects Hub]:::screen
    ProjectsScreen --> CreateProject([Create Project]):::action
    ProjectsScreen --> ViewProject([View Project Details]):::action
    ViewProject --> LinkContent([Link Tasks & Drafts]):::action
    
    %% System Endpoints
    SystemSaveTasks --> EndSave((State Saved)):::endpoint
    SystemSaveMagnet --> EndSave
    SystemSavePost --> EndSave
    CopyAsset --> EndAction((Copied to Clipboard)):::endpoint
```

## Key Flows Explained

### 1. The Authentication Path (Happy Path)
Users arrive via the `Landing Page`, hit the CTA, and enter the `AuthScreen`. The system determines if they need to login or sign up. Upon success, they bypass the splash loop and land directly on the `Main Dashboard`.

### 2. The Content Creation Path
From the Dashboard, a user opens the `TipTap Rich Text Editor`. They draft their content, open the right-side meta panels, and set scheduling data or tags. The system auto-saves the content via `UniversalContent` data structures into local IndexedDB storage.

### 3. The Lead Magnet Creation Path
The user opens the Lead Magnet hub and creates a new magnet. They enter a specialized page-by-page editor interface, allowing them to structure long-form content systematically.

### 4. The Inventory Retrieval Path
When a user needs a reusable asset, they open the `Inventory Library`, select a category (Hooks, CTAs, Offers, DM Scripts), and use a one-click action to copy the asset to their clipboard for use in the Writer or external platforms.
