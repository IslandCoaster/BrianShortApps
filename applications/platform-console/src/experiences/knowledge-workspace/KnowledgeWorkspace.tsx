import { getKnowledgeDocumentContent } from "@bsa/knowledge";

import { KnowledgeEmptyState } from "./components/KnowledgeEmptyState";
import { KnowledgeHeader } from "./components/KnowledgeHeader";
import { KnowledgeMetadata } from "./components/KnowledgeMetadata";
import { KnowledgeNavigation } from "./components/KnowledgeNavigation";
import { KnowledgeRelatedDocuments } from "./components/KnowledgeRelatedDocuments";
import { DocumentRenderer } from "./document/DocumentRenderer";
import "./KnowledgeWorkspace.css";

type KnowledgeWorkspaceProps = {
  selectedKnowledgeId: string | null;
  onClearSelection: () => void;
  onSelectKnowledge: (knowledgeId: string) => void;
};

export function KnowledgeWorkspace({
  selectedKnowledgeId,
  onClearSelection,
  onSelectKnowledge,
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
      <KnowledgeRelatedDocuments
        selectedKnowledgeId={selectedDocument.id}
        onSelectKnowledge={onSelectKnowledge}
      />
      <KnowledgeNavigation
        selectedKnowledgeId={selectedDocument.id}
        onSelectKnowledge={onSelectKnowledge}
      />
    </section>
  );
}
