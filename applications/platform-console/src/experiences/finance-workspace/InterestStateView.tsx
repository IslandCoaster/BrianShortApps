import type { InterestState } from "@bsa/finance";

type InterestStateViewProps = {
  interestStates: InterestState[];
};

function formatAmount(amount: number) {
  return `$${amount.toLocaleString()}`;
}

export function InterestStateView({ interestStates }: InterestStateViewProps) {
  if (interestStates.length === 0) {
    return null;
  }

  return (
    <section className="finance-workspace__interest-states">
      <div className="finance-workspace__section-header">
        <p>Interest State</p>
        <span>{interestStates.length} accounts interpreted</span>
      </div>

      <div className="finance-workspace__interest-state-list">
        {interestStates.map((interestState) => (
          <article
            className="finance-workspace__interest-state"
            key={interestState.accountId}
          >
            <div className="finance-workspace__interest-state-main">
              <div>
                <span>{interestState.accountName}</span>
                <strong>{interestState.lifecycleStatus}</strong>
              </div>

              <div>
                <span>APR</span>
                <strong>{interestState.aprPercent}%</strong>
              </div>
            </div>

            <dl>
              <div>
                <dt>Method</dt>
                <dd>{interestState.calculationMethod}</dd>
              </div>

              <div>
                <dt>Cycle Days</dt>
                <dd>{interestState.statementCycleDays}</dd>
              </div>

              <div>
                <dt>Balance Subject</dt>
                <dd>{formatAmount(interestState.balanceSubjectToInterest)}</dd>
              </div>

              <div>
                <dt>Calculated Interest</dt>
                <dd>{formatAmount(interestState.calculatedInterest)}</dd>
              </div>

              <div>
                <dt>Daily Interest</dt>
                <dd>{formatAmount(interestState.dailyInterestAccrued)}</dd>
              </div>

              <div>
                <dt>Remaining Days</dt>
                <dd>{interestState.remainingStatementDays}</dd>
              </div>

              <div>
                <dt>Statement Interest</dt>
                <dd>{formatAmount(interestState.interestCharged)}</dd>
              </div>

              <div>
                <dt>Variance</dt>
                <dd>{formatAmount(interestState.interestVariance)}</dd>
              </div>

              <div>
                <dt>Projected Interest</dt>
                <dd>{formatAmount(interestState.projectedInterest)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
