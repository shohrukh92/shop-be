import { S3Event } from "aws-lambda";
import { S3, SQS } from "aws-sdk";
import "source-map-support/register";

import { readS3Stream } from "./parserUtil";
import { DEFAULT_REGION } from "./../shared";

export const importFileParser = (event: S3Event) => {
  console.log("Lambda was triggered by s3 event");
  const s3 = new S3({ region: DEFAULT_REGION });
  const sqs = new SQS({ region: DEFAULT_REGION });

  for (const record of event.Records) {
    const recordKey = record.s3.object.key;
    readS3Stream(s3, recordKey, sqs);
  }

  return { statusCode: 202 };
};
