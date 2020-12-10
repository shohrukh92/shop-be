import type { Serverless } from "serverless/aws";
import * as Utils from "../shared/utils";
import {
  BUCKET_ARN,
  BUCKET_NAME,
  DEFAULT_REGION,
  S3_UPLOADED_FOLDER,
} from "./shared";

const authorizerArn =
  "arn:aws:lambda:#{AWS::Region}:#{AWS::AccountId}:function:authorization-service-${self:provider.stage}-basicAuthorizer";

const serverlessConfiguration: Serverless = {
  service: {
    name: "import-service",
  },
  frameworkVersion: "2",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
    },
  },
  plugins: ["serverless-webpack", "serverless-pseudo-parameters"],
  resources: {
    Resources: {
      GatewayResponseDenied: Utils.generateGatewayResponseCors("ACCESS_DENIED"),
      GatewayResponseUnauthorized: Utils.generateGatewayResponseCors(
        "UNAUTHORIZED"
      ),
    },
  },
  provider: {
    name: "aws",
    runtime: "nodejs12.x",
    region: DEFAULT_REGION,
    stage: "${opt:stage, 'dev'}",
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      CATALOG_ITEMS_QUEUE_URL:
        "${cf:product-service-${self:provider.stage}.SQSQueueUrl}",
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: "s3:ListBucket",
        Resource: [BUCKET_ARN],
      },
      {
        Effect: "Allow",
        Action: "s3:*",
        Resource: [`${BUCKET_ARN}/*`],
      },
      {
        Effect: "Allow",
        Action: "sqs:*",
        Resource: "${cf:product-service-${self:provider.stage}.SQSQueueArn}",
      },
    ],
  },
  functions: {
    importProductsFile: {
      handler: "handler.importProductsFile",
      events: [
        {
          http: {
            method: "get",
            path: "import",
            cors: true,
            authorizer: {
              name: "tokenAuthorizer",
              arn: authorizerArn,
              resultTtlInSeconds: 0,
              identitySource: "method.request.header.Authorization",
              type: "token",
            },
            request: {
              parameters: {
                querystrings: {
                  name: true,
                },
              },
            },
          },
        },
      ],
    },
    importFileParser: {
      handler: "handler.importFileParser",
      events: [
        {
          s3: {
            bucket: BUCKET_NAME,
            event: "s3:ObjectCreated:*",
            rules: [{ prefix: `${S3_UPLOADED_FOLDER}/`, suffix: "" }],
            existing: true,
          },
        },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
