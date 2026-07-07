import { createPaycheckReceivedEvent } from "../events/paycheckReceivedEvent";
import type { FinancialScenario } from "./financialScenario";

export const singlePaycheckScenario: FinancialScenario = {
  id: "single-paycheck",
  title: "Single Paycheck",
  description: "A single paycheck enters the financial timeline and updates financial state.",
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
  ],
};
