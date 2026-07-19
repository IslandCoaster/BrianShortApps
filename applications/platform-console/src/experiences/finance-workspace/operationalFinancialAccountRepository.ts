import type { FinancialAccountRepository } from "@bsa/finance";

import { CloudFinancialAccountRepository } from "./CloudFinancialAccountRepository";

let operationalFinancialAccountRepository:
  | FinancialAccountRepository
  | undefined;

/**
 * Application composition boundary for the operational account repository.
 */
export function getOperationalFinancialAccountRepository(): FinancialAccountRepository {
  operationalFinancialAccountRepository ??=
    new CloudFinancialAccountRepository();

  return operationalFinancialAccountRepository;
}