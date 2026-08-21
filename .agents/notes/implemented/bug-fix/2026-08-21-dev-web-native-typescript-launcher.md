# Agent Note: Native TypeScript launcher for the Web watcher

Status: implemented

English | [中文](2026-08-21-dev-web-native-typescript-launcher.zh.md)

## Problem

`pnpm run dev:web` launched `scripts/dev-web.ts` through the `tsx` executable. On supported Node 22 and Node 24 installations, the nested ESM loader used by that executable could return no load result before the script reached its watcher banner. The HMR browser test then failed at process startup even though running the same script directly under Node started every watcher stage.

## Decision

The `dev:web` script invokes `node scripts/dev-web.ts --poll`. The repository engine range provides native erasable-TypeScript execution, and `scripts/dev-web.ts` remains within that syntax subset. Its usage diagnostics name the same direct-Node command.

The existing HMR browser scenario remains the executable contract: it starts `pnpm run dev:web`, waits for the watcher, edits a real Client plugin source, and observes the updated DOM without a page refresh.

## Verification

The focused HMR browser test reaches the watcher banner, rebuilds the edited Client bundle, and passes under the supported local Node runtime. A complete official-profile Web replay also passes with the direct-Node launcher.

## Alternatives considered

**Keep the `tsx` executable and retry process startup.** Repeating the same loader chain would preserve a deterministic startup failure and could hide a real watcher outage behind retries.

**Copy the watcher to JavaScript.** A second source file would duplicate the build-stage orchestration and allow the development command to drift from its typed implementation.

**Pin or patch the transitive loader.** The watcher does not need a custom loader on the supported Node range, so owning a loader-specific dependency or patch would add maintenance without product behavior.

## Consequences

The development watcher depends on Node's native erasable-TypeScript support, which is already guaranteed by the repository engine range. Unsupported Node versions fail at process startup instead of entering a partial watcher state. The production `dsh` source launcher continues to use its existing `tsx` ESM hook; this decision applies only to the standalone development watcher.
