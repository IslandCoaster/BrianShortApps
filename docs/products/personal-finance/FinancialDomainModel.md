# BrianShortApps Financial Domain Model

## Document Status

| Field                  | Value                                                                  |
| ---------------------- | ---------------------------------------------------------------------- |
| Architecture milestone | ARC-002                                                                |
| Status                 | In development                                                         |
| Product                | BrianShortApps Personal Finance                                        |
| Document authority     | Canonical domain architecture                                          |
| Primary audience       | Product engineering, architecture, validation, and future contributors |

This document defines the canonical financial vocabulary, domain ownership,
processing boundaries, relationships, and lifecycle concepts used by the
BrianShortApps Financial Operating System.

It is the source of truth for how the platform understands financial activity.

---

# 1. Purpose

The BrianShortApps Financial Operating System models financial behavior through:

- Immutable financial events
- Deterministic replay
- Derived financial state
- Institution-specific rule configuration
- Explainable calculations
- Scenario simulation
- Decision-oriented recommendations

The system is designed to model financial behavior rather than reproduce the
terminology or software architecture of any single financial institution.

Institution language may vary. Before entering core domain logic, institution-
specific terms must map into canonical BrianShortApps concepts.

The purpose of this model is to ensure that:

1. Every financial concept has a precise meaning.
2. Every concept has an owning domain.
3. Every engine has a defined responsibility.
4. Similar products can share infrastructure without sharing inappropriate rules.
5. Institution-specific behavior remains configurable.
6. Forecasts, accrued values, posted values, and historical outcomes remain distinct.
7. New capabilities extend the platform without weakening established boundaries.

---

# 2. Scope

## 2.1 Included domains

This model currently covers or anticipates:

- Financial events
- Financial journals
- Replay
- Account activity
- Daily ledgers
- Accounts and account profiles
- Account state
- Balance segments
- Statements and billing periods
- Obligations
- Payments
- Payment posting
- Payment allocation
- Interest
- Grace periods
- Credit position
- Promotional financing
- Installment lending
- Repayment lifecycles
- Recurring obligations
- Rewards and benefits
- Simulation
- Recommendations and decision support

## 2.2 Implementation status is separate from domain validity

A concept documented here may be:

- **Implemented** — production code exists.
- **Partially implemented** — foundational behavior exists, but the model is incomplete.
- **Validated** — supported by real financial documents but not yet implemented.
- **Planned** — accepted into the architecture for later implementation.
- **Under investigation** — evidence exists, but the canonical design is unresolved.

A concept does not need to be implemented before it can be formally recognized
by the domain model.

## 2.3 Current product boundaries

The current architecture includes several distinct financial product families:

### Revolving credit

Examples:

- Traditional credit cards
- Store cards
- Charge cards with revolving features
- Cash-advance balances
- Balance-transfer balances

### Installment lending

Examples:

- Student loans
- Personal loans
- Auto loans
- Mortgages

### Recurring obligations

Examples:

- Rent
- Utilities
- Insurance
- Phone service
- Internet
- Subscriptions

### Benefits and optimization

Examples:

- Points
- Miles
- Cash back
- Statement credits
- Lounge access
- Account-specific purchase benefits

These product families may share the Journal and Replay infrastructure while
retaining independent business rules.

---

# 3. Architectural Principles

## 3.1 Events are immutable

Financial history is represented by immutable events.

An existing financial event is not edited to alter history. Corrections,
reversals, and adjustments are represented by additional events.

This preserves:

- Auditability
- Replay consistency
- Historical explanation
- Scenario reproducibility

## 3.2 Replay builds state

Current financial state is derived by replaying financial events.

Derived state must not become an independent source of financial truth.

Canonical direction:

```text
Events
→ Journal
→ Replay
→ Derived State
```

Not:

```text
Mutable State
→ Reconstructed History
```

## 3.3 Statements summarize

Statements are institution-generated summaries of financial activity and account
state.

Statements provide:

- Validation evidence
- Posted outcomes
- Institution terminology
- Rule disclosures
- Billing-period boundaries

Statements do not replace the platform’s domain engines.

## 3.4 Ledgers explain

Statements report results.

Ledgers explain how those results developed over time.

The Daily Ledger should make it possible to answer:

- What was the opening balance?
- What activity occurred?
- What increased the balance?
- What reduced the balance?
- What was the closing balance?
- Which date caused a material change?

## 3.5 Engines calculate

Each domain engine owns a defined financial interpretation.

Examples:

- The Interest Engine calculates and interprets interest.
- The Grace Period Engine evaluates grace-period qualification.
- The Allocation Engine determines payment distribution.
- The Obligation Engine determines amounts that must be satisfied.

Views, statements, and recommendations must not duplicate engine logic.

## 3.6 Domain vocabulary is canonical

Institution terminology must map into canonical platform terminology.

Examples:

```
Monthly Balance
New Balance
Statement Balance
```

may map to a common concept only when their financial meaning is equivalent.

Similarity of wording is not sufficient evidence of equivalence.

## 3.7 Forecast, accrued, and posted values remain distinct

The platform must distinguish among:

- Historical values
- Accrued values
- Projected values
- Posted values
- Simulated values

Projected interest is not posted statement interest.

Accrued interest is not necessarily posted interest.

A simulation result is not actual financial history.

## 3.8 Product domains remain independent

Different financial products may share infrastructure without sharing
inappropriate business rules.

For example:

- Credit cards revolve.
- Installment loans amortize.
- Utilities create recurring variable obligations.
- Insurance creates contractual premium obligations.
- Rewards create optimization value rather than core accounting balances.

The architecture must not force these products into a single behavioral model.

## 3.9 Institution rules are configuration, not universal truth

Issuer-specific rules belong in versioned account or institution configurations.

Examples:

- Payment cutoff times
- Grace-period restoration requirements
- Minimum-payment calculations
- Payment-allocation waterfalls
- Interest computation methods
- Promotional-plan treatment

A rule observed in one statement must not automatically become a platform-wide
rule.

## 3.10 Simulation uses production financial logic

Simulation must use the same engines as actual replay.

Canonical simulation structure:

```
Base Journal
+ Temporary Events
→ Replay
→ Simulated State
```

The platform must not maintain separate simplified calculation logic for
simulation.

## 3.11 Financial domains own behavior

Every financial rule has exactly one owning domain.

Replay coordinates.

It does not interpret.

The ledger explains.

It does not forecast.

Recommendations advise.

They do not calculate.

Domain ownership prevents duplication and preserves explainability.

# 4. Core Processing Pipeline

```
Financial Events
        ↓
Financial Journal
        ↓
Replay Engine
        ↓
Ledger and Derived State
        ↓
Domain Engines
        ├── Account State
        ├── Balance Segments
        ├── Obligations
        ├── Payment Posting
        ├── Payment Allocation
        ├── Grace Period
        ├── Interest
        ├── Credit Position
        ├── Promotional Financing
        ├── Installment Lending
        └── Benefits
        ↓
Recommendation and Decision Support
        ↓
User Experience
```

## 4.1 Processing responsibilities

Financial events

Record what occurred.

Financial journal

Preserves ordered financial history.

Replay engine

Coordinates deterministic interpretation of journal events.

Ledger

Explains balance movement through time.

Domain engines

Interpret financial rules and produce specialized state.

Recommendation and decision support

Translate derived financial state into explainable actions.

User experience

Presents financial history, current state, forecasts, simulations, and
recommendations without owning domain calculations.
