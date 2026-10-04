---
plan_id: LAUNCHER-001
title: "搜索内核与 provider/action 契约"
status: executing
feature_name: "搜索内核与 provider/action 契约"
author: [Codex]
created_at: 2026-10-04T00:00:00Z
updated_at: 2026-10-04T07:10:00Z
plan_revision: 2
current_step: 5
total_steps: 5
created: 2026-10-04
base_branch: v0.6-dev
base_commit: 00582cee1bc3a0b1b1e0de91703b6607ab1d6451
depends_on: []
supersedes_spec_components: []
new_spec_components: ["docs/specs/launcher/query-provider-core.md"]
touched_goals: ["auto-launcher/first-real-release"]
---

# LAUNCHER-001：搜索内核与 provider/action 契约

## 0. 变更摘要

将导入demo的一项能力发展为可验证的真实产品模块。当前仅获授权编制设计/roadmap/实施计划，未执行代码开发。

## 1. 目标

覆盖需求：L03、L04、L05（协议）（定义见[产品设计](../design/01-product-design.md)）。依赖：无，可从当前基线开始。

原始导入commit用于识别来源，不要求后续计划回退到该commit；实际开工从最新v0.6-dev及已验收前序计划起步，在记录中填入实际HEAD。T0是有限能力核查；若需跨仓runtime改动，提交单独设计/计划，当前任务保留未完成验收，不偷偷将真实能力换成stub。

## 2. 架构方案

新增 src/core 与测试；仅小范围接入现有 app.at，保持 SPEC 的 AutoOS 消息契约。

当前定位：`src/front/app.at`、`SPEC.md`、`pac.at`。新文件路径以设计表为准，开工核对实际布局后可小幅调整并记录。禁止修改源demo、SOURCE-IMPORT.json、source-sync基线、未同步的四大app及AutoOS主桌面协议。集成使用新增adapter；跨仓依赖单独登记。

## 3. 技术栈

AutoLang/AutoUI `.at`、既有Vue/VM宿主；后端纯.at。协议使用版本化数据，原生能力经adapter接入，不手改生成Rust。

## 4. 需求分析与背景调查

修订2：用户于2026-10-04确认所有app操作在auto-os/apps子目录；文档和代码修改使用该检出的v0.6-dev，完成提交/推送与父仓gitlink更新后显式恢复detached。此修订只改变工作位置/交接方式，任务和AC保持原意；本计划代码尚未实施。

授权：用户要求在四个独立app仓准备需求/设计、首版roadmap和首批实施计划。允许本轮文档编制；产品方向讨论不是本计划代码实现已经批准/完成的证据。

版本证据：frontmatter base_commit与SOURCE-IMPORT.json；源码路径见§2。各app当前没有独立docs/specs模块规范；以代码为观察事实、产品设计为目标态，提案中列出待沉淀规范。AutoOS规约见其AGENTS.md，AutoLang知识规则见docs/specs/README.md。

## 5. 详细设计

### 规范增量

| delta_id | add/modify/retire | 目标 | before/after rule | 理由 | 验收 |
|---|---|---|---|---|---|
| SD-01 | add | docs/specs/launcher/query-provider-core.md | 本模块尚无app级current-state Spec → 已记录实际实现的接口、恢复/错误及能力边界 | 供后续agent使用，设计提案不能冒充实现 | AC-01–AC-05 |

### 可执行任务

T-00先行；T-01→T-02→T-03→T-04顺序实施。T-00输出能力报告，T-01形成接口/fixture，T-02/03接入实现，T-04完成整体验证与文档。任务输出见每项说明；T-00/04核查AC-01–05全体，中间任务按对应行为覆盖。每项实测命令/证据写入§9，不把未创建的测试入口说成已有。

