import type { AccountProfile } from "../accountProfiles/accountProfile";
import type { FinancialEvent } from "./financialEvent";

export type AccountProfileCreatedInput = {
  id: string;
  occurredOn: string;
  profile: AccountProfile;
};

export function createAccountProfileCreatedEvent(
  input: AccountProfileCreatedInput,
): FinancialEvent {
  return {
    id: input.id,
    type: "account-profile.created",
    category: "account-profile",
    occurredOn: input.occurredOn,
    description: `Account profile created for ${input.profile.accountName}`,
    metadata: {
      accountId: input.profile.accountId,
      accountName: input.profile.accountName,
      issuer: input.profile.issuer,
      accountType: input.profile.accountType,
      creditLimit: input.profile.creditLimit ?? null,
      aprPercent: input.profile.activeRuleSet.aprPercent,
      isVariableApr: input.profile.activeRuleSet.isVariableApr,
      interestCalculationMethod: input.profile.activeRuleSet.interestCalculationMethod,
      gracePeriodRule: input.profile.activeRuleSet.gracePeriodRule,
      paymentPostingCutoff: input.profile.activeRuleSet.paymentPostingCutoff,
      statementCycleRule: input.profile.activeRuleSet.statementCycleRule,
      lateFeeRule: input.profile.activeRuleSet.lateFeeRule ?? null,
    },
  };
}
