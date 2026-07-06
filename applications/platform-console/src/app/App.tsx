import { useState } from "react";

import { EngineeringShell } from "../shell/EngineeringShell";
import type { WorkspaceMode } from "../workspaces/workspaceModes";
import EngineeringWorkspace from "../experiences/engineering-workspace/EngineeringWorkspace";

export default function App() {
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState<string | null>(null);
  const workspaceMode: WorkspaceMode = selectedKnowledgeId === null ? "browse" : "reading";

  return (
    <EngineeringShell mode={workspaceMode}>
      <EngineeringWorkspace
        selectedKnowledgeId={selectedKnowledgeId}
        onSelectKnowledge={setSelectedKnowledgeId}
      />
    </EngineeringShell>
  );
}
