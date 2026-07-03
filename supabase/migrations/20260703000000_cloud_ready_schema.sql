-- Create Workspaces Table
CREATE TABLE workspaces (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "isPersonal" BOOLEAN DEFAULT TRUE
);

-- Create User Settings Table
CREATE TABLE user_settings (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  "workspaceId" UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  theme TEXT,
  "offlineMode" BOOLEAN DEFAULT FALSE,
  "syncEnabled" BOOLEAN DEFAULT TRUE
);

-- Create Inventory Libraries Table
CREATE TABLE inventory_libraries (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  "workspaceId" UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  icon TEXT
);

-- Create Inventory Items Table
CREATE TABLE inventory (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  "workspaceId" UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  "libraryId" UUID REFERENCES inventory_libraries(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  "order" INTEGER DEFAULT 0
);

-- Create Projects Table
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  "workspaceId" UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT,
  platform TEXT,
  "contentPillars" TEXT[],
  "isStarred" BOOLEAN DEFAULT FALSE,
  "isArchived" BOOLEAN DEFAULT FALSE,
  "isTrashed" BOOLEAN DEFAULT FALSE
);

-- Create Content Items Table
CREATE TABLE content_items (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  "workspaceId" UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  "projectId" UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body JSONB,
  cta TEXT,
  status TEXT,
  platform TEXT,
  "scheduledFor" TEXT,
  "contentPillars" TEXT[],
  "isStarred" BOOLEAN DEFAULT FALSE,
  "isArchived" BOOLEAN DEFAULT FALSE,
  "isTrashed" BOOLEAN DEFAULT FALSE
);

-- Create Tasks Table
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  "workspaceId" UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  "projectId" UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT,
  "isCompleted" BOOLEAN DEFAULT FALSE,
  "dueDate" TEXT,
  priority TEXT,
  reminder TEXT,
  "isRepeating" BOOLEAN DEFAULT FALSE,
  "contentPillars" TEXT[],
  "isStarred" BOOLEAN DEFAULT FALSE,
  "isArchived" BOOLEAN DEFAULT FALSE,
  "isTrashed" BOOLEAN DEFAULT FALSE
);

-- Create Lead Magnets Table
CREATE TABLE lead_magnets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  "workspaceId" UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  "assetUrl" TEXT,
  "assetType" TEXT,
  status TEXT,
  platform TEXT,
  "contentPillars" TEXT[],
  "isStarred" BOOLEAN DEFAULT FALSE,
  "isArchived" BOOLEAN DEFAULT FALSE,
  "isTrashed" BOOLEAN DEFAULT FALSE
);

-- RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_magnets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their workspaces" ON workspaces FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their user_settings" ON user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their inventory_libraries" ON inventory_libraries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their inventory" ON inventory FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their projects" ON projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their content_items" ON content_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their tasks" ON tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their lead_magnets" ON lead_magnets FOR ALL USING (auth.uid() = user_id);
