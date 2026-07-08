import type { CreditPosition } from "../credit/creditPosition";
import type { ObligationState } from "../obligations/obligationState";
import type { FinancialState } from "../state/financialState";

export function generateFinancialRecommendations(
  state: FinancialState,
  obligationStates: ObligationState[],
  creditPosition: CreditPosition,
): FinancialState["recommendations"] {
  const recommendations: FinancialState["recommendations"] = [];

  if (state.income.paychecks.length > 0 && state.liquidity.cashAvailable > 0) {
    recommendations.push({
      id: "review-cash-position",
      title: "Review cash position",
      rationale:
        "Income has been received and cash is available. Review obligations before allocating remaining funds.",
      priority: "medium",
    });
  }

  if (
    creditPosition.projectedUtilizationPercent >
    creditPosition.targetUtilizationPercent
  ) {
    recommendations.push({
      id: "reduce-projected-utilization",
      title: "Reduce projected credit utilization",
      rationale: `Projected utilization is ${creditPosition.projectedUtilizationPercent}%. A payment of $${creditPosition.amountToTargetUtilization.toLocaleString()} would bring projected utilization to the ${creditPosition.targetUtilizationPercent}% target.`,
      priority: "high",
    });
  }

  obligationStates.forEach((obligation) => {
    if (obligation.status === "open") {
      recommendations.push({
        id: `review-open-obligation-${obligation.obligationId}`,
        title: `Review ${obligation.accountName} obligation`,
        rationale: `${obligation.accountName} has an open obligation of $${obligation.remainingAmount.toLocaleString()} due ${obligation.paymentDueDate}.`,
        priority: "high",
      });
    }

    if (obligation.status === "partially-satisfied") {
      recommendations.push({
        id: `review-partial-obligation-${obligation.obligationId}`,
        title: `Review remaining ${obligation.accountName} balance`,
        rationale: `${obligation.accountName} is ${obligation.satisfactionPercent}% satisfied. $${obligation.remainingAmount.toLocaleString()} remains before the due date.`,
        priority: "medium",
      });
    }

    if (obligation.status === "satisfied") {
      recommendations.push({
        id: `review-satisfied-obligation-${obligation.obligationId}`,
        title: `${obligation.accountName} obligation satisfied`,
        rationale: `${obligation.accountName} has been fully satisfied for this obligation cycle.`,
        priority: "low",
      });
    }
  });

  return recommendations;
}
