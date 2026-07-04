const workspaceStatusItems = [
  { label: "Environment", value: "Development" },
  { label: "Branch", value: "mc-003-1-platform-foundation" },
  { label: "Access", value: "BSA-Root" },
];

export function WorkspaceStatus() {
  return (
    <section className="workspace-status" aria-label="Workspace status">
      {workspaceStatusItems.map((item) => (
        <div className="workspace-status__item" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </section>
  );
}
