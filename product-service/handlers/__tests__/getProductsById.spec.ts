import { Client } from "pg";
import { getProductsById } from "../getProductsById";

jest.mock("pg", () => {
  const clientMock = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Client: jest.fn(() => clientMock) };
});

describe("getProductsById", () => {
  let client;
  beforeEach(() => {
    client = new Client();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return 404 product not found", async () => {
    client.query.mockResolvedValueOnce({ rows: [] });
    const eventMock = { pathParameters: { productId: 1 } } as any;
    const result = await getProductsById(eventMock, null, null);

    expect(client.connect).toBeCalledTimes(1);
    expect(client.query).toBeCalled();
    expect(client.end).toBeCalledTimes(1);
    expect(result).toEqual({
      statusCode: 404,
      body: '{"error":"Product not found in db"}',
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  });

  test("should return existing product with status 200", async () => {
    const productsMock = [{ id: 1, title: "Test" }];
    client.query.mockResolvedValueOnce({ rows: productsMock });
    const eventMock = { pathParameters: { productId: 1 } } as any;
    const result = await getProductsById(eventMock, null, null);

    expect(client.connect).toBeCalledTimes(1);
    expect(client.query).toBeCalled();
    expect(client.end).toBeCalledTimes(1);
    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify(productsMock[0]),
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  });
});
