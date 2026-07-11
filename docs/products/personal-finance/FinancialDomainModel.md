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

## 3.3 Statements summarize. Replay reconstructs. Ledgers explain. Engines interpret.

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

---

# 5. Canonical Domain Vocabulary

The following concepts define the canonical financial language used throughout
the BrianShortApps Financial Operating System.

Institution-specific terminology must map into these concepts before entering
domain logic.

---

## 5.1 Financial Event

### Definition

A Financial Event is an immutable record that a financially meaningful occurrence
took place.

Financial Events describe history.

They do not describe financial state.

Examples include:

- Statement generated
- Payment completed
- Purchase recorded
- Interest posted
- Fee assessed
- Credit issued
- Refund received
- Financing plan created
- Repayment phase changed

---

### Owner

Financial Journal Domain

---

### Responsibilities

A Financial Event is responsible for:

- Recording history
- Preserving event integrity
- Recording effective dates
- Recording posted dates when applicable
- Capturing institution-specific evidence

---

### Does Not Own

A Financial Event never owns:

- Current balances
- Derived financial state
- Recommendations
- Forecasts
- Simulations

---

### Relationships

Financial Event

↓

Financial Journal

↓

Replay

---

### Future Extensions

- Imported institution transactions
- OCR extraction
- API synchronization
- Manual event creation

## 5.2 Financial Journal

### Definition

The Financial Journal is an ordered collection of immutable Financial Events.

It is the historical source of truth for the Financial Operating System.

Every derived financial calculation begins with replaying the Financial Journal.

---

### Owner

Journal Domain

---

### Responsibilities

The Financial Journal is responsible for:

- Preserving event order
- Preserving event history
- Supplying replay input
- Remaining immutable

---

### Does Not Own

The Financial Journal does not own:

- Balances
- Interest
- Recommendations
- Simulations
- Credit Position

---

### Relationships

Financial Journal

↓

Replay Engine

↓

Derived State

---

### Future Extensions

- Multi-source imports
- Event versioning
- Multi-user synchronization
- Institution synchronization

## 5.3 Replay

### Definition

Replay is the deterministic reconstruction of financial state from the Financial Journal.

Replay coordinates domain engines.

Replay does not interpret financial rules itself.

---

### Owner

Replay Domain

---

### Responsibilities

Replay is responsible for:

- Coordinating domain engines
- Producing deterministic derived state
- Supporting repeatable calculations
- Supporting simulation

---

### Does Not Own

Replay does not own:

- Interest calculations
- Grace Period logic
- Payment allocation
- Recommendation logic
- Institution-specific rules

Those responsibilities belong to their respective domains.

---

### Relationships

Financial Journal

↓

Replay

↓

Daily Ledger

↓

Domain Engines

↓

Derived Financial State

---

### Future Extensions

- Financial Sandbox
- Regression validation
- Batch replay
- Scenario comparison
- AI-assisted simulation

## 5.4 Account

### Definition

An Account represents an ongoing financial relationship between an owner and a financial institution.

Examples include:

- Credit card
- Charge card
- Student loan
- Mortgage
- Auto loan
- Utility account
- Insurance account
- Rental account

An Account is the container within which balances, obligations, benefits, financing plans, and institution rules exist.

---

### Owner

Account Domain

---

### Responsibilities

An Account is responsible for:

- Identifying the financial product
- Defining the institution relationship
- Connecting institutional rule sets
- Acting as the parent for financial sub-domains

---

### Does Not Own

An Account does not own:

- Current balances
- Interest calculations
- Recommendations
- Ledger history

Those are derived or delegated to specialized domains.

---

### Relationships

Account

↓

Account Profile

↓

Balance Segments

↓

Obligations

↓

Benefits

↓

Replay

---

### Future Extensions

- Joint ownership
- Business accounts
- Authorized users
- External account synchronization

## 5.5 Account Profile

### Definition

An Account Profile contains the configuration and institution-specific rules that govern how an Account behaves.

Unlike the Account itself, the Account Profile describes behavior rather than ownership.

Examples include:

- Institution
- Product type
- APR configuration
- Grace-period rules
- Payment posting rules
- Credit limits
- Available credit calculations
- Statement schedule
- Rule versions

---

### Owner

Account Configuration Domain

---

### Responsibilities

The Account Profile is responsible for:

