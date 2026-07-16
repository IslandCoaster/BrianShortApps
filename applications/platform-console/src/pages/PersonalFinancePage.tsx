import { useEffect, useMemo, useState } from "react";
import {
  buildAssetAccountProjection,
  buildOperationalFundingPlan,
  createFinancialLedgerEvent,
  getFinancialAccountBalance,
  isAssetFinancialAccount,
  replayFinancialLedgerEvents,
  type FinancialAccount,
  type FinancialLedgerEvent,
  type FinancialLedgerReplayState,
  type FinancialObligation,
  type FundingDepositAllocation,
  type FundingSource,
  type AssetFinancialAccount,
  type OperationalFundingPlan,
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

import { OperationalAccountProjectionView } from "../experiences/finance-workspace/OperationalAccountProjectionView";
import {
  OperationalFundingSourceForm,
  type OperationalPaycheckFundingSourceDraft,
} from "../experiences/finance-workspace/OperationalFundingSourceForm";

import { OperationalFundingSourcesView } from "../experiences/finance-workspace/OperationalFundingSourcesView";
import { OperationalFundingPlanView } from "../experiences/finance-workspace/OperationalFundingPlanView";
import { OperationalFinancialObligationsView } from "../experiences/finance-workspace/OperationalFinancialObligationsView";

import { getOperationalFundingDepositAllocationRepository } from "../experiences/finance-workspace/operationalFundingDepositAllocationRepository";

import {
  OperationalFundingDestinationEditor,
  type FundingDestinationDraft,
} from "../experiences/finance-workspace/OperationalFundingDestinationEditor";

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

function parseNonNegativeAmount(value: string): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? Math.max(parsed, 0) : 0;
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
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
  fundingSources: FundingSource[];
  fundingDepositAllocations: FundingDepositAllocation[];

  onAccountsChanged: (accounts: FinancialAccount[]) => void;
  onObligationsChanged: (obligations: FinancialObligation[]) => void;
  onFundingSourcesChanged: (fundingSources: FundingSource[]) => void;
  onFundingDepositAllocationsChanged: (
    allocations: FundingDepositAllocation[],
  ) => void;
};

