---
plan_id: LAUNCHER-001
title: "搜索内核与 provider/action 契约"
status: executing
feature_name: "搜索内核与 provider/action 契约"
author: [Codex]
created_at: 2026-10-04T00:00:00Z
updated_at: 2026-10-05T02:23:39Z
plan_revision: 3
current_step: 10
total_steps: 13
created: 2026-10-04
base_branch: v0.6-dev
base_commit: 00582cee1bc3a0b1b1e0de91703b6607ab1d6451
depends_on: []
supersedes_spec_components: ["docs/specs/launcher/query-provider-core.md"]
new_spec_components: []
touched_goals: ["auto-launcher/first-real-release"]
---

# LAUNCHER-001：搜索内核与 provider/action 契约

## 0. 变更摘要

Phase 1 已交付搜索内核、内置 Apps/Quicklinks provider 与动作菜单，并保留其修订 2 的交付/复审历史。2026-10-05 用户明确要求重新激活本计划，以 Phase 2 修复再次检查发现的实现和验收缺口；当前为修订 3，Phase 2 尚未实施。

本次是用户授权的归档终态例外：计划移回 `docs/plans/001-query-provider-core.md`，状态恢复 `executing`；不重新取号，不清除既有提交、任务或历史收据。历史 pass 不覆盖 Phase 2，也不再作为当前整计划已验收的结论。本轮授权为更新计划和解决方案，后续代码执行另行接续。

## 1. 目标

覆盖需求：L03、L04、L05（协议）（定义见[产品设计](../design/01-product-design.md)）。依赖：无，可从当前基线开始。

Phase 2 目标：修复跨匹配层级排序、provider 身份与动作路由、部分恢复状态和动作菜单点击；补齐千条真实独立身份、查询乱序/取消/超时、provider 准入与双端键盘/IME 的有效验收。范围仍为本仓搜索/provider/action 模块及其测试；Windows 应用发现、全局热键、第三方进程插件 transport 留在 002/003。

原始导入commit用于识别来源，不要求后续计划回退到该commit；实际开工从最新v0.6-dev及已验收前序计划起步，在记录中填入实际HEAD。T0是有限能力核查；若需跨仓runtime改动，提交单独设计/计划，当前任务保留未完成验收，不偷偷将真实能力换成stub。

## 2. 架构方案

新增 src/core 与测试；仅小范围接入现有 app.at，保持 SPEC 的 AutoOS 消息契约。

当前定位：`src/front/app.at`、`SPEC.md`、`pac.at`。新文件路径以设计表为准，开工核对实际布局后可小幅调整并记录。禁止修改源demo、SOURCE-IMPORT.json、source-sync基线、未同步的四大app及AutoOS主桌面协议。集成使用新增adapter；跨仓依赖单独登记。

## 3. 技术栈

AutoLang/AutoUI `.at`、既有Vue/VM宿主；后端纯.at。协议使用版本化数据，原生能力经adapter接入，不手改生成Rust。

## 4. 需求分析与背景调查

### 修订 3 / Phase 2 基线与授权（2026-10-05）

- 用户明确要求：重新激活计划 001，将本次发现的问题和解决方案更新为新的 phase。该指示覆盖本次归档终态例外；只授权本轮计划修订，不视为已执行代码修复或授权扩大框架改动。
- 工作位置：`D:/autostack/auto-os/apps/028-launcher`，现有 `v0.6-dev` 检出；核查基线 `623dc62601d41b80363af85590d97d7ce35b599f`，无 tracked WIP，已有未跟踪构建缓存 `.auto/`。
- 当前规范输入：`docs/specs/launcher/query-provider-core.md`（修订 2 沉淀）、`SPEC.md`（旧宿主消息/键盘契约）、`docs/design/01-product-design.md`（L03/L04/L05）。current-state Spec 对 IME 同时残留“未修”和“已修”描述，且未反映本次发现的 UI 身份/排序差异，须在 Phase 2 验收后校正。
- 依赖基线：AutoLang HEAD `965b368a20db7c97fab7d1b0d51863b3ccca0f11`；实测 CLI `auto 0.1.0+v0.4.2-2592-gee25d3b49-dirty`（二进制与源码 HEAD 不等同，后续留存实际工具版本）。现有 Vue 生成物包含 `isComposing` 守卫，但不能据此替代交互验收。
- 重跑证据：`auto test -d src -v` = 17 passed；`auto test -d tests -v` = 3 passed（1000 个分数、286 个匹配项，两次排序一致）；`auto build` = Vue/TS 构建通过，仍有既有 S001 `grid cols` schema 提示。未执行 Vue/VM 双端交互或真实 IME 验证。
- 交付登记：本地分支相对核查时的 `origin/v0.6-dev` 领先 10 个提交；父仓 gitlink 为 `94abb2386c5d1dbdcda53ed93662529613b129ff`，仍早于实现提交。此次修订须保留既有待推送事实，不能把本地历史收据等同父仓已固定产品版本。

