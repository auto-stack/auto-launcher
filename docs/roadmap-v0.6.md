# auto-launcher：第一版 roadmap

状态：planning-baseline；日期：2026-10-04。应用产品版本拟用 0.1.x，需发行时确定；现有 pac.at 的导入版本号不自动代表该产品已经完成。AutoOS v0.6 目标窗口为2026年12月底，应用节奏按验收门槛调整。

## 交付顺序

| 里程碑 | 成果 | 范围 | 实施计划 | 现状 |
|---|---|---|---|---|
| M1 | 统一搜索内核 | 真实结果标识、provider/action 协议、取消与旧宿主回归 | LAUNCHER-001 | 未开始 |
| M2 | 独立 Windows 产品 | 真实应用发现、全局入口、托盘/单实例、启动与错误恢复 | LAUNCHER-002 | 未开始 |
| M3 | 文件与插件入口 | 目录索引/Everything、独立插件、Notes 和 AI 可选入口 | LAUNCHER-003 | 未开始 |

M0先冻结 source-sync 与来源清单，所有app操作在auto-os/apps/028-launcher进行，修改时切v0.6-dev，完成提交/父仓指针更新后恢复detached。当前可先做计划01的接口、fixture和独立新模块；恢复主力机后再审查v0.5来源增量并融合旧入口。计划02/03依赖前序的真实证据，不能仅凭文档或勾选开始依赖集成。

## 时间与容量

建议M1用1–2周完成能力探针和最小真实数据闭环，M2用1–2周完成主体体验，M3按平台/格式复杂度预留2–3周，之后1–2周集中验证与修复。这是容量估算而非AI开发速度承诺；四个应用可由独立agent分工，但同仓计划顺序执行，不能把这份估算叠加成同一人三个月的硬承诺。

先保证首个应用M1稳定，再用同样模式启动下一个。能力探针不通过时减少范围或登记明确的跨仓前置计划；已承诺的核心能力未经讨论不能悄悄改为mock验收。

## 可延后与远期

Linux/AutoOS 模式按宿主能力验证；auto-man 待系统任务接口稳定后接入。完整插件市场、跨平台全局入口、复杂 agent workspace 为 v0.7+。

首版依赖当前AutoUI/AutoLang基线；可移植数据协议不依赖新的HIR/AC或完整知识操作系统。远期接统一auto-man的应用/资产/知识包管理，当前不要在应用内再实现一套包安装服务。

## 发布门槛

实际个人任务闭环、真实数据重启恢复、失败/取消行为、可迁出格式、Vue/VM能力矩阵、Windows/Linux实际可运行范围及Harmony demo边界必须有证据。缺少平台没有跑过不能写“全支持”。仅文档阶段不运行cargo测试；实施后的测试依照代码作用域进行。

## 计划入口

1. [LAUNCHER-001：搜索内核与 provider/action 契约](plans/001-query-provider-core.md)
2. [LAUNCHER-002：独立 Windows 应用入口](plans/002-windows-host.md)
3. [LAUNCHER-003：文件检索、外部插件与 Notes 捕获入口](plans/003-files-plugins-capture.md)

[完整设计](design/01-product-design.md) · [调研](research/20261004-benchmarks.md) · [agent操作说明](README.md)
