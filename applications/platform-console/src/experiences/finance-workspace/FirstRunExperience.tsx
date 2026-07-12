import { Link } from "react-router";

import { ProductHero } from "../../components/product-hero/ProductHero";

export function FirstRunExperience() {
  return (
    <main className="personal-finance-page">
      <div className="personal-finance-page__container">
        <ProductHero
          eyebrow="BrianShortApps Personal Finance"
          title="Welcome to Personal Finance"
          description="Let's establish your current financial position."
          actions={<Link to="/">Engineering workspace</Link>}
        />

        <section
          className="personal-finance-page__first-run"
          aria-labelledby="personal-finance-first-run-title"
        >
          <div className="personal-finance-page__first-run-copy">
            <span>First step</span>

            <h2 id="personal-finance-first-run-title">
              Current Cash Position
            </h2>

            <p>
              Begin by recording the cash currently available to you. This
              becomes the first immutable event in your operational financial
              history.
            </p>
          </div>

          <div className="personal-finance-page__first-run-next">
            <strong>What comes next</strong>

            <p>
              After your current cash position is established, you can add
              financial accounts and begin daily financial tracking.
            </p>

            <button type="button" disabled>
              Establish current cash position
            </button>

            <small>
              Current Cash Position entry will be enabled in FL-001.4.2.
            </small>
          </div>
        </section>
      </div>
    </main>
  );
}
