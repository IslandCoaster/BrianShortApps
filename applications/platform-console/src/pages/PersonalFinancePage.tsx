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
  type FundingSource,
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
import { OperationalAccountTypeSelector } from "../experiences/finance-workspace/OperationalAccountTypeSelector";
import {
  OperationalAccountForm,
  type OperationalAccountDraft,
} from "../experiences/finance-workspace/OperationalAccountForm";
import { OperationalFinancialAccountsView } from "../experiences/finance-workspace/OperationalFinancialAccountsView";
import {
  OperationalObligationForm,
  type OperationalUtilityObligationDraft,
} from "../experiences/finance-workspace/OperationalObligationForm";
import { getOperationalFundingSourceRepository } from "../experiences/finance-workspace/operationalFundingSourceRepository";

import {
  OperationalFundingSourceForm,
  type OperationalPaycheckFundingSourceDraft,
} from "../experiences/finance-workspace/OperationalFundingSourceForm";

import { OperationalFundingSourcesView } from "../experiences/finance-workspace/OperationalFundingSourcesView";
import { OperationalFundingPlanView } from "../experiences/finance-workspace/OperationalFundingPlanView";

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
  onAccountsChanged: (accounts: FinancialAccount[]) => void;
  onObligationsChanged: (obligations: FinancialObligation[]) => void;
  fundingSources: FundingSource[];

  onFundingSourcesChanged: (fundingSources: FundingSource[]) => void;
};

