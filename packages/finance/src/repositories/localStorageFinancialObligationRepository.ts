import type {
  FinancialObligation,
  FinancialObligationStatus,
  FinancialObligationType,
  ObligationCadence,
  UtilityObligation,
} from "../obligations/financialObligation";
import {
  assertUniqueFinancialObligationIds,
  assertValidFinancialObligation,
} from "../obligations/financialObligationValidation";
import type { FinancialObligationRepository } from "./financialObligationRepository";
import type { StorageLike } from "./storageLike";

export const FINANCIAL_OBLIGATION_STORAGE_KEY =
  "bsa.personal-finance.obligations";

const financialObligationTypes: readonly FinancialObligationType[] = [
  "utility",
];

const financialObligationStatuses: readonly FinancialObligationStatus[] = [
  "active",
  "past-due",
  "satisfied",
  "cancelled",
];

const obligationCadences: readonly ObligationCadence[] = [
  "one-time",
  "weekly",
  "biweekly",
  "monthly",
  "quarterly",
  "annually",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string";
}

function isFinancialObligationType(
  value: unknown,
): value is FinancialObligationType {
  return (
    typeof value === "string" &&
    financialObligationTypes.some((obligationType) => obligationType === value)
  );
}

function isFinancialObligationStatus(
  value: unknown,
): value is FinancialObligationStatus {
  return (
    typeof value === "string" &&
    financialObligationStatuses.some((status) => status === value)
  );
}

function isObligationCadence(value: unknown): value is ObligationCadence {
  return (
    typeof value === "string" &&
    obligationCadences.some((cadence) => cadence === value)
  );
}

function deserializeFinancialObligation(
  value: unknown,
  index: number,
): FinancialObligation {
  if (!isRecord(value)) {
    throw new Error(
      `Invalid persisted financial obligation at index ${index}: expected an object.`,
    );
  }

  if (typeof value.id !== "string") {
    throw new Error(
      `Invalid persisted financial obligation at index ${index}: id must be a string.`,
    );
  }

  if (!isFinancialObligationType(value.obligationType)) {
    throw new Error(
      `Invalid persisted financial obligation "${value.id}": unrecognized obligationType.`,
    );
  }

  if (typeof value.name !== "string") {
    throw new Error(
      `Invalid persisted financial obligation "${value.id}": name must be a string.`,
    );
  }

  if (!isFinancialObligationStatus(value.status)) {
    throw new Error(
      `Invalid persisted financial obligation "${value.id}": unrecognized status.`,
    );
  }

  if (typeof value.createdAt !== "string") {
    throw new Error(
      `Invalid persisted financial obligation "${value.id}": createdAt must be a string.`,
    );
  }

  if (typeof value.updatedAt !== "string") {
    throw new Error(
      `Invalid persisted financial obligation "${value.id}": updatedAt must be a string.`,
    );
  }

  if (!isOptionalString(value.notes)) {
    throw new Error(
      `Invalid persisted financial obligation "${value.id}": notes must be a string when present.`,
    );
  }

  switch (value.obligationType) {
    case "utility": {
      if (typeof value.provider !== "string") {
        throw new Error(
          `Invalid persisted financial obligation "${value.id}": provider must be a string.`,
        );
      }

      if (
        typeof value.amountDue !== "number" ||
        !Number.isFinite(value.amountDue)
      ) {
        throw new Error(
          `Invalid persisted financial obligation "${value.id}": amountDue must be a finite number.`,
        );
      }

      if (!isOptionalString(value.dueDate)) {
        if (!isOptionalString(value.settlementAccountId)) {
  throw new Error(
    `Invalid persisted financial obligation "${value.id}": settlementAccountId must be a string when present.`,
  );
}
        throw new Error(
          `Invalid persisted financial obligation "${value.id}": dueDate must be a string when present.`,
        );
      }

      if (!isObligationCadence(value.cadence)) {
        throw new Error(
          `Invalid persisted financial obligation "${value.id}": unrecognized cadence.`,
        );
      }

      if (!isOptionalString(value.referenceNumber)) {
        throw new Error(
          `Invalid persisted financial obligation "${value.id}": referenceNumber must be a string when present.`,
        );
      }

      const settlementAccountId = value.settlementAccountId;

if (!isOptionalString(settlementAccountId)) {
  throw new Error(
    `Invalid persisted financial obligation "${value.id}": settlementAccountId must be a string when present.`,
  );
}
      const obligation: UtilityObligation = {
        id: value.id,
        obligationType: "utility",
        name: value.name,
        status: value.status,
        createdAt: value.createdAt,
        updatedAt: value.updatedAt,
        provider: value.provider,
        amountDue: value.amountDue,
        dueDate: value.dueDate,
        settlementAccountId: settlementAccountId,
        cadence: value.cadence,
        referenceNumber: value.referenceNumber,
        notes: value.notes,
      };

      assertValidFinancialObligation(obligation);

      return obligation;
    }
  }
}

function deserializeFinancialObligations(
  serializedObligations: string,
): FinancialObligation[] {
  let parsedObligations: unknown;

  try {
    parsedObligations = JSON.parse(serializedObligations);
  } catch {
    throw new Error(
      "Unable to load financial obligations because the persisted value is not valid JSON.",
    );
  }

  if (!Array.isArray(parsedObligations)) {
    throw new Error(
      "Unable to load financial obligations because the persisted value is not an obligation array.",
    );
  }

  const obligations = parsedObligations.map(deserializeFinancialObligation);

  assertUniqueFinancialObligationIds(obligations);

  return obligations;
}

/**
 * Local key-value storage implementation of the operational obligation
 * repository.
 */
export class LocalStorageFinancialObligationRepository implements FinancialObligationRepository {
  private readonly storage: StorageLike;
  private readonly storageKey: string;

  constructor(
    storage: StorageLike,
    storageKey: string = FINANCIAL_OBLIGATION_STORAGE_KEY,
  ) {
    this.storage = storage;
    this.storageKey = storageKey;
  }

  async load(): Promise<FinancialObligation[]> {
    const serializedObligations = this.storage.getItem(this.storageKey);

    if (serializedObligations === null) {
      return [];
    }

    return deserializeFinancialObligations(serializedObligations);
  }

  async save(obligations: readonly FinancialObligation[]): Promise<void> {
    obligations.forEach(assertValidFinancialObligation);
    assertUniqueFinancialObligationIds(obligations);

    this.storage.setItem(this.storageKey, JSON.stringify(obligations));
  }

  async clear(): Promise<void> {
    this.storage.removeItem(this.storageKey);
  }
}
