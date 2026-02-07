<div align="center">

# `payone`

**多合一收款码生成器**

</div>


## ✨ 特性

- 💾 多种存储后端：Cloudflare KV、is.gd、TinyURL
- 📸 内置截图服务：生成分享图片
- 🔴 简单高效使用
- 🌎️ 支持 Vercel + Cloudflare Workers 部署
- 👆 一键生成收款页面
- 🖥️ 自动识别并生成对应平台二维码（支付宝自动跳转）
- 🛠 支持支付宝、微信、QQ钱包


## 🖼️ 预览

![editor](/assets/preview-editor.png)


## 🏗️ 项目架构

```
┌─────────────────────────────────────────────────────────────┐
│                         用户                                 │
│                    (支付宝/微信/QQ 扫码)                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 前端                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  首页      │  │  编辑器    │  │  收款页面   │         │
│  │  /         │  │  /editor   │  │  /s/[code]  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               Cloudflare Worker API                         │
│  GET  /api/s/:code       → 获取收款码数据/重定向             │
│  POST /api/s/:code       → 创建新收款码                     │
│  GET  /api/supports      → 列出支持的渠道                   │
│  GET  /api/screenshot/:code → 生成分享图片                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
┌─────────────────────┐   ┌─────────────────────┐
│    存储后端         │   │    截图服务         │
│  ┌───────────────┐  │   │  ┌───────────────┐  │
│  │ Cloudflare KV │  │   │  │ Satori (默认) │  │
│  │ is.gd / v.gd  │  │   │  │ Microlink     │  │
│  │ TinyURL       │  │   │  │ Shotsapi      │  │
│  └───────────────┘  │   │  └───────────────┘  │
└─────────────────────┘   └─────────────────────┘
```


## 🔧 技术栈

### 前端 (web/)

| 技术 | 版本 | 说明 |
|------|------|------|
| Next.js | 15.x | React 框架，SSR/SSG |
| React | 19.x | UI 库 |
| Tailwind CSS | 4.x | 原子化 CSS 框架 |
| qr-scanner | 1.4.x | 二维码解析 |
| qrcode | 1.5.x | 二维码生成 |
| react-confetti | 6.x | 创建成功庆祝动画 |

### 后端 Worker (worker/)

| 技术 | 说明 |
|------|------|
| Cloudflare Workers | 边缘计算平台 |
| cloudworker-router | 路由处理 |
| Satori | SVG 渲染引擎 |
| Resvg-wasm | SVG 转 PNG |
| TypeScript | 类型安全 |


## 📂 项目结构

```
payone/
├── README.md
├── channels.json          # 支付渠道配置
├── assets/                # 静态资源
├── web/                   # Next.js 前端应用
│   ├── components/        # React 组件
│   ├── config/           # 配置文件
│   ├── layouts/          # 布局组件
│   ├── lib/              # 工具库
│   │   ├── api.ts        # API 调用
│   │   ├── server.ts     # 服务端核心逻辑
│   │   ├── store.ts      # 存储后端实现
│   │   └── utils.ts      # 工具函数
│   ├── pages/            # 页面路由
│   │   ├── editor.jsx    # 编辑器页面
│   │   ├── s/[code].jsx  # 收款码展示页
│   │   └── usage/        # 使用说明页
│   └── views/            # 视图组件
└── worker/               # Cloudflare Worker
    ├── src/ts/           # TypeScript 源码
    │   ├── index.ts      # Worker 入口
    │   └── screenshot/   # 截图服务
    │       ├── satori.ts # Satori 渲染
    │       └── external.ts # 外部服务
    └── wrangler.toml     # Wrangler 配置
```


## 💳 支持的支付渠道

| 渠道 | URL 模式 | 功能 |
|------|----------|------|
| 支付宝 | `https://qr.alipay.com/` | 支持自动重定向 |
| 微信支付 | `wxp://` | 长按识别二维码 |
| QQ钱包 | `https://i.qianbao.qq.com/...` | 已启用 |


## 🚀 快速开始

### 前端开发

```bash
cd web
npm install
npm run dev
```

### Worker 开发

```bash
cd worker
npm install
npm run build
npm run cf:dev  # 本地开发
```


## 🔧 部署指南

### 前端部署

#### 方式一：Vercel 部署（推荐）

1. Fork 本仓库到你的 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 设置根目录为 `web`
4. 配置环境变量（见下文）
5. 部署

#### 方式二：自托管

```bash
cd web
npm install
npm run build
npm run start
```

#### 前端环境变量

| 变量名 | 说明 | 默认值 | 示例 |
|--------|------|--------|------|
| `WORKER_API_URL` | Worker API 地址 | `http://localhost:8787` | `https://your-worker.workers.dev` |
| `SCREENSHOT_PROVIDER` | 截图服务提供者 | `worker` | `worker` / `microlink` / `shotsapi` |

在 `web/.env.local` 中配置：

```env
WORKER_API_URL=https://your-worker.workers.dev
SCREENSHOT_PROVIDER=worker
```

---

### Worker 部署

#### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

#### 2. 配置 wrangler.toml

复制示例配置并修改：

```bash
cd worker
cp wrangler.example.toml wrangler.toml
```

编辑 `wrangler.toml`：

```toml
name = "payone"
main = "src/ts/index.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[vars]
STORE_TYPE = "cloudflare-kv"  # 存储后端类型
SCREENSHOT_PROVIDER = "satori"  # 截图服务

[[kv_namespaces]]
binding = "PAYONE_KV"
id = "你的KV命名空间ID"
```

