import type { AccountState } from "../accounts/accountState";
import { createEmptyCreditPosition, type CreditPosition } from "./creditPosition";

const TARGET_UTILIZATION_PERCENT = 30;

function calculateUtilizationPercent(balance: number, creditLimit: number) {
  if (creditLimit <= 0) {
    return 0;
  }

  return Math.round((balance / creditLimit) * 10000) / 100;
}

function calculateAmountToTargetUtilization(
  projectedStatementBalance: number,
  creditLimit: number,
) {
  if (creditLimit <= 0) {
    return 0;
  }

  const targetBalance = creditLimit * (TARGET_UTILIZATION_PERCENT / 100);
  const amountToTarget = projectedStatementBalance - targetBalance;

  return Math.max(0, Math.round(amountToTarget * 100) / 100);
}

export function calculateCreditPosition(accountStates: AccountState[]): CreditPosition {
  const totalCreditLimit = accountStates.reduce(
    (total, account) => total + account.creditLimit,
    0,
  );

  const currentBalance = accountStates.reduce(
    (total, account) => total + account.currentBalance,
    0,
  );

  const projectedStatementBalance = accountStates.reduce(
    (total, account) => total + account.projectedStatementBalance,
    0,
  );

  if (totalCreditLimit <= 0) {
    return createEmptyCreditPosition();
  }

  return {
    totalCreditLimit,
    currentBalance,
    projectedStatementBalance,
    availableCredit: Math.max(0, totalCreditLimit - currentBalance),
    utilizationPercent: calculateUtilizationPercent(currentBalance, totalCreditLimit),
    projectedUtilizationPercent: calculateUtilizationPercent(
      projectedStatementBalance,
      totalCreditLimit,
    ),
    targetUtilizationPercent: TARGET_UTILIZATION_PERCENT,
    amountToTargetUtilization: calculateAmountToTargetUtilization(
      projectedStatementBalance,
      totalCreditLimit,
    ),
  };
}
