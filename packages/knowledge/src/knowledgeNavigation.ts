import { knowledgeDocuments } from "./knowledge";

export function getAdjacentKnowledgeDocuments(documentId: string) {
  const currentIndex = knowledgeDocuments.findIndex((document) => document.id === documentId);

  if (currentIndex < 0) {
    return {
      previous: null,
      next: null,
    };
  }

  return {
    previous: knowledgeDocuments[currentIndex - 1] ?? null,
    next: knowledgeDocuments[currentIndex + 1] ?? null,
  };
}

export function getRelatedKnowledgeDocuments(documentId: string) {
  const currentDocument = knowledgeDocuments.find((document) => document.id === documentId);

  if (!currentDocument) {
    return [];
  }

  return knowledgeDocuments.filter(
    (document) => document.category === currentDocument.category && document.id !== documentId,
  );
}
