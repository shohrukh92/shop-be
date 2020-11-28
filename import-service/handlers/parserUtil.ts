import { S3, SQS } from "aws-sdk";
import * as csv from "csv-parser";
import * as stripBom from "strip-bom-stream";

import {
  BUCKET_NAME,
  S3_PARSED_FOLDER,
  S3_UPLOADED_FOLDER,
  QUEUE_URL,
} from "../shared";

export function readS3Stream(s3: S3, recordKey: string, sqs: SQS) {
  s3.getObject({
    Bucket: BUCKET_NAME,
    Key: recordKey,
  })
    .createReadStream()
    .pipe(stripBom())
    .pipe(csv())
    .on("data", (data) => {
      const product = JSON.stringify(data);
      sqs.sendMessage(
        {
          QueueUrl: QUEUE_URL,
          MessageBody: product,
        },
        (err) => {
          if (err) {
            console.error("Error while sending SQS message", err);
          } else {
            console.log("Send SQS message for:" + product);
          }
        }
      );
    })
    .on("end", async () => {
      const sourсePath = `${BUCKET_NAME}/${recordKey}`;
      const destinationPath = recordKey.replace(
        S3_UPLOADED_FOLDER,
        S3_PARSED_FOLDER
      );

      console.log(`Copying from ${sourсePath}`);
      await s3
        .copyObject({
          Bucket: BUCKET_NAME,
          CopySource: sourсePath,
          Key: destinationPath,
        })
        .promise();
      console.log(`Copied to ${destinationPath}`);

      console.log(`Deleting ${recordKey}`);
      await s3
        .deleteObject({
          Bucket: BUCKET_NAME,
          Key: recordKey,
        })
        .promise();
      console.log(`Deleted ${recordKey}`);
    })
    .on("error", (err) => {
      console.error("Error while reading csv", err);
    });
}
