import * as cdk from "@aws-cdk/core";
import { StackProps } from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as apigateway from "@aws-cdk/aws-apigateway";
import {
  ApplicationId,
  Organization,
  ApplicationConfig,
  Stage,
} from "../../../common/applications";
import * as lambda from "@aws-cdk/aws-lambda";

export interface PipelineStackProps {
  organization: Organization;
  appId: ApplicationId;
  applicationConfig: ApplicationConfig;
  stage: Stage;
}

export class ServerlessApplicationStack extends cdk.Construct {
  readonly applicationClientBucket: s3.Bucket;

  constructor(scope: cdk.Construct, id: string, props: PipelineStackProps) {
    super(scope, id);
    const { organization, appId, applicationConfig, stage } = props;

    const createLambda = (entity: string, method: string) =>
      new lambda.Function(scope, `${entity}-${method}`, {
        code: new lambda.AssetCode("lib/lambda"),
        handler: `${entity}.${method}`,
        runtime: lambda.Runtime.NODEJS_10_X,
      });

    const createLambdaIntegration = (entity: string, method: string) =>
      new apigateway.LambdaIntegration(createLambda(entity, method));

    const api = new apigateway.RestApi(this, "Api", {
      deployOptions: {
        stageName: stage,
      },
      restApiName: `${organization}-${appId}-${stage}`,
    });

    const users = api.root.addResource("users");
    users.addMethod("GET", createLambdaIntegration("users", "getAll"));
    users.addMethod("POST", createLambdaIntegration("users", "create"));

    const singleUser = users.addResource("{id}");
    singleUser.addMethod("GET", createLambdaIntegration("users", "getOne"));
    singleUser.addMethod("PATCH", createLambdaIntegration("users", "update"));
    singleUser.addMethod("DELETE", createLambdaIntegration("users", "remove"));
  }
}
