import {
  buildCashFlowTimeline,
  type CashFlowEvent,
  type CashFlowTimeline,
} from "@bsa/finance";

import type { PaymentPlan } from "./fundingEngine";
import type { FundingSource } from "./fundingSource";
import type { PortfolioAccountSummary } from "./portfolio.types";

export type FundingTimelineRequest = {
  openingCash: number;
  protectedCash: number;
  fundingSources: FundingSource[];
  paymentPlan: PaymentPlan | null;
  unknownObligations: PortfolioAccountSummary[];
};

function buildFundingSourceEvents(
  fundingSources: FundingSource[],
): CashFlowEvent[] {
  return fundingSources
    .filter((source) => source.type !== "opening-cash")
    .map((source) => ({
      id: source.id,
      date: source.date,
      type: "paycheck",
      title: source.title,
      description: source.description,
      amount: source.amount,
      status: "planned",
    }));
}

function buildPaymentEvents(paymentPlan: PaymentPlan | null): CashFlowEvent[] {
  if (!paymentPlan) {
    return [];
  }

  return paymentPlan.items.flatMap((item) =>
    item.allocations
      .filter((allocation) => allocation.amount > 0)
      .map(
        (allocation, index): CashFlowEvent => ({
          id: `planned-payment-${item.accountId}-${allocation.paymentDate}-${index}`,
          date: allocation.paymentDate,
          type: "payment",
          title: item.accountName,
          description:
            item.reason === "past-due"
              ? "Past-due priority payment"
              : "Required payment",
          amount: -allocation.amount,
          status: item.fullyFunded ? "planned" : "partially-funded",
        }),
      ),
  );
}

function buildUnknownObligationEvents(
  accounts: PortfolioAccountSummary[],
): CashFlowEvent[] {
  return accounts.flatMap((account): CashFlowEvent[] => {
    if (!account.paymentDueDate) {
      return [];
    }

    return [
      {
        id: `unknown-payment-${account.id}`,
        date: account.paymentDueDate,
        type: "statement",
        title: account.accountName,
        description: "Required payment amount has not been entered",
        status: "unknown",
      },
    ];
  });
}

export function buildFundingTimeline({
  openingCash,
  protectedCash,
  fundingSources,
  paymentPlan,
  unknownObligations,
}: FundingTimelineRequest): CashFlowTimeline {
  const events: CashFlowEvent[] = [
    ...buildFundingSourceEvents(fundingSources),
    ...buildPaymentEvents(paymentPlan),
    ...buildUnknownObligationEvents(unknownObligations),
  ];

  return buildCashFlowTimeline({
    openingCash,
    protectedCash,
    events,
  });
}
