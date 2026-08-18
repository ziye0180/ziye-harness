// @vitest-environment jsdom
// An external Client bundle shadows both built-in brand seats through the real
// AppWebEntry and ModuleLoader path. The workspace bundles remain their built
// lib/client.js artifacts; only the deployment-owned occupant is a fixture.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { expect, it } from 'vitest'
import {
  installAssembledBootEnv,
  mountAssembledApp,
  REFRESHING_GOLDEN,
  type AssembledBootPlugin,
} from './assembled-boot.ts'

const EXPECTED = join(process.cwd(), 'apps/web/tests/snapshots/brand-slots/occupants.expected.txt')
const FIXTURE_ID = '@fixture/dsh-brand-slots'
const FIXTURE_URL = '/plugins/fixture-brand-slots.js'
const FIXTURE_SOURCE = readFileSync(
  join(process.cwd(), 'apps/web/tests/fixtures/brand-slots.client.js'),
  'utf8',
)

const FIXTURE_PLUGIN: AssembledBootPlugin = {
  entry: { id: FIXTURE_ID, url: FIXTURE_URL, rev: 'fixture-brand-slots', inject: [] },
  source: FIXTURE_SOURCE,
}

installAssembledBootEnv()

it('lets an external lower-priority bundle own the Hero and both sidebar variants', async () => {
  mountAssembledApp([FIXTURE_PLUGIN])

  const wordmark = await screen.findByText('Fixture Wordmark', {}, { timeout: 10_000 })
  expect(wordmark.getAttribute('data-fixture-brand')).toBe('sidebar-wordmark')
  expect(wordmark.closest('button')?.getAttribute('aria-label')).toBe('New session')
  expect(screen.queryByText('Into the Unknown')).toBeNull()
  const hero = screen.getByText('Fixture Hero')
  expect(hero.getAttribute('data-fixture-brand')).toBe('hero')
  expect(hero.closest('[data-phase="hero"]')).not.toBeNull()
  const expandedShape = [
    `sidebar=${wordmark.getAttribute('data-fixture-brand')}|${wordmark.textContent}`,
    `sidebarHost=${wordmark.closest('button')?.getAttribute('aria-label')}`,
    `hero=${hero.getAttribute('data-fixture-brand')}|${hero.textContent}`,
    `heroPhase=${hero.closest('[data-phase]')?.getAttribute('data-phase')}`,
    `defaultHero=${screen.queryByText('Into the Unknown') === null ? 'absent' : 'present'}`,
  ]

  fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
  const mark = await waitFor(() => {
    const value = document.querySelector('[data-fixture-brand="sidebar-mark"]')
    expect(value?.textContent).toBe('F')
    return value!
  })
  expect(screen.queryByText('Fixture Wordmark')).toBeNull()
  expect(mark.closest('button')?.getAttribute('aria-label')).toBe('Open sidebar')
  const shape = `${[
    ...expandedShape,
    `collapsed=${mark.getAttribute('data-fixture-brand')}|${mark.textContent}`,
    `collapsedHost=${mark.closest('button')?.getAttribute('aria-label')}`,
  ].join('\n')}\n`
  if (REFRESHING_GOLDEN) {
    mkdirSync(dirname(EXPECTED), { recursive: true })
    writeFileSync(EXPECTED, shape)
  }
  await expect(shape).toMatchFileSnapshot(EXPECTED)
})
