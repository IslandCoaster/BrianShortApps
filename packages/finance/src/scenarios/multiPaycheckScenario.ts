import { createPaycheckReceivedEvent } from "../events/paycheckReceivedEvent";
import type { FinancialScenario } from "./financialScenario";

export const multiPaycheckScenario: FinancialScenario = {
  id: "multi-paycheck",
  title: "Multiple Paychecks",
  description: "Multiple paychecks enter the financial timeline and update cumulative income state.",
  events: [
    createPaycheckReceivedEvent({
      id: "paycheck-001",
      occurredOn: "2026-07-07",
      grossPay: 2500,
      netPay: 1800,
      payPeriodStart: "2026-06-23",
      payPeriodEnd: "2026-07-06",
      federalTax: 350,
      stateTax: 100,
      retirementContribution: 150,
      healthInsuranceDeduction: 100,
    }),
    createPaycheckReceivedEvent({
      id: "paycheck-002",
      occurredOn: "2026-07-21",
      grossPay: 2550,
      netPay: 1840,
      payPeriodStart: "2026-07-07",
      payPeriodEnd: "2026-07-20",
      federalTax: 360,
      stateTax: 105,
      retirementContribution: 155,
      healthInsuranceDeduction: 90,
      notes: "Slightly higher net pay due to deduction variance.",
    }),
  ],
};
