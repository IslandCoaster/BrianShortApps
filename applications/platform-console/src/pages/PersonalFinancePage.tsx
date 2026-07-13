import { useEffect, useMemo, useState } from "react";
import {
  createFinancialLedgerEvent,
  getFinancialAccountBalance,
  isAssetFinancialAccount,
  replayFinancialLedgerEvents,
  type FinancialAccount,
  type FinancialLedgerEvent,
  type FinancialLedgerReplayState,
  type FinancialObligation,
} from "@bsa/finance";
import { Link } from "react-router";

import {
  FinancialHealthBanner,
  type FinancialHealthStatus,
} from "../components/financial-health-banner/FinancialHealthBanner";
import { ProductHero } from "../components/product-hero/ProductHero";
import { ProductQuickActions } from "../components/product-quick-actions/ProductQuickActions";

import { FirstRunExperience } from "../experiences/finance-workspace/FirstRunExperience";
import { getOperationalFinancialAccountRepository } from "../experiences/finance-workspace/operationalFinancialAccountRepository";
import { getOperationalFinancialLedgerRepository } from "../experiences/finance-workspace/operationalFinancialLedgerRepository";
import { getOperationalFinancialObligationRepository } from "../experiences/finance-workspace/operationalFinancialObligationRepository";

import "../experiences/finance-workspace/FinanceWorkspace.css";
import "./PersonalFinancePage.css";

