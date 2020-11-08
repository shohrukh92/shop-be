import * as utils from "../utils";

describe("utils", () => {
  test("should return default response with status 200, empty body and * Allow-Origin", () => {
    const result = utils.generateResponse({});

    expect(result).toEqual({
      statusCode: 200,
      body: "{}",
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  });

  test("should return default response with status 200, empty body and * Allow-Origin", () => {
    const code = 400;
    const body = { a: 1, b: 2 };
    const allowedOrigins = "localhost:3000";
    const result = utils.generateResponse({ code, body, allowedOrigins });

    expect(result.statusCode).toBe(code);
    expect(result.body).toBe(JSON.stringify(body));
    expect(result.headers).toEqual({
      "Access-Control-Allow-Origin": allowedOrigins,
    });
  });
});
