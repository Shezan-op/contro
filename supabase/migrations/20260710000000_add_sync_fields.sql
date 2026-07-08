-- Add sync fields to workspaces
ALTER TABLE workspaces
ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN deleted_at TIMESTAMPTZ,
ADD COLUMN sync_status TEXT DEFAULT 'synced';

-- Add sync fields to user_settings
ALTER TABLE user_settings
ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN deleted_at TIMESTAMPTZ,
ADD COLUMN sync_status TEXT DEFAULT 'synced';

-- Add sync fields to inventory_libraries
ALTER TABLE inventory_libraries
ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN deleted_at TIMESTAMPTZ,
ADD COLUMN sync_status TEXT DEFAULT 'synced';

-- Add sync fields to inventory
ALTER TABLE inventory
ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN deleted_at TIMESTAMPTZ,
ADD COLUMN sync_status TEXT DEFAULT 'synced';

-- Add sync fields to projects
ALTER TABLE projects
ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN deleted_at TIMESTAMPTZ,
ADD COLUMN sync_status TEXT DEFAULT 'synced';

-- Add sync fields to content_items
ALTER TABLE content_items
ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN deleted_at TIMESTAMPTZ,
ADD COLUMN sync_status TEXT DEFAULT 'synced';

-- Add sync fields to tasks
ALTER TABLE tasks
ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN deleted_at TIMESTAMPTZ,
ADD COLUMN sync_status TEXT DEFAULT 'synced';

-- Add sync fields to lead_magnets
ALTER TABLE lead_magnets
ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN deleted_at TIMESTAMPTZ,
ADD COLUMN sync_status TEXT DEFAULT 'synced';
