import type { FinancialAccount } from "../accounts/financialAccount";
import {
  FINANCIAL_ACCOUNT_STORAGE_KEY,
  LocalStorageFinancialAccountRepository,
} from "./localStorageFinancialAccountRepository";
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

export async function verifyFinancialAccountRepository(): Promise<void> {
  const storage = new InMemoryStorage();
  const repository = new LocalStorageFinancialAccountRepository(storage);

  const emptyAccounts = await repository.load();

  assertEqual(
    emptyAccounts.length,
    0,
    "A repository with no persisted value returns an empty account collection",
  );

  const checkingAccount: FinancialAccount = {
    id: "checking-1",
    accountType: "checking",
    name: "Primary Checking",
    institutionName: "Example Bank",
    status: "active",
    currentBalance: 2500,
    accountSuffix: "1234",
    createdAt: "2026-07-12T12:00:00.000Z",
    updatedAt: "2026-07-12T12:00:00.000Z",
  };

  const creditCardAccount: FinancialAccount = {
    id: "credit-card-1",
    accountType: "credit-card",
    name: "Rewards Card",
    institutionName: "Example Credit",
    status: "active",
    currentBalance: 450,
    creditLimit: 5000,
    minimumPayment: 35,
    paymentDueDate: "2026-07-25",
    aprPercent: 24.99,
    createdAt: "2026-07-12T12:05:00.000Z",
    updatedAt: "2026-07-12T12:05:00.000Z",
  };

  await repository.save([checkingAccount, creditCardAccount]);

  const restoredAccounts = await repository.load();

  assertEqual(restoredAccounts.length, 2, "Saved financial account count");

  assertEqual(
    restoredAccounts[0]?.id,
    checkingAccount.id,
    "First restored account",
  );

  assertEqual(
    restoredAccounts[1]?.id,
    creditCardAccount.id,
    "Second restored account",
  );

  await repository.save([creditCardAccount]);

  const replacedAccounts = await repository.load();

  assertEqual(
    replacedAccounts.length,
    1,
    "Saving replaces the complete persisted account collection",
  );

  await repository.clear();

  const clearedAccounts = await repository.load();

  assertEqual(
    clearedAccounts.length,
    0,
    "Cleared repository returns an empty account collection",
  );

  storage.setItem(FINANCIAL_ACCOUNT_STORAGE_KEY, "{not-valid-json");

  await assertRejects(() => repository.load(), "Malformed account JSON");

  storage.setItem(
    FINANCIAL_ACCOUNT_STORAGE_KEY,
    JSON.stringify({ accounts: [] }),
  );

  await assertRejects(() => repository.load(), "Non-array account payload");

  storage.setItem(
    FINANCIAL_ACCOUNT_STORAGE_KEY,
    JSON.stringify([
      {
        ...checkingAccount,
        accountType: "unsupported-account",
      },
    ]),
  );

  await assertRejects(() => repository.load(), "Unsupported account type");

  storage.setItem(
    FINANCIAL_ACCOUNT_STORAGE_KEY,
    JSON.stringify([
      {
        ...checkingAccount,
        institutionName: undefined,
      },
    ]),
  );

  await assertRejects(() => repository.load(), "Missing institution name");

  await assertRejects(
    () =>
      repository.save([
        {
          ...creditCardAccount,
          currentBalance: -1,
        },
      ]),
    "Negative account balance",
  );
  await assertRejects(
    () =>
      repository.save([
        checkingAccount,
        {
          ...checkingAccount,
          name: "Duplicate Checking",
        },
      ]),
    "Duplicate account IDs on save",
  );

  storage.setItem(
    FINANCIAL_ACCOUNT_STORAGE_KEY,
    JSON.stringify([
      checkingAccount,
      {
        ...checkingAccount,
        name: "Persisted Duplicate Checking",
      },
    ]),
  );

  await assertRejects(
    () => repository.load(),
    "Duplicate persisted account IDs",
  );
}