function ReadyPersonalFinancePage({
  ledgerReplay,
  accounts,
  obligations,
  onAccountsChanged,
  onObligationsChanged,
  fundingSources,
  onFundingSourcesChanged,
}: ReadyPersonalFinancePageProps) {
  const [accountIntakeStep, setAccountIntakeStep] = useState<
    "dashboard" | "account-type" | "account-form"
  >("dashboard");

  const [accountSaveError, setAccountSaveError] = useState("");

  const [isSavingAccount, setIsSavingAccount] = useState(false);

  const [accountOperationError, setAccountOperationError] = useState("");
  const [isAddingObligation, setIsAddingObligation] = useState(false);
  const [isSavingObligation, setIsSavingObligation] = useState(false);

  const [obligationSaveError, setObligationSaveError] = useState("");

  const [selectedAccountType, setSelectedAccountType] = useState<
    FinancialAccount["accountType"] | null
  >(null);

  const [isAddingFundingSource, setIsAddingFundingSource] = useState(false);

  const [isSavingFundingSource, setIsSavingFundingSource] = useState(false);

  const [fundingSourceOperationError, setFundingSourceOperationError] =
    useState("");

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

    const obligationDueDates = activeObligations
      .map((obligation) => obligation.dueDate)
      .filter((dueDate): dueDate is string => dueDate !== undefined);

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

  function handleOpenAccountTypeSelector() {
    setSelectedAccountType(null);
    setAccountIntakeStep("account-type");

    window.requestAnimationFrame(() => {
      scrollToSection("accounts");
    });
  }

  function handleOpenObligationForm() {
    setObligationSaveError("");
    setIsAddingObligation(true);

    window.requestAnimationFrame(() => {
      scrollToSection("obligations");
    });
  }

  async function handleObligationDraft(
    draft: OperationalUtilityObligationDraft,
  ) {
    setObligationSaveError("");
    setIsSavingObligation(true);

    try {
      const repository = getOperationalFinancialObligationRepository();

      const currentObligations = await repository.load();

      const now = new Date().toISOString();

      const obligation: FinancialObligation = {
        id: crypto.randomUUID(),
        obligationType: "utility",
        name: draft.name,
        provider: draft.provider,
        status: "active",
        amountDue: draft.amountDue,
        dueDate: draft.dueDate,
        cadence: draft.cadence,
        referenceNumber: draft.referenceNumber,
        notes: draft.notes,
        createdAt: now,
        updatedAt: now,
      };

      await repository.save([...currentObligations, obligation]);

      const restoredObligations = await repository.load();

      onObligationsChanged(restoredObligations);

      setIsAddingObligation(false);
    } catch (error) {
      setObligationSaveError(
        error instanceof Error
          ? error.message
          : "The obligation could not be saved.",
      );
    } finally {
      setIsSavingObligation(false);
    }
  }

  function handleOpenFundingSourceForm() {
    setFundingSourceOperationError("");
    setIsAddingFundingSource(true);

    window.requestAnimationFrame(() => {
      scrollToSection("future-cash");
    });
  }

  async function handleFundingSourceDraft(
    draft: OperationalPaycheckFundingSourceDraft,
  ) {
    setFundingSourceOperationError("");
    setIsSavingFundingSource(true);

    try {
      const repository = getOperationalFundingSourceRepository();

      const currentFundingSources = await repository.load();

      const now = new Date().toISOString();

      const fundingSource: FundingSource = {
        id: crypto.randomUUID(),
        fundingSourceType: "paycheck",
        title: draft.title,
        employerName: draft.employerName,
        amount: draft.amount,
        expectedOn: draft.expectedOn,
        status: "planned",
        createdAt: now,
        updatedAt: now,
        notes: draft.notes,
      };

      await repository.save([...currentFundingSources, fundingSource]);

      const restoredFundingSources = await repository.load();

      onFundingSourcesChanged(restoredFundingSources);

      setIsAddingFundingSource(false);
    } catch (error) {
      setFundingSourceOperationError(
        error instanceof Error
          ? error.message
          : "The future cash source could not be saved.",
      );
    } finally {
      setIsSavingFundingSource(false);
    }
  }

  async function handleRemoveFundingSource(fundingSourceId: string) {
    setFundingSourceOperationError("");

    try {
      const repository = getOperationalFundingSourceRepository();

      const currentFundingSources = await repository.load();

      const updatedFundingSources = currentFundingSources.filter(
        (source) => source.id !== fundingSourceId,
      );

      await repository.save(updatedFundingSources);

      const restoredFundingSources = await repository.load();

      onFundingSourcesChanged(restoredFundingSources);
    } catch (error) {
      setFundingSourceOperationError(
        error instanceof Error
          ? error.message
          : "The future cash source could not be removed.",
      );
    }
  }

  async function handleAccountDraft(draft: OperationalAccountDraft) {
    setAccountSaveError("");
    setIsSavingAccount(true);

    try {
      const repository = getOperationalFinancialAccountRepository();

      const currentAccounts = await repository.load();
      const now = new Date().toISOString();

      const commonFields = {
        id: crypto.randomUUID(),
        name: draft.name,
        institutionName: draft.institutionName,
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
        accountSuffix: draft.accountSuffix,
        notes: draft.notes,
      };

      let account: FinancialAccount;

      switch (draft.accountType) {
        case "checking":
          account = {
            ...commonFields,
            accountType: "checking",
            currentBalance: draft.currentBalance,
          };
          break;

        case "savings":
          account = {
            ...commonFields,
            accountType: "savings",
            currentBalance: draft.currentBalance,
          };
          break;

        case "credit-card":
          account = {
            ...commonFields,
            accountType: "credit-card",
            currentBalance: draft.currentBalance,
            creditLimit: draft.creditLimit,
            minimumPayment: draft.minimumPayment,
            paymentDueDate: draft.paymentDueDate,
            statementDate: draft.statementDate,
            aprPercent: draft.aprPercent,
          };
          break;

        case "loan":
          account = {
            ...commonFields,
            accountType: "loan",
            currentPrincipal: draft.currentPrincipal,
            originalPrincipal: draft.originalPrincipal,
            minimumPayment: draft.minimumPayment,
            paymentDueDate: draft.paymentDueDate,
            interestRatePercent: draft.interestRatePercent,
            maturityDate: draft.maturityDate,
          };
          break;
      }

      await repository.save([...currentAccounts, account]);

      const restoredAccounts = await repository.load();

      onAccountsChanged(restoredAccounts);

      setSelectedAccountType(null);
      setAccountIntakeStep("dashboard");
    } catch (error) {
      setAccountSaveError(
        error instanceof Error
          ? error.message
          : "The account could not be saved.",
      );
    } finally {
      setIsSavingAccount(false);
    }
  }

  async function handleRemoveAccount(accountId: string) {
    setAccountOperationError("");

    try {
      const repository = getOperationalFinancialAccountRepository();

      const currentAccounts = await repository.load();

      const updatedAccounts = currentAccounts.filter(
        (account) => account.id !== accountId,
      );

      await repository.save(updatedAccounts);

      const restoredAccounts = await repository.load();

      onAccountsChanged(restoredAccounts);
    } catch (error) {
      setAccountOperationError(
        error instanceof Error
          ? error.message
          : "The account could not be removed.",
      );
    }
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
                "Create a checking, savings, credit card, or loan account.",
              emphasis: "primary",
              onClick: handleOpenAccountTypeSelector,
            },
            {
              id: "add-obligation",
              label: "Add obligation",
              description: "Create a recurring utility payment obligation.",
              onClick: handleOpenObligationForm,
            },
            {
              id: "add-future-cash",
              label: "Add future cash",
              description: "Record an expected paycheck for future funding.",
              onClick: handleOpenFundingSourceForm,
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
              {accountIntakeStep === "account-type" ? (
                <OperationalAccountTypeSelector
                  onBack={() => setAccountIntakeStep("dashboard")}
                  onContinue={(accountType) => {
                    setSelectedAccountType(accountType);
                    setAccountIntakeStep("account-form");
                  }}
                />
              ) : accountIntakeStep === "account-form" &&
                selectedAccountType ? (
                <>
                  <OperationalAccountForm
                    accountType={selectedAccountType}
                    onBack={() => setAccountIntakeStep("account-type")}
                    onCancel={() => {
                      setSelectedAccountType(null);
                      setAccountIntakeStep("dashboard");
                      setAccountSaveError("");
                    }}
                    onSubmit={(draft) => {
                      if (!isSavingAccount) {
                        void handleAccountDraft(draft);
                      }
                    }}
                  />

                  {isSavingAccount ? (
                    <p className="operational-account-form__status">
                      Saving operational account…
                    </p>
                  ) : null}

                  {accountSaveError ? (
                    <p className="operational-account-form__error">
                      {accountSaveError}
                    </p>
                  ) : null}
                </>
              ) : hasAccounts ? (
                <>
                  <OperationalFinancialAccountsView
                    accounts={accounts}
                    onAddAccount={handleOpenAccountTypeSelector}
                    onRemoveAccount={(accountId) => {
                      void handleRemoveAccount(accountId);
                    }}
                  />

                  {accountOperationError ? (
                    <p className="operational-account-form__error">
                      {accountOperationError}
                    </p>
                  ) : null}
                </>
              ) : (
                <div className="personal-finance-page__empty-product">
                  <strong>No financial accounts entered</strong>

                  <p>
                    No demo accounts or statement snapshots were loaded. Your
                    first checking, savings, credit card, or loan account must
                    be added intentionally.
                  </p>

                  <button type="button" onClick={handleOpenAccountTypeSelector}>
                    Add your first account
                  </button>
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
            {isAddingObligation ? (
              <>
                <OperationalObligationForm
                  onCancel={() => {
                    setIsAddingObligation(false);
                    setObligationSaveError("");
                  }}
                  onSubmit={(draft) => {
                    if (!isSavingObligation) {
                      void handleObligationDraft(draft);
                    }
                  }}
                />

                {isSavingObligation ? (
                  <p className="operational-obligation-form__status">
                    Saving operational obligation…
                  </p>
                ) : null}

                {obligationSaveError ? (
                  <p className="operational-obligation-form__error">
                    {obligationSaveError}
                  </p>
                ) : null}
              </>
            ) : hasObligations ? (
              <div className="personal-finance-page__empty-product">
                <strong>
                  {operationalOverview.activeObligationCount} operational{" "}
                  {operationalOverview.activeObligationCount === 1
                    ? "obligation is"
                    : "obligations are"}{" "}
                  persisted
                </strong>

                <p>
                  The obligation was restored from operational storage. The full
                  obligation workspace will be added in the next commit.
                </p>

                <button type="button" onClick={handleOpenObligationForm}>
                  Add another obligation
                </button>
              </div>
            ) : (
              <div className="personal-finance-page__empty-product">
                <strong>No financial obligations entered</strong>

                <p>
                  Utility bills and future recurring obligations will appear
                  here only after they are intentionally created.
                </p>

                <button type="button" onClick={handleOpenObligationForm}>
                  Add your first obligation
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="personal-finance-page__section" id="future-cash">
          <div className="personal-finance-page__section-heading">
            <div>
              <h2>Future cash sources</h2>

              <p>
                Track expected incoming cash separately from your replay-derived
                current cash position.
              </p>
            </div>
          </div>

          <div className="personal-finance-page__surface">
            <section className="finance-workspace finance-workspace--product">
              {isAddingFundingSource ? (
                <>
                  <OperationalFundingSourceForm
                    onCancel={() => {
                      setIsAddingFundingSource(false);
                      setFundingSourceOperationError("");
                    }}
                    onSubmit={(draft) => {
                      if (!isSavingFundingSource) {
                        void handleFundingSourceDraft(draft);
                      }
                    }}
                  />

                  {isSavingFundingSource ? (
                    <p className="operational-funding-source-form__status">
                      Saving future cash source…
                    </p>
                  ) : null}
                </>
              ) : fundingSources.length > 0 ? (
                <OperationalFundingSourcesView
                  fundingSources={fundingSources}
                  onAddFundingSource={handleOpenFundingSourceForm}
                  onRemoveFundingSource={(fundingSourceId) => {
                    void handleRemoveFundingSource(fundingSourceId);
                  }}
                />
              ) : (
                <div className="personal-finance-page__empty-product">
                  <strong>No future cash sources entered</strong>

                  <p>
                    Add an expected paycheck to begin establishing the future
                    cash available for funding obligations.
                  </p>

                  <button type="button" onClick={handleOpenFundingSourceForm}>
                    Add your first paycheck
                  </button>
                </div>
              )}

              {fundingSourceOperationError ? (
                <p className="operational-funding-source-form__error">
                  {fundingSourceOperationError}
                </p>
              ) : null}
            </section>
          </div>
        </section>
        <section className="personal-finance-page__section" id="funding-plan">
          <div className="personal-finance-page__section-heading">
            <div>
              <h2>Operational funding plan</h2>

              <p>
                Evaluate whether current and expected cash can fund known dated
                obligations while protecting a selected cash reserve.
              </p>
            </div>
          </div>

          <div className="personal-finance-page__surface">
            <section className="finance-workspace finance-workspace--product">
              <OperationalFundingPlanView
                currentCash={ledgerReplay.currentCash}
                accounts={accounts}
                obligations={obligations}
                fundingSources={fundingSources}
              />
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
  fundingSources: FundingSource[];
};

type OperationalSessionState =
  | {
      status: "loading";
    }
  | {
      status: "first-run";
      accounts: FinancialAccount[];
      obligations: FinancialObligation[];
      fundingSources: FundingSource[];
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

        const fundingSourceRepository = getOperationalFundingSourceRepository();

        const [ledgerEvents, accounts, obligations, fundingSources] =
          await Promise.all([
            ledgerRepository.load(),
            accountRepository.load(),
            obligationRepository.load(),
            fundingSourceRepository.load(),
          ]);

        if (!isCurrent) {
          return;
        }

        if (ledgerEvents.length === 0) {
          setSessionState({
            status: "first-run",
            accounts,
            obligations,
            fundingSources,
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
          fundingSources,
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
              fundingSources: sessionState.fundingSources,
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
      fundingSources={sessionState.fundingSources}
      onAccountsChanged={(accounts) => {
        setSessionState((current) => {
          if (current.status !== "ready") {
            return current;
          }

          return {
            ...current,
            accounts,
          };
        });
      }}
      onObligationsChanged={(obligations) => {
        setSessionState((current) => {
          if (current.status !== "ready") {
            return current;
          }

          return {
            ...current,
            obligations,
          };
        });
      }}
      onFundingSourcesChanged={(fundingSources) => {
        setSessionState((current) => {
          if (current.status !== "ready") {
            return current;
          }

          return {
            ...current,
            fundingSources,
          };
        });
      }}
    />
  );
}
