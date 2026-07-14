import { createPaymentCompletedEvent } from "../events/paymentCompletedEvent";
import type { FinancialJournal } from "../journal/financialJournal";
import { replayFinancialJournal } from "../replay/replayEngine";
import type { ReplayState } from "../replay/replayState";

export type PaymentSimulationInput = {
  baseJournal: FinancialJournal;
  paymentId: string;
  occurredOn: string;
  creditedAt: string;
  sourceAccountId: string;
  sourceAccountName: string;
  destinationAccountId: string;
  destinationAccountName: string;
  amount: number;
};

export type PaymentSimulationResult = {
  simulatedPaymentAmount: number;
  replayState: ReplayState;
};

export function simulatePayment(
  input: PaymentSimulationInput,
): PaymentSimulationResult {
  const temporaryPaymentEvent = createPaymentCompletedEvent({
    id: input.paymentId,
    occurredOn: input.occurredOn,
    creditedAt: input.creditedAt,
    sourceAccountId: input.sourceAccountId,
    sourceAccountName: input.sourceAccountName,
    destinationAccountId: input.destinationAccountId,
    destinationAccountName: input.destinationAccountName,
    amount: input.amount,
    strategy: "manual",
    notes: "Temporary simulated payment.",
  });

  const replayState = replayFinancialJournal({
    baseJournal: input.baseJournal,
    temporaryEvents: [temporaryPaymentEvent],
  });

  return {
    simulatedPaymentAmount: input.amount,
    replayState,
  };
}
