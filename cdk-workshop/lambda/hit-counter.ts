import { DynamoDB, Lambda } from "aws-sdk";
import { APIGatewayProxyHandler } from "aws-lambda";

// TODO Validate and fail if not found
const tableName = process.env.HITS_TABLE_NAME || "";
const downstreamFunctionName = process.env.DOWNSTREAM_FUNCTION_NAME || "";

export const handler: APIGatewayProxyHandler = async (event) => {
  const dynamo = new DynamoDB();
  const lambda = new Lambda();

  await dynamo
    .updateItem({
      TableName: tableName,
      Key: { path: { S: event.path } },
      UpdateExpression: "ADD hits :incr",
      ExpressionAttributeValues: { ":incr": { N: "1" } },
    })
    .promise();

  const response = await lambda
    .invoke({
      FunctionName: downstreamFunctionName,
      Payload: JSON.stringify(event),
    })
    .promise();

  console.log("Downstream response: ", JSON.stringify(response, null, 2));

  // return JSON.parse(response.Payload);

  return JSON.parse(response.Payload + "");

  // return {
  //   statusCode: 200,
  //   body: "foo",
  // };
};
