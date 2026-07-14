import type {
  FinancialObligation,
  FinancialObligationStatus,
  FinancialObligationType,
  ObligationCadence,
} from "./financialObligation";

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

function assertNonEmptyString(
  value: string,
  fieldName: string,
  obligationId: string,
): void {
  if (value.trim().length === 0) {
    throw new Error(
      `Invalid financial obligation "${obligationId}": ${fieldName} must not be empty.`,
    );
  }
}

function assertOptionalNonEmptyString(
  value: string | undefined,
  fieldName: string,
  obligationId: string,
): void {
  if (value !== undefined) {
    assertNonEmptyString(value, fieldName, obligationId);
  }
}

export function assertValidFinancialObligation(
  obligation: FinancialObligation,
): void {
  if (!financialObligationTypes.includes(obligation.obligationType)) {
    throw new Error(
      `Invalid financial obligation "${obligation.id}": unrecognized obligationType.`,
    );
  }

  if (!financialObligationStatuses.includes(obligation.status)) {
    throw new Error(
      `Invalid financial obligation "${obligation.id}": unrecognized status.`,
    );
  }

  assertNonEmptyString(obligation.id, "id", obligation.id);

  assertNonEmptyString(obligation.name, "name", obligation.id);

  assertNonEmptyString(obligation.createdAt, "createdAt", obligation.id);

  assertNonEmptyString(obligation.updatedAt, "updatedAt", obligation.id);

  assertOptionalNonEmptyString(obligation.notes, "notes", obligation.id);

  switch (obligation.obligationType) {
    case "utility":
      assertNonEmptyString(obligation.provider, "provider", obligation.id);

      if (!Number.isFinite(obligation.amountDue) || obligation.amountDue < 0) {
        throw new Error(
          `Invalid financial obligation "${obligation.id}": amountDue must be a finite non-negative number.`,
        );
      }

      assertOptionalNonEmptyString(
        obligation.dueDate,
        "dueDate",
        obligation.id,
      );

      assertOptionalNonEmptyString(
  obligation.settlementAccountId,
  "settlementAccountId",
  obligation.id,
);

      if (!obligationCadences.includes(obligation.cadence)) {
        throw new Error(
          `Invalid financial obligation "${obligation.id}": unrecognized cadence.`,
        );
      }

      assertOptionalNonEmptyString(
        obligation.referenceNumber,
        "referenceNumber",
        obligation.id,
      );
      return;
  }
}

export function assertUniqueFinancialObligationIds(
  obligations: readonly FinancialObligation[],
): void {
  const obligationIds = new Set<string>();

  for (const obligation of obligations) {
    if (obligationIds.has(obligation.id)) {
      throw new Error(
        `Invalid financial obligation collection: duplicate obligation id "${obligation.id}".`,
      );
    }

    obligationIds.add(obligation.id);
  }
}
