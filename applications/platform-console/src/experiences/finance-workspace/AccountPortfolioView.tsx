import type { PortfolioAccountSummary } from "./portfolio.types";
import { PortfolioAccountTable } from "./PortfolioAccountTable";
import { PortfolioSummaryView } from "./PortfolioSummaryView";
import { UpcomingObligationsView } from "./UpcomingObligationsView";

type AccountPortfolioViewProps = {
  accounts: PortfolioAccountSummary[];
  onAddAccount: () => void;
  onEditAccount: (account: PortfolioAccountSummary) => void;
  onRemoveAccount: (accountId: string) => void;
};

export function AccountPortfolioView({
  accounts,
  onAddAccount,
  onEditAccount,
  onRemoveAccount,
}: AccountPortfolioViewProps) {
  return (
    <section className="finance-workspace__portfolio">
      <div className="finance-workspace__section-header">
        <div>
          <p>Account Portfolio</p>
          <span>Statement snapshots — not live account data</span>
        </div>

        <button type="button" onClick={onAddAccount}>
          Add account
        </button>
      </div>

      <PortfolioSummaryView accounts={accounts} />

      <UpcomingObligationsView accounts={accounts} />

      <PortfolioAccountTable
        accounts={accounts}
        onEditAccount={onEditAccount}
        onRemoveAccount={onRemoveAccount}
      />
    </section>
  );
}
