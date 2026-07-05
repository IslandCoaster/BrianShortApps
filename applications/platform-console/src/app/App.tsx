import { useState } from "react";

import { EngineeringShell } from "../shell/EngineeringShell";
import EngineeringWorkspace from "../experiences/engineering-workspace/EngineeringWorkspace";

export default function App() {
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState<string | null>(null);

  return (
    <EngineeringShell>
      <EngineeringWorkspace
        selectedKnowledgeId={selectedKnowledgeId}
        onSelectKnowledge={setSelectedKnowledgeId}
      />
    </EngineeringShell>
  );
}
