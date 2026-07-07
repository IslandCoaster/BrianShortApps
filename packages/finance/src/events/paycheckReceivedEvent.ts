import type { FinancialEvent } from "./financialEvent";

export type PaycheckReceivedInput = {
  id: string;
  occurredOn: string;
  netPay: number;
  grossPay: number;
  payPeriodStart: string;
  payPeriodEnd: string;
  federalTax?: number;
  stateTax?: number;
  retirementContribution?: number;
  employerMatch?: number;
  healthInsuranceDeduction?: number;
  otherDeductions?: number;
  notes?: string;
};

export function createPaycheckReceivedEvent(input: PaycheckReceivedInput): FinancialEvent {
  return {
    id: input.id,
    type: "paycheck.received",
    category: "income",
    occurredOn: input.occurredOn,
    description: `Paycheck received for ${input.payPeriodStart} through ${input.payPeriodEnd}`,
    amount: input.netPay,
    metadata: {
      grossPay: input.grossPay,
      netPay: input.netPay,
      payPeriodStart: input.payPeriodStart,
      payPeriodEnd: input.payPeriodEnd,
      federalTax: input.federalTax ?? null,
      stateTax: input.stateTax ?? null,
      retirementContribution: input.retirementContribution ?? null,
      employerMatch: input.employerMatch ?? null,
      healthInsuranceDeduction: input.healthInsuranceDeduction ?? null,
      otherDeductions: input.otherDeductions ?? null,
      notes: input.notes ?? null,
    },
  };
}
