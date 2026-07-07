import { paycheckFixture } from "@bsa/finance";

import "./FinanceWorkspace.css";

export function FinanceWorkspace() {
  const { state } = paycheckFixture;
  const latestPaycheck = state.income.paychecks.at(-1);

  return (
    <section className="finance-workspace">
      <div className="finance-workspace__header">
        <p>Personal Finance</p>
        <h2>Financial Snapshot</h2>
        <span>
          First vertical slice: paycheck event ? journal ? engine ? state ? snapshot.
        </span>
      </div>

      <div className="finance-workspace__metrics">
        <article>
          <span>Cash Available</span>
          <strong>${state.liquidity.cashAvailable.toLocaleString()}</strong>
        </article>

        <article>
          <span>Income Received</span>
          <strong>${state.income.receivedIncome.toLocaleString()}</strong>
        </article>

        <article>
          <span>Paychecks Recorded</span>
          <strong>{state.income.paychecks.length}</strong>
        </article>
      </div>

      {latestPaycheck ? (
        <section className="finance-workspace__paycheck">
          <p>Latest Paycheck</p>
          <h3>${latestPaycheck.netPay.toLocaleString()}</h3>
          <span>
            Pay period {latestPaycheck.payPeriodStart} through {latestPaycheck.payPeriodEnd}
          </span>
        </section>
      ) : null}

      <section className="finance-workspace__recommendations">
        <p>Recommended Next Actions</p>

        {state.recommendations.map((recommendation) => (
          <article key={recommendation.id}>
            <span>{recommendation.priority}</span>
            <h3>{recommendation.title}</h3>
            <p>{recommendation.rationale}</p>
          </article>
        ))}
      </section>
    </section>
  );
}