修订2：用户于2026-10-04确认所有app操作在auto-os/apps子目录；文档和代码修改使用该检出的v0.6-dev，完成提交/推送与父仓gitlink更新后显式恢复detached。此修订只改变工作位置/交接方式，任务和AC保持原意；本计划代码尚未实施。

授权：用户要求在四个独立app仓准备需求/设计、首版roadmap和首批实施计划。允许本轮文档编制；产品方向讨论不是本计划代码实现已经批准/完成的证据。

版本证据：frontmatter base_commit与SOURCE-IMPORT.json；源码路径见§2。各app当前没有独立docs/specs模块规范；以代码为观察事实、产品设计为目标态，提案中列出待沉淀规范。AutoOS规约见其AGENTS.md，AutoLang知识规则见docs/specs/README.md。

## 5. 详细设计

### 规范增量

| delta_id | add/modify/retire | 目标 | before/after rule | 理由 | 验收 |
|---|---|---|---|---|---|
| SD-01 | add | docs/specs/launcher/query-provider-core.md | 本模块尚无app级current-state Spec → 已记录实际实现的接口、恢复/错误及能力边界 | 供后续agent使用，设计提案不能冒充实现 | AC-01–AC-05 |
| SD-02 | modify | docs/specs/launcher/query-provider-core.md | 单整数混合排序/单 ID UI 路由 → 分层稳定排序及 `(provider_id, result_id)` 全链路身份；明确选中消失回落首项 | 修复实现与现有层级/身份契约不一致 | AC-01, AC-03, AC-06, AC-07 |
| SD-03 | modify | docs/specs/launcher/query-provider-core.md | 契约级取消/健康位与脱节准入 → 实际查询接收门、独立 provider 准入/超时/失败及部分恢复状态；点击显式动作 | 描述验收后的实际运行行为与能力边界 | AC-02, AC-05, AC-08–AC-11 |
| SD-04 | modify | docs/specs/launcher/query-provider-core.md | IME 矛盾描述和仅编译证据 → 经实测的 Vue/VM 键盘、IME 与宿主矩阵，列明工具版本和未交付能力 | 构建成功不能替代交互证据 | AC-03, AC-04, AC-12, AC-13 |

SD-01 为 Phase 1 已沉淀的历史增量；当前修订执行 SD-02–04。本次不提前发布这些目标行为为 current-state Spec。

### 可执行任务

以下 T-00–T-04 是 Phase 1 的历史完成任务，保留原记录；整计划进度按 Phase 1 五项完成、Phase 2 八项待执行计为 5/13。

T-00先行；T-01→T-02→T-03→T-04顺序实施。T-00输出能力报告，T-01形成接口/fixture，T-02/03接入实现，T-04完成整体验证与文档。任务输出见每项说明；T-00/04核查AC-01–05全体，中间任务按对应行为覆盖。每项实测命令/证据写入§9，不把未创建的测试入口说成已有。

