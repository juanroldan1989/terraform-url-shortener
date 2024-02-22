resource "aws_sqs_queue" "command_sqs_queue" {
  name                      = "command-sqs-queue"
  delay_seconds             = 0
  message_retention_seconds = 86400
  receive_wait_time_seconds = 5
}

# delay_seconds
# The time in seconds that the delivery of all messages in the queue will be delayed.
# An integer from 0 to 900 (15 minutes).
# The default for this attribute is 0 seconds.

# receive_wait_time_seconds
# The time for which a ReceiveMessage call will wait for a message to arrive (long polling) before returning
# An integer from 0 to 20 (seconds).
# The default for this attribute is 0 seconds.
