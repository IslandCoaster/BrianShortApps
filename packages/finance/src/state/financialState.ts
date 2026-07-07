export type FinancialRecommendation = {
  id: string;
  title: string;
  rationale: string;
  priority: "critical" | "high" | "medium" | "low";
};

export type PaycheckSummary = {
  id: string;
  occurredOn: string;
  netPay: number;
  grossPay: number;
  payPeriodStart: string;
  payPeriodEnd: string;
};

export type StatementSummary = {
  id: string;
  occurredOn: string;
  accountId: string;
  accountName: string;
  statementDate: string;
  closingDate: string;
  dueDate: string;
  statementBalance: number;
  minimumPayment: number;
};

export type FinancialState = {
  liquidity: {
    cashAvailable: number;
  };
  income: {
    receivedIncome: number;
    paychecks: PaycheckSummary[];
  };
  obligations: {
    statementBalanceTotal: number;
    minimumPaymentTotal: number;
    statements: StatementSummary[];
  };
  recommendations: FinancialRecommendation[];
};

export function createEmptyFinancialState(): FinancialState {
  return {
    liquidity: {
      cashAvailable: 0,
    },
    income: {
      receivedIncome: 0,
      paychecks: [],
    },
    obligations: {
      statementBalanceTotal: 0,
      minimumPaymentTotal: 0,
      statements: [],
    },
    recommendations: [],
  };
}
