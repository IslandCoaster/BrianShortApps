import type { CashFlowEvent } from "./cashFlowEvent";
import type {
  CashFlowTimeline,
  CashFlowTimelineEntry,
} from "./cashFlowTimeline";

export type CashFlowTimelineRequest = {
  openingCash: number;
  events: CashFlowEvent[];
};

function getEventPriority(event: CashFlowEvent) {
  switch (event.type) {
    case "opening-position":
      return 0;

    case "paycheck":
      return 1;

    case "payment":
      return 2;

    case "statement":
      return 3;

    case "manual":
      return 4;
  }
}

export function buildCashFlowTimeline({
  openingCash,
  events,
}: CashFlowTimelineRequest): CashFlowTimeline {
  const orderedEvents = [...events].sort((left, right) => {
    const dateComparison = left.date.localeCompare(right.date);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    return getEventPriority(left) - getEventPriority(right);
  });

  let runningCash = openingCash;
  let totalInflows = 0;
  let totalOutflows = 0;
  let lowestRunningCash = openingCash;

  const entries: CashFlowTimelineEntry[] = orderedEvents.map((event) => {
    const amount = event.amount ?? 0;

    runningCash += amount;

    if (amount > 0) {
      totalInflows += amount;
    }

    if (amount < 0) {
      totalOutflows += Math.abs(amount);
    }

    lowestRunningCash = Math.min(lowestRunningCash, runningCash);

    return {
      ...event,
      runningCash,
    };
  });

  return {
    openingCash,
    closingCash: runningCash,
    totalInflows,
    totalOutflows,
    lowestRunningCash,
    entries,
  };
}
