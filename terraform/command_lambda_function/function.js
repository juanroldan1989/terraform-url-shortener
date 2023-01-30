const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

exports.handler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  console.log('CasePath:', `${event.httpMethod} ${event.resource}`);

  const ddb = new AWS.DynamoDB();
  const casePath = `${event.httpMethod} ${event.resource}`; // POST /urls

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
      case "POST /urls":
        requestJSON = JSON.parse(event.body);
        const originalUrl = requestJSON.url;

        if (!originalUrl) {
          throw new Error('`url` parameter is required');
        }

        let hashCode = await generateHashCode(originalUrl);
        let hashCodeString = hashCode.toString();

        params['Item'] = { 'Id' : { S : hashCodeString } };
        params['Item']['OriginalUrl'] = { S : originalUrl };

        data = await ddb.putItem(params).promise();
        responseBody = hashCodeString;
        statusCode = 200;
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
}

function generateHashCode(url) {
  return url.split("").reduce(function(a, b) {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
};