- Providing configuration to domain engines
- Defining institution-specific behavior
- Maintaining rule versions
- Isolating institution variability

---

### Does Not Own

The Account Profile does not own:

- Financial history
- Balances
- Interest
- Payments
- Recommendations

---

### Relationships

Account

↓

Account Profile

↓

Replay

↓

Domain Engines

---

### Future Extensions

- Historical rule changes
- Product upgrades
- Institution migrations
- Promotional rule packages

## 5.6 Account Activity

### Definition

Account Activity represents a posted financial occurrence affecting an Account.

Unlike Financial Events, Account Activity describes financial movement rather than historical bookkeeping.

Examples include:

- Purchase
- Payment
- Refund
- Credit
- Fee
- Interest posting
- Cash advance
- Balance transfer
- Adjustment

---

### Owner

Account Activity Domain

---

### Responsibilities

Account Activity is responsible for:

- Describing financial movement
- Identifying activity classification
- Recording posted amounts
- Supplying Daily Ledger replay

---

### Does Not Own

Account Activity does not own:

- Balances
- Interest strategies
- Payment allocation
- Recommendations

---

### Relationships

Financial Event

↓

Account Activity

↓

Daily Ledger

↓

Interest Timeline

---

### Future Extensions

- Merchant enrichment
- Category classification
- Location metadata
- Tax categorization
- AI-assisted categorization

## 5.7 Daily Ledger

### Definition

The Daily Ledger is the chronological accounting interpretation of financial
activity for a single Account.

Unlike the Financial Journal, which records immutable history, the Daily Ledger
explains how balances evolve over time.

The Daily Ledger is generated through replay.

It is never entered manually.

---

### Owner

Ledger Domain

---

### Responsibilities

The Daily Ledger is responsible for:

- Explaining daily balance movement
- Producing opening balances
- Producing closing balances
- Recording daily financial activity totals
- Providing accounting evidence for downstream domain engines

---

### Does Not Own

The Daily Ledger does not own:

- Interest strategies
- Grace-period decisions
- Credit utilization
- Recommendations
- Payment allocation policy

Those responsibilities belong to their respective domains.

---

### Relationships

Financial Journal

↓

Replay

↓

Daily Ledger

↓

Daily Interest Timeline

↓

Derived Financial State

---

### Canonical Daily Equation

Opening Balance

- Purchases

- Fees

- Posted Interest

- Adjustments

* Payments

* Credits

=

Closing Balance

---

### Future Extensions

- Foreign currency translation
- Multi-currency support
- Tax tracking
- Daily cash forecasting
- Institution reconciliation

## 5.8 Balance Segment

### Definition

A Balance Segment represents a portion of an Account balance that behaves
independently under financial rules.

Different Balance Segments may have different:

- APRs
- Interest strategies
- Grace-period eligibility
- Allocation priorities
- Promotional rules

A Balance Segment is the smallest financial unit that independently accrues
interest or participates in payment allocation.

---

### Owner

Balance Segment Domain

---

### Responsibilities

A Balance Segment is responsible for:

- Maintaining segment balance
- Identifying applicable interest strategy
- Identifying grace-period treatment
- Participating in payment allocation
- Providing replay input for Interest

---

### Does Not Own

A Balance Segment does not own:

- Account history
- Recommendations
- Institution configuration
- Simulation

---

### Relationships

Account

↓

Balance Segments

↓

Interest

↓

Allocation

↓

Simulation

---

### Examples

- Purchases
- Cash Advances
- Balance Transfers
- Pay Over Time
- Promotional Financing
- Deferred Interest
- Installment Plans

---

### Future Extensions

- Tax-deductible segments
- Business expense segments
- Investment borrowing

## 5.9 Obligation

### Definition

An Obligation represents an amount that must be satisfied under a financial
agreement or rule.

An Obligation is not the same as an Account Balance.

A balance represents what is owed.

An Obligation represents what must currently be satisfied.

---

### Owner

Obligation Domain

---

### Responsibilities

An Obligation is responsible for:

- Representing required payment amounts
- Representing contractual due amounts
- Identifying due dates
- Supporting financial recommendations
- Supporting simulation

---

### Does Not Own

An Obligation does not own:

- Interest calculations
- Replay
- Payment allocation
- Balance history

---

### Relationships

Account

↓

Obligations

