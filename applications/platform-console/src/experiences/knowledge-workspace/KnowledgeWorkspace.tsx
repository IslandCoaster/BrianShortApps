import { createMarkdownPreview, getKnowledgeDocumentContent } from "@bsa/knowledge";

import { KnowledgeContent } from "./components/KnowledgeContent";
import { KnowledgeEmptyState } from "./components/KnowledgeEmptyState";
import { KnowledgeHeader } from "./components/KnowledgeHeader";
import { KnowledgeMetadata } from "./components/KnowledgeMetadata";
import "./KnowledgeWorkspace.css";

type KnowledgeWorkspaceProps = {
  selectedKnowledgeId: string | null;
  onClearSelection: () => void;
};

export function KnowledgeWorkspace({
  selectedKnowledgeId,
  onClearSelection,
}: KnowledgeWorkspaceProps) {
  const selectedDocument = selectedKnowledgeId ? getKnowledgeDocumentContent(selectedKnowledgeId) : null;
  const selectedDocumentPreview = selectedDocument
    ? createMarkdownPreview(selectedDocument.content)
    : [];

  if (!selectedDocument) {
    return <KnowledgeEmptyState />;
  }

  return (
    <section className="knowledge-workspace">
      <KnowledgeHeader document={selectedDocument} onClearSelection={onClearSelection} />
      <KnowledgeMetadata document={selectedDocument} />
      <KnowledgeContent blocks={selectedDocumentPreview} />
    </section>
  );
}
