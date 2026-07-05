import { getKnowledgeDocument } from "./knowledge";

export type KnowledgeDocumentContent = {
  id: string;
  title: string;
  path: string;
  content: string;
};

export function getKnowledgeDocumentContent(documentId: string): KnowledgeDocumentContent | null {
  const document = getKnowledgeDocument(documentId);

  if (!document) {
    return null;
  }

  return {
    id: document.id,
    title: document.title,
    path: document.path,
    content: `# ${document.title}

Live document rendering is connected.

Source:

${document.path}`,
  };
}
