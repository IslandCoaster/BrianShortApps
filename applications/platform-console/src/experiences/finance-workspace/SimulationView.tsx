import {
  simulatePayment,
  type FinancialJournal,
} from "@bsa/finance";

type SimulationViewProps = {
  journal: FinancialJournal;
};

function formatAmount(amount: number) {
  return `$${amount.toLocaleString()}`;
}

export function SimulationView({ journal }: SimulationViewProps) {
  const simulation = simulatePayment({
    baseJournal: journal,
    paymentId: "simulation-payment",
    occurredOn: "2026-07-15",
    creditedAt: "2026-07-15T12:00:00-04:00",
    sourceAccountId: "checking-primary",
    sourceAccountName: "Primary Checking",
    destinationAccountId: "card-apple",
    destinationAccountName: "Apple Card",
    amount: 500,
  });

  const simulatedInterestState = simulation.replayState.interestStates[0];

  if (!simulatedInterestState) {
    return null;
  }

  return (
    <section className="finance-workspace__daily-balances">
      <div className="finance-workspace__section-header">
        <p>Simulation</p>
        <span>Temporary payment replay</span>
      </div>

      <article className="finance-workspace__interest-state">
        <dl>
          <div>
            <dt>Temporary Payment</dt>
            <dd>{formatAmount(simulation.simulatedPaymentAmount)}</dd>
          </div>

          <div>
            <dt>Projected Interest</dt>
            <dd>{formatAmount(simulatedInterestState.projectedInterest)}</dd>
          </div>

          <div>
            <dt>Accrued Interest</dt>
            <dd>{formatAmount(simulatedInterestState.accruedInterest)}</dd>
          </div>

          <div>
            <dt>Remaining Days</dt>
            <dd>{simulatedInterestState.remainingStatementDays}</dd>
          </div>
        </dl>
      </article>
    </section>
  );
}
