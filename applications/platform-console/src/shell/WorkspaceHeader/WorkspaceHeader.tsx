import { engineeringWorkspaceExperience } from "../../experiences/engineering-workspace/engineering-workspace.experience";

const workspaceActions =
  engineeringWorkspaceExperience.sections.find((section) => section.id === "workspace-actions")
    ?.items ?? [];

export function WorkspaceHeader() {
  return (
    <header className="engineering-workspace-header">
      <div>
        <p>Platform Console</p>
        <h1>{engineeringWorkspaceExperience.title}</h1>
        <span className="engineering-workspace-header__subtitle">
          BrianShortApps Operating Environment
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
