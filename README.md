# URL Shortener API

1. Features
2. API Docs
3. CQRS Pattern
4. API Testing
5. API Development Life Cycle
6. Further Improvements

## Features

- Ability to submit URL `https://really-awesome-long-url.com` to API (POST request).
- Receive short URL `https://short.com` in return.
- Short URL can then be used and should redirect to original URL (GET request).

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

`query` and `upsert` (updates or creates) responsibilities are split (segregated) into different services, each with its own storage.

Technically, this can be implemented in HTTP so that the `Command API` is implemented exclusively with `POST routes` (The write side uses a schema that is optimized for updates), while the `Query API` is implemented exclusively with `GET routes` (The read side can use a schema that is optimized for queries)

## API Testing

## API Development Life Cycle

## Further Improvements

- `GET /urls/{url}` path parameter can be sent as `GET /urls?url={url}` query parameter instead. Adjust `aws_api_gateway_integration` terraform resource:

https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_integration

https://aws.amazon.com/premiumsupport/knowledge-center/pass-api-gateway-rest-api-parameters/

https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html#input-variable-reference

- URLs shortened can be `temporal` or `permanent` ones.

- `permanent` URLs need payment by authenticated users first.

- `temporal` URLs only last 24hs and can be created through a public endpoint.

- Task in background should remove `temporal` URLs from database after 24hs.

# URL Shortener Frontend

Frontend App can be built with any frontend framework such as: Angular, React, NextJS; or even with jQuery as a static HTML page.
