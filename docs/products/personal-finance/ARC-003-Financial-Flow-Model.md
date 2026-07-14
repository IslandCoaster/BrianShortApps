# BrianShortApps Financial Flow Model

## Document Status

| Field | Value |
|---|---|
| Architecture milestone | ARC-003 |
| Status | Accepted |
| Product | BrianShortApps Personal Finance |
| Document authority | Canonical operational cash-flow architecture |
| Primary audience | Product engineering, architecture, validation, and future contributors |

This document defines how money moves through the BrianShortApps Financial
Operating System.

ARC-002 defines the canonical financial concepts.

ARC-003 defines the relationships, routing, timing, and state transitions that
connect those concepts into an operational financial flow.

---

# 1. Purpose

The Financial Flow Model exists to answer:

> How does money enter, move through, leave, and reconcile within the Financial
> Operating System?

The model establishes one canonical flow for:

- Current cash
- Asset accounts
- Future funding sources
- Deposit routing
- Debt accounts
- Recurring obligations
- Settlement routing
- Funding plans
- Account projections
- Ledger events
- Reconciliation
- Variance analysis

The model must support explainable answers to questions such as:

- Where will an incoming paycheck be deposited?
- Which account is responsible for paying an obligation?
- Will that account contain enough cash on the payment date?
- Can the portfolio fund all known obligations?
- Will any individual account become negative?
- Did the posted payment match the planned settlement?
- Can the resulting statement be qualified against replayed financial history?

---

# 2. Scope

## 2.1 Included

ARC-003 governs:

- Operational cash initialization
- Asset-account balances
- Future funding sources
- Funding destination assignments
- Funding conservation
- Settlement-account assignments
- Funding-plan allocations
- Planned payment timing
- Account-aware cash projections
- Ledger posting
- Statement reconciliation
- Variance qualification

## 2.2 Excluded for now

The following remain outside this milestone:

- Work-hours calculations
- Pay-rate modeling
- Interest optimization strategies
- Rewards optimization
- Automatic transaction imports
- Automatic statement imports
- Automated payment execution
- Bank-account transfers
- AI-generated financial advice

These capabilities may consume the Financial Flow Model later but must not alter
its core routing and accounting boundaries.

---

# 3. Architectural Principles

## 3.1 Money must have an origin

Every cash inflow must identify where it came from.

Examples:

- Opening cash position
- Paycheck
- Refund
- Reimbursement
- Transfer
- Manual adjustment

A cash inflow must identify an operational source, category, or originating
financial event before it enters replay.

## 3.2 Money must have a destination

Every future funding source intended for account-level projection must be routed
to one or more asset accounts.

Examples:

- Paycheck to Primary Checking
- Bonus split between Checking and Savings
- Refund to Savings

Unallocated or invalid funding sources must remain visible but must not affect
account projections.

## 3.3 Obligations must have a settlement route

Every debt payment or recurring obligation may identify the asset account
expected to fund its settlement.

Canonical relationship:

```text
Debt Account or Financial Obligation
→ Settlement Account
```

The settlement account must be an active checking or savings account.

The relationship is optional until the user establishes it.

The system must never guess a settlement account.

## 3.4 Portfolio sufficiency and account liquidity are distinct

The system must maintain two independent conclusions.

### Portfolio Funding Status

Determines whether total deployable cash can fund all known requirements.

### Account Liquidity Status

Determines whether the designated settlement account contains sufficient cash
on each planned payment date.

Example:

```text
Portfolio cash: sufficient
Primary Checking: insufficient on July 23
Savings: sufficient but not assigned
```

Portfolio sufficiency must never be interpreted as proof that every settlement
account can complete its assigned payments.

## 3.5 Routing does not move money by itself

A funding destination assignment describes where future cash is expected to
arrive.

A settlement-account assignment describes which account is expected to fund a
payment.

Neither assignment creates a posted financial event.

Actual financial history changes only through immutable ledger events.

## 3.6 Projection is not history

Projected deposits and planned settlements are simulated future movements.

They must remain distinct from:

- Posted deposits
- Completed payments
- Reconciled statement activity
- Historical ledger events

## 3.7 Conservation must hold

For every routed funding source:

```text
Total destination allocations
=
Funding source amount
```

A funding source may not be projected when it is:

- Unallocated
- Partially allocated
- Overallocated
- Routed to an invalid account

For every funding plan:

```text
Allocated cash
≤
Deployable cash
```

For every account projection:

```text
Opening balance
+ projected deposits
- projected settlements
=
Projected closing balance
```

---

# 4. Canonical Financial Flow

