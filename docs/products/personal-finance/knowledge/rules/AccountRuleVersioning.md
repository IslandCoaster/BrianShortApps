# Account Rule Versioning

## Owner

Account Configuration Engine

---

## Purpose

Account rules may change over time.

The system must preserve historical rule changes instead of silently overwriting them.

---

## Core Principle

Rules are versioned.

Accounts select the active rule version.

---

## Account-Owned Rules

Rules belong to the account, not the issuer.

This supports:

- Multiple accounts from the same issuer
- Different APRs
- Different credit limits
- Product-specific agreements
- Promotional terms
- Changed user agreements
- Grandfathered terms

---

## Rule Change Events

Rule changes enter the Financial Journal.

Examples:

- Account profile created
- Rule set updated
- APR changed
- Credit limit changed
- Statement cycle changed
- Payment posting rule changed
- Grace period rule changed
- Interest calculation rule changed
- Late fee rule changed

---

## Historical Recalculation

Historical calculations should use the rule version active at the time of the financial event.

Current projections should use the currently active rule set.

---

## Product Promise

The system should never hide rule changes.

If a financial result depends on a rule, the active rule must be explainable.
