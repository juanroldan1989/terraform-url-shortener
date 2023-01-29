# REST API Integration -> GET /urls requests -> `query` Lambda Function

resource "aws_api_gateway_resource" "query_resource" {
  path_part   = "urls"
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.main.id
}

resource "aws_api_gateway_method" "get_query_resource" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.query_resource.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "query_integration" {
  rest_api_id             = aws_api_gateway_rest_api.main.id
  resource_id             = aws_api_gateway_resource.query_resource.id
  http_method             = aws_api_gateway_method.get_query_resource.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.query_lambda_function.invoke_arn
}

resource "aws_lambda_permission" "api_gw_urls_query_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.query_lambda_function.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}
