# ADR-0001: Platform-First Architecture

## Status

Accepted

## Context

BrianShortApps began with individual application ideas, including MCO Satellite, Flight Log, and Debt Planner.

As shared concerns emerged, including identity, diagnostics, registries, infrastructure, deployment, shared services, and engineering documentation, it became clear that these concerns belonged above any individual application.

## Decision

BrianShortApps will be treated as the platform.

Applications are products that run on the platform.

The platform owns shared engineering concerns. Applications own product-specific business capabilities, user experiences, application data, and application authorization.

## Consequences

This prevents MCO Satellite, Flight Log, Debt Planner, or any future product from becoming the accidental owner of platform-wide responsibilities.

New capabilities must be evaluated at the lowest appropriate architectural layer before being implemented in an application.
