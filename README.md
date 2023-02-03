# URL Shortener API

1. Core Features
2. API Docs
3. CQRS Pattern
4. HTTP Redirections
5. API Testing
6. API Rate Limiting
7. API Development Life Cycle
8. Further Improvements

## Core Features

1. Ability to submit URL `https://really-awesome-long-url.com` to API (`POST request`):

```ruby
% curl -X POST \
-H "Content-Type: application/json" \
-d '{"url": "https://this-is-my-sample-original-url"}' \
https://cf20zm25j7.execute-api.us-east-1.amazonaws.com/v1/urls
```

Response:

```
736339761
```

2. Should receive `hashCode` associated with original URL. This approach allows `multiple` short-url domains to interact with this API.

3. `hashCode` can then be used to build `https://<api-id>.execute-api.<region>.amazonaws.com/v1/urls/hashCode` and should return original URL `https://really-awesome-long-url.com` (`GET request`):

```ruby
% curl https://<api-id>.execute-api.<region>.amazonaws.com/v1/urls/736339761
```

Response:

```
https://this-is-my-original-url
```

**Clarification:** once a `Route53` record is configured with a custom domain name, the full production URL should look like this: `https://custom.com/hashCode`

4. `HashCode` generation can be as **simple or complicated as required**. In order to create a unique hash from a specific string, it can be implemented using:

   4.a. Its own `string-to-hash` converting function. It will return the hash equivalent of a string. **(approach implemented)**

   4.b. `N digits` hashCode composed of `[0-9a-zA-Z]` types of characters (`62` characters in total). This represents `62^N` possibilities for IDs -> For `N = 5` -> Total amount of unique IDs: `916.132.832`. **(further development)**

   4.c. Also, a library named `Crypto` can be used to generate various types of hashes like `SHA1`, `MD5`, `SHA256`, and many more. **(further development)**

Reference: https://www.geeksforgeeks.org/how-to-create-hash-from-string-in-javascript/

## API Docs page

<img src="https://github.com/juanroldan1989/terraform-url-shortener/raw/main/screenshots/swagger-api-docs.png" width="100%" />

1. Swagger / OpenAPI `YAML` documentation file (format easier to read & maintain) created following standard guidelines: https://github.com/juanroldan1989/terraform-url-shortener/blob/main/terraform/docs/api/v1/main.yaml

2. `YAML` file converted into `JSON` (since `Swagger UI` script requires a `JSON` file):

```ruby
docs/api/v1% brew install yq
docs/api/v1% yq -o=json eval main.yml > main.json
```

3. `JSON` file can be accessed through:

   3.a. `Github repository` itself as: https://raw.githubusercontent.com/github_username/terraform-url-shortener/main/docs/api/v1/main.yaml or

   3.b. `S3 bucket` that will contain `main.yml`. Bucket created and file uploaded through Terraform. URL provided through `output` terraform command. [Sample Terraform Code](https://github.com/juanroldan1989/terraform-with-rest-api-gateway-and-lambda-functions/blob/main/terraform/2-rest-api-gateway-docs.tf)

- Both file accessibility options available within this repository.

4. `static` API Documentation `standalone` HTML page generated within `docs/api/v1` folder in repository: https://github.com/swagger-api/swagger-ui/blob/master/docs/usage/installation.md#plain-old-htmlcssjs-standalone

5. Within `static` API Documentation page, replace `url` value with your own `JSON` file's URL from point `3` above:

```ruby
...
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          // url: "https://docs-api-v1-file-url-from-point-3.com",
          dom_id: '#swagger-ui',
...
```

6. A `static website` can also be hosted within `S3 Bucket`: https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html

- To upload files `aws sync` command is recommended. E.g.: `aws s3 sync docs/api/v1 s3://$YOUR_BUCKET_NAME`

## CQRS Pattern

Pattern implemented within REST API to handle read/write requests.

https://apisix.apache.org/blog/2022/09/23/build-event-driven-api/

CQRS stands for `Command and Query Responsibility Segregation`, a pattern that separates reads and writes into different models, using commands to update data, and queries to read data.

`query` and `upsert` (updates or creates) responsibilities are split (segregated) into different services (e.g.: AWS Lambda Functions)

Technically, this can be implemented in HTTP so that the `Command API` is implemented exclusively with `POST routes`, while the `Query API` is implemented exclusively with `GET routes`.

TODO: Add diagram with 2 lambda functions

### Optimization

For high number of `POST` requests, an improvement is to **decouple** `command` Lambda function from `DynamoDB` table by adding an `SQS Queue` in between.

`command` Lambda function **no longer writes** to `DynamoDB` table.

TODO: Add diagram with 3 lambda functions

This way:

1. `command` Lambda function sends `url` attributes into `command` SQS Queue as message.
2. SQS Queue message is picked up by `upsert` Lambda function.
3. `upsert` Lambda function persists record into `urls` DynamoDB Table.

## HTTP Redirections

https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections#permanent_redirections

## API Testing

## API Rate Limiting

In order to avoid malicious requests (e.g.: bots) attempting to:

1. Used up all possibilities for unique codes or

2. Sabotage API's availability for other users.

Rate Limiting is a good improvement to avoid those scenarios and can be accomplished by:

1. Implementing a Captcha step within frontend app.

2. Generate Free/Basic/Premium membership plans (`API Token`) within AWS API Gateway and set daily/weekly request limits for users based on membership plans.

## API Development Life Cycle

## Further Improvements

**New features (or improvements) that come to mind while working on core features are place on this list**

- `GET /urls/{url}` path parameter can be sent as `GET /urls?url={url}` query parameter instead. Adjust `aws_api_gateway_integration` terraform resource:

https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_integration

https://aws.amazon.com/premiumsupport/knowledge-center/pass-api-gateway-rest-api-parameters/

https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html#input-variable-reference

- `POST /urls` request could be triggered twice (or more) with the same `url` on its payload. Adjust backend to support this scenario. Create record in table for first request. Do not create another record for second request.

- `GET /urls/{code}` request could be triggered many times. Consider caching implementation at:

  1. AWS API Gateway level or
  2. AWS DynamoDB level (DAX)

- Expand on `CQRS` pattern implementation, for high number of `POST /urls` requests decouple requests by adding an `SQS Queue` instead of writing directly into DynamoDB table.

- URLs shortened can be `temporal` or `permanent` ones.

- `permanent` URLs need payment by authenticated users first.

- `temporal` URLs only last 24hs and can be created through a public endpoint.

- Task in background should remove `temporal` URLs from database after 24hs.

# URL Shortener Frontend

Frontend App can be built with:

1. Any frontend framework such as: Angular, React, NextJS.

2. With jQuery as a static HTML page.
