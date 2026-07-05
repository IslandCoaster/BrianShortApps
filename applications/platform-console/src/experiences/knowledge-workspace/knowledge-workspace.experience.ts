import type { Experience } from "@bsa/experience";

export const knowledgeWorkspaceExperience: Experience = {
  id: "knowledge-workspace",
  title: "Knowledge Workspace",
  description:
    "A focused reading environment for BrianShortApps platform knowledge, standards, architecture, and design decisions.",
  regions: [
    {
      id: "document-header",
      title: "Document Header",
      items: [
        {
          id: "live-knowledge",
          label: "Live Knowledge",
          description: "Repository Source",
          status: "active",
        },
      ],
    },
  ],
};