↓

Recommendations

↓

Simulation

---

### Examples

- Minimum Payment
- Statement Balance
- Current Amount Due
- Past Due Amount
- Scheduled Loan Payment
- Save-on-Interest Payment
- Promotional Required Payment
- Rent
- Insurance Premium

---

### Future Extensions

- Multi-obligation prioritization
- Budget planning
- Cash-flow forecasting
- Obligation optimization

## 5.10 Interest

### Definition

Interest represents the financial cost of borrowing money over time.

Interest is not a balance.

Interest is not an obligation.

Interest is a derived financial interpretation produced from replaying
financial history.

The Interest Domain exists to explain how borrowing cost evolves through time.

---

### Owner

Interest Domain

---

### Responsibilities

The Interest Domain is responsible for:

- Calculating daily interest
- Accruing interest through time
- Producing projected interest
- Producing posted statement interest
- Validating institution calculations

---

### Does Not Own

The Interest Domain does not own:

- Account balances
- Payment allocation
- Ledger history
- Recommendations

Those concepts belong to other domains.

---

### Relationships

Daily Ledger

↓

Interest Strategy

↓

Daily Interest Timeline

↓

Interest State

↓

Recommendations

---

### Interest Lifecycle

Daily Interest

↓

Accrued Interest

↓

Projected Interest

↓

Posted Statement Interest

↓

Validation

---

### Future Extensions

- Promotional APR
- Penalty APR
- Variable APR history
- Interest forecasting
- Interest optimization

## 5.11 Interest Strategy

### Definition

An Interest Strategy defines the mathematical method used to calculate
interest for a Balance Segment.

The strategy belongs to the Balance Segment rather than the Account.

Different Balance Segments may simultaneously use different strategies.

---

### Owner

Interest Domain

---

### Responsibilities

An Interest Strategy is responsible for:

- Defining the interest calculation methodology
- Identifying required financial inputs
- Supporting institution-specific calculation rules

---

### Does Not Own

An Interest Strategy does not own:

- Account balances
- Financial history
- Payment allocation

---

### Relationships

Balance Segment

↓

Interest Strategy

↓

Interest Engine

---

### Examples

- Daily Balance
- Average Daily Balance
- Daily Compounding
- Simple Interest
- Deferred Interest
- Promotional APR
- Penalty APR

---

### Future Extensions

- Institution-specific strategies
- Historical strategy changes
- AI-assisted validation

## 5.12 Grace Period

### Definition

A Grace Period is a conditional financial state that determines whether
interest will accrue on eligible Balance Segments.

Grace Periods are evaluated through financial rules.

They are not permanent characteristics of an Account.

---

### Owner

Grace Period Domain

---

### Responsibilities

The Grace Period Domain is responsible for:

- Determining qualification
- Determining loss
- Determining restoration eligibility
- Producing explainable grace-period state

---

### Does Not Own

The Grace Period Domain does not own:

- Payment allocation
- Interest calculations
- Ledger history
- Recommendations

---

### Relationships

Balance Segments

↓

Obligations

↓

Grace Period

↓

Interest

↓

Recommendations

---

### Grace Period Lifecycle

Active

↓

Lost

↓

Restoration Eligible

↓

Restored

---

### Future Extensions

- Institution-specific restoration rules
- Promotional grace periods
- Segment-specific grace periods

## 5.13 Payment

### Definition

A Payment represents the transfer of value from one financial account,
institution, or funding source to satisfy one or more financial obligations.

A Payment is a Financial Event.

Its financial effect is determined through Posting Rules and Allocation Rules.

---

### Owner

Payment Domain

---

### Responsibilities

The Payment Domain is responsible for:

- Representing transferred value
- Recording payment method
- Recording requested date
- Recording effective date
- Recording credited date
- Recording posted date
- Recording payment source
- Recording payment destination

---

### Does Not Own

The Payment Domain does not own:

- Allocation policy
- Interest calculations
- Grace-period qualification
- Recommendations

---

### Relationships

Financial Event

↓

Payment

↓

Posting Rules

↓

Allocation

↓

Replay

---

### Future Extensions

- Split payments
- Multi-account payments
- External payment providers
- Scheduled payments
- Automatic payments

## 5.14 Payment Posting Rule

### Definition

A Payment Posting Rule determines when a submitted payment becomes
financially effective.

