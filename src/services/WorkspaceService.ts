import { db, Workspace } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/supabase/client";

export class WorkspaceService {
  /**
   * Gets the user's default personal workspace.
   * If it doesn't exist locally, it checks Supabase.
   * If it doesn't exist in Supabase, it creates one automatically.
   */
  static async getDefaultWorkspace(): Promise<Workspace> {
    const allWorkspaces = await db.workspaces.toArray();
    const workspaces = allWorkspaces.filter(w => !w.deletedAt);
    
    if (workspaces.length > 0) {
      return workspaces[0]; // For now, just return the first workspace
    }

    // Local is empty, check cloud
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: cloudWorkspaces } = await supabase
        .from('workspaces')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);

      if (cloudWorkspaces && cloudWorkspaces.length > 0) {
        const cloudWorkspace = cloudWorkspaces[0];
        const newLocalWorkspace: Workspace = {
          id: cloudWorkspace.id,
          name: cloudWorkspace.name,
          isPersonal: cloudWorkspace.isPersonal,
          createdAt: cloudWorkspace.created_at || new Date().toISOString(),
          updatedAt: cloudWorkspace.updated_at || new Date().toISOString(),
          syncStatus: 'synced',
        };
        await db.workspaces.add(newLocalWorkspace);
        return newLocalWorkspace;
      }
    }

    // Create brand new if no cloud or not logged in
    const newWorkspace: Workspace = {
      id: uuidv4(),
      name: "Personal Workspace",
      isPersonal: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'synced',
    };

    await db.workspaces.add(newWorkspace);
    
    // If logged in, push immediately
    if (user) {
      await supabase.from('workspaces').upsert({
        id: newWorkspace.id,
        user_id: user.id,
        name: newWorkspace.name,
        "isPersonal": newWorkspace.isPersonal
      });
    }

    return newWorkspace;
  }
}
