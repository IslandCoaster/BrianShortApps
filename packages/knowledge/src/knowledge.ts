export type KnowledgeDocument = {
  id: string;
  title: string;
  path: string;
  category: "foundation" | "architecture" | "standards" | "adr" | "design";
};

export const knowledgeDocuments: KnowledgeDocument[] = [
  {
    id: "engineering-platform",
    title: "Engineering Platform",
    path: "docs/platform/foundation/EngineeringPlatform.md",
    category: "foundation",
  },
  {
    id: "experience-platform",
    title: "Experience Platform",
    path: "docs/platform/foundation/ExperiencePlatform.md",
    category: "foundation",
  },
  {
    id: "visual-operating-system",
    title: "Visual Operating System",
    path: "packages/design-system/foundations/visual-operating-system/DS-004-VisualOperatingSystem.md",
    category: "design",
  },
  {
    id: "platform-mark",
    title: "Platform Mark",
    path: "packages/design-system/foundations/platform-mark/DS-002-PlatformMark.md",
    category: "design",
  },
];
