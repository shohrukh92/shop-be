import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";

export const getProductsList: APIGatewayProxyHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify([
      {
        id: 1,
        name: "Prod 1",
      },
      {
        id: 2,
        name: "Prod 2",
      },
    ]),
  };
};
