# BrianShortApps Platform Principles

## 1. The Platform Comes First

BrianShortApps is not built around one application.

Applications run on the platform.

## 2. Registry Before Resource

Nothing is created until it has a place in the registry.

Every API, Lambda, DynamoDB table, Cognito group, S3 bucket, capability, and shared service must have:

- Purpose
- Owner
- Registry entry
- Diagnostics destination

## 3. Repository Mirrors Architecture

The repository should explain the system.

Folders should reflect architectural boundaries.

## 4. Platform Identity, Application Authorization

The platform authenticates users.

Applications decide what authenticated users are allowed to do inside that product.

## 5. Diagnostics Are Platform-First

Diagnostics are not application afterthoughts.

Root Diagnostics is built into the platform first so future resources report into an existing engineering system.

## 6. Shared Does Not Mean Blurred

Reusable capabilities belong in packages or platform services.

Application-specific capabilities stay inside applications.

## 7. Naming Is Architecture

Resource names must communicate scope, ownership, and purpose.

Platform resources use bsa-*.

Application resources use application-specific prefixes such as:

- mco-*
- flightlog-*
- debt-*

## 8. Every Implementation Reinforces the Platform

Implementation decisions should reduce future ambiguity, not create hidden debt.
