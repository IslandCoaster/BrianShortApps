# Dependency Rules

## Primary Rule

Dependencies flow inward toward shared foundations.

## Allowed Direction

Applications may depend on:

- platform services
- shared packages

Platform services may depend on:

- shared packages

Shared packages must not depend on:

- applications
- platform services

## Prohibited Direction

Platform services must not import application code.

Shared packages must not import application code.

Application-specific business logic must not be placed in platform services.