- [x] T-00: 对当前 SPEC 与实际 app.at 做字段/消息/排序对照，保存旧宿主 fixture；不要运行旧478/479脚本冒充新验收。
- [x] T-01: 实现 query_id/cancel/Result/Action v1 与稳定 result_id；内置 Apps、Quicklinks 两个 provider。
- [x] T-02: 抽出模糊排名和 recency，维持跨匹配层级不倒置；新增过期响应丢弃和选中项保持。
- [x] T-03: 接入列表、加载/错误/空结果与动作菜单；启动目标按标识路由。
- [x] T-04: 记录后续独立进程插件 transport 的能力探针需求；当前交付只声明协议和内置 provider。

### Phase 2：修复实现与验收缺口

#### 发现、影响与解决方案

| finding_id | 严重性 / 关联 | 证据与触发 | 解决方案 |
|---|---|---|---|
| P2-R01 | P1 / T-02, AC-01 | `query.at:105` 的 `tier*100+si-disc` 在大清单下跨层倒置；`app.at:819` Quicklinks 额外 `+1000`。搜索 `d` 时 Downloads 前缀匹配落在 Auto Edit 词首匹配后 | 排序键按 `(tier, within_tier_score, stable_order)` 比较；recency 只改变同层位置，provider/注册序仅作同层稳定顺序；apps 和 quicklinks 同一规则，补齐 quicklinks 词首/id/title 匹配 |
| P2-R02 | P1 / T-01–03, AC-03 | `app.at:898` 只用 name 保持选择；`:1218` 根据 ql_ids 再判 provider，同名实体可误路由；目标消失后仍夹取旧行号 | UI 保存 provider + result_id，选中、recent、动作目标都使用完整身份；从选中结果的 provider/data_ref 路由，不扫描其他 provider 猜类型；目标消失回落首项，旧动作目标失效时关闭或明确拒绝 |
| P2-R03 | P2 / T-03, AC-02 | `app.at:563` 仅双路恢复清除 error；双失败后恢复一路，结果已存在却仍被 error 视图隐藏；grid 构建/启动未统一遵循 provider 停用 | 每次接收/重算按各 provider 的 enabled/health 与有效结果重新派生 ready/loading/empty/error；任一路恢复即可操作；palette/grid/动作执行统一适用 provider 门 |
| P2-R04 | P2 / T-03, AC-03 | `app.at:279–305` 所有菜单项均调用无参 RunAction，点击 Open 仍可能执行键盘选中的 Launch | 菜单项显式传 action_id/kind，键盘与点击共用有参数执行入口；根据选中结果的可用 actions 展示，应用不提供无效 Open；执行前再次确认完整实体身份/准入/IME 门 |
| P2-R05 | 验收缺口 / T-01–02, AC-02, AC-05 | UI query_id/active_query_id 只递增，无实际入站响应接收门；取消/慢 provider/timeout 测试为函数或描述 fixture；准入注册表未进入 UI 管道 | 先核实现有双端异步/消息能力；在内置 provider 的实际分发/接收边界关联 query_id/provider_id，处理旧响应、取消、超时和错误；UI 和测试驱动同一接收路径；真实能力缺失登记阻塞和独立框架计划，不以 helper 或 mock 冒充已接入 |
| P2-R06 | 验收缺口 / T-04, AC-01, AC-03 | `test_fixture_scale.at` 千条循环复用 7 个 ID，只比较同算法两次；`ime_contract.mjs` 用零匹配 zz 检查不启动、BLOCKED 仍 exit 0，且未验证 Esc/提交 | 生成至少 1000 个不同实体身份含重复标题；用固定预期验证排名层级/身份/选择；IME 用必有结果的查询及组合/非组合对照，补 Esc/提交和菜单流；required BLOCKED/缺依赖返回非成功并报告原因 |
| P2-R07 | 交付缺口 / T-04, AC-04 | 本地实现未推送、父仓 gitlink 在实现前；README/roadmap 仍未开始；Spec/ledger 残留 archived/ 链接及过时 IME 说明 | 本轮修正活动入口/状态与移动链接；Phase 2 完成并复审后更新 Spec/派生 ledger、提交推送子仓、父仓仅更新该 app gitlink，再显式 detach；网络失败保留具体阻塞收据 |

#### 执行任务与依赖

