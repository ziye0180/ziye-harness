# Agent Note: Preset visibility filters roster surfaces without revoking compositions

Status: implemented

English | [中文](2026-08-24-configurable-preset-roster-visibility.zh.md)

## Problem

The preset service discovers every directory supplied by its configured roots, and every browser surface consumes that same roster. A deployment that wants to offer only its ordinary working modes therefore has no supported choice between exposing every shipped and locally authored preset or modifying files owned by the installation. Deleting shipped directories is overwritten by upgrades, while hiding menu entries in one client leaves other roster consumers unchanged.

## Decision

[`dsh-agent-presets`](../../../../packages/preset/agent-presets/README.md) accepts an optional `visible` list. Omission publishes every discovered preset; an empty list publishes none; a non-empty list must contain the composition `default`. Each id is validated with the preset directory-name rule, and filtering preserves discovery order rather than turning the list into a second ordering source.

```yaml
- id: agent-presets
  config:
    default: code
    visible:
      - code
      - human
```

Visibility applies only to `AgentPresets.list()`, which owns the rows exposed through `agentPreset.list` and every roster-backed browser surface. `resolve()`, mounting, persisted-session recovery, reading, deletion, and authoring collision checks use the complete discovered inventory. A hidden preset remains addressable by explicit id, and a session recorded under it can still resume after the visibility policy changes.

## Alternatives considered

**Delete or edit shipped preset directories.** The deployment owns those files and an upgrade replaces them. Removing files also turns a presentation preference into missing runtime input.

**Filter individual client components or hide them with CSS.** The Host would continue publishing the entries to every other client and RPC consumer, producing several conflicting rosters.

**Filter explicit resolution as well as listing.** This would make visibility an authorization rule and prevent a persisted session from restoring a hidden composition that produced its history.

**Point the deployment at a copied curated root.** Copies drift from fixes and capability changes in the shipped presets, and duplicate compositions solely to control presentation.

## Consequences

One Host-owned policy controls every current roster surface without changing the Agent Loop, Session format, preset files, or Client rendering code. Visibility is not a security boundary: callers that may explicitly choose a preset retain the same authority, and deployments requiring authorization need a separate policy at the operation that grants it.

A hidden user preset remains on disk and continues to occupy its id, but the management section cannot open or delete it until the deployment publishes it again; direct file management remains available. An empty list deliberately removes the default row, new-session chip, and management section while the hidden default still composes sessions. The package tests pin config validation, ordering, hidden resolution, and collision protection; the Web snapshot pins that excluded modes never reach the browser menu.
