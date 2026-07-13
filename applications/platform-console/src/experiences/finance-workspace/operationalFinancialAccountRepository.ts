import {
  LocalStorageFinancialAccountRepository,
  type FinancialAccountRepository,
} from "@bsa/finance";

let operationalFinancialAccountRepository:
  | FinancialAccountRepository
  | undefined;

/**
 * Application composition boundary for the operational account repository.
 *
 * Product components depend on the repository contract and do not read or
 * write browser storage directly.
 */
export function getOperationalFinancialAccountRepository(): FinancialAccountRepository {
  operationalFinancialAccountRepository ??=
    new LocalStorageFinancialAccountRepository(window.localStorage);

  return operationalFinancialAccountRepository;
}
