# Agent Note: Background durability tests observe results

Status: implemented

English | [中文](2026-08-28-background-durability-tests-observe-results.zh.md)

## Problem

Session projection-cache tests used a fixed 40 ms sleep before reading records written by fire-and-forget event listeners. The wait measured an assumed filesystem latency rather than the durable result. Under concurrent test load, correct writes could finish after the sleep and fail the suite.

## Decision

Durability assertions poll the stored checkpoint or the warning emitted by an intentionally failed write. Each poll has a five-second outer bound and a five-millisecond interval. Tests that expect no threshold-triggered write first observe the completed creation checkpoint, then assert that later below-threshold events leave it unchanged.

Production write scheduling remains unchanged. The tests continue to exercise real storage and atomic writes; they do not replace durability with a mocked implementation.

## Alternatives considered

**Increase the fixed sleep.** Rejected because any guessed delay can fail under a slower loaded runner and unnecessarily delays fast runs.

**Await an internal write promise from production.** Rejected because event-triggered cache writes are intentionally fail-soft and detached from the Session append path; exposing a test-only promise would change the runtime contract.

**Mock the storage layer.** Rejected because the behavior under test is completion of the real durable write and its fail-soft error path.

## Consequences

The suite waits only as long as the observable result needs and reports the unmet durable assertion at a bounded deadline. A missing write still fails, while aggregate runner load no longer turns a correct asynchronous write into a timing failure.
