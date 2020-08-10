import { APIGatewayProxyHandler, APIGatewayProxyEvent } from "aws-lambda";

const createResponse = (event: APIGatewayProxyEvent) => ({
  statusCode: 200,
  body: JSON.stringify(
    {
      message: "Your function executed successfully!",
      input: event,
    },
    null,
    2
  ),
});

export const getAll: APIGatewayProxyHandler = async (event) =>
  createResponse(event);

export const getOne: APIGatewayProxyHandler = async (event) =>
  createResponse(event);

export const create: APIGatewayProxyHandler = async (event) =>
  createResponse(event);

export const update: APIGatewayProxyHandler = async (event) =>
  createResponse(event);

export const remove: APIGatewayProxyHandler = async (event) =>
  createResponse(event);
