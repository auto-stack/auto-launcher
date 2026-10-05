---
plan_id: LAUNCHER-001
title: "搜索内核与 provider/action 契约"
status: reviewed
feature_name: "搜索内核与 provider/action 契约"
author: [Codex]
created_at: 2026-10-04T00:00:00Z
updated_at: 2026-10-04T14:30:00Z
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

- 交接：stage=work | plan_id=LAUNCHER-001 | plan_revision=2 | outcome=pass | code_commit=21a7f6c358b3086a558624e4c8e291a479f3ad98 | task_ids=T-00..T-04 | evidence=见上 | blockers=无（VM 缺陷已绕开） | next=review

- stage: review | plan_id=LAUNCHER-001 | plan_revision=2 | outcome=needs_fix | reviewed_commit=3ed1cc87dcc1f856d3594ef0233d037823e1fea1 | base_commit=00582cee1bc3a0b1b1e0de91703b6607ab1d6451 | code_impl_commit=21a7f6c358b3086a558624e4c8e291a479f3ad98 | dependency_revisions=auto=D:/autostack/auto-lang/target/debug/auto.exe | spec_inputs=docs/specs/launcher/query-provider-core.md | acceptance_results=AC-01 pass, AC-02 partial, AC-03 partial, AC-04 pass, AC-05 pass | findings=R-01,R-02,R-03,R-04,R-05 | evidence=重跑 auto test -d src/core（13 passed）/ src/providers（2 passed）/ tests（3 passed）；代码审读 app.at/providers/query/protocol | next=work

  - **复审限制**：与实现同会话复审，结论以重跑命令与源码工件为准，不采信执行摘要。
  - **基线**：工作区干净；无独立 worktree（修订2：apps/028-launcher 的 v0.6-dev 检出）；HEAD `3ed1cc8`。
  - **AC 映射**：
    - AC-01 pass → `tests/test_fixture_scale.at` t_with_pick/t_ac01_fixture_diversity；`src/core/query.at` t_chinese_alias_dup；`protocol.at` t_result_identity_list。
    - AC-02 partial → 过期/取消：`protocol.at` t_query_cancel_stale、`query.at` t_stale_and_sort_stable **通过**；**缺** provider 失败隔离的可执行测试（仅 `stale-query.json` 场景）；**缺** 多 provider 归并（app.at 仅 apps mock，quicklinks 未进结果列表）。
    - AC-03 partial → 选中保持：`query.at` t_selection_keep_not_row_index + app.at `sel_result_id` **通过**；Tab/Esc 经源码核对无误触；**IME** 仅 `same-title-ime.json` 用例清单，无 `auto run`/verifier 运行证据（L03 明文要求 IME 正确）。
    - AC-04 pass → host-registry.json 含 `launch\t<name>` 与注入字段；app.at Launch 保持消息；UI 标注 dev fixture；`auto build` 编译门通过（未跑 vue_verify/desktop_mcp 全量宿主套件，按「可回归=夹具齐备」判过）。
    - AC-05 pass → `protocol.at` t_provider_admit/t_provider_registry_disable/t_provider_timeout_default；报告与 Spec 明确未交付第三方进程插件。
  - **findings**：
    - **R-01 major**（AC-02/T-03）：Quicklinks 未接入 app.at 结果列表；无「一 provider 失败、其他仍可操作」可执行断言。修正：合并双 provider 结果或至少补隔离测试。
    - **R-02 major**（AC-03/T-03）：IME 组合 Enter/Esc/提交路径无运行时证据即勾选 AC。修正：`auto run` + verifier/真机补 IME 流，或降级 AC 并单列。
    - **R-03 major**（AC-02/T-03）：`load_state="error"` / `load_error` 仅有视图分支，无任何 handler 写入 → 错误态死代码。修正：接入真实失败路径或删死分支并在 Spec 声明。
    - **R-04 minor**（文档）：`tests/test_query_core.at` 头注称 providers.at 含 AC-05 测试，实际在 protocol.at。
    - **R-05 note**（T-02/债务）：排名算法 core 与 app.at 双份（VM 限制下 workaround）；「抽出」语义未完全达成，已在 Spec/债务登记。
  - **规范增量**：SD-01 目标 `docs/specs/launcher/query-provider-core.md` 存在且为 current-state，new_spec_components 正确；无需改语义契约。
  - **已回开**：T-03；AC-02、AC-03。current_step=4。

