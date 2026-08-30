# Agent Note: Inspector Console observation uses the unit-lane budget

Status: implemented

English | [中文](2026-08-30-inspector-console-lane-budget.zh.md)

## Problem

The Inspector integration test sends one Client Console value through a Worker and WebSocket queues to two isolated CDP sessions. Vitest's default one-second `waitFor` budget can expire under the repository's concurrent unit lane even when both sessions receive the event on an otherwise unchanged run. The assertion then reports one undefined event without evidence of a product delivery failure.

## Decision

The test waits up to ten seconds for both session-specific Console events, polling every twenty milliseconds. The awaited condition remains the two actual CDP messages and their later remote-object isolation checks; no sleep makes the assertion pass and no production timeout changes.

## Alternatives considered

**Retry the test.** Rejected because rerunning only selects a quieter schedule and leaves the same one-second budget below the work performed by the lane.

**Serialize the Inspector suite or repository tests.** Rejected because ports are allocated atomically and fixtures own their teardown; global serialization would hide ordinary scheduling load rather than isolate a shared resource.

**Change Inspector delivery.** Rejected because the failure is the outer observation budget and focused executions deliver both events with the existing runtime path.

## Consequences

The integration test retains a bounded failure when either CDP session never receives the event while allowing the Worker and WebSocket pipeline the budget already needed under aggregate runner load. Fast runs finish as soon as both messages arrive.
