resource "aws_dynamodb_table" "urls" {
  name           = "Urls"
  billing_mode   = "PROVISIONED"
  read_capacity  = 4
  write_capacity = 4
  hash_key       = "Id"

  attribute {
    name = "Id"
    type = "S"
  }
}

# AWS DynamoDB service - `reserved` words not to be used in attributes names
# https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ReservedWords.html

resource "aws_dynamodb_table_item" "url_1" {
  table_name = aws_dynamodb_table.urls.name
  hash_key   = aws_dynamodb_table.urls.hash_key

  item = <<ITEM
    {
      "Id": {"S": "75675"},
      "OriginalUrl": {"S": "https://super-really-long-url-1.com"}
    }
    ITEM
}

resource "aws_dynamodb_table_item" "url_2" {
  table_name = aws_dynamodb_table.urls.name
  hash_key   = aws_dynamodb_table.urls.hash_key

  item = <<ITEM
    {
      "Id": {"S": "23423"},
      "OriginalUrl": {"S": "https://super-really-long-url-2.com"}
    }
    ITEM
}

resource "aws_dynamodb_table_item" "url_3" {
  table_name = aws_dynamodb_table.urls.name
  hash_key   = aws_dynamodb_table.urls.hash_key

  item = <<ITEM
    {
      "Id": {"S": "61523"},
      "OriginalUrl": {"S": "https://super-really-long-url-3.com"}
    }
    ITEM
}
