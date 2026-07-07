# PF-007 — Financial Positions

**Status:** Draft  
**Product:** Personal Finance Operating Environment

---

## Purpose

Financial Positions aggregate Account States into meaningful financial categories.

Account States explain individual accounts.

Financial Positions explain the user's broader financial reality.

---

## Core Principle

The Financial State should be built from Financial Positions, not raw account data.

---

## Position Flow

Financial Journal

↓

Account State Engine

↓

Position Engine

↓

Financial State

↓

Financial Snapshot

---

## Cash Position

Answers:

How much usable money is available?

Consumes:

- Checking
- Savings
- Cash
- Pending income
- Pending withdrawals

---

## Credit Position

Answers:

How healthy is revolving credit?

Consumes:

- Credit card Account States
- Statement balances
- Current balances
- Projected statement balances
- Credit limits
- Utilization

---

## Debt Position

Answers:

How much is owed and how is it changing?

Consumes:

- Credit cards
- Loans
- Mortgage
- Interest
- Payment history
- Payoff strategy

---

## Retirement Position

Answers:

How is long-term retirement progress developing?

Consumes:

- 401(k)
- IRA
- Roth IRA
- Pension
- Employer match
- Contributions

---

## Wealth Position

Answers:

What is current net worth?

Consumes:

- Assets
- Liabilities
- Cash
- Investments
- Retirement
- Debt

---

## Recommendation Impact

Recommendations should eventually be generated from Positions.

Examples:

- Cash Position may recommend preserving liquidity.
- Credit Position may recommend lowering utilization.
- Debt Position may recommend extra payment.
- Retirement Position may recommend increasing contribution.
- Wealth Position may recommend reviewing net worth trend.

---

## Product Promise

The user should not have to mentally aggregate account-level details into financial meaning.

The Position Engine performs that interpretation.
