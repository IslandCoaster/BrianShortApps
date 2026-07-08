# Grace Periods

## Owner

Account Profile

---

## Apple Card

A grace period is maintained by paying the previous monthly balance in full by the payment due date.

---

## Notes

Grace Period rules are account-specific.

Future institutions may define different qualification rules.

Rules belong to the Account Profile, not the Financial Engine.

## Due Date Qualification

A payment made on the payment due date may still qualify if it is credited by the account's payment posting cutoff.

For Apple Card, electronic payments made by 11:59 PM Eastern time are credited on the payment date.

Therefore, Apple Card grace period logic should evaluate payment qualification as:

Payment credited on or before the payment due date cutoff.

Not:

Payment made before the payment due date.
