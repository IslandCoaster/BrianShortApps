import type { FinancialAccount } from "../../accounts/financialAccount";
import type { OperationalFundingPlan } from "../../funding/operationalFundingEngine";
import { PROJECTION_ENTRY_PRIORITY } from "./projectionEntryPriority";
import { buildSettlementProjection } from "./settlementProjection";

function assertEqual<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(
      `${label}: expected ${String(expected)}, received ${String(actual)}.`,
    );
  }
}

export function verifySettlementProjection(): void {
  const checkingAccount: FinancialAccount = {
    id: "checking-1",
    accountType: "checking",
    name: "Primary Checking",
    institutionName: "Example Bank",
    status: "active",
    currentBalance: 500,
    createdAt: "2026-07-15T12:00:00.000Z",
    updatedAt: "2026-07-15T12:00:00.000Z",
  };

  const creditCard: FinancialAccount = {
    id: "card-1",
    accountType: "credit-card",
    name: "Apple Card",
    institutionName: "Goldman Sachs",
    status: "active",
    currentBalance: 1200,
    minimumPayment: 450,
    paymentDueDate: "2026-07-23",
    settlementAccountId: checkingAccount.id,
    createdAt: "2026-07-15T12:00:00.000Z",
    updatedAt: "2026-07-15T12:00:00.000Z",
  };

  const unroutedLoan: FinancialAccount = {
    id: "loan-1",
    accountType: "loan",
    name: "Personal Loan",
    institutionName: "Example Lender",
    status: "active",
    currentPrincipal: 5000,
    minimumPayment: 200,
    paymentDueDate: "2026-07-26",
    createdAt: "2026-07-15T12:00:00.000Z",
    updatedAt: "2026-07-15T12:00:00.000Z",
  };

  const fundingPlan: OperationalFundingPlan = {
    planningDate: "2026-07-15",
    position: {
      currentCash: 500,
      plannedFutureCash: 1000,
      grossAvailableCash: 1500,
      protectedCash: 0,
      deployableCash: 1500,
      allocatedCash: 650,
      fundingBuffer: 850,
      unresolvedAmount: 0,
    },
    items: [
      {
        requirementId: creditCard.id,
        requirementType: "debt-account",
        name: creditCard.name,
        counterparty: creditCard.institutionName,
        dueDate: "2026-07-23",
        requestedAmount: 450,
        allocatedAmount: 450,
        fundedAmountByDueDate: 450,
        fundingStatus: "funded-by-due-date",
        fullyFundedOn: "2026-07-18",
        isPastDue: false,
        allocations: [
          {
            availableOn: "2026-07-18",
            paymentDate: "2026-07-23",
            amount: 450,
            fundingSourceId: "paycheck-1",
          },
        ],
      },
      {
        requirementId: unroutedLoan.id,
        requirementType: "debt-account",
        name: unroutedLoan.name,
        counterparty: unroutedLoan.institutionName,
        dueDate: "2026-07-26",
        requestedAmount: 200,
        allocatedAmount: 200,
        fundedAmountByDueDate: 200,
        fundingStatus: "funded-by-due-date",
        fullyFundedOn: "2026-07-18",
        isPastDue: false,
        allocations: [
          {
            availableOn: "2026-07-18",
            paymentDate: "2026-07-26",
            amount: 200,
            fundingSourceId: "paycheck-1",
          },
        ],
      },
      {
        requirementId: "utility-1",
        requirementType: "financial-obligation",
        name: "Electric Bill",
        counterparty: "Example Utility",
        dueDate: "2026-07-28",
        requestedAmount: 150,
        allocatedAmount: 150,
        fundedAmountByDueDate: 150,
        fundingStatus: "funded-by-due-date",
        fullyFundedOn: "2026-07-18",
        isPastDue: false,
        allocations: [
          {
            availableOn: "2026-07-18",
            paymentDate: "2026-07-28",
            amount: 150,
            fundingSourceId: "paycheck-1",
          },
        ],
      },
    ],
    excludedRequirements: [],
  };

  const result = buildSettlementProjection({
    accounts: [checkingAccount, creditCard, unroutedLoan],
    fundingPlan,
  });

  assertEqual(
    result.entries.length,
    1,
    "Only routed debt settlement produces an entry",
  );

  const entry = result.entries[0];

  assertEqual(
    entry?.accountId,
    checkingAccount.id,
    "Settlement targets assigned asset account",
  );

  assertEqual(
    entry?.entryType,
    "planned-settlement",
    "Settlement entry type",
  );

  assertEqual(entry?.amount, -450, "Settlement amount is negative");

  assertEqual(
    entry?.occurredOn,
    "2026-07-23",
    "Settlement uses planned payment date",
  );

  assertEqual(
    entry?.sourceId,
    creditCard.id,
    "Settlement retains debt-account identity",
  );

  assertEqual(
    entry?.priority,
    PROJECTION_ENTRY_PRIORITY.plannedSettlement,
    "Settlement priority",
  );

  assertEqual(
    result.issues.some(
      (issue) =>
        issue.code === "missing-routing" &&
        issue.sourceId === unroutedLoan.id,
    ),
    true,
    "Missing settlement routing is reported",
  );

  assertEqual(
    result.entries.some(
      (candidate) => candidate.sourceId === "utility-1",
    ),
    false,
    "Financial obligations remain excluded",
  );

  assertEqual(
    result.canProjectAllDebtSettlements,
    false,
    "Missing debt routing prevents complete settlement projection",
  );

  const partialPlan: OperationalFundingPlan = {
    ...fundingPlan,
    items: [
      {
        ...fundingPlan.items[0]!,
        allocatedAmount: 225,
        fundedAmountByDueDate: 225,
        fundingStatus: "partially-funded",
        fullyFundedOn: undefined,
        allocations: [
          {
            availableOn: "2026-07-18",
            paymentDate: "2026-07-23",
            amount: 225,
            fundingSourceId: "paycheck-1",
          },
        ],
      },
    ],
  };

  const partialResult = buildSettlementProjection({
    accounts: [checkingAccount, creditCard],
    fundingPlan: partialPlan,
  });

  assertEqual(
    partialResult.entries[0]?.amount,
    -225,
    "Partial funding projects only allocated amount",
  );

  assertEqual(
    partialResult.entries[0]?.status,
    "partially-funded",
    "Partial settlement retains funding status",
  );
}
