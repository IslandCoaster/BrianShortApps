import type { MarkdownDocumentBlock } from "./MarkdownParser";

export type DocumentOutlineItem = {
  id: string;
  level: 1 | 2 | 3;
  label: string;
};

export function createDocumentOutline(blocks: MarkdownDocumentBlock[]): DocumentOutlineItem[] {
  return blocks
    .filter((block): block is Extract<MarkdownDocumentBlock, { type: "heading" }> => {
      return block.type === "heading";
    })
    .map((block) => ({
      id: block.text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      level: block.level,
      label: block.text,
    }));
}
