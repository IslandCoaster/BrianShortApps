import { useMemo, useState } from "react";
import {
  buildOperationalFundingPlan,
  type FinancialAccount,
  type FinancialObligation,
  type FundingSource,
  type OperationalFundingStatus,
} from "@bsa/finance";

import "./OperationalFundingPlanView.css";

type OperationalFundingPlanViewProps = {
  currentCash: number;
  accounts: FinancialAccount[];
  obligations: FinancialObligation[];
  fundingSources: FundingSource[];
};

function formatAmount(amount: number) {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatFundingStatus(status: OperationalFundingStatus) {
  switch (status) {
    case "funded-by-due-date":
      return "Funded by due date";

    case "funded-after-due-date":
      return "Funded after due date";

    case "partially-funded":
      return "Partially funded";

    case "unfunded":
      return "Unfunded";
  }
}

function formatRequirementType(
  requirementType: "debt-account" | "financial-obligation",
) {
  return requirementType === "debt-account"
    ? "Debt Account"
    : "Financial Obligation";
}

function formatExclusionReason(
  reason: "missing-payment-amount" | "missing-due-date",
) {
  return reason === "missing-due-date"
    ? "Next due date not entered"
    : "Required payment amount not entered";
}

function parseNonNegativeAmount(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? Math.max(parsed, 0) : 0;
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function OperationalFundingPlanView({
  currentCash,
  accounts,
  obligations,
  fundingSources,
}: OperationalFundingPlanViewProps) {
  const [minimumCashReserveInput, setMinimumCashReserveInput] = useState("0");

  const minimumCashReserve = parseNonNegativeAmount(minimumCashReserveInput);

  const plan = useMemo(
    () =>
      buildOperationalFundingPlan({
        planningDate: getTodayDate(),
        currentCash,
        minimumCashReserve,
        accounts,
        obligations,
        fundingSources,
      }),
    [accounts, currentCash, fundingSources, minimumCashReserve, obligations],
  );

  const fundedByDueDate = plan.items.filter(
    (item) => item.fundingStatus === "funded-by-due-date",
  ).length;

  const timingRisk = plan.items.filter(
    (item) => item.fundingStatus === "funded-after-due-date",
  ).length;

  const incompleteFunding = plan.items.filter(
    (item) =>
      item.fundingStatus === "partially-funded" ||
      item.fundingStatus === "unfunded",
  ).length;

  const hasRequirements = plan.items.length > 0;

  const hasOperationalInputs =
    currentCash > 0 ||
    fundingSources.some((source) => source.status === "planned");

  return (
    <section className="operational-funding-plan">
      <div className="operational-funding-plan__header">
        <div>
          <span>Operational funding</span>

          <h3>Funding Plan</h3>

          <p>
            Allocate replay-derived current cash and planned future cash against
            known dated payment requirements.
          </p>
        </div>

        <label>
          Minimum cash reserve
          <input
            type="number"
            min="0"
            step="0.01"
            value={minimumCashReserveInput}
            onChange={(event) => setMinimumCashReserveInput(event.target.value)}
          />
        </label>
      </div>

      <div className="operational-funding-plan__position">
        <article>
          <span>Current Cash</span>
          <strong>{formatAmount(plan.position.currentCash)}</strong>
        </article>

        <article>
          <span>Planned Future Cash</span>
          <strong>{formatAmount(plan.position.plannedFutureCash)}</strong>
        </article>

        <article>
          <span>Gross Available Cash</span>
          <strong>{formatAmount(plan.position.grossAvailableCash)}</strong>
        </article>

        <article>
          <span>Protected Cash</span>
          <strong>{formatAmount(plan.position.protectedCash)}</strong>
        </article>

        <article>
          <span>Deployable Cash</span>
          <strong>{formatAmount(plan.position.deployableCash)}</strong>
        </article>

        <article>
          <span>Allocated Cash</span>
          <strong>{formatAmount(plan.position.allocatedCash)}</strong>
        </article>

        <article>
          <span>Funding Buffer</span>
          <strong>{formatAmount(plan.position.fundingBuffer)}</strong>
        </article>

        <article>
          <span>Unresolved Amount</span>
          <strong>{formatAmount(plan.position.unresolvedAmount)}</strong>
        </article>
      </div>

      {!hasOperationalInputs ? (
        <div className="operational-funding-plan__empty">
          <strong>No deployable cash entered</strong>

          <p>
            Establish current cash or add a planned future cash source before
            relying on this funding plan.
          </p>
        </div>
      ) : !hasRequirements ? (
        <div className="operational-funding-plan__empty">
          <strong>No dated payment requirements</strong>

          <p>
            Debt payments and obligations require both a known amount and a due
            date before the funding engine can allocate cash.
          </p>
        </div>
      ) : (
        <>
          <div className="operational-funding-plan__status-summary">
            <article>
              <span>Funded by Due Date</span>
              <strong>{fundedByDueDate}</strong>
            </article>

            <article>
              <span>Timing Risk</span>
              <strong>{timingRisk}</strong>
            </article>

            <article>
              <span>Incomplete Funding</span>
              <strong>{incompleteFunding}</strong>
            </article>
          </div>

          <div className="operational-funding-plan__items">
            {plan.items.map((item) => (
              <article
                key={`${item.requirementType}-${item.requirementId}`}
                className="operational-funding-plan__item"
              >
                <div className="operational-funding-plan__item-header">
                  <div>
                    <small>{formatRequirementType(item.requirementType)}</small>

                    <strong>{item.name}</strong>

                    <span>{item.counterparty}</span>
                  </div>

                  <span
                    className={`operational-funding-plan__status operational-funding-plan__status--${item.fundingStatus}`}
                  >
                    {formatFundingStatus(item.fundingStatus)}
                  </span>
                </div>

                <dl>
                  <div>
                    <dt>Due Date</dt>
                    <dd>{item.dueDate}</dd>
                  </div>

                  <div>
                    <dt>Required</dt>
                    <dd>{formatAmount(item.requestedAmount)}</dd>
                  </div>

                  <div>
                    <dt>Allocated</dt>
                    <dd>{formatAmount(item.allocatedAmount)}</dd>
                  </div>

                  <div>
                    <dt>Funded by Due Date</dt>
                    <dd>{formatAmount(item.fundedAmountByDueDate)}</dd>
                  </div>

                  <div>
                    <dt>Fully Funded On</dt>
                    <dd>{item.fullyFundedOn ?? "Not fully funded"}</dd>
                  </div>

                  <div>
                    <dt>Priority</dt>
                    <dd>{item.isPastDue ? "Past due" : "Required payment"}</dd>
                  </div>
                </dl>

                {item.allocations.length > 0 ? (
                  <div className="operational-funding-plan__allocations">
                    <span>Funding Allocations</span>

                    {item.allocations.map((allocation, index) => (
                      <div key={`${allocation.fundingSourceId}-${index}`}>
                        <span>Available {allocation.availableOn}</span>

                        <strong>{formatAmount(allocation.amount)}</strong>

                        <small>
                          Planned payment date: {allocation.paymentDate}
                        </small>
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </>
      )}

      {plan.excludedRequirements.length > 0 ? (
        <section className="operational-funding-plan__excluded">
          <div>
            <strong>Incomplete planning data</strong>

            <p>
              These items are excluded from allocation until the missing
              information is entered.
            </p>
          </div>

          <ul>
            {plan.excludedRequirements.map((requirement) => (
              <li key={`${requirement.requirementType}-${requirement.id}`}>
                <span>{requirement.name}</span>

                <strong>{formatExclusionReason(requirement.reason)}</strong>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
}
