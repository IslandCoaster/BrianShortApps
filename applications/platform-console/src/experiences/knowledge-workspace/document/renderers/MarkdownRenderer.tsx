import type { MarkdownDocumentBlock } from "../parsers/MarkdownParser";

type MarkdownRendererProps = {
  blocks: MarkdownDocumentBlock[];
};

export function MarkdownRenderer({ blocks }: MarkdownRendererProps) {
  return (
    <div className="document-renderer">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const HeadingTag = `h${block.level}` as "h1" | "h2" | "h3";

          return <HeadingTag key={`${block.text}-${index}`}>{block.text}</HeadingTag>;
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
