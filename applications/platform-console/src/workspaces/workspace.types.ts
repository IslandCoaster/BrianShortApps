export type WorkspaceStatus = "active" | "available" | "planned";

export type WorkspaceDefinition = {
  id: string;
  label: string;
  description: string;
  status: WorkspaceStatus;
};
