import type { FundingSource } from "../funding/fundingSource";
import {
  FUNDING_SOURCE_STORAGE_KEY,
  LocalStorageFundingSourceRepository,
} from "./localStorageFundingSourceRepository";
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

export async function verifyFundingSourceRepository(): Promise<void> {
  const storage = new InMemoryStorage();

  const repository = new LocalStorageFundingSourceRepository(storage);

  const emptyFundingSources = await repository.load();

  assertEqual(
    emptyFundingSources.length,
    0,
    "A repository with no persisted value returns an empty funding source collection",
  );

  const paycheck: FundingSource = {
    id: "funding-paycheck-1",
    fundingSourceType: "paycheck",
    title: "American Airlines Paycheck",
    employerName: "American Airlines",
    amount: 2400,
    expectedOn: "2026-07-15",
    status: "planned",
    createdAt: "2026-07-13T12:00:00.000Z",
    updatedAt: "2026-07-13T12:00:00.000Z",
  };

  const refund: FundingSource = {
    id: "funding-refund-1",
    fundingSourceType: "refund",
    title: "Travel Reimbursement",
    amount: 185.5,
    expectedOn: "2026-07-18",
    status: "planned",
    createdAt: "2026-07-13T12:05:00.000Z",
    updatedAt: "2026-07-13T12:05:00.000Z",
  };

  await repository.save([paycheck, refund]);

  const restoredFundingSources = await repository.load();

  assertEqual(restoredFundingSources.length, 2, "Saved funding source count");

  assertEqual(
    restoredFundingSources[0]?.id,
    paycheck.id,
    "First restored funding source",
  );

  assertEqual(
    restoredFundingSources[1]?.id,
    refund.id,
    "Second restored funding source",
  );

  assertEqual(
    restoredFundingSources[0]?.amount,
    paycheck.amount,
    "Restored paycheck amount",
  );

  assertEqual(
    restoredFundingSources[0]?.status,
    paycheck.status,
    "Restored paycheck status",
  );

  await repository.save([paycheck]);

  const replacedFundingSources = await repository.load();

  assertEqual(
    replacedFundingSources.length,
    1,
    "Saving replaces the complete persisted funding source collection",
  );

  await repository.clear();

  const clearedFundingSources = await repository.load();

  assertEqual(
    clearedFundingSources.length,
    0,
    "Cleared repository returns an empty funding source collection",
  );

  storage.setItem(FUNDING_SOURCE_STORAGE_KEY, "{not-valid-json");

  await assertRejects(() => repository.load(), "Malformed funding source JSON");

  storage.setItem(
    FUNDING_SOURCE_STORAGE_KEY,
    JSON.stringify({
      fundingSources: [],
    }),
  );

  await assertRejects(
    () => repository.load(),
    "Non-array funding source payload",
  );

  storage.setItem(
    FUNDING_SOURCE_STORAGE_KEY,
    JSON.stringify([
      {
        ...paycheck,
        fundingSourceType: "unsupported-source",
      },
    ]),
  );

  await assertRejects(
    () => repository.load(),
    "Unsupported funding source type",
  );

  storage.setItem(
    FUNDING_SOURCE_STORAGE_KEY,
    JSON.stringify([
      {
        ...paycheck,
        employerName: undefined,
      },
    ]),
  );

  await assertRejects(() => repository.load(), "Missing paycheck employer");

  await assertRejects(
    () =>
      repository.save([
        {
          ...paycheck,
          amount: 0,
        },
      ]),
    "Zero funding source amount",
  );

  await assertRejects(
    () =>
      repository.save([
        {
          ...paycheck,
          amount: -1,
        },
      ]),
    "Negative funding source amount",
  );

  await assertRejects(
    () =>
      repository.save([
        paycheck,
        {
          ...paycheck,
          title: "Duplicate Paycheck",
        },
      ]),
    "Duplicate funding source IDs on save",
  );

  storage.setItem(
    FUNDING_SOURCE_STORAGE_KEY,
    JSON.stringify([
      paycheck,
      {
        ...paycheck,
        title: "Persisted Duplicate Paycheck",
      },
    ]),
  );

  await assertRejects(
    () => repository.load(),
    "Duplicate persisted funding source IDs",
  );
}
