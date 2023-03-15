terraform {
  cloud {
    organization = "JUANROLDAN-training"

    workspaces {
      name = "terraform-url-shortener"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.21.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.3.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.2.0"
    }
  }

  required_version = "~> 1.4.0"
}

provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = {
      owner       = "Juan Roldan"
      project     = "URL Shortener"
      cost-center = "API Billing"
      Name        = "Managed by Terraform"
    }
  }
}
