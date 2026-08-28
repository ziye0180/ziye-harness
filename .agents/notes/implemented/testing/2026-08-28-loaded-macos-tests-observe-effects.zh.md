# Agent Note: 高负载 macOS 测试观察实际效果

Status: implemented

[English](2026-08-28-loaded-macos-tests-observe-effects.md) | 中文

## Problem

macOS 单元测试通道会并发运行超过一万七千个测试。事务性用户补丁测试依赖一次原生文件系统通知，Inspector 集成测试则使用 Vitest 默认的一秒等待，观察一条跨越 Worker 和 WebSocket 队列的 Console 事件。在聚合 runner 负载下，即使隔离重复运行能够完成相同行为，任一测试仍可能错过其观察时限。

## Decision

事务性用户补丁测试捕获传给 `Hmr.registerConfig()` 的 refresh callback，并通过该 callback 驱动每一种文件状态。该包测试拥有补丁组合、回滚、恢复、移除和销毁行为；`hmr-config.spec.ts` 拥有原生精确路径传递、refresh 串行化、销毁等待和失败广播。

Inspector 测试最多等待十秒，让两个隔离 CDP Session 都观察到同一 Console marker。断言仍要求两条事件全部出现，并在传递后保留逐 Session 的远程对象检查。

## Alternatives considered

**重跑 macOS 通道直至通过。** 重试可能把失败转移到另一个异步测试，并让分支继续缺少确定性证据。

**在事务测试中启用 Chokidar polling。** 完整本地套件运行期间，polling 仍会错过文件新增，因为测试继续依赖另一个子系统的通知时序。

**修改生产 watcher 或 Inspector 传递。** 聚焦重复运行已成功执行生产路径；缺少产品缺陷证据时，修改运行时行为会扩大修复范围。

## Consequences

两个测试保留原有行为断言，同时不再把聚合负载下的成功绑定到原生通知可用性或 Vitest 默认等待时限。被拒绝的补丁 refresh 仍可直接观察，缺失的 Console 事件仍会在十秒内失败。

## Verification

两个受影响的测试文件在 macOS 上共同连续五次聚焦运行通过。完整 macOS `pnpm run test` 通过 1,032 个文件和 17,072 个测试；仓库 macOS 单元测试通道继续拥有托管聚合负载验证。
