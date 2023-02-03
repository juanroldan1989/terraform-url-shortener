resource "aws_sqs_queue" "command_sqs_queue" {
  name                      = "command-sqs-queue"
  delay_seconds             = 90
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10
}
