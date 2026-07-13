import type { FinancialAccount } from "../accounts/financialAccount";
import type { FundingDepositAllocation } from "./fundingDepositAllocation";
import type { FundingSource } from "./fundingSource";
import { buildFundingAllocationProjection } from "./fundingAllocationProjection";

function assertEqual<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(
      `${label}: expected ${String(expected)}, received ${String(actual)}.`,
    );
  }
}

export function verifyFundingAllocationProjection(): void {
  const checkingAccount: FinancialAccount = {
    id: "checking-1",
    accountType: "checking",
    name: "Primary Checking",
    institutionName: "Example Bank",
    status: "active",
    currentBalance: 47.15,
    createdAt: "2026-07-13T12:00:00.000Z",
    updatedAt: "2026-07-13T12:00:00.000Z",
  };

  const savingsAccount: FinancialAccount = {
    id: "savings-1",
    accountType: "savings",
    name: "Primary Savings",
    institutionName: "Example Bank",
    status: "active",
    currentBalance: 500,
    createdAt: "2026-07-13T12:00:00.000Z",
    updatedAt: "2026-07-13T12:00:00.000Z",
  };

  const creditCard: FinancialAccount = {
    id: "card-1",
    accountType: "credit-card",
    name: "Credit Card",
    institutionName: "Example Bank",
    status: "active",
    currentBalance: 1000,
    createdAt: "2026-07-13T12:00:00.000Z",
    updatedAt: "2026-07-13T12:00:00.000Z",
  };

  const paycheck: FundingSource = {
    id: "paycheck-1",
    fundingSourceType: "paycheck",
    title: "AA Paycheck",
    employerName: "American Airlines",
    amount: 2333.96,
    expectedOn: "2026-07-15",
    status: "planned",
    createdAt: "2026-07-13T12:00:00.000Z",
    updatedAt: "2026-07-13T12:00:00.000Z",
  };

  const allocations: FundingDepositAllocation[] = [
    {
      id: "allocation-checking",
      fundingSourceId: paycheck.id,
      destinationAccountId: checkingAccount.id,
      amount: 1800,
      createdAt: "2026-07-13T12:00:00.000Z",
      updatedAt: "2026-07-13T12:00:00.000Z",
    },
    {
      id: "allocation-savings",
      fundingSourceId: paycheck.id,
      destinationAccountId: savingsAccount.id,
      amount: 533.96,
      createdAt: "2026-07-13T12:01:00.000Z",
      updatedAt: "2026-07-13T12:01:00.000Z",
    },
  ];

  const completeProjection = buildFundingAllocationProjection({
    accounts: [checkingAccount, savingsAccount, creditCard],
    fundingSources: [paycheck],
    allocations,
  });

  assertEqual(
    completeProjection.sources[0]?.allocatedAmount,
    2333.96,
    "Fully allocated paycheck total",
  );

  assertEqual(
    completeProjection.sources[0]?.remainingAmount,
    0,
    "Fully allocated paycheck remainder",
  );

  assertEqual(
    completeProjection.sources[0]?.status,
    "fully-allocated",
    "Fully allocated paycheck status",
  );

  assertEqual(
    completeProjection.canContinue,
    true,
    "Fully allocated projection may continue",
  );

  assertEqual(
    completeProjection.accounts.find(
      (account) => account.accountId === checkingAccount.id,
    )?.projectedBalance,
    1847.15,
    "Checking projected balance",
  );

  assertEqual(
    completeProjection.accounts.find(
      (account) => account.accountId === savingsAccount.id,
    )?.projectedBalance,
    1033.96,
    "Savings projected balance",
  );

  const partialProjection = buildFundingAllocationProjection({
    accounts: [checkingAccount, savingsAccount],
    fundingSources: [paycheck],
    allocations: [allocations[0] as FundingDepositAllocation],
  });

  assertEqual(
    partialProjection.sources[0]?.status,
    "partially-allocated",
    "Partial allocation status",
  );

  assertEqual(
    partialProjection.sources[0]?.remainingAmount,
    533.96,
    "Partial allocation remainder",
  );

  assertEqual(
    partialProjection.canContinue,
    false,
    "Partial allocation cannot continue",
  );

  const overallocatedProjection = buildFundingAllocationProjection({
    accounts: [checkingAccount, savingsAccount],
    fundingSources: [paycheck],
    allocations: [
      ...allocations,
      {
        id: "allocation-extra",
        fundingSourceId: paycheck.id,
        destinationAccountId: checkingAccount.id,
        amount: 1,
        createdAt: "2026-07-13T12:02:00.000Z",
        updatedAt: "2026-07-13T12:02:00.000Z",
      },
    ],
  });

  assertEqual(
    overallocatedProjection.sources[0]?.status,
    "invalid",
    "Duplicate destination is invalid",
  );

  assertEqual(
    overallocatedProjection.canContinue,
    false,
    "Invalid projection cannot continue",
  );

  const debtDestinationProjection = buildFundingAllocationProjection({
    accounts: [checkingAccount, creditCard],
    fundingSources: [paycheck],
    allocations: [
      {
        id: "allocation-card",
        fundingSourceId: paycheck.id,
        destinationAccountId: creditCard.id,
        amount: paycheck.amount,
        createdAt: "2026-07-13T12:03:00.000Z",
        updatedAt: "2026-07-13T12:03:00.000Z",
      },
    ],
  });

  assertEqual(
    debtDestinationProjection.sources[0]?.status,
    "invalid",
    "Debt destination is invalid",
  );

  assertEqual(
    debtDestinationProjection.canContinue,
    false,
    "Debt destination cannot continue",
  );
}
