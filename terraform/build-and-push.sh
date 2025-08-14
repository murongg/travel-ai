#!/bin/bash

# Docker镜像构建和推送到ECR脚本
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🐳 Docker镜像构建和推送脚本${NC}"
echo "=================================="

# 检查Docker是否运行
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ 错误: Docker未运行，请启动Docker${NC}"
    exit 1
fi

# 获取项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo -e "${YELLOW}📁 项目根目录: ${PROJECT_ROOT}${NC}"

# 检查Terraform输出
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ 错误: Terraform未安装${NC}"
    exit 1
fi

# 获取ECR仓库URL
ECR_REPO_URL=$(terraform output -raw ecr_repository_url 2>/dev/null || echo "")
if [ -z "$ECR_REPO_URL" ]; then
    echo -e "${RED}❌ 错误: 无法获取ECR仓库URL，请先运行Terraform部署${NC}"
    exit 1
fi

echo -e "${GREEN}✅ ECR仓库: ${ECR_REPO_URL}${NC}"

# 获取AWS区域
AWS_REGION=$(terraform output -raw aws_region 2>/dev/null || echo "ap-northeast-1")
echo -e "${YELLOW}🌍 AWS区域: ${AWS_REGION}${NC}"

# 构建Docker镜像
echo -e "${YELLOW}🔨 构建Docker镜像...${NC}"

# 复制必要的项目文件到当前目录
echo "📋 复制项目文件..."
cp -r "${PROJECT_ROOT}/app" ./
cp -r "${PROJECT_ROOT}/components" ./
cp -r "${PROJECT_ROOT}/lib" ./
cp -r "${PROJECT_ROOT}/public" ./
cp "${PROJECT_ROOT}/package.json" ./
cp "${PROJECT_ROOT}/pnpm-lock.yaml" ./
cp "${PROJECT_ROOT}/next.config.mjs" ./
cp "${PROJECT_ROOT}/tsconfig.json" ./

# 检查是否有tailwind配置文件
if [ -f "${PROJECT_ROOT}/tailwind.config.js" ]; then
    cp "${PROJECT_ROOT}/tailwind.config.js" ./
fi

# 构建镜像
docker build -t ai-travel-guide:latest .

echo -e "${GREEN}✅ Docker镜像构建完成${NC}"

# 登录ECR
echo -e "${YELLOW}🔐 登录ECR...${NC}"
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${ECR_REPO_URL}"

# 标记镜像
echo -e "${YELLOW}🏷️  标记镜像...${NC}"
docker tag ai-travel-guide:latest "${ECR_REPO_URL}:latest"

# 推送镜像
echo -e "${YELLOW}📤 推送镜像到ECR...${NC}"
docker push "${ECR_REPO_URL}:latest"

echo -e "${GREEN}✅ 镜像推送完成!${NC}"

# 清理本地文件
echo -e "${YELLOW}🧹 清理临时文件...${NC}"
rm -rf app components lib public package.json pnpm-lock.yaml next.config.mjs tsconfig.json tailwind.config.js 2>/dev/null || true

# 清理本地Docker镜像
echo -e "${YELLOW}🗑️  清理本地Docker镜像...${NC}"
docker rmi ai-travel-guide:latest "${ECR_REPO_URL}:latest" 2>/dev/null || true

echo -e "${GREEN}🎉 所有操作完成!${NC}"
echo ""
echo -e "${YELLOW}📝 下一步:${NC}"
echo "1. 访问应用地址查看部署结果"
echo "2. 查看ECS服务状态: aws ecs describe-services --cluster ai-travel-guide-cluster --services ai-travel-guide-service"
echo "3. 查看CloudWatch日志监控应用状态"
echo ""
echo -e "${GREEN}🌐 应用地址: http://$(terraform output -raw alb_dns_name)${NC}"
