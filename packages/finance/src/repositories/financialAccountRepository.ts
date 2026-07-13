import type { FinancialAccount } from "../accounts/financialAccount";

/**
 * Persistence port for the complete operational financial account collection.
 *
 * Implementations store and restore accounts but do not calculate balances,
 * seed records, replay financial history, or silently repair invalid data.
 */
export interface FinancialAccountRepository {
  load(): Promise<FinancialAccount[]>;

  save(accounts: readonly FinancialAccount[]): Promise<void>;

  clear(): Promise<void>;
}
