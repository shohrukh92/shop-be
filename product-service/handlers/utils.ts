export const generateResponse = ({
  code = 200,
  body = {},
  allowedOrigins = "*",
}: {
  code?: number;
  body?: Object;
  allowedOrigins?: string;
} = {}) => {
  return {
    statusCode: code,
    body: JSON.stringify(body),
    headers: { "Access-Control-Allow-Origin": allowedOrigins },
  };
};
