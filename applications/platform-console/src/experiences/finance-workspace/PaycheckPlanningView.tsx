import { useMemo, useState } from "react";

import {
  PaycheckStrategySelector,
  type FinancialStrategy,
} from "./PaycheckStrategySelector";
import type { PortfolioAccountSummary } from "./portfolio.types";

type PaycheckPlanningViewProps = {
  accounts: PortfolioAccountSummary[];
};

type PaycheckDraft = {
  source: string;
  expectedDate: string;
  netPay: string;
  currentCash: string;
};

type PaymentPlanItem = {
  accountId: string;
  accountName: string;
  institution: string;
  dueDate: string;
  requestedAmount: number;
  allocatedAmount: number;
  reason: "past-due" | "required-payment";
  fullyFunded: boolean;
};

type PaymentPlan = {
  availableCash: number;
  totalAllocated: number;
  remainingCash: number;
  unresolvedObligations: number;
  items: PaymentPlanItem[];
};

function parseAmount(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatAmount(amount: number) {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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
      return "The Balanced strategy funds known required obligations while preserving any remaining cash for future financial decisions.";

    case "survival":
      return "The Survival strategy prioritizes urgent obligations and protects available cash.";

    case "debt-elimination":
      return "The Debt Elimination strategy directs remaining funds toward reducing debt balances.";

    case "interest-reduction":
      return "The Interest Reduction strategy prioritizes balances with the greatest projected borrowing cost.";

    case "reward-optimization":
      return "The Reward Optimization strategy coordinates payment requirements with account benefits and rewards.";
  }
}

function createPaymentPlan(
  accounts: PortfolioAccountSummary[],
  availableCash: number,
): PaymentPlan {
  const eligibleAccounts = accounts
    .filter(
      (account) =>
        account.accountStatus !== "paid-off" &&
        account.paymentDueDate &&
        account.minimumPaymentDue !== undefined &&
        account.minimumPaymentDue > 0,
    )
    .sort((left, right) => {
      if (
        left.accountStatus === "past-due" &&
        right.accountStatus !== "past-due"
      ) {
        return -1;
      }

      if (
        right.accountStatus === "past-due" &&
        left.accountStatus !== "past-due"
      ) {
        return 1;
      }

      return (left.paymentDueDate ?? "").localeCompare(
        right.paymentDueDate ?? "",
      );
    });

  let remainingCash = availableCash;

  const items = eligibleAccounts.map((account): PaymentPlanItem => {
    const requestedAmount = account.minimumPaymentDue ?? 0;
    const allocatedAmount = Math.min(requestedAmount, remainingCash);

    remainingCash -= allocatedAmount;

    return {
      accountId: account.id,
      accountName: account.accountName,
      institution: account.institution,
      dueDate: account.paymentDueDate as string,
      requestedAmount,
      allocatedAmount,
      reason:
        account.accountStatus === "past-due" ? "past-due" : "required-payment",
      fullyFunded: allocatedAmount >= requestedAmount,
    };
  });

  const totalAllocated = items.reduce(
    (total, item) => total + item.allocatedAmount,
    0,
  );

  const unresolvedObligations = items.reduce(
    (total, item) =>
      total + Math.max(item.requestedAmount - item.allocatedAmount, 0),
    0,
  );

  return {
    availableCash,
    totalAllocated,
    remainingCash,
    unresolvedObligations,
    items,
  };
}

