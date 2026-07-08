// 1. Workspace Model
export interface Workspace {
  id: string;
  name: string;
  isPersonal: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
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
}

export interface Notification {
  id: string;
  workspaceId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// 3. Inventory Models
export interface InventoryLibrary {
  id: string;
  workspaceId: string;
  name: string;
  order: number;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
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
  scheduledFor: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  isStarred: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  
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
