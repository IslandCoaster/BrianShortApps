import { EngineeringShell } from "../shell/EngineeringShell";
import EngineeringWorkspace from "../experiences/engineering-workspace/EngineeringWorkspace";

export default function App() {
  return (
    <EngineeringShell>
      <EngineeringWorkspace />
    </EngineeringShell>
  );
}
