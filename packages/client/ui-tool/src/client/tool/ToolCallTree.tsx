/** Root/subcall Tool composition with one keyed atomic dispatch path. */
import { memo, useEffect, useMemo, useState, type ReactNode } from 'react'
import { IconCodeOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ToolCallBlock } from '@deepseek-ai/dsh-client-runtime/client'
import type { ToolCallOwnerProps, ToolTreeProps } from '../contract/slots.ts'
import { ToolRow } from './components/ToolRow.tsx'
import { toolRowModel, type ToolRowState } from './models/tool-call-model.ts'
import { GenericToolCard } from './toolviews/GenericToolCard.tsx'
import css from './ToolCallTree.module.css'

/** Resolve a Tool call's wire name from either lifecycle form. */
function callName(node: ToolCallBlock): string {
  return 'kind' in node ? node.call?.name ?? '' : node.name
}

function containsCall(block: ToolCallBlock, callId: string): boolean {
  return block.callId === callId || block.subCalls.some(child => containsCall(child, callId))
}

function descendantCount(block: ToolCallBlock): number {
  return block.subCalls.reduce((count, child) => count + 1 + descendantCount(child), 0)
}

const STATE_PRIORITY: Record<ToolRowState, number> = {
  ok: 0,
  stopped: 1,
  error: 2,
  running: 3,
}

function activityState(block: ToolCallBlock, cwd?: string, home?: string): ToolRowState {
  const own = toolRowModel(callName(block), block, cwd, home).state
  return block.subCalls.reduce((state, child) => {
    const candidate = activityState(child, cwd, home)
    return STATE_PRIORITY[candidate] > STATE_PRIORITY[state] ? candidate : state
  }, own)
}

function activityTitle(
  state: ToolRowState,
  count: number,
  t: ToolTreeProps['t'],
): string {
  const cardinality = count === 1 ? 'one' : 'many'
  switch (state) {
    case 'running': return t(`tool.activity.running.${cardinality}`, { count })
    case 'error': return t(`tool.activity.failed.${cardinality}`, { count })
    case 'stopped': return t(`tool.activity.stopped.${cardinality}`, { count })
    case 'ok': return t(`tool.activity.completed.${cardinality}`, { count })
  }
}

/** One atomic call dispatched through the Tool-owned keyed slot. */
const AtomicToolCall = memo(function AtomicToolCall({
  renderSlot, callId, toolName, block, openFile, cwd, home, inspect, t,
}: Pick<ToolTreeProps, 'renderSlot' | 'openFile' | 'cwd' | 't'> & {
  callId: string
  toolName: string
  block: ToolCallBlock
  home?: string | undefined
  inspect?: (() => void) | undefined
}) {
  const owner: ToolCallOwnerProps = useMemo(() => ({
    callId,
    toolName,
    block,
    openFile,
    cwd,
    home,
    ...inspect === undefined ? {} : { inspect },
  }), [callId, toolName, block, openFile, cwd, home, inspect])
  return (
    renderSlot('tool.call.toolview', owner, {
      entryKey: toolName,
      fallback: <GenericToolCard {...owner} t={t} />,
    })
  )
})

function CallFrame({ callId, selected, children }: {
  callId: string
  selected: boolean
  children: ReactNode
}) {
  return (
    <div
      className={css.callRow}
      data-chat-anchor-key={`call:${callId}`}
      data-chat-call-id={callId}
      data-selected={selected || undefined}
    >
      {children}
    </div>
  )
}

const ToolCallBranch = memo(function ToolCallBranch({
  renderSlot, block, selectedCallId, cwd, home, openFile, inspectCall, t,
}: Pick<ToolTreeProps, 'renderSlot' | 'selectedCallId' | 'cwd' | 'openFile' | 'inspectCall' | 't'> & {
  block: ToolCallBlock
  home?: string | undefined
}) {
  const toolName = callName(block)
  const hasActivity = block.subCalls.length > 0
  const selectedDescendant = selectedCallId !== undefined
    && selectedCallId !== block.callId
    && containsCall(block, selectedCallId)
  const [activityOpen, setActivityOpen] = useState(selectedDescendant)
  useEffect(() => {
    if (selectedDescendant) setActivityOpen(true)
  }, [selectedDescendant])
  const inspect = () => { inspectCall(block.callId) }
  const atomic = (
    <AtomicToolCall
      renderSlot={renderSlot}
      callId={block.callId}
      toolName={toolName}
      block={block}
      openFile={openFile}
      cwd={cwd}
      home={home}
      inspect={hasActivity ? undefined : inspect}
      t={t}
    />
  )
  if (!hasActivity) {
    return (
      <CallFrame callId={block.callId} selected={block.callId === selectedCallId}>
        {atomic}
      </CallFrame>
    )
  }
  const count = descendantCount(block)
  const model = toolRowModel(toolName, block, cwd, home)
  const state = activityState(block, cwd, home)
  return (
    <CallFrame callId={block.callId} selected={block.callId === selectedCallId}>
      <div data-tool-activity-group="">
        <ToolRow
          t={t}
          variant={model.variant}
          toolName={toolName}
          icon={<IconCodeOutline16 size={14} />}
          title={activityTitle(state, count, t)}
          summary={model.summary || model.title}
          body={null}
          details={(
            <div className={css.activityDetails}>
              <div className={css.rootCall}>{atomic}</div>
              <div className={css.subCalls} data-subcalls>
                {block.subCalls.map(child => (
                  <ToolCallBranch
                    key={child.callId}
                    renderSlot={renderSlot}
                    block={child}
                    selectedCallId={selectedCallId}
                    cwd={cwd}
                    home={home}
                    openFile={openFile}
                    inspectCall={inspectCall}
                    t={t}
                  />
                ))}
              </div>
            </div>
          )}
          expanded={activityOpen}
          onExpandedChange={setActivityOpen}
          state={state}
          inspect={inspect}
        />
      </div>
    </CallFrame>
  )
})

/**
 * Render one root Tool call and its recursive children through the same
 * atomic keyed dispatch.
 * @param props - whole-Tool owner data and the Tool-owned child-slot share.
 * @returns the Tool call tree.
 */
export function ToolCallTree({
  renderSlot, node, selectedCallId, cwd, openFile, inspectCall, useHostDescription, t,
}: ToolTreeProps) {
  const home = useHostDescription(description => description?.home)
  const block = node.data.root
  return (
    <ToolCallBranch
      renderSlot={renderSlot}
      block={block}
      selectedCallId={selectedCallId}
      cwd={cwd}
      home={home}
      openFile={openFile}
      inspectCall={inspectCall}
      t={t}
    />
  )
}
