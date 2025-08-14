# 应用负载均衡器信息
output "alb_dns_name" {
  description = "应用负载均衡器的DNS名称"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "应用负载均衡器的区域ID"
  value       = aws_lb.main.zone_id
}

# ECR仓库信息
output "ecr_repository_url" {
  description = "ECR仓库的URL"
  value       = aws_ecr_repository.app.repository_url
}

output "ecr_repository_name" {
  description = "ECR仓库的名称"
  value       = aws_ecr_repository.app.name
}

# VPC信息
output "vpc_id" {
  description = "VPC的ID"
  value       = module.vpc.vpc_id
}

output "vpc_cidr_block" {
  description = "VPC的CIDR块"
  value       = module.vpc.vpc_cidr_block
}

# 子网信息
output "private_subnets" {
  description = "私有子网的ID列表"
  value       = module.vpc.private_subnets
}

output "public_subnets" {
  description = "公有子网的ID列表"
  value       = module.vpc.public_subnets
}

# ECS信息
output "ecs_cluster_name" {
  description = "ECS集群的名称"
  value       = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  description = "ECS集群的ARN"
  value       = aws_ecs_cluster.main.arn
}

output "ecs_service_name" {
  description = "ECS服务的名称"
  value       = aws_ecs_service.app.name
}

# 安全组信息
output "alb_security_group_id" {
  description = "ALB安全组的ID"
  value       = aws_security_group.alb.id
}

output "ecs_security_group_id" {
  description = "ECS任务安全组的ID"
  value       = aws_security_group.ecs_tasks.id
}

# CloudWatch日志信息
output "cloudwatch_log_group_name" {
  description = "CloudWatch日志组的名称"
  value       = aws_cloudwatch_log_group.app.name
}

# 部署信息
output "deployment_url" {
  description = "应用的部署URL"
  value       = "http://${aws_lb.main.dns_name}"
}

output "project_name" {
  description = "项目名称"
  value       = var.project_name
}

output "aws_region" {
  description = "AWS区域"
  value       = var.aws_region
}
