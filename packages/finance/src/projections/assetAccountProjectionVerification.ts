import type { FinancialAccount } from "../accounts/financialAccount";
import type { FundingDepositAllocation } from "../funding/fundingDepositAllocation";
import type { FundingSource } from "../funding/fundingSource";
import { buildAssetAccountProjection } from "./assetAccountProjection";
import type { OperationalFundingPlan } from "../funding/operationalFundingEngine";

function assertEqual<T>(
  actual: T,
  expected: T,
  label: string,
): void {
  if (actual !== expected) {
    throw new Error(
      `${label}: expected ${String(expected)}, received ${String(actual)}.`,
    );
  }
}

export function verifyAssetAccountProjection(): void {
  const checkingAccount: FinancialAccount = {
    id: "checking-1",
    accountType: "checking",
    name: "Primary Checking",
    institutionName: "Example Bank",
    status: "active",
    currentBalance: 47.15,
    createdAt:
      "2026-07-14T12:00:00.000Z",
    updatedAt:
      "2026-07-14T12:00:00.000Z",
  };

  const savingsAccount: FinancialAccount = {
    id: "savings-1",
    accountType: "savings",
    name: "Primary Savings",
    institutionName: "Example Bank",
    status: "active",
    currentBalance: 500,
    createdAt:
      "2026-07-14T12:00:00.000Z",
    updatedAt:
      "2026-07-14T12:00:00.000Z",
  };

  const creditCardAccount: FinancialAccount = {
    id: "credit-card-1",
    accountType: "credit-card",
    name: "Primary Card",
    institutionName: "Example Bank",
    status: "active",
    currentBalance: 900,
    createdAt:
      "2026-07-14T12:00:00.000Z",
    updatedAt:
      "2026-07-14T12:00:00.000Z",
  };

  const firstPaycheck: FundingSource = {
    id: "paycheck-1",
    fundingSourceType: "paycheck",
    title: "First Paycheck",
    employerName: "Example Employer",
    amount: 1000,
    expectedOn: "2026-07-15",
    status: "planned",
    createdAt:
      "2026-07-14T12:00:00.000Z",
    updatedAt:
      "2026-07-14T12:00:00.000Z",
  };

  const secondPaycheck: FundingSource = {
    id: "paycheck-2",
    fundingSourceType: "paycheck",
    title: "Second Paycheck",
    employerName: "Example Employer",
    amount: 500,
    expectedOn: "2026-07-30",
    status: "planned",
    createdAt:
      "2026-07-14T12:01:00.000Z",
    updatedAt:
      "2026-07-14T12:01:00.000Z",
  };

  const partialRefund: FundingSource = {
    id: "refund-1",
    fundingSourceType: "refund",
    title: "Partial Refund",
    amount: 100,
    expectedOn: "2026-07-20",
    status: "planned",
    createdAt:
      "2026-07-14T12:02:00.000Z",
    updatedAt:
      "2026-07-14T12:02:00.000Z",
  };

  const receivedDeposit: FundingSource = {
    id: "received-deposit",
    fundingSourceType: "deposit",
    title: "Already Received Deposit",
    amount: 300,
    expectedOn: "2026-07-14",
    status: "received",
    createdAt:
      "2026-07-14T12:03:00.000Z",
    updatedAt:
      "2026-07-14T12:03:00.000Z",
  };

  const allocations:
    FundingDepositAllocation[] = [
    {
      id: "allocation-1-checking",
      fundingSourceId:
        firstPaycheck.id,
      destinationAccountId:
        checkingAccount.id,
      amount: 800,
      createdAt:
        "2026-07-14T12:00:00.000Z",
      updatedAt:
        "2026-07-14T12:00:00.000Z",
    },
    {
      id: "allocation-1-savings",
      fundingSourceId:
        firstPaycheck.id,
      destinationAccountId:
        savingsAccount.id,
      amount: 200,
      createdAt:
        "2026-07-14T12:00:00.000Z",
      updatedAt:
        "2026-07-14T12:00:00.000Z",
    },
    {
      id: "allocation-2-checking",
      fundingSourceId:
        secondPaycheck.id,
      destinationAccountId:
        checkingAccount.id,
      amount: 500,
      createdAt:
        "2026-07-14T12:01:00.000Z",
      updatedAt:
        "2026-07-14T12:01:00.000Z",
    },
    {
      id: "allocation-refund-partial",
      fundingSourceId:
        partialRefund.id,
      destinationAccountId:
        checkingAccount.id,
      amount: 50,
      createdAt:
        "2026-07-14T12:02:00.000Z",
      updatedAt:
        "2026-07-14T12:02:00.000Z",
    },
    {
      id: "allocation-received",
      fundingSourceId:
        receivedDeposit.id,
      destinationAccountId:
        checkingAccount.id,
      amount: 300,
      createdAt:
        "2026-07-14T12:03:00.000Z",
      updatedAt:
        "2026-07-14T12:03:00.000Z",
    },
  ];

  const fundingPlan: OperationalFundingPlan = {
  planningDate: "2026-07-14",
  position: {
    currentCash: 0,
    plannedFutureCash: 1500,
    grossAvailableCash: 1500,
    protectedCash: 0,
    deployableCash: 1500,
    allocatedCash: 0,
    fundingBuffer: 1500,
    unresolvedAmount: 0,
  },
  items: [],
  excludedRequirements: [],
};

  const projection =
  buildAssetAccountProjection({
    accounts: [
      checkingAccount,
      savingsAccount,
      creditCardAccount,
    ],
    fundingSources: [
      firstPaycheck,
      secondPaycheck,
      partialRefund,
      receivedDeposit,
    ],
    allocations,
    fundingPlan,
  });

  assertEqual(
    projection.accounts.length,
    2,
    "Only active asset accounts are projected",
  );

  const checkingProjection =
    projection.accounts.find(
      (account) =>
        account.accountId ===
        checkingAccount.id,
    );

  const savingsProjection =
    projection.accounts.find(
      (account) =>
        account.accountId ===
        savingsAccount.id,
    );

    const overdraftCheckingAccount: FinancialAccount = {
  id: "checking-overdraft",
  accountType: "checking",
  name: "Overdraft Checking",
  institutionName: "Example Bank",
  status: "active",
  currentBalance: 100,
  createdAt: "2026-07-14T12:00:00.000Z",
  updatedAt: "2026-07-14T12:00:00.000Z",
};

const overdraftCreditCard: FinancialAccount = {
  id: "card-overdraft",
  accountType: "credit-card",
  name: "Overdraft Card",
  institutionName: "Example Issuer",
  status: "active",
  currentBalance: 500,
  minimumPayment: 300,
  paymentDueDate: "2026-07-23",
  settlementAccountId: overdraftCheckingAccount.id,
  createdAt: "2026-07-14T12:00:00.000Z",
  updatedAt: "2026-07-14T12:00:00.000Z",
};

const overdraftFundingPlan: OperationalFundingPlan = {
  planningDate: "2026-07-14",
  position: {
    currentCash: 300,
    plannedFutureCash: 0,
    grossAvailableCash: 300,
    protectedCash: 0,
    deployableCash: 300,
    allocatedCash: 300,
    fundingBuffer: 0,
    unresolvedAmount: 0,
  },
  items: [
    {
      requirementId: overdraftCreditCard.id,
      requirementType: "debt-account",
      name: overdraftCreditCard.name,
      counterparty: overdraftCreditCard.institutionName,
      dueDate: "2026-07-23",
      requestedAmount: 300,
      allocatedAmount: 300,
      fundedAmountByDueDate: 300,
      fundingStatus: "funded-by-due-date",
      fullyFundedOn: "2026-07-14",
      isPastDue: false,
      allocations: [
        {
          availableOn: "2026-07-14",
          paymentDate: "2026-07-23",
          amount: 300,
          fundingSourceId: "replay-current-cash",
        },
      ],
    },
  ],
  excludedRequirements: [],
};

const overdraftProjection = buildAssetAccountProjection({
  accounts: [
    overdraftCheckingAccount,
    overdraftCreditCard,
  ],
  fundingSources: [],
  allocations: [],
  fundingPlan: overdraftFundingPlan,
});

  assertEqual(
    checkingProjection?.openingBalance,
    47.15,
    "Checking opening balance",
  );

  assertEqual(
    checkingProjection?.entries.length,
    2,
    "Only fully routed planned deposits reach checking",
  );

  assertEqual(
    checkingProjection?.entries[0]
      ?.fundingSourceId,
    firstPaycheck.id,
    "First checking deposit order",
  );

  assertEqual(
    checkingProjection?.entries[0]
      ?.runningBalance,
    847.15,
    "Checking first running balance",
  );

  assertEqual(
    checkingProjection?.entries[1]
      ?.fundingSourceId,
    secondPaycheck.id,
    "Second checking deposit order",
  );

  assertEqual(
    checkingProjection?.closingBalance,
    1347.15,
    "Checking closing balance",
  );

  assertEqual(
    checkingProjection?.lowestBalance,
    47.15,
    "Checking lowest balance",
  );

  assertEqual(
    savingsProjection?.closingBalance,
    700,
    "Savings closing balance",
  );

  assertEqual(
    projection.blockedFundingSources.length,
    1,
    "Partially routed planned source is blocked",
  );

  assertEqual(
    projection.blockedFundingSources[0]
      ?.fundingSourceId,
    partialRefund.id,
    "Blocked source identity",
  );

  assertEqual(
    projection.blockedFundingSources[0]
      ?.status,
    "partially-allocated",
    "Blocked source status",
  );

  assertEqual(
    projection.canProjectAllPlannedFunding,
    false,
    "Incomplete routing blocks complete projection",
  );

  assertEqual(
    checkingProjection?.totalPlannedSettlements,
    0,
    "Checking has no planned settlements in deposit-only fixture",
    );

  assertEqual(
    projection.settlementIssues.length,
    0,
    "Deposit-only fixture has no settlement issues",
  );

    assertEqual(
        projection.canProjectAllDebtSettlements,
        true,
        "Empty settlement plan is fully projectable",
    );

    assertEqual(
    projection.diagnostics.blockingCount,
    1,
    "Partially routed source creates one blocking diagnostic",
  );

  assertEqual(
    projection.liquidity.accounts.length,
    projection.accounts.length,
    "Each projected asset account receives liquidity state",
  );

  assertEqual(
  projection.liquidity.accounts.every(
    (account) => account.status === "healthy",
  ),
  true,
  "Deposit-only account projections are healthy with a zero buffer",
);

assertEqual(
  projection.liquidity.hasLiquidityRisk,
  false,
  "Deposit-only fixture has no liquidity risk",
);

assertEqual(
  projection.diagnostics.attentionCount,
  0,
  "Deposit-only fixture has no attention diagnostics",
);

assertEqual(
  projection.diagnostics.canProjectCompletely,
  false,
  "Blocked funding prevents complete projection",
);

assertEqual(
  overdraftProjection.accounts[0]?.lowestBalance,
  -200,
  "Settlement replay exposes negative lowest balance",
);

assertEqual(
  overdraftProjection.liquidity.overdraftRiskCount,
  1,
  "Overdraft-risk summary count",
);

assertEqual(
  overdraftProjection.liquidity.hasLiquidityRisk,
  true,
  "Overdraft projection reports liquidity risk",
);
}