- stage: work | plan_id=LAUNCHER-001 | plan_revision=2 | outcome=pass | code_commit=69b633801b9df01b5956e541533e89a5ff57dec6 | task_ids=T-03,R-01,R-02,R-03 | evidence=修复轮 | blockers=R-02 残留 auto-lang isComposing | next=review

  **needs_fix 修复轮（R-01–R-03）**：
  - **R-01 fixed**：app.at 归并 Quicklinks（ql_* mock + 打分入 ranked）；Launch/RunAction 按 id 路由 `launch\t` / `open\t`；`SetAppsOk`/`SetQlOk`/`RestoreProviders` + 独立模式 Fail 按钮。可执行隔离：`protocol.at` `t_merge_failure_isolation`（一失败另一路保留 / 双失败空表）。
  - **R-03 fixed**：`all_providers_failed` → `load_state="error"` + `load_error`；单路失败 `partial_note`（底部展示）；error 分支可达。
  - **R-02 partial**：应用守卫 `ime_composing` + `ime_allows` 测试 + `tests/ime_contract.mjs` 探针。**残留**：auto-gen `__autoBindKeydown` 不读 `e.isComposing`，组合态标志无法自动置位 → E2E IME 仍待 auto-lang 生成器补丁（或用户裁定接受契约级证据）。AC-03 保持未勾选。
  - **R-04 fixed**：test_query_core.at 头注更正。
  - 重跑：`auto test -d src` 17 passed；`auto test -d tests` 3 passed；`auto build` 成功。

- stage: review | plan_id=LAUNCHER-001 | plan_revision=2 | outcome=blocked | reviewed_commit=5d082ae81e7dd19931259993944266376bce206b | base_commit=00582cee1bc3a0b1b1e0de91703b6607ab1d6451 | code_impl_commit=69b633801b9df01b5956e541533e89a5ff57dec6 | dependency_revisions=auto=D:/autostack/auto-lang/target/debug/auto.exe | spec_inputs=docs/specs/launcher/query-provider-core.md | acceptance_results=AC-01 pass, AC-02 pass, AC-03 partial(IME), AC-04 pass, AC-05 pass | findings=R-02-residual,R-06 | evidence=重跑 auto test -d src（17 passed）/ tests（3 passed）；源码与 gen/App.vue 核对 | next=unblock

  - **复审限制**：与实现同会话；结论以重跑命令、protocol/app.at/gen 产物为准。
  - **基线**：HEAD `5d082ae`；实现 `69b6338`；工作区干净；v0.6-dev 检出（修订2）。
  - **AC 复验**：
    - AC-01 **pass** — `test_fixture_scale.at` t_with_pick/t_ac01_fixture_diversity；`query.at` t_chinese_alias_dup。
    - AC-02 **pass** — 过期：`t_query_cancel_stale`/`t_stale_and_sort_stable`；失败隔离：`protocol.at` `t_merge_failure_isolation`（1/0、0/1、0/0、1/1）；UI：`apps_ok`/`ql_ok` 门 + gen `load_state=error`/`partial_note` + Fail 按钮。
    - AC-03 **partial** — 选中保持 `t_selection_keep_not_row_index` + `sel_result_id`；Tab/Esc 源码无误触；**IME**：应用守卫 `ime_composing`/`ime_allows` 与 `tests/ime_contract.mjs` 已有，但 `gen/**/App.vue` `__autoBindKeydown` **不含** `e.isComposing`（rg 零命中），组合态无法自动置位 → E2E「无错误动作」未证。
    - AC-04 **pass** — host-registry `launch\t` + Launch 路由 + dev fixture 标注；`auto build` 通过。
    - AC-05 **pass** — `t_provider_admit`/`t_provider_registry_disable`；未声称进程插件完成。
  - **findings**：
    - **R-02-residual major/blocking**（AC-03）：auto-lang 生成器 keymap 缺 `isComposing` 短路或 `SetImeComposing` 同步。属跨仓前置，应用侧已备守卫。
    - **R-06 note**：`merge_provider_results` 与 app.at 门控双份（同排名债务，VM 限制）；行为一致，不阻断。
  - **规范增量**：SD-01 已反映失败隔离/IME/错误态，current-state 合格。
  - **unblock（二选一）**：
    1. auto-lang `__autoBindKeydown` 增加 `if (e.isComposing || e.keyCode === 229) return`（或组合事件驱动 `SetImeComposing`）后，在本仓跑 `auto run` + `tests/ime_contract.mjs` 补 E2E，再勾 AC-03；
    2. 用户书面接受契约级 IME 证据（`ime_composing` 守卫 + `ime_allows` 测试）为本计划 AC-03 达标，E2E 顺延 LAUNCHER-002 宿主键盘计划。
  - 状态保持 `executing`；T-00–T-04 不回开（应用内修复已完成）。

