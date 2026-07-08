import { createPaycheckReceivedEvent } from "../events/paycheckReceivedEvent";
import { createStatementGeneratedEvent } from "../events/statementGeneratedEvent";
import type { FinancialScenario } from "./financialScenario";

export const paycheckWithStatementScenario: FinancialScenario = {
  id: "paycheck-with-statement",
  title: "Paycheck with Statement",
  description:
    "A paycheck and credit card statement enter the financial timeline and update income plus obligation state.",
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
    createStatementGeneratedEvent({
      id: "statement-001",
      occurredOn: "2026-07-08",
      accountId: "card-chase-freedom",
      accountName: "Chase Freedom",
      statementDate: "2026-07-08",
      closingDate: "2026-07-08",
      dueDate: "2026-08-02",
      statementBalance: 942.38,
      minimumPayment: 35,
      creditLimit: 2000,
      interestCharged: 18.44,
    }),
  ],
};
