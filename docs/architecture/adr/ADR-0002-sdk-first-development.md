# ADR-0002: SDK-First Development

## Status

Accepted

## Context

Applications should not directly recreate shared concerns such as authentication, registry access, diagnostics, UI primitives, knowledge management, or AWS integrations.

Without a shared SDK, each application would gradually develop its own patterns and duplicate platform logic.

## Decision

BrianShortApps will provide shared SDK packages under the @bsa scope.

Initial SDK packages include:

- @bsa/auth
- @bsa/aws
- @bsa/design-system
- @bsa/diagnostics
- @bsa/knowledge
- @bsa/registry
- @bsa/ui

Applications consume SDK packages instead of directly owning shared platform concerns.

## Consequences

The SDK becomes the stable contract between applications and platform capabilities.

This creates more upfront structure, but reduces duplication and makes every future application easier to build.
