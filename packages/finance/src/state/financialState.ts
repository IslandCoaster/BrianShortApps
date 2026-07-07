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

export type FinancialState = {
  liquidity: {
    cashAvailable: number;
  };
  income: {
    receivedIncome: number;
    paychecks: PaycheckSummary[];
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
    recommendations: [],
  };
}
