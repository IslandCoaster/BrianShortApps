// @bsa/knowledge

export type { KnowledgeDocument, KnowledgeDocumentCategory } from "./knowledge";
export type { KnowledgeDocumentContent, KnowledgeDocumentFormat } from "./knowledgeProvider";
export type { PlatformInventoryItem } from "./platformInventory";

export {
  getKnowledgeDocument,
  knowledgeDocuments,
  listKnowledgeDocuments,
  listKnowledgeDocumentsByCategory,
} from "./knowledge";

export {
  getKnowledgeCategoryLabel,
  knowledgeCategoryLabels,
} from "./knowledgeCategories";

export {
  getAdjacentKnowledgeDocuments,
  getRelatedKnowledgeDocuments,
} from "./knowledgeNavigation";

export { getKnowledgeDocumentContent } from "./knowledgeProvider";

export { listPlatformInventoryItems, platformInventoryItems } from "./platformInventory";
