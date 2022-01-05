terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.48.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.2.0"
    }
  }

  required_version = "~> 1.0"
}

provider "aws" {
  region = var.aws_region
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# SSM Parameter Store 
resource "aws_ssm_parameter" "tfc_org_token" {
  name  = "/tfc_queue_manager/tfc_org_token"
  type  = "SecureString"
  value = var.tfc_org_token_value
}

resource "aws_ssm_parameter" "rocketchat_token" {
  name  = "/tfc_queue_manager/rocketchat_token"
  type  = "SecureString"
  value = var.rocketchat_token_value
}

# S3 Bucket for Lambda asset
resource "aws_s3_bucket" "tfc_queue_manager_lambda_bucket" {
  bucket        = "tfc-queue-manager-${data.aws_caller_identity.current.account_id}-${data.aws_region.current.name}"
  acl           = "private"
  force_destroy = false
}

data "archive_file" "tfc_queue_manager" {
  type = "zip"

  source_dir  = "${path.module}/queue-manager-lambda"
  output_path = "${path.module}/queue-manager-lambda.zip"
}

resource "aws_s3_bucket_object" "tfc_queue_manager" {
  bucket = aws_s3_bucket.tfc_queue_manager_lambda_bucket.id

  key    = "queue-manager-lambda.zip"
  source = data.archive_file.tfc_queue_manager.output_path

  etag = filemd5(data.archive_file.tfc_queue_manager.output_path)
}

resource "aws_iam_role" "lambda_exec_role" {
  name = "TfcQueueManager-ExecutionRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = "sts:AssumeRole"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}


resource "aws_iam_role_policy_attachment" "lambda_basic_execution_policy" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_parameter_store_readonly_policy" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess"
}

resource "aws_lambda_permission" "allow_execution_from_cloudwatch" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.tfc_queue_manager.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.tfc_queue_periodic_checker.arn
}

resource "aws_lambda_function" "tfc_queue_manager" {
  function_name = "TfcQueueManager"
  description   = "Simple TFC Queue Manager - Manages TFC Queues"

  s3_bucket = aws_s3_bucket.tfc_queue_manager_lambda_bucket.id
  s3_key    = aws_s3_bucket_object.tfc_queue_manager.key

  runtime = "nodejs14.x"
  handler = "src/handler.handler"
  timeout = 120

  environment {
    variables = {
      "TFC_API_ENDPOINT"    = var.tfc_api_endpoint
      "TFC_ORGANIZATION"    = var.tfc_organization
      "TFC_PAGE_SIZE"       = var.tfc_api_page_size
      "ROCKETCHAT_ENDPOINT" = var.rocketchat_endpoint
    }
  }

  source_code_hash = data.archive_file.tfc_queue_manager.output_base64sha256
  role             = aws_iam_role.lambda_exec_role.arn
}

resource "aws_cloudwatch_event_rule" "tfc_queue_periodic_checker" {
  name                = "TfcQueue-Periodic-Checker"
  description         = "Query TFC workspaces periodic. Used to trigger the TfcQueueManager Lambda"
  schedule_expression = "rate(10 minutes)"
}

resource "aws_cloudwatch_event_target" "tfc_queue_manager_target" {
  arn  = aws_lambda_function.tfc_queue_manager.arn
  rule = aws_cloudwatch_event_rule.tfc_queue_periodic_checker.name
}