import type { FinancialEvent } from "../events/financialEvent";
import { calculateFinancialState } from "../engine/financialEngine";
import { createFinancialJournal } from "../journal/financialJournal";

export type FinancialScenario = {
  id: string;
  title: string;
  description: string;
  events: FinancialEvent[];
};

export function runFinancialScenario(scenario: FinancialScenario) {
  const journal = createFinancialJournal(scenario.events);
  const state = calculateFinancialState(journal);

  return {
    scenario,
    journal,
    state,
  };
}
