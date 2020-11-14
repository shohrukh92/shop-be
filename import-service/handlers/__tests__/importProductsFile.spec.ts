import { APIGatewayProxyResult } from "aws-lambda";
import * as AWSMock from "aws-sdk-mock";
import { importProductsFile } from "../importProductsFile";

describe("importProductsFile", () => {
  test("should return 400 error if name was not provided in queryStringParameters", async () => {
    const eventMock = { queryStringParameters: {} } as any;

    const result = (await importProductsFile(
      eventMock,
      null,
      null
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toEqual(400);
  });

  test("should return 500 error if getSignedUrl throws some error", async () => {
    const eventMock = { queryStringParameters: { name: "file.csv" } } as any;

    AWSMock.mock("S3", "getSignedUrl", () => {
      throw "Error";
    });

    const result = (await importProductsFile(
      eventMock,
      null,
      null
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toEqual(500);
    AWSMock.restore("S3");
  });

  test("should return correct signed url", async () => {
    const eventMock = { queryStringParameters: { name: "file.csv" } } as any;
    const signedUrlMock = "signed-url-mock";

    AWSMock.mock("S3", "getSignedUrl", (_, __, callback) => {
      callback(null, signedUrlMock);
    });

    const result = (await importProductsFile(
      eventMock,
      null,
      null
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(JSON.stringify({ url: signedUrlMock }));
    AWSMock.restore("S3");
  });
});
