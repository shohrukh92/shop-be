import {
  APIGatewayRequestAuthorizerHandler,
  APIGatewayTokenAuthorizerHandler,
} from "aws-lambda";
import "source-map-support/register";
import { generatePolicy, getEffectFromCreds } from "./utils";

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

    const effect = getEffectFromCreds(encodedCreds);
    const policy = generatePolicy(encodedCreds, event.methodArn, effect);
    cb(null, policy);
  } catch (err) {
    console.error(err);
    cb(`Unauthorized`);
  }
};

// Just for testing purposes; it is not required in Task 7
export const requestAuthorizer: APIGatewayRequestAuthorizerHandler = (
  event,
  _context,
  cb
) => {
  console.log("Event requestAuthorizer", JSON.stringify(event));

  if (event.type !== "REQUEST") {
    cb("Unauthorized");
  }
  try {
    const encodedCreds = event.queryStringParameters.token;
    const effect = getEffectFromCreds(encodedCreds);
    const policy = generatePolicy(encodedCreds, event.methodArn, effect);
    cb(null, policy);
  } catch (err) {
    console.error(err);
    cb(`Unauthorized`);
  }
};
