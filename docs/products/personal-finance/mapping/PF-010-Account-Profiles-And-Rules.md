# PF-010 — Account Profiles & Account Rules

**Status:** Draft  
**Product:** Personal Finance Operating Environment

---

## Purpose

Account Profiles and Account Rules define the configurable settings and financial behavior of each account.

Rules belong to the account, not the issuer.

---

## Core Principle

Account rules may change over time and should be versioned through events instead of silently overwritten.

---

## Source Discovery

The Apple Card June 2026 statement shows account-specific values and rules, including variable APR, balance subject to interest, interest charged, payment due date, daily balance method, grace period language, and payment crediting cutoff. :contentReference[oaicite:0]{index=0}

---

## Account Profile

Represents current account configuration.

Examples:

- Account name
- Account type
- Issuer
- Credit limit
- APR
- Variable APR status
- Statement cycle
- Due date rule
- Payment posting rule
- Grace period rule
- Interest calculation method
- Late fee rule

---

## Account Rule Set

Represents the rules currently active for a specific account.

Rule sets are account-owned.

Two accounts from the same issuer may have different rule sets.

---

## Rule Change Events

Profile and rule changes should enter the Financial Journal as events.

Examples:

- Account profile created
- APR changed
- Credit limit changed
- Statement cycle changed
- Payment terms changed
- Grace period rule changed
- Interest calculation rule changed
- Late fee rule changed

---

## Rule Ownership

### Account Profile Owns

- Current account configuration
- Current active rule set
- Account-specific terms

### Financial Journal Owns

- Rule change history
- Effective dates
- Historical audit trail

### Engines Own

- Interpretation of rules
- Calculations based on active rules
- Recommendations based on account behavior

---

## Product Promise

The system should never assume hidden account rules.

If a calculation depends on a rule, that rule must be explicitly modeled or clarified.
