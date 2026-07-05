import { getKnowledgeDocumentContent } from "@bsa/knowledge";

import { DocumentRenderer } from "./document/DocumentRenderer";
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

  if (!selectedDocument) {
    return <KnowledgeEmptyState />;
  }

  return (
    <section className="knowledge-workspace">
      <KnowledgeHeader document={selectedDocument} onClearSelection={onClearSelection} />
      <KnowledgeMetadata document={selectedDocument} />
      <DocumentRenderer document={selectedDocument} />
    </section>
  );
}
