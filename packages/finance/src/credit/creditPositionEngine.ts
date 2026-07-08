import type { AccountState } from "../accounts/accountState";
import { createEmptyCreditPosition, type CreditPosition } from "./creditPosition";

function calculateUtilizationPercent(balance: number, creditLimit: number) {
  if (creditLimit <= 0) {
    return 0;
  }

  return Math.round((balance / creditLimit) * 10000) / 100;
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
    targetUtilizationPercent: 30,
  };
}
