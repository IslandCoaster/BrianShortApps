import type {
  AssetAccountProjection,
  AssetAccountProjectionEntry,
  AssetAccountProjectionResult,
  ProjectionDiagnostic,
} from "@bsa/finance";

import "./OperationalAccountProjectionView.css";

type OperationalAccountProjectionViewProps = {
  projection: AssetAccountProjectionResult;
};

function formatAmount(amount: number) {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatSignedAmount(amount: number) {
  const sign = amount >= 0 ? "+" : "−";

  return `${sign}${formatAmount(Math.abs(amount))}`;
}

function formatAccountType(accountType: AssetAccountProjection["accountType"]) {
  switch (accountType) {
    case "checking":
      return "Checking Account";

    case "savings":
      return "Savings Account";
  }
}

function formatEntryType(entryType: AssetAccountProjectionEntry["entryType"]) {
  switch (entryType) {
    case "funding-deposit":
      return "Funding Deposit";

    case "planned-settlement":
      return "Planned Settlement";
  }
}

function getEntryDescription(
  entry: AssetAccountProjectionEntry,
  account: AssetAccountProjection,
) {
  if (entry.description) {
    return entry.description;
  }

  return entry.entryType === "funding-deposit"
    ? `Routed into ${account.accountName}`
    : `Planned from ${account.accountName}`;
}

function formatDiagnosticCategory(category: ProjectionDiagnostic["category"]) {
  switch (category) {
    case "funding-routing":
      return "Funding Routing";

    case "settlement-routing":
      return "Settlement Routing";

    case "orphaned-record":
      return "Orphaned Record";
  }
}

function AccountProjectionCard({
  account,
}: {
  account: AssetAccountProjection;
}) {
  return (
    <article className="operational-account-projection__account">
      <div className="operational-account-projection__account-header">
        <div>
          <small>{formatAccountType(account.accountType)}</small>

          <strong>{account.accountName}</strong>

          <span>{account.institutionName}</span>
        </div>

        <span className="operational-account-projection__account-status">
          Projected
        </span>
      </div>

      <div className="operational-account-projection__account-summary">
        <article>
          <span>Opening Balance</span>
          <strong>{formatAmount(account.openingBalance)}</strong>
        </article>

        <article>
          <span>Planned Deposits</span>
          <strong>{formatAmount(account.totalPlannedDeposits)}</strong>
        </article>

        <article>
          <span>Planned Settlements</span>
          <strong>{formatAmount(account.totalPlannedSettlements)}</strong>
        </article>

        <article>
          <span>Lowest Balance</span>
          <strong>{formatAmount(account.lowestBalance)}</strong>
        </article>

        <article>
          <span>Closing Balance</span>
          <strong>{formatAmount(account.closingBalance)}</strong>
        </article>
      </div>

      <div className="operational-account-projection__timeline">
        <div className="operational-account-projection__timeline-header">
          <div>
            <h5>Projected Timeline</h5>

            <p>
              Valid projected deposits and debt settlements replayed in date
              order.
            </p>
          </div>

          <span>
            {account.entries.length}{" "}
            {account.entries.length === 1 ? "movement" : "movements"}
          </span>
        </div>

        <article className="operational-account-projection__entry operational-account-projection__entry--opening">
          <div className="operational-account-projection__marker">
            <span aria-hidden="true" />
          </div>

          <time>Today</time>

          <div className="operational-account-projection__entry-description">
            <small>Opening Position</small>

            <strong>Current account balance</strong>
          </div>

          <div className="operational-account-projection__entry-amount">
            <strong>{formatAmount(account.openingBalance)}</strong>

            <span>Running balance {formatAmount(account.openingBalance)}</span>
          </div>
        </article>

        {account.entries.map((entry) => (
          <article
            key={entry.id}
            className={[
              "operational-account-projection__entry",
              `operational-account-projection__entry--${entry.entryType}`,
            ].join(" ")}
          >
            <div className="operational-account-projection__marker">
              <span aria-hidden="true" />
            </div>

            <time dateTime={entry.occurredOn}>{entry.occurredOn}</time>

            <div className="operational-account-projection__entry-description">
              <small>{formatEntryType(entry.entryType)}</small>

              <strong>{entry.title}</strong>

              <span>{getEntryDescription(entry, account)}</span>
            </div>

            <div className="operational-account-projection__entry-amount">
              <strong>{formatSignedAmount(entry.amount)}</strong>

              <span>Running balance {formatAmount(entry.runningBalance)}</span>
            </div>
          </article>
        ))}

        {account.entries.length === 0 ? (
          <div className="operational-account-projection__empty-timeline">
            <strong>No projected account movements</strong>

            <p>
              Valid routed deposits and planned debt settlements assigned to
              this account will appear here.
            </p>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ProjectionDiagnosticCard({
  diagnostic,
}: {
  diagnostic: ProjectionDiagnostic;
}) {
  return (
    <article
      className={[
        "operational-account-projection__diagnostic",
        `operational-account-projection__diagnostic--${diagnostic.severity}`,
      ].join(" ")}
    >
      <div className="operational-account-projection__diagnostic-header">
        <div>
          <small>{formatDiagnosticCategory(diagnostic.category)}</small>
          <strong>{diagnostic.title}</strong>
        </div>

        <span>{diagnostic.severity}</span>
      </div>

      <p>{diagnostic.message}</p>
    </article>
  );
}

export function OperationalAccountProjectionView({
  projection,
}: OperationalAccountProjectionViewProps) {
  const checkingAccounts = projection.accounts.filter(
    (account) => account.accountType === "checking",
  );

  const savingsAccounts = projection.accounts.filter(
    (account) => account.accountType === "savings",
  );

  const projectedOpeningBalance = projection.accounts.reduce(
    (total, account) => total + account.openingBalance,
    0,
  );

  const projectedDeposits = projection.accounts.reduce(
    (total, account) => total + account.totalPlannedDeposits,
    0,
  );

  const projectedSettlements = projection.accounts.reduce(
    (total, account) => total + account.totalPlannedSettlements,
    0,
  );

  const projectedClosingBalance = projection.accounts.reduce(
    (total, account) => total + account.closingBalance,
    0,
  );

  return (
    <section className="operational-account-projection">
      <div className="operational-account-projection__header">
        <div>
          <span>Account-aware cash projection</span>

          <h3>Operational Account Projections</h3>

          <p>
            Review how valid routed future deposits change each active checking
            and savings account over time.
          </p>
        </div>

        <span
          className={`operational-account-projection__projection-status ${
            projection.diagnostics.canProjectCompletely
              ? "operational-account-projection__projection-status--ready"
              : "operational-account-projection__projection-status--attention"
          }`}
        >
          {projection.diagnostics.canProjectCompletely
            ? "Projection complete"
            : "Projection attention required"}
        </span>
      </div>

      <div className="operational-account-projection__summary">
        <article>
          <span>Projected Asset Accounts</span>
          <strong>{projection.accounts.length}</strong>
        </article>

        <article>
          <span>Opening Asset Balance</span>
          <strong>{formatAmount(projectedOpeningBalance)}</strong>
        </article>

        <article>
          <span>Valid Planned Deposits</span>
          <strong>{formatAmount(projectedDeposits)}</strong>
        </article>

        <article>
          <span>Planned Debt Settlements</span>
          <strong>{formatAmount(projectedSettlements)}</strong>
        </article>

        <article>
          <span>Projected Closing Balance</span>
          <strong>{formatAmount(projectedClosingBalance)}</strong>
        </article>
      </div>

      {projection.accounts.length === 0 ? (
        <div className="operational-account-projection__empty">
          <strong>No active asset accounts available</strong>

          <p>
            Add an active checking or savings account before building
            account-specific cash projections.
          </p>
        </div>
      ) : (
        <>
          {checkingAccounts.length > 0 ? (
            <section className="operational-account-projection__group">
              <div className="operational-account-projection__group-header">
                <div>
                  <h4>Checking Accounts</h4>

                  <p>
                    Transaction accounts expected to receive routed future cash.
                  </p>
                </div>

                <span>
                  {checkingAccounts.length}{" "}
                  {checkingAccounts.length === 1 ? "account" : "accounts"}
                </span>
              </div>

              <div className="operational-account-projection__accounts">
                {checkingAccounts.map((account) => (
                  <AccountProjectionCard
                    key={account.accountId}
                    account={account}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {savingsAccounts.length > 0 ? (
            <section className="operational-account-projection__group">
              <div className="operational-account-projection__group-header">
                <div>
                  <h4>Savings Accounts</h4>

                  <p>Reserved asset accounts receiving planned deposits.</p>
                </div>

                <span>
                  {savingsAccounts.length}{" "}
                  {savingsAccounts.length === 1 ? "account" : "accounts"}
                </span>
              </div>

              <div className="operational-account-projection__accounts">
                {savingsAccounts.map((account) => (
                  <AccountProjectionCard
                    key={account.accountId}
                    account={account}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}

      {projection.diagnostics.diagnostics.length > 0 ? (
        <section className="operational-account-projection__diagnostics">
          <div className="operational-account-projection__diagnostics-header">
            <div>
              <h4>Projection Diagnostics</h4>

              <p>
                Resolve these routing conditions to produce a complete,
                account-aware projection.
              </p>
            </div>

            <div className="operational-account-projection__diagnostic-counts">
              <span>{projection.diagnostics.blockingCount} blocking</span>

              <span>{projection.diagnostics.attentionCount} attention</span>
            </div>
          </div>

          <div className="operational-account-projection__diagnostic-list">
  {projection.diagnostics.diagnostics.map(
    (diagnostic: ProjectionDiagnostic) => (
      <ProjectionDiagnosticCard
        key={diagnostic.id}
        diagnostic={diagnostic}
      />
    ),
  )}
</div>
        </section>
      ) : null}
    </section>
  );
}