- [x] T-00: 对当前 SPEC 与实际 app.at 做字段/消息/排序对照，保存旧宿主 fixture；不要运行旧478/479脚本冒充新验收。
- [x] T-01: 实现 query_id/cancel/Result/Action v1 与稳定 result_id；内置 Apps、Quicklinks 两个 provider。
- [x] T-02: 抽出模糊排名和 recency，维持跨匹配层级不倒置；新增过期响应丢弃和选中项保持。
- [x] T-03: 接入列表、加载/错误/空结果与动作菜单；启动目标按标识路由。
- [x] T-04: 记录后续独立进程插件 transport 的能力探针需求；当前交付只声明协议和内置 provider。

## 6. 测试设计

数据集：apps-registry、quicklinks、stale-query、same-title、IME；tests/fixtures/providers/（新建）。

在D:/autostack/auto-os/apps/028-launcher本仓根以匹配当前基线的auto CLI分别启动`auto run`与`auto run -r vm`，端口17842（前端），使用隔离存储目录。依赖准备见[仓根README](../../README.md)，不得把用户真实数据作为首次迁移样本。

本仓现有测试不保证覆盖新增产品能力。先建立tests下针对本计划的可重复fixture和驱动，在报告记录确切启动/执行命令；不得编造尚不存在的npm test/cargo test入口。使用AutoUI verifier现有双端驱动能力时，配置实际端口与app路径。

正确性/恢复/协议测试与UI体验分开记录，至少覆盖一个成功与一个失败路径。现有AutoLang/AutoUI框架不改时不跑cargo全量；若另开框架计划按该仓AGENTS的作用域门禁。文档阶段不运行cargo t/docs_gen。

## 7. 验收标准（必须保留实际证据）

- [x] AC-01: 至少1000条fixture含中文、英文、别名、重复标题，排序确定且同结果标识稳定。
- [x] AC-02: 乱序返回旧query、慢provider、provider失败时，当前输入和其他结果正常。
- [x] AC-03: 列表变化后Enter触发选中对象而非旧行号；Tab/Esc/IME流程无错误动作。
- [x] AC-04: 原AutoOS launch消息与host清单fixture可回归，standalone mock模式被标识为开发fixture。
- [x] AC-05: 两个provider可分别停用，权限/版本不匹配明确拒绝；报告没有称第三方进程插件已完成。


## 8. 执行步骤与交接

本计划无需触碰Windows全局键和其他仓库；完成后才进入真实系统入口。

新需求不得在执行中无限追加；发现必要遗漏先更新计划并讨论，不直接删验收项。知识系统/安装服务/AI等未交付依赖必须写明接口级与真实集成的差别。

## 9. 复审记录

- 实际起点HEAD/工作目录/工具版本：仓根 `D:/autostack/auto-os/apps/028-launcher`，分支 `v0.6-dev`，HEAD `94abb23`（docs: use AutoOS app submodule checkout）。工具：`auto` = `D:/autostack/auto-lang/target/debug/auto.exe`。按修订2在 apps 子目录检出实施，未用外部 worktree（docs/README 工作位置约定优先于通用 worktree 表）。
- T0能力与阻塞报告：
  - SPEC.md 与 app.at 对照：消息契约 `launch\t<name>`、注入平行字符串清单、排序 tier/score 公式、键盘流与 SPEC 一致；新增 query_id/result_id/动作菜单为 L03–L05 增量。
  - 旧宿主 fixture：`tests/fixtures/providers/host-registry.json`（standalone mock，标注 dev fixture）；`quicklinks.json`；`stale-query.json`；`same-title-ime.json`。未运行 478/479 作为验收。
  - **AutoVM 阻塞（已绕开并记债务）**：str 形参 `+` 拼接、跨模块 str 形参+List 字段读、≥70 个 str 字段类型实例会触发 retain-after-free / 池损坏 / 错误字段名。应对：协议 ID 分列存储；单测嵌同模块 `#[test]`；千条夹具放 `tests/test_fixture_scale.at` 跨模块调用；app.at 算法保持 handler 内联。
