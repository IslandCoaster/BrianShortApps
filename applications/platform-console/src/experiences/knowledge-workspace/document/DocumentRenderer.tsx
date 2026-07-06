import type { KnowledgeDocumentContent } from "@bsa/knowledge";
import { parseMarkdownDocument } from "./parsers/MarkdownParser";

import "./DocumentRenderer.css";
import { MarkdownRenderer } from "./renderers/MarkdownRenderer";

type DocumentRendererProps = {
  document: KnowledgeDocumentContent;
};

export function DocumentRenderer({ document }: DocumentRendererProps) {
  if (document.format === "markdown") {
    return <MarkdownRenderer blocks={parseMarkdownDocument(document.content)} />;
  }

  return null;
}
