import type { DocumentBlock, DocumentModel } from "../models/DocumentModel";
import { createDocumentHeadingId } from "../models/DocumentModel";

export function parseMarkdownDocument(title: string, content: string): DocumentModel {
  const lines = content.split("\n");
  const blocks: DocumentBlock[] = [];
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
      const text = trimmed.replace(/^### /, "");
      blocks.push({ type: "heading", level: 3, id: createDocumentHeadingId(text), text });
      continue;
    }

    if (trimmed.startsWith("## ")) {
      const text = trimmed.replace(/^## /, "");
      blocks.push({ type: "heading", level: 2, id: createDocumentHeadingId(text), text });
      continue;
    }

    if (trimmed.startsWith("# ")) {
      const text = trimmed.replace(/^# /, "");
      blocks.push({ type: "heading", level: 1, id: createDocumentHeadingId(text), text });
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

  return {
    title,
    format: "markdown",
    outline: blocks
      .filter((block): block is Extract<DocumentBlock, { type: "heading" }> => {
        return block.type === "heading";
      })
      .map((block) => ({
        id: block.id,
        level: block.level,
        label: block.text,
      })),
    blocks,
  };
}
