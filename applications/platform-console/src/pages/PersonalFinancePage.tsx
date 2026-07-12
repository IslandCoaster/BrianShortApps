import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ProductHero } from "../components/product-hero/ProductHero";

import { AccountForm } from "../experiences/finance-workspace/AccountForm";
import { AccountPortfolioView } from "../experiences/finance-workspace/AccountPortfolioView";
import { PaycheckPlanningView } from "../experiences/finance-workspace/PaycheckPlanningView";
import { UpcomingObligationsView } from "../experiences/finance-workspace/UpcomingObligationsView";
import { portfolioAccountSnapshots } from "../experiences/finance-workspace/portfolio.snapshots";
import type { PortfolioAccountSummary } from "../experiences/finance-workspace/portfolio.types";

import "../experiences/finance-workspace/FinanceWorkspace.css";
import "./PersonalFinancePage.css";

function formatAmount(amount: number) {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function PersonalFinancePage() {
  const [portfolioAccounts, setPortfolioAccounts] = useState<
    PortfolioAccountSummary[]
  >(portfolioAccountSnapshots);

  const [isAddingAccount, setIsAddingAccount] = useState(false);

  const [editingAccount, setEditingAccount] =
    useState<PortfolioAccountSummary | null>(null);

  const portfolioOverview = useMemo(() => {
    const activeAccounts = portfolioAccounts.filter(
      (account) => account.accountStatus !== "paid-off",
    );

    const totalBalance = activeAccounts.reduce(
      (total, account) => total + account.currentBalance,
      0,
    );

    const knownRequiredPayments = activeAccounts.reduce(
      (total, account) => total + (account.minimumPaymentDue ?? 0),
      0,
    );

    const pastDueAccounts = activeAccounts.filter(
      (account) => account.accountStatus === "past-due",
    ).length;

    const unknownPaymentAmounts = activeAccounts.filter(
      (account) =>
        account.paymentDueDate && account.minimumPaymentDue === undefined,
    ).length;

    return {
      activeAccountCount: activeAccounts.length,
      totalBalance,
      knownRequiredPayments,
      pastDueAccounts,
      unknownPaymentAmounts,
    };
  }, [portfolioAccounts]);

  function handleSaveAccount(account: PortfolioAccountSummary) {
    setPortfolioAccounts((current) => {
      const accountExists = current.some(
        (existingAccount) => existingAccount.id === account.id,
      );

      if (accountExists) {
        return current.map((existingAccount) =>
          existingAccount.id === account.id ? account : existingAccount,
        );
      }

      return [...current, account];
    });

    setIsAddingAccount(false);
    setEditingAccount(null);
  }

  function handleRemoveAccount(accountId: string) {
    setPortfolioAccounts((current) =>
      current.filter((account) => account.id !== accountId),
    );

    if (editingAccount?.id === accountId) {
      setEditingAccount(null);
    }
  }

  function handleCancelAccountForm() {
    setIsAddingAccount(false);
    setEditingAccount(null);
  }

  return (
    <main className="personal-finance-page">
      <div className="personal-finance-page__container">
        <ProductHero
          eyebrow="BrianShortApps Personal Finance"
          title="Your financial plan"
          description="Understand your current obligations, protect the cash you need to keep available, and build a timing-aware plan for upcoming payments."
          actions={<Link to="/">Engineering workspace</Link>}
        />

        <section className="personal-finance-page__section">
          <div className="personal-finance-page__section-heading">
            <div>
              <h2>Financial overview</h2>
              <p>
                A current summary based on the account information in this
                planning session.
              </p>
            </div>
          </div>

          <div className="personal-finance-page__overview">
            <article className="personal-finance-page__metric">
              <span>Active accounts</span>
              <strong>{portfolioOverview.activeAccountCount}</strong>
              <small>Excludes accounts marked as paid off.</small>
            </article>

            <article className="personal-finance-page__metric">
              <span>Total balances</span>
              <strong>{formatAmount(portfolioOverview.totalBalance)}</strong>
              <small>Current balances from the latest account snapshots.</small>
            </article>

            <article className="personal-finance-page__metric">
              <span>Known required payments</span>
              <strong>
                {formatAmount(portfolioOverview.knownRequiredPayments)}
              </strong>
              <small>Includes only entered required-payment amounts.</small>
            </article>

            <article className="personal-finance-page__metric">
              <span>Past-due accounts</span>
              <strong>{portfolioOverview.pastDueAccounts}</strong>
              <small>
                {portfolioOverview.unknownPaymentAmounts > 0
                  ? `${portfolioOverview.unknownPaymentAmounts} account ${
                      portfolioOverview.unknownPaymentAmounts === 1
                        ? "has"
                        : "have"
                    } an unknown payment amount.`
                  : "All dated obligations have known payment amounts."}
              </small>
            </article>
          </div>
        </section>

        <section className="personal-finance-page__section">
          <div className="personal-finance-page__section-heading">
            <div>
              <h2>Accounts</h2>
              <p>
                Maintain the account information used by your financial plan.
              </p>
            </div>
          </div>

          <div className="personal-finance-page__surface">
            <section className="finance-workspace finance-workspace--product">
              {isAddingAccount || editingAccount ? (
                <AccountForm
                  account={editingAccount ?? undefined}
                  onCancel={handleCancelAccountForm}
                  onSubmit={handleSaveAccount}
                />
              ) : (
                <>
                  <UpcomingObligationsView accounts={portfolioAccounts} />

                  <AccountPortfolioView
                    accounts={portfolioAccounts}
                    showSummary={false}
                    showUpcomingObligations={false}
                    onAddAccount={() => {
                      setEditingAccount(null);
                      setIsAddingAccount(true);
                    }}
                    onEditAccount={(account) => {
                      setIsAddingAccount(false);
                      setEditingAccount(account);
                    }}
                    onRemoveAccount={handleRemoveAccount}
                  />
                </>
              )}
            </section>
          </div>
        </section>

        <section className="personal-finance-page__section">
          <div className="personal-finance-page__section-heading">
            <div>
              <h2>Paycheck planning</h2>
              <p>
                Protect your reserve and allocate dated income to required
                obligations.
              </p>
            </div>
          </div>

          <div className="personal-finance-page__surface">
            <section className="finance-workspace finance-workspace--product">
              <PaycheckPlanningView accounts={portfolioAccounts} />
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
