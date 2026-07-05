import type { KnowledgeDocumentContent } from "@bsa/knowledge";

import { knowledgeWorkspaceExperience } from "../knowledge-workspace.experience";

type KnowledgeHeaderProps = {
  document: KnowledgeDocumentContent;
  onClearSelection: () => void;
};

export function KnowledgeHeader({ document, onClearSelection }: KnowledgeHeaderProps) {
  return (
    <div className="knowledge-workspace__header">
      <div>
        <p className="knowledge-workspace__eyebrow">{knowledgeWorkspaceExperience.title}</p>
        <h2>{document.title}</h2>
      </div>
      <div className="knowledge-workspace__header-actions">
        <span className="knowledge-workspace__badge">Repository Source</span>
        <button className="knowledge-workspace__clear" type="button" onClick={onClearSelection}>
          Clear
        </button>
      </div>
    </div>
  );
}
