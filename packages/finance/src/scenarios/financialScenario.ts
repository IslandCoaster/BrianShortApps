import { calculateAccountStates } from "../accounts/accountStateEngine";
import { calculateCreditPosition } from "../credit/creditPositionEngine";
import type { FinancialEvent } from "../events/financialEvent";
import { calculateFinancialState } from "../engine/financialEngine";
import { createFinancialJournal } from "../journal/financialJournal";
import { calculateObligationStates } from "../obligations/obligationStateEngine";
import { calculateFinancialPositions } from "../positions/positionEngine";
import { generateFinancialRecommendations } from "../recommendations/recommendationEngine";

export type FinancialScenario = {
  id: string;
  title: string;
  description: string;
  events: FinancialEvent[];
};

export function runFinancialScenario(scenario: FinancialScenario) {
  const journal = createFinancialJournal(scenario.events);
  const accountStates = calculateAccountStates(journal);
  const obligationStates = calculateObligationStates(journal);
  const creditPosition = calculateCreditPosition(accountStates);
  const stateWithoutRecommendations = calculateFinancialState(journal);
  const positions = calculateFinancialPositions(stateWithoutRecommendations, accountStates);
  const recommendations = generateFinancialRecommendations(
    stateWithoutRecommendations,
    obligationStates,
  );

  const state = {
    ...stateWithoutRecommendations,
    recommendations,
  };

  return {
    scenario,
    journal,
    accountStates,
    obligationStates,
    creditPosition,
    positions,
    state,
  };
}
