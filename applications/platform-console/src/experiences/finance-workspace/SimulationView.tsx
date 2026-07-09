import {
  simulatePayment,
  type FinancialJournal,
  type InterestState,
} from "@bsa/finance";

type SimulationViewProps = {
  journal: FinancialJournal;
  currentInterestStates: InterestState[];
};

function formatAmount(amount: number) {
  return `$${amount.toLocaleString()}`;
}

export function SimulationView({
  journal,
  currentInterestStates,
}: SimulationViewProps) {
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

  const currentInterestState = currentInterestStates[0];
  const simulatedInterestState = simulation.replayState.interestStates[0];

  if (!currentInterestState || !simulatedInterestState) {
    return null;
  }

  const projectedInterestAvoided =
    currentInterestState.projectedInterest -
    simulatedInterestState.projectedInterest;

  const accruedInterestReduction =
    currentInterestState.accruedInterest -
    simulatedInterestState.accruedInterest;

  const recommendation =
    projectedInterestAvoided > 0 ? "Recommended" : "Minimal Financial Benefit";

  const decisionSummary =
    projectedInterestAvoided > 0
      ? `A ${formatAmount(simulation.simulatedPaymentAmount)} payment today is projected to reduce interest costs if no additional activity occurs.`
      : "This payment produces little projected interest reduction under current assumptions.";
  return (
    <section className="finance-workspace__daily-balances">
      <div className="finance-workspace__section-header">
        <p>Simulation</p>
        <span>Current vs temporary replay</span>
      </div>

      <article className="finance-workspace__interest-state">
        <div className="finance-workspace__interest-state-main">
          <div>
            <span>Payment Today</span>
            <strong>{formatAmount(simulation.simulatedPaymentAmount)}</strong>
          </div>

          <div>
            <span>Projected Interest Avoided</span>
            <strong>{formatAmount(projectedInterestAvoided)}</strong>
          </div>
        </div>

        <dl>
          <div>
            <dt>Current Projected Interest</dt>
            <dd>{formatAmount(currentInterestState.projectedInterest)}</dd>
          </div>

          <div>
            <dt>Simulated Projected Interest</dt>
            <dd>{formatAmount(simulatedInterestState.projectedInterest)}</dd>
          </div>

          <div>
            <dt>Current Accrued Interest</dt>
            <dd>{formatAmount(currentInterestState.accruedInterest)}</dd>
          </div>

          <div>
            <dt>Simulated Accrued Interest</dt>
            <dd>{formatAmount(simulatedInterestState.accruedInterest)}</dd>
          </div>

          <div>
            <dt>Accrued Interest Reduction</dt>
            <dd>{formatAmount(accruedInterestReduction)}</dd>
          </div>

          <div>
            <dt>Explanation</dt>
            <dd>
              A {formatAmount(simulation.simulatedPaymentAmount)} payment today
              is projected to reduce accrued interest by{" "}
              {formatAmount(accruedInterestReduction)} if no additional activity
              occurs during the remainder of the statement period.
            </dd>
          </div>

          <div>
            <dt>Recommendation</dt>
            <dd>{recommendation}</dd>
          </div>

          <div>
            <dt>Decision Summary</dt>
            <dd>{decisionSummary}</dd>
          </div>

          <div>
            <dt>Assumptions</dt>
            <dd>
              • No additional purchases
              <br />
              • No additional fees
              <br />
              • Current APR remains unchanged
              <br />• Payment is credited today
            </dd>
          </div>
        </dl>
      </article>
    </section>
  );
}
