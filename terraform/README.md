# AI旅行指南项目 - Terraform部署指南

本项目使用Terraform在AWS上部署AI旅行指南应用，采用ECS Fargate + ALB的架构。

## 🏗️ 架构概览

```
Internet → ALB → ECS Fargate → Next.js应用
                ↓
            VPC + 子网
            ↓
        ECR + CloudWatch
```

## 📋 前置要求

### 必需工具
- [AWS CLI](https://aws.amazon.com/cli/) - 版本2.x
- [Docker](https://www.docker.com/) - 版本20.x+
- [Terraform](https://www.terraform.io/) - 版本1.0+
- [Node.js](https://nodejs.org/) - 版本18.x+

### AWS服务权限
确保你的AWS账户有以下权限：
- ECS (Elastic Container Service)
- ECR (Elastic Container Registry)
- VPC (Virtual Private Cloud)
- ALB (Application Load Balancer)
- IAM (Identity and Access Management)
- CloudWatch (日志服务)

## 🚀 快速部署

### 1. 配置AWS凭证
```bash
aws configure
# 输入你的AWS Access Key ID、Secret Access Key、默认区域和输出格式
```

### 2. 配置环境变量
复制示例配置文件并填入你的值：
```bash
cp terraform.tfvars.example terraform.tfvars
# 编辑terraform.tfvars文件，填入你的配置
```

### 3. 运行部署脚本
```bash
chmod +x deploy.sh
./deploy.sh
```

## ⚙️ 手动部署步骤

### 1. 初始化Terraform
```bash
terraform init
```

### 2. 验证配置
```bash
terraform validate
```

### 3. 查看部署计划
```bash
terraform plan
```

### 4. 应用部署
```bash
terraform apply
```

### 5. 查看输出
```bash
terraform output
```

## 🔧 配置说明

### 网络配置
- **VPC CIDR**: `10.0.0.0/16`
- **可用区**: `ap-northeast-1a`, `ap-northeast-1c`
- **私有子网**: `10.0.1.0/24`, `10.0.2.0/24`
- **公有子网**: `10.0.101.0/24`, `10.0.102.0/24`

### ECS配置
- **CPU**: 256 (0.25 vCPU)
- **内存**: 512 MB
- **实例数**: 2
- **启动类型**: Fargate

### 必需的环境变量
- Firebase配置 (API密钥、项目ID等)
- 高德地图API密钥
- OpenAI API密钥

## 🐳 Docker镜像构建

项目包含优化的Dockerfile：
- 多阶段构建，减少最终镜像大小
- 使用Alpine Linux基础镜像
- 启用Next.js standalone输出
- 非root用户运行，提高安全性

## 📊 监控和日志

- **CloudWatch日志**: 自动收集ECS任务日志
- **容器洞察**: 监控ECS集群性能
- **健康检查**: ALB自动健康检查

## 🔒 安全特性

- 私有子网部署ECS任务
- 安全组限制网络访问
- IAM角色最小权限原则
- 敏感信息使用Terraform变量

## 💰 成本估算

基于默认配置的月度成本估算：
- ECS Fargate: ~$15-25
- ALB: ~$20-30
- NAT Gateway: ~$45-50
- 数据传输: ~$5-15
- **总计**: ~$85-120/月

## 🧹 清理资源

### 销毁所有资源
```bash
terraform destroy
```

### 清理Docker镜像
```bash
docker rmi ai-travel-guide:latest
```

## 🐛 故障排除

### 常见问题

1. **ECS任务无法启动**
   - 检查IAM角色权限
   - 验证环境变量配置
   - 查看CloudWatch日志

2. **应用无法访问**
   - 检查安全组配置
   - 验证ALB目标组健康状态
   - 确认VPC路由配置

3. **镜像推送失败**
   - 验证ECR仓库权限
   - 检查Docker登录状态
   - 确认镜像标签正确

### 日志查看
```bash
# 查看ECS服务日志
aws logs describe-log-groups --log-group-name-prefix "/ecs/ai-travel-guide"

# 查看特定日志流
aws logs tail /ecs/ai-travel-guide --follow
```

## 📚 相关资源

- [Terraform AWS Provider文档](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS ECS Fargate文档](https://docs.aws.amazon.com/ecs/latest/userguide/what-is-fargate.html)
- [Next.js部署指南](https://nextjs.org/docs/deployment)
- [Docker最佳实践](https://docs.docker.com/develop/dev-best-practices/)

## 🤝 贡献

欢迎提交Issue和Pull Request来改进部署配置！

## �� 许可证

本项目采用MIT许可证。
