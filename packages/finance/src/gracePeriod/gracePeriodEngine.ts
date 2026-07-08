import type { AccountProfile } from "../accountProfiles/accountProfile";
import type { FinancialEvent } from "../events/financialEvent";
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

function findAccountProfile(accountProfiles: AccountProfile[], accountId: string) {
  return accountProfiles.find((profile) => profile.accountId === accountId) ?? null;
}

function getPaymentDestinationAccountId(event: FinancialEvent) {
  return getMetadataString(event.metadata?.destinationAccountId);
}

function getPaymentCreditedAt(event: FinancialEvent) {
  return getMetadataString(event.metadata?.creditedAt) || event.occurredOn;
}

function isPaymentCreditedByDueDate(event: FinancialEvent, paymentDueDate: string) {
  const creditedAt = getPaymentCreditedAt(event).slice(0, 10);

  return creditedAt <= paymentDueDate;
}

function calculateQualifyingPaymentTotal(
  journal: FinancialJournal,
  accountId: string,
  paymentDueDate: string,
) {
  return journal.events
    .filter((event) => event.type === "payment.completed")
    .filter((event) => getPaymentDestinationAccountId(event) === accountId)
    .filter((event) => isPaymentCreditedByDueDate(event, paymentDueDate))
    .reduce((total, event) => total + (event.amount ?? 0), 0);
}

function calculateGracePeriodStatus(
  qualifyingPaymentTotal: number,
  requiredPaymentAmount: number,
): GracePeriodState["status"] {
  if (requiredPaymentAmount <= 0) {
    return "unknown";
  }

  return qualifyingPaymentTotal >= requiredPaymentAmount ? "active" : "lost";
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
      const paymentDueDate = getMetadataString(event.metadata?.paymentDueDate);
      const requiredPaymentAmount = getMetadataNumber(event.metadata?.statementBalance);
      const profile = findAccountProfile(accountProfiles, accountId);
      const emptyState = createEmptyGracePeriodState(accountId, accountName);
      const qualifyingPaymentTotal = calculateQualifyingPaymentTotal(
        journal,
        accountId,
        paymentDueDate,
      );
      const remainingAmountToPreserveGracePeriod = Math.max(
        0,
        Math.round((requiredPaymentAmount - qualifyingPaymentTotal) * 100) / 100,
      );
      const status = calculateGracePeriodStatus(qualifyingPaymentTotal, requiredPaymentAmount);

      return {
        ...emptyState,
        status,
        rule: profile?.activeRuleSet.gracePeriodRule ?? "",
        reason:
          status === "active"
            ? "Qualifying payments credited on or before the due date cutoff satisfy the statement balance requirement."
            : "The statement balance has not been fully satisfied by qualifying payments credited on or before the due date cutoff.",
        evaluatedOn: event.occurredOn,
        paymentDueDate,
        paymentPostingCutoff: profile?.activeRuleSet.paymentPostingCutoff ?? "",
        qualifyingPaymentTotal,
        requiredPaymentAmount,
        remainingAmountToPreserveGracePeriod,
      };
    });
}
