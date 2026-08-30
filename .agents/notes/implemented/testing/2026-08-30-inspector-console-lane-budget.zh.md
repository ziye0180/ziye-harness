# Agent Note: Inspector Console 观察使用单元测试通道预算

Status: implemented

[English](2026-08-30-inspector-console-lane-budget.md) | 中文

## Problem

Inspector 集成测试将一个 Client Console 值通过 Worker 和 WebSocket 队列发送到两个隔离 CDP Session。仓库并发单元测试通道运行时，即使两个 Session 在其他条件不变的运行中都能收到事件，Vitest 默认一秒 `waitFor` 预算也可能到期。断言随后只报告一个未定义事件，却没有产品传递失败的证据。

## Decision

测试最多等待十秒让两个 Session 专属 Console 事件全部出现，并每二十毫秒轮询一次。等待条件仍是两条真实 CDP 消息及其后续远程对象隔离检查；没有 sleep 负责让断言通过，也没有修改生产 timeout。

## Alternatives considered

**重试测试。** 否决：重跑只会选择更空闲的调度，仍会让一秒预算低于该通道执行的工作。

**串行化 Inspector suite 或仓库测试。** 否决：端口通过原子方式分配，fixture 也拥有自己的 teardown；全局串行化会隐藏普通调度负载，而不是隔离共享资源。

**修改 Inspector 传递。** 否决：失败来自外层观察预算，聚焦执行会通过既有运行时路径传递两条事件。

## Consequences

当任一 CDP Session 始终收不到事件时，集成测试仍会有界失败；同时 Worker 与 WebSocket 管线可以获得聚合 runner 负载下已经需要的预算。快速运行会在两条消息到达后立即结束。
