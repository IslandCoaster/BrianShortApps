import { useEffect, useMemo, useState } from "react";
import {
  createFinancialLedgerEvent,
  replayFinancialLedgerEvents,
  type FinancialLedgerEvent,
  type FinancialLedgerReplayState,
} from "@bsa/finance";
import { Link } from "react-router";

import {
  FinancialHealthBanner,
  type FinancialHealthStatus,
} from "../components/financial-health-banner/FinancialHealthBanner";
import { ProductHero } from "../components/product-hero/ProductHero";
import { ProductQuickActions } from "../components/product-quick-actions/ProductQuickActions";

import { AccountForm } from "../experiences/finance-workspace/AccountForm";
import { AccountPortfolioView } from "../experiences/finance-workspace/AccountPortfolioView";
import { PaycheckPlanningView } from "../experiences/finance-workspace/PaycheckPlanningView";
import { FirstRunExperience } from "../experiences/finance-workspace/FirstRunExperience";
import { getOperationalFinancialLedgerRepository } from "../experiences/finance-workspace/operationalFinancialLedgerRepository";
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

function ReadyPersonalFinancePage({
  ledgerReplay,
}: {
  ledgerReplay: FinancialLedgerReplayState;
}) {
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

  const hasAccounts = portfolioOverview.activeAccountCount > 0;

  const financialHealth = useMemo<{
    status: FinancialHealthStatus;
    title: string;
    description: string;
  }>(() => {
    if (!hasAccounts) {
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
  }, [hasAccounts, portfolioOverview]);

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

  function handleOpenAccountForm() {
    setEditingAccount(null);
    setIsAddingAccount(true);

    window.requestAnimationFrame(() => {
      scrollToSection("accounts");
    });
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
              onClick: handleOpenAccountForm,
            },
            {
              id: "review-obligations",
              label: "Review obligations",
              description: "See upcoming and past-due required payments.",
              disabled: !hasAccounts,
              onClick: () => scrollToSection("obligations"),
            },
            {
              id: "build-funding-plan",
              label: "Build funding plan",
              description: "Enter cash, reserve, and paycheck timing.",
              disabled: !hasAccounts,
              onClick: () => scrollToSection("funding-plan"),
            },
            {
              id: "update-account",
              label: "Update account",
              description:
                "Select an account below to update its latest information.",
              disabled: !hasAccounts,
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
              <span>Current Cash Position</span>
              <strong>{formatAmount(ledgerReplay.currentCash)}</strong>
              <small>
                Derived from posted operational ledger activity.
              </small>
            </article>

            <article className="personal-finance-page__metric">
              <span>Total balances</span>
              <strong>{formatAmount(portfolioOverview.totalBalance)}</strong>
              <small>
                Current balances from the latest entered account information.
              </small>
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
              <h2>Financial accounts</h2>

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
              ) : hasAccounts ? (
                <>
                  <div id="obligations">
                    <UpcomingObligationsView accounts={portfolioAccounts} />
                  </div>

                  <AccountPortfolioView
                    accounts={portfolioAccounts}
                    showSummary={false}
                    showUpcomingObligations={false}
                    onAddAccount={handleOpenAccountForm}
                    onEditAccount={(account) => {
                      setIsAddingAccount(false);
                      setEditingAccount(account);
                    }}
                    onRemoveAccount={handleRemoveAccount}
                  />
                </>
              ) : (
                <div className="personal-finance-page__empty-product">
                  <strong>Start with your first financial account</strong>

                  <p>
                    Add a credit card, charge card, store card, or student loan
                    to begin building your portfolio and funding plan.
                  </p>

                  <button type="button" onClick={handleOpenAccountForm}>
                    Add your first account
                  </button>
                </div>
              )}
            </section>
          </div>
        </section>

        {hasAccounts ? (
          <section className="personal-finance-page__section" id="funding-plan">
            <div className="personal-finance-page__section-heading">
              <div>
                <h2>Funding plan</h2>

                <p>
                  Combine current cash and dated income into a reserve-aware
                  payment plan.
                </p>
              </div>
            </div>

            <div className="personal-finance-page__surface">
              <section className="finance-workspace finance-workspace--product">
                <PaycheckPlanningView accounts={portfolioAccounts} />
              </section>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
type OperationalSessionState =
  | {
      status: "loading";
    }
  | {
      status: "first-run";
    }
  | {
      status: "ready";
      ledgerEvents: FinancialLedgerEvent[];
      ledgerReplay: FinancialLedgerReplayState;
    }
  | {
      status: "error";
      message: string;
    };

function OperationalSessionMessage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="personal-finance-page">
      <div className="personal-finance-page__container">
        <ProductHero
          eyebrow="BrianShortApps Personal Finance"
          title={title}
          description={description}
          actions={<Link to="/">Engineering workspace</Link>}
        />
      </div>
    </main>
  );
}

export function PersonalFinancePage() {
  const [sessionState, setSessionState] =
    useState<OperationalSessionState>({
      status: "loading",
    });

  useEffect(() => {
    let isCurrent = true;

    async function initializeOperationalSession() {
      try {
        const repository = getOperationalFinancialLedgerRepository();
        const ledgerEvents = await repository.load();

        if (!isCurrent) {
          return;
        }

        if (ledgerEvents.length === 0) {
          setSessionState({
            status: "first-run",
          });

          return;
        }

        const ledgerReplay = replayFinancialLedgerEvents(ledgerEvents);

        setSessionState({
          status: "ready",
          ledgerEvents,
          ledgerReplay,
        });
      } catch (error) {
        if (!isCurrent) {
          return;
        }

        setSessionState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "The operational ledger could not be loaded.",
        });
      }
    }

    void initializeOperationalSession();

    return () => {
      isCurrent = false;
    };
  }, []);

  if (sessionState.status === "loading") {
    return (
      <OperationalSessionMessage
        title="Loading Personal Finance"
        description="Restoring your operational financial history."
      />
    );
  }

  if (sessionState.status === "first-run") {
    return (
      <FirstRunExperience
        onEstablishCurrentCashPosition={async (amount) => {
          const repository = getOperationalFinancialLedgerRepository();
          const now = new Date();

          const openingCashEvent = createFinancialLedgerEvent({
            id: crypto.randomUUID(),
            ledgerCategory: "opening-cash",
            occurredOn: now.toISOString().slice(0, 10),
            recordedAt: now.toISOString(),
            status: "posted",
            amount,
            description: "Current Cash Position",
          });

          const ledgerEvents = [openingCashEvent];

          await repository.save(ledgerEvents);

          const restoredLedgerEvents = await repository.load();
          const ledgerReplay = replayFinancialLedgerEvents(
            restoredLedgerEvents,
          );

          setSessionState({
            status: "ready",
            ledgerEvents: restoredLedgerEvents,
            ledgerReplay,
          });
        }}
      />
    );
  }

  if (sessionState.status === "error") {
    return (
      <OperationalSessionMessage
        title="Personal Finance could not be opened"
        description={sessionState.message}
      />
    );
  }

  return (
    <ReadyPersonalFinancePage
      ledgerReplay={sessionState.ledgerReplay}
    />
  );
}


