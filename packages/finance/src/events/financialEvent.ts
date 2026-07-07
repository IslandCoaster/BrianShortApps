export type FinancialEventCategory =
  | "income"
  | "spending"
  | "obligation"
  | "credit"
  | "planning";

export type FinancialEventType =
  | "paycheck.received"
  | "statement.generated"
  | "transaction.imported"
  | "payment.completed"
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
