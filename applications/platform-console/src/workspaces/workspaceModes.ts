export type WorkspaceMode = "browse" | "reading";

export type WorkspaceModeDefinition = {
  id: WorkspaceMode;
  label: string;
  description: string;
};

export const workspaceModeRegistry: Record<WorkspaceMode, WorkspaceModeDefinition> = {
  browse: {
    id: "browse",
    label: "Browse Mode",
    description: "Explore engineering knowledge and discover platform capabilities.",
  },

  reading: {
    id: "reading",
    label: "Reading Mode",
    description: "Focus on a single engineering document.",
  },
};

export function getWorkspaceMode(mode: WorkspaceMode) {
  return workspaceModeRegistry[mode];
}
