import type { AccountProfile } from "../accountProfiles/accountProfile";
import type { FinancialJournal } from "../journal/financialJournal";
import { createEmptyInterestState, type InterestState } from "./interestState";

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

export function calculateInterestStates(
  journal: FinancialJournal,
  accountProfiles: AccountProfile[],
): InterestState[] {
  return journal.events
    .filter((event) => event.type === "statement.generated")
    .map((event) => {
      const accountId = getMetadataString(event.metadata?.accountId);
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
      };
    });
}
