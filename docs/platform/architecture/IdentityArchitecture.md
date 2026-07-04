# Identity Architecture

## Principle

BrianShortApps uses platform identity and application authorization.

## Platform Identity

The platform owns authentication through one BrianShortApps Cognito User Pool.

The user pool represents platform identity.

## Application Authorization

Applications authorize access through application-specific Cognito groups.

Examples:

- BSA-Root
- MCO-Root
- MCO-Admins
- MCO-Members
- FlightLog-Root
- FlightLog-Admins
- FlightLog-Users
- Debt-Root
- Debt-Users

## Rule

Authentication answers who the user is.

Authorization answers what the user can do inside a specific application.
