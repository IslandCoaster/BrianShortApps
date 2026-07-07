import { calculateFinancialState } from "../engine/financialEngine";
import { createPaycheckReceivedEvent } from "../events/paycheckReceivedEvent";
import { appendFinancialEvent, createFinancialJournal } from "../journal/financialJournal";

const paycheck = createPaycheckReceivedEvent({
  id: "paycheck-001",
  occurredOn: "2026-07-07",
  grossPay: 2500,
  netPay: 1800,
  payPeriodStart: "2026-06-23",
  payPeriodEnd: "2026-07-06",
  federalTax: 350,
  stateTax: 100,
  retirementContribution: 150,
  healthInsuranceDeduction: 100,
});

const journal = appendFinancialEvent(createFinancialJournal(), paycheck);
const state = calculateFinancialState(journal);

export const paycheckFixture = {
  journal,
  state,
};
