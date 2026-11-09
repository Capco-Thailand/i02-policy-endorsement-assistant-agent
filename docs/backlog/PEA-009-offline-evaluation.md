# PEA-009 candidate: Evaluate the complete synthetic workflow

**Status:** Backlog candidate

## Intended outcome

A reproducible offline suite measures intent classification, rule compliance, authorization, missing-field detection, quote integrity, and draft completeness against labeled synthetic cases. Results report fixture version, sample count, pass count, percentage, and failures for each PRD measure.

## Source and dependency

- [PRD sections 3, 7, and 9](../PRD.md) and [TESTING_STANDARD.md](../TESTING_STANDARD.md): success measures, seeded fixtures, safety and adversarial cases.
- Depends on the implemented flow in PEA-003 through PEA-008.

## Refine before promotion

- Freeze representative positive and negative fixtures, including prompt injection, rule conflict, ambiguous dates, repeated submission, quote failures, and attempts to bind coverage.
- Measure the demo latency target separately; do not claim a target passed from a percentage without its sample size and failed cases.
