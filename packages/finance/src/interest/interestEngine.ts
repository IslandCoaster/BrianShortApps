import type { AccountProfile } from "../accountProfiles/accountProfile";
import type { FinancialJournal } from "../journal/financialJournal";
import { createEmptyInterestState, type InterestState } from "./interestState";

function getMetadataString(eventType: unknown) {
  return typeof eventType === "string" ? eventType : "";
}

function getMetadataNumber(value: unknown) {
  return typeof value === "number" ? value : 0;
}

function findAccountProfile(accountProfiles: AccountProfile[], accountId: string) {
  return accountProfiles.find((profile) => profile.accountId === accountId) ?? null;
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

      return {
        ...emptyState,
        aprPercent: profile?.activeRuleSet.aprPercent ?? 0,
        isVariableApr: profile?.activeRuleSet.isVariableApr ?? false,
        calculationMethod: profile?.activeRuleSet.interestCalculationMethod ?? "unknown",
        lifecycleStatus: getMetadataNumber(event.metadata?.interestCharged) > 0
          ? "interest-charged"
          : "grace-period-preserved",
        balanceSubjectToInterest: getMetadataNumber(event.metadata?.balanceSubjectToInterest),
        interestCharged: getMetadataNumber(event.metadata?.interestCharged),
      };
    });
}
