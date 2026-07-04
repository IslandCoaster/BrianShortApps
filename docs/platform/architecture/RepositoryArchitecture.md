# Repository Architecture

## Principle

The repository should reflect the platform architecture.

## Top-Level Structure

- applications: deployable products and engineering applications
- platform: reusable platform runtime capabilities
- packages: shared libraries
- docs: platform knowledge and engineering standards
- tools: development and automation utilities

## Application Boundary

Applications consume platform services.

Applications must not own platform-wide concerns.

## Platform Boundary

Platform services provide reusable capabilities.

Platform services must not depend on product-specific application logic.
