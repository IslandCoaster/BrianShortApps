import type { FundingDepositAllocation } from "../funding/fundingDepositAllocation";
import {
  assertUniqueFundingDepositAllocationIds,
  assertValidFundingDepositAllocation,
} from "../funding/fundingDepositAllocationValidation";
import type { FundingDepositAllocationRepository } from "./fundingDepositAllocationRepository";
import type { StorageLike } from "./storageLike";

export const FUNDING_DEPOSIT_ALLOCATION_STORAGE_KEY =
  "bsa.personal-finance.funding-deposit-allocations";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string";
}

function deserializeFundingDepositAllocation(
  value: unknown,
  index: number,
): FundingDepositAllocation {
  if (!isRecord(value)) {
    throw new Error(
      `Invalid persisted funding deposit allocation at index ${index}: expected an object.`,
    );
  }

  if (typeof value.id !== "string") {
    throw new Error(
      `Invalid persisted funding deposit allocation at index ${index}: id must be a string.`,
    );
  }

  if (typeof value.fundingSourceId !== "string") {
    throw new Error(
      `Invalid persisted funding deposit allocation "${value.id}": fundingSourceId must be a string.`,
    );
  }

  if (typeof value.destinationAccountId !== "string") {
    throw new Error(
      `Invalid persisted funding deposit allocation "${value.id}": destinationAccountId must be a string.`,
    );
  }

  if (typeof value.amount !== "number" || !Number.isFinite(value.amount)) {
    throw new Error(
      `Invalid persisted funding deposit allocation "${value.id}": amount must be a finite number.`,
    );
  }

  if (typeof value.createdAt !== "string") {
    throw new Error(
      `Invalid persisted funding deposit allocation "${value.id}": createdAt must be a string.`,
    );
  }

  if (typeof value.updatedAt !== "string") {
    throw new Error(
      `Invalid persisted funding deposit allocation "${value.id}": updatedAt must be a string.`,
    );
  }

  if (!isOptionalString(value.notes)) {
    throw new Error(
      `Invalid persisted funding deposit allocation "${value.id}": notes must be a string when present.`,
    );
  }

  const allocation: FundingDepositAllocation = {
    id: value.id,
    fundingSourceId: value.fundingSourceId,
    destinationAccountId: value.destinationAccountId,
    amount: value.amount,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    notes: value.notes,
  };

  assertValidFundingDepositAllocation(allocation);

  return allocation;
}

function deserializeFundingDepositAllocations(
  serializedAllocations: string,
): FundingDepositAllocation[] {
  let parsedAllocations: unknown;

  try {
    parsedAllocations = JSON.parse(serializedAllocations);
  } catch {
    throw new Error(
      "Unable to load funding deposit allocations because the persisted value is not valid JSON.",
    );
  }

  if (!Array.isArray(parsedAllocations)) {
    throw new Error(
      "Unable to load funding deposit allocations because the persisted value is not an allocation array.",
    );
  }

  const allocations = parsedAllocations.map(
    deserializeFundingDepositAllocation,
  );

  assertUniqueFundingDepositAllocationIds(allocations);

  return allocations;
}

export class LocalStorageFundingDepositAllocationRepository implements FundingDepositAllocationRepository {
  private readonly storage: StorageLike;
  private readonly storageKey: string;

  constructor(
    storage: StorageLike,
    storageKey: string = FUNDING_DEPOSIT_ALLOCATION_STORAGE_KEY,
  ) {
    this.storage = storage;
    this.storageKey = storageKey;
  }

  async load(): Promise<FundingDepositAllocation[]> {
    const serializedAllocations = this.storage.getItem(this.storageKey);

    if (serializedAllocations === null) {
      return [];
    }

    return deserializeFundingDepositAllocations(serializedAllocations);
  }

  async save(allocations: readonly FundingDepositAllocation[]): Promise<void> {
    allocations.forEach(assertValidFundingDepositAllocation);

    assertUniqueFundingDepositAllocationIds(allocations);

    this.storage.setItem(this.storageKey, JSON.stringify(allocations));
  }

  async clear(): Promise<void> {
    this.storage.removeItem(this.storageKey);
  }
}
