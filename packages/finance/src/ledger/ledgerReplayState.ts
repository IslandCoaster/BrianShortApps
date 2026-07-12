import type { FinancialLedgerEvent } from "./financialLedgerEvent";

export type FinancialLedgerReplayEntry = {
  event: FinancialLedgerEvent;

  /**
   * Cash derived from posted events through this point in replay.
   *
   * Planned events do not change this value.
   */
  runningPostedCash: number;

  /**
   * Cash derived from posted and planned events through this point.
   */
  runningProjectedCash: number;
};

export type FinancialLedgerReplayState = {
  /**
   * Sum of posted opening-cash events.
   *
   * Replay validation permits no more than one opening-cash event.
   */
  openingCash: number;

  /**
   * Net effect of posted events other than opening cash.
   */
  postedNetChange: number;

  /**
   * Net effect of planned events.
   */
  plannedNetChange: number;

  /**
   * Historical cash position derived only from posted events.
   */
  currentCash: number;

  /**
   * Forward cash position derived from posted and planned events.
   */
  projectedCash: number;

  /**
   * Ledger entries in deterministic replay order.
   */
  entries: FinancialLedgerReplayEntry[];
};

export function createEmptyFinancialLedgerReplayState(): FinancialLedgerReplayState {
  return {
    openingCash: 0,
    postedNetChange: 0,
    plannedNetChange: 0,
    currentCash: 0,
    projectedCash: 0,
    entries: [],
  };
}
