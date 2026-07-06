export type DocumentBlock =
  | {
      type: "heading";
      level: 1 | 2 | 3;
      id: string;
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

export type DocumentOutlineItem = {
  id: string;
  level: 1 | 2 | 3;
  label: string;
};

export type DocumentModel = {
  title: string;
  format: "markdown";
  outline: DocumentOutlineItem[];
  blocks: DocumentBlock[];
};

export function createDocumentHeadingId(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
