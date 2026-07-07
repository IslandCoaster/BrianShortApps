import type { FinancialPositions } from "@bsa/finance";

type FinancialPositionsViewProps = {
  positions: FinancialPositions;
};

function formatAmount(amount: number) {
  return `$${amount.toLocaleString()}`;
}

export function FinancialPositionsView({ positions }: FinancialPositionsViewProps) {
  return (
    <section className="finance-workspace__positions">
      <div className="finance-workspace__section-header">
        <p>Financial Positions</p>
        <span>Aggregated from account state</span>
      </div>

      <div className="finance-workspace__position-grid">
        <article>
          <span>Cash Position</span>
          <strong>{formatAmount(positions.cash.cashAvailable)}</strong>
        </article>

        <article>
          <span>Credit Current Balance</span>
          <strong>{formatAmount(positions.credit.currentBalanceTotal)}</strong>
        </article>

        <article>
          <span>Credit Projected Statement</span>
          <strong>{formatAmount(positions.credit.projectedStatementBalanceTotal)}</strong>
        </article>

        <article>
          <span>Payments Applied</span>
          <strong>{formatAmount(positions.credit.paymentTotal)}</strong>
        </article>
      </div>
    </section>
  );
}
