import type { KnowledgeDocumentContent } from "@bsa/knowledge";

type KnowledgeMetadataProps = {
  document: KnowledgeDocumentContent;
};

export function KnowledgeMetadata({ document }: KnowledgeMetadataProps) {
  return (
    <dl className="knowledge-workspace__meta">
      <div>
        <dt>Source</dt>
        <dd>{document.path}</dd>
      </div>
    </dl>
  );
}
