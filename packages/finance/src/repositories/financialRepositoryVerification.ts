import { verifyFinancialAccountRepository } from "./financialAccountRepositoryVerification";
import { verifyFinancialLedgerRepository } from "./financialLedgerRepositoryVerification";
import { verifyFinancialObligationRepository } from "./financialObligationRepositoryVerification";

export async function verifyFinancialRepositories(): Promise<void> {
  await verifyFinancialLedgerRepository();
  await verifyFinancialAccountRepository();
  await verifyFinancialObligationRepository();
}
