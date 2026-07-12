export type CashFlowEventType =
  | "opening-position"
  | "paycheck"
  | "payment"
  | "statement"
  | "manual";

export type CashFlowEventStatus =
  | "known"
  | "planned"
  | "partially-funded"
  | "unknown";

export type CashFlowEvent = {
  id: string;
  date: string;
  type: CashFlowEventType;
  title: string;
  description?: string;
  amount?: number;
  status: CashFlowEventStatus;
};