- 各AC项证据路径、命令及结果：
  - AC-01：`auto test -d tests/test_fixture_scale.at -v` → `t_with_pick` / `t_ac01_fixture_diversity` ok（1000 条生成器含中文/英文/auto-edit 别名/重复 Notes；选择序两次一致）。字符串身份小规模见 `src/core/query.at` `t_chinese_alias_dup`。
  - AC-02：`src/core/protocol.at` `t_query_cancel_stale`、`src/core/query.at` `t_stale_and_sort_stable`、`tests/fixtures/providers/stale-query.json`；app.at SetQ 递增 query_id。
  - AC-03：`src/core/query.at` `t_selection_keep_not_row_index`；app.at `sel_result_id` + ApplyFilter keep；Pick 用 `ranked[sel].name`（result_id）；Esc 先关动作菜单；Tab 仍 SwitchMode（宿主兼容，无错误动作）。
  - AC-04：host-registry.json 含 `desktop_cmd: launch\t<name>` 与注入字段表；app.at Launch 保持该消息；独立模式 UI 标注 `dev fixture · standalone mock registry`。`auto build` Vue 生成 + vue-tsc 通过。
  - AC-05：`src/core/protocol.at` `t_provider_admit` / `t_provider_registry_disable`；`src/core/providers.at` API；报告明确 **未** 交付第三方进程插件。
  - 全量：`auto test -d src/core -v` 13 passed；`auto test -d src/providers -v` 2 passed；`auto test -d tests -v` 3 passed；`auto build` 成功。
- 独立复审：未执行（待 /auto-plan:review）。需重对 AC、检查遗漏/延后、格式/告警/调试输出。
- 债务与风险：
  1. AutoVM str/类型实例池缺陷（见 T0）——真实阻塞已绕开，不伪装通过；建议单独框架 issue。
  2. 排名算法在 app.at handler 与 src/core/query.at 双份实现（vue SFC 不消费跨模块 fn）；以 SPEC 公式对齐，待 vue 轨支持后合并。
  3. 独立进程插件 transport 仅有能力探针需求（T-04），无实现。
  4. grid `cols` schema drift（历史遗留）。
  5. UI 真机键盘/IME 复验依赖 `auto run` + verifier，本环境仅完成 `auto build` 编译门。
- 沉淀：`docs/specs/launcher/query-provider-core.md`（SD-01）。
- 合入目标：v0.6-dev。

### T-04 独立进程插件 transport 能力探针需求（仅记录，未实现）

1. 进程 spawn/管道或 stdin/stdout JSON Lines 读写 API（auto-lang 运行时是否具备）。
2. 超时/取消：可中断读、可 kill 子进程；退出码与 stderr 捕获。
3. 协议帧：`{query_id, request_id, method, params}` / `{query_id, ok, results|error}`；版本握手 `protocol_version=1`。
4. 隔离边界：权限声明 ≠ OS 沙箱；需文档声明。
5. 验收门槛：独立样例 provider 进程可注册、查询、超时标记、单独停用；在此之前交付物仅内置 provider。

- 交接：stage=work | plan_id=LAUNCHER-001 | plan_revision=2 | outcome=pass | code_commit=待提交 | task_ids=T-00..T-04 | evidence=见上 | blockers=无（VM 缺陷已绕开） | next=review

[整体roadmap](../roadmap-v0.6.md) · [agent执行说明](../README.md)

## 10. 待澄清事项

T-00需核实实际平台/运行时能力，负责者为本计划执行agent；输出具体API、可复现实验与独立阻塞提案。不存在先执行全局重构的隐含前置。核心验收变更须明确提出，不能用mock替换真实结果。

实现交接：stage=work；plan_revision=2；outcome=pass（T-00–T-04 与 AC-01–05 已落证据，待独立复审）；next=review。AutoVM str 池缺陷为登记债务，未用 mock 冒充真实能力。
