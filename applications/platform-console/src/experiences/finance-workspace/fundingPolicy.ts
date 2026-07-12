export type FundingPolicy = {
  minimumCashReserve: number;
};

export const defaultFundingPolicy: FundingPolicy = {
  minimumCashReserve: 0,
};
