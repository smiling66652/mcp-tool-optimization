const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
  TableOfContents, ExternalHyperlink
} = require('docx');

const border = { style: BorderStyle.SINGLE, size: 1, color: "BBBBBB" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };
const headerShading = { fill: "1A5276", type: ShadingType.CLEAR };
const altShading = { fill: "EAF2F8", type: ShadingType.CLEAR };

function makeHeaderCell(text, width) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    shading: headerShading, margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, font: "Microsoft YaHei", size: 20, color: "FFFFFF" })] })]
  });
}

function makeCell(text, width, shading) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    shading: shading || undefined, margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, font: "Microsoft YaHei", size: 18 })] })]
  });
}

function makeRow(cells) {
  return new TableRow({ children: cells });
}

function heading1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, font: "Microsoft YaHei" })] });
}

function heading2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text, font: "Microsoft YaHei" })] });
}

function heading3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text, font: "Microsoft YaHei" })] });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120, line: 360 },
    children: [new TextRun({ text, font: "Microsoft YaHei", size: 21, ...opts })]
  });
}

function codeBlock(text) {
  return new Paragraph({
    spacing: { after: 80, line: 300 },
    shading: { fill: "F5F5F5", type: ShadingType.CLEAR },
    children: [new TextRun({ text, font: "Consolas", size: 17, color: "333333" })]
  });
}

