import { verifyFinancialAccountRepository } from "./financialAccountRepositoryVerification";
import { verifyFinancialLedgerRepository } from "./financialLedgerRepositoryVerification";
import { verifyFinancialObligationRepository } from "./financialObligationRepositoryVerification";
import { verifyFundingSourceRepository } from "./fundingSourceRepositoryVerification";
import { verifyOperationalFundingEngine } from "../funding/operationalFundingEngineVerification";

export async function verifyFinancialRepositories(): Promise<void> {
  await verifyFinancialLedgerRepository();
  await verifyFinancialAccountRepository();
  await verifyFinancialObligationRepository();
  await verifyFundingSourceRepository();
  verifyOperationalFundingEngine();
}
