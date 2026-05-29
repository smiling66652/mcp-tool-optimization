#!/usr/bin/env python3
"""
MCP工具一键安装脚本
适用于: 联想 Y7000P 2025 (Ultra 7 + RTX 5060 + NPU)
Python: 3.13.12 (managed)
日期: 2026-05-29
"""

import subprocess
import sys
import os
import shutil
import json
import time

# 路径配置
PYTHON = r"C:\Users\Mypc\.workbuddy\binaries\python\versions\3.13.12\python.exe"
PIP = r"C:\Users\Mypc\.workbuddy\binaries\python\envs\default\Scripts\pip.exe"
NODE = r"C:\Users\Mypc\.workbuddy\binaries\node\versions\22.22.2\node.exe"
NPM_WORKSPACE = r"C:\Users\Mypc\.workbuddy\binaries\node\workspace"
MCP_JSON_SRC = r"C:\.workbuddy\mcp_analysis\mcp.json"
MCP_JSON_DST = os.path.expanduser(r"~/.workbuddy/mcp.json")

# 颜色输出
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header(msg):
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}  {msg}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.RESET}\n")

def print_ok(msg):
    print(f"{Colors.GREEN}[OK]{Colors.RESET} {msg}")

def print_warn(msg):
    print(f"{Colors.YELLOW}[WARN]{Colors.RESET} {msg}")

def print_err(msg):
    print(f"{Colors.RED}[ERR]{Colors.RESET} {msg}")

def run_cmd(cmd, description, shell=False):
    """运行命令并返回结果"""
    print(f"  >>> {description}...")
    try:
        if isinstance(cmd, list):
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        else:
            result = subprocess.run(cmd, shell=shell, capture_output=True, text=True, timeout=120)
        if result.returncode == 0:
            print_ok(f"  成功")
            return True, result.stdout
        else:
            print_err(f"  失败: {result.stderr[:200]}")
            return False, result.stderr
    except subprocess.TimeoutExpired:
        print_warn(f"  超时 (2分钟) — 可能仍在下载中")
        return False, "timeout"
    except Exception as e:
        print_err(f"  异常: {str(e)}")
        return False, str(e)

def check_prerequisites():
    """检查前置条件"""
    print_header("1. 检查前置条件")
    
    checks = []
    
    # 检查Python
    if os.path.exists(PYTHON):
        print_ok(f"Python 3.13.12: {PYTHON}")
        checks.append(True)
    else:
        print_err(f"Python 3.13.12 不存在: {PYTHON}")
        checks.append(False)
    
    # 检查Node
    if os.path.exists(NODE):
        print_ok(f"Node 22.22.2: {NODE}")
        checks.append(True)
    else:
        print_err(f"Node 22.22.2 不存在: {NODE}")
        checks.append(False)
    
    # 检查pip
    if os.path.exists(PIP):
        print_ok(f"pip: {PIP}")
        checks.append(True)
    else:
        print_err(f"pip 不存在: {PIP}")
        checks.append(False)
    
    # 检查npm workspace
    if os.path.exists(NPM_WORKSPACE):
        print_ok(f"npm workspace: {NPM_WORKSPACE}")
        checks.append(True)
    else:
        print_warn(f"npm workspace 不存在，创建中...")
        os.makedirs(NPM_WORKSPACE, exist_ok=True)
        checks.append(True)
    
    # 检查FFmpeg
    ffmpeg = shutil.which("ffmpeg")
    if ffmpeg:
        print_ok(f"FFmpeg: {ffmpeg}")
    else:
        print_warn("FFmpeg 未找到 — FFmpeg MCP需要FFmpeg")
        print_warn("  下载: https://ffmpeg.org/download.html")
        print_warn("  或 winget install FFmpeg")
    
    # 检查Docker (可选)
    docker = shutil.which("docker")
    if docker:
        print_ok(f"Docker: {docker}")
    else:
        print_warn("Docker 未找到 — ChromaDB可选Docker部署")
    
    # 检查FreeCAD (可选)
    freecad_paths = [
        r"C:\Program Files\FreeCAD\bin\freecad.exe",
        r"C:\Program Files\FreeCAD 1.0\bin\freecad.exe",
    ]
    freecad_found = False
    for p in freecad_paths:
        if os.path.exists(p):
            print_ok(f"FreeCAD: {p}")
            freecad_found = True
            break
    if not freecad_found:
        print_warn("FreeCAD 未找到 — FreeCAD MCP需要FreeCAD")
        print_warn("  下载: https://www.freecad.org/downloads.php")
    
    return all(checks)

def install_python_mcp_tools():
    """安装Python MCP工具"""
    print_header("2. 安装Python MCP工具")
    
    tools = [
        ("ChromaDB MCP", f'"{PIP}" install chromadb'),
        ("chromadblocal-mcp-server", f'"{PIP}" install chromadblocal-mcp-server'),
        ("FFmpeg MCP", f'"{PIP}" install ffmpeg-mcp'),
        ("System Monitor", f'"{PIP}" install mcp-system-monitor'),
        ("Ollama MCP", f'"{PIP}" install ollama-mcp'),
    ]
    
    results = {}
    for name, cmd in tools:
        ok, output = run_cmd(cmd, f"安装 {name}", shell=True)
        results[name] = ok
        if not ok:
            print_warn(f"  {name} 安装失败，尝试备选方案...")
            # 备选安装
            if name == "chromadblocal-mcp-server":
                ok2, _ = run_cmd(f'"{PIP}" install git+https://github.com/vespo92/chromadblocal-mcp-server.git', f"备选安装 {name}", shell=True)
                results[name] = ok2
    
    return results

