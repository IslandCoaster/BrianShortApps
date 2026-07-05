export type MarkdownPreviewBlock =
  | {
      type: "heading";
      level: 1 | 2 | 3;
      text: string;
    }
  | {
      type: "paragraph";
      text: string;
    };

export function createMarkdownPreview(content: string): MarkdownPreviewBlock[] {
  return content
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 12)
    .map((line): MarkdownPreviewBlock => {
      if (line.startsWith("### ")) {
        return { type: "heading", level: 3, text: line.replace(/^### /, "") };
      }

      if (line.startsWith("## ")) {
        return { type: "heading", level: 2, text: line.replace(/^## /, "") };
      }

      if (line.startsWith("# ")) {
        return { type: "heading", level: 1, text: line.replace(/^# /, "") };
      }

      return { type: "paragraph", text: line };
    });
}
