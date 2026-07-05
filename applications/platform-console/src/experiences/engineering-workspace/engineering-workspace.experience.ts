import type { Experience } from "@bsa/experience";
import { listKnowledgeDocumentsByCategory, listPlatformInventoryItems } from "@bsa/knowledge";

export const engineeringWorkspaceExperience: Experience = {
  id: "engineering-workspace",
  title: "Engineering Workspace",
  description:
    "The operating environment for building, governing, and evolving the BrianShortApps ecosystem.",
  regions: [
    {
      id: "foundation",
      title: "Foundation",
      items: listKnowledgeDocumentsByCategory("foundation").map((document) => ({
        id: document.id,
        label: document.title,
        description: document.path,
        status: "available",
      })),
    },
    {
      id: "architecture",
      title: "Architecture",
      items: listKnowledgeDocumentsByCategory("architecture").map((document) => ({
        id: document.id,
        label: document.title,
        description: document.path,
        status: "available",
      })),
    },
    {
      id: "standards",
      title: "Standards",
      items: listKnowledgeDocumentsByCategory("standards").map((document) => ({
        id: document.id,
        label: document.title,
        description: document.path,
        status: "available",
      })),
    },
    {
      id: "design",
      title: "Design System",
      items: listKnowledgeDocumentsByCategory("design").map((document) => ({
        id: document.id,
        label: document.title,
        description: document.path,
        status: "available",
      })),
    },
    {
      id: "architecture-decisions",
      title: "Architecture Decisions",
      items: listKnowledgeDocumentsByCategory("adr").map((document) => ({
        id: document.id,
        label: document.title,
        description: document.path,
        status: "available",
      })),
    },
    {
      id: "platform-inventory",
      title: "Platform Inventory",
      items: listPlatformInventoryItems().map((item) => ({
        id: item.id,
        label: item.label,
        description: item.value,
        status: "available",
      })),
    },
    {
      id: "workspace-actions",
      title: "Workspace Actions",
      items: [
        { id: "knowledge", label: "Knowledge", status: "available" },
        { id: "registry", label: "Registry", status: "available" },
        { id: "diagnostics", label: "Diagnostics", status: "planned" },
      ],
    },
  ],
};
