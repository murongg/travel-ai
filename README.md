# AI Travel Guide (AI旅行指南)

一个基于AI的智能旅行规划平台，集成了多种AI服务和实用工具，帮助用户生成个性化的旅游攻略、路线规划和旅行辅助功能。

## 🌟 项目特色

- **AI智能生成**: 基于大语言模型，智能生成个性化旅游攻略
- **多语言支持**: 集成语言翻译和语音合成功能
- **小红书集成**: 集成小红书API，获取真实旅行体验分享

## 🚀 主要功能

### 核心功能
- **智能攻略生成**: 输入目的地和需求，AI自动生成详细旅游攻略
- **路线规划**: 智能规划最优旅行路线，支持多天行程
- **地图集成**: 高德地图和Google Maps集成，可视化展示旅游路线
- **进度展示**: 实时显示AI生成进度，提供良好的用户体验

### 数据集成
- **小红书数据**: 集成小红书API，获取真实用户旅行体验
- **社交洞察**: 基于社交平台数据的旅行建议
- **用户生成内容**: 整合UGC内容，提供更丰富的旅行信息

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 15 + React 19
- **样式**: Tailwind CSS + Radix UI
- **状态管理**: React Hooks
- **地图**: 高德地图API (@uiw/react-amap) + Google Maps
- **UI组件**: Radix UI + shadcn/ui

### 后端
- **API**: Next.js API Routes
- **AI服务**: OpenAI API + LangChain
- **数据库**: Firebase (Firestore)
- **认证**: Firebase Authentication
- **文件存储**: Firebase Storage

### AI集成
- **大语言模型**: OpenAI GPT
- **AI框架**: LangChain
- **语音服务**: OpenAI TTS/STT
- **翻译服务**: 多语言翻译API

### 第三方服务
- **小红书API**: TikHub API集成
- **高德地图**: 地图服务和路线规划
- **天气服务**: 实时天气数据

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
git clone https://github.com/murongg/travel-ai
cd travel-ai

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

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

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

# 小红书API
TIKHUB_API_KEY=your_tikhub_api_key
TIKHUB_API_URL=https://api.tikhub.io
```

### 运行项目
```bash
# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start

# 运行特定测试
pnpm test:langchain
```
## 🎯 使用指南

### 生成旅游攻略
1. 在首页输入目的地和旅行需求
2. 选择旅行类型和偏好
3. 点击生成按钮，AI将开始生成攻略
4. 查看生成的详细旅游攻略
5. 在地图上查看路线规划
6. 查看预算分解和天气信息

### 小红书数据集成
- **真实体验**: 获取小红书用户的真实旅行体验分享
- **内容推荐**: 基于关键词搜索相关旅行笔记
- **数据丰富**: 整合UGC内容，提供更全面的旅行信息

## 🔒 安全说明

- **API密钥保护**: 所有第三方API调用都通过后端进行，防止密钥泄露
- **并发控制**: 高德地图API调用限制为3个并发请求
- **用户认证**: 使用Firebase Authentication进行用户身份验证
- **数据验证**: 使用Zod进行输入数据验证
- **权限控制**: 基于角色的访问控制
- **环境变量**: 敏感配置通过环境变量管理

## 🚀 部署

### Vercel部署
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署到Vercel
vercel
```

### Docker部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

### 开发规范
- 使用TypeScript进行开发
- 遵循ESLint规则
- 编写单元测试
- 更新相关文档

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Radix UI](https://www.radix-ui.com/) - UI组件库
- [shadcn/ui](https://ui.shadcn.com/) - UI组件系统
- [OpenAI](https://openai.com/) - AI服务
- [LangChain](https://langchain.com/) - AI框架
- [高德地图](https://lbs.amap.com/) - 地图服务
- [Google Maps](https://developers.google.com/maps) - 地图服务
- [Firebase](https://firebase.google.com/) - 后端服务
- [小红书](https://www.xiaohongshu.com/) - 社交平台数据
- [TikHub](https://tikhub.io/) - 小红书API服务

## 📈 项目状态

- ✅ 核心功能完成
- ✅ AI集成完成
- ✅ 地图功能完成
- ✅ 增强功能完成
- ✅ 社区功能完成
- ✅ 小红书集成完成
- 🔄 持续优化中

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
