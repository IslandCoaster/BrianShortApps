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
  appendFinancialEvent,
  createFinancialJournal,
  type FinancialJournal,
} from "./journal/financialJournal";

export {
  calculateFinancialState,
} from "./engine/financialEngine";

export {
  createEmptyFinancialState,
  type FinancialRecommendation,
  type FinancialState,
  type PaycheckSummary,
} from "./state/financialState";

export {
  runFinancialScenario,
  type FinancialScenario,
} from "./scenarios/financialScenario";

export { singlePaycheckScenario } from "./scenarios/singlePaycheckScenario";
export { multiPaycheckScenario } from "./scenarios/multiPaycheckScenario";

export { paycheckFixture } from "./fixtures/paycheckFixture";
