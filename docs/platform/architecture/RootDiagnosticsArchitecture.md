# Root Diagnostics Architecture

## Purpose

Root Diagnostics provides engineering visibility into platform and application resources.

## Principle

Diagnostics are platform-first.

Future resources must report into an existing diagnostics model instead of creating isolated application diagnostics.

## Scope

Root Diagnostics monitors:

- API Gateway
- Lambda
- DynamoDB
- Cognito
- IAM
- CloudWatch
- EventBridge
- S3
- Secrets
- Deployments
- Registry integrity

## Access

Root Diagnostics is restricted to root-level platform access.

Initial root group:

- BSA-Root

## Goal

Every future AWS resource should have a diagnostics destination before implementation.
