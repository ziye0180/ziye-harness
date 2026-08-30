# Agent Note: 后台持久化测试观察实际结果

Status: implemented

[English](2026-08-28-background-durability-tests-observe-results.md) | 中文

## Problem

Session projection cache 测试在读取由 fire-and-forget 事件监听器写入的记录前固定等待 40 毫秒。该等待测量的是假设的文件系统延迟，而不是持久化结果。在并发测试负载下，正确写入可能在 sleep 之后完成并让测试失败。

## Decision

持久化断言轮询已存 checkpoint 或故意失败写入产生的 warning。每次轮询使用五秒外层上限和五毫秒间隔。预期不触发阈值写入的测试会先观察创建时 checkpoint 已完成，再断言后续低于阈值的事件保持它不变。

生产写入调度保持不变。测试继续执行真实 storage 和 atomic write，不会用 mock 实现替代持久化。

## Alternatives considered

**增加固定等待。** 否决：任何猜测的延迟都可能在更慢的高负载 runner 上失败，并让快速运行无谓等待。

**从生产代码等待内部写入 promise。** 否决：事件触发的 cache 写入有意采用 fail-soft 并与 Session append 路径分离；暴露 test-only promise 会改变运行时合同。

**Mock storage 层。** 否决：测试目标是真实持久写入完成及其 fail-soft 错误路径。

## Consequences

测试只等待可观察结果所需的时间，并在有界 deadline 报告未满足的持久化断言。缺失写入仍会失败，而聚合 runner 负载不再把正确异步写入变成时序失败。
