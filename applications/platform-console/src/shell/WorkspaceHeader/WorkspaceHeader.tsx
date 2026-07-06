import { getActiveWorkspace } from "../../workspaces/workspace.registry";

const workspaceActions = ["Knowledge", "Registry", "Diagnostics"];

export function WorkspaceHeader() {
  const activeWorkspace = getActiveWorkspace();

  return (
    <header className="engineering-workspace-header">
      <div>
        <p>Platform Console</p>
        <h1>{activeWorkspace?.label ?? "Engineering Workspace"}</h1>
        <span className="engineering-workspace-header__subtitle">
          {activeWorkspace?.description ?? "BrianShortApps Operating Environment"}
        </span>
      </div>

      <div className="engineering-workspace-header__actions" aria-label="Workspace actions">
        {workspaceActions.map((action) => (
          <button className="engineering-workspace-header__action" key={action} type="button">
            {action}
          </button>
        ))}
      </div>
    </header>
  );
}
