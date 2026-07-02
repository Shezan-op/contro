import { db, Workspace } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export class WorkspaceService {
  /**
   * Gets the user's default personal workspace.
   * If it doesn't exist, it creates one automatically.
   */
  static async getDefaultWorkspace(): Promise<Workspace> {
    const workspaces = await db.workspaces.toArray();
    
    if (workspaces.length > 0) {
      return workspaces[0]; // For now, just return the first workspace
    }

    const newWorkspace: Workspace = {
      id: uuidv4(),
      name: "Personal Workspace",
      isPersonal: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.workspaces.add(newWorkspace);
    return newWorkspace;
  }
}
