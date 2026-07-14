import { appleCardProfile } from "../accountProfiles/appleCardProfile";
import { createAccountProfileCreatedEvent } from "../events/accountProfileEvents";
import { createPaymentCompletedEvent } from "../events/paymentCompletedEvent";
import { createPaycheckReceivedEvent } from "../events/paycheckReceivedEvent";
import { createStatementGeneratedEvent } from "../events/statementGeneratedEvent";
import type { FinancialScenario } from "./financialScenario";

export const appleCardPaidInFullScenario: FinancialScenario = {
  id: "apple-card-paid-in-full",
  title: "Apple Card Paid in Full",
  description:
    "An Apple Card statement is fully paid by the payment due date cutoff, restoring grace period eligibility.",
  events: [
    createAccountProfileCreatedEvent({
      id: "profile-apple-card-001",
      occurredOn: "2026-07-01",
      profile: appleCardProfile,
    }),
    createPaycheckReceivedEvent({
      id: "paycheck-001",
      occurredOn: "2026-07-07",
      grossPay: 8000,
      netPay: 7200,
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
      accountId: "card-apple",
      accountName: "Apple Card",
      statementPeriodStart: "2026-06-01",
      statementPeriodEnd: "2026-06-30",
      statementClosingDate: "2026-06-30",
      paymentDueDate: "2026-07-31",
      statementBalance: 6598.1,
      minimumPayment: 197,
      creditLimit: 10000,
      balanceSubjectToInterest: 6247.51,
      interestCharged: 130.89,
      notes: "June 2026 Apple Card statement.",
    }),
    createPaymentCompletedEvent({
      id: "payment-001",
      occurredOn: "2026-07-31",
      creditedAt: "2026-07-31T23:59:00-04:00",
      sourceAccountId: "checking-primary",
      sourceAccountName: "Primary Checking",
      destinationAccountId: "card-apple",
      destinationAccountName: "Apple Card",
      amount: 6598.1,
      strategy: "manual",
      notes: "Full statement balance payment credited by due date cutoff.",
    }),
  ],
};
