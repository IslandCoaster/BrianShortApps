# Proposal 006 — Financial Domain Objects

**Status:** Draft  
**Sprint:** Sprint Two — First Private Application

---

## Purpose

Financial Domain Objects define the core things the Personal Finance Operating Environment understands.

These are domain concepts, not database tables.

Implementation details come later.

---

## Core Principle

The application should model financial life before it models storage.

---

## Financial Event

Represents something that changed the user's current or projected financial life.

Examples:

- Paycheck received
- Transaction imported
- Statement generated
- Payment completed
- Credit score updated
- Budget changed

Financial Events enter the Financial Timeline.

---

## Financial Timeline

Represents the permanent historical record of Financial Events.

The timeline records what happened.

The Financial Engine determines what it means.

---

## Financial State

Represents the current understanding of the user's financial life.

Financial State is recalculated from the Financial Timeline.

---

## Financial Snapshot

Represents the rendered summary of Financial State at a point in time.

Used by the Financial Snapshot Workspace.

---

## Account

Represents a financial account.

Examples:

- Checking
- Savings
- Credit Card
- Loan
- Mortgage
- Investment
- Retirement
- 401(k)

Key attributes:

- Institution
- Account type
- Open date
- Current balance
- Credit limit
- Interest rate
- Status
- Security classification

---

## Institution

Represents a financial organization.

Examples:

- Chase
- Discover
- American Express
- Bank
- Credit Union
- Employer
- Loan servicer

---

## Paycheck

Represents income received from employment or another income source.

Key attributes:

- Pay date
- Pay period
- Gross pay
- Net pay
- Taxes
- Deductions
- Retirement contributions
- Employer contributions
- Variance from expected pay

---

## Statement

Represents a periodic financial document from an institution.

Key attributes:

- Statement date
- Closing date
- Due date
- Statement balance
- Minimum payment
- Interest charged
- Fees
- Reconciliation status

---

## Transaction

Represents a financial movement.

Key attributes:

- Date
- Posted date
- Amount
- Description
- Account
- Category
- Statement
- Cleared status
- Reconciliation status

---

## Payment

Represents an intentional payment decision.

Payments are not merely transactions.

Payments may carry strategy.

Key attributes:

- Source account
- Destination account
- Scheduled date
- Paid date
- Amount
- Strategy
- Recommendation source
- Posted status
- Reconciliation status

---

## Obligation

Represents a required or expected financial commitment.

Examples:

- Bill
- Minimum payment
- Loan payment
- Subscription
- Insurance premium

---

## Budget

Represents intentional allocation of resources.

Budgeting is not only expense tracking.

It defines how income should be directed.

---

## Budget Category

Represents a classification used for budget and spending analysis.

---

## Credit Score Snapshot

Represents a score at a specific point in time.

Used for trend and correlation analysis.

---

## Credit Utilization Snapshot

Represents utilization at a specific point in time.

May exist globally and per account.

---

## Debt Strategy

Represents the active debt reduction approach.

Examples:

- Snowball
- Avalanche
- Hybrid
- Custom

---

## Forecast

Represents projected future Financial State.

Forecasts are derived.

They are not manually maintained.

---

## Recommendation

Represents an action suggested by the Financial Engine.

Every recommendation should include:

- What changed
- Why it matters
- Recommended action
- Expected outcome
- Priority
- Status

---

## Goal

Represents a desired financial outcome.

Examples:

- Debt free
- Emergency fund funded
- Credit score target
- Net worth target
- Retirement contribution target

---

## Report

Represents a historical interpretation of Financial States over a defined period.

Reports are derived from the Financial Timeline.

---

## Security Classification

Represents the sensitivity of financial information.

Examples:

- Private
- Confidential
- Restricted

Financial data should default to Confidential unless explicitly classified otherwise.

---

## Object Rule

Domain Objects describe the user's financial life.

They do not describe UI components.

They do not describe database tables.

They do not describe API routes.

---

## Product Promise

The Personal Finance Operating Environment should use consistent financial language across every workspace, engine, document, and recommendation.
