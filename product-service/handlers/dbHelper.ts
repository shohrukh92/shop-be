import { QueryResult, Client } from "pg";
import { Product } from "./../db/productSchema";

export async function addProductToDB(client: Client, product: Product) {
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
