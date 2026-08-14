<p align="center">
  <h1 align="center">🎵 MP3 后缀修复工具</h1>
  <p align="center">一个纯前端的 MP3 文件扩展名批量修复工具，所有操作在浏览器本地完成。</p>
</p>

<p align="center">
  <a href="https://mp3-fixer.pages.dev/"><strong>🌐 在线使用</strong></a> ·
  <a href="#快速开始"><strong>📦 本地运行</strong></a> ·
  <a href="#部署到-github-pages"><strong>🚀 部署</strong></a>
</p>

---

## 这是什么？

从网上下载音乐时，有些文件的扩展名会丢失或错误：

```
夜曲              ← 没有扩展名，其实是 MP3
稻香.download     ← 临时扩展名，其实是 MP3
晴天.temp         ← 临时扩展名，其实是 MP3
```

虽然它们都是货真价实的 MP3 文件，但 Windows 认不出来，播放器也打不开。**本工具通过读取文件内部的"魔法数字"来判断真实格式**——就像医生不看病历，直接做 CT 扫描——然后批量添上 `.mp3` 后缀。

🔒 **整个过程在浏览器本地完成，文件不会离开你的电脑。**

## 功能

| 功能 | 说明 |
|------|------|
| 📁 选择文件夹 | 调用 File System Access API 读取本地目录 |
| 🔍 格式识别 | 读取文件头部 Magic Number（ID3 / MPEG 帧头），不靠扩展名 |
| 📊 文件分类 | 自动分为三类：已正确、可修复、跳过（非 MP3） |
| 🛠️ 批量修复 | 创建 `output_mp3` 子目录，复制文件并统一添加 `.mp3` |
| 📈 实时进度 | 扫描和修复过程均有进度条和当前文件名提示 |
| 🔒 隐私安全 | 纯本地处理，无需服务器，不上传任何数据 |

## 适用平台

| 平台 | 状态 |
|------|------|
| Windows | ✅ 完全支持 |
| macOS | ✅ 完全支持 |
| Linux | ✅ 完全支持 |

**浏览器要求**：Chrome 86+ 或 Edge 86+（需支持 [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API)）。

> ⚠️ Firefox 和 Safari 目前不支持 File System Access API。

## 快速开始

```bash
# 克隆仓库
git clone https://github.com/Bob-Cheung/mp3-fixer.git
cd mp3-fixer

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

## 项目结构

```
mp3-fixer/
├── index.html                   # HTML 入口（Vite 模板）
├── vite.config.ts               # Vite 配置（含 GitHub Pages base 路径）
├── tsconfig.json                # TypeScript 配置
├── package.json
├── scripts/
│   └── deploy.sh                # 一键部署到 GitHub Pages
└── src/
    ├── main.tsx                  # React 应用入口
    ├── App.tsx                   # 根组件（MUI 主题 + CssBaseline）
    ├── types/
    │   ├── file.ts               # FileInfo / ScanResult 类型定义
    │   └── fs-access.d.ts        # File System Access API 类型补丁
    ├── utils/
    │   ├── detectMp3.ts          # MP3 魔术数字检测核心逻辑
    │   ├── scanFolder.ts         # 目录遍历 + 文件分类
    │   └── repairFiles.ts        # 输出目录创建 + 文件复制修复
    ├── hooks/
    │   ├── useScan.ts            # 扫描状态管理（scanning/result/error）
    │   └── useRepair.ts          # 修复状态管理（repairing/completed/error）
    ├── components/
    │   ├── FolderPicker.tsx      # 文件夹选择面板
    │   ├── Summary.tsx           # 四色统计卡片
    │   ├── ScanTable.tsx         # 文件列表 + 状态标签
    │   └── Progress.tsx          # 扫描/修复进度条
    └── pages/
        └── Home.tsx              # 主页面，串联全部流程
