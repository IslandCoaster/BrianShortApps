import type { FinancialEvent } from "../events/financialEvent";

export type AccountState = {
  accountId: string;
  accountName: string;
  statementBalance: number;
  currentBalance: number;
  projectedStatementBalance: number;
  minimumPayment: number;
  paymentsCompleted: number;
  paymentTotal: number;
  lastActivityOn: string;
  events: FinancialEvent[];
};

export function createEmptyAccountState(accountId: string, accountName: string): AccountState {
  return {
    accountId,
    accountName,
    statementBalance: 0,
    currentBalance: 0,
    projectedStatementBalance: 0,
    minimumPayment: 0,
    paymentsCompleted: 0,
    paymentTotal: 0,
    lastActivityOn: "",
    events: [],
  };
}
