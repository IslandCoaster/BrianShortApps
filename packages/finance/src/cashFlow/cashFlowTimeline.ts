import type { CashFlowEvent } from "./cashFlowEvent";

export type CashFlowTimelineEntry = CashFlowEvent & {
  runningCash: number;
};

export type CashFlowTimeline = {
  openingCash: number;
  closingCash: number;
  totalInflows: number;
  totalOutflows: number;
  lowestRunningCash: number;
  entries: CashFlowTimelineEntry[];
};
