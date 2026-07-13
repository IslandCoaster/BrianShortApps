import type { FundingDepositAllocation } from "./fundingDepositAllocation";

function assertNonEmptyString(
  value: string,
  fieldName: string,
  allocationId: string,
): void {
  if (value.trim().length === 0) {
    throw new Error(
      `Invalid funding deposit allocation "${allocationId}": ${fieldName} must not be empty.`,
    );
  }
}

function assertOptionalNonEmptyString(
  value: string | undefined,
  fieldName: string,
  allocationId: string,
): void {
  if (value !== undefined) {
    assertNonEmptyString(value, fieldName, allocationId);
  }
}

export function assertValidFundingDepositAllocation(
  allocation: FundingDepositAllocation,
): void {
  assertNonEmptyString(allocation.id, "id", allocation.id);

  assertNonEmptyString(
    allocation.fundingSourceId,
    "fundingSourceId",
    allocation.id,
  );

  assertNonEmptyString(
    allocation.destinationAccountId,
    "destinationAccountId",
    allocation.id,
  );

  if (!Number.isFinite(allocation.amount) || allocation.amount <= 0) {
    throw new Error(
      `Invalid funding deposit allocation "${allocation.id}": amount must be a finite number greater than zero.`,
    );
  }

  assertNonEmptyString(allocation.createdAt, "createdAt", allocation.id);

  assertNonEmptyString(allocation.updatedAt, "updatedAt", allocation.id);

  assertOptionalNonEmptyString(allocation.notes, "notes", allocation.id);
}

export function assertUniqueFundingDepositAllocationIds(
  allocations: readonly FundingDepositAllocation[],
): void {
  const allocationIds = new Set<string>();

  for (const allocation of allocations) {
    if (allocationIds.has(allocation.id)) {
      throw new Error(
        `Invalid funding deposit allocation collection: duplicate allocation id "${allocation.id}".`,
      );
    }

    allocationIds.add(allocation.id);
  }
}
