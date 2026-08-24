# Agent Note: preset 可见性过滤 roster 界面而不撤销组装

Status: implemented

[English](2026-08-24-configurable-preset-roster-visibility.md) | 中文

## 问题

preset 服务会发现已配置根目录提供的每一个目录，而所有浏览器界面都消费同一份 roster。希望只提供常用工作模式的部署因而没有受支持的选择：要么暴露全部随附及本地创作 preset，要么修改安装目录所拥有的文件。删除随附目录会被升级覆盖，只在一个客户端隐藏菜单项也不会改变其他 roster 消费方。

## 决策

[`dsh-agent-presets`](../../../../packages/preset/agent-presets/README.zh.md) 接受可选的 `visible` 列表。省略时发布全部已发现 preset；空列表不发布任何 preset；非空列表必须包含组装 `default`。每个 id 均按 preset 目录名规则校验，过滤保留发现顺序，不让该列表成为第二个排序来源。

```yaml
- id: agent-presets
  config:
    default: code
    visible:
      - code
      - human
```

可见性只作用于 `AgentPresets.list()`；该方法拥有经 `agentPreset.list` 及所有 roster 驱动浏览器界面暴露的行。`resolve()`、挂载、持久化会话恢复、读取、删除与创作冲突检查仍使用完整的已发现清单。隐藏的 preset 仍可通过显式 id 寻址，记录在该 preset 下的会话也能在可见性策略变化后继续恢复。

## 考虑过的替代方案

**删除或编辑随附 preset 目录。** 这些文件归部署所有，升级会替换它们。移除文件还会把展示偏好变成运行时输入缺失。

**过滤各个客户端组件或用 CSS 隐藏。** Host 仍会向其他客户端与 RPC 消费方发布这些条目，形成多份相互冲突的 roster。

**同时过滤显式解析与列表。** 这会把可见性变成授权规则，并阻止持久化会话恢复产生其历史的隐藏组装。

**让部署指向复制出的精选根目录。** 副本会偏离随附 preset 的修复与能力变化，并且仅为控制展示而复制整份组装。

## 后果

一项由 Host 拥有的策略即可控制全部现有 roster 界面，无需修改 Agent Loop、Session 格式、preset 文件或客户端渲染代码。可见性不是安全边界：可以显式选择 preset 的调用方保留原有权限；确需授权的部署必须在授予权限的具体操作上另设策略。

隐藏的用户 preset 仍保留在磁盘并继续占用其 id，但在部署重新发布它之前，管理分区无法打开或删除它；仍可直接管理文件。空列表会刻意移除默认设置行、新会话 chip 与管理分区，同时隐藏默认值仍用于组装会话。包测试固定配置校验、排序、隐藏解析与冲突保护；Web 快照固定被排除的模式不会到达浏览器菜单。
