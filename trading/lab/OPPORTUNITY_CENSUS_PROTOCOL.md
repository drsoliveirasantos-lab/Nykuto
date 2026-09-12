# Opportunity Census protocol

Purpose: count every distinct qualified market opportunity without imposing a daily trade cap and without suppressing a setup merely because another plan is already active.

This research stream is separate from the sequential execution replay.

## Census rules

- No maximum number of opportunities per day.
- `planActive` does not block counting.
- Overlapping opportunities may coexist in the census.
- De-duplication exists only to avoid counting repeated emissions of the same setup family/direction within a short window.
- The execution replay remains responsible for capital, position overlap, risk, Lucid session constraints, stop geometry and actual executability.

## Required reporting

Every historical run should report both:

1. `Opportunity Census`: all distinct qualified setups found.
2. `Sequential Replay`: the subset actually admitted by the execution state machine.

Also report execution coverage and the number of census-only opportunities so hidden setups are visible instead of silently discarded.

This protocol is research-only and does not enable broker execution.
