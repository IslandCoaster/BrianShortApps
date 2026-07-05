import type { MarkdownDocumentBlock } from "@bsa/knowledge";

type MarkdownDocumentRendererProps = {
  blocks: MarkdownDocumentBlock[];
};

export function MarkdownDocumentRenderer({ blocks }: MarkdownDocumentRendererProps) {
  return (
    <div className="knowledge-workspace__content">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const HeadingTag = `h${block.level}` as "h1" | "h2" | "h3";

          return <HeadingTag key={`${block.text}-${index}`}>{block.text}</HeadingTag>;
        }

        if (block.type === "list-item") {
          return (
            <p className="knowledge-workspace__list-item" key={`${block.text}-${index}`}>
              {block.text}
            </p>
          );
        }

        if (block.type === "code") {
          return <pre key={`${block.text}-${index}`}>{block.text}</pre>;
        }

        return <p key={`${block.text}-${index}`}>{block.text}</p>;
      })}
    </div>
  );
}
