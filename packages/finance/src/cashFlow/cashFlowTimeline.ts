import type { CashFlowEvent } from "./cashFlowEvent";

export type CashFlowTimelineEntry = CashFlowEvent & {
  runningCash: number;
  runningDeployableCash: number;
};

export type CashFlowTimeline = {
  openingCash: number;
  protectedCash: number;
  openingDeployableCash: number;

  closingCash: number;
  closingDeployableCash: number;

  totalInflows: number;
  totalOutflows: number;

  lowestRunningCash: number;
  lowestDeployableCash: number;

  entries: CashFlowTimelineEntry[];
};
