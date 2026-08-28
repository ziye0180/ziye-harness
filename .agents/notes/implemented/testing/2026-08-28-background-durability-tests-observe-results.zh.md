# Agent Note: 后台持久化测试观察结果

Status: implemented

[English](2026-08-28-background-durability-tests-observe-results.md) | 中文

## Problem

由 `session/created`、`session/event` 和 `session/disposed` listener 发起的会话投影缓存写入，会通过真实文件系统 I/O 在后台完成。包测试在读取记录或 warning sink 前固定等待 40 毫秒。仓库测试并发运行时，延时可能在写入完成前结束，因此即使排队的操作随后会到达所需状态，测试仍会观察到缺失的创建记录、较早的检查点或仅第一条 warning。

## Decision

正向持久化断言使用有界的 `vi.waitFor` 轮询，等待精确的可观察记录值或 warning。要求中间阶段不得写入的测试会先观察已完成的创建记录，再清空 `write` spy，然后同步断言触发点之前的事件没有调用额外写入，最后读取稳定的创建 cut。超时为真实失败提供上界，轮询间隔则避免假定某个墙钟时长足以完成。产品代码、事件时序和 fail-soft 写入策略保持不变。

## Alternatives considered

**增加固定延时。** 更长的 sleep 只会提高触发失败的负载阈值，并为每次运行增加无条件延迟。

**为测试公开生产 drain 方法。** 公开缓存服务没有需要该方法的消费方，而测试专用生命周期操作会扩大运行时 API。

**用 mock 替换存储后端。** mock 会移除这些测试要验证的真实原子写入和 warning 时序。

## Verification

修改后，包测试的八路并发运行全部通过。移除创建检查点注册会让创建测试超时，证明结果等待仍能拒绝该回归。`write` spy 会独立拒绝 `turn/end` 之前或配置事件计数阈值之前的额外检查点。

## Consequences

测试继续对缺失、陈旧、失败或过早的写入保持敏感，同时不依赖宿主负载。损坏的异步完成路径可能经过完整的有界超时才失败，而额外写入会在触发它的事件处同步失败。
