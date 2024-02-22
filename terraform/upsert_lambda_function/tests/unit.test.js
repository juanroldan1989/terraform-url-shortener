const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');
const { handler } = require('../function');

describe('handler', () => {
  test('should return `null` message if `Records` array is empty', async() => {
    const event = {
      "Records" : [],
    };
    const response = await handler(event);

    expect(response.body).toEqual('0 records provided');
    expect(response.statusCode).toEqual(200);
  });

  test('should return error message if 1 `Record` is provided without `Item`', async() => {
    const event = {
      "Records" : [
        { "body" : '{ "UnknowKey" : "unknown value" }' }
      ],
    };

    const response = await handler(event);

    expect(response.body).toEqual('`Item` not provided within message');
    expect(response.statusCode).toEqual(400);
  });

  test('should return error message if 1 `Record` is provided with `Item` but `Id` is missing', async() => {
    const event = {
      "Records" : [
        { "body" : '{ "Item" : { "Id" : "", "OriginalUrl" : "" } }' }
      ],
    };

    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB', 'putItem', (params, callback) => {
      return callback(false, { Item: null });
    });

    const response = await handler(event);

    expect(response.body).toEqual('`Item.Id` not provided within message');
    expect(response.statusCode).toEqual(400);
  });

  test('should return error message if 1 `Record` is provided with `Item` but `OriginalUrl` is missing', async() => {
    const event = {
      "Records" : [
        { "body" : '{ "Item" : { "Id" : "1234567", "OriginalUrl" : "" } }' }
      ],
    };

    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB', 'putItem', (params, callback) => {
      return callback(false, { Item: null });
    });

    const response = await handler(event);

    expect(response.body).toEqual('`Item.OriginalUrl` not provided within message');
    expect(response.statusCode).toEqual(400);
  });

  test('should return success message if 1 `Record` is provided with `Item` data', async() => {
    const event = {
      "Records" : [
        { "body" : "{\"TableName\":\"Urls\",\"Item\":{\"Id\":{\"S\":\"1150561781\"},\"OriginalUrl\":{\"S\":\"https://some-sample-and-long-url-MAYBE-GOOD.com\"}}}" }
      ],
    };
    const item = {
      "Id" : { "S" : "1234567" },
      "OriginalUrl" : { "S" : "https://this-is-a-long-url.com" }
    };

    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB', 'putItem', (callback) => {
      return callback(true, { Item: item });
    });

    const response = await handler(event);

    expect(response.statusCode).toEqual(200);

    AWSMock.restore('DynamoDB');
    AWSMock.restore('DynamoDB.putItem');
  });

  test('should return error message if 1 `Record` is provided with `Item` data and cannot be persisted', async() => {
    const event = {
      "Records" : [
        { "body" : "{\"Item\":{\"Id\":{\"S\":\"1150561781\"},\"OriginalUrl\":{\"S\":\"https://some-sample-and-long-url-MAYBE-GOOD.com\"}}}" }
      ],
    };
    const item = {
      "Id" : { "S" : "1234567" },
      "OriginalUrl" : { "S" : "https://this-is-a-long-url.com" }
    };

    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('DynamoDB', 'putItem', (callback) => {
      return callback(true, { Item: item });
    });

    const response = await handler(event);

    expect(response.statusCode).toEqual(400);

    AWSMock.restore('DynamoDB');
    AWSMock.restore('DynamoDB.putItem');
  });
});
