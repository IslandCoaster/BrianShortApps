@'
export type DailyBalance = {
  accountId: string;
  accountName: string;
  date: string;
  openingBalance: number;
  purchasesTotal: number;
  paymentsTotal: number;
  feesTotal: number;
  interestTotal: number;
  adjustmentsTotal: number;
  closingBalance: number;
  isGenerated: true;
};

export function createDailyBalance(input: Omit<DailyBalance, "isGenerated">): DailyBalance {
  return {
    ...input,
    isGenerated: true,
  };
}
'@ | Set-Content -Encoding utf8 packages/finance/src/dailyBalances/dailyBalance.ts