function formatAmount(amount: number) {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function isOperationalAccountActive(account: FinancialAccount): boolean {
  return account.status !== "closed" && account.status !== "paid-off";
}

function isOperationalObligationActive(
  obligation: FinancialObligation,
): boolean {
  return obligation.status !== "cancelled" && obligation.status !== "satisfied";
}

function getAccountRequiredPayment(account: FinancialAccount): number {
  switch (account.accountType) {
    case "credit-card":
    case "loan":
      return account.minimumPayment ?? 0;

    case "checking":
    case "savings":
      return 0;
  }
}

function getAccountPaymentDueDate(
  account: FinancialAccount,
): string | undefined {
  switch (account.accountType) {
    case "credit-card":
    case "loan":
      return account.paymentDueDate;

    case "checking":
    case "savings":
      return undefined;
  }
}

type ReadyPersonalFinancePageProps = {
  ledgerReplay: FinancialLedgerReplayState;
  accounts: FinancialAccount[];
  obligations: FinancialObligation[];
};

function ReadyPersonalFinancePage({
  ledgerReplay,
  accounts,
  obligations,
}: ReadyPersonalFinancePageProps) {
  const operationalOverview = useMemo(() => {
    const activeAccounts = accounts.filter(isOperationalAccountActive);

    const activeObligations = obligations.filter(isOperationalObligationActive);

    const assetAccounts = activeAccounts.filter(isAssetFinancialAccount);

    const debtAccounts = activeAccounts.filter(
      (account) => !isAssetFinancialAccount(account),
    );

    const totalAssetBalance = assetAccounts.reduce(
      (total, account) => total + getFinancialAccountBalance(account),
      0,
    );

    const totalDebtBalance = debtAccounts.reduce(
      (total, account) => total + getFinancialAccountBalance(account),
      0,
    );

    const accountRequiredPayments = activeAccounts.reduce(
      (total, account) => total + getAccountRequiredPayment(account),
      0,
    );

    const obligationRequiredPayments = activeObligations.reduce(
      (total, obligation) => total + obligation.amountDue,
      0,
    );

    const pastDueAccounts = activeAccounts.filter(
      (account) => account.status === "past-due",
    ).length;

    const pastDueObligations = activeObligations.filter(
      (obligation) => obligation.status === "past-due",
    ).length;

    const accountDueDates = activeAccounts
      .map(getAccountPaymentDueDate)
      .filter((dueDate): dueDate is string => dueDate !== undefined);

    const obligationDueDates = activeObligations.map(
      (obligation) => obligation.dueDate,
    );

    const nextRequiredDate = [...accountDueDates, ...obligationDueDates].sort(
      (left, right) => left.localeCompare(right),
    )[0];

    return {
      activeAccountCount: activeAccounts.length,
      activeObligationCount: activeObligations.length,
      totalAssetBalance,
      totalDebtBalance,
      knownRequiredPayments:
        accountRequiredPayments + obligationRequiredPayments,
      pastDueItems: pastDueAccounts + pastDueObligations,
      nextRequiredDate,
    };
  }, [accounts, obligations]);

  const hasAccounts = operationalOverview.activeAccountCount > 0;

  const hasObligations = operationalOverview.activeObligationCount > 0;

  const hasOperationalData = hasAccounts || hasObligations;

  const financialHealth = useMemo<{
    status: FinancialHealthStatus;
    title: string;
    description: string;
  }>(() => {
    if (!hasOperationalData) {
      return {
        status: "incomplete",
        title: "Add your first financial account",
        description:
          "Your current cash position is established. Add accounts and obligations to begin building the rest of your operational financial state.",
      };
    }

    if (operationalOverview.pastDueItems > 0) {
      return {
        status: "attention",
        title: `${operationalOverview.pastDueItems} ${
          operationalOverview.pastDueItems === 1
            ? "item requires"
            : "items require"
        } attention`,
        description:
          "Past-due accounts and obligations should be reviewed before allocating cash to later payments.",
      };
    }

    return {
      status: "ready",
      title: "Your operational financial state is ready",
      description:
        "Persisted accounts and obligations are available for funding and timeline planning.",
    };
  }, [hasOperationalData, operationalOverview.pastDueItems]);

  function scrollToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <main className="personal-finance-page">
      <div className="personal-finance-page__container">
        <ProductHero
          eyebrow="BrianShortApps Personal Finance"
          title="Your financial plan"
          description="Build your financial position intentionally from operational cash, accounts, obligations, income, and planned activity."
          actions={<Link to="/">Engineering workspace</Link>}
        />

        <FinancialHealthBanner
          status={financialHealth.status}
          title={financialHealth.title}
          description={financialHealth.description}
          knownRequiredPayments={operationalOverview.knownRequiredPayments}
          pastDueAccounts={operationalOverview.pastDueItems}
          nextObligationDate={operationalOverview.nextRequiredDate}
          unknownPaymentAmounts={0}
        />

        <ProductQuickActions
          actions={[
            {
              id: "add-account",
              label: "Add account",
              description:
                "Operational account intake is being migrated to the new account domain.",
              emphasis: "primary",
              disabled: true,
              onClick: () => scrollToSection("accounts"),
            },
            {
              id: "add-obligation",
              label: "Add obligation",
              description:
                "Utility obligation intake will use the separate obligation domain.",
              disabled: true,
              onClick: () => scrollToSection("obligations"),
            },
            {
              id: "build-funding-plan",
              label: "Build funding plan",
              description:
                "Funding migration follows operational account and obligation intake.",
              disabled: true,
              onClick: () => scrollToSection("funding-plan"),
            },
          ]}
        />

        <section className="personal-finance-page__section">
          <div className="personal-finance-page__section-heading">
            <div>
              <h2>Today&apos;s financial position</h2>

              <p>
                A repository-backed operational view of the financial
                information entered into Personal Finance.
              </p>
            </div>
          </div>

          <div className="personal-finance-page__overview">
            <article className="personal-finance-page__metric">
              <span>Current Cash Position</span>

              <strong>{formatAmount(ledgerReplay.currentCash)}</strong>

              <small>Derived from posted operational ledger activity.</small>
            </article>

            <article className="personal-finance-page__metric">
              <span>Asset Accounts</span>

              <strong>
                {formatAmount(operationalOverview.totalAssetBalance)}
              </strong>

              <small>
                {
                  accounts.filter(
                    (account) =>
                      isOperationalAccountActive(account) &&
                      isAssetFinancialAccount(account),
                  ).length
                }{" "}
                active checking or savings accounts.
              </small>
            </article>

            <article className="personal-finance-page__metric">
              <span>Debt Accounts</span>

              <strong>
                {formatAmount(operationalOverview.totalDebtBalance)}
              </strong>

              <small>
                {
                  accounts.filter(
                    (account) =>
                      isOperationalAccountActive(account) &&
                      !isAssetFinancialAccount(account),
                  ).length
                }{" "}
                active credit card or loan accounts.
              </small>
            </article>

            <article className="personal-finance-page__metric">
              <span>Known Required Payments</span>

              <strong>
                {formatAmount(operationalOverview.knownRequiredPayments)}
              </strong>

              <small>
                Includes persisted debt payments and active obligations.
              </small>
            </article>
          </div>
        </section>

        <section className="personal-finance-page__section" id="accounts">
          <div className="personal-finance-page__section-heading">
            <div>
              <h2>Financial accounts</h2>

              <p>
                Checking, savings, credit card, and loan accounts are maintained
                independently from recurring obligations.
              </p>
            </div>
          </div>

          <div className="personal-finance-page__surface">
            <section className="finance-workspace finance-workspace--product">
              {hasAccounts ? (
                <div className="personal-finance-page__empty-product">
                  <strong>
                    {operationalOverview.activeAccountCount} operational{" "}
                    {operationalOverview.activeAccountCount === 1
                      ? "account is"
                      : "accounts are"}{" "}
                    persisted
                  </strong>

                  <p>
                    Operational account display and editing will be connected in
                    the next migration slice.
                  </p>
                </div>
              ) : (
                <div className="personal-finance-page__empty-product">
                  <strong>No financial accounts entered</strong>

                  <p>
                    No demo accounts or statement snapshots were loaded. Your
                    first checking, savings, credit card, or loan account must
                    be added intentionally.
                  </p>
                </div>
              )}
            </section>
          </div>
        </section>

        <section className="personal-finance-page__section" id="obligations">
          <div className="personal-finance-page__section-heading">
            <div>
              <h2>Financial obligations</h2>

              <p>
                Recurring obligations are maintained separately from asset and
                debt accounts.
              </p>
            </div>
          </div>

          <div className="personal-finance-page__surface">
            <section className="finance-workspace finance-workspace--product">
              {hasObligations ? (
                <div className="personal-finance-page__empty-product">
                  <strong>
                    {operationalOverview.activeObligationCount} operational{" "}
                    {operationalOverview.activeObligationCount === 1
                      ? "obligation is"
                      : "obligations are"}{" "}
                    persisted
                  </strong>

                  <p>
                    Operational obligation display and editing will be connected
                    after account intake.
                  </p>
                </div>
              ) : (
                <div className="personal-finance-page__empty-product">
                  <strong>No financial obligations entered</strong>

                  <p>
                    Utility bills and future recurring obligations will appear
                    here only after they are intentionally created.
                  </p>
                </div>
              )}
            </section>
          </div>
        </section>

        <section className="personal-finance-page__section" id="funding-plan">
          <div className="personal-finance-page__section-heading">
            <div>
              <h2>Funding plan</h2>

              <p>
                Funding will consume replay-derived cash, persisted accounts,
                persisted obligations, and user-entered paycheck timing.
              </p>
            </div>
          </div>

          <div className="personal-finance-page__surface">
            <section className="finance-workspace finance-workspace--product">
              <div className="personal-finance-page__empty-product">
                <strong>No funding plan created</strong>

                <p>
                  No seeded accounts or in-memory snapshot data are being used
                  to generate a funding plan. Operational funding integration
                  will follow account and obligation intake.
                </p>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

type OperationalData = {
  ledgerEvents: FinancialLedgerEvent[];
  ledgerReplay: FinancialLedgerReplayState;
  accounts: FinancialAccount[];
  obligations: FinancialObligation[];
};

type OperationalSessionState =
  | {
      status: "loading";
    }
  | {
      status: "first-run";
      accounts: FinancialAccount[];
      obligations: FinancialObligation[];
    }
  | ({
      status: "ready";
    } & OperationalData)
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
  const [sessionState, setSessionState] = useState<OperationalSessionState>({
    status: "loading",
  });

  useEffect(() => {
    let isCurrent = true;

    async function initializeOperationalSession() {
      try {
        const ledgerRepository = getOperationalFinancialLedgerRepository();

        const accountRepository = getOperationalFinancialAccountRepository();

        const obligationRepository =
          getOperationalFinancialObligationRepository();

        const [ledgerEvents, accounts, obligations] = await Promise.all([
          ledgerRepository.load(),
          accountRepository.load(),
          obligationRepository.load(),
        ]);

        if (!isCurrent) {
          return;
        }

        if (ledgerEvents.length === 0) {
          setSessionState({
            status: "first-run",
            accounts,
            obligations,
          });

          return;
        }

        const ledgerReplay = replayFinancialLedgerEvents(ledgerEvents);

        setSessionState({
          status: "ready",
          ledgerEvents,
          ledgerReplay,
          accounts,
          obligations,
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
              : "Operational financial data could not be loaded.",
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
        description="Restoring your operational ledger, accounts, and obligations."
      />
    );
  }

  if (sessionState.status === "first-run") {
    return (
      <FirstRunExperience
        onEstablishCurrentCashPosition={async (amount) => {
          try {
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

            await repository.save([openingCashEvent]);

            const restoredLedgerEvents = await repository.load();

            const ledgerReplay =
              replayFinancialLedgerEvents(restoredLedgerEvents);

            setSessionState({
              status: "ready",
              ledgerEvents: restoredLedgerEvents,
              ledgerReplay,
              accounts: sessionState.accounts,
              obligations: sessionState.obligations,
            });
          } catch (error) {
            setSessionState({
              status: "error",
              message:
                error instanceof Error
                  ? error.message
                  : "The current cash position could not be established.",
            });
          }
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
      accounts={sessionState.accounts}
      obligations={sessionState.obligations}
    />
  );
}
