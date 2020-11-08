import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { Client } from "pg";
import { generateResponse } from "./utils";
import { dbOptions } from "./dbOptions";

export const getProductsList: APIGatewayProxyHandler = async (event) => {
  console.log(event);
  let client;
  try {
    client = new Client(dbOptions);
    await client.connect();

    const { rows: products } = await client.query(`
      select p.id, s.count, p.price, p.title, p.description
      from products as p
      join stocks as s
      on p.id = s.product_id
    `);
    return generateResponse({ body: products });
  } catch (err) {
    return generateResponse({
      code: 500,
      body: { error: "DB connection error: Cannot get list of products" },
    });
  } finally {
    client && client.end();
  }
};
