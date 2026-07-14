import type { AccountState } from "../accounts/accountState";
import {
  createEmptyCreditPosition,
  DEFAULT_IDEAL_UTILIZATION,
  DEFAULT_OPERATIONAL_TARGET_UTILIZATION,
  type CreditPosition,
} from "./creditPosition";
import { calculateCreditRisk } from "./creditRisk";

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

  const targetBalance = creditLimit * (DEFAULT_OPERATIONAL_TARGET_UTILIZATION / 100);
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

  const utilizationPercent = calculateUtilizationPercent(currentBalance, totalCreditLimit);
  const projectedUtilizationPercent = calculateUtilizationPercent(
    projectedStatementBalance,
    totalCreditLimit,
  );

  return {
    totalCreditLimit,
    currentBalance,
    projectedStatementBalance,
    availableCredit: Math.max(0, totalCreditLimit - currentBalance),
    utilizationPercent,
    projectedUtilizationPercent,
    targetUtilizationPercent: DEFAULT_OPERATIONAL_TARGET_UTILIZATION,
    idealUtilizationPercent: DEFAULT_IDEAL_UTILIZATION,
    amountToTargetUtilization: calculateAmountToTargetUtilization(
      projectedStatementBalance,
      totalCreditLimit,
    ),
    risk: calculateCreditRisk(projectedUtilizationPercent),
  };
}
