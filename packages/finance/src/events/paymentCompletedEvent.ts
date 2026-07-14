import type { FinancialEvent } from "./financialEvent";

export type PaymentCompletedInput = {
  id: string;
  occurredOn: string;
  sourceAccountId: string;
  sourceAccountName: string;
  destinationAccountId: string;
  destinationAccountName: string;
  amount: number;
  creditedAt?: string;
  strategy?: "minimum" | "extra" | "scheduled" | "manual" | "automatic";
  notes?: string;
};

export function createPaymentCompletedEvent(input: PaymentCompletedInput): FinancialEvent {
  return {
    id: input.id,
    type: "payment.completed",
    category: "obligation",
    occurredOn: input.occurredOn,
    description: `Payment completed to ${input.destinationAccountName}`,
    amount: input.amount,
    metadata: {
      sourceAccountId: input.sourceAccountId,
      sourceAccountName: input.sourceAccountName,
      destinationAccountId: input.destinationAccountId,
      destinationAccountName: input.destinationAccountName,
      creditedAt: input.creditedAt ?? input.occurredOn,
      strategy: input.strategy ?? "manual",
      notes: input.notes ?? null,
    },
  };
}
