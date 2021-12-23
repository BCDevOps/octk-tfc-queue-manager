variable "aws_region" {
  description = "AWS region for all resources."

  type    = string
  default = "ca-central-1"
}

# Lambda Environment Variables
variable "tfc_organization" {
  description = "TFC Organization"

  type = string
}

variable "tfc_api_endpoint" {
  description = "TFC API Endpoint"

  type    = string
  default = "app.terraform.io"
}

variable "rocketchat_endpoint" {
  description = "RocketChat Endpoint"

  type = string
}

# Values for SSM Parameter Store
variable "tfc_org_token_value" {
  description = "TFC Org Token Value"

  type = string
}

variable "rocketchat_token_value" {
  description = "RocketChat Token Value"

  type = string
}
