import { calculateAccountStates } from "../accounts/accountStateEngine";
import type { FinancialEvent } from "../events/financialEvent";
import { calculateFinancialState } from "../engine/financialEngine";
import { createFinancialJournal } from "../journal/financialJournal";
import { calculateFinancialPositions } from "../positions/positionEngine";

export type FinancialScenario = {
  id: string;
  title: string;
  description: string;
  events: FinancialEvent[];
};

export function runFinancialScenario(scenario: FinancialScenario) {
  const journal = createFinancialJournal(scenario.events);
  const accountStates = calculateAccountStates(journal);
  const state = calculateFinancialState(journal);
  const positions = calculateFinancialPositions(state, accountStates);

  return {
    scenario,
    journal,
    accountStates,
    positions,
    state,
  };
}
