import type { CreditPosition } from "@bsa/finance";

type CreditPositionViewProps = {
  creditPosition: CreditPosition;
};

function formatAmount(amount: number) {
  return `$${amount.toLocaleString()}`;
}

export function CreditPositionView({ creditPosition }: CreditPositionViewProps) {
  return (
    <section className="finance-workspace__credit-position">
      <div className="finance-workspace__section-header">
        <p>Credit Position</p>
        <span>Revolving credit interpretation</span>
      </div>

      <div className="finance-workspace__position-grid">
        <article>
          <span>Total Credit Limit</span>
          <strong>{formatAmount(creditPosition.totalCreditLimit)}</strong>
        </article>

        <article>
          <span>Available Credit</span>
          <strong>{formatAmount(creditPosition.availableCredit)}</strong>
        </article>

        <article>
          <span>Current Utilization</span>
          <strong>{creditPosition.utilizationPercent}%</strong>
        </article>

        <article>
          <span>Projected Utilization</span>
          <strong>{creditPosition.projectedUtilizationPercent}%</strong>
        </article>

        <article>
          <span>Risk Level</span>
          <strong>{creditPosition.risk.level}</strong>
        </article>

        <article>
          <span>Risk Meaning</span>
          <strong>{creditPosition.risk.description}</strong>
        </article>

        <article>
          <span>Target Utilization</span>
          <strong>{creditPosition.targetUtilizationPercent}%</strong>
        </article>

        <article>
          <span>Ideal Utilization</span>
          <strong>{creditPosition.idealUtilizationPercent}%</strong>
        </article>

        <article>
          <span>Amount to Target</span>
          <strong>{formatAmount(creditPosition.amountToTargetUtilization)}</strong>
        </article>
      </div>
    </section>
  );
}
