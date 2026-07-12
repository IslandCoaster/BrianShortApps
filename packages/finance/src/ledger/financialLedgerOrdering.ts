import type { FinancialLedgerEvent } from "./financialLedgerEvent";

export function compareFinancialLedgerEvents(
  left: FinancialLedgerEvent,
  right: FinancialLedgerEvent,
): number {
  const occurredOnComparison = left.occurredOn.localeCompare(right.occurredOn);

  if (occurredOnComparison !== 0) {
    return occurredOnComparison;
  }

  const recordedAtComparison = left.recordedAt.localeCompare(right.recordedAt);

  if (recordedAtComparison !== 0) {
    return recordedAtComparison;
  }

  return left.id.localeCompare(right.id);
}

export function sortFinancialLedgerEvents(
  events: readonly FinancialLedgerEvent[],
): FinancialLedgerEvent[] {
  return [...events].sort(compareFinancialLedgerEvents);
}
