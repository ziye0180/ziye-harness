# Agent Note: Lucide glyph 位于稳定的 DSH 图标导出之后

Status: implemented

[English](2026-08-24-lucide-icon-compatibility-layer.md) | 中文

## 问题

Web UI 通过 `dsh-client-ui-primitives` 消费 70 个 `Icon*` 组件，每个组件都以源自 Figma 的内联 SVG 路径实现。统一导出让消费方保持一致，但扩展集合仍需再取得一条本地路径，且这些图标不共享一个持续维护的视觉库。skin 无法替换这些路径：产品组件静态导入 primitive 导出，而 Client slot 目录没有 glyph 级替换项。

## 决策

`dsh-client-ui-primitives` 保留全部既有 `Icon*` 导出名、默认尺寸与 `{ size, className }` props，同时以精确版本 `lucide-react` 依赖的静态具名导入实现 69 个语义 glyph。适配器把尺寸与 class 直接交给 Lucide，保留 `currentColor`，并且只为旧名称明确表示实心选择态或传输状态的导出提供填充。

`IconTreeCorner8x10` 继续使用产品自有 SVG。它是采用非方形布局几何的 8×10 会话树连接器，而非语义图标。`FishLogo` 与 `BrandWordmark` 是独立的产品品牌导出，保持不变。

Lucide 作为 `dsh-client-ui-primitives` 的私有运行时依赖；React 仍是应用共享运行时。实现逐个按名称导入选中的 glyph，绝不动态索引命名空间，使 Client 构建可以 tree-shake Lucide 目录中的其余部分。源码映射表是选择语义对应物的唯一位置；消费方继续导入 DSH 名称，而不是库名称。

## 考虑过的替代方案

**增加由 skin 控制的运行时图标 Provider。** 部署只有一份长期使用的 skin，目前不需要在运行中切换图标家族。Provider 会引入根包装层所有权、响应式生命周期、fallback 策略与另一项公开扩展约定，却没有第二个活跃消费方。

**只在 skin 自有组件中使用 Lucide。** 这种方式完全树外，但大多数可见控件位于静态导入 DSH 图标的上游产品组件中，会让同一界面同时出现两套图标语言。

**把每个消费方 import 都替换为 `lucide-react`。** 这会把外部库扩散到各个产品包、移除稳定的 DSH 命名层，并让日后一次映射修正触及所有消费方，而非单一 owner。

**从完整 Lucide 命名空间动态解析 glyph。** 动态索引会破坏静态 tree-shaking，并可能为固定的 69 个图标把整份库目录交付到浏览器。

## 后果

应用采用 Lucide 的圆角描边几何，而不改变任何消费方 API。视觉快照与浏览器审查负责固定这次有意的形状变化；组件测试固定全部 70 个导出、69 个 Lucide 根节点、颜色继承、尺寸透传，以及精确连接器例外。

该依赖用持续维护的图标来源替换数百行自有路径，并把采用 ISC 许可证的 Lucide 运行时加入浏览器依赖图与第三方声明。在同一 checkout 的 Web 构建中，静态选择把主 index chunk 从 399.36 kB（gzip 135.43 kB）降到 326.20 kB（gzip 106.85 kB），vendor chunk 保持不变。产品专属品牌几何继续由本地拥有。未来若确实需要在运行时选择图标家族，应另行论证根层组合约定，而不是修改这份固定兼容层。
