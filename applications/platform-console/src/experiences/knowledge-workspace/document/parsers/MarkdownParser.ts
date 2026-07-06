export type MarkdownDocumentBlock =
  | {
      type: "heading";
      level: 1 | 2 | 3;
      text: string;
    }
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list-item";
      text: string;
    }
  | {
      type: "code";
      text: string;
    }
  | {
      type: "quote";
      text: string;
    };

export function parseMarkdownDocument(content: string): MarkdownDocumentBlock[] {
  const lines = content.split("\n");
  const blocks: MarkdownDocumentBlock[] = [];
  let codeBuffer: string[] = [];
  let isCodeBlock = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith("```")) {
      if (isCodeBlock) {
        blocks.push({ type: "code", text: codeBuffer.join("\n") });
        codeBuffer = [];
      }

      isCodeBlock = !isCodeBlock;
      continue;
    }

    if (isCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    const trimmed = line.trim();

    if (!trimmed) continue;

    if (trimmed.startsWith("### ")) {
      blocks.push({ type: "heading", level: 3, text: trimmed.replace(/^### /, "") });
      continue;
    }

    if (trimmed.startsWith("## ")) {
      blocks.push({ type: "heading", level: 2, text: trimmed.replace(/^## /, "") });
      continue;
    }

    if (trimmed.startsWith("# ")) {
      blocks.push({ type: "heading", level: 1, text: trimmed.replace(/^# /, "") });
      continue;
    }

    if (trimmed.startsWith("- ")) {
      blocks.push({ type: "list-item", text: trimmed.replace(/^- /, "") });
      continue;
    }

    if (trimmed.startsWith("> ")) {
      blocks.push({ type: "quote", text: trimmed.replace(/^> /, "") });
      continue;
    }

    blocks.push({ type: "paragraph", text: trimmed });
  }

  return blocks;
}
