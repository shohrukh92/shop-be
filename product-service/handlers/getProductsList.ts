import { APIGatewayProxyHandler } from "aws-lambda";
import { Client, QueryResult } from "pg";
import "source-map-support/register";

import * as Utils from "../../shared/utils.js";
import { dbOptions } from "../db/dbOptions";
import { Product } from "../db/productSchema";

export const getProductsList: APIGatewayProxyHandler = async (event) => {
  console.log(event);
  let client: Client;

  try {
    client = new Client(dbOptions);
    await client.connect();

    const queryResult: QueryResult<Product> = await client.query(`
      select p.id, s.count, p.price, p.title, p.description
      from products as p
      join stocks as s
      on p.id = s.product_id
    `);

    return Utils.generateResponse({ body: queryResult.rows });
  } catch (err) {
    console.log(err);
    return Utils.generateResponse({
      code: 500,
      body: { error: "DB connection error: Cannot get list of products" },
    });
  } finally {
    client && client.end();
  }
};
