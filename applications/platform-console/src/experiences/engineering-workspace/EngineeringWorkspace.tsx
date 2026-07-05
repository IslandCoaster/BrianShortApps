import { ExperienceRenderer } from "@bsa/experience";
import { createMarkdownPreview, getKnowledgeDocumentContent } from "@bsa/knowledge";

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
  const selectedDocument = selectedKnowledgeId ? getKnowledgeDocumentContent(selectedKnowledgeId) : null;
  const selectedDocumentPreview = selectedDocument
    ? createMarkdownPreview(selectedDocument.content)
    : [];

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
              <dt>Source</dt>
              <dd>{selectedDocument.path}</dd>
            </div>
          </dl>
          <div className="engineering-workspace__document-content">
            {selectedDocumentPreview.map((block, index) => {
              if (block.type === "heading") {
                const HeadingTag = `h${block.level}` as "h1" | "h2" | "h3";

                return <HeadingTag key={`${block.text}-${index}`}>{block.text}</HeadingTag>;
              }

              return <p key={`${block.text}-${index}`}>{block.text}</p>;
            })}
          </div>
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
