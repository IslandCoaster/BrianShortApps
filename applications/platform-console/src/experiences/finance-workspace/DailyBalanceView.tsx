import type { DailyBalance } from "@bsa/finance";

type DailyBalanceViewProps = {
  dailyBalances: DailyBalance[];
};

function formatAmount(amount: number) {
  return `$${amount.toLocaleString()}`;
}

export function DailyBalanceView({ dailyBalances }: DailyBalanceViewProps) {
  if (dailyBalances.length === 0) {
    return null;
  }

  const previewBalances = dailyBalances.slice(0, 5);
  const finalBalance = dailyBalances.at(-1);

  return (
    <section className="finance-workspace__daily-balances">
      <div className="finance-workspace__section-header">
        <p>Daily Balance</p>
        <span>{dailyBalances.length} days generated</span>
      </div>

      <div className="finance-workspace__interest-state-list">
        {previewBalances.map((dailyBalance) => (
          <article
            className="finance-workspace__interest-state"
            key={dailyBalance.date}
          >
            <div className="finance-workspace__interest-state-main">
              <div>
                <span>{dailyBalance.accountName}</span>
                <strong>{dailyBalance.date}</strong>
              </div>

              <div>
                <span>Closing Balance</span>
                <strong>{formatAmount(dailyBalance.closingBalance)}</strong>
              </div>
            </div>

            <dl>
              <div>
                <dt>Opening</dt>
                <dd>{formatAmount(dailyBalance.openingBalance)}</dd>
              </div>

              <div>
                <dt>Purchases</dt>
                <dd>{formatAmount(dailyBalance.purchasesTotal)}</dd>
              </div>

              <div>
                <dt>Payments</dt>
                <dd>{formatAmount(dailyBalance.paymentsTotal)}</dd>
              </div>

              <div>
                <dt>Closing</dt>
                <dd>{formatAmount(dailyBalance.closingBalance)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      {finalBalance ? (
        <p className="finance-workspace__daily-balances-summary">
          Final generated balance: {formatAmount(finalBalance.closingBalance)}{" "}
          on {finalBalance.date}
        </p>
      ) : null}
    </section>
  );
}
