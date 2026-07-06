import { getActiveWorkspace } from "../../workspaces/workspace.registry";
import { getWorkspaceMode } from "../../workspaces/workspaceModes";

type WorkspaceHeaderProps = {
  mode: "browse" | "reading";
};

export function WorkspaceHeader({ mode }: WorkspaceHeaderProps) {
  const activeWorkspace = getActiveWorkspace();
  const workspaceMode = getWorkspaceMode(mode);
  const workspaceActions = activeWorkspace?.actions ?? [];

  return (
    <header className="engineering-workspace-header">
      <div>
        <p>{activeWorkspace?.label}</p>

        <h1>{workspaceMode.label}</h1>

        <span className="engineering-workspace-header__subtitle">
          {workspaceMode.description}
        </span>
      </div>

      <div
        className="engineering-workspace-header__actions"
        aria-label="Workspace actions"
      >
        {workspaceActions.map((action) => (
          <button
            className="engineering-workspace-header__action"
            key={action.id}
            type="button"
          >
            {action.label}
          </button>
        ))}
      </div>
    </header>
  );
}