function ReadyPersonalFinancePage({
  ledgerReplay,
  accounts,
  obligations,
  fundingSources,
  fundingDepositAllocations,
  onAccountsChanged,
  onObligationsChanged,
  onFundingSourcesChanged,
  onFundingDepositAllocationsChanged,
}: ReadyPersonalFinancePageProps) {
  const [accountIntakeStep, setAccountIntakeStep] = useState<
    "dashboard" | "account-type" | "account-form"
  >("dashboard");

  const [accountSaveError, setAccountSaveError] = useState("");

  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [minimumCashReserveInput, setMinimumCashReserveInput] = useState("0");
  const [accountOperationError, setAccountOperationError] = useState("");
  const [isAddingObligation, setIsAddingObligation] = useState(false);
  const [isSavingObligation, setIsSavingObligation] = useState(false);

  const [obligationSaveError, setObligationSaveError] = useState("");

  const [obligationOperationError, setObligationOperationError] = useState("");

  const [selectedAccountType, setSelectedAccountType] = useState<
    FinancialAccount["accountType"] | null
  >(null);

  const [isAddingFundingSource, setIsAddingFundingSource] = useState(false);

  const [isSavingFundingSource, setIsSavingFundingSource] = useState(false);

  const [fundingSourceOperationError, setFundingSourceOperationError] =
    useState("");

  const [selectedFundingSourceId, setSelectedFundingSourceId] = useState<
    string | null
  >(null);

  const [isSavingFundingDestinations, setIsSavingFundingDestinations] =
    useState(false);

  const [
    fundingDestinationOperationError,
    setFundingDestinationOperationError,
  ] = useState("");

  const selectedFundingSource = fundingSources.find(
    (source) => source.id === selectedFundingSourceId,
  );

  const operationalFundingPlan = useMemo<OperationalFundingPlan>(
    () =>
      buildOperationalFundingPlan({
        planningDate: getTodayDate(),
        currentCash: ledgerReplay.currentCash,
        minimumCashReserve: parseNonNegativeAmount(minimumCashReserveInput),
        accounts,
        obligations,
        fundingSources,
      }),
    [
      accounts,
      fundingSources,
      ledgerReplay.currentCash,
      minimumCashReserveInput,
      obligations,
    ],
  );
  const assetAccountProjection = useMemo(
    () =>
      buildAssetAccountProjection({
        accounts,
        fundingSources,
        allocations: fundingDepositAllocations,
        fundingPlan: operationalFundingPlan,
      }),
    [
      accounts,
      fundingDepositAllocations,
      fundingSources,
      operationalFundingPlan,
    ],
  );

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

  const activeAssetAccounts = accounts.filter(
    (account): account is AssetFinancialAccount =>
      isOperationalAccountActive(account) && isAssetFinancialAccount(account),
  );

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
    setObligationOperationError("");
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

  async function handleRemoveObligation(obligationId: string) {
    setObligationOperationError("");

    try {
      const repository = getOperationalFinancialObligationRepository();

      const currentObligations = await repository.load();

      const updatedObligations = currentObligations.filter(
        (obligation) => obligation.id !== obligationId,
      );

      await repository.save(updatedObligations);

      const restoredObligations = await repository.load();

      onObligationsChanged(restoredObligations);
    } catch (error) {
      setObligationOperationError(
        error instanceof Error
          ? error.message
          : "The obligation could not be removed.",
      );
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

  async function handleSaveFundingDestinations(
    fundingSourceId: string,
    drafts: FundingDestinationDraft[],
  ) {
    setFundingDestinationOperationError("");
    setIsSavingFundingDestinations(true);

    try {
      const repository = getOperationalFundingDepositAllocationRepository();

      const currentAllocations = await repository.load();

      const existingSourceAllocations = currentAllocations.filter(
        (allocation) => allocation.fundingSourceId === fundingSourceId,
      );

      const retainedAllocations = currentAllocations.filter(
        (allocation) => allocation.fundingSourceId !== fundingSourceId,
      );

      const existingByDestination = new Map(
        existingSourceAllocations.map((allocation) => [
          allocation.destinationAccountId,
          allocation,
        ]),
      );

      const now = new Date().toISOString();

      const replacementAllocations: FundingDepositAllocation[] = drafts.map(
        (draft) => {
          const existing = existingByDestination.get(
            draft.destinationAccountId,
          );

          return {
            id: existing?.id ?? crypto.randomUUID(),
            fundingSourceId,
            destinationAccountId: draft.destinationAccountId,
            amount: draft.amount,
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
            notes: existing?.notes,
          };
        },
      );

      await repository.save([
        ...retainedAllocations,
        ...replacementAllocations,
      ]);

      const restoredAllocations = await repository.load();

      onFundingDepositAllocationsChanged(restoredAllocations);

      setSelectedFundingSourceId(null);
    } catch (error) {
      setFundingDestinationOperationError(
        error instanceof Error
          ? error.message
          : "The funding destinations could not be saved.",
      );
    } finally {
      setIsSavingFundingDestinations(false);
    }
  }

  async function handleRemoveFundingSource(fundingSourceId: string) {
    setFundingSourceOperationError("");

    try {
      const fundingSourceRepository = getOperationalFundingSourceRepository();

      const allocationRepository =
        getOperationalFundingDepositAllocationRepository();

      const [currentFundingSources, currentAllocations] = await Promise.all([
        fundingSourceRepository.load(),
        allocationRepository.load(),
      ]);

      await Promise.all([
        fundingSourceRepository.save(
          currentFundingSources.filter(
            (source) => source.id !== fundingSourceId,
          ),
        ),
        allocationRepository.save(
          currentAllocations.filter(
            (allocation) => allocation.fundingSourceId !== fundingSourceId,
          ),
        ),
      ]);

      const [restoredFundingSources, restoredAllocations] = await Promise.all([
        fundingSourceRepository.load(),
        allocationRepository.load(),
      ]);

      onFundingSourcesChanged(restoredFundingSources);
      onFundingDepositAllocationsChanged(restoredAllocations);

      if (selectedFundingSourceId === fundingSourceId) {
        setSelectedFundingSourceId(null);
      }
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
            recommendedMinimumBuffer: draft.recommendedMinimumBuffer,
          };
          break;

        case "savings":
          account = {
            ...commonFields,
            accountType: "savings",
            currentBalance: draft.currentBalance,
            recommendedMinimumBuffer: draft.recommendedMinimumBuffer,
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
            settlementAccountId: draft.settlementAccountId,
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
            settlementAccountId: draft.settlementAccountId,
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
                    assetAccounts={activeAssetAccounts}
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

        <section
          className="personal-finance-page__section"
          id="account-projections"
        >
          <div className="personal-finance-page__section-heading">
            <div>
              <h2>Account projections</h2>

              <p>
                Review how valid routed future deposits change each checking and
                savings account over time.
              </p>
            </div>
          </div>

          <div className="personal-finance-page__surface">
            <section className="finance-workspace finance-workspace--product">
              <OperationalAccountProjectionView
                projection={assetAccountProjection}
              />
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
              <>
                <OperationalFinancialObligationsView
                  obligations={obligations}
                  onAddObligation={handleOpenObligationForm}
                  onRemoveObligation={(obligationId) => {
                    void handleRemoveObligation(obligationId);
                  }}
                />

                {obligationOperationError ? (
                  <p className="operational-obligation-form__error">
                    {obligationOperationError}
                  </p>
                ) : null}
              </>
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
              {selectedFundingSource ? (
                <OperationalFundingDestinationEditor
                  key={selectedFundingSource.id}
                  fundingSource={selectedFundingSource}
                  accounts={accounts}
                  existingAllocations={fundingDepositAllocations.filter(
                    (allocation) =>
                      allocation.fundingSourceId === selectedFundingSource.id,
                  )}
                  isSaving={isSavingFundingDestinations}
                  operationError={fundingDestinationOperationError}
                  onCancel={() => {
                    setSelectedFundingSourceId(null);
                    setFundingDestinationOperationError("");
                  }}
                  onSave={(drafts) => {
                    void handleSaveFundingDestinations(
                      selectedFundingSource.id,
                      drafts,
                    );
                  }}
                />
              ) : isAddingFundingSource ? (
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
                  accounts={accounts}
                  allocations={fundingDepositAllocations}
                  onAddFundingSource={handleOpenFundingSourceForm}
                  onAssignDestinations={(fundingSourceId) => {
                    setFundingDestinationOperationError("");
                    setSelectedFundingSourceId(fundingSourceId);
                  }}
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
                plan={operationalFundingPlan}
                fundingSources={fundingSources}
                minimumCashReserveInput={minimumCashReserveInput}
                onMinimumCashReserveChange={setMinimumCashReserveInput}
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
  fundingDepositAllocations: FundingDepositAllocation[];
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
      fundingDepositAllocations: FundingDepositAllocation[];
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

        const fundingDepositAllocationRepository =
          getOperationalFundingDepositAllocationRepository();

        const [
          ledgerEvents,
          accounts,
          obligations,
          fundingSources,
          fundingDepositAllocations,
        ] = await Promise.all([
          ledgerRepository.load(),
          accountRepository.load(),
          obligationRepository.load(),
          fundingSourceRepository.load(),
          fundingDepositAllocationRepository.load(),
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
            fundingDepositAllocations,
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
          fundingDepositAllocations,
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
              fundingDepositAllocations: sessionState.fundingDepositAllocations,
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
      fundingDepositAllocations={sessionState.fundingDepositAllocations}
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
      onFundingDepositAllocationsChanged={(fundingDepositAllocations) => {
        setSessionState((current) => {
          if (current.status !== "ready") {
            return current;
          }

          return {
            ...current,
            fundingDepositAllocations,
          };
        });
      }}
    />
  );
}