顺序为 T-05 → T-06 → T-07 → T-08 → T-09 → T-10 → T-11 → T-12。每项先以当前实现为证据，保留原 AC；发现跨仓能力缺口时停在明确阻塞，不调整验收门槛。新测试文件/驱动只有实际创建后才能记为已存在入口。

- [x] T-05: 冻结本阶段代码/工具/依赖基线，复现 P2-R01–07；使用 autoui-verifier 既有脚本检查 Vue/VM 的 provider 消息、延迟/取消/超时与 IME 注入能力，记录可用 API、限制、最小实验和确切命令。缺失能力提出独立框架前置计划，当前相关 AC 保留未完成。对应 AC-08、AC-12、AC-13。
- [x] T-06: 修复 `src/core/query.at` 与 `src/front/app.at` 双份排名，实现层级优先、同层 recency、确定性平局及两 provider 同规则匹配；重做 `tests/test_fixture_scale.at` 千条唯一身份与固定预期。覆盖不同层级在注册序 0/100/999 的交错、中文/英文/别名/重复标题/词首/id 匹配。对应 AC-01、AC-06。
- [x] T-07: 在 `protocol.at`、`actions.at` 和 `app.at` 贯通完整 provider/result 身份及动作目标，recent 序列化对旧数据兼容；构造 apps/quicklinks 相同 result_id、不同目标和重复标题，验证重排保留、目标消失回落首项、旧动作拒绝。对应 AC-03、AC-07。
- [ ] T-08: 接入实际查询分发/响应接收与 provider 注册/准入门，处理 query_id、取消、超时和版本/权限拒绝；测试驱动经生产接收入口控制 Q1/Q2 乱序、单路延迟/失败，不能只调用 accept_response 断言。分别测试 `providers.at` 的真实 register/set_enabled/admits API，禁止用 protocol.at 的仿写列表操作替代注册表测试。对应 AC-02、AC-05、AC-08、AC-11。
- [x] T-09: 根据 enabled/health/结果重新派生负载态，区分停用与失败，修复双失败后任一路恢复及再次失败；palette、grid 和动作执行都遵循 provider 门，失败路不残留可点击旧结果，恢复路立即可操作。对应 AC-02、AC-05、AC-09。
- [x] T-10: 将菜单点击与键盘统一为显式 action_id/kind 的执行入口，按 Result 可用 actions 展示；保证 Ctrl+Enter 开菜单、上下选择、Enter 执行、Esc 先关菜单、Tab 旧模式兼容，无误动作或重复执行。对应 AC-03、AC-07、AC-10、AC-12。
- [ ] T-11: 加强 `tests/ime_contract.mjs`、`tests/vue_verify.mjs` 及双端驱动（复用 autoui-verifier）；新增实现所需测试时记录真实文件/命令。用有匹配项的组合态 Enter/Esc/提交与非组合态对照，确认一次动作；执行 Vue/VM 全链路身份、排名、失败恢复、菜单/键盘与旧宿主 launch 回归。旧脚本 12 条结果假设随双 provider 更新；missing/BLOCKED 不计 pass。对应 AC-01–12。
- [ ] T-12: 由独立复审步骤按修订 3 和确切代码/依赖重验全部 AC，记录遗漏/延后/双份实现债务；沉淀 SD-02–04、刷新 ledger/README/roadmap；按子仓先推送再父仓固定 gitlink的顺序完成交付，最后 detach。网络或依赖阻塞不能写交付完成；本阶段仅文档/Auto 应用改动时不运行 AutoLang cargo 全量。对应 AC-13。

## 6. 测试设计

数据集：apps-registry、quicklinks、stale-query、same-title、IME；tests/fixtures/providers/（新建）。

在D:/autostack/auto-os/apps/028-launcher本仓根以匹配当前基线的auto CLI分别启动`auto run`与`auto run -r vm`，端口17842（前端），使用隔离存储目录。依赖准备见[仓根README](../../README.md)，不得把用户真实数据作为首次迁移样本。

