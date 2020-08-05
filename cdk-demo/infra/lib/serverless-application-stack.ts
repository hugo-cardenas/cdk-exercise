import * as cdk from "@aws-cdk/core";
import { StackProps } from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as certificateManager from "@aws-cdk/aws-certificatemanager";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as route53 from "@aws-cdk/aws-route53";
import {
  ApplicationId,
  Organization,
  ApplicationConfig,
  Stage,
} from "../../common/applications";
import * as lambda from "@aws-cdk/aws-lambda";

export interface PipelineStackProps extends StackProps {
  organization: Organization;
  appId: ApplicationId;
  applicationConfig: ApplicationConfig;
  stage: Stage;
}

export class ServerlessApplicationStack extends cdk.Stack {
  readonly applicationClientBucket: s3.Bucket;

  constructor(scope: cdk.Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);
    const { organization, appId, applicationConfig, stage } = props;

    const resourceName = (name: string) =>
      `${organization}-${appId}-${stage}-${name}`;

    const { rootDomain } = applicationConfig.urls;
    const applicationDomain = applicationConfig.urls[stage];

    this.applicationClientBucket = new s3.Bucket(this, resourceName("Client"), {
      bucketName: resourceName("Client").toLowerCase(),
      websiteIndexDocument: "index.html",
      publicReadAccess: true,
    });

    const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: rootDomain,
    });

    const certificate = new certificateManager.DnsValidatedCertificate(
      this,
      resourceName("SiteCertificate"),
      {
        domainName: applicationDomain,
        hostedZone,
        region: "us-east-1",
      }
    );

    const cloudfrontDistribution = new cloudfront.CloudFrontWebDistribution(
      this,
      resourceName("WebDistribution"),
      {
        aliasConfiguration: {
          acmCertRef: certificate.certificateArn,
          names: [applicationDomain],
          sslMethod: cloudfront.SSLMethod.SNI,
          securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2018,
        },
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: this.applicationClientBucket,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
          // {
          //   customOriginSource: {
          //     domainName: "97gyl24xu2.execute-api.eu-central-1.amazonaws.com",
          //   },
          //   originPath: "/staging",
          //   behaviors: [
          //     {
          //       pathPattern: "/api/*",
          //     },
          //   ],
          // },
        ],
      }
    );

    new route53.CnameRecord(this, resourceName("Record"), {
      zone: hostedZone,
      recordName: applicationDomain,
      domainName: cloudfrontDistribution.domainName,
    });

    const helloLambda = new lambda.Function(this, "hello", {
      code: new lambda.AssetCode("lib/lambda"),
      handler: "users.hello",
      runtime: lambda.Runtime.NODEJS_10_X,
    });

    const api = new apigateway.RestApi(this, "Api", {
      deployOptions: {
        stageName: stage,
      },
      restApiName: `${organization}-${appId}-${stage}`,
    });

    const items = api.root.addResource("users");
    items.addMethod("GET", new apigateway.LambdaIntegration(helloLambda));
  }
}
