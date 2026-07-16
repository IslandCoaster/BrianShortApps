import type { FundingAllocationIssue } from "../../funding/fundingAllocationProjection";
import type { ProjectionIssue } from "../entries/projectionEntry";
import type { BlockedFundingDepositSource } from "../entries/fundingDepositProjection";
import { buildProjectionDiagnostics } from "./projectionDiagnostic";

function assertEqual<T>(
  actual: T,
  expected: T,
  label: string,
): void {
  if (actual !== expected) {
    throw new Error(
      `${label}: expected ${String(expected)}, received ${String(actual)}.`,
    );
  }
}

export function verifyProjectionDiagnostics(): void {
  const blockedFundingSource: BlockedFundingDepositSource = {
    fundingSourceId: "paycheck-1",
    fundingSourceTitle: "July Paycheck",
    fundingSourceAmount: 2000,
    allocatedAmount: 1500,
    remainingAmount: 500,
    status: "partially-allocated",
    issues: [],
  };

  const orphanedFundingIssue: FundingAllocationIssue = {
    allocationId: "allocation-orphaned",
    fundingSourceId: "missing-source",
    code: "missing-funding-source",
    message: "The referenced funding source does not exist.",
  };

  const missingSettlementRoute: ProjectionIssue = {
    code: "missing-routing",
    sourceType: "debt-account",
    sourceId: "card-1",
    sourceName: "Apple Card",
    message:
      'Debt account "Apple Card" does not have a settlement account assigned.',
  };

  const inactiveSettlementAccount: ProjectionIssue = {
    code: "inactive-account",
    sourceType: "debt-account",
    sourceId: "loan-1",
    sourceName: "Personal Loan",
    message:
      'Settlement account "Old Checking" must be active before the loan can be projected.',
    accountId: "checking-old",
  };

  const result = buildProjectionDiagnostics({
    blockedFundingSources: [blockedFundingSource],
    orphanedFundingIssues: [orphanedFundingIssue],
    settlementIssues: [
      missingSettlementRoute,
      inactiveSettlementAccount,
    ],
  });

  assertEqual(
    result.diagnostics.length,
    4,
    "All producer issues become diagnostics",
  );

  assertEqual(
    result.blockingCount,
    3,
    "Blocking diagnostic count",
  );

  assertEqual(
    result.attentionCount,
    1,
    "Attention diagnostic count",
  );

  assertEqual(
    result.canProjectCompletely,
    false,
    "Diagnostics prevent complete projection",
  );

  assertEqual(
    result.diagnostics[0]?.severity,
    "blocking",
    "Blocking diagnostics are ordered first",
  );

  assertEqual(
    result.diagnostics.some(
      (diagnostic) =>
        diagnostic.code === "missing-settlement-route" &&
        diagnostic.sourceId === "card-1",
    ),
    true,
    "Missing settlement routing is normalized",
  );

  assertEqual(
    result.diagnostics.some(
      (diagnostic) =>
        diagnostic.code === "inactive-settlement-account" &&
        diagnostic.accountId === "checking-old",
    ),
    true,
    "Inactive settlement account is normalized",
  );

  const emptyResult = buildProjectionDiagnostics({
    blockedFundingSources: [],
    orphanedFundingIssues: [],
    settlementIssues: [],
  });

  assertEqual(
    emptyResult.diagnostics.length,
    0,
    "Empty diagnostics result",
  );

  assertEqual(
    emptyResult.canProjectCompletely,
    true,
    "No diagnostics permits complete projection",
  );
}
