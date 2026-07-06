import type { KnowledgeDocumentContent } from "@bsa/knowledge";
import { getKnowledgeDocument, getKnowledgeCategoryLabel } from "@bsa/knowledge";

type KnowledgeMetadataProps = {
  document: KnowledgeDocumentContent;
};

export function KnowledgeMetadata({ document }: KnowledgeMetadataProps) {
  const indexedDocument = getKnowledgeDocument(document.id);
  const categoryLabel = indexedDocument
    ? getKnowledgeCategoryLabel(indexedDocument.category)
    : "Knowledge";

  return (
    <dl className="knowledge-workspace__meta">
      <div>
        <dt>Category</dt>
        <dd>{categoryLabel}</dd>
      </div>

      <div>
        <dt>Source</dt>
        <dd>{document.path}</dd>
      </div>
    </dl>
  );
}
