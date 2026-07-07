import type { FinancialEvent } from "./financialEvent";

export type StatementGeneratedInput = {
  id: string;
  occurredOn: string;
  accountId: string;
  accountName: string;
  statementDate: string;
  closingDate: string;
  dueDate: string;
  statementBalance: number;
  minimumPayment: number;
  interestCharged?: number;
  fees?: number;
  notes?: string;
};

export function createStatementGeneratedEvent(input: StatementGeneratedInput): FinancialEvent {
  return {
    id: input.id,
    type: "statement.generated",
    category: "obligation",
    occurredOn: input.occurredOn,
    description: `Statement generated for ${input.accountName}`,
    amount: input.statementBalance,
    metadata: {
      accountId: input.accountId,
      accountName: input.accountName,
      statementDate: input.statementDate,
      closingDate: input.closingDate,
      dueDate: input.dueDate,
      statementBalance: input.statementBalance,
      minimumPayment: input.minimumPayment,
      interestCharged: input.interestCharged ?? null,
      fees: input.fees ?? null,
      notes: input.notes ?? null,
    },
  };
}
