import { useMemo, useState } from "react";

import {
  PaycheckStrategySelector,
  type FinancialStrategy,
} from "./PaycheckStrategySelector";
import {
  buildFundingPlan,
  type PaymentFundingStatus,
  type PaymentPlan,
} from "./fundingEngine";
import type { FundingSource } from "./fundingSource";
import { defaultFundingPolicy, type FundingPolicy } from "./fundingPolicy";
import type { PortfolioAccountSummary } from "./portfolio.types";

import { buildFundingTimeline } from "./fundingTimeline";
import { CashFlowTimelineView } from "./CashFlowTimelineView";

type PaycheckPlanningViewProps = {
  accounts: PortfolioAccountSummary[];
};

type PaycheckDraft = {
  source: string;
  expectedDate: string;
  netPay: string;
  currentCash: string;
};

function parseAmount(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatAmount(amount: number) {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPaymentFundingStatus(status: PaymentFundingStatus) {
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

function getPaymentTimingExplanation(status: PaymentFundingStatus) {
  switch (status) {
    case "funded-by-due-date":
      return "Sufficient deployable cash is available no later than the required due date.";

    case "funded-after-due-date":
      return "The full payment can be funded, but sufficient deployable cash becomes available after the required due date.";

    case "partially-funded":
      return "Only part of the required payment can be funded from the current dated funding sources.";

    case "unfunded":
      return "No deployable cash is currently available for this required payment.";
  }
}

function formatStatus(status: PortfolioAccountSummary["accountStatus"]) {
  return status
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function getStrategyTitle(strategy: FinancialStrategy) {
  switch (strategy) {
    case "survival":
      return "Survival";

    case "balanced":
      return "Balanced";

    case "debt-elimination":
      return "Debt Elimination";

    case "interest-reduction":
      return "Interest Reduction";

    case "reward-optimization":
      return "Reward Optimization";
  }
}

function getStrategyExplanation(strategy: FinancialStrategy) {
  switch (strategy) {
    case "balanced":
      return "The Balanced strategy protects the configured cash reserve, funds known required obligations from deployable cash, and preserves any funding buffer for future decisions.";

    case "survival":
      return "The Survival strategy prioritizes urgent obligations while protecting the configured cash reserve.";

    case "debt-elimination":
      return "The Debt Elimination strategy directs available funding buffer toward reducing outstanding debt balances.";

    case "interest-reduction":
      return "The Interest Reduction strategy prioritizes balances with the greatest projected borrowing cost.";

    case "reward-optimization":
      return "The Reward Optimization strategy coordinates payment requirements with account benefits and rewards.";
  }
}

export function PaycheckPlanningView({ accounts }: PaycheckPlanningViewProps) {
  const [draft, setDraft] = useState<PaycheckDraft>({
    source: "American Airlines",
    expectedDate: "",
    netPay: "",
    currentCash: "",
  });

  const [minimumCashReserveInput, setMinimumCashReserveInput] = useState(
    defaultFundingPolicy.minimumCashReserve.toString(),
  );

  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan | null>(null);

  const [selectedStrategy, setSelectedStrategy] =
    useState<FinancialStrategy>("balanced");

  const expectedNetPay = parseAmount(draft.netPay);
  const currentCash = parseAmount(draft.currentCash);
  const planningDate = getTodayDate();

  const fundingSources = useMemo<FundingSource[]>(() => {
    const sources: FundingSource[] = [];

    if (currentCash > 0) {
      sources.push({
        id: "opening-cash",
        date: planningDate,
        amount: currentCash,
        type: "opening-cash",
        title: "Opening Cash",
        description: "Current cash available at the start of planning",
      });
    }

    if (draft.expectedDate && expectedNetPay > 0) {
      sources.push({
        id: "upcoming-paycheck",
        date: draft.expectedDate,
        amount: expectedNetPay,
        type: "paycheck",
        title: draft.source || "Upcoming Paycheck",
        description: "Expected net paycheck",
      });
    }

    return sources;
  }, [
    currentCash,
    draft.expectedDate,
    draft.source,
    expectedNetPay,
    planningDate,
  ]);

  const availableCash = useMemo(
    () => fundingSources.reduce((total, source) => total + source.amount, 0),
    [fundingSources],
  );

  const paycheckDateRequired = expectedNetPay > 0;
  const paycheckDateMissing = paycheckDateRequired && !draft.expectedDate;

  const canGeneratePlan = availableCash > 0 && !paycheckDateMissing;

  const fundingPolicy = useMemo<FundingPolicy>(
    () => ({
      minimumCashReserve: Math.max(parseAmount(minimumCashReserveInput), 0),
    }),
    [minimumCashReserveInput],
  );

  const fundingPlanPreview = useMemo(
    () =>
      buildFundingPlan({
        planningDate,
        accounts,
        fundingSources,
        policy: fundingPolicy,
      }),
    [accounts, fundingPolicy, fundingSources, planningDate],
  );

  const activeObligations = useMemo(
    () =>
      accounts
        .filter(
          (account) =>
            account.accountStatus !== "paid-off" && account.paymentDueDate,
        )
        .sort((left, right) =>
          (left.paymentDueDate ?? "").localeCompare(right.paymentDueDate ?? ""),
        ),
    [accounts],
  );

  const requiredObligationsTotal = useMemo(
    () =>
      activeObligations.reduce(
        (total, account) => total + (account.minimumPaymentDue ?? 0),
        0,
      ),
    [activeObligations],
  );

  const projectedFundingBuffer =
    fundingPlanPreview.position.deployableCash - requiredObligationsTotal;

  const fundingStatus =
    availableCash === 0
      ? "awaiting-input"
      : projectedFundingBuffer >= 0
        ? "funded"
        : "shortfall";

  const missingPaymentAmounts = activeObligations.filter(
    (account) => account.minimumPaymentDue === undefined,
  );

  const paymentTimingSummary = useMemo(() => {
    if (!paymentPlan) {
      return {
        fundedByDueDate: 0,
        fundedAfterDueDate: 0,
        partiallyFunded: 0,
        unfunded: 0,
      };
    }

    return paymentPlan.items.reduce(
      (summary, item) => {
        switch (item.fundingStatus) {
          case "funded-by-due-date":
            summary.fundedByDueDate += 1;
            break;

          case "funded-after-due-date":
            summary.fundedAfterDueDate += 1;
            break;

          case "partially-funded":
            summary.partiallyFunded += 1;
            break;

          case "unfunded":
            summary.unfunded += 1;
            break;
        }

        return summary;
      },
      {
        fundedByDueDate: 0,
        fundedAfterDueDate: 0,
        partiallyFunded: 0,
        unfunded: 0,
      },
    );
  }, [paymentPlan]);

  const cashFlowTimeline = useMemo(
    () =>
      buildFundingTimeline({
        openingCash: currentCash,
        protectedCash: fundingPlanPreview.position.protectedCash,
        fundingSources,
        paymentPlan,
        unknownObligations: missingPaymentAmounts,
      }),
    [
      currentCash,
      fundingPlanPreview.position.protectedCash,
      fundingSources,
      missingPaymentAmounts,
      paymentPlan,
    ],
  );

  function updateDraft<K extends keyof PaycheckDraft>(
    field: K,
    value: PaycheckDraft[K],
  ) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));

    setPaymentPlan(null);
  }

  function updateMinimumCashReserve(value: string) {
    setMinimumCashReserveInput(value);
    setPaymentPlan(null);
  }

  function handleStrategyChange(strategy: FinancialStrategy) {
    setSelectedStrategy(strategy);
    setPaymentPlan(null);
  }

  function handleGeneratePlan() {
    if (!canGeneratePlan) {
      return;
    }

    setPaymentPlan(fundingPlanPreview);
  }

  return (
    <section className="finance-workspace__paycheck-planning">
      <div className="finance-workspace__section-header">
        <div>
          <p>Paycheck Planning</p>
          <span>Plan how upcoming income should cover your obligations</span>
        </div>
      </div>

      <div className="finance-workspace__paycheck-planning-grid">
        <section className="finance-workspace__paycheck-entry">
          <div className="finance-workspace__section-header">
            <div>
              <p>Upcoming Paycheck</p>
              <span>Enter expected cash available to build a funding plan</span>
              {paycheckDateMissing ? (
                <p className="finance-workspace__funding-message">
                  Enter the expected paycheck date before building the Funding
                  Plan. Payment timing cannot be evaluated without a dated
                  income event.
                </p>
              ) : null}
            </div>
          </div>

          <div className="finance-workspace__paycheck-fields">
            <label>
              Paycheck source
              <input
                value={draft.source}
                onChange={(event) => updateDraft("source", event.target.value)}
                placeholder="American Airlines"
              />
            </label>

            <label>
              Expected date
              <input
                type="date"
                value={draft.expectedDate}
                onChange={(event) =>
                  updateDraft("expectedDate", event.target.value)
                }
              />
            </label>

            <label>
              Expected net pay
              <input
                type="number"
                min="0"
                step="0.01"
                value={draft.netPay}
                onChange={(event) => updateDraft("netPay", event.target.value)}
                placeholder="0.00"
              />
            </label>

            <label>
              Current cash available
              <input
                type="number"
                min="0"
                step="0.01"
                value={draft.currentCash}
                onChange={(event) =>
                  updateDraft("currentCash", event.target.value)
                }
                placeholder="0.00"
              />
            </label>
            <label>
              Minimum cash reserve
              <input
                type="number"
                min="0"
                step="0.01"
                value={minimumCashReserveInput}
                onChange={(event) =>
                  updateMinimumCashReserve(event.target.value)
                }
                placeholder="0.00"
              />
            </label>
          </div>
        </section>

        <section className="finance-workspace__funding-position">
          <div className="finance-workspace__funding-position-header">
            <span>Funding Position</span>

            <span
              className={`finance-workspace__funding-status finance-workspace__funding-status--${fundingStatus}`}
            >
              {fundingStatus === "awaiting-input"
                ? "Awaiting paycheck"
                : fundingStatus === "funded"
                  ? "Obligations covered"
                  : "Funding shortfall"}
            </span>
          </div>

          <div className="finance-workspace__funding-equation">
            <div>
              <span>Gross Available Cash</span>
              <strong>
                {formatAmount(fundingPlanPreview.position.grossAvailableCash)}
              </strong>
            </div>

            <span aria-hidden="true">−</span>

            <div>
              <span>Protected Cash</span>
              <strong>
                {formatAmount(fundingPlanPreview.position.protectedCash)}
              </strong>
            </div>

            <span aria-hidden="true">=</span>

            <div>
              <span>Deployable Cash</span>
              <strong>
                {formatAmount(fundingPlanPreview.position.deployableCash)}
              </strong>
            </div>

            <span aria-hidden="true">−</span>

            <div>
              <span>Known Required Payments</span>
              <strong>{formatAmount(requiredObligationsTotal)}</strong>
            </div>

            <span aria-hidden="true">=</span>

            <div>
              <span>
                {projectedFundingBuffer >= 0
                  ? "Projected Funding Buffer"
                  : "Funding Shortfall"}
              </span>

              <strong>{formatAmount(Math.abs(projectedFundingBuffer))}</strong>
            </div>
          </div>

          <dl>
            <div>
              <dt>Expected Net Pay</dt>
              <dd>{formatAmount(parseAmount(draft.netPay))}</dd>
            </div>

            <div>
              <dt>Funding Sources</dt>
              <dd>{fundingSources.length}</dd>
            </div>

            <div>
              <dt>Current Cash</dt>
              <dd>{formatAmount(parseAmount(draft.currentCash))}</dd>
            </div>

            <div>
              <dt>Configured Reserve</dt>
              <dd>{formatAmount(fundingPolicy.minimumCashReserve)}</dd>
            </div>

            <div>
              <dt>Protected Cash</dt>
              <dd>{formatAmount(fundingPlanPreview.position.protectedCash)}</dd>
            </div>

            <div>
              <dt>Deployable Cash</dt>
              <dd>
                {formatAmount(fundingPlanPreview.position.deployableCash)}
              </dd>
            </div>

            <div>
              <dt>Paycheck Date</dt>
              <dd>{draft.expectedDate || "Not entered"}</dd>
            </div>

            <div>
              <dt>Known Payments</dt>
              <dd>{activeObligations.length}</dd>
            </div>
          </dl>

          {fundingStatus === "shortfall" ? (
            <p className="finance-workspace__funding-message">
              Deployable cash is insufficient to cover all known required
              payments after protecting the configured reserve. The plan will
              prioritize past-due accounts and then remaining obligations by due
              date.
            </p>
          ) : null}

          {fundingStatus === "funded" ? (
            <p className="finance-workspace__funding-message">
              All known required payments are covered using deployable cash. The
              projected funding buffer will remain unallocated, and the
              protected reserve will not be used by the current strategy.
            </p>
          ) : null}
        </section>
      </div>

      <section className="finance-workspace__paycheck-obligations">
        <div className="finance-workspace__section-header">
          <div>
            <p>Known Obligations</p>
            <span>Active accounts with entered payment dates</span>
          </div>

          <span>{activeObligations.length} tracked</span>
        </div>

        <div className="finance-workspace__paycheck-obligation-list">
          {activeObligations.map((account) => (
            <article key={account.id}>
              <div>
                <strong>{account.accountName}</strong>
                <span>{account.institution}</span>
              </div>

              <div>
                <span>Due</span>
                <strong>{account.paymentDueDate}</strong>
              </div>

              <div>
                <span>Required Payment</span>
                <strong>
                  {account.minimumPaymentDue === undefined
                    ? "Not entered"
                    : formatAmount(account.minimumPaymentDue)}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{formatStatus(account.accountStatus)}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      {missingPaymentAmounts.length > 0 ? (
        <section className="finance-workspace__planning-warning">
          <strong>Incomplete obligation data</strong>
          <p>
            {missingPaymentAmounts
              .map((account) => account.accountName)
              .join(", ")}{" "}
            {missingPaymentAmounts.length === 1 ? "does" : "do"} not have a
            required payment entered and will not receive an allocation.
          </p>
        </section>
      ) : null}

      <PaycheckStrategySelector
        selectedStrategy={selectedStrategy}
        onStrategyChange={handleStrategyChange}
      />

      <button
        className="finance-workspace__generate-plan"
        type="button"
        disabled={!canGeneratePlan}
        onClick={handleGeneratePlan}
      >
        {availableCash <= 0
          ? "Enter Funds to Build Funding Plan"
          : paycheckDateMissing
            ? "Enter Paycheck Date to Build Funding Plan"
            : fundingPlanPreview.position.deployableCash > 0
              ? `Build Funding Plan for ${formatAmount(
                  fundingPlanPreview.position.deployableCash,
                )}`
              : "Build Funding Plan"}
      </button>

      {paymentPlan ? (
        <section className="finance-workspace__payment-plan">
          <div className="finance-workspace__section-header">
            <div>
              <p>Funding Plan</p>
              <span>
                {getStrategyTitle(selectedStrategy)} strategy · Past-due
                accounts first, then remaining payments by due date
              </span>
            </div>

            <span>
              {paymentPlan.position.unresolvedObligations > 0
                ? `${formatAmount(
                    paymentPlan.position.unresolvedObligations,
                  )} unresolved`
                : paymentTimingSummary.fundedAfterDueDate > 0
                  ? "Fully funded with timing risk"
                  : "All known payments funded by due date"}
            </span>
          </div>

          <div className="finance-workspace__strategy-summary">
            <span>Active Strategy</span>
            <strong>{getStrategyTitle(selectedStrategy)}</strong>
            <p>{getStrategyExplanation(selectedStrategy)}</p>
          </div>
          <div className="finance-workspace__payment-plan-summary">
            <article>
              <span>Funded by Due Date</span>
              <strong>{paymentTimingSummary.fundedByDueDate}</strong>
            </article>

            <article>
              <span>Funded After Due Date</span>
              <strong>{paymentTimingSummary.fundedAfterDueDate}</strong>
            </article>

            <article>
              <span>Partially Funded</span>
              <strong>{paymentTimingSummary.partiallyFunded}</strong>
            </article>

            <article>
              <span>Unfunded</span>
              <strong>{paymentTimingSummary.unfunded}</strong>
            </article>
          </div>

          {paymentTimingSummary.fundedAfterDueDate > 0 ? (
            <section className="finance-workspace__planning-warning">
              <strong>Late funding detected</strong>
              <p>
                {paymentTimingSummary.fundedAfterDueDate}{" "}
                {paymentTimingSummary.fundedAfterDueDate === 1
                  ? "payment is"
                  : "payments are"}{" "}
                fully affordable only after the required due date. Review
                paycheck timing and payment scheduling before proceeding.
              </p>
            </section>
          ) : null}

          {paymentTimingSummary.partiallyFunded > 0 ||
          paymentTimingSummary.unfunded > 0 ? (
            <section className="finance-workspace__planning-warning">
              <strong>Incomplete funding</strong>
              <p>
                The current dated funding sources do not fully cover every known
                required payment. Unresolved amounts remain excluded from
                scheduled payments.
              </p>
            </section>
          ) : null}

          <div className="finance-workspace__payment-plan-list">
            {paymentPlan.items.map((item) => (
              <article key={item.accountId}>
                <div>
                  <strong>{item.accountName}</strong>
                  <span>{item.institution}</span>
                </div>

                <div>
                  <span>Due</span>
                  <strong>{item.dueDate}</strong>
                </div>

                <div>
                  <span>Required</span>
                  <strong>{formatAmount(item.requestedAmount)}</strong>
                </div>

                <div>
                  <span>Allocate</span>
                  <strong>{formatAmount(item.allocatedAmount)}</strong>
                </div>
                <div>
                  <span>Funded by Due Date</span>
                  <strong>{formatAmount(item.fundedAmountByDueDate)}</strong>
                </div>
                <div>
                  <span>Fully Funded On</span>
                  <strong>{item.fundedDate ?? "Not fully funded"}</strong>
                </div>

                <div>
                  <span>Reason</span>
                  <strong>
                    {item.reason === "past-due"
                      ? "Past-due priority"
                      : "Required payment"}
                  </strong>
                </div>

                <div>
                  <span>Timing Status</span>
                  <strong>
                    {formatPaymentFundingStatus(item.fundingStatus)}
                  </strong>

                  <small>
                    {getPaymentTimingExplanation(item.fundingStatus)}
                  </small>
                </div>
              </article>
            ))}
          </div>

          <div className="finance-workspace__payment-plan-summary">
            <article>
              <span>Gross Available Cash</span>
              <strong>
                {formatAmount(paymentPlan.position.grossAvailableCash)}
              </strong>
            </article>

            <article>
              <span>Protected Cash</span>
              <strong>
                {formatAmount(paymentPlan.position.protectedCash)}
              </strong>
            </article>

            <article>
              <span>Deployable Cash</span>
              <strong>
                {formatAmount(paymentPlan.position.deployableCash)}
              </strong>
            </article>

            <article>
              <span>Allocated Cash</span>
              <strong>
                {formatAmount(paymentPlan.position.allocatedCash)}
              </strong>
            </article>

            <article>
              <span>Funding Buffer</span>
              <strong>
                {formatAmount(paymentPlan.position.fundingBuffer)}
              </strong>
            </article>

            <article>
              <span>Unresolved Obligations</span>
              <strong>
                {formatAmount(paymentPlan.position.unresolvedObligations)}
              </strong>
            </article>
          </div>

          <p className="finance-workspace__payment-plan-explanation">
            This plan uses dated funding sources and allocates only deployable
            cash. Each obligation is evaluated against when its funding becomes
            available, not only against total cycle cash. Protected cash remains
            outside the plan. Interest, utilization, grace-period, and benefit
            optimization are not yet applied.
          </p>

          <CashFlowTimelineView timeline={cashFlowTimeline} />
        </section>
      ) : null}
    </section>
  );
}
