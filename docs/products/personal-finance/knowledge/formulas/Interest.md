# Interest

## Owner

Future Interest Engine

---

## Purpose

Define how interest-related concepts are understood before implementation.

---

## Apple Card Daily Balance Method

Apple Card uses the daily balance method, including new transactions.

The statement describes the daily balance process as:

- Begin with the balance at the end of the prior day.
- Add prior day's interest.
- Add new transactions unless the account qualifies for a grace period.
- Subtract payments and credits posted that day.
- Treat negative daily balances as zero.

---

## Required Variables

To calculate interest correctly, the system must know:

- APR
- APR type
- Interest calculation method
- Statement cycle start date
- Statement cycle end date
- Daily balances
- Daily transactions
- Daily payments
- Grace period status
- Balance subject to interest
- Interest charged

---

## Known Apple Card June 2026 Values

- APR: 25.49% variable
- Balance subject to interest: $6,247.51
- Interest charged: $130.89
- Statement period: Jun 1 - Jun 30, 2026

---

## Implementation Rule

Do not calculate interest from APR alone.

Interest calculation requires the account rule set, transaction timing, payment timing, and grace period status.

---

## Validation Source

Apple Card Statement  
June 2026
