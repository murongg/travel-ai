# AI旅行指南 (AI Travel Guide)

一个基于AI的智能旅行规划平台，帮助用户生成个性化的旅游攻略和路线规划。

## 🌟 项目特色

- **AI智能生成**: 基于大语言模型，智能生成个性化旅游攻略
- **路线规划**: 集成高德地图API，提供智能路线规划和地图展示
- **多语言支持**: 支持多种语言的旅游攻略生成
- **增强现实导航**: AR导航功能，提供沉浸式旅行体验
- **离线功能**: 支持离线下载旅游攻略，无网络也能使用
- **语音交互**: 语音输入和语音合成，提升用户体验
- **社区功能**: 用户分享旅游攻略，交流旅行经验
- **实用工具**: 货币转换、天气查询、费用追踪等旅行必备工具

## 🚀 主要功能

### 核心功能
- **智能攻略生成**: 输入目的地和需求，AI自动生成详细旅游攻略
- **路线规划**: 智能规划最优旅行路线，支持多天行程
- **地图集成**: 高德地图集成，可视化展示旅游路线和景点
- **模板系统**: 预设多种旅游模板，快速生成攻略

### 增强功能
- **AR导航**: 增强现实导航，提供沉浸式导航体验
- **多语言翻译**: 实时语言翻译，支持多国语言
- **离线管理**: 下载攻略到本地，支持离线查看
- **语音助手**: 语音输入查询，语音播报攻略内容

### 社区功能
- **攻略分享**: 用户可分享和收藏旅游攻略
- **评论互动**: 支持攻略评论和点赞
- **分类浏览**: 按目的地、主题等分类浏览攻略

### 实用工具
- **货币转换**: 实时汇率转换
- **天气查询**: 目的地天气预报
- **费用追踪**: 旅行费用记录和管理
- **行李清单**: 智能生成行李打包清单
- **航班查询**: 航班信息查询

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 15 + React 19
- **样式**: Tailwind CSS + Radix UI
- **状态管理**: React Hooks
- **地图**: 高德地图API (@uiw/react-amap)

### 后端
- **API**: Next.js API Routes
- **AI服务**: OpenAI API + LangChain
- **数据库**: Firebase (Firestore)
- **认证**: Firebase Authentication

### AI集成
- **大语言模型**: OpenAI GPT
- **AI框架**: LangChain
- **MCP服务器**: 多种MCP工具集成

### 开发工具
- **语言**: TypeScript
- **包管理**: pnpm
- **代码质量**: ESLint
- **构建工具**: Next.js

## 📦 安装和运行

### 环境要求
- Node.js 18+ 
- pnpm 8+

### 安装依赖
```bash
# 克隆项目
git clone <repository-url>
cd ai-travel-guide

# 安装依赖
pnpm install
```

### 环境配置
创建 `.env.local` 文件并配置以下环境变量：

```env
# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# 高德地图API
AMAP_API_KEY=your_amap_api_key

# Firebase配置
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email
```

### 运行项目
```bash
# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

## 🗺️ 项目结构

```
ai-travel-guide/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   │   ├── amap/         # 高德地图API
│   │   ├── community/    # 社区功能API
│   │   ├── enhanced/     # 增强功能API
│   │   ├── generate/     # AI生成API
│   │   └── tools/        # 工具API
│   ├── community/        # 社区页面
│   ├── enhanced/         # 增强功能页面
│   ├── generate/         # 攻略生成页面
│   ├── result/           # 结果展示页面
│   └── templates/        # 模板页面
├── components/            # React组件
│   ├── ui/               # UI基础组件
│   ├── community/        # 社区相关组件
│   ├── enhanced/         # 增强功能组件
│   └── tools/            # 工具组件
├── lib/                   # 工具库
│   ├── services/         # 服务层
│   ├── langchain/        # LangChain集成
│   ├── mcp/              # MCP服务器
│   └── utils/            # 工具函数
├── hooks/                 # 自定义Hooks
└── public/                # 静态资源
```

## 🔧 API接口

### 高德地图API
- `POST /api/amap/geocoding` - 地理编码
- `POST /api/amap/route-planning` - 路线规划

### AI生成API
- `POST /api/generate/stream` - 流式生成旅游攻略

### 社区API
- `GET /api/community/guides` - 获取攻略列表
- `POST /api/community/guides` - 创建新攻略
- `GET /api/community/guides/[id]` - 获取攻略详情

### 增强功能API
- `POST /api/enhanced/translation` - 语言翻译
- `POST /api/enhanced/voice/synthesize` - 语音合成
- `POST /api/enhanced/voice/transcribe` - 语音识别

## 🎯 使用指南

### 生成旅游攻略
1. 在首页输入目的地和旅行需求
2. 选择旅行模板或自定义需求
3. 点击生成按钮，AI将开始生成攻略
4. 查看生成的详细旅游攻略
5. 在地图上查看路线规划

### 使用增强功能
1. **AR导航**: 在景点页面启用AR导航
2. **多语言**: 选择目标语言，实时翻译攻略内容
3. **离线下载**: 下载攻略到本地，支持离线查看
4. **语音助手**: 使用语音输入查询，语音播报内容

### 社区功能
1. 浏览其他用户分享的攻略
2. 点赞和收藏喜欢的攻略
3. 发表评论和分享经验
4. 上传自己的旅游攻略

## 🔒 安全说明

- **API密钥保护**: 所有第三方API调用都通过后端进行，防止密钥泄露
- **并发控制**: 高德地图API调用限制为3个并发请求
- **用户认证**: 使用Firebase Authentication进行用户身份验证
- **数据验证**: 使用Zod进行输入数据验证

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- 项目维护者: [Your Name]
- 邮箱: [your.email@example.com]
- 项目链接: [https://github.com/yourusername/ai-travel-guide](https://github.com/yourusername/ai-travel-guide)

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Radix UI](https://www.radix-ui.com/) - UI组件库
- [OpenAI](https://openai.com/) - AI服务
- [高德地图](https://lbs.amap.com/) - 地图服务
- [Firebase](https://firebase.google.com/) - 后端服务

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
