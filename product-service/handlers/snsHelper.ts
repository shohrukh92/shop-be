import { SNS } from "aws-sdk";

export async function notifyProductInsertionSNS(
  count: number,
  totalPrice: number
) {
  const sns = new SNS();
  return new Promise((resolve, reject) => {
    const pricing = totalPrice > 10 ? "expensive" : "cheap";
    sns.publish(
      {
        Subject: "New Products",
        Message: `${count} products were successfully insereed into DB. Total Price: ${totalPrice}.`,
        MessageAttributes: {
          pricing: {
            DataType: "String",
            StringValue: pricing,
          },
        },
        TopicArn: process.env.SNS_ARN,
      },
      (err) => {
        if (err) {
          console.error("Error while sending email", err);
          reject();
        } else {
          console.log("Send email for created products");
          resolve();
        }
      }
    );
  });
}
