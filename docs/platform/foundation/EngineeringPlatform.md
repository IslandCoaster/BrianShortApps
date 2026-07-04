# BrianShortApps Engineering Platform

## Purpose

The BrianShortApps Engineering Platform is the complete engineering ecosystem used to design, build, deploy, operate, monitor, and evolve software products.

It is larger than any individual application and larger than the Git repository itself.

The platform exists to provide a consistent engineering foundation that allows applications to share infrastructure, tooling, standards, identity, diagnostics, and operational intelligence while remaining independently deployable.

---

# Engineering Philosophy

The platform is built from the foundation upward.

Each layer exists to support every layer above it.

Higher layers should never duplicate responsibilities already provided by lower layers.

The engineering goal is to strengthen the platform before expanding product functionality.

---

# Engineering Pyramid

The BrianShortApps Engineering Platform consists of six architectural layers.

```
                     Products
──────────────────────────────────────────
MCO Satellite
Flight Log
Debt Planner
Future Applications

──────────────────────────────────────────
Engineering Applications

Platform Console
Mission Control
Developer Portal

──────────────────────────────────────────
Platform Runtime

Identity
Registry
Diagnostics
Infrastructure
Shared Services

──────────────────────────────────────────
Shared Packages

Design System
UI
Authentication
AWS
Registry
Diagnostics

──────────────────────────────────────────
Engineering Workspace

VS Code
npm Workspaces
TypeScript
ESLint
Prettier
Vite
Build Configuration

──────────────────────────────────────────
Architecture

Vision
Platform Model
Principles
Standards
Documentation
```

---

# Layer Responsibilities

## Architecture

Defines why the platform exists.

Examples:

- Platform Vision
- Platform Model
- Engineering Philosophy
- Platform Principles
- Standards

Architecture changes infrequently.

It guides every engineering decision.

---

## Engineering Workspace

Provides the shared engineering environment.

Examples:

- Workspace configuration
- TypeScript
- ESLint
- Prettier
- Build tooling
- VS Code
- Repository conventions

Applications inherit the workspace.

Applications do not redefine it.

---

## Shared Packages

Provide reusable implementation components.

Examples:

- Design System
- Authentication
- AWS utilities
- Registry client
- Diagnostics client

Packages contain reusable code only.

Packages never contain business logic.

---

## Platform Runtime

Provides shared platform capabilities.

Examples:

- Identity
- Registry
- Diagnostics
- Shared Services
- Infrastructure

Platform services support every application.

Platform services never depend on application business logic.

---

## Engineering Applications

Engineering applications operate the platform.

Examples:

- Platform Console
- Mission Control
- Developer Portal

These applications consume platform services.

They are not platform services.

---

## Product Applications

Product applications provide business capabilities.

Initial applications:

- MCO Satellite
- Flight Log
- Debt Planner

Applications own:

- Business workflows
- Product experiences
- Product authorization
- Product data

Applications consume platform capabilities instead of recreating them.

---

# Dependency Rules

Dependencies flow upward only.

Architecture

↓

Engineering Workspace

↓

Shared Packages

↓

Platform Runtime

↓

Engineering Applications

↓

Product Applications

Lower layers never depend upon higher layers.

---

# Engineering Lifecycle

Every capability follows the same lifecycle.

1. Architecture
2. Registry
3. Workspace
4. Platform
5. Application
6. Diagnostics
7. Verification
8. Documentation

This lifecycle ensures every implementation has ownership, visibility, diagnostics, and architectural alignment before entering production.

---

# Platform First

When a new capability is proposed, the first engineering question is not:

"What feature should we build?"

Instead, ask:

"What is the lowest architectural layer that should own this capability?"

If a lower layer can provide the capability for multiple future applications, that layer should be strengthened before application development continues.

---

# Long-Term Vision

The BrianShortApps Engineering Platform is intended to become a durable software engineering ecosystem capable of supporting multiple independent products without duplicating engineering effort.

Every new application should inherit a mature engineering foundation rather than building its own.

As the platform evolves, investments should strengthen the foundation first, allowing every future product to benefit from improvements made at lower architectural layers.
