import { appleCardProfile } from "../accountProfiles/appleCardProfile";
import { createAccountProfileCreatedEvent } from "../events/accountProfileEvents";
import { createStatementGeneratedEvent } from "../events/statementGeneratedEvent";
import type { FinancialScenario } from "./financialScenario";
import { createAccountActivityRecordedEvent } from "../events/accountActivityEvents";

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
    createAccountActivityRecordedEvent({
  id: "purchase-001",
  occurredOn: "2026-07-10",
  accountId: "card-apple",
  accountName: "Apple Card",
  activityType: "purchase",
  postedDate: "2026-07-10",
  amount: 100,
  merchant: "Example Merchant",
  category: "shopping",
  description: "Example mid-cycle purchase",
}),
createAccountActivityRecordedEvent({
  id: "fee-001",
  occurredOn: "2026-07-11",
  accountId: "card-apple",
  accountName: "Apple Card",
  activityType: "fee",
  postedDate: "2026-07-11",
  amount: 25,
  merchant: "Apple Card",
  category: "fees",
  description: "Example fee activity",
}),
createAccountActivityRecordedEvent({
  id: "refund-001",
  occurredOn: "2026-07-12",
  accountId: "card-apple",
  accountName: "Apple Card",
  activityType: "refund",
  postedDate: "2026-07-12",
  amount: -40,
  merchant: "Example Merchant",
  category: "shopping",
  description: "Example refund activity",
}),
createAccountActivityRecordedEvent({
  id: "interest-activity-001",
  occurredOn: "2026-07-13",
  accountId: "card-apple",
  accountName: "Apple Card",
  activityType: "interest",
  postedDate: "2026-07-13",
  amount: 4.36,
  merchant: "Apple Card",
  category: "interest",
  description: "Example daily interest activity",
}),
  ],
};
