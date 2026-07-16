export type LiquidityStatus =
  | "healthy"
  | "low-buffer"
  | "overdraft-risk"
  | "routing-incomplete";

export type AccountLiquidityState = {
  accountId: string;
  accountName: string;
  openingBalance: number;
  lowestProjectedBalance: number;
  closingBalance: number;
  recommendedMinimumBuffer: number;
  status: LiquidityStatus;
  rationale: string;
};

export type LiquidityStateSummary = {
  accounts: AccountLiquidityState[];
  healthyCount: number;
  lowBufferCount: number;
  overdraftRiskCount: number;
  routingIncompleteCount: number;
  hasLiquidityRisk: boolean;
};

export type AccountLiquidityBuffer = {
  accountId: string;
  recommendedMinimumBuffer: number;
};
