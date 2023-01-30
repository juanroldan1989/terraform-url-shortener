const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

exports.handler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  console.log('CasePath:', `${event.httpMethod} ${event.resource}`);

  const documentClient = new AWS.DynamoDB.DocumentClient();
  const ddb = new AWS.DynamoDB();

  let casePath = `${event.httpMethod} ${event.resource}`; // GET /urls/{url+}

  let responseBody;
  let statusCode = 200;
  const headers = {
    'Content-Type': 'application/json',
  };

  let params = {
    TableName: 'Urls'
  };

  try {
    switch (casePath) {
      case "GET /urls/{url+}":
        console.log("event.pathParameters.url: ", event.pathParameters.url);

        params['Key'] = { 'ShortUrl' : { S: event.pathParameters.url } };
        params['ProjectionExpression'] = 'Id, OriginalUrl, ShortUrl';

        data = await ddb.getItem(params).promise();

        responseBody = JSON.stringify(data.Item);
        statusCode = 200;
        break;

      // more cases ...

      default:
        throw new Error(`Unsupported route: "${casePath}"`);
    }
  } catch (err) {
    statusCode = 400;
    responseBody = err.message;
  }

  const response = {
    statusCode: statusCode,
    headers: headers,
    body: responseBody
  };

  return response;
}
