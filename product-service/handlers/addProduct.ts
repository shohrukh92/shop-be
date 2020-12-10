import { APIGatewayProxyHandler } from "aws-lambda";
import { Client, QueryResult } from "pg";
import "source-map-support/register";

import * as Utils from "../../shared/utils.js";
import { dbOptions } from "../db/dbOptions";
import { Product, Validation, validateProduct } from "../db/productSchema";

export const addProduct: APIGatewayProxyHandler = async (event) => {
  console.log(event);
  let client: Client;

  try {
    const product: Product = JSON.parse(event.body);
    const validation: Validation = validateProduct(product);

    if (validation) {
      return Utils.generateResponse({
        code: 400,
        body: validation.errors,
      });
    }

    const { title, description, price, count } = product;

    client = new Client(dbOptions);
    await client.connect();
    await client.query("begin"); // transaction starts

    const insertedProductRes: QueryResult<Product> = await client.query(
      "insert into products (title, description, price) values ($1, $2, $3) returning *",
      [title, description, price]
    );
    const insertedProduct: Product = insertedProductRes.rows[0];

    await client.query(
      "insert into stocks (product_id, count) values ($1, $2)",
      [insertedProduct.id, count]
    );

    await client.query("commit"); // transaction ends

    return Utils.generateResponse({
      code: 201,
      body: { ...insertedProduct, count },
    });
  } catch (err) {
    await client.query("rollback"); // cancel transaction

    console.error(err);
    return Utils.generateResponse({
      code: 500,
      body: { error: "DB connection error: Cannot insert product" },
    });
  } finally {
    client && client.end();
  }
};
