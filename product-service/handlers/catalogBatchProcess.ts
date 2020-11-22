import { QueryResult, Client } from "pg";
import { SQSEvent, SQSHandler } from "aws-lambda";
import { SNS } from "aws-sdk";
import "source-map-support/register";

import { dbOptions } from "./../db/dbOptions";
import { Validation, validateProduct } from "./../db/productSchema";
import { Product } from "../db/productSchema";

async function addProductToDB(client: Client, product: Product) {
  try {
    const { title, description, price, count } = product;

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
  } catch (err) {
    await client.query("rollback"); // cancel transaction
    console.error("Error while inserting product into DB", product, err);
  }
}

function notifyViaSNS(count: number) {
  const sns = new SNS();
  sns.publish(
    {
      Subject: "New Products",
      Message: `${count} products were successfully insereed into DB`,
      TopicArn: process.env.SNS_ARN,
    },
    () => {
      console.log("Send email for created products");
    }
  );
}

export const catalogBatchProcess: SQSHandler = async (event: SQSEvent) => {
  const client = new Client(dbOptions);
  await client.connect();

  for (let { body } of event.Records) {
    try {
      const { title, description, price, count } = JSON.parse(body);
      const product: Product = {
        title,
        description,
        price: Number(price),
        count: Number(count),
      };
      console.log({ product });
      const validation: Validation = validateProduct(product);

      if (validation) {
        throw "Validation Error";
      }

      await addProductToDB(client, product);
    } catch (err) {
      console.error(`Error while parsing product: ${body}`, err);
    }
  }

  await client.end();
  // notifyViaSNS();
};