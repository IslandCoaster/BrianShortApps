import type { FinancialLedgerEvent } from "../ledger/financialLedgerEvent";

/**
 * Persistence port for the complete immutable operational ledger.
 *
 * Implementations store and restore ledger events but do not replay, sort,
 * repair, seed, or otherwise interpret financial history.
 */
export interface FinancialLedgerRepository {
  load(): Promise<FinancialLedgerEvent[]>;

  save(events: readonly FinancialLedgerEvent[]): Promise<void>;

  clear(): Promise<void>;
}
