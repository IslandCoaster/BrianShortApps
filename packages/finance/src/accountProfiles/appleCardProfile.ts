import type { AccountProfile } from "./accountProfile";

export const appleCardProfile: AccountProfile = {
  accountId: "card-apple",
  accountName: "Apple Card",
  issuer: "Goldman Sachs Bank USA",
  accountType: "credit-card",
  activeRuleSet: {
    aprPercent: 25.49,
    isVariableApr: true,
    interestCalculationMethod: "daily-balance-including-new-transactions",
    gracePeriodRule:
      "Pay the monthly balance as of the end of last month in full by the payment due date this month to obtain the grace period.",
    paymentPostingCutoff:
      "Electronic payments made by 11:59 p.m. Eastern time are credited on the day the payment is made.",
    statementCycleRule: "Calendar month cycle for this statement.",
  },
};
