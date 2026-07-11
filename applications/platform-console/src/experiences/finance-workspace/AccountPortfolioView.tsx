import type { PortfolioAccountSummary } from "./portfolio.types";

type AccountPortfolioViewProps = {
  accounts: PortfolioAccountSummary[];
};

function formatAmount(amount?: number) {
  if (amount === undefined) {
    return "Not entered";
  }

  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatProductType(productType: PortfolioAccountSummary["productType"]) {
  return productType
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function AccountPortfolioView({
  accounts,
}: AccountPortfolioViewProps) {
  const totalBalance = accounts.reduce(
    (total, account) => total + account.currentBalance,
    0,
  );

  const totalMinimumDue = accounts.reduce(
    (total, account) => total + (account.minimumPaymentDue ?? 0),
    0,
  );

  const pastDueAccounts = accounts.filter(
    (account) => account.accountStatus === "past-due",
  ).length;

  return (
    <section className="finance-workspace__portfolio">
      <div className="finance-workspace__section-header">
        <div>
          <p>Account Portfolio</p>
          <span>Statement snapshots — not live account data</span>
        </div>

        <button type="button">Add account</button>
      </div>

      <div className="finance-workspace__portfolio-metrics">
        <article>
          <span>Accounts</span>
          <strong>{accounts.length}</strong>
        </article>

        <article>
          <span>Snapshot Balance</span>
          <strong>{formatAmount(totalBalance)}</strong>
        </article>

        <article>
          <span>Minimum Payments</span>
          <strong>{formatAmount(totalMinimumDue)}</strong>
        </article>

        <article>
          <span>Past Due Accounts</span>
          <strong>{pastDueAccounts}</strong>
        </article>
      </div>

      <div className="finance-workspace__portfolio-grid">
        {accounts.map((account) => (
          <article
            className="finance-workspace__portfolio-card"
            key={account.id}
          >
            <div className="finance-workspace__portfolio-card-header">
              <div>
                <span>{account.institution}</span>
                <h3>{account.accountName}</h3>
              </div>

              <span>{formatProductType(account.productType)}</span>
            </div>

            <div className="finance-workspace__portfolio-balance">
              <span>Snapshot Balance</span>
              <strong>{formatAmount(account.currentBalance)}</strong>
              <small>As of {account.asOfDate}</small>
            </div>

            <dl>
              <div>
                <dt>Minimum Due</dt>
                <dd>{formatAmount(account.minimumPaymentDue)}</dd>
              </div>

              <div>
                <dt>Due Date</dt>
                <dd>{account.paymentDueDate ?? "Not entered"}</dd>
              </div>

              <div>
                <dt>APR</dt>
                <dd>
                  {account.aprPercent === undefined
                    ? "Not entered"
                    : `${account.aprPercent}%`}
                </dd>
              </div>

              <div>
                <dt>Status</dt>
                <dd>{account.accountStatus}</dd>
              </div>
            </dl>

            {account.notes ? <p>{account.notes}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
