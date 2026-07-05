import type { Experience } from "@bsa/experience";

export const engineeringWorkspaceExperience: Experience = {
  id: "engineering-workspace",
  title: "Engineering Workspace",
  description:
    "The operating environment for building, governing, and evolving the BrianShortApps ecosystem.",
  regions: [
    {
      id: "foundation",
      title: "Foundation",
      items: [
        { id: "platform-vision", label: "Platform Vision", status: "available" },
        { id: "platform-model", label: "Platform Model", status: "available" },
        { id: "engineering-platform", label: "Engineering Platform", status: "available" },
        { id: "engineering-philosophy", label: "Engineering Philosophy", status: "available" },
        { id: "platform-principles", label: "Platform Principles", status: "available" },
      ],
    },
    {
      id: "architecture",
      title: "Architecture",
      items: [
        { id: "repository-architecture", label: "Repository Architecture", status: "available" },
        { id: "dependency-rules", label: "Dependency Rules", status: "available" },
        { id: "identity-architecture", label: "Identity Architecture", status: "available" },
        { id: "registry-architecture", label: "Registry Architecture", status: "available" },
        { id: "root-diagnostics", label: "Root Diagnostics", status: "planned" },
      ],
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
