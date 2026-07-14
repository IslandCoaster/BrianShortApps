import type { DailyBalance } from "@bsa/finance";

type DailyBalanceViewProps = {
  dailyBalances: DailyBalance[];
};

function formatAmount(amount: number) {
  return `$${amount.toLocaleString()}`;
}

function formatLedgerAmount(amount: number, sign: "+" | "-") {
  if (amount === 0) {
    return "$0";
  }

  return `${sign}${formatAmount(Math.abs(amount))}`;
}

export function DailyBalanceView({ dailyBalances }: DailyBalanceViewProps) {
  if (dailyBalances.length === 0) {
    return null;
  }

  const activityBalances = dailyBalances.filter(
    (dailyBalance) =>
      dailyBalance.purchasesTotal !== 0 ||
      dailyBalance.paymentsTotal !== 0 ||
      dailyBalance.feesTotal !== 0 ||
      dailyBalance.interestTotal !== 0 ||
      dailyBalance.adjustmentsTotal !== 0,
  );

  const previewBalances = [
    ...dailyBalances.slice(0, 5),
    ...activityBalances,
  ].filter(
    (dailyBalance, index, balances) =>
      balances.findIndex((candidate) => candidate.date === dailyBalance.date) === index,
  );

  const finalBalance = dailyBalances[dailyBalances.length - 1];

  return (
    <section className="finance-workspace__daily-balances">
      <div className="finance-workspace__section-header">
        <p>Daily Ledger</p>
        <span>{dailyBalances.length} days generated</span>
      </div>

      <div className="finance-workspace__interest-state-list">
        {previewBalances.map((dailyBalance) => (
          <article className="finance-workspace__interest-state" key={dailyBalance.date}>
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
                <dt>+ Purchases</dt>
                <dd>{formatLedgerAmount(dailyBalance.purchasesTotal, "+")}</dd>
              </div>

              <div>
                <dt>+ Fees</dt>
                <dd>{formatLedgerAmount(dailyBalance.feesTotal, "+")}</dd>
              </div>

              <div>
                <dt>+ Interest</dt>
                <dd>{formatLedgerAmount(dailyBalance.interestTotal, "+")}</dd>
              </div>

              <div>
                <dt>Adjustments</dt>
                <dd>{formatLedgerAmount(dailyBalance.adjustmentsTotal, "+")}</dd>
              </div>

              <div>
                <dt>- Payments</dt>
                <dd>{formatLedgerAmount(dailyBalance.paymentsTotal, "-")}</dd>
              </div>

              <div>
                <dt>= Closing</dt>
                <dd>{formatAmount(dailyBalance.closingBalance)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      {finalBalance ? (
        <p className="finance-workspace__daily-balances-summary">
          Final generated balance: {formatAmount(finalBalance.closingBalance)} on{" "}
          {finalBalance.date}
        </p>
      ) : null}
    </section>
  );
}
