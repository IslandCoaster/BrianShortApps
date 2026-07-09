import type { FinancialEvent } from "../events/financialEvent";
import type { FinancialJournal } from "../journal/financialJournal";
import { createDailyBalance, type DailyBalance } from "./dailyBalance";

function getMetadataString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getMetadataNumber(value: unknown) {
  return typeof value === "number" ? value : 0;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function createDateRange(startDate: string, endDate: string) {
  const dates: string[] = [];
  let currentDate = new Date(`${startDate}T00:00:00Z`);
  const finalDate = new Date(`${endDate}T00:00:00Z`);

  while (currentDate <= finalDate) {
    dates.push(formatDate(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return dates;
}

function roundCurrency(amount: number) {
  return Math.round(amount * 100) / 100;
}

function getStatementEvents(journal: FinancialJournal) {
  return journal.events.filter((event) => event.type === "statement.generated");
}

function getPaymentEventsForAccount(
  journal: FinancialJournal,
  accountId: string,
  date: string,
) {
  return journal.events.filter((event) => {
    if (event.type !== "payment.completed") {
      return false;
    }

    const destinationAccountId = getMetadataString(event.metadata?.destinationAccountId);
    const creditedAt = getMetadataString(event.metadata?.creditedAt) || event.occurredOn;
    const creditedDate = creditedAt.slice(0, 10);

    return destinationAccountId === accountId && creditedDate === date;
  });
}

function getPurchaseEventsForAccount(
  journal: FinancialJournal,
  accountId: string,
  date: string,
) {
  return journal.events.filter((event) => {
    if (event.type !== "transaction.imported") {
      return false;
    }

    const eventAccountId = getMetadataString(event.metadata?.accountId);
    const transactionType = getMetadataString(event.metadata?.transactionType);

    return eventAccountId === accountId && event.occurredOn === date && transactionType === "purchase";
  });
}

function sumEventAmounts(events: FinancialEvent[]) {
  return events.reduce((total, event) => total + (event.amount ?? 0), 0);
}

function createBalancesForStatement(
  journal: FinancialJournal,
  statementEvent: FinancialEvent,
): DailyBalance[] {
  const accountId = getMetadataString(statementEvent.metadata?.accountId);
  const accountName = getMetadataString(statementEvent.metadata?.accountName);
  const statementPeriodStart = getMetadataString(statementEvent.metadata?.statementPeriodStart);
  const statementPeriodEnd = getMetadataString(statementEvent.metadata?.paymentDueDate);
  const startingBalance = getMetadataNumber(statementEvent.metadata?.balanceSubjectToInterest);

  let runningBalance = startingBalance;

  return createDateRange(statementPeriodStart, statementPeriodEnd).map((date) => {
    const openingBalance = runningBalance;
    const purchasesTotal = sumEventAmounts(getPurchaseEventsForAccount(journal, accountId, date));
    const paymentsTotal = sumEventAmounts(getPaymentEventsForAccount(journal, accountId, date));
    const feesTotal = 0;
    const interestTotal = 0;
    const adjustmentsTotal = 0;
    const closingBalance = Math.max(
      0,
      roundCurrency(openingBalance + purchasesTotal + feesTotal + interestTotal + adjustmentsTotal - paymentsTotal),
    );

    runningBalance = closingBalance;

    return createDailyBalance({
      accountId,
      accountName,
      date,
      openingBalance,
      purchasesTotal,
      paymentsTotal,
      feesTotal,
      adjustmentsTotal,
      interestTotal,
      closingBalance,
    });
  });
}

export function calculateDailyBalances(journal: FinancialJournal): DailyBalance[] {
  return getStatementEvents(journal).flatMap((statementEvent) =>
    createBalancesForStatement(journal, statementEvent),
  );
}
