# Auto Launcher：需求、架构与 UI/UX

状态：proposed；日期：2026-10-04。产品是独立可用的 Windows 启动器，同时保留 AutoOS 宿主模式。首版目标为应用/文件/命令快速入口与有限插件机制。

## 1. 基线与边界

现有 `src/front/app.at` 是 palette/grid 单文件原型；`SPEC.md` 记录桌面 host 字符串清单、`__desktop_cmd` launch 消息、模糊排序、最近项和键盘流。独立模式含 mock 应用列表；这些不是 Windows 系统应用自动发现。导入的 `tests/test_478_t6.py`、`test_479_t6.py` 是旧桌面 switcher/notification 驱动，不能算新启动器验收。

保留原 SPEC 为历史宿主契约。本产品通过 HostAdapter 分隔 AutoOS registry、Windows app discovery、Web fixture；先抽出搜索/动作语义，避免修改整个 AutoOS 输入分发与隐藏的 v0.5 桌面代码。

## 2. 需求与范围

| ID | 首版优先级 | 定义 |
|---|---|---|
| L01 | P0 | 普通用户 Windows 登录会话常驻入口；配置快捷键，单实例、托盘、启动/退出，冲突提示 |
| L02 | P0 | 从用户/系统开始菜单快捷方式读取真实应用；图标缓存、别名、最近与固定项；无需管理员权限 |
| L03 | P0 | 统一结果、分组/模糊匹配、即时增量、过期查询丢弃、键盘与 IME 正确 |
| L04 | P0 | 按选择启动应用/打开文件/URL；失败保留结果；路径和参数分开，避免拼 shell 字符串 |
| L05 | P0 | 最小插件协议，至少2个可独立停用的 provider；超时、取消、错误隔离 |
| L06 | P1 | 用户选择目录的文件名索引，Everything 可选，缺失可解释降级 |
| L07 | P1 | Notes 快速记录、Clipboard bin 查询与粘贴；真实 bin 不可用只提供显式粘贴/接口 |
| L08 | P1/原型 | `?` AI 提问流式结果、取消、来源；模型缺失清晰提示 |
| L09 | P1/原型 | auto-man search/install/update/uninstall 任务适配、进度与失败；不造第二套安装器 |
| L10 | P2 | 应用市场/远程插件分发、完整跨平台快捷键、语音、任意复杂扩展 UI |

“替代开始菜单”指日常应用入口，不意味着首版篡改 Windows shell、截获所有 Win 键或实现完整系统管理菜单。全局快捷键建议候选 Alt+Space，须探测冲突并可改；Web 只能在页面聚焦时调用入口，不能宣称全局快捷键。

## 3. 架构与契约

QuerySession：`query_id, text, mode, cancel_token`。ProviderDescriptor：`id, version, protocol_version=1, capabilities, permissions, prefix?, timeout_ms`。Result：`provider_id, result_id, title, subtitle, icon_ref?, score, actions[], data_ref?`；Action：`action_id, label, kind, target_ref, requires_confirmation, args`。稳定 result_id 绑定真实对象，不能用列表行号执行启动。

| 建议模块 | 责任/设计 |
|---|---|
| src/core/query.at | 解析模式、取消、结果归并、默认排序和选中项保留 |
| src/core/providers.at | 注册/停用/超时/权限；拒绝不兼容版本 |
| src/core/actions.at | 显式动作路由；launch/open/capture/ask/task，不任意执行 provider 拼出的命令 |
| src/providers/apps.at | 宿主 app registry 与 Windows 清单统一；刷新可增量 |
| src/providers/files.at | 本地选定目录索引、Everything 适配、缓存状态 |
| src/front/palette.at | 搜索结果、动作栏、空/加载/失败和细节预览 |
| src/platform/ | 现有平台能力的 adapter；全局热键、托盘、窗口激活、系统打开 |
| plugins/examples/ | 首版协议 fixture 和单独停用例；后续注册表入口 |

