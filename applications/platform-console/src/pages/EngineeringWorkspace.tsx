import "./EngineeringWorkspace.css";

import { architectureDocuments, foundationDocuments, workspaceTruths } from "./engineeringWorkspace.model";

export default function EngineeringWorkspace() {
  return (
    <main className="engineering-workspace">
      <section className="engineering-workspace__intro">
        <p className="engineering-workspace__eyebrow">BrianShortApps Platform</p>
        <h1 className="engineering-workspace__title">Engineering Workspace</h1>
        <p className="engineering-workspace__summary">
          The operating environment for building, governing, and evolving the BrianShortApps
          ecosystem.
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
          <h2>Foundation</h2>
          <ul className="engineering-workspace__list">
            {foundationDocuments.map((document) => (
              <li className="engineering-workspace__list-item" key={document}>
                {document}
              </li>
            ))}
          </ul>
        </article>

        <article className="engineering-workspace__section">
          <h2>Architecture</h2>
          <ul className="engineering-workspace__list">
            {architectureDocuments.map((document) => (
              <li className="engineering-workspace__list-item" key={document}>
                {document}
              </li>
            ))}
          </ul>
        </article>

        <article className="engineering-workspace__section">
          <h2>Platform Inventory</h2>
          <div className="engineering-workspace__metrics">
            {workspaceTruths.map((stat) => (
              <div className="engineering-workspace__metric" key={stat.label}>
                <span>{stat.value}</span>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
