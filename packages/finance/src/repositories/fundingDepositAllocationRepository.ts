import type { FundingDepositAllocation } from "../funding/fundingDepositAllocation";

/**
 * Persistence port for the complete funding-deposit allocation collection.
 *
 * Implementations must not:
 *
 * - seed allocation records;
 * - silently repair invalid persisted data;
 * - create ledger events;
 * - modify financial accounts;
 * - infer destination accounts.
 */
export interface FundingDepositAllocationRepository {
  load(): Promise<FundingDepositAllocation[]>;

  save(allocations: readonly FundingDepositAllocation[]): Promise<void>;

  clear(): Promise<void>;
}
