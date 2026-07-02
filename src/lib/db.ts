import Dexie, { type EntityTable } from 'dexie';

// 1. Workspace Model
export interface Workspace {
  id: string;
  name: string;
  isPersonal: boolean;
  createdAt: string;
  updatedAt: string;
}

// 2. Additional Models (Settings, Notifications, Reminders)
export interface Setting {
  id: string; // 'global' or user_id
  workspaceId: string;
  theme: 'light' | 'dark' | 'system';
  offlineMode: boolean;
  syncEnabled: boolean;
}

export interface Notification {
  id: string;
  workspaceId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// 3. Universal Content Model
export type ContentType = 'PROJECT' | 'DRAFT' | 'LEAD_MAGNET' | 'INVENTORY_HOOK' | 'INVENTORY_CTA' | 'INVENTORY_IDEA' | 'INVENTORY_OFFER' | 'INVENTORY_SCRIPT' | 'INVENTORY_PROPOSAL' | 'TASK' | 'ASSET';

export interface UniversalContent {
  id: string;
  workspaceId: string;
  type: ContentType;
  title: string;
  projectId?: string; // For items belonging to a project
  tags: string[];
  isStarred: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending' | 'error';
  
  // Extended fields stored as JSON
  body?: Record<string, unknown>; // TipTap JSON AST
  description?: string; // For projects
  isCompleted?: boolean; // For tasks
  dueDate?: string; // For tasks
  assetUrl?: string; // For assets
  assetType?: string; // Images, PDF, DOCX, XLSX, CSV, PPTX
}

// Define the Database
const db = new Dexie('ControDB') as Dexie & {
  workspaces: EntityTable<Workspace, 'id'>;
  settings: EntityTable<Setting, 'id'>;
  notifications: EntityTable<Notification, 'id'>;
  content: EntityTable<UniversalContent, 'id'>;
};

// Schema declaration
db.version(2).stores({
  workspaces: 'id',
  settings: 'id, workspaceId',
  notifications: 'id, workspaceId, isRead',
  content: 'id, workspaceId, type, title, projectId, *tags, isStarred, isArchived, isTrashed, syncStatus, updatedAt'
});

export { db };
