import type { CashFlowEvent } from "./cashFlowEvent";
import type {
  CashFlowTimeline,
  CashFlowTimelineEntry,
} from "./cashFlowTimeline";

export type CashFlowTimelineRequest = {
  openingCash: number;
  protectedCash?: number;
  events: CashFlowEvent[];
};

function normalizeAmount(amount: number) {
  return Number.isFinite(amount) ? Math.max(amount, 0) : 0;
}

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
  protectedCash = 0,
  events,
}: CashFlowTimelineRequest): CashFlowTimeline {
  const normalizedOpeningCash = normalizeAmount(openingCash);

  const normalizedProtectedCash = Math.min(
    normalizeAmount(protectedCash),
    normalizedOpeningCash +
      events.reduce(
        (total, event) => total + Math.max(event.amount ?? 0, 0),
        0,
      ),
  );

  const orderedEvents = [...events].sort((left, right) => {
    const dateComparison = left.date.localeCompare(right.date);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    return getEventPriority(left) - getEventPriority(right);
  });

  let runningCash = normalizedOpeningCash;
  let runningDeployableCash = Math.max(
    runningCash - normalizedProtectedCash,
    0,
  );

  let totalInflows = 0;
  let totalOutflows = 0;

  let lowestRunningCash = runningCash;
  let lowestDeployableCash = runningDeployableCash;

  const entries: CashFlowTimelineEntry[] = orderedEvents.map((event) => {
    const amount = event.amount ?? 0;

    runningCash += amount;
    runningDeployableCash = runningCash - normalizedProtectedCash;

    if (amount > 0) {
      totalInflows += amount;
    }

    if (amount < 0) {
      totalOutflows += Math.abs(amount);
    }

    lowestRunningCash = Math.min(lowestRunningCash, runningCash);

    lowestDeployableCash = Math.min(
      lowestDeployableCash,
      runningDeployableCash,
    );

    return {
      ...event,
      runningCash,
      runningDeployableCash,
    };
  });

  return {
    openingCash: normalizedOpeningCash,
    protectedCash: normalizedProtectedCash,
    openingDeployableCash: Math.max(
      normalizedOpeningCash - normalizedProtectedCash,
      0,
    ),

    closingCash: runningCash,
    closingDeployableCash: runningCash - normalizedProtectedCash,

    totalInflows,
    totalOutflows,

    lowestRunningCash,
    lowestDeployableCash,

    entries,
  };
}
