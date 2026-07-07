import { runFinancialScenario } from "../scenarios/financialScenario";
import { getDefaultFinancialScenario } from "../scenarios/scenario.registry";

export const paycheckFixture = runFinancialScenario(getDefaultFinancialScenario());
