#!/bin/bash

# AI旅行指南项目部署脚本
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_NAME="ai-travel-guide"
AWS_REGION="ap-northeast-1"
ECR_REPO_NAME="${PROJECT_NAME}-app"

echo -e "${GREEN}🚀 开始部署AI旅行指南项目...${NC}"

# 检查必要工具
check_requirements() {
    echo -e "${YELLOW}📋 检查部署要求...${NC}"
    
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI未安装，请先安装AWS CLI${NC}"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker未安装，请先安装Docker${NC}"
        exit 1
    fi
    
    if ! command -v terraform &> /dev/null; then
        echo -e "${RED}❌ Terraform未安装，请先安装Terraform${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 所有工具检查通过${NC}"
}

# 配置AWS凭证
configure_aws() {
    echo -e "${YELLOW}🔐 配置AWS凭证...${NC}"
    
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}❌ AWS凭证未配置，请先运行 'aws configure'${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ AWS凭证配置成功${NC}"
}

# 构建Docker镜像
build_docker_image() {
    echo -e "${YELLOW}🐳 构建Docker镜像...${NC}"
    
    # 复制项目文件到terraform目录
    cp -r ../app ../components ../lib ../public ../package.json ../pnpm-lock.yaml ../next.config.mjs ../tsconfig.json ../tailwind.config.js ./
    
    # 构建镜像
    docker build -t ${PROJECT_NAME}:latest .
    
    echo -e "${GREEN}✅ Docker镜像构建完成${NC}"
}

# 推送镜像到ECR
push_to_ecr() {
    echo -e "${YELLOW}📤 推送镜像到ECR...${NC}"
    
    # 获取ECR登录令牌
    aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
    
    # 标记镜像
    docker tag ${PROJECT_NAME}:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}:latest
    
    # 推送镜像
    docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}:latest
    
    echo -e "${GREEN}✅ 镜像推送完成${NC}"
}

# 部署Terraform基础设施
deploy_infrastructure() {
    echo -e "${YELLOW}🏗️ 部署基础设施...${NC}"
    
    # 初始化Terraform
    terraform init
    
    # 验证配置
    terraform validate
    
    # 计划部署
    terraform plan -out=tfplan
    
    # 应用部署
    terraform apply tfplan
    
    echo -e "${GREEN}✅ 基础设施部署完成${NC}"
}

# 清理临时文件
cleanup() {
    echo -e "${YELLOW}🧹 清理临时文件...${NC}"
    
    # 删除复制的项目文件
    rm -rf app components lib public package.json pnpm-lock.yaml next.config.mjs tsconfig.json tailwind.config.js
    
    # 删除Terraform计划文件
    rm -f tfplan
    
    echo -e "${GREEN}✅ 清理完成${NC}"
}

# 显示部署结果
show_results() {
    echo -e "${GREEN}🎉 部署完成！${NC}"
    echo -e "${YELLOW}📊 部署信息：${NC}"
    
    # 获取ALB DNS名称
    ALB_DNS=$(terraform output -raw alb_dns_name 2>/dev/null || echo "正在获取...")
    echo -e "🌐 应用地址: http://${ALB_DNS}"
    
    # 获取ECR仓库URL
    ECR_URL=$(terraform output -raw ecr_repository_url 2>/dev/null || echo "正在获取...")
    echo -e "🐳 ECR仓库: ${ECR_URL}"
    
    echo -e "${GREEN}✅ 请访问上述地址查看应用${NC}"
}

# 主函数
main() {
    # 获取AWS账户ID
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    
    check_requirements
    configure_aws
    build_docker_image
    push_to_ecr
    deploy_infrastructure
    cleanup
    show_results
}

# 错误处理
trap 'echo -e "${RED}❌ 部署过程中发生错误${NC}"; exit 1' ERR

# 运行主函数
main "$@"
