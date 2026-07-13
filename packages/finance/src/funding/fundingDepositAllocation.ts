/**
 * Directs part of an incoming funding source into a specific asset account.
 *
 * A single funding source may have multiple allocations, allowing one
 * paycheck, refund, or deposit to be split across several accounts.
 *
 * This is a planning record. It does not itself create a ledger event or
 * modify an account balance.
 */
export type FundingDepositAllocation = {
  id: string;

  /**
   * Funding source whose incoming cash is being distributed.
   */
  fundingSourceId: string;

  /**
   * Asset account expected to receive this portion of the funding source.
   *
   * Cross-domain validation later confirms this references an active checking
   * or savings account.
   */
  destinationAccountId: string;

  /**
   * Positive amount expected to arrive in the destination account.
   */
  amount: number;

  createdAt: string;
  updatedAt: string;

  notes?: string;
};
