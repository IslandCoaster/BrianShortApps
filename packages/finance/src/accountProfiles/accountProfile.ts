export type InterestCalculationMethod =
  | "daily-balance-including-new-transactions"
  | "average-daily-balance"
  | "simple-interest"
  | "unknown";

export type AccountRuleSet = {
  aprPercent: number;
  isVariableApr: boolean;
  interestCalculationMethod: InterestCalculationMethod;
  gracePeriodRule: string;
  paymentPostingCutoff: string;
  statementCycleRule: string;
  lateFeeRule?: string;
};

export type AccountProfile = {
  accountId: string;
  accountName: string;
  issuer: string;
  accountType: "credit-card" | "loan" | "checking" | "savings" | "retirement" | "investment";
  creditLimit?: number;
  activeRuleSet: AccountRuleSet;
};
