import { APIGatewayProxyResult } from "aws-lambda";

import { getProductsById } from "../getProductsById";

jest.mock("../products.json", () => [{ id: 1 }]);

describe("getProductsById", () => {
  test("should return product by id with status 200 and allowed all origins", async () => {
    const eventMock = { pathParameters: { productId: 1 } } as any;
    const result = (await getProductsById(
      eventMock,
      null,
      null
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(JSON.stringify({ id: 1 }));
    expect(result.headers).toEqual({ "Access-Control-Allow-Origin": "*" });
  });

  test("should return 404 not found error if product id does not exist", async () => {
    const eventMock = { pathParameters: { productId: 2 } } as any;
    const result = (await getProductsById(
      eventMock,
      null,
      null
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(404);
  });
});
