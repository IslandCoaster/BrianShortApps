export type DailyInterest = {
  accountId: string;
  accountName: string;
  date: string;
  closingBalance: number;
  accruedInterest: number;
  runningAccruedInterest: number;
};

export function createDailyInterest(input: DailyInterest): DailyInterest {
  return input;
}