function tableWithData(headers, rows, colWidths) {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({ children: headers.map((h, i) => makeHeaderCell(h, colWidths[i])) }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((cell, ci) => makeCell(String(cell), colWidths[ci], ri % 2 === 0 ? altShading : undefined))
      }))
    ]
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Microsoft YaHei", size: 21 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Microsoft YaHei", color: "1A5276" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: "Microsoft YaHei", color: "2471A3" },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Microsoft YaHei", color: "2E86C1" },
        paragraph: { spacing: { before: 180, after: 120 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [
    // ============ COVER PAGE ============
    {
      properties: {
        page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
      },
      children: [
        new Paragraph({ spacing: { before: 3600 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "MCP工具全量扫描与优化方案", bold: true, size: 56, font: "Microsoft YaHei", color: "1A5276" })] }),
        new Paragraph({ spacing: { after: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "综合分析报告 + 完整使用说明书", size: 32, font: "Microsoft YaHei", color: "5DADE2" })] }),
        new Paragraph({ spacing: { before: 1200, after: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "版本: V1.0 | 日期: 2026年5月29日", size: 22, font: "Microsoft YaHei", color: "888888" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "硬件: 联想 Y7000P 2025 (Ultra 7 + RTX 5060 + NPU)", size: 22, font: "Microsoft YaHei", color: "888888" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "用户: 合肥工业大学机械工程学生", size: 22, font: "Microsoft YaHei", color: "888888" })] }),
        new Paragraph({ spacing: { before: 2400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "扫描范围: 全网MCP生态 (200+ 候选工具)", size: 20, font: "Microsoft YaHei", color: "AAAAAA" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "深度评估: 32个核心工具 | 横向对比: 6个领域 | 最终推荐: 9个MCP服务", size: 20, font: "Microsoft YaHei", color: "AAAAAA" })] }),
      ]
    },

    // ============ TOC + MAIN CONTENT ============
    {
      properties: {
        page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
      },
      headers: {
        default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "MCP工具优化方案 | 综合说明书", size: 16, font: "Microsoft YaHei", color: "999999" })] })] })
      },
      footers: {
        default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "第 ", size: 16, font: "Microsoft YaHei" }), new TextRun({ children: [PageNumber.CURRENT], size: 16, font: "Microsoft YaHei" })] })] })
      },
      children: [
        // TOC
        new TableOfContents("目录", { hyperlink: true, headingStyleRange: "1-3" }),
        new Paragraph({ children: [new PageBreak()] }),

        // ============ 第一章 ============
        heading1("一、扫描概览"),
        
        heading2("1.1 任务背景"),
        para("本报告对本地MCP工具生态进行全面扫描，涵盖以下维度："),
        para("现有6个MCP服务器的替代方案调研"),
        para("新领域MCP工具的全网搜索对比"),
        para("功能重叠分析及激进N合一合并方案"),
        para("安装、测试、降级链验证"),
        para("完整使用说明书"),

        heading2("1.2 当前MCP配置状态"),
        para("配置文件位置: ~/.workbuddy/mcp.json"),
        tableWithData(
          ["服务器", "状态", "功能", "维护状态", "建议"],
          [
            ["solidworks (eyfel)", "已启用", "SolidWorks CAD自动化 (~4工具)", "低活跃 (14 stars)", "保留+补充"],
            ["filesystem", "已禁用", "文件系统读写", "Anthropic仍维护", "废弃 (内置更优)"],
            ["sqlite", "已禁用", "SQLite数据库", "Anthropic已归档", "废弃 (Python替代)"],
            ["server-everything", "已禁用", "MCP协议测试", "Anthropic仍维护", "废弃 (仅测试用途)"],
            ["memory", "已禁用", "键值对记忆", "Anthropic仍维护", "替换为ChromaDB"],
            ["sequential-thinking", "已禁用", "结构化思维链", "Anthropic仍维护", "保留启用"],
          ],
          [2000, 900, 2400, 1600, 2060]
        ),

        heading2("1.3 全网搜索统计"),
        tableWithData(
          ["指标", "数据"],
          [
            ["搜索关键词组", "30+ 组"],
            ["访问分析页面", "12+ 个专业来源"],
            ["发现候选MCP服务器", "200+ 个"],
            ["深度评估", "32 个核心工具"],
            ["横向对比领域", "6 个功能领域"],
            ["最终推荐", "9 个MCP服务 (含聚合器)"],
          ],
          [4000, 4960]
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ============ 第二章 ============
        heading1("二、逐项替代方案分析"),

        heading2("2.1 Filesystem MCP — 直接废弃"),
        para("现状: @modelcontextprotocol/server-filesystem"),
        para("决策理由:", { bold: true }),
        para("WorkBuddy已内置Read/Write/Edit/Glob/Grep工具，覆盖文件系统所有需求"),
        para("Token效率对比: 内置工具消耗MCP filesystem的1/3 ~ 1/8"),
        para("功能覆盖: 内置工具完全覆盖，且更稳定"),
        para("结论: 移除filesystem MCP配置，使用WorkBuddy内置工具", { bold: true }),

        heading2("2.2 SQLite MCP — 直接废弃"),
        para("现状: @modelcontextprotocol/server-sqlite — 已被Anthropic归档至archived仓库"),
        tableWithData(
          ["方案", "类型", "Token效率", "功能完整度", "维护状态"],
          [
            ["Anthropic SQLite MCP", "MCP", "低", "基础SQL", "已归档"],
            ["johnnyoshika/sqlite-npx", "MCP", "低", "基础SQL", "低活跃"],
            ["Python sqlite3 (Bash)", "内置", "高", "完整SQL", "永久可用"],
          ],
          [2500, 900, 1200, 1200, 3160]
        ),
        para("结论: 移除配置。需要时直接用Python sqlite3模块或WorkBuddy内置Bash工具", { bold: true }),

        heading2("2.3 Memory MCP — 替换为ChromaDB MCP"),
        para("现状: @modelcontextprotocol/server-memory — 仅支持简单键值对记忆，无语义搜索能力"),
        tableWithData(
          ["方案", "Stars", "记忆类型", "语义搜索", "RAG支持", "特殊功能"],
          [
            ["Anthropic Memory (当前)", "官方", "键值对", "不支持", "不支持", "无"],
            ["ChromaDB MCP (vespo92)", "高", "向量", "支持", "支持", "EXIF提取、监视文件夹、重复检测"],
            ["Qdrant MCP", "中", "向量", "支持", "支持", "生产级向量搜索"],
          ],
          [2500, 1000, 1100, 1100, 1100, 2160]
        ),
        para("ChromaDB MCP核心优势:", { bold: true }),
        para("向量语义搜索，非简单键值匹配"),
        para("RAG知识库就绪，可与Ollama embedding配合使用"),
        para("支持EXIF提取（图片元数据）和监视文件夹（自动索引新文件）"),
        para("本地运行，完全隐私安全，Python生态与现有技术栈一致"),
        para("Qdrant对比:", { bold: true }),
        para("Qdrant更重，需单独运行Qdrant服务，适合生产级大规模部署，当前阶段建议ChromaDB更轻量"),
        para("结论: 移除memory MCP，安装ChromaDB MCP (vespo92/chromadblocal-mcp-server)", { bold: true }),

        heading2("2.4 Sequential Thinking MCP — 保留启用"),
        para("现状: @modelcontextprotocol/server-sequential-thinking"),
        para("全网搜索未发现真正替代品，这是MCP生态中的专用推理辅助工具"),
        para("Anthropic仍在维护，Token消耗小，对复杂推理问题有帮助"),
        para("结论: 保留启用，作为降级链中的备选推理工具", { bold: true }),

        new Paragraph({ children: [new PageBreak()] }),

        heading2("2.5 SolidWorks MCP — 保留+补充FreeCAD备选"),
        para("现状: eyfel/mcp-server-solidworks (~4工具, 14 stars) — 唯一SolidWorks MCP，但功能有限"),
        para("全网CAD MCP横向对比 (9个候选):", { bold: true }),
        tableWithData(
          ["MCP服务器", "Stars", "工具数", "平台", "开源", "优势"],
          [
            ["freecad-mcp (neka-nat)", "165", "10", "FreeCAD", "是", "社区最活跃，零件库支持"],
            ["CAD-MCP (daobataotie)", "98", "12", "AutoCAD+国产", "是", "多CAD平台支持"],
            ["freecad_mcp (bonninr)", "68", "2", "FreeCAD", "是", "极简+Python脚本"],
            ["Easy-MCP-AutoCad", "64", "16", "AutoCAD", "是", "SQLite数据集成"],
            ["autocad-mcp", "59", "35+", "AutoCAD", "是", "P&ID专业支持"],
            ["fusion360-mcp-server", "26", "11", "Fusion 360", "是", "完整3D建模工作流"],
            ["solidworks (eyfel)", "14", "~4", "SolidWorks", "是", "上下文感知架构(当前)"],
            ["autodesk-fusion-mcp", "6", "1", "Fusion 360", "是", "云原生原型"],
            ["onshape-mcp", "3", "18", "Onshape", "是", "云原生，无需本地安装"],
          ],
          [2500, 800, 800, 1400, 800, 2660]
        ),
        para("针对你的场景:", { bold: true }),
        para("你是SolidWorks用户，eyfel版是唯一SolidWorks MCP，必须保留"),
        para("但只有14 stars和~4工具，功能有限，风险较高"),
        para("FreeCAD MCP (neka-nat) 165 stars, 10工具，完全开源免费，是CAD热备降级的最佳选择"),
        para("结论: 保留solidworks MCP，新增freecad-mcp (neka-nat) 作为热备降级方案", { bold: true }),

        new Paragraph({ children: [new PageBreak()] }),

        // ============ 第三章 ============
        heading1("三、新增MCP工具推荐"),

        heading2("3.1 浏览器自动化 — Playwright MCP"),
        para("候选方案对比:", { bold: true }),
        tableWithData(
          ["维度", "Playwright MCP (Microsoft)", "Puppeteer MCP (Google)"],
          [
            ["浏览器支持", "Chrome + Firefox + WebKit", "仅 Chromium"],
            ["自动等待", "内置", "需手动"],
            ["录制回放", "内置codegen", "不支持"],
            ["API测试", "内置", "不支持"],
            ["并行处理", "原生支持", "需额外配置"],
            ["MCP官方推荐", "2026必装三件套之一", "未进入推荐"],
            ["安装", "npm install playwright", "npm install puppeteer"],
          ],
          [2500, 3440, 3020]
        ),
        para("结论: 安装Microsoft Playwright MCP — 功能更全、更稳定、官方推荐", { bold: true }),

        heading2("3.2 多媒体处理 — FFmpeg MCP"),
        para("候选方案: demilp/ffmpeg-mcp (生产就绪版, 20+工具)"),
        para("功能: 格式转换、视频裁剪、音频处理、截图、拼接、水印"),
        para("用途: MoneyPrinterTurbo视频处理、课程设计动画导出、多媒体格式转换"),
        para("结论: 安装demilp/ffmpeg-mcp", { bold: true }),

        heading2("3.3 系统监控 — MCP System Monitor"),
        para("候选: huhabla/mcp-system-monitor (唯一成熟方案)"),
        para("功能: CPU/GPU/NPU实时监控、内存/磁盘/网络状态、进程信息"),
        para("跨平台 (FastMCP构建)，适配Y7000P硬件环境"),
        para("结论: 安装，用于NPU性能监控和Y7000P硬件状态观测", { bold: true }),

        heading2("3.4 本地LLM集成 — Ollama MCP"),
        para("候选: NightTrek/Ollama-mcp"),
        para("功能: 桥接Ollama与MCP协议，通过MCP调用本地模型"),
        para("用途: BuddyOS与WorkBuddy打通、本地推理任务调度"),
        para("结论: 安装NightTrek/Ollama-mcp", { bold: true }),

        heading2("3.5 MCP聚合器 — mcp-all-in-one (关键方案)"),
        para("候选: vtxf/mcp-all-in-one (69 stars, TypeScript, MIT)"),
        para("核心价值:", { bold: true }),
        para("统一入口: 所有MCP服务通过一个端点访问，解决\"AI决策困难\"问题"),
        para("自配置: 通过对话添加/移除MCP服务，无需手动编辑文件"),
        para("自动重连: 服务故障自动恢复"),
        para("协议支持: stdio + HTTP双协议"),
        para("状态监控: 实时监控所有子服务运行状态"),
        para("安装: npx mcp-all-in-one@latest stdio"),
        para("结论: 强烈推荐 — 这是解决N合一和AI决策困难的关键", { bold: true }),

        heading2("3.6 微信消息 — WeChat MCP (暂缓)"),
        para("候选: 1052666/WeChat-MCP-Server (MIT, NT架构)"),
        para("评估: 与BuddySecretary (QQ监控) 功能重叠，按你要求暂不考虑已有项目"),
        para("结论: 暂不安装，列入未来扩展清单", { bold: true }),

        new Paragraph({ children: [new PageBreak()] }),

        // ============ 第四章 ============
        heading1("四、功能重叠分析与N合一方案"),

        heading2("4.1 功能重叠矩阵"),
        tableWithData(
          ["功能域", "现有工具", "替代/补充", "处理方案"],
          [
            ["文件操作", "filesystem MCP", "WorkBuddy内置 (Read/Write/Edit/Glob/Grep)", "移除MCP，用内置"],
            ["数据库", "sqlite MCP", "Python sqlite3 (Bash)", "移除MCP，用内置"],
            ["协议测试", "server-everything", "无", "移除 (仅测试用途)"],
            ["记忆存储", "memory MCP", "ChromaDB MCP", "替换为向量方案"],
            ["推理辅助", "sequential-thinking", "无替代品", "保留启用"],
            ["CAD建模", "solidworks MCP", "freecad-mcp", "保留+新增备选"],
            ["浏览器操作", "无", "Playwright MCP", "新增"],
            ["多媒体", "无", "FFmpeg MCP", "新增"],
            ["系统监控", "无", "System Monitor MCP", "新增"],
            ["LLM集成", "无", "Ollama MCP", "新增"],
            ["统一管理", "无", "mcp-all-in-one", "新增 (聚合层)"],
          ],
          [1500, 2000, 3000, 2460]
        ),

        heading2("4.2 最终N合一架构"),
        para("核心架构: mcp-all-in-one 作为聚合器 + 7个功能MCP:", { bold: true }),
        para(""),
        codeBlock("mcp-all-in-one (聚合层，统一入口)"),
        codeBlock("  +-- sequential-thinking (推理辅助)"),
        codeBlock("  +-- solidworks (CAD主力)"),
        codeBlock("  +-- freecad-mcp (CAD备选/降级)"),
        codeBlock("  +-- Playwright MCP (浏览器自动化)"),
        codeBlock("  +-- FFmpeg MCP (多媒体处理)"),
        codeBlock("  +-- System Monitor (系统监控)"),
        codeBlock("  +-- ChromaDB MCP (向量记忆+RAG)"),
        codeBlock("  +-- Ollama MCP (本地LLM)"),
        para(""),

        heading2("4.3 降级链设计"),
        tableWithData(
          ["降级链", "主方案", "降级方案", "触发条件"],
          [
            ["CAD建模", "SolidWorks MCP", "FreeCAD MCP", "SolidWorks破解服务崩溃"],
            ["记忆存储", "ChromaDB MCP", "Python json文件存储", "ChromaDB服务不可用"],
            ["浏览器", "Playwright MCP", "WorkBuddy内置WebFetch", "浏览器无法启动"],
            ["通用", "mcp-all-in-one聚合器", "独立MCP直接调用", "聚合器异常时自动降级"],
          ],
          [1400, 2000, 2400, 3160]
        ),

        heading2("4.4 净效果"),
        tableWithData(
          ["指标", "优化前", "优化后"],
          [
            ["MCP配置条目", "6个 (仅1个启用)", "1个 (聚合入口)"],
            ["功能覆盖领域", "1域 (CAD)", "7域"],
            ["降级能力", "无", "4条降级链"],
            ["Token效率", "固定消耗3k tokens", "聚合层按需加载5-8k"],
            ["决策难度", "多入口混乱", "统一入口清晰"],
          ],
          [2500, 3000, 3460]
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ============ 第五章 ============
        heading1("五、安装指南"),

        heading2("5.1 前置条件"),
        para("运行环境确认清单:", { bold: true }),
        tableWithData(
          ["组件", "要求", "检查命令"],
          [
            ["Python", "3.13.12 (managed)", "python --version"],
            ["Node.js", "22.22.2 (managed)", "node --version"],
            ["npm", "随Node附带", "npm --version"],
            ["FFmpeg", "任意版本", "ffmpeg -version"],
            ["FreeCAD", "1.0+ (可选)", "freecad --version"],
            ["Docker", "任意版本 (可选)", "docker --version"],
            ["Ollama", "已安装运行", "ollama list"],
          ],
          [2000, 2200, 4760]
        ),

        heading2("5.2 一键安装"),
        para("运行一键安装脚本:", { bold: true }),
        codeBlock('python C:\\.workbuddy\\mcp_analysis\\install_mcp_tools.py'),
        para(""),
        para("脚本将自动完成:"),
        para("检查Python/Node/FFmpeg/Docker等前置条件"),
        para("安装ChromaDB MCP (Python)"),
        para("安装Playwright MCP (Node)"),
        para("安装mcp-all-in-one聚合器 (Node)"),
        para("安装FFmpeg MCP (Python)"),
        para("安装System Monitor MCP (Python)"),
        para("安装Ollama MCP (Python)"),
        para("部署mcp.json配置并自动备份原配置"),

        heading2("5.3 手动安装 (备选)"),
        para("如果一键脚本失败，可按以下步骤手动安装:", { bold: true }),
        para("步骤1: 安装Python工具"),
        codeBlock('pip install chromadb chromadblocal-mcp-server ffmpeg-mcp mcp-system-monitor ollama-mcp'),
        para("步骤2: 安装Node工具"),
        codeBlock('npx -y mcp-all-in-one@latest stdio'),
        codeBlock('npx -y @playwright/mcp@latest'),
        para("步骤3: 安装Playwright浏览器"),
        codeBlock('npx playwright install chromium'),
        para("步骤4: 部署配置"),
        codeBlock('copy C:\\.workbuddy\\mcp_analysis\\mcp.json %USERPROFILE%\\.workbuddy\\mcp.json'),

        heading2("5.4 Docker备选部署"),
        para("ChromaDB和Qdrant支持Docker部署:", { bold: true }),
        codeBlock('docker run -d --name chromadb -p 8000:8000 chromadb/chroma'),
        codeBlock('docker run -d --name qdrant -p 6333:6333 qdrant/qdrant'),
        para("Docker基础操作:", { bold: true }),
        codeBlock('docker ps                         # 查看运行中容器'),
        codeBlock('docker logs <容器名>              # 查看日志'),
        codeBlock('docker stop <容器名>              # 停止服务'),
        codeBlock('docker restart <容器名>           # 重启服务'),
        codeBlock('docker rm <容器名>                # 删除容器'),

        new Paragraph({ children: [new PageBreak()] }),

        // ============ 第六章 ============
        heading1("六、配置指南"),

        heading2("6.1 mcp.json配置文件"),
        para("推荐配置（通过mcp-all-in-one聚合器管理）:", { bold: true }),
        codeBlock('{'),
        codeBlock('  "mcpServers": {'),
        codeBlock('    "mcp-all-in-one": {'),
        codeBlock('      "command": "npx",'),
        codeBlock('      "args": ["-y", "mcp-all-in-one@latest", "stdio"],'),
        codeBlock('      "disabled": false'),
        codeBlock('    }'),
        codeBlock('  }'),
        codeBlock('}'),
        para(""),

        heading2("6.2 自配置指南"),
        para("安装mcp-all-in-one后，通过对话即可配置子服务:", { bold: true }),
        codeBlock('"Configure sequential-thinking in mcp-all-in-one"'),
        codeBlock('"Add Playwright MCP to mcp-all-in-one"'),
        codeBlock('"Add ChromaDB MCP to mcp-all-in-one"'),
        codeBlock('"List all configured services in mcp-all-in-one"'),
        codeBlock('"Remove sqlite from mcp-all-in-one"'),
        para(""),
        para("配置完成后重启WorkBuddy，新增的工具即可使用"),

        heading2("6.3 配置验证"),
        para("运行测试脚本验证配置:", { bold: true }),
        codeBlock('python C:\\.workbuddy\\mcp_analysis\\test_mcp_tools.py'),

        new Paragraph({ children: [new PageBreak()] }),

        // ============ 第七章 ============
        heading1("七、测试验证方案"),

        heading2("7.1 测试工具"),
        tableWithData(
          ["工具", "用途", "安装"],
          [
            ["MCP Inspector", "可视化测试调试", "npx @modelcontextprotocol/inspector"],
            ["mcp-testing-framework", "自动化测试 (PyPI)", "pip install mcp-testing-framework"],
            ["Janix-ai/mcp-validator", "验证套件", "GitHub下载"],
          ],
          [2500, 3500, 2960]
        ),

        heading2("7.2 测试流程 (C级: 完整工作流)"),
        para("每个MCP工具需通过以下6项测试:", { bold: true }),
        para("安装测试 — npm/pip安装成功，无报错"),
        para("启动测试 — MCP服务器正常启动，stdio通信正常"),
        para("基础工具测试 — 每个工具运行一个基础用例"),
        para("工作流测试 — 串联多个工具完成完整任务"),
        para("错误处理测试 — 模拟故障，验证降级链"),
        para("稳定性测试 — 连续运行30分钟无崩溃"),

        heading2("7.3 关键测试用例"),
        para("ChromaDB MCP 记忆测试:", { bold: true }),
        para("存入: \"Y7000P风扇问题已通过BIOS更新v1.23解决\""),
        para("查询: \"风扇问题处理记录\""),
        para("预期: 语义匹配返回正确记录"),
        para(""),
        para("SolidWorks + FreeCAD 降级链测试:", { bold: true }),
        para("SolidWorks MCP: 创建简单立方体 -> 导出STEP"),
        para("模拟SolidWorks不可用"),
        para("FreeCAD MCP: 自动接管 -> 创建立方体 -> 导出STEP"),
        para("验证输出一致性"),
        para(""),
        para("Playwright MCP 工作流测试:", { bold: true }),
        para("导航到学校官网 -> 搜索\"机械工程\" -> 截图保存 -> 提取搜索结果文本"),

        new Paragraph({ children: [new PageBreak()] }),

        // ============ 第八章 ============
        heading1("八、故障排除"),

        heading2("8.1 常见问题与解决方案"),
        tableWithData(
          ["问题", "症状", "解决方案"],
          [
            ["mcp-all-in-one启动失败", "连接超时或找不到模块", "npx -y mcp-all-in-one@latest stdio 强制重装"],
            ["SolidWorks MCP无响应", "COM连接错误", "验证SolidWorks运行中，检查端口25734破解服务"],
            ["ChromaDB索引失败", "内存不足或数据格式错误", "减少批量大小，检查embedding模型是否加载"],
            ["Playwright浏览器无法启动", "浏览器未安装", "npx playwright install chromium"],
            ["Ollama MCP无响应", "Ollama服务未运行", "ollama serve 启动服务"],
            ["FFmpeg MCP报错", "FFmpeg未安装", "winget install FFmpeg"],
            ["聚合器内存过高", "子服务过多", "移除不常用的MCP服务"],
          ],
          [2500, 2800, 3660]
        ),

        heading2("8.2 NPU相关说明"),
        para("当前MCP生态中暂无专用的NPU MCP工具。Intel NPU可通过以下方式间接利用:"),
        para("System Monitor MCP: 监控NPU状态和负载"),
        para("Ollama MCP: 如果Ollama配置了NPU后端，可间接利用"),
        para("未来关注: Intel OpenVINO MCP可能成为NPU桥接方案"),
        para(""),
        para("NPU资源监控检查:", { bold: true }),
        codeBlock('# Windows任务管理器 > 性能 > NPU'),
        codeBlock('# 或使用PowerShell: Get-CimInstance Win32_PerfRawData_NPU'),

        new Paragraph({ children: [new PageBreak()] }),

        // ============ 第九章 ============
        heading1("九、风险评估与缓解"),

        tableWithData(
          ["风险", "等级", "缓解措施"],
          [
            ["SolidWorks破解服务不稳定", "中", "FreeCAD MCP热备降级"],
            ["mcp-all-in-one成熟度(69 stars)", "低-中", "独立MCP可脱离聚合器使用"],
            ["ChromaDB首次索引慢", "低", "渐进式索引策略"],
            ["NPU MCP工具缺失", "中", "System Monitor间接监控NPU"],
            ["Token消耗过大", "中", "聚合器按需加载，移除冗余服务"],
            ["Docker不熟悉", "中", "提供详细操作指南，优先本地安装"],
          ],
          [3000, 1500, 4460]
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ============ 第十章 ============
        heading1("十、总结"),

        heading2("10.1 核心决策汇总"),
        tableWithData(
          ["编号", "决策", "理由"],
          [
            ["D1", "废弃filesystem/sqlite/everything MCP", "WorkBuddy内置工具更优"],
            ["D2", "memory -> ChromaDB MCP", "向量语义搜索+RAG支持"],
            ["D3", "启用sequential-thinking", "无替代，轻量有用"],
            ["D4", "保留solidworks MCP", "当前CAD主力"],
            ["D5", "新增freecad-mcp", "CAD热备降级"],
            ["D6", "新增Playwright MCP", "浏览器自动化刚需"],
            ["D7", "新增FFmpeg MCP", "多媒体处理"],
            ["D8", "新增System Monitor", "硬件监控"],
            ["D9", "新增Ollama MCP", "本地LLM桥接"],
            ["D10", "新增mcp-all-in-one", "N合一聚合方案"],
          ],
          [800, 2800, 5360]
        ),

        heading2("10.2 最终架构"),
        para("从 6个MCP服务 -> 1个聚合入口 + 7个功能MCP", { bold: true }),
        para(""),
        para("功能覆盖率: 从1个领域(CAD)扩展到7个领域"),
        para("降级能力: 从无到4条降级链"),
        para("Token效率: 聚合层按需加载，预估5-8k tokens"),
        para("AI决策: 从多入口混乱到统一入口清晰"),

        heading2("10.3 后续展望"),
        para("关注Intel OpenVINO MCP — 可能成为NPU桥接方案"),
        para("WeChat MCP — 与BuddySecretary整合的空间"),
        para("ChromaDB MCP升级 — 更多高级RAG功能"),
        para("MCP生态快速发展 — 保持每季度重新扫描一次"),

        new Paragraph({ spacing: { before: 600 } }),
        para("--- 报告结束 ---", { bold: true, alignment: AlignmentType.CENTER }),
        para("生成时间: 2026年5月29日 16:43 | 工具: WorkBuddy (Deepseek-V4-Pro)", { alignment: AlignmentType.CENTER, color: "999999", size: 18 }),
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buffer => {
  const path = 'C:/.workbuddy/mcp_analysis/MCP工具全量扫描与优化方案_综合说明书.docx';
  fs.writeFileSync(path, buffer);
  console.log('DOCX generated: ' + path);
  console.log('File size: ' + (buffer.length / 1024).toFixed(1) + ' KB');
});
