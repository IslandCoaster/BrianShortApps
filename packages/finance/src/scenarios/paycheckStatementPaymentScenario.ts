import { createPaymentCompletedEvent } from "../events/paymentCompletedEvent";
import { createPaycheckReceivedEvent } from "../events/paycheckReceivedEvent";
import { createStatementGeneratedEvent } from "../events/statementGeneratedEvent";
import type { FinancialScenario } from "./financialScenario";

export const paycheckStatementPaymentScenario: FinancialScenario = {
  id: "paycheck-statement-payment",
  title: "Paycheck, Statement, and Payment",
  description:
    "A paycheck, statement, and payment enter the financial journal and update cash plus current projected balances.",
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
      interestCharged: 18.44,
    }),
    createPaymentCompletedEvent({
      id: "payment-001",
      occurredOn: "2026-07-09",
      sourceAccountId: "checking-primary",
      sourceAccountName: "Primary Checking",
      destinationAccountId: "card-chase-freedom",
      destinationAccountName: "Chase Freedom",
      amount: 500,
      strategy: "manual",
      notes: "Manual payment after statement generated.",
    }),
  ],
};
