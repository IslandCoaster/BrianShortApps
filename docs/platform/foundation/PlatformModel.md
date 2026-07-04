# BrianShortApps Platform Model

## Core Model

BrianShortApps is a platform that hosts multiple applications.

Applications are independently owned products that consume platform capabilities.

## Platform Owns

- Identity
- Registries
- Platform Console
- Diagnostics
- Infrastructure
- Security
- Deployment
- Shared Services

## Applications Own

- Business capabilities
- User experiences
- Application data
- Application authorization
- Product-specific workflows

## Initial Application Portfolio

- MCO Satellite
- Flight Log
- Debt Planner

## Architectural Boundary

Platform concerns must not be embedded directly inside application implementations.

Application concerns must not be embedded directly inside platform services.

## Platform Identity vs Application Authorization

The platform owns identity.

Applications own authorization.

Identity answers:

Who is this user?

Authorization answers:

What is this user allowed to do in this application?

## Mission Control

Mission Control is the engineering digital twin of the BrianShortApps Platform.

It represents:

- Registered applications
- Registered resources
- Infrastructure health
- Ownership
- Diagnostics
- Deployment state
- Security posture
- Engineering lifecycle

## First Platform Objective

Build the BrianShortApps Platform Console with Root Diagnostics first, so every future AWS resource reports into an already-functioning engineering system.