本仓现有测试不保证覆盖新增产品能力。先建立tests下针对本计划的可重复fixture和驱动，在报告记录确切启动/执行命令；不得编造尚不存在的npm test/cargo test入口。使用AutoUI verifier现有双端驱动能力时，配置实际端口与app路径。

正确性/恢复/协议测试与UI体验分开记录，至少覆盖一个成功与一个失败路径。现有AutoLang/AutoUI框架不改时不跑cargo全量；若另开框架计划按该仓AGENTS的作用域门禁。文档阶段不运行cargo t/docs_gen。

Phase 2 验证入口：保留 `auto test -d src -v`、`auto test -d tests -v` 和 `auto build`；在独立端口/隔离存储启动双端后，执行本仓 Vue 驱动及 autoui-verifier VM 驱动。报告留存实际命令、工具版本、结果数、期望身份/动作、负面断言、截图/状态及 IME 环境。MCP 普通按键注入不能单独证明真实 IME preedit；若不能模拟，补真实输入法人工走查证据。运行时代码的纯 helper 测试与生产 UI 路径证据分开列出，不将“脚本 exit 0”直接映射为 AC pass。

排名采用独立固定预期，至少查询 `d`/中文标题/别名/词首/空词，并比较千条不同实体上的跨层级顺序；身份测试包含跨 provider 相同 result_id。负载状态覆盖双成功、单失败、双失败、任一路恢复、再次失败、独立停用与拒绝；异步覆盖 Q1 慢于 Q2、取消后返回和一 provider 超时而另一 provider 可执行。

## 7. 验收标准（必须保留实际证据）

AC-01–05 原文保留。修订 2 的 pass 作为 Phase 1 历史证据保存在 §9；当前全部回开以绑定修订 3 的实现与双端回归，新阶段不继承历史 pass。AC-06–13 将本次缺口细化为可观测门槛，不降低原验收标准。

- [ ] AC-01: 至少1000条fixture含中文、英文、别名、重复标题，排序确定且同结果标识稳定。
- [ ] AC-02: 乱序返回旧query、慢provider、provider失败时，当前输入和其他结果正常。
- [ ] AC-03: 列表变化后Enter触发选中对象而非旧行号；Tab/Esc/IME流程无错误动作。
- [ ] AC-04: 原AutoOS launch消息与host清单fixture可回归，standalone mock模式被标识为开发fixture。
- [ ] AC-05: 两个provider可分别停用，权限/版本不匹配明确拒绝；报告没有称第三方进程插件已完成。
- [ ] AC-06: 至少 1000 个不同 `(provider_id, result_id)` 实体，重复标题仍有不同身份；固定预期证明 exact/prefix/word-start/subsequence 层级在全部注册序和两个 provider 间不倒置，recency 仅在同层生效。core 与 Vue/VM handler 对同一夹具结果相同。
- [ ] AC-07: apps/quicklinks 同 result_id 时重排、选择、Enter/点击动作均命中对应 provider 的目标；目标消失回落首项，旧菜单目标不得执行；旧 recent 数据仍可恢复，存储/选择不发生跨 provider 串项。
- [ ] AC-08: 实际分发/接收路径中 Q1 慢于 Q2 时 Q1 不能覆盖当前输入/结果；取消后返回被丢弃，provider 超时可见且不阻塞另一 provider 操作。测试必须经过生产接收入口，记录双端能力和实际时间/事件序。
- [ ] AC-09: 双失败后仅恢复 apps 或仅恢复 quicklinks，结果立即可见可执行；再次失败状态正确。独立停用影响 palette/grid/动作执行，失败/停用路不残留旧可点击结果；禁用和错误提示可区分。
- [ ] AC-10: 鼠标点击任一菜单动作执行该项，键盘动作与点击一致；菜单目标不被重排悄悄替换，失效时明确拒绝。Ctrl+Enter/上下/Enter/Esc/Tab 流中每次确认只执行一次，应用结果不展示不可用动作。
- [ ] AC-11: 真实 register/set_enabled/admits API 及 UI/provider 管道拒绝不兼容版本、缺权限和已停用 provider；两内置 provider 可独立停用/恢复，无一条路径绕过准入。权限声明仍不声称 OS 沙箱。
- [ ] AC-12: Vue 和 VM 有有效键盘/IME 证据：有结果的组合态 Enter 不启动、Esc 不清词或关窗，提交完成后普通 Enter 可准确启动且仅一次。缺运行环境、依赖或能力须记 blocked，required 探针返回非成功；普通 MCP 按键/零结果查询不能替代 IME 证据。
- [ ] AC-13: 修订 3 全部 AC 经独立复审后再沉淀 Spec/ledger 并归档；当前活动链接与状态一致。子仓修复/文档提交已推送，父仓 gitlink 固定对应提交并推送，随后 app detached；若网络失败必须记录尚未完成的交付步骤，不能记整阶段 delivered。


