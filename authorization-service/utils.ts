import { PolicyDocument } from "aws-lambda";

export enum EffectType {
  Allow = "Allow",
  Deny = "Deny",
}

export function getEffectFromCreds(encodedCreds: string): EffectType {
  if (!encodedCreds.trim()) {
    return EffectType.Deny;
  }

  try {
    const buff = Buffer.from(encodedCreds, "base64");
    const [username, password] = buff.toString("utf-8").split(":");

    console.log({ username, password });
    const storedPassword = process.env[username];
    return !storedPassword || storedPassword !== password
      ? EffectType.Deny
      : EffectType.Allow;
  } catch {
    console.error("Error while parsing encodedCreds");
    return EffectType.Deny;
  }
}

export function generatePolicy(
  principalId: string,
  resource: string,
  effect: EffectType = EffectType.Allow
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
