import type { DailyInterest } from "@bsa/finance";

type DailyInterestTimelineViewProps = {
  dailyInterestTimeline: DailyInterest[];
};

function formatAmount(amount: number) {
  return `$${amount.toLocaleString()}`;
}

export function DailyInterestTimelineView({
  dailyInterestTimeline,
}: DailyInterestTimelineViewProps) {
  if (dailyInterestTimeline.length === 0) {
    return null;
  }

  const preview = [
    ...dailyInterestTimeline.slice(0, 5),
    dailyInterestTimeline[dailyInterestTimeline.length - 1],
  ].filter(
    (entry, index, array) =>
      array.findIndex((candidate) => candidate.date === entry.date) === index,
  );

  return (
    <section className="finance-workspace__daily-balances">
      <div className="finance-workspace__section-header">
        <p>Daily Interest Timeline</p>
        <span>{dailyInterestTimeline.length} days calculated</span>
      </div>

      <div className="finance-workspace__interest-state-list">
        {preview.map((interest) => (
          <article
            className="finance-workspace__interest-state"
            key={interest.date}
          >
            <div className="finance-workspace__interest-state-main">
              <div>
                <span>{interest.accountName}</span>
                <strong>{interest.date}</strong>
              </div>

              <div>
                <span>Running Interest</span>
                <strong>{formatAmount(interest.runningAccruedInterest)}</strong>
              </div>
            </div>

            <dl>
              <div>
                <dt>Closing Balance</dt>
                <dd>{formatAmount(interest.closingBalance)}</dd>
              </div>

              <div>
                <dt>Daily Interest</dt>
                <dd>{formatAmount(interest.accruedInterest)}</dd>
              </div>

              <div>
                <dt>Running Interest</dt>
                <dd>{formatAmount(interest.runningAccruedInterest)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
