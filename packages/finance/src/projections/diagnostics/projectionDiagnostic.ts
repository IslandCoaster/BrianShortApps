import type { FundingAllocationIssue } from "../../funding/fundingAllocationProjection";
import type { ProjectionIssue } from "../entries/projectionEntry";
import type { BlockedFundingDepositSource } from "../entries/fundingDepositProjection";

export type ProjectionDiagnosticSeverity =
  | "attention"
  | "blocking";

export type ProjectionDiagnosticCategory =
  | "funding-routing"
  | "settlement-routing"
  | "orphaned-record";

export type ProjectionDiagnosticCode =
  | "blocked-funding-source"
  | "missing-funding-source"
  | "missing-destination-account"
  | "inactive-destination-account"
  | "non-asset-destination-account"
  | "duplicate-destination-allocation"
  | "missing-settlement-account"
  | "missing-settlement-route"
  | "invalid-settlement-route"
  | "inactive-settlement-account"
  | "invalid-settlement-account-type";

export type ProjectionDiagnostic = {
  id: string;
  code: ProjectionDiagnosticCode;
  category: ProjectionDiagnosticCategory;
  severity: ProjectionDiagnosticSeverity;
  title: string;
  message: string;
  sourceId: string;
  sourceName?: string;
  accountId?: string;
};

export type ProjectionDiagnosticSummary = {
  diagnostics: ProjectionDiagnostic[];
  blockingCount: number;
  attentionCount: number;
  canProjectCompletely: boolean;
};

export type ProjectionDiagnosticRequest = {
  blockedFundingSources: readonly BlockedFundingDepositSource[];
  orphanedFundingIssues: readonly FundingAllocationIssue[];
  settlementIssues: readonly ProjectionIssue[];
};

function mapBlockedFundingSource(
  source: BlockedFundingDepositSource,
): ProjectionDiagnostic {
  return {
    id: `blocked-funding-source-${source.fundingSourceId}`,
    code: "blocked-funding-source",
    category: "funding-routing",
    severity: "blocking",
    title: source.fundingSourceTitle,
    message:
      `Funding source "${source.fundingSourceTitle}" cannot be projected ` +
      `until its deposit routing is complete and valid.`,
    sourceId: source.fundingSourceId,
    sourceName: source.fundingSourceTitle,
  };
}

function mapOrphanedFundingIssue(
  issue: FundingAllocationIssue,
  index: number,
): ProjectionDiagnostic {
  const code: ProjectionDiagnosticCode =
    issue.code === "missing-funding-source"
      ? "missing-funding-source"
      : issue.code;

  return {
    id:
      `orphaned-funding-${issue.fundingSourceId}-` +
      `${issue.allocationId ?? index}`,
    code,
    category: "orphaned-record",
    severity: "blocking",
    title: "Orphaned funding allocation",
    message: issue.message,
    sourceId: issue.fundingSourceId,
  };
}

function mapSettlementIssue(
  issue: ProjectionIssue,
  index: number,
): ProjectionDiagnostic {
  switch (issue.code) {
    case "missing-account":
      return {
        id: `settlement-missing-account-${issue.sourceId}-${index}`,
        code: "missing-settlement-account",
        category: "settlement-routing",
        severity: "blocking",
        title: issue.sourceName ?? "Missing debt account",
        message: issue.message,
        sourceId: issue.sourceId,
        sourceName: issue.sourceName,
        accountId: issue.accountId,
      };

    case "missing-routing":
      return {
        id: `settlement-missing-route-${issue.sourceId}-${index}`,
        code: "missing-settlement-route",
        category: "settlement-routing",
        severity: "attention",
        title: issue.sourceName ?? "Settlement routing required",
        message: issue.message,
        sourceId: issue.sourceId,
        sourceName: issue.sourceName,
        accountId: issue.accountId,
      };

    case "inactive-account":
      return {
        id: `settlement-inactive-account-${issue.sourceId}-${index}`,
        code: "inactive-settlement-account",
        category: "settlement-routing",
        severity: "blocking",
        title: issue.sourceName ?? "Inactive settlement account",
        message: issue.message,
        sourceId: issue.sourceId,
        sourceName: issue.sourceName,
        accountId: issue.accountId,
      };

    case "invalid-account-type":
      return {
        id: `settlement-invalid-account-type-${issue.sourceId}-${index}`,
        code: "invalid-settlement-account-type",
        category: "settlement-routing",
        severity: "blocking",
        title: issue.sourceName ?? "Invalid settlement account",
        message: issue.message,
        sourceId: issue.sourceId,
        sourceName: issue.sourceName,
        accountId: issue.accountId,
      };

    default:
      return {
        id: `settlement-invalid-route-${issue.sourceId}-${index}`,
        code: "invalid-settlement-route",
        category: "settlement-routing",
        severity: "blocking",
        title: issue.sourceName ?? "Invalid settlement routing",
        message: issue.message,
        sourceId: issue.sourceId,
        sourceName: issue.sourceName,
        accountId: issue.accountId,
      };
  }
}

function compareDiagnostics(
  left: ProjectionDiagnostic,
  right: ProjectionDiagnostic,
): number {
  if (left.severity !== right.severity) {
    return left.severity === "blocking" ? -1 : 1;
  }

  const categoryComparison = left.category.localeCompare(right.category);

  if (categoryComparison !== 0) {
    return categoryComparison;
  }

  const titleComparison = left.title.localeCompare(right.title);

  if (titleComparison !== 0) {
    return titleComparison;
  }

  return left.id.localeCompare(right.id);
}

export function buildProjectionDiagnostics({
  blockedFundingSources,
  orphanedFundingIssues,
  settlementIssues,
}: ProjectionDiagnosticRequest): ProjectionDiagnosticSummary {
  const diagnostics = [
    ...blockedFundingSources.map(mapBlockedFundingSource),
    ...orphanedFundingIssues.map(mapOrphanedFundingIssue),
    ...settlementIssues.map(mapSettlementIssue),
  ].sort(compareDiagnostics);

  const blockingCount = diagnostics.filter(
    (diagnostic) => diagnostic.severity === "blocking",
  ).length;

  const attentionCount = diagnostics.filter(
    (diagnostic) => diagnostic.severity === "attention",
  ).length;

  return {
    diagnostics,
    blockingCount,
    attentionCount,
    canProjectCompletely: diagnostics.length === 0,
  };
}
