import type { AssetAccountProjection } from "../projections/assetAccountProjection";
import type { ProjectionDiagnosticSummary } from "../projections/diagnostics/projectionDiagnostic";
import { buildLiquidityState } from "./liquidityEngine";

function assertEqual<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(
      `${label}: expected ${String(expected)}, received ${String(actual)}.`,
    );
  }
}

function createAccount(
  overrides: Partial<AssetAccountProjection>,
): AssetAccountProjection {
  return {
    accountId: "checking-1",
    accountName: "Primary Checking",
    institutionName: "Example Bank",
    accountType: "checking",
    openingBalance: 500,
    totalPlannedDeposits: 1000,
    totalPlannedSettlements: 600,
    lowestBalance: 400,
    closingBalance: 900,
    entries: [],
    ...overrides,
  };
}

const emptyDiagnostics: ProjectionDiagnosticSummary = {
  diagnostics: [],
  blockingCount: 0,
  attentionCount: 0,
  canProjectCompletely: true,
};

export function verifyLiquidityState(): void {
  const healthyAccount = createAccount({
    accountId: "checking-healthy",
    accountName: "Healthy Checking",
    lowestBalance: 400,
    closingBalance: 700,
  });

  const lowBufferAccount = createAccount({
    accountId: "checking-low",
    accountName: "Low Buffer Checking",
    lowestBalance: 75,
    closingBalance: 150,
  });

  const overdraftAccount = createAccount({
    accountId: "checking-overdraft",
    accountName: "Overdraft Checking",
    lowestBalance: -138.52,
    closingBalance: 61.48,
  });

  const routedAccount = createAccount({
    accountId: "checking-routing",
    accountName: "Routing Checking",
    lowestBalance: 350,
    closingBalance: 500,
  });

  const routingDiagnostics: ProjectionDiagnosticSummary = {
    diagnostics: [
      {
        id: "routing-diagnostic-1",
        code: "inactive-settlement-account",
        category: "settlement-routing",
        severity: "blocking",
        title: "Inactive Settlement Account",
        message: "The settlement account is inactive.",
        sourceId: "card-1",
        sourceName: "Apple Card",
        accountId: routedAccount.accountId,
      },
    ],
    blockingCount: 1,
    attentionCount: 0,
    canProjectCompletely: false,
  };

  const standardResult = buildLiquidityState({
    accounts: [
      healthyAccount,
      lowBufferAccount,
      overdraftAccount,
    ],
    diagnostics: emptyDiagnostics,
    defaultMinimumBuffer: 100,
  });

  assertEqual(
    standardResult.accounts.find(
      (account) => account.accountId === healthyAccount.accountId,
    )?.status,
    "healthy",
    "Healthy account status",
  );

  assertEqual(
    standardResult.accounts.find(
      (account) => account.accountId === lowBufferAccount.accountId,
    )?.status,
    "low-buffer",
    "Low-buffer account status",
  );

  assertEqual(
    standardResult.accounts.find(
      (account) => account.accountId === overdraftAccount.accountId,
    )?.status,
    "overdraft-risk",
    "Overdraft account status",
  );

  assertEqual(
    standardResult.healthyCount,
    1,
    "Healthy account count",
  );

  assertEqual(
    standardResult.lowBufferCount,
    1,
    "Low-buffer account count",
  );

  assertEqual(
    standardResult.overdraftRiskCount,
    1,
    "Overdraft account count",
  );

  assertEqual(
    standardResult.hasLiquidityRisk,
    true,
    "Risk summary",
  );

  const routingResult = buildLiquidityState({
    accounts: [routedAccount],
    diagnostics: routingDiagnostics,
    defaultMinimumBuffer: 100,
  });

  assertEqual(
    routingResult.accounts[0]?.status,
    "routing-incomplete",
    "Routing diagnostic takes precedence",
  );

  assertEqual(
    routingResult.routingIncompleteCount,
    1,
    "Routing-incomplete count",
  );

  const customBufferResult = buildLiquidityState({
    accounts: [healthyAccount],
    diagnostics: emptyDiagnostics,
    defaultMinimumBuffer: 100,
    accountBuffers: [
      {
        accountId: healthyAccount.accountId,
        recommendedMinimumBuffer: 500,
      },
    ],
  });

  assertEqual(
    customBufferResult.accounts[0]?.status,
    "low-buffer",
    "Account-specific buffer overrides default",
  );

  assertEqual(
    customBufferResult.accounts[0]?.recommendedMinimumBuffer,
    500,
    "Account-specific buffer value",
  );

  const zeroBufferResult = buildLiquidityState({
    accounts: [
      createAccount({
        accountId: "checking-zero",
        accountName: "Zero Balance Checking",
        lowestBalance: 0,
        closingBalance: 0,
      }),
    ],
    diagnostics: emptyDiagnostics,
  });

  assertEqual(
    zeroBufferResult.accounts[0]?.status,
    "healthy",
    "Zero remains healthy when minimum buffer is zero",
  );
}
