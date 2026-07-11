import { useMemo, useState } from "react";
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

export function PaycheckPlanningView({ accounts }: PaycheckPlanningViewProps) {
  const [draft, setDraft] = useState<PaycheckDraft>({
    source: "American Airlines",
    expectedDate: "",
    netPay: "",
    currentCash: "",
  });

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

  function updateDraft<K extends keyof PaycheckDraft>(
    field: K,
    value: PaycheckDraft[K],
  ) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
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

        <section className="finance-workspace__available-cash">
          <span>Available for Planning</span>
          <strong>{formatAmount(availableCash)}</strong>

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
          </dl>
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
                <strong>{account.accountStatus}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="finance-workspace__planning-goals">
        <div className="finance-workspace__section-header">
          <div>
            <p>Planning Goals</p>
            <span>Optimization controls will be added in PP-004</span>
          </div>
        </div>

        <div className="finance-workspace__planning-goal-list">
          <label>
            <input type="checkbox" defaultChecked />
            Eliminate past-due accounts
          </label>

          <label>
            <input type="checkbox" defaultChecked />
            Cover all required payments
          </label>

          <label>
            <input type="checkbox" defaultChecked />
            Minimize projected interest
          </label>

          <label>
            <input type="checkbox" />
            Reduce credit utilization
          </label>

          <label>
            <input type="checkbox" defaultChecked />
            Preserve emergency cash
          </label>
        </div>
      </section>

      <button
        className="finance-workspace__generate-plan"
        type="button"
        disabled
      >
        Generate Plan — Available in PP-005
      </button>
    </section>
  );
}