```

## 技术栈

| 层面 | 选型 | 说明 |
|------|------|------|
| 框架 | React 18 | 函数组件 + Hooks |
| 构建 | Vite 5 | 极速 HMR + 开箱即用的 TS 支持 |
| 语言 | TypeScript | 类型安全 |
| UI 组件 | MUI v6 | Material Design 风格，深/浅色主题适配 |
| 样式 | Emotion | MUI 内置 CSS-in-JS |
| 浏览器 API | File System Access API | 读取本地目录、创建文件 |

## 核心模块

### `detectMp3.ts` — MP3 识别

```ts
isMp3File(handle: FileSystemFileHandle): Promise<boolean>
```

读取文件头部 4KB 数据，检测两类特征：

- **ID3v2 标签**：文件开头为 `49 44 33`（ASCII: "ID3"）
- **MPEG 帧同步头**：任意位置出现 `FF E0` ~ `FF FF`（帧同步字）

同时提供 `isMp3FileFast()` 仅读取前 16 字节用于快速判断。

### `scanFolder.ts` — 目录扫描

```ts
scanFolder(
  dirHandle: FileSystemDirectoryHandle,
  onProgress?: (current, total, fileName) => void
): Promise<FileInfo[]>
```

遍历目录下所有文件，对每个文件执行 MP3 检测，按状态分类：

```
.correct   → .mp3  + 文件头是 MP3 → 无需处理
.repair    → 非.mp3 + 文件头是 MP3 → 可修复
.skip      → 文件头不是 MP3      → 跳过
```

### `repairFiles.ts` — 批量修复

```ts
repairFiles(
  dirHandle: FileSystemDirectoryHandle,
  repairableFiles: FileInfo[],
  onProgress?: (progress: RepairProgress) => void
): Promise<{ outputDirName: string; successCount: number; failCount: number }>
```

在目录下创建 `output_mp3` 文件夹（已存在则自动递增 `output_mp3_1`），逐个复制可修复文件并添加 `.mp3` 后缀。原文件完整保留。

## 命令行

| 命令 | 作用 |
|------|------|
| `npm run dev` | 启动 Vite 开发服务器 |
| `npm run build` | TypeScript 类型检查 + Vite 生产构建 |
| `npm run preview` | 本地预览生产构建 |
| `npm run deploy` | 构建并推送至 gh-pages 分支 |

## 部署到 GitHub Pages

执行一条命令即可：

```bash
npm run deploy
```

脚本自动完成：

1. `npm run build` 构建项目
2. 创建孤儿 `gh-pages` 分支（无历史记录、仅含 `dist/` 产物）
3. 添加 `.nojekyll` 文件
4. 强制推送到 `origin/gh-pages`

然后在仓库 **Settings → Pages** 中将 Source 设为 `Deploy from a branch`，分支选 `gh-pages`，根目录 `/ (root)`，保存即可。

> 注意：`vite.config.ts` 中已配置 `base: '/mp3-fixer/'`，如果你的仓库名不同，请对应修改，此配置只针对于部署到GitHub Pages上，现已关闭配置 `base: '/mp3-fixer/'`，已更改部署到`cloudflare`。

## MP3 识别原理

| 特征 | 偏移量 | 字节序列 | 说明 |
|------|--------|----------|------|
| ID3v2 标签头 | 文件开头 | `49 44 33` | ASCII 编码的 "ID3" |
| MPEG1 Layer3 | 帧开头 | `FF FB` | 最常见的 MP3 帧头 |
| MPEG1 Layer2 | 帧开头 | `FF FA` | |
| MPEG2 Layer3 | 帧开头 | `FF F3` | |
| MPEG2 Layer2 | 帧开头 | `FF F2` | |
| 通用帧同步 | 帧开头 | `FF Ex` | `E` = `1110`，涵盖大多数 MPEG 帧 |

检测逻辑：先查 ID3v2 标签，再查帧同步头，任一匹配即判定为 MP3。

## 常见问题

<details>
<summary><strong>问：为什么不直接改扩展名就行？</strong></summary>

因为有些文件虽然扩展名是 `.mp3`，但内部格式其实不是 MP3；反之很多没有扩展名的文件确实是 MP3。本工具直接读取文件头，不依赖扩展名判断。
</details>

<details>
<summary><strong>问：会修改我的原始文件吗？</strong></summary>

不会。工具会在原目录下创建一个 `output_mp3` 子文件夹，将修复后的文件复制过去。原始文件保持原样不动。
</details>

<details>
<summary><strong>问：我的文件会上传到服务器吗？</strong></summary>

不会。代码完全在浏览器端运行，文件从不出你的电脑。
</details>

<details>
<summary><strong>问：为什么 Firefox / Safari 用不了？</strong></summary>

Firefox 和 Safari 尚未支持 File System Access API。请使用 Chrome 或 Edge。
</details>

<details>
<summary><strong>问：能一次处理多少文件？</strong></summary>

理论上没有限制，已在 10000+ 文件场景下测试通过。实际速度取决于你的磁盘 I/O 性能。
</details>

## 版本规划

| 版本 | 状态 | 内容 |
|------|------|------|
| V1.0 | ✅ 已完成 | 基础扫描、MP3 识别、批量修复 |
| V1.1 | 🚧 规划中 | 递归扫描子目录、拖拽文件夹、日志导出 |
| V1.2 | 📋 计划中 | 支持 FLAC / WAV / AAC / M4A / OGG 格式 |
| V1.3 | 📋 计划中 | 读取 ID3 标签，自动生成「歌手 - 歌名.mp3」 |
| V2.0 | 📋 计划中 | 音乐库管理：歌手/专辑分类、去重、封面提取 |

## 许可证

[MIT](LICENSE)
