export type {
  FinancialEvent,
  FinancialEventCategory,
  FinancialEventType,
} from "./events/financialEvent";

export {
  createPaycheckReceivedEvent,
  type PaycheckReceivedInput,
} from "./events/paycheckReceivedEvent";

export {
  createStatementGeneratedEvent,
  type StatementGeneratedInput,
} from "./events/statementGeneratedEvent";

export {
  createPaymentCompletedEvent,
  type PaymentCompletedInput,
} from "./events/paymentCompletedEvent";

export {
  appendFinancialEvent,
  createFinancialJournal,
  type FinancialJournal,
} from "./journal/financialJournal";

export { calculateFinancialState } from "./engine/financialEngine";

export { calculateAccountStates } from "./accounts/accountStateEngine";

export {
  createEmptyAccountState,
  type AccountState,
} from "./accounts/accountState";

export { calculateObligationStates } from "./obligations/obligationStateEngine";

export {
  createEmptyObligationState,
  type ObligationState,
} from "./obligations/obligationState";

export { calculateCreditPosition } from "./credit/creditPositionEngine";

export {
  createEmptyCreditPosition,
  DEFAULT_IDEAL_UTILIZATION,
  DEFAULT_OPERATIONAL_TARGET_UTILIZATION,
  type CreditPosition,
} from "./credit/creditPosition";

export {
  calculateCreditRisk,
  type CreditRisk,
  type CreditRiskLevel,
} from "./credit/creditRisk";

export { calculateFinancialPositions } from "./positions/positionEngine";

export type {
  CashPosition,
  CreditPosition as LegacyCreditPosition,
  FinancialPositions,
} from "./positions/financialPositions";

export { generateFinancialRecommendations } from "./recommendations/recommendationEngine";

export {
  createEmptyFinancialState,
  type FinancialRecommendation,
  type FinancialState,
  type PaycheckSummary,
  type PaymentSummary,
  type StatementSummary,
} from "./state/financialState";

export {
  runFinancialScenario,
  type FinancialScenario,
} from "./scenarios/financialScenario";

export {
  financialScenarioRegistry,
  getDefaultFinancialScenario,
  getFinancialScenario,
  listFinancialScenarios,
} from "./scenarios/scenario.registry";

export { singlePaycheckScenario } from "./scenarios/singlePaycheckScenario";
export { multiPaycheckScenario } from "./scenarios/multiPaycheckScenario";
export { paycheckWithStatementScenario } from "./scenarios/paycheckWithStatementScenario";
export { paycheckStatementPaymentScenario } from "./scenarios/paycheckStatementPaymentScenario";

export { paycheckFixture } from "./fixtures/paycheckFixture";

export type {
  AccountProfile,
  AccountRuleSet,
  InterestCalculationMethod,
} from "./accountProfiles/accountProfile";

export { appleCardProfile } from "./accountProfiles/appleCardProfile";

export {
  createAccountProfileCreatedEvent,
  type AccountProfileCreatedInput,
} from "./events/accountProfileEvents";

export { calculateActiveAccountProfiles } from "./configuration/accountConfigurationEngine";

export { calculateInterestStates } from "./interest/interestEngine";

export {
  createEmptyInterestState,
  type InterestLifecycleStatus,
  type InterestState,
} from "./interest/interestState";

export { calculateGracePeriodStates } from "./gracePeriod/gracePeriodEngine";

export {
  createEmptyGracePeriodState,
  type GracePeriodState,
  type GracePeriodStatus,
} from "./gracePeriod/gracePeriodState";

export { appleCardPaidInFullScenario } from "./scenarios/appleCardPaidInFullScenario";

export { calculateDailyBalances } from "./dailyBalances/dailyBalanceEngine";

export {
  createDailyBalance,
  type DailyBalance,
} from "./dailyBalances/dailyBalance";

export { appleCardMidCycleProjectionScenario } from "./scenarios/appleCardMidCycleProjectionScenario";

export {
  createAccountActivity,
  type AccountActivity,
  type AccountActivityType,
} from "./accountActivities/accountActivity";