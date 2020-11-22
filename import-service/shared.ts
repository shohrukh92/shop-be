export const BUCKET_NAME = "my-book-store-bucket";
export const BUCKET_ARN = `arn:aws:s3:::${BUCKET_NAME}`;
export const DEFAULT_REGION = "eu-west-1";

export const S3_UPLOADED_FOLDER = "uploaded";
export const S3_PARSED_FOLDER = "parsed";
export const SIGNED_URL_EXPIRATION = 60;
export const PRODUCTS_FILE_CONTENT_TYPE = "text/csv";

export const getFileUploadPath = (name: string): string =>
  `${S3_UPLOADED_FOLDER}/${name}`;

export const generateResponse = ({
  code = 200,
  body = {},
  allowedOrigins = "*",
}) => {
  return {
    statusCode: code,
    body: JSON.stringify(body),
    headers: { "Access-Control-Allow-Origin": allowedOrigins },
  };
};
