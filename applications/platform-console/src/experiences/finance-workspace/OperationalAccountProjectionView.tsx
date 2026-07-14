import type {
  AssetAccountProjection,
  AssetAccountProjectionResult,
  BlockedFundingSourceProjection,
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

function formatRoutingStatus(status: BlockedFundingSourceProjection["status"]) {
  switch (status) {
    case "unallocated":
      return "Unallocated";

    case "partially-allocated":
      return "Partially allocated";

    case "fully-allocated":
      return "Fully allocated";

    case "overallocated":
      return "Overallocated";

    case "invalid":
      return "Invalid routing";
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

            <p>Valid routed deposits applied in date order.</p>
          </div>

          <span>
            {account.entries.length}{" "}
            {account.entries.length === 1 ? "deposit" : "deposits"}
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
            className="operational-account-projection__entry"
          >
            <div className="operational-account-projection__marker">
              <span aria-hidden="true" />
            </div>

            <time dateTime={entry.occurredOn}>{entry.occurredOn}</time>

            <div className="operational-account-projection__entry-description">
              <small>Funding Deposit</small>

              <strong>{entry.title}</strong>

              <span>Routed into {account.accountName}</span>
            </div>

            <div className="operational-account-projection__entry-amount">
              <strong>{formatSignedAmount(entry.amount)}</strong>

              <span>Running balance {formatAmount(entry.runningBalance)}</span>
            </div>
          </article>
        ))}

        {account.entries.length === 0 ? (
          <div className="operational-account-projection__empty-timeline">
            <strong>No projected deposits</strong>

            <p>
              Fully routed planned funding sources assigned to this account will
              appear here.
            </p>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function BlockedFundingSourceCard({
  source,
}: {
  source: BlockedFundingSourceProjection;
}) {
  return (
    <article className="operational-account-projection__blocked-source">
      <div className="operational-account-projection__blocked-source-header">
        <div>
          <small>Funding source needs attention</small>

          <strong>{source.fundingSourceTitle}</strong>
        </div>

        <span
          className={`operational-account-projection__routing-status operational-account-projection__routing-status--${source.status}`}
        >
          {formatRoutingStatus(source.status)}
        </span>
      </div>

      <dl>
        <div>
          <dt>Funding Source Total</dt>

          <dd>{formatAmount(source.fundingSourceAmount)}</dd>
        </div>

        <div>
          <dt>Remaining Allocation</dt>

          <dd>{formatAmount(Math.abs(source.remainingAmount))}</dd>
        </div>
      </dl>

      {source.issues.length > 0 ? (
        <ul>
          {source.issues.map((issue, index) => (
            <li key={`${issue.code}-${issue.allocationId ?? index}`}>
              {issue.message}
            </li>
          ))}
        </ul>
      ) : (
        <p>
          Complete the destination routing before this funding source can
          contribute to an account projection.
        </p>
      )}
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
            projection.canProjectAllPlannedFunding
              ? "operational-account-projection__projection-status--ready"
              : "operational-account-projection__projection-status--attention"
          }`}
        >
          {projection.canProjectAllPlannedFunding
            ? "All planned funding projected"
            : "Routing attention required"}
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

      {projection.blockedFundingSources.length > 0 ? (
        <section className="operational-account-projection__attention">
          <div className="operational-account-projection__attention-header">
            <div>
              <h4>Funding Needs Attention</h4>

              <p>
                These planned funding sources are not included in projected
                account balances until their routing is complete and valid.
              </p>
            </div>

            <span>
              {projection.blockedFundingSources.length}{" "}
              {projection.blockedFundingSources.length === 1
                ? "source"
                : "sources"}
            </span>
          </div>

          <div className="operational-account-projection__blocked-list">
            {projection.blockedFundingSources.map((source) => (
              <BlockedFundingSourceCard
                key={source.fundingSourceId}
                source={source}
              />
            ))}
          </div>
        </section>
      ) : null}

      {projection.orphanedIssues.length > 0 ? (
        <section className="operational-account-projection__orphaned">
          <strong>Orphaned routing records detected</strong>

          <p>
            These routing records reference funding sources that no longer exist
            and must be reviewed.
          </p>

          <ul>
            {projection.orphanedIssues.map((issue, index) => (
              <li key={`${issue.code}-${issue.allocationId ?? index}`}>
                {issue.message}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
