#!/usr/bin/env python3
"""
MCP工具测试验证脚本
完整工作流测试 (C级)
适用于: 联想 Y7000P 2025 (Ultra 7 + RTX 5060 + NPU)
Python: 3.13.12
日期: 2026-05-29
"""

import subprocess
import sys
import os
import json
import time
import shutil

# 路径配置
PYTHON = r"C:\Users\Mypc\.workbuddy\binaries\python\versions\3.13.12\python.exe"
NODE = r"C:\Users\Mypc\.workbuddy\binaries\node\versions\22.22.2\node.exe"

class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    CYAN = '\033[96m'
    BOLD = '\033[1m'
    RESET = '\033[0m'

def print_header(msg):
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}  {msg}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.RESET}\n")

def print_ok(msg):
    print(f"{Colors.GREEN}[PASS]{Colors.RESET} {msg}")

def print_err(msg):
    print(f"{Colors.RED}[FAIL]{Colors.RESET} {msg}")

def print_warn(msg):
    print(f"{Colors.YELLOW}[SKIP]{Colors.RESET} {msg}")

def run_cmd(cmd, timeout=60):
    """运行命令"""
    try:
        if isinstance(cmd, str):
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=timeout)
        else:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

# ============================================================
# 测试1: ChromaDB MCP 完整测试
# ============================================================
def test_chromadb():
    print_header("测试1: ChromaDB MCP (向量记忆+RAG)")
    
    try:
        import chromadb
        print_ok("chromadb 模块导入成功")
    except ImportError:
        print_warn("chromadb 未安装，跳过测试")
        return False
    
    # 测试1.1: 基本操作
    try:
        client = chromadb.Client()
        collection = client.create_collection("test_mcp")
        print_ok("创建Collection成功")
        
        # 添加文档
        collection.add(
            documents=["Y7000P风扇问题已通过BIOS更新v1.23解决"],
            metadatas=[{"topic": "硬件", "date": "2026-05-29"}],
            ids=["doc_1"]
        )
        print_ok("添加文档成功")
        
        # 语义查询
        results = collection.query(
            query_texts=["风扇问题处理记录"],
            n_results=1
        )
        if results['documents'] and len(results['documents'][0]) > 0:
            print_ok(f"语义查询成功: {results['documents'][0][0][:60]}...")
        else:
            print_err("语义查询返回空结果")
            return False
        
        # 清理
        client.delete_collection("test_mcp")
        print_ok("清理测试数据成功")
        
    except Exception as e:
        print_err(f"ChromaDB测试失败: {str(e)[:200]}")
        return False
    
    return True

# ============================================================
# 测试2: Playwright MCP 基础测试
# ============================================================
def test_playwright():
    print_header("测试2: Playwright MCP (浏览器自动化)")
    
    # 检查playwright是否可用
    code = """
const pw = require('playwright');
console.log('Playwright version:', pw.chromium.name());
"""
    ok, stdout, stderr = run_cmd(
        [NODE, "-e", code],
        timeout=30
    )
    
    if ok:
        print_ok(f"Playwright 模块加载成功: {stdout.strip()}")
    else:
        print_warn(f"Playwright 模块未安装或路径问题: {stderr[:200]}")
        print_warn("跳过浏览器启动测试 (需要首次运行npx playwright install)")
        return False
    
    # 检查浏览器是否安装
    try:
        import os as _os
        pw_dir = _os.path.expanduser(r"~\.cache\ms-playwright")
        if _os.path.exists(pw_dir):
            print_ok("Playwright 浏览器缓存存在")
        else:
            # 尝试找其他路径
            alt_paths = [
                _os.path.expandvars(r"%LOCALAPPDATA%\ms-playwright"),
                r"C:\Users\Mypc\AppData\Local\ms-playwright",
            ]
            found = False
            for p in alt_paths:
                if _os.path.exists(p):
                    print_ok(f"Playwright 浏览器缓存: {p}")
                    found = True
                    break
            if not found:
                print_warn("Playwright 浏览器未安装，运行: npx playwright install chromium")
    except:
        pass
    
    return True

# ============================================================
# 测试3: FFmpeg 可用性测试
# ============================================================
def test_ffmpeg():
    print_header("测试3: FFmpeg MCP (多媒体处理)")
    
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        print_warn("FFmpeg 未安装")
        print_warn("安装: winget install FFmpeg 或访问 https://ffmpeg.org")
        return False
    
    print_ok(f"FFmpeg路径: {ffmpeg}")
    
    # 版本测试
    ok, stdout, stderr = run_cmd([ffmpeg, "-version"])
    if ok:
        version_line = stdout.split('\n')[0] if stdout else "未知"
        print_ok(f"版本: {version_line}")
    else:
        print_err("FFmpeg -version 失败")
        return False
    
    return True

