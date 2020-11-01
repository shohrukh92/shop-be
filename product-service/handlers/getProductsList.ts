import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";

import { generateResponse } from "./utils";
import productsList from "./products.json";
// simulate db connection in order to use async/await in lambda
const productsPromise = Promise.resolve(productsList);

export const getProductsList: APIGatewayProxyHandler = async () => {
  try {
    const productsData = await productsPromise;
    return generateResponse({ body: productsData });
  } catch {
    return generateResponse({
      code: 500,
      body: { error: "Server error: Cannot get list of products" },
    });
  }
};
