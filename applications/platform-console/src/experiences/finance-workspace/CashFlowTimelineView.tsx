import type { CashFlowTimeline } from "@bsa/finance";

type CashFlowTimelineViewProps = {
  timeline: CashFlowTimeline;
};

function formatAmount(amount: number) {
  const absoluteAmount = Math.abs(amount);

  return `${amount >= 0 ? "+" : "−"}$${absoluteAmount.toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;
}

function formatCash(amount: number) {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatEventType(type: CashFlowTimeline["entries"][number]["type"]) {
  return type
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function CashFlowTimelineView({ timeline }: CashFlowTimelineViewProps) {
  return (
    <section className="finance-workspace__cash-flow">
      <div className="finance-workspace__section-header">
        <div>
          <p>Cash Flow Timeline</p>
          <span>Projected cash movement based on the current Funding Plan</span>
        </div>

        <span>Closing cash {formatCash(timeline.closingCash)}</span>
      </div>

      <div className="finance-workspace__cash-flow-summary">
        <article>
          <span>Opening Cash</span>
          <strong>{formatCash(timeline.openingCash)}</strong>
        </article>

        <article>
          <span>Planned Inflows</span>
          <strong>{formatCash(timeline.totalInflows)}</strong>
        </article>

        <article>
          <span>Planned Outflows</span>
          <strong>{formatCash(timeline.totalOutflows)}</strong>
        </article>

        <article>
          <span>Lowest Cash Position</span>
          <strong>{formatCash(timeline.lowestRunningCash)}</strong>
        </article>
      </div>

      <div className="finance-workspace__cash-flow-timeline">
        <article className="finance-workspace__cash-flow-entry">
          <div className="finance-workspace__cash-flow-marker">
            <span aria-hidden="true" />
          </div>

          <time>Today</time>

          <div className="finance-workspace__cash-flow-description">
            <span>Opening Position</span>
            <strong>Current Cash Available</strong>
          </div>

          <div className="finance-workspace__cash-flow-amount">
            <strong>{formatCash(timeline.openingCash)}</strong>
            <span>Running cash</span>
          </div>
        </article>

        {timeline.entries.map((entry) => (
          <article
            className="finance-workspace__cash-flow-entry"
            key={entry.id}
          >
            <div className="finance-workspace__cash-flow-marker">
              <span aria-hidden="true" />
            </div>

            <time dateTime={entry.date}>{entry.date}</time>

            <div className="finance-workspace__cash-flow-description">
              <span>{formatEventType(entry.type)}</span>
              <strong>{entry.title}</strong>

              {entry.description ? <small>{entry.description}</small> : null}
            </div>

            <div className="finance-workspace__cash-flow-amount">
              {entry.amount === undefined ? (
                <strong>Amount unknown</strong>
              ) : (
                <strong>{formatAmount(entry.amount)}</strong>
              )}

              <span>Running cash {formatCash(entry.runningCash)}</span>
            </div>
          </article>
        ))}
      </div>

      {timeline.lowestRunningCash < 0 ? (
        <p className="finance-workspace__cash-flow-warning">
          This timeline projects a negative cash position of{" "}
          {formatCash(Math.abs(timeline.lowestRunningCash))}. Review the Funding
          Plan before making payments.
        </p>
      ) : null}
    </section>
  );
}