Posting rules vary by:

- Institution
- Payment method
- Time zone
- Statement closing day
- Processing channel

A payment request and a financially effective payment are not always the same.

---

### Owner

Payment Posting Domain

---

### Responsibilities

The Payment Posting Domain is responsible for:

- Determining effective payment date
- Determining credited date
- Applying institution-specific cutoff rules
- Supporting replay timing

---

### Does Not Own

The Posting Domain does not own:

- Allocation
- Interest calculations
- Grace-period qualification

---

### Relationships

Payment

↓

Posting Rules

↓

Replay

↓

Ledger

---

### Examples

- Online payment cutoff
- Phone payment cutoff
- Mail processing cutoff
- Statement-closing exceptions
- Same-day processing

---

### Future Extensions

- Same-day settlement
- Real-time payment networks (FedNow, RTP)
- ACH processing
- Wire transfers
- International payment networks

## 5.15 Payment Allocation

### Definition

Payment Allocation determines how a financially effective payment is
distributed across balances, obligations, fees, principal, interest, or
promotional financing.

Replay consumes allocation.

Replay does not determine allocation.

---

### Owner

Allocation Domain

---

### Responsibilities

The Allocation Domain is responsible for:

- Applying institution rules
- Distributing payment value
- Producing updated balance segments
- Producing updated obligations

---

### Does Not Own

The Allocation Domain does not own:

- Payment history
- Interest strategies
- Ledger history

---

### Relationships

Payment

↓

Allocation

↓

Balance Segments

↓

Replay

↓

Ledger

---

### Examples

- Lowest APR first
- Highest APR first
- Interest before principal
- Fees before interest
- Promotional balances first
- Minimum payment allocation
- Excess payment allocation

---

### Future Extensions

- User-selected allocation
- AI optimization
- Regulatory rule changes

## 5.16 Financing Plan

### Definition

A Financing Plan represents a structured financing agreement attached to one or
more purchases or balances.

Unlike a Balance Segment, a Financing Plan has its own contractual lifecycle.

Examples include:

- Deferred Interest
- Waived Interest
- Equal Payment Plans
- Low Payment Plans
- Promotional APR
- Citi Flex Plans
- Retail Installment Plans

A Financing Plan may span multiple billing cycles while maintaining its own
rules independent of the parent Account.

---

### Owner

Promotional Financing Domain

---

### Responsibilities

A Financing Plan is responsible for:

- Tracking promotional balances
- Tracking financing lifecycle
- Tracking expiration dates
- Tracking required promotional payments
- Determining deferred-interest activation
- Supplying financing rules to Replay

---

### Does Not Own

A Financing Plan does not own:

- Ledger history
- Payment history
- Account balances
- Recommendations

---

### Relationships

Account

↓

Balance Segment

↓

Financing Plan

↓

Replay

↓

Interest

---

### Lifecycle

Created

↓

Active

↓

Completed

or

Expired

↓

Deferred Interest Triggered (when applicable)

---

### Future Extensions

- Multiple concurrent plans
- Promotional transfers
- Merchant financing
- Buy Now Pay Later

## 5.17 Installment Loan

### Definition

An Installment Loan represents a financial product in which borrowed principal
is repaid according to a defined repayment schedule.

Unlike revolving credit, installment lending follows an amortization lifecycle.

Examples include:

- Student loans
- Auto loans
- Mortgages
- Personal loans

---

### Owner

Installment Lending Domain

---

### Responsibilities

An Installment Loan is responsible for:

- Tracking principal
- Tracking accrued interest
- Tracking scheduled payments
- Tracking repayment phase
- Supporting amortization
- Producing payoff calculations

---

### Does Not Own

An Installment Loan does not own:

- Replay
- Recommendations
- Institution configuration

---

### Relationships

Account

↓

Installment Loan

↓

Repayment Phase

↓

Obligations

↓

Replay

---

### Future Extensions

- Extra principal payments
- Loan consolidation
- Refinancing
- Forgiveness programs

## 5.18 Recurring Obligation

### Definition

A Recurring Obligation represents a repeating financial commitment that does
not necessarily represent borrowed money.

Recurring Obligations primarily affect liquidity and cash planning rather than
interest calculations.

Examples include:

- Rent
- Utilities
- Insurance
- Internet
- Mobile phone
- Streaming subscriptions
- HOA dues

