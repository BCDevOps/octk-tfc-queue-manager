<!-- BEGIN_TF_DOCS -->
## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | ~> 1.0 |
| <a name="requirement_archive"></a> [archive](#requirement\_archive) | ~> 2.2.0 |
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | ~> 3.48.0 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_archive"></a> [archive](#provider\_archive) | 2.2.0 |
| <a name="provider_aws"></a> [aws](#provider\_aws) | 3.48.0 |

## Modules

No modules.

## Resources

| Name | Type |
|------|------|
| [aws_cloudwatch_event_rule.tfc_queue_periodic_checker](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_event_rule) | resource |
| [aws_cloudwatch_event_target.tfc_queue_manager_target](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_event_target) | resource |
| [aws_iam_role.lambda_exec_role](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role) | resource |
| [aws_iam_role_policy_attachment.lambda_basic_execution_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_iam_role_policy_attachment.lambda_parameter_store_readonly_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_lambda_function.tfc_queue_manager](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_function) | resource |
| [aws_lambda_permission.allow_execution_from_cloudwatch](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_permission) | resource |
| [aws_s3_bucket.tfc_queue_manager_lambda_bucket](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket) | resource |
| [aws_s3_bucket_object.tfc_queue_manager](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_object) | resource |
| [aws_ssm_parameter.rocketchat_token](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.tfc_org_token](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [archive_file.tfc_queue_manager](https://registry.terraform.io/providers/hashicorp/archive/latest/docs/data-sources/file) | data source |
| [aws_caller_identity.current](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/caller_identity) | data source |
| [aws_region.current](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/region) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_aws_region"></a> [aws\_region](#input\_aws\_region) | AWS region for all resources. | `string` | `"ca-central-1"` | no |
| <a name="input_rocketchat_endpoint"></a> [rocketchat\_endpoint](#input\_rocketchat\_endpoint) | RocketChat Endpoint | `string` | n/a | yes |
| <a name="input_rocketchat_token_value"></a> [rocketchat\_token\_value](#input\_rocketchat\_token\_value) | RocketChat Token Value | `string` | n/a | yes |
| <a name="input_tfc_api_endpoint"></a> [tfc\_api\_endpoint](#input\_tfc\_api\_endpoint) | TFC API Endpoint | `string` | `"app.terraform.io"` | no |
| <a name="input_tfc_api_page_size"></a> [tfc\_api\_page\_size](#input\_tfc\_api\_page\_size) | TFC API PageSize | `number` | `100` | no |
| <a name="input_tfc_org_token_value"></a> [tfc\_org\_token\_value](#input\_tfc\_org\_token\_value) | TFC Org Token Value | `string` | n/a | yes |
| <a name="input_tfc_organization"></a> [tfc\_organization](#input\_tfc\_organization) | TFC Organization | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_lambda_bucket_name"></a> [lambda\_bucket\_name](#output\_lambda\_bucket\_name) | Name of the S3 bucket used to store function code. |
<!-- END_TF_DOCS -->