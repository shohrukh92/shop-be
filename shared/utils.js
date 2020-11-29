function generateGatewayResponseCors(ResponseType) {
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
}

function generateResponse({ code = 200, body = {}, allowedOrigins = "*" }) {
  return {
    statusCode: code,
    body: JSON.stringify(body),
    headers: { "Access-Control-Allow-Origin": allowedOrigins },
  };
}

module.exports = {
  generateGatewayResponseCors,
  generateResponse,
};
