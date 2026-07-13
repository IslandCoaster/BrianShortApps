import type { FinancialObligation, ObligationCadence } from "@bsa/finance";

import "./OperationalFinancialObligationsView.css";

type OperationalFinancialObligationsViewProps = {
  obligations: FinancialObligation[];
  onAddObligation: () => void;
  onRemoveObligation: (obligationId: string) => void;
};

function formatAmount(amount: number) {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatStatus(status: FinancialObligation["status"]) {
  return status
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCadence(cadence: ObligationCadence) {
  switch (cadence) {
    case "one-time":
      return "One time";

    case "weekly":
      return "Weekly";

    case "biweekly":
      return "Every two weeks";

    case "monthly":
      return "Monthly";

    case "quarterly":
      return "Quarterly";

    case "annually":
      return "Annually";
  }
}

function ObligationCard({
  obligation,
  onRemoveObligation,
}: {
  obligation: FinancialObligation;
  onRemoveObligation: (obligationId: string) => void;
}) {
  return (
    <article className="operational-financial-obligations__card">
      <div className="operational-financial-obligations__card-header">
        <div>
          <small>Utility Obligation</small>

          <strong>{obligation.name}</strong>

          <span>{obligation.provider}</span>
        </div>

        <span
          className={`operational-financial-obligations__status operational-financial-obligations__status--${obligation.status}`}
        >
          {formatStatus(obligation.status)}
        </span>
      </div>

      <div className="operational-financial-obligations__amount">
        <span>Current Amount Due</span>

        <strong>{formatAmount(obligation.amountDue)}</strong>
      </div>

      <dl>
        <div>
          <dt>Next Known Due Date</dt>

          <dd>{obligation.dueDate ?? "Not yet established"}</dd>
        </div>

        <div>
          <dt>Cadence</dt>

          <dd>{formatCadence(obligation.cadence)}</dd>
        </div>

        <div>
          <dt>Reference Number</dt>

          <dd>{obligation.referenceNumber ?? "Not entered"}</dd>
        </div>
      </dl>

      {!obligation.dueDate ? (
        <p className="operational-financial-obligations__planning-note">
          This obligation is persisted, but it remains excluded from dated
          funding allocation until its next due date is known.
        </p>
      ) : null}

      {obligation.notes ? (
        <p className="operational-financial-obligations__notes">
          {obligation.notes}
        </p>
      ) : null}

      <div className="operational-financial-obligations__card-actions">
        <button
          type="button"
          onClick={() => {
            const shouldRemove = window.confirm(
              `Remove "${obligation.name}" from Personal Finance?`,
            );

            if (shouldRemove) {
              onRemoveObligation(obligation.id);
            }
          }}
        >
          Remove obligation
        </button>
      </div>
    </article>
  );
}

export function OperationalFinancialObligationsView({
  obligations,
  onAddObligation,
  onRemoveObligation,
}: OperationalFinancialObligationsViewProps) {
  const activeObligations = obligations.filter(
    (obligation) =>
      obligation.status !== "cancelled" && obligation.status !== "satisfied",
  );

  const datedObligations = activeObligations
    .filter(
      (
        obligation,
      ): obligation is FinancialObligation & {
        dueDate: string;
      } => obligation.dueDate !== undefined,
    )
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate));

  const undatedObligations = activeObligations.filter(
    (obligation) => obligation.dueDate === undefined,
  );

  const knownRequiredTotal = activeObligations.reduce(
    (total, obligation) => total + obligation.amountDue,
    0,
  );

  const datedRequiredTotal = datedObligations.reduce(
    (total, obligation) => total + obligation.amountDue,
    0,
  );

  return (
    <section className="operational-financial-obligations">
      <div className="operational-financial-obligations__header">
        <div>
          <span>Operational obligations</span>

          <h3>Financial Obligations</h3>

          <p>
            These recurring payment requirements were restored from the
            operational obligation repository.
          </p>
        </div>

        <button type="button" onClick={onAddObligation}>
          Add obligation
        </button>
      </div>

      <div className="operational-financial-obligations__summary">
        <article>
          <span>Active Obligations</span>

          <strong>{activeObligations.length}</strong>
        </article>

        <article>
          <span>Known Required Amount</span>

          <strong>{formatAmount(knownRequiredTotal)}</strong>
        </article>

        <article>
          <span>Dated Funding Requirements</span>

          <strong>{formatAmount(datedRequiredTotal)}</strong>
        </article>

        <article>
          <span>Missing Due Dates</span>

          <strong>{undatedObligations.length}</strong>
        </article>
      </div>

      {datedObligations.length > 0 ? (
        <section className="operational-financial-obligations__group">
          <div className="operational-financial-obligations__group-header">
            <div>
              <h4>Dated Obligations</h4>

              <p>
                Requirements currently eligible for operational funding
                allocation.
              </p>
            </div>

            <span>
              {datedObligations.length}{" "}
              {datedObligations.length === 1 ? "obligation" : "obligations"}
            </span>
          </div>

          <div className="operational-financial-obligations__list">
            {datedObligations.map((obligation) => (
              <ObligationCard
                key={obligation.id}
                obligation={obligation}
                onRemoveObligation={onRemoveObligation}
              />
            ))}
          </div>
        </section>
      ) : null}

      {undatedObligations.length > 0 ? (
        <section className="operational-financial-obligations__group">
          <div className="operational-financial-obligations__group-header">
            <div>
              <h4>Awaiting Due Date</h4>

              <p>
                Persisted obligations that cannot yet be placed on the funding
                timeline.
              </p>
            </div>

            <span>
              {undatedObligations.length}{" "}
              {undatedObligations.length === 1 ? "obligation" : "obligations"}
            </span>
          </div>

          <div className="operational-financial-obligations__list">
            {undatedObligations.map((obligation) => (
              <ObligationCard
                key={obligation.id}
                obligation={obligation}
                onRemoveObligation={onRemoveObligation}
              />
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
