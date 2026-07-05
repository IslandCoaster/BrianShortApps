import { ExperienceRenderer } from "@bsa/experience";

import "./EngineeringWorkspace.css";
import { engineeringWorkspaceExperience } from "./engineering-workspace.experience";

export default function EngineeringWorkspace() {
  return (
    <main className="engineering-workspace">
      <section className="engineering-workspace__intro">
        <p className="engineering-workspace__eyebrow">BrianShortApps Platform</p>
        <h1 className="engineering-workspace__title">{engineeringWorkspaceExperience.title}</h1>
        <p className="engineering-workspace__summary">{engineeringWorkspaceExperience.description}</p>
      </section>

      <section className="engineering-workspace__principle">
        <h2>Build the platform before the product.</h2>
        <p>
          The Engineering Workspace surfaces the architecture, standards, SDK, and visual operating
          system that every BrianShortApps application inherits.
        </p>
      </section>

      <ExperienceRenderer
        experience={engineeringWorkspaceExperience}
        className="engineering-workspace__experience"
      />
    </main>
  );
}
