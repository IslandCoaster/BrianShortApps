import type { FinancialEvent } from "../events/financialEvent";
import type { FinancialJournal } from "../journal/financialJournal";

export type ReplayRequest = {
  baseJournal: FinancialJournal;
  temporaryEvents?: FinancialEvent[];
};
