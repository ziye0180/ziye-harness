import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { uniqueRepoFiles } from './repo-files.ts'

describe('uniqueRepoFiles', () => {
  const roots: string[] = []

  afterEach(() => {
    for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
  })

  it('matches a same-basename file symlink without descending into it', () => {
    const root = mkdtempSync(join(tmpdir(), 'dsh-repo-files-'))
    roots.push(root)
    const targetDir = join(root, 'target')
    const scenarioDir = join(root, 'snapshots/acp/image-compaction')
    mkdirSync(targetDir, { recursive: true })
    mkdirSync(scenarioDir, { recursive: true })
    const target = join(targetDir, 'system-prompt.expected.md')
    const link = join(scenarioDir, 'system-prompt.expected.md')
    writeFileSync(target, '# prompt\n')
    writeFileSync(join(scenarioDir, 'other.md'), '# unrelated\n')
    symlinkSync('../../../target/system-prompt.expected.md', link)

    expect(uniqueRepoFiles(root, ['snapshots/**/system-prompt.expected.md'])).toEqual([{
      abs: link,
      real: realpathSync(target),
    }])
  })
})
