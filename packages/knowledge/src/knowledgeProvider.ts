import engineeringPlatformContent from "../../../docs/platform/foundation/EngineeringPlatform.md?raw";
import experiencePlatformContent from "../../../docs/platform/foundation/ExperiencePlatform.md?raw";
import platformMarkContent from "../..//design-system/foundations/platform-mark/DS-002-PlatformMark.md?raw";
import visualOperatingSystemContent from "../..//design-system/foundations/visual-operating-system/DS-004-VisualOperatingSystem.md?raw";

import { getKnowledgeDocument } from "./knowledge";

export type KnowledgeDocumentFormat = "markdown";

export type KnowledgeDocumentContent = {
  id: string;
  title: string;
  path: string;
  format: KnowledgeDocumentFormat;
  content: string;
};

const knowledgeContentById: Record<string, string> = {
  "engineering-platform": engineeringPlatformContent,
  "experience-platform": experiencePlatformContent,
  "platform-mark": platformMarkContent,
  "visual-operating-system": visualOperatingSystemContent,
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
    format: "markdown",
    content: knowledgeContentById[document.id] ?? `# ${document.title}

This document is indexed but does not have live content wired yet.

Source:

${document.path}`,
  };
}
