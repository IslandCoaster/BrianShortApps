export type KnowledgeDocumentCategory =
  | "foundation"
  | "architecture"
  | "standards"
  | "adr"
  | "design";

export type KnowledgeDocument = {
  id: string;
  title: string;
  path: string;
  category: KnowledgeDocumentCategory;
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
    id: "repository-architecture",
    title: "Repository Architecture",
    path: "docs/platform/architecture/RepositoryArchitecture.md",
    category: "architecture",
  },
  {
    id: "dependency-rules",
    title: "Dependency Rules",
    path: "docs/platform/architecture/DependencyRules.md",
    category: "architecture",
  },
  {
    id: "identity-architecture",
    title: "Identity Architecture",
    path: "docs/platform/architecture/IdentityArchitecture.md",
    category: "architecture",
  },
  {
    id: "registry-architecture",
    title: "Registry Architecture",
    path: "docs/platform/architecture/RegistryArchitecture.md",
    category: "architecture",
  },
  {
    id: "root-diagnostics",
    title: "Root Diagnostics",
    path: "docs/platform/architecture/RootDiagnosticsArchitecture.md",
    category: "architecture",
  },
  {
    id: "branch-workflow",
    title: "Branch Workflow",
    path: "docs/platform/standards/BranchWorkflow.md",
    category: "standards",
  },
  {
    id: "definition-of-done",
    title: "Definition of Done",
    path: "docs/platform/standards/DefinitionOfDone.md",
    category: "standards",
  },
  {
    id: "documentation-standards",
    title: "Documentation Standards",
    path: "docs/platform/standards/DocumentationStandards.md",
    category: "standards",
  },
  {
    id: "engineering-lifecycle",
    title: "Engineering Lifecycle",
    path: "docs/platform/standards/EngineeringLifecycle.md",
    category: "standards",
  },
  {
    id: "naming-standards",
    title: "Naming Standards",
    path: "docs/platform/standards/NamingStandards.md",
    category: "standards",
  },
  {
    id: "adr-0001-platform-first-architecture",
    title: "ADR-0001 Platform-First Architecture",
    path: "docs/architecture/adr/ADR-0001-platform-first-architecture.md",
    category: "adr",
  },
  {
    id: "adr-0002-sdk-first-development",
    title: "ADR-0002 SDK-First Development",
    path: "docs/architecture/adr/ADR-0002-sdk-first-development.md",
    category: "adr",
  },
  {
    id: "adr-0003-cross-platform-development",
    title: "ADR-0003 Cross-Platform Development",
    path: "docs/architecture/adr/ADR-0003-cross-platform-development.md",
    category: "adr",
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

export function listKnowledgeDocuments() {
  return knowledgeDocuments;
}

export function getKnowledgeDocument(documentId: string) {
  return knowledgeDocuments.find((document) => document.id === documentId) ?? null;
}

export function listKnowledgeDocumentsByCategory(category: KnowledgeDocumentCategory) {
  return knowledgeDocuments.filter((document) => document.category === category);
}
