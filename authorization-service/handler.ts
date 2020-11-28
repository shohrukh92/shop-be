import { APIGatewayTokenAuthorizerHandler, PolicyDocument } from "aws-lambda";
import "source-map-support/register";

function checkPasswordWithEnv(
  username: string,
  password: string
): "Allow" | "Deny" {
  const storedUserPassword = process.env[username];
  return !storedUserPassword || storedUserPassword !== password
    ? "Deny"
    : "Allow";
}

function generatePolicy(
  principalId: string,
  resource: string,
  effect = "Allow"
) {
  const policyDocument: PolicyDocument = {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: resource,
      },
    ],
  };

  return { principalId, policyDocument };
}

export const basicAuthorizer: APIGatewayTokenAuthorizerHandler = (
  event,
  _context,
  cb
) => {
  console.log("Event basicAuthorizer", JSON.stringify(event));

  if (event.type !== "TOKEN") {
    cb("Unauthorized");
  }
  try {
    const authToken: string = event.authorizationToken;
    const encodedCreds = authToken.split(" ")[1];
    const buff = Buffer.from(encodedCreds, "base64");
    const [username, password] = buff.toString("utf-8").split(":");

    console.log({ username, password });

    const effect = checkPasswordWithEnv(username, password);
    const policy = generatePolicy(encodedCreds, event.methodArn, effect);
    cb(null, policy);
  } catch (err) {
    const msg = err ? err.message : "";
    cb(`Unauthorized: ${msg}`);
  }
};
