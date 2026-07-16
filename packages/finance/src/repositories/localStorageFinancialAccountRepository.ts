import type {
  CreditCardAccount,
  FinancialAccount,
  FinancialAccountStatus,
  FinancialAccountType,
  LoanAccount,
} from "../accounts/financialAccount";
import {
  assertUniqueFinancialAccountIds,
  assertValidFinancialAccount,
} from "../accounts/financialAccountValidation";
import type { FinancialAccountRepository } from "./financialAccountRepository";
import type { StorageLike } from "./storageLike";

export const FINANCIAL_ACCOUNT_STORAGE_KEY = "bsa.personal-finance.accounts";

const financialAccountTypes: readonly FinancialAccountType[] = [
  "checking",
  "savings",
  "credit-card",
  "loan",
];

const financialAccountStatuses: readonly FinancialAccountStatus[] = [
  "active",
  "past-due",
  "paid-off",
  "closed",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string";
}

function isOptionalFiniteNumber(value: unknown): value is number | undefined {
  return (
    value === undefined || (typeof value === "number" && Number.isFinite(value))
  );
}

function isFinancialAccountType(value: unknown): value is FinancialAccountType {
  return (
    typeof value === "string" &&
    financialAccountTypes.some((accountType) => accountType === value)
  );
}

function isFinancialAccountStatus(
  value: unknown,
): value is FinancialAccountStatus {
  return (
    typeof value === "string" &&
    financialAccountStatuses.some((status) => status === value)
  );
}

function assertCommonPersistedFields(
  value: Record<string, unknown>,
  index: number,
): asserts value is Record<string, unknown> & {
  id: string;
  accountType: FinancialAccountType;
  name: string;
  institutionName: string;
  status: FinancialAccountStatus;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  accountSuffix?: string;
} {
  if (typeof value.id !== "string") {
    throw new Error(
      `Invalid persisted financial account at index ${index}: id must be a string.`,
    );
  }

  if (!isFinancialAccountType(value.accountType)) {
    throw new Error(
      `Invalid persisted financial account "${value.id}": unrecognized accountType.`,
    );
  }

  if (typeof value.name !== "string") {
    throw new Error(
      `Invalid persisted financial account "${value.id}": name must be a string.`,
    );
  }

  if (typeof value.institutionName !== "string") {
    throw new Error(
      `Invalid persisted financial account "${value.id}": institutionName must be a string.`,
    );
  }

  if (!isFinancialAccountStatus(value.status)) {
    throw new Error(
      `Invalid persisted financial account "${value.id}": unrecognized status.`,
    );
  }

  if (typeof value.createdAt !== "string") {
    throw new Error(
      `Invalid persisted financial account "${value.id}": createdAt must be a string.`,
    );
  }

  if (typeof value.updatedAt !== "string") {
    throw new Error(
      `Invalid persisted financial account "${value.id}": updatedAt must be a string.`,
    );
  }

  if (!isOptionalString(value.notes)) {
    throw new Error(
      `Invalid persisted financial account "${value.id}": notes must be a string when present.`,
    );
  }

  if (!isOptionalString(value.accountSuffix)) {
    throw new Error(
      `Invalid persisted financial account "${value.id}": accountSuffix must be a string when present.`,
    );
  }
}

