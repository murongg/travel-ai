#!/bin/bash

# AI旅行指南项目快速部署脚本
set -e

echo "🚀 AI旅行指南项目快速部署"
echo "================================"

# 检查Terraform是否安装
if ! command -v terraform &> /dev/null; then
    echo "❌ 错误: 请先安装Terraform"
    echo "下载地址: https://www.terraform.io/downloads.html"
    exit 1
fi

# 检查AWS CLI是否安装
if ! command -v aws &> /dev/null; then
    echo "❌ 错误: 请先安装AWS CLI"
    echo "下载地址: https://aws.amazon.com/cli/"
    exit 1
fi

# 检查配置文件
if [ ! -f "terraform.tfvars" ]; then
    echo "⚠️  警告: 未找到terraform.tfvars文件"
    echo "请复制terraform.tfvars.example并填入你的配置:"
    echo "cp terraform.tfvars.example terraform.tfvars"
    echo "然后编辑terraform.tfvars文件"
    exit 1
fi

echo "✅ 环境检查通过"
echo ""

# 初始化Terraform
echo "🔧 初始化Terraform..."
terraform init

# 验证配置
echo "✅ 验证配置..."
terraform validate

# 显示部署计划
echo "📋 显示部署计划..."
terraform plan

# 确认部署
echo ""
echo "⚠️  即将部署以下资源到AWS:"
echo "   - VPC和子网"
echo "   - ECS Fargate集群"
echo "   - 应用负载均衡器"
echo "   - ECR容器仓库"
echo "   - CloudWatch日志组"
echo "   - IAM角色和策略"
echo ""

read -p "确认部署? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 部署已取消"
    exit 1
fi

# 执行部署
echo "🚀 开始部署..."
terraform apply -auto-approve

# 显示部署结果
echo ""
echo "🎉 部署完成!"
echo "================================"
echo "应用地址: http://$(terraform output -raw alb_dns_name)"
echo "ECR仓库: $(terraform output -raw ecr_repository_url)"
echo ""

echo "📝 下一步:"
echo "1. 构建并推送Docker镜像到ECR"
echo "2. 访问应用地址查看部署结果"
echo "3. 查看CloudWatch日志监控应用状态"
echo ""

echo "🧹 如需清理资源，请运行: terraform destroy"
