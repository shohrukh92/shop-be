import type { CloudFormationResource, Serverless } from "serverless/aws";

const authorizerArn =
  "arn:aws:lambda:#{AWS::Region}:#{AWS::AccountId}:function:authorization-service-${self:provider.stage}-requestAuthorizer";

export const generateGatewayResponseCors = (
  ResponseType: string
): CloudFormationResource => {
  return {
    Type: "AWS::ApiGateway::GatewayResponse",
    Properties: {
      ResponseParameters: {
        "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
        "gatewayresponse.header.Access-Control-Allow-Headers": "'*'",
      },
      ResponseType,
      RestApiId: { Ref: "ApiGatewayRestApi" },
    },
  };
};

const serverlessConfiguration: Serverless = {
  service: {
    name: "product-service",
  },
  frameworkVersion: "2",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
    },
  },
  plugins: [
    "serverless-webpack",
    "serverless-dotenv-plugin",
    "serverless-pseudo-parameters",
  ],
  provider: {
    name: "aws",
    runtime: "nodejs12.x",
    stage: "dev",
    region: "eu-west-1",
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      SQS_URL: {
        Ref: "SQSQueue",
      },
      SNS_ARN: {
        Ref: "SNSTopic",
      },
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: "sqs:*",
        Resource: {
          "Fn::GetAtt": ["SQSQueue", "Arn"],
        },
      },
      {
        Effect: "Allow",
        Action: "sns:*",
        Resource: {
          Ref: "SNSTopic",
        },
      },
    ],
  },
  resources: {
    Resources: {
      SQSQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "my-book-store-queue",
        },
      },
      SNSTopic: {
        Type: "AWS::SNS::Topic",
        Properties: {
          TopicName: "my-book-store-sns-topic",
        },
      },
      SNSExpensiveSubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          Endpoint: "shohrukh.92@gmail.com",
          Protocol: "email",
          FilterPolicy: { pricing: ["expensive"] },
          TopicArn: { Ref: "SNSTopic" },
        },
      },
      SNSCheapSubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          Endpoint: "92.shohrukh@gmail.com",
          Protocol: "email",
          FilterPolicy: { pricing: ["cheap"] },
          TopicArn: { Ref: "SNSTopic" },
        },
      },
      GatewayResponseDenied: generateGatewayResponseCors("ACCESS_DENIED"),
      GatewayResponseUnauthorized: generateGatewayResponseCors("UNAUTHORIZED"),
    },
    Outputs: {
      SQSQueueUrl: {
        Value: {
          Ref: "SQSQueue",
        },
        Description: "Catalog Items SQS Queue URL",
      },
      SQSQueueArn: {
        Value: {
          "Fn::GetAtt": ["SQSQueue", "Arn"],
        },
        Description: "Catalog Items SQS Queue ARN",
      },
    },
  },
  functions: {
    getProductsList: {
      handler: "handler.getProductsList",
      events: [
        {
          http: {
            method: "get",
            path: "products",
            cors: true,
          },
        },
      ],
    },
    getProductsById: {
      handler: "handler.getProductsById",
      events: [
        {
          http: {
            method: "get",
            path: "products/{productId}",
            cors: true,
          },
        },
      ],
    },
    addProduct: {
      handler: "handler.addProduct",
      events: [
        {
          http: {
            method: "post",
            path: "products",
            cors: true,
            authorizer: {
              name: "requestAuthorizer",
              arn: authorizerArn,
              resultTtlInSeconds: 0,
              identitySource: "method.request.querystring.token",
              type: "request",
            },
          },
        },
      ],
    },
    catalogBatchProcess: {
      handler: "handler.catalogBatchProcess",
      events: [
        {
          sqs: {
            batchSize: 5,
            arn: {
              "Fn::GetAtt": ["SQSQueue", "Arn"],
            },
          },
        },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
