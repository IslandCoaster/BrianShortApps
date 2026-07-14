# Proposal 004 — Financial State Model

**Status:** Draft  
**Sprint:** Sprint Two — First Private Application

---

## Purpose

Financial State represents the complete, continuously recalculated understanding of a person's financial life at a single moment in time.

Financial State is derived from the Financial Timeline.

It is not manually maintained.

---

## Core Principle

The Personal Finance Operating Environment never asks the user to mentally recalculate their financial life.

The Financial Engine recalculates Financial State after every financial event.

---

## Financial State Dimensions

### Liquidity

- Cash available
- Checking balances
- Savings balances
- Emergency fund
- Available liquidity
- Pending income
- Pending withdrawals

### Income

- Expected income
- Received income
- Paycheck history
- Paycheck variance
- Average paycheck
- Income trend

### Financial Position

- Cash
- Checking
- Savings
- Investments
- Retirement
- 401(k)
- Available liquidity
- Emergency fund

### Obligations

- Upcoming bills
- Upcoming payments
- Statement dates
- Due dates
- Minimum payments
- Recurring commitments

### Credit

- Credit scores
- Credit utilization
- Available credit
- Credit limits
- Account age
- Credit health

### Debt

- Outstanding balances
- Interest rates
- Interest charged
- Payment strategy
- Projected payoff
- Debt-free progress

### Budget

- Monthly budget position
- Category allocation
- Category variance
- Remaining budget
- Spending drift

### Wealth

- Assets
- Liabilities
- Retirement balances
- Net worth
- Net worth trend

### Forecast

- Projected cash
- Projected obligations
- Projected utilization
- Projected debt
- Projected net worth
- Projected financial health

### Financial Health

- Current risks
- Opportunities
- Progress
- Warnings
- Achievements

### Recommendations

- Next best action
- Supporting rationale
- Expected outcome
- Recommendation priority
- Recommendation status

---

## Current, Trend, Forecast

Each major state dimension should eventually support three views:

Current

?

Trend

?

Forecast

The operating environment should explain not only where the user stands today, but how the state is changing and where it is likely headed.

---

## Financial Snapshot

The Financial Snapshot is the rendered summary of Financial State.

The dashboard does not calculate.

It renders the current Financial Snapshot.

---

## Invariants

- Financial State is derived from the Financial Timeline.
- Financial State is recalculated after every financial event.
- Workspaces do not calculate Financial State.
- Workspaces render portions of Financial State.
- Recommendations are generated from Financial State.
- Forecasts are generated from Financial State.
- Reports are historical comparisons of Financial State over time.

---

## Product Promise

The Personal Finance Operating Environment should always answer:

What is financially true right now?

---

## Ownership

### Financial Engine Owns

- Financial State calculation
- Financial Snapshot generation
- Forecast generation
- Recommendation generation
- Trend detection

### Workspaces Own

- Presenting relevant portions of Financial State
- Supporting user review
- Supporting user decisions
- Triggering new financial events through user action
