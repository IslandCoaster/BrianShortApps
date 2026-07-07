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

export {
  calculateFinancialState,
} from "./engine/financialEngine";

export {
  calculateAccountStates,
} from "./accounts/accountStateEngine";

export {
  createEmptyAccountState,
  type AccountState,
} from "./accounts/accountState";

export {
  calculateFinancialPositions,
} from "./positions/positionEngine";

export type {
  CashPosition,
  CreditPosition,
  FinancialPositions,
} from "./positions/financialPositions";

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
