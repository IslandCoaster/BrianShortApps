import type { AccountActivity, AccountActivityType } from "../accountActivities/accountActivity";
import { createAccountActivity } from "../accountActivities/accountActivity";
import type { FinancialEvent } from "./financialEvent";

export type AccountActivityRecordedInput = {
  id: string;
  occurredOn: string;
  accountId: string;
  accountName: string;
  activityType: AccountActivityType;
  postedDate: string;
  amount: number;
  description: string;
  merchant?: string;
  category?: string;
};

export function createAccountActivityRecordedEvent(
  input: AccountActivityRecordedInput,
): FinancialEvent {
  const activity: AccountActivity = createAccountActivity({
    activityId: input.id,
    accountId: input.accountId,
    accountName: input.accountName,
    activityType: input.activityType,
    postedDate: input.postedDate,
    amount: input.amount,
    description: input.description,
    merchant: input.merchant,
    category: input.category,
  });

  return {
    id: input.id,
    type: "account-activity.recorded",
    category: input.activityType === "purchase" ? "spending" : "planning",
    occurredOn: input.occurredOn,
    description: input.description,
    amount: input.amount,
    metadata: {
      activityId: activity.activityId,
      accountId: activity.accountId,
      accountName: activity.accountName,
      activityType: activity.activityType,
      postedDate: activity.postedDate,
      amount: activity.amount,
      description: activity.description,
      merchant: activity.merchant ?? null,
      category: activity.category ?? null,
    },
  };
}
