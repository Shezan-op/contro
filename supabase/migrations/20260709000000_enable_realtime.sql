-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE workspaces;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE content_items;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE inventory_libraries;
ALTER PUBLICATION supabase_realtime ADD TABLE lead_magnets;
ALTER PUBLICATION supabase_realtime ADD TABLE user_settings;
