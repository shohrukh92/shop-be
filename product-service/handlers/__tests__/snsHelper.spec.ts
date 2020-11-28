import * as AWSMock from "aws-sdk-mock";
import { PublishInput } from "aws-sdk/clients/sns";

import { notifyProductInsertionSNS } from "../snsHelper";

describe("snsHelper", () => {
  test("should call sns publish with correct message and cheap pricing attribute", async () => {
    let publishInput: PublishInput;
    AWSMock.mock("SNS", "publish", function (params, callback) {
      publishInput = params;
      callback(null, null);
    });
    const count = 1;
    const totalPrice = 1;
    await notifyProductInsertionSNS(count, totalPrice);

    expect(publishInput.Subject).toEqual("New Products");
    expect(publishInput.Message).toEqual(
      `${count} products were successfully insereed into DB. Total Price: ${totalPrice}.`
    );
    expect(publishInput.MessageAttributes).toEqual({
      pricing: {
        DataType: "String",
        StringValue: "cheap",
      },
    });

    AWSMock.restore("SNS");
  });

  test("should call sns publish with correct message and expensive pricing attribute", async () => {
    let publishInput: PublishInput;
    AWSMock.mock("SNS", "publish", function (params, callback) {
      publishInput = params;
      callback(null, null);
    });
    const count = 10;
    const totalPrice = 100;
    await notifyProductInsertionSNS(count, totalPrice);

    expect(publishInput.MessageAttributes).toEqual({
      pricing: {
        DataType: "String",
        StringValue: "expensive",
      },
    });

    AWSMock.restore("SNS");
  });
});
