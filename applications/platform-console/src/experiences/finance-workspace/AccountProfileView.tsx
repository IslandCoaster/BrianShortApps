import type { AccountProfile } from "@bsa/finance";

type AccountProfileViewProps = {
  accountProfiles: AccountProfile[];
};

function formatPercent(percent: number) {
  return `${percent}%`;
}

export function AccountProfileView({ accountProfiles }: AccountProfileViewProps) {
  if (accountProfiles.length === 0) {
    return null;
  }

  return (
    <section className="finance-workspace__account-profiles">
      <div className="finance-workspace__section-header">
        <p>Account Configuration</p>
        <span>{accountProfiles.length} active profiles</span>
      </div>

      <div className="finance-workspace__account-profile-list">
        {accountProfiles.map((profile) => (
          <article className="finance-workspace__account-profile" key={profile.accountId}>
            <div className="finance-workspace__account-profile-main">
              <div>
                <span>{profile.issuer}</span>
                <strong>{profile.accountName}</strong>
              </div>

              <div>
                <span>APR</span>
                <strong>{formatPercent(profile.activeRuleSet.aprPercent)}</strong>
              </div>
            </div>

            <dl>
              <div>
                <dt>Type</dt>
                <dd>{profile.accountType}</dd>
              </div>

              <div>
                <dt>APR Type</dt>
                <dd>{profile.activeRuleSet.isVariableApr ? "variable" : "fixed"}</dd>
              </div>

              <div>
                <dt>Interest Method</dt>
                <dd>{profile.activeRuleSet.interestCalculationMethod}</dd>
              </div>

              <div>
                <dt>Payment Cutoff</dt>
                <dd>{profile.activeRuleSet.paymentPostingCutoff}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
