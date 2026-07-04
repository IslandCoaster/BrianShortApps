import { sidebarPrimaryItems, sidebarSecondaryItems } from "./sidebar.config";

export function Sidebar() {
  return (
    <aside className="engineering-sidebar" aria-label="Engineering workspace navigation">
      <div className="engineering-sidebar__brand">
        <img src="/bsa-platform-mark.svg" alt="" className="engineering-sidebar__mark" />
        <div>
          <p>BrianShortApps</p>
          <span>Operating Environment</span>
        </div>
      </div>

      <nav className="engineering-sidebar__nav">
        {sidebarPrimaryItems.map((item) => (
          <button
            className={`engineering-sidebar__item ${
              item === "Engineering Workspace" ? "engineering-sidebar__item--active" : ""
            }`}
            key={item}
            type="button"
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="engineering-sidebar__status">
        {sidebarSecondaryItems.map((item) => (
          <div className="engineering-sidebar__status-row" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </aside>
  );
}
