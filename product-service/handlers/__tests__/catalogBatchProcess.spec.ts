import { Product } from "./../../db/productSchema";
import { SQSEvent } from "aws-lambda";
import { Client } from "pg";
import { addProductToDB } from "../dbHelper";
import { notifyProductInsertionSNS } from "../snsHelper";
import { catalogBatchProcess } from "./../catalogBatchProcess";

jest.mock("../dbHelper.ts", () => {
  return { addProductToDB: jest.fn() };
});

jest.mock("../snsHelper.ts", () => {
  return { notifyProductInsertionSNS: jest.fn() };
});

jest.mock("../utils.ts", () => {
  return { notifyProductInsertionSNS: jest.fn() };
});

jest.mock("pg", () => {
  const clientMock = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Client: jest.fn(() => clientMock) };
});

describe("catalogBatchProcess", () => {
  let client: Client;
  beforeEach(() => {
    client = new Client();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should connect to db, disconnect and call notifyProductInsertionSNS method", async () => {
    const mockEvent = { Records: [] } as SQSEvent;
    await catalogBatchProcess(mockEvent, null, null);

    expect(client.connect).toBeCalledTimes(1);
    expect(client.end).toBeCalledTimes(1);
    expect(notifyProductInsertionSNS).toHaveBeenCalled();
  });

  test("should not call addProductToDB if product is not valid", async () => {
    const mockInvalidProduct = { title: "Product title" } as Product;
    const mockEvent = {
      Records: [{ body: JSON.stringify(mockInvalidProduct) }],
    } as SQSEvent;

    await catalogBatchProcess(mockEvent, null, null);

    expect(addProductToDB).not.toHaveBeenCalled();
  });

  test("should not call addProductToDB if record body has wrong json format", async () => {
    const mockEvent = {
      Records: [{ body: "{[wrong json format" }],
    } as SQSEvent;

    await catalogBatchProcess(mockEvent, null, null);

    expect(addProductToDB).not.toHaveBeenCalled();
  });

  test("should call addProductToDB two times if all products pass validation", async () => {
    const mockProduct1 = {
      title: "Product title 1",
      description: "Product Description",
      price: 2,
      count: 4,
    } as Product;
    const mockProduct2 = {
      title: "Product title 2",
      description: "Product Description",
      price: 2,
      count: 4,
    } as Product;
    const mockEvent = {
      Records: [
        { body: JSON.stringify(mockProduct1) },
        { body: JSON.stringify(mockProduct2) },
      ],
    } as SQSEvent;

    await catalogBatchProcess(mockEvent, null, null);

    expect(addProductToDB).toHaveBeenCalledTimes(2);
  });
});