## 8. 执行步骤与交接

当前交接为 Phase 2 / 修订 3：T-05–T-12 待执行。Phase 1 完成任务与全部历史记录保留，但原交付收据不覆盖修订 3。本轮仅修订计划；收到后续执行指令后在同一 apps 检出按 T-05 起步，不同时开工 002/003。

本计划无需触碰Windows全局键和其他仓库；完成后才进入真实系统入口。

新需求不得在执行中无限追加；发现必要遗漏先更新计划并讨论，不直接删验收项。知识系统/安装服务/AI等未交付依赖必须写明接口级与真实集成的差别。

## 9. 复审记录

以下至 Phase 1 consolidation receipt 均为修订 2 历史，保留原文字以便追溯；其中“pass/已归档/整体完成”不适用于当前 Phase 2。历史 worktree/路径/授权描述是当时记录，不应作为新框架改动豁免。

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

- stage: merge | plan_id=LAUNCHER-001 | plan_revision=2 | PLAN-001:r2 | outcome=pass | delivery_commit=见 git log 归档提交 | spec_paths=docs/specs/launcher/query-provider-core.md | ledger=.autoos/specs.json (P001-*, SD-01) | archive=docs/plans/archived/001-query-provider-core.md | completion_kind=delivered

  **consolidation receipt PLAN-001:r2**
  - `prepared`：reviewed baseline `d6e72d7`/`83010ba`；Spec sha256=AFF57D4F97A120427FC673865743CD4F6E1F255069578C16A4DD8E078FF13094；delivery=实施+Spec+ledger+归档（v0.6-dev 线性，修订2 apps 检出工作位置）。
  - `landed`：实现已在 `v0.6-dev`（`21a7f6c`+`69b6338` 等），无独立 plan worktree/ff-only 源分支——按 docs/README 子模块约定直接落默认分支；tip = 归档提交。
  - `ledger_refreshed`：`.autoos/specs.json` 新建；items P001-1/2/3/5/7、SD-01；file 指向 `docs/specs/launcher/query-provider-core.md`；reviews.file 指向 archived Plan。
  - `archived`：`docs/plans/archive/001-query-provider-core.md`，`status: archived`，`completion_kind: delivered`。
  - `cleaned`：无 plan-001 工作树（修订2 要求在 apps/028-launcher 检出实施）；无 junction；`.auto/` 为本地构建缓存不入库。
  - 债务（非阻断）：R-06 排名/归并双份；AutoVM str 池；第三方进程插件仅探针需求。
  - **push/gitlink**：`git push origin v0.6-dev` 失败（github.com:443 无法连接，2026-10-05）。本地 v0.6-dev 领先 origin 9 提交；父仓 gitlink 未更新。待网络恢复后：`git push` 于 apps/028-launcher，再更新 auto-os gitlink 并按约定 detach。

### Phase 2 重激活与修订交接（2026-10-05）

