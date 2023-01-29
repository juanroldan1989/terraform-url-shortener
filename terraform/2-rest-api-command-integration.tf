# REST API Integration -> (POST/PUT/PATCH/DELETE) /urls requests -> `command` Lambda Function

resource "aws_api_gateway_resource" "command_resource" {
  path_part   = "urls"
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.main.id
}

resource "aws_api_gateway_method" "post_command_resource" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.command_resource.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "command_integration" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.command_resource.id
  http_method             = aws_api_gateway_method.post_command_resource.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.command_lambda_function.invoke_arn
}

resource "aws_lambda_permission" "api_gw_urls_command_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.command_lambda_function.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}
