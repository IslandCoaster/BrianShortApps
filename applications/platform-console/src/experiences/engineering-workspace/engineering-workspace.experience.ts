import type { Experience } from "@bsa/experience";
import { listKnowledgeDocumentsByCategory } from "@bsa/knowledge";

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
      id: "workspace-actions",
      title: "Workspace Actions",
      items: [
        { id: "knowledge", label: "Knowledge", status: "available" },
        { id: "registry", label: "Registry", status: "available" },
        { id: "diagnostics", label: "Diagnostics", status: "planned" },
      ],
    },
    {
      id: "platform-inventory",
      title: "Platform Inventory",
      items: [
        { id: "shared-packages", label: "Shared Packages", description: "7" },
        { id: "platform-areas", label: "Platform Areas", description: "5" },
        { id: "product-applications", label: "Product Applications", description: "3" },
        { id: "engineering-experiences", label: "Engineering Experiences", description: "3" },
      ],
    },
  ],
};
