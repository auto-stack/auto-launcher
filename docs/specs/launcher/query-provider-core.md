# query-provider-core — 搜索内核与 provider/action 契约 v1

状态：current-state（LAUNCHER-001 实现沉淀）。日期：2026-10-04。

## 职责

统一查询会话、稳定结果标识、模糊排名、provider 准入/停用、动作路由。
覆盖产品需求 L03 / L04 / L05（协议侧）。

## 关键入口

| 符号 | 位置 |
|---|---|
| QuerySession / Result / Action / ProviderDescriptor | `src/core/protocol.at` |
| match_tier / score_entity / sort_indices / keep_selection / accept_response | `src/core/query.at` |
| registry_new / register / set_enabled / admits | `src/core/providers.at` |
| route / action_allowed / actions_for | `src/core/actions.at` |
| collect_apps | `src/providers/apps.at` |
| collect_quicklinks | `src/providers/quicklinks.at` |
| UI 接入（query_id / sel_result_id / 动作菜单 / 负载态） | `src/front/app.at` |

## 协议 v1

- **QuerySession**：`query_id, text, mode, cancel_requested`。
- **Result**：`provider_id, result_id, title, subtitle, icon_ref, score, data_ref`。
  - `result_id` = 实体自然键（app name / ql id），**不是列表行号**。
  - 稳定标识 = `(provider_id, result_id)` 对。
- **Action**：`action_id, label, kind, target_ref, requires_confirmation`。
  - `kind ∈ {launch, open, capture, ask, task}`；非法 kind → reject。
  - `target_ref` 为稳定实体键；不执行 provider 拼出的 shell 字符串。
- **ProviderDescriptor**：`id, version, protocol_version=1, enabled, timeout_ms, permissions_granted, permissions_required`。
  - 权限位：bit0=launch, bit1=open, bit2=capture, bit3=ask, bit4=task。
  - 准入：enabled=1 ∧ protocol_version=1 ∧ required 位 ⊆ granted。

## 排名

与历史 SPEC.md 一致：

```
tier: exact=0 > prefix=1 > word-start=2 > subsequence=3；不匹配=99
score = tier*100 + registry_index - recency_discount
recency 折扣 ∈ [1,5]，只在同档内重排，不跨档倒置
匹配域 ln/lt 各自判定取更优档（PLAN-015）
```

## 查询会话行为

- `SetQ` → `query_id++`，`active_query_id` 跟踪；`accept_response` 丢弃过期/已取消。
- 列表变化后 `keep_selection` 按 `(provider_id, result_id)` 保持选中，找不到则回落首项。
- provider 失败/空结果：`load_state ∈ {ready, loading, error, empty}`；其他 provider 结果仍可操作。

## 内置 provider

| id | result_id | 动作 |
|---|---|---|
| apps | app name | launch（SPEC 上行 `launch\t<name>`） |
| quicklinks | ql id | launch / open（URL/path） |

均可 `set_enabled` 独立停用。standalone mock 清单在 UI 标注 `dev fixture`。

## 已知边界

1. **AutoVM str 缺陷**：pub fn 的 str 形参 `+` 拼接、跨模块 str 形参 + List 字段读、
   大规模 str 字段类型实例（约 ≥70）会触发 retain-after-free / 池损坏。核心逻辑
   测试嵌在同模块 `#[test]`；千条夹具排序测试放 `tests/test_fixture_scale.at`
   （跨模块调用）。app.at 侧算法保持 handler 内联，不 import 跨模块 str fn。
2. **第三方进程插件 transport 未实现**：仅内置 provider + 协议声明。能力探针需求见
   计划 §9 T-04。不声称独立进程插件已完成。
3. **grid `cols` schema drift**：历史 `cols: 5` 与 schema `columns` 不一致（导入前已存在）。

## 测试入口

```text
auto test -d src/core -v
auto test -d src/providers -v
auto test -d tests/test_fixture_scale.at -v
auto test -d tests/test_query_core.at -v
auto build          # Vue 生成 + vue-tsc
```

夹具：`tests/fixtures/providers/{host-registry,quicklinks,stale-query,same-title-ime}.json`。

## 相关

[产品设计](../../design/01-product-design.md) · [计划 001](../../plans/001-query-provider-core.md) · [历史 SPEC](../../../SPEC.md)
