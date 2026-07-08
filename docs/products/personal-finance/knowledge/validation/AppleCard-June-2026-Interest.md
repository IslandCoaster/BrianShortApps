# Apple Card June 2026 Interest Validation

## Purpose

Validate independent daily interest calculation against a real Apple Card statement.

---

## Source

Apple Card Statement  
June 2026

---

## Inputs

APR

25.49%

Balance Subject to Interest

$6,247.51

Statement Period

2026-06-01 through 2026-06-30

Cycle Days

30

---

## Expected Statement Output

Interest Charged

$130.89

---

## Engine Output

Calculated Interest

$130.89

Variance

$0.00

---

## Validation Result

Pass

---

## Notes

This validation confirms that the Interest Engine can independently calculate statement interest when provided with:

- APR
- Balance Subject to Interest
- Statement Period Days

This does not yet validate the full daily balance method from raw transactions.
