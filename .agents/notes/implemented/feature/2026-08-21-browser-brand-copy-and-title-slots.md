# Agent Note: Browser brand copy and document title slots

Status: implemented

English | [中文](2026-08-21-browser-brand-copy-and-title-slots.zh.md)

## Problem

The browser exposed official slots for sidebar identity and the Hero mark, but Hero headline copy, Hero badge copy, and the runtime document title remained owner-internal. An out-of-tree brand could replace those values only by hiding owner DOM siblings or rewriting the initial HTML title, so a slot-compatible package still depended on private markup and lost its title after the selected Session changed.

## Decision

`ui-conversation` declares root-scoped single slots `conversation.hero.brand.headline` and `conversation.hero.brand.badge`. The shell retains the stable styled wrappers and passes an empty owner share; each slot falls back to the localized product copy when no occupant exists.

`ui-layout` declares root-scoped single slot `shell.document-title`. AppFrame passes the selected durable Session title as owner data and renders the build-selected product-title projector as the fallback. `ui-renderer` retains the only context-level `renderSlot('root')` call and no longer owns title projection.

Brand packages register into these declarations with `slots.inject()`. Occupants replace text or title behavior through their own lifecycle and never hide, clone, or query owner DOM. The initial HTML title remains a build artifact; the mounted root frame is authoritative after React starts.

## Verification

Component tests cover localized fallbacks, custom Hero copy, selected-Session title projection, occupant replacement, and declaration disposal. The generated client catalog records every key, kind, scope, and owner field. Web replay and a real browser prove the default product remains unchanged and an out-of-tree occupant replaces all three values without DOM selectors.

## Alternatives considered

**Keep the title build-time only.** This cannot represent a runtime-installed brand package and resets custom text whenever the selected Session title changes.

**Replace the whole Hero.** A whole-surface replacement would duplicate workspace, layout, localization, accessibility, and responsive behavior that the shell already owns.

**Use CSS sibling selectors or DOM mutation.** Those approaches depend on private markup, cannot be validated by the slot catalog, and break independently from the public extension points.

## Consequences

Brand packages can replace Hero copy and the browser title through typed, lifecycle-owned registrations while the default DeepSeek UI remains byte-for-byte equivalent at the visible-copy level. The client slot catalog grows by three root slots, and ui-layout becomes the owner of title fallback projection. A custom brand must still provide its favicon and manifest through Host webserver extension points because those assets are outside the React slot tree.
