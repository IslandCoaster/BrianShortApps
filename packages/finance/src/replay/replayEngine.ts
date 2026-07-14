import { calculateAccountStates } from "../accounts/accountStateEngine";
import { calculateActiveAccountProfiles } from "../configuration/accountConfigurationEngine";
import { calculateCreditPosition } from "../credit/creditPositionEngine";
import { calculateDailyBalances } from "../dailyBalances/dailyBalanceEngine";
import { calculateFinancialState } from "../engine/financialEngine";
import { calculateGracePeriodStates } from "../gracePeriod/gracePeriodEngine";
import {
  calculateDailyInterestAccruals,
  calculateInterestStates,
} from "../interest/interestEngine";
import type { FinancialJournal } from "../journal/financialJournal";
import { calculateObligationStates } from "../obligations/obligationStateEngine";
import { calculateFinancialPositions } from "../positions/positionEngine";
import { generateFinancialRecommendations } from "../recommendations/recommendationEngine";
import type { ReplayRequest } from "./replayRequest";
import type { ReplayState } from "./replayState";

export function replayFinancialJournal(
  request: ReplayRequest,
): ReplayState {
  const journal: FinancialJournal = {
    ...request.baseJournal,
    events: [
      ...request.baseJournal.events,
      ...(request.temporaryEvents ?? []),
    ],
  };

  const accountProfiles = calculateActiveAccountProfiles(journal);
  const dailyBalances = calculateDailyBalances(journal);
  const dailyInterestTimeline = calculateDailyInterestAccruals(
    dailyBalances,
    accountProfiles[0]?.activeRuleSet.aprPercent ?? 0,
  );
  const gracePeriodStates = calculateGracePeriodStates(
    journal,
    accountProfiles,
  );
  const accountStates = calculateAccountStates(journal);
  const obligationStates = calculateObligationStates(journal);
  const creditPosition = calculateCreditPosition(accountStates);
  const interestStates = calculateInterestStates(
    journal,
    accountProfiles,
    dailyInterestTimeline,
  );
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