---

### Owner

Recurring Obligation Domain

---

### Responsibilities

A Recurring Obligation is responsible for:

- Representing recurring due amounts
- Representing recurring schedules
- Supporting cash-flow planning
- Supporting forecasting
- Supporting reminders and recommendations

---

### Does Not Own

A Recurring Obligation does not own:

- Credit utilization
- Interest strategies
- Payment allocation

---

### Relationships

Recurring Obligation

↓

Obligations

↓

Replay

↓

Recommendations

↓

Simulation

---

### Future Extensions

- Escalating rent
- Variable utilities
- Seasonal expenses
- Annual subscriptions
- Inflation forecasting

## 5.19 Benefit

### Definition

A Benefit represents a financial or non-financial advantage associated with an
Account, Product, or Institution.

Benefits are independent of core accounting.

They exist to improve financial outcomes rather than define financial
obligations.

Examples include:

- Airline miles
- Rewards points
- Cash back
- Statement credits
- Lounge access
- Purchase protection
- Extended warranty
- Travel insurance
- Promotional merchant offers

---

### Owner

Benefits Domain

---

### Responsibilities

The Benefits Domain is responsible for:

- Tracking earned benefits
- Tracking available benefits
- Tracking benefit eligibility
- Supporting financial optimization
- Supporting recommendation generation

---

### Does Not Own

The Benefits Domain does not own:

- Account balances
- Interest calculations
- Payment allocation
- Ledger history

---

### Relationships

Account

↓

Benefits

↓

Recommendation Engine

↓

Decision Support

---

### Future Extensions

- Benefit valuation
- Opportunity cost
- Reward optimization
- Benefit expiration
- Benefit forecasting

## 5.20 Simulation

### Definition

Simulation is the deterministic replay of financial history using one or more
temporary Financial Events.

Simulation never changes historical financial records.

Instead, Simulation evaluates hypothetical outcomes by replaying the Financial
Operating System using temporary inputs.

---

### Owner

Simulation Domain

---

### Responsibilities

The Simulation Domain is responsible for:

- Creating temporary financial events
- Replaying financial history
- Comparing simulated outcomes
- Producing explainable differences

---

### Does Not Own

The Simulation Domain does not own:

- Interest calculations
- Ledger calculations
- Allocation rules
- Institution rules

Simulation reuses existing domain engines.

---

### Relationships

Financial Journal

↓

Temporary Events

↓

Replay

↓

Simulated State

↓

Decision Support

---

### Future Extensions

- Payment sliders
- Multi-event simulations
- Scenario comparison
- AI-assisted planning
- Multi-month forecasting

## 5.21 Recommendation

### Definition

A Recommendation represents an explainable financial action generated from
derived financial state.

Recommendations exist to help users make informed financial decisions.

Every Recommendation must be traceable back to replayed financial evidence.

---

### Owner

Recommendation and Decision Domain

---

### Responsibilities

The Recommendation Domain is responsible for:

- Proposing actions
- Explaining reasoning
- Presenting assumptions
- Prioritizing actions
- Estimating expected outcomes

---

### Does Not Own

The Recommendation Domain does not own:

- Financial calculations
- Replay
- Ledger state
- Institution rules

Recommendations interpret the results produced by other domains.

---

### Relationships

Replay

↓

Domain Engines

↓

Simulation

↓

Recommendation

↓

User Decision

---

### Required Components

Every Recommendation should identify:

- Recommended action
- Supporting evidence
- Expected outcome
- Assumptions
- Confidence
- Financial domains involved

---

### Future Extensions

- AI-assisted financial coaching
- Personalized prioritization
- Behavioral analysis
- Multi-account optimization
- Long-term planning

---

## Chapter Summary

The canonical vocabulary exists to provide one consistent financial language for
the BrianShortApps Financial Operating System.

Financial institutions may differ in terminology, presentation, and product
design.

The platform maps institution-specific behavior into canonical financial
concepts before financial rules are interpreted.

Every concept documented in this chapter has:

- A precise definition
- A single owning domain
- Clearly defined responsibilities
- Explicit boundaries
- Known relationships
- Planned future evolution

Future implementation should extend this vocabulary rather than introduce
parallel terminology.

The goal of the Financial Operating System is not to model one institution.

The goal is to model consumer finance itself.