export function PaycheckPlanningView({ accounts }: PaycheckPlanningViewProps) {
  const [draft, setDraft] = useState<PaycheckDraft>({
    source: "American Airlines",
    expectedDate: "",
    netPay: "",
    currentCash: "",
  });

  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan | null>(null);

  const [selectedStrategy, setSelectedStrategy] =
    useState<FinancialStrategy>("balanced");

  const availableCash = useMemo(
    () => parseAmount(draft.netPay) + parseAmount(draft.currentCash),
    [draft.currentCash, draft.netPay],
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

  const remainingFunds = availableCash - requiredObligationsTotal;

  const fundingStatus =
    availableCash === 0
      ? "awaiting-input"
      : remainingFunds >= 0
        ? "funded"
        : "shortfall";

  const missingPaymentAmounts = activeObligations.filter(
    (account) => account.minimumPaymentDue === undefined,
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

  function handleStrategyChange(strategy: FinancialStrategy) {
    setSelectedStrategy(strategy);
    setPaymentPlan(null);
  }

  function handleGeneratePlan() {
    if (availableCash <= 0) {
      return;
    }

    setPaymentPlan(createPaymentPlan(accounts, availableCash));
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
              <span>Enter the expected funds available for planning</span>
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
              <span>Available for Planning</span>
              <strong>{formatAmount(availableCash)}</strong>
            </div>

            <span aria-hidden="true">−</span>

            <div>
              <span>Required Obligations</span>
              <strong>{formatAmount(requiredObligationsTotal)}</strong>
            </div>

            <span aria-hidden="true">=</span>

            <div>
              <span>
                {remainingFunds >= 0 ? "Remaining Funds" : "Funding Shortfall"}
              </span>
              <strong>{formatAmount(Math.abs(remainingFunds))}</strong>
            </div>
          </div>

          <dl>
            <div>
              <dt>Expected Net Pay</dt>
              <dd>{formatAmount(parseAmount(draft.netPay))}</dd>
            </div>

            <div>
              <dt>Current Cash</dt>
              <dd>{formatAmount(parseAmount(draft.currentCash))}</dd>
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
              The entered funds are insufficient to cover all known required
              payments. The plan will prioritize past-due accounts and then
              remaining obligations by due date.
            </p>
          ) : null}

          {fundingStatus === "funded" ? (
            <p className="finance-workspace__funding-message">
              All known required payments are covered. Any remaining funds will
              remain unallocated until optimization rules are introduced.
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
        disabled={availableCash <= 0}
        onClick={handleGeneratePlan}
      >
        {availableCash > 0
          ? remainingFunds > 0
            ? `Build Funding Plan for ${formatAmount(availableCash)}`
            : "Build Funding Plan"
          : "Enter Funds to Build Funding Plan"}
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
              {paymentPlan.unresolvedObligations > 0
                ? `${formatAmount(
                    paymentPlan.unresolvedObligations,
                  )} unresolved`
                : "All known payments funded"}
            </span>
          </div>

          <div className="finance-workspace__strategy-summary">
            <span>Active Strategy</span>
            <strong>{getStrategyTitle(selectedStrategy)}</strong>
            <p>{getStrategyExplanation(selectedStrategy)}</p>
          </div>

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
                  <span>Reason</span>
                  <strong>
                    {item.reason === "past-due"
                      ? "Past-due priority"
                      : "Required payment"}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    {item.fullyFunded ? "Funded" : "Partially funded"}
                  </strong>
                </div>
              </article>
            ))}
          </div>

          <div className="finance-workspace__payment-plan-summary">
            <article>
              <span>Available</span>
              <strong>{formatAmount(paymentPlan.availableCash)}</strong>
            </article>

            <article>
              <span>Allocated</span>
              <strong>{formatAmount(paymentPlan.totalAllocated)}</strong>
            </article>

            <article>
              <span>Remaining Cash</span>
              <strong>{formatAmount(paymentPlan.remainingCash)}</strong>
            </article>

            <article>
              <span>Unresolved Obligations</span>
              <strong>{formatAmount(paymentPlan.unresolvedObligations)}</strong>
            </article>
          </div>

          <p className="finance-workspace__payment-plan-explanation">
            This plan uses only known required payment amounts. It does not yet
            optimize extra payments for interest, utilization, grace-period
            preservation, or benefits.
          </p>
        </section>
      ) : null}
    </section>
  );
}