```text
Opening Cash Event
        ↓
Operational Ledger Replay
        ↓
Current Cash Position
        ↓
Future Funding Sources
        ↓
Funding Destination Routing
        ↓
Asset Account Deposit Projection
        ↓
Known Debt and Obligation Requirements
        ↓
Settlement Account Routing
        ↓
Operational Funding Plan
        ↓
Account-Aware Payment Projection
        ↓
Projected Account Liquidity
        ↓
Actual Posted Activity
        ↓
Ledger Replay
        ↓
Statement Reconciliation
        ↓
Variance Qualification
```

---

# 5. Flow Concepts

## 5.1 Current Cash Position

### Definition

Current Cash Position is the replay-derived amount of operational cash
available as of the planning date.

### Source

Current Cash Position must originate from posted operational ledger events.

### Does Not Mean

Current Cash Position does not identify which asset account physically holds
the cash unless account-level ledger routing has been established.

---

## 5.2 Funding Source

### Definition

A Funding Source is a known or planned future cash inflow.

Examples:

- Paycheck
- Bonus
- Refund
- Reimbursement
- Transfer received

### Required Attributes

- Identity
- Amount
- Expected availability date
- Status

### Relationship

```text
Funding Source
→ Funding Deposit Allocations
→ Asset Accounts
```

---

## 5.3 Funding Deposit Allocation

### Definition

A Funding Deposit Allocation assigns part of a Funding Source to an asset
account.

### Responsibilities

- Identify destination account
- Preserve funding conservation
- Support account-level deposit projection
- Surface invalid or incomplete routing

### Restrictions

The destination account must be:

- Active
- Checking or savings
- Present in the operational account repository

---

## 5.4 Funding Requirement

### Definition

A Funding Requirement is a dated amount that should be funded.

Sources include:

- Credit-card minimum payment
- Loan payment
- Utility obligation
- Future recurring-obligation types

### Required Attributes

- Requirement identity
- Requirement type
- Amount
- Due date
- Counterparty
- Past-due status

Requirements missing an amount or due date must be excluded from allocation and
surfaced as incomplete planning data.

---

## 5.5 Settlement Account

### Definition

A Settlement Account is the asset account designated to fund a debt payment or
financial obligation.

### Canonical Field

```ts
settlementAccountId?: string;
```

### Applies To

- Credit-card accounts
- Loan accounts
- Financial obligations

### Does Not Apply To

- Checking accounts
- Savings accounts
- Funding sources

### Validation

When present, `settlementAccountId` must reference an active checking or savings
account.

### Missing Routing

A requirement without a settlement account may still participate in the
portfolio-level Funding Plan.

It may not participate in account-level payment projection.

The system must surface the requirement as awaiting settlement routing.

---

## 5.6 Operational Funding Plan

### Definition

The Operational Funding Plan allocates current and future deployable cash
against known dated requirements.

### Inputs

- Planning date
- Current cash
- Minimum cash reserve
- Accounts
- Obligations
- Future funding sources

### Outputs

- Portfolio funding position
- Requirement allocations
- Funding timing
- Funding status
- Excluded requirements

### Boundary

The Funding Plan answers whether cash exists and when it becomes available.

It does not prove that the designated settlement account contains the cash.

---

## 5.7 Account-Aware Projection

### Definition

Account-Aware Projection reconstructs expected future balances for each active
asset account.

### Canonical Equation

```text
Opening Account Balance
+ Valid Routed Deposits
- Planned Settlements
=
Projected Closing Balance
```

### Entry Types

```text
funding-deposit
planned-settlement
```

Future entry types may include:

```text
planned-transfer
fee
interest-credit
refund
manual-adjustment
```

### Required Output Per Account

- Opening balance
- Total planned deposits
- Total planned settlements
- Lowest projected balance
- Closing projected balance
- Chronological entries
- Liquidity status

---

## 5.8 Account Liquidity Status

### Definition

Account Liquidity Status describes whether an asset account can complete its
assigned settlements without becoming negative.

### Initial Statuses

```text
healthy
low-buffer
overdraft-risk
routing-incomplete
```

### Initial Interpretation

- `healthy` — all projected settlements complete and the account remains at or
  above zero.
- `low-buffer` — all projected settlements complete, but the lowest projected
  balance falls below a configured buffer.
- `overdraft-risk` — the projected balance becomes negative.
- `routing-incomplete` — one or more relevant settlements cannot be projected
  because routing is missing or invalid.

---

# 6. Timing Rules

## 6.1 Deposit timing

A projected deposit becomes available on the Funding Source `expectedOn` date.

## 6.2 Payment timing

A planned settlement uses the payment date produced by the Operational Funding
Plan.

The payment date may be:

- The requirement due date
- The planning date for an already past-due requirement
- A later funding-availability date when cash arrives after the due date

## 6.3 Same-day ordering

When a deposit and settlement occur on the same date, ordering must be
deterministic.

Initial canonical order:

