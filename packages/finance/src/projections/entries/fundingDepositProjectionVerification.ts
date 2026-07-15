import type { FinancialAccount } from "../../accounts/financialAccount";
import type { FundingDepositAllocation } from "../../funding/fundingDepositAllocation";
import type { FundingSource } from "../../funding/fundingSource";
import { PROJECTION_ENTRY_PRIORITY } from "./projectionEntryPriority";
import { buildFundingDepositProjection } from "./fundingDepositProjection";

function assertEqual<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(
      `${label}: expected ${String(expected)}, received ${String(actual)}.`,
    );
  }
}

export function verifyFundingDepositProjection(): void {
  const checkingAccount: FinancialAccount = {
    id: "checking-1",
    accountType: "checking",
    name: "Primary Checking",
    institutionName: "Example Bank",
    status: "active",
    currentBalance: 100,
    createdAt: "2026-07-15T12:00:00.000Z",
    updatedAt: "2026-07-15T12:00:00.000Z",
  };

  const savingsAccount: FinancialAccount = {
    id: "savings-1",
    accountType: "savings",
    name: "Primary Savings",
    institutionName: "Example Bank",
    status: "active",
    currentBalance: 500,
    createdAt: "2026-07-15T12:00:00.000Z",
    updatedAt: "2026-07-15T12:00:00.000Z",
  };

  const paycheck: FundingSource = {
    id: "paycheck-1",
    fundingSourceType: "paycheck",
    title: "American Airlines Paycheck",
    employerName: "American Airlines",
    amount: 1000,
    expectedOn: "2026-07-18",
    status: "planned",
    createdAt: "2026-07-15T12:00:00.000Z",
    updatedAt: "2026-07-15T12:00:00.000Z",
  };

  const partiallyRoutedRefund: FundingSource = {
    id: "refund-1",
    fundingSourceType: "refund",
    title: "Partial Refund",
    amount: 200,
    expectedOn: "2026-07-20",
    status: "planned",
    createdAt: "2026-07-15T12:01:00.000Z",
    updatedAt: "2026-07-15T12:01:00.000Z",
  };

  const receivedDeposit: FundingSource = {
    id: "received-1",
    fundingSourceType: "deposit",
    title: "Already Received",
    amount: 300,
    expectedOn: "2026-07-15",
    status: "received",
    createdAt: "2026-07-15T12:02:00.000Z",
    updatedAt: "2026-07-15T12:02:00.000Z",
  };

  const allocations: FundingDepositAllocation[] = [
    {
      id: "paycheck-checking",
      fundingSourceId: paycheck.id,
      destinationAccountId: checkingAccount.id,
      amount: 800,
      createdAt: "2026-07-15T12:00:00.000Z",
      updatedAt: "2026-07-15T12:00:00.000Z",
    },
    {
      id: "paycheck-savings",
      fundingSourceId: paycheck.id,
      destinationAccountId: savingsAccount.id,
      amount: 200,
      createdAt: "2026-07-15T12:00:00.000Z",
      updatedAt: "2026-07-15T12:00:00.000Z",
    },
    {
      id: "refund-checking",
      fundingSourceId: partiallyRoutedRefund.id,
      destinationAccountId: checkingAccount.id,
      amount: 50,
      createdAt: "2026-07-15T12:01:00.000Z",
      updatedAt: "2026-07-15T12:01:00.000Z",
    },
    {
      id: "received-checking",
      fundingSourceId: receivedDeposit.id,
      destinationAccountId: checkingAccount.id,
      amount: 300,
      createdAt: "2026-07-15T12:02:00.000Z",
      updatedAt: "2026-07-15T12:02:00.000Z",
    },
  ];

  const result = buildFundingDepositProjection({
    accounts: [checkingAccount, savingsAccount],
    fundingSources: [
      paycheck,
      partiallyRoutedRefund,
      receivedDeposit,
    ],
    allocations,
  });

  assertEqual(
    result.entries.length,
    2,
    "Fully routed paycheck produces two entries",
  );

  const checkingEntry = result.entries.find(
    (entry) => entry.accountId === checkingAccount.id,
  );

  const savingsEntry = result.entries.find(
    (entry) => entry.accountId === savingsAccount.id,
  );

  assertEqual(
    checkingEntry?.entryType,
    "funding-deposit",
    "Checking entry type",
  );

  assertEqual(
    checkingEntry?.amount,
    800,
    "Checking projected deposit amount",
  );

  assertEqual(
    checkingEntry?.occurredOn,
    paycheck.expectedOn,
    "Checking projected deposit date",
  );

  assertEqual(
    checkingEntry?.priority,
    PROJECTION_ENTRY_PRIORITY.fundingDeposit,
    "Funding-deposit priority",
  );

  assertEqual(
    checkingEntry?.sourceId,
    paycheck.id,
    "Funding source identity",
  );

  assertEqual(
    savingsEntry?.amount,
    200,
    "Savings projected deposit amount",
  );

  assertEqual(
    result.blockedSources.length,
    1,
    "Partially allocated refund is blocked",
  );

  assertEqual(
    result.blockedSources[0]?.fundingSourceId,
    partiallyRoutedRefund.id,
    "Blocked funding source identity",
  );

  assertEqual(
    result.blockedSources[0]?.status,
    "partially-allocated",
    "Blocked funding source status",
  );

  assertEqual(
    result.issues.some(
      (issue) =>
        issue.code === "blocked-funding-source" &&
        issue.sourceId === partiallyRoutedRefund.id,
    ),
    true,
    "Blocked source produces projection issue",
  );

  assertEqual(
    result.entries.some((entry) => entry.sourceId === receivedDeposit.id),
    false,
    "Received funding source does not produce a planned projection entry",
  );

  assertEqual(
    result.canProjectAllPlannedFunding,
    false,
    "Incomplete planned routing prevents complete projection",
  );
}
