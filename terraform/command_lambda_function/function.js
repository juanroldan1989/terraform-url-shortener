const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

exports.handler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  console.log('CasePath:', `${event.httpMethod} ${event.resource}`);

  const ddb = new AWS.DynamoDB();
  const sqsClient = new AWS.SQS();
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

      console.log("hashCodeString: ", hashCodeString);

      params['Item'] = { 'Id' : { S : hashCodeString } };
      params['Item']['OriginalUrl'] = { S : originalUrl };

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
          }
        },
        MessageBody: JSON.stringify(params),
        QueueUrl: "https://sqs.us-east-1.amazonaws.com/542979624611/command-sqs-queue"
      };

      console.log("SQS MESSAGE PARAMS: ", messageParams);

      let data = await sqsClient.sendMessage(messageParams).promise();

      if (data) {
        console.log("Success, message sent. MessageID: ", data.MessageId);
      } else {
        console.log("SQS ERROR!");
      }

      console.log("AFTER SQS SEND MESSAGE");

      responseBody = hashCodeString;
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

function generateHashCode(url) {
  return url.split("").reduce(function(a, b) {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
};
