import {
  getFinancialAccountBalance,
  isAssetFinancialAccount,
  type FinancialAccount,
} from "@bsa/finance";

import "./OperationalFinancialAccountsView.css";

type OperationalFinancialAccountsViewProps = {
  accounts: FinancialAccount[];
  onAddAccount: () => void;
  onRemoveAccount: (accountId: string) => void;
};

function formatAmount(amount: number) {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatOptionalAmount(amount: number | undefined) {
  return amount === undefined ? "Not entered" : formatAmount(amount);
}

function formatOptionalPercent(percent: number | undefined) {
  return percent === undefined ? "Not entered" : `${percent}%`;
}

function formatAccountType(accountType: FinancialAccount["accountType"]) {
  switch (accountType) {
    case "checking":
      return "Checking Account";

    case "savings":
      return "Savings Account";

    case "credit-card":
      return "Credit Card";

    case "loan":
      return "Loan";
  }
}

function formatAccountStatus(status: FinancialAccount["status"]) {
  return status
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getBalanceLabel(account: FinancialAccount) {
  return account.accountType === "loan"
    ? "Current Principal"
    : "Current Balance";
}

function AccountDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="operational-financial-accounts__detail">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function OperationalAccountCard({
  account,
  onRemoveAccount,
}: {
  account: FinancialAccount;
  onRemoveAccount: (accountId: string) => void;
}) {
  return (
    <article className="operational-financial-accounts__card">
      <div className="operational-financial-accounts__card-header">
        <div>
          <small>{formatAccountType(account.accountType)}</small>

          <strong>{account.name}</strong>

          <span>
            {account.institutionName}
            {account.accountSuffix ? ` · ${account.accountSuffix}` : ""}
          </span>
        </div>

        <span
          className={`operational-financial-accounts__status operational-financial-accounts__status--${account.status}`}
        >
          {formatAccountStatus(account.status)}
        </span>
      </div>

      <div className="operational-financial-accounts__primary-position">
        <span>{getBalanceLabel(account)}</span>

        <strong>{formatAmount(getFinancialAccountBalance(account))}</strong>
      </div>

      <div className="operational-financial-accounts__details">
        {account.accountType === "checking" ||
        account.accountType === "savings" ? (
          <AccountDetail label="Account Category" value="Asset Account" />
        ) : null}

        {account.accountType === "credit-card" ? (
          <>
            <AccountDetail
              label="Credit Limit"
              value={formatOptionalAmount(account.creditLimit)}
            />

            <AccountDetail
              label="Minimum Payment"
              value={formatOptionalAmount(account.minimumPayment)}
            />

            <AccountDetail
              label="Payment Due"
              value={account.paymentDueDate ?? "Not entered"}
            />

            <AccountDetail
              label="Statement Date"
              value={account.statementDate ?? "Not entered"}
            />

            <AccountDetail
              label="APR"
              value={formatOptionalPercent(account.aprPercent)}
            />
          </>
        ) : null}

        {account.accountType === "loan" ? (
          <>
            <AccountDetail
              label="Original Principal"
              value={formatOptionalAmount(account.originalPrincipal)}
            />

            <AccountDetail
              label="Minimum Payment"
              value={formatOptionalAmount(account.minimumPayment)}
            />

            <AccountDetail
              label="Payment Due"
              value={account.paymentDueDate ?? "Not entered"}
            />

            <AccountDetail
              label="Interest Rate"
              value={formatOptionalPercent(account.interestRatePercent)}
            />

            <AccountDetail
              label="Maturity Date"
              value={account.maturityDate ?? "Not entered"}
            />
          </>
        ) : null}
      </div>

      {account.notes ? (
        <p className="operational-financial-accounts__notes">{account.notes}</p>
      ) : null}

      <div className="operational-financial-accounts__card-actions">
        <button
          type="button"
          onClick={() => {
            const shouldRemove = window.confirm(
              `Remove "${account.name}" from Personal Finance?`,
            );

            if (shouldRemove) {
              onRemoveAccount(account.id);
            }
          }}
        >
          Remove account
        </button>
      </div>
    </article>
  );
}

export function OperationalFinancialAccountsView({
  accounts,
  onAddAccount,
  onRemoveAccount,
}: OperationalFinancialAccountsViewProps) {
  const activeAccounts = accounts.filter(
    (account) => account.status !== "closed" && account.status !== "paid-off",
  );

  const assetAccounts = activeAccounts.filter(isAssetFinancialAccount);

  const debtAccounts = activeAccounts.filter(
    (account) => !isAssetFinancialAccount(account),
  );

  const assetTotal = assetAccounts.reduce(
    (total, account) => total + getFinancialAccountBalance(account),
    0,
  );

  const debtTotal = debtAccounts.reduce(
    (total, account) => total + getFinancialAccountBalance(account),
    0,
  );

  return (
    <section className="operational-financial-accounts">
      <div className="operational-financial-accounts__header">
        <div>
          <span>Operational accounts</span>
          <h3>Financial Accounts</h3>
          <p>
            These accounts were restored from the operational account
            repository.
          </p>
        </div>

        <button type="button" onClick={onAddAccount}>
          Add account
        </button>
      </div>

      <div className="operational-financial-accounts__summary">
        <article>
          <span>Active Accounts</span>
          <strong>{activeAccounts.length}</strong>
        </article>

        <article>
          <span>Asset Balance</span>
          <strong>{formatAmount(assetTotal)}</strong>
        </article>

        <article>
          <span>Debt Balance</span>
          <strong>{formatAmount(debtTotal)}</strong>
        </article>
      </div>

      {assetAccounts.length > 0 ? (
        <section className="operational-financial-accounts__group">
          <div className="operational-financial-accounts__group-header">
            <div>
              <h4>Asset Accounts</h4>
              <p>
                Checking and savings accounts that hold available or reserved
                cash.
              </p>
            </div>

            <span>
              {assetAccounts.length}{" "}
              {assetAccounts.length === 1 ? "account" : "accounts"}
            </span>
          </div>

          <div className="operational-financial-accounts__list">
            {assetAccounts.map((account) => (
              <OperationalAccountCard
                key={account.id}
                account={account}
                onRemoveAccount={onRemoveAccount}
              />
            ))}
          </div>
        </section>
      ) : null}

      {debtAccounts.length > 0 ? (
        <section className="operational-financial-accounts__group">
          <div className="operational-financial-accounts__group-header">
            <div>
              <h4>Debt Accounts</h4>
              <p>
                Credit cards and loans with outstanding payment obligations.
              </p>
            </div>

            <span>
              {debtAccounts.length}{" "}
              {debtAccounts.length === 1 ? "account" : "accounts"}
            </span>
          </div>

          <div className="operational-financial-accounts__list">
            {debtAccounts.map((account) => (
              <OperationalAccountCard
                key={account.id}
                account={account}
                onRemoveAccount={onRemoveAccount}
              />
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
