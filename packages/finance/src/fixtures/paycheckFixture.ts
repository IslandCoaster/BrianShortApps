import { runFinancialScenario } from "../scenarios/financialScenario";
import { singlePaycheckScenario } from "../scenarios/singlePaycheckScenario";

export const paycheckFixture = runFinancialScenario(singlePaycheckScenario);
