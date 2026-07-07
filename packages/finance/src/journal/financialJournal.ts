import type { FinancialEvent } from "../events/financialEvent";

export type FinancialJournal = {
  events: FinancialEvent[];
};

export function createFinancialJournal(events: FinancialEvent[] = []): FinancialJournal {
  return {
    events: [...events].sort((a, b) => a.occurredOn.localeCompare(b.occurredOn)),
  };
}

export function appendFinancialEvent(
  journal: FinancialJournal,
  event: FinancialEvent,
): FinancialJournal {
  return createFinancialJournal([...journal.events, event]);
}
