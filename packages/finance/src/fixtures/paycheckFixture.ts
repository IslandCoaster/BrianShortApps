import { runFinancialScenario } from "../scenarios/financialScenario";
import { multiPaycheckScenario } from "../scenarios/multiPaycheckScenario";

export const paycheckFixture = runFinancialScenario(multiPaycheckScenario);
