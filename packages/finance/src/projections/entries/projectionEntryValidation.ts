import type {
  ProjectionEntry,
  ProjectionEntrySourceType,
  ProjectionEntryStatus,
  ProjectionEntryType,
  ProjectionIssue,
} from "./projectionEntry";

const projectionEntryTypes: readonly ProjectionEntryType[] = [
  "funding-deposit",
  "planned-settlement",
  "planned-transfer-in",
  "planned-transfer-out",
  "projected-fee",
  "projected-interest",
  "projected-refund",
  "manual-projection",
];

const projectionEntryStatuses: readonly ProjectionEntryStatus[] = [
  "planned",
  "partially-funded",
  "blocked",
  "simulated",
];

const projectionEntrySourceTypes: readonly ProjectionEntrySourceType[] = [
  "funding-source",
  "debt-account",
  "financial-obligation",
  "transfer-plan",
  "simulation",
  "manual",
];

function isCanonicalDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isNonEmptyString(value: string): boolean {
  return value.trim().length > 0;
}

export function validateProjectionEntry(
  entry: ProjectionEntry,
): ProjectionIssue[] {
  const issues: ProjectionIssue[] = [];

  function addIssue(
    code: ProjectionIssue["code"],
    message: string,
    accountId: string | undefined = entry.accountId || undefined,
  ) {
    issues.push({
      code,
      sourceType: entry.sourceType,
      sourceId: entry.sourceId,
      sourceName: entry.sourceName,
      message,
      accountId,
    });
  }

  if (!isNonEmptyString(entry.id)) {
    addIssue("invalid-routing", "Projection entry id must not be empty.");
  }

  if (!isNonEmptyString(entry.accountId)) {
    addIssue(
      "missing-account",
      `Projection entry "${entry.id}" must identify a target account.`,
      undefined,
    );
  }

  if (!isCanonicalDate(entry.occurredOn)) {
    addIssue(
      "missing-projection-date",
      `Projection entry "${entry.id}" must use a YYYY-MM-DD projected date.`,
    );
  }

  if (!projectionEntryTypes.includes(entry.entryType)) {
    addIssue(
      "invalid-routing",
      `Projection entry "${entry.id}" has an unrecognized entry type.`,
    );
  }

  if (!projectionEntryStatuses.includes(entry.status)) {
    addIssue(
      "invalid-routing",
      `Projection entry "${entry.id}" has an unrecognized status.`,
    );
  }

  if (!isNonEmptyString(entry.title)) {
    addIssue(
      "invalid-routing",
      `Projection entry "${entry.id}" title must not be empty.`,
    );
  }

  if (!Number.isFinite(entry.amount)) {
    addIssue(
      "invalid-amount",
      `Projection entry "${entry.id}" amount must be finite.`,
    );
  }

  if (!projectionEntrySourceTypes.includes(entry.sourceType)) {
    addIssue(
      "invalid-routing",
      `Projection entry "${entry.id}" has an unrecognized source type.`,
    );
  }

  if (!isNonEmptyString(entry.sourceId)) {
    addIssue(
      "invalid-routing",
      `Projection entry "${entry.id}" source id must not be empty.`,
    );
  }

  if (!Number.isInteger(entry.priority) || entry.priority < 0) {
    addIssue(
      "invalid-routing",
      `Projection entry "${entry.id}" priority must be a non-negative integer.`,
    );
  }

  return issues;
}

export function assertValidProjectionEntry(entry: ProjectionEntry): void {
  const issues = validateProjectionEntry(entry);

  if (issues.length > 0) {
    throw new Error(issues[0]?.message ?? "Invalid projection entry.");
  }
}

export function assertUniqueProjectionEntryIds(
  entries: readonly ProjectionEntry[],
): void {
  const entryIds = new Set<string>();

  entries.forEach((entry) => {
    if (entryIds.has(entry.id)) {
      throw new Error(
        `Invalid projection entry collection: duplicate entry id "${entry.id}".`,
      );
    }

    entryIds.add(entry.id);
  });
}
