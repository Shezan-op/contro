import { Workspace } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store/useAppStore";

export class WorkspaceService {
  /**
   * Gets the user's default personal workspace directly from Supabase.
   * If it doesn't exist, it creates one automatically on Supabase.
   */
  static async getDefaultWorkspace(): Promise<Workspace> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    useAppStore.getState().setLoadingState('Loading workspace...');

    // Query workspaces for this user
    const { data: cloudWorkspaces, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('user_id', user.id)
      .limit(1);

    if (error) {
      console.error("Error fetching workspaces:", error);
      throw error;
    }

    if (cloudWorkspaces && cloudWorkspaces.length > 0) {
      const cloudWorkspace = cloudWorkspaces[0];
      return {
        id: cloudWorkspace.id,
        name: cloudWorkspace.name,
        isPersonal: cloudWorkspace.isPersonal,
        createdAt: cloudWorkspace.created_at || new Date().toISOString(),
        updatedAt: cloudWorkspace.updated_at || new Date().toISOString(),
      };
    }

    // Create brand new in Supabase if no workspace exists
    const newWorkspace: Workspace = {
      id: uuidv4(),
      name: "Personal Workspace",
      isPersonal: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    useAppStore.getState().setLoadingState('Creating workspace...');

    const res = await supabase.from('workspaces').insert({
      id: newWorkspace.id,
      user_id: user.id,
      name: newWorkspace.name,
      isPersonal: newWorkspace.isPersonal,
      created_at: newWorkspace.createdAt,
      updated_at: newWorkspace.updatedAt
    });

    if (res.error) {
      console.error("Failed to create workspace:", res.error);
      throw res.error;
    }

    return newWorkspace;
  }
}
