import { ExperienceRenderer } from "@bsa/experience";
import { getKnowledgeDocument } from "@bsa/knowledge";

import "./EngineeringWorkspace.css";
import { engineeringWorkspaceExperience } from "./engineering-workspace.experience";

type EngineeringWorkspaceProps = {
  selectedKnowledgeId: string | null;
  onSelectKnowledge: (knowledgeId: string) => void;
};

export default function EngineeringWorkspace({
  selectedKnowledgeId,
  onSelectKnowledge,
}: EngineeringWorkspaceProps) {
  const selectedDocument = selectedKnowledgeId ? getKnowledgeDocument(selectedKnowledgeId) : null;

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

      {selectedDocument ? (
        <section className="engineering-workspace__document">
          <p className="engineering-workspace__document-eyebrow">Knowledge Preview</p>
          <h2>{selectedDocument.title}</h2>
          <dl className="engineering-workspace__document-meta">
            <div>
              <dt>Category</dt>
              <dd>{selectedDocument.category}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>{selectedDocument.path}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      <ExperienceRenderer
        experience={engineeringWorkspaceExperience}
        className="engineering-workspace__experience"
        onSelectItem={onSelectKnowledge}
      />
    </main>
  );
}
