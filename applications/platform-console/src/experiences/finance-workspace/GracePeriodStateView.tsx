import type { GracePeriodState } from "@bsa/finance";

type GracePeriodStateViewProps = {
  gracePeriodStates: GracePeriodState[];
};

function formatAmount(amount: number) {
  return `$${amount.toLocaleString()}`;
}

export function GracePeriodStateView({ gracePeriodStates }: GracePeriodStateViewProps) {
  if (gracePeriodStates.length === 0) {
    return null;
  }

  return (
    <section className="finance-workspace__grace-period-states">
      <div className="finance-workspace__section-header">
        <p>Grace Period State</p>
        <span>{gracePeriodStates.length} accounts evaluated</span>
      </div>

      <div className="finance-workspace__interest-state-list">
        {gracePeriodStates.map((gracePeriodState) => (
          <article className="finance-workspace__interest-state" key={gracePeriodState.accountId}>
            <div className="finance-workspace__interest-state-main">
              <div>
                <span>{gracePeriodState.accountName}</span>
                <strong>{gracePeriodState.status}</strong>
              </div>

              <div>
                <span>Payment Due Date</span>
                <strong>{gracePeriodState.paymentDueDate}</strong>
              </div>
            </div>

            <dl>
              <div>
                <dt>Required</dt>
                <dd>{formatAmount(gracePeriodState.requiredPaymentAmount)}</dd>
              </div>

              <div>
                <dt>Qualifying Paid</dt>
                <dd>{formatAmount(gracePeriodState.qualifyingPaymentTotal)}</dd>
              </div>

              <div>
                <dt>Remaining</dt>
                <dd>{formatAmount(gracePeriodState.remainingAmountToPreserveGracePeriod)}</dd>
              </div>

              <div>
                <dt>Posting Rule</dt>
                <dd>{gracePeriodState.paymentPostingCutoff}</dd>
              </div>

              <div>
                <dt>Reason</dt>
                <dd>{gracePeriodState.reason}</dd>
              </div>

              <div>
                <dt>Grace Rule</dt>
                <dd>{gracePeriodState.rule}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
