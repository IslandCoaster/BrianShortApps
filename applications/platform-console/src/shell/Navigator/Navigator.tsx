import { navigatorPrimaryItems } from "./navigator.config";
import { WorkspaceStatus } from "../WorkspaceStatus/WorkspaceStatus";

export function Navigator() {
  return (
    <aside className="engineering-navigator" aria-label="Engineering workspace navigation">
      <div className="engineering-navigator__brand">
        <img src="/bsa-platform-mark.svg" alt="" className="engineering-navigator__mark" />
        <div>
          <p>BrianShortApps</p>
          <span>Operating Environment</span>
        </div>
      </div>

      <nav className="engineering-navigator__nav">
        {navigatorPrimaryItems.map((item) => (
          <button
            className={`engineering-navigator__item ${
              item === "Engineering Workspace" ? "engineering-navigator__item--active" : ""
            }`}
            key={item}
            type="button"
          >
            {item}
          </button>
        ))}
      </nav>

      <WorkspaceStatus />
    </aside>
  );
}
