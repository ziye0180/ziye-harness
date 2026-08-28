# Agent Note: Loaded macOS tests observe effects

Status: implemented

English | [中文](2026-08-28-loaded-macos-tests-observe-effects.zh.md)

## Problem

The macOS unit lane runs more than seventeen thousand tests concurrently. A transactional user-patch test depended on one native filesystem notification, while an Inspector integration test used Vitest's default one-second wait for a Console event that crosses Worker and WebSocket queues. Under aggregate runner load, either test could miss its observation budget even though isolated repetitions completed the same behavior.

## Decision

The transactional user-patch test captures the refresh callback passed to `Hmr.registerConfig()` and drives each file state through that callback. This package test owns patch composition, rollback, recovery, removal, and disposal; `hmr-config.spec.ts` owns native exact-path delivery, refresh serialization, disposal waits, and failure broadcasts.

The Inspector test waits up to ten seconds for both isolated CDP sessions to observe the same Console marker. The assertion still requires both events and retains the per-session remote-object checks after delivery.

## Alternatives considered

**Rerun the macOS lane until it passes.** A retry can move the failure to another asynchronous test and leaves the branch without deterministic evidence.

**Enable Chokidar polling in the transactional test.** Polling still missed the file addition during a complete local suite because the test continued to depend on a separate subsystem's notification timing.

**Change production watcher or Inspector delivery.** Focused repetitions exercised the production paths successfully; changing runtime behavior would widen the fix without evidence of a product defect.

## Consequences

The two tests retain their behavior assertions without coupling success to native notification availability or Vitest's default wait budget under aggregate load. A rejected patch refresh remains directly observable, and a missing Console event still fails within ten seconds.

## Verification

The two affected test files pass together in five consecutive focused runs on macOS. A complete macOS `pnpm run test` passes 1,032 files and 17,072 tests; the repository macOS unit lane remains the hosted aggregate-load owner.
