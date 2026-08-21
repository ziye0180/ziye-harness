// @vitest-environment jsdom
/**
 * Browser-title assembly on the production SlotRegistry: a registrant waits
 * for ui-layout's declaration, receives live selected-Session owner data, and
 * yields back to the shipped fallback when its fiber is disposed.
 */
import { act, cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useEffect } from 'react'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import { SlotTestRuntime } from '@deepseek-ai/dsh-client-test-runtime'
import { apply, inject } from '@deepseek-ai/dsh-client-ui-layout/client'
import type { DocumentTitleOwnerProps } from '@deepseek-ai/dsh-client-ui-layout/client'

let runtime: SlotTestRuntime | undefined

class ResizeObserverStub {
  observe(): void {}
  disconnect(): void {}
  unobserve(): void {}
}

beforeEach(() => {
  vi.stubEnv('DSH_CLIENT_TITLE', 'DeepSeek Harness')
  vi.stubGlobal('ResizeObserver', ResizeObserverStub)
})

afterEach(async () => {
  cleanup()
  await runtime?.dispose()
  runtime = undefined
  document.title = ''
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('document-title slot assembly', () => {
  it('tracks selection and rename, handles a ghost row, then restores the fallback on occupant disposal', async () => {
    runtime = await SlotTestRuntime.create()
    runtime.provide('theme', {
      getTheme: () => ({
        preference: 'light',
        active: { id: 'light', colorScheme: 'light', tokens: {} },
        themes: [],
        revision: 0,
      }),
    } as never)
    await runtime.sessions.add({
      id: 's-alpha',
      summary: { title: 'Alpha', displayTitle: 'Alpha' },
    })
    await runtime.sessions.add({
      id: 's-beta',
      summary: { title: 'Beta', displayTitle: 'Beta' },
    }, { current: false })

    const seenTitles: Array<string | undefined> = []
    type CustomTitleProps = PropsRuntime<'shell.document-title'> & DocumentTitleOwnerProps
    function CustomTitle({ title }: CustomTitleProps): null {
      useEffect(() => {
        seenTitles.push(title)
        document.title = title === undefined ? 'ZIYE' : `${title} — ZIYE`
      }, [title])
      return null
    }

    const customTitle = await runtime.mount({
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('shell.document-title', () => ctx.slots.register(
          { name: 'shell.document-title' },
          CustomTitle,
        ))
      },
    })
    await runtime.mount({ inject: [...inject], apply })
    runtime.renderRoot()

    expect(document.title).toBe('Alpha — ZIYE')
    expect(seenTitles.at(-1)).toBe('Alpha')

    await runtime.sessions.updateSummary('s-alpha', { title: 'Alpha revised' })
    expect(document.title).toBe('Alpha revised — ZIYE')
    expect(seenTitles.at(-1)).toBe('Alpha revised')

    await runtime.sessions.setCurrent('s-beta')
    expect(document.title).toBe('Beta — ZIYE')
    expect(seenTitles.at(-1)).toBe('Beta')

    await act(async () => {
      runtime?.sessions.list.update((draft) => {
        draft.current = 's-ghost' as SessionId
      })
    })
    expect(document.title).toBe('ZIYE')
    expect(seenTitles.at(-1)).toBeUndefined()

    await runtime.sessions.setCurrent('s-beta')
    await customTitle.dispose()
    expect(document.title).toBe('Beta — DeepSeek Harness')
  })
})
