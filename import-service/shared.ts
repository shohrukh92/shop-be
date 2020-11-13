export const BUCKET_NAME = "my-book-store-bucket";
export const BUCKET_ARN = `arn:aws:s3:::${BUCKET_NAME}`;
export const DEFAULT_REGION = "eu-west-1";

export const SIGNED_URL_EXPIRATION = 60;
export const PRODUCTS_FILE_CONTENT_TYPE = "text/csv";

export const getCatalogPath = (name: string) => `uploaded/${name}`;

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