首版内置 provider 仍用统一协议；不能仅把几个函数命名为插件就声称扩展系统完成。第一条扩展路径建议为独立进程、JSON Lines 请求/响应（proposal），记录 query_id、超时、退出与取消。先验证现有宿主的进程/管道能力；若不可用，L01计划保留 in-process provider 契约，L03 单独补能力提案后才交付第三方插件。进程隔离不是 OS 沙箱，权限声明也不能等同已强制执行。

排序保留 exact/prefix/word-start/subsequence 层级；recency 只作同层加权。异步 provider 结果按 query_id 接收，旧结果不覆盖新输入；选中项按 result_id 维持。文件查询默认只索引名称与用户选定目录，内容索引后置。超时的 provider 标记不可用，其他结果持续可操作。

Windows 平台桥只封装需要的系统 API；应用逻辑和后端保持 `.at`，不手改生成 Rust。不具备 API 时先出最小探针和跨仓平台能力计划，不能在这仓私建不可维护的第二套 UI runtime。Linux 通过 Desktop Entry/宿主能力扩展，Harmony 首轮仍是 AutoOS 入口 demo。

## 4. UI/UX

```text
┌ 查应用、文件、命令……                    ⌘/Ctrl K ┐
│ 最近 / 应用                                       │
│ > Jade                  打开知识库          Enter │
│   Notes                 快速记录                  │
│ 文件（已索引目录）                                │
│   阅读清单.md            文档/                    │
│ ↑↓选择  Enter运行  Tab动作  Esc返回       索引就绪 │
└───────────────────────────────────────────────────┘
```

默认候选 680px 宽、最多8条可见结果、底部动作提示；小屏全宽。首屏固定/最近应用，无查询不显示陌生网页广告。应用启动失败保留窗口和重试；成功后收起，回到用户原工作窗口。Esc 清查询→退出动作/子模式→关闭，沿当前 SPEC 核实宿主行为；IME合成时 Enter/Esc 先交输入法。

建议 `>` 命令、`/` 文件、`?` AI、`note ` 快速记录，均为新产品交互提案，首版只实现已有 provider 对应模式。纯搜索不自动执行 shell 或发 AI。Tab 进入动作菜单，Ctrl+Enter 展示详情；可配置键以解决 OS 冲突。图标加载失败不阻塞文字结果；插件索引中/失败可见；高对比、焦点环、读屏标签和单手操作覆盖。

## 5. 性能、可靠性与发行

目标而非现测：热召唤可输入 p95≤150ms，本地应用结果 p95≤50ms，文件查询 p95≤100ms；测试参考机、数据量、缓存状态必填。冷启动、首次索引单独报告。输入连续变化/插件挂死/应用卸载后的陈旧快捷方式不能冻结窗口。最近项本地保存，可清空。

第一个实用版本必须在普通 Windows 用户会话、未启动 AutoOS 时完成热键召唤→搜索真实应用→启动→返回原窗口。auto-man 提供安装能力后再接任务接口；安装是明确动作，不由自然语言或 provider 结果自动执行。AI 插件和文件插件能独立关掉。


## 跨应用契约 v1（设计提案）

这些字段是本轮四个应用共同采用的草案，尚未成为 AutoOS 已实现的系统 API。首版用版本化 JSON 和应用内适配器实现；不得等待 HIR、Atom/Batom v2、AutoC 或完整知识系统才能运行。

| 对象 | 必需字段 | 规则 |
|---|---|---|
| EntityRef | namespace、entity_id、revision、kind | 应用生成稳定字符串 ID；改标题、路径或展示名不改 ID；跨仓引用带 namespace |
| AssetRef | asset_id、sha256、mime、size、storage_ref、original_name | 文件拷入受管理目录后才确认接收；storage_ref 是逻辑定位符，不是另一机器的绝对路径 |
| SourceRef | producer、original_uri、captured_at、locator、source_revision | 缺失字段显式 null；网页 URL、书内位置、截图区域分类型表示；保留原文 |
| CaptureEnvelope | schema_version=1、request_id、producer、text、asset_refs、source_refs、created_at | 一个请求的重试复用 request_id；同内容的新意图允许新请求；不以正文 hash 合并不同笔记 |
| CaptureReceipt | request_id、entity_ref、durable_at、status | 持久化正文及必需附件后才返回 committed；失败可重试，重复请求返回原收据 |

