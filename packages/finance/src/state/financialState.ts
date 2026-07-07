export type FinancialState = {
  liquidity: {
    cashAvailable: number;
  };
  income: {
    receivedIncome: number;
  };
  recommendations: {
    id: string;
    title: string;
    rationale: string;
    priority: "critical" | "high" | "medium" | "low";
  }[];
};

export function createEmptyFinancialState(): FinancialState {
  return {
    liquidity: {
      cashAvailable: 0,
    },
    income: {
      receivedIncome: 0,
    },
    recommendations: [],
  };
}
