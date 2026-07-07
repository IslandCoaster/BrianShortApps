import type { FinancialEvent } from "../events/financialEvent";

export type ObligationState = {
  obligationId: string;
  accountId: string;
  accountName: string;
  originalAmount: number;
  remainingAmount: number;
  minimumPayment: number;
  dueDate: string;
  paymentsApplied: number;
  paymentTotal: number;
  satisfactionPercent: number;
  status: "open" | "partially-satisfied" | "satisfied";
  events: FinancialEvent[];
};

export function createEmptyObligationState(
  obligationId: string,
  accountId: string,
  accountName: string,
): ObligationState {
  return {
    obligationId,
    accountId,
    accountName,
    originalAmount: 0,
    remainingAmount: 0,
    minimumPayment: 0,
    dueDate: "",
    paymentsApplied: 0,
    paymentTotal: 0,
    satisfactionPercent: 0,
    status: "open",
    events: [],
  };
}
