const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

exports.handler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const ddb = new AWS.DynamoDB();
  let responseBody;
  let statusCode = 200;
  let params = {
    TableName: 'Urls'
  };

  if (event.Records.length == 0) { responseBody = '0 records provided'; };

  event.Records.forEach(async record => {
    const message = record.body;
    console.log('UPSERT LAMBDA FUNCTION - SQS Message received: ', message);

    try {
      messageJSON = JSON.parse(message);
      console.log("MESSAGE JSON: ", messageJSON);

      if (!messageJSON.Item) { throw new Error('`Item` not provided within message'); };
      if (!messageJSON.Item.Id) { throw new Error('`Item.Id` not provided within message'); };
      if (!messageJSON.Item.OriginalUrl) { throw new Error('`Item.OriginalUrl` not provided within message'); };

      params['Item'] = { 'Id' : { S : messageJSON.Item.Id.S } };
      params['Item']['OriginalUrl'] = { S : messageJSON.Item.OriginalUrl.S };

      console.log("PARAMS: ", params);

      await ddb.putItem(params).promise();

      console.log("AFTER putItem");
    } catch (err) {
      console.log("UPSERT ERROR: ", err.message);
      statusCode = 400;
      responseBody = err.message;
    }
  });

  const response = {
    statusCode: statusCode,
    body: responseBody
  };

  return response;
};
