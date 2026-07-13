export type FundingSourceType = "paycheck" | "transfer" | "deposit" | "refund";

export type FundingSourceStatus = "planned" | "received" | "cancelled";

export type BaseFundingSource = {
  id: string;
  fundingSourceType: FundingSourceType;

  /**
   * User-facing description of the expected incoming cash.
   *
   * Examples:
   * - American Airlines Paycheck
   * - Tax Refund
   * - Savings Transfer
   */
  title: string;

  /**
   * Expected or received net cash amount.
   *
   * Funding sources must be positive. Outgoing cash belongs to an obligation,
   * payment, expense, or another operational outflow domain.
   */
  amount: number;

  /**
   * Date on which the cash is expected to become available.
   *
   * For received sources, this remains the operational availability date.
   */
  expectedOn: string;

  status: FundingSourceStatus;

  createdAt: string;
  updatedAt: string;

  notes?: string;
};

export type PaycheckFundingSource = BaseFundingSource & {
  fundingSourceType: "paycheck";
  employerName: string;
};

export type TransferFundingSource = BaseFundingSource & {
  fundingSourceType: "transfer";
};

export type DepositFundingSource = BaseFundingSource & {
  fundingSourceType: "deposit";
};

export type RefundFundingSource = BaseFundingSource & {
  fundingSourceType: "refund";
};

export type FundingSource =
  | PaycheckFundingSource
  | TransferFundingSource
  | DepositFundingSource
  | RefundFundingSource;

export function isActiveFundingSource(fundingSource: FundingSource): boolean {
  return fundingSource.status !== "cancelled";
}

export function isPlannedFundingSource(fundingSource: FundingSource): boolean {
  return fundingSource.status === "planned";
}

export function isReceivedFundingSource(fundingSource: FundingSource): boolean {
  return fundingSource.status === "received";
}
