import { ExperienceRenderer } from "@bsa/experience";

import type { WorkspaceMode } from "../../workspaces/workspaceModes";
import { KnowledgeWorkspace } from "../knowledge-workspace/KnowledgeWorkspace";
import "./EngineeringWorkspace.css";
import { engineeringWorkspaceExperience } from "./engineering-workspace.experience";

type EngineeringWorkspaceProps = {
  selectedKnowledgeId: string | null;
  onSelectKnowledge: (knowledgeId: string | null) => void;
};

export default function EngineeringWorkspace({
  selectedKnowledgeId,
  onSelectKnowledge,
}: EngineeringWorkspaceProps) {
  const workspaceMode: WorkspaceMode = selectedKnowledgeId ? "reading" : "browse";

  return (
    <main className="engineering-workspace" data-workspace-mode={workspaceMode}>
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

      <KnowledgeWorkspace
        selectedKnowledgeId={selectedKnowledgeId}
        onClearSelection={() => onSelectKnowledge(null)}
        onSelectKnowledge={onSelectKnowledge}
      />

      {workspaceMode === "browse" ? (
        <ExperienceRenderer
          experience={engineeringWorkspaceExperience}
          className="engineering-workspace__experience"
          onSelectItem={onSelectKnowledge}
          selectedItemId={selectedKnowledgeId}
        />
      ) : null}
    </main>
  );
}
