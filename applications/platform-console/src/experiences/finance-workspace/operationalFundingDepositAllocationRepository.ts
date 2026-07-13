import {
  LocalStorageFundingDepositAllocationRepository,
  type FundingDepositAllocationRepository,
} from "@bsa/finance";

let operationalFundingDepositAllocationRepository:
  | FundingDepositAllocationRepository
  | undefined;

/**
 * Application composition boundary for split incoming-cash destination
 * allocations.
 *
 * Product components depend on the repository contract and do not access
 * browser storage directly.
 */
export function getOperationalFundingDepositAllocationRepository(): FundingDepositAllocationRepository {
  operationalFundingDepositAllocationRepository ??=
    new LocalStorageFundingDepositAllocationRepository(window.localStorage);

  return operationalFundingDepositAllocationRepository;
}
