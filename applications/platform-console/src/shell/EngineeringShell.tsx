import type { ReactNode } from "react";

import { Navigator } from "./Navigator/Navigator";
import { WorkspaceHeader } from "./WorkspaceHeader/WorkspaceHeader";
import "./shell.css";

type EngineeringShellProps = {
  children: ReactNode;
};

export function EngineeringShell({ children }: EngineeringShellProps) {
  return (
    <div className="engineering-shell">
      <Navigator />
      <section className="engineering-shell__main">
        <WorkspaceHeader />
        <div className="engineering-shell__content">{children}</div>
      </section>
    </div>
  );
}
