import {
  LocalStorageFinancialObligationRepository,
  type FinancialObligationRepository,
} from "@bsa/finance";

let operationalFinancialObligationRepository:
  | FinancialObligationRepository
  | undefined;

/**
 * Application composition boundary for the operational obligation repository.
 *
 * Product components depend on the repository contract and do not read or
 * write browser storage directly.
 */
export function getOperationalFinancialObligationRepository(): FinancialObligationRepository {
  operationalFinancialObligationRepository ??=
    new LocalStorageFinancialObligationRepository(window.localStorage);

  return operationalFinancialObligationRepository;
}
