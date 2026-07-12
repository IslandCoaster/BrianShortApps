import type { FinancialEvent } from "../events/financialEvent";
import type { FinancialLedgerCategory } from "./financialLedgerCategory";

export type FinancialLedgerEventType =
  | "ledger.opening-cash"
  | "ledger.income"
  | "ledger.expense"
  | "ledger.payment"
  | "ledger.deposit"
  | "ledger.adjustment"
  | "ledger.correction";

export type FinancialLedgerEntryStatus = "planned" | "posted";

export type FinancialLedgerEvent = FinancialEvent & {
  type: FinancialLedgerEventType;
  category: "ledger";

  /**
   * Date on which the financial activity affects the operational ledger.
   *
   * This uses the existing FinancialEvent.occurredOn field so ledger events
   * remain compatible with the FinancialJournal and replay infrastructure.
   */
  occurredOn: string;

  /**
   * Timestamp at which the event was entered into the system.
   *
   * occurredOn and recordedAt intentionally represent different concepts.
   */
  recordedAt: string;

  ledgerCategory: FinancialLedgerCategory;
  status: FinancialLedgerEntryStatus;

  /**
   * Canonical ledger sign convention:
   *
   * Positive amounts increase operational cash.
   * Negative amounts decrease operational cash.
   */
  amount: number;

  accountId?: string;
  fundingPlanId?: string;
  correctionOfEventId?: string;
};

export type CreateFinancialLedgerEventInput = {
  id: string;
  ledgerCategory: FinancialLedgerCategory;
  occurredOn: string;
  recordedAt: string;
  status: FinancialLedgerEntryStatus;
  amount: number;
  description: string;
  accountId?: string;
  fundingPlanId?: string;
  correctionOfEventId?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

const ledgerEventTypeByCategory: Record<
  FinancialLedgerCategory,
  FinancialLedgerEventType
> = {
  "opening-cash": "ledger.opening-cash",
  income: "ledger.income",
  expense: "ledger.expense",
  payment: "ledger.payment",
  deposit: "ledger.deposit",
  adjustment: "ledger.adjustment",
  correction: "ledger.correction",
};

export function createFinancialLedgerEvent(
  input: CreateFinancialLedgerEventInput,
): FinancialLedgerEvent {
  return {
    id: input.id,
    type: ledgerEventTypeByCategory[input.ledgerCategory],
    category: "ledger",
    ledgerCategory: input.ledgerCategory,
    occurredOn: input.occurredOn,
    recordedAt: input.recordedAt,
    status: input.status,
    amount: input.amount,
    description: input.description,
    accountId: input.accountId,
    fundingPlanId: input.fundingPlanId,
    correctionOfEventId: input.correctionOfEventId,
    metadata: input.metadata,
  };
}

export function isFinancialLedgerEvent(
  event: FinancialEvent,
): event is FinancialLedgerEvent {
  return event.category === "ledger" && event.type.startsWith("ledger.");
}
