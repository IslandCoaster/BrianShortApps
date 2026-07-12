export type FundingSourceType = "opening-cash" | "paycheck";

export type FundingSource = {
  id: string;
  date: string;
  amount: number;
  type: FundingSourceType;
  title: string;
  description?: string;
};
