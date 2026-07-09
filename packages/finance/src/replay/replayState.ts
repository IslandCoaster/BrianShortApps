import type { AccountProfile } from "../accountProfiles/accountProfile";
import type { AccountState } from "../accounts/accountState";
import type { CreditPosition } from "../credit/creditPosition";
import type { DailyBalance } from "../dailyBalances/dailyBalance";
import type { DailyInterest } from "../interest/dailyInterest";
import type { GracePeriodState } from "../gracePeriod/gracePeriodState";
import type { FinancialJournal } from "../journal/financialJournal";
import type { ObligationState } from "../obligations/obligationState";
import type { FinancialPositions } from "../positions/financialPositions";
import type { FinancialState } from "../state/financialState";
import type { InterestState } from "../interest/interestState";

export type ReplayState = {
  journal: FinancialJournal;
  dailyBalances: DailyBalance[];
  dailyInterestTimeline: DailyInterest[];
  accountProfiles: AccountProfile[];
  gracePeriodStates: GracePeriodState[];
  accountStates: AccountState[];
  obligationStates: ObligationState[];
  creditPosition: CreditPosition;
  interestStates: InterestState[];
  positions: FinancialPositions;
  state: FinancialState;
};