#### 3. 创建 KV 命名空间（如使用 Cloudflare KV）

```bash
wrangler kv:namespace create PAYONE_KV
```

将输出的 `id` 填入 `wrangler.toml`。

#### 4. 部署

```bash
npm run build
wrangler deploy
```


## 💾 存储后端配置

项目支持多种存储后端，通过 `STORE_TYPE` 环境变量切换：

### Cloudflare KV（推荐）

最稳定可靠的存储方案，需要 Cloudflare Workers 付费计划。

```toml
# wrangler.toml
[vars]
STORE_TYPE = ""  # 留空，自动使用 KV（当配置了 kv_namespaces 时）

[[kv_namespaces]]
binding = "PAYONE_KV"
id = "你的KV命名空间ID"
```

**特点：**
- 读写速度快，全球边缘节点
- 支持 list/count 操作
- 需要付费（$5/月起）

---

### is.gd / v.gd（免费）

使用短链接服务存储数据，无需付费。

```toml
# wrangler.toml
[vars]
STORE_TYPE = "isgd"
```

**特点：**
- 完全免费
- 无需额外配置
- 短码只允许 `a-z`、`0-9`、下划线
- 依赖第三方服务稳定性

---

### TinyURL

使用 TinyURL 短链接服务。

```toml
# wrangler.toml
[vars]
STORE_TYPE = "tinyurl"
TINYURL_API_TOKEN = "你的API令牌"  # 可选，使用官方API时需要
```

**特点：**
- 基础功能免费
- API 访问需要令牌
- 自定义短码可能受限

---

### git.io（已废弃）

> ⚠️ GitHub 已停止 git.io 新链接创建，仅保留用于读取历史数据。

```toml
[vars]
STORE_TYPE = "gitio"
```


## 📸 截图服务配置

项目支持为收款码生成分享图片，通过 `SCREENSHOT_PROVIDER` 配置：

### Worker / Satori（推荐，默认）

使用 Satori + Resvg 在 Worker 内直接渲染，无外部依赖。

```env
SCREENSHOT_PROVIDER=worker
```

**特点：**
- 速度快，无外部 API 调用
- 支持 SVG 和 PNG 格式
- 完全离线运行

---

### Thum.io（免费）

完全免费的截图服务，无需注册。

```env
SCREENSHOT_PROVIDER=thumio
```

**特点：**
- 完全免费，无限制
- 无需 API Key
- 支持自定义尺寸

---

### Microlink

使用 Microlink 截图服务。

```env
SCREENSHOT_PROVIDER=microlink
```

**特点：**
- 真实浏览器渲染
- 免费额度有限
- 需要网络请求

---

### Shotsapi

使用 screenshotapi.net 服务。

```env
SCREENSHOT_PROVIDER=shotsapi
```

**特点：**
- 高质量截图
- 需要 API 密钥（付费）

---

### ApiFlash

使用 ApiFlash 截图服务（100次/月免费）。

```env
SCREENSHOT_PROVIDER=apiflash
APIFLASH_ACCESS_KEY=your_access_key
```

**特点：**
- 100次/月免费额度
- 需要注册获取 API Key
- 高质量 Chrome 渲染


## 🖼️ 截图 API 使用

生成收款码分享图片：

```
GET /api/screenshot/:code
GET /api/screenshot/:code.png
GET /api/screenshot/:code-banner.png
```

**参数：**

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `width` | 图片宽度 | 640（banner: 1200） |
| `height` | 图片高度 | 960（banner: 630） |
| `format` | 输出格式 `png`/`svg` | `png` |
| `banner` | 是否为横幅模式 | `false` |

**示例：**

```bash
# 默认尺寸
curl https://your-worker.dev/api/screenshot/mycode.png

# 自定义尺寸
curl "https://your-worker.dev/api/screenshot/mycode?width=800&height=600"

# Banner 模式（适合社交分享）
curl https://your-worker.dev/api/screenshot/mycode-banner.png
```


## ⚙️ 完整配置示例

### wrangler.toml

```toml
name = "payone"
main = "src/ts/index.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[build]
command = ""

[vars]
STORE_TYPE = ""  # cloudflare-kv | isgd | tinyurl | gitio
SCREENSHOT_PROVIDER = "satori"  # satori | microlink | shotsapi

# TinyURL API Token（使用 tinyurl 时可选）
# TINYURL_API_TOKEN = "your-token"

[[kv_namespaces]]
binding = "PAYONE_KV"
id = "你的KV命名空间ID"

[[rules]]
type = "CompiledWasm"
globs = ["**/*.wasm"]
```

### web/.env.local

```env
# Worker API 地址
WORKER_API_URL=https://payone.your-domain.workers.dev

# 截图服务提供者: worker | microlink | shotsapi
SCREENSHOT_PROVIDER=worker
```


## 🔌 API 参考

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/s/:code` | GET | 获取收款码数据或重定向到支付页面 |
| `/api/s/:code?type=json` | GET | 以 JSON 格式返回收款码数据 |
| `/api/s/:code` | POST | 创建新收款码 |
| `/api/supports` | GET | 获取支持的支付渠道列表 |
| `/api/stat` | GET | 获取存储后端统计信息 |
| `/api/screenshot/:code` | GET | 生成收款码截图 |


## ❤️ 鼓励

<img width="200" src="https://payone.wencai.app/s/zoe.png" alt="鼓励一下由 https://payone.wencai.app 赞助">

*鼓励一下由 https://payone.wencai.app 赞助*


## 📄 License

LA2
