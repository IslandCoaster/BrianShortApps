export type CashPosition = {
  cashAvailable: number;
};

export type CreditPosition = {
  statementBalanceTotal: number;
  currentBalanceTotal: number;
  projectedStatementBalanceTotal: number;
  minimumPaymentTotal: number;
  paymentsCompleted: number;
  paymentTotal: number;
};

export type FinancialPositions = {
  cash: CashPosition;
  credit: CreditPosition;
};
