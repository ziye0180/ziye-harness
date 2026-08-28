/**
 * Acceptance-path coverage for the rescope codemod's exact-edit classifier: a
 * duplicated insertion — what a non-idempotent apply produces — must be
 * rejected rather than applied again.
 */

import { describe, expect, it } from 'vitest'
import { checkedInExactEditState, exactEditState, rewriteRescopeLine } from './rescope-vendor.ts'

const ANCHOR = '\n## Sync procedure'
const INSERTED = `\n15. **rescope**: one log entry.\n${ANCHOR}`

describe('exactEditState', () => {
  it('classifies an insertion by its target form, so a duplicate is invalid', () => {
    expect(exactEditState(`log\n${ANCHOR}\n`, ANCHOR, INSERTED, 1)).toBe('pending')
    expect(exactEditState(`log${INSERTED}\n`, ANCHOR, INSERTED, 1)).toBe('applied')
    // The anchor survives an insertion, so counting the source form would have
    // called this pending and inserted the entry a second time.
    expect(exactEditState(`log${INSERTED}${INSERTED}\n`, ANCHOR, INSERTED, 1)).toBe('invalid')
    expect(exactEditState('log\n', ANCHOR, INSERTED, 1)).toBe('invalid')
  })

  it('classifies a deletion by its source form, and requires its remainder to survive', () => {
    const remainder = 'exclude:\n'
    const withEntries = 'exclude:\n  - cordis@4\n'
    expect(exactEditState(withEntries, withEntries, remainder, 1)).toBe('pending')
    expect(exactEditState(remainder, withEntries, remainder, 1)).toBe('applied')
    // Upstream dropped the whole field: the source form is gone, but so is the
    // remainder, so this is a moved site rather than a completed deletion.
    expect(exactEditState('unrelated:\n', withEntries, remainder, 1)).toBe('invalid')
  })

  it('requires a replacement to leave no source form and the exact target count', () => {
    expect(exactEditState('a = 1\n', 'a = 1', 'b = 2', 1)).toBe('pending')
    expect(exactEditState('b = 2\n', 'a = 1', 'b = 2', 1)).toBe('applied')
    expect(exactEditState('b = 2\nb = 2\n', 'a = 1', 'b = 2', 1)).toBe('invalid')
    // A moved or partially applied site: neither state is complete.
    expect(exactEditState('a = 1\nb = 2\n', 'a = 1', 'b = 2', 1)).toBe('invalid')
    expect(exactEditState('x\n', 'a = 1', 'b = 2', 1)).toBe('invalid')
  })
})

describe('checked-in rescope mapping', () => {
  const movedSites = [
    'agent-spine-demo-mounted-tree',
    'agent-spine-demo-mounted-tree-zh',
    'vendoring-cookbook-tree-comment',
    'vendoring-cookbook-tree-comment-zh',
    'vendoring-cookbook-name-invariant',
    'vendoring-cookbook-name-invariant-zh',
  ] as const

  it.each(movedSites)('recognizes %s as fully applied', (id) => {
    expect(checkedInExactEditState(id)).toBe('applied')
  })
})

describe('product token exclusions', () => {
  const inspectorSpec = 'packages/experimental/inspector/tests/cordis-tree.host.spec.ts'
  const upstreamFramework = ['cor', 'dis'].join('')
  const inspectorTopic = `${upstreamFramework}/tree`

  it('keeps the Inspector topic without exempting framework imports in the same file', () => {
    expect(rewriteRescopeLine(`const topic = '${inspectorTopic}'`, inspectorSpec))
      .toBe(`const topic = '${inspectorTopic}'`)
    expect(rewriteRescopeLine(`import { Context } from '${upstreamFramework}'`, inspectorSpec))
      .toBe("import { Context } from '@deepseek-ai/cordis'")
    expect(rewriteRescopeLine("import { Context } from '@deepseek-ai/cordis'", inspectorSpec, true))
      .toBe(`import { Context } from '${upstreamFramework}'`)
  })
})
