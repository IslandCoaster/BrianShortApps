import type { PortfolioAccountSummary } from "./portfolio.types";

type PortfolioSummaryViewProps = {
  accounts: PortfolioAccountSummary[];
};

function formatAmount(amount: number) {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getNextPaymentDate(accounts: PortfolioAccountSummary[]) {
  const paymentDates = accounts
    .filter(
      (account) =>
        account.accountStatus !== "paid-off" &&
        account.paymentDueDate &&
        (account.minimumPaymentDue ?? 0) > 0,
    )
    .map((account) => account.paymentDueDate as string)
    .sort((left, right) => left.localeCompare(right));

  return paymentDates[0];
}

export function PortfolioSummaryView({
  accounts,
}: PortfolioSummaryViewProps) {
  const activeAccounts = accounts.filter(
    (account) => account.accountStatus !== "paid-off",
  );

  const trackedBalance = activeAccounts.reduce(
    (total, account) => total + account.currentBalance,
    0,
  );

  const requiredPayments = activeAccounts.reduce(
    (total, account) => total + (account.minimumPaymentDue ?? 0),
    0,
  );

  const pastDueBalance = activeAccounts
    .filter((account) => account.accountStatus === "past-due")
    .reduce(
      (total, account) => total + (account.minimumPaymentDue ?? 0),
      0,
    );

  const nextPaymentDate = getNextPaymentDate(activeAccounts);

  return (
    <section className="finance-workspace__portfolio-summary">
      <div className="finance-workspace__section-header">
        <div>
          <p>Portfolio Summary</p>
          <span>Based on the latest entered account snapshots</span>
        </div>
      </div>

      <div className="finance-workspace__portfolio-summary-grid">
        <article>
          <span>Tracked Balance</span>
          <strong>{formatAmount(trackedBalance)}</strong>
          <small>{activeAccounts.length} active accounts</small>
        </article>

        <article>
          <span>Required Payments</span>
          <strong>{formatAmount(requiredPayments)}</strong>
          <small>Known minimum and scheduled payments</small>
        </article>

        <article>
          <span>Past-Due Exposure</span>
          <strong>{formatAmount(pastDueBalance)}</strong>
          <small>
            {
              activeAccounts.filter(
                (account) => account.accountStatus === "past-due",
              ).length
            }{" "}
            accounts marked past due
          </small>
        </article>

        <article>
          <span>Next Payment Date</span>
          <strong>{nextPaymentDate ?? "Not entered"}</strong>
          <small>Earliest known required payment</small>
        </article>
      </div>
    </section>
  );
}
