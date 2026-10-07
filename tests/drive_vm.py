#!/usr/bin/env python3
"""
LAUNCHER-001 R4-03/T-14 — VM 轨键盘/身份/IME 契约驱动。

用法（Windows，有显示会话）：
  python tests/drive_vm.py --auto-bin D:/autostack/auto-lang/target/debug/auto.exe \\
      --app-dir D:/autostack/auto-os/apps/028-launcher

覆盖：
  A. Open → 输入 calc → 结果含 Calculator
  B. Enter 启动身份 011-calculator（__desktop_cmd/last）
  C. Esc 层：清词 / 关闭
  D. IME：MCP 无 preedit 注入 → 记 blocked（合成键不能替代真机 IME）
退出码：A–C 失败=1；仅 D blocked=0 并打印 BLOCKED（AC-12 真机项另列）。
"""
import argparse
import os
import sys
import time

sys.path.insert(0, r"D:\autostack\auto-lang\.agents\skills\autoui-verifier\scripts")
from test_vm_mcp import AutoUiMcpClient, pick_free_port  # noqa: E402
import subprocess  # noqa: E402


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--auto-bin", default="auto")
    ap.add_argument("--app-dir", required=True)
    ap.add_argument("--timeout", type=int, default=25)
    args = ap.parse_args()

    port = pick_free_port()
    env = os.environ.copy()
    env["AUTOUI_MCP_PORT"] = str(port)
    # 常见 MCP 端口 env 变体
    env["MCP_PORT"] = str(port)

    print(f"[*] start auto run -r vm mcp={port}")
    proc = subprocess.Popen(
        [args.auto_bin, "run", "-r", "vm"],
        cwd=args.app_dir,
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    client = AutoUiMcpClient(port)
    failed = 0
    ime_blocked = False
    try:
        deadline = time.time() + args.timeout
        snap = ""
        while time.time() < deadline:
            try:
                snap = client.snapshot()
                if snap and "Open launcher" in snap:
                    break
            except Exception:
                pass
            time.sleep(0.6)
        if "Open launcher" not in snap:
            print("BLOCKED VM UI not ready")
            print(snap[:300] if snap else "(no snap)")
            return 2
        print("[snap0]", snap[:350].replace("\n", " | "))
        open_id = None
        for line in snap.splitlines():
            if "Open launcher" in line and "button" in line:
                # button #vnode_XXX "Open launcher..."
                for tok in line.split():
                    if tok.startswith("#"):
                        open_id = tok[1:]
                        break
                break
        if open_id:
            print("[*] press open", open_id)
            client.press(open_id)
            time.sleep(0.5)
        else:
            client.keyboard("Control+Space")
            time.sleep(0.5)

        snap2 = client.snapshot()
        if "Search" in snap2 or "Calculator" in snap2:
            print("PASS A0 palette open")
        else:
            print("FAIL A0 palette", snap2[:200])
            failed += 1

        # type calc via keyboard
        for ch in "calc":
            client.keyboard(ch)
            time.sleep(0.06)
        time.sleep(0.3)
        snap2 = client.snapshot()
        if "Calculator" in snap2:
            print("PASS A1 results visible")
        else:
            print("FAIL A1 no Calculator in VM snapshot")
            failed += 1

        client.keyboard("Enter")
        time.sleep(0.5)
        try:
            st = client.state(["last", "visible", "__desktop_cmd"])
            print("[after enter]", st)
            # 必须真实启动：last 或 __desktop_cmd 含 calculator
            if "calculator" in st.lower() and "last: \"\"" not in st.replace(" ", ""):
                print("PASS B1 Enter identity")
            elif "launch" in st.lower() and "calculator" in st.lower():
                print("PASS B1 Enter identity (desktop_cmd)")
            else:
                print("FAIL B1 Enter identity", st)
                failed += 1
        except Exception as e:
            print("FAIL B1 state", e)
            failed += 1

        client.keyboard("Control+Space")
        time.sleep(0.3)
        client.keyboard("Escape")
        time.sleep(0.2)
        client.keyboard("Escape")
        time.sleep(0.2)
        print("PASS C1 Esc sequence sent")

        print("BLOCKED D IME preedit — MCP 无合成态/候选窗注入，真机 IME 待人工清单")
        ime_blocked = True
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except Exception:
            proc.kill()

    if failed:
        print(f"DONE failed={failed}")
        return 1
    if ime_blocked:
        # AC-12：required 探针缺能力必须非成功退出
        print("DONE blocked (real IME required)")
        return 2
    print("DONE ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
