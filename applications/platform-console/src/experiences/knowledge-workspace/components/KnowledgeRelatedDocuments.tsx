import type { KnowledgeDocument } from "@bsa/knowledge";
import { getRelatedKnowledgeDocuments } from "@bsa/knowledge";

type KnowledgeRelatedDocumentsProps = {
  selectedKnowledgeId: string;
  onSelectKnowledge: (knowledgeId: string) => void;
};

export function KnowledgeRelatedDocuments({
  selectedKnowledgeId,
  onSelectKnowledge,
}: KnowledgeRelatedDocumentsProps) {
  const relatedDocuments = getRelatedKnowledgeDocuments(selectedKnowledgeId).slice(0, 4);

  if (relatedDocuments.length === 0) {
    return null;
  }

  return (
    <section className="knowledge-workspace__related" aria-label="Related knowledge">
      <p>Related Knowledge</p>

      <div className="knowledge-workspace__related-list">
        {relatedDocuments.map((document) => (
          <RelatedDocumentButton
            document={document}
            key={document.id}
            onSelectKnowledge={onSelectKnowledge}
          />
        ))}
      </div>
    </section>
  );
}

type RelatedDocumentButtonProps = {
  document: KnowledgeDocument;
  onSelectKnowledge: (knowledgeId: string) => void;
};

function RelatedDocumentButton({ document, onSelectKnowledge }: RelatedDocumentButtonProps) {
  return (
    <button
      className="knowledge-workspace__related-button"
      type="button"
      onClick={() => onSelectKnowledge(document.id)}
    >
      <span>{document.category}</span>
      <strong>{document.title}</strong>
    </button>
  );
}
