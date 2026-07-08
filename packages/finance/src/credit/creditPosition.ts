export type CreditPosition = {
  totalCreditLimit: number;
  currentBalance: number;
  projectedStatementBalance: number;
  availableCredit: number;
  utilizationPercent: number;
  targetUtilizationPercent: number;
};

export function createEmptyCreditPosition(): CreditPosition {
  return {
    totalCreditLimit: 0,
    currentBalance: 0,
    projectedStatementBalance: 0,
    availableCredit: 0,
    utilizationPercent: 0,
    targetUtilizationPercent: 30,
  };
}
