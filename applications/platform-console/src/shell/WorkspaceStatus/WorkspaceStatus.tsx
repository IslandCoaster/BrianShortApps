import { getActiveWorkspace, listWorkspaces } from "../../workspaces/workspace.registry";
import type { WorkspaceMode } from "../../workspaces/workspaceModes";
import { getWorkspaceMode } from "../../workspaces/workspaceModes";

type WorkspaceStatusProps = {
  mode: WorkspaceMode;
};

export function WorkspaceStatus({ mode }: WorkspaceStatusProps) {
  const activeWorkspace = getActiveWorkspace();
  const workspaceMode = getWorkspaceMode(mode);

  const workspaceStatusItems = [
    { label: "Environment", value: "Development" },
    { label: "Active Workspace", value: activeWorkspace?.label ?? "None" },
    { label: "Current Mode", value: workspaceMode.label },
    { label: "Registered Workspaces", value: String(listWorkspaces().length) },
  ];

  return (
    <section className="workspace-status" aria-label="Workspace status">
      {workspaceStatusItems.map((item) => (
        <div className="workspace-status__item" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </section>
  );
}
