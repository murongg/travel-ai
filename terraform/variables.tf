variable "aws_region" {
  description = "AWS区域"
  type        = string
  default     = "ap-northeast-1"  # 东京区域，适合亚洲用户
}

variable "project_name" {
  description = "项目名称"
  type        = string
  default     = "ai-travel-guide"
}

variable "vpc_cidr" {
  description = "VPC CIDR块"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "可用区列表"
  type        = list(string)
  default     = ["ap-northeast-1a", "ap-northeast-1c"]
}

variable "private_subnet_cidrs" {
  description = "私有子网CIDR块"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "public_subnet_cidrs" {
  description = "公有子网CIDR块"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24"]
}

variable "app_cpu" {
  description = "ECS任务CPU单位"
  type        = number
  default     = 256  # 0.25 vCPU
}

variable "app_memory" {
  description = "ECS任务内存(MB)"
  type        = number
  default     = 512
}

variable "app_count" {
  description = "ECS服务实例数量"
  type        = number
  default     = 2
}

# Firebase配置
variable "firebase_api_key" {
  description = "Firebase API密钥"
  type        = string
  sensitive   = true
}

variable "firebase_auth_domain" {
  description = "Firebase认证域名"
  type        = string
}

variable "firebase_project_id" {
  description = "Firebase项目ID"
  type        = string
}

variable "firebase_storage_bucket" {
  description = "Firebase存储桶"
  type        = string
}

variable "firebase_messaging_sender_id" {
  description = "Firebase消息发送者ID"
  type        = string
}

variable "firebase_app_id" {
  description = "Firebase应用ID"
  type        = string
}

variable "firebase_private_key" {
  description = "Firebase私钥"
  type        = string
  sensitive   = true
}

variable "firebase_client_email" {
  description = "Firebase客户端邮箱"
  type        = string
}

# 高德地图API配置
variable "amap_api_key" {
  description = "高德地图API密钥"
  type        = string
  sensitive   = true
}

# OpenAI API配置
variable "openai_api_key" {
  description = "OpenAI API密钥"
  type        = string
  sensitive   = true
}

variable "common_tags" {
  description = "通用标签"
  type        = map(string)
  default = {
    Project     = "ai-travel-guide"
    Environment = "production"
    ManagedBy   = "terraform"
    Owner       = "devops"
  }
}
