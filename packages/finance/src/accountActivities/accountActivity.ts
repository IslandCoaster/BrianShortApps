export type AccountActivityType =
  | "purchase"
  | "payment"
  | "fee"
  | "interest"
  | "adjustment"
  | "refund"
  | "cash-advance"
  | "balance-transfer";

export type AccountActivity = {
  activityId: string;
  accountId: string;
  accountName: string;
  activityType: AccountActivityType;
  postedDate: string;
  amount: number;
  description: string;
  merchant?: string;
  category?: string;
};

export function createAccountActivity(activity: AccountActivity): AccountActivity {
  return activity;
}
