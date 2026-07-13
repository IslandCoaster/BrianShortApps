import type { FundingDepositAllocation } from "../funding/fundingDepositAllocation";
import {
  FUNDING_DEPOSIT_ALLOCATION_STORAGE_KEY,
  LocalStorageFundingDepositAllocationRepository,
} from "./localStorageFundingDepositAllocationRepository";
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

export async function verifyFundingDepositAllocationRepository(): Promise<void> {
  const storage = new InMemoryStorage();

  const repository = new LocalStorageFundingDepositAllocationRepository(
    storage,
  );

  const emptyAllocations = await repository.load();

  assertEqual(
    emptyAllocations.length,
    0,
    "Repository with no persisted allocation value returns an empty collection",
  );

  const checkingAllocation: FundingDepositAllocation = {
    id: "allocation-checking",
    fundingSourceId: "paycheck-1",
    destinationAccountId: "checking-account-1",
    amount: 1800,
    createdAt: "2026-07-13T12:00:00.000Z",
    updatedAt: "2026-07-13T12:00:00.000Z",
  };

  const savingsAllocation: FundingDepositAllocation = {
    id: "allocation-savings",
    fundingSourceId: "paycheck-1",
    destinationAccountId: "savings-account-1",
    amount: 500,
    createdAt: "2026-07-13T12:01:00.000Z",
    updatedAt: "2026-07-13T12:01:00.000Z",
    notes: "Automatic payroll split",
  };

  await repository.save([checkingAllocation, savingsAllocation]);

  const restoredAllocations = await repository.load();

  assertEqual(restoredAllocations.length, 2, "Saved allocation count");

  assertEqual(
    restoredAllocations[0]?.fundingSourceId,
    checkingAllocation.fundingSourceId,
    "Restored funding source reference",
  );

  assertEqual(
    restoredAllocations[1]?.destinationAccountId,
    savingsAllocation.destinationAccountId,
    "Restored destination account reference",
  );

  assertEqual(
    restoredAllocations[1]?.amount,
    500,
    "Restored allocation amount",
  );

  await repository.save([checkingAllocation]);

  const replacedAllocations = await repository.load();

  assertEqual(
    replacedAllocations.length,
    1,
    "Saving replaces the complete allocation collection",
  );

  await repository.clear();

  const clearedAllocations = await repository.load();

  assertEqual(
    clearedAllocations.length,
    0,
    "Cleared repository returns an empty collection",
  );

  storage.setItem(FUNDING_DEPOSIT_ALLOCATION_STORAGE_KEY, "{not-valid-json");

  await assertRejects(() => repository.load(), "Malformed allocation JSON");

  storage.setItem(
    FUNDING_DEPOSIT_ALLOCATION_STORAGE_KEY,
    JSON.stringify({
      allocations: [],
    }),
  );

  await assertRejects(() => repository.load(), "Non-array allocation payload");

  await assertRejects(
    () =>
      repository.save([
        {
          ...checkingAllocation,
          amount: 0,
        },
      ]),
    "Zero allocation amount",
  );

  await assertRejects(
    () =>
      repository.save([
        {
          ...checkingAllocation,
          amount: -1,
        },
      ]),
    "Negative allocation amount",
  );

  await assertRejects(
    () =>
      repository.save([
        {
          ...checkingAllocation,
          destinationAccountId: "",
        },
      ]),
    "Empty destination account",
  );

  await assertRejects(
    () =>
      repository.save([
        checkingAllocation,
        {
          ...checkingAllocation,
          destinationAccountId: "another-account",
        },
      ]),
    "Duplicate allocation IDs on save",
  );

  storage.setItem(
    FUNDING_DEPOSIT_ALLOCATION_STORAGE_KEY,
    JSON.stringify([
      checkingAllocation,
      {
        ...checkingAllocation,
        amount: 300,
      },
    ]),
  );

  await assertRejects(
    () => repository.load(),
    "Duplicate persisted allocation IDs",
  );
}
