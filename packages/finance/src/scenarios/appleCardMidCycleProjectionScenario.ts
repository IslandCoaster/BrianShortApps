import { appleCardProfile } from "../accountProfiles/appleCardProfile";
import { createAccountProfileCreatedEvent } from "../events/accountProfileEvents";
import { createStatementGeneratedEvent } from "../events/statementGeneratedEvent";
import type { FinancialScenario } from "./financialScenario";

export const appleCardMidCycleProjectionScenario: FinancialScenario = {
  id: "apple-card-mid-cycle-projection",
  title: "Apple Card Mid-Cycle Projection",
  description:
    "An Apple Card account is evaluated mid-cycle to project interest if no additional activity occurs.",
  events: [
    createAccountProfileCreatedEvent({
      id: "profile-apple-card-001",
      occurredOn: "2026-07-01",
      profile: appleCardProfile,
    }),
    createStatementGeneratedEvent({
      id: "statement-001",
      occurredOn: "2026-07-15",
      accountId: "card-apple",
      accountName: "Apple Card",
      statementPeriodStart: "2026-07-01",
      statementPeriodEnd: "2026-07-31",
      statementClosingDate: "2026-07-31",
      paymentDueDate: "2026-08-31",
      statementBalance: 6247.51,
      minimumPayment: 197,
      creditLimit: 10000,
      balanceSubjectToInterest: 6247.51,
      interestCharged: 0,
      notes: "Mid-cycle projection scenario.",
    }),
  ],
};
