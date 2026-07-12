import type { FinancialLedgerEvent } from "./financialLedgerEvent";

export type FinancialLedgerValidationCode =
  | "missing-id"
  | "invalid-occurred-on"
  | "invalid-recorded-at"
  | "missing-description"
  | "invalid-amount"
  | "invalid-opening-cash-status"
  | "invalid-cash-inflow-amount"
  | "invalid-cash-outflow-amount"
  | "missing-correction-reference"
  | "unexpected-correction-reference"
  | "self-referencing-correction";

export type FinancialLedgerValidationIssue = {
  code: FinancialLedgerValidationCode;
  message: string;
};

function isValidCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function isValidTimestamp(value: string): boolean {
  return value.trim().length > 0 && !Number.isNaN(Date.parse(value));
}

export function validateFinancialLedgerEvent(
  event: FinancialLedgerEvent,
): FinancialLedgerValidationIssue[] {
  const issues: FinancialLedgerValidationIssue[] = [];

  if (event.id.trim().length === 0) {
    issues.push({
      code: "missing-id",
      message: "A financial ledger event must have an immutable identifier.",
    });
  }

  if (!isValidCalendarDate(event.occurredOn)) {
    issues.push({
      code: "invalid-occurred-on",
      message:
        "The ledger event occurredOn value must be a valid YYYY-MM-DD date.",
    });
  }

  if (!isValidTimestamp(event.recordedAt)) {
    issues.push({
      code: "invalid-recorded-at",
      message: "The ledger event recordedAt value must be a valid timestamp.",
    });
  }

  if (event.description.trim().length === 0) {
    issues.push({
      code: "missing-description",
      message: "A financial ledger event must have a description.",
    });
  }

  if (!Number.isFinite(event.amount)) {
    issues.push({
      code: "invalid-amount",
      message: "A financial ledger event amount must be a finite number.",
    });
  }

  if (event.ledgerCategory === "opening-cash" && event.status !== "posted") {
    issues.push({
      code: "invalid-opening-cash-status",
      message: "Opening cash must be recorded as a posted event.",
    });
  }

  if (
    (event.ledgerCategory === "income" || event.ledgerCategory === "deposit") &&
    event.amount <= 0
  ) {
    issues.push({
      code: "invalid-cash-inflow-amount",
      message:
        "Income and deposit events must use positive amounts because they increase cash.",
    });
  }

  if (
    (event.ledgerCategory === "expense" ||
      event.ledgerCategory === "payment") &&
    event.amount >= 0
  ) {
    issues.push({
      code: "invalid-cash-outflow-amount",
      message:
        "Expense and payment events must use negative amounts because they decrease cash.",
    });
  }

  if (event.ledgerCategory === "correction" && !event.correctionOfEventId) {
    issues.push({
      code: "missing-correction-reference",
      message: "A correction event must reference the event it corrects.",
    });
  }

  if (event.ledgerCategory !== "correction" && event.correctionOfEventId) {
    issues.push({
      code: "unexpected-correction-reference",
      message: "Only correction events may contain correctionOfEventId.",
    });
  }

  if (event.correctionOfEventId && event.correctionOfEventId === event.id) {
    issues.push({
      code: "self-referencing-correction",
      message: "A correction event cannot correct itself.",
    });
  }

  return issues;
}

export function isValidFinancialLedgerEvent(
  event: FinancialLedgerEvent,
): boolean {
  return validateFinancialLedgerEvent(event).length === 0;
}

export function assertValidFinancialLedgerEvent(
  event: FinancialLedgerEvent,
): void {
  const issues = validateFinancialLedgerEvent(event);

  if (issues.length === 0) {
    return;
  }

  const issueSummary = issues
    .map((issue) => `${issue.code}: ${issue.message}`)
    .join("\n");

  throw new Error(
    `Invalid financial ledger event "${event.id}":\n${issueSummary}`,
  );
}
