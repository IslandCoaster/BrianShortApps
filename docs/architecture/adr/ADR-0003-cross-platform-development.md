# ADR-0003: Cross-Platform Development

## Status

Accepted

## Context

BrianShortApps development happens on both Windows and macOS.

Earlier work exposed differences between PowerShell and zsh commands, including directory listing, file creation, and cleanup operations.

## Decision

Windows and macOS are first-class BrianShortApps development environments.

Engineering documentation should provide platform-neutral commands when practical. When platform-specific commands are required, Windows PowerShell and macOS zsh equivalents should both be supported.

## Consequences

The platform must avoid assumptions that only work on one operating system.

Tooling choices should prioritize cross-platform compatibility.

This improves laptop/desktop workflow parity and reduces environment-specific friction.
