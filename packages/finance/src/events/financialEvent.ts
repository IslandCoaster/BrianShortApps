export type FinancialEventCategory =
  | "income"
  | "spending"
  | "obligation"
  | "credit"
  | "planning"
  | "account-profile";

export type FinancialEventType =
  | "account-profile.created"
  | "account-profile.rule-set-updated"
  | "account-profile.apr-changed"
  | "account-profile.credit-limit-changed"
  | "account-activity.recorded"
  | "paycheck.received"
  | "statement.generated"
  | "payment.completed"
  | "transaction.imported"
  | "credit-score.updated"
  | "budget.changed"
  | "goal.changed";

export type FinancialEvent = {
  id: string;
  type: FinancialEventType;
  category: FinancialEventCategory;
  occurredOn: string;
  description: string;
  amount?: number;
  metadata?: Record<string, string | number | boolean | null>;
};
