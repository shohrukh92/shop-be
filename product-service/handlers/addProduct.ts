import { APIGatewayProxyHandler } from "aws-lambda";
import "source-map-support/register";
import { Client } from "pg";
import { generateResponse } from "./utils";
import { dbOptions } from "../db/dbOptions";
import { Product, validateProduct } from "../db/productSchema";

export const addProduct: APIGatewayProxyHandler = async (event) => {
  console.log(event);
  let client;
  try {
    const product: Product = JSON.parse(event.body);
    const validation = validateProduct(product);

    if (validation) {
      return generateResponse({
        code: 400,
        body: validation.errors,
      });
    }

    const { title, description, price, count } = product;
    client = new Client(dbOptions);
    await client.connect();

    await client.query("begin"); // transaction starts

    const insertedProductRes = await client.query(
      "insert into products (title, description, price) values ($1, $2, $3) returning *",
      [title, description, price]
    );
    await client.query(
      "insert into stocks (product_id, count) values ($1, $2)",
      [insertedProductRes.rows[0].id, count]
    );

    await client.query("commit"); // transaction ends

    return generateResponse({
      code: 201,
      body: {
        ...insertedProductRes.rows[0],
        count,
      },
    });
  } catch (err) {
    await client.query("rollback"); // cancel transaction

    console.error(err);
    return generateResponse({
      code: 500,
      body: { error: "DB connection error: Cannot insert product" },
    });
  } finally {
    client && client.end();
  }
};
