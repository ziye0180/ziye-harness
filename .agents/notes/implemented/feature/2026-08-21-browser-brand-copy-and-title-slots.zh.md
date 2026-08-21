# Agent Note: 浏览器品牌文案与文档标题 slot

Status: implemented

[English](2026-08-21-browser-brand-copy-and-title-slots.md) | 中文

## 问题

浏览器已经为侧边栏身份和 Hero 标记提供官方 slot，但 Hero 标题文案、Hero 徽章文案与运行时文档标题仍属于 owner 内部。树外品牌只能通过隐藏 owner DOM sibling 或改写初始 HTML 标题来替换这些值，因此即使一个包满足 slot 约定，它仍依赖私有标记，并会在选中会话变化后丢失自定义标题。

## 决策

`ui-conversation` 声明根作用域 single slot `conversation.hero.brand.headline` 和 `conversation.hero.brand.badge`。壳层保留稳定且已定义样式的包装元素，并传递空 owner share；没有 occupant 时，每个 slot 都回退到本地化产品文案。

`ui-layout` 声明根作用域 single slot `shell.document-title`。AppFrame 将选中会话的持久 title 作为 owner 数据传入，并以构建时选定的产品标题投影器作为 fallback。`ui-renderer` 继续持有唯一的上下文级 `renderSlot('root')` 调用，不再持有标题投影。

品牌包通过 `slots.inject()` 注册到这些声明。occupant 在自身生命周期内替换文案或标题行为，禁止隐藏、克隆或查询 owner DOM。初始 HTML 标题仍是构建产物；React 启动后，由已挂载的根 frame 持有权威状态。

## 验证

组件测试覆盖本地化 fallback、自定义 Hero 文案、选中会话标题投影、occupant 替换与声明 dispose。生成的客户端目录记录每个 key、kind、scope 与 owner 字段。Web 回放与真实浏览器证明默认产品保持不变，同时树外 occupant 无需 DOM selector 即可替换这三个值。

## 考虑过的替代方案

**只保留构建时标题。** 该方案无法表示运行时安装的品牌包，而且每次选中会话标题变化时都会重置自定义文案。

**替换整个 Hero。** 整体替换会重复实现壳层已经持有的 Workspace、布局、本地化、可访问性与响应式行为。

**使用 CSS sibling selector 或 DOM mutation。** 这些方案依赖私有标记，无法由 slot 目录验证，并且会在公共扩展点保持兼容时独立损坏。

## 后果

品牌包可以通过有类型且受生命周期管理的注册替换 Hero 文案和浏览器标题，默认 DeepSeek UI 的可见文案保持完全一致。客户端 slot 目录增加三个根 slot，ui-layout 成为标题 fallback 投影的 owner。自定义品牌仍需通过 Host webserver 扩展点提供 favicon 与 manifest，因为这些资产位于 React slot 树之外。
