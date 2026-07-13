import type { FinancialAccount } from "../accounts/financialAccount";
import type { FinancialObligation } from "../obligations/financialObligation";
import type { FundingSource } from "./fundingSource";
import { buildOperationalFundingPlan } from "./operationalFundingEngine";

function assertEqual<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(
      `${label}: expected ${String(expected)}, received ${String(actual)}.`,
    );
  }
}

export function verifyOperationalFundingEngine(): void {
  const creditCard: FinancialAccount = {
    id: "account-card-1",
    accountType: "credit-card",
    name: "Primary Card",
    institutionName: "Example Bank",
    status: "active",
    currentBalance: 900,
    minimumPayment: 50,
    paymentDueDate: "2026-07-16",
    createdAt: "2026-07-13T12:00:00.000Z",
    updatedAt: "2026-07-13T12:00:00.000Z",
  };

  const utility: FinancialObligation = {
    id: "utility-1",
    obligationType: "utility",
    name: "Electric Service",
    provider: "Example Electric",
    status: "active",
    amountDue: 125,
    dueDate: "2026-07-20",
    cadence: "monthly",
    createdAt: "2026-07-13T12:00:00.000Z",
    updatedAt: "2026-07-13T12:00:00.000Z",
  };

  const undatedUtility: FinancialObligation = {
    id: "utility-undated",
    obligationType: "utility",
    name: "Variable Utility",
    provider: "Example Utility",
    status: "active",
    amountDue: 90,
    cadence: "monthly",
    createdAt: "2026-07-13T12:00:00.000Z",
    updatedAt: "2026-07-13T12:00:00.000Z",
  };

  const plannedPaycheck: FundingSource = {
    id: "paycheck-planned",
    fundingSourceType: "paycheck",
    title: "Upcoming Paycheck",
    employerName: "Example Employer",
    amount: 200,
    expectedOn: "2026-07-18",
    status: "planned",
    createdAt: "2026-07-13T12:00:00.000Z",
    updatedAt: "2026-07-13T12:00:00.000Z",
  };

  const receivedRefund: FundingSource = {
    id: "refund-received",
    fundingSourceType: "refund",
    title: "Received Refund",
    amount: 500,
    expectedOn: "2026-07-14",
    status: "received",
    createdAt: "2026-07-13T12:00:00.000Z",
    updatedAt: "2026-07-13T12:00:00.000Z",
  };

  const plan = buildOperationalFundingPlan({
    planningDate: "2026-07-13",
    currentCash: 100,
    minimumCashReserve: 25,
    accounts: [creditCard],
    obligations: [utility, undatedUtility],
    fundingSources: [plannedPaycheck, receivedRefund],
  });

  assertEqual(plan.position.currentCash, 100, "Replay-derived current cash");

  assertEqual(
    plan.position.plannedFutureCash,
    200,
    "Only planned future cash contributes",
  );

  assertEqual(plan.position.grossAvailableCash, 300, "Gross available cash");

  assertEqual(plan.position.protectedCash, 25, "Protected cash");

  assertEqual(plan.position.deployableCash, 275, "Deployable cash");

  assertEqual(plan.items.length, 2, "Dated requirements included");

  assertEqual(
    plan.items[0]?.requirementId,
    creditCard.id,
    "Earlier debt-account payment ordered first",
  );

  assertEqual(
    plan.items[0]?.fundingStatus,
    "funded-by-due-date",
    "Credit card funded by due date",
  );

  assertEqual(
    plan.items[1]?.fundingStatus,
    "funded-by-due-date",
    "Utility funded by due date",
  );

  assertEqual(plan.position.allocatedCash, 175, "Total allocated cash");

  assertEqual(plan.position.fundingBuffer, 100, "Remaining funding buffer");

  assertEqual(
    plan.excludedRequirements.length,
    1,
    "Undated obligation excluded",
  );

  assertEqual(
    plan.excludedRequirements[0]?.reason,
    "missing-due-date",
    "Undated obligation exclusion reason",
  );
}
