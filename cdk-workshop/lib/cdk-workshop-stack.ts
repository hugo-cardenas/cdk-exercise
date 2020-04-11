import * as sns from "@aws-cdk/aws-sns";
import * as subs from "@aws-cdk/aws-sns-subscriptions";
import * as sqs from "@aws-cdk/aws-sqs";
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import * as apigateway from "@aws-cdk/aws-apigateway";

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // const queue = new sqs.Queue(this, 'CdkWorkshopQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    // const topic = new sns.Topic(this, 'CdkWorkshopTopic');

    // topic.addSubscription(new subs.SqsSubscription(queue));

    const lambdaFunction = new lambda.Function(this, "MyLambdaFunction", {
      code: lambda.Code.fromAsset("lambda"),
      handler: "hello.handler",
      runtime: lambda.Runtime.NODEJS_12_X,
    });

    new apigateway.LambdaRestApi(this, "ApiGateway", {
      handler: lambdaFunction,
    });
  }
}
