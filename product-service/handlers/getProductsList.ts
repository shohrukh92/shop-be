import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";

import productsList from "./products.json";
// simulate db connection in order to use async/await in lambda
const productsPromise = Promise.resolve(productsList);

export const getProductsList: APIGatewayProxyHandler = async () => {
  try {
    const productsData = await productsPromise;
    return {
      statusCode: 200,
      body: JSON.stringify(productsData),
    };
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Server error: Cannot get list of products",
      }),
    };
  }
};
