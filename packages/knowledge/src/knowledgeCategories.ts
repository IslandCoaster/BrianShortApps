import type { KnowledgeDocumentCategory } from "./knowledge";

export const knowledgeCategoryLabels: Record<KnowledgeDocumentCategory, string> = {
  foundation: "Foundation",
  architecture: "Architecture",
  standards: "Standards",
  adr: "Architecture Decision",
  design: "Design System",
};

export function getKnowledgeCategoryLabel(category: KnowledgeDocumentCategory) {
  return knowledgeCategoryLabels[category];
}
