/**
 * Hero badge style ownership as CSS text. The render spec pins the fallback
 * and custom DOM nodes; this file prevents visual chrome from returning to
 * their shared layout wrapper, which would paint two badge backgrounds.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const css = readFileSync(
  fileURLToPath(new URL('../src/client/skeleton/HeroShell.module.css', import.meta.url)),
  'utf8',
)
const declarationText = css.replace(/\/\*[\s\S]*?\*\//g, ' ')

function declarations(selector: string): string[] {
  const rule = new RegExp(`(?:^|\\})\\s*\\${selector}\\s*\\{([^{}]*)\\}`).exec(declarationText)
  if (rule === null) throw new Error(`HeroShell.module.css has no \`${selector}\` rule`)
  return (rule[1] ?? '').split(';').map(part => part.trim()).filter(Boolean)
}

describe('Hero badge style ownership', () => {
  it('keeps the shared slot wrapper layout-only', () => {
    const slot = declarations('.previewBadgeSlot')
    expect(slot).toEqual(expect.arrayContaining([
      'grid-row: 1',
      'grid-column: 3',
      'display: flex',
      'align-items: flex-start',
    ]))
    expect(slot.join(';')).not.toMatch(
      /(?:^|;)(?:background|border|padding|color|font|box-shadow|filter|opacity|outline)(?:[-:]|$)/,
    )
  })

  it('keeps the official badge chrome on the fallback element', () => {
    expect(declarations('.previewBadge')).toEqual(expect.arrayContaining([
      'padding: 1px 7px 0',
      'border: 1px solid var(--dsw-alias-interactive-bg-hover)',
      'border-radius: 24px',
      'background: var(--dsw-alias-state-business-tertiary)',
      'color: var(--dsw-alias-label-primary-bluish)',
    ]))
  })
})
