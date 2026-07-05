import type { KnowledgeDocumentFormat, MarkdownDocumentBlock } from "@bsa/knowledge";

import { MarkdownRenderer } from "./renderers/MarkdownRenderer";

type DocumentRendererProps = {
  blocks: MarkdownDocumentBlock[];
  format: KnowledgeDocumentFormat;
};

export function DocumentRenderer({ blocks, format }: DocumentRendererProps) {
  if (format === "markdown") {
    return <MarkdownRenderer blocks={blocks} />;
  }

  return null;
}
