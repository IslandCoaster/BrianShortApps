import type { CreditRisk } from "./creditRisk";

export const DEFAULT_OPERATIONAL_TARGET_UTILIZATION = 29;
export const DEFAULT_IDEAL_UTILIZATION = 9;

export type CreditPosition = {
  totalCreditLimit: number;
  currentBalance: number;
  projectedStatementBalance: number;
  availableCredit: number;
  utilizationPercent: number;
  projectedUtilizationPercent: number;
  targetUtilizationPercent: number;
  idealUtilizationPercent: number;
  amountToTargetUtilization: number;
  risk: CreditRisk;
};

export function createEmptyCreditPosition(): CreditPosition {
  return {
    totalCreditLimit: 0,
    currentBalance: 0,
    projectedStatementBalance: 0,
    availableCredit: 0,
    utilizationPercent: 0,
    projectedUtilizationPercent: 0,
    targetUtilizationPercent: DEFAULT_OPERATIONAL_TARGET_UTILIZATION,
    idealUtilizationPercent: DEFAULT_IDEAL_UTILIZATION,
    amountToTargetUtilization: 0,
    risk: {
      level: "excellent",
      color: "success",
      description: "No revolving utilization detected.",
    },
  };
}
