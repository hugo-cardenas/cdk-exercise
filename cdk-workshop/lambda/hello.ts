import { APIGatewayProxyHandler } from "aws-lambda";

export const handler: APIGatewayProxyHandler = async function (event) {
  console.log(JSON.stringify(event, null, 2));
  return {
    statusCode: 200,
    body: "Hello world!",
  };
};
