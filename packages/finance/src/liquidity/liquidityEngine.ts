import type { AssetAccountProjection } from "../projections/assetAccountProjection";
import type {
  ProjectionDiagnostic,
  ProjectionDiagnosticSummary,
} from "../projections/diagnostics/projectionDiagnostic";
import type {
  AccountLiquidityBuffer,
  AccountLiquidityState,
  LiquidityStateSummary,
  LiquidityStatus,
} from "./liquidityState";

export type LiquidityStateRequest = {
  accounts: readonly AssetAccountProjection[];
  diagnostics: ProjectionDiagnosticSummary;
  accountBuffers?: readonly AccountLiquidityBuffer[];
  defaultMinimumBuffer?: number;
};

function normalizeNonNegativeAmount(amount: number | undefined): number {
  if (amount === undefined || !Number.isFinite(amount)) {
    return 0;
  }

  return Math.max(amount, 0);
}

function hasRelevantRoutingDiagnostic(
  accountId: string,
  diagnostics: readonly ProjectionDiagnostic[],
): boolean {
  return diagnostics.some(
    (diagnostic) =>
      diagnostic.category === "settlement-routing" &&
      diagnostic.accountId === accountId,
  );
}

function getAccountBuffer(
  accountId: string,
  accountBuffers: readonly AccountLiquidityBuffer[],
  defaultMinimumBuffer: number,
): number {
  const configuredBuffer = accountBuffers.find(
    (buffer) => buffer.accountId === accountId,
  );

  return normalizeNonNegativeAmount(
    configuredBuffer?.recommendedMinimumBuffer ?? defaultMinimumBuffer,
  );
}

function getLiquidityStatus(
  account: AssetAccountProjection,
  recommendedMinimumBuffer: number,
  hasRoutingDiagnostic: boolean,
): LiquidityStatus {
  if (hasRoutingDiagnostic) {
    return "routing-incomplete";
  }

  if (account.lowestBalance < 0) {
    return "overdraft-risk";
  }

  if (account.lowestBalance < recommendedMinimumBuffer) {
    return "low-buffer";
  }

  return "healthy";
}

function getLiquidityRationale(
  account: AssetAccountProjection,
  status: LiquidityStatus,
  recommendedMinimumBuffer: number,
): string {
  switch (status) {
    case "routing-incomplete":
      return (
        `${account.accountName} has incomplete or invalid settlement routing, ` +
        "so its projected liquidity cannot be considered complete."
      );

    case "overdraft-risk":
      return (
        `${account.accountName} is projected to reach ` +
        `$${account.lowestBalance.toFixed(2)}, below zero.`
      );

    case "low-buffer":
      return (
        `${account.accountName} remains above zero but falls below the ` +
        `$${recommendedMinimumBuffer.toFixed(2)} recommended minimum buffer.`
      );

    case "healthy":
      return (
        `${account.accountName} remains at or above the ` +
        `$${recommendedMinimumBuffer.toFixed(2)} recommended minimum buffer.`
      );
  }
}

export function buildLiquidityState({
  accounts,
  diagnostics,
  accountBuffers = [],
  defaultMinimumBuffer = 0,
}: LiquidityStateRequest): LiquidityStateSummary {
  const normalizedDefaultBuffer =
    normalizeNonNegativeAmount(defaultMinimumBuffer);

  const liquidityAccounts = accounts.map(
    (account): AccountLiquidityState => {
      const recommendedMinimumBuffer = getAccountBuffer(
        account.accountId,
        accountBuffers,
        normalizedDefaultBuffer,
      );

      const hasRoutingDiagnostic = hasRelevantRoutingDiagnostic(
        account.accountId,
        diagnostics.diagnostics,
      );

      const status = getLiquidityStatus(
        account,
        recommendedMinimumBuffer,
        hasRoutingDiagnostic,
      );

      return {
        accountId: account.accountId,
        accountName: account.accountName,
        openingBalance: account.openingBalance,
        lowestProjectedBalance: account.lowestBalance,
        closingBalance: account.closingBalance,
        recommendedMinimumBuffer,
        status,
        rationale: getLiquidityRationale(
          account,
          status,
          recommendedMinimumBuffer,
        ),
      };
    },
  );

  const healthyCount = liquidityAccounts.filter(
    (account) => account.status === "healthy",
  ).length;

  const lowBufferCount = liquidityAccounts.filter(
    (account) => account.status === "low-buffer",
  ).length;

  const overdraftRiskCount = liquidityAccounts.filter(
    (account) => account.status === "overdraft-risk",
  ).length;

  const routingIncompleteCount = liquidityAccounts.filter(
    (account) => account.status === "routing-incomplete",
  ).length;

  return {
    accounts: liquidityAccounts,
    healthyCount,
    lowBufferCount,
    overdraftRiskCount,
    routingIncompleteCount,
    hasLiquidityRisk:
      lowBufferCount > 0 ||
      overdraftRiskCount > 0 ||
      routingIncompleteCount > 0,
  };
}
