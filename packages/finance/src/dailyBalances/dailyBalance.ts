export type DailyBalance = {
  accountId: string;
  accountName: string;
  date: string;
  openingBalance: number;
  transactionTotal: number;
  paymentTotal: number;
  closingBalance: number;
};

export function createDailyBalance(input: DailyBalance): DailyBalance {
  return input;
}
