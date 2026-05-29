# MCP工具全量扫描与优化方案 — 综合分析报告

> 日期: 2026-05-29 | 硬件: 联想 Y7000P 2025 (Ultra 7 + RTX 5060 + NPU) | 用户: 合肥工业大学机械工程学生

---

## 一、扫描概览

### 1.1 当前MCP配置状态

| 服务器 | 状态 | 功能 | 维护状态 | 建议 |
|--------|------|------|----------|------|
| **solidworks** | ✅ 已启用 | SolidWorks CAD自动化 (eyfel版, ~4工具) | 低活跃 (14 stars) | 保留并补充 |
| filesystem | ❌ 已禁用 | 文件系统读写 | Anthropic仍维护 | 🔴 废弃 (WorkBuddy内置更优) |
| sqlite | ❌ 已禁用 | SQLite数据库 | Anthropic已归档 | 🔴 废弃 (用Python替代) |
| server-everything | ❌ 已禁用 | MCP协议测试 | Anthropic仍维护 | 🔴 废弃 (仅测试用途) |
| memory | ❌ 已禁用 | 键值对记忆 | Anthropic仍维护 | 🟡 替换为ChromaDB |
| sequential-thinking | ❌ 已禁用 | 结构化思维链 | Anthropic仍维护 | 🟢 保留启用 |

### 1.2 全网搜索统计

- 搜索关键词: 30+ 组
- 访问分析页面: 12+ 个
- 发现候选MCP服务器: **200+** 个
- 深度评估: **32** 个

---

## 二、逐项替代方案分析

### 2.1 Filesystem MCP → 🚫 直接废弃

**现状**: `@modelcontextprotocol/server-filesystem`

**为什么不启用**: WorkBuddy已内置文件系统工具 (Read/Write/Edit/Glob/Grep)，比MCP filesystem更高效:
- Token效率: 内置工具 3-8× 更少token消耗
- 功能覆盖: 内置工具完全覆盖
- 稳定性: WorkBuddy原生工具更可靠

**✅ 决定**: 移除配置，使用WorkBuddy内置工具

---

### 2.2 SQLite MCP → 🚫 直接废弃

**现状**: `@modelcontextprotocol/server-sqlite` — 已被Anthropic归档

**替代方案对比**:

| 方案 | 类型 | Token效率 | 功能 | 维护状态 |
|------|------|-----------|------|----------|
| Anthropic SQLite MCP | MCP | 低 | 基础SQL | ❌ 已归档 |
| johnnyoshika/sqlite-npx | MCP | 低 | 基础SQL | 🟡 低活跃 |
| Python sqlite3模块 (Bash) | 内置 | 高 | 完整SQL | ✅ 永远可用 |

**✅ 决定**: 移除配置。需要SQLite时直接用 `python -c "import sqlite3; ..."` 或内置Bash工具

---

### 2.3 Memory MCP → 🔄 替换为ChromaDB MCP

**现状**: `@modelcontextprotocol/server-memory` — 简单键值对记忆

**替代方案横向对比**:

| 方案 | Stars | 记忆类型 | 语义搜索 | RAG支持 | 特殊功能 | 安装方式 |
|------|-------|----------|----------|---------|----------|----------|
| Anthropic Memory | 官方 | 键值对 | ❌ | ❌ | 无 | npm |
| **ChromaDB MCP** (vespo92) | 高 | 向量 | ✅ | ✅ | EXIF提取、监视文件夹、重复检测 | pip |
| Qdrant MCP | 中 | 向量 | ✅ | ✅ | 生产级向量搜索 | pip |

**ChromaDB MCP 详细优势**:
- ✅ 向量语义搜索 (非简单键值匹配)
- ✅ RAG知识库就绪 (Ollama embedding可配合)
- ✅ EXIF提取 (图片元数据)
- ✅ 监视文件夹 (自动索引新文件)
- ✅ 重复检测
- ✅ 本地运行，隐私安全
- ✅ Python生态，与你的技术栈一致

**Qdrant MCP 对比**:
- 更重 (需运行Qdrant服务)
- 更适合生产级大规模部署
- 当前阶段过重

**✅ 决定**: 移除memory MCP，安装 ChromaDB MCP (vespo92/chromadblocal-mcp-server)

---

### 2.4 Sequential Thinking MCP → 🟢 保留启用

**现状**: `@modelcontextprotocol/server-sequential-thinking`

- 无真正替代品
- 对复杂推理问题有效
- Anthropic仍在维护
- Token消耗小

**✅ 决定**: 保留启用，作为降级链中的备选推理工具

---

