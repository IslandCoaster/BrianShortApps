# Spreadsheet Logic Mapping

**Product:** Personal Finance Operating Environment  
**Purpose:** Map existing spreadsheet logic into engine-owned financial knowledge.

---

## Mapping Rule

Every formula or worksheet concept must map to one owner:

- Financial Journal
- Account State Engine
- Obligation State Engine
- Credit Position Engine
- Cash Position Engine
- Debt Position Engine
- Budget Position Engine
- Forecast Engine
- Recommendation Engine
- Reports Workspace

---

## Current Workbook Domains

| Spreadsheet Area | What It Answers | Engine Owner |
|---|---|---|
| Yearly Budget | What should be allocated by month? | Budget Position Engine |
| Yearly Report | What happened over the year? | Reports Workspace / Financial State History |
| Yearly Financials | How did financial position change annually? | Wealth Position Engine / Reports |
| Bill Tracker | What obligations exist and what is their status? | Obligation State Engine |
| Transactions | What actually happened? | Financial Journal |
| Creditors | Who do I owe and under what terms? | Account State Engine |
| Payment Schedule | What should be paid, when, and why? | Obligation State Engine / Recommendation Engine |
| Summary Calculation | What is true right now? | Financial State |
| Credit Utilization | How healthy is revolving credit? | Credit Position Engine |

---

## Credit Card Logic

| Logic | Inputs | Output | Engine Owner |
|---|---|---|---|
| Credit limit | Account profile | Total available revolving credit | Account State Engine |
| Statement balance | Statement event | Historical statement balance | Obligation State Engine |
| Current balance | Statement + payments + transactions | Live balance | Account State Engine |
| Projected statement balance | Current balance before close | Forecasted reported balance | Credit Position Engine |
| Utilization | Balance / credit limit | Utilization percent | Credit Position Engine |
| Minimum payment | Statement terms | Minimum obligation | Obligation State Engine |
| Due date | Statement terms | Payment deadline | Obligation State Engine |
| Statement close date | Statement cycle | Reporting timing | Credit Position Engine |
| Interest charged | Statement terms / APR | Cost of carrying balance | Debt Position Engine |
| Late fee | Due date + unpaid status | Penalty risk | Obligation State Engine |

---

## Payment Logic

| Logic | Inputs | Output | Engine Owner |
|---|---|---|---|
| Payment scheduled | Amount + date + account | Planned payment event | Financial Journal |
| Payment completed | Payment event | Reduced cash and obligation | Obligation State Engine |
| Payment applied | Payment + obligation | Remaining obligation | Obligation State Engine |
| Extra payment | Available cash + strategy | Debt reduction action | Recommendation Engine |
| Snowball payment | Lowest balance priority | Strategy recommendation | Debt Position Engine |
| Avalanche payment | Highest APR priority | Strategy recommendation | Debt Position Engine |

---

## Budget Logic

| Logic | Inputs | Output | Engine Owner |
|---|---|---|---|
| Monthly budget | Income + allocations | Planned spending | Budget Position Engine |
| Category spending | Transactions | Actual category spend | Budget Position Engine |
| Remaining budget | Budget - actual | Available category budget | Budget Position Engine |
| Yearly budget progress | Monthly states | Annual progress | Reports Workspace |

---

## Income Logic

| Logic | Inputs | Output | Engine Owner |
|---|---|---|---|
| Paycheck received | Paycheck event | Cash increase | Financial Journal / Cash Position Engine |
| Paycheck variance | Expected vs actual net pay | Income variance | Cash Position Engine |
| Retirement contribution | Paycheck deduction | Retirement position input | Retirement Position Engine |
| Employer match | Paycheck / benefit terms | Retirement growth input | Retirement Position Engine |

---

## Next Implementation Candidates

1. CP-002 — Projected Utilization
2. OB-002 — Due Date and Overdue Logic
3. DEBT-001 — Interest and APR Foundation
4. BUD-001 — Monthly Budget Position
5. CASH-001 — Paycheck Variance
