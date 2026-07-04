import type { ReactNode } from "react";

import { Sidebar } from "./Sidebar/Sidebar";
import { TopBar } from "./TopBar/TopBar";
import "./shell.css";

type EngineeringShellProps = {
  children: ReactNode;
};

export function EngineeringShell({ children }: EngineeringShellProps) {
  return (
    <div className="engineering-shell">
      <Sidebar />
      <section className="engineering-shell__main">
        <TopBar />
        <div className="engineering-shell__content">{children}</div>
      </section>
    </div>
  );
}
