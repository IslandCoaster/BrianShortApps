import type {
  FundingSource,
  FundingSourceStatus,
  FundingSourceType,
} from "./fundingSource";

const fundingSourceTypes: readonly FundingSourceType[] = [
  "paycheck",
  "transfer",
  "deposit",
  "refund",
];

const fundingSourceStatuses: readonly FundingSourceStatus[] = [
  "planned",
  "received",
  "cancelled",
];

function assertNonEmptyString(
  value: string,
  fieldName: string,
  fundingSourceId: string,
): void {
  if (value.trim().length === 0) {
    throw new Error(
      `Invalid funding source "${fundingSourceId}": ${fieldName} must not be empty.`,
    );
  }
}

function assertOptionalNonEmptyString(
  value: string | undefined,
  fieldName: string,
  fundingSourceId: string,
): void {
  if (value !== undefined) {
    assertNonEmptyString(value, fieldName, fundingSourceId);
  }
}

export function assertValidFundingSource(fundingSource: FundingSource): void {
  if (!fundingSourceTypes.includes(fundingSource.fundingSourceType)) {
    throw new Error(
      `Invalid funding source "${fundingSource.id}": unrecognized fundingSourceType.`,
    );
  }

  if (!fundingSourceStatuses.includes(fundingSource.status)) {
    throw new Error(
      `Invalid funding source "${fundingSource.id}": unrecognized status.`,
    );
  }

  assertNonEmptyString(fundingSource.id, "id", fundingSource.id);

  assertNonEmptyString(fundingSource.title, "title", fundingSource.id);

  if (!Number.isFinite(fundingSource.amount) || fundingSource.amount <= 0) {
    throw new Error(
      `Invalid funding source "${fundingSource.id}": amount must be a finite number greater than zero.`,
    );
  }

  assertNonEmptyString(
    fundingSource.expectedOn,
    "expectedOn",
    fundingSource.id,
  );

  assertNonEmptyString(fundingSource.createdAt, "createdAt", fundingSource.id);

  assertNonEmptyString(fundingSource.updatedAt, "updatedAt", fundingSource.id);

  assertOptionalNonEmptyString(fundingSource.notes, "notes", fundingSource.id);

  switch (fundingSource.fundingSourceType) {
    case "paycheck":
      assertNonEmptyString(
        fundingSource.employerName,
        "employerName",
        fundingSource.id,
      );
      return;

    case "transfer":
    case "deposit":
    case "refund":
      return;
  }
}

export function assertUniqueFundingSourceIds(
  fundingSources: readonly FundingSource[],
): void {
  const fundingSourceIds = new Set<string>();

  for (const fundingSource of fundingSources) {
    if (fundingSourceIds.has(fundingSource.id)) {
      throw new Error(
        `Invalid funding source collection: duplicate funding source id "${fundingSource.id}".`,
      );
    }

    fundingSourceIds.add(fundingSource.id);
  }
}
