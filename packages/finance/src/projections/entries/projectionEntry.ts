export type ProjectionEntryType =
  | "funding-deposit"
  | "planned-settlement"
  | "planned-transfer-in"
  | "planned-transfer-out"
  | "projected-fee"
  | "projected-interest"
  | "projected-refund"
  | "manual-projection";

export type ProjectionEntryStatus =
  | "planned"
  | "partially-funded"
  | "blocked"
  | "simulated";

export type ProjectionEntrySourceType =
  | "funding-source"
  | "debt-account"
  | "financial-obligation"
  | "transfer-plan"
  | "simulation"
  | "manual";

export type ProjectionEntryMetadataValue =
  | string
  | number
  | boolean
  | undefined;

export type ProjectionEntry = {
  id: string;
  accountId: string;
  occurredOn: string;
  entryType: ProjectionEntryType;
  status: ProjectionEntryStatus;
  title: string;
  description?: string;
  amount: number;
  sourceType: ProjectionEntrySourceType;
  sourceId: string;
  sourceName?: string;
  priority: number;
  metadata?: Record<string, ProjectionEntryMetadataValue>;
};

export type ProjectionIssueCode =
  | "missing-account"
  | "inactive-account"
  | "invalid-account-type"
  | "missing-routing"
  | "invalid-routing"
  | "blocked-funding-source"
  | "missing-projection-date"
  | "invalid-amount";

export type ProjectionIssue = {
  code: ProjectionIssueCode;
  sourceType: ProjectionEntrySourceType;
  sourceId: string;
  sourceName?: string;
  message: string;
  accountId?: string;
};
