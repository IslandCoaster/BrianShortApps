import { isActiveFundingSource, type FundingSource } from "@bsa/finance";

import "./OperationalFundingSourcesView.css";

type OperationalFundingSourcesViewProps = {
  fundingSources: FundingSource[];
  onAddFundingSource: () => void;
  onRemoveFundingSource: (fundingSourceId: string) => void;
};

function formatAmount(amount: number) {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatStatus(status: FundingSource["status"]) {
  return status
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatType(type: FundingSource["fundingSourceType"]) {
  switch (type) {
    case "paycheck":
      return "Paycheck";

    case "transfer":
      return "Transfer";

    case "deposit":
      return "Deposit";

    case "refund":
      return "Refund";
  }
}

export function OperationalFundingSourcesView({
  fundingSources,
  onAddFundingSource,
  onRemoveFundingSource,
}: OperationalFundingSourcesViewProps) {
  const activeFundingSources = fundingSources
    .filter(isActiveFundingSource)
    .sort((left, right) => left.expectedOn.localeCompare(right.expectedOn));

  const plannedTotal = activeFundingSources
    .filter((source) => source.status === "planned")
    .reduce((total, source) => total + source.amount, 0);

  return (
    <section className="operational-funding-sources">
      <div className="operational-funding-sources__header">
        <div>
          <span>Operational future cash</span>
          <h3>Future Cash Sources</h3>
          <p>
            Track expected incoming cash that will become available for funding
            future obligations.
          </p>
        </div>

        <button type="button" onClick={onAddFundingSource}>
          Add paycheck
        </button>
      </div>

      <div className="operational-funding-sources__summary">
        <article>
          <span>Active Sources</span>
          <strong>{activeFundingSources.length}</strong>
        </article>

        <article>
          <span>Planned Future Cash</span>
          <strong>{formatAmount(plannedTotal)}</strong>
        </article>

        <article>
          <span>Next Availability Date</span>
          <strong>
            {activeFundingSources[0]?.expectedOn ?? "Not entered"}
          </strong>
        </article>
      </div>

      <div className="operational-funding-sources__list">
        {activeFundingSources.map((fundingSource) => (
          <article
            key={fundingSource.id}
            className="operational-funding-sources__card"
          >
            <div className="operational-funding-sources__card-header">
              <div>
                <small>{formatType(fundingSource.fundingSourceType)}</small>

                <strong>{fundingSource.title}</strong>

                {fundingSource.fundingSourceType === "paycheck" ? (
                  <span>{fundingSource.employerName}</span>
                ) : null}
              </div>

              <span
                className={`operational-funding-sources__status operational-funding-sources__status--${fundingSource.status}`}
              >
                {formatStatus(fundingSource.status)}
              </span>
            </div>

            <div className="operational-funding-sources__amount">
              <span>Expected Cash</span>
              <strong>{formatAmount(fundingSource.amount)}</strong>
            </div>

            <dl>
              <div>
                <dt>Available On</dt>
                <dd>{fundingSource.expectedOn}</dd>
              </div>
            </dl>

            {fundingSource.notes ? (
              <p className="operational-funding-sources__notes">
                {fundingSource.notes}
              </p>
            ) : null}

            <div className="operational-funding-sources__actions">
              <button
                type="button"
                onClick={() => {
                  const shouldRemove = window.confirm(
                    `Remove "${fundingSource.title}" from future cash sources?`,
                  );

                  if (shouldRemove) {
                    onRemoveFundingSource(fundingSource.id);
                  }
                }}
              >
                Remove source
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
