# query-provider-core — 搜索内核与 provider/action 契约 v1

状态：current-state（LAUNCHER-001 Phase 2 / 修订 3 实现沉淀）。日期：2026-10-05。

## 职责

统一查询会话、稳定结果标识、层级优先模糊排名、provider 准入/停用/超时、动作路由。
覆盖产品需求 L03 / L04 / L05（协议侧）。

## 关键入口

| 符号 | 位置 |
|---|---|
| QuerySession / Result / Action / ProviderDescriptor | `src/core/protocol.at` |
| score_key / match_tier / sort_indices / keep_selection | `src/core/query.at` |
| DispatchState / begin_query / receive_provider / derive_load_state | `src/core/dispatch.at` |
| registry_new / register / set_enabled_at / admits_at | `src/core/providers.at` |
| route / action_allowed / actions_for | `src/core/actions.at` |
| collect_apps / collect_quicklinks | `src/providers/{apps,quicklinks}.at` |
| UI：query_id / sel_provider+sel_result_id / RunActionKind / 负载态 | `src/front/app.at` |

## 协议 v1

- **QuerySession**：`query_id, text, mode, cancel_requested`。
- **Result**：`provider_id, result_id, title, subtitle, icon_ref, score, data_ref`。
  - `result_id` = 实体自然键（app name / ql id），**不是列表行号**。
  - 稳定标识 = **`(provider_id, result_id)`** 全链路（选中、recent、动作目标）。
- **Action**：`action_id, label, kind, target_ref, requires_confirmation`。
  - `kind ∈ {launch, open, capture, ask, task}`；非法 kind → reject。
  - 菜单点击与键盘共用 `RunActionKind`；apps 不提供无效 `open`。
- **ProviderDescriptor / 注册表**：权限位 bit0=launch … bit4=task；
  准入 = enabled ∧ protocol_version=1 ∧ required ⊆ granted。
  运行时注册表 API 以**下标句柄**为准（`register`→idx；`set_enabled_at`/`admits_at`）。

## 排名（P2-R01 · 层级优先）

```
tier: exact=0 > prefix=1 > word-start=2 > subsequence=3；不匹配=99
score_key = tier * 1_000_000 + (registry_index - recency_discount + 16)
排序 = (score_key, registry_index) 升序；同 key 注册序稳定
recency 折扣 ∈ [1,5]，只在同层内前移，绝不跨层
匹配域 ln/lt 各自判定取更优档（PLAN-015）
apps 与 quicklinks 同一规则（含词首/id/title）
```

`TIER_STRIDE=1_000_000` 保证任意 si/disc 不溢出到下一 tier。

## 查询会话 / 接收门（P2-R05）

- `SetQ` → `query_id++`，`active_query_id` 绑定当前查询。
- 生产接收语义见 `dispatch.at`：`receive_provider` 对过期 id / 已取消返回 0（丢弃）；
  超时或该路失败返回 2（隔离）；正常返回 1。
- UI `ReceiveProvider` 消息按 `active_query_id` 丢弃旧响应。
- `derive_load_state`：双成功 ready；单路 live partial；双失败 error。
  每次 ApplyFilter 按 `apps_ok`/`ql_ok` 重算（P2-R03）：单路恢复立即可操作。

## 身份与动作（P2-R02 / P2-R04）

- 选中状态：`sel_provider` + `sel_result_id` + `sel_target`。
- Launch/RunActionKind 从**选中结果**路由，不扫描其他 provider 猜类型。
- 目标消失：回落首项并关闭菜单；旧动作目标失效时拒绝执行。
- recent 可带 `ql:` 前缀（兼容旧无前缀数据）。
- 菜单项显式 `RunActionKind("launch"|"open")`；仅 quicklinks 展示 Open。

## 内置 provider

| id | result_id | 动作 |
|---|---|---|
| apps | app name | launch（SPEC 上行 `launch\t<name>`） |
| quicklinks | ql id | launch / open（`open\t<url\|path>`，不拼 shell） |

standalone mock 标注 `dev fixture`；Fail apps / Fail quicklinks / Restore providers
用于注入失败与恢复路径。

## IME（P2 / AC-12）

- 应用门：`ime_composing="1"` 时 Pick/Escape 不触发（`ime_allows`）。
- 生成器门（auto-lang `c8d869878`）：`__autoBindKeydown`/`__autoActionsKeydown`
  短路 `e.isComposing || keyCode===229`；`@keyup.enter` 包 IME 守卫后调用 handler。
- 探针：`tests/ime_contract.mjs`、`tests/drive_phase2.mjs`（有匹配项对照；
  BLOCKED/缺依赖 exit 2）。

## 已知边界

1. **AutoVM str/类型池缺陷**：str 形参 `+`、跨模块 str+List 字段读、
   `list.get(i)==str`、多 `#[test]`×6 字段 type、≥70 str 字段实例会损坏。
   规避：score_key 数值化；providers 下标句柄；核心单测同模块/单测合并；
   app.at 算法 handler 内联。
2. **第三方进程插件 transport 未实现**（仅探针需求，见计划 T-04）。
3. **grid `cols` schema drift**（历史遗留）。
4. **排名/归并双份**：core（测试真源）与 app.at handler（vue 消费）公式对齐
   `score_key`，待 vue 轨可 import 跨模块 fn 后合并。

## 测试入口

```text
auto test -d src -v
auto test -d tests/test_fixture_scale.at -v
auto build
# 需 auto run 后：
node tests/drive_phase2.mjs
node tests/ime_contract.mjs
```

夹具：`tests/fixtures/providers/*`。

## 相关

[产品设计](../../design/01-product-design.md) · [计划 001](../../plans/001-query-provider-core.md) · [历史 SPEC](../../../SPEC.md)
