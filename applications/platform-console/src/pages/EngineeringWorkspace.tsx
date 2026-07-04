import "../App.css";

const foundationDocuments = [
  "Platform Vision",
  "Platform Model",
  "Engineering Platform",
  "Engineering Philosophy",
  "Platform Principles",
];

const architectureDocuments = [
  "Repository Architecture",
  "Dependency Rules",
  "Identity Architecture",
  "Registry Architecture",
  "Root Diagnostics",
];

const platformStats = [
  { label: "SDK Packages", value: "7" },
  { label: "Engineering Applications", value: "3" },
  { label: "Product Applications", value: "3" },
  { label: "Platform Runtime Areas", value: "5" },
];

function App() {
  return (
    <main className="platform-console">
      <section className="hero">
        <p className="eyebrow">BrianShortApps Platform</p>
        <h1>Platform Console</h1>
        <p className="hero-copy">
          The administration interface for the BrianShortApps Engineering
          Platform.
        </p>
      </section>

      <section className="statement">
        <h2>Build the platform before the product.</h2>
        <p>
          The Platform Console begins by surfacing the architecture, standards,
          and package ecosystem that every BrianShortApps application will
          inherit.
        </p>
      </section>

      <section className="console-grid">
        <article className="panel">
          <h2>Foundation</h2>
          <ul>
            {foundationDocuments.map((document) => (
              <li key={document}>{document}</li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <h2>Architecture</h2>
          <ul>
            {architectureDocuments.map((document) => (
              <li key={document}>{document}</li>
            ))}
          </ul>
        </article>

        <article className="panel metrics-panel">
          <h2>Workspace Truths</h2>
          <div className="metrics">
            {platformStats.map((stat) => (
              <div className="metric" key={stat.label}>
                <span>{stat.value}</span>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

export default App;
