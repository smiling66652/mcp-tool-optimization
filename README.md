# 🔧 mcp-tool-optimization

<p align="center">
  <img src="https://img.shields.io/badge/MCP-Tools-optimization-orange?logo=openai" alt="MCP Tools">
  <img src="https://img.shields.io/badge/WorkBuddy-Skill-blue?logo=python" alt="WorkBuddy Skill">
  <img src="https://img.shields.io/github/license/smiling66652/mcp-tool-optimization?color=blue" alt="License">
</p>

<p align="center">
  <strong>MCP 工具去重 · 优化 · 整合</strong><br>
  对 100+ MCP 工具进行功能审计、去重、整合为统一工具箱
</p>

---

## ✨ 项目简介

**mcp-tool-optimization** 是对 WorkBuddy 中 100+ 个 MCP 工具进行系统化优化的项目。

### 核心目标

- **功能去重**：识别功能重叠的工具，合并为统一入口
- **最佳工具选择**：通过横向对比，为每个场景选择最优工具
- **N合1整合**：将多个同类工具整合为统一 Skill
- **降级策略**：为每个工具定义 Plan B/C，提高鲁棒性

---

## 🎯 优化成果

| 优化前 | 优化后 | 减少 |
|--------|--------|------|
| 120+ Skills | 核心可用集合 | ~70% |
| 4个 PDF 工具 | 1个 `pdfkit-py` | 75% |
| 3个浏览器工具 | 1个 `agent-browser` | 67% |
| 5个文档工具 | 3个（docx/xlsx/pptx） | 40% |

---

## 📂 项目结构

```
mcp-tool-optimization/
├── README.md                    ← 你在这里
├── docs/
│   ├── 功能重叠分析报告.md
│   ├── 工具对比表.xlsx
│   └── 优化总结.md
└── skills/
    ├── 联网工具箱/             # 整合10个联网Skills
    ├── 文档工具箱/             # 整合5个文档Skills
    └── 开发工具箱/             # 整合8个开发Skills
```

---

## 🚀 快速开始

### 安装为 WorkBuddy Skill

1. 将 `skills/联网工具箱/` 等目录放入 `~/.workbuddy/skills/`
2. 重启 WorkBuddy
3. 说"搜索网页"将自动触发`联网工具箱`

### 使用示例

```
用户：搜索"Claude Code 最新功能"

→ 自动触发「联网工具箱」
→ 优先使用 Playwright (Plan A)
→ 失败则降级到 Agent Browser (Plan B)
→ 返回搜索结果
```

---

## 📊 优化方法论

### 三级层级结构

```
一级：需求分析（判断用户要做什么）
  ↓
二级：工具选择（根据需求选择最佳工具，见对比表）
  ↓
三级：执行指令（调用工具并返回结果）
```

### 横向对比方法论

1. **全量扫描**：列出所有同类工具
2. **逐一测试**：速度、精度、稳定性
3. **制作对比表**：优缺点、适用场景
4. **选择最佳**：取众家之所长
5. **定义降级**：Plan A/B/C 完整定义

---

## 🔗 整合后的核心 Skills

| Skill 名称 | 整合前 | 整合后 | 功能 |
|------------|--------|--------|------|
| `联网工具箱` | 10个 | 1个 | 搜索/抓取/自动化/总结 |
| `文档工具箱` | 5个 | 1个 | Word/Excel/PPT/PDF |
| `开发工具箱` | 8个 | 1个 | GitHub/Docker/测试/CI |
| `task-orchestrator` | 新建 | 1个 | 智能任务编排 |

---

## 📄 License

MIT

---

<div align="center">
  <sub>为 WorkBuddy 生态构建 — 让 AI 工具真正好用</sub>
</div>
