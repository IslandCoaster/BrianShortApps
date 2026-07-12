import { createFinancialLedgerEvent } from "../ledger/financialLedgerEvent";
import {
  FINANCIAL_LEDGER_STORAGE_KEY,
  LocalStorageFinancialLedgerRepository,
} from "./localStorageFinancialLedgerRepository";
import type { StorageLike } from "./storageLike";

class InMemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

function assertEqual<T>(
  actual: T,
  expected: T,
  label: string,
): void {
  if (actual !== expected) {
    throw new Error(
      `${label}: expected ${String(expected)}, received ${String(actual)}.`,
    );
  }
}

async function assertRejects(
  action: () => Promise<unknown>,
  label: string,
): Promise<void> {
  try {
    await action();
  } catch {
    return;
  }

  throw new Error(`${label}: expected the operation to reject.`);
}

export async function verifyFinancialLedgerRepository(): Promise<void> {
  const storage = new InMemoryStorage();
  const repository = new LocalStorageFinancialLedgerRepository(storage);

  const emptyLedger = await repository.load();

  assertEqual(
    emptyLedger.length,
    0,
    "A repository with no persisted value returns an empty ledger",
  );

  const openingCash = createFinancialLedgerEvent({
    id: "repository-opening-cash",
    ledgerCategory: "opening-cash",
    occurredOn: "2026-07-12",
    recordedAt: "2026-07-12T12:00:00.000Z",
    status: "posted",
    amount: 2500,
    description: "Current cash position",
  });

  const plannedExpense = createFinancialLedgerEvent({
    id: "repository-planned-expense",
    ledgerCategory: "expense",
    occurredOn: "2026-07-14",
    recordedAt: "2026-07-12T12:05:00.000Z",
    status: "planned",
    amount: -125,
    description: "Planned utility payment",
  });

  await repository.save([openingCash, plannedExpense]);

  const restoredLedger = await repository.load();

  assertEqual(
    restoredLedger.length,
    2,
    "Saved ledger event count",
  );

  assertEqual(
    restoredLedger[0]?.id,
    openingCash.id,
    "First restored ledger event",
  );

  assertEqual(
    restoredLedger[1]?.id,
    plannedExpense.id,
    "Second restored ledger event",
  );

  assertEqual(
    restoredLedger[0]?.amount,
    openingCash.amount,
    "Restored opening cash amount",
  );

  assertEqual(
    restoredLedger[1]?.status,
    plannedExpense.status,
    "Restored planned event status",
  );

  await repository.save([plannedExpense]);

  const replacedLedger = await repository.load();

  assertEqual(
    replacedLedger.length,
    1,
    "Saving replaces the complete persisted ledger",
  );

  assertEqual(
    replacedLedger[0]?.id,
    plannedExpense.id,
    "Replacement ledger event",
  );

  await repository.clear();

  const clearedLedger = await repository.load();

  assertEqual(
    clearedLedger.length,
    0,
    "Cleared repository returns an empty ledger",
  );

  storage.setItem(
    FINANCIAL_LEDGER_STORAGE_KEY,
    "{not-valid-json",
  );

  await assertRejects(
    () => repository.load(),
    "Malformed JSON",
  );

  storage.setItem(
    FINANCIAL_LEDGER_STORAGE_KEY,
    JSON.stringify({ events: [] }),
  );

  await assertRejects(
    () => repository.load(),
    "Non-array persisted payload",
  );

  storage.setItem(
    FINANCIAL_LEDGER_STORAGE_KEY,
    JSON.stringify([
      {
        ...openingCash,
        ledgerCategory: "income",
        type: "ledger.income",
        amount: -50,
      },
    ]),
  );

  await assertRejects(
    () => repository.load(),
    "Domain-invalid persisted ledger event",
  );

  await assertRejects(
    () =>
      repository.save([
        {
          ...plannedExpense,
          amount: 125,
        },
      ]),
    "Domain-invalid ledger save",
  );
}
