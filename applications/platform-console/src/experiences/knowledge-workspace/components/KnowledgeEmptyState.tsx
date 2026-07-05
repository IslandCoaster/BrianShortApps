import { knowledgeWorkspaceExperience } from "../knowledge-workspace.experience";

export function KnowledgeEmptyState() {
  return (
    <section className="knowledge-workspace knowledge-workspace--empty">
      <div className="knowledge-workspace__header">
        <div>
          <p className="knowledge-workspace__eyebrow">{knowledgeWorkspaceExperience.title}</p>
          <h2>Select a knowledge document</h2>
        </div>
        <span className="knowledge-workspace__badge">Ready</span>
      </div>

      <p className="knowledge-workspace__empty-copy">
        Choose a Foundation, Architecture, Standard, Design System, or Architecture Decision item
        below to render live BrianShortApps knowledge from the repository.
      </p>
    </section>
  );
}
