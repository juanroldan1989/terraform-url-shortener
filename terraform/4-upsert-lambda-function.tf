resource "aws_iam_role" "upsert_lambda_exec" {
  name = "upsert-lambda-role"

  assume_role_policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
POLICY
}

resource "aws_iam_role_policy_attachment" "upsert_lambda_policy" {
  role       = aws_iam_role.upsert_lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Gives Lambda permission to READ items from SQS and write logs to CloudWatch.
resource "aws_iam_role_policy_attachment" "upsert_sqs_lambda_policy" {
  role       = aws_iam_role.upsert_lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaSQSQueueExecutionRole"
}

# Allows Lambda function to GET events from the SQS queue
resource "aws_lambda_event_source_mapping" "upsert_event_source_mapping" {
  event_source_arn = aws_sqs_queue.command_sqs_queue.arn
  function_name    = aws_lambda_function.upsert_lambda_function.arn
}

resource "aws_iam_policy" "upsert_lambda_function_sqs_access" {
  name = "SQSQueueCommandAccessForUpsertLambda"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "sqs:*"
        ]
        Effect   = "Allow"
        Resource = aws_sqs_queue.command_sqs_queue.arn
      },
    ]
  })
}

resource "aws_iam_policy" "upsert_lambda_function_table_access" {
  name = "DynamoDBTableUrlsAccessForUpsertLambda"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:dynamodb:*:*:table/${aws_dynamodb_table.urls.id}"
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "upsert_lambda_table_access" {
  role       = aws_iam_role.upsert_lambda_exec.name
  policy_arn = aws_iam_policy.upsert_lambda_function_table_access.arn
}

resource "aws_iam_role_policy_attachment" "upsert_lambda_sqs_access" {
  role       = aws_iam_role.command_lambda_exec.name
  policy_arn = aws_iam_policy.upsert_lambda_function_sqs_access.arn
}

resource "aws_lambda_function" "upsert_lambda_function" {
  function_name = "upsert_lambda_function"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key    = aws_s3_object.upsert_lambda_function.key

  runtime = "nodejs16.x"
  handler = "function.handler"

  source_code_hash = data.archive_file.upsert_lambda_function.output_base64sha256

  role = aws_iam_role.upsert_lambda_exec.arn
}

resource "aws_cloudwatch_log_group" "upsert_lambda_function" {
  name = "/aws/lambda/${aws_lambda_function.upsert_lambda_function.function_name}"

  retention_in_days = 14
}

data "archive_file" "upsert_lambda_function" {
  type = "zip"

  source_dir  = "${path.module}/upsert_lambda_function"
  output_path = "${path.module}/upsert_lambda_function.zip"
}

resource "aws_s3_object" "upsert_lambda_function" {
  bucket = aws_s3_bucket.lambda_bucket.id

  key    = "upsert_lambda_function.zip"
  source = data.archive_file.upsert_lambda_function.output_path

  source_hash = filemd5(data.archive_file.upsert_lambda_function.output_path)
}
