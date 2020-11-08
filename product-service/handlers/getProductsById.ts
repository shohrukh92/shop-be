import { APIGatewayProxyHandler } from "aws-lambda";
import { Client } from "pg";
import "source-map-support/register";
import { dbOptions } from "../db/dbOptions";

import { generateResponse } from "./utils";

export const getProductsById: APIGatewayProxyHandler = async (event) => {
  console.log(event);
  let client;
  try {
    const { productId } = event.pathParameters;
    client = new Client(dbOptions);
    await client.connect();

    const { rows: products } = await client.query(
      `
        select p.id, s.count, p.price, p.title, p.description
        from products as p
        join stocks as s
        on p.id = s.product_id
        where p.id = $1
      `,
      [productId]
    );

    if (products && products.length) {
      return generateResponse({ body: products[0] });
    }
    return generateResponse({
      code: 404,
      body: { error: "Product not found" },
    });
  } catch {
    return generateResponse({
      code: 500,
      body: { error: "DB connection error: Cannot get product by id" },
    });
  } finally {
    client && client.end();
  }
};
