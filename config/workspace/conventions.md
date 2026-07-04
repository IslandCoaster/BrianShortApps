# Workspace Conventions

## Purpose

The BrianShortApps workspace defines shared engineering behavior for all platform services, packages, and applications.

## Rules

- Applications live under applications/.
- Platform runtime services live under platform/.
- Shared implementation packages live under packages/.
- Shared configuration lives under config/.
- Platform documentation lives under docs/platform/.

## Tooling

Applications and packages should extend shared configuration instead of defining isolated toolchains.

## Principle

The workspace should prevent repeated setup decisions across applications.
