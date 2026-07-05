import type { KnowledgeDocumentContent } from "@bsa/knowledge";
import { createMarkdownDocumentBlocks } from "@bsa/knowledge";

import { MarkdownRenderer } from "./renderers/MarkdownRenderer";

type DocumentRendererProps = {
  document: KnowledgeDocumentContent;
};

export function DocumentRenderer({ document }: DocumentRendererProps) {
  if (document.format === "markdown") {
    return <MarkdownRenderer blocks={createMarkdownDocumentBlocks(document.content)} />;
  }

  return null;
}
