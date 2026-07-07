import type { FinancialScenario } from "./financialScenario";
import { multiPaycheckScenario } from "./multiPaycheckScenario";
import { paycheckWithStatementScenario } from "./paycheckWithStatementScenario";
import { singlePaycheckScenario } from "./singlePaycheckScenario";

export const financialScenarioRegistry: FinancialScenario[] = [
  singlePaycheckScenario,
  multiPaycheckScenario,
  paycheckWithStatementScenario,
];

export function listFinancialScenarios() {
  return financialScenarioRegistry;
}

export function getFinancialScenario(scenarioId: string) {
  return financialScenarioRegistry.find((scenario) => scenario.id === scenarioId) ?? null;
}

export function getDefaultFinancialScenario() {
  return paycheckWithStatementScenario;
}