```text
Opening Position
→ Funding Deposits
→ Planned Settlements
```

This ordering allows funds becoming available that day to support settlements
planned for that day.

Institution-specific posting cutoffs may require future refinement.

## 6.4 Date semantics

All operational dates must use canonical `YYYY-MM-DD` date strings unless a
domain explicitly requires timestamp precision.

---

# 7. Validation and Failure States

## 7.1 Missing settlement route

The requirement remains valid for portfolio funding.

It is excluded from account-level payment projection.

## 7.2 Invalid settlement route

Examples:

- Referenced account does not exist
- Referenced account is closed
- Referenced account is paid off
- Referenced account is a credit card
- Referenced account is a loan

The system must surface the invalid relationship and must not project the
settlement.

## 7.3 Insufficient portfolio cash

The Funding Plan reports partial or unresolved funding.

Account projections include only the amount actually allocated.

## 7.4 Sufficient portfolio cash but insufficient account liquidity

The Funding Plan may report the requirement as funded.

The account projection separately reports overdraft risk.

The system must not silently transfer funds between accounts.

## 7.5 Unrouted future funding

The funding source remains excluded from account projections until allocation
conservation is satisfied.

---

# 8. Ledger and Reconciliation Boundary

## 8.1 Planned activity

Planned deposits and settlements belong to projection state.

They do not alter the operational ledger.

## 8.2 Posted activity

When real activity occurs, it must be recorded as immutable ledger events.

Examples:

- Deposit posted
- Payment completed
- Fee posted
- Refund posted

## 8.3 Reconciliation

Reconciliation compares projected or expected activity with posted activity.

Canonical comparison:

```text
Expected Settlement
vs.
Posted Settlement
```

## 8.4 Variance

Variance may include:

- Amount variance
- Date variance
- Source-account variance
- Destination-account variance
- Missing activity
- Duplicate activity

## 8.5 Qualification

A statement or account period is qualified when replayed posted activity
explains the institution-reported result within accepted tolerances.

ARC-003 establishes the routing relationships required for later
reconciliation but does not implement reconciliation itself.

---

# 9. Initial Implementation Roadmap

## FL-001.9.6.1 — Settlement Relationship Foundation

- Add optional `settlementAccountId` to credit cards, loans, and obligations
- Validate optional non-empty identifiers
- Restore and persist the relationship
- Preserve compatibility with existing stored data

## FL-001.9.6.2 — Settlement Routing Intake

- Supply active asset accounts to debt-account and obligation forms
- Allow explicit settlement-account selection
- Display missing routing clearly
- Do not select a default automatically

## FL-001.9.6.3 — Account-Aware Settlement Projection

- Extend asset-account projection entries
- Apply planned payment outflows
- Preserve deterministic date ordering
- Include only actual Funding Plan allocations
- Calculate lowest and closing balances

## FL-001.9.6.4 — Liquidity Risk

- Add account-liquidity statuses
- Surface overdraft risk
- Surface low-buffer conditions
- Distinguish routing issues from funding issues
- Keep portfolio and account conclusions separate

---

# 10. Architectural Decisions

## ADR-003.1 — Settlement terminology

The canonical field is `settlementAccountId`.

Reason:

- It describes the account through which a requirement is expected to settle.
- It avoids confusion with funding-source destination routing.
- It supports debt accounts and recurring obligations consistently.
- It prepares the system for reconciliation terminology.

## ADR-003.2 — Optional routing

Settlement routing is optional at the domain level.

Reason:

- Existing data remains valid.
- Users may not know routing during initial intake.
- Missing information must remain explicit rather than guessed.

## ADR-003.3 — No implicit transfers

The projection engine must not move cash between accounts automatically.

Reason:

- Account balances are independent.
- A transfer is a financial event.
- Silent transfers would conceal liquidity risk.
- Future transfer recommendations must remain explainable.

## ADR-003.4 — Funding and liquidity remain independent

Portfolio funding and account liquidity must be calculated separately.

Reason:

- Total cash sufficiency does not guarantee account-level solvency.
- This distinction is required for overdraft prevention.
- It supports future transfer recommendations and reconciliation.

---

# 11. Chapter Summary

ARC-002 defines what financial concepts mean.

ARC-003 defines how money moves among those concepts.

The canonical operational flow is:

```text
Cash Origin
→ Funding Source
→ Deposit Routing
→ Asset Account
→ Funding Requirement
→ Settlement Routing
→ Planned Settlement
→ Account Projection
→ Posted Activity
→ Reconciliation
```

Every future operational cash-flow capability should preserve:

- Explicit origins
- Explicit destinations
- Explicit settlement routes
- Deterministic timing
- Conservation
- Separation of projection from history
- Separation of portfolio funding from account liquidity
- Explainable reconciliation
