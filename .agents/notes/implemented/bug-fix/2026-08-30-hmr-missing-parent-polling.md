# Agent Note: Missing-parent config watches poll their recovery path

Status: implemented

English | [中文](2026-08-30-hmr-missing-parent-polling.zh.md)

## Problem

An exact HMR config watch may be registered before the target's parent directory exists. The watcher starts at the deepest existing ancestor and follows the missing depth. Under concurrent native watcher pressure, the backend can lose the directory-creation edge before it attaches to the new directory, so a file created immediately inside that directory is never reported. The watcher is ready and the file exists, but waiting longer cannot recover an event that was not delivered.

## Decision

`registerConfig()` uses polling when `findWatchRoot()` reports one or more missing parent levels. The polling watcher retains the same canonical root, bounded depth, exact target filter, initial scan, serialized refresh, and quiescent disposer. A target whose parent already exists retains the configured watcher mode, including the default native backend.

## Alternatives considered

**Increase the test timeout.** Rejected because independent-process reproduction leaves the event absent beyond the existing ten-second observation bound; more waiting does not recreate it.

**Use polling only in the test.** Rejected because the test observes the public missing-parent registration promise. Changing only the fixture would hide a runtime path that can miss a user-created config file.

**Enable polling for every HMR watcher.** Rejected because module roots and existing-parent config files have stable native watch points and do not need the recurring filesystem work.

## Consequences

Creating a missing directory and its config file immediately after registration becomes observable under concurrent watcher load. Polling cost is limited to exact config registrations whose parent chain was missing at registration and ends when their disposer reaches quiescence; all existing-parent and module watches keep their prior backend.
