import { createMarkdownPreview, getKnowledgeDocumentContent } from "@bsa/knowledge";

import "./KnowledgeWorkspace.css";

type KnowledgeWorkspaceProps = {
  selectedKnowledgeId: string | null;
};

export function KnowledgeWorkspace({ selectedKnowledgeId }: KnowledgeWorkspaceProps) {
  const selectedDocument = selectedKnowledgeId ? getKnowledgeDocumentContent(selectedKnowledgeId) : null;
  const selectedDocumentPreview = selectedDocument
    ? createMarkdownPreview(selectedDocument.content)
    : [];

  if (!selectedDocument) {
    return null;
  }

  return (
    <section className="knowledge-workspace">
      <div className="knowledge-workspace__header">
        <div>
          <p className="knowledge-workspace__eyebrow">Live Knowledge</p>
          <h2>{selectedDocument.title}</h2>
        </div>
        <span className="knowledge-workspace__badge">Repository Source</span>
      </div>

      <dl className="knowledge-workspace__meta">
        <div>
          <dt>Source</dt>
          <dd>{selectedDocument.path}</dd>
        </div>
      </dl>

      <div className="knowledge-workspace__content">
        {selectedDocumentPreview.map((block, index) => {
          if (block.type === "heading") {
            const HeadingTag = `h${block.level}` as "h1" | "h2" | "h3";

            return <HeadingTag key={`${block.text}-${index}`}>{block.text}</HeadingTag>;
          }

          return <p key={`${block.text}-${index}`}>{block.text}</p>;
        })}
      </div>
    </section>
  );
}
