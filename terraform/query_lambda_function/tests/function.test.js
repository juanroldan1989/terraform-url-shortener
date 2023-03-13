const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');
const { handler } = require('../function');

describe('handler - GET /unknown', () => {
  test('should return error message for unknown endpoint', async() => {
    const errorMessage = `Unsupported route: \"GET /unknown\"`;
    const event = {
      "httpMethod" : "GET",
      "resource" : "/unknown"
    };
    const response = await handler(event);

    expect(response.body).toEqual(errorMessage);
    expect(response.statusCode).toEqual(400);
  });
});

describe('handler - GET /urls/{code}', () => {
  test('should return error message if `code` does not match any record in `urls` table', async() => {
    const errorMessage = "Cannot read property 'OriginalUrl' of null";
    const event = {
      "httpMethod" : "GET",
      "resource" : "/urls/{code+}",
      'pathParameters' : '{ "code": "99" }'
    };

    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB', 'getItem', (params, callback) => {
      return callback(false, { Item: null });
    });

    const response = await handler(event);

    expect(response.body).toEqual(errorMessage);
    expect(response.statusCode).toEqual(400);

    AWSMock.restore('DynamoDB');
    AWSMock.restore('DynamoDB.getItem');
  });

  test('should return record if `code` matches a record in `urls` table', async () => {
    const event = {
      "httpMethod" : "GET",
      "resource" : "/urls/{code+}",
      'pathParameters' : '{ "code": "123456" }'
    };
    const originalUrl = 'https://this-is-the-original-url.com';
    const url = {
      "Id" : { "S" : "123456" },
      "OriginalUrl" : { "S" : originalUrl }
    };

    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB', 'getItem', function(params, callback) {
      expect(params).toEqual({
        'TableName' : 'Urls',
        'Key' : { 'Id': { 'S': undefined } },
        'ProjectionExpression' : 'Id, OriginalUrl'
      });
      return callback(false, { Item: url });
    });

    const response = await handler(event);

    expect(response.body).toEqual(originalUrl);
    expect(response.statusCode).toEqual(301);

    AWSMock.restore('DynamoDB');
    AWSMock.restore('DynamoDB.getItem');
  });
});