### 2.5 SolidWorks MCP → 🔄 保留+补充FreeCAD MCP

**现状**: eyfel/mcp-server-solidworks (~4工具, 14 stars)

**全网CAD MCP横向对比** (9个候选):

| MCP服务器 | Stars | 工具数 | 平台 | 开源 | 优势 |
|-----------|-------|--------|------|------|------|
| **freecad-mcp** (neka-nat) | **165** | 10 | FreeCAD | ✅ | 社区最活跃，零件库支持 |
| CAD-MCP (daobataotie) | 98 | 12 | AutoCAD/国产 | ✅ | 多CAD平台 |
| freecad_mcp (bonninr) | 68 | 2 | FreeCAD | ✅ | 极简+Python脚本 |
| Easy-MCP-AutoCad | 64 | 16 | AutoCAD | ✅ | SQLite数据集成 |
| autocad-mcp | 59 | 35+ | AutoCAD | ✅ | P&ID专业支持 |
| fusion360-mcp-server | 26 | 11 | Fusion 360 | ✅ | 完整3D建模工作流 |
| **solidworks** (eyfel) | 14 | ~4 | SolidWorks | ✅ | 上下文感知架构 |
| autodesk-fusion-mcp | 6 | 1 | Fusion 360 | ✅ | 云原生原型 |
| onshape-mcp | 3 | 18 | Onshape | ✅ | 云原生，无需安装 |

**针对你的场景分析**:
- 你是SolidWorks用户，eyfel版是唯一SolidWorks MCP
- 但只有14 stars和~4个工具，功能有限
- **FreeCAD MCP (neka-nat)** 可作为热备降级方案: 165 stars, 10工具, 完全开源免费

**FreeCAD MCP 额外价值**:
- FreeCAD免费开源 (SolidWorks需要破解)
- 零件库快速原型
- 社区活跃，持续更新
- 跨平台潜力
- 可作为SolidWorks出问题时的降级备选

**✅ 决定**: 保留solidworks MCP，新增 freecad-mcp (neka-nat) 作为热备降级方案

---

## 三、新增MCP工具推荐

### 3.1 浏览器自动化 — Playwright MCP 🔥

**候选方案对比**:

| 维度 | Playwright MCP (Microsoft) | Puppeteer MCP (Google) |
|------|---------------------------|------------------------|
| 浏览器支持 | Chrome + Firefox + WebKit | 仅 Chromium |
| 自动等待 | ✅ 内置 | ❌ 需手动 |
| 录制回放 | ✅ codegen | ❌ |
| API测试 | ✅ 内置 | ❌ |
| 并行处理 | ✅ 原生 | 需额外配置 |
| 稳定性 | 更优 (自动重试) | 良好 |
| 安装 | `npm install playwright` | `npm install puppeteer` |
| 社区 | 快速增长 (67k+ stars) | 成熟 (88k+ stars) |
| MCP官方推荐 | ✅ 2026必装三件套 | - |

**✅ 决定**: 安装 Microsoft Playwright MCP — 功能更全、更稳定

**使用场景**:
- 学校官网信息抓取 (已有hfut_info_monitor)
- 网页表单自动填写
- 网页截图/视觉回归
- JS渲染页面抓取

---

### 3.2 多媒体处理 — FFmpeg MCP 🔥

**候选方案对比**:

| 方案 | 工具数 | 成熟度 | 安装 | Stars |
|------|--------|--------|------|-------|
| **demilp/ffmpeg-mcp** | 20+ | 生产就绪 | pip | 高 |
| misbahsy/video-audio-mcp | 30+ | 稳定 | pip | 高 |

**功能**: 格式转换、视频裁剪、音频处理、截图、拼接、水印

**✅ 决定**: 安装 demilp/ffmpeg-mcp (生产就绪版)

**使用场景**:
- MoneyPrinterTurbo视频处理
- 课程设计动画导出
- 多媒体格式转换

---

### 3.3 系统监控 — MCP System Monitor 🔥

**候选**: huhabla/mcp-system-monitor (唯一选择)

**功能**:
- CPU/GPU/NPU 实时监控
- 内存/磁盘/网络状态
- 进程信息
- 跨平台 (FastMCP构建)

**✅ 决定**: 安装

**使用场景**: NPU性能监控、Y7000P硬件状态观测

---

### 3.4 本地LLM集成 — Ollama MCP 🔥

**候选方案**:
- NightTrek/Ollama-mcp — 桥接Ollama与MCP
- hyzhak/ollama-mcp-server — 完整SDK暴露
- rawveg/ollama-mcp — 完整Ollama SDK

