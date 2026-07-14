import type { FinancialAccount } from "../accounts/financialAccount";
import type { FundingDepositAllocation } from "../funding/fundingDepositAllocation";
import type { FundingSource } from "../funding/fundingSource";
import { buildAssetAccountProjection } from "./assetAccountProjection";

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
}