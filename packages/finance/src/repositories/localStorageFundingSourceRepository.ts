import type {
  FundingSource,
  FundingSourceStatus,
  FundingSourceType,
  PaycheckFundingSource,
} from "../funding/fundingSource";
import {
  assertUniqueFundingSourceIds,
  assertValidFundingSource,
} from "../funding/fundingSourceValidation";
import type { FundingSourceRepository } from "./fundingSourceRepository";
import type { StorageLike } from "./storageLike";

export const FUNDING_SOURCE_STORAGE_KEY =
  "bsa.personal-finance.funding-sources";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string";
}

function isFundingSourceType(value: unknown): value is FundingSourceType {
  return (
    typeof value === "string" &&
    fundingSourceTypes.some((fundingSourceType) => fundingSourceType === value)
  );
}

function isFundingSourceStatus(value: unknown): value is FundingSourceStatus {
  return (
    typeof value === "string" &&
    fundingSourceStatuses.some((status) => status === value)
  );
}

function deserializeFundingSource(
  value: unknown,
  index: number,
): FundingSource {
  if (!isRecord(value)) {
    throw new Error(
      `Invalid persisted funding source at index ${index}: expected an object.`,
    );
  }

  if (typeof value.id !== "string") {
    throw new Error(
      `Invalid persisted funding source at index ${index}: id must be a string.`,
    );
  }

  if (!isFundingSourceType(value.fundingSourceType)) {
    throw new Error(
      `Invalid persisted funding source "${value.id}": unrecognized fundingSourceType.`,
    );
  }

  if (typeof value.title !== "string") {
    throw new Error(
      `Invalid persisted funding source "${value.id}": title must be a string.`,
    );
  }

  if (typeof value.amount !== "number" || !Number.isFinite(value.amount)) {
    throw new Error(
      `Invalid persisted funding source "${value.id}": amount must be a finite number.`,
    );
  }

  if (typeof value.expectedOn !== "string") {
    throw new Error(
      `Invalid persisted funding source "${value.id}": expectedOn must be a string.`,
    );
  }

  if (!isFundingSourceStatus(value.status)) {
    throw new Error(
      `Invalid persisted funding source "${value.id}": unrecognized status.`,
    );
  }

  if (typeof value.createdAt !== "string") {
    throw new Error(
      `Invalid persisted funding source "${value.id}": createdAt must be a string.`,
    );
  }

  if (typeof value.updatedAt !== "string") {
    throw new Error(
      `Invalid persisted funding source "${value.id}": updatedAt must be a string.`,
    );
  }

  if (!isOptionalString(value.notes)) {
    throw new Error(
      `Invalid persisted funding source "${value.id}": notes must be a string when present.`,
    );
  }

  const commonFields = {
    id: value.id,
    title: value.title,
    amount: value.amount,
    expectedOn: value.expectedOn,
    status: value.status,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    notes: value.notes,
  };

  let fundingSource: FundingSource;

  switch (value.fundingSourceType) {
    case "paycheck": {
      if (typeof value.employerName !== "string") {
        throw new Error(
          `Invalid persisted funding source "${value.id}": employerName must be a string.`,
        );
      }

      const paycheckFundingSource: PaycheckFundingSource = {
        ...commonFields,
        fundingSourceType: "paycheck",
        employerName: value.employerName,
      };

      fundingSource = paycheckFundingSource;
      break;
    }

    case "transfer":
      fundingSource = {
        ...commonFields,
        fundingSourceType: "transfer",
      };
      break;

    case "deposit":
      fundingSource = {
        ...commonFields,
        fundingSourceType: "deposit",
      };
      break;

    case "refund":
      fundingSource = {
        ...commonFields,
        fundingSourceType: "refund",
      };
      break;
  }

  assertValidFundingSource(fundingSource);

  return fundingSource;
}

function deserializeFundingSources(
  serializedFundingSources: string,
): FundingSource[] {
  let parsedFundingSources: unknown;

  try {
    parsedFundingSources = JSON.parse(serializedFundingSources);
  } catch {
    throw new Error(
      "Unable to load funding sources because the persisted value is not valid JSON.",
    );
  }

  if (!Array.isArray(parsedFundingSources)) {
    throw new Error(
      "Unable to load funding sources because the persisted value is not a funding source array.",
    );
  }

  const fundingSources = parsedFundingSources.map(deserializeFundingSource);

  assertUniqueFundingSourceIds(fundingSources);

  return fundingSources;
}

/**
 * Local key-value storage implementation of the operational funding source
 * repository.
 *
 * The storage dependency is injected so the finance package remains
 * independent of window, the DOM, and any specific runtime environment.
 */
export class LocalStorageFundingSourceRepository implements FundingSourceRepository {
  private readonly storage: StorageLike;
  private readonly storageKey: string;

  constructor(
    storage: StorageLike,
    storageKey: string = FUNDING_SOURCE_STORAGE_KEY,
  ) {
    this.storage = storage;
    this.storageKey = storageKey;
  }

  async load(): Promise<FundingSource[]> {
    const serializedFundingSources = this.storage.getItem(this.storageKey);

    if (serializedFundingSources === null) {
      return [];
    }

    return deserializeFundingSources(serializedFundingSources);
  }

  async save(fundingSources: readonly FundingSource[]): Promise<void> {
    fundingSources.forEach(assertValidFundingSource);

    assertUniqueFundingSourceIds(fundingSources);

    this.storage.setItem(this.storageKey, JSON.stringify(fundingSources));
  }

  async clear(): Promise<void> {
    this.storage.removeItem(this.storageKey);
  }
}
