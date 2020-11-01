import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";

import { generateResponse } from "./utils";
import productsList from "./products.json";
// simulate db connection in order to use async/await in lambda
const productsPromise = Promise.resolve(productsList);

export const getProductsById: APIGatewayProxyHandler = async (event) => {
  try {
    const { productId } = event.pathParameters;
    const productsData = await productsPromise;
    const product = productsData.find((item) => item.id === productId);

    if (product) {
      return generateResponse({ body: product });
    }
    return generateResponse({
      code: 404,
      body: { error: "Product not found" },
    });
  } catch {
    return generateResponse({
      code: 500,
      body: { error: "Server error: Cannot get product by id" },
    });
  }
};
