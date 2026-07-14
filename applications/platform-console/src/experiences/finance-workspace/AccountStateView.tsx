import type { AccountState } from "@bsa/finance";

type AccountStateViewProps = {
  accountStates: AccountState[];
};

function formatAmount(amount: number) {
  return `$${amount.toLocaleString()}`;
}

export function AccountStateView({ accountStates }: AccountStateViewProps) {
  if (accountStates.length === 0) {
    return null;
  }

  return (
    <section className="finance-workspace__account-states">
      <div className="finance-workspace__section-header">
        <p>Account State</p>
        <span>{accountStates.length} accounts interpreted</span>
      </div>

      <div className="finance-workspace__account-state-list">
        {accountStates.map((accountState) => (
          <article className="finance-workspace__account-state" key={accountState.accountId}>
            <div>
              <span>{accountState.accountName}</span>
              <strong>{formatAmount(accountState.currentBalance)}</strong>
            </div>

            <dl>
              <div>
                <dt>Statement</dt>
                <dd>{formatAmount(accountState.statementBalance)}</dd>
              </div>

              <div>
                <dt>Projected</dt>
                <dd>{formatAmount(accountState.projectedStatementBalance)}</dd>
              </div>

              <div>
                <dt>Payments</dt>
                <dd>{formatAmount(accountState.paymentTotal)}</dd>
              </div>

              <div>
                <dt>Minimum</dt>
                <dd>{formatAmount(accountState.minimumPayment)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
