# Agent Note: Background durability tests observe results

Status: implemented

English | [中文](2026-08-28-background-durability-tests-observe-results.zh.md)

## Problem

Session projection cache writes launched from `session/created`, `session/event`, and `session/disposed` listeners complete in the background over real filesystem I/O. The package tests waited a fixed 40 milliseconds before reading the record or warning sink. Under concurrent repository tests, that delay could end before the write completed, so the tests observed an absent creation row, an earlier checkpoint, or only the first warning even though the queued operations later reached the required state.

## Decision

Positive durability assertions wait for their exact observable record value or warning with bounded `vi.waitFor` polling. Tests that require an intermediate no-write interval first observe the completed creation record, clear a `write` spy, and then assert synchronously that the pre-trigger events invoke no additional write before reading the stable creation cut. The timeout bounds a real failure while the polling interval avoids a wall-clock completion assumption. Product code, event timing, and the fail-soft write policy remain unchanged.

## Alternatives considered

**Increase the fixed delay.** A larger sleep only moves the load threshold and adds unconditional latency to every run.

**Expose a production drain method for tests.** The public cache service has no consumer that needs such a method, and a test-only lifecycle operation would widen the runtime API.

**Replace the storage backend with a mock.** A mock would remove the real atomic-write and warning timing that these tests exist to verify.

## Verification

Eight concurrent runs of the package test pass after the change. Removing the creation checkpoint registration makes the creation test time out, proving the result wait still rejects that regression. The `write` spy independently rejects an extra checkpoint before `turn/end` or before the configured count threshold.

## Consequences

The tests remain sensitive to missing, stale, failed, or premature writes without depending on host load. A broken asynchronous completion path can take the bounded timeout to fail, while an extra write fails synchronously at the event that triggered it.
