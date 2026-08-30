# Agent Note: Filesystem boundary tests use observed time

Status: implemented

English | [中文](2026-08-28-filesystem-boundary-tests-use-observed-time.zh.md)

## Problem

The spill cleanup boundary test requested an exact modification time through `utimes` and reused the requested number as the cutoff. Filesystems may quantize that request or report a nearby sub-millisecond value. The test could therefore present a file that was observably older than its cutoff while claiming to exercise equality, causing the correct strictly-older comparison to delete it.

## Decision

After setting the file time, the boundary test reads the persisted `mtimeMs` and uses that exact observed value as the cleanup cutoff. The production comparison remains `mtimeMs >= cutoffMs`: equality is kept and only an observed earlier timestamp expires.

## Alternatives considered

**Round or tolerate timestamps in production.** This would change retention behavior for genuinely older files to accommodate a test setup error.

**Use a nearby but non-equal timestamp.** That would test a fresh-file case rather than the strict equality boundary named by the test.

**Skip the assertion on affected filesystems.** The cleanup rule is platform-independent and remains directly testable by reading the stored timestamp.

## Consequences

The test proves the cleanup comparison against the timestamp the implementation reads, independent of filesystem timestamp representation. It deliberately does not test whether `utimes` preserves an arbitrary requested floating-point value exactly.
