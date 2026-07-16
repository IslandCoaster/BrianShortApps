import type {
  FinancialAccount,
  FinancialAccountStatus,
  FinancialAccountType,
} from "./financialAccount";

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

function assertNonEmptyString(
  value: string,
  fieldName: string,
  accountId: string,
): void {
  if (value.trim().length === 0) {
    throw new Error(
      `Invalid financial account "${accountId}": ${fieldName} must not be empty.`,
    );
  }
}

function assertFiniteNonNegativeNumber(
  value: number,
  fieldName: string,
  accountId: string,
): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(
      `Invalid financial account "${accountId}": ${fieldName} must be a finite non-negative number.`,
    );
  }
}

function assertOptionalFiniteNonNegativeNumber(
  value: number | undefined,
  fieldName: string,
  accountId: string,
): void {
  if (value !== undefined) {
    assertFiniteNonNegativeNumber(value, fieldName, accountId);
  }
}

function assertOptionalNonEmptyString(
  value: string | undefined,
  fieldName: string,
  accountId: string,
): void {
  if (value !== undefined) {
    assertNonEmptyString(value, fieldName, accountId);
  }
}

export function assertValidFinancialAccount(account: FinancialAccount): void {
  if (!financialAccountTypes.includes(account.accountType)) {
    throw new Error(
      `Invalid financial account "${account.id}": unrecognized accountType.`,
    );
  }

  if (!financialAccountStatuses.includes(account.status)) {
    throw new Error(
      `Invalid financial account "${account.id}": unrecognized status.`,
    );
  }

  assertNonEmptyString(account.id, "id", account.id);
  assertNonEmptyString(account.name, "name", account.id);
  assertNonEmptyString(account.institutionName, "institutionName", account.id);
  assertNonEmptyString(account.createdAt, "createdAt", account.id);
  assertNonEmptyString(account.updatedAt, "updatedAt", account.id);

  assertOptionalNonEmptyString(
    account.accountSuffix,
    "accountSuffix",
    account.id,
  );

  assertOptionalNonEmptyString(account.notes, "notes", account.id);

  switch (account.accountType) {
    case "checking":
case "savings":
  assertFiniteNonNegativeNumber(
    account.currentBalance,
    "currentBalance",
    account.id,
  );

  assertOptionalFiniteNonNegativeNumber(
    account.recommendedMinimumBuffer,
    "recommendedMinimumBuffer",
    account.id,
  );

  return;

    case "credit-card":
      assertFiniteNonNegativeNumber(
        account.currentBalance,
        "currentBalance",
        account.id,
      );

      assertOptionalFiniteNonNegativeNumber(
        account.creditLimit,
        "creditLimit",
        account.id,
      );

      assertOptionalFiniteNonNegativeNumber(
        account.minimumPayment,
        "minimumPayment",
        account.id,
      );

      assertOptionalFiniteNonNegativeNumber(
        account.aprPercent,
        "aprPercent",
        account.id,
      );

      assertOptionalNonEmptyString(
        account.paymentDueDate,
        "paymentDueDate",
        account.id,
      );
      assertOptionalNonEmptyString(
        account.settlementAccountId,
        "settlementAccountId",
        account.id,
      );

      assertOptionalNonEmptyString(
        account.statementDate,
        "statementDate",
        account.id,
      );
      return;

    case "loan":
      assertFiniteNonNegativeNumber(
        account.currentPrincipal,
        "currentPrincipal",
        account.id,
      );

      assertOptionalFiniteNonNegativeNumber(
        account.originalPrincipal,
        "originalPrincipal",
        account.id,
      );

      assertOptionalFiniteNonNegativeNumber(
        account.minimumPayment,
        "minimumPayment",
        account.id,
      );

      assertOptionalFiniteNonNegativeNumber(
        account.interestRatePercent,
        "interestRatePercent",
        account.id,
      );

      assertOptionalNonEmptyString(
        account.paymentDueDate,
        "paymentDueDate",
        account.id,
      );

      assertOptionalNonEmptyString(
        account.settlementAccountId,
        "settlementAccountId",
        account.id,
      );

      assertOptionalNonEmptyString(
        account.maturityDate,
        "maturityDate",
        account.id,
      );
      return;
  }
}

export function assertUniqueFinancialAccountIds(
  accounts: readonly FinancialAccount[],
): void {
  const accountIds = new Set<string>();

  for (const account of accounts) {
    if (accountIds.has(account.id)) {
      throw new Error(
        `Invalid financial account collection: duplicate account id "${account.id}".`,
      );
    }

    accountIds.add(account.id);
  }
}
