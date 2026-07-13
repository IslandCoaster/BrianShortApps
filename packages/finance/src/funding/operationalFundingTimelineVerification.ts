import type { FundingSource } from "./fundingSource";
import type { OperationalFundingPlan } from "./operationalFundingEngine";
import { buildOperationalFundingTimeline } from "./operationalFundingTimeline";

function assertEqual<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(
      `${label}: expected ${String(expected)}, received ${String(actual)}.`,
    );
  }
}

export function verifyOperationalFundingTimeline(): void {
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

  const fundingPlan: OperationalFundingPlan = {
    planningDate: "2026-07-13",
    position: {
      currentCash: 100,
      plannedFutureCash: 200,
      grossAvailableCash: 300,
      protectedCash: 25,
      deployableCash: 275,
      allocatedCash: 175,
      fundingBuffer: 100,
      unresolvedAmount: 0,
    },
    items: [
      {
        requirementId: "credit-card-1",
        requirementType: "debt-account",
        name: "Primary Card",
        counterparty: "Example Bank",
        dueDate: "2026-07-16",
        requestedAmount: 50,
        allocatedAmount: 50,
        fundedAmountByDueDate: 50,
        fundingStatus: "funded-by-due-date",
        fullyFundedOn: "2026-07-13",
        isPastDue: false,
        allocations: [
          {
            availableOn: "2026-07-13",
            paymentDate: "2026-07-16",
            amount: 50,
            fundingSourceId: "replay-current-cash",
          },
        ],
      },
      {
        requirementId: "utility-1",
        requirementType: "financial-obligation",
        name: "Electric Service",
        counterparty: "Example Electric",
        dueDate: "2026-07-20",
        requestedAmount: 125,
        allocatedAmount: 125,
        fundedAmountByDueDate: 125,
        fundingStatus: "funded-by-due-date",
        fullyFundedOn: "2026-07-18",
        isPastDue: false,
        allocations: [
          {
            availableOn: "2026-07-13",
            paymentDate: "2026-07-20",
            amount: 75,
            fundingSourceId: "replay-current-cash",
          },
          {
            availableOn: "2026-07-18",
            paymentDate: "2026-07-20",
            amount: 50,
            fundingSourceId: plannedPaycheck.id,
          },
        ],
      },
    ],
    excludedRequirements: [],
  };

  const timeline = buildOperationalFundingTimeline({
    fundingPlan,
    fundingSources: [plannedPaycheck, receivedRefund],
  });

  assertEqual(timeline.openingCash, 100, "Timeline opening cash");

  assertEqual(timeline.protectedCash, 25, "Timeline protected cash");

  assertEqual(timeline.entries.length, 3, "Planned inflow and payment count");

  assertEqual(
    timeline.entries[0]?.type,
    "payment",
    "First dated payment event",
  );

  assertEqual(timeline.entries[1]?.type, "paycheck", "Planned paycheck event");

  assertEqual(
    timeline.entries[2]?.type,
    "payment",
    "Second dated payment event",
  );

  assertEqual(
    timeline.totalInflows,
    200,
    "Only planned future cash appears as an inflow",
  );

  assertEqual(
    timeline.totalOutflows,
    175,
    "Allocated payments appear as outflows",
  );

  assertEqual(timeline.closingCash, 125, "Timeline closing cash");

  assertEqual(
    timeline.closingDeployableCash,
    100,
    "Timeline closing funding buffer",
  );

  assertEqual(timeline.lowestRunningCash, 50, "Timeline lowest total cash");

  assertEqual(
    timeline.lowestDeployableCash,
    25,
    "Timeline lowest deployable cash",
  );

  assertEqual(
    timeline.entries.filter((entry) => entry.title === "Electric Service")
      .length,
    1,
    "One requirement produces one payment event",
  );

  assertEqual(
    timeline.entries.find((entry) => entry.title === "Electric Service")
      ?.amount,
    -125,
    "Payment event contains the complete allocated amount",
  );
}
