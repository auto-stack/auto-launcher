---
plan_id: LAUNCHER-002
title: "独立 Windows 应用入口"
status: drafting
feature_name: "独立 Windows 应用入口"
author: [Codex]
created_at: 2026-10-04T00:00:00Z
updated_at: 2026-10-04T00:00:00Z
plan_revision: 1
current_step: 0
total_steps: 5
created: 2026-10-04
base_branch: v0.6-dev
base_commit: 00582cee1bc3a0b1b1e0de91703b6607ab1d6451
depends_on: ["LAUNCHER-001"]
supersedes_spec_components: []
new_spec_components: ["docs/specs/launcher/windows-host.md"]
touched_goals: ["auto-launcher/first-real-release"]
---

# LAUNCHER-002：独立 Windows 应用入口

## 0. 变更摘要

将导入demo的一项能力发展为可验证的真实产品模块。当前仅获授权编制设计/roadmap/实施计划，未执行代码开发。

## 1. 目标

覆盖需求：L01、L02、L04（定义见[产品设计](../design/01-product-design.md)）。依赖：[LAUNCHER-001](001-query-provider-core.md)

原始导入commit用于识别来源，不要求后续计划回退到该commit；实际开工从最新v0.6-dev及已验收前序计划起步，在记录中填入实际HEAD。T0是有限能力核查；若需跨仓runtime改动，提交单独设计/计划，当前任务保留未完成验收，不偷偷将真实能力换成stub。

## 2. 架构方案

本仓 Windows HostAdapter 和产品包装；缺少平台 API 时产出独立能力提案，不能改 AutoOS 桌面或手写生成 backend。

当前定位：`src/front/app.at`、`SPEC.md`、`pac.at`。新文件路径以设计表为准，开工核对实际布局后可小幅调整并记录。禁止修改源demo、SOURCE-IMPORT.json、source-sync基线、未同步的四大app及AutoOS主桌面协议。集成使用新增adapter；跨仓依赖单独登记。

## 3. 技术栈

AutoLang/AutoUI `.at`、既有Vue/VM宿主；后端纯.at。协议使用版本化数据，原生能力经adapter接入，不手改生成Rust。

## 4. 需求分析与背景调查

授权：用户要求在四个独立app仓准备需求/设计、首版roadmap和首批实施计划。允许本轮文档编制；产品方向讨论不是本计划代码实现已经批准/完成的证据。

版本证据：frontmatter base_commit与SOURCE-IMPORT.json；源码路径见§2。各app当前没有独立docs/specs模块规范；以代码为观察事实、产品设计为目标态，提案中列出待沉淀规范。AutoOS规约见其AGENTS.md，AutoLang知识规则见docs/specs/README.md。

## 5. 详细设计

### 规范增量

| delta_id | add/modify/retire | 目标 | before/after rule | 理由 | 验收 |
|---|---|---|---|---|---|
| SD-01 | add | docs/specs/launcher/windows-host.md | 本模块尚无app级current-state Spec → 记录实际实现的接口、恢复/错误及能力边界 | 供后续agent使用，设计提案不能冒充实现 | AC-01–AC-05 |

### 可执行任务

T-00先行；T-01→T-02→T-03→T-04顺序实施。T-00输出能力报告，T-01形成接口/fixture，T-02/03接入实现，T-04完成整体验证与文档。任务输出见每项说明；T-00/04核查AC-01–05全体，中间任务按对应行为覆盖。每项实测命令/证据写入§9，不把未创建的测试入口说成已有。

- [ ] T-00: T0列出热键/托盘/窗口激活/系统打开/快捷方式读取现有能力，并在普通用户会话做最小真实探针。
- [ ] T-01: 解析用户与系统开始菜单快捷方式，稳定ID、参数、工作目录分开；刷新/删除/损坏条目可处理。
- [ ] T-02: 实现单实例、常驻/退出、可配置召唤键、冲突提示；只在明确设置后启用开机启动。
- [ ] T-03: 实现实际应用启动/打开URL/文件与失败回报、窗口收起和返回原焦点。
- [ ] T-04: 建立安装/解包运行说明及测试路径；打包体不依赖AutoOS启动或固定D盘路径。

## 6. 测试设计

数据集：临时开始菜单fixture、Unicode路径、带参数目标、损坏lnk、热键冲突；tests/fixtures/windows/（新建）。

在计划worktree根以匹配当前基线的auto CLI分别启动`auto run`与`auto run -r vm`，端口17842（前端），使用隔离存储目录。依赖准备见[仓根README](../../README.md)，不得把用户真实数据作为首次迁移样本。

本仓现有测试不保证覆盖新增产品能力。先建立tests下针对本计划的可重复fixture和驱动，在报告记录确切启动/执行命令；不得编造尚不存在的npm test/cargo test入口。使用AutoUI verifier现有双端驱动能力时，配置实际端口与app路径。

正确性/恢复/协议测试与UI体验分开记录，至少覆盖一个成功与一个失败路径。现有AutoLang/AutoUI框架不改时不跑cargo全量；若另开框架计划按该仓AGENTS的作用域门禁。文档阶段不运行cargo t/docs_gen。

## 7. 验收标准（必须保留实际证据）

- [ ] AC-01: 未启动AutoOS时真实Windows入口能搜索和打开至少3个现有应用，包含带空格/中文路径。
- [ ] AC-02: 普通用户权限可用；快捷键冲突显示可配置入口；重复启动不产生两套常驻实例。
- [ ] AC-03: 损坏快捷方式和不存在目标报告错误且可继续搜索。
- [ ] AC-04: 无键盘焦点抢夺循环；IME候选不会误启动；热召唤延迟给出实测p50/p95和环境。
- [ ] AC-05: 当前能力缺失项不得标完成；若确实需要框架修改，单独计划联动并以真实API验收后才关闭该项。


## 8. 执行步骤与交接

Win32/平台资料以Microsoft官方文档为准；探针发现阻塞不允许用模拟热键替代真实全局入口。

新需求不得在执行中无限追加；发现必要遗漏先更新计划并讨论，不直接删验收项。知识系统/安装服务/AI等未交付依赖必须写明接口级与真实集成的差别。

## 9. 复审记录

- 实际起点HEAD/worktree/工具版本：未执行。
- T0能力与阻塞报告：未执行。
- 各AC项证据路径、命令及结果：未执行。
- 独立复审：未执行；重新对照代码检查AC项、遗漏/延后/workaround、格式/告警/调试输出，不信任已有勾选。
- 债务与风险：未登记；测试真实阻塞不得伪装通过。
- 沉淀：以frontmatter spec-impact候选登记实际实现组件，更新设计能力表与稳定规范；随后翻reviewed并归档。
- 合入目标：v0.6-dev；当前未实施，不合入master、不推进OS gitlink。

[整体roadmap](../roadmap-v0.6.md) · [agent执行说明](../README.md)

## 10. 待澄清事项

T-00需核实实际平台/运行时能力，负责者为本计划执行agent；输出具体API、可复现实验与独立阻塞提案。不存在先执行全局重构的隐含前置。核心验收变更须明确提出，不能用mock替换真实结果。

草案交接：stage=new；plan_revision=1；outcome=pass（可审查的草案，非代码验收）；next=work（选定计划并确认实施范围后）。当前均未实施。
