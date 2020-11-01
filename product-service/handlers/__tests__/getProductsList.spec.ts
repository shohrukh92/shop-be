import { APIGatewayProxyResult } from "aws-lambda";

import { getProductsList } from "../getProductsList";

jest.mock("../products.json", () => [1, 2, 3]);

describe("getProductsList", () => {
  test("should return products list from products.json file with status 200 and allowed all origins", async () => {
    const result = (await getProductsList(
      null,
      null,
      null
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual("[1,2,3]");
    expect(result.headers).toEqual({ "Access-Control-Allow-Origin": "*" });
  });
});
