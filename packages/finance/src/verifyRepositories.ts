import { verifyFinancialRepositories } from "./repositories/financialRepositoryVerification";

await verifyFinancialRepositories();

console.log("Financial repository verification passed.");
