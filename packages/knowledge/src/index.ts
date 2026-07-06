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

export { getKnowledgeDocumentContent } from "./knowledgeProvider";

export { listPlatformInventoryItems, platformInventoryItems } from "./platformInventory";

export {
  getAdjacentKnowledgeDocuments,
  getRelatedKnowledgeDocuments,
} from "./knowledgeNavigation";
