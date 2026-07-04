# Registry Architecture

## Principle

Nothing is created until it has a place in the registry.

## Registry Scope

The platform registry tracks:

- Applications
- Capabilities
- APIs
- Lambda functions
- DynamoDB tables
- Cognito groups
- S3 buckets
- IAM roles
- Secrets
- EventBridge rules
- Diagnostics destinations

## Required Registry Metadata

Every registered object must include:

- Purpose
- Owner
- Scope
- Environment
- Resource type
- Resource name
- Diagnostics destination
- Lifecycle status

## Goal

The registry is the platform source of truth.
