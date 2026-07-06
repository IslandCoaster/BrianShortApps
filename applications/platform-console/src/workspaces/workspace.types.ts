export type WorkspaceStatus = "active" | "available" | "planned";

export type WorkspaceAction = {
  id: string;
  label: string;
  status: WorkspaceStatus;
};

export type WorkspaceDefinition = {
  id: string;
  label: string;
  description: string;
  status: WorkspaceStatus;
  actions?: WorkspaceAction[];
};
