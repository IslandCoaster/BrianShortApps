# Platform Console Architecture

## Purpose

The Platform Console is the administration interface for the BrianShortApps Platform.

## Location

The Platform Console lives under:

applications/platform-console

## Role

The Platform Console manages platform-level concerns, including:

- Applications
- Identity
- Registries
- Infrastructure
- Security
- Platform settings

## Boundary

The Platform Console is an application that consumes platform services.

It is not itself a platform service.

## Initial Capability

The first Platform Console capability should render platform architecture documents directly from the repository so documentation and product behavior do not drift.