def install_node_mcp_tools():
    """安装Node MCP工具"""
    print_header("3. 安装Node MCP工具")
    
    tools = [
        ("Playwright MCP", f'"{NODE}" "{NPM_WORKSPACE}\\node_modules\\.bin\\npx.cmd" -y @playwright/mcp@latest'),
        ("mcp-all-in-one", f'"{NODE}" "{NPM_WORKSPACE}\\node_modules\\.bin\\npx.cmd" -y mcp-all-in-one@latest'),
        ("MCP Inspector", f'"{NODE}" "{NPM_WORKSPACE}\\node_modules\\.bin\\npx.cmd" -y @modelcontextprotocol/inspector'),
    ]
    
    results = {}
    for name, cmd in tools:
        # 先用npx运行一次来触发下载
        cmd_parts = cmd.split()
        ok, output = run_cmd(cmd_parts[:2] + cmd_parts[2:], f"验证 {name}", shell=False)
        results[name] = ok
    
    return results

def test_mcp_tools():
    """基础测试"""
    print_header("4. 基础功能测试")
    
    tests = []
    
    # 测试ChromaDB
    print("  >>> 测试 ChromaDB MCP...")
    try:
        import chromadb
        client = chromadb.Client()
        print_ok("  ChromaDB Python包可用")
        tests.append(True)
    except Exception as e:
        print_warn(f"  ChromaDB 测试失败: {e}")
        tests.append(False)
    
    # 测试Playwright
    print("  >>> 测试 Playwright MCP...")
    ok, _ = run_cmd(
        [NODE, "-e", "require('playwright')"],
        "Playwright 模块加载测试"
    )
    tests.append(ok)
    
    # 测试FFmpeg
    ffmpeg = shutil.which("ffmpeg")
    if ffmpeg:
        ok, _ = run_cmd(["ffmpeg", "-version"], "FFmpeg 可用性测试")
        tests.append(ok)
    else:
        print_warn("  FFmpeg 跳过 (未安装)")
    
    return tests

def deploy_mcp_config():
    """部署MCP配置"""
    print_header("5. 部署MCP配置")
    
    # 备份原配置
    if os.path.exists(MCP_JSON_DST):
        backup = MCP_JSON_DST + ".backup." + time.strftime("%Y%m%d_%H%M%S")
        shutil.copy2(MCP_JSON_DST, backup)
        print_ok(f"原配置备份: {backup}")
    
    # 读取新配置
    with open(MCP_JSON_SRC, 'r', encoding='utf-8') as f:
        new_config = json.load(f)
    
    # 写入新配置
    os.makedirs(os.path.dirname(MCP_JSON_DST), exist_ok=True)
    with open(MCP_JSON_DST, 'w', encoding='utf-8') as f:
        json.dump(new_config, f, indent=2, ensure_ascii=False)
    
    print_ok(f"新配置写入: {MCP_JSON_DST}")
    print(f"\n{Colors.CYAN}配置内容:{Colors.RESET}")
    print(json.dumps(new_config, indent=2, ensure_ascii=False))
    
    return True

def print_next_steps():
    """打印后续步骤"""
    print_header("后续步骤")
    
    steps = [
        "1. 启动 mcp-all-in-one 聚合器",
        "2. 通过对话添加MCP服务:",
        '   - "Configure sequential-thinking in mcp-all-in-one"',
        '   - "Configure solidworks MCP in mcp-all-in-one"',
        '   - "Configure Playwright MCP in mcp-all-in-one"',
        '   - "Configure ChromaDB MCP in mcp-all-in-one"',
        '   - "Configure Ollama MCP in mcp-all-in-one"',
        "3. 重启 WorkBuddy 使MCP配置生效",
        "4. 运行测试验证脚本: python test_mcp_tools.py",
        "5. 详细文档: C:\\.workbuddy\\mcp_analysis\\report.md",
    ]
    
    for step in steps:
        print(f"  {step}")

def main():
    print_header("MCP工具一键安装脚本")
    print(f"Python: {PYTHON}")
    print(f"Node: {NODE}")
    print()
    
    # 1. 前置检查
    if not check_prerequisites():
        print_err("前置条件不满足，请修复后重试")
        sys.exit(1)
    
    # 2. 安装Python工具
    py_results = install_python_mcp_tools()
    
    # 3. 安装Node工具
    node_results = install_node_mcp_tools()
    
    # 4. 基础测试
    test_results = test_mcp_tools()
    
    # 5. 部署配置
    deploy_mcp_config()
    
    # 6. 汇总
    print_header("安装汇总")
    
    all_ok = True
    for name, ok in {**py_results, **node_results}.items():
        status = f"{Colors.GREEN}OK{Colors.RESET}" if ok else f"{Colors.RED}FAILED{Colors.RESET}"
        print(f"  [{status}] {name}")
        if not ok:
            all_ok = False
    
    print()
    if all_ok:
        print_ok("所有MCP工具安装成功!")
    else:
        print_warn("部分工具安装失败，请检查上面的错误信息")
    
    print_next_steps()

if __name__ == "__main__":
    main()
