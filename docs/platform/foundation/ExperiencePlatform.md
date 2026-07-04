# BrianShortApps Experience Platform

## Status

Draft v1.0

## Purpose

The BrianShortApps Experience Platform defines how information becomes usable experiences across multiple renderers.

BrianShortApps should not design for a single screen, framework, or output format.

BrianShortApps designs experiences that can be rendered consistently across:

- Web applications
- Mobile applications
- PDF documents
- Emails
- Reports
- Documentation
- Presentations
- Future renderers

## Core Principle

Information is authored once and rendered many times.

## Platform Model

BrianShortApps applications are not built from pages first.

They are built from experiences.

An experience defines what the user is trying to accomplish.

A renderer defines how that experience is expressed.

## Experience Stack

Architecture

↓

Engineering Platform

↓

Visual Operating System

↓

Engineering Tokens

↓

Experience Models

↓

Renderers

↓

Applications

## Experience Model

An Experience Model describes meaning, structure, and intent without binding itself to a specific renderer.

It may define:

- Identity
- User goal
- Current work
- Primary information
- Supporting context
- Navigation
- Actions
- Status
- Output requirements

It does not define:

- React components
- CSS classes
- PDF drawing instructions
- Email markup
- Mobile view code

## Renderer Model

A renderer expresses an Experience Model through a delivery format.

Examples:

- React renderer
- PDF renderer
- Email renderer
- Mobile renderer
- Markdown renderer
- Presentation renderer

Renderers may differ in layout, density, and interaction, but they must preserve the same information hierarchy and visual operating principles.

## Relationship to Knowledge

The Knowledge SDK provides authored information.

The Experience Platform organizes that information into user-facing experiences.

The Visual Operating System defines how that experience should feel.

Renderers express the experience in a specific medium.

## Relationship to Engineering Tokens

Engineering Tokens are renderer-independent design decisions.

Tokens define shared meaning for:

- color
- typography
- spacing
- radius
- elevation
- motion
- density
- hierarchy

Renderers map those tokens to their own output format.

## Example: Engineering Platform Document

The Engineering Platform experience may be rendered as:

- a Platform Console screen
- a Developer Portal article
- a PDF reference document
- a presentation section
- an onboarding email summary

The underlying information remains consistent.

The renderer changes.

## Example: Member Directory

A Member Directory experience may include:

- search
- filters
- metrics
- member records
- actions
- export requirements

The React renderer may show searchable cards.

The PDF renderer may show a formatted table.

The email renderer may summarize recent changes.

The experience remains the same.

## Design Rule

Screens are not the source of truth.

PDFs are not the source of truth.

Emails are not the source of truth.

The Experience Model is the source of truth.

## Implementation Rule

Applications should not duplicate experience logic across renderers.

When the same user goal must appear in multiple formats, the shared Experience Model should be defined before renderer-specific implementation begins.

## Long-Term Goal

Every major BrianShortApps capability should eventually be expressible as:

1. Knowledge
2. Experience Model
3. Renderer Output

This allows BrianShortApps to deliver consistent, trustworthy experiences across every application and medium without redesigning the same information repeatedly.

## Final Statement

BrianShortApps does not build isolated screens.

BrianShortApps builds durable experiences that can move across renderers while preserving meaning, hierarchy, identity, and trust.
