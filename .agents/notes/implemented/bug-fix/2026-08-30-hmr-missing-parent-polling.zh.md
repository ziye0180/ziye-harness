# Agent Note: 缺失父目录的配置监听轮询恢复路径

Status: implemented

[English](2026-08-30-hmr-missing-parent-polling.md) | 中文

## Problem

精确 HMR 配置监听可能在目标父目录存在之前注册。watcher 从最深的既有祖先启动，并跟随缺失层级。在并发原生 watcher 压力下，backend 可能在附着到新目录前丢失目录创建事件，因此紧接着在该目录中创建的文件永远不会上报。watcher 已 ready 且文件已存在，但继续延长等待无法恢复一个未被传递的事件。

## Decision

当 `findWatchRoot()` 报告一个或多个缺失父目录层级时，`registerConfig()` 使用 polling。轮询 watcher 保持相同的规范 root、有界 depth、精确目标过滤、初始扫描、串行 refresh 和静止 disposer。父目录已经存在的目标继续使用配置的 watcher 模式，包括默认原生 backend。

## Alternatives considered

**增加测试 timeout。** 否决：独立进程复现中，事件在既有十秒观察上限之后仍然缺失；继续等待不会重新生成事件。

**只在测试中使用 polling。** 否决：测试观察公开的缺失父目录注册保证。只改 fixture 会隐藏一个可能漏掉用户新建配置文件的运行时路径。

**为所有 HMR watcher 启用 polling。** 否决：模块 root 和已有父目录的配置文件拥有稳定的原生监听点，不需要持续文件系统工作。

## Consequences

注册后立即创建缺失目录及其配置文件，在并发 watcher 负载下也可以观察到。polling 成本只限于注册时父目录链缺失的精确配置监听，并在 disposer 达到静止时结束；所有已有父目录与模块监听保持原 backend。
