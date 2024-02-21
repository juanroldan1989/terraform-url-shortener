# URL Shortener API

<img src="https://github.com/juanroldan1989/terraform-url-shortener/raw/main/screenshots/title-image.png" width="100%" />

1. [Core Features](#core-features)
2. [API Development Life Cycle](#api-development-life-cycle)
3. [API Testing](#api-testing)
4. [API Documenation](#api-documentation)
5. [CQRS Pattern](#cqrs-pattern)
6. [AWS Infrastructure Design (Improvement)](#aws-infrastructure-design-improvement)
7. [Further Improvements](#further-improvements)

# Core Features

<img src="https://github.com/juanroldan1989/terraform-url-shortener/raw/main/screenshots/url-shortener-infra-1.png" width="100%" />

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

**Clarification:** once a `Route53` record is configured with a custom domain name, the full production URL should look like this: `https://shrtnr.com/hashCode`

4. `hashCode` generation can be as **simple or complicated as required**. In order to create a unique hash from a specific string, it can be implemented using:

   4.a. Its own `string-to-hash` converting function. It will return the hash equivalent of a string. **(approach implemented)**

   4.b. `N digits` hashCode composed of `[0-9a-zA-Z]` types of characters (`a-z` represent 26 characters **+** `A-Z` represent 26 characters **+** `0-9` **equals** `62` characters in total).

   This is **BASE62 encoding**.

   Which provides with `62^N` possibilities for IDs -> For `N = 5` -> Total amount of unique IDs: `916.132.832`.

   For URLs that require to be `human readable`, there is a potential issue with **BASE62 enconding** since `0` (NUMBER) and `O` (LETTER) can be confused. Same applies for `l` (lowercase LETTER) and `I` (capital LETTER). Removing these 4 characters, leaves us with **BASE58 enconding** which is better for `human readable` URLs purpose.

   4.c. Also, a library named `Crypto` can be used to generate various types of hashes like `SHA1`, `MD5`, `SHA256`, and many more. **(further development)**

Reference: https://www.geeksforgeeks.org/how-to-create-hash-from-string-in-javascript/

# API Development Life Cycle

## Configuration steps

1. Clone repository.
2. Validate Terraform <-> Github Actions <-> AWS integration: https://developer.hashicorp.com/terraform/tutorials/automation/github-actions
3. Adjuste `0-providers.tf` file to your own Terraform workspace specifications.

## Adding a new endpoint (same applies for existing endpoints)

1. Create a new branch from `main`.
2. Create a new `NodeJS` function folder. Run `npm init` & `npm install <module>` as you need.
3. Create a new `Lambda function` through `Terraform`.
4. Create a new `Terraform Integration` for said Lambda function.
5. Create `unit`, `integration`, `load_test` tests for said Lambda function.
6. AWS Lambda functions can be tested locally using `aws invoke` command (https://docs.aws.amazon.com/lambda/latest/dg/API_Invoke.html).
7. Apply `linting` best practices to new function file.
8. Add `unit`, `integration`, `load_test` steps into Github Actions (`ci_cd.yml`) following the same pattern as other lambda functions.
9. Commit changes in your `feature branch` and create a `New Pull Request`.
10. **Pre Deployment** `Github Actions` workflow will be triggered in your new branch:

<img src="https://github.com/juanroldan1989/terraform-url-shortener/raw/main/screenshots/pre-deployment-steps.png" width="100%" />

11. Validate `workflow run` results.
12. Once everything is validated by yourself and/or colleagues, push a new commit (it could be an empty one) with the word `[deploy]`.
13. This will trigger **pre deployment** and **post deployment** steps within the `Github Actions` workflow:

<img src="https://github.com/juanroldan1989/terraform-url-shortener/raw/main/screenshots/pre-and-post-deployment-steps.png" width="100%" />

14. Once everything is validated by yourself and/or colleagues, you can merge your branch into `main`.

15. Once Github Actions workflow is successfully completed, a valuable addition is sending a **notification** with workflow results into **Slack channel/s**:

```ruby
# .github/workflows/ci_cd.yml

...

send-notification:
  runs-on: [ubuntu-latest]
  timeout-minutes: 7200
  needs: [linting, unit_tests, deployment, integration_tests, load_tests]
  if: ${{ always() }}
  steps:
    - name: Send Slack Notification
      uses: rtCamp/action-slack-notify@v2
      if: always()
      env:
        SLACK_CHANNEL: devops-sample-slack-channel
        SLACK_COLOR: ${{ job.status }}
        SLACK_ICON: https://avatars.githubusercontent.com/u/54465427?v=4
        SLACK_MESSAGE: |
          "Lambda Functions (Linting): ${{ needs.linting.outputs.status || 'Not Performed' }}" \
          "Lambda Functions (Unit Testing): ${{ needs.unit_tests.outputs.status || 'Not Performed' }}" \
          "API Deployment: ${{ needs.deployment.outputs.status }}" \
          "API Tests (Integration): ${{ needs.integration_tests.outputs.status || 'Not Performed' }}" \
          "API Tests (Load): ${{ needs.load_tests.outputs.status || 'Not Performed' }}"
        SLACK_TITLE: CI/CD Pipeline Results
        SLACK_USERNAME: Github Actions Bot
        SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
```

**CI/CD Slack Notification example:**

<img src="https://github.com/juanroldan1989/terraform-url-shortener/raw/main/screenshots/slack-notification-from-pipeline.png" width="100%" />

# API Testing

Testing is conducted on 3 steps within Github Actions workflow:

1. Lambda Functions (Unit testing) - [Query Lambda Function](https://github.com/juanroldan1989/terraform-url-shortener/blob/main/terraform/query_lambda_function/tests/unit.test.js)
2. API Testing (Integration) - [Command Lambda Function](https://github.com/juanroldan1989/terraform-url-shortener/blob/main/terraform/command_lambda_function/tests/integration.test.sh)
3. API Testing (Load) - [Query Lambda Function](https://github.com/juanroldan1989/terraform-url-shortener/blob/main/terraform/query_lambda_function/tests/load_test.yaml)

# CI/CD (Github Actions -> Terraform -> AWS)

- Deployment can be triggered from `GIT commit messages` by including `[deploy]` within a commit message.

- Deployment can be triggered `manually` by using Terraform CLI within `terraform` folder in repository:

```ruby
% cd terraform
% terraform init
% terraform apply
```

- **Pre Deployment** `linting` and `unit_tests` steps are triggered by Github Actions.

- **Post Deployment** `integration_tests` and `load_tests` steps are triggered by Github Actions.

<img src="https://github.com/juanroldan1989/terraform-with-rest-api-gateway-and-lambda-functions/raw/main/screenshots/load-test-report.png" width="100%" />

- Github Actions workflow can be customized here:

```ruby
# .github/workflows/ci_cd.yml

name: "CI/CD Pipeline"

on:
  push:
    paths:
      - "terraform/**"
      - ".github/workflows/**"
    branches:
      - main
  pull_request:
...
```

# API Documentation

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

# CQRS Pattern

Pattern implemented within REST API to handle read/write requests.

https://apisix.apache.org/blog/2022/09/23/build-event-driven-api/

CQRS stands for `Command and Query Responsibility Segregation`, a pattern that separates reads and writes into different models, using commands to update data, and queries to read data.

`query` and `upsert` (updates or creates) responsibilities are split (segregated) into different services (e.g.: AWS Lambda Functions)

Technically, this can be implemented in HTTP so that the `Command API` is implemented exclusively with `POST routes`, while the `Query API` is implemented exclusively with `GET routes`.

<img src="https://github.com/juanroldan1989/terraform-url-shortener/raw/main/screenshots/url-shortener-infra-2.png" width="100%" />

For high number of `POST` requests, an improvement is to **decouple** `command` Lambda function from `DynamoDB` table by adding an `SQS Queue` in between.

`command` Lambda function **no longer writes** to `DynamoDB` table.

This way:

1. `command` Lambda function sends `url` attributes into `command` SQS Queue as message:

```javascript
// APPROACH 1
// Lambda function persists `url` record into `urls` DynamoDB Table
// await ddb.putItem(params).promise();

// APPROACH 2
// Lambda function sends `url` attributes into `command` SQS Queue as message.
const messageParams = {
  MessageAttributes: {
    Author: {
      DataType: "String",
      StringValue: "URL Shortener API - `command` Lambda Function",
    },
  },
  MessageBody: JSON.stringify(params),
  QueueUrl: "https://sqs.<region>.amazonaws.com/<account-id>/command-sqs-queue",
};
```

2. SQS Queue message is picked up by `upsert` Lambda function.
3. `upsert` Lambda function persists record into `urls` DynamoDB Table:

```javascript
event.Records.forEach(async (record) => {
  const message = record.body;

  try {
    messageJSON = JSON.parse(message);

    if (!messageJSON.Item) {
      throw new Error("`Item` not provided within message");
    }
    if (!messageJSON.Item.Id) {
      throw new Error("`Item.Id` not provided within message");
    }
    if (!messageJSON.Item.OriginalUrl) {
      throw new Error("`Item.OriginalUrl` not provided within message");
    }

    params["Item"] = { Id: { S: messageJSON.Item.Id.S } };
    params["Item"]["OriginalUrl"] = { S: messageJSON.Item.OriginalUrl.S };

    await ddb.putItem(params).promise();
  } catch (err) {
    statusCode = 400;
    responseBody = err.message;
  }
});
```

# AWS Infrastructure Design (Improvement)

This set of improvements include services like:

AWS Route 53 (DNS), AWS CloudFront and S3 (storing and distributing static content: HTML/CSS/JS) and AWS Cognito (Authentication).

AWS ElastiCache is also posible to implement for READ operations within AWS Query Lambda function.

<img src="https://github.com/juanroldan1989/terraform-url-shortener/raw/main/screenshots/url-shortener-infra-3.png" width="100%" />

# Further Improvements

**New features (or improvements) that come to mind while working on core features are placed on this list**

- **API Rate Limiting**

In order to avoid malicious requests (e.g.: bots) attempting to:

1. Used up all possibilities for unique codes or

2. Sabotage API's availability for other users.

Rate Limiting is a good improvement to avoid those scenarios and can be accomplished by:

1. Implementing a Captcha step within frontend app.

2. Generate Free/Basic/Premium membership plans (`API Token`) within AWS API Gateway and set daily/weekly request limits for users based on membership plans.

- **HTTP Redirections**
When returning an existing URL, we should return a 302 HTTP code for future client's request:

https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections#permanent_redirections

- **Infrastructure code** refactoring:

1. Implement `modules` with parameters along `Terraform` **Lambda** functions and **API Gateway** integrations to avoid code duplication.

2. Implement a **single** `main.tf` Terraform file where all resources can be seen referenced and modules implemented. This brings even more clarity when reviewing `Terraform` code.

- `GET /urls/{url}` path parameter can be sent as `GET /urls?url={url}` query parameter instead. Adjust `aws_api_gateway_integration` terraform resource:

https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_integration

https://aws.amazon.com/premiumsupport/knowledge-center/pass-api-gateway-rest-api-parameters/

https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html#input-variable-reference

- `POST /urls` request could be triggered twice (or more) with the same `url` on its payload. Adjust backend to support this scenario. Create record in table for first request. Do not create another record for second request.

- `GET /urls/{code}` request could be triggered many times. Consider caching implementation at:

  1. AWS API Gateway level or
  2. AWS DynamoDB level (DAX)

- Expand on `CQRS` pattern implementation, for high number of `POST /urls` requests decouple them by adding an `SQS Queue` instead of writing directly into `DynamoDB` table. (**Improvement implemented**)

- URLs shortened can be `temporal` or `permanent` ones:

1. `permanent` URLs need payment by authenticated users first.

2. `temporal` URLs only last 24hs and can be created through a public endpoint.

- **Task running in background** should remove `temporal` URLs from database after 24hs. This could be implemented through a AWS `Bridge Event - Schedule` rule triggered once every 24hs that is connected to a `remove_temporal_urls` Lambda function.

- To **increase chances** of finding a URL with `GET /urls/{code}` requests, consider **pre-generating records in table**:

1. Once an enconding (e.g.: `BASE62`, `BASE58`, etc) is decided **and** also

2. the number (N) of maximum amount of digits a `hashCode` needs to be,

3. we are able to predict the **total spectrum of possible values generated**,

4. therefore a **task running in background** to generate this `hashCode` values and insert them in the database will effectively increase chances of finding a requested `hashCode`, leaving only the task of

5. associating a `long URL` with a `hashCode` during `POST /urls` requests workflow.

# URL Shortener Frontend

Frontend App can be built with:

1. Any frontend framework such as: Angular, React, NextJS.

2. With jQuery as a static HTML page.
