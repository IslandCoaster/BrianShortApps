import type { AccountProfile } from "../accountProfiles/accountProfile";
import type { FinancialJournal } from "../journal/financialJournal";
import { createEmptyInterestState, type InterestState } from "./interestState";
import type { DailyBalance } from "../dailyBalances/dailyBalance";
import type { DailyInterest } from "./dailyInterest";
import { createDailyInterest } from "./dailyInterest";

function getMetadataString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getMetadataNumber(value: unknown) {
  return typeof value === "number" ? value : 0;
}

function findAccountProfile(
  accountProfiles: AccountProfile[],
  accountId: string,
) {
  return (
    accountProfiles.find((profile) => profile.accountId === accountId) ?? null
  );
}

function calculateStatementCycleDays(
  statementDate: string,
  closingDate: string,
) {
  if (!statementDate || !closingDate) {
    return 0;
  }

  const start = new Date(`${statementDate}T00:00:00`);
  const end = new Date(`${closingDate}T00:00:00`);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  return Math.round((end.getTime() - start.getTime()) / millisecondsPerDay) + 1;
}

function calculateAccruedInterest(closingBalance: number, aprPercent: number) {
  const dailyRate = aprPercent / 100 / 365;

  return Math.round(closingBalance * dailyRate * 100) / 100;
}

export function calculateDailyInterestAccruals(
  dailyBalances: DailyBalance[],
  aprPercent: number,
): DailyInterest[] {
  let runningAccruedInterest = 0;

  return dailyBalances.map((dailyBalance) => {
    const accruedInterest = calculateAccruedInterest(
      dailyBalance.closingBalance,
      aprPercent,
    );

    runningAccruedInterest =
      Math.round((runningAccruedInterest + accruedInterest) * 100) / 100;

    return createDailyInterest({
      accountId: dailyBalance.accountId,
      accountName: dailyBalance.accountName,
      date: dailyBalance.date,
      closingBalance: dailyBalance.closingBalance,
      accruedInterest,
      runningAccruedInterest,
    });
  });
}

function calculateRemainingStatementDays(
  evaluatedOn: string,
  statementPeriodEnd: string,
) {
  if (!evaluatedOn || !statementPeriodEnd) {
    return 0;
  }

  const start = new Date(`${evaluatedOn.slice(0, 10)}T00:00:00Z`);
  const end = new Date(`${statementPeriodEnd}T00:00:00Z`);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const days = Math.round(
    (end.getTime() - start.getTime()) / millisecondsPerDay,
  );

  return Math.max(0, days);
}

function calculateDailyInterest(
  balanceSubjectToInterest: number,
  aprPercent: number,
  statementCycleDays: number,
) {
  const dailyRate = aprPercent / 100 / 365;
  const calculatedInterest =
    balanceSubjectToInterest * dailyRate * statementCycleDays;

  return Math.round(calculatedInterest * 100) / 100;
}

function calculateDailyInterestAmount(balance: number, aprPercent: number) {
  const dailyRate = aprPercent / 100 / 365;

  return Math.round(balance * dailyRate * 100) / 100;
}

function calculateProjectedInterest(
  dailyInterest: number,
  remainingStatementDays: number,
) {
  return Math.round(dailyInterest * remainingStatementDays * 100) / 100;
}

export function calculateInterestStates(
  journal: FinancialJournal,
  accountProfiles: AccountProfile[],
  dailyInterestTimeline: DailyInterest[],
): InterestState[] {
  return journal.events
    .filter((event) => event.type === "statement.generated")
    .map((event) => {
      const accountId = getMetadataString(event.metadata?.accountId);

      const accountDailyInterest = dailyInterestTimeline.filter(
  (dailyInterest) => dailyInterest.accountId === accountId,
);

const accruedInterestTotal =
  accountDailyInterest[accountDailyInterest.length - 1]?.runningAccruedInterest ?? 0;
      const accountName = getMetadataString(event.metadata?.accountName);
      const profile = findAccountProfile(accountProfiles, accountId);
      const emptyState = createEmptyInterestState(accountId, accountName);

      const balanceSubjectToInterest = getMetadataNumber(
        event.metadata?.balanceSubjectToInterest,
      );
      const interestCharged = getMetadataNumber(
        event.metadata?.interestCharged,
      );
      const statementPeriodStart = getMetadataString(
        event.metadata?.statementPeriodStart,
      );
      const statementPeriodEnd = getMetadataString(
        event.metadata?.statementPeriodEnd,
      );
      const aprPercent = profile?.activeRuleSet.aprPercent ?? 0;
      const statementCycleDays = calculateStatementCycleDays(
        statementPeriodStart,
        statementPeriodEnd,
      );
      const calculatedInterest = calculateDailyInterest(
        balanceSubjectToInterest,
        aprPercent,
        statementCycleDays,
      );

      const dailyInterestAccrued = calculateDailyInterestAmount(
        balanceSubjectToInterest,
        aprPercent,
      );

      const statementInterestCalculated = accruedInterestTotal;
const statementInterestVariance =
  Math.round((interestCharged - statementInterestCalculated) * 100) / 100;
      const remainingStatementDays = calculateRemainingStatementDays(
        event.occurredOn,
        statementPeriodEnd,
      );
      const projectedInterest = calculateProjectedInterest(
        dailyInterestAccrued,
        remainingStatementDays,
      );
      const projectionReason =
        remainingStatementDays > 0
          ? `Projection assumes no additional financial activity over the remaining ${remainingStatementDays} statement days.`
          : "Statement period has completed.";

      const projectionConfidence =
        remainingStatementDays > 0 ? "forecast" : "measured";

      return {
        ...emptyState,
        aprPercent,
        isVariableApr: profile?.activeRuleSet.isVariableApr ?? false,
        calculationMethod:
          profile?.activeRuleSet.interestCalculationMethod ?? "unknown",
        lifecycleStatus:
          interestCharged > 0 ? "interest-charged" : "grace-period-preserved",
        balanceSubjectToInterest,
        statementCycleDays,
        calculatedInterest,
        interestCharged,
        interestVariance:
          Math.round((interestCharged - calculatedInterest) * 100) / 100,
        projectedInterest,
        interestAvoided: 0,
        dailyInterestAccrued,
        remainingStatementDays,
        projectionReason,
        projectionConfidence,
        accruedInterestTotal,
        statementInterestCalculated,
statementInterestVariance,
      };
    });
}
