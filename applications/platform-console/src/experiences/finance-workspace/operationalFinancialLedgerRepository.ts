import {
  LocalStorageFinancialLedgerRepository,
  type FinancialLedgerRepository,
} from "@bsa/finance";

let operationalFinancialLedgerRepository:
  | FinancialLedgerRepository
  | undefined;

/**
 * Application composition boundary for the operational ledger repository.
 *
 * Product components depend on the repository contract and do not read or
 * write browser storage directly.
 */
export function getOperationalFinancialLedgerRepository(): FinancialLedgerRepository {
  operationalFinancialLedgerRepository ??=
    new LocalStorageFinancialLedgerRepository(window.localStorage);

  return operationalFinancialLedgerRepository;
}
