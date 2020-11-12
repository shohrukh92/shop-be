import { Client } from "pg";
import { getProductsList } from "../getProductsList";

jest.mock("pg", () => {
  const clientMock = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Client: jest.fn(() => clientMock) };
});

describe("getProductsList", () => {
  let client;
  beforeEach(() => {
    client = new Client();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return the list of all products from db", async () => {
    const productsMock = [
      { id: 1, title: "test1" },
      { id: 2, title: "test2" },
    ];
    client.query.mockResolvedValueOnce({ rows: productsMock });
    const result = await getProductsList(null, null, null);

    expect(client.connect).toBeCalledTimes(1);
    expect(client.query).toBeCalled();
    expect(client.end).toBeCalledTimes(1);
    expect(result).toEqual({
      statusCode: 200,
      body: JSON.stringify(productsMock),
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  });
});