# ============================================================
# 测试4: Ollama MCP 连接测试
# ============================================================
def test_ollama():
    print_header("测试4: Ollama MCP (本地LLM桥接)")
    
    # 检查Ollama服务
    try:
        import urllib.request
        req = urllib.request.Request("http://localhost:11434/api/tags")
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read())
            models = [m['name'] for m in data.get('models', [])]
            if models:
                print_ok(f"Ollama服务运行中，模型: {', '.join(models)}")
            else:
                print_warn("Ollama服务运行但无模型")
                return False
    except Exception as e:
        print_warn(f"Ollama服务不可用: {str(e)[:100]}")
        print_warn("启动: ollama serve")
        return False
    
    # 检查Ollama MCP Python包
    try:
        import ollama_mcp
        print_ok("ollama-mcp 模块可用")
    except ImportError:
        print_warn("ollama-mcp 未安装")
        return False
    
    return True

# ============================================================
# 测试5: mcp-all-in-one 验证
# ============================================================
def test_mcp_all_in_one():
    print_header("测试5: mcp-all-in-one (聚合器)")
    
    # 检查npx可用性
    ok, stdout, stderr = run_cmd(
        [NODE, "-e", "console.log('node ok')"],
        timeout=10
    )
    if not ok:
        print_err("Node.js 不可用")
        return False
    
    print_ok("Node.js 可用")
    
    # 检查mcp-all-in-one包
    ok, stdout, stderr = run_cmd(
        f'"{NODE}" -e "require(\'mcp-all-in-one\')"',
        timeout=30
    )
    if ok:
        print_ok("mcp-all-in-one 包可用")
    else:
        print_warn("mcp-all-in-one 未安装")
        print_warn("安装: npx -y mcp-all-in-one@latest")
        return False
    
    return True

# ============================================================
# 测试6: 系统监控MCP测试
# ============================================================
def test_system_monitor():
    print_header("测试6: System Monitor MCP (硬件监控)")
    
    try:
        import psutil
        print_ok("psutil 可用 (System Monitor依赖)")
        
        # 基本系统信息
        cpu_percent = psutil.cpu_percent(interval=1)
        mem = psutil.virtual_memory()
        
        print(f"  CPU: {cpu_percent}%")
        print(f"  内存: {mem.percent}% ({mem.used // (1024**3)}GB/{mem.total // (1024**3)}GB)")
        
        if cpu_percent >= 0:
            print_ok("系统监控数据获取成功")
        else:
            print_err("系统监控数据异常")
            return False
            
    except ImportError:
        print_warn("psutil 未安装")
        return False
    except Exception as e:
        print_err(f"系统监控测试失败: {str(e)[:200]}")
        return False
    
    return True

# ============================================================
# 测试7: MCP配置验证
# ============================================================
def test_mcp_config():
    print_header("测试7: MCP配置文件验证")
    
    mcp_json = os.path.expanduser(r"~/.workbuddy/mcp.json")
    
    if not os.path.exists(mcp_json):
        print_err(f"MCP配置文件不存在: {mcp_json}")
        return False
    
    try:
        with open(mcp_json, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        servers = config.get('mcpServers', {})
        print_ok(f"MCP配置有效，包含 {len(servers)} 个服务器")
        
        for name, cfg in servers.items():
            disabled = cfg.get('disabled', False)
            status = "启用" if not disabled else "禁用"
            print(f"  [{status}] {name}")
            
        return True
    except Exception as e:
        print_err(f"配置文件解析失败: {str(e)}")
        return False

# ============================================================
# 主函数
# ============================================================
def main():
    print_header("MCP工具完整测试验证")
    print(f"时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Python: {PYTHON}")
    print(f"Node: {NODE}")
    
    results = {}
    
    # 运行所有测试
    tests = [
        ("ChromaDB MCP", test_chromadb),
        ("Playwright MCP", test_playwright),
        ("FFmpeg MCP", test_ffmpeg),
        ("Ollama MCP", test_ollama),
        ("mcp-all-in-one", test_mcp_all_in_one),
        ("System Monitor", test_system_monitor),
        ("MCP配置验证", test_mcp_config),
    ]
    
    for name, test_func in tests:
        try:
            result = test_func()
            results[name] = result
        except Exception as e:
            print_err(f"{name} 测试异常: {str(e)[:200]}")
            results[name] = False
    
    # 汇总
    print_header("测试汇总")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for name, result in results.items():
        status = f"{Colors.GREEN}PASS{Colors.RESET}" if result else f"{Colors.RED}FAIL{Colors.RESET}"
        print(f"  [{status}] {name}")
    
    print(f"\n  通过: {passed}/{total}")
    
    if passed == total:
        print(f"\n{Colors.GREEN}{Colors.BOLD}所有测试通过! MCP工具集可用.{Colors.RESET}")
    elif passed >= total - 2:
        print(f"\n{Colors.YELLOW}大部分测试通过 ({passed}/{total})，部分可选工具未安装.{Colors.RESET}")
    else:
        print(f"\n{Colors.RED}多个测试失败，请检查安装.{Colors.RESET}")
    
    # 保存结果
    report = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "results": results,
        "passed": passed,
        "total": total
    }
    
    report_path = r"C:\.workbuddy\mcp_analysis\test_report.json"
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"\n测试报告: {report_path}")

if __name__ == "__main__":
    main()
