# Proposal 007 — Platform Consumption

**Status:** Draft  
**Sprint:** Sprint Two — First Private Application

---

## Purpose

Platform Consumption defines which BrianShortApps OS capabilities the Personal Finance Operating Environment must consume rather than recreate.

The product exists to prove the platform.

It should strengthen platform capabilities only when necessary.

---

## Core Principle

The Personal Finance product consumes the BrianShortApps Operating System.

It does not redefine it.

---

## Operating Environment

Personal Finance should consume:

- Workspace shell
- Workspace Registry
- Workspace Modes
- Navigator
- Workspace Header
- Workspace Status

The product may define financial workspaces.

It should not create a separate shell model.

---

## Visual Operating System

Personal Finance should consume:

- Engineering tokens
- Typography
- Spacing
- Radius
- Surface system
- Color system
- Platform visual language

The product may introduce finance-specific emphasis patterns later.

It should not create a separate design system.

---

## Experience Platform

Financial workspaces should be expressed as Experiences where appropriate.

The product should use the existing Experience model before inventing custom screen structures.

---

## Document Platform

Financial documents should consume the Document Platform.

Examples:

- Statements
- Pay stubs
- Credit reports
- Bills
- Tax documents

Finance may introduce financial document parsers.

It should not create a separate document rendering system.

---

## Knowledge Platform

Financial domain knowledge may eventually be surfaced through the Knowledge Platform.

Examples:

- Financial terminology
- Strategy explanations
- Reconciliation rules
- Credit utilization guidance
- Budgeting concepts

---

## Security Platform

Personal Finance requires Security Platform support before persistent production financial data is stored.

Security requirements include:

- Data classification
- Encryption at rest
- Encryption for uploaded documents
- Protected identifiers
- Secure key management
- Audit logging

Security must be platform-managed.

---

## Registry Pattern

The product should introduce registries for durable definitions.

Potential registries:

- Financial Workspace Registry
- Financial Event Registry
- Financial Object Registry
- Recommendation Type Registry

Registries describe.

They do not compute.

---

## Provider Pattern

The product should introduce providers only where retrieval is required.

Potential providers:

- Financial Timeline Provider
- Financial State Provider
- Financial Document Provider
- Recommendation Provider

Providers retrieve.

They do not own product meaning.

---

## Engine Pattern

The product may introduce engines where recalculation or decision support is required.

Initial engines:

- Financial Engine
- Recommendation Engine
- Trend Engine
- Forecast Engine

Engines interpret state.

They do not render UI.

---

## Product-Specific Ownership

Personal Finance owns:

- Financial Events
- Financial Timeline
- Financial State
- Financial Engine
- Financial Domain Objects
- Financial Workspaces
- Recommendation rules
- Financial calculations

BrianShortApps OS owns:

- Operating Environment
- Workspace orchestration
- Experience model
- Document model
- Rendering patterns
- Navigation patterns
- Visual system
- Security foundation

---

## Implementation Rule

If a capability would reasonably benefit Flight Log, MCO Satellite, or future applications, it should be considered for the platform before being implemented directly inside Personal Finance.

---

## Product Promise

Personal Finance should be the first proof that BrianShortApps OS can support a real product without requiring foundational redesign.
