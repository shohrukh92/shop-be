import { APIGatewayProxyHandler } from "aws-lambda";
import { Client, QueryResult } from "pg";
import "source-map-support/register";

import * as Utils from "../../shared/utils.js";
import { dbOptions } from "../db/dbOptions";
import { Product } from "../db/productSchema";

export const getProductsById: APIGatewayProxyHandler = async (event) => {
  console.log(event);
  let client: Client;

  try {
    const { productId } = event.pathParameters;
    client = new Client(dbOptions);
    await client.connect();

    const queryResult: QueryResult<Product> = await client.query(
      `
        select p.id, s.count, p.price, p.title, p.description
        from products as p
        join stocks as s
        on p.id = s.product_id
        where p.id = $1
      `,
      [productId]
    );

    if (queryResult.rows.length) {
      const product: Product = queryResult.rows[0];
      return Utils.generateResponse({ body: product });
    }

    return Utils.generateResponse({
      code: 404,
      body: { error: "Product not found in db" },
    });
  } catch (err) {
    console.error(err);
    return Utils.generateResponse({
      code: 500,
      body: { error: "DB connection error: Cannot get product by id" },
    });
  } finally {
    client && client.end();
  }
};
