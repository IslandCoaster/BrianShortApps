import "./EngineeringWorkspace.css";

import { engineeringWorkspaceExperience } from "./engineering-workspace.experience";

export default function EngineeringWorkspace() {
  const foundation = engineeringWorkspaceExperience.regions.find((region) => region.id === "foundation");
  const architecture = engineeringWorkspaceExperience.regions.find((region) => region.id === "architecture");
  const inventory = engineeringWorkspaceExperience.regions.find(
    (region) => region.id === "platform-inventory",
  );

  if (!foundation || !architecture || !inventory) {
    return null;
  }

  return (
    <main className="engineering-workspace">
      <section className="engineering-workspace__intro">
        <p className="engineering-workspace__eyebrow">BrianShortApps Platform</p>
        <h1 className="engineering-workspace__title">{engineeringWorkspaceExperience.title}</h1>
        <p className="engineering-workspace__summary">
          {engineeringWorkspaceExperience.description}
        </p>
      </section>

      <section className="engineering-workspace__principle">
        <h2>Build the platform before the product.</h2>
        <p>
          The Engineering Workspace surfaces the architecture, standards, SDK, and visual operating
          system that every BrianShortApps application inherits.
        </p>
      </section>

      <section className="engineering-workspace__grid">
        <article className="engineering-workspace__section">
          <h2>{foundation.title}</h2>
          <ul className="engineering-workspace__list">
            {foundation.items.map((item) => (
              <li className="engineering-workspace__list-item" key={item.id}>
                {item.label}
              </li>
            ))}
          </ul>
        </article>

        <article className="engineering-workspace__section">
          <h2>{architecture.title}</h2>
          <ul className="engineering-workspace__list">
            {architecture.items.map((item) => (
              <li className="engineering-workspace__list-item" key={item.id}>
                {item.label}
              </li>
            ))}
          </ul>
        </article>

        <article className="engineering-workspace__section">
          <h2>{inventory.title}</h2>
          <div className="engineering-workspace__metrics">
            {inventory.items.map((item) => (
              <div className="engineering-workspace__metric" key={item.id}>
                <span>{item.description}</span>
                <p>{item.label}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
