import type { DocumentModel } from "../models/DocumentModel";

type MarkdownRendererProps = {
  document: DocumentModel;
};

export function MarkdownRenderer({ document }: MarkdownRendererProps) {
  return (
    <div className="document-renderer">
      {document.blocks.map((block, index) => {
        if (block.type === "heading") {
          const HeadingTag = `h${block.level}` as "h1" | "h2" | "h3";

          return (
            <HeadingTag id={block.id} key={`${block.text}-${index}`}>
              {block.text}
            </HeadingTag>
          );
        }

        if (block.type === "list-item") {
          return (
            <p className="document-renderer__list-item" key={`${block.text}-${index}`}>
              {block.text}
            </p>
          );
        }

        if (block.type === "code") {
          return <pre key={`${block.text}-${index}`}>{block.text}</pre>;
        }

        if (block.type === "quote") {
          return <blockquote key={`${block.text}-${index}`}>{block.text}</blockquote>;
        }

        return <p key={`${block.text}-${index}`}>{block.text}</p>;
      })}
    </div>
  );
}
