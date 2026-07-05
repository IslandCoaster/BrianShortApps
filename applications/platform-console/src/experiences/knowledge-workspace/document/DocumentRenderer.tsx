import type { MarkdownDocumentBlock } from "@bsa/knowledge";

import { MarkdownRenderer } from "./renderers/MarkdownRenderer";

type DocumentRendererProps = {
  blocks: MarkdownDocumentBlock[];
  format: "markdown";
};

export function DocumentRenderer({ blocks, format }: DocumentRendererProps) {
  if (format === "markdown") {
    return <MarkdownRenderer blocks={blocks} />;
  }

  return null;
}
