import type { ReactNode } from "react";

import type { WorkspaceMode } from "../workspaces/workspaceModes";
import { Navigator } from "./Navigator/Navigator";
import { WorkspaceHeader } from "./WorkspaceHeader/WorkspaceHeader";
import "./shell.css";

type EngineeringShellProps = {
  mode: WorkspaceMode;
  children: ReactNode;
};

export function EngineeringShell({ mode, children }: EngineeringShellProps) {
  return (
    <div className="engineering-shell">
      <Navigator />
      <section className="engineering-shell__main">
        <WorkspaceHeader mode={mode} />
        <div className="engineering-shell__content">{children}</div>
      </section>
    </div>
  );
}
