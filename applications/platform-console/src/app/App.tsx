import { EngineeringShell } from "../shell/EngineeringShell";
import EngineeringWorkspace from "../pages/EngineeringWorkspace";

export default function App() {
  return (
    <EngineeringShell>
      <EngineeringWorkspace />
    </EngineeringShell>
  );
}
