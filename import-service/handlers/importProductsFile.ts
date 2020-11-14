import { APIGatewayProxyHandler } from "aws-lambda";
import { S3 } from "aws-sdk";
import "source-map-support/register";

import {
  getFileUploadPath,
  generateResponse,
  BUCKET_NAME,
  DEFAULT_REGION,
  SIGNED_URL_EXPIRATION,
  PRODUCTS_FILE_CONTENT_TYPE,
} from "../shared";

export const importProductsFile: APIGatewayProxyHandler = async (event) => {
  const fileName = event.queryStringParameters.name;
  if (!fileName) {
    return generateResponse({
      code: 400,
      body: { error: "Bad Request: provide name as query string param" },
    });
  }

  const catalogPath = getFileUploadPath(fileName);
  const s3 = new S3({ region: DEFAULT_REGION });

  const params = {
    Bucket: BUCKET_NAME,
    Key: catalogPath,
    Expires: SIGNED_URL_EXPIRATION,
    ContentType: PRODUCTS_FILE_CONTENT_TYPE,
  };

  try {
    const url = await s3.getSignedUrlPromise("putObject", params);
    return generateResponse({
      code: 200,
      body: { url },
    });
  } catch (err) {
    console.log("Error while creating signed url", err);
    return generateResponse({
      code: 500,
      body: { error: "Internal Server Error: cannot create signed url" },
    });
  }
};
