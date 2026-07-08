import type { AccountProfile } from "../accountProfiles/accountProfile";
import type { FinancialJournal } from "../journal/financialJournal";
import {
  createEmptyGracePeriodState,
  type GracePeriodState,
} from "./gracePeriodState";

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

export function calculateGracePeriodStates(
  journal: FinancialJournal,
  accountProfiles: AccountProfile[],
): GracePeriodState[] {
  return journal.events
    .filter((event) => event.type === "statement.generated")
    .map((event) => {
      const accountId = getMetadataString(event.metadata?.accountId);
      const accountName = getMetadataString(event.metadata?.accountName);
      const interestCharged = getMetadataNumber(
        event.metadata?.interestCharged,
      );
      const profile = findAccountProfile(accountProfiles, accountId);
      const emptyState = createEmptyGracePeriodState(accountId, accountName);

      if (interestCharged > 0) {
        return {
          ...emptyState,
          status: "lost",
          rule: profile?.activeRuleSet.gracePeriodRule ?? "",
          reason:
            "Interest was charged on this statement, indicating the grace period was not preserved for this cycle.",
          evaluatedOn: event.occurredOn,
        };
      }

      return {
        ...emptyState,
        status: "active",
        rule: profile?.activeRuleSet.gracePeriodRule ?? "",
        reason:
          "No interest was charged on this statement, indicating the grace period was preserved for this cycle.",
        evaluatedOn: event.occurredOn,
      };
    });
}
