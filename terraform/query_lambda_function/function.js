const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

exports.handler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  console.log('CasePath:', `${event.httpMethod} ${event.resource}`);

  const ddb = new AWS.DynamoDB();
  const casePath = `${event.httpMethod} ${event.resource}`; // GET /urls/{code+}

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
    case "GET /urls/{code+}":
      console.log("event.pathParameters.code: ", event.pathParameters.code);

      params['Key'] = { 'Id' : { S: event.pathParameters.code } };
      params['ProjectionExpression'] = 'Id, OriginalUrl';

      data = await ddb.getItem(params).promise();

      if (!data.Item) { throw new Error('`url` record not found'); };

      responseBody = data.Item.OriginalUrl.S;
      statusCode = 301; // HTTP Code - Moved Permanently
      break;

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
};
