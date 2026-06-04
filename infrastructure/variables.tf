variable "aws_region" {
  description = "The AWS region to deploy to"
  type        = string
  default     = "eu-north-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "dws-academy-frontend"
}

variable "environment" {
  description = "Environment (e.g., dev, prod)"
  type        = string
  default     = "production"
}

variable "domain_name" {
  description = "Optional custom domain name for the CloudFront distribution"
  type        = string
  default     = ""
}

variable "s3_bucket_name" {
  description = "The name of the S3 bucket for static website files"
  type        = string
  default     = "dws-academy-frontend-production-126078152205"
}


