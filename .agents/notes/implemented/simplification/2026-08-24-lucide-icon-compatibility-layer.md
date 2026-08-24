# Agent Note: Lucide glyphs sit behind the stable DSH icon exports

Status: implemented

English | [中文](2026-08-24-lucide-icon-compatibility-layer.zh.md)

## Problem

The Web UI consumed 70 `Icon*` components from `dsh-client-ui-primitives`, each implemented as an inline Figma-derived SVG path. The exports kept consumers consistent, but extending the set required another locally sourced path and the icons did not share one maintained visual library. A skin cannot replace those paths: product components statically import the primitive exports, and the Client slot catalog has no glyph-level replacement entries.

## Decision

`dsh-client-ui-primitives` retains every existing `Icon*` export name, default size, and `{ size, className }` props while implementing 69 semantic glyphs with statically named imports from the exact `lucide-react` dependency. The adapter passes size and class directly to Lucide, preserves `currentColor`, and fills only exports whose legacy name represents a solid selection or transport state.

`IconTreeCorner8x10` remains the product-owned SVG. It is an 8×10 session-tree connector with non-square layout geometry rather than a semantic icon. `FishLogo` and `BrandWordmark` are separate product-brand exports and remain unchanged.

Lucide stays a private runtime dependency of `dsh-client-ui-primitives`; React remains the shared application runtime. The implementation imports each selected glyph by name and never indexes a namespace dynamically, so the Client build can tree-shake the rest of Lucide's catalog. The source mapping table is the single place that chooses semantic equivalents; consumers continue importing DSH names rather than library names.

## Alternatives considered

**Add a runtime icon Provider controlled by the skin.** The deployment has one permanent skin and no current need to switch icon families while running. A Provider would add root-wrapper ownership, reactive lifecycle, fallback policy, and another public extension contract without a second active consumer.

**Use Lucide only in skin-owned components.** This is tree-out, but most visible controls live in upstream product components that statically import DSH icons, leaving two icon languages across one interface.

**Replace every consumer import with `lucide-react`.** This spreads the external library across product packages, removes the stable DSH naming layer, and makes a later mapping correction touch every consumer rather than one owner.

**Resolve glyphs dynamically from the full Lucide namespace.** Dynamic indexing defeats static tree-shaking and risks shipping the library's complete catalog for a fixed set of 69 icons.

## Consequences

The application adopts Lucide's rounded stroke geometry without changing any consumer API. Visual snapshots and browser review own the intentional shape change; component tests pin all 70 exports, the 69 Lucide roots, color inheritance, size forwarding, and the exact connector exception.

The dependency replaces hundreds of owned path lines with a maintained icon source and adds Lucide's ISC-licensed runtime to the browser dependency graph and third-party notices. In the same-checkout Web build, static selection reduced the main index chunk from 399.36 kB (135.43 kB gzip) to 326.20 kB (106.85 kB gzip), while the vendor chunk stayed unchanged. Product-specific brand geometry remains locally owned. A future need for runtime-selectable icon families requires a separately justified root-level composition contract rather than mutation of this fixed compatibility layer.
