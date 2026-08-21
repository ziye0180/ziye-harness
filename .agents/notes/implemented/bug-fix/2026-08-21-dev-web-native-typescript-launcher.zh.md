# Agent Note: Web watcher 的原生 TypeScript 启动器

Status: implemented

[English](2026-08-21-dev-web-native-typescript-launcher.md) | 中文

## 问题

`pnpm run dev:web` 通过 `tsx` 可执行文件启动 `scripts/dev-web.ts`。在受支持的 Node 22 和 Node 24 环境中，该可执行文件使用的嵌套 ESM loader 可能在脚本输出 watcher 就绪标志前返回空的加载结果。HMR 浏览器测试因此在进程启动阶段失败，而同一个脚本由 Node 直接运行时能够启动全部 watcher 阶段。

## 决策

`dev:web` 脚本改为调用 `node scripts/dev-web.ts --poll`。仓库的 engine 范围提供原生的可擦除 TypeScript 执行能力，`scripts/dev-web.ts` 保持在该语法子集内。脚本的用法诊断同步展示相同的 Node 直接启动命令。

现有 HMR 浏览器场景继续作为可执行约定：它启动 `pnpm run dev:web`、等待 watcher 就绪、修改真实 Client plugin 源码，并在不刷新页面的情况下观察更新后的 DOM。

## 验证

聚焦的 HMR 浏览器测试能够看到 watcher 就绪标志、重新构建被编辑的 Client bundle，并在本地受支持的 Node 运行时通过。完整的 official profile Web replay 也在 Node 直接启动 watcher 的情况下通过。

## 考虑过的替代方案

**保留 `tsx` 可执行文件并重试进程启动。** 重复同一条 loader 链只会保留确定性的启动失败，还可能用重试掩盖真实的 watcher 中断。

**把 watcher 复制成 JavaScript。** 第二份源码会重复构建阶段编排，并让开发命令与带类型的实现发生漂移。

**固定或修补传递 loader。** 在受支持的 Node 范围内，watcher 不需要自定义 loader；为此维护 loader 专属依赖或补丁只会增加维护面，不会增加产品能力。

## 后果

开发 watcher 依赖 Node 原生的可擦除 TypeScript 支持，该能力已由仓库的 engine 范围保证。不受支持的 Node 版本会在进程启动时失败，不会进入只启动部分 watcher 的状态。生产环境的 `dsh` 源码启动器继续使用现有的 `tsx` ESM hook；本决策只适用于独立的开发 watcher。