function deserializeFinancialAccount(
  value: unknown,
  index: number,
): FinancialAccount {
  if (!isRecord(value)) {
    throw new Error(
      `Invalid persisted financial account at index ${index}: expected an object.`,
    );
  }

  assertCommonPersistedFields(value, index);

  const commonFields = {
    id: value.id,
    accountType: value.accountType,
    name: value.name,
    institutionName: value.institutionName,
    status: value.status,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    accountSuffix: value.accountSuffix,
    notes: value.notes,
  };

  let account: FinancialAccount;

  switch (value.accountType) {
    case "checking":
case "savings": {
  if (
    typeof value.currentBalance !== "number" ||
    !Number.isFinite(value.currentBalance)
  ) {
    throw new Error(
      `Invalid persisted financial account "${value.id}": currentBalance must be a finite number.`,
    );
  }

  if (!isOptionalFiniteNumber(value.recommendedMinimumBuffer)) {
    throw new Error(
      `Invalid persisted financial account "${value.id}": recommendedMinimumBuffer must be a finite number when present.`,
    );
  }

  account = {
    ...commonFields,
    accountType: value.accountType,
    currentBalance: value.currentBalance,
    recommendedMinimumBuffer: value.recommendedMinimumBuffer,
  };

  break;
}

    case "credit-card": {
      if (
        typeof value.currentBalance !== "number" ||
        !Number.isFinite(value.currentBalance)
      ) {
        throw new Error(
          `Invalid persisted financial account "${value.id}": currentBalance must be a finite number.`,
        );
      }

      if (!isOptionalFiniteNumber(value.creditLimit)) {
        throw new Error(
          `Invalid persisted financial account "${value.id}": creditLimit must be a finite number when present.`,
        );
      }

      if (!isOptionalFiniteNumber(value.minimumPayment)) {
        throw new Error(
          `Invalid persisted financial account "${value.id}": minimumPayment must be a finite number when present.`,
        );
      }

      if (!isOptionalFiniteNumber(value.aprPercent)) {
        throw new Error(
          `Invalid persisted financial account "${value.id}": aprPercent must be a finite number when present.`,
        );
      }

      if (!isOptionalString(value.paymentDueDate)) {
  throw new Error(
    `Invalid persisted financial account "${value.id}": paymentDueDate must be a string when present.`,
  );
}

      if (!isOptionalString(value.statementDate)) {
        throw new Error(
          `Invalid persisted financial account "${value.id}": statementDate must be a string when present.`,
        );
      }

      const settlementAccountId = value.settlementAccountId;

      if (!isOptionalString(settlementAccountId)) {
        throw new Error(
          `Invalid persisted financial account "${value.id}": settlementAccountId must be a string when present.`,
        );
      }
      const creditCardAccount: CreditCardAccount = {
  ...commonFields,
  accountType: "credit-card",
  currentBalance: value.currentBalance,
  creditLimit: value.creditLimit,
  minimumPayment: value.minimumPayment,
  paymentDueDate: value.paymentDueDate,
  settlementAccountId,
  statementDate: value.statementDate,
  aprPercent: value.aprPercent,
};

      account = creditCardAccount;
      break;
    }

    case "loan": {
      if (
        typeof value.currentPrincipal !== "number" ||
        !Number.isFinite(value.currentPrincipal)
      ) {
        throw new Error(
          `Invalid persisted financial account "${value.id}": currentPrincipal must be a finite number.`,
        );
      }

      if (!isOptionalFiniteNumber(value.originalPrincipal)) {
        throw new Error(
          `Invalid persisted financial account "${value.id}": originalPrincipal must be a finite number when present.`,
        );
      }

      if (!isOptionalFiniteNumber(value.minimumPayment)) {
        throw new Error(
          `Invalid persisted financial account "${value.id}": minimumPayment must be a finite number when present.`,
        );
      }

      if (!isOptionalFiniteNumber(value.interestRatePercent)) {
        throw new Error(
          `Invalid persisted financial account "${value.id}": interestRatePercent must be a finite number when present.`,
        );
      }

      if (!isOptionalString(value.paymentDueDate)) {
  throw new Error(
    `Invalid persisted financial account "${value.id}": paymentDueDate must be a string when present.`,
  );
}

if (!isOptionalString(value.maturityDate)) {
  throw new Error(
    `Invalid persisted financial account "${value.id}": maturityDate must be a string when present.`,
  );
}

const settlementAccountId = value.settlementAccountId;

if (!isOptionalString(settlementAccountId)) {
  throw new Error(
    `Invalid persisted financial account "${value.id}": settlementAccountId must be a string when present.`,
  );
}

      const loanAccount: LoanAccount = {
  ...commonFields,
  accountType: "loan",
  currentPrincipal: value.currentPrincipal,
  originalPrincipal: value.originalPrincipal,
  minimumPayment: value.minimumPayment,
  paymentDueDate: value.paymentDueDate,
  settlementAccountId,
  interestRatePercent: value.interestRatePercent,
  maturityDate: value.maturityDate,
};

      account = loanAccount;
      break;
    }
  }

  assertValidFinancialAccount(account);

  return account;
}

function deserializeFinancialAccounts(
  serializedAccounts: string,
): FinancialAccount[] {
  let parsedAccounts: unknown;

  try {
    parsedAccounts = JSON.parse(serializedAccounts);
  } catch {
    throw new Error(
      "Unable to load financial accounts because the persisted value is not valid JSON.",
    );
  }

  if (!Array.isArray(parsedAccounts)) {
    throw new Error(
      "Unable to load financial accounts because the persisted value is not an account array.",
    );
  }

  const accounts = parsedAccounts.map(deserializeFinancialAccount);

  assertUniqueFinancialAccountIds(accounts);

  return accounts;
}

/**
 * Local key-value storage implementation of the operational account
 * repository.
 *
 * The storage dependency is injected so the finance package remains
 * independent of window, the DOM, and any specific runtime environment.
 */
export class LocalStorageFinancialAccountRepository implements FinancialAccountRepository {
  private readonly storage: StorageLike;
  private readonly storageKey: string;

  constructor(
    storage: StorageLike,
    storageKey: string = FINANCIAL_ACCOUNT_STORAGE_KEY,
  ) {
    this.storage = storage;
    this.storageKey = storageKey;
  }

  async load(): Promise<FinancialAccount[]> {
    const serializedAccounts = this.storage.getItem(this.storageKey);

    if (serializedAccounts === null) {
      return [];
    }

    return deserializeFinancialAccounts(serializedAccounts);
  }

  async save(accounts: readonly FinancialAccount[]): Promise<void> {
    accounts.forEach(assertValidFinancialAccount);
    assertUniqueFinancialAccountIds(accounts);

    this.storage.setItem(this.storageKey, JSON.stringify(accounts));
}

  async clear(): Promise<void> {
    this.storage.removeItem(this.storageKey);
  }
}
