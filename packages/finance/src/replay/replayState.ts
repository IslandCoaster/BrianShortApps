import type { AccountProfile } from "../accountProfiles/accountProfile";
import type { AccountState } from "../accounts/accountState";
import type { CreditPosition } from "../credit/creditPosition";
import type { DailyBalance } from "../dailyBalances/dailyBalance";
import type { DailyInterest } from "../interest/dailyInterest";
import type { GracePeriodState } from "../gracePeriod/gracePeriodState";
import type { InterestState } from "../interest/interestState";
import type { FinancialJournal } from "../journal/financialJournal";
import type { FinancialLedgerReplayState } from "../ledger";
import type { ObligationState } from "../obligations/obligationState";
import type { FinancialPositions } from "../positions/financialPositions";
import type { FinancialState } from "../state/financialState";

export type ReplayState = {
  journal: FinancialJournal;
  ledger: FinancialLedgerReplayState;
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
