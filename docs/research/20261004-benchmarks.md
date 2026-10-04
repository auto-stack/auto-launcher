# Auto Launcher：业界调研

日期：2026-10-04；官方文档为依据；本轮未做对标产品的速度实测。

| 参考/来源 | 核实内容 | 产品决策 |
|---|---|---|
| [PowerToys Command Palette](https://learn.microsoft.com/en-us/windows/powertoys/command-palette/overview) | Windows 键盘入口，应用、命令、文件、网页及扩展 | 独立 Windows 产品，键盘优先，共同 query/action 模型；不限定 AutoOS 已启动 |
| [Command Palette 扩展开发](https://learn.microsoft.com/en-us/windows/powertoys/command-palette/extension-development) | 扩展可提供列表/表单等界面 | 首版只需结果列表+动作，不先设计任意复杂插件 UI |
| [Raycast Quickstart](https://manual.raycast.com/quickstart) | app/file/URL Quicklink、扩展、剪贴板入口 | 默认应用搜索；命令前缀、快捷链接、最近项作为常用能力 |
| [Raycast Clipboard History](https://manual.raycast.com/clipboard-history) | 可选择保留时长、固定与删除内容 | 联用 copy-paste bin，不在 Notes/Launcher 各做历史守护程序 |
| [Everything SDK](https://www.voidtools.com/support/everything/sdk/) | DLL/Lib 经 IPC 查询；需要 Everything 客户端后台运行 | 可选适配器，缺失时降级为已选目录索引；不能把 SDK 当无需安装的独立索引器 |

第一版差异：Auto 应用与 Windows 应用同一入口；直接把当前资源送到 Notes/Reader/Blog；插件动作可解释且可取消。AI 对话为显式入口，输入普通关键字不自动成为远程请求。“最快万能启动器”是长期方向，首版用 p95 和参考机测量证明体验，不写无依据排名。
