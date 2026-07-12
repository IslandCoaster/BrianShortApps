import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ProductHero } from "../components/product-hero/ProductHero";
import {
  FinancialHealthBanner,
  type FinancialHealthStatus,
} from "../components/financial-health-banner/FinancialHealthBanner";
import { ProductQuickActions } from "../components/product-quick-actions/ProductQuickActions";

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

    const nextObligationDate = activeAccounts
      .filter(
        (account) =>
          account.paymentDueDate && (account.minimumPaymentDue ?? 0) > 0,
      )
      .map((account) => account.paymentDueDate as string)
      .sort((left, right) => left.localeCompare(right))[0];

    return {
      activeAccountCount: activeAccounts.length,
      totalBalance,
      knownRequiredPayments,
      pastDueAccounts,
      unknownPaymentAmounts,
      nextObligationDate,
    };
  }, [portfolioAccounts]);

  const financialHealth = useMemo<{
    status: FinancialHealthStatus;
    title: string;
    description: string;
  }>(() => {
    if (portfolioOverview.activeAccountCount === 0) {
      return {
        status: "incomplete",
        title: "Add an account to begin",
        description:
          "Your financial position and funding plan will appear after at least one active account is entered.",
      };
    }
    if (portfolioOverview.pastDueAccounts > 0) {
      return {
        status: "attention",
        title: `${portfolioOverview.pastDueAccounts} ${
          portfolioOverview.pastDueAccounts === 1
            ? "account requires"
            : "accounts require"
        } attention`,
        description:
          "Past-due obligations should be reviewed before allocating cash to later payments.",
      };
    }

    if (portfolioOverview.unknownPaymentAmounts > 0) {
      return {
        status: "incomplete",
        title: "Complete your required-payment information",
        description:
          "Some dated obligations do not have payment amounts, so the current funding plan cannot include them.",
      };
    }

    return {
      status: "ready",
      title: "Your account portfolio is ready for planning",
      description:
        "Known dated obligations can be evaluated against your cash reserve and upcoming funding sources.",
    };
  }, [portfolioOverview]);

  function scrollToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
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
        <FinancialHealthBanner
          status={financialHealth.status}
          title={financialHealth.title}
          description={financialHealth.description}
          knownRequiredPayments={portfolioOverview.knownRequiredPayments}
          pastDueAccounts={portfolioOverview.pastDueAccounts}
          nextObligationDate={portfolioOverview.nextObligationDate}
          unknownPaymentAmounts={portfolioOverview.unknownPaymentAmounts}
        />

        <ProductQuickActions
          actions={[
            {
              id: "add-account",
              label: "Add account",
              description: "Enter another account or financial obligation.",
              emphasis: "primary",
              onClick: () => {
                setEditingAccount(null);
                setIsAddingAccount(true);

                window.requestAnimationFrame(() => {
                  scrollToSection("accounts");
                });
              },
            },
            {
              id: "review-obligations",
              label: "Review obligations",
              description: "See upcoming and past-due required payments.",
              disabled: portfolioOverview.activeAccountCount === 0,
              onClick: () => scrollToSection("obligations"),
            },
            {
              id: "build-funding-plan",
              label: "Build funding plan",
              description: "Enter cash, reserve, and paycheck timing.",
              disabled: portfolioOverview.activeAccountCount === 0,
              onClick: () => scrollToSection("funding-plan"),
            },
            {
              id: "update-account",
              label: "Update account",
              description:
                "Select an account below to update its latest information.",
              disabled: portfolioOverview.activeAccountCount === 0,
              onClick: () => scrollToSection("accounts"),
            },
          ]}
        />

        <section className="personal-finance-page__section">
          <div className="personal-finance-page__section-heading">
            <div>
              <h2>Today&apos;s financial position</h2>
              <p>
                A current portfolio summary based on the account information
                entered for this planning session.
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

        <section className="personal-finance-page__section" id="accounts">
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
                  <div id="obligations">
                    <UpcomingObligationsView accounts={portfolioAccounts} />
                  </div>

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

        <section className="personal-finance-page__section" id="funding-plan">
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