`request_id` 的幂等记录与实体创建在同一事务边界内提交。接收者不能只相信来自外部的 hash 或 MIME，须校验实际文件。建议附件交换采用显式授权的暂存目录加 manifest；只接受目录内的普通文件，不追随链接，不接受任意本机路径。

未决定的系统 transport 由 adapter 隔离：首个可验收版本支持导入/导出 envelope 文件或当前运行时已有的本地调用能力；本轮不擅自登记新的全局 URI scheme。未来 Launcher、AutoScape、AutoLens、copy-paste bin 使用相同语义，并以能力协商声明可用格式。

知识对象可以被多个应用访问，存储所有权不等于 Jade 的 UI 所有权。尚无共享知识服务时，Notes 持久化到可导出的本地 Inbox；提供外部引用与显式迁移收据。该阶段不声称已实现 Jade 双向共享编辑。共享服务就绪后，同一对象通过 revision 条件写入，冲突返回两版供选择，不用静默覆盖解决。


## 系统通信与 DevTools 的追加方向（2026-10-04）

用户确认应用通信/AutoAI和系统级DevTools是v0.6重点。本文的envelope、业务对象和provider是领域契约；注册/发现、会话、授权、错误、trace、stream与task复用公共系统层，应用不各自实现一套底层协议。

公共方案见[AutoOS通信RFC](https://github.com/auto-stack/auto-os/blob/v0.6-dev/docs/design/strategy/auto-app-communication-v0.6.md)与[系统DevTools RFC](https://github.com/auto-stack/auto-os/blob/v0.6-dev/docs/design/strategy/system-devtools-v0.6.md)。两份RFC尚未冻结；当前app计划仍可先完成独立本地数据与fixture闭环，之后把现有adapter接入公共服务，不以尚未实现的broker作为开始保存真实数据的前置。

应用提供业务Service及能力描述，UI/backend adapter提供观察树和允许动作；系统组件提供Inspector、Agent SDK与diff。复用现有AutoUI能力并显式声明Vue/VM/Rust的差异，不要求本app自行嵌入另一套DevTools面板。AI优先调业务能力，体验验证才走UI动作。

## 工程边界与实施约束

当前基线是 2026-10-04 的独立仓库导入版本；主力机器的 v0.5 尚有未公开工作。新增产品模块优先放新路径，用 adapter 接入既有页面；保留 SOURCE-IMPORT.json、source-sync 分支及教学来源。恢复 v0.5 后从 source-sync 基线做三方差异导入，不直接覆盖产品目录。

本次只是研究与设计，文档中“支持”“应当”均为目标；实现状态以计划验收证据为准。应用后端保持纯 Auto `.at`；不编辑 a2r 生成的 Rust。若现有运行时缺少必要平台能力，先输出最小能力探针和单独的跨仓提案，不把大规模框架改动塞进应用计划。

平台基线：Windows/Linux 桌面及 Web 先完成可用闭环；Harmony 是 v0.6 demo 与适配探针范围。窄屏设计纳入本轮，不能据此宣称已交付手机原生版。Android、iOS/macOS 及完整移动平台产品支持没有在本轮被追加为 v0.6 必达项。

AI 派生内容须标记来源、模型/处理器版本和生成时间；原文、原资产、人工更正均可追溯。未配置 AI 或断网时，核心本地流程仍能完成。任务可取消，可见错误，可重新执行。个人内容传给远程服务由用户选择；默认不自动上传整库。


## 配套文档

[调研依据](../research/20261004-benchmarks.md) · [首版路线](../roadmap-v0.6.md) · [执行入口](../README.md)
