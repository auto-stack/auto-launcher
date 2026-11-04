# 主题采纳合同（theme-adoption）

> 来源：auto-os/PLAN-057（2026-11-04 work 候选 T-02）。宿主主合同：
> auto-os `docs/specs/shell/host-theme-policy-and-delivery.md`；
> 本批登记页：auto-os `docs/specs/apps/product-theme-batch-057.md`。

## 消费形态

- **固定快照**：`vendor/themes` = UI 管理渠道发布的官方主题包快照
  （`themes` 0.2.0，内容 digest
  `9fa07742dc68aa5377ae06cb2d966386002063f184c515b6c5dddf8a6bef838e`，
  per-file sha256 与源包校验同律）。快照不可二次编辑、非第二权威源；
  升级 = UI 发新快照替换 + 本仓重验。
- **pac 声明**：`dep themes { path: "vendor/themes" }`；`theme` 键保持
  缺省 = **follow 宿主**。本仓 pac 原无显式 theme 键，无退役项。
- **源内导入**：`use themes.themes: Auto`（C-11 收集链注册，031 合同）。
- **design 默认**：静态 light（零遗留——本产品原无 dark_mode 位/明暗
  切换，056 todo/chat 先例同型）。桌面内宿主策略完整快照整体接管
  （follow）；launcher 在桌面的主形态是 overlay 槽召唤窗，宿主策略
  快照经同一 031 full-host 通道消费。

## 豁免与不变量

- 搜索 UI `mode`（palette|grid）为形态状态变量，与颜色主题无关，
  不映射不退役。
- 视图全语义 token 类；模糊排序/键盘流/recent/provider 契约等业务面
  不受换肤影响；`__desktop_cmd`/`__focus_input` 等宿主接缝原样。
- 原完整适用业务门在采纳前后保持：`tests/desktop_mcp.py`（VM T1-T8）
  + `tests/vue_verify.mjs`（Playwright vs :17842）结果见批次页回填；
  LAUNCHER-001 r7 交付面（provider/action/query 契约）不重审不回退。

## 验证与测试设施（os-057 冻结工具链：auto.exe 8d1944dd5f66bc6d + auto-ui-tool da5ea1569500c232）

- `tests/desktop_mcp.py` harness 适配（PLAN-057 T-02，检查不变量未动）：
  `pick_free_port` 外置钉定优先——本机 9247..94xx 大段系统保留区间
  （bind 10013），`AUTOUI_MCP_PORT` 显式给钉直接采用（缺省行为不变）。
- 运行 env：`AUTO_LANG_ROOT`/`AUTO_WEB_ROOT`=主检出、`AUTO_BIN`=os-057
  组树 auto.exe、`AUTO_UI_TOOL_BIN`=组树工具。
