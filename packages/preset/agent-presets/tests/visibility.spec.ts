import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { Context } from '@deepseek-ai/cordis'
import Include from '@deepseek-ai/cordis-plugin-include'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import AgentPresets, { COMPOSITION_FILE, type Config } from '@deepseek-ai/dsh-agent-presets'
import { describe, expect, it } from 'vitest'

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), 'fixtures')
const SYSTEM_ROOT = join(FIXTURES, 'system')

/** Boot a roster with a fresh writable root and optional display allowlist. */
async function roster(visible?: string[]): Promise<Context> {
  const writableRoot = await mkdtemp(join(tmpdir(), 'dsh-preset-visible-'))
  await mkdir(join(writableRoot, 'custom'))
  await writeFile(join(writableRoot, 'custom', COMPOSITION_FILE), '[]\n')
  const config: Config = {
    default: 'standard',
    roots: [
      { path: SYSTEM_ROOT, trust: 'system' },
      { path: writableRoot, trust: 'user' },
    ],
    includeUserRoot: false,
    ...(visible === undefined ? {} : { visible }),
  }
  const ctx = new Context()
  ctx.baseUrl = pathToFileURL(FIXTURES).href + '/'
  await ctx.plugin(Loader)
  ctx.loader.builtins.include = Include
  await ctx.plugin(AgentPresets, config)
  return ctx
}

describe('configured preset visibility', () => {
  it('rejects ids that cannot name preset directories at the config boundary', () => {
    const config: Config = {
      default: 'standard',
      roots: [],
      includeUserRoot: false,
      visible: ['../escape'],
    }

    expect(() => AgentPresets.Config(config)).toThrow()
  })

  it('rejects a non-empty allowlist that omits the deployment default', async () => {
    await expect(roster(['minimal']).then(() => undefined))
      .rejects.toThrow(/default preset "standard" must be visible/)
  })

  it('lists every discovered preset when the allowlist is omitted', async () => {
    const ctx = await roster()

    expect((await ctx.agentPresets.list()).map(preset => preset.id)).toEqual(['minimal', 'standard', 'custom'])
  })

  it('lists only allowlisted presets while preserving discovery order', async () => {
    const ctx = await roster(['custom', 'standard'])

    expect((await ctx.agentPresets.list()).map(preset => preset.id)).toEqual(['standard', 'custom'])
  })

  it('allows an empty list to hide every roster surface without disabling resolution', async () => {
    const ctx = await roster([])

    expect(await ctx.agentPresets.list()).toEqual([])
    expect((await ctx.agentPresets.resolve()).id).toBe('standard')
    expect((await ctx.agentPresets.resolve('minimal')).id).toBe('minimal')
  })

  it('keeps hidden ids occupied when authoring checks for a copy collision', async () => {
    const ctx = await roster(['standard'])

    await expect(ctx.agentPresets.copy('standard', 'minimal')).rejects.toThrow(/already exists/)
  })
})
