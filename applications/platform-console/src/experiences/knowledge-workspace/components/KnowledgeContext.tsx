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
    <nav className="knowledge-workspace__context" aria-label="Knowledge breadcrumb">
      <span>Knowledge</span>
      <span aria-hidden="true">/</span>
      <span>{getKnowledgeCategoryLabel(document.category)}</span>
      <span aria-hidden="true">/</span>
      <strong>{document.title}</strong>
    </nav>
  );
}
