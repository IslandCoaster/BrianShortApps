import type { FinancialObligation } from "../obligations/financialObligation";
import {
  FINANCIAL_OBLIGATION_STORAGE_KEY,
  LocalStorageFinancialObligationRepository,
} from "./localStorageFinancialObligationRepository";
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

function assertEqual<T>(actual: T, expected: T, label: string): void {
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

export async function verifyFinancialObligationRepository(): Promise<void> {
  const storage = new InMemoryStorage();
  const repository = new LocalStorageFinancialObligationRepository(storage);

  const emptyObligations = await repository.load();

  assertEqual(
    emptyObligations.length,
    0,
    "A repository with no persisted value returns an empty obligation collection",
  );

  const utilityObligation: FinancialObligation = {
    id: "utility-1",
    obligationType: "utility",
    name: "Electric Service",
    provider: "Example Electric",
    status: "active",
    amountDue: 145.5,
    dueDate: "2026-07-22",
    cadence: "monthly",
    referenceNumber: "ELEC-1234",
    createdAt: "2026-07-12T12:00:00.000Z",
    updatedAt: "2026-07-12T12:00:00.000Z",
  };

  await repository.save([utilityObligation]);

  const restoredObligations = await repository.load();

  const variableDateUtility: FinancialObligation = {
    id: "utility-variable-date",
    obligationType: "utility",
    name: "Variable Billing Utility",
    provider: "Example Utility",
    status: "active",
    amountDue: 95,
    cadence: "monthly",
    createdAt: "2026-07-13T12:00:00.000Z",
    updatedAt: "2026-07-13T12:00:00.000Z",
  };

  await repository.save([utilityObligation, variableDateUtility]);

  const restoredVariableDateObligations = await repository.load();

  assertEqual(
    restoredVariableDateObligations.length,
    2,
    "Utilities may be restored without a fixed next due date",
  );

  assertEqual(
    restoredVariableDateObligations[1]?.dueDate,
    undefined,
    "Variable-date utility has no required due date",
  );

  assertEqual(
    restoredObligations.length,
    1,
    "Saved financial obligation count",
  );

  assertEqual(
    restoredObligations[0]?.id,
    utilityObligation.id,
    "Restored utility obligation",
  );

  await repository.save([]);

  const replacedObligations = await repository.load();

  assertEqual(
    replacedObligations.length,
    0,
    "Saving replaces the complete persisted obligation collection",
  );

  await repository.save([utilityObligation]);
  await repository.clear();

  const clearedObligations = await repository.load();

  assertEqual(
    clearedObligations.length,
    0,
    "Cleared repository returns an empty obligation collection",
  );

  storage.setItem(FINANCIAL_OBLIGATION_STORAGE_KEY, "{not-valid-json");

  await assertRejects(() => repository.load(), "Malformed obligation JSON");

  storage.setItem(
    FINANCIAL_OBLIGATION_STORAGE_KEY,
    JSON.stringify({ obligations: [] }),
  );

  await assertRejects(() => repository.load(), "Non-array obligation payload");

  storage.setItem(
    FINANCIAL_OBLIGATION_STORAGE_KEY,
    JSON.stringify([
      {
        ...utilityObligation,
        cadence: "sometimes",
      },
    ]),
  );

  await assertRejects(
    () => repository.load(),
    "Unsupported obligation cadence",
  );

  await assertRejects(
    () =>
      repository.save([
        {
          ...utilityObligation,
          amountDue: -1,
        },
      ]),
    "Negative obligation amount",
  );
  await assertRejects(
    () =>
      repository.save([
        utilityObligation,
        {
          ...utilityObligation,
          name: "Duplicate Electric Service",
        },
      ]),
    "Duplicate obligation IDs on save",
  );

  storage.setItem(
    FINANCIAL_OBLIGATION_STORAGE_KEY,
    JSON.stringify([
      utilityObligation,
      {
        ...utilityObligation,
        name: "Persisted Duplicate Electric Service",
      },
    ]),
  );

  await assertRejects(
    () => repository.load(),
    "Duplicate persisted obligation IDs",
  );
}
