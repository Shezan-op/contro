import Dexie, { type EntityTable } from 'dexie';

// 1. Workspace Model
export interface Workspace {
  id: string;
  name: string;
  isPersonal: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  syncStatus?: 'synced' | 'pending' | 'pending_delete' | 'error' | 'conflict';
}

// 2. Additional Models (Settings, Notifications, Reminders)
export interface Setting {
  id: string; // 'global' or user_id
  workspaceId: string;
  theme: 'light' | 'dark' | 'system';
  offlineMode: boolean;
  syncEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  syncStatus?: 'synced' | 'pending' | 'pending_delete' | 'error' | 'conflict';
}

export interface Notification {
  id: string;
  workspaceId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// 3. Inventory Models (New Structure)
export interface InventoryLibrary {
  id: string;
  workspaceId: string;
  name: string;
  order: number;
  icon?: string; // For future use
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  syncStatus?: 'synced' | 'pending' | 'pending_delete' | 'error' | 'conflict';
}

export interface InventoryItem {
  id: string;
  workspaceId: string;
  libraryId: string;
  text: string;
  title?: string;
  url?: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  syncStatus?: 'synced' | 'pending' | 'pending_delete' | 'error' | 'conflict';
}

// 4. Universal Content Model
export type ContentType = 'PROJECT' | 'DRAFT' | 'LEAD_MAGNET' | 'TASK' | 'ASSET';

export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'completed' | 'failed';
export type ContentPlatform = 'LinkedIn' | 'Instagram' | 'X (Twitter)' | 'Newsletter' | null;

export interface UniversalContent {
  id: string;
  workspaceId: string;
  type: ContentType;
  title: string;
  body?: Record<string, unknown>; // TipTap JSON AST
  cta?: string;
  projectId?: string;
  contentPillars: string[];
  platform: ContentPlatform;
  status: ContentStatus;
  scheduledFor: string | null; // ISO Date string
  createdAt?: string; // ISO Date string
  updatedAt?: string;
  deletedAt?: string;
  isStarred: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  syncStatus: 'synced' | 'pending' | 'pending_delete' | 'error' | 'conflict';
  
  // Extended fields stored as JSON
  description?: string; // For projects
  
  // For tasks
  isCompleted?: boolean; 
  dueDate?: string; 
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  reminder?: string | null;
  isRepeating?: boolean;

  // For assets
  assetUrl?: string; 
  assetType?: string; 
}

// Define the Database
const db = new Dexie('ControDB') as Dexie & {
  workspaces: EntityTable<Workspace, 'id'>;
  settings: EntityTable<Setting, 'id'>;
  notifications: EntityTable<Notification, 'id'>;
  content: EntityTable<UniversalContent, 'id'>;
  inventoryLibraries: EntityTable<InventoryLibrary, 'id'>;
  inventoryItems: EntityTable<InventoryItem, 'id'>;
};

// Schema declaration
db.version(5).stores({
  workspaces: 'id, syncStatus',
  settings: 'id, workspaceId, syncStatus',
  notifications: 'id, workspaceId, isRead',
  content: 'id, workspaceId, type, title, projectId, *contentPillars, platform, status, scheduledFor, isStarred, isArchived, isTrashed, syncStatus, deletedAt',
  inventoryLibraries: 'id, workspaceId, order, syncStatus',
  inventoryItems: 'id, workspaceId, libraryId, order, syncStatus'
});

export { db };
