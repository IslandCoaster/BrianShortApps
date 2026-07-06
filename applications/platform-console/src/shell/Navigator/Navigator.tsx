import { WorkspaceStatus } from "../WorkspaceStatus/WorkspaceStatus";
import { navigatorPrimaryItems } from "./navigator.config";

export function Navigator() {
  return (
    <aside className="engineering-navigator" aria-label="Engineering workspace navigator">
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
              item.status === "active"
                ? "engineering-navigator__item--active"
                : ""
            }`}
            data-status={item.status}
            key={item.id}
            type="button"
          >
            <span className="engineering-navigator__item-label">
              {item.label}
            </span>

            <span className="engineering-navigator__item-description">
              {item.description}
            </span>
          </button>
        ))}
      </nav>

      <WorkspaceStatus />
    </aside>
  );
}
