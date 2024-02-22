const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');
const { handler } = require('../function');

describe('handler - POST /unknown', () => {
  test('should return error message for unknown endpoint', async() => {
    const errorMessage = `Unsupported route: \"POST /unknown\"`;
    const event = {
      "httpMethod" : "POST",
      "resource" : "/unknown"
    };
    const response = await handler(event);

    expect(response.body).toEqual(errorMessage);
    expect(response.statusCode).toEqual(400);
  })
})

describe('handler - POST /urls', () => {
  test('should return error message if `url` is not provided', async() => {
    const errorMessage = '`url` parameter is required';
    const event = {
      "httpMethod" : "POST",
      "resource" : "/urls",
      'body' : '{ "url" : "" }'
    };
    const response = await handler(event);

    expect(response.body).toEqual(errorMessage);
    expect(response.statusCode).toEqual(400);
  });

  test('should return `hashCodeString` when `url` is provided', async () => {
    const event = {
      "httpMethod" : "POST",
      "resource" : "/urls",
      'body' : '{ "url" : "https://this-is-a-really-really-long-url.com" }'
    };
    const hashCodeString = "-674951488";

    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB', 'putItem', (params, callback) => {
      return callback(false, { Item: null });
    });
    AWSMock.mock('SQS', 'sendMessage', (params, callback) => {
      return callback(false, { MessageId: '123' });
    });

    const response = await handler(event);

    expect(response.body).toEqual(hashCodeString);
    expect(response.statusCode).toEqual(200);

    AWSMock.restore('DynamoDB');
    AWSMock.restore('DynamoDB.putItem');
  });

  test('should return 200 code on successful enqueue message into `command` SQS Queue ', async () => {
    const event = {
      "httpMethod" : "POST",
      "resource" : "/urls",
      'body' : '{ "url" : "https://this-is-a-really-really-long-url.com" }'
    };

    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('SQS', 'sendMessage', (params, callback) => {
      return callback(false, { MessageId: '123' });
    });

    const response = await handler(event);

    expect(response.body).toEqual('-674951488');
    expect(response.statusCode).toEqual(200);

    AWSMock.restore('SQS');
    AWSMock.restore('SQS.sendMessage');
  });

  test('should return 400 code on unsuccessful enqueue message into `command` SQS Queue ', async () => {
    const event = {
      "httpMethod" : "POST",
      "resource" : "/urls",
      'body' : '{ "url" : "https://this-is-a-really-really-long-url.com" }'
    };

    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('SQS', 'sendMessage', (params, callback) => {
      return callback({});
    });

    const response = await handler(event);

    expect(response.statusCode).toEqual(400);

    AWSMock.restore('SQS');
    AWSMock.restore('SQS.sendMessage');
  });
});
