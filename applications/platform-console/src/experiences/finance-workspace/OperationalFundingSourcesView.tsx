import {
  buildFundingAllocationProjection,
  isActiveFundingSource,
  type FinancialAccount,
  type FundingDepositAllocation,
  type FundingSource,
} from "@bsa/finance";

import "./OperationalFundingSourcesView.css";

type OperationalFundingSourcesViewProps = {
  fundingSources: FundingSource[];
  accounts: FinancialAccount[];
  allocations: FundingDepositAllocation[];
  onAddFundingSource: () => void;
  onAssignDestinations: (fundingSourceId: string) => void;
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
  accounts,
  allocations,
  onAddFundingSource,
  onAssignDestinations,
  onRemoveFundingSource,
}: OperationalFundingSourcesViewProps) {
  const activeFundingSources = fundingSources
    .filter(isActiveFundingSource)
    .sort((left, right) => left.expectedOn.localeCompare(right.expectedOn));

  const projection = buildFundingAllocationProjection({
    accounts,
    fundingSources: activeFundingSources,
    allocations,
  });

  const projectionBySourceId = new Map(
    projection.sources.map((source) => [source.fundingSourceId, source]),
  );

  const plannedTotal = activeFundingSources
    .filter((source) => source.status === "planned")
    .reduce((total, source) => total + source.amount, 0);

  const completeRoutingCount = projection.sources.filter(
    (source) => source.status === "fully-allocated",
  ).length;

  return (
    <section className="operational-funding-sources">
      <div className="operational-funding-sources__header">
        <div>
          <span>Operational future cash</span>

          <h3>Future Cash Sources</h3>

          <p>
            Track expected incoming cash and assign every cent to its
            destination account.
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
          <span>Fully Routed Sources</span>

          <strong>
            {completeRoutingCount} / {activeFundingSources.length}
          </strong>
        </article>
      </div>

      <div className="operational-funding-sources__list">
        {activeFundingSources.map((fundingSource) => {
          const sourceProjection = projectionBySourceId.get(fundingSource.id);

          const routingStatus = sourceProjection?.status ?? "unallocated";

          return (
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

                <div>
                  <dt>Allocated</dt>

                  <dd>
                    {formatAmount(sourceProjection?.allocatedAmount ?? 0)}
                  </dd>
                </div>

                <div>
                  <dt>Remaining</dt>

                  <dd>
                    {formatAmount(
                      Math.max(
                        sourceProjection?.remainingAmount ??
                          fundingSource.amount,
                        0,
                      ),
                    )}
                  </dd>
                </div>
              </dl>

              <div
                className={`operational-funding-sources__routing operational-funding-sources__routing--${routingStatus}`}
              >
                <span>Destination Routing</span>

                <strong>
                  {routingStatus === "fully-allocated"
                    ? "Fully allocated"
                    : routingStatus === "partially-allocated"
                      ? "Partially allocated"
                      : routingStatus === "overallocated"
                        ? "Overallocated"
                        : routingStatus === "invalid"
                          ? "Invalid routing"
                          : "Unallocated"}
                </strong>
              </div>

              {sourceProjection && sourceProjection.deposits.length > 0 ? (
                <div className="operational-funding-sources__destinations">
                  {sourceProjection.deposits.map((deposit) => (
                    <div key={deposit.allocationId}>
                      <span>{deposit.destinationAccountName}</span>

                      <strong>{formatAmount(deposit.amount)}</strong>
                    </div>
                  ))}
                </div>
              ) : null}

              {fundingSource.notes ? (
                <p className="operational-funding-sources__notes">
                  {fundingSource.notes}
                </p>
              ) : null}

              <div className="operational-funding-sources__actions">
                <button
                  type="button"
                  onClick={() => onAssignDestinations(fundingSource.id)}
                >
                  {routingStatus === "unallocated"
                    ? "Assign destinations"
                    : "Edit destinations"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const shouldRemove = window.confirm(
                      `Remove "${fundingSource.title}" and its destination routing?`,
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
          );
        })}
      </div>
    </section>
  );
}
