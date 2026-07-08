# Financial Knowledge Base

## Purpose

The Financial Knowledge Base is the source of truth for financial concepts,
formulas, business rules, and institution-specific behavior.

The goal is to separate financial knowledge from software implementation.

Knowledge is documented first.

Engines implement documented knowledge.

Scenarios validate implemented knowledge.

---

## Engineering Philosophy

Knowledge

↓

Engine

↓

Scenario

↓

Validation

↓

Production

---

## Repository Structure

formulas/

Mathematical calculations owned by engines.

rules/

Business rules that govern financial behavior.

concepts/

Definitions used throughout the platform.

institutions/

Institution-specific research and extracted knowledge.

validation/

Validation scenarios proving formula correctness.

---

## BrianShortApps Principle

Never implement financial logic that has not first been documented.
