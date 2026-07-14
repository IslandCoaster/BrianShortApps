import { verifyFinancialAccountRepository } from "./financialAccountRepositoryVerification";
import { verifyFinancialLedgerRepository } from "./financialLedgerRepositoryVerification";
import { verifyFinancialObligationRepository } from "./financialObligationRepositoryVerification";
import { verifyFundingSourceRepository } from "./fundingSourceRepositoryVerification";
import { verifyOperationalFundingEngine } from "../funding/operationalFundingEngineVerification";
import { verifyOperationalFundingTimeline } from "../funding/operationalFundingTimelineVerification";
import { verifyFundingDepositAllocationRepository } from "./fundingDepositAllocationRepositoryVerification";
import { verifyFundingAllocationProjection } from "../funding/fundingAllocationProjectionVerification";
import { verifyAssetAccountProjection } from "../projections/assetAccountProjectionVerification";

export async function verifyFinancialRepositories(): Promise<void> {
  await verifyFinancialLedgerRepository();
  await verifyFinancialAccountRepository();
  await verifyFinancialObligationRepository();
  await verifyFundingSourceRepository();
  await verifyFundingDepositAllocationRepository();

  verifyOperationalFundingEngine();
  verifyOperationalFundingTimeline();
  verifyFundingAllocationProjection();
  verifyAssetAccountProjection();
}
