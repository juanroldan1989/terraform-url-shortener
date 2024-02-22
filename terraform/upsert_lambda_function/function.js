const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

exports.handler = (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const ddb = new AWS.DynamoDB();
  let responseBody;
  let statusCode = 200;

  if (event.Records.length == 0) { responseBody = '0 records provided'; };

  event.Records.forEach((record) => {
    let message = record.body;
    console.log('UPSERT LAMBDA FUNCTION - SQS Message received: ', message);

    messageJSON = JSON.parse(message);
    console.log("MESSAGE JSON: ", messageJSON);

    if (!messageJSON.Item) { throw new Error('`Item` not provided within message'); };
    if (!messageJSON.Item.Id) { throw new Error('`Item.Id` not provided within message'); };
    if (!messageJSON.Item.OriginalUrl) { throw new Error('`Item.OriginalUrl` not provided within message'); };

    ddb.putItem(messageJSON, function(err, data) {
      if (err) {
        console.log("UPSERT ERROR: ", err.message);
        statusCode = 400;
        responseBody = err.message;
      } else {
        console.log("UPSERT SUCCESS: ", data);
        responseBody = data;
      }
    });
  });

  const response = {
    statusCode: statusCode,
    body: responseBody
  };

  return response;
};
