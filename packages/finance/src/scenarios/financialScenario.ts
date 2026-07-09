import { calculateAccountStates } from "../accounts/accountStateEngine";
import { calculateActiveAccountProfiles } from "../configuration/accountConfigurationEngine";
import { calculateCreditPosition } from "../credit/creditPositionEngine";
import type { FinancialEvent } from "../events/financialEvent";
import { calculateFinancialState } from "../engine/financialEngine";
import { calculateInterestStates } from "../interest/interestEngine";
import { createFinancialJournal } from "../journal/financialJournal";
import { calculateObligationStates } from "../obligations/obligationStateEngine";
import { calculateFinancialPositions } from "../positions/positionEngine";
import { generateFinancialRecommendations } from "../recommendations/recommendationEngine";
import { calculateGracePeriodStates } from "../gracePeriod/gracePeriodEngine";
import { calculateDailyBalances } from "../dailyBalances/dailyBalanceEngine";
import { calculateDailyInterestAccruals } from "../interest/interestEngine";

export type FinancialScenario = {
  id: string;
  title: string;
  description: string;
  events: FinancialEvent[];
};

export function runFinancialScenario(scenario: FinancialScenario) {
  const journal = createFinancialJournal(scenario.events);
  const dailyBalances = calculateDailyBalances(journal);
  const dailyInterestTimeline = calculateDailyInterestAccruals(
  dailyBalances,
  accountProfiles[0]?.activeRuleSet.aprPercent ?? 0,
);
  const accountProfiles = calculateActiveAccountProfiles(journal);
  const gracePeriodStates = calculateGracePeriodStates(
    journal,
    accountProfiles,
  );
  const accountStates = calculateAccountStates(journal);
  const obligationStates = calculateObligationStates(journal);
  const creditPosition = calculateCreditPosition(accountStates);
  const interestStates = calculateInterestStates(journal, accountProfiles);
  const stateWithoutRecommendations = calculateFinancialState(journal);
  const positions = calculateFinancialPositions(
    stateWithoutRecommendations,
    accountStates,
  );
  const recommendations = generateFinancialRecommendations(
    stateWithoutRecommendations,
    obligationStates,
    creditPosition,
    gracePeriodStates,
  );

  const state = {
    ...stateWithoutRecommendations,
    recommendations,
  };

  return {
    scenario,
    journal,
    dailyBalances,
    dailyInterestTimeline,
    accountProfiles,
    gracePeriodStates,
    accountStates,
    obligationStates,
    creditPosition,
    interestStates,
    positions,
    state,
  };
}
