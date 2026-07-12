import type { FinancialLedgerCategory } from "../ledger/financialLedgerCategory";
import type {
  FinancialLedgerEntryStatus,
  FinancialLedgerEvent,
  FinancialLedgerEventType,
} from "../ledger/financialLedgerEvent";
import { assertValidFinancialLedgerEvent } from "../ledger/financialLedgerValidation";
import type { FinancialLedgerRepository } from "./financialLedgerRepository";
import type { StorageLike } from "./storageLike";

export const FINANCIAL_LEDGER_STORAGE_KEY =
  "bsa.personal-finance.ledger";

const financialLedgerCategories: readonly FinancialLedgerCategory[] = [
  "opening-cash",
  "income",
  "expense",
  "payment",
  "deposit",
  "adjustment",
  "correction",
];

const financialLedgerEventTypes: readonly FinancialLedgerEventType[] = [
  "ledger.opening-cash",
  "ledger.income",
  "ledger.expense",
  "ledger.payment",
  "ledger.deposit",
  "ledger.adjustment",
  "ledger.correction",
];

const financialLedgerEntryStatuses: readonly FinancialLedgerEntryStatus[] = [
  "planned",
  "posted",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string";
}

function isLedgerCategory(
  value: unknown,
): value is FinancialLedgerCategory {
  return (
    typeof value === "string" &&
    financialLedgerCategories.some((category) => category === value)
  );
}

function isLedgerEventType(
  value: unknown,
): value is FinancialLedgerEventType {
  return (
    typeof value === "string" &&
    financialLedgerEventTypes.some((eventType) => eventType === value)
  );
}

function isLedgerEntryStatus(
  value: unknown,
): value is FinancialLedgerEntryStatus {
  return (
    typeof value === "string" &&
    financialLedgerEntryStatuses.some((status) => status === value)
  );
}

function isMetadataValue(
  value: unknown,
): value is string | number | boolean | null {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  );
}

function isMetadata(
  value: unknown,
): value is Record<string, string | number | boolean | null> | undefined {
  if (value === undefined) {
    return true;
  }

  if (!isRecord(value)) {
    return false;
  }

  return Object.values(value).every(isMetadataValue);
}

function expectedEventType(
  category: FinancialLedgerCategory,
): FinancialLedgerEventType {
  return `ledger.${category}`;
}

function deserializeFinancialLedgerEvent(
  value: unknown,
  index: number,
): FinancialLedgerEvent {
  if (!isRecord(value)) {
    throw new Error(
      `Invalid persisted financial ledger event at index ${index}: expected an object.`,
    );
  }

  if (typeof value.id !== "string") {
    throw new Error(
      `Invalid persisted financial ledger event at index ${index}: id must be a string.`,
    );
  }

  if (value.category !== "ledger") {
    throw new Error(
      `Invalid persisted financial ledger event "${value.id}": category must be "ledger".`,
    );
  }

  if (!isLedgerCategory(value.ledgerCategory)) {
    throw new Error(
      `Invalid persisted financial ledger event "${value.id}": unrecognized ledgerCategory.`,
    );
  }

  if (!isLedgerEventType(value.type)) {
    throw new Error(
      `Invalid persisted financial ledger event "${value.id}": unrecognized event type.`,
    );
  }

  if (value.type !== expectedEventType(value.ledgerCategory)) {
    throw new Error(
      `Invalid persisted financial ledger event "${value.id}": event type does not match ledgerCategory.`,
    );
  }

  if (typeof value.occurredOn !== "string") {
    throw new Error(
      `Invalid persisted financial ledger event "${value.id}": occurredOn must be a string.`,
    );
  }

  if (typeof value.recordedAt !== "string") {
    throw new Error(
      `Invalid persisted financial ledger event "${value.id}": recordedAt must be a string.`,
    );
  }

  if (!isLedgerEntryStatus(value.status)) {
    throw new Error(
      `Invalid persisted financial ledger event "${value.id}": unrecognized status.`,
    );
  }

  if (typeof value.amount !== "number" || !Number.isFinite(value.amount)) {
    throw new Error(
      `Invalid persisted financial ledger event "${value.id}": amount must be a finite number.`,
    );
  }

  if (typeof value.description !== "string") {
    throw new Error(
      `Invalid persisted financial ledger event "${value.id}": description must be a string.`,
    );
  }

  if (!isOptionalString(value.accountId)) {
    throw new Error(
      `Invalid persisted financial ledger event "${value.id}": accountId must be a string when present.`,
    );
  }

  if (!isOptionalString(value.fundingPlanId)) {
    throw new Error(
      `Invalid persisted financial ledger event "${value.id}": fundingPlanId must be a string when present.`,
    );
  }

  if (!isOptionalString(value.correctionOfEventId)) {
    throw new Error(
      `Invalid persisted financial ledger event "${value.id}": correctionOfEventId must be a string when present.`,
    );
  }

  if (!isMetadata(value.metadata)) {
    throw new Error(
      `Invalid persisted financial ledger event "${value.id}": metadata contains an unsupported value.`,
    );
  }

  const event: FinancialLedgerEvent = {
    id: value.id,
    type: value.type,
    category: "ledger",
    ledgerCategory: value.ledgerCategory,
    occurredOn: value.occurredOn,
    recordedAt: value.recordedAt,
    status: value.status,
    amount: value.amount,
    description: value.description,
    accountId: value.accountId,
    fundingPlanId: value.fundingPlanId,
    correctionOfEventId: value.correctionOfEventId,
    metadata: value.metadata,
  };

  assertValidFinancialLedgerEvent(event);

  return event;
}

function deserializeFinancialLedger(
  serializedLedger: string,
): FinancialLedgerEvent[] {
  let parsedLedger: unknown;

  try {
    parsedLedger = JSON.parse(serializedLedger);
  } catch {
    throw new Error(
      "Unable to load the financial ledger because the persisted value is not valid JSON.",
    );
  }

  if (!Array.isArray(parsedLedger)) {
    throw new Error(
      "Unable to load the financial ledger because the persisted value is not an event array.",
    );
  }

  return parsedLedger.map(deserializeFinancialLedgerEvent);
}

/**
 * Local key-value storage implementation of the operational ledger repository.
 *
 * The storage dependency is injected so the finance package remains independent
 * of window, the DOM, and any specific runtime environment.
 */
export class LocalStorageFinancialLedgerRepository
  implements FinancialLedgerRepository
{
  private readonly storage: StorageLike;
  private readonly storageKey: string;

  constructor(
    storage: StorageLike,
    storageKey: string = FINANCIAL_LEDGER_STORAGE_KEY,
  ) {
    this.storage = storage;
    this.storageKey = storageKey;
  }

  async load(): Promise<FinancialLedgerEvent[]> {
    const serializedLedger = this.storage.getItem(this.storageKey);

    if (serializedLedger === null) {
      return [];
    }

    return deserializeFinancialLedger(serializedLedger);
  }

  async save(
    events: readonly FinancialLedgerEvent[],
  ): Promise<void> {
    events.forEach(assertValidFinancialLedgerEvent);

    this.storage.setItem(this.storageKey, JSON.stringify(events));
  }

  async clear(): Promise<void> {
    this.storage.removeItem(this.storageKey);
  }
}

