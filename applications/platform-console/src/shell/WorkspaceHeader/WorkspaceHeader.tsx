import { getActiveWorkspace } from "../../workspaces/workspace.registry";

export function WorkspaceHeader() {
  const activeWorkspace = getActiveWorkspace();
  const workspaceActions = activeWorkspace?.actions ?? [];

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
          <button className="engineering-workspace-header__action" key={action.id} type="button">
            {action.label}
          </button>
        ))}
      </div>
    </header>
  );
}
