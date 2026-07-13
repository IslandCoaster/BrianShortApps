import {
  buildCashFlowTimeline,
  type CashFlowEvent,
  type CashFlowTimeline,
} from "../cashFlow";
import type { FundingSource } from "./fundingSource";
import type { OperationalFundingPlan } from "./operationalFundingEngine";

export type OperationalFundingTimelineRequest = {
  fundingPlan: OperationalFundingPlan;
  fundingSources: readonly FundingSource[];
};

function getFundingSourceEventType(
  fundingSource: FundingSource,
): CashFlowEvent["type"] {
  return fundingSource.fundingSourceType === "paycheck" ? "paycheck" : "manual";
}

function getFundingSourceDescription(fundingSource: FundingSource): string {
  switch (fundingSource.fundingSourceType) {
    case "paycheck":
      return `Expected paycheck from ${fundingSource.employerName}`;

    case "transfer":
      return "Expected transfer";

    case "deposit":
      return "Expected deposit";

    case "refund":
      return "Expected refund";
  }
}

function buildFundingSourceEvents(
  fundingSources: readonly FundingSource[],
): CashFlowEvent[] {
  return fundingSources
    .filter((fundingSource) => fundingSource.status === "planned")
    .map(
      (fundingSource): CashFlowEvent => ({
        id: `planned-funding-source-${fundingSource.id}`,
        date: fundingSource.expectedOn,
        type: getFundingSourceEventType(fundingSource),
        title: fundingSource.title,
        description: getFundingSourceDescription(fundingSource),
        amount: fundingSource.amount,
        status: "planned",
      }),
    );
}

function getPlannedPaymentDate(
  item: OperationalFundingPlan["items"][number],
): string | undefined {
  if (item.allocatedAmount <= 0) {
    return undefined;
  }

  if (item.fundingStatus === "funded-after-due-date") {
    return item.fullyFundedOn;
  }

  return item.dueDate;
}

function buildPaymentEvents(
  fundingPlan: OperationalFundingPlan,
): CashFlowEvent[] {
  return fundingPlan.items.flatMap((item): CashFlowEvent[] => {
    const paymentDate = getPlannedPaymentDate(item);

    if (paymentDate === undefined || item.allocatedAmount <= 0) {
      return [];
    }

    return [
      {
        id: [
          "planned-payment",
          item.requirementType,
          item.requirementId,
          paymentDate,
        ].join("-"),
        date: paymentDate,
        type: "payment",
        title: item.name,
        description: item.isPastDue
          ? `Past-due priority payment to ${item.counterparty}`
          : `Required payment to ${item.counterparty}`,
        amount: -item.allocatedAmount,
        status:
          item.fundingStatus === "partially-funded"
            ? "partially-funded"
            : "planned",
      },
    ];
  });
}

export function buildOperationalFundingTimeline({
  fundingPlan,
  fundingSources,
}: OperationalFundingTimelineRequest): CashFlowTimeline {
  const events: CashFlowEvent[] = [
    ...buildFundingSourceEvents(fundingSources),
    ...buildPaymentEvents(fundingPlan),
  ];

  return buildCashFlowTimeline({
    openingCash: fundingPlan.position.currentCash,
    protectedCash: fundingPlan.position.protectedCash,
    events,
  });
}