- stage: new | plan_id=LAUNCHER-001 | plan_revision=3 | phase=2 | outcome=pass | baseline_commit=623dc62601d41b80363af85590d97d7ce35b599f | findings=P2-R01–07 | task_ids=T-05–T-12 | acceptance_ids=AC-01–13 | next=work（待后续执行指令）
- 授权证据：用户明确要求“重新激活计划001，把刚才发现的问题和解决方案更新进去（作为新的phase）”。这是本次归档终态例外的唯一依据，不推广为其他计划的归档规则。
- 修订内容：移动到活动目录，`status=executing`、`plan_revision=3`、进度 5/13；新 phase 记录 7 项发现、8 项任务与 8 项补充 AC，原 5 项 AC 回开并保留旧 pass 历史；spec-impact 改为对已存在模块 Spec 的修改。
- 本次核查结果：源码 17 passed、夹具 3 passed、Vue build passed；S001 grid cols 为既有提示，记录归因，不宣称零告警。运行时双端/IME 仍未验证；P2-R01–07 均未修复，本交接 pass 只指计划已具备执行合同。
- 本轮同步核查：`git fetch origin v0.6-dev` 失败（`Recv failure: Connection was reset`）；文档内容/链接与 JSON 校验继续在本地完成。子仓推送和父仓指针更新须成功后才能记已完成，失败时保持具体待办收据。
- 后续复审须绑定新实现提交、实际 CLI/依赖版本及 SD-02–04 增量；不得沿用修订 2 的全 AC pass。

- stage: work | plan_id=LAUNCHER-001 | plan_revision=3 | outcome=pass | code_commit=待提交 | task_ids=T-05,T-06,T-07,T-09,T-10 | evidence=Phase2 首轮 | blockers=T-08 异步接收/providers.at 注册表测试、T-11 双端驱动 | next=work

  **Phase 2 首轮修复（2026-10-05）**：
  - **T-05**：基线 `1a6ebe8`；`auto 0.1.0+v0.4.2-2592-gee25d3b49-dirty`；src 20 passed；autoui-verifier 脚本在 `auto-lang/.agents/skills/autoui-verifier/scripts/`（test_vue_playwright.mjs / test_vm_mcp.py）。
  - **T-06 / P2-R01**：`score_key = tier*1e6 + si - disc + 16`；`sort_indices` 按 (key, si)；app.at 去掉 ql `+1000`，补 ql 词首档；`t_p2r01_no_cross_tier_inversion`、`t_sort_by_tier_then_si`、`t_ac06_*` 通过。
  - **T-07 / P2-R02**：`sel_provider`/`sel_target` 全链路；Launch/RunActionKind 从选中结果路由；recent `ql:` 前缀兼容旧数据；目标消失关菜单回落首项。
  - **T-09 / P2-R03**：ApplyFilter 按 apps_on/ql_on 重算 ready/error/partial；单路恢复即 ready。
  - **T-10 / P2-R04**：`RunActionKind(str)`；菜单 onclick 显式 launch/open；apps 不展示 Open。
  - **T-08 部分**：SetQ 绑定 `query_id`/`active_query_id` 接收门；`accept_response` 单测在案。**缺**：真异步 Q1/Q2 乱序驱动与 `providers.at` register/set_enabled/admits 生产路径测试（跨模块 str 字段 VM 缺陷）。
  - **T-11 部分**：`ime_contract.mjs` BLOCKED/缺依赖 exit 2；千条唯一 id + 固定预期。**缺**：auto run 双端全链路与真实 IME 人工走查。
  - 重跑：`auto test -d src` 20 passed；`auto test -d tests` 5 passed；`auto build` 成功。

[整体roadmap](../roadmap-v0.6.md) · [agent执行说明](../README.md)

## 10. 待澄清事项

T-00需核实实际平台/运行时能力，负责者为本计划执行agent；输出具体API、可复现实验与独立阻塞提案。不存在先执行全局重构的隐含前置。核心验收变更须明确提出，不能用mock替换真实结果。

Phase 2 待 T-05 核实现有双端异步/取消/timeout 与 IME 驱动能力，负责人为后续执行 agent；如不可用，输出可复现实验、影响 AC 和独立框架前置计划，不删验收项或在本仓自建第二套 runtime。当前不要求对这些能力作未经验证的实现承诺。

当前交接：stage=new；plan_revision=3；phase=2；outcome=pass（计划修订完成，修复尚未开始）；next=work（待后续执行指令）。AutoVM str 池及双份实现仍为已知限制，后续修复与测试须覆盖 UI 实际 handler。
