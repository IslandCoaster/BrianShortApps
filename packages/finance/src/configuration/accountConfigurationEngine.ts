import type { AccountProfile, InterestCalculationMethod } from "../accountProfiles/accountProfile";
import type { FinancialEvent } from "../events/financialEvent";
import type { FinancialJournal } from "../journal/financialJournal";

function getMetadataString(event: FinancialEvent, key: string) {
  const value = event.metadata?.[key];

  return typeof value === "string" ? value : "";
}

function getMetadataNumber(event: FinancialEvent, key: string) {
  const value = event.metadata?.[key];

  return typeof value === "number" ? value : 0;
}

function getMetadataBoolean(event: FinancialEvent, key: string) {
  const value = event.metadata?.[key];

  return typeof value === "boolean" ? value : false;
}

function createAccountProfileFromEvent(event: FinancialEvent): AccountProfile {
  return {
    accountId: getMetadataString(event, "accountId"),
    accountName: getMetadataString(event, "accountName"),
    issuer: getMetadataString(event, "issuer"),
    accountType: getMetadataString(event, "accountType") as AccountProfile["accountType"],
    creditLimit: getMetadataNumber(event, "creditLimit"),
    activeRuleSet: {
      aprPercent: getMetadataNumber(event, "aprPercent"),
      isVariableApr: getMetadataBoolean(event, "isVariableApr"),
      interestCalculationMethod: getMetadataString(
        event,
        "interestCalculationMethod",
      ) as InterestCalculationMethod,
      gracePeriodRule: getMetadataString(event, "gracePeriodRule"),
      paymentPostingCutoff: getMetadataString(event, "paymentPostingCutoff"),
      statementCycleRule: getMetadataString(event, "statementCycleRule"),
      lateFeeRule: getMetadataString(event, "lateFeeRule") || undefined,
    },
  };
}

export function calculateActiveAccountProfiles(journal: FinancialJournal): AccountProfile[] {
  const profileMap = new Map<string, AccountProfile>();

  journal.events.forEach((event) => {
    if (event.type !== "account-profile.created") {
      return;
    }

    const profile = createAccountProfileFromEvent(event);
    profileMap.set(profile.accountId, profile);
  });

  return Array.from(profileMap.values()).sort((a, b) =>
    a.accountName.localeCompare(b.accountName),
  );
}
