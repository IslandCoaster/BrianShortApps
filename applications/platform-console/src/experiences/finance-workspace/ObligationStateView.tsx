import type { ObligationState } from "@bsa/finance";

type ObligationStateViewProps = {
  obligationStates: ObligationState[];
};

function formatAmount(amount: number) {
  return `$${amount.toLocaleString()}`;
}

export function ObligationStateView({ obligationStates }: ObligationStateViewProps) {
  if (obligationStates.length === 0) {
    return null;
  }

  return (
    <section className="finance-workspace__obligations">
      <div className="finance-workspace__section-header">
        <p>Obligation State</p>
        <span>{obligationStates.length} obligations interpreted</span>
      </div>

      <div className="finance-workspace__obligation-list">
        {obligationStates.map((obligation) => (
          <article className="finance-workspace__obligation" key={obligation.obligationId}>
            <div className="finance-workspace__obligation-main">
              <div>
                <span>{obligation.accountName}</span>
                <strong>{formatAmount(obligation.remainingAmount)} remaining</strong>
              </div>

              <div>
                <span>{obligation.status}</span>
                <strong>{obligation.satisfactionPercent}% satisfied</strong>
              </div>
            </div>

            <dl>
              <div>
                <dt>Original</dt>
                <dd>{formatAmount(obligation.originalAmount)}</dd>
              </div>

              <div>
                <dt>Paid</dt>
                <dd>{formatAmount(obligation.paymentTotal)}</dd>
              </div>

              <div>
                <dt>Minimum</dt>
                <dd>{formatAmount(obligation.minimumPayment)}</dd>
              </div>

              <div>
                <dt>Due</dt>
                <dd>{obligation.dueDate}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
