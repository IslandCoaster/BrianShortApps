import {
  LocalStorageFundingSourceRepository,
  type FundingSourceRepository,
} from "@bsa/finance";

let operationalFundingSourceRepository: FundingSourceRepository | undefined;

/**
 * Application composition boundary for the operational funding source
 * repository.
 *
 * Product components depend on the repository contract and do not read or
 * write browser storage directly.
 */
export function getOperationalFundingSourceRepository(): FundingSourceRepository {
  operationalFundingSourceRepository ??=
    new LocalStorageFundingSourceRepository(window.localStorage);

  return operationalFundingSourceRepository;
}
