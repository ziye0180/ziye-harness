# Agent Note: Literal-tail repository globs avoid file-symlink descent

Status: implemented

English | [中文](2026-08-28-literal-tail-repository-globs.zh.md)

## Problem

Node's `globSync('**/<literal>')` can treat a matching file symlink whose basename is `<literal>` as a traversal candidate. It then attempts `lstat('<link>/<literal>')` and raises `ENOTDIR`, so a repository check can stop before reading any matched file. Repository checks intentionally admit symlinked instructions and expected outputs, and `uniqueRepoFiles()` resolves their canonical targets for deduplication.

## Decision

`uniqueRepoFiles()` plans each repository-relative pattern before calling `globSync()`. A pattern that contains a `**` segment and ends in a literal filename expands with `*` in place of that final segment, then filters every normalized result through `matchesGlob()` against the original pattern. Patterns with a wildcard final segment use their original expansion.

Exclusion runs after exact pattern filtering. Canonical `realpath` deduplication then retains the first authored path for each target. Expansion, matching, and canonicalization errors continue to propagate; the helper does not catch `ENOTDIR` or retry after an unknown filesystem failure.

## Alternatives considered

**Broaden the `verify-md-wrap` pattern.** Rejected because a caller-level wildcard would change that check's admitted filenames and leave every other `uniqueRepoFiles()` consumer exposed to the same literal-tail traversal.

**Catch `ENOTDIR` and retry.** Rejected because the same error can report a genuine invalid repository path. A deterministic expansion plan avoids the unsupported traversal without converting unrelated filesystem failures into fallback behavior.

**Replace Node's glob implementation.** Rejected because the repository helper needs one narrow accommodation, not another dependency and a second glob dialect.

## Consequences

A literal-tail glob enumerates the containing directories' immediate entries before exact filtering, so this path performs more directory-entry work than the direct Node expansion. It preserves the original match set, the caller's exclusion predicate, first-seen ordering, and canonical symlink deduplication. The regression fixture includes a same-basename file symlink and an unrelated sibling, proving that the symlink is admitted without broadening the result.
