# auto-launcher

通用启动器，使用 AutoLang / AutoUI 开发的独立应用。

本仓是首批产品源码基线；当前能力以导入版本为准，仓库描述中的产品方向不表示全部已实现。

## 运行

安装对应版本的 `auto` CLI 后，从本仓根执行：

```sh
auto run
auto run -r vm
```

前端端口：`17842`。

源码包含原生桌面制品声明；clone 后不附带 exe，使用 `auto build -r rust` 生成后再使用原生制品路径。

## 来源与组合

来源提交、路径与文件 hash 见 `SOURCE-IMPORT.json`。首次导入提交保留在 `source-sync` 分支；完整 v0.5 恢复后从该基线导入差异，再与产品开发线合并。

AutoOS 通过 [`apps/028-launcher`](https://github.com/auto-stack/auto-os/tree/v0.6-dev/apps/028-launcher) submodule 固定本仓版本；教学 Demo 保留在来源仓。

已有测试随源导入；端口与平台相关测试需要按本仓配置准备运行环境。安装/启动与双端完整功能验收是不同检查项。

## 主题（auto-os/PLAN-057 接入）

本产品已接入 AutoUI **官方主题包**正式消费面（2026-11-04，PLAN-057 T-02）：

- `vendor/themes` 为 UI 管理渠道发布的固定版本快照（`themes` 0.2.0，内容
  digest `9fa07742dc68aa5377ae06cb2d966386002063f184c515b6c5dddf8a6bef838e`），
  经 `pac.at` `dep themes` 消费；快照不可二次编辑、非第二权威源。
- 主合同（宿主策略/通知/持久化/拒绝语义）在 **auto-os/PLAN-057**
  （`auto-os` 仓 `docs/plans/057-desktop-utilities-theme-adoption.md`
  与其 canonical specs）：本产品 pac 无显式 `theme` 键 = **follow 宿主**
  （宿主策略完整快照 > 本 `design` 默认 > legacy 回退）；
  `src/front/app.at` `design { theme: "Auto", mode: "light" }` 为独立/无宿主
  环境的静态浅色默认腿（本产品原无 dark_mode 位/明暗切换，056 零遗留先例
  todo/chat 同型；`use themes.themes: Auto` 注册收集链——C-11 合同）。
- 视图全部为语义 token 类（bg-background/bg-card/text-foreground 等），
  族内明暗由 token 切换承接；搜索 UI `mode`（palette|grid）为形态状态，
  与颜色主题无关。

## 产品规划（2026-10-04）

[需求与设计、首版 roadmap、业界调研及前三个实施计划](docs/README.md)。

**LAUNCHER-001**（搜索内核与 provider/action 契约）Phase 2 / 修订 3 实现已落代码：
层级优先排序、`(provider_id, result_id)` 身份、查询接收门、双 provider 失败隔离、
动作菜单显式 kind。当前态见 [Spec](docs/specs/launcher/query-provider-core.md)；
验收证据见 [计划 001](docs/plans/001-query-provider-core.md)。计划 002/003 尚未开始。
