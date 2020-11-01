import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";

export const getShopAdminInfo: APIGatewayProxyHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      shopAdminName: "superadminame",
    }),
  };
};
