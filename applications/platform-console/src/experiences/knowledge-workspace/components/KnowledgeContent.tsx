import type { MarkdownPreviewBlock } from "@bsa/knowledge";

type KnowledgeContentProps = {
  blocks: MarkdownPreviewBlock[];
};

export function KnowledgeContent({ blocks }: KnowledgeContentProps) {
  return (
    <div className="knowledge-workspace__content">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const HeadingTag = `h${block.level}` as "h1" | "h2" | "h3";

          return <HeadingTag key={`${block.text}-${index}`}>{block.text}</HeadingTag>;
        }

        return <p key={`${block.text}-${index}`}>{block.text}</p>;
      })}
    </div>
  );
}
