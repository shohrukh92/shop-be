import { QueryResult, Client } from "pg";
import { SQSEvent, SQSHandler } from "aws-lambda";
import { SNS } from "aws-sdk";
import "source-map-support/register";

import { dbOptions } from "./../db/dbOptions";
import { Validation, Product, validateProduct } from "./../db/productSchema";

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

async function notifyViaSNS(count: number, totalPrice: number) {
  const sns = new SNS();

  return new Promise((resolve, reject) => {
    const pricing = totalPrice > 10 ? "expensive" : "cheap";
    sns.publish(
      {
        Subject: "New Products",
        Message: `${count} products were successfully insereed into DB. Total Price: ${totalPrice}.`,
        MessageAttributes: {
          pricing: {
            DataType: "String",
            StringValue: pricing,
          },
        },
        TopicArn: process.env.SNS_ARN,
      },
      (err) => {
        if (err) {
          console.error("Error while sending email", err);
          reject();
        } else {
          console.log("Send email for created products");
          resolve();
        }
      }
    );
  });
}

export const catalogBatchProcess: SQSHandler = async (event: SQSEvent) => {
  let client: Client;
  try {
    client = new Client(dbOptions);
    await client.connect();
  } catch (err) {
    console.error("DB Connection error", err);
    return;
  }

  let totalPrice = 0; // will be used for SNS Filter Policy
  for (let { body } of event.Records) {
    try {
      const { title, description, price, count } = JSON.parse(body);
      const product: Product = {
        title,
        description,
        price: Number(price),
        count: Number(count),
      };
      const validation: Validation = validateProduct(product);
      if (validation) {
        throw "Validation Error";
      }
      await addProductToDB(client, product);
      totalPrice += product.price;
    } catch (err) {
      console.error(`Error while parsing product: ${body}`, err);
    }
  }

  await client.end();
  await notifyViaSNS(event.Records.length, totalPrice);
};
