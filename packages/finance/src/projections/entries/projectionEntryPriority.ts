export const PROJECTION_ENTRY_PRIORITY = {
  fundingDeposit: 10,
  plannedTransferIn: 20,
  plannedSettlement: 30,
  plannedTransferOut: 40,
  projectedFee: 50,
  projectedInterest: 60,
  projectedRefund: 70,
  manualProjection: 90,
} as const;

export type ProjectionEntryPriority =
  (typeof PROJECTION_ENTRY_PRIORITY)[keyof typeof PROJECTION_ENTRY_PRIORITY];
