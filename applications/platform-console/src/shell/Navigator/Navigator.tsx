import type { WorkspaceMode } from "../../workspaces/workspaceModes";
import { getWorkspaceMode } from "../../workspaces/workspaceModes";
import { WorkspaceStatus } from "../WorkspaceStatus/WorkspaceStatus";
import { navigatorPrimaryItems } from "./navigator.config";

type NavigatorProps = {
  mode: WorkspaceMode;
};

export function Navigator({ mode }: NavigatorProps) {
  const workspaceMode = getWorkspaceMode(mode);

  return (
    <aside className="engineering-navigator" aria-label="Engineering workspace navigator">
      <div className="engineering-navigator__brand">
        <img src="/bsa-platform-mark.svg" alt="" className="engineering-navigator__mark" />

        <div>
          <p>BrianShortApps</p>
          <span>Operating Environment</span>
        </div>
      </div>

      <div className="engineering-navigator__mode">
        <span>Current Mode</span>
        <strong>{workspaceMode.label}</strong>
      </div>

      <nav className="engineering-navigator__nav">
        {navigatorPrimaryItems.map((item) => (
          <button
            className={`engineering-navigator__item ${
              item.status === "active" ? "engineering-navigator__item--active" : ""
            }`}
            data-status={item.status}
            key={item.id}
            type="button"
          >
            <span className="engineering-navigator__item-label">{item.label}</span>
            <span className="engineering-navigator__item-description">{item.description}</span>
          </button>
        ))}
      </nav>

      <WorkspaceStatus />
    </aside>
  );
}
