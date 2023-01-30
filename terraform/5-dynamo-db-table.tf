resource "aws_dynamodb_table" "urls" {
  name           = "Urls"
  billing_mode   = "PROVISIONED"
  read_capacity  = 4
  write_capacity = 4
  hash_key       = "ShortUrl"

  attribute {
    name = "ShortUrl"
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
      "Id": {"N": "1"},
      "OriginalUrl": {"S": "https://super-really-long-url-1.com"},
      "ShortUrl": {"S": "https://short-1.com"}
    }
    ITEM
}

resource "aws_dynamodb_table_item" "url_2" {
  table_name = aws_dynamodb_table.urls.name
  hash_key   = aws_dynamodb_table.urls.hash_key

  item = <<ITEM
    {
      "Id": {"N": "2"},
      "OriginalUrl": {"S": "https://super-really-long-url-2.com"},
      "ShortUrl": {"S": "https://short-2.com"}
    }
    ITEM
}

resource "aws_dynamodb_table_item" "url_3" {
  table_name = aws_dynamodb_table.urls.name
  hash_key   = aws_dynamodb_table.urls.hash_key

  item = <<ITEM
    {
      "Id": {"N": "3"},
      "OriginalUrl": {"S": "https://super-really-long-url-3.com"},
      "ShortUrl": {"S": "https://short-3.com"}
    }
    ITEM
}
