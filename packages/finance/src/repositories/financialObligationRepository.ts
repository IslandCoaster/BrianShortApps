import type { FinancialObligation } from "../obligations/financialObligation";

/**
 * Persistence port for the complete operational financial obligation
 * collection.
 *
 * Implementations store and restore obligations but do not seed records,
 * generate funding plans, or silently repair invalid data.
 */
export interface FinancialObligationRepository {
  load(): Promise<FinancialObligation[]>;

  save(obligations: readonly FinancialObligation[]): Promise<void>;

  clear(): Promise<void>;
}
