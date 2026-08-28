# Agent Note: 仓库 literal-tail glob 避免进入文件符号链接

Status: implemented

[English](2026-08-28-literal-tail-repository-globs.md) | 中文

## 问题

Node 的 `globSync('**/<literal>')` 可能把 basename 为 `<literal>` 的匹配文件符号链接当成遍历候选，随后尝试 `lstat('<link>/<literal>')` 并抛出 `ENOTDIR`，导致仓库检查在读取任何匹配文件前停止。仓库检查会有意接纳符号链接的指令与期望输出，`uniqueRepoFiles()` 会解析它们的规范目标以去重。

## 决定

`uniqueRepoFiles()` 在调用 `globSync()` 前为每个仓库相对 pattern 生成执行方案。包含 `**` 路径段且以字面文件名结尾的 pattern，会将最后一段替换为 `*` 后扩展，再用 `matchesGlob()` 按原 pattern 精确过滤每个已规范化的结果。最后一段含通配符的 pattern 仍使用原扩展。

排除判定在精确 pattern 过滤后执行，然后按规范 `realpath` 去重，为每个目标保留第一个作者路径。扩展、匹配与规范化错误继续向上抛出；该 helper 不捕获 `ENOTDIR`，也不在未知文件系统失败后重试。

## 考虑过的替代方案

**放宽 `verify-md-wrap` pattern。** 否决：调用方的通配符会改变该检查接纳的文件名，并使其他 `uniqueRepoFiles()` 消费方继续暴露在同一 literal-tail 遍历下。

**捕获 `ENOTDIR` 后重试。** 否决：同一错误也可能表示真实的无效仓库路径。确定性扩展方案可避免不受支持的遍历，且不会把无关文件系统失败转换为 fallback 行为。

**替换 Node 的 glob 实现。** 否决：仓库 helper 只需一个窄范围适配，不需要新增依赖和第二种 glob 方言。

## 影响

literal-tail glob 会先枚举容纳目录的直接条目，再进行精确过滤，因此该路径比 Node 直接扩展执行更多目录条目工作。它保留原匹配集、调用方的排除谓词、首次出现顺序与规范符号链接去重。回归 fixture 包含一个同 basename 文件符号链接和一个无关同级文件，以证明符号链接被接纳且结果集没有放宽。
