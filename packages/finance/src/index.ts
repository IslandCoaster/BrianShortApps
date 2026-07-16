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

export {
  calculateDailyInterestAccruals,
  calculateInterestStates,
} from "./interest/interestEngine";

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

export {
  createAccountActivityRecordedEvent,
  type AccountActivityRecordedInput,
} from "./events/accountActivityEvents";

export {
  createDailyInterest,
  type DailyInterest,
} from "./interest/dailyInterest";

export { replayFinancialJournal } from "./replay/replayEngine";
export type { ReplayState } from "./replay/replayState";
export type { ReplayRequest } from "./replay/replayRequest";

export {
  simulatePayment,
  type PaymentSimulationInput,
  type PaymentSimulationResult,
} from "./simulation/paymentSimulation";

export * from "./cashFlow";
export * from "./ledger";

export * from "./repositories";

export * from "./accounts/financialAccount";
export * from "./accounts/financialAccountValidation";

export * from "./obligations/financialObligation";
export * from "./obligations/financialObligationValidation";

export * from "./repositories/financialAccountRepository";
export * from "./repositories/financialObligationRepository";
export * from "./repositories/localStorageFinancialAccountRepository";
export * from "./repositories/localStorageFinancialObligationRepository";
export * from "./repositories/financialAccountRepositoryVerification";
export * from "./repositories/financialObligationRepositoryVerification";
export * from "./repositories/financialRepositoryVerification";

export * from "./funding/fundingSource";
export * from "./funding/fundingSourceValidation";

export * from "./repositories/fundingSourceRepository";
export * from "./repositories/localStorageFundingSourceRepository";
export * from "./repositories/fundingSourceRepositoryVerification";

export * from "./funding/operationalFundingEngine";
export * from "./funding/operationalFundingEngineVerification";

export * from "./funding/operationalFundingTimeline";
export * from "./funding/operationalFundingTimelineVerification";

export * from "./funding/fundingDepositAllocation";
export * from "./funding/fundingDepositAllocationValidation";

export * from "./repositories/fundingDepositAllocationRepository";
export * from "./repositories/localStorageFundingDepositAllocationRepository";
export * from "./repositories/fundingDepositAllocationRepositoryVerification";

export * from "./funding/fundingAllocationProjection";
export * from "./funding/fundingAllocationProjectionVerification";

export * from "./projections/assetAccountProjection";
export * from "./projections/assetAccountProjectionVerification";
export * from "./projections/entries";

export * from "./projections/replay";

export * from "./projections/diagnostics";