**✅ 决定**: 安装 NightTrek/Ollama-mcp

**使用场景**:
- 通过MCP调用Ollama本地模型
- BuddyOS与WorkBuddy打通
- 本地推理任务调度

---

### 3.5 微信消息 — WeChat MCP

**候选**: 1052666/WeChat-MCP-Server (MIT, 支持NT架构)

**评估**: 
- 与你的BuddySecretary (QQ监控) 功能重叠
- 你说"先不考虑已有项目"
- 但可作未来扩展

**✅ 决定**: 暂不安装，列入未来扩展清单

---

### 3.6 MCP聚合器 — mcp-all-in-one 🔥

**候选**: vtxf/mcp-all-in-one (69 stars, TypeScript, MIT)

**核心价值**:
- **统一入口**: 所有MCP服务通过一个端点访问
- **自配置**: 通过对话添加/移除MCP服务
- **自动重连**: 服务故障自动恢复
- **多协议**: stdio + HTTP
- **状态监控**: 实时监控所有子服务
- **解决你的核心痛点**: "AI决策困难不知道用哪个" → 统一入口

**安装**: `npx mcp-all-in-one@latest stdio`

**✅ 决定**: **强烈推荐安装** — 这是解决"N合一"和"AI决策困难"的关键方案

---

## 四、功能重叠分析与N合一方案

### 4.1 重叠矩阵

| 功能域 | 现有工具 | 替代/补充 | 处理方案 |
|--------|---------|-----------|----------|
| 文件操作 | filesystem MCP | WorkBuddy内置 (Read/Write/Edit/Glob/Grep) | 🚫 移除MCP，用内置 |
| 数据库 | sqlite MCP | Python sqlite3模块 (Bash) | 🚫 移除MCP，用内置 |
| 协议测试 | server-everything | - | 🚫 移除 (仅测试用) |
| 记忆存储 | memory MCP | ChromaDB MCP | 🔄 替换 |
| 推理辅助 | sequential-thinking | - | 🟢 保留 |
| CAD建模 | solidworks MCP | freecad-mcp | 🟢 保留+新增备选 |
| 浏览器操作 | - | Playwright MCP | 🟢 新增 |
| 多媒体 | - | FFmpeg MCP | 🟢 新增 |
| 系统监控 | - | System Monitor MCP | 🟢 新增 |
| LLM集成 | - | Ollama MCP | 🟢 新增 |
| 统一管理 | - | mcp-all-in-one | 🟢 新增 (聚合层) |

### 4.2 N合一合并方案

**核心架构: mcp-all-in-one 作为聚合器 + 5个功能MCP**

```
mcp-all-in-one (聚合层，统一入口)
├── sequential-thinking (推理辅助)
├── solidworks (CAD主力)
├── freecad-mcp (CAD备选/降级)
├── Playwright MCP (浏览器自动化)
├── FFmpeg MCP (多媒体处理)
├── System Monitor MCP (系统监控)
├── ChromaDB MCP (向量记忆+RAG)
└── Ollama MCP (本地LLM)
```

**降级链设计**:
1. SolidWorks CAD → (失败) → FreeCAD MCP
2. ChromaDB → (不可用) → 内置Python json存储
3. Playwright → (浏览器问题) → 内置WebFetch
4. 任何MCP → (崩溃) → mcp-all-in-one自动重连

---

## 五、最终推荐方案

### 5.1 mcp.json 配置

```json
{
  "mcpServers": {
    "mcp-all-in-one": {
      "command": "npx",
      "args": ["-y", "mcp-all-in-one@latest", "stdio"],
      "disabled": false
    }
  }
}
```

其他MCP服务器通过 mcp-all-in-one 的自配置功能动态添加，不需要在mcp.json中逐个配置。

### 5.2 安装优先级

| 优先级 | MCP工具 | 理由 |
|--------|--------|------|
| P0 | mcp-all-in-one | 统一管理入口 |
| P0 | sequential-thinking | 无替代，轻量 |
| P0 | solidworks | 当前主力CAD |
| P1 | Playwright MCP | 浏览器自动化刚需 |
| P1 | ChromaDB MCP | 替换memory，支持RAG |
| P1 | Ollama MCP | 本地LLM桥接 |
| P2 | FFmpeg MCP | 多媒体处理 |
| P2 | System Monitor | 硬件监控 |
| P2 | freecad-mcp | CAD备选降级 |

### 5.3 Token预算评估

| 方案 | MCP数量 | 预估Token消耗 | 
|------|---------|---------------|
| 当前 | 1 (solidworks) | ~3,000 tokens |
| 全部独立安装 | 8 | ~20,000 tokens |
| **推荐 (mcp-all-in-one聚合)** | 1个入口 | ~5,000-8,000 tokens |

