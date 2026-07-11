import type { PortfolioAccountSummary } from "./portfolio.types";

type PortfolioAccountTableProps = {
  accounts: PortfolioAccountSummary[];
  onEditAccount: (account: PortfolioAccountSummary) => void;
  onRemoveAccount: (accountId: string) => void;
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

function formatProductType(
  productType: PortfolioAccountSummary["productType"],
) {
  return productType
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function formatStatus(
  status: PortfolioAccountSummary["accountStatus"],
) {
  return status
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatusClassName(
  status: PortfolioAccountSummary["accountStatus"],
) {
  return `finance-workspace__account-status finance-workspace__account-status--${status}`;
}

export function PortfolioAccountTable({
  accounts,
  onEditAccount,
  onRemoveAccount,
}: PortfolioAccountTableProps) {
  const sortedAccounts = [...accounts].sort((left, right) => {
    if (
      left.accountStatus === "past-due" &&
      right.accountStatus !== "past-due"
    ) {
      return -1;
    }

    if (
      right.accountStatus === "past-due" &&
      left.accountStatus !== "past-due"
    ) {
      return 1;
    }

    return right.currentBalance - left.currentBalance;
  });

  return (
    <section className="finance-workspace__account-comparison">
      <div className="finance-workspace__section-header">
        <div>
          <p>Accounts</p>
          <span>Compare balances, obligations, rates, and account status</span>
        </div>

        <span>{accounts.length} accounts tracked</span>
      </div>

      {sortedAccounts.length === 0 ? (
        <div className="finance-workspace__empty-state">
          <strong>No accounts entered</strong>
          <p>Add an account to begin building your financial portfolio.</p>
        </div>
      ) : (
        <div className="finance-workspace__account-table-container">
          <table className="finance-workspace__account-table">
            <thead>
              <tr>
                <th scope="col">Account</th>
                <th scope="col">Balance</th>
                <th scope="col">Minimum Due</th>
                <th scope="col">Due Date</th>
                <th scope="col">APR</th>
                <th scope="col">Status</th>
                <th scope="col">
                  <span className="finance-workspace__visually-hidden">
                    Account actions
                  </span>
                </th>
              </tr>
            </thead>

            <tbody>
              {sortedAccounts.map((account) => (
                <tr key={account.id}>
                  <td>
                    <div className="finance-workspace__account-identity">
                      <strong>{account.accountName}</strong>
                      <span>
                        {account.institution} ·{" "}
                        {formatProductType(account.productType)}
                      </span>
                      <small>As of {account.asOfDate}</small>
                    </div>
                  </td>

                  <td>
                    <strong>{formatAmount(account.currentBalance)}</strong>
                  </td>

                  <td>{formatAmount(account.minimumPaymentDue)}</td>

                  <td>{account.paymentDueDate ?? "Not entered"}</td>

                  <td>
                    {account.aprPercent === undefined
                      ? "Not entered"
                      : `${account.aprPercent}%`}
                  </td>

                  <td>
                    <span className={getStatusClassName(account.accountStatus)}>
                      {formatStatus(account.accountStatus)}
                    </span>
                  </td>

                  <td>
                    <div className="finance-workspace__account-table-actions">
                      <button
                        type="button"
                        onClick={() => onEditAccount(account)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemoveAccount(account.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
