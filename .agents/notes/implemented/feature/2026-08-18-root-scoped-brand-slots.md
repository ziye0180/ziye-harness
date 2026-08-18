# Agent Note: Root-scoped brand slots for client skins

Status: implemented

English | [中文](2026-08-18-root-scoped-brand-slots.zh.md)

## Problem

Client skins need to replace the sidebar wordmark and collapsed mark together with the new-session Hero's mark, slogan, and badge. Color and spacing tokens cannot replace that semantic content, while taking over the surrounding sidebar or conversation shell would also take ownership of interaction, layout, and lifecycle behavior that is unrelated to branding. The customization point must therefore replace only visual identity and must restore the product identity when the skin unloads.

## Decision

**Each host declares one root-scoped single slot.** `@deepseek-ai/dsh-client-ui-sidebar` declares `sidebar.brand` and passes `variant: 'wordmark' | 'mark'` from its stable buttons. `@deepseek-ai/dsh-client-ui-conversation` declares `conversation.hero.brand`; its owner share contributes no feature-specific business data. The slot occupant owns the rendered identity; the sidebar host retains its buttons and accessible labels, while the conversation host retains the brand position, shell geometry, and resident composer tree.

**The built-in identity remains a live occupant at priority `0`.** A skin registers into the same slot at a distinct lower numeric priority, such as `-100`. Single-slot election renders the lowest live priority, so the skin shadows the built-in entry without removing or hiding it. A second registration at the same priority remains a load-time error.

**Disposal restores the default through slot lifecycle.** Disposing the skin registration removes only its lower-priority occupant. The still-live priority-`0` entry becomes visible in the same host tree, without querying rendered nodes, mutating another component's DOM, or remounting the sidebar, Hero shell, or composer.

## Alternatives considered

**Theme tokens and CSS only.** Rejected because tokens can restyle the shipped identity but cannot replace its text, SVG structure, or accessible content.

**DOM lookup and replacement from the skin.** Rejected because selectors and rendered structure are not a plugin contract, DOM mutation races React reconciliation, and cleanup cannot reliably reconstruct component-owned state.

**Replace the whole sidebar or conversation shell.** Rejected because a brand skin should not assume ownership of New Session behavior, collapse controls, Workspace selection, composer continuity, or unrelated layout.

**Use additive list slots for brand fragments.** Rejected because each surface has exactly one elected identity; rendering several independent entries would duplicate or interleave marks and copy instead of selecting one coherent brand.

## Consequences

A client skin replaces both sidebar variants and the complete new-session Hero identity without forking either package. Both slots are session-independent and live at root scope. Sidebar occupants must render both requested variants. `HeroBrandOwnerProps` contributes no feature-specific business data, while Hero occupants still receive the root-scope framework hooks. Lower numeric priorities are an explicit deployment choice, and removing the skin registration deterministically reveals the built-in identity while the host interactions and component tree remain intact.
