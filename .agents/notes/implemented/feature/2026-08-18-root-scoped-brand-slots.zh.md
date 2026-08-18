# Agent Note: 供 client 皮肤使用的根作用域品牌 slot

Status: implemented

[English](2026-08-18-root-scoped-brand-slots.md) | 中文

## 问题

Client 皮肤需要同时替换侧边栏的字标、收起标记，以及新会话 Hero 的标记、标语与徽章。颜色和间距 token 无法替换这些语义内容；接管周围的侧边栏或会话壳则会一并取得与品牌无关的交互、布局和生命周期行为。这个自定义点因此只能替换品牌视觉，并且必须在皮肤卸载后恢复产品标识。

## 决策

**每个宿主声明一个根作用域 single slot。** `@deepseek-ai/dsh-client-ui-sidebar` 声明 `sidebar.brand`，由稳定按钮传入 `variant: 'wordmark' | 'mark'`。`@deepseek-ai/dsh-client-ui-conversation` 声明 `conversation.hero.brand`；它的 owner share 不提供功能专属业务数据。slot 注册项持有渲染出的品牌标识；侧边栏宿主继续持有按钮与无障碍标签，会话宿主则继续持有品牌位置、外壳几何与常驻编辑器树。

**内置品牌以 priority `0` 保持为存活注册项。** 皮肤以不同且数值更低的 priority（例如 `-100`）注册到同一个 slot。single slot 选择数值最低的存活 priority，因此皮肤会遮蔽内置条目，而不删除或隐藏它。以相同 priority 进行第二次注册仍然会在装载时失败。

**dispose 通过 slot 生命周期恢复默认品牌。** dispose（资源释放）皮肤注册只会移除它的低 priority 注册项。仍然存活的 priority-`0` 条目会在同一棵宿主树中重新可见，无须查询已渲染节点、修改其他组件的 DOM，也无须重挂侧边栏、Hero 外壳或编辑器。

## 曾考虑的替代方案

**只使用主题 token 与 CSS。** 不采用：token 可以重设既有品牌的样式，但无法替换其文字、SVG 结构或无障碍内容。

**让皮肤查询并替换 DOM。** 不采用：selector 和渲染结构不是插件约定，DOM 修改会与 React reconciliation 发生竞态，清理时也无法可靠重建组件持有的状态。

**替换整个侧边栏或会话壳。** 不采用：品牌皮肤不应取得 New Session 行为、折叠控件、Workspace 选择、编辑器连续性或无关布局的所有权。

**让品牌片段使用可叠加的 list slot。** 不采用：每个界面只应有一个当选品牌；渲染多个独立条目会重复或交错标记与文案，而不是选出一套完整品牌。

## 后果

Client 皮肤无须 fork 两个包中的任意一个，即可替换侧边栏的两种形态与完整的新会话 Hero 品牌。两个 slot 都与会话无关，位于根作用域。侧边栏注册项必须渲染两种请求形态。`HeroBrandOwnerProps` 不提供功能专属业务数据，Hero 注册项仍接收根作用域的框架钩子。数值更低的 priority 是明确的部署选择；移除皮肤注册会确定性地恢复内置品牌，同时保持宿主交互与组件树不变。
