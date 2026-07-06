import { getActiveWorkspace, listWorkspaces } from "../../workspaces/workspace.registry";

const workspaceStatusItems = [
  { label: "Environment", value: "Development" },
  { label: "Active Workspace", value: getActiveWorkspace()?.label ?? "None" },
  { label: "Registered Workspaces", value: String(listWorkspaces().length) },
];

export function WorkspaceStatus() {
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
