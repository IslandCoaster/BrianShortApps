# VS-001 — Paycheck Event

**Status:** Draft  
**Product:** Personal Finance Operating Environment  
**Sprint:** Sprint Two — First Private Application

---

## Purpose

Validate the Personal Finance Operating Environment by allowing a paycheck to enter the Financial Timeline as a Financial Event and trigger a recalculation of Financial State.

This is the first vertical slice.

It should prove the event-driven financial model before UI, persistence, document intake, or automation are expanded.

---

## Core Principle

A paycheck is not just income.

A paycheck is a financial event that should update the entire financial model.

---

## User Story

Given a paycheck I just received,

I want the system to understand what changed,

so that it can update my financial snapshot and recommend what I should do next.

---

## Initial Inputs

The first version may be manual.

Required:

- Pay date
- Net pay
- Gross pay
- Pay period start
- Pay period end

Optional:

- Federal tax
- State tax
- Retirement contribution
- Employer match
- Health insurance deduction
- Other deductions
- Notes

---

## Financial Event

The paycheck creates a Financial Event.

Event type:

Paycheck Received

Event category:

Income

The event is appended to the Financial Timeline.

The event should be treated as historical truth once recorded.

Corrections should create new events rather than silently rewriting history.

---

## Timeline Impact

When the paycheck event is recorded, the Financial Timeline gains a new income event.

The timeline should preserve:

- When the paycheck was received
- What amount was received
- What period it belongs to
- What deductions occurred
- Whether retirement contributions occurred
- Whether the paycheck differed from expected income

---

## Financial Engine Impact

After the event enters the timeline, the Financial Engine recalculates Financial State.

The recalculation should eventually update:

- Liquidity
- Income
- Financial Position
- Budget
- Obligations
- Debt Strategy
- Forecast
- Net Worth
- Financial Health
- Recommendations

---

## Financial Snapshot Impact

The Financial Snapshot should reflect:

- Increased available cash
- Updated income received
- Updated paycheck history
- Updated income trend
- Updated available allocation
- Updated budget position
- Updated forecast

---

## Recommendation Examples

After a paycheck is recorded, the system may recommend:

- Pay upcoming bills before due date
- Allocate available surplus toward debt
- Preserve cash buffer until next paycheck
- Increase emergency fund allocation
- Reduce utilization before statement closing
- Review paycheck variance if income differed from expectation

---

## Validation Criteria

VS-001 is successful when:

- A paycheck can be represented as a Financial Event.
- The event can be added to the Financial Timeline.
- The Financial Engine can consume the timeline.
- A recalculated Financial State can be produced.
- A Financial Snapshot can render the updated state.
- At least one recommendation can be generated from the updated state.

---

## Out of Scope

Not included in VS-001:

- Pay stub upload
- OCR
- Bank integration
- Persistent backend storage
- Authentication
- Encryption implementation
- Full recommendation scoring
- Full budget automation

These will come later.

---

## Product Promise

The user should not manually recalculate their financial life after receiving a paycheck.

The operating environment should recalculate automatically and explain what changed.
