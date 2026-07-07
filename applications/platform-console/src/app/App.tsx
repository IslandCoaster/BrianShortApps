import { useState } from "react";

import EngineeringWorkspace from "../experiences/engineering-workspace/EngineeringWorkspace";
import { FinanceWorkspace } from "../experiences/finance-workspace/FinanceWorkspace";
import { EngineeringShell } from "../shell/EngineeringShell";
import type { WorkspaceMode } from "../workspaces/workspaceModes";

export default function App() {
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState<string | null>(null);
  const workspaceMode: WorkspaceMode = selectedKnowledgeId === null ? "browse" : "reading";

  return (
    <EngineeringShell mode={workspaceMode}>
      <EngineeringWorkspace
        selectedKnowledgeId={selectedKnowledgeId}
        onSelectKnowledge={setSelectedKnowledgeId}
      />
      <FinanceWorkspace />
    </EngineeringShell>
  );
}
