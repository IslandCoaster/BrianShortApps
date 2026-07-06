import { getKnowledgeCategoryLabel, getKnowledgeDocument } from "@bsa/knowledge";

type KnowledgeContextProps = {
  selectedKnowledgeId: string;
};

export function KnowledgeContext({ selectedKnowledgeId }: KnowledgeContextProps) {
  const document = getKnowledgeDocument(selectedKnowledgeId);

  if (!document) {
    return null;
  }

  return (
    <div className="knowledge-workspace__context">
      <span>{getKnowledgeCategoryLabel(document.category)}</span>
      <strong>{document.title}</strong>
    </div>
  );
}
