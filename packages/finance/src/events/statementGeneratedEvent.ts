import type { FinancialEvent } from "./financialEvent";

export type StatementGeneratedInput = {
  id: string;
  occurredOn: string;
  accountId: string;
  accountName: string;
  statementPeriodStart: string;
  statementPeriodEnd: string;
  statementClosingDate: string;
  paymentDueDate: string;
  statementBalance: number;
  minimumPayment: number;
  creditLimit?: number;
  balanceSubjectToInterest?: number;
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
      statementPeriodStart: input.statementPeriodStart,
      statementPeriodEnd: input.statementPeriodEnd,
      statementClosingDate: input.statementClosingDate,
      paymentDueDate: input.paymentDueDate,
      statementBalance: input.statementBalance,
      minimumPayment: input.minimumPayment,
      creditLimit: input.creditLimit ?? null,
      balanceSubjectToInterest: input.balanceSubjectToInterest ?? null,
      interestCharged: input.interestCharged ?? null,
      fees: input.fees ?? null,
      notes: input.notes ?? null,
    },
  };
}
