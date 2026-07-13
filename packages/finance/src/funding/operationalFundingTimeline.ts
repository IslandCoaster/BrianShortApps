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

function buildPaymentEvents(
  fundingPlan: OperationalFundingPlan,
): CashFlowEvent[] {
  return fundingPlan.items.flatMap((item) =>
    item.allocations
      .filter((allocation) => allocation.amount > 0)
      .map(
        (allocation, allocationIndex): CashFlowEvent => ({
          id: [
            "planned-payment",
            item.requirementType,
            item.requirementId,
            allocation.paymentDate,
            allocationIndex,
          ].join("-"),
          date: allocation.paymentDate,
          type: "payment",
          title: item.name,
          description: item.isPastDue
            ? `Past-due priority payment to ${item.counterparty}`
            : `Required payment to ${item.counterparty}`,
          amount: -allocation.amount,
          status:
            item.fundingStatus === "partially-funded" ||
            item.fundingStatus === "unfunded"
              ? "partially-funded"
              : "planned",
        }),
      ),
  );
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
