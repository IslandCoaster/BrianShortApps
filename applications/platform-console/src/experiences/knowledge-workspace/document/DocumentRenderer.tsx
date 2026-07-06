import type { KnowledgeDocumentContent } from "@bsa/knowledge";

import "./DocumentRenderer.css";
import { parseMarkdownDocument } from "./parsers/MarkdownParser";
import { MarkdownRenderer } from "./renderers/MarkdownRenderer";

type DocumentRendererProps = {
  document: KnowledgeDocumentContent;
};

export function DocumentRenderer({ document }: DocumentRendererProps) {
  if (document.format === "markdown") {
    const documentModel = parseMarkdownDocument(document.title, document.content);

    return (
      <div className="document-experience">
        <aside className="document-experience__outline" aria-label="Document outline">
          <p>Contents</p>
          {documentModel.outline.map((item) => (
            <a
              className={`document-experience__outline-item document-experience__outline-item--level-${item.level}`}
              href={`#${item.id}`}
              key={item.id}
            >
              {item.label}
            </a>
          ))}
        </aside>

        <MarkdownRenderer document={documentModel} />
      </div>
    );
  }

  return null;
}
