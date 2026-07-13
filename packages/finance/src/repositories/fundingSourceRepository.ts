import type { FundingSource } from "../funding/fundingSource";

/**
 * Persistence port for the complete operational funding source collection.
 *
 * Implementations store and restore expected incoming cash but do not:
 *
 * - seed funding sources;
 * - generate ledger events;
 * - allocate cash;
 * - build funding plans;
 * - silently repair invalid persisted data.
 */
export interface FundingSourceRepository {
  load(): Promise<FundingSource[]>;

  save(fundingSources: readonly FundingSource[]): Promise<void>;

  clear(): Promise<void>;
}