mcp-all-in-one 作为聚合层，只向AI暴露统一的工具集，子服务按需加载，大幅减少token消耗。

---

## 六、测试验证方案

### 6.1 测试工具

| 工具 | 用途 | 安装 |
|------|------|------|
| **MCP Inspector** (官方) | 可视化测试调试 | `npx @modelcontextprotocol/inspector` |
| mcp-testing-framework | 自动化测试 (PyPI) | `pip install mcp-testing-framework` |
| Janix-ai/mcp-validator | 验证套件 | GitHub |

### 6.2 测试流程 (C级: 完整工作流)

每个MCP工具的测试项:

1. ✅ 安装测试 — npm/pip安装成功，无报错
2. ✅ 启动测试 — MCP服务器正常启动，stdio通信正常
3. ✅ 基础工具测试 — 每个工具运行一个基础用例
4. ✅ 工作流测试 — 串联多个工具完成完整任务
5. ✅ 错误处理测试 — 模拟故障，验证降级链
6. ✅ 稳定性测试 — 连续运行30分钟无崩溃

### 6.3 测试用例 (示例)

**SolidWorks + FreeCAD 降级链测试**:
```
1. SolidWorks MCP: 创建简单立方体 → 导出STEP
2. 模拟SolidWorks不可用
3. FreeCAD MCP: 自动接管 → 创建立方体 → 导出STEP
4. 验证输出一致性
```

**ChromaDB MCP 记忆测试**:
```
1. 存入: "Y7000P风扇问题已通过BIOS更新解决"
2. 查询: "风扇问题处理记录"
3. 验证: 语义匹配返回正确记录
```

**Playwright MCP 工作流测试**:
```
1. 导航到学校官网
2. 搜索"机械工程"
3. 截图保存
4. 提取搜索结果文本
5. 验证内容正确
```

---

## 七、风险评估与缓解

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| SolidWorks破解服务不稳定 | 中 | FreeCAD MCP热备降级 |
| mcp-all-in-one成熟度 (69 stars) | 低-中 | 独立MCP可单独使用 |
| ChromaDB首次索引慢 | 低 | 渐进式索引策略 |
| NPU MCP工具缺失 | 中 | 通过System Monitor间接监控 |
| Token消耗过大 | 中 | 聚合层按需加载 |
| Docker不熟悉 | 中 | 提供详细操作指南 |

---

## 八、Docker备用方案

部分MCP工具支持Docker部署 (如ChromaDB MCP)，备选方案:

```bash
# 启动ChromaDB容器
docker run -d --name chromadb -p 8000:8000 chromadb/chroma

# Qdrant容器 (备选)
docker run -d --name qdrant -p 6333:6333 qdrant/qdrant
```

### Docker操作指南 (针对不熟悉用户)

```bash
# 1. 验证Docker是否运行
docker --version

# 2. 启动服务
docker run -d --name <服务名> -p <端口映射> <镜像名>

# 3. 查看运行状态
docker ps

# 4. 查看日志
docker logs <容器名>

# 5. 停止服务
docker stop <容器名>

# 6. 重启服务
docker restart <容器名>
```

---

## 九、总结

### 核心决策

| 编号 | 决策 | 理由 |
|------|------|------|
| D1 | 🚫 废弃 filesystem/sqlite/everything MCP | WorkBuddy内置工具更优 |
| D2 | 🔄 memory → ChromaDB MCP | 向量语义搜索+RAG支持 |
| D3 | 🟢 启用 sequential-thinking | 无替代，轻量有用 |
| D4 | 🟢 保留 solidworks MCP | 当前CAD主力 |
| D5 | 🟢 新增 freecad-mcp | CAD热备降级 |
| D6 | 🟢 新增 Playwright MCP | 浏览器自动化刚需 |
| D7 | 🟢 新增 FFmpeg MCP | 多媒体处理 |
| D8 | 🟢 新增 System Monitor | 硬件监控 |
| D9 | 🟢 新增 Ollama MCP | 本地LLM桥接 |
| D10 | 🟢 新增 mcp-all-in-one | N合一聚合方案 |

### 最终架构

**从 6个MCP服务 → 1个聚合入口 + 7个功能MCP**

净效果:
- MCP配置条目: 6 → 1 (通过聚合器)
- 功能覆盖: 1域 (CAD) → 7域
- 降级能力: 无 → 3条降级链
- Token效率: 聚合层按需加载
- 决策难度: 多入口混乱 → 统一入口清晰