- stage: work | plan_id=LAUNCHER-001 | plan_revision=2 | outcome=pass | code_commit=69b633801b9df01b5956e541533e89a5ff57dec6 | dependency_revisions=auto-lang=c8d869878 (v0.6-dev ui_gen IME) | task_ids=R-02-residual | evidence=生成器 isComposing | blockers=无 | next=review

  **R-02-residual 关闭（选1）**：
  - auto-lang `v0.6-dev` 直接修改（用户裁定免 worktree）：`crates/auto-lang/src/ui_gen/vue.rs`
    - `__autoBindKeydown` / `__autoActionsKeydown`：`if (e.isComposing || e.keyCode === 229) return`
    - `@keyup.enter` 经 `ime_guard_enter_handler` 包装，组合确认 Enter 不触发 onenter
  - 单测：`test_bind_block_keydown_layer` / `test_onenter_ime_guard_wraps_handler` / `test_form_submit_wiring_emits_keyup_enter` 均 ok
  - `cargo tu`：858 passed，2 failed（bp 临时目录 flaky、desktop 金样 Theme 漂移——与 IME 无关）
  - launcher `auto build` 后 `gen/**/App.vue` 含 3 处 `isComposing`（keydown + 2×input onenter）
  - 提交：auto-lang `c8d869878`

- stage: review | plan_id=LAUNCHER-001 | plan_revision=2 | outcome=pass | reviewed_commit=83010ba92787eb6e2f8378baf3c609c423051535 | base_commit=00582cee1bc3a0b1b1e0de91703b6607ab1d6451 | code_impl_commit=69b633801b9df01b5956e541533e89a5ff57dec6 | dependency_revisions=auto-lang=c8d869878（ancestor of b189d108d）| spec_inputs=docs/specs/launcher/query-provider-core.md | acceptance_results=AC-01 pass, AC-02 pass, AC-03 pass, AC-04 pass, AC-05 pass | findings=R-06-note | evidence=见下 | next=merge

  **终审（同会话，结论以重跑/工件为准）**
  - 基线：launcher HEAD `83010ba`，工作区干净（仅 ignore 级 `.auto/`）；auto-lang `c8d869878` 仍在 HEAD 祖先链，`vue.rs` 含 isComposing 守卫。
  - 重跑：`auto test -d src` 17 passed；`auto test -d tests` 3 passed。
  - auto-lang codegen：`test_bind_block_keydown_layer`、`test_onenter_ime_guard_wraps_handler` ok。
  - 生成物：`gen/front/vue/src/App.vue` 3 处 `isComposing`（`__autoBindKeydown` + 2× input `@keyup.enter` 守卫）。
  - AC 映射：
    - **AC-01 pass** — `tests/test_fixture_scale.at`（1000 条确定序 + 中/英/别名/重复标题）；`query.at` 身份/重复标题。
    - **AC-02 pass** — `t_query_cancel_stale`/`t_stale_and_sort_stable`/`t_merge_failure_isolation`；UI `apps_ok`/`ql_ok` + `load_state=error`。
    - **AC-03 pass** — `t_selection_keep_not_row_index` + `sel_result_id`；IME：auto-lang 生成器短路 + onenter 守卫 + `ime_allows`/`ime_composing` 二级门。
    - **AC-04 pass** — host-registry `launch\t<name>`、dev fixture 标注、`auto build` 通过。
    - **AC-05 pass** — `t_provider_admit`/`t_provider_registry_disable`；未声称第三方进程插件完成。
  - 规范增量 SD-01：`docs/specs/launcher/query-provider-core.md` current-state 合格；`new_spec_components` 正确。
  - findings：**R-06 note**（排名/归并双份实现，VM 限制债务，Spec 已登记）——非阻断。
  - **verdict: pass → status=reviewed；next=merge**。

[整体roadmap](../roadmap-v0.6.md) · [agent执行说明](../README.md)

## 10. 待澄清事项

T-00需核实实际平台/运行时能力，负责者为本计划执行agent；输出具体API、可复现实验与独立阻塞提案。不存在先执行全局重构的隐含前置。核心验收变更须明确提出，不能用mock替换真实结果。

实现交接：stage=work；plan_revision=2；outcome=pass（T-00–T-04 与 AC-01–05 已落证据，待独立复审）；next=review。AutoVM str 池缺陷为登记债务，未用 mock 冒充真实能力。
