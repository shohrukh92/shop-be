import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";

import productsList from "./products.json";
// simulate db connection in order to use async/await in lambda
const productsPromise = Promise.resolve(productsList);

export const getProductsById: APIGatewayProxyHandler = async (event) => {
  try {
    const { productId } = event.pathParameters;
    const productsData = await productsPromise;
    const product = productsData.find((item) => item.id === productId);

    if (product) {
      return {
        statusCode: 200,
        body: JSON.stringify(product),
      };
    }
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Product not found" }),
    };
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error: Cannot get product by id" }),
    };
  }
};
