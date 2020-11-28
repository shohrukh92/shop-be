import { Client } from "pg";
import { SQSEvent, SQSHandler } from "aws-lambda";
import "source-map-support/register";

import { dbOptions } from "./../db/dbOptions";
import { Validation, Product, validateProduct } from "./../db/productSchema";
import { notifyProductInsertionSNS } from "./snsHelper";
import { addProductToDB } from "./dbHelper";

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
  await notifyProductInsertionSNS(event.Records.length, totalPrice);
};
