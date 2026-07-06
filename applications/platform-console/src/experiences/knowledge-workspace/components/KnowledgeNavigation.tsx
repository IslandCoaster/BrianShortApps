import type { KnowledgeDocument } from "@bsa/knowledge";
import { getAdjacentKnowledgeDocuments } from "@bsa/knowledge";

type KnowledgeNavigationProps = {
  selectedKnowledgeId: string;
  onSelectKnowledge: (knowledgeId: string) => void;
};

export function KnowledgeNavigation({
  selectedKnowledgeId,
  onSelectKnowledge,
}: KnowledgeNavigationProps) {
  const { previous, next } = getAdjacentKnowledgeDocuments(selectedKnowledgeId);

  if (!previous && !next) {
    return null;
  }

  return (
    <nav className="knowledge-workspace__navigation" aria-label="Knowledge document navigation">
      <KnowledgeNavigationButton
        document={previous}
        label="Previous"
        onSelectKnowledge={onSelectKnowledge}
      />
      <KnowledgeNavigationButton document={next} label="Next" onSelectKnowledge={onSelectKnowledge} />
    </nav>
  );
}

type KnowledgeNavigationButtonProps = {
  document: KnowledgeDocument | null;
  label: "Previous" | "Next";
  onSelectKnowledge: (knowledgeId: string) => void;
};

function KnowledgeNavigationButton({
  document,
  label,
  onSelectKnowledge,
}: KnowledgeNavigationButtonProps) {
  if (!document) {
    return <span className="knowledge-workspace__navigation-placeholder" />;
  }

  return (
    <button
      className="knowledge-workspace__navigation-button"
      type="button"
      onClick={() => onSelectKnowledge(document.id)}
    >
      <span>{label}</span>
      <strong>{document.title}</strong>
    </button>
  );
}
