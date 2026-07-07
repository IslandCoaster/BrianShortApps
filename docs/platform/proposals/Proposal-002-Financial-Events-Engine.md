# Proposal 002 — Financial Events & Financial Engine

**Status:** Draft  
**Sprint:** Sprint Two — First Private Application

---

## Purpose

The Personal Finance Operating Environment transforms financial events into an updated financial state, revised forecasts, trend awareness, and recommended next actions.

The product is not a static planner.

It is a living financial model.

---

## Core Principle

Every financial event automatically recalculates the user's complete financial model.

No event updates only one part of the system.

---

## Financial Event

A financial event is any occurrence that changes the current or projected financial state.

---

## Event Categories

### Income Events

- Paycheck received
- Bonus received
- Tax refund received
- Reimbursement received
- Interest or dividend received

### Spending Events

- Purchase posted
- Transaction imported
- Transfer completed
- Withdrawal completed
- Subscription renewed

### Obligation Events

- Statement generated
- Bill received
- Payment due
- Payment completed
- Interest charged
- Late fee assessed

### Credit Events

- Credit score updated
- Credit limit changed
- Account opened
- Account closed
- Balance reported

### Planning Events

- Budget changed
- Goal changed
- Debt strategy changed
- Forecast assumptions updated

---

## Financial Engine

The Financial Engine owns one responsibility:

Maintain an accurate model of the user's financial life.

It does not render UI.

It does not own workspaces.

It produces financial state.

---

## Event Pipeline

Financial Event

?

Validate

?

Update Financial Model

?

Recalculate Financial State

?

Update Forecast

?

Detect Trends

?

Generate Recommendations

?

Notify Operating Environment

---

## Financial State

Financial State represents the complete, continuously recalculated understanding of a person's financial life at a single moment in time.

It includes:

- Liquidity
- Income
- Obligations
- Credit
- Debt
- Budget
- Assets
- Liabilities
- Retirement
- Net Worth
- Forecast
- Financial Health
- Recommendations

---

## Financial Snapshot

The Financial Snapshot is the current rendered view of Financial State.

The dashboard does not calculate.

The dashboard renders the snapshot.

---

## Recommendation Engine

The Recommendation Engine evaluates Financial State and identifies the highest-value actions available to the user.

Every recommendation should explain:

1. What changed
2. Why it matters
3. What action is recommended
4. What outcome is expected

---

## Trend Engine

The Trend Engine detects long-term financial patterns.

Examples:

- Paycheck variance
- Income trend
- Spending trend
- Credit utilization trend
- Credit score correlation
- Net worth trend
- Debt payoff trend

---

## Product Promise

The Personal Finance Operating Environment should answer:

Given everything I know right now, what is the next best financial decision?

---

## Ownership

### BrianShortApps OS Owns

- Operating Environment
- Workspaces
- Documents
- Rendering
- Navigation
- Security Platform

### Personal Finance Owns

- Financial events
- Financial model
- Financial engine
- Financial state
- Financial recommendations
- Financial